# ACTUATION REPORT — tick worker + live-send cutover

**Branch:** `cursor/actuation-worker-send-6565`  
**Depends on:** machine tables (PR #60 / `004`), attempt criteria seed (`002_machine_tables`)

## Part A — Scheduled tick worker

### How to run

```bash
# continuous (default interval 60s)
npm run worker

# single tick
WORKER_ONCE=1 npm run worker
# or
npx tsx --env-file=.env server/wire-service/worker.ts --once

# ops/verify HTTP (same code path)
curl -X POST http://localhost:3001/wire/machine/tick
```

Env: `WORKER_INTERVAL_MS` (default `60000`), `DATABASE_URL` required.

### Behavior

1. Loads **enabled** rows from `rule_attempt_criteria` (thresholds from table — never hard-coded).
2. Loads channel ladder from `seq_channel_ownership_order`.
3. Scans `active_attempts` where `status='open'`.
4. Inbound override (`engagement_records` of `inbound_reply` / `form_visit` / `inbound_override`, or `state.inbound_override`) → **nullify** before escalate.
5. Due window → fire **once** (`fired_criteria[ruleId]=timestamp`), advance `owner_channel` forward-only (or return to head for form), write `engagement_records` + `workflow_run` on `wf-tick-{firmId}`.
6. Form clock: uses original `form_started_at` / `window_started_at` — re-entries do not reset.

Shared code: `server/wire-service/cascade.ts` (`tickOnce`, `escalateAttemptWindow`) — same primitives event path uses via `enrollAndActuate`.

### Prove

```bash
npm run db:migrate   # applies 005_actuation.sql
npm run verify:worker
```

Expect: stale text attempt (31 min) → `acr-text` fire → `owner_channel=email`; re-tick no double-fire; inbound nullify.

**Proved (Session-pooler):** `acr-text` 30 minutes from table → text→email; idempotent re-tick; inbound nullify; Resend live message recorded in `messaging_events` for cohort contact only.

---

## Part B — Live-send cutover (gated)

### Switch

| Env | Values | Default |
|---|---|---|
| `SEND_MODE` | `dry_run` \| `live` | **`dry_run`** |
| `SEND_TEST_COHORT` | comma-separated contact ids | empty (= nobody live) |

**Fail closed:** live only if `SEND_MODE=live` **and** contact ∈ cohort. Empty cohort or any other mode → dry-run. Misconfiguration never blasts the book.

### Flip to send one real message

```bash
# in .env (gitignored)
SEND_MODE=live
SEND_TEST_COHORT=actuate-live-<id>   # exact contact id
# TEST_EMAIL_TO / RESEND_* already set

npm run verify:worker   # sends one opt-in email to TEST_EMAIL_TO for the cohort contact
```

Or enroll via API after the contact is on the allowlist:

```bash
curl -X POST 'http://localhost:3001/wire/machine/enrollments?firmId=firm-cedar' \
  -H 'content-type: application/json' -H 'x-firm-id: firm-cedar' \
  -d '{"contactId":"<cohort-id>","agentRef":"tpl.optin_launch.v1","purpose":"opt-in"}'
```

### Path

`enrollAndActuate` / worker escalate → `dispatchEmail` / `dispatchSms` (gated) → `dispatchEmailLive` / `dispatchSmsLive` → Resend/Twilio → `outbound_messages` + `messaging_events`.

Consent / silence / halt checked in `dispatchSend.ts` before every live dispatch (opt-in purpose may proceed without prior consent basis; silenced always blocks).

HTTP `/wire/send/cem` and `/wire/send/sms` remain the explicit probe path (ungated by cohort — intentional CT probe).

### Prove

`verify:worker` asserts:
- `dry_run` → no live
- `live` + empty cohort → no live
- `live` + cohort contact → one Resend message + `messaging_events` row
- non-cohort contact under `live` → dry-run

---

## Schema

`supabase/migrations/005_actuation.sql`:
- `active_attempts.window_started_at`
- `active_attempts.fired_criteria` jsonb (idempotency)
- indexes for open attempts + inbound engagements

---

## Deferred → V2-BACKLOG

- Background host/cron packaging beyond `npm run worker` (systemd/Vercel cron)
- Full multi-step template cell scheduler (worker advances channel windows; cell calendar pacing is adjacent)
- Widening cohort via DB row UI (today: env list — editing env/row, no code change)
