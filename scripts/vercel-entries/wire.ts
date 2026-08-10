/**
 * Vercel Node serverless entry for /api/wire/* (and rewritten /wire/*).
 * Bundled by scripts/bundle-vercel-api.mjs into api/wire/_handler.js.
 * Must use @hono/node-server/vercel — hono/vercel is Edge/Fetch-shaped and
 * crashes Node runtime with FUNCTION_INVOCATION_FAILED.
 */
import { handle } from "@hono/node-server/vercel";
import { app } from "../../server/wire-service/app";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 15,
};

export default handle(app);
