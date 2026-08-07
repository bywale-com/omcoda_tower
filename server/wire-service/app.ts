import { Hono } from "hono";
import { createCorsMiddleware } from "../auth-service/cors.ts";
import { createWireRoutes } from "./routes.ts";

export function createWireApp(): Hono {
  const app = new Hono();
  app.use("*", createCorsMiddleware());

  const wire = createWireRoutes();
  app.route("/wire", wire);
  app.route("/api/wire", wire);

  app.get("/health", (c) => c.json({ ok: true, service: "tower-wire" }));
  return app;
}

export const app = createWireApp();
