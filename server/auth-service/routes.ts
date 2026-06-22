import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import {
  MAX_SENDS_PER_WINDOW,
  MAX_VERIFY_ATTEMPTS,
  OTP_TTL_MS,
  SEND_RATE_WINDOW_MS,
  SESSION_COOKIE,
  generateOtpCode,
  generateSessionToken,
  isValidEmail,
  normalizeEmail,
  sha256,
} from "./crypto.ts";
import { getPool, resolveUserByEmail, withTransaction } from "./db.ts";
import { sendOtpEmail } from "./email.ts";
import { log, logError } from "./logger.ts";

const GENERIC_SEND_MESSAGE =
  "If that address is registered, we sent a verification code.";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "Lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

async function countRecentSends(email: string): Promise<number> {
  const pool = getPool();
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM otp_send_log
     WHERE lower(email) = lower($1)
       AND created_at > now() - ($2::text || ' milliseconds')::interval`,
    [email, SEND_RATE_WINDOW_MS],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function logSendAttempt(email: string): Promise<void> {
  await getPool().query(`INSERT INTO otp_send_log (email) VALUES ($1)`, [email]);
}

async function invalidateChallenges(
  firmId: string,
  email: string,
  client = getPool(),
): Promise<void> {
  await client.query(
    `UPDATE otp_challenges
     SET invalidated_at = now()
     WHERE firm_id = $1 AND lower(email) = lower($2)
       AND consumed_at IS NULL AND invalidated_at IS NULL`,
    [firmId, email],
  );
}

export async function handleOtpSend(c: Context): Promise<Response> {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");

  if (!isValidEmail(email)) {
    return c.json({ ok: false, error: "invalid_email", message: "Enter a valid email." }, 400);
  }

  const recentSends = await countRecentSends(email);
  if (recentSends >= MAX_SENDS_PER_WINDOW) {
    log("auth.otp.send", { outcome: "rate_limited", email_domain: email.split("@")[1] });
    return c.json(
      {
        ok: false,
        error: "rate_limited",
        message: "Too many codes requested. Wait a few minutes and try again.",
      },
      429,
    );
  }

  await logSendAttempt(email);

  const user = await resolveUserByEmail(getPool(), email);
  if (!user) {
    log("auth.otp.send", { outcome: "unprovisioned", email_domain: email.split("@")[1] });
    return c.json({ ok: true, message: GENERIC_SEND_MESSAGE });
  }

  const code = generateOtpCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  let challengeId: string;

  try {
    challengeId = await withTransaction(async (client) => {
      await invalidateChallenges(user.firm_id, email, client);
      const insert = await client.query<{ id: string }>(
        `INSERT INTO otp_challenges (firm_id, email, code_hash, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [user.firm_id, email, codeHash, expiresAt.toISOString()],
      );
      return insert.rows[0]!.id;
    });
  } catch (error) {
    logError("auth.otp.send", error, { outcome: "db_error", firm_id: user.firm_id });
    return c.json({ ok: false, error: "server_error", message: "Something went wrong. Try again." }, 500);
  }

  try {
    await sendOtpEmail(email, code);
  } catch {
    await getPool().query(
      `UPDATE otp_challenges SET delivery_failed = true WHERE id = $1`,
      [challengeId],
    );
    log("auth.otp.send", { outcome: "delivery_failed", firm_id: user.firm_id });
    return c.json(
      {
        ok: false,
        error: "delivery_failed",
        message: "We could not send the email. Try again shortly.",
      },
      503,
    );
  }

  log("auth.otp.send", { outcome: "ok", firm_id: user.firm_id });
  return c.json({ ok: true, message: GENERIC_SEND_MESSAGE });
}

export async function handleOtpVerify(c: Context): Promise<Response> {
  const body = await c.req.json<{ email?: string; code?: string }>().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");
  const code = (body.code ?? "").trim();

  if (!isValidEmail(email) || !code) {
    return c.json({ ok: false, error: "invalid_request", message: "Email and code are required." }, 400);
  }

  const user = await resolveUserByEmail(getPool(), email);
  if (!user) {
    return c.json({ ok: false, error: "invalid_code", message: "Invalid verification code." }, 401);
  }

  const codeHash = sha256(code);
  const pool = getPool();

  try {
    const sessionToken = generateSessionToken();
    const tokenHash = sha256(sessionToken);
    const sessionExpires = new Date(Date.now() + SESSION_TTL_MS);

    const consumed = await withTransaction(async (client) => {
      const consume = await client.query(
        `UPDATE otp_challenges
         SET consumed_at = now()
         WHERE firm_id = $1 AND lower(email) = lower($2)
           AND consumed_at IS NULL
           AND invalidated_at IS NULL
           AND delivery_failed = false
           AND expires_at > now()
           AND code_hash = $3
         RETURNING id`,
        [user.firm_id, email, codeHash],
      );

      if (consume.rowCount === 0) {
        return false;
      }

      await client.query(
        `INSERT INTO sessions (user_id, firm_id, token_hash, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.firm_id, tokenHash, sessionExpires.toISOString()],
      );

      return true;
    });

    if (!consumed) {
      const active = await pool.query<{
        id: string;
        expires_at: Date;
        verify_attempts: number;
      }>(
        `SELECT id, expires_at, verify_attempts
         FROM otp_challenges
         WHERE firm_id = $1 AND lower(email) = lower($2)
           AND consumed_at IS NULL
           AND invalidated_at IS NULL
           AND delivery_failed = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [user.firm_id, email],
      );

      const challenge = active.rows[0];
      if (!challenge) {
        log("auth.otp.verify", { outcome: "no_challenge", firm_id: user.firm_id });
        return c.json({ ok: false, error: "no_challenge", message: "No active code. Request a new one." }, 401);
      }

      if (new Date(challenge.expires_at) <= new Date()) {
        log("auth.otp.verify", { outcome: "expired", firm_id: user.firm_id });
        return c.json({ ok: false, error: "expired", message: "This code has expired. Request a new one." }, 401);
      }

      const nextAttempts = challenge.verify_attempts + 1;
      await pool.query(`UPDATE otp_challenges SET verify_attempts = $1 WHERE id = $2`, [
        nextAttempts,
        challenge.id,
      ]);

      if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
        log("auth.otp.verify", { outcome: "rate_limited", firm_id: user.firm_id });
        return c.json(
          {
            ok: false,
            error: "rate_limited",
            message: "Too many attempts. Request a new code.",
          },
          429,
        );
      }

      const remaining = MAX_VERIFY_ATTEMPTS - nextAttempts;
      log("auth.otp.verify", { outcome: "invalid_code", firm_id: user.firm_id });
      return c.json(
        {
          ok: false,
          error: "invalid_code",
          message: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        },
        401,
      );
    }

    setSessionCookie(c, sessionToken);
    log("auth.otp.verify", { outcome: "ok", firm_id: user.firm_id });
    return c.json({ ok: true });
  } catch (error) {
    logError("auth.otp.verify", error, { outcome: "server_error", firm_id: user.firm_id });
    return c.json({ ok: false, error: "server_error", message: "Something went wrong. Try again." }, 500);
  }
}

export async function handleOtpAbandon(c: Context): Promise<Response> {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");

  if (!isValidEmail(email)) {
    return c.json({ ok: false, error: "invalid_email" }, 400);
  }

  const user = await resolveUserByEmail(getPool(), email);
  if (user) {
    await invalidateChallenges(user.firm_id, email);
    log("auth.otp.abandon", { firm_id: user.firm_id });
  }

  return c.json({ ok: true });
}

export async function handleSession(c: Context): Promise<Response> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) {
    return c.json({ ok: false, authenticated: false }, 401);
  }

  const tokenHash = sha256(token);
  const result = await getPool().query<{
    user_id: string;
    firm_id: string;
    email: string;
  }>(
    `SELECT s.user_id, s.firm_id, u.email
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
     LIMIT 1`,
    [tokenHash],
  );

  const row = result.rows[0];
  if (!row) {
    return c.json({ ok: false, authenticated: false }, 401);
  }

  log("auth.session", { outcome: "valid", firm_id: row.firm_id });
  return c.json({
    ok: true,
    authenticated: true,
    user: { id: row.user_id, firmId: row.firm_id, email: row.email },
  });
}

export async function handleLogout(c: Context): Promise<Response> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    const tokenHash = sha256(token);
    await getPool().query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  log("auth.session", { outcome: "logout" });
  return c.json({ ok: true });
}
