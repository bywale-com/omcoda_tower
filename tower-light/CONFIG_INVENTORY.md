# CONFIG_INVENTORY

Package management, build, TypeScript, environment, tooling, execution, and application architecture patterns that are not a single syntax node.

## Config

| ID | Name | Form | Location | Purpose | Mechanism | Stage |
|---|---|---|---|---|---|---|
| `CFG-package-scripts` | package.json scripts as entry points | `"dev": "vite"` | package.json | Multiple processes: Vite, auth+wire, worker, migrate, seed, verify. | npm run X → node/tsx/vite. | BIT-13 |
| `CFG-tsx-env-file` | tsx --env-file=.env | `tsx --env-file=.env server/...` | package.json | Load env into a TS process without bundling. | tsx CLI; not an import. | BIT-13 |
| `CFG-type-module` | "type": "module" | `"type": "module"` | package.json | Treat .js as ESM. | Node + Vite. | BIT-13 |
| `CFG-tsconfig` | tsconfig strict ESM bundler | `"strict": true, "noEmit": true` | tsconfig.json | Checker settings; noEmit. | target ES2022, moduleResolution bundler, strict. | BIT-5 |
| `CFG-vite-proxy` | Vite proxy /auth /wire | `server.proxy['/wire']` | vite.config.ts:68 | Browser same-origin; server on :3001. | http-proxy in vite server.proxy. | BIT-11 |
| `CFG-vite-alias` | path alias @ → src | `'@': path.resolve(..., './src')` | vite.config.ts:85 | Short imports. | `resolve.alias`. | BIT-13 |
| `CFG-vite-define` | vite define client flags | `define: { import.meta.env.VITE_WIRE_REAL }` | vite.config.ts:51 | Force VITE_* into the bundle. | `define: { 'import.meta.env.VITE_...' }`. | BIT-13 |
| `CFG-vite-mpa` | Vite multi-page input | `input: { main, 'prototype-ant' }` | vite.config.ts:96 | Two HTML entries, two bundles. | rollupOptions.input. | BIT-21 |
| `CFG-vercel-rewrites` | Vercel rewrites | `/prototype-ant` → prototype-ant.html; `/wire` → /api/wire | vercel.json | SPA + API + Ant MPA on one host. | vercel.json rewrites + functions + cron. | BIT-21 |
| `CFG-vercel-cron` | Vercel cron tick | `crons: [{ path: "/api/wire/machine/tick" }]` | vercel.json:20 | HTTP tick when no long worker. | GET /api/wire/machine/tick daily (plus GH every 5 min). | BIT-15 |
| `CFG-docker-worker` | Docker Compose worker | Dockerfile.worker | Dockerfile.worker | Long-lived tick process. | docker-compose.worker.yml + Dockerfile.worker. | BIT-15 |
| `CFG-ci-ship` | GitHub Actions + Postgres service | `services: postgres:16` | .github/workflows/ship.yml | CI proves migrate/seed/verify/build. | postgres:16 service; npm ci; db:migrate; verify; build. | BIT-20 |
| `CFG-env-database-url` | DATABASE_URL | `DATABASE_URL=` | .env.example | Postgres connection string (URL-encode $). | pg Pool. | BIT-12 |
| `CFG-env-send-mode` | SEND_MODE fail-closed | `SEND_MODE` default dry_run | .env.example | Missing → dry_run; live needs cohort. | bootEnv.ts. | BIT-18 |
| `CFG-env-auth-disabled` | VITE_AUTH_DISABLED / AUTH_DISABLED | `VITE_AUTH_DISABLED=true` | vite.config.ts | Skip login gate in craft. | Vite define + server. | BIT-14 |
| `CFG-gitignore-env` | .gitignore secrets | `.env` gitignored | .gitignore | .env not committed; examples are. | !.env.example | BIT-13 |
| `CFG-pnpm-workspace` | pnpm-workspace (single package) | `packages: ['.']` | pnpm-workspace.yaml | Workspace file present with '.' only. | Not a real multi-package repo. | EXCLUDE-monorepo |

## Architecture patterns

| ID | Name | Form | Location | Purpose | Mechanism | Stage |
|---|---|---|---|---|---|---|
| `HTML-dual-document` | dual HTML documents (MPA isolation) | `prototype-ant.html` + `index.html` | `vite.config.ts:96` | Two product faces that must not share CSS/JS entry. | index.html → main.tsx (Hub); prototype-ant.html → main-prototype-ant.tsx; Vite rollup input + middleware rewrite. | BIT-21 |
| `ARCH-standin-vs-real` | stand-in vs real ports | `wireRealEnabled()` | src/app/wire/registry.ts | Same client ports; swap implementations with a flag. | registry.ts: VITE_WIRE_REAL chooses reals/* or standins/*. | BIT-11 |
| `ARCH-session-firm` | session cookie binds firm | `requireSessionFirm(c)` | server/wire-service/sessionFirm.ts | No demo-tenant default on the write path. | getCookie → sessions.token_hash → firm_id; x-firm-id must match. | BIT-14 |
| `ARCH-credentials-include` | fetch credentials: include | `credentials: "include"` | src/app/wire/http.ts:12 | Send cookies to same-origin API. | browser fetch option. | BIT-14 |
| `ARCH-write-set` | write-set after a step | `chainWrites` / `previousWrites` | server/wire-service/workflowWalk.ts | Later steps see every write that run made — not a hard-coded field catalog. | WalkContext.chainWrites; client authoredNodeOutputs. | BIT-16 |
| `ARCH-workflow-walk` | validated workflow walk | `walkValidatedWorkflow` | server/wire-service/workflowWalk.ts | Graph in JSONB walked by a single walker (015). | walkValidatedWorkflow; until-node / configured-break. | BIT-16 |
| `ARCH-worker-tick` | time path vs event path | `tickOnce` | server/wire-service/cascade.ts | Events walk immediately; time escalations tick. | worker.ts setInterval → tickOnce; also HTTP /machine/tick and cron. | BIT-15 |
| `ARCH-two-id-grains` | UUID firms vs TEXT firm_id | `firms.id UUID` vs `firm_id TEXT` | supabase/migrations/001 vs 003 | Auth tables UUID; CT/machine TEXT (firm-cedar). | Two identifier schemes in one product. | GAP-two-grains |
| `ARCH-data-in-tables` | desk shows the query | seeds + SELECT | supabase/seeds | Empty table → empty desk. No painted rows in React. | Seeds populate; UI maps query results. | BIT-12 |
| `ARCH-boot-env` | boot assertions | `assertBootEnv` | server/wire-service/bootEnv.ts | Process refuses to start without required env. | assertBootEnv('api'\|'worker'). | BIT-13 |
| `ARCH-verify-scripts` | verify scripts instead of unit runner | `tsx scripts/verify-*.ts` | package.json | No Vitest/Jest; tsx scripts against real Postgres. | npm run verify:*. | BIT-20 |
| `ARCH-wire-http-prefix` | same app, two prefixes | `app.route("/wire")` + `app.route("/api/wire")` | server/auth-service/index.ts | Local: /wire and /api/wire on one process. Vercel: split bundles. | app.route both prefixes. | BIT-11 |

## Execution entry points (Tower package.json)

| Script | Construction |
|---|---|
| `dev` | Vite dev server (BIT-13) |
| `dev:auth` | tsx + Hono on :3001, mounts /wire and /api/wire (BIT-11) |
| `build` / `build:vercel` | Vite MPA + esbuild API bundles (BIT-21) |
| `db:migrate` / `db:seed` | sequential SQL + manifest seeds (BIT-12) |
| `worker` / `worker:once` | setInterval tick (BIT-15) |
| `verify:*` | integration scripts, not a unit runner (BIT-20) |

