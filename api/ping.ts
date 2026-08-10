/**
 * Minimal Production diagnostic — no Hono, no DB.
 * GET /api/ping → { ok, hasDatabaseUrl, nodeEnv } (no secret values).
 */
import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      ok: true,
      service: "tower-ping",
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
      hasResend: Boolean(process.env.RESEND_API_KEY?.trim()),
      sendMode: (process.env.SEND_MODE ?? "").trim() || "(unset→dry_run)",
      nodeEnv: process.env.NODE_ENV ?? null,
      nodejsHelpers: process.env.NODEJS_HELPERS ?? null,
    }),
  );
}
