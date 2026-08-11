/**
 * Vercel Node bridge that avoids @hono/node-server/vercel body-stream hangs.
 *
 * With helpers / Fluid, the IncomingMessage body stream can already be drained
 * (or never emit) when Hono tries c.req.json() — POST then 504s. Buffer the
 * body ourselves and call app.fetch with a standard Request.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Hono } from "hono";

function readBody(req: IncomingMessage): Promise<Buffer> {
  // Vercel helpers may already populate req.body — prefer that over a dead stream.
  const prefilled = (req as IncomingMessage & { body?: unknown }).body;
  if (prefilled !== undefined && prefilled !== null) {
    if (Buffer.isBuffer(prefilled)) return Promise.resolve(prefilled);
    if (typeof prefilled === "string") return Promise.resolve(Buffer.from(prefilled));
    return Promise.resolve(Buffer.from(JSON.stringify(prefilled)));
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

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

export function createVercelFetchHandler(app: Hono, base: string) {
  return async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    restoreNestedPath(req, base);

    const host = req.headers.host ?? "localhost";
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const url = new URL(req.url ?? base, `${proto}://${host}`);

    const method = (req.method ?? "GET").toUpperCase();
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }

    let body: Buffer | undefined;
    if (method !== "GET" && method !== "HEAD") {
      body = await readBody(req);
      // Empty body → omit so Request construction stays valid.
      if (body.length === 0) body = undefined;
    }

    const request = new Request(url, {
      method,
      headers,
      body: body as BodyInit | undefined,
      // @ts-expect-error duplex required when streaming body in undici/node
      duplex: body ? "half" : undefined,
    });

    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      // Node forbids setting some hop-by-hop headers; setHeader is fine for Set-Cookie multiples via append.
      if (key.toLowerCase() === "set-cookie") {
        const existing = res.getHeader("set-cookie");
        if (!existing) res.setHeader("set-cookie", value);
        else if (Array.isArray(existing)) res.setHeader("set-cookie", [...existing, value]);
        else res.setHeader("set-cookie", [String(existing), value]);
        return;
      }
      res.setHeader(key, value);
    });

    if (!response.body) {
      res.end();
      return;
    }

    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  };
}
