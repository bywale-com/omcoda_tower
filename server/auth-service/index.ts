import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { log } from "./logger.ts";

const port = Number(process.env.AUTH_SERVICE_PORT ?? 3001);

// Local single process: mount /wire for Vite proxy (Vercel uses api/wire separately).
const { createWireRoutes } = await import("../wire-service/routes.ts");
const wire = createWireRoutes();
app.route("/wire", wire);
app.route("/api/wire", wire);

log("auth.service.start", { port, wireMounted: true });

serve({ fetch: app.fetch, port }, (info) => {
  log("auth.service.listening", { port: info.port });
});
