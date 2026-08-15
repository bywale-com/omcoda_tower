# Systems Analyst — log

**Seat:** Systems Analyst (machine). PM / founder product talk stays in [`PHASE-TWO.md`](./PHASE-TWO.md) / [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md). Identity: [`../README.md`](../README.md) § Systems Analyst.

**Purpose:** Running log so a new Systems Analyst chat starts where the last one stopped.

**Current (read first, then the newest stamp at the bottom):** 2026-08-15 16:55 UTC — Agents authorship shape is closed. One walk-break: sequence fully deployed + channel criteria spent + class goal still unmet → no law. See SYSTEMS-GOAL.md. Product flag stays PHASE-TWO-LOG 15:43 UTC.

**How we maintain this log** (same discipline as Phase Two)

- Unless the founder says “mark this as a separate entry/doc,” SA work lands **here** — append-only, newest at bottom.
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
