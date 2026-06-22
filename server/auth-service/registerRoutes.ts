import { createHmac, timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

export const REGISTER_GATE_COOKIE = "tower_register_gate";
const REGISTER_GATE_TTL_MS = 8 * 60 * 60 * 1000;

export function isRegisterEnabled(): boolean {
  return process.env.REGISTER_ENABLED === "true";
}

function registerSecret(): string {
  const secret = process.env.REGISTER_PASSWORD;
  if (!secret) {
    throw new Error("REGISTER_PASSWORD is required when REGISTER_ENABLED=true");
  }
  return secret;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function signRegisterPayload(payload: string): string {
  return createHmac("sha256", registerSecret()).update(payload).digest("base64url");
}

function issueRegisterGateCookie(c: Context): void {
  const expiresAt = Date.now() + REGISTER_GATE_TTL_MS;
  const payload = String(expiresAt);
  const value = `${payload}.${signRegisterPayload(payload)}`;

  setCookie(c, REGISTER_GATE_COOKIE, value, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "Lax",
    path: "/",
    maxAge: Math.floor(REGISTER_GATE_TTL_MS / 1000),
  });
}

export function isRegisterGateOpen(c: Context): boolean {
  if (!isRegisterEnabled()) {
    return false;
  }

  const raw = getCookie(c, REGISTER_GATE_COOKIE);
  if (!raw) {
    return false;
  }

  const dot = raw.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }

  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expiresAt = Number(payload);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  try {
    const expected = signRegisterPayload(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function passwordsMatch(candidate: string): boolean {
  const expected = process.env.REGISTER_PASSWORD ?? "";
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function handleRegisterStatus(c: Context): Promise<Response> {
  return c.json({
    enabled: isRegisterEnabled(),
    unlocked: isRegisterGateOpen(c),
  });
}

export async function handleRegisterUnlock(c: Context): Promise<Response> {
  if (!isRegisterEnabled()) {
    return c.json({ ok: false, error: "disabled" }, 403);
  }

  if (!process.env.REGISTER_PASSWORD) {
    return c.json({ ok: false, error: "misconfigured" }, 500);
  }

  const body = await c.req.json<{ password?: string }>().catch(() => ({}));
  const password = body.password ?? "";

  if (!passwordsMatch(password)) {
    return c.json({ ok: false, error: "invalid_password" }, 401);
  }

  issueRegisterGateCookie(c);
  return c.json({ ok: true });
}

export async function handleRegisterLock(c: Context): Promise<Response> {
  deleteCookie(c, REGISTER_GATE_COOKIE, { path: "/" });
  return c.json({ ok: true });
}
