# DEPLOY-READINESS

**Branch:** `cursor/deploy-packaging-6565`  
**Date:** 2026-08-10  
**PR:** https://github.com/bywale-com/omcoda_tower/pull/67  
**Deferred (do not touch):** Escrow · Meta go-live  

**Done bar:** continuous worker unattended in the deploy target; firm scope from session only (wrong-tenant blocked); hosted CI re-runs the spine and blocks red; env fail-closed with one gated live send proven.

---

## 1. Continuous worker (unattended)

**How it runs in prod**

| Path | Command / unit |
|------|----------------|
| Docker Compose | `docker compose -f docker-compose.worker.yml up -d --build` |
| Dockerfile | `Dockerfile.worker` — `npx tsx server/wire-service/worker.ts` |
| systemd | `deploy/tower-tick-worker.service` |
| Local / node host | `npm run worker` (continuous). Smoke only: `npm run worker:once` |

- Interval: `WORKER_INTERVAL_MS` default **60000** (≤ attempt-window granularity).
- **Do not set `WORKER_ONCE` in the deploy target.**

**Proof — unattended escalation + no double-fire** (`npm run verify:continuous-worker` against Session-pooler Postgres)

| Step | Result |
|------|--------|
| Seed stale text attempt (no manual `tickOnce`) | PASS — `att-worker-d2c362dd` |
| Long-lived worker started (`intervalMs=5000`, not `WORKER_ONCE`) | PASS |
| Escalation on its own → owner=`email` | PASS — `fired_criteria.acr-text=2026-08-10T19:03:30.210Z` |
| Re-tick does not double-fire | PASS — fired_criteria unchanged |
| Worker log announces continuous mode | PASS |

---

## 2. Session firm (no demo-tenant default)

**Behavior**

- Server: `requireSessionFirm` — session cookie `firm_id`, or explicit `DEV_SESSION_FIRM` when `AUTH_DISABLED` (never a code constant).
- Client: `setActiveFirmId` from Auth session / `VITE_DEV_FIRM_ID` (explicit env only).
- Machine + `/wire/send/*` derive firm from session; wrong `x-firm-id` / `firmId` claim → **403**; missing session → **401**.

**Proof** (`npm run verify:session-firm`)

| Step | Result |
|------|--------|
| Two firms, two sessions — each sees only own `campaign_states` | PASS |
| Session A + `x-firm-id` B → 403 | PASS |
| No session (auth on, no cookie) → 401 | PASS |
| `AUTH_DISABLED` without `DEV_SESSION_FIRM` → 401 | PASS |
| Request-path grep: `machine.ts` + `reals/machineApi.ts` clean of `firm-cedar` | PASS |

**Grep note:** `firm-cedar` remains only as the **named seed tenant** / CT demo chrome / stand-in fixtures / verify scripts that target that seed — not as a session/request default. Server request path: **0** hits.

```bash
rg 'firm-cedar' server/wire-service/machine.ts src/app/wire/reals/machineApi.ts
# (no matches)
```

---

## 3. Hosted CI (gate on every push)

**Config:** [`.github/workflows/ship.yml`](../../.github/workflows/ship.yml)  
**Triggers:** push + PR to `main`  
**Runner:** ephemeral Postgres 16 → migrate → seed →:

- `verify:ship` (spine + deny gates, includes unset `SEND_MODE` → dry_run)
- `verify:affordances` (chosen-value round-trip / spine affordances)
- `verify:session-firm`
- `verify:boot-env`
- `verify:worker` with `VERIFY_LIVE_SEND=0` (no ESP blast in CI)
- `npm run build`

**Proof**

| Case | Result |
|------|--------|
| Deliberate broken affordance/spine step → exit **1** (red) | PASS — local mutation of `verify-ship-spine` `send-mode-default` → `EXIT:1`; deny gates not run |
| Clean tree → exit **0** (green) | PASS — `npm run verify:ship` + affordances on real Postgres |

Hosted Actions will enforce the same on every push/PR once this lands on `main` (branch protection should require the `ship` check).

---

## 4. Secrets / env (fail-closed)

**Set in deploy env (not code):** `DATABASE_URL`, Resend/Twilio keys, `SEND_MODE`, `SEND_TEST_COHORT`, plus `DEV_SESSION_FIRM` / `VITE_DEV_FIRM_ID` only when auth is disabled for a named tenant.

| Default / gate | Behavior |
|----------------|----------|
| Missing/empty `SEND_MODE` | **`dry_run`** |
| Empty `SEND_TEST_COHORT` | nobody live-sends |
| Missing `DATABASE_URL` | **hard fail at boot** |
| `SEND_MODE=live` without `RESEND_API_KEY` | **hard fail at boot** |
| `DEPLOY_STRICT=1` / `NODE_ENV=production` without Resend | **hard fail at boot** |
| Live posture | explicit `SEND_MODE=live` + non-empty allowlist |

**Proof — boot** (`npm run verify:boot-env`)

| Step | Result |
|------|--------|
| Unset/empty `SEND_MODE` → dry_run | PASS |
| Empty cohort → nobody live | PASS |
| Missing DB → boot refuse | PASS |
| Live without Resend key → boot refuse | PASS |
| dry_run without ESP keys boots (does not blast) | PASS |

**Proof — one gated live send** (`VERIFY_LIVE_SEND=1 npm run verify:worker`)

| Step | Result |
|------|--------|
| One allowlisted contact → real Resend + `messaging_events` | PASS — `messageId=f48824f5-80a3-4c26-9b6c-82c279eb99ba` / `evt-1786389227866-jexdb7` |
| Off-cohort under `SEND_MODE=live` stays dry-run | PASS |

---

## 5. Open / deferred

| Item | Tag | Spec-vs-app behind any “done” |
|------|-----|-------------------------------|
| Escrow | **deferred** | — |
| Meta go-live | **deferred** | — |
| Branch protection requiring `ship` check on GitHub | **open** | Workflow is green/red proven locally; enable required status check on `main` in repo settings |
| Auth UUID firm ↔ CT TEXT seed tenant unify | **open** | Session firm is session-derived; dual id shapes remain (seed `firm-cedar` TEXT vs auth UUID) — not a demo default |
| Stand-in / demo chrome still labels seed tenant `firm-cedar` | **open** (non-blocking) | Not on the real request path; real path grep-clean |

---

## Commands

```bash
# Deploy worker (continuous)
docker compose -f docker-compose.worker.yml up -d --build
# or: sudo systemctl enable --now tower-tick-worker

# Prove packaging locally (real Postgres + secrets in .env)
npm run verify:deploy          # ship + session-firm + boot-env + continuous-worker
npm run verify:affordances
VERIFY_LIVE_SEND=1 npm run verify:worker
npm run build
```

**No “done” without the spec-vs-app proof above.** Escrow and Meta stay deferred. Then it deploys.
