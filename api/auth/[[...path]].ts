/**
 * Vercel Node serverless entry for /api/auth/* (and rewritten /auth/*).
 * Keep free of wire-service imports (Twilio). Use Node handler, not Edge.
 */
import { handle } from "@hono/node-server/vercel";
import { app } from "../../server/auth-service/app";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 10,
};

export default handle(app);
