# Systems — change packet 021 (Form occupancy is the required-data listing)

**Seat:** Systems Analyst.  
**When:** 2026-08-20 19:20 UTC.  
**What this is:** the cut for PM [`FORM-CLASS-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/FORM-CLASS-PACKET.md) (A40, law 47–49). Implementer **only implements**. No analysis.  
**Why:** You cannot map questions one-by-one. Drop **this run’s required-data listing**. The form **is** those self-reportable rows. Objective first. A14 unfiltered.  
**Join:** 015 handle · 017 `mappedSlots` · 019 If `exists` (landed PR #107) · A20 Rule writes · [`SYSTEMS-GET-IS-TABLE-ASCRIBE.md`](./SYSTEMS-GET-IS-TABLE-ASCRIBE.md) (founder speaks modules; you map). Face: `git fetch origin pull/96/head` · open `A40-form-class-occupies.png`.  
**Flag:** 15:43 untouched. **Do not recut 015.** Do not recut 019.  
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| Form box occupied by **this run’s** `missing_fact_signals` (the whole listing) | Empty question slots. `formQuestionIds` from `COLLECTIBLE_FIELDS` |
| Objective radios **first**: click · form · meeting. Form selected → occupancy box | Assign cards first. “2 · Create the objective.” Data-request Switch as the objective |
| A14 after the radios, **all three** sequence classes | Filter sequences by objective. Teaching “The objective limits which agents you can select.” |
| If **exists** on that listing (019 `op: "exists"`) | A new If kind. Then/Else radios. Rule inner conditions (law 26) |
| `collectible_fields` so capture kind is not a SPA constant | A `form_class` / occupancy / validator table. A `goal` column on `sequence_template` |

**This form only:** data-request (questions = self-reportable missing facts). Opt-in / consent is a different artifact. Loop-closer is a different artifact. Do not collapse.

---

## Live (quote `origin/main` — do not guess)

| Live | Gap |
|------|-----|
| Rule `executeRuleWrites` INSERT `missing_fact_signals` per contact × `field_key`. Handle writes `{ table: "missing_fact_signals", id, contact_id }`. | Default keys are `email`/`phone` unless `listingFieldIds`. Output pane still paints `COLLECTIBLE_FIELDS`. |
| `missing_fact_signals` (`004`): `id`, `firm_id`, `contact_id`, `field_key`, `created_at`. | No capture kind. Document-dependent can be stuffed if `listingFieldIds` says so. |
| `COLLECTIBLE_FIELDS` in `collectibleFields.ts` — `self_reportable` vs `document_dependent`. | SPA catalog. Law: data in tables. Form unfolds this list, not the write. |
| Action Agents: assign cards **above** radios. `formQuestionIds` saved from that catalog. Teaching line present. | A40: objective first. Occupancy chip. No + Add question. |
| `action.payload_binding` stores `formQuestionIds`. Walker enrolls; does not read the listing write. | Bind is a **chip** (`mappedSlots`), same as Tag/If. |
| `campaign_objective.kind` CHECK `click` \| `form` \| `meeting`. `form` → `completion_table = fact_writebacks`. | Automations Action must **not** INSERT `campaign_objective`. You do not create the agent here. |
| If `exists` already walks (PR #107). | Wire it to the listing: chip of `missing_fact_signals`, `op: "exists"`. Empty listing → false. |
| Get `contacts` returns only `contact_records`. | Leftover 018: also emit current `reachability_verdicts` + `sequence_ready`. Same PR is fine. |

“Listing exists” on the handle = this node’s / chain’s writes include **at least one** `missing_fact_signals` row. Silent if the Rule wrote none — If false. Honest.

---

## Hard decisions

### 1. No form table. No class type. No validator table.

Paths already exist. Occupancy = 017 `mappedSlots` slot **`form`**. Value = `RunWrite[]` of `missing_fact_signals` this run (the folder). Chip **is** the box (A31). X clears the slot. Other chips do not occupy it: walker / Save accept only `table === "missing_fact_signals"`. Do not toast the founder. Ignore the drop.

Do not mint `form_questions`. Do not mint `form_class`. Do not mint `sequence_template.goal`.

### 2. `collectible_fields` (this is the SPA lie, not A40)

A40 does not ask for a catalog table. The catalog **already exists in the client**. Move it.

```sql
CREATE TABLE IF NOT EXISTS collectible_fields (
  id TEXT PRIMARY KEY,
  field_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  capture TEXT NOT NULL CHECK (capture IN ('self_reportable', 'document_dependent')),
  employer_directed BOOLEAN NOT NULL DEFAULT false,
  ord INT NOT NULL DEFAULT 0
);
```

Seed the current `COLLECTIBLE_FIELDS` rows (that count — not a fake world). Kill the SPA constant as the product list. Labels for unfold = `collectible_fields.label` keyed by `missing_fact_signals.field_key`.

Document-dependent **never enter this form** because Rule does not INSERT them (decision 3). Form does not re-filter as a second catalog.

Migration filename: **next free on main**. `017` is taken. If 020 already took `018`, this is `019_collectible_fields.sql`. Do not recut packet 018 A34. Do not recut 019 If/Switch.

### 3. Rule emits the listing (A20 — already the write)

`executeRuleWrites`:

- Keys = `listingFieldIds` if the Rule authored them, else `SELECT field_key FROM collectible_fields WHERE capture = 'self_reportable' ORDER BY ord`.
- Missing = no `fact_writebacks` row for that `(contact_id, field_key)` (and not a filled `contact_records` column when `field_key` is `email` or `phone`).
- INSERT `missing_fact_signals` only for those missing keys. **Never** INSERT `document_dependent`.
- Handle writes stay `{ table: "missing_fact_signals", id, contact_id }`.
- `lastOutput.headline = writes.length ? "Required data" : "Pass"`.

Input left: **Required data** is the folder of those writes (017), not `COLLECTIBLE_FIELDS`.

### 4. Form occupancy = that listing

When `data.objectiveKind === "form"` (radio **Submit this form**):

- One box **Form**. Drop Required data. `mappedSlots.form` = those writes.
- Unfold under the chip: `field_key` of the occupied writes, labels from `collectible_fields`, count = listing length. No + Add question. No leftover Select.
- Empty slot = no questions. Do not type questions. Do not fill from the SPA catalog.

Walker `call_agent` when objective is form: resolve `mappedSlots.form` → `field_key`s (load each signal row). Put **that** list on `action.payload_binding` (`fieldKeys`, not `formQuestionIds` as the source). Enroll still. Completions stay `fact_writebacks` (already `campaign_objective` on the **agent**, not this node).

Kill `formQuestionIds` as the face. Unread leftover is fine.

### 5. Objective first. A14 unfiltered.

Graph `data.objectiveKind`: `"click" | "form" | "meeting"`. Default unset → `configured === false` (PR #105: do not silent-success).

Interior order: radios → if form, Form box → **then** A14 (assign existing / from template, **opt-in · re-engagement · reactivation**, not filtered).

Kill: assign cards as step 1; “2 · Create the objective”; teaching line; `dataRequestOn` Switch as the objective (the radio is the objective). Click / meeting interiors are **out of this packet** (radios exist; do not spec their boxes here).

Do not INSERT `campaign_objective` from Automations. Do not limit `sequence_template` rows by `objectiveKind`.

### 6. If exists (already 019)

Example chain on A40: New contact → Rule → If → Agents.

If: left chip = Required data (`missing_fact_signals`), `op: "exists"`. True → Action. Empty listing → false wire. Do not recut 019.

### 7. Leftover 018 (same walk, no new table)

`executeGet` module `contacts`: also emit that contact’s current `reachability_verdicts` and `sequence_ready` (018 join). Missing audit → omit.

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/<next>_collectible_fields.sql` | table + seed from today’s `COLLECTIBLE_FIELDS` |
| `server/wire-service/workflowWalk.ts` | Rule keys from that table; Form slot → `field_key`s; Get contacts current verdicts |
| `src/app/data/collectibleFields.ts` | load from table / wire, not a hardcoded product list |
| `ActionPlateModals.tsx` | A40 order; Form occupancy; kill teaching / assign-first / catalog unfold |
| Input tree / Output | Required data folder = `missing_fact_signals` writes |
| `IfPlateModal` | no change except example: exists on that folder |

`npm run build`. Manual: Rule with missing self-reportable → Required data chip on Input → If exists true → Action Form occupied → questions count matches the listing. Document-dependent keys never appear. A14 still shows all three classes after **form**. Empty Form after X. House seed still walks.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015 or 019.
- Not opt-in / consent form. Not loop-closer.
- Not locking form-objective to re-engagement.
- Not filtering sequences from the objective.
- Not Get Firm/Contact typing on the Form box.
- Not a founder-facing invalid toast.
- Not `firm_readiness`. Not expanding Get’s module catalog (not this packet).
