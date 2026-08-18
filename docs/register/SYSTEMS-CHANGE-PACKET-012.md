# Systems — change packet 012 (A18 / A19 / C14 / C15 / seed)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 19:25 UTC.  
**What this is:** the next cut. Implementer **only implements**. No analysis.  
**Why:** (1) `011_channel_variations.sql` landed on **main** (PR [#90](https://github.com/bywale-com/omcoda_tower/pull/90)) — ratify. (2) PR [#89](https://github.com/bywale-com/omcoda_tower/pull/89) 18:53 added **A18 · A19 · C8b · C14 · C15 · seed**. Those are not “all good to pass.” This file is the machine.  
**Flag:** 15:43 untouched. Parent: [`SYSTEMS-CHANGE-PACKET.md`](./SYSTEMS-CHANGE-PACKET.md). 011: [`SYSTEMS-CHANGE-PACKET-ENRICH.md`](./SYSTEMS-CHANGE-PACKET-ENRICH.md). Face: [`IMPLEMENTER-FACE-PASS.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/implementer-face-pass-2bec/docs/register/IMPLEMENTER-FACE-PASS.md).  
**Instructions:** founder only.

Do not reopen 010 or 011. Logout PR [#91](https://github.com/bywale-com/omcoda_tower/pull/91) is chrome — not this packet.

---

## Landed — PR [#92](https://github.com/bywale-com/omcoda_tower/pull/92) + [#93](https://github.com/bywale-com/omcoda_tower/pull/93)

**Do not recut 012.** Assessment: [`SYSTEMS-CUT-ASSESSMENT.md`](./SYSTEMS-CUT-ASSESSMENT.md).

| Cut | Where |
|-----|--------|
| One timer · `rules_override` · `seq_channel_rules` · A18 `local_ref` · A19 `audience_*` · seed people | `012_grain_audience_one_timer.sql` + walker dispatch |
| Operator book across firms | `013_operator_book_people.sql` — **this consumed the 013 filename** before SA-013 |
| C8b on #92 | **Stub** (radios + search + checkboxes). Not the plate. |
| C8b for real | **#93** firm-first Add contact. Agents enroll starts the mission; Automations audience does not. |

Leftover: Get packet later wants **Deselect all** on Select-from — fix on C8b when that interior ships; not 012 SQL.

---

## 011 on main — ratify / leftover

Cut matched the 17:05 enrichment. `campaign_channel_variation` CHECK and migrate-one-`every` are correct. Runtime reads variations. `campaign_channel.content` leftover.

| They did | Vs 011 packet | Decision |
|----------|---------------|----------|
| `enrollment.sequence_id` SET NOT NULL after backfill | Leftover we named | **Accept.** Done. |
| `pickAuthoredContent` by attempt n | Packet asked | **Accept.** |
| Face `CHANNEL_RULE_TOGGLES` includes **within_time as a toggle** | C15: within time is **one field**, not a toggle | **Correct in 012.** Drop that toggle. |
| Save writes `threshold` **per** `rule_attempt_criteria` row | One timer per channel/medium | **Correct in 012.** Timer is not on the toggle row. |
| `rulesOverride` inferred from `rules.length > 0` | Need a real override bit | **Correct in 012.** `campaign_channel.rules_override`. |

Do not reopen 011 DDL. 012 alters.

---

## What #89 18:53 needs in the machine

| Plate / writing | New table / field? | Persist |
|-----------------|--------------------|---------|
| **C8b** Select from list | No | Query `contact_records`. Everyone **already selected**. Deselect to pick. Scroll inside the modal. Agents enroll **does** start the mission (INSERT `enrollment`). |
| **C14** sequence Settings | **Yes — `seq_channel_rules`** + `rule_attempt_criteria.sequence_id` + `channel_token` | Canon for sequence Settings (revises C7). Same four families as C6. Channel-rules **Override** = existing `firm_sequence_binding.override_channel`. Underneath: toggles + **one** Within time **per token** (Text / Email / Call). Do not dump `rule_attempt_criteria` as the surface. |
| **C15** one timer | **Yes — columns on `campaign_channel`** | `rules_override` + `within_seconds`. Toggles = medium-specific only. **Every toggle that is on uses that timer.** Same grain at C14 and C6. Canvas **scrolls** (chrome). |
| **A18** Global / Local | **Yes — `workflow_trigger.local_ref`**. `grain` already exists | `grain` **is** A18 (all of that kind vs this specific one). Not Contacts. Picker disabled on Global; enabled on Local. |
| **A19** Automations Contacts | **Yes — `workflow.audience_*`** | Same look as C8 / C8b. **Does not** INSERT `enrollment`. Does **not** start a mission. Who this automation applies to. |
| **Seed** | No new tables | INSERT into `contact_records` · `enrollment` · `engagement_records` · `workflow_run`. Named IDs below. Do not paint names in the SPA. |
| Scroll / modals / logout | No | Chrome. |

**Hard split (do not collapse):** A18 = event grain (this form / this campaign). A19 = audience (these people). 02:31 lumped `grain` with C8. **Wrong.** `workflow_trigger.scope` / `scope_contact_ids` are **leftover**. Spine for people is `workflow.audience_*`.

---

## One timer — not a timer per toggle

Toggles are **only** the medium conditions. **Within time is not a toggle.**

| Channel | Toggles (`when_clause`) | Timer |
|---------|-------------------------|-------|
| text | `not_opened` · `not_delivered` | one `within_seconds` |
| email | `not_opened` · `link_not_clicked` | one `within_seconds` |
| call | `not_answered` · `not_completed` | one `within_seconds` |

Remove `within_time` from `CHANNEL_RULE_TOGGLES`. Runtime: a toggle that is **on** fires if that condition holds **and** `now - send < within_seconds`. Off = ignore that condition.

Levels:

| Glass | Override bit | Timer + token home | Toggle rows |
|-------|--------------|--------------------|-------------|
| C6 global | none (this is the top) | `seq_channel_rules` `firm_id` NULL, `sequence_id` NULL | `rule_attempt_criteria` `sequence_id` NULL, `campaign_channel_id` NULL, `channel_token` set, `threshold` unused |
| C14 sequence | `firm_sequence_binding.override_channel` | `seq_channel_rules` `sequence_id` set | same table, `sequence_id` set |
| C15 this channel | `campaign_channel.rules_override` | `campaign_channel.within_seconds` | `campaign_channel_id` set |

Fallback: C15 off → C14 (if `override_channel`) → C6. Do not put attempt-count on this node.

```sql
-- 012 (spec — implementer cuts)

ALTER TABLE campaign_channel
  ADD COLUMN IF NOT EXISTS rules_override BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS within_seconds INT;

CREATE TABLE seq_channel_rules (
  id TEXT PRIMARY KEY,
  firm_id TEXT,                         -- NULL = platform / C6
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token IN ('text', 'email', 'call')),
  within_seconds INT NOT NULL DEFAULT 1800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX seq_channel_rules_global_idx
  ON seq_channel_rules (token) WHERE sequence_id IS NULL AND firm_id IS NULL;
CREATE UNIQUE INDEX seq_channel_rules_seq_idx
  ON seq_channel_rules (sequence_id, token) WHERE sequence_id IS NOT NULL;

INSERT INTO seq_channel_rules (id, firm_id, sequence_id, token, within_seconds) VALUES
  ('scr-global-text',  NULL, NULL, 'text',  1800),
  ('scr-global-email', NULL, NULL, 'email', 86400),
  ('scr-global-call',  NULL, NULL, 'call',  1800)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE rule_attempt_criteria
  ADD COLUMN IF NOT EXISTS sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS channel_token TEXT
    CHECK (channel_token IS NULL OR channel_token IN ('text', 'email', 'call', 'form'));

-- Face toggles (C6). threshold / threshold_unit leftover — do not read them for the timer.
INSERT INTO rule_attempt_criteria
  (id, firm_id, label, enabled, when_clause, channel_token, ord, source) VALUES
  ('acr-text-not-opened',     NULL, 'not opened',       true,  'not_opened',       'text',  0, 'C6'),
  ('acr-text-not-delivered',  NULL, 'not delivered',    true,  'not_delivered',    'text',  1, 'C6'),
  ('acr-email-not-opened',    NULL, 'not opened',       true,  'not_opened',       'email', 0, 'C6'),
  ('acr-email-link',          NULL, 'link not clicked', true,  'link_not_clicked', 'email', 1, 'C6'),
  ('acr-call-not-answered',   NULL, 'not answered',     true,  'not_answered',     'call',  0, 'C6'),
  ('acr-call-not-completed',  NULL, 'not completed',    true,  'not_completed',    'call',  1, 'C6')
ON CONFLICT (id) DO NOTHING;

-- Leave acr-text / acr-email / acr-form seed rows. Face does not show them. Do not put Form on Call.
```

Save C15: write `rules_override`, `within_seconds`, and toggle rows with `campaign_channel_id` (enabled only). Do not write a third “within time” criteria row. Do not copy `within_seconds` onto each toggle.

---

## A18 — `grain` is event instance, not people

`workflow_trigger.grain` (`global` \| `local`) **already stood up**. That column **is** A18.

**Global** = all of that `event_name`.  
**Local** = this specific one. `local_ref` is the id. Picker **disabled** on Global; **enabled** on Local.

```sql
ALTER TABLE workflow_trigger
  ADD COLUMN IF NOT EXISTS local_ref TEXT;

ALTER TABLE workflow_trigger
  DROP CONSTRAINT IF EXISTS workflow_trigger_local_ref;
ALTER TABLE workflow_trigger
  ADD CONSTRAINT workflow_trigger_local_ref
  CHECK (grain = 'global' OR local_ref IS NOT NULL);
```

`workflow_trigger.scope` / `scope_contact_ids` — **leftover**. Do not show them on A18. Do not DROP this pass.

Dispatch (today matches firm + event_name only). **Must also:**

1. If `grain='local'`, fire only when the write’s id equals `local_ref` (key per table below).
2. Then filter audience from **`workflow`**, not from the trigger (A19).

### Which events allow Local

Do not fill a catalog. Map the writes we already dispatch. UI hides Local when the row says no.

| `event_name` | Global | Local | `local_ref` equals | Payload key on the write |
|--------------|--------|-------|--------------------|--------------------------|
| `fact_writebacks` | all form completions | **this form** | action **node id** that owns the form | `payload.form_ref` (stamp it on the INSERT from A12) |
| `campaign_failure` | all campaigns exhausted | **this campaign** | `campaign.id` | `campaign_id` already on the row |
| `ct_firms` | all firms provisioned | **this firm** | `ct_firms` id / TEXT firm key | the inserted id |
| `consent_records.sequenced` | all sequenced | **this sequence** | `sequence_template.id` | `payload.sequence_id` |
| `audit.completed` | all audit completions | **no** | — | Audit is one-time. Same-canvas chain uses **If** (A16), not a second trigger. Force `grain='global'`. Hide Local. |
| `audit.failed` | all | **no** | — | same |
| `meeting_booked` | all | **no this pass** | — | No meeting-type row to point at. New ask if they want “this listing.” |
| `eligibility.changed` | all | **no** | — | “This contact” is A19, not Local. |
| `halt_records` | all | **no** | — | Halt scope ≠ A18. |
| `consent_records.opt_out` | all | **no this pass** | — | Contact is A19. |

Do not invent UI for events not in the picker. When a new write is connected later, add a row to this table — do not guess.

---

## A19 — audience on the workflow, not enrollment

Automations Contacts is **who this workflow applies to**. Same chrome as Agents C8 / C8b. **One difference:** it does **not** start a mission. Do not INSERT `enrollment` (`sequence_id` is NOT NULL — Agents only).

```sql
ALTER TABLE workflow
  ADD COLUMN IF NOT EXISTS audience_scope TEXT NOT NULL DEFAULT 'every_firm'
    CHECK (audience_scope IN ('every_firm', 'select_from')),
  ADD COLUMN IF NOT EXISTS audience_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
```

| Modal | Write |
|-------|-------|
| Every firm | `audience_scope='every_firm'`, `audience_contact_ids='{}'` |
| Select from (C8b) | `audience_scope='select_from'`, ids = selected (`contact_records` for that book; **all selected** until deselected) |

Table columns: **Name · Firm · Enrolled date**. “Enrolled date” here = when they were added to this audience (`workflow.updated_at` is too coarse). Use `payload` only if you must — **prefer** showing `contact_records.created_at` this pass rather than minting `workflow_audience`. If Select from, you already have the ids; join `contact_records`. Do not mint a fourth people table.

Dispatch after grain match:

- `every_firm` → walk `contact_records` for that `firm_id` (same as Agents Every firm).
- `select_from` → those ids only.

Live Automations has no Contacts tab. Build it. Do not skip because A1–A17 never showed it.

---

## Seed the connected tables (not the SPA)

Not a thick seed. Not fake empty-state copy. `002` / `003` bind templates and workflows. They do **not** put people on them. That is the gap.

Firm key = **`firm-cedar`** (already on bindings + canonical workflows). Do not use the auth UUID here — `contact_records.firm_id` is TEXT.

```sql
INSERT INTO contact_records (id, firm_id, name, email, phone) VALUES
  ('cr-cedar-1', 'firm-cedar', 'Ana Ruiz', 'ana.ruiz@example.com', NULL),
  ('cr-cedar-2', 'firm-cedar', 'Jon Hale', 'jon.hale@example.com', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id) VALUES
  ('enr-cedar-1', 'firm-cedar', 'cr-cedar-1', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.window'),
  ('enr-cedar-2', 'firm-cedar', 'cr-cedar-2', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.window')
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload) VALUES
  ('eng-cedar-1', 'firm-cedar', 'cr-cedar-1', 'sent',
    '{"channel":"email"}'::jsonb),
  ('eng-cedar-2', 'firm-cedar', 'cr-cedar-1', 'opened',
    '{"channel":"email"}'::jsonb),
  ('eng-cedar-3', 'firm-cedar', 'cr-cedar-2', 'sent',
    '{"channel":"text"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES
  ('run-cedar-1', 'wf-optin-launch', 'firm-cedar', 'success', 'event:audit.completed')
ON CONFLICT (id) DO NOTHING;
```

Then Save. Agents Contacts / C8b / C13 / Automations Contacts / Runs read those rows. Map `event_kind` to prose (already `eventKindProse`). Do not show UUIDs. Do not hard-code Ana Ruiz in a React empty state.

`camp.optin.window` only exists after 010 when templates exist — same `WHERE EXISTS` pattern as 010 objectives if needed.

---

## Plate → 012

| Plate | Persist |
|-------|---------|
| **C8b** | Query. All selected. Agents = INSERT `enrollment`. |
| **C14** | Binding `override_channel` + `seq_channel_rules` + criteria `sequence_id`. Revises C7. |
| **C15** | `campaign_channel.rules_override` + `within_seconds` + toggle rows. Drop within-time toggle. Canvas scroll. |
| **C6** | Global `seq_channel_rules` + global toggle rows. Same one-timer grain. |
| **A18** | `grain` + `local_ref`. Event table above. Not Settings. |
| **A19** | `workflow.audience_scope` + `audience_contact_ids`. No enrollment. |
| **Seed** | Four INSERTs above. |
| **A12 / A14 / A11** | Still parent packet. A12 INSERT must stamp `fact_writebacks.payload.form_ref`. |

---

## Files for 012

| File | Why |
|------|-----|
| `supabase/migrations/012_grain_audience_one_timer.sql` | Columns + `seq_channel_rules` + seed people |
| `supabase/seeds/002_machine_tables.sql` | Global toggle rows + `seq_channel_rules` (or only in 012) |
| `server/wire-service/campaignHousing.ts` | Save timer on channel; do not persist within-time toggle |
| `server/wire-service/cascade.ts` | One timer for on-toggles |
| `server/wire-service/workflowWalk.ts` | Dispatch: local_ref match, then audience |
| Ant C14 / C15 / A18 / A19 / C8b | Face. Remove `within_time` toggle. Contacts tab on Automations. |

`npm run build`. Manual: C15 one Within time, two toggles, Save → `campaign_channel.within_seconds` set, two criteria rows, no third. A18 Local + pick campaign → `grain='local'` + `local_ref`. A19 Select from does not create `enrollment`. Contacts tables show Ana / Jon after seed.

---

## What this is not

- Not overwriting 15:43.
- Not a `qualify` node.
- Not collapsing A18 with A19.
- Not a timer per toggle.
- Not Form rows on Call.
- Not `enrollment` for Automations Contacts.
- Not dropping `workflow_trigger.scope` this pass (leftover).
- Not a meeting-type table.
- Not a Local picker on audit.
- Not seeding names in the SPA.
- Not logout / canvas scroll as SQL.
