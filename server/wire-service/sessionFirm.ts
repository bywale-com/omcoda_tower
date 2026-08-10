/**
 * Resolve firm scope from authenticated session only.
 * No demo-tenant fallback. Wrong-tenant header → 403. Missing session → 401.
 *
 * Local AUTH_DISABLED=true: require DEV_SESSION_FIRM (explicit env), never a code constant.
 */
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE, sha256 } from "../auth-service/crypto.ts";
import { getPool } from "../auth-service/db.ts";

export class FirmScopeError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function firmFromSessionCookie(c: Context): Promise<string | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = sha256(token);
  const result = await getPool().query<{ firm_id: string }>(
    `SELECT firm_id FROM sessions
     WHERE token_hash = $1 AND expires_at > now()
     LIMIT 1`,
    [tokenHash],
  );
  return result.rows[0]?.firm_id ?? null;
}

function authDisabled(): boolean {
  const v = (process.env.AUTH_DISABLED ?? process.env.VITE_AUTH_DISABLED ?? "").toLowerCase();
  return v === "true" || v === "1";
}

/**
 * Firm for machine/wire handlers.
 * Prefer session firm; header/query must match when present.
 */
export async function requireSessionFirm(c: Context): Promise<string> {
  const claimed = (c.req.query("firmId") || c.req.header("x-firm-id") || "").trim();
  const sessionFirm = await firmFromSessionCookie(c);

  if (sessionFirm) {
    if (claimed && claimed !== sessionFirm) {
      throw new FirmScopeError(403, "firm scope mismatch — wrong tenant");
    }
    return sessionFirm;
  }

  if (authDisabled()) {
    const devFirm = (process.env.DEV_SESSION_FIRM ?? "").trim();
    if (!devFirm) {
      throw new FirmScopeError(
        401,
        "DEV_SESSION_FIRM required when AUTH_DISABLED (no demo firm default)",
      );
    }
    if (claimed && claimed !== devFirm) {
      throw new FirmScopeError(403, "firm scope mismatch — wrong tenant");
    }
    return claimed || devFirm;
  }

  throw new FirmScopeError(401, "session required — firm scope from auth only");
}
