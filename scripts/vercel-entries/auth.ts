/**
 * Vercel Node serverless entry for /api/auth/* (and rewritten /auth/*).
 * Bundled into dist-api/auth.js.
 */
import { app } from "../../server/auth-service/app";
import { createVercelFetchHandler } from "./fetchBridge";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default createVercelFetchHandler(app, "/api/auth");
