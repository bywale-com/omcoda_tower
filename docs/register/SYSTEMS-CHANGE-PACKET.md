# Systems — change packet (implementer brief)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 02:03 UTC.  
**What this is:** the standing change-management deliverable. This is the SA job. Pictures are the spec. For each plate: alter / add / persist / dispatch. Implementer **cuts** this (`010_…sql` + walker + Ant Save) and does **no** analysis. Not another “don’t mint.” Founder is the only instruction source.  
**Handback:** Implementation specialist / CTO drafted the missing layer. This file **accepts** that draft, **corrects** it against stood-up SQL, and **leaves only the actually-open** product questions.  
**Flag:** PHASE-TWO-LOG **15:43** untouched (product). This packet is the machine change that makes those pictures true.  
**Join:** 22:41 housing · Automations ascribe · [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md) · [`CONNECT-SLICE-PACKAGE.md`](./CONNECT-SLICE-PACKAGE.md) · pixel walk [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md) (PR #87 — **02:31**, every canon PNG; 02:19 coverage table is superseded).

Do not reuse `campaign_states`. Do not revive `sequence_definitions`. Do not mint `goal` copying `meeting_booked`. Do not mint an `events` table that copies the write. Do not stuff campaigns into `cells` or Override this into `binding.overrides`.

---

## Accept / correct / still open

**Accept (their draft = the model):** three classes matching `seq_phase_order`; drop `launch_day` as class; drop UNIQUE `(firm_id, sequence_class)`; bind a sequence not a class; default opt-in is a flag; `campaign` child; `campaign_objective` pointer at existing completions; `campaign_channel` when Override this is on; enroll into sequence, cursor = campaign; `templateWalk` cells stop being the spine; `action.type` widen + walker runs; trigger `grain` + `scope`; Save materializes triggers; dispatch on the write; `contact_tag`; `rule_pack` as a row; listing = unused `COLLECTIBLE_FIELDS` on output; A14 copy-then-enroll falls out of the binding change; A10/A13 not screens; Call is a **port**; C2 Additional disabled.

**Correct (stood-up SQL they didn’t quote):**

1. **`action.agent_ref` is `TEXT NOT NULL`.** Widening types without making it nullable breaks `ascribe_tag` / in-app kinds. Nullable. Required only when `type = 'call_agent'`.
2. **Do not mint a separate `sequence` table.** `sequence_template` **is** the sequence row. Binding already has `template_id` → that is `sequence_id`. Add nullable `sequence_template.firm_id` (NULL = platform catalog). Drop the UNIQUE on class; add `is_default`.
3. **Class token is `optin`**, not `optin_launch` — match seeded `seq_phase_order`. Data-migrate `optin_launch` → `optin`. `tpl.launch_day.v1` becomes a **campaign** on the opt-in sequence, not a class row.
4. **`enrollment.sequence_id` already exists** (nullable, no FK). Add FK + `campaign_id`. Do not add a second sequence column.
5. **Firm provisioned — pick for this pass:** `ct_firms` INSERT. Machine book / `enrollment.firm_id` / `contact_records.firm_id` are TEXT CT keys. Auth `firms` UUID is the other tenancy; emit the same `event_name` later when unified. Do not leave both as silence.
6. **Every firm** is not a new enroll table. `enrollment` stays one row per `(firm_id, contact_id)`. Walker loops `contact_records` (TEXT firm ids). Select from = that firm’s book.
7. **Failure needs a write.** Event without a row is not a design. Add `campaign_failure`. That INSERT **is** the event.
8. **Channel tokens:** face `campaign_channel.token` = `text | email | call`. Seeded ladder `seq_channel_ownership_order` = `text | email | form`. Do not collapse. Call stores composer; it does not dial until the port. Form remains the third **send** medium.
9. **`manage_lists` / `assign_task` / `notify_consultant`:** walker must not skip. Writes: `ascribe_tag` → `contact_tag`. The other three → `engagement_records.event_kind` + `payload` this pass (no list/task/notify table). Do not mint those.
10. **Inherit/override booleans** live on `firm_sequence_binding` (this firm’s sequence), not stuffed in `overrides` jsonb. Global = NULL-firm `rule_*` / `seq_*` / `seq_attempt_cycle`.

**Still open (do not invent; do not use to skip the rest):**

1. C2 Additional — unnamed. UI disabled. No third template token.
2. Per-campaign attempt **chrome** — not drawn. Columns on `campaign` anyway.
3. What a Hub “list” is if it is not a tag — later. This pass `manage_lists` writes `contact_tag`.

Waitlist → who gets the next campaign is **not on C3**. Closed as a UI/systems question from that plate. If you still want that rule, it is a **new ask** — do not hide it in `qualify_gate`.

Send, book-in, lineage query — leftover product. Not a reason to withhold this packet.

---

## Caption / pixel walk — what I wrongly froze (02:23) and what the PNGs added (02:31)

Read [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md) before cutting. **02:19 was a coverage table. 02:31 opened every canon PNG.** A dash is not a look. C3 law unchanged.

**Drop these from 02:03 (still):**

| I specified | Kind | Correction |
|-------------|------|------------|
| `campaign.qualify_gate` (`objective_met` \| `waitlisted`) | Founder caption + 17:05 fork | **No column.** Green tick / “objective met” is chrome. Not a gate. Waitlist fork is a new ask, not C3. |
| `campaign.qualify_next_campaign_id` | Qualify as an edge | **No column.** Next campaign = next `ord` on the same `sequence_id` when **this** campaign’s objective is met. There is no “first objective.” There is an objective. You string the next campaign. |
| `campaign_objective.source` CHECK `launch_window` \| `launch_day` \| `scratch` | Example names as types | **No those tokens.** `from_scratch BOOLEAN` (C2b) or `source IN ('template','scratch')`. Names are `campaign.name` TEXT — operator renames. |
| Seed that every opt-in **must** be Launch window → Launch day | Frozen teaching pair | **May** seed those **names** on two campaigns. Must not require them. Must not CHECK them. |
| “They opt in” as launch-day class | Title at best | Objective `kind` is C2b radios (`click` \| `form` \| `meeting`) + `name` TEXT. Not a class. |
| C3 plate → persist qualify FK | Caption as node | Persist two `campaign` rows + `ord`. Distance is chrome. |

`sequence_class` CHECK `optin` \| `reengagement` \| `reactivation` **stays**. That is Story 7 / `seq_phase_order` / class-by-objective (16:40), not the C1 catalog **label**. `sequence_template.label` is renamable. Do not CHECK “Opt-in” the string. Do not require every sequence to have two campaigns.

**Hard decisions from the pixel walk (implementer does not re-decide):**

| Pixel fact | Systems |
|------------|---------|
| “qualify — first objective met” on **C3, C4, and C5** | **One** caption. **Zero** columns. Not three nodes. Not on C5b. Not on any A plate. |
| **C5 ≠ C5b** | C5 = spine + open channels + composers. C5b = composer crop only (Harbor / Alex / intake = **E**). Persist composers from C5b **shape**, not the example copy. |
| C4 mediums Text · Email · **Form** | Stale vs C5 **Call**. Persist `campaign_channel.token` `text\|email\|call`. Do not add `form` because C4 still shows it. |
| C5b “via ElevenLabs” | Illustrative. Not a column. Call **saves** `content` jsonb. Does not dial until the port. |
| C5b goal dropdown “Click the link (opt-in)” | **E.** Not a fourth `kind`. |
| C6/C7 Form as third channel | Same stale. Ladder seed stays `text\|email\|form` until Call port. Authored wires are Call. |
| Compare versions · Publish version (headers) | **Generated drift.** Persist path is **Save · Launch**. Do not map Publish to enroll. |
| Catalog Nudge vs Opt-in vs Launch window | **Generated drift.** Ignore. |
| A1 list “4 nodes” / canvas 3 | Drift. Smallest = trigger · rule · action. |
| **A6 palette** Trigger · Rule · Action · **Exit** | `exit` is a **node kind**. `workflow.graph` may hold it. Walker already allows action **or** exit. |
| **A15 palette** Trigger · Rule · Action · **Condition (If)** | `branch` is a **node kind**. **Do not freeze one palette from the other.** Graph allows both Exit and If. UI may show a subset. No palette CHECK. |
| A7 background **Branch** “Reactivation-worthy?” | **Generated drift.** Not the smallest workflow. If = **A16**. |
| A7 “lists, tasks, records” | Do not invent a longer `action.type` list from this plate. Widen only as already specified. |
| A8 chevrons + blank Field-label builder | **Not canon.** Assign = **A14** radios. Form = **A12**. |
| A8/A7 “create the objective / create an agent” | **A14** wins: do not create an agent here. |
| A12 “Re-engagement is a campaign, not an objective” | **C** + stale grain. Re-engagement is an **E** sequence **name**. Do not persist that sentence. |
| **A10 ≠ A13** | Both **diagrams, not screens**. A10 = dashed missing class. A13 = listing filled + fork **if listing not empty → create form**. If on the DAG = **A16**, not these. |
| A14 “You do not create an agent here…” | **On the glass** (caption). Obey. “Not a third option…” is **not** on that PNG — law still; do not ship that sentence. |
| A16 “If X” | Label. X is not a field. Reads previous result (action or rule). |
| Shared desk: Hub / Source plant | **Not** the app. Do not persist Hub leaves. |
| Harbor RCIC / fake C8 people | **E.** |

---

## Agents — alter what exists

### 1. `sequence_template.sequence_class`

Today: `CHECK (IN ('optin_launch','launch_day','reengagement','reactivation'))`.

**Change:** drop that CHECK. New CHECK `IN ('optin','reengagement','reactivation')`.  
`UPDATE sequence_template SET sequence_class = 'optin' WHERE sequence_class IN ('optin_launch','launch_day')` — then **delete** the leftover `launch_day` **class** row after its cells are copied onto an opt-in **campaign** (seed).  
Add `firm_id TEXT NULL` (NULL = platform template / catalog).

`cells` jsonb **stays** (do not drop this pass — data exists). Runtime **must not** use it as the sequence spine.

Same CHECK change on `firm_sequence_binding.sequence_class` (denormalized copy of the template class, for default-flag uniqueness).

### 2. `firm_sequence_binding`

Today: `UNIQUE (firm_id, sequence_class)`; `template_id` FK; `overrides` jsonb.

**Change:**

- Drop `UNIQUE (firm_id, sequence_class)`.
- Keep `template_id` as the sequence id (do not add a second column named `sequence_id` — alias in types if you want).
- Add `is_default BOOLEAN NOT NULL DEFAULT false`.
- Add partial unique: one default per firm per class  
  `UNIQUE (firm_id, sequence_class) WHERE is_default`.
- Add inherit/override **per family** (C6/C7), booleans, default false (= inherit):  
  `override_attempt BOOLEAN NOT NULL DEFAULT false`  
  `override_channel BOOLEAN NOT NULL DEFAULT false`  
  `override_content BOOLEAN NOT NULL DEFAULT false`  
  `override_sequencing BOOLEAN NOT NULL DEFAULT false`  
- Stop writing Override this / objective / qualify / attempt-count into `overrides`. Column may remain unused this pass; do not persist pictured toggles there.

### 3. `enrollment`

Today: `firm_id`, `contact_id`, `agent_ref`, `sequence_id` (nullable, no FK), `workflow_run_id`, `payload`.

**Change:**

- `sequence_id TEXT NOT NULL` FK → `sequence_template(id)` (backfill from `agent_ref` / binding before NOT NULL).
- Add `campaign_id TEXT` FK → `campaign(id)` — the cursor. NULL only while walking has not placed them yet; enroll **sets** the first campaign (`ord` min).
- Stop `WHERE sequence_class=$2` in `workflowWalk` / `machine.ts` as if `launch_day` were a sibling sequence.
- **C8 Select from:** `SELECT … FROM contact_records WHERE firm_id = $this_firm`.
- **C8 Every firm:** `SELECT … FROM contact_records` (all TEXT firm ids). Insert one `enrollment` per pair. Halt still per `enrollment.firm_id`. Do not use `001.firms` UUID for this loop.

### 4. Keep / do not touch

`campaign_states` — firm `armed-for-activation` | `running`.  
`sequence_definitions` — dead.  
`meeting_booked` / `fact_writebacks` / `messaging_events` — completion targets.  
`seq_phase_order` — already three tokens.  
`seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts` — 7b inside a campaign. Add optional `rule_attempt_criteria.campaign_channel_id` FK (nullable = global/sequence default).

---

## Agents — new tables

```sql
-- 010 (spec — implementer cuts)

CREATE TABLE campaign (
  id TEXT PRIMARY KEY,
  firm_id TEXT,                          -- NULL = on a platform template
  sequence_id TEXT NOT NULL REFERENCES sequence_template(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  override_this BOOLEAN NOT NULL DEFAULT false,
  -- NO qualify_next_campaign_id. NO qualify_gate. Next = next ord when objective met.
  attempt_count INT,
  wait_after_last_failed_seconds INT,
  nth_exception JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX campaign_sequence_ord_idx ON campaign (sequence_id, ord);

CREATE TABLE campaign_objective (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('click', 'form', 'meeting')),
  name TEXT NOT NULL,
  completion_table TEXT NOT NULL
    CHECK (completion_table IN ('messaging_events', 'fact_writebacks', 'meeting_booked')),
  source TEXT NOT NULL DEFAULT 'scratch'
    CHECK (source IN ('template', 'scratch')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);
-- C2 Additional: disabled. Do not add launch_window / launch_day as source tokens.
-- kind = C2b radios (spec). name = operator string (example on the plate).

CREATE TABLE campaign_channel (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token IN ('text', 'email', 'call')),
  ord INT NOT NULL DEFAULT 0,
  override_content BOOLEAN NOT NULL DEFAULT false,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- C5b shape (keys, not example copy):
  --   text:  { to, body }
  --   email: { subject, from, reply_to, body_html, body_text }
  --   call:  { voice, script, listening_prompt, goal, notes }
  -- Do not persist Harbor / Alex / {{first_name}} examples. Do not persist ElevenLabs as a column.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, token)
);
-- Rows exist when campaign.override_this = true (C4). Closed campaign = inherit; no channel rows required.

CREATE TABLE seq_attempt_cycle (
  id TEXT PRIMARY KEY,
  firm_id TEXT,                          -- NULL = C6 global
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  attempt_count INT NOT NULL DEFAULT 1,
  wait_after_last_failed_seconds INT,
  nth_exception JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1
);
-- Sequence override = a row with firm_id + sequence_id when binding.override_attempt.
-- Per-campaign attempt = campaign.attempt_count / wait / nth (C7). Chrome may be missing; columns anyway.

CREATE TABLE campaign_failure (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  sequence_id TEXT NOT NULL REFERENCES sequence_template(id),
  campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
-- Exhausted sequence / class unmet. INSERT is the event (dispatch campaign_failure).
```

**Seed (optional teaching opt-in):** one `sequence_template` `tpl.optin.v1` class `optin`, **label** “Opt-in” (renamable). Two `campaign` rows with **names** “Launch window” / “Launch day” (`source=template`, `ord` 0 then 1). Window example: `kind=click`, `completion_table=messaging_events`. Day example: `kind=form`, `completion_table=fact_writebacks` (or point at `consent_records.sequenced` if that write is the objective — add that dispatch; do not mint `goal`). Operator can rename both. Re-engagement / reactivation seeds: one campaign each is enough (form → `fact_writebacks`; meeting → `meeting_booked`). Do not require two campaigns on every sequence.

---

## Agents — runtime (not a table)

`templateWalk` / `cascade.ts`: cells are **not** the sequence.

Walk: `sequence_template` → `campaign` ordered by `ord` → cursor on `enrollment.campaign_id` → that campaign’s **objective met** (row in its `completion_table` for that contact) → advance cursor to the next `ord` on the same sequence (if any) → 7b ladder (`seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts`) **inside** the current campaign. If `override_this`, authored wires are `campaign_channel`.

There is **no qualify node, column, or gate** — including because the same pill is on C3 **and** C4 **and** C5. Engine 2 stays between **sequence classes**, not between campaigns. Do not put `workflow_trigger` on the Agents canvas.

`workflow.graph` node kinds the walker must accept: `trigger` · `rule` · `action` · `exit` (A6) · `branch` (A15/A16). `constant` already named in Hub — keep if present; A1 does not require it. **Palette shown on a plate is not a CHECK.** A6 and A15 show different subsets.

Call: no port in `registry.ts`. Composer on `campaign_channel` where `token='call'` **saves**. Send path does not dial. Third live send medium remains form/email/sms as today.

---

## Agents — plate → change

| Plate | Persist / change |
|-------|------------------|
| **C1** | Catalog = `sequence_template` (`firm_id IS NULL` or this firm’s copies). `sequence_class` = three **kinds**. `label` = example name, renamable. Empty world = no rows. |
| **C2** | INSERT `campaign` + `campaign_objective` (`source=template` or scratch). Additional **disabled**. Template **names** on the plate are examples. |
| **C2b** | `source=scratch`, `kind` click\|form\|meeting (spec radios), `name` TEXT, `completion_table` pointer. |
| **C3** | N campaigns (`ord`). Each has one objective. `override_this=false`. Qualify pill = **C** (also on C4, C5 — still zero columns). |
| **C4** | `override_this=true` → `campaign_channel` rows, **closed**. Campaign fields stay on `campaign`. Tokens from **C5** (`text\|email\|call`), not C4’s Form pixel. Same qualify pill = still **C**. |
| **C5** | Spine still here (two campaign cards + qualify **C**). Channels **open**. `override_content` + composers. Channel-rules **wire**. Attempt rules **not** here. |
| **C5b** | Composers only. Persist `content` jsonb **keys** above. Harbor / Alex / intake / ElevenLabs badge = **E** / illustrative. No campaign rows from this crop. |
| **C6** | NULL-firm `seq_attempt_cycle` (count, wait, nth) + NULL-firm `rule_*` / `seq_*`. Form rows stale. No inherit column (this is the top). |
| **C7** | Binding `override_*` booleans. Per-campaign attempt columns on `campaign`, **not** this modal. |
| **C8** | `enrollment` for this `sequence_id`. Add contact in header. Every firm / Select from as specified. Helpers = **C** (behavior is law). Not Publish. |

---

## Automations — alter what exists

### 1. `action.type`

Today: `CHECK (type = 'call_agent')`, `agent_ref TEXT NOT NULL`.

**Change:**

```text
CHECK (type IN (
  'call_agent',
  'ascribe_tag',
  'manage_lists',
  'assign_task',
  'notify_consultant'
))
```

`agent_ref` **nullable**. CHECK: `type <> 'call_agent' OR agent_ref IS NOT NULL`.  
`call_agent` / A14 assign-existing: `agent_ref` = `sequence_template.id` (the sequence). Enroll via `enrollAndActuate`.  
`ascribe_tag`: write `contact_tag`.  
Other in-app: write `engagement_records`; do not skip in `workflowWalk`.

### 2. `workflow_trigger`

Types already `event | schedule | manual | webhook | constant`. `event_name` already TEXT — not an enum.

**Add:**

- `grain TEXT NOT NULL DEFAULT 'global' CHECK (grain IN ('global','local'))`
- `scope TEXT NOT NULL DEFAULT 'every_firm' CHECK (scope IN ('every_firm','select_from'))`
- `scope_contact_ids TEXT[]` — used when `scope='select_from'` (C8/A14 same two).

Do not mint an events table.

### 3. Save path (no new table)

Ant `handleSave` today: in-memory flash.  
**Must:** persist `workflow` + `workflow.graph` JSONB, then `materializeTriggersFromGraph`. Launch/activate → `workflow_state.status='active'`. Hub persist is reference, not the product.

---

## Automations — dispatch (write is the event)

After INSERT/UPDATE, `dispatchEventToWorkflows({ eventName })`. Name = table/kind, not a synonym catalog.

| Write | `event_name` | Picker? |
|-------|----------------|---------|
| `fact_writebacks` INSERT | `fact_writebacks` | Yes — form completion |
| `meeting_booked` INSERT | `meeting_booked` | Yes |
| `campaign_failure` INSERT | `campaign_failure` | Yes — campaign exhausted |
| `consent_records` UPDATE `silenced=true` or `status='silenced'` | `consent_records.opt_out` | Yes |
| `halt_records` INSERT (contact scope) | `halt_records` | Yes if that is the unsubscribe write; same picker family |
| `ct_firms` INSERT | `ct_firms` | Yes — firm provisioned (this pass) |
| `eligibility` path already fires | `eligibility.changed` | Yes — already hardcoded |
| `audit_runs` complete / failed | `audit.completed` / `audit.failed` | Yes — completed already hardcoded |
| `consent_records` UPDATE `status='sequenced'` | `consent_records.sequenced` | Yes **if** launch-day objective points here |

**Picker lists those. Not** Hub leftovers (`contact.created`, `contact.updated`, `import.created`) unless a workflow needs that table later. Not every table.

`handleMachineEvent` push stays for probes. Production path is the write.

---

## Automations — new tables / rows

```sql
CREATE TABLE contact_tag (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  source_workflow_id TEXT REFERENCES workflow(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX contact_tag_contact_idx ON contact_tag (firm_id, contact_id, tag);

CREATE TABLE rule_pack (
  id TEXT PRIMARY KEY,
  firm_id TEXT,                          -- NULL = platform / industry default
  workflow_id TEXT REFERENCES workflow(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  families JSONB NOT NULL DEFAULT '[]'::jsonb,   -- GUI toggles + field·op·constant rows
  custom_json JSONB,                     -- A3
  named_code TEXT,                       -- A4 JS/Python text
  named_code_on BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Walker **evaluates** `families` (creatable ⇒ row). Evaluator stays code; authoring is not a TypeScript file. `constants_packs` stays constants, not the rule GUI.

**Required-data listing:** do **not** mint a second catalog. Put `COLLECTIBLE_FIELDS` ids (and `self_reportable` filter) on rule **output** (`RuleEvaluationSummary` / walk context). A12 questions **reference those ids**. Embedded form payload on the action node in `workflow.graph` is enough. Mint `form` / `form_question` only if they must be queryable off-graph — **not required this pass**.

**A14 create-from-template:** `INSERT sequence_template` (new id, same class, `firm_id` set, copy campaigns/objectives/channels) + `firm_sequence_binding` + enroll. Unblocked once UNIQUE on class is gone. Assign-existing = `call_agent` + `agent_ref` → that `sequence_template.id`.

**A10 / A13:** not tables, not screens. If = `branch` reading previous output. Thicken `evalBranch` to read listing-not-empty / last action output — code, not a table.

---

## Automations — plate → change

| Plate | Persist / change |
|-------|------------------|
| **A1** | Persist `workflow.graph` (trigger · rule · action). Materialize triggers. Activate. Footer caption = **C**. List/canvas node-count drift = ignore. |
| **A2** | `rule_pack.families` (toggles + field·op·constant). Walker evaluates. Pack **name** is **E**. |
| **A3** | `rule_pack.custom_json`. Caption “When the GUI isn’t enough — same as JSON.” = **C**. Same pack, two editors. |
| **A4** | `named_code` + `named_code_on` beside GUI. Save text; run later. |
| **A5** | `workflow_trigger.type` event\|schedule + `event_name`. `grain` / `scope` from FACE 27 / C8 — **not drawn on this PNG**; still persist (law). Do not invent Settings. |
| **A6** | Author DAG. Palette here includes **Exit**. Persist `exit` nodes. Insert-menu copy = **C**. |
| **A7** | `action.type` Agents vs in-app. Footer **C**. Background Branch = drift. Do not lengthen the CHECK from the in-app blurb. |
| **A8** | **Prior.** Do not implement chevrons or blank field builder. Select-agent = whole sequence (still). Form → **A12**. Assign chrome → **A14**. |
| **A9** | **Prior** Output (signals). Teaching grey box = **C**. Canonical Output = **A11**. |
| **A11** | Required-data **listing** on output (`COLLECTIBLE_FIELDS` ids, `self_reportable` → form). |
| **A10** | **Diagram.** Dashed missing class. Do not build a page. |
| **A13** | **Diagram, not A10.** Listing filled. Fork: listing not empty → create form (A12 bind). Do not build a page. |
| **A12** | Form questions = listing ids in `workflow.graph`. Document-dependent never enter. Sequence name on the plate = **E**. |
| **A14** | Radios: assign existing \| copy from template. No chevron. No create-agent. Caption on glass = **C** (obey). |
| **A15** | Chain: trigger → action → If → action. Palette here includes **If**, not Exit. Same graph. No new table. |
| **A16** | `branch` reads previous output (action or rule). Field · op · constant. Then / else. Not a rule. “If X” = label. |
| **A17** | Event picker; `event_name='ct_firms'` this pass. “Things inside still have to happen” = **C**. |

---

## Files the cut must touch (not only SQL)

| File | Why |
|------|-----|
| `supabase/migrations/010_….sql` | This packet |
| `supabase/seeds/002_machine_tables.sql` | Class tokens; launch_day → campaign; bindings |
| `src/app/wire/machineTypes.ts` | `SequenceClass` three tokens |
| `server/wire-service/templateWalk.ts` · `cascade.ts` | Campaign cursor |
| `server/wire-service/workflowWalk.ts` | Action kinds; `WHERE sequence_class` |
| `server/wire-service/machine.ts` | Save template/binding; enroll; dispatch sites |
| `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx` | Save persist (not flash) |
| `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx` | Save campaigns, not only cells |
| `src/app/data/automationWorkflows.ts` | Picker = dispatch list above, not Hub leftovers |

`npm run build`. Manual: Save A1 → row + triggers; insert `fact_writebacks` or `meeting_booked` → run + enroll; Save C3 two campaigns with `ord` 0 then 1 — no qualify row.

---

## Connect slice (still the first cut)

Same vertical as [`CONNECT-SLICE-PACKAGE.md`](./CONNECT-SLICE-PACKAGE.md): one completion heard → assign existing agent. That **is** the Automations middle, once. It is **not** permission to skip the Agents housing or the rest of this packet. Implementer may ship SQL for the whole packet and wire the connect first.

---

## What this is not

- Not overwriting 15:43.
- Not asking the founder for SQL.
- Not stuffing the lie (`cells` as sequence, Override this in `overrides`).
- Not filling an event catalog beyond the dispatch table.
- Not a Call port this cut — composer only.
- Not unifying `firms` UUID with `ct_firms` TEXT this cut — pick `ct_firms` for provisioned.
- Not putting founder captions into Postgres (`qualify` on C3–C5, “first objective”, “Launch window” as a type, “They opt in” as a class, A10/A13 as a page).
- Not freezing A6’s palette or A15’s palette as the only node kinds.
- Not treating A7’s background Branch as the smallest workflow.
- Not implementing A8 chevrons or blank form builder.

---

## Enrichment 2026-08-16 17:05 — 010 ratify + C0/C9/C11/C13

010 is on **main**. Cut matched the packet. Extra `run_audit` **accepted** (writes `audit_runs`, dispatches `audit.completed`).

PR [#89](https://github.com/bywale-com/omcoda_tower/pull/89) written spec: C0 / C9 / C13 / channel rules / add-channel map onto **stood-up** rows. **C11 variations do not.** Next cut: [`SYSTEMS-CHANGE-PACKET-ENRICH.md`](./SYSTEMS-CHANGE-PACKET-ENRICH.md) (`011` — `campaign_channel_variation`). Do not persist the dead three radios. Do not mint a second channel-rules table.

---

## 012 — 2026-08-16 19:25 — 011 cut; A18/A19/C14/C15/seed

011 is on **main** (PR [#90](https://github.com/bywale-com/omcoda_tower/pull/90)). Variations matched.

PR #89 **18:53** is not pass-through. Next cut: [`SYSTEMS-CHANGE-PACKET-012.md`](./SYSTEMS-CHANGE-PACKET-012.md). One timer (not per toggle). `grain` is A18 + `local_ref`. Audience on `workflow`, not enrollment. Seed people into existing tables. Do not collapse Global/Local with Contacts.

---

## 013 — 2026-08-16 21:57 — contact import → audit; Book readiness is the pane

Founder: Confirm book for Tower **is** the upload. Trigger **contact import**. Action **audit the contacts**. Every `audit_runs` row shows in Operator Book readiness. Canvas **deletes** a node.

Cut [`SYSTEMS-CHANGE-PACKET-013.md`](./SYSTEMS-CHANGE-PACKET-013.md). Does not wait on 012. Does not merge desks. Does not use Hub `import.created`.

---

## 014 — 2026-08-16 22:17 — authored workflow: import → audit → tag + notes (any firm)

Founder: not hardcoded. House canvas. Tag invalid data. Notes on the contact. Walker must run `run_audit` / `ascribe_tag` (today every action enrolls). House `workflow.firm_id` NULL. Cut [`SYSTEMS-CHANGE-PACKET-014.md`](./SYSTEMS-CHANGE-PACKET-014.md).
