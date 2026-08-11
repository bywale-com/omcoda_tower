/**
 * Vercel Node serverless entry for /api/wire/* (and rewritten /wire/*).
 * Bundled into dist-api/wire.js.
 */
import { app } from "../../server/wire-service/app";
import { createVercelFetchHandler } from "./fetchBridge";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default createVercelFetchHandler(app, "/api/wire");
