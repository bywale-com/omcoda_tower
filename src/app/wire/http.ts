/** Browser → /wire API (proxied to auth/wire service). Never holds secrets. */

const BASE = "/wire";

export async function wireFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`wire ${path} ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export function wireRealEnabled(): boolean {
  const flag = import.meta.env.VITE_WIRE_REAL;
  return flag !== "false" && flag !== false;
}
