/**
 * Resolve firm scope from authenticated session only.
 * No demo-tenant fallback. Wrong-tenant header → 403. Missing session → 401.
 * Platform admin may view-as another firm via x-firm-id / ?firmId=.
 *
 * Local AUTH_DISABLED=true: require DEV_SESSION_FIRM (explicit env), never a code constant.
 */
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE, sha256 } from "../auth-service/crypto.ts";
import { getPool } from "../auth-service/db.ts";
import { isPlatformAdminEmail } from "../auth-service/platformAdmin.ts";

export class FirmScopeError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function actorFromSessionCookie(
  c: Context,
): Promise<{ firmId: string; email: string } | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = sha256(token);
  const result = await getPool().query<{ firm_id: string; email: string }>(
    `SELECT s.firm_id, u.email
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
     LIMIT 1`,
    [tokenHash],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { firmId: row.firm_id, email: row.email };
}

function authDisabled(): boolean {
  const v = (process.env.AUTH_DISABLED ?? process.env.VITE_AUTH_DISABLED ?? "").toLowerCase();
  return v === "true" || v === "1";
}

/**
 * Firm for machine/wire handlers.
 * Prefer session firm; header/query must match when present —
 * except platform admin, who may claim another firm (consultant dropdown view-as).
 */
export async function requireSessionFirm(c: Context): Promise<string> {
  const claimed = (c.req.query("firmId") || c.req.header("x-firm-id") || "").trim();
  const actor = await actorFromSessionCookie(c);

  if (actor) {
    if (claimed && claimed !== actor.firmId) {
      if (!isPlatformAdminEmail(actor.email)) {
        throw new FirmScopeError(403, "firm scope mismatch — wrong tenant");
      }
      return claimed;
    }
    return claimed || actor.firmId;
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
      // Auth-disabled local: allow claimed firm for prototype view-as.
      return claimed;
    }
    return claimed || devFirm;
  }

  throw new FirmScopeError(401, "session required — firm scope from auth only");
}

/** Session email when authenticated (for admin-only handlers). */
export async function requireSessionActor(
  c: Context,
): Promise<{ firmId: string; email: string }> {
  const actor = await actorFromSessionCookie(c);
  if (actor) return actor;
  if (authDisabled()) {
    return {
      firmId: (process.env.DEV_SESSION_FIRM ?? "").trim() || "dev",
      email: process.env.DEV_SESSION_EMAIL?.trim() || "admin@try-tower.com",
    };
  }
  throw new FirmScopeError(401, "session required");
}
