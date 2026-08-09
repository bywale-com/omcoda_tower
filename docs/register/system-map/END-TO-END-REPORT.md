# END-TO-END REPORT — materialize + wire

**Branch:** `cursor/materialize-machine-wire-6565`  
**Definition of done:** Phase 4 five steps on real Postgres, cutover from stand-ins, faceless reference cascade without deploy.

## Cutover

| Path | Default | Notes |
|---|---|---|
| `VITE_WIRE_REAL` | **true** (`vite.config.ts` define) | Real machine ports hit `/wire/machine/*` |
| Client port | `wirePorts.machineApi` | real → Postgres via wire service |
| Backend | `server/wire-service/machine.ts` | Mounted on `/wire` + `/api/wire` |

## Phase 4 checklist — PROVED on Session-pooler Postgres

| # | Step | Status | Evidence |
|---|---|---|---|
| 1 | Provision firm + user + session | ✅ | Auth tables + `campaign_states=running` for `firm-cedar` (seed 002) |
| 2 | Import → Audit → `reachability_verdict` + `sequence_ready` | ✅ | `POST /wire/machine/audit-runs` + `verify:machine` wrote verdicts/ready |
| 3 | Onboarding on `campaign_state=running` → opt-in enrollments | ✅ | `POST /wire/machine/onboarding/fire` → `tpl.optin_launch.v1` enrollments (**send dry-run**) |
| 4 | `reference_version` row edit → faceless cascade → enrollment | ✅ | `POST /wire/machine/reference` cutoff change → eligibility → signal → motion → `tpl.reactivation.v1` enrollment — **no code deploy** |
| 5 | Board reads eligibility; Activate draft→active; Runs from `workflow_run` | ✅ | `GET /wire/machine/board` returns results; Activate returned `transition: draft→active`; run id written |

### Commands that passed

```bash
npm run db:migrate   # 001–004
npm run db:seed      # 002_machine_tables applied
npm run verify:machine
# + live HTTP against npm run dev:auth (:3001)
```

### Live HTTP proof (sample)

- `GET /wire/machine/health` → `machineTables: true`
- Create workflow → status `draft`
- Activate → `{"status":"active","transition":"draft→active"}`
- Start run → `workflow_run` `running`
- Reference upsert → cascade enrollment `tpl.reactivation.v1`
- Onboarding fire → opt-in enrollments
- Board → eligibility_results + signals + motion_decisions

## Dry-run / stubbed (with reason)

| Item | Reason |
|---|---|
| Sequence send from enrollment cascade | Cascade sets `payload.dryRun=true`; live Resend/Twilio stay on `/wire/send/*` |
| Background cron for criteria windows | Faceless path is reference/writeback API (no poller) |
| Full clientList swap from `contact_records` | Board overlays detections; mock chrome remains |
| Auth UUID ↔ CT TEXT firm unify | Machine uses TEXT `firm-cedar` |

## Schema fix during apply

RLS loop initially included `action`, which has no `firm_id`. Fixed to `action_via_workflow` join policy in `004_machine_tables.sql`.

## Artifacts

- [`FROZEN-TABLES-v1.md`](./FROZEN-TABLES-v1.md)
- [`RECONCILIATION-v1.md`](./RECONCILIATION-v1.md)
- [`SCHEMA-REPORT.md`](./SCHEMA-REPORT.md)
- [`V2-BACKLOG.md`](./V2-BACKLOG.md)
- Verify: `npm run verify:machine`
