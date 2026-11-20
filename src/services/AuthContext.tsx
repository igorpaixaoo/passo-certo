import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { API_URL, loginRequest } from './api';

/**
 * Login de administrador.
 *
 * MODO LOCAL (atual): credenciais fixas, comparadas por hash SHA-256.
 *   Usuário: admin   Senha: passocerto
 *   Isso só protege contra uso acidental — qualquer pessoa com o APK pode
 *   extrair o hash. Para proteção real, configure o backend com JWT (api.ts).
 *
 * A sessão fica apenas em memória: fechar o app encerra o login.
 */
const LOCAL_USER = 'admin';
// SHA-256 de "passocerto"
const LOCAL_PASSWORD_SHA256 = 'd4ab00763cd2b63c7d2697afe981395547c2f818df1f71463accd731208c0b01';

interface AuthContextValue {
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    if (API_URL) {
      const { token: jwt } = await loginRequest(username, password);
      setToken(jwt);
      return;
    }
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
    if (username.trim().toLowerCase() !== LOCAL_USER || hash !== LOCAL_PASSWORD_SHA256) {
      throw new Error('Usuário ou senha incorretos');
    }
    setToken(`local-${Crypto.randomUUID()}`);
  }, []);

  const logout = useCallback(() => setToken(null), []);

  const value = useMemo(() => ({ token, isAdmin: token !== null, login, logout }), [token, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
