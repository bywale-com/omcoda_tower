# Systems — change packet (implementer brief)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 02:03 UTC.  
**What this is:** the change-management deliverable. Pictures are the spec. For each plate: alter / add / persist / dispatch. Implementer **cuts** this (`010_…sql` + walker + Ant Save). Not another “don’t mint.”  
**Handback:** Implementation specialist / CTO drafted the missing layer. This file **accepts** that draft, **corrects** it against stood-up SQL, and **leaves only the actually-open** product questions.  
**Flag:** PHASE-TWO-LOG **15:43** untouched (product). This packet is the machine change that makes those pictures true.  
**Join:** 22:41 housing in [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md) · Automations ascribe · [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md) · [`CONNECT-SLICE-PACKAGE.md`](./CONNECT-SLICE-PACKAGE.md) (first vertical of **this** packet, not a cap on the rest).

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

1. Waitlist → launch day: only waitlisted, or the whole book? Column `campaign.qualify_gate` exists; **value** is product. Default `objective_met`.
2. C2 Additional — unnamed. No third template. UI disabled.
3. Per-campaign attempt **chrome** — not drawn. Columns on `campaign` anyway.
4. What a Hub “list” is if it is not a tag — later. This pass `manage_lists` writes `contact_tag`.

Send, book-in, lineage query — leftover product. Not a reason to withhold this packet.

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
  qualify_next_campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL,
  qualify_gate TEXT NOT NULL DEFAULT 'objective_met'
    CHECK (qualify_gate IN ('objective_met', 'waitlisted')),
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
  source TEXT NOT NULL CHECK (source IN ('launch_window', 'launch_day', 'scratch')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);
-- C2 Additional: no source token. UI disabled. Do not add a fourth source.

CREATE TABLE campaign_channel (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token IN ('text', 'email', 'call')),
  ord INT NOT NULL DEFAULT 0,
  override_content BOOLEAN NOT NULL DEFAULT false,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
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

**Seed (opt-in):** one `sequence_template` `tpl.optin.v1` class `optin`. Two `campaign` rows: Launch window (`source=launch_window`, kind `click`, `completion_table=messaging_events`) → qualify → Launch day (`source=launch_day`, kind `form` or consent-sign-up — pointer `fact_writebacks` if form; if sign-up is consent status, still **do not** mint goal; use `fact_writebacks` or treat consent `sequenced` as the write and add it to the dispatch list). Re-engagement / reactivation: one campaign each (form → `fact_writebacks`; meeting → `meeting_booked`).

Consent `waitlisted`/`sequenced` already exist. If launch-day objective **is** sign-up, dispatch on `consent_records` UPDATE to `sequenced` as well (same “write is the event”). Add `consent_records` to the picker when that is the pointer. Do not invent a fourth completion table.

---

## Agents — runtime (not a table)

`templateWalk` / `cascade.ts`: cells are **not** the sequence.

Walk: `sequence_template` → `campaign` ordered by `ord` → cursor on `enrollment.campaign_id` → objective met (row in `completion_table` for that contact) → `qualify_next_campaign_id` (same sequence) → 7b ladder (`seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts`) **inside** that campaign. If `override_this`, authored wires are `campaign_channel` (content from `content` jsonb when `override_content`).

Qualify ≠ `workflow_trigger`. Qualify ≠ Engine 2 between classes.

Call: no port in `registry.ts`. Composer on `campaign_channel` where `token='call'` **saves**. Send path does not dial. Third live send medium remains form/email/sms as today.

---

## Agents — plate → change

| Plate | Persist / change |
|-------|------------------|
| **C1** | Catalog = `sequence_template` where `firm_id IS NULL` **or** this firm’s copies. Three classes only. Empty world = no rows. Save new named sequence = INSERT `sequence_template` (`firm_id` set) + `firm_sequence_binding`. |
| **C2** | INSERT `campaign` + `campaign_objective` (`source` launch_window \| launch_day). Additional **disabled**. |
| **C2b** | Same + `source=scratch`, `kind` click\|form\|meeting, `name`, `completion_table` pointer. |
| **C3** | Two campaigns; `qualify_next_campaign_id` from A to B. `override_this=false`. |
| **C4** | `override_this=true` → INSERT `campaign_channel` rows (wires). Campaign toggles stay on `campaign`. |
| **C5 / C5b** | `campaign_channel.override_content` + `content` jsonb (text / email / call composer). Channel rules = `rule_attempt_criteria` scoped to `campaign_channel_id`. Attempt rules **not** here. Call does not dial. |
| **C6** | NULL-firm `seq_attempt_cycle` + existing NULL-firm `rule_*` / `seq_*`. Attempt-count / wait / nth = `seq_attempt_cycle` columns (new). |
| **C7** | Binding inherit booleans. Per-campaign attempt columns on `campaign`. Sequence Settings = this `firm_sequence_binding`. |
| **C8** | Contacts = `enrollment` for this `sequence_id`. Add contact in header. Select from = this firm’s `contact_records`. Every firm = all `contact_records`. Starts now. Not Publish. |

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
| **A1** | Save `workflow.graph`; materialize triggers; activate. Smallest: trigger · rule · action. |
| **A2** | Save `rule_pack.families`. Walker evaluates. |
| **A3** | `rule_pack.custom_json`. |
| **A4** | `rule_pack.named_code` + `named_code_on`. No JS port required to **save**; run is later. |
| **A5** | `workflow_trigger.type` event\|schedule + `event_name` from the dispatch picker + `grain` + `scope`. |
| **A6** | Graph node `action`. |
| **A7** | `action.type` Agents vs in-app (widened CHECK). |
| **A8 / A14** | Select sequence = whole `sequence_template`. Radios, no chevron. Assign existing vs copy-from-template. No create-agent. |
| **A9 / A11** | Output includes collectible **listing** (unused catalog, stood up on output). |
| **A12** | Form questions = those ids. Bind in graph JSONB. |
| **A13** | Diagram. Do not build a page. |
| **A15–A17** | If pictured after this packet: same grain (If / listing / bind). No extra tables until a plate names a new write. |

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

`npm run build`. Manual: Save A1 → row + triggers; insert `fact_writebacks` or `meeting_booked` → run + enroll; Save C3 two campaigns + qualify.

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
