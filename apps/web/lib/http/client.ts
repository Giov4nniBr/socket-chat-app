const API_URL = import.meta.env.PUBLIC_API_URL!;

export async function requestClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
    
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Erro na requisição (${res.status})`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}
