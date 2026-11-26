import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildPalette, type ColorVision, type Palette, type ThemeMode } from './palettes';

export type TextScale = 1 | 1.2 | 1.4;

export interface Settings {
  themeMode: ThemeMode;
  colorVision: ColorVision;
  textScale: TextScale;
  voiceEnabled: boolean;
  /** 0.5 (devagar) a 1.0 (normal) */
  speechRate: number;
}

const DEFAULT_SETTINGS: Settings = {
  themeMode: 'sistema',
  colorVision: 'normal',
  textScale: 1,
  voiceEnabled: true,
  speechRate: 0.85,
};

const STORAGE_KEY = 'passo-certo:settings';

export interface Theme {
  dark: boolean;
  colors: Palette;
  /** Tamanhos de fonte já multiplicados pela escala escolhida. */
  /** `button` cresce menos que os outros para o texto caber nos botões. */
  font: { small: number; body: number; large: number; title: number; hero: number; button: number };
  spacing: (n: number) => number;
  radius: number;
  /** Altura mínima de qualquer área de toque. */
  touch: number;
}

interface SettingsContextValue {
  settings: Settings;
  theme: Theme;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const theme = useMemo<Theme>(() => {
    const dark =
      settings.themeMode === 'escuro' || (settings.themeMode === 'sistema' && systemScheme === 'dark');
    const s = settings.textScale;
    return {
      dark,
      colors: buildPalette(dark, settings.colorVision),
      font: {
        small: Math.round(17 * s),
        body: Math.round(20 * s),
        large: Math.round(23 * s),
        title: Math.round(28 * s),
        hero: Math.round(34 * s),
        button: Math.round(18 * (1 + (s - 1) * 0.5)),
      },
      spacing: (n: number) => n * 8,
      radius: 18,
      touch: 60,
    };
  }, [settings, systemScheme]);

  const value = useMemo(() => ({ settings, theme, ready, update }), [settings, theme, ready, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings precisa estar dentro de <SettingsProvider>');
  return ctx;
}

export function useTheme() {
  return useSettings().theme;
}
