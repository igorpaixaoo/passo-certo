# Passo Certo 👣

Tutoriais guiados, em tempo real, para pessoas 60+ usarem o celular, aplicativos e bancos.
O Passo Certo mostra uma **caixa flutuante por cima de outros apps** (WhatsApp, Configurações,
banco…) com instruções grandes, barra de progresso e **leitura em voz alta**.

Feito com Expo SDK 58 (React Native 0.88) + um módulo nativo Android próprio (Kotlin).

## Telas

| Rota | Tela |
| --- | --- |
| `/` | Início: tutoriais separados por dificuldade (Fácil / Médio / Difícil) com filtro |
| `/tutorial/[id]` | Detalhes do tutorial e botão **Começar com ajuda na tela** |
| `/praticar/[id]` | Modo dentro do app (um passo por vez, com voz). Usado quando não há sobreposição |
| `/ajustes` | Tamanho da letra, tema claro/escuro/automático, daltonismo, voz |
| `/admin/login` | Login do administrador |
| `/admin/painel` | Lista para editar e excluir tutoriais, e criar novos |
| `/admin/editor` | Criar ou editar um tutorial (passos, dicas, app que será aberto) |

**Login padrão (modo local):** usuário `admin`, senha `passocerto`.
Esse login protege só contra uso acidental. Para segurança de verdade, use o backend com JWT (veja abaixo).

## Como funciona a sobreposição

`modules/passo-certo-overlay/` é um módulo Expo local:

- `OverlayService.kt` é um *foreground service* que desenha a caixa com `WindowManager`
  (`TYPE_APPLICATION_OVERLAY`) e fala com `TextToSpeech` em pt-BR.
  - Botões grandes: **◀ Voltar**, **Próximo ▶** / **✔ Concluir**, **🔊 Ouvir**, **⬆ Subir / ⬇ Descer**
    (move a caixa para não tapar o que a pessoa precisa tocar) e **✕ Sair**, que pede um segundo toque.
  - **— Ocultar** vira uma bolinha arrastável. Tocar nela abre a caixa de novo.
  - A caixa usa as cores do tema escolhido no app, inclusive os modos de daltonismo.
  - Também há uma notificação com o botão "Encerrar".
- `PassoCertoOverlayModule.kt` expõe ao JS: `canDrawOverlays`, `openOverlaySettings`,
  `startTutorial`, `stopTutorial`, `openApp`, `findInstalledApp`, `goHome`, e o evento `onTutorialEvent`.

Na primeira vez, o app explica, passo a passo, como liberar a permissão **"Sobrepor a outros apps"**.

> No Expo Go, na web e no iOS o módulo não existe. Nesses casos o app usa só o modo "Ver os passos aqui".

## Rodar e gerar o APK

```bash
npm install --legacy-peer-deps   # o template do SDK 58 tem um conflito de peer deps (react-dom)
```

### APK pela nuvem (não precisa de Android Studio)

```bash
npx eas-cli@latest login
npm run build:apk        # perfil "preview": gera um .apk instalável
```

Baixe o `.apk` pelo link do build e instale no celular.

### Desenvolvimento

```bash
npm run build:dev        # gera um "development build" (.apk) uma vez
npx expo start           # depois é só abrir o app instalado
```

Com o Android SDK instalado na máquina, também funciona `npm run android` (`expo run:android`).

## Acessibilidade

- Letra base de 20 sp, com escalas Normal / Grande / Enorme. Áreas de toque de 60 dp ou mais.
- Tema claro, escuro ou automático.
- Modos de cor: padrão, protanopia, deuteranopia, tritanopia e alto contraste.
- A dificuldade nunca é mostrada só pela cor: sempre há o texto ("Fácil") e os marcadores ●○○.
- Rótulos para o leitor de tela (TalkBack), e textos curtos e diretos.

## Próximos passos sugeridos

- **Backend + JWT**: `src/services/api.ts` já tem `loginRequest` e `authFetch`.
  Basta definir `API_URL`, guardar o token com `expo-secure-store` e trocar `load`/`persist`
  em `src/data/TutorialsContext.tsx` por chamadas à API.
- **Destacar o botão certo na tela** (setas e círculos apontando o elemento), usando um
  AccessibilityService para ler a tela do app aberto.
