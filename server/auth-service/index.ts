import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { log } from "./logger.ts";

const port = Number(process.env.AUTH_SERVICE_PORT ?? 3001);

log("auth.service.start", { port });

serve({ fetch: app.fetch, port }, (info) => {
  log("auth.service.listening", { port: info.port });
});
