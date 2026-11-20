import { NativeModule, requireOptionalNativeModule } from 'expo';
import type { EventSubscription } from 'expo-modules-core';
import { Platform } from 'react-native';

export type TutorialEventType = 'start' | 'step' | 'complete' | 'cancel';

export interface TutorialEvent {
  type: TutorialEventType;
  step: number;
  total: number;
}

type Events = { onTutorialEvent: (event: TutorialEvent) => void };

declare class PassoCertoOverlayNative extends NativeModule<Events> {
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
  isTutorialRunning(): boolean;
  startTutorial(payloadJson: string): void;
  stopTutorial(): void;
  findInstalledApp(packageNames: string[]): string | null;
  openApp(packageNames: string[]): string | null;
  goHome(): void;
}

/** null no Expo Go, na web e no iOS — o app usa o modo "praticar aqui". */
const native =
  Platform.OS === 'android' ? requireOptionalNativeModule<PassoCertoOverlayNative>('PassoCertoOverlay') : null;

export interface OverlayPayload {
  title: string;
  steps: { title: string; instruction: string; tip?: string }[];
  colors: Record<string, string>;
  textScale: number;
  voiceEnabled: boolean;
  speechRate: number;
}

export const Overlay = {
  /** O recurso de sobreposição existe neste aparelho/build? */
  isAvailable: native !== null,
  canDrawOverlays: () => native?.canDrawOverlays() ?? false,
  openOverlaySettings: () => native?.openOverlaySettings(),
  isRunning: () => native?.isTutorialRunning() ?? false,
  start: (payload: OverlayPayload) => native?.startTutorial(JSON.stringify(payload)),
  stop: () => native?.stopTutorial(),
  findInstalledApp: (packageNames: string[]) => native?.findInstalledApp(packageNames) ?? null,
  openApp: (packageNames: string[]) => native?.openApp(packageNames) ?? null,
  goHome: () => native?.goHome(),
  addListener: (cb: (e: TutorialEvent) => void): EventSubscription | null =>
    native?.addListener('onTutorialEvent', cb) ?? null,
};
