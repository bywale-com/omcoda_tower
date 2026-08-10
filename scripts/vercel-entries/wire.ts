/**
 * Vercel Node serverless entry for /api/wire/* (and rewritten /wire/*).
 * Bundled into dist-api/wire.js. Nested paths are rewritten to /api/wire?path=…
 * by vercel.json — restore the pathname before Hono routing.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { handle } from "@hono/node-server/vercel";
import { app } from "../../server/wire-service/app";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
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
  restoreNestedPath(req, "/api/wire");
  return hono(req, res);
}
