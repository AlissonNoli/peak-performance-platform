/* ─── API Client Stub ───
 * Todas as chamadas passam por aqui.
 * Quando o backend estiver pronto, basta configurar API_BASE_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `API ${res.status}`);
  }
  return res;
}

export async function apiFetchJson<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });
  return res.json() as Promise<T>;
}
