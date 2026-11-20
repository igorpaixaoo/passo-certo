import { Overlay } from '../../modules/passo-certo-overlay';
import type { Tutorial } from '../data/types';
import type { Settings, Theme } from '../theme/SettingsContext';

export type StartResult =
  | { ok: true; openedApp: string | null }
  | { ok: false; reason: 'indisponivel' | 'sem-permissao' };

/**
 * Inicia o tutorial "por cima" dos outros apps:
 * 1. mostra a caixa flutuante (serviço nativo)
 * 2. abre o app alvo, se estiver instalado; senão, vai para a tela inicial
 */
export function startOverlayTutorial(tutorial: Tutorial, theme: Theme, settings: Settings): StartResult {
  if (!Overlay.isAvailable) return { ok: false, reason: 'indisponivel' };
  if (!Overlay.canDrawOverlays()) return { ok: false, reason: 'sem-permissao' };

  Overlay.start({
    title: tutorial.title,
    steps: tutorial.steps.map(({ title, instruction, tip }) => ({ title, instruction, tip })),
    colors: { ...theme.colors },
    textScale: settings.textScale,
    voiceEnabled: settings.voiceEnabled,
    speechRate: settings.speechRate,
  });

  const packages = tutorial.targetApp?.packageNames ?? [];
  const opened = packages.length ? Overlay.openApp(packages) : null;
  if (!opened) Overlay.goHome();
  return { ok: true, openedApp: opened };
}

export function isTargetAppInstalled(tutorial: Tutorial): boolean | null {
  const packages = tutorial.targetApp?.packageNames ?? [];
  if (!packages.length || !Overlay.isAvailable) return null;
  return Overlay.findInstalledApp(packages) !== null;
}
