# Systems Analyst — log

**Seat:** Systems Analyst (machine). Packets + hard decisions so the implementer only cuts. Instructions from the **founder** only. Identity: [`../README.md`](../README.md) § Systems Analyst. PM flags: [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) (read for the glass, not for job-law).

**Purpose:** Running log so a new Systems Analyst chat starts where the last one stopped. Stamps are **witnessing history** (what was said, what was corrected, what was parked) — not a second Agents flag.

**Current (read first, then the newest stamp at the bottom):** 2026-08-16 02:23 UTC — **Caption audit. Dropped qualify_gate / launch_* types. Next campaign = ord.** Flag **15:43**.

**How we maintain this log** (same discipline as Phase Two)

- Unless the founder says “mark this as a separate entry/doc,” SA work lands **here** — append-only, newest at bottom.
- **Do not edit a past stamp.** Corrections are a **new** stamp. The only line that moves in place is **Current** at the top (an index, so a new chat does not hunt).
- Do not overwrite product flags. Align the model to [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) Current pointer.
- Cadence floor while in session: **at least four times a day**; denser conversation → denser stamps.
- Notice inflection (Story/Requirements delta, table mint or refusal, map-vs-Postgres split, founder correction) and **ask**.
- Area: this file + machine docs under `docs/register/` and `docs/register/system-map/`. Do not scatter one-offs.
- **Durable founder expansions** (they are expanding the idea; they will not take it back): stamp **here with specific excerpts**, and park a register markdown so the detail is not only in the log. Same grade as OPERATOR-REVISIONS until Story is promoted. Do not leave critical wording in the background.

---

## 2026-08-15 16:01 UTC — Log opened

**Why:** Founder spinning a Systems Analyst child chat. PM stays on Phase Two; SA lives with Story / Requirements / tables / Postgres / live ports.

**Assigned first question (answer in a later stamp, after the repo walk):** given the Agents flagship (operator-authored sequencing, firm/default/overrides, attempt/retry/escalation, goal-criteria as escalation point → other agent · other workflow · or end; middle modular), what must change in the systems model? Inventory every stood-up table/field/relation first.

**Do not:** generate a substitute Agents list; invent Ant chrome; mint a goal table in this opening stamp.

---

## 2026-08-15 16:28 UTC — First question: inventory + flagship fit (no table mint)

**Why:** Assigned opening question after the repo walk. Product flag remains PHASE-TWO-LOG **2026-08-15 15:43 UTC** (founder wording). This stamp is the **inventory-delta**, not a second Agents flag.

**Walked (in order):** SYSTEMS-STORY · SYSTEMS-REQUIREMENTS · SYSTEMS-REQUIREMENTS-FILLED · BUILD-system-map-v2-table-inventory · FROZEN-TABLES-v1 · V2-BACKLOG · `tables.ts` (MACHINE_TABLES + TABLE_RELATIONS) · nodes/edges/templates · SCHEMA-REPORT · ACTUATION-REPORT · migrations `001`–`009` (quoted below) · `cascade.ts` / `worker.ts` / `workflowWalk.ts` / `machine.ts` / `routes.ts` / `dispatchSend.ts` · `ports.ts` / `registry.ts` · wire-log GO-CUTOVER · PHASE-TWO-LOG (read-only).

---

### 1. Inventory — three layers (never conflate)

**Materialized Postgres** = migrations `001`–`009`. **Map-only** = MACHINE_TABLES / nodes with no first-class PG table. **Named silence / V2** = Story silences + V2-BACKLOG + frozen walls.

SCHEMA-REPORT is **stale**: it stops at `004`. Stood-up truth is the SQL.

#### 1a. Materialized tables, columns, FKs / checks (from SQL)

**`001_auth_tables.sql`** — UUID tenancy (auth).

| Table | Columns | Constraints |
|---|---|---|
| `firms` | `id` UUID PK, `name` TEXT NOT NULL, `created_at` | |
| `users` | `id` UUID PK, `firm_id` UUID NOT NULL, `email` TEXT NOT NULL, `created_at` | FK `firm_id` → `firms` CASCADE; UNIQUE `email` |
| `otp_challenges` | `id` UUID PK, `firm_id` UUID NOT NULL, `email`, `code_hash`, `expires_at`, `consumed_at`, `invalidated_at`, `delivery_failed` BOOLEAN DEFAULT false, `verify_attempts` INT DEFAULT 0, `created_at` | FK `firm_id` → `firms` CASCADE; unique partial index one-active per (firm_id, email) |
| `sessions` | `id` UUID PK, `user_id` UUID NOT NULL, `firm_id` UUID NOT NULL, `token_hash` TEXT UNIQUE, `expires_at`, `created_at` | FK `user_id` → `users` CASCADE; FK `firm_id` → `firms` CASCADE |
| `otp_send_log` | `id` UUID PK, `email`, `created_at` | (rate log; no FK) |

**`002_applied_seeds.sql`**

| Table | Columns |
|---|---|
| `applied_seeds` | `seed_id` TEXT PK, `environment` TEXT NOT NULL, `description` TEXT NOT NULL, `applied_at` |

**`003_ct_wire_stores.sql`** — TEXT CT keys (`firm-cedar`, …). **No FKs.** Dual tenancy vs `001` UUID is ununified (V2-BACKLOG).

| Table | Columns | Checks |
|---|---|---|
| `ct_firms` | `id` TEXT PK, `name`, `posture` DEFAULT `'Idle'`, `pool_slug`, `pool_domain`, `sending_identity_id`, `created_at`, `updated_at` | `posture IN ('Idle','Armed','Active')` |
| `halt_records` | `id` TEXT PK, `consultant_id`, `contact_id`, `firm_id`, `scope`, `reason`, `halted_at`, `lifted_at` | `scope IN ('contact','firm-book')` |
| `consent_records` | PK `(contact_id, firm_id)`, `basis` DEFAULT `'none'`, `silenced` BOOLEAN DEFAULT false, `source`, `updated_at` | `basis IN ('express','implied','none')`. **`004` adds** `status` TEXT NOT NULL DEFAULT `'unsequenced'` CHECK `IN ('unsequenced','waitlisted','sequenced','silenced')` |
| `crm_oauth_grants` | `firm_id` TEXT PK, `granted`, `revoked`, `scopes` TEXT[], `granted_at`, `revoked_at`, `updated_at` | |
| `audit_events` | `id` TEXT PK, `at`, `actor_id`, `kind`, `subject_type`, `subject_id`, `firm_id`, `payload` JSONB | |
| `primary_store_rows` | PK `(collection, id)`, `body` JSONB, `updated_at` | generic bag |
| `outbound_messages` | `id` TEXT PK, `firm_id`, `contact_id`, `channel`, `purpose`, `to_addr`, `from_addr`, `provider_message_id`, `status` DEFAULT `'accepted'`, `deny_reason`, `created_at` | `channel IN ('email','sms')`. **`009` adds** `subject`, `body_text`, `body_html`, `content` JSONB DEFAULT `'{}'` |
| `messaging_events` | `id` TEXT PK, `at`, `firm_id`, `message_id`, `event_class`, `contact_id`, `provider_event_id` UNIQUE, `raw` JSONB | |
| `provider_webhook_receipts` | `id` TEXT PK, `provider`, `provider_event_id`, `signature_ok`, `received_at`, `payload` JSONB | UNIQUE `(provider, provider_event_id)` |
| `sending_domains` | `firm_id` TEXT PK, `subdomain`, `full_domain`, `resend_domain_id`, `status` DEFAULT `'pending'`, `allocated_at`, `verified_at` | |

**`004_machine_tables.sql`** — machine set. `firm_id` TEXT throughout. Walls are not tables.

Automations:

| Table | Columns | Constraints |
|---|---|---|
| `workflow` | `id` TEXT PK, `firm_id`, `name`, `target` DEFAULT `'contact'`, `graph` JSONB, `created_at`, `updated_at` | `target IN ('audit','contact','import','client')` |
| `workflow_state` | `workflow_id` TEXT PK, `status` DEFAULT `'draft'`, `updated_at` | FK → `workflow` CASCADE; `status IN ('draft','active','paused')` |
| `workflow_target` | `workflow_id` TEXT PK, `target` | FK → `workflow` CASCADE; same target check |
| `workflow_run` | `id` TEXT PK, `workflow_id`, `firm_id`, `status` DEFAULT `'running'`, `trigger_label`, `node_status` JSONB, `counts` JSONB, `started_at`, `finished_at` | FK → `workflow` CASCADE; `status IN ('running','success','failed','stopped')` |
| `action` | `id` TEXT PK, `workflow_id`, `node_id`, `type` DEFAULT `'call_agent'`, `agent_ref` TEXT NOT NULL, `payload_binding` JSONB, `created_at` | FK → `workflow` CASCADE; **`type = 'call_agent'` only** |
| `enrollment` | `id` TEXT PK, `firm_id`, `contact_id`, `agent_ref`, `sequence_id`, `workflow_run_id`, `payload` JSONB, `enrolled_at` | FK `workflow_run_id` → `workflow_run` SET NULL |

Templates / binding:

| Table | Columns | Constraints |
|---|---|---|
| `sequence_template` | `id` TEXT PK, `sequence_class`, `variant` DEFAULT `'v1'`, `label`, `cells` JSONB DEFAULT `'[]'`, `source`, `silences` JSONB, `version` INT, `created_at`, `updated_at` | `sequence_class IN ('optin_launch','launch_day','reengagement','reactivation')`. Platform table (no `firm_id`) |
| `firm_sequence_binding` | `id` TEXT PK, `firm_id` **NOT NULL**, `sequence_class`, `template_id`, `overrides` JSONB DEFAULT `'[]'`, `variable_bindings` JSONB, `created_at`, `updated_at` | FK `template_id` → `sequence_template`; UNIQUE `(firm_id, sequence_class)`; same class check. **No NULL-firm default binding row** |

Rule / sequence (DATA; `firm_id` NULL = platform default):

| Table | Distinct columns beyond id / firm_id / label / enabled / when_clause / condition_clause / set_value / ord / source / version |
|---|---|
| `rule_attempt_criteria` | `threshold` NUMERIC, `threshold_unit` TEXT |
| `rule_motion_precedence` | (shared rule shape) |
| `rule_field_class_routing` | (shared) |
| `rule_reachability_checks` | (shared) |
| `rule_eligibility_pathway` | (shared) |
| `rule_cohort_scoring` | (shared) |
| `rule_metrics_thresholds` | `threshold` NUMERIC |
| `seq_channel_ownership_order` | `token`, `label`, `ord`, `version` (no when/condition) |
| `seq_phase_order` | same shape |
| `seq_eligibility_pipeline` | same shape |

Core-loop state:

| Table | Columns | Constraints |
|---|---|---|
| `contact_records` | `id` TEXT PK, `firm_id`, `email`, `phone`, `name`, `body` JSONB, `created_at`, `updated_at` | |
| `reachability_verdicts` | PK `(contact_id, firm_id)`, `verdict`, `details` JSONB, `updated_at` | `verdict IN ('reachable','partial','unreachable')` |
| `sequence_ready` | PK `(contact_id, firm_id)`, `ready` BOOLEAN, `updated_at` | |
| `campaign_states` | `firm_id` TEXT PK, `state` DEFAULT `'armed-for-activation'`, `updated_at` | `state IN ('armed-for-activation','running')` |
| `cohort_tiers` | PK `(contact_id, firm_id)`, `tier` DEFAULT `'unranked'`, `score` JSONB, `updated_at` | |
| `metrics_flags` | `id` TEXT PK, `firm_id`, `flag`, `metric`, `value` NUMERIC, `created_at` | |
| `reference_versions` | `id` TEXT PK, `firm_id` (NULL = house), `key`, `payload` JSONB, `version`, `created_at` | UNIQUE `(firm_id, key, version)` |
| `constants_packs` | `id` TEXT PK, `firm_id`, `name`, `payload` JSONB, `version`, `created_at` | |
| `eligibility_evaluations` | `id` TEXT PK, `firm_id`, `contact_id`, `trigger_kind`, `status` DEFAULT `'done'`, `created_at` | |
| `eligibility_results` | `id` TEXT PK, `evaluation_id`, `firm_id`, `contact_id`, `result` JSONB, `any_pathway_pass` BOOLEAN, `created_at` | FK `evaluation_id` → `eligibility_evaluations` CASCADE |
| `signals` | `id` TEXT PK, `firm_id`, `contact_id`, `kind`, `payload` JSONB, `created_at` | |
| `motion_decisions` | `id` TEXT PK, `firm_id`, `contact_id`, `motion`, `reason` JSONB, `created_at` | `motion IN ('nudge','reactivation','none')` |
| `active_attempts` | `id` TEXT PK, `firm_id`, `contact_id`, `enrollment_id`, `owner_channel`, `status` DEFAULT `'open'`, `state` JSONB, `created_at`, `updated_at` | FK `enrollment_id` → `enrollment` SET NULL. **`005` adds** `window_started_at` TIMESTAMPTZ NOT NULL DEFAULT now(), `fired_criteria` JSONB NOT NULL DEFAULT `'{}'` |
| `engagement_records` | `id` TEXT PK, `firm_id`, `contact_id`, `event_kind`, `payload` JSONB, `created_at` | |
| `fact_writebacks` | `id` TEXT PK, `firm_id`, `contact_id`, `field_key`, `value` JSONB, `created_at` | |
| `missing_fact_signals` | `id` TEXT PK, `firm_id`, `contact_id`, `field_key` NOT NULL, `created_at` | |
| `audit_runs` | `id` TEXT PK, `firm_id`, `status` DEFAULT `'running'`, `enabled_checks` JSONB, `import_ids` JSONB, `summary` JSONB, `started_at`, `finished_at` | `status IN ('running','complete','failed')` |
| `sequence_definitions` | `id` TEXT PK, `firm_id`, `name`, `steps` JSONB, `status` DEFAULT `'draft'`, `created_at`, `updated_at` | **Stood up; runtime does not read it** (`cascade` / `templateWalk` consume `sequence_template` via `firm_sequence_binding`) |
| `prepared_workspaces` | `id` TEXT PK, `firm_id`, `status` DEFAULT `'staged'`, `body` JSONB, `created_at` | thin |
| `escrow_acceptances` | `firm_id` TEXT PK, `accepted` BOOLEAN, `terms` JSONB, `accepted_at`, `updated_at` | thin |

**`006_workflow_trigger.sql`**

| Table | Columns | Constraints |
|---|---|---|
| `workflow_trigger` | `id` TEXT PK, `workflow_id`, `firm_id`, `node_id`, `type`, `event_name`, `condition` JSONB, `schedule` JSONB, `webhook_id`, `enabled`, `created_at`, `updated_at` | FK → `workflow` CASCADE; `type IN ('event','schedule','manual','webhook','constant')`; UNIQUE `(workflow_id, node_id)`; unique `webhook_id` where not null |

**`007_meeting_booked.sql`**

| Table | Columns | Constraints |
|---|---|---|
| `meeting_booked` | `id` TEXT PK, `firm_id`, `contact_id`, `booked_at`, `source` DEFAULT `'contact_portal'`, `slot`, `consultant_name`, `enrollment_id` TEXT (**no FK**), `payload` JSONB, `created_at` | |

**`008_access_links.sql`** — UUID, joins auth tenancy.

| Table | Columns | Constraints |
|---|---|---|
| `access_links` | `id` UUID PK, `user_id` UUID, `firm_id` UUID, `email`, `token_hash` UNIQUE, `expires_at`, `consumed_at`, `invalidated_at`, `created_at` | FK `user_id` → `users` CASCADE; FK `firm_id` → `firms` CASCADE; unique one-active per user |

Logical FKs **not** declared in SQL (TEXT ids): `enrollment.contact_id` / `active_attempts.contact_id` / `engagement_records.contact_id` / `meeting_booked.contact_id` ↔ `contact_records.id`; `enrollment.agent_ref` / `sequence_id` ↔ `sequence_template.id`; `action.agent_ref` same; almost all `firm_id` TEXT ↔ `ct_firms.id` (not `firms.id`).

#### 1b. TABLE_RELATIONS (map) that touch the Agents causal ring

Runtime-consumed (SQL + cascade, not only map):

- `seq.channel_ownership_order` **reads into** `state.active_attempt` — worker/cascade `loadChannelOrder`
- `rule.attempt_criteria` **writes** `state.active_attempt` — `escalateAttemptWindow`; also **writes** `state.cohort_tier` (SMS non-reply row on the map)
- `state.sequence_ready` **triggers** `state.active_attempt` (enroll gate)
- `state.motion_decision` **triggers** `state.active_attempt` (Engine 2 chosen motion)
- `bind.firm_sequence` **writes** `state.sequence_definition`; **reads** templated calendars
- `seq.optin_launch_calendar` / `seq.reactivation_calendar` **write** `state.content_order`
- `seq.content_order` **reads into** `state.active_attempt`

Finishing chain **on the map only** (no PG table for the middle node):

- `state.active_attempt` **triggers** `state.finishing_event` (criteria terminal, faceless)
- `state.finishing_event` **writes** `state.reactivation_arm_state` (arms next)
- `state.finishing_event` **writes** `state.engagement_record` (append)

Downstream loop: `state.meeting_booked` → `state.pending_capture` → `state.fact_writeback` → eval / `state.live_brief`.

Dual entry at runtime (not a TABLE_RELATION row): `workflowWalk` Action `call_agent` / `enroll_sequence` → `enrollAndActuate`; `POST /wire/machine/enrollments` is the Agent-native door. Both write `enrollment` + `active_attempts`.

#### 1c. Map-only (in `tables.ts` / nodes; **not** first-class PG)

Story nodes with no dedicated table: `state.seed_capture`, `state.approach_impression`, `state.firm_public_facts`, `state.optin_phase`, `state.phase_state`, `state.reactivation_arm_state`, `state.content_order` (pointer; calendars live in `sequence_template.cells`), `state.inbound_override` (event kinds on `engagement_records` + `active_attempts.state`, not a table), **`state.finishing_event`**, `state.fact_ask`, `state.field_class_routing` (result; rule table exists), `state.analysis_readout`, `state.evaluation_ruleset`, `state.pending_capture`, `state.live_brief`.

Map sequence twins of templates (cells are PG jsonb, not separate seq_* tables): `seq.content_order`, `seq.optin_launch_calendar`, `seq.launch_day_sequence`, `seq.reactivation_calendar`. `seq.phase_order` **is** PG.

Walls (non-tables, structural): `wall.hard_gates`, `wall.must_nots`, `wall.click_budget`, `wall.approach_scope`, `wall.repeat_compression` (named-silence).

`halt_records` is PG without a map twin (`state.halt` is V2-BACKLOG).

#### 1d. Named silences / V2 (Story + backlog — not filled)

Story 7b: exact product-locked criteria windows; SMS reply-failure escalation; event-based enrollment trigger set beyond manual pull. Story 11: what makes a signal **reactivation-worthy**. Story 12: D-01 / D-02. Story 3: escrow **release**. Plus master list in SYSTEMS-STORY § Silences.

V2-BACKLOG still open for this question: Internal Action catalog (non-`call_agent`); dual tenancy unify; full sequence-cell calendar pacing (worker advances cells via `advanceTemplateCellIfDue` — adjacent, not complete); `rule_field_class_routing` seed rows thin; halt map twin.

**There is no `goal` / `goal_criteria` / `goal_escalation` table in SQL, map, Story, or Requirements.** Closest Story state is `finishing_event` (close + arm next). Closest PG is `meeting_booked` (system 12 loop-closer, human gate). Neither is operator-authored goal-as-escalation-point.

#### 1e. Live vs stand-in ports (`registry.ts` + GO-CUTOVER)

**Live when `VITE_WIRE_REAL` + secrets + DB:** `otpStore` (`/auth/otp/*`), `haltStore`, `auditTrail`, `sendingPool` (Resend Domains + `sending_domains`), `espMailer` (`POST /wire/send/cem` → Resend), `consentSilence`, `crmOAuth`, `primaryStore`, `smsApi` (`POST /wire/send/sms` → Twilio), `machineApi` (`/wire/machine/*` + worker tick). Resend webhooks → `messaging_events`. Access links: `POST /auth/access/redeem`. Worker: `cascade.tickOnce` / `POST /wire/machine/tick`. `SEND_MODE` + `SEND_TEST_COHORT` gate live cascade send.

**Still stand-in (deferred, not unfinished rewire):** `metaAds`, `escrow` (table `escrow_acceptances` is thin; port is stand-in), `enrichCrawl`, `warmup`, `ipPool`, `listUnsubscribe`, client `mailer` (OTP goes through `otpStore`; CEM through `espMailer`), `sendGate` (server `dispatchSend.ts` holds real consent/halt/silence; client chip port remains stand-in).

Do not call a stand-in the system.

---

### 2. Fit — flagship clauses vs the machine (15:43 UTC wording)

Flagship (not restated as a list; clauses named only to locate housing):

| Flagship clause | Housing today |
|---|---|
| Operator defines **outreach sequencing** — the sequence **and** the **order it is deployed** | **Partial.** Shape + day/step order: `sequence_template.cells` (runtime cursor in `templateWalk` / `advanceTemplateCellIfDue`). Phase order: `seq_phase_order`. Channel order inside an attempt: `seq_channel_ownership_order`. **Not** attempt-aware sequence defaults (default for all attempts except X; attempt-1 vs later). `sequence_definitions` is a second, unused housing. |
| Sequencing **per firm or as a default**, plus **overrides** | **Partial.** `firm_sequence_binding` = firm → one template per `sequence_class` + `overrides` jsonb + `variable_bindings`. `rule_*` / `seq_*` `firm_id` NULL = platform default (cascade prefers firm row then NULL). Binding `firm_id` is **NOT NULL** — there is **no** platform-default *binding* row; defaults live on templates + NULL-firm rules, not on a default agent package. Override kinds other than binding jsonb / NULL-firm rules are not modeled. |
| **Escalations between attempts**; **retry rules**; **attempt rules** | **Partial.** Attempt/retry **inside** one in-flight sequence: `rule_attempt_criteria` (thresholds from table) + worker. Escalation today is **channel-ladder inside an attempt** (`seq_channel_ownership_order`; `set_value` escalate_forward / next_attempt_or_forward / return_to_sequence_head). Story 7b + OPERATOR-REVISIONS: attempts are **local retries under the failed owner**, not a top-level Attempt spanning channels. Authored **attempt-to-attempt** escalation as data: **thin / absent**. Node-to-node as weaker phrasing: cells are content order, not an escalation graph. |
| **Goal / goal criteria as an escalation point** → **other agents** · **other workflows** · **or it ends**. Once met, met. Endpoint. | **Not housed as operator-authored modular data.** Map `state.finishing_event` is a Story **chain** (close sequence, arm next — next-motions from Engine 2). Runtime never writes a finishing_event row. `action.type` is **only** `call_agent` (Automations → agent). Reverse (agent goal → workflow) does not exist. `meeting_booked` is system-12 success event, not authored criteria on an agent. “Once met, met” has no idempotent goal-state table. |
| Everything in the **middle** is **modular** | **Law already locked** (v2 table inventory). Middle that *is* stood up (`rule_*`, `seq_*`, templates, bindings) is table-shaped. The goal clause is the hole: if it is operator-modifiable, modularity law already says table — but Story has not named that must. |

---

### 3. Change — if the flagship is law (systems model, not a mint)

**Do not mint a goal table in this stamp.**

Story 7b **must** today: on a **finishing event**, close the sequence and **arm the next**. Requirements extract that as `finishing_event` → `reactivation_arm_state` + `engagement_record`. Chosen next-motions **arrive from Engine 2** (system 11), not from an operator-authored destination on the agent.

The flagship asks for something Story does **not** currently claim: the operator authors a **goal / goal criteria** that **is itself** an escalation point, with destinations **other agent** | **other workflow** | **end**, and **once met, met**.

**Silence (name it):** operator-authored goal-criteria; goal as modular escalation destination; “end” as a first-class destination distinct from `meeting_booked` and from Engine-2 arm-next. Story is **silent**, not contradictory — 12’s meeting booked remains the **loop-closer success event** (hard human gate). Do not collapse those.

**What would have to change, in order:**

1. **Promote Story** (system 7, possibly a chain into 11 and/or 12) with a new **must** if the founder wants this as machine law: the engagement package holds operator-authored goal criteria; when met, the runtime escalates to a named destination (agent | workflow | end) and does not re-open that goal. Until that promotion, Requirements must not invent the state.
2. **Then** Requirements extract a state (likely `goal` / `goal_criteria` as **rule** if criteria vary, plus a destination as **state or rule row** — kinds: state | rule | sequence only). Extrude later; do not design Ant.
3. **Then** table-first: a table only if Story bears it **and** modularity requires it (operator-modifiable). Likely a **rule** table (when + condition → destination) bound to the package (`sequence_template` / binding), not prose in `cascade.ts`. Destination columns would necessarily **reference** `sequence_template.id` / `enrollment.agent_ref`, `workflow.id`, or a terminal token. That is perimeter, not a second Automations redesign.
4. Runtime stays dumb: worker/cascade would **read** the row on criteria-met instead of only channel-ladder / Engine-2 arm-next. `action` remaining `call_agent`-only is the **inbound** Automations→Agents door; goal→workflow is the **outbound** reverse and would need an Action type or a trigger event — **V2 Action catalog is already backlog**; do not silently expand `CHECK (type = 'call_agent')` without Story.

If Story is **not** promoted, the flagship stays a product interpretation sitting on a finishing-event chain. Align the model **to** the flag; do not replace the flag with a generated stack.

---

### 4. Perimeter — starting points this goal clause opens (not those modules redesigned)

- **Automations / system 11 / `workflow` + `workflow_trigger`:** a goal can escalate **into** a workflow. Today the edge is the other way (`action.call_agent` → enroll). Starting point: an event type on `workflow_trigger` (e.g. goal-met) **or** a new action kind. Triggers stay Automations-interior (14:49 / 15:43: do not put triggers inside Agents).
- **Another Agent:** destination `agent_ref` → existing `enrollment` / `enrollAndActuate`. Dual entry already exists (workflow action **and** `POST /wire/machine/enrollments`). Goal→agent is a third *cause* of enroll, not a third author-seat.
- **Terminal / end:** close `active_attempts` without arming next; do **not** treat as `meeting_booked`. System 12 remains the human loop-closer.
- **`enrollment`:** the row that would start the next package; already has `agent_ref`, `sequence_id`, `workflow_run_id`.
- **`motion_decisions` / Engine 2:** today they choose nudge | reactivation | none **into** 7. Goal destination must not let Engine 2 **replace** the attempt engine inside a sequence (Story 7b/11 must-not). Perimeter question: does goal-met preempt Engine 2, or does Engine 2 still choose motion when the destination is “another agent”?
- **Record:** `engagement_records` already appends fired events; a goal-met event would be another append, not authorship.

Not in this perimeter as a redesign: Meta, escrow release, book-import mutate, Ant chrome.

---

### 5. Runtime map (so the next SA does not re-walk)

`cascade.enrollAndActuate` → `enrollment` + `active_attempts` (first cell channel; halt blocks **new** enroll). Tick: load `rule_attempt_criteria` + `seq_channel_ownership_order`; inbound override nullifies; due window fires once (`fired_criteria`); channel forward-only; `advanceTemplateCellIfDue` walks cells. `workflowWalk`: Trigger → … → Action `call_agent` → same enroll. `dispatchSend`: consent / halt / silence / SEND_MODE. `meeting_booked` via `POST /wire/machine/meetings`. No goal read anywhere.

Seeds: `002_machine_tables` (templates, firm-cedar bindings, attempt criteria 30/24/24 + SMS non-reply, channel/phase order, motion precedence, campaign running); `003_canonical_workflows` (three workflows + `workflow_trigger` + constants pack).

---

**Ask (inflection):** Promote Story 7 with an operator-authored **goal / goal criteria as escalation point** (destinations: other agent · other workflow · end; once met, met) **before** any Requirements extraction or table? I will not mint without that. Second, smaller: `sequence_definitions` is stood up and unused — collapse into `sequence_template`, or leave as V2 dead row?

**Do not:** overwrite the 15:43 flag; put triggers inside Agents; treat `meeting_booked` as the authored goal; generate a 7-item substitute.

---

## 2026-08-15 16:40 UTC — What a goal is (founder correction; no mint)

**Why:** Founder correction of the 16:28 “not housed / no goal” line. Capture founder wording. Align the model. Do not overwrite 15:43.

**Founder wording (this stamp’s substance, not a new flag):** A **goal is a completion of an objective**. Sequence **classes are classes of objective** — not random calendars. A goal is **required to create an agent** (and a workflow). Inside a class there are **mini-goals** (checkmarks). Escalation already lives at more than one level; **goals as escalation events** (including **between campaigns**) is one that **definitely emerges**.

**Correction of 16:28:** Reactivation already has a completion: **meeting booked**. Seed §4 / Story spine / system 12 / `meeting_booked` (007). Calling that “no goal” was wrong. The hole is narrower: **completion is not a first-class type on the package**, and it is **not** an operator-authored **escalation event**.

---

### Three objectives (already the class set)

Story 7 + `seq_phase_order` (seeded): **opt-in → re-engagement → reactivation**. Founder maps objective → completion:

| Class (objective) | Completion (the goal) | Already in the machine | Gap |
|---|---|---|---|
| **Opt-in / launch** | Consent / in-system: waitlist then **sign-up** (guidelines: waitlist = first opt-in signal, **primary success metric**; launch day = **the real opt-in**) | `consent_records.status` includes `waitlisted` \| `sequenced`. Map: Day3 waitlist → `waitlisted`. Activity badge **Complete** = opt-in finished. | Cascade **never writes** `waitlisted`/`sequenced`. `cs-waitlist` is on the **map** (`tables.ts`), **not** in seed `002`. |
| **Re-engagement (nudge)** | **Data request** complete — form submitted / facts in (Story 8 `fact_ask` → `fact_writeback`; OPERATOR-REVISIONS §5b: form submitted **closes the nudge and can arm the next**) | `fact_writebacks` table. Map row `acr-form-submit` → `state.finishing_event` `close_and_arm_next`. Template `tpl.reengagement.v1` cell is literally “data ask”. | `acr-form-submit` is **map-only** — **not** in `rule_attempt_criteria` seed. Reengagement calendar is a **placeholder** (two mixed cells). |
| **Reactivation** | **Meeting request** complete = **meeting booked** | `meeting_booked` table. Guidelines: slot booking rate = **the outcome**. Spine success event. | Table exists; it is **system 12**, not a field **on** `sequence_template` / the agent. Runtime does not treat book as “goal met → escalate.” |

SQL `sequence_class` has **four** tokens: `optin_launch`, `launch_day`, `reengagement`, `reactivation`. Phase order has **three**. Guidelines split waitlist (anticipation) vs launch-day (real opt-in). **Do not wash that.** Either launch-day is a second template **inside** the opt-in objective, or it is a fourth class — Story has not said.

`workflow` create has **no** goal column. Founder: you cannot create the agent **or** the workflow without the goal. That constraint is not in SQL.

---

### Mini-goals already in the corpus (opt-in / reactivation checkmarks)

Not a goal table. They live as guidelines metrics + some `rule_cohort_scoring` / `rule_metrics_thresholds` rows + engagement events.

**Opt-in** (`guidelines/Reactivation.md` Success Metrics — these are the checkmarks): SMS delivered; **Y-reply**; announcement **open**; announcement **click**; **social follow** (micro-yes); **waitlist conversion** (named primary); nurture open; unsubscribe (health, not completion). Top-tier reading: open+click+follow+waitlist.

**Reactivation** (same file, Metrics): Y-reply; view-click (no-login); nurture open; **booking**. Seeded `cs-top-tier`: “Y-reply + view-click + nurture-open + booking = top tier”. That is **cohort**, not “goal met.”

**Re-engagement** mini-goals are thinner: Story 8 field-class routing + one consolidated form. No denser nudge calendar in guidelines (named pending).

---

### Escalation is already layered — goal-as-event is the missing layer

| Level | What it is | Housed? |
|---|---|---|
| **1. Attempt sequencing** (within a node / owning channel) | Email criteria not met → text; 30/24/24; forward-only ladder | **Yes.** `seq_channel_ownership_order` + `rule_attempt_criteria` + worker. This is 7b. Do not rename it “goal.” |
| **2. Mini-goals / checkmarks** toward the class completion | Y-reply, waitlist, form submit, view-click | **Partial.** Corpus + some rule rows. Not a type. Not destinations. |
| **3. Sequence / class completion** | The objective is done (opt-in signed; facts in; meeting booked) | **Partial.** Reactivation → `meeting_booked`. Others: enum / map / prose. **No** `class → completion predicate` on the template. |
| **4. Between campaigns** | Completion of one package **escalates** into the next agent, a workflow, or **ends** | **Not housed as operator-authored data.** Story 7b: finishing event **arms next**; next-motion from **Engine 2** (`rule_motion_precedence`). Flagship hole is **this layer**: goal = escalation event. |

---

### Model delta (still no mint)

If founder law is: **class = objective**, **goal = that objective’s completion**, **that completion can escalate** — then Story 7 is not silent on *whether completions exist* (they do: meeting booked, waitlist/sign-up, form-submit). It **is** silent on: (a) completion as a **required** property of every agent/workflow, (b) mini-goals vs class-goal as two kinds, (c) completion as an **escalation event** with destinations agent | workflow | end.

Promote Story for (a)–(c) before Requirements extract a state. Table-first would then want a **rule** (when completion → destination), bound to the class/package — after Story bears it. Do not invent a generic `goal` table that duplicates `meeting_booked` for reactivation.

---

**Ask:** (1) Promote Story 7: sequence class **is** the objective; the goal **is** its completion; that completion **is** an escalation event (agent · workflow · end)? (2) SQL four classes vs founder three — is `launch_day` a class or a mini-goal/template **inside** opt-in? (3) Are mini-goals (Y-reply, waitlist, form submit) themselves escalation points, or only checkmarks toward the class goal?

**Do not:** overwrite 15:43; mint; call attempt-ladder a goal; collapse class-goal into `meeting_booked` for opt-in/nudge.

---

## 2026-08-15 16:50 UTC — Goal expansion marked down (excerpts; not Story must)

**Why:** Founder: this class of thing is **log-automatic**, and this expansion is **markdown-worthy** — they are expanding the idea and will not take it back. Detail must not stay in the background.

**Where (SA choice, not a second flag):**

| Place | Job |
|---|---|
| [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) | Durable home. Verbatim excerpts + three class completions + mini-goals from `guidelines/Reactivation.md` + four escalation levels + SQL 3-vs-4. **OPERATOR-REVISIONS grade — not Seed/World until Story promoted.** |
| [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) §7 | Labeled clarifier block pointing at that file (same pattern as 5b windows). Silences note: this is an expansion, not a silence for Requirements to fill. |
| [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) §5c | Sequencing stack: 5a calendar · 5b attempt · **5c goal / class-as-objective**. |
| [`../README.md`](../README.md) SA repo walk | So the next SA chat does not miss it. |
| This log | Pointer + excerpts below. Product flag stays PHASE-TWO-LOG 15:43. |

**Excerpts parked in SYSTEMS-GOAL (not left here as the only copy):** “A goal is a completion of an objective.” “A goal is critical to creating any agent … you can't even create the workflow without the goal.” “The way we even class sequences is by their objective.” Opt-in is not a random sequence; it has “check marks … mini goals” already in the repo. Engagement = “data requests.” Reactivation = “a meeting request.” “There is a goal, which is meeting books.” Escalation at “so many different levels”: within nodes = “attempt sequencing” (email criteria isn’t met → text); sequence completion (“could literally just be like a node”); “between campaigns” escalation points; “one that definitely emerges is goals as escalation events.” Durability: “I’m expanding the idea” / will not say it was a mistake.

**Still not done:** Story **must** not yet rewritten. No table. Open asks in SYSTEMS-GOAL remain (promote? `launch_day`? mini-goals as destinations?).

**Log rule added (this file header):** durable founder expansions → excerpts in the log **and** a register markdown. Do not leave critical wording only in chat.

---

## 2026-08-15 16:55 UTC — Agents loop walk: one break

**Why:** Founder: Agents module may have closed; some of what they said wasn’t required for completion; find a **true** gap or say there isn’t one. Test: if this is true, and X, what happens with Y. Walk the law; find what breaks. Automations is a **different** engine (same rigor later) — not this gap.

**Excerpts:** “completion of the agents module that might have just taken place” · “some of the things I said weren't required for the completion” · “more coherent module” · “something about the agents loop is pretty much closed, or is it?” · “something that isn't closed at all” · “If this is true, and X, what happens with Y?” · “walk down the existing logic, and you find what breaks” · Automations “we do need to … apply the same level of decomposition rigor” (later).

**Closed (authorship):** class = objective; sequence + order deployed; firm/default/overrides; attempt sequencing; mini-goals as checkmarks; goal = completion; when **met** → other agent · workflow · or end. That shape holds. Do not reopen `launch_day` or mini-goals-as-destinations as if they broke it.

**The break (one):**

If the goal-escalation fires **when the objective is complete**, **and** the sequence has finished deploying, **and** attempt/channel criteria are already spent (opened, clicked, …), **and** they still have not signed up / booked — what happens?

Not named. Attempt law is channel criteria, not class-goal. Goal law is **once met**. Calendar running out is neither.

Re-engagement is the exception: form started, not submitted → back to head (24h). Booking and sign-up have no such row.

Not Automations. This agent, after the last node, without the goal.

Parked on [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) so it is not only here.

**Ask:** is unmet-after-the-sequence-is-done still in-flight, retry (like the form), escalate anyway, or end? If that is “still in the agent until they complete or halt,” there is **no** Agents-interior gap.

---

## 2026-08-15 16:58 UTC — Failure mode (the obvious pole; class walk)

**Why:** Founder: already answered (last conversation / escalation). Unmet after **entire** escalation = **failure mode**. Failure criteria = not meeting the objective. What it *does* still needs work; cannot be silent. Two data axes. Walk the three classes. Suggestions welcome. Do not overwrite 15:43. Do not restore 14:58 “actions on goals” as the flag. 14:49 “failure rules (same family as escalation)” is **attempt-level**; this is **class-goal** after the whole stack.

**Excerpts:** “I actually already answered this, but I answered this in the last conversation” · “Escalation rules, but the answer is so obvious” · “if you run through the entire escalation, right, and you don't meet the goal, the objective, then it's a failure mode” · “you still have to define what does a failure mode mean” · “failure criteria is already defined by not meeting the objective” · “can it just fail silently? I mean, it does something” · “there's something in our … repo about, it's a score, a score that's related to contacts” · “data across at least two axes … effectiveness of our sequencing and campaign … even by as down to the node … all the way up to the entire campaign” · “also in data about that specific contact” · “why force another one” · “if it's an engagement campaign, we did need that data point” · “walk it down through across the different classes” · “I'm open to suggestions.”

**Score found:** `cohort_tiers` + `rule_cohort_scoring`. Guidelines drop-off reading. `engagement_records` + `metrics_flags` for the campaign/node axis. Worker writes engagement only. Not CRS.

**SA suggestions** (in [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md); not law): success escalates; failure is the other pole, default **not** “force another campaign.” Opt-in fail → end; do not enroll nudge/reactivation (consent). Re-engagement fail → `missing_fact_signal`; do not clone the nudge. Reactivation fail → record drop-off; do not auto-ask again; repeat-compression stays a silence.

**Ask:** class-walk rows correct, or a row is wrong?

---

## 2026-08-15 17:05 UTC — Opt-in is a campaign (two grains)

**Why:** Founder: 16:58 still a bit closed. Opt-in is a **larger campaign**. Agents = sequence rules, node content, attempt sequencing, **and** a larger-style campaign. Show reasoning; expand opt-in at that scale.

**Excerpts:** “I need to see the reasoning behind it. It's still a bit closed.” · “with the opt-in, especially the opt-in, we're saying that the opt-in is actually a larger campaign, don't forget.” · “What we're trying to do with agents module is to be able to define the sequence rules … contents for each node, so sequence for attempts. But also a larger style campaign” · “Talk about what the expansion of the opt-in could look like on a large scale campaign.”

**Reasoning:** Last table flattened **sequence = campaign**. Corpus already has two sequences under one opt-in objective: launch window (5–7d, waitlist) + launch day (the real sign-up). Mini-goals escalate **inside** that campaign (waitlist → launch day). Class failure is only after **A+B**. SQL `launch_day` is that inner sequence, not a fourth class.

**Between classes** still: don’t force another campaign. **Inside opt-in:** you do sequence-to-sequence.

**Open:** do non-waitlisted contacts still get launch day?

Parked on [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md).

---

## 2026-08-15 17:12 UTC — Handoff to PM (witnessing history, up to here)

**Why:** Founder leaving this SA chat to go back to the PM. Log everything up to this point as witnessing history. Do not invent a new idea in this stamp.

**Read (PM / next agent):** this stamp first. Then [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) for excerpts and the campaign diagram. Flag stays [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **2026-08-15 15:43 UTC**. Do **not** overwrite that flag with a generated list. Do **not** mint a table. Do **not** extract Requirements from SYSTEMS-GOAL until Story is promoted. Automations is the other engine — named, not decomposed here.

---

### What this chat witnessed (in order)

1. **Inventory vs flagship (16:28).** Stood-up Postgres `001`–`009`, map-only nodes, live vs stand-in ports. Goal-as-escalation-point was **not** a table. SA over-claimed “no goal.”
2. **Correction (16:40).** Founder: a **goal is a completion of an objective**. Classes are classes of **objective** (three: opt-in, re-engagement = data request, reactivation = meeting request). Meeting booked **is** the reactivation goal. Mini-goals = checkmarks inside a class (already in `guidelines/Reactivation.md`). Escalation already has levels; **goals as escalation events** (including **between campaigns**) definitely emerges. A goal is **required** to create an agent **and** a workflow.
3. **Marked down (16:50).** Durable expansion, will not be taken back. Parked [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) (OPERATOR-REVISIONS grade). Pointers: Story §7 labeled clarifier, OPERATOR-REVISIONS §5c, SA repo walk. Not Seed/World until Story promoted.
4. **Loop walk (16:55).** Agents **authorship shape is closed**. One walk-break: sequence fully deployed + channel criteria spent + objective still unmet → no law. Automations is later.
5. **Failure mode (16:58).** Founder: already answered (escalation). Run the **entire** escalation, don’t meet the objective → **failure mode**. Failure criteria = not meeting the objective. What failure *does* still needs work; **cannot fail silently**. Two axes: campaign/node effectiveness across contacts, and **that contact** (`cohort_tiers`). Do not default to “force another campaign.” Engagement still needed the data point. 14:49 failure rules = **attempt-level**. This = **class-goal** after the whole stack. Do **not** restore 14:58 “actions on goals” as the flag.
6. **Campaign grain (17:05).** Founder: 16:58 was still too closed. Opt-in is a **larger campaign**. Agents defines sequence rules, content per node, attempt sequencing, **and** a larger-style campaign. Last table flattened sequence = campaign. Corpus: launch window (5–7d, waitlist) + launch day (real sign-up) under **one** opt-in objective. Waitlist escalates **inside** the campaign. Sign-up = campaign goal. Class-failure only after **both**. SQL `launch_day` = inner sequence, not a fourth class. Between classes: don’t force another campaign. Inside opt-in: sequence-to-sequence.

---

### Founder wording this chat must not lose

> A goal is a completion of an objective.

> A goal is critical to creating any agent. … you can't even create the workflow without the goal.

> the way we even class sequences is by their objective.

> What is a reactivation? A reactivation is a meeting request. … There is a goal, which is meeting books.

> Why does someone get an engagement? … It's data requests.

> check marks that must be met inside of the opt-in, which are kind of like mini goals.

> one that definitely emerges is goals as escalation events.

> if you run through the entire escalation … and you don't meet the goal … then it's a failure mode. … can it just fail silently? … it does something.

> data across at least two axes … down to the node … up to the entire campaign … also … that specific contact.

> the opt-in is actually a larger campaign, don't forget. … sequence rules, contents for each node, so sequence for attempts. But also a larger style campaign.

> I'm expanding the idea. … not gonna … say … that was a mistake.

---

### Where it lives

| Artifact | Job |
|---|---|
| PHASE-TWO-LOG **15:43** | Agents **flag**. Untouched. |
| This log (stamps 16:01–17:12) | Witnessing history of the SA chat. |
| [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) | Durable expansion (excerpts, three class completions, escalation stack, failure walk, opt-in campaign diagram). |
| Story §7 | Labeled OPERATOR-REVISIONS clarifier only — **not** a promoted must. |
| OPERATOR-REVISIONS §5c | Pointer into SYSTEMS-GOAL. |
| Postgres | Unchanged this chat. No mint. |

---

### Still open (for the PM conversation — not filled here)

1. Promote Story 7 (class = objective; goal = completion; completion = escalation event; exhausted campaign = failure mode, not silent)?
2. What failure **does** at class grain — after the **whole campaign**, not after one sequence?
3. Launch day only for waitlisted, or the whole book still gets Sequence B?
4. Automations: same decomposition rigor, later.

SA suggestions on (2) are in SYSTEMS-GOAL (opt-in fail after A+B → campaign ends, no nudge/meeting; re-engagement fail → missing-fact signal, don’t clone the nudge; reactivation fail → record drop-off, don’t auto-ask again). Labeled suggestions, not flag.

**Do not (PM or next SA):** overwrite 15:43; mint a `goal` table that duplicates `meeting_booked`; put triggers inside Agents; treat attempt-ladder as a goal; flatten opt-in back to one sequence.

---

## 2026-08-15 20:10 UTC — Ascribe: Agents UI blueprint (PM package) vs stood-up machine

**Why:** Founder: check the newest PRs; there is a package for SA; answer it with the same rigor. Newest PR [#85](https://github.com/bywale-com/omcoda_tower/pull/85) — *Agents face: five-beat mock of the sequence canvas*. Dated prompt: `AGENTS-SA-PACKAGE.md` (20:00 on that branch). Plates C1–C7 + C2b/C5b. Law `AGENTS-FACE.md`. **This is a UI blueprint for systems handoff, not a systems blueprint.**

**Read:** 15:43 flag (untouched) · inventory 16:28 · SYSTEMS-GOAL · 17:05 campaign grain · then the package. Full A/B + rollup parked [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md) so the detail is not only in this log.

**Do not:** mint from pixels; put `workflow_trigger` on the canvas; restore discarded plates (content-as-siblings, content-as-button, attempt-cycles in the middle); invent a call table from C5; restore 14:58; overwrite 15:43.

---

### Per plate (short; quotes in the ascribe file)

```text
C1 —
A. Our system: sequence_template catalog. Empty world possible. Face: 3 sequence templates. SQL CHECK has 4 tokens including launch_day (campaign-grain stuffed into sequence_class). firm_sequence_binding UNIQUE (firm_id, sequence_class) = one per class per firm, not an open named catalog. sequence_definitions unused. seq_phase_order is the three phases — order, not catalog.
B. Externals / configs / possible?: none.
Affordances: partial. UI can look like this if catalog is curated to three. UI would change if C1 listed every sequence_template row (fourth card = launch_day).

C2 —
A. Our system: campaign / objective grain. No campaign table, no objective table. Closest: sequence_template optin_launch / launch_day as classes. Additional unnamed — Story silent. Hub Add-configuration is the seat, not workflow_trigger on this canvas. Qualify = finishing_event map-only. Save today = cells jsonb / binding.overrides (cell/variable).
B. Externals / configs / possible?: none.
Affordances: missing as rows. UI can look like this as authorship. UI would change if Set objective claimed persist.

C2b —
A. Our system: binary then name. Click → messaging_events / acr-email “link not clicked” (channel criteria, not an objective row). Book → meeting_booked (007); calendar vendor not a port. Form → fact_writebacks; acr-form-submit map-only, not in seed. No objective name column.
B. Externals / configs / possible?: Resend click live; no calendar port; form is in-app; webhook = Automations later.
Affordances: partial. UI can look like this as a picker. UI would change if Set objective saved a named binary on the campaign.

C3 —
A. Our system: two campaigns + qualify edge. Runtime is a flat cell cursor (templateWalk: ladder escalates within a cell). Seeded optin cells = day calendar, not two campaign nodes. campaign_states = firm armed/running — name collision. Override this off ≠ binding.overrides. C3 still says Form (honest to machine; stale vs C5).
B. Externals / configs / possible?: none.
Affordances: missing for campaigns + qualify as rows. UI can look like this as the face. UI would change if bound to cells as-is (calendar strip, not two cards).

C4 —
A. Our system: seq_channel_ownership_order + active_attempts.owner_channel. Seed text/email/form. loadChannelOrder firm then NULL; fallback ["text","email","form"]. No Override-this column. Form on this plate is honest to SQL.
B. Externals / configs / possible?: none until send.
Affordances: channel order housed; Override-this persist missing. UI can look like this. UI would change if the third closed medium were Call.

C5 / C5b —
A. Our system: cells subject/bodyText; outbound_messages 009. Channel rules = rule_attempt_criteria (30m/24h/24h). {{phone}} → contact_records.phone. Call/ElevenLabs: no port in registry.ts (live: espMailer Resend, smsApi Twilio). NormalizedCell.channel is text|email|form only. Do not mint call.
B. Externals / configs / possible?: Resend + Twilio live when secrets+DB. ElevenLabs not possible. Calendar not this plate. SMS 160-count is chrome.
Affordances: text/email partial; call missing. UI can look like this for text/email. UI would have to stay Form (or Call face-only) until Story + a call port.

C6 —
A. Our system: NULL-firm rule_*/seq_* = platform default. Channel order housed. Channel windows housed (those are not “number of attempts”). Attempt-cycle params (count, wait after last node, nth-sequence) silent. Global content ≠ a table. C6 Form = machine.
B. Externals / configs / possible?: none.
Affordances: partial. UI can look like this. UI would change if Save claimed attempt-count / nth-sequence / global content.

C7 —
A. Our system: inherit ≈ NULL-firm vs firm row. No per-family Override boolean on a sequence instance. Binding is firm×class, not CSS campaign→sequence→global. Per-campaign attempt rules “on the campaign”: no campaign table.
B. Externals / configs / possible?: none.
Affordances: partial. UI can look like this. UI would change if inherit/override Save had no row for which family is overridden.
```

---

### Rollup (not a new flag)

1. **Our machine.** Pictures traverse two grains SQL flattened into one: `sequence_template` + `firm_sequence_binding` (CHECK includes `launch_day`) for catalog/calendars; `seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts` + cascade for the ladder. Content = cells jsonb + `outbound_messages`. C2b completions already exist as **other** tables (`meeting_booked`, `fact_writebacks`, `messaging_events`) — not as an objective on a campaign. Runtime ≠ campaign graph. `workflow_trigger` is Automations — seat only.

2. **Externals.** Resend CEM + webhooks **live**. Twilio SMS **live**. Sending domains **live**. ElevenLabs **no port**. Calendar vendor **no port** (`meeting_booked` is ours). Form vendor **no**. Webhook completion = Automations later. No call port, live or stand-in.

3. **UI can look like this** as chrome on grains already named. **Honesty set (smallest):** (1) C5 Call vs machine Form — face-only or don’t save Call; do not mint. (2) C1 must stay curated to three sequence templates, or a fourth `launch_day` card lies. (3) Do not persist Override this / objective / qualify / attempt-count as if they were `overrides` jsonb. (4) UNIQUE `(firm_id, sequence_class)` cannot house many named sequences per class.

**If this is true** (sequence is a blank container for multiple campaigns), **and** binding is UNIQUE `(firm_id, sequence_class)` with `launch_day` itself a class, **what happens with** C3’s two campaigns inside one opt-in sequence? Today those are two sibling bindings, not two campaigns on one template. Housing question — not a mint.

**If this is true** (channel wires = campaign sequencing), **and** `tpl.optin_launch.v1.cells` is a day calendar of mixed mediums, **what happens with** Story 7a (calendar cells) vs 7b (ownership ladder inside a cell)? Face C4/C6 is 7b. Seeded opt-in is 7a. Do not collapse them in Settings.

**Grain-name witness:** 17:05 said opt-in is a larger **campaign** containing inner **sequences**. Face says opt-in is a **sequence** containing **campaigns**. Same two grains; words swapped. Face is what these plates ascribe to.

---

### Inflections (ask)

1. Call vs Form — keep Form on the machine until Story, or is Call a Story must now?
2. Campaign/objective housing before any table. Waitlist → launch day still open (17:05): only waitlisted, or the whole book?
3. C6 attempt-cycle params vs today’s channel windows — only windows are rows.
4. Automations later. Triggers stay off this canvas.

**Do not:** overwrite 15:43; mint call / campaign / objective / qualify from C3–C5; put Automations triggers here.

---

## 2026-08-15 22:41 UTC — Grain lock: sequence contains campaigns. Housing named. No mint.

**Why:** Founder confirmed the grain-name witness. More recent is current. Asked what table changes for that to be true, and whether PM should finish the face before SA builds (so SA is not on moving ground).

**Excerpts**

> everything that has come after take it as like the canonical thing

> the more recent is the more, um, current

> agents are sequenced … within a … blank agent sequence … it's campaigns. It's all, all campaigns within sequences.

> would you say it's better for us to go and … totally finish everything before we then come to you on the system side. I think that makes sense … so that if we're changing stuff in the future, you're not building on like constantly moving ground

**Canonical names (law of the grains, not a second flag):** Agent = sequence. Sequence is blank / agnostic. Campaigns live inside it. Launch window and launch day are **campaigns**, not sequence classes. `launch_day` in SQL CHECK is the lie. 17:05 used the opposite words for the same two boxes — witnessing only.

**Process:** Yes — finish what is still **moving** on the face before SA mints or rewrites `cascade`. This grain lock is **determined**; housing is named now so PM does not re-flatten `launch_day` into `sequence_class`. SA stays witness + conflict-namer until Story §7 is promoted.

**Determined (do not wait to name; do wait to migrate):** sequence⊃campaigns · three sequence templates · objective on the campaign · qualify between campaigns · empty world · Override this / content toggle / attempts not at channel · Automations triggers off canvas · no `goal` table duplicating `meeting_booked`.

**Still moving (finish or park before mint):** Call vs Form · attempt-cycle params on the campaign · C2 Additional · waitlist → who gets launch day · word “event” · mix objective types · campaign Settings modal · failure-*does* · 7a calendar vs 7b wires.

**Housing (no CREATE TABLE).** Keep: `seq_phase_order` (three) · channel ladder · completion tables as pointers · NULL-firm Settings · `campaign_states` as firm run-state (name collision) · `sequence_definitions` dead · `workflow_trigger` off canvas. Change when Story bears it: CHECK drops `launch_day` (three classes) · binding UNIQUE off `(firm_id, sequence_class)` · `cells` stop being the sequence spine · enroll into sequence, cursor = campaign then 7b · objective on campaign pointing at existing completions · qualify = campaign→campaign in the same sequence, distinct from Engine 2 between classes. Full table: [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md) § Canonical housing. Overlay: [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) 22:41.

**Do not:** mint tonight; reuse `campaign_states` for canvas campaigns; revive `sequence_definitions` as the campaign table; put qualify on `workflow_trigger`.

---

## 2026-08-15 22:50 UTC — Log is append-only. What you saw. Package cadence.

**Why:** Founder saw an in-place clean and asked. Also: keep SA in the discussion via packages; nothing cemented until “system time.”

**Excerpts**

> did I just see you clean off a part of a log and change it

> I don't feel like I like the idea Unless it's not difficult to go see like past logs

> every time we create one I will just like let you know. Hey, we've created a package. What do you think you can stay the conversation? It's just nothing is like cemented yet, but you're like kind of building your own like Framework on paper in the background

> once we do say, okay, we're done with everything It's definitely system time then you're like, okay great. Let's like really look at everything

**What you saw (honest):** The **SA log stamps were not deleted.** 16:01 through 22:41 are all still here, newest at the bottom. What *moved in place*:

1. **Current** at the top of this file — that is the index. It is supposed to move. A new chat reads that line, then the newest stamp.
2. **`SYSTEMS-GOAL.md` 17:05** — I annotated the old section and **replaced** its Open list with 22:41 wording. That is the clean you felt. Wrong. Restored this stamp: 17:05 Open is back; 22:41 stays a **new** section under it.
3. **`SYSTEMS-AGENTS-ASCRIBE.md`** grain-names block at the top — living extract, not this log. I rewrote “witness / do not fight” into “locked.” The 20:10 per-plate ascribe is still there; housing was appended.

**Law of this log:** append a new stamp. Do not edit a past stamp’s body. Current pointer is the only in-place line. Past logs are easy to see — scroll. Cleaning is not cleaner.

**Package cadence (yes):** Ping SA each package. I stay in the conversation. Nothing is cemented. I keep a paper framework (ascribe + housing notes + this log). When you say **system time**, I re-read every package against the notes and then Story / Requirements / tables. I am for that. I am not for minting between packages.

---

## 2026-08-15 22:55 UTC — Paper ascribe: Automations package (A1–A13)

**Why:** Founder curious — another package landed on PR #85 (22:17 / commit *chosen image lineup and Systems Analyst package*). Cadence: stay in the conversation; paper only; not system time.

**Prompt:** [`AUTOMATIONS-SA-PACKAGE.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/phase-two-app-facing-agents-2bec/docs/register/AUTOMATIONS-SA-PACKAGE.md). Face + blueprint A1–A13. Hub is the plant. Full A/B: [`SYSTEMS-AUTOMATIONS-ASCRIBE.md`](./SYSTEMS-AUTOMATIONS-ASCRIBE.md).

**Do not:** mint; treat A13 as a screen; collapse the two condition grains; put `workflow_trigger` on the Agents canvas; overwrite 15:43; edit a past stamp.

**What I think (short):**

- Smallest workflow (A1) is already `workflow.graph` + `workflowWalk` (trigger + action required; rule allowed).
- Rule GUI (A2) is Hub **TypeScript pack**, not a PG table. Walker only peeks `rule_eligibility_pathway` + `constants_packs`.
- Trigger (A5) is `workflow_trigger` — do not collapse with Agents C2b.
- Action SQL is `CHECK (type = 'call_agent')`. Hub also names `manage_lists` / `assign_task` / `notify_consultant`; walker ignores them (A7).
- Select agent = whole sequence (A8) matches grain lock. `WorkflowAgentRef` still includes `tpl.launch_day.v1` — Agents housing lie visible from this node.
- Required-data listing (A11/A12): `COLLECTIBLE_FIELDS` unused; `RuleEvaluationSummary` has no field rows. 21:36 was right. Do not mint a table from the listing.
- A10/A13 are diagrams. Fork is Hub If (`branch`, `lastOutput`). No Ant plate.
- Named code JS/Python (A4): no port.
- Ant has no Rule GUI. Honesty: Hub is the plant until Ant grows it.

Not cemented.

---

## 2026-08-15 23:00 UTC — Hub is reference only. Ant is the product. Systems for the pictured UI.

**Why:** Founder correction. Do not worry about the UI. Systems must change so the **images** work exactly. Hub is not continuing — it was the source for the pictures. All work is prototype Ant. Looked at A1–A13 and C3.

**Excerpts**

> I'm not asking you to don't worry about the UI Worry about the current systems and how they need to be changed to to make that UI work Exactly as it looks

> we will not be continuing working … hub … It just had the canonical automations and agents module So we just worked with that to replicate that image in … the ants design system But not no work is gonna commence or continue inside of hub Everything is moving … prototype ants

> I don't know if you actually be looking at the images I think you should

> we've not actually start working on the system, but we will we will work on the UI very very soon

**Discarded:** 22:55 “honesty = stay on Hub for Rules.” Hub TS is reference, not the plant.

**Systems so the pictures run (no mint tonight).** Automations: Ant Save must persist `workflow.graph` + materialize `workflow_trigger`; rule GUI rows must be data the walker **evaluates** (today TS pack + `LIMIT 1`); Output must carry a required-data **listing** (`COLLECTIBLE_FIELDS` unused; do not mint a second catalog); form on A12 **references those ids**; `action` CHECK is `call_agent` only — in-app kinds do not run; named JS (A4) has no evaluator; walker `evalBranch` is too thin for listing-not-empty; A13 is not a screen. Agents: 22:41 housing (campaigns inside sequence; drop `launch_day` as class) so C3 qualify runs. A12 caption “Re-engagement is a campaign” is stale pixels — the three cards are sequence templates.

Full table appended on [`SYSTEMS-AUTOMATIONS-ASCRIBE.md`](./SYSTEMS-AUTOMATIONS-ASCRIBE.md) § Correction 23:00.

**Do not:** mint; continue Hub; build a lattice page; campaign picker from the slipped caption.

---

## 2026-08-16 01:10 UTC — Main absorbed #85. C8 / A14 / event law (paper)

**Why:** Founder: look at main and the new PRs.

**What is on main:** Merge `c899df7` = PR [#85](https://github.com/bywale-com/omcoda_tower/pull/85) (01:06). Flag Current still **15:43**. PM Current **01:01**. No PR **#86**. Open besides us: #84 (this branch, behind main), #78 #77 #76 #70 (older). The new work is **on main**, not a new PR.

**Looked at:** PHASE-TWO-LOG 23:07–01:01 · C8 · A14. Images opened.

**Law that landed after our last ascribe (do not overwrite 15:43):**

- All **objectives are events**. Completion **is** the write-back. No special return wire. Automations **listens** (global = all of that kind; local = this one). Named: form completion, campaign failure, opt-out/unsubscribe. `WORKFLOW_EVENT_CATALOG` has **no** `form_submitted`.
- Failure of a campaign **is** an event; first named in-app action = **ascribe a tag**. No tag table.
- Lineage **queryable** (who created — agent vs hand — path, completion, time). Not the engagement chart. Do not mint a lineage table from the word.
- **C8:** enroll is this sequence’s Contacts. Add contact in the **header** (with Save / Launch). Two scopes only: **Every firm** (default) · **Select from** (everyone selected; deselect to pick one). Starts the mission **now**. Not Publish. Not an event.
- **A14:** Automations does **not** create agents. **Assign existing** or **create from a template**. Three sequence radios. No chevron.
- Still left on their list: **send** (3); **book-in door** (5); listing bind (build leftover of 4).

**Systems vs those pictures (no mint):**

| Picture / law | Stood up | Hole |
|---------------|----------|------|
| C8 Add to sequence | `enrollment` + `enrollAndActuate` (firm-scoped). Ant Contacts tab lists rows; **no Add contact** | **Every firm** is cross-tenant. `enrollment.firm_id` + halt are **per firm**. Walker/enroll take one `firmId`. That scope is not a filter on one firm’s book |
| C8 Select from | `contact_records` per firm | House-wide contact list is not a query we have as one enroll call |
| A14 assign existing | `firm_sequence_binding` + `agent_ref` → enroll into the bound template | One per class per firm (UNIQUE). Matches “the one you authored” only if there is one |
| A14 create from a template | No copy-then-enroll. `sequence_definitions` unused | New sequence **instance** then enroll — silent. Same UNIQUE fight |
| Objectives are events / form completion | Completions exist (`fact_writebacks`, `meeting_booked`, `messaging_events`). Trigger types exist | Those completions do **not** dispatch `workflow_trigger`. No `form_submitted` event name |
| Failure → tag | Failure mode named 16:58. No tag row | In-app action still `CHECK (type = 'call_agent')` |
| Lineage queryable | `enrollment.workflow_run_id`, `engagement_records` | No “who created / time-to-completion” query. Do not mint from the word |
| Send (still left) | Resend/Twilio live when secrets+DB; consent/halt in `dispatchSend` | Loop 3 is product-left, not a missing port |

**Do not:** mint; treat Every firm as a chrome checkbox; put enroll on Publish; build lineage as a screen; create-agent in Automations.

---

## 2026-08-16 01:25 UTC — Events = detectable table changes. Objectives are a kind. #87 clicks.

**Why:** Founder, before / as PR [#87](https://github.com/bywale-com/omcoda_tower/pull/87) landed: the pattern is emerging; once the PR is seen it clicks. System events boiled down = **a change inside the table**, detectable; **all** table changes should be detectable; those **are** events / triggers. Objectives already defined. Boils down to **events and objectives**.

**Excerpts**

> I think the pattern is really emerging very cleanly. And once you see that new PR, it'll just click perfectly.

> what is a system event anyway? It's just a change in the table … which is detectable, and it should be detectable. All changes inside every single table should be detectable. And those are events. Boom, those are events, triggers.

> Objectives, we've already defined objectives. We've made all kinds of examples of objectives. So I think it's really boiling down to events and objectives.

**#87 (looked at):** FACE law 32. Blank canvas; you can chain. Teaching walk: **firm created / provisioned** → **audit the contacts** → **if X** → **agents**. Provisioning is not only the firm row — things inside still have to happen. If reads previous result (rule **or** action). Completion is an event, so one canvas **or** two automations listening. Smallest workflow still stands. No new plate.

**Thoughts (alignment, not a flag):**

Yes. Same substrate as 23:16 / FACE 28 (write-back **is** the event). Sharpened:

1. **Event** = detectable table change. Not a catalog we invent first. The write is the fact. Listeners point at it.
2. **Objective** = already in [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md). Completions **are** events. **Not every write is an objective** (enroll, send, Save, halt).
3. “Every table detectable” = **capability**, not an operator list of every UPDATE. Global/local already scopes listeners.
4. **Do not mint** an events table that copies the write.
5. #87 clicks because each step **is** a write (or a read of one): `firms`/`ct_firms` insert → audit/eligibility write → if (read) → `enrollment` insert. Later objectives (`fact_writebacks`, `meeting_booked`, consent sign-up) are the same grain.

**Stood up vs this law (no mint):**

| Law | Stood up | Hole |
|-----|----------|------|
| Any table change detectable | `dispatchEventToWorkflows` matches `event_name` **string** + firm + active | Closed catalog. Not “the write happened.” Hardcoded fires: `eligibility.changed`, `audit.completed`. `handleMachineEvent` is a **push**, not a detect |
| Operator names | Hub `WORKFLOW_EVENT_CATALOG`: eligibility.changed · contact created/updated · import.created · audit completed/failed | No form_submitted, firm-provisioned, campaign-failure, meeting-booked, opt-out |
| Completions are events | Rows exist | Those rows do **not** dispatch (01:10 still true) |
| Firm provisioned | `firms` UUID **and** `ct_firms` TEXT | Dual tenancy. Which write is the teaching event? Ununified |
| Audit the contacts | `audit_events` append; eligibility path | Not an `action.type`. CHECK still `call_agent` only |
| Schedule / manual / webhook | Trigger **types** on `workflow_trigger` | Not table-change events. Do not wash them into this boil-down tonight |

Durable park: [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md). Ascribe add: [`SYSTEMS-AUTOMATIONS-ASCRIBE.md`](./SYSTEMS-AUTOMATIONS-ASCRIBE.md) § Paper 01:25.

**Ask (inflection):**

1. Confirm: event = detectable table change; objective = named completion (**a kind** of those); not every write is an objective?
2. Capability vs catalog — every table **can** be heard; the picker is a **named subset** (do not fill tonight)?
3. Authorship Save (`sequence_template` / `workflow.graph` UPDATE) — detectable, but **not** an operator trigger?
4. Schedule / manual / webhook stay as non-table-change trigger types?

**Do not:** mint; fill the catalog; put triggers on Agents; overwrite 15:43; edit the 01:10 stamp; treat #87 as Story.

---

## 2026-08-16 01:35 UTC — Answers locked. Ready to connect — not to build Agents/Automations.

**Why:** Founder answered the 01:25 asks, then: looking at today’s paper, ready enough to spin implementation — actually **two** agents — UI and systems, connecting. First the UI or the systems?

**Excerpts**

> not every write is an objective. Yeah. … every objective is an event But not all events are objectives. That's totally true

> every table can be heard. … it doesn't need to be filled tonight. … it'll be obvious … when we need to … create an automation for this … the table supports it already because it's a detectable thing … create a UI for it and connect it to that … Boom

> number threes builds from number two perfectly … better that it's uncovered when we hit a workflow that we need

> not everything needs to be watched Needlessly or rather not every everything is already watched by default … we don't need a UI Selection for everything … yet

> those are separate like triggers for events. … Are they non table? I don't know. I think they have tables … when we get to that point We'll cross that bridge … we shouldn't need to change a lot … of our systems

> we're ready enough to like, go ahead and do something. … spin up. An implementation agent … both work on the u I and the system side of things when it comes to connecting. I actually want to spin up two agents. … First build the ui in the systems. Is that how it'll go?

**Locked (do not re-ask):**

1. Event = detectable table change. Objective = named completion (a kind). Not every write is an objective. Every objective is an event; not all events are objectives.
2. Capability vs catalog: can hear every table. Catalog fills **when a workflow blocks**, by connecting UI to that table. Not in advance.
3. Authorship Save picker = (2). Uncovered when needed.
4. Schedule / manual / webhook = **separate trigger types**. Table-or-not later. Small systems change expected.

**Watch law:** detectable ≠ watched. Not watched by default. No picker until a workflow needs that write.

Parked on [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md) § Confirmed 01:35.

**Thoughts — ready or not:**

Ready enough to **connect**. Not ready to “build Agents” and “build Automations.”

Still moving / not this spin: Call vs Form; attempt-cycle params; waitlist → launch day; C2 Additional; 7a vs 7b; failure *does*; send; book-in; listing bind; C8 Every firm (cross-tenant); teaching walk (audit not an action type; If too thin; dual tenancy); Agents housing mint (campaign rows, drop `launch_day`) — that is **system time** on Story 7, and 22:41 said finish the moving face first. 22:50: nothing cemented until system time.

What **is** ready: the boil-down, the pictures for A1 / A5 / A14 assign-existing, enroll + `dispatchEventToWorkflows` + completion tables already stood up. Ant Agents Save/Launch already hit the machine. Ant Automations Save is a **flash tag** (in-memory) — that is the honesty hole.

**UI first or systems first?** Neither as a phase. Founder’s own #2: hit the need → connect UI to the table. Two agents on **one slice**, not one module each.

**The slice:** listen to **one** existing completion write (`fact_writebacks` or `meeting_booked`) → assign **existing** agent (`call_agent` / enroll). Systems: persist + dispatch on that write. UI: pictured A1 Save real; A5 picker = only that completion; A14 radios. No catalog fill. No teaching walk. No housing mint.

Brief: [`CONNECT-SLICE-PACKAGE.md`](./CONNECT-SLICE-PACKAGE.md).

**Ask:** Is that the first spin — one completion heard → existing agent assigned? If yes, paste the two blocks in that file. If you want C8 this-firm Add contact instead (or as well), say so — enroll is already there; Every firm is not.

**Do not:** mint; fill the catalog; plant Hub; overwrite 15:43; treat this as system time on Story 7.

---

## 2026-08-16 01:44 UTC — Pictures are the spec. Enough. Connect is the middle once.

**Why:** PM restated the middle. Founder: UI-first; if the images exist, the rest is a systems question; their job is to say what should happen — have they detailed that enough?

**PM (alignment, not a flag):** Do not spin “build every event and every objective.” Starts stay open (connect UI to the table when a workflow needs it). **Middle = hear the write → run the graph → If on the previous result → assign / enroll.** The connect slice **is** that middle, once. Agents authorship middle is **named**; housing/Save not stood up; Call face-only; send known leftover. Automations more **unbuilt than unknown**. Build the machinery. First ticket still one completion heard, one existing agent assigned.

**Founder excerpts**

> that's why I always think from UI first … the UI and those images you've generated exist right now … then everything is just a system question

> all I can do is describe what I want to happen. And then it knows what should happen

> the save button should be what, like, pushes something to the back end. Like, I don't know a lot about that. Like, that's not my job. Right? My job is to say exactly what I want to happen.

> have I not detailed that enough? Isn't that obvious enough from like, everything that I've done? Plus the images plus the specs of each thing.

**Thoughts:**

Yes. You have detailed **what should happen**. That is the job. You do not specify persist paths. 23:00 already: systems change so the pictured UI works **exactly**. Save means the picture is true — not a flash tag.

The first ticket is not because you under-specified. It is so implementers do not build every plate and mint a catalog. PM is right: that ticket **is** the middle working, once.

“If the UI exists, everything is a system question” — **yes** for: does Save persist, does the write fire the graph, can If read the last result, does assign enroll. **No** for inventing the still-open leftovers (Call live, Every firm as house-wide enroll, failure *does*, additional opt-in objectives, operations catalog). Those stay founder/PM when they show up. Same as events: connect when the workflow needs it.

Agents: the sequence/campaign/Override/channel/content/Settings/enroll middle is **named**. Honest Save of every toggle still needs housing (campaign row, Override this, attempt-count). That is systems, from your pictures — not a new product question. Do not persist Override this into `overrides` jsonb (20:10 honesty).

Automations: trigger · rule · If · action are named. Unbuilt: real Save, dispatch on completion, action only `call_agent`, rule still a TS pack, If thin. You pictured those. You do not owe a backend essay.

**Do not:** treat “enough” as mint-everything; ask the founder for SQL; overwrite 15:43.

---

## 2026-08-16 01:47 UTC — Three seats. Who wires. Is SA done.

**Why:** Founder: is SA the CTO / the one who specs the backend / only tables? Who connects pictured UI to the machine? Is there a third person for integration? Is SA fully done so they can begin?

**Excerpts**

> maybe I'm considering you a CTO, but the systems analyst

> maybe all you do is create the tables … specify

> who is doing this connection of like, okay We have the UI we have the specs … the nodes and systems that … need to exist on the back end for the front end to connect

> maybe there's a third person that does the actual like Integration work that that would make the agents module actually work the automations module work Who is that person? And what do we need them to do? And is your job fully [done] for them to begin?

**Seats (not a new flag):**

| Seat | Job | Not |
|------|-----|-----|
| **You / PM** | What should happen. Pictures, FACE, flags. | Persist paths. SQL. |
| **SA (this seat)** | What the machine **is**. Tables, relations, stood-up vs silent, what Save must write, what a write must fire. Story → Requirements → housing **when you say system time**. The implementation brief so they do not invent. Stay when the next workflow needs a table. | Ant chrome. Product flags. The PR that makes Save persist. Not CTO-as-company. Closest analog: machine architecture. |
| **Implementer (the third)** | Integration. Ant Save → those rows. Completion INSERT → `dispatchEventToWorkflows` → walk → enroll. Look like the pictures. `npm run build` + a manual walk. | Invent event catalogs. Mint campaign housing. Overwrite 15:43. Ask you for SQL. |

Identity already: “You **design the systems** … you say what the machine is, what it must be able to do, and what would have to change in the model.” I name the door. They cut the hole and hang the Save on it.

Two implementers on one slice is still **one third seat**, split UI / persist. Not a fourth philosophy.

**Is SA done so they can begin?**

For the **connect slice: yes.** Brief is [`CONNECT-SLICE-PACKAGE.md`](./CONNECT-SLICE-PACKAGE.md). Tables exist. Dispatch exists. Enroll exists. Honesty holes named. Do-nots named. Spin them.

For **both modules, forever: no.** Housing is paper. Story 7 not promoted. I have not minted. I have not written the walker. I stay — next table when a workflow blocks, next housing when you say **system time**.

**Do not:** I write the connect code in this seat; treat paper housing as CREATE TABLE; leave after the first ticket.

---

## 2026-08-16 02:03 UTC — Handback accepted. Don’t-mint was not law. Change packet.

**Why:** Implementation specialist / CTO handback via founder. “Don’t mint” was treated as law. It isn’t. SA inventoried and named; did not write the change. Pictures are the spec. Ask: finish 22:41 + Automations ascribe in connect-package form for every plate. Accept / correct / replace their draft. Not “go write the SQL.” Not another stamp that says wait for Story.

**Excerpts (theirs)**

> What exists is the past. What we specified today is what must exist, exactly as the pictures, UI and tables.

> I treated SA’s “don’t mint” as a law. It isn’t. That’s their job, and they didn’t finish it.

> If a control is on the glass, it needs a row, a field, or a relationship.

> They did the analysis of the machine. They did not finish the change-management deliverable.

> the ask is not “go write the SQL.” The ask is: take 22:41 and the Automations ascribe and finish them in the same form as the connect package — for every plate

**Done:** [`SYSTEMS-CHANGE-PACKET.md`](./SYSTEMS-CHANGE-PACKET.md). Accept their campaign / objective / channel / CHECK / dispatch / tag / rule_pack. Corrections against SQL: `action.agent_ref` must be nullable; no second `sequence` table (`template_id` is the sequence); class token `optin` not `optin_launch`; `enrollment.sequence_id` already exists; provisioned = `ct_firms` this pass; Every firm = loop `contact_records`; failure write = `campaign_failure`; call vs form tokens not collapsed; Hub in-app besides tag → `engagement_records` this pass.

**Still open (only):** waitlist gate value; C2 Additional disabled; per-campaign attempt chrome (columns anyway); Hub list ≠ tag later.

**Do not:** stuff `cells` / `overrides`; mint `goal` or an events log; reuse `campaign_states`; revive `sequence_definitions`; skip the packet because connect-slice said don’t mint.

---

## 2026-08-16 02:07 UTC — Seat lock. Packets. Founder only.

**Why:** Founder: “don’t mint” was a stale PM law. Moving forward this is the job.

**Excerpts**

> that was a stale law, the don't mint from the PM.

> this is why you exist. You're not just here to chime in. You're meant to create these packets. You're meant to change management, systems analysis, detail what needs to be detailed, make those hard decisions, and then document your in packets so that the implementer literally just only has to implement and do no analysis.

> You're in charge of ensuring that the implementer succeeds, and that's ensuring that the system is well built

> You don't take … Instructions from the PM or the implementer. You take instructions from me. You're talking with me.

**Locked:** Packets are the deliverable. Hard decisions are this seat. Implementer cuts only. Instructions = founder. PM pictures/flags = spec on the glass, not job-law. Implementer drafts = input to correct, not orders. Identity updated in [`../README.md`](../README.md) § Systems Analyst.

**Do not:** wait for PM “system time”; wait for an implementer to write the change list; chime only.

---

## 2026-08-16 02:23 UTC — Caption audit. Packet stripped of founder labels.

**Why:** Founder: UI quirks we hoped SA had not baked in. PR #87 [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). Audit the packet.

**Excerpts / law**

> There is no first objective. There is an **objective**. You string the next campaign when that objective is met. The C3 pill is a founder caption of that distance, not a node.

> **Launch window** and **Launch day** are example campaign names … The operator can rename both. **“They opt in”** is a title at best, not an objective class. A green tick on “objective met” is allowed chrome. It must not become `qualify_gate`, a qualify node, or a systems question.

> The 17:05 waitlist-vs-whole-book fork is **not on C3**. If that rule is still needed, it is a new ask.

**What I had frozen (wrong):** `qualify_gate`, `qualify_next_campaign_id`, `source` CHECK `launch_window` \| `launch_day`. Waitlist left “open” off that caption.

**Hard decision now:** next campaign = next `ord` when this campaign’s objective is met. No qualify object. `campaign.name` TEXT. `source` only `template` \| `scratch`. C2b `kind` radios stay (spec). `sequence_class` three tokens stay as **kind** (`seq_phase_order`), not as C1 label. Seed **may** use those example names. Waitlist is not in this packet.

**Do not:** mint qualify; freeze example names; treat “If X” as a field (A16).
