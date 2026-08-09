# V2 BACKLOG — discovered after freeze, not acted on

This build does **not** implement these. Frozen list is closed.

| Item | Why deferred |
|---|---|
| System-map twin `state.halt` for `halt_records` | PG already exists; map id only |
| Internal Action catalog (non-`call_agent`) | Explicitly v2 per Phase 0 |
| Import → living book mutate control | Named-silent in Seed; missing-control noted in RECONCILIATION |
| Dual tenancy unify (auth UUID firms ↔ CT TEXT `firm-cedar`) | Conservative: keep both; machine tables use TEXT firm_id |
| Full Board clientList replacement from `contact_records` | Board overlays detections; mock list remains for chrome |
| No-login client view link slot | Already deferred in v3 templates |
| Repeat-compression policy decision | Named silence |
| ~~Faceless schedule/tick worker~~ | **Done** — `npm run worker` / `cascade.tickOnce` (see ACTUATION-REPORT) |
| ~~Live-send from enrollment cascade~~ | **Done** — `SEND_MODE` + `SEND_TEST_COHORT` gate (see ACTUATION-REPORT) |
| Worker host packaging (systemd / Vercel cron) | `npm run worker` is the process; deploy wiring deferred |
| Cohort allowlist as DB row + UI | Env list today; widening = edit env (no code) |
| Full sequence-cell calendar pacing | Worker advances channel windows; per-cell day calendar is adjacent |
| `rule_field_class_routing` seed rows | Table created; corpus rows thin — fill when Wiring paper lands values |
| OpenAPI / generated DB types from Supabase CLI | Hand types in `machineTypes.ts` (no tsc in repo) |
| Activate button label rename (UI still says "Launch") | Mapped; cosmetic |
| Primary-store deprecation for machine objects | Still available for legacy CT bags |

## Design questions (conservative choice taken)

| Question | Choice in this build |
|---|---|
| Should Activate be a separate control from Launch? | Launch → Activate (`draft→active`) + start run |
| Who owns faceless cascade execution? | Event: `POST /machine/reference`; time: tick worker — shared `cascade.ts` |
| Dry-run vs live send on auto-enroll? | `SEND_MODE` default dry_run; live only for `SEND_TEST_COHORT` |
