import { Hono } from "hono";
import { createCorsMiddleware } from "./cors.ts";
import { log } from "./logger.ts";
import {
  handleAccessIssue,
  handleAccessRedeem,
  handleLogout,
  handleOtpAbandon,
  handleOtpSend,
  handleOtpVerify,
  handleSession,
} from "./routes.ts";
import {
  handleRegisterLock,
  handleRegisterStatus,
  handleRegisterUnlock,
} from "./registerRoutes.ts";

function envSnapshot() {
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}

function mountAuthRoutes(base: Hono): void {
  base.get("/health", (c) =>
    c.json({ ok: true, service: "tower-auth", ...envSnapshot() }),
  );

  base.post("/otp/send", handleOtpSend);
  base.post("/otp/verify", handleOtpVerify);
  base.post("/otp/abandon", handleOtpAbandon);
  base.post("/access/issue", handleAccessIssue);
  base.post("/access/redeem", handleAccessRedeem);
  base.get("/session", handleSession);
  base.post("/logout", handleLogout);

  base.get("/register/status", handleRegisterStatus);
  base.post("/register/unlock", handleRegisterUnlock);
  base.post("/register/lock", handleRegisterLock);
}

export function createAuthApp(): Hono {
  const app = new Hono();

  app.use("*", createCorsMiddleware());

  const authRoutes = new Hono();
  mountAuthRoutes(authRoutes);

  // Same-origin SPA: /auth/*
  app.route("/auth", authRoutes);
  // Vercel rewrite target: /api/auth/*
  app.route("/api/auth", authRoutes);

  // Wire stays on api/wire only — do not mount here (Twilio bundle crashed
  // the auth serverless function on Vercel cold start).

  // Local / root health without /auth prefix
  app.get("/health", (c) =>
    c.json({ ok: true, service: "tower-auth", ...envSnapshot() }),
  );
  app.get("/api/auth/health", (c) =>
    c.json({ ok: true, service: "tower-auth", ...envSnapshot() }),
  );

  app.onError((err, c) => {
    console.error("auth.app.error", err);
    return c.json({ ok: false, error: String(err), ...envSnapshot() }, 500);
  });

  return app;
}

export const app = createAuthApp();

log("auth.app.ready", { routes: ["/auth/*", "/api/auth/*"] });
