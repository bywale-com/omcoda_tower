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
| **New rows / new fields?** | **Yes — see “Rows vs fields vs tables” below.** No new *relations* does not mean the ledger is already dense enough for Hub inspect/replay. |
| **Any new tables ever?** | **Maybe later**, only if CRS History needs chart-grade time series that `fact_writebacks` cannot carry cleanly. Not a blocker to start. |
| What is actually missing? | **Richer writes** (columns + JSONB keys + denser event rows) + **projection** (ledger → Hub row/inspector). Some Ant authorship surfaces still write seed/context stores instead of `workflow` / templates. |

---

## Rows vs fields vs tables (the precise answer)

| Kind of “new” | Needed? | What |
|---------------|---------|------|
| **New tables** | **No** (core loop) | Do not invent parallel journey/CRS/inspector tables. |
| **New rows** | **Yes, always** | Worker/cascade must keep writing `engagement_records`, `messaging_events`, `workflow_run`, `fact_writebacks`, etc. Empty book ⇒ empty UI. Cohesion also needs **denser** rows where Hub shows milestones Hub seeds invent today (opened/clicked/form_visit) — those become real `messaging_events` / engagement rows from webhooks + inbound, not seed. |
| **New SQL columns (`ALTER TABLE`)** | **Yes, at least for send replay** | `outbound_messages` today stores envelope only (`to_addr`, `from_addr`, `provider_message_id`, `status`) — **not** `subject` / `body_text` / `body_html` / SMS `body`. Hub email/SMS replay cannot be durable without persisting content. Prefer columns (or one `content JSONB`) on `outbound_messages`. Form capture/replay may need durable capture payload somewhere (`engagement_records.payload` or a later table if volume demands). |
| **New JSONB fields (no DDL table)** | **Yes** | Enrich writes into existing JSONB: `engagement_records.payload` (link `outboundMessageId`, `attemptId`, `criteriaId`, channel, template/cell ids, optional thought/decision summary), `active_attempts.state` / `fired_criteria` (already partly there), `contact_records.body` (profile / CRS facts Hub Information expects), `sequence_template.cells` (authored step copy the send path should use). |
| **New `event_kind` values (rows, not schema)** | **Likely** | Chronology today: `window_fired`, `cell_advanced`, `send_live`, `send_dry_run`, `attempt_nullified`, inbound kinds. Inspector/list may want explicit kinds (or payload discriminators) for opened/clicked/reply if webhooks should surface as engagement rows rather than only `messaging_events`. |

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
| Node inspect + email/SMS/form replay | `engagement_records` row + `outbound_messages` / `messaging_events` (by `messageId` / contact) + attempt `state` | **No new table; yes content fields** | Inspector reads ledger ids. Today outbound row has **no body/subject columns** — must add fields (or stash content on engagement payload) before replay is real. Hub `emailInspectorData` seed HTML is chrome until then. |
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

## Affordances this change makes possible

Outcome sentences only — what a person can **view** or **do** once Hub structures bind the machine spine (richer rows/fields + projection). Not an implementation plan.  
**Honesty rule baked in:** if the ledger has no rows for that firm/contact, you see empty — not Sarah.

### Consultant — Board → client

1. You can open a client from the Board and land in that contact’s workspace (`contact_records.id`), not a demo slug.
2. You can open the same client from Contacts and get the same workspace.
3. You can filter the Board by phase (silent / in-motion / meeting-ready / halted) against real halt + meeting + motion state.
4. You can search the Board and only match people in this firm’s book.
5. You can see today’s booked meetings on the Board from `meeting_booked`.
6. You can halt one contact’s outreach and see that halt on their workspace.
7. You can halt the whole firm book and see every contact treated as halted.
8. You can lift a halt and watch outreach become eligible again.
9. You can click “View in Activity” (or equivalent) from a Board phase signal and land on the **exact** engagement/attempt node, not just the Engagement tab.
10. You can open a fresh provisioned firm and see an empty Board — proving the book is yours.

### Consultant — Brief

11. You can read a Client Brief whose name, email, phone, and pathway facts come from this contact’s record and writebacks.
12. You can see pathway / status / expiry-style identity fields when those facts exist on the contact — and blanks when they don’t.
13. You can read an Overview / Pathway / Engagement-history / Tower-observation narrative composed from machine state, not Sarah copy.
14. You can see a live nudge / missing-fact briefing block when `missing_fact_signals` (or equivalent) exist for that contact.
15. You can open Accepted terms for the licensee context of this firm.

### Consultant — Information

16. You can open an Information tab on the client and view a structured profile table (name, pathway, status, CRS, work permit, days in system, key-value facts).
17. You can see profile fields update after a contact answers a fact (writeback lands → Information reflects it).
18. You can see reachability / cohort / eligibility verdicts when those rows exist for the contact.
19. You can tell which facts are still missing because the Information surface stays sparse instead of inventing demo profile rows.

### Consultant — CRS History

20. You can open a History tab and see CRS (or eligibility score) points over time when writebacks recorded them.
21. You can scrub a CRS history control to a past point in time and see the score at that moment.
22. You can view CRS stats (score, draw threshold, permit days, days in system) for the selected scrub point.
23. You can view a CRS-vs-threshold chart for that contact when enough points exist.
24. You can open History on a contact with no score history and see empty — not a fake scrubber series.

### Consultant — Activity (chronology)

25. You can open Activity and see a dual-pane engagement list + timeline for **this** contact only.
26. You can see sequence / attempt / channel / form-visit / escalation / event rows derived from `engagement_records` + `active_attempts`.
27. You can see sent / delivered / opened / clicked-style signal icons when `messaging_events` (or attempt state) recorded those milestones.
28. You can see form-visit rows when inbound form events were written for the contact.
29. You can expand reasoning / criteria / outcome lines on a row when the attempt fired with criteria payload.
30. You can see an escalation wait window and what the machine was waiting on.
31. You can scroll the list and timeline in sync and resize the splitter.
32. You can zoom the timeline (week / day / hour-class resolution) to forensic detail.
33. You can jump the timeline to Today.
34. You can read a legend that means Historical / Active / Armed / Waiting / Attempts against real attempt status.
35. You can open Activity with zero engagement rows and see an empty chronology.

### Consultant — Node inspect + replay (look-inside)

36. You can click an Activity list row or timeline marker and open a side inspector for that node.
37. You can press Esc or use prev/next to move between related nodes in the inspector.
38. You can switch Overview vs Metadata inside the inspector.
39. You can view a milestone rail (sent → delivered → opened → …) for that touchpoint from real messaging/attempt state.
40. You can view the decision and thought/criteria chain that caused that node to fire (when payload carried it).
41. You can view forensic metadata: sequence id, touchpoint/cell id, channel, status, linked attempt / run ids.
42. You can replay the **exact email** that was sent (from / to / subject / body) because outbound content was persisted.
43. You can replay the **exact SMS** that was sent (body + thread context) from persisted outbound content.
44. You can open form-channel replay and see the form fields / capture session when a form visit was recorded.
45. You can see reply / follow-up thread items around a send when inbound replies were written to the ledger.
46. You can refuse to show seed Sarah/Marcus email HTML when no outbound content exists for that node.

### Consultant — Meetings & facts bridge

47. You can book a meeting and later see it on Meetings and on the Board today strip.
48. You can open a meeting-ready client and see Brief / Information informed by the same contact + writebacks.
49. You can answer a contact fact (portal or desk) and later see that answer in Meetings live brief and Information.

### Operator — Agents (engagement templates)

50. You can create a new engagement template and save steps that persist as `sequence_template` / bindings for the firm.
51. You can edit attempt criteria, channel order, cohort scoring, metrics thresholds, and phase order and have those rules drive the tick worker.
52. You can launch / enroll contacts onto a template and create real `enrollment` + `active_attempts` rows.
53. You can open an Agent’s Contacts tab and see who is enrolled on that template (or honest empty).
54. You can open an Agent’s Activity tab and see runs/sends for that template (or honest empty).
55. You can open linked automations from an agent and see which workflows are actually bound — names and status, not a count badge only.
56. You can reorder or insert steps in the sequence editor and have Save write the cells the send path will use.
57. You can author email/task step copy that later appears in client Activity replay when that step sends.

### Operator — Automations

58. You can build a workflow graph and Save it into `workflow.graph` for the firm (not a browser-only seed store).
59. You can Activate a workflow and materialize `workflow_trigger` rows the cascade/tick actually dispatches.
60. You can open Runs and see `workflow_run` history for that automation.
61. You can reorder the eligibility pipeline and have faceless re-eval use that order.
62. You can configure trigger kinds (event / schedule / manual / webhook / constant) that the machine can fire.
63. You can inspect a node’s run status after a manual or scheduled fire.
64. You can stop / pause an active workflow and see new fires cease.

### Operator ↔ Consultant cinch (same spine)

65. You can author a sequence as operator, enroll a contact, and as consultant see that contact’s Activity fill with real sends/windows.
66. You can change attempt criteria as operator and later see different `window_fired` / escalation behavior on the consultant Activity for open attempts.
67. You can activate an automation that reacts to a fact writeback and see the resulting motion/enrollment on the Board.
68. You can halt as consultant and see the worker skip sends for that contact while the halt row stands.

### Contact desk

69. You can redeem an access link and land as that contact (not a demo contact id).
70. You can answer a requested fact and know it wrote `fact_writebacks` the consultant Information/Brief will read.
71. You can visit a form touchpoint and have that visit appear on the consultant Activity / form replay when recorded.

### Proof / empty honesty (product trust)

72. You can provision Firm B, upload no book, and see every Client Data tab empty.
73. You can upload two contacts and see only those two on Board / Contacts.
74. You can run the worker against an enrolled contact and watch Activity gain rows without refreshing demo seeds.
75. You can compare two firms and never see Firm A’s engagement rows inside Firm B’s client workspace.
76. You can trust that if replay shows an email body, that body is what was sent (or dry-run staged) — not plant copy.

### Explicitly not claimed by this bind alone

- You cannot cold-score strangers from public databases (out of Core Function).
- You cannot treat Escrow / Meta commercial desks as live ledgers while they remain deferred stand-ins.
- You cannot get Hub’s full editor chrome (A/B rail, AI bootstrap, Share) for free from table bind — those are UI-depth follow-ons after data ownership is real.

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
