# END-TO-END REPORT — materialize + wire

**Branch:** `cursor/materialize-machine-wire-6565`  
**Definition of done:** Phase 4 five steps on real Postgres, cutover from stand-ins, faceless reference cascade without deploy.

## Cutover

| Path | Default | Notes |
|---|---|---|
| `VITE_WIRE_REAL` | **true** (`vite.config.ts` define) | `.env` may set `false` for frontend-only Cloud Agents |
| Client port | `wirePorts.machineApi` | real → `/wire/machine/*`; stand-in → in-memory |
| Backend | `server/wire-service/machine.ts` | Mounted on `/wire` + `/api/wire` |

## Phase 4 checklist

| # | Step | Status | Evidence / blocker |
|---|---|---|---|
| 1 | Provision firm + user + session | ✅ already real | `001` auth tables + seed `001_tower_platform` |
| 2 | Import → Audit → `reachability_verdict` + `sequence_ready` | 🟡 wired | `AuditContext` → `POST /machine/audit-runs` writes contacts, verdicts, sequence_ready. **Needs `DATABASE_URL` + migrate/seed + `dev:auth` to prove on Postgres.** |
| 3 | Onboarding automation on `campaign_state=running` → opt-in enrollments | 🟡 wired | Seed sets `campaign_states=running`; `POST /machine/onboarding/fire` enrolls ready contacts via `firm_sequence_binding` → `tpl.optin_launch.v1`. **Send is dry-run** (`payload.dryRun=true`); live send uses existing `/wire/send/*`. |
| 4 | `reference_version` row edit → faceless cascade → enrollment | 🟡 wired | `POST /machine/reference` writes reference → eligibility_eval → result → signal → motion_decision → enrollment (reactivation binding). **No code deploy for cutoff change.** Blocked from live proof without Postgres. |
| 5 | Board shows eligibility; Activate draft→active; Runs from `workflow_run` | 🟡 wired | Board legend shows machine pass count; Launch → `activateWorkflow` (`draft→active`) + `workflow_run`; Runs tab merges remote runs. |

## What runs fully on real tables (when `DATABASE_URL` present)

Run: `npm run db:migrate && npm run db:seed && npm run verify:machine`

| Capability | Tables touched |
|---|---|
| Workflow create / activate / pause | `workflow`, `workflow_state`, `workflow_target` |
| Manual / Launch run | `workflow_run` |
| Audit run | `audit_runs`, `contact_records`, `reachability_verdicts`, `sequence_ready` |
| Onboarding fire | `campaign_states`, `firm_sequence_binding`, `enrollment` |
| Reference cascade | `reference_versions`, `eligibility_*`, `signals`, `motion_decisions`, `enrollment` |
| Board read | `eligibility_results`, `signals`, `motion_decisions`, `enrollment` |
| Templates | `sequence_template`, `firm_sequence_binding` |

## Dry-run / stubbed (with reason)

| Item | Reason |
|---|---|
| Sequence send from enrollment cascade | Keeps live Resend/Twilio on explicit `/wire/send/*` gate; cascade logs intent via `enrollment.payload.dryRun` |
| Background cron for criteria windows | No worker process; faceless path is reference/writeback API |
| Full clientList swap | Board chrome still mock; detections overlaid from machine tables |
| Auth UUID ↔ CT TEXT firm unify | Conservative dual tenancy; machine uses `firm-cedar` |

## Exact blockers in this Cloud Agent environment

1. **`DATABASE_URL` absent** from `.env` — cannot apply `004_machine_tables.sql` or seed `002_machine_tables`.  
   - Wire point: `scripts/run-migration.ts` / `scripts/run-seed.ts` / `server/wire-service/db.ts`  
2. Without DB: `npm run verify:machine` exits with blocker code; SPA still runs with stand-ins when `VITE_WIRE_REAL=false`.

## Artifacts

- [`FROZEN-TABLES-v1.md`](./FROZEN-TABLES-v1.md) — Phase 0 (+ Phase 1 append)
- [`RECONCILIATION-v1.md`](./RECONCILIATION-v1.md) — Phase 1 (4 modules)
- [`SCHEMA-REPORT.md`](./SCHEMA-REPORT.md) — Phase 2
- [`V2-BACKLOG.md`](./V2-BACKLOG.md) — deferred only
- Verify: `scripts/verify-machine-e2e.ts` (`npm run verify:machine`)
