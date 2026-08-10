import { cors } from "hono/cors";

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? "";
  const fromEnv = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;

  const publicApp = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  const defaults: string[] = [];
  if (publicApp) defaults.push(publicApp);
  // Production SPA on Vercel (same-origin /wire calls still send Origin)
  defaults.push("https://omcoda-tower.vercel.app");

  if (process.env.NODE_ENV !== "production") {
    defaults.push("http://localhost:5173", "http://127.0.0.1:5173");
  }
  return defaults;
}

export function createCorsMiddleware() {
  const allowed = parseAllowedOrigins();

  return cors({
    origin: (origin) => {
      if (!origin) {
        // non-browser / same-origin health probes
        return allowed[0] ?? "*";
      }
      if (allowed.includes(origin)) return origin;
      // Preview deployments: https://omcoda-tower-*-wale-omotayos-projects.vercel.app
      if (/^https:\/\/omcoda-tower[a-z0-9-]*\.vercel\.app$/i.test(origin)) return origin;
      return null;
    },
    credentials: true,
  });
}
