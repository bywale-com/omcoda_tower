# PRODUCTION-WALK

**Branch:** `cursor/production-walk-6565`  
**Date:** 2026-08-10  
**Deferred:** Escrow · Meta  

**Done bar:** Wale opens the production URL, provisions his firm, logs in as that consultant, lands in its empty book, uploads a list, operator turns on a sequence, outreach runs, escalation fires unattended, two firms stay separate — **on the live URL**.

---

## Live URLs

| Role | URL |
|------|-----|
| App (operator + consultant CT) | `https://omcoda-tower.vercel.app/` → `/prototype-ant` |
| Operator desk | `https://omcoda-tower.vercel.app/prototype-ant` (Operator scene) |
| Consultant invite (generated at provision) | `https://omcoda-tower.vercel.app/login?tenancy=assisted&email=<provisioned-email>` |
| Diagnostics | `https://omcoda-tower.vercel.app/api/ping` |
| API health | `https://omcoda-tower.vercel.app/wire/health` · `/auth/health` |

---

## Worker host (Gap 1)

**Where (Hobby-compatible):** **GitHub Actions** workflow [`prod-tick.yml`](../../.github/workflows/prod-tick.yml) — every **5 minutes** `GET https://omcoda-tower.vercel.app/api/wire/machine/tick` with `CRON_SECRET`.

Same Postgres as the API. No second vendor. Vercel Hobby only allows **daily** crons, so minute/5-minute cadence cannot live in `vercel.json` (daily cron kept as a backup at 12:00 UTC).

**Repo secret required:** GitHub → Settings → Secrets → Actions → `CRON_SECRET` — **must match** Vercel Production (rotated 2026-08-10 during Gap 0; re-copy from Vercel if the workflow 401s).

**Proof:** Live `GET /api/wire/machine/tick` with Bearer → `ok:true`, `host: vercel-cron-or-manual`, `scanned≥0`, gate `dry_run`. Workflow file is on this branch; schedule runs after merge to `main`.

---

## Gap 0 — API 500 (blocker) — CLOSED

### Reality before this PR

| Probe | Result |
|-------|--------|
| `GET https://omcoda-tower.vercel.app/` | 200 |
| `GET …/wire/health` | **500 FUNCTION_INVOCATION_FAILED** |
| `GET …/auth/health` | **500 FUNCTION_INVOCATION_FAILED** |

### Fix in this PR

1. Switch API handlers from `hono/vercel` (Edge/Fetch) → **`@hono/node-server/vercel`** (Node `(req,res)` — required for `pg`).
2. Disable Vercel body parser (`bodyParser: false`).
3. Health returns env snapshot JSON (no throw); `/api/ping` diagnostic with no Hono.
4. CORS allows production SPA + preview hosts.
5. **esbuild pre-bundle** (`npm run build:api` via `build:vercel`): Vercel’s tracer did not ship `server/**`, so cold start threw `Cannot find module '/var/task/server/…/app'`. Handlers are `dist-api/{wire,auth}.js` with `server/**` inlined; thin `api/wire.ts` / `api/auth.ts` re-export them.
6. **Nested path routing:** non-Next catch-all `api/wire/[[...path]]` only matched **one** segment (multi-segment → edge `NOT_FOUND`). Rewrites send `/api/wire/:path*` → `/api/wire` (and auth likewise); entry restores `?path=` into the pathname for Hono.
7. Production auth bypass off: `AUTH_DISABLED=false`, `VITE_AUTH_DISABLED=false`; removed `DEV_SESSION_FIRM` / `VITE_DEV_FIRM_ID` from Production so unauthenticated calls cannot land on Cedar.

### Proved on Production (2026-08-10)

```bash
curl -sS https://omcoda-tower.vercel.app/api/ping
curl -sS https://omcoda-tower.vercel.app/wire/health
curl -sS https://omcoda-tower.vercel.app/auth/health
curl -sS https://omcoda-tower.vercel.app/api/wire/machine/health
# all JSON ok:true
```

---

## Firm-binding (Gap 2)

Merged into this branch from #68. Session path grep-clean of hardcoded `firm-cedar` defaults; provision mints one UUID into auth+CT; Contacts show session firm book.

**Local Postgres proof:** `npm run verify:firm-binding` — six-step × two firms PASS (see `FIRM-BINDING.md`).

**Live URL proof:** `npx tsx --env-file=.env scripts/verify-production-walk.ts` — PASS (below).

---

## Env (Gap 3)

| Host | Required |
|------|----------|
| Vercel Production | `DATABASE_URL`, Resend/Twilio, `SEND_MODE=dry_run`, `SEND_TEST_COHORT`, `NODEJS_HELPERS=0`, `CRON_SECRET`, `AUTH_DISABLED=false`, `VITE_AUTH_DISABLED=false` |
| Worker | Same DB — via GHA `prod-tick` + daily Vercel cron backup |

Fail-closed: empty cohort → no live sends; missing `SEND_MODE` → dry_run.

---

## 11-step acceptance ledger (live URL)

Script: `scripts/verify-production-walk.ts` against `https://omcoda-tower.vercel.app` (OTP code minted in shared Postgres — Resend rejects `@example.test`; session verify still hits live `/api/auth/otp/verify`).

| # | Step | Status |
|---|------|--------|
| 1 | Provision firm A on live API | **PASS** `887b167a-6526-4eb1-be2d-66baf76d9233` |
| 2 | Login → session firm = provisioned | **PASS** |
| 3 | Empty book (not Cedar) | **PASS** |
| 4 | Upload list → `contact_records` for that firm | **PASS** `c-prod-6833f391` |
| 5 | Bind sequence + campaign `running` | **PASS** |
| 6 | Outreach / enrollment (dry_run gate) | **PASS** `enr-412c339d-…` |
| 7–11 | Firm B same walk + isolation | **PASS** `2b5ce756-…` / `enr-3088e6cb-…`; A cannot see B; not Cedar |
| + | Health + machine tick on prod | **PASS** |
| + | GHA unattended schedule | **wired** — runs after `prod-tick.yml` is on `main`; secret must match Vercel |

**Escrow · Meta remain deferred.**
