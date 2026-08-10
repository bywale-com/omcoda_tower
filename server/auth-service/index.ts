import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { log } from "./logger.ts";
import { assertBootEnv } from "../wire-service/bootEnv.ts";

assertBootEnv("api");

const port = Number(process.env.AUTH_SERVICE_PORT ?? 3001);

// Local single process: mount /wire for Vite proxy (Vercel uses api/wire separately).
const { createWireRoutes } = await import("../wire-service/routes.ts");
const wire = createWireRoutes();
app.route("/wire", wire);
app.route("/api/wire", wire);

log("auth.service.start", {
  port,
  wireMounted: true,
  sendMode: process.env.SEND_MODE || "(unset→dry_run)",
  authDisabled: process.env.AUTH_DISABLED ?? process.env.VITE_AUTH_DISABLED,
  devSessionFirm: Boolean(process.env.DEV_SESSION_FIRM?.trim()),
});

serve({ fetch: app.fetch, port }, (info) => {
  log("auth.service.listening", { port: info.port });
});
