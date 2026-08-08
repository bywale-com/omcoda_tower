# AGENTS.md

## Cursor Cloud specific instructions

Tower is a single-product Vite + React 18 + TypeScript SPA (the "board → client → engagement chart" prototype). It has an optional Hono backend (auth + "wire" services) that only matters for the real-data path. Standard commands live in `package.json` `scripts` and `README.md`; don't duplicate them here.

### Running the product (frontend only — the default, no secrets needed)

- The dependency install runs automatically on startup (see update script). Then start the SPA with `npm run dev` (Vite, port `5173`). This serves the entire product with mock data / in-browser "stand-ins".
- A gitignored `.env` is used for local dev. The key non-obvious flag is `VITE_WIRE_REAL`: it **defaults to `true`**, which makes the client call `/wire`, proxied by Vite to the backend on `localhost:3001`. If that backend isn't running, wire calls fail. To run the SPA fully standalone, set `VITE_WIRE_REAL=false` in `.env` so it uses in-browser stand-ins. `VITE_AUTH_DISABLED=true` (the default) skips the login gate.
- Client build flags (`VITE_AUTH_DISABLED`, `VITE_REGISTER_ENABLED`, `VITE_WIRE_REAL`) are also hard-coded with defaults in `vite.config.ts` via `define`, so they apply even without a `.env`.
- There is a second isolated document served at `/prototype-ant` (an Ant Design translation MPA) — see the `prototype-ant-mpa` middleware in `vite.config.ts`.

### Backend / real-data path (requires secrets in gitignored `.env`)

- Prefer Session-pooler `DATABASE_URL` (port 5432). **URL-encode `$` in the password as `%24`** or `tsx --env-file=.env` / Postgres auth will fail. Template: `.env.sandbox.example`.
- With real secrets present, run **both** `npm run dev:auth` (Hono on `3001`, mounts `/wire` + `/api/wire` locally) **and** `npm run dev` (Vite on `5173`). Vite proxies `/auth`, `/wire`, `/api/wire` → `:3001`. Restart Vite after changing `VITE_*` in `.env` (those flags are baked via `vite.config.ts` `define` at startup).
- One-time DB: `npm run db:migrate` then `npm run db:seed`. Seeded platform firm id is `a1000000-0000-4000-8000-000000000001` (see `supabase/seeds/manifest.json`).
- Probe real send (no contactId → skips consent/halt): `POST /wire/send/cem` and `POST /wire/send/sms` with that `firmId` plus `TEST_EMAIL_TO` / `TEST_SMS_TO`. Health: `GET /wire/health`, `GET /auth/health` (or `/health` on the auth process).

### Lint / test / typecheck

- There is **no** lint, test, or typecheck tooling configured (no ESLint/Prettier, no Vitest/Jest/Playwright, no `test`/`lint` npm scripts). TypeScript is not a dependency — `tsc` is not available, and there is no `typecheck` script. The only build/verify command is `npm run build` (`vite build`).
- Testing is effectively manual/agent-driven via the running SPA.
