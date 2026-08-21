# Systems Analyst — log

**Seat:** Systems Analyst (machine). Packets + hard decisions so the implementer only cuts. Identity: [`../README.md`](../README.md) § Systems Analyst. Instructions from the **founder** only. PM flags: [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) (read for the glass, not for job-law). Engineer always-on: repo-root `AGENTS.md`.

**Purpose:** Running log so a new Systems Analyst chat starts where the last one stopped. Stamps are **witnessing history** (what was said, what was corrected, what was parked) — not a second Agents flag.

**Current (read first, then the newest stamp at the bottom):** 2026-08-21 09:50 UTC — **022** objective met is a Local event · **023** failure = stop spending, keep listening. Objectives are the billable unit ([`SYSTEMS-OBJECTIVE-ESCROW.md`](./SYSTEMS-OBJECTIVE-ESCROW.md), direction). Flag **15:43**.

**How we maintain this log** (same discipline as Phase Two)

- Unless the founder says “mark this as a separate entry/doc,” SA work lands **here** — append-only, newest at bottom.
- **Do not edit a past stamp.** Corrections are a **new** stamp. The only line that moves in place is **Current** at the top (an index, so a new chat does not hunt).
- Do not overwrite product flags. Align the model to [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) Current pointer.
- Cadence floor while in session: **at least four times a day**; denser conversation → denser stamps.
- Notice inflection (Story/Requirements delta, table mint or refusal, map-vs-Postgres split, founder correction) and **ask**.
- Stood-up SQL is **`origin/main`**. Stamps **2026-08-16 through 2026-08-20** (packets 010–021, inhabit rewrite) live on PR [#86](https://github.com/bywale-com/omcoda_tower/pull/86) until that docs PR merges — fetch that pull ref; do not treat the gap in this file as unanswered work.
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

## 2026-08-21 08:20 UTC — New SA seated from the repo. This is the job.

**Why:** Founder: you are the new SA. Find out what this means by going through the repo. Cloud always-on (`AGENTS.md`) still seats Engineer; this chat overrode it.

**Accepted:** Systems Analyst. Not PM. Not Engineer. Instructions from the **founder** only. Product flag **15:43** read-only. Face `/prototype-ant`. Hub is not the app.

**What this seat is (from the repo — not a generated flag):**

- You **design the machine**: Story (must / must-not / chain / silence) → Requirements extract → map → Postgres + a **dumb runtime**.
- Kinds: **state | rule | sequence**. Anything operator-modifiable is a table. UI is only **control** (writes an existing state) or **pane** (displays an existing state).
- **Event = the INSERT/UPDATE.** Do not mint an `events` table that copies the write.
- Missing / unspecified store is **this seat**. Data in tables; the implementer waits. Founder speaks **modules**; you map to tables. Do not ask them to name tables.
- Deliverable = **change packets + hard decisions** (columns, CHECKs, FKs, which INSERT fires dispatch, walker cases) so the Engineer **only cuts**. You are in charge of them succeeding.

**What a new occupant on `main` would miss (this is the inhabit gap):**

- This file on `main` **froze 2026-08-15 23:00**. Live Current is PR [#86](https://github.com/bywale-com/omcoda_tower/pull/86) **2026-08-20 19:20 UTC** — packet **021** pickup first; **019** landed [#107](https://github.com/bywale-com/omcoda_tower/pull/107); **020** waiting. Identity rewrite (11:30 on that PR) already dropped the “walk 001–009 then first question then AGENTS-SA-PACKAGE” start ritual. Inventory is **16:28** in this log. Do not redo it.
- Packet numbers **≠** migration numbers after `012`. SA **016** landed as `017_event_test_contract.sql`. Migration `016` is Trigger Local. Migration `013` is operator book people, not packet 013.
- `AGENTS.md` is Engineer always-on (correct default). If the chat seats SA, stop implementing and fetch #86.

**Walked `origin/main` SQL (confirm-or-refute leftovers named on #86):**

| Leftover | On main |
|----------|---------|
| House seed **draft** | **Yes.** `015_house_notes_handle.sql` inserts `wf-house-contact-import`; `workflow_state` = `draft`. |
| `import.created` type ghost | **Yes.** `src/app/data/automationWorkflows.ts` still unions `"import.created"`. Live event is `contact_import` (`017` contract + house graph trigger). |
| Get is a node | **Yes.** `GET_MODULES` in `automationGet.ts`. Walker has Get. Empty last handle → `N = 0` (packet 017 / `chainWrites`). |
| `COLLECTIBLE_FIELDS` SPA catalog | **Yes.** `src/app/data/collectibleFields.ts` still the product list. Packet **021** mints `collectible_fields` and kills that constant. |
| `action.type` `call_agent` only | **Stale (16:28).** `010` widened to `call_agent` \| `ascribe_tag` \| `manage_lists` \| `assign_task` \| `notify_consultant` \| `run_audit`. |
| sequence⊃campaigns | **SQL.** `010`: `campaign`, `campaign_objective` (click/form/meeting → completion tables), `campaign_channel`. `launch_day` class dropped. |
| 015 handle | **Live.** `workflowWalk.ts` `previousWrites` = last node; `chainWrites` = available. |

**Waiting (do not recut landed):** **021** first — Form occupancy is this run’s `missing_fact_signals` (A40). Then **020** — Operator panes; no `firm_readiness`. Do not recut 015 / 019.

**Did not:** generate a second Agents flag; mint; recut 015; copy #86’s docs tree onto this stamp; overwrite 15:43.

**Do not:** treat this `main` copy as live Current after 23:00 without fetching #86; start AGENTS-SA-PACKAGE as if unanswered; ask the founder to name tables.

---

## 2026-08-21 08:40 UTC — How far objectives got. Last Engineer PR did not move them.

**Why:** Founder: most recent completed Engineer PR + most recent packets — how far did that go in establishing **objectives as a thing**; where was it prior; what if anything furthered it.

**Hard (quote SQL / walker, not screens):**

There are **two grains**. Do not wash them.

| Grain | What it is | Housed? |
|-------|------------|---------|
| **Campaign objective** (C2 / C2b) | Named completion **on a campaign**: click · form · meeting, pointing at an existing completion table | **Yes, 010.** Table `campaign_objective`. UNIQUE one per campaign. |
| **Class / flagship goal** (15:43 · SYSTEMS-GOAL) | Sequence class = objective (opt-in / re-engagement / reactivation). Goal = that completion. That completion **escalates** to other agent · other workflow · or end | **Paper.** No destination row. Story §7 still not promoted. |

### Prior (before 010 / PR #88)

No `campaign` table. No `campaign_objective`. Completions already existed as **other** tables: `messaging_events`, `fact_writebacks`, `meeting_booked`. 16:28 said goal-as-escalation was not housed. 16:40 correction: meeting booked **is** the reactivation goal — the hole was “not a type on the package.” 22:41 named the housing (sequence⊃campaigns; objective on the campaign pointing at those completions). No mint that night.

### What established it as a thing (not last week)

**PR [#88](https://github.com/bywale-com/omcoda_tower/pull/88) / `010_sequence_campaign_housing.sql`.** Engineer cut the 22:41 housing.

- Table: `id`, `campaign_id` FK, `kind` CHECK `click|form|meeting`, `name`, `completion_table` CHECK `messaging_events|fact_writebacks|meeting_booked`, `source` template|scratch. UNIQUE `(campaign_id)`.
- Seed: Launch window = click → `messaging_events`; Launch day = form → `fact_writebacks`; Nudge = form; Book a meeting = meeting → `meeting_booked`.
- Ant **Add objective / Set objective** persists via `saveSequenceHousing` → `campaignHousing.saveHousing`.
- Worker tick (`cascade.ts`): **campaign cursor first** — `campaignObjectiveMet` then `advanceEnrollmentCampaign` (next `ord` in the same sequence). Last campaign met → `enrollment.campaign_id` NULL. That is **end of this sequence’s campaigns**, not flagship destination.

`campaignObjectiveMet` is coarse: **any** row in that completion table for `(firm_id, contact_id)`. Not “this link,” not “this form,” not this campaign’s objective id.

### Last completed Engineer PR — did not further it

Merged **[#107](https://github.com/bywale-com/omcoda_tower/pull/107)** (2026-08-20) — If two wires + Switch paths (packet **019**). Automations fork. No `campaign_objective`. No objective-met trigger. Same for the Automations stack before it: #106 seat, #105 Test/Run/Launch, #104 data-in-tables, #103 tag, #102 A34, #101/#100 in-app Action, #99 Test contract, #97 A26–A28.

PRIMITIVES still lists **“An objective was met”** as an Automations event (Global = that kind; Local = this objective / campaign). **A26 does not.** `TRIGGER_SELECT_EVENTS` has Form submitted / Campaign failed / meeting is not even on the named list (`meeting_booked` is in the **017** test contract, excluded from A26 by comment “Do not add … meeting”). There is **no** `objective_met` event. Completions can be heard as their **own** writes (`fact_writebacks`, `meeting_booked`). The objective **row** is not dispatched.

### Most recent packets

**021** (uncut, pickup on #86): Automations Action — objective radios **first** (click · form · meeting), then A14 unfiltered. Graph `data.objectiveKind`. **Must not INSERT `campaign_objective`.** Completions stay on the **agent**. Click / meeting interiors out of that packet. This would let Automations **name the kind** when assigning; it would not mint a second objective store.

**020** waiting: Operator panes. Not objectives.

**Did not:** mint; recut 015 / 019; treat #107 as the objective cut; overwrite 15:43.

**Do not:** collapse campaign-objective with class-goal; call any-row-in-`messaging_events` “this objective was met” as if it were Local; put objective-met on A26 without a packet.

---

## 2026-08-21 08:55 UTC — Correction: the open Engineer PR is #108. That is the A40 cut.

**Why:** Founder: not the last *merged* PR. The current one, not merged yet.

**That PR:** [#108](https://github.com/bywale-com/omcoda_tower/pull/108) — *Occupy Form with this run's required-data listing (A40)*. Packet **021**. Draft. One commit on `cursor/form-class-a40-279b`.

08:40 answered #107. Wrong object. #107 is If/Switch, already on main. #108 is the live Engineer cut.

### Prior (Automations Action · Agents, on main today)

Assign cards first. Then “2 · Create the objective”: typed name + Data-request switch. Questions painted from `COLLECTIBLE_FIELDS`. Teaching: “The objective limits which agents you can select.” `formQuestionIds` on the node. No `objectiveKind`. `campaign_objective` is **Agents** housing (010), not this node.

### What #108 actually does (quote the branch)

**Face.** Three radios **first**: Click this link · Submit this form · Book a meeting. Form selected → one Form box. Occupancy = drop Required data (`missing_fact_signals` folder, A31). Unfold = those `field_key`s. Then A14, **all three** sequence classes, unfiltered. Teaching line / assign-first / Create-the-objective block **killed**. Unset radio → `configured === false`.

**Store.** Graph `data.objectiveKind` (`click|form|meeting`). Walker `call_agent` copies that plus `fieldKeys` (from the occupied writes) onto `action.payload_binding`. **No `INSERT` into `campaign_objective`.** Completions stay on the **agent**. Click / meeting interiors are radios only — no boxes in this packet.

**Also in the same PR (not the objective grain):** `018_collectible_fields.sql` (kill SPA catalog as the product list); Rule INSERT of self-reportable `missing_fact_signals` only; Get contacts also emit current audit writes.

### How far that goes as “objectives as a thing”

| Established on #108 | Not this PR |
|---------------------|-------------|
| Automations can **name the kind** (the three cores) before assigning a sequence | A new objective **row**. Still `campaign_objective` on the campaign, written from **Agents** |
| Form-objective **occupies** this run’s required-data listing | Click / meeting interiors |
| Kind is required to configure the Action | Flagship destinations (other agent · workflow · end) |
| Sequences stay agnostic (law 9 recut) | “An objective was met” as an A26 trigger |
| | Filtering agents by the radio |

So: #108 furthered objectives **on the Automations Action** — the operator must pick click / form / meeting. It did **not** mint a second objective store, and it did **not** move the Agents campaign cursor. That cursor is still 010.

**Did not:** recut 015 / 019; treat #107 as this answer; overwrite 15:43.

**Do not:** INSERT `campaign_objective` from this Action; lock form to re-engagement; filter A14 from the radio.

---

## 2026-08-21 09:30 UTC — Objective met **is** a Local event. Packet 022. The gap was the axis on the row.

**Why:** Founder: events/triggers have a solid mechanism underneath — writes we designated as triggers. Objectives must have that same underneath. The sequence runs, the objective is met — **what does that mean systematically?** It is akin to a Local event: *this* form filled and submitted by *this* user, back into the system, system detects it and says “they submitted this form — what’s that sequence?” That mapping/matching is the SA job to finish. Production level, no waiting. UI already built; this is systems only.

**Founder wording (durable):**

> events, triggers in automations — the mechanism underneath it is very solid … it's just writes … that we've designated as triggers

> now objectives — has that kind of underlying?

> the essential idea is that this agent sequence runs, and this objective is met. What does that mean systematically?

> it's akin to a local event … basically this specific form is filled and submitted by this user … back into the system, so the system is able to detect that and say oh, they've submitted this form. Okay, what's that sequence?

> that's the mapping and the matching that we're talking about here … that's what I'm asking you to finish

> as far as UI is concerned, that's all the UI … that exists right now … it's really all just systems so that the engineer can build the backend

> there's no waiting anymore … everything is getting built at the production level

**Accepted. The analogy is exact, and it is not a metaphor — it is the same mechanism.** Cut parked: [`SYSTEMS-CHANGE-PACKET-022.md`](./SYSTEMS-CHANGE-PACKET-022.md).

### The finding (quote SQL)

A Local event = **the write** + **an instance axis on that row**. `contact_import` is Local because `contact_records.import_batch_id` is a column. `campaign_failure` is Local because `campaign_failure.campaign_id` is a column.

Completions have the write. **Two of three have no axis:**

| Kind | Completion | Axis on the row today |
|---|---|---|
| `meeting` | `meeting_booked` | `enrollment_id` — nearly there |
| `form` | `fact_writebacks` | **none.** `form_ref` is in the dispatch payload and **never persisted** (`004` has no column) |
| `click` | `messaging_events` → `outbound_messages` | **none.** No enrollment / campaign / objective / attempt on the send |

So `campaignObjectiveMet` is Global-shaped: `SELECT 1 FROM <completion_table> WHERE firm_id AND contact_id`. **Any** past meeting satisfies **any** objective. A meeting from last quarter completes today’s launch window. Also accepts `accepted`/`delivered` as a “click.” That is the bug under the founder’s question. Not a Story silence — a missing column.

### The cut (no mint)

1. **Stamp the ask.** `outbound_messages` += `enrollment_id`, `campaign_id`, `campaign_objective_id`, `attempt_id`. `fact_writebacks` += `form_ref`, `campaign_objective_id`. `meeting_booked` += `campaign_objective_id`. `messaging_events` gets **nothing** — it joins the send (one fact, one write).
2. **Match Local.** Completion must carry this objective’s id (click resolves through the send join; `clicked` only). **No stamp → no match, fail closed.**
3. **Latch is the cursor.** `enrollment.campaign_id` already advances (010). The flip is once by construction. NULL = the sequence ended. History = `engagement_records` `objective_met` append — which finally gives map-only `state.finishing_event` a runtime write. **No `campaign_objective_met` table** (that would be the 13:20 copy).
4. **Detect on the write, not only the tick.** `advanceEnrollmentCampaign` is called only inside the tick’s `active_attempts` loop — so an objective met **after** attempts close advances nothing. That is the **16:55 walk-break**, and this closes it: reverse lookup on every completion INSERT (facts handler, meetings handler, click webhook), tick kept as catch-up.
5. **`objective_met` dispatches.** `local_ref = campaign_objective_id`. `workflow_trigger` needs **no** schema change.

### Flagship consequence (open since 16:28 — now closed)

15:43 “the goal is itself an escalation point: other agent · other workflow · or it ends” needs **no destination column and no `goal` table**. Escalation is a **subscription**: another workflow = a workflow triggered on `objective_met` Local to that objective; another agent = that workflow’s `call_agent`; ends = no listener + cursor NULL. Story §7 promotion is a **wording** must, not structural, and is **not** required to ship this.

**Still open (named, not filled):** what **failure** does after the whole campaign (16:58). `campaign_failure` exists; what it *does* is a founder call. Out of 022.

**Did not:** mint; recut 015 / 019 / #108; add UI; touch 010 DDL; promote Story myself; INSERT `campaign_objective` from Automations.

**Do not:** match a completion by bare `contact_id`; treat `accepted`/`delivered` as a click; copy the objective onto `messaging_events`; mint a met/latch table; renumber a landed migration (022 cuts as `019_objective_local_axis.sql` if #108 took `018`).

---

## 2026-08-21 09:50 UTC — Failure = stop spending, keep listening. Packet 023. Objectives are the billable unit.

**Why:** Founder answered the one thing I said was theirs (open since 16:58): what failure **does**. It is not an ending — it is a **spending decision**. And the reason it matters is commercial: objectives are what we get paid on.

**Founder wording (durable — parked so it is not only here):**

> the failure mode is simple — it just means we're not gonna waste resources on trying to make that objective happen. But if it happens, if it clears, then of course it's still a win.

> this just matters because once we build the escrow … contingent pricing … that's the angle ultimately, is that we get paid on objectives met.

> reactivation is like an objective that we get paid on … as long as there's money in the system, when that objective is met, that objective is counted and we get paid.

> while that sequence is running, the person can't take their money out, and that objective can't be retracted.

> if we couldn't meet the objective in their attempts … whenever the objective is met it still counts and we get paid. However, they cannot take out their money.

> once they do that, then that whole objective is nullified totally. So even if they submit afterwards, even if they book a meeting afterwards — they can't … that link for the meeting is done. Nullified.

> that's where we're going. I'm not saying building right now.

**The distinction (this is the whole law):** failure closes the **outbound** only. **Exhaustion is ours; nullification is theirs.** We stop spending; only the firm pulling their money stops the listening — and then the **door refuses**, not merely the tally.

| | Outbound | Inbound | Money |
|---|---|---|---|
| Pursuing | spending | listening | held; cannot withdraw; objective cannot be retracted |
| **Exhausted** | **stops** | **still listening** | still claimable — “it still counts” |
| Nullified (escrow era) | stopped | **refused** | withdrawn; void even if they act after |

**Cut:** [`SYSTEMS-CHANGE-PACKET-023.md`](./SYSTEMS-CHANGE-PACKET-023.md). Depends on 022 — before 022, “stop spending” and “stop listening” were the **same switch**, because `advanceEnrollmentCampaign` only ran inside the tick’s open-attempt loop. 022 split them.

**Bug the law fixes (quote `cascade.ts` ~533):** on `!toChannel` the ladder records `campaign_failure`, dispatches it, and leaves `active_attempts.status='open'`. The tick re-picks it, so **every** later due window writes **another** `campaign_failure` and **re-dispatches** the event. That is the resource waste the founder is naming, plus a duplicate-event bug on any subscribed workflow.

**Decided:** attempt → `status='exhausted'` in the same transaction as the failure INSERT (tick already filters `open`, so spending stops with no query change). `enrollment` += `pursuit_state` (`pursuing|exhausted`) + `exhausted_at`, reset on cursor advance. Cursor is **not** nulled. Forbidden on exhaustion: nulling `campaign_id`, invalidating any link/door, unstamping 022 evidence, or gating `onCompletionWrite` on `pursuit_state` — **a completion on an exhausted pursuit is a normal win.** No forced next campaign (16:58 stands).

**Name collision flagged:** `active_attempts.status='nullified'` already means *“they responded — a win”* (inbound override, meeting booked). A nullified **objective** is money-pulled. Do not overload that word or column.

**Parked direction:** [`SYSTEMS-OBJECTIVE-ESCROW.md`](./SYSTEMS-OBJECTIVE-ESCROW.md) — objectives are the billable unit; three states money reads; what it will still demand (a **claim ledger** as the one future mint, because “was this claimable at the instant it completed?” cannot be recomputed — withdrawal-vs-completion ordering *is* the payment question); escrow as stood up is thin (`escrow_acceptances` = firm-level acceptance, no balance/price/withdrawal/release; port is a **stand-in**); withdrawal has no write today; nullification must be enforced at ingress (`access_links.invalidated_at` is that mechanism already).

**Story:** this **partially fills** the §3 silence *“Escrow release trigger / outcome definition.”* Founder gave the **trigger** — release is on **objective met**. The **outcome** half (pricing, which objectives bill, withdrawal terms) is still silent. Naming a trigger is **not** promotion; Requirements must not extract a claim state yet. Story §3 musts still bind: terms are firm↔Om Coda, Tower holds no immigrant funds, the contact pays nothing — the escrowed money is the **firm’s**.

**Did not:** build escrow / pricing / a claim ledger; mint anything for the direction; promote Story myself; recut 015 / 019 / #108; overwrite 15:43.

**Do not:** treat exhaustion as an ending; gate 022 detection on `pursuit_state`; reuse `nullified`; let a nullified objective be merely uncounted; force another campaign on failure.
