import { Hono } from "hono";
import { createCorsMiddleware } from "../auth-service/cors.ts";
import { createWireRoutes } from "./routes.ts";

function envSnapshot() {
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    hasResend: Boolean(process.env.RESEND_API_KEY?.trim()),
    sendMode: (process.env.SEND_MODE ?? "").trim() || "(unset→dry_run)",
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}

export function createWireApp(): Hono {
  const app = new Hono();
  app.use("*", createCorsMiddleware());

  // Health before heavy routes — always JSON, never throw on missing secrets.
  const health = (c: { json: (body: unknown, status?: number) => Response }) =>
    c.json({ ok: true, service: "tower-wire", ...envSnapshot() });
  app.get("/health", health);
  app.get("/api/wire/health", health);
  app.get("/wire/health", health);

  const wire = createWireRoutes();
  app.route("/wire", wire);
  app.route("/api/wire", wire);

  app.onError((err, c) => {
    console.error("wire.app.error", err);
    return c.json({ ok: false, error: String(err), ...envSnapshot() }, 500);
  });

  return app;
}

export const app = createWireApp();
