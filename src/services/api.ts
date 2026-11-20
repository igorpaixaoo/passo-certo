/**
 * Ponto único de integração com um backend futuro.
 *
 * Hoje o Passo Certo funciona 100% offline: tutoriais ficam no aparelho
 * (AsyncStorage) e o login de administrador é local.
 *
 * Para migrar para JWT:
 * 1. Defina API_URL (ex.: via app.json -> expo.extra.apiUrl).
 * 2. Implemente `loginRequest` chamando POST /auth/login, que devolve { token }.
 * 3. Guarde o token com expo-secure-store (não em AsyncStorage).
 * 4. Use `authFetch` para as rotas protegidas de tutoriais (POST/PUT/DELETE),
 *    e troque load/persist em src/data/TutorialsContext.tsx por GET /tutorials.
 */
export const API_URL: string | null = null;

export interface LoginResponse {
  token: string;
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  if (!API_URL) throw new Error('Backend ainda não configurado');
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Usuário ou senha incorretos');
  return res.json();
}

export function authFetch(path: string, token: string, init: RequestInit = {}) {
  if (!API_URL) throw new Error('Backend ainda não configurado');
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers, Authorization: `Bearer ${token}` },
  });
}
