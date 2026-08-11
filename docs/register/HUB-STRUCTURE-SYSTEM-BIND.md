# Hub structures → existing system — bind analysis

**Date:** 2026-08-11  
**Branch:** `cursor/hub-structure-system-6565`  
**Question:** Before restoring Hub Client / Agents / Automations *structures* into Ant, does that integrate with the machine spine (tables · triggers · workers), or is it cosmetic chrome? **New tables: yes or no?**

**Counterparts:** UI leaf inventory stays in [HUB-PROTOTYPE-GAP-MAP.md](./HUB-PROTOTYPE-GAP-MAP.md) (+ Client / Agents / Automations children). Honesty contract stays in [PLACEHOLDER-REAL-MAP.md](./PLACEHOLDER-REAL-MAP.md). This doc is the **system** answer those maps assume.

---

## Verdict (read this first)

| Question | Answer |
|----------|--------|
| Can Ant grow Hub-shaped Client / Agents / Automations **cohesively**? | **Yes — if each surface binds the ledger the worker already writes.** Shape without bind = chrome. |
| Embedding Hub `JourneyTab` / `ClientView` / seed Agents **as-is**? | **Cosmetic (and honesty-regressive).** Hub Activity still keys `getClientJourney` → `journeyByClient` seeds. Plant embed = same seed lie under Hub chrome. |
| **New tables required for cohesive Client Activity / Information / Brief / Agents runtime / Automations runtime?** | **No** for the core loop. Tables already exist (migrations `003`–`008`). |
| **Any new tables ever?** | **Maybe later**, only if CRS History needs chart-grade time series that `fact_writebacks` cannot carry cleanly. Not a blocker to start. |
| What is actually missing? | **Projection + API completeness** (ledger → Hub row/inspector model), not schema invention. Some Ant authorship surfaces still write seed/context stores instead of `workflow` / templates. |

**Two contracts stay separate (do not collapse them):**

1. **Honesty** — no rows ⇒ empty UI (Pass A; keep).  
2. **Shape** — when a contact *has* rows, Ant must expose Hub’s Client Data tree (Information / History / Activity + node inspect), not a thin tree-with-tooltips.

Empty-of-demo ≠ empty-of-shape. Empty ledger ⇒ empty Hub-shaped panels is still cohesive.

---

## Spine that already exists

### Tables (by job)

| Job | Tables | Migration |
|-----|--------|-----------|
| Firm book / identity | `contact_records` (`body` JSONB for facts) | `004` |
| Actuation windows | `active_attempts` (+ `window_started_at`, `fired_criteria`) | `004` + `005` |
| Chronology ledger | `engagement_records` | `004` (+ inbound index in `005`) |
| Send + provider telemetry | `outbound_messages`, `messaging_events`, `provider_webhook_receipts` | `003` |
| Halt / consent | `halt_records`, `consent_records` | `003` |
| Enrollment / sequences | `enrollment`, `sequence_template`, `firm_sequence_binding`, `sequence_definitions` | `004` |
| Attempt rules (Agents Settings) | `rule_attempt_criteria`, `seq_channel_ownership_order`, `rule_cohort_scoring`, `rule_metrics_thresholds`, `seq_phase_order`, … | `004` |
| Automations graph | `workflow`, `workflow_state`, `workflow_target`, `workflow_run`, `action` | `004` |
| Trigger materialization | `workflow_trigger` | `006` |
| Eligibility / motion | `eligibility_evaluations`, `eligibility_results`, `signals`, `motion_decisions` | `004` |
| Facts answered | `fact_writebacks`, `missing_fact_signals` | `004` |
| Meetings | `meeting_booked` | `007` |
| Access | `access_links` | `008` |

### Workers / triggers (same spine)

| Path | Code | Writes |
|------|------|--------|
| Time tick | `server/wire-service/worker.ts` → `cascade.tickOnce` (also `GET/POST /wire/machine/tick`) | Criteria fire → `workflow_run` + `engagement_records` (`window_fired`, `cell_advanced`, `send_live` / `send_dry_run`) + channel send |
| Event cascade | `machine.ts` faceless / fact answer | `fact_writebacks` → eligibility → `signals` → `motion_decisions` → optional enroll/actuate |
| Enroll + first send | `enrollAndActuate` | `enrollment`, `active_attempts`, engagement + outbound |
| Real CEM/SMS | `dispatchSend.ts` | `outbound_messages` + `messaging_events` |

Ant consultant Engagement tab already lists `engagement_records` for the selected `contact_records.id` (Pass A). That is the correct **bind direction**. Hub Activity has not made that turn yet.

---

## Surface → bind (Client)

| Hub structure | Durable source today | New table? | Cohesive bind (not chrome) |
|---------------|----------------------|------------|----------------------------|
| Board → client | `contact_records` + halt + `meeting_booked` + board detections | **No** | Already Ant-bound (Pass A). Deep-link “View in Activity” needs **focus id** on an engagement/attempt row, not a new table. |
| Brief narrative | Compose: contact + eligibility/motion + recent engagement + meeting | **No** | Composer over existing APIs. Seed `ClientNarrative` / `getClientMeta` is chrome if reintroduced. |
| Information (profile table) | `contact_records` + `body`; `fact_writebacks`; reachability / cohort / eligibility | **No** | Project fields Hub’s `ProfileTable` expects from `body` + writebacks. Missing facts = `missing_fact_signals`, not fake Sarah profile. |
| History (CRS scrubber / chart) | Hub: seed only. Ledger: `fact_writebacks` (`field_key` + time) and/or `contact_records.body` | **No to start.** Optional `crs_snapshots` later if chart needs dense series Hub seeds invent. | First ship: History tab empty or writeback-derived points. Do not paint seed CRS series. |
| Activity list + gantt | `engagement_records` + `active_attempts` (+ enrollment / template cell labels) | **No** | **Projection layer:** map `event_kind` + payload → Hub row kinds (channel / attempt / formVisit / escalation). Empty firm ⇒ empty Activity. |
| Node inspect + email/SMS/form replay | `engagement_records` row + `outbound_messages` / `messaging_events` (by `messageId` / contact) + attempt `state` | **No** | Inspector reads ledger ids. Hub `emailInspectorData` seed HTML is chrome until send payload / template body is stored or fetched. |
| Thought / criteria / outcome lines | Criteria rows + `fired_criteria` on attempt + `window_fired` payload | **No** | Show when payload has criteria id / threshold; omit theater when absent. |

### Engagement event_kinds the worker already writes

`window_fired`, `cell_advanced`, `send_live`, `send_dry_run`, `attempt_nullified`, plus inbound kinds the tick path reads (`inbound_reply`, `form_visit`, `inbound_override`).

That is enough chronology for an Activity tree. It is **not** the same shape as `journeyByClient` (rich sequences, thought strips, canned email bodies). Cohesion = adapt the UI to the ledger (or enrich **payloads** on write), not invent parallel seed tables.

---

## Surface → bind (Agents)

| Hub / Ant surface | Durable source | New table? | Notes |
|-------------------|----------------|------------|-------|
| Sequence steps (editor) | `sequence_template` / `sequence_definitions` via `upsertTemplate` | **No** | Ant Save already hits `machineApi.upsertTemplate` + `upsertBinding`. |
| Settings (criteria, channel order, cohort, metrics, phase) | `rule_*` / `seq_*` tables | **No** | Ant **surpasses** Hub; already wired. |
| Launch / enroll | `enrollment` + actuation | **No** | Ant `createEnrollment` path exists. |
| Contacts / Activity / Report tabs | enrollments + engagement for template | **No** | Both Hub and Ant are stubs — honest empty until list-by-template API is used. |
| Hub dual-pane rail/canvas chrome | same template rows | **No** | UI depth only; no schema. |

**Chrome risk:** re-embedding Hub `AgentDetailView` pinned to `DEMO_AGENT_ID` / `getInitialAgentSteps` without template id from the catalog.

---

## Surface → bind (Automations)

| Surface | Durable source | New table? | Notes |
|---------|----------------|------------|-------|
| Graph + Activate | `workflow.graph`, `workflow_state`, `workflow_trigger` | **No** | Machine `listWorkflows` / `createWorkflow` exist. |
| Runs | `workflow_run` | **No** | |
| Eligibility pipeline reorder | `seq_eligibility_pipeline` | **No** | Ant Settings already upserts. |
| Node config / Input·Output panes | graph JSONB + run node_status | **No** | UI depth; payloads already JSON. |

**Chrome risk today:** Ant `AntAutomationWorkbench` still drives canvas via `AutomationContext` / `automationWorkflows` seed store for nodes/edges, while only some Settings hit the wire. Cohesion = **Save/Launch persist `workflow.graph` + materialize `workflow_trigger`**, same as Activate path the cascade reads — not a new table.

---

## What would make it *only* cosmetic

1. Embed Hub `ClientView` / `JourneyTab` and keep `getClientJourney(clientId)` seeds.  
2. Restore Information / CRS History from `clients.ts` profile / scrubber seeds.  
3. Pin Plant/Ant Agents or Automations to `DEMO_*` ids while catalogs look “live.”  
4. Build Ant Activity chrome (tree, gantt, inspector shell) that ignores `engagement_records` when rows exist — or paints Sarah when they don’t.

Any of those fail the systems test even if the UI “looks like Hub.”

---

## Integration order (system first, then shape)

Do not start with Ant layout. Order:

1. **Freeze the projection contract** — document how each `engagement_records.event_kind` (+ attempt state) maps to Activity row + inspector tabs (Overview / Metadata / Replay). Extend write payloads only where replay needs body/subject (prefer linking `outbound_messages.id`).  
2. **Client Activity bind** — Ant (or shared) Activity consumes that projection for `contact_records.id`; empty when none. Node click opens inspector from ledger ids.  
3. **Information bind** — profile fields from contact + writebacks; no seed meta.  
4. **History bind** — writeback-derived CRS points or honest empty; defer `crs_snapshots` until product demands it.  
5. **Brief composer** — narrative sections as projections over (2)–(4) + meeting; no Sarah paragraphs.  
6. **Board → Activity focus** — pass engagement/attempt id; scroll/select that node.  
7. **Automations graph persist** — Ant canvas Save → `workflow` + Activate → `workflow_trigger` (close seed-store gap).  
8. **Agents UI depth** — optional Hub rail/canvas chrome **after** template bind stays honest.  
9. **Only then** decide embed vs Ant rewrite for chrome parity — both are fine once (1)–(7) own the data.

---

## Direct answers (systems analyst checklist)

| # | Question | Answer |
|---|----------|--------|
| 1 | Will putting Hub structures into Ant work cohesively? | **Only if bound to existing machine tables/workers.** UI-only restore = chrome. |
| 2 | New tables? | **No** for Activity, Information, Brief, Agents runtime, Automations runtime. |
| 3 | What kinds of tables if we ever add? | Optional CRS/time-series snapshot table; optional richer message-body store only if `outbound_messages` + template steps prove insufficient for replay. |
| 4 | How does it integrate? | Same firm_id + `contact_records.id` keying; Activity ← `engagement_records`/`active_attempts`/outbound; Information ← contact/`fact_writebacks`; Agents ← templates/bindings/rules; Automations ← `workflow*` + tick/event cascade; worker already produces the chronology. |
| 5 | What do we understand first? | Ledger event model + projection to Hub leaves — **not** Ant tab chrome. |

---

## Related

- [HUB-PROTOTYPE-GAP-MAP.md](./HUB-PROTOTYPE-GAP-MAP.md) — UI leaf gaps (what Ant is missing visually)  
- [PLACEHOLDER-REAL-MAP.md](./PLACEHOLDER-REAL-MAP.md) — honesty / empty-or-personalized  
- [APP-ELEVATION-GAP.md](./APP-ELEVATION-GAP.md) — Activity elevation note  
- Migrations: `supabase/migrations/003_ct_wire_stores.sql` … `008_access_links.sql`  
- Worker: `server/wire-service/worker.ts`, `cascade.ts`
