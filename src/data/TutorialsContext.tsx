import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { SEED_TUTORIALS } from './seed';
import type { Tutorial } from './types';

/**
 * Armazenamento local dos tutoriais (AsyncStorage).
 *
 * Quando existir um backend, troque as funções `load`/`persist` por chamadas
 * à API (ver src/services/api.ts) mantendo a mesma interface do contexto.
 */
const STORAGE_KEY = 'passo-certo:tutorials';

export type TutorialInput = Omit<Tutorial, 'id' | 'createdAt' | 'updatedAt'>;

interface TutorialsContextValue {
  tutorials: Tutorial[];
  loading: boolean;
  getById: (id: string) => Tutorial | undefined;
  create: (input: TutorialInput) => Promise<Tutorial>;
  update: (id: string, input: TutorialInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const TutorialsContext = createContext<TutorialsContextValue | null>(null);

async function load(): Promise<Tutorial[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return SEED_TUTORIALS;
  try {
    return JSON.parse(raw) as Tutorial[];
  } catch {
    return SEED_TUTORIALS;
  }
}

function persist(list: Tutorial[]) {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function TutorialsProvider({ children }: { children: ReactNode }) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  // Cópia sempre atualizada da lista, para gravar exatamente o que foi exibido.
  const current = useRef<Tutorial[]>([]);

  useEffect(() => {
    load()
      .catch(() => SEED_TUTORIALS)
      .then((list) => {
        current.current = list;
        setTutorials(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const commit = useCallback(async (updater: (prev: Tutorial[]) => Tutorial[]) => {
    const next = updater(current.current);
    current.current = next;
    setTutorials(next);
    await persist(next);
  }, []);

  const getById = useCallback((id: string) => tutorials.find((t) => t.id === id), [tutorials]);

  const create = useCallback(
    async (input: TutorialInput) => {
      const now = new Date().toISOString();
      const tutorial: Tutorial = { ...input, id: Crypto.randomUUID(), createdAt: now, updatedAt: now };
      await commit((prev) => [...prev, tutorial]);
      return tutorial;
    },
    [commit],
  );

  const update = useCallback(
    (id: string, input: TutorialInput) =>
      commit((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...input, id, updatedAt: new Date().toISOString() } : t)),
      ),
    [commit],
  );

  const remove = useCallback((id: string) => commit((prev) => prev.filter((t) => t.id !== id)), [commit]);

  const resetToDefaults = useCallback(() => commit(() => SEED_TUTORIALS), [commit]);

  const value = useMemo(
    () => ({ tutorials, loading, getById, create, update, remove, resetToDefaults }),
    [tutorials, loading, getById, create, update, remove, resetToDefaults],
  );

  return <TutorialsContext.Provider value={value}>{children}</TutorialsContext.Provider>;
}

export function useTutorials() {
  const ctx = useContext(TutorialsContext);
  if (!ctx) throw new Error('useTutorials precisa estar dentro de <TutorialsProvider>');
  return ctx;
}
