# Systems — ascribe: Automations UI blueprint vs stood-up machine (paper)

**Seat:** Systems Analyst.  
**When:** 2026-08-15 22:55 UTC.  
**What this is:** paper framework on PM package [`AUTOMATIONS-SA-PACKAGE.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/phase-two-app-facing-agents-2bec/docs/register/AUTOMATIONS-SA-PACKAGE.md) (PR [#85](https://github.com/bywale-com/omcoda_tower/pull/85), 22:17 lineup). **Not cemented. Not system time. Not a mint.**  
**Law:** PHASE-TWO-LOG **15:43** untouched. Automations face + plates A1–A13. Hub `/hub` is the complete plant. Ant Automations is a poorer translation; Rule GUI **does not exist** there.  
**Does not:** mint tables; treat A13 as a screen; collapse inside-the-rule condition with If-after-rule; put triggers on the Agents canvas; invent an operations / output-class catalog; overwrite 15:43.

Agents ascribe still stands: [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md). Grain lock: sequence contains campaigns.

---

## Per plate

### A1 — Smallest workflow: trigger · rule · action

**A. Our system:** `workflow.graph` JSONB (`004`). Node kinds Hub already names: `WorkflowNodeType` = `trigger` | `constant` | `branch` | `rule` | `action` | `exit`. Runtime: `workflowWalk.ts` — “Trigger → Constants → Conditions → Rules → Action → Exit”; `isValidatedPipeline` requires trigger + (action or exit); constant / branch / rule **may be missing**. A1 is the definite middle the face wants. Seed `003_canonical_workflows.sql` already three workflows with trigger → … → `actionType: enroll_sequence`. Not an Agents sequence (`sequence_template`). `workflow_state` draft/active/paused.

**B. Externals:** none on the canvas itself.

**Affordances:** stood-up in Hub graph + walker (smallest shape). **UI can look like this** (Hub already does). Ant workbench exists as translation; Rule GUI missing is later plates. **UI would change if** A1 were claimed to be an agent sequence.

---

### A2 — Rule GUI (toggles, condition rows)

**A. Our system:** Hub pack `IMMIGRATION_SERVICE_ELIGIBILITY_PACK` in `src/app/data/automationRules.ts` — families with `defaultEnabled`, conditions `leftField` · `operator` · `constantKey`. **In-memory TypeScript, not a Postgres rule-pack table.** Closest PG: `constants_packs` (walker loads payload); `rule_eligibility_pathway` (walker `SELECT … WHERE enabled=true LIMIT 1` — a pass flag, not the GUI matrix); `eligibility_evaluations` / `eligibility_results`. Story 10 / Engine 2 adjacent. Creatable / industry-modular: **silent in SQL**. Walker does **not** evaluate field·operator·constant rows.

**B. Externals:** none (constants are ours). Client data paths like `client_data.information.canadian_skilled_hours` imply the contact/primary store — `contact_records.body` JSONB / `primary_store_rows`, not a typed field table.

**Affordances:** partial (Hub GUI **is** the plant; PG is thin). **UI can look like this** because Hub already looks like this. **UI would change if** Save claimed a new rule-pack row — there is no pack table.

---

### A3 — Same rule, Custom JSON

**A. Our system:** Escape hatch. No `custom_source` / JSON body column on a rule. Could be stuffed into `workflow.graph` node data. Walker has no JSON-rule evaluator.

**B. Externals:** none.

**Affordances:** missing as a first-class row. **UI can look like this** as chrome. **UI would change if** Custom Save were the runtime.

---

### A4 — GUI constant beside named code (JS/Python), both on/off

**A. Our system:** Prefer constant when possible → `constants_packs`. Named code created in the rules module, still toggles: **Story silent. No JS/Python evaluator in `workflowWalk`.** Outcomes on/off ≈ Hub `defaultEnabled` on the TS pack, not a row.

**B. Externals:** a JS/Python runtime — **not a port** in `registry.ts`.

**Affordances:** constant side partial; named-code side missing. **UI can look like this** as authorship. **UI would change if** the Python/JS block were claimed to run.

---

### A5 — Inside trigger: event or schedule

**A. Our system:** `workflow_trigger` (`006`): `type IN ('event','schedule','manual','webhook','constant')`. `materializeTriggersFromGraph` writes those rows from the graph. Hub `WorkflowTriggerKind` matches. **Do not collapse with Agents C2b** (binary campaign objective). This is Automations’ event-of-origin. Routes: `POST /wire/hook/:webhookId`. Event names in Hub (`audit.completed`, `eligibility.changed`, …) — not a PG enum.

**B. Externals:** webhook ingress — **possible** as stood up (our hook, not a vendor). Schedule is ours (no cron port named live). Event-from-outreach: `engagement_records` / `messaging_events` exist; wiring those names into `workflow_trigger.event_name` dispatch is **partial**.

**Affordances:** types housed. **UI can look like this.** **UI would change if** the event picker listed Agents C2b binaries as trigger types.

---

### A6 — Add a node, select Action

**A. Our system:** Authoring `workflow.graph` nodes/edges. Hub palette includes Action **and** If/branch. Walker comment: does **not** walk arbitrary free-form graphs (v2). A1 has no If; Hub has If in the palette — remainder, not this plate.

**B. Externals:** none.

**Affordances:** partial (graph jsonb yes; free-form walk no). **UI can look like this** as Hub already does.

---

### A7 — Two kinds of action: Agents vs in the application

**A. Our system:** SQL `action` (`004`): `type TEXT … CHECK (type = 'call_agent')` — **Agents enroll only.** Hub chrome `WorkflowActionType`: `enroll_sequence` | `manage_lists` | `assign_task` | `notify_consultant`. `workflowWalk.actionAgentRef`: only `enroll_sequence` and `call_agent` resolve; anything else → `null` (no in-app effect). V2 Action catalog is already backlog (SA 16:28). Do not invent a longer catalog.

**B. Externals:** Agents path → cascade send (Resend/Twilio) after enroll. In-app kinds: no list-vendor / task-vendor / notify port required by Hub names — those would be **our** tables if Story named them. None executed.

**Affordances:** Agents kind stood-up; in-app kinds **named in Hub, silent in SQL + walker**. **UI can look like this** as a split. **UI would change if** in-app Save were claimed to run.

---

### A8 — Agents as the action (prior; select-agent law)

**A. Our system:** `action.agent_ref` + `enrollment.agent_ref` → `enrollAndActuate`. Select agent = **whole sequence** — matches grain lock (campaigns inside; no campaign picker). `workflowWalk.sequenceClassForAgent` still treats `launch_day` as a **class** and `WorkflowAgentRef` still lists `tpl.launch_day.v1` — **Agents housing lie**, not this plate’s job to mint. Form on this plate is the **blank builder**; canon form is A12. Package line “Re-engagement is a campaign” is the 20:24 word; FACE law 9 already: campaigns live inside sequences; you select the agent (the sequence). Treat law 9.

**B. Externals:** enroll → live send via Agents ports when secrets+DB.

**Affordances:** enroll stood-up; objective/form on this node missing (A12). **UI can look like this** for select-sequence. **UI would change if** it offered a campaign picker.

---

### A12 — Form questions are the required-data listing (canon form)

**A. Our system:** `COLLECTIBLE_FIELDS` (`src/app/data/collectibleFields.ts`) — `self_reportable` vs `document_dependent`; **unused**. Completions: `fact_writebacks`, `missing_fact_signals` (`field_key`). No form-definition table. No bind from rule output → questions. Story 8 `fact_ask` / one consolidated form. Document-dependent never enter: **in the unused catalog**, not in runtime. Form lives in Automations (face) — Agents has no form builder. Embedded lean: on the action node, not a graph node.

**B. Externals:** none (in-app form). Not Typeform.

**Affordances:** catalog exists unused; bind **missing**. **UI can look like this** as chrome. **UI would change if** questions were typed from scratch (that’s A8 prior) or invented off-catalog.

---

### A9 — Rule Output today vs gap (prior)

**A. Our system:** `RuleEvaluationSummary`: `headline`, `pass`, `pathwaySignals`, `gapSignals`, `recommendedServices`, `nudge`, `reactivation`. Matches the plate. Hub client eval (`buildSummary`). Not a PG output row. `signals` / `motion_decisions` are **contact / Engine 2**, not the rule-node Output tab. Do not split the rule (one / the other / both) — `rule_motion_precedence` already: reactivation first, nudge only if not. Walker rule step is eligibility pass, not this summary object.

**B. Externals:** none.

**Affordances:** Hub-today stood-up as TS summary. Gap (form / enrich / consume) named — **not filled**. **UI can look like this** as “today.”

---

### A11 — Required data as a listing on Output (canon Output)

**A. Our system:** **Not stood up** (PM 21:36; confirm). `RuleEvaluationSummary` has **no** field-row listing. `COLLECTIBLE_FIELDS` unused. `missing_fact_signals` is per-contact `field_key`, not a class on rule output. Do **not** mint a table from this picture. Closest: emit listing into summary from the unused catalog when Story bears it.

**B. Externals:** none.

**Affordances:** missing. **UI can look like this** as the face. **UI would change if** Output were bound to `RuleEvaluationSummary` as-is (no listing).

---

### A10 — Lattice; required-data missing (prior, **diagram**)

**A. Our system:** Idea, not a screen. Fork = Hub `branch` / `if`; `runIfConditionNode` reads `lastOutput`. Walker `evalBranch` is `eligibilityPass` true/false — **thinner**. No Ant plate of that node (named remainder).

**B. Externals:** none.

**Affordances:** Hub If stood-up; lattice page must **not** be built. **UI would change if** A10 were ascribe’d as a screen.

---

### A13 — Lattice with listing class (canon **diagram**)

**A. Our system:** Same as A10 with the hole filled as listing. Condition “listing not empty → create form from those rows” is the If-after-rule calling previous results — Hub has the node; listing is not on the result yet (A11). **Not a screen.** Founder: different kind of picture.

**B. Externals:** none.

**Affordances:** idea named; listing + Ant If plate missing. Do not ascribe as a node screenshot.

---

## Under-specified remainder (name; do not invent UI)

| Remainder | Machine already? | Story |
|-----------|------------------|-------|
| If node after the rule (Ant plate) | Hub `branch` / `runIfConditionNode` **yes**. Walker thin. No Ant plate | Named. Do not invent the plate |
| Constants as canvas node | Hub + walker `constants_packs` **yes**. No Ant plate | Hub-as-built |
| Full operations catalog | Data request spoken. Walker = enroll | **Silent.** Do not invent |
| Full exit points | `exit` node kind exists; walker enrolls on action | **Silent** besides start/select agent |
| Form node vs embedded | No form table. Lean embedded (A12) | Open on the face |
| Remaining output classes | A9 summary fields. Do not invent rest | Silent |
| In-system action kinds | Hub names three. SQL `CHECK (type = 'call_agent')` | V2 backlog. Do not lengthen |
| Word “event” | `workflow_trigger.type = 'event'` vs Agents C2b binary | Do not collapse |
| Ant Rule GUI | Does not exist. Hub does | Face = pictures until built |
| Required-data listing in code | Catalog unused. Summary has no listing | 21:36 named not stood up. Do not mint |

---

## Rollup (paper, not a flag)

### 1. What in our machine this lineup is looking at

Automations is `workflow` + `workflow.graph` + `workflow_trigger` + `action` + `workflowWalk` → `enrollAndActuate`. The **rule** the pictures open is Hub’s TS pack (`automationRules.ts`), not a PG pack table; walker only peeks `rule_eligibility_pathway` + `constants_packs`. **Two condition grains are already split in Hub:** inside-the-rule rows (A2/A4) vs `branch` If after the rule (`lastOutput`). A10/A13 diagram the second grain; they are not screens. Collectible catalog exists and is unused. Rule output today is `RuleEvaluationSummary` (signals, not field rows). Action SQL is **`call_agent` only**; Hub also names in-app kinds the walker ignores. Form bind (A12) has no row. Agents enroll still resolves `launch_day` as a sequence class — the Agents housing lie, visible from this action node.

### 2. Externals the pictures call

| Picture | Possible as stood up? |
|---------|------------------------|
| Webhook trigger | **Yes** — `workflow_trigger.type = 'webhook'`, `POST /wire/hook/:webhookId` |
| Event / schedule trigger | Types housed. Schedule is ours. Event dispatch from `messaging_events` **partial** |
| Agents action → send | **Live** Resend/Twilio after enroll, same as Agents |
| JS/Python named code | **No port** |
| Form vendor | **No** — in-app |
| In-app action vendors | **No** — not executed |

### 3. UI can look like this — honesty set

**The UI can look like this** as Hub chrome (A1–A8 select-agent, A9 today). Ant can look like the mocks **as pictures**; Rule GUI is not in Ant — honesty: Hub is the plant until Ant grows it, or operators stay on Hub for Rules.

**Picture would have to change to stay honest:**

1. **A11/A12 bound to today’s Output** — there is no listing on `RuleEvaluationSummary`. Chrome can look like A11; persist/bind cannot.
2. **A13 as a screen** — it is not. If node is Hub `branch`. No Ant plate.
3. **A7 in-app Save runs** — SQL `CHECK (type = 'call_agent')`; walker skips other kinds.
4. **A4 named code runs** — no evaluator, no port.
5. **A8 campaign picker** — select agent = sequence (FACE law 9 + grain lock).
6. **A5 listing C2b binaries as trigger events** — do not collapse.

### 4. Changes / additions (only if Story bears it — **do not mint from this package**)

- **Required-data listing on rule output:** Story is **silent** as a must (21:36 named a hole). Adjacent: unused `COLLECTIBLE_FIELDS` + `missing_fact_signals`. Filling the listing is **output shape on the existing Hub summary / walk context**, not a new collectible table from A11. Do not mint.
- **`action.type` CHECK:** widening beyond `call_agent` is the V2 Action catalog already backlog. Story has not promoted in-app kinds. Name the silence.
- **Rule pack as a table:** modularity law says creatable ⇒ row. Pack today is TS. Story has not named “operator-created rule packs” as a must. Name the silence. Do not mint from A2.
- **Form definition:** no table. A12 bind is a **reference to listing ids**, not a second field catalog. Wait for Story.
- **Do not** put `workflow_trigger` on the Agents canvas. Do not collapse the two condition grains. Do not invent operations/exits/output classes.

---

## Paper vs cement

This file is the background framework for the Automations package. Nothing here is Story. When founder says **system time**, re-read this against the packages and then promote / extract / table-first. Until then: witness + conflict-namer.
