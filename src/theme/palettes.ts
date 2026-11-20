/**
 * Paletas de cores do Passo Certo.
 *
 * Regras de acessibilidade seguidas:
 * - Contraste de texto >= 7:1 (WCAG AAA) para o texto principal.
 * - A dificuldade NUNCA é indicada só por cor: sempre há rótulo ("Fácil")
 *   e marcadores (●○○) junto da cor.
 * - Modos para daltonismo trocam o trio verde/amarelo/vermelho por cores
 *   que continuam distinguíveis para cada tipo de visão.
 */

export type ThemeMode = 'sistema' | 'claro' | 'escuro';
export type ColorVision =
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'alto-contraste';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
  onDanger: string;
  focus: string;
  easy: string;
  medium: string;
  hard: string;
  onDifficulty: string;
}

const baseLight: Palette = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EEEAE2',
  text: '#1C1B1A',
  textMuted: '#4F4B45',
  border: '#CFC9BE',
  primary: '#1F5FA8',
  onPrimary: '#FFFFFF',
  danger: '#B3261E',
  onDanger: '#FFFFFF',
  focus: '#F2B705',
  easy: '#2E7D4F',
  medium: '#9A5B00',
  hard: '#B3261E',
  onDifficulty: '#FFFFFF',
};

const baseDark: Palette = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#2A2826',
  text: '#F3F1EC',
  textMuted: '#C2BDB4',
  border: '#45413C',
  primary: '#8EC1F5',
  onPrimary: '#0B1A2B',
  danger: '#F2B8B5',
  onDanger: '#3B0A08',
  focus: '#FFD54F',
  easy: '#7FD19B',
  medium: '#F5C26B',
  hard: '#F2A29D',
  onDifficulty: '#111111',
};

/** Ajustes por tipo de visão de cores, aplicados sobre a paleta base. */
const visionOverrides: Record<
  Exclude<ColorVision, 'alto-contraste'>,
  { light: Partial<Palette>; dark: Partial<Palette> }
> = {
  normal: { light: {}, dark: {} },
  // Protanopia / deuteranopia: confundem vermelho e verde.
  // Azul / laranja / roxo (inspirado na paleta Okabe-Ito).
  protanopia: {
    light: { easy: '#0060A0', medium: '#A86400', hard: '#5B2C83', danger: '#5B2C83' },
    dark: { easy: '#7CC0F0', medium: '#F0B85A', hard: '#D3A6F2', danger: '#D3A6F2', onDanger: '#1E0B2E' },
  },
  deuteranopia: {
    light: { easy: '#0060A0', medium: '#A86400', hard: '#5B2C83', danger: '#5B2C83' },
    dark: { easy: '#7CC0F0', medium: '#F0B85A', hard: '#D3A6F2', danger: '#D3A6F2', onDanger: '#1E0B2E' },
  },
  // Tritanopia: confunde azul e amarelo. Verde-escuro / magenta / preto.
  tritanopia: {
    light: { primary: '#1A6B3A', easy: '#1A6B3A', medium: '#C2185B', hard: '#262626', focus: '#C2185B' },
    dark: {
      primary: '#8FD6A8',
      onPrimary: '#0A2414',
      easy: '#8FD6A8',
      medium: '#F48FB1',
      hard: '#E0E0E0',
      focus: '#F48FB1',
    },
  },
};

const highContrastLight: Palette = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  text: '#000000',
  textMuted: '#000000',
  border: '#000000',
  primary: '#0000B3',
  onPrimary: '#FFFFFF',
  danger: '#9E0000',
  onDanger: '#FFFFFF',
  focus: '#000000',
  easy: '#000000',
  medium: '#000000',
  hard: '#000000',
  onDifficulty: '#FFFFFF',
};

const highContrastDark: Palette = {
  background: '#000000',
  surface: '#000000',
  surfaceAlt: '#1A1A1A',
  text: '#FFFFFF',
  textMuted: '#FFFFFF',
  border: '#FFFFFF',
  primary: '#FFE600',
  onPrimary: '#000000',
  danger: '#FF8A80',
  onDanger: '#000000',
  focus: '#FFE600',
  easy: '#FFFFFF',
  medium: '#FFFFFF',
  hard: '#FFFFFF',
  onDifficulty: '#000000',
};

export function buildPalette(dark: boolean, vision: ColorVision): Palette {
  if (vision === 'alto-contraste') return dark ? highContrastDark : highContrastLight;
  const base = dark ? baseDark : baseLight;
  const override = visionOverrides[vision][dark ? 'dark' : 'light'];
  return { ...base, ...override };
}

export const COLOR_VISION_LABELS: Record<ColorVision, { title: string; description: string }> = {
  normal: { title: 'Cores padrão', description: 'Sem ajuste de cores' },
  protanopia: { title: 'Protanopia', description: 'Dificuldade com o vermelho' },
  deuteranopia: { title: 'Deuteranopia', description: 'Dificuldade com o verde' },
  tritanopia: { title: 'Tritanopia', description: 'Dificuldade com azul e amarelo' },
  'alto-contraste': { title: 'Alto contraste', description: 'Preto e branco, máximo destaque' },
};
