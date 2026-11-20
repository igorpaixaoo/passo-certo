export type Difficulty = 'facil' | 'medio' | 'dificil';

export const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; subtitle: string; level: number }> = {
  facil: { label: 'Fácil', subtitle: 'Para começar com calma', level: 1 },
  medio: { label: 'Médio', subtitle: 'Quando já tiver mais prática', level: 2 },
  dificil: { label: 'Difícil', subtitle: 'Mais passos e mais atenção', level: 3 },
};

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  /** Dica opcional (ex.: aviso de segurança). */
  tip?: string;
}

export interface TargetApp {
  /** Nome amigável, ex.: "WhatsApp" */
  name: string;
  /**
   * Pacotes Android, em ordem de preferência. O primeiro instalado é aberto.
   * Ex.: ["com.google.android.dialer", "com.samsung.android.dialer"]
   */
  packageNames: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  difficulty: Difficulty;
  targetApp?: TargetApp;
  steps: TutorialStep[];
  createdAt: string;
  updatedAt: string;
}
