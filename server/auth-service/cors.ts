import { cors } from "hono/cors";

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? "";
  if (raw.trim()) {
    return raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }

  return [];
}

export function createCorsMiddleware() {
  const allowed = parseAllowedOrigins();

  return cors({
    origin: (origin) => {
      if (!origin) {
        return allowed[0] ?? null;
      }
      return allowed.includes(origin) ? origin : null;
    },
    credentials: true,
  });
}
