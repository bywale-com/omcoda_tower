/**
 * Vercel Node serverless entry for /api/auth/* (and rewritten /auth/*).
 * Bundled into dist-api/auth.js. Nested paths are rewritten to /api/auth?path=…
 * by vercel.json — restore the pathname before Hono routing.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { handle } from "@hono/node-server/vercel";
import { app } from "../../server/auth-service/app";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 10,
};

const hono = handle(app);

function restoreNestedPath(req: IncomingMessage, base: string): void {
  const raw = req.url ?? "/";
  const url = new URL(raw, "http://n");
  const nested = url.searchParams.get("path");
  if (!nested) return;
  url.searchParams.delete("path");
  const suffix = nested
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  url.pathname = suffix ? `${base}/${suffix}` : base;
  req.url = url.pathname + url.search;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  restoreNestedPath(req, "/api/auth");
  return hono(req, res);
}
