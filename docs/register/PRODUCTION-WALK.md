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

Alternative: persistent `npm run worker` on Fly/Railway/Docker (`docker-compose.worker.yml`), or upgrade Vercel to Pro for `* * * * *`.

**Repo secret required:** GitHub → Settings → Secrets → Actions → `CRON_SECRET` (same value as Vercel Production).

**Proof status:** tick endpoint + GHA host wired; **unattended prod escalation pending** green `/wire/health` + first successful `prod-tick` run.

---

## Gap 0 — API 500 (blocker)

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
5. **esbuild pre-bundle** (`npm run build:api` via `build:vercel`): Vercel’s tracer did not ship `server/**`, so cold start threw `Cannot find module '/var/task/server/…/app'`. Thin `api/*/[[...path]].ts` re-exports `api/*/_handler.js` with `server/**` inlined.

### Human step required (Vercel dashboard)

Set Production env (see portal action): especially **`NODEJS_HELPERS=0`**, `DATABASE_URL`, ESP keys, `SEND_MODE=dry_run`, `CRON_SECRET`. Redeploy.

**After redeploy, prove:**

```bash
curl -sS https://omcoda-tower.vercel.app/api/ping
curl -sS https://omcoda-tower.vercel.app/wire/health
curl -sS https://omcoda-tower.vercel.app/auth/health
# expect JSON ok:true — not FUNCTION_INVOCATION_FAILED
```

---

## Firm-binding (Gap 2)

Merged into this branch from #68. Session path grep-clean of hardcoded `firm-cedar` defaults; provision mints one UUID into auth+CT; Contacts show session firm book.

**Local Postgres proof:** `npm run verify:firm-binding` — six-step × two firms PASS (see `FIRM-BINDING.md`).

**Live URL 11-step:** blocked until Gap 0 health is green on Production.

---

## Env (Gap 3)

| Host | Required |
|------|----------|
| Vercel Production | `DATABASE_URL`, Resend/Twilio, `SEND_MODE` (empty→dry_run), `SEND_TEST_COHORT`, `NODEJS_HELPERS=0`, `CRON_SECRET` |
| Worker | Same DB — via Vercel Cron (no separate host) |

Fail-closed: empty cohort → no live sends; missing `SEND_MODE` → dry_run.

---

## 11-step acceptance ledger

| # | Step | Status |
|---|------|--------|
| 1–11 | Live provision → login → empty book → upload → bind → outreach → two firms | **open** — waiting Gap 0 green on Production |
| + | Worker unattended escalate on prod | **open** — cron wired; prove after health green |

**Nothing marked done without the live-URL walk.**
