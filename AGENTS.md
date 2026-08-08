# AGENTS.md

## Cursor Cloud specific instructions

Tower is a single-product Vite + React 18 + TypeScript SPA (the "board → client → engagement chart" prototype). It has an optional Hono backend (auth + "wire" services) that only matters for the real-data path. Standard commands live in `package.json` `scripts` and `README.md`; don't duplicate them here.

### Running the product (frontend only — the default, no secrets needed)

- The dependency install runs automatically on startup (see update script). Then start the SPA with `npm run dev` (Vite, port `5173`). This serves the entire product with mock data / in-browser "stand-ins".
- A gitignored `.env` is used for local dev. The key non-obvious flag is `VITE_WIRE_REAL`: it **defaults to `true`**, which makes the client call `/wire`, proxied by Vite to the backend on `localhost:3001`. If that backend isn't running, wire calls fail. To run the SPA fully standalone, set `VITE_WIRE_REAL=false` in `.env` so it uses in-browser stand-ins. `VITE_AUTH_DISABLED=true` (the default) skips the login gate.
- Client build flags (`VITE_AUTH_DISABLED`, `VITE_REGISTER_ENABLED`, `VITE_WIRE_REAL`) are also hard-coded with defaults in `vite.config.ts` via `define`, so they apply even without a `.env`.
- There is a second isolated document served at `/prototype-ant` (an Ant Design translation MPA) — see the `prototype-ant-mpa` middleware in `vite.config.ts`.

### Backend / real-data path (optional — requires external secrets)

- Start with `npm run dev:auth` (Hono via `tsx`, port `3001`). Locally this single process mounts BOTH the auth routes and the wire routes (`/wire`, `/api/wire`); on Vercel they split into two serverless functions under `api/`.
- The backend needs a `.env` (it's launched with `tsx --env-file=.env`). DB-backed routes throw `"DATABASE_URL is required"` if `DATABASE_URL` (Supabase Postgres) is unset. Real email/SMS need `RESEND_*` / `TWILIO_*`; otherwise stand-in mailer/SMS are used. See `.env.example` and `.env.sandbox.example`.
- DB setup (only for the real path): `npm run db:migrate` then `npm run db:seed` (both use `--env-file=.env`, apply SQL under `supabase/migrations/` and `supabase/seeds/`).

### Lint / test / typecheck

- There is **no** lint, test, or typecheck tooling configured (no ESLint/Prettier, no Vitest/Jest/Playwright, no `test`/`lint` npm scripts). TypeScript is not a dependency — `tsc` is not available, and there is no `typecheck` script. The only build/verify command is `npm run build` (`vite build`).
- Testing is effectively manual/agent-driven via the running SPA.
