const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL ?? "";

/**
 * Dev/demo: skip product AuthGate + Register password gate.
 * Accepts "true" / "1" / "yes". In Vite DEV, defaults ON unless explicitly "false".
 * Never ship production with this enabled.
 */
export function isAuthDisabled(): boolean {
  const raw = String(import.meta.env.VITE_AUTH_DISABLED ?? "").trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  // Craft/demo default: never trap the desk behind Login while developing.
  return Boolean(import.meta.env.DEV);
}

export function isRegisterRouteEnabled(): boolean {
  return import.meta.env.VITE_REGISTER_ENABLED === "true";
}

export type AuthUser = {
  id: string;
  firmId: string;
  email: string;
};

type ApiError = {
  ok: false;
  error: string;
  message?: string;
};

type SendOk = { ok: true; message: string };
type VerifyOk = { ok: true };
type SessionOk = { ok: true; authenticated: true; user: AuthUser };
type RegisterStatus = { enabled: boolean; unlocked: boolean };

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T | ApiError;

  if (!response.ok) {
    const err = data as ApiError;
    throw new AuthRequestError(
      err.message ?? "Request failed",
      response.status,
      err.error ?? "unknown",
    );
  }

  return data as T;
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export async function sendOtp(email: string): Promise<SendOk> {
  return authFetch<SendOk>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOk> {
  return authFetch<VerifyOk>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function abandonOtp(email: string): Promise<{ ok: true }> {
  return authFetch<{ ok: true }>("/auth/otp/abandon", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function fetchSession(): Promise<SessionOk | null> {
  try {
    return await authFetch<SessionOk>("/auth/session");
  } catch (error) {
    if (error instanceof AuthRequestError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await authFetch<{ ok: true }>("/auth/logout", { method: "POST" });
}

export async function fetchRegisterStatus(): Promise<RegisterStatus> {
  return authFetch<RegisterStatus>("/auth/register/status");
}

export async function unlockRegister(password: string): Promise<void> {
  await authFetch<{ ok: true }>("/auth/register/unlock", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function lockRegister(): Promise<void> {
  await authFetch<{ ok: true }>("/auth/register/lock", { method: "POST" });
}
