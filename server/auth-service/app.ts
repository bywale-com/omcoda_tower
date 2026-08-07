import { Hono } from "hono";
import { createCorsMiddleware } from "./cors.ts";
import { log } from "./logger.ts";
import {
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
import { createWireRoutes } from "../wire-service/routes.ts";

function mountAuthRoutes(base: Hono): void {
  base.get("/health", (c) => c.json({ ok: true, service: "tower-auth" }));

  base.post("/otp/send", handleOtpSend);
  base.post("/otp/verify", handleOtpVerify);
  base.post("/otp/abandon", handleOtpAbandon);
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

  // Wire cutover routes on same local process (Vercel also has api/wire)
  const wireRoutes = createWireRoutes();
  app.route("/wire", wireRoutes);
  app.route("/api/wire", wireRoutes);

  // Local dev health without /auth prefix
  app.get("/health", (c) => c.json({ ok: true, service: "tower-auth" }));

  return app;
}

export const app = createAuthApp();

log("auth.app.ready", { routes: ["/auth/*", "/api/auth/*"] });
