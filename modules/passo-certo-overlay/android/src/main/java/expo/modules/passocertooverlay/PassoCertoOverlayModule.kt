package expo.modules.passocertooverlay

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PassoCertoOverlayModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context indisponível" }

  override fun definition() = ModuleDefinition {
    Name("PassoCertoOverlay")

    Events("onTutorialEvent")

    OnCreate {
      OverlayService.listener = { type, step, total ->
        val body = Bundle().apply {
          putString("type", type)
          putInt("step", step)
          putInt("total", total)
        }
        this@PassoCertoOverlayModule.sendEvent("onTutorialEvent", body)
      }
    }

    OnDestroy {
      OverlayService.listener = null
    }

    /** O usuário já permitiu "Sobrepor a outros apps"? */
    Function("canDrawOverlays") {
      return@Function if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
      } else {
        true
      }
    }

    /** Abre a tela do sistema onde se libera a permissão de sobreposição. */
    Function("openOverlaySettings") {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("isTutorialRunning") {
      return@Function OverlayService.isRunning
    }

    /** Recebe o tutorial (JSON) e mostra a caixa flutuante. */
    Function("startTutorial") { payloadJson: String ->
      val intent = Intent(context, OverlayService::class.java)
        .putExtra(OverlayService.EXTRA_PAYLOAD, payloadJson)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      Unit
    }

    Function("stopTutorial") {
      context.stopService(Intent(context, OverlayService::class.java))
      Unit
    }

    /** Retorna o primeiro pacote da lista que está instalado, ou null. */
    Function("findInstalledApp") { packageNames: List<String> ->
      return@Function packageNames.firstOrNull { pkg ->
        context.packageManager.getLaunchIntentForPackage(pkg) != null
      }
    }

    /** Abre o primeiro app instalado da lista. Retorna o pacote aberto ou null. */
    Function("openApp") { packageNames: List<String> ->
      for (pkg in packageNames) {
        val launch = context.packageManager.getLaunchIntentForPackage(pkg) ?: continue
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(launch)
        return@Function pkg
      }
      return@Function null
    }

    /** Vai para a tela inicial do celular (o Passo Certo fica em segundo plano). */
    Function("goHome") {
      val home = Intent(Intent.ACTION_MAIN)
        .addCategory(Intent.CATEGORY_HOME)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(home)
    }
  }
}
