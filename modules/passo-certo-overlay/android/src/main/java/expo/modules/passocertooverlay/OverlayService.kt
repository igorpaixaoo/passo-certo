package expo.modules.passocertooverlay

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.View.MeasureSpec
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONObject
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * Serviço que desenha a caixa flutuante do tutorial por cima de qualquer app.
 *
 * Estados da janela:
 *  - cartão expandido (passo atual, botões grandes, voz)
 *  - bolinha minimizada (arrastável, toque para abrir de novo)
 *  - cartão de conclusão ("Parabéns!")
 */
class OverlayService : Service(), TextToSpeech.OnInitListener {

  companion object {
    const val EXTRA_PAYLOAD = "payload"
    const val ACTION_STOP = "expo.modules.passocertooverlay.STOP"
    private const val CHANNEL_ID = "passo_certo_tutorial"
    private const val NOTIFICATION_ID = 4210

    @Volatile
    var isRunning = false

    /** (tipo, passo, total) — tipos: start, step, complete, cancel */
    var listener: ((String, Int, Int) -> Unit)? = null
  }

  private data class Step(val title: String, val instruction: String, val tip: String?)

  private lateinit var windowManager: WindowManager
  private val handler = Handler(Looper.getMainLooper())
  private var currentView: View? = null

  private var tts: TextToSpeech? = null
  private var ttsReady = false
  private var pendingSpeech: String? = null

  // Dados do tutorial
  private var tutorialTitle = ""
  private var steps: List<Step> = emptyList()
  private var index = 0

  // Estado da interface
  private var minimized = false
  private var finished = false
  private var atTop = false
  private var exitArmed = false
  private var bubbleX = 0
  private var bubbleY = 0

  // Preferências
  private var voiceEnabled = true
  private var speechRate = 0.85f
  private var scale = 1f

  // Cores (vindas do tema escolhido no app)
  private var cBackground = Color.WHITE
  private var cSurfaceAlt = Color.parseColor("#EEEAE2")
  private var cText = Color.parseColor("#1C1B1A")
  private var cMuted = Color.parseColor("#4F4B45")
  private var cBorder = Color.parseColor("#CFC9BE")
  private var cPrimary = Color.parseColor("#1F5FA8")
  private var cOnPrimary = Color.WHITE
  private var cFocus = Color.parseColor("#F2B705")

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    tts = TextToSpeech(this, this)
    val metrics = resources.displayMetrics
    bubbleX = metrics.widthPixels - dp(88)
    bubbleY = metrics.heightPixels / 2
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      listener?.invoke("cancel", index, steps.size)
      stopSelf()
      return START_NOT_STICKY
    }

    startAsForeground()

    val payload = intent?.getStringExtra(EXTRA_PAYLOAD)
    if (payload == null || !parsePayload(payload) || steps.isEmpty()) {
      stopSelf()
      return START_NOT_STICKY
    }

    index = 0
    minimized = false
    finished = false
    exitArmed = false
    isRunning = true
    render()
    speakCurrentStep()
    listener?.invoke("start", index, steps.size)
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    removeCurrentView()
    tts?.stop()
    tts?.shutdown()
    tts = null
    isRunning = false
    super.onDestroy()
  }

  // ---------------------------------------------------------------- dados

  private fun parsePayload(json: String): Boolean = try {
    val obj = JSONObject(json)
    tutorialTitle = obj.optString("title", "Tutorial")
    voiceEnabled = obj.optBoolean("voiceEnabled", true)
    speechRate = obj.optDouble("speechRate", 0.85).toFloat()
    // Escala mais suave que no app: a caixa precisa caber na tela.
    val appScale = obj.optDouble("textScale", 1.0).toFloat()
    scale = 1f + (appScale - 1f) * 0.6f

    val arr = obj.getJSONArray("steps")
    steps = (0 until arr.length()).map { i ->
      val s = arr.getJSONObject(i)
      Step(
        title = s.optString("title"),
        instruction = s.optString("instruction"),
        tip = s.optString("tip").takeIf { it.isNotBlank() && it != "null" }
      )
    }

    obj.optJSONObject("colors")?.let { c ->
      cBackground = color(c, "surface", cBackground)
      cSurfaceAlt = color(c, "surfaceAlt", cSurfaceAlt)
      cText = color(c, "text", cText)
      cMuted = color(c, "textMuted", cMuted)
      cBorder = color(c, "border", cBorder)
      cPrimary = color(c, "primary", cPrimary)
      cOnPrimary = color(c, "onPrimary", cOnPrimary)
      cFocus = color(c, "focus", cFocus)
    }
    true
  } catch (e: Exception) {
    false
  }

  private fun color(obj: JSONObject, key: String, fallback: Int): Int = try {
    Color.parseColor(obj.getString(key))
  } catch (e: Exception) {
    fallback
  }

  // ---------------------------------------------------------------- notificação

  private fun startAsForeground() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(CHANNEL_ID, "Tutorial em andamento", NotificationManager.IMPORTANCE_LOW)
      channel.description = "Mostra que o Passo Certo está guiando você"
      manager.createNotificationChannel(channel)
    }

    val stopIntent = Intent(this, OverlayService::class.java).setAction(ACTION_STOP)
    val stopPending = PendingIntent.getService(
      this, 1, stopIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    val notification = builder
      .setContentTitle("Passo Certo está te ajudando")
      .setContentText("Toque em \"Encerrar\" para fechar o tutorial")
      .setSmallIcon(android.R.drawable.ic_menu_help)
      .setOngoing(true)
      .addAction(Notification.Action.Builder(null, "Encerrar", stopPending).build())
      .build()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  // ---------------------------------------------------------------- navegação

  private fun goTo(newIndex: Int) {
    if (newIndex < 0 || newIndex >= steps.size) return
    index = newIndex
    exitArmed = false
    render()
    speakCurrentStep()
    listener?.invoke("step", index, steps.size)
  }

  private fun complete() {
    finished = true
    minimized = false
    render()
    speak("Parabéns! Você concluiu: $tutorialTitle.")
    listener?.invoke("complete", index, steps.size)
  }

  private fun returnToApp() {
    packageManager.getLaunchIntentForPackage(packageName)?.let {
      it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
      startActivity(it)
    }
    stopSelf()
  }

  // ---------------------------------------------------------------- voz

  override fun onInit(status: Int) {
    if (status == TextToSpeech.SUCCESS) {
      tts?.setLanguage(Locale.forLanguageTag("pt-BR"))
      ttsReady = true
      pendingSpeech?.let { speak(it) }
      pendingSpeech = null
    }
  }

  private fun speakCurrentStep(force: Boolean = false) {
    val step = steps.getOrNull(index) ?: return
    val text = buildString {
      append("Passo ${index + 1} de ${steps.size}. ")
      append(step.title).append(". ")
      append(step.instruction)
      step.tip?.let { append(" Dica: ").append(it) }
    }
    speak(text, force)
  }

  private fun speak(text: String, force: Boolean = false) {
    if (!voiceEnabled && !force) return
    if (!ttsReady) {
      pendingSpeech = text
      return
    }
    tts?.setSpeechRate(speechRate)
    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "passo-certo-$index")
  }

  // ---------------------------------------------------------------- janela

  private fun render() {
    removeCurrentView()
    val view = when {
      minimized -> buildBubble()
      finished -> buildFinishedCard()
      else -> buildStepCard()
    }
    try {
      windowManager.addView(view, layoutParams())
      currentView = view
    } catch (e: Exception) {
      // Sem permissão de sobreposição: encerra sem travar o app.
      listener?.invoke("cancel", index, steps.size)
      stopSelf()
    }
  }

  private fun removeCurrentView() {
    currentView?.let {
      try {
        windowManager.removeView(it)
      } catch (_: Exception) {
      }
    }
    currentView = null
  }

  private fun layoutParams(): WindowManager.LayoutParams {
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }
    val params = WindowManager.LayoutParams(
      if (minimized) ViewGroup.LayoutParams.WRAP_CONTENT else ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT,
      type,
      // Não rouba o teclado do app que está embaixo.
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    )
    if (minimized) {
      params.gravity = Gravity.TOP or Gravity.START
      params.x = bubbleX
      params.y = bubbleY
    } else {
      params.gravity = (if (atTop) Gravity.TOP else Gravity.BOTTOM) or Gravity.CENTER_HORIZONTAL
      params.y = if (atTop) dp(36) else dp(24)
    }
    return params
  }

  private fun buildStepCard(): View {
    val step = steps[index]
    val isLast = index == steps.size - 1
    val card = cardContainer()

    // Cabeçalho: "Passo 2 de 5" + Ocultar
    val header = row()
    header.addView(
      label("Passo ${index + 1} de ${steps.size}", 15f, cMuted, bold = true),
      LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
    )
    header.addView(smallButton("— Ocultar") {
      minimized = true
      render()
    })
    card.addView(header)

    // Barra de progresso em segmentos
    val progress = row().apply { setPadding(0, dp(10), 0, dp(14)) }
    steps.indices.forEach { i ->
      val seg = View(this).apply {
        background = rounded(if (i <= index) cPrimary else cBorder, null, dp(4).toFloat())
      }
      progress.addView(seg, LinearLayout.LayoutParams(0, dp(8), 1f).apply {
        if (i > 0) marginStart = dp(4)
      })
    }
    card.addView(progress)

    // Conteúdo rolável (caso o texto seja grande)
    val content = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    content.addView(label(step.title, 22f, cText, bold = true))
    content.addView(label(step.instruction, 19f, cText).apply { setPadding(0, dp(8), 0, 0) })
    step.tip?.let { tip ->
      content.addView(
        label("💡 $tip", 17f, cText).apply {
          background = rounded(cSurfaceAlt, null, dp(12).toFloat())
          setPadding(dp(14), dp(12), dp(14), dp(12))
        },
        LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
          topMargin = dp(12)
        }
      )
    }
    val scroll = MaxHeightScrollView(this, (resources.displayMetrics.heightPixels * 0.32f).roundToInt())
    scroll.addView(content)
    card.addView(scroll)

    // Botões principais
    val main = row().apply { setPadding(0, dp(16), 0, 0) }
    main.addView(
      bigButton("◀ Voltar", filled = false, enabled = index > 0) { goTo(index - 1) },
      LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
    )
    main.addView(
      bigButton(if (isLast) "✔ Concluir" else "Próximo ▶", filled = true) {
        if (isLast) complete() else goTo(index + 1)
      },
      LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.3f).apply { marginStart = dp(10) }
    )
    card.addView(main)

    // Botões secundários
    val extra = row().apply { setPadding(0, dp(10), 0, 0) }
    extra.addView(smallButton("🔊 Ouvir") { speakCurrentStep(force = true) }, weighted())
    extra.addView(smallButton(if (atTop) "⬇ Descer" else "⬆ Subir") {
      atTop = !atTop
      render()
    }, weighted())
    extra.addView(smallButton(if (exitArmed) "Toque de novo" else "✕ Sair") {
      if (exitArmed) {
        listener?.invoke("cancel", index, steps.size)
        stopSelf()
      } else {
        exitArmed = true
        render()
        handler.postDelayed({
          if (exitArmed) {
            exitArmed = false
            if (!minimized && !finished) render()
          }
        }, 3500)
      }
    }, weighted())
    card.addView(extra)

    return wrap(card)
  }

  private fun buildFinishedCard(): View {
    val card = cardContainer()
    card.addView(label("🎉", 44f, cText).apply { gravity = Gravity.CENTER })
    card.addView(label("Parabéns!", 26f, cText, bold = true).apply { gravity = Gravity.CENTER })
    card.addView(label("Você concluiu: $tutorialTitle", 19f, cText).apply {
      gravity = Gravity.CENTER
      setPadding(0, dp(6), 0, dp(16))
    })
    val buttons = row()
    buttons.addView(
      bigButton("Fechar", filled = false) { stopSelf() },
      LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
    )
    buttons.addView(
      bigButton("Voltar ao Passo Certo", filled = true) { returnToApp() },
      LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.6f).apply { marginStart = dp(10) }
    )
    card.addView(buttons)
    return wrap(card)
  }

  @SuppressLint("ClickableViewAccessibility")
  private fun buildBubble(): View {
    val size = dp(76)
    val bubble = TextView(this).apply {
      text = "${index + 1}/${steps.size}\nAbrir"
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      setTextColor(cOnPrimary)
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(cPrimary)
        setStroke(dp(3), cFocus)
      }
      elevation = dp(8).toFloat()
      contentDescription = "Abrir o tutorial do Passo Certo"
      setWidth(size)
      setHeight(size)
    }

    var startX = 0
    var startY = 0
    var touchX = 0f
    var touchY = 0f
    var moved = false
    bubble.setOnTouchListener { v, event ->
      when (event.action) {
        MotionEvent.ACTION_DOWN -> {
          startX = bubbleX; startY = bubbleY
          touchX = event.rawX; touchY = event.rawY
          moved = false
          true
        }
        MotionEvent.ACTION_MOVE -> {
          val dx = event.rawX - touchX
          val dy = event.rawY - touchY
          if (abs(dx) > dp(8) || abs(dy) > dp(8)) moved = true
          if (moved) {
            bubbleX = startX + dx.roundToInt()
            bubbleY = startY + dy.roundToInt()
            (v.layoutParams as? WindowManager.LayoutParams)?.let { p ->
              p.x = bubbleX; p.y = bubbleY
              try {
                windowManager.updateViewLayout(v, p)
              } catch (_: Exception) {
              }
            }
          }
          true
        }
        MotionEvent.ACTION_UP -> {
          if (!moved) {
            minimized = false
            render()
          }
          true
        }
        else -> false
      }
    }
    return bubble
  }

  // ---------------------------------------------------------------- componentes

  private fun cardContainer() = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL
    background = rounded(cBackground, cBorder, dp(22).toFloat(), dp(2))
    setPadding(dp(20), dp(16), dp(20), dp(18))
    elevation = dp(12).toFloat()
  }

  /** Margem lateral em volta do cartão. */
  private fun wrap(card: View) = FrameLayout(this).apply {
    setPadding(dp(12), dp(4), dp(12), dp(4))
    addView(card)
  }

  private fun row() = LinearLayout(this).apply {
    orientation = LinearLayout.HORIZONTAL
    gravity = Gravity.CENTER_VERTICAL
  }

  private fun weighted() = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
    marginStart = dp(4)
    marginEnd = dp(4)
  }

  private fun label(text: String, sizeSp: Float, color: Int, bold: Boolean = false) = TextView(this).apply {
    this.text = text
    setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp * scale)
    setTextColor(color)
    if (bold) typeface = Typeface.DEFAULT_BOLD
    setLineSpacing(0f, 1.2f)
  }

  private fun bigButton(text: String, filled: Boolean, enabled: Boolean = true, onClick: () -> Unit) =
    TextView(this).apply {
      this.text = text
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 19f * scale)
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      minHeight = dp(60)
      setPadding(dp(10), dp(10), dp(10), dp(10))
      setTextColor(if (filled) cOnPrimary else cPrimary)
      background = rounded(if (filled) cPrimary else Color.TRANSPARENT, cPrimary, dp(16).toFloat(), dp(2))
      alpha = if (enabled) 1f else 0.35f
      isEnabled = enabled
      contentDescription = text
      setOnClickListener { if (enabled) onClick() }
    }

  private fun smallButton(text: String, onClick: () -> Unit) = TextView(this).apply {
    this.text = text
    setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f * scale)
    typeface = Typeface.DEFAULT_BOLD
    gravity = Gravity.CENTER
    minHeight = dp(48)
    setPadding(dp(12), dp(6), dp(12), dp(6))
    setTextColor(cText)
    background = rounded(cSurfaceAlt, null, dp(12).toFloat())
    contentDescription = text
    setOnClickListener { onClick() }
  }

  private fun rounded(fill: Int, stroke: Int?, radius: Float, strokeWidth: Int = 0) = GradientDrawable().apply {
    setColor(fill)
    cornerRadius = radius
    if (stroke != null && strokeWidth > 0) setStroke(strokeWidth, stroke)
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).roundToInt()

  /** ScrollView com altura máxima, para a caixa nunca cobrir a tela inteira. */
  private class MaxHeightScrollView(context: Context, private val maxHeightPx: Int) : ScrollView(context) {
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
      super.onMeasure(widthMeasureSpec, MeasureSpec.makeMeasureSpec(maxHeightPx, MeasureSpec.AT_MOST))
    }
  }
}
