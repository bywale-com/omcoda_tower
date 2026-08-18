# Systems — change packet 014 (this workflow, authored — not hardcoded)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 22:17 UTC.  
**What this is:** the machine for the workflow the founder named. Implementer **only implements**. No analysis.  
**Why:** Anyone in any firm imports a **contact file** → **audit** (a node, not a hard-coded path) → for each contact, **tag** valid / invalid and **notes** with the rationale, on the contact. Editable on the canvas. Platform: every heard write can be a trigger; every action is a write.

**Why this cut is heavy (not 14 tables — a compiler):** Destination = the graph **is** the app. Today the app **is** TypeScript. This path cannot stay hardcoded in `handleAuditRunCreate` or the canvas stays theater. The lot is dual-running: keep the handler world, stand up a walker that executes **verbs** (`run_audit`, `ascribe_tag`), dispatch after the file write, house hear. The canvas picture must compile to named events + action types — edges are not the machine.

**Fast (22:31):** `run_audit` **is** the Audit module, named as `action.type`. Landed wrap: **`executeAuditRun`**. `handleAuditRunCreate` is the HTTP door. Do not rewrite audit. Do not invent generic table-write nodes. File land is the door (a form-shaped write). Book readiness **stays the face** on `audit_runs`. Provision stays a module; wrapping `handleMachineProvision` is a **later** verb, not this cut.  
**Join:** [`SYSTEMS-CHANGE-PACKET-013.md`](./SYSTEMS-CHANGE-PACKET-013.md) still lands the file (`import_batch` + `contact_import` dispatch). [`SYSTEMS-CHANGE-PACKET-015.md`](./SYSTEMS-CHANGE-PACKET-015.md) is the handle (this run’s writes → next node). This packet is the first graph on that handle. Ship 013 + 014 + 015 together.  
**Flag:** 15:43 untouched.  
**Instructions:** founder only.

---

## Landed — PR [#94](https://github.com/bywale-com/omcoda_tower/pull/94) (with 013+015)

**Do not recut 014.** Ratify: [`SYSTEMS-CUT-ASSESSMENT.md`](./SYSTEMS-CUT-ASSESSMENT.md).

| Spec | On main |
|------|---------|
| `workflow.firm_id` NULL · `contact_records.notes` · house graph seed | **`supabase/migrations/015_house_notes_handle.sql`** — not `014_house_audit_tag_notes.sql` |
| Dispatch hears house | `WHERE (t.firm_id=$1 OR t.firm_id IS NULL)` and `status='active'` |
| Walker by `type` | `run_audit` → `executeAuditRun`; `ascribe_tag` → `contact_tag` + optional notes; `call_agent` enrolls |
| House seed `wf-house-contact-import` | Graph is the picture. Status **`draft`**. Activate materializes `workflow_trigger`. Import will **not** walk until Activate. |
| If “this contact failed” | Seed: `sequence_ready.ready eq false`. `executeAuditRun` sets `ready=true` for **reachable and partial**. Failed on this graph = **unreachable only**. Partial is tagged **valid**. |

**Wrong on the packet (wrap language):** “`run_audit` **is** `handleAuditRunCreate`.” The module is **`executeAuditRun`**. HTTP and walker both wrap that.

`fireOnboarding` after audit is **gone** from Book readiness on main. Do not put it back as the product path.

---

## What you are trying to achieve (plain)

A **house** automation you can change without shipping code:

1. **Trigger:** a contact **file** was imported — any firm, any of the doors that land a file (Confirm book, Prepared upload/file). Not “any import in the universe.” Path is `import_batch.source`. Other import kinds later.
2. **Action:** **audit the contacts** — same writes as Book readiness Start Audit. A node. Not hardcoded on the upload.
3. **Then per contact:** attach a **tag** (checkmark / X as chrome on that tag) when the data is good or not. **Notes** on that contact with the rationale. Visible on Consultant **Contacts**.
4. You can add/remove/change nodes. You do not go into the repo to invent the next listen.

---

## Can it already exist?

**Pieces existed. The chain could not run at packet time. #94 cut it. Leftover: Activate the house seed.**

| Piece | Stood up? | Honest |
|-------|-----------|--------|
| `import_batch` / dispatch `contact_import` | **Yes — #94** | Confirm book / upload land the book. Do **not** auto-audit. |
| Trigger row `workflow_trigger` | Yes | Name must be `contact_import`. Hub `import.created` is leftover on the type union. |
| **Any firm** / house | **#94** | `workflow.firm_id` NULL. Dispatch includes NULL-firm triggers. Seed is **draft** — Activate before import will walk. |
| `action.type='run_audit'` | CHECK + walker **#94** | `executeAuditRun`. |
| `audit_runs` + verdicts + `sequence_ready` | Yes | Book readiness reads it (013). |
| `action.type='ascribe_tag'` + `contact_tag` | CHECK + walker **#94** | INSERT `contact_tag`. Notes when `notesFromVerdict`. |
| Notes on the contact | Column **#94** | `contact_records.notes`. Contacts pane shows it. |
| If (previous result) | `evalIfPick` **#94** | Person split on picked table/field. Seed uses `sequence_ready.ready`, not `reachability_verdicts.verdict`. |
| Delete node | Chrome **#94** | Backspace / Delete + Remove. |

Do **not** hardcode “upload always audits” in `createAuditRun` as the product path. Operator Start Audit stays a **manual** door (same `audit_runs` write). The automation is the modular door.

---

## The canvas (this workflow)

Trigger → Action (`run_audit`) → If (pick from **this Audit run’s write-set**, e.g. this contact failed) → Action (`ascribe_tag` invalid + notes) ; else → Action (`ascribe_tag` valid).

Do **not** specify Audit’s outputs as two or three named things. After Audit, **every write that run made** is available. The If **picks** which of those writes it is about. Sequence-ready / verdict are picks, not a catalog we froze.

No If is legal (A1 smallest). Then you cannot tag only the bad rows unless the ascribe node itself reads the verdict. **Prefer If on the canvas** — that is the contract they can edit. Do not hide the split in TypeScript.

Tag strings are authored on the action node (`tag` TEXT). Chrome may draw ✓ / ✕ from those strings. Do not CHECK checkmark vs X.

Notes text = short rationale from the verdict (`unreachable` / `partial` / missing email / missing phone). Write `contact_records.notes`. Pane on Consultant Contacts next to the person.

---

## Machine

### 1. House workflow (any firm)

```sql
ALTER TABLE workflow ALTER COLUMN firm_id DROP NOT NULL;  -- NULL = house / platform
```

`workflow_trigger.firm_id` may be NULL when the workflow is house.

**Dispatch:** find triggers where `enabled` and `type='event'` and `event_name` matches **and** (`firm_id` = the writing firm **or** `firm_id IS NULL`). Still require `workflow_state.status='active'`. Walk with the **writing** firm’s `contactIds` (from that `import_batch`).

Grain A18: house trigger is **Global** (all contact file imports). Local = this batch / this firm — later. Audience A19 is not a substitute for house `firm_id` NULL.

### 2. Notes

```sql
ALTER TABLE contact_records
  ADD COLUMN IF NOT EXISTS notes TEXT;
```

No notes table. Tag stays `contact_tag` (already on main).

### 3. Walker — action by `type` (hard)

Stop treating every action as enroll.

| `action.type` | Write |
|---------------|--------|
| `run_audit` | **Wrap** **`executeAuditRun`** for the **picked** writes on the previous handle (015). Do not recode audit. Then the handle **becomes this Audit run’s writes**. `dispatchEventToWorkflows('audit.completed')` for a **second** automation. Not a substitute for the handle on this canvas. |
| `ascribe_tag` | INSERT `contact_tag` (`firm_id`, `contact_id`, `tag` from node data, `source_workflow_id`). UPDATE `contact_records.notes` when the node has a notes/rationale binding (from previous verdict). |
| `call_agent` | Today’s enroll. Unchanged. |

`agent_ref` stays nullable except `call_agent`.

### 4. If

`evalBranch` for this pass: field = this contact’s `sequence_ready` or `reachability_verdicts.verdict`. Op / constant authored on the If node (A16). Then / else edges. Not a rule pack.

### 5. Trigger name

`contact_import` only. File doors all INSERT `import_batch` `kind='contact'`. `source` records the path (`file` / `assisted` / `crm`). If they later want “only Confirm book,” they If on `source`. Do not mint a second event per door.

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/015_house_notes_handle.sql` | **Landed name.** Packet originally said `014_house_audit_tag_notes.sql`. `workflow.firm_id` nullable; `contact_records.notes`; house graph seed (**draft**) |
| `server/wire-service/workflowWalk.ts` | House dispatch; `run_audit` / `ascribe_tag`; If on verdict |
| `server/wire-service/machine.ts` | 013 land still; do not auto-audit inside land |
| Ant Automations | House workflow; picker **Contact import**; actions Audit / Ascribe tag; If; delete node |
| Ant Contacts | Show `contact_tag` + `notes` on the row / inspect pane |
| Ant Book readiness | Load `audit_runs` (013) |

013 SQL (`014_contact_import.sql` on main) landed in the same ship. Manual still: **Activate** the house automation, then firm A and firm B each Confirm-book a CSV. Both produce `audit_runs` and tags/notes. Change the If on the canvas, Save, next import follows. No repo edit.

---

## What this is not

- Not overwriting 15:43.
- Not hardcoding audit on upload.
- Not enrolling because an action node exists.
- Not Hub `import.created`.
- Not an `events` table.
- Not a notes table.
- Not merging desks.
- Not filling import kinds.
- Not skipping 012 or 013.
