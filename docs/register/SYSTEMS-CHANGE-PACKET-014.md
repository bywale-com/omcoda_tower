# Systems — change packet 014 (this workflow, authored — not hardcoded)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 22:17 UTC.  
**What this is:** the machine for the workflow the founder named. Implementer **only implements**. No analysis.  
**Why:** Anyone in any firm imports a **contact file** → **audit** (a node, not a hard-coded path) → for each contact, **tag** valid / invalid and **notes** with the rationale, on the contact. Editable on the canvas. Platform: every heard write can be a trigger; every action is a write.

**Why this cut is heavy (not 14 tables — a compiler):** Destination = the graph **is** the app. Today the app **is** TypeScript. This path cannot stay hardcoded in `handleAuditRunCreate` or the canvas stays theater. The lot is dual-running: keep the handler world, stand up a walker that executes **verbs** (`run_audit`, `ascribe_tag`), dispatch after the file write, house hear. The canvas picture must compile to named events + action types — edges are not the machine.

**Fast (22:31):** `run_audit` **is** `handleAuditRunCreate`, named as `action.type`. Do not rewrite audit. Do not invent generic table-write nodes. File land is the door (a form-shaped write). Book readiness **stays the face** on `audit_runs`. Provision stays a module; wrapping `handleMachineProvision` is a **later** verb, not this cut.  
**Join:** [`SYSTEMS-CHANGE-PACKET-013.md`](./SYSTEMS-CHANGE-PACKET-013.md) still lands the file (`import_batch` + `contact_import` dispatch). This packet is the walk after that write.  
**Flag:** 15:43 untouched.  
**Instructions:** founder only.

---

## What you are trying to achieve (plain)

A **house** automation you can change without shipping code:

1. **Trigger:** a contact **file** was imported — any firm, any of the doors that land a file (Confirm book, Prepared upload/file). Not “any import in the universe.” Path is `import_batch.source`. Other import kinds later.
2. **Action:** **audit the contacts** — same writes as Book readiness Start Audit. A node. Not hardcoded on the upload.
3. **Then per contact:** attach a **tag** (checkmark / X as chrome on that tag) when the data is good or not. **Notes** on that contact with the rationale. Visible on Consultant **Contacts**.
4. You can add/remove/change nodes. You do not go into the repo to invent the next listen.

---

## Can it already exist?

**Pieces exist. The chain cannot run.**

| Piece | Stood up? | Honest |
|-------|-----------|--------|
| `import_batch` / dispatch `contact_import` | **No** | 013. Today Confirm book is `crmOAuth.grant`. Book readiness upload **hardcodes** audit in `createAuditRun`. |
| Trigger row `workflow_trigger` | Yes | Name must be `contact_import`. Hub `import.created` is leftover. |
| **Any firm** | **No** | Dispatch matches `workflow_trigger.firm_id` = the writing firm. A workflow saved on one tenancy will **not** hear another firm. House workflow needs `workflow.firm_id` **NULL** and dispatch must include those rows. |
| `action.type='run_audit'` | CHECK yes | Walker **does not** run it. Every action today **enrolls**. Put audit on the canvas now and people get enrolled. |
| `audit_runs` + verdicts + `sequence_ready` | Yes | That is the audit write-set. Book readiness must **read** it (013). |
| `action.type='ascribe_tag'` + `contact_tag` | CHECK + table yes | Walker **does not** INSERT `contact_tag`. |
| Notes on the contact | **No column** | `contact_records.body` exists; there is no notes pane. Add `notes TEXT`. |
| If (previous result) | Graph kind yes | `evalBranch` is still eligibility true/false. Must read **this contact’s verdict** from the audit. |
| Delete node | No | 013 chrome. |

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
| `run_audit` | **Wrap** `handleAuditRunCreate` (same writes), for `ctx.contactIds`. Do not recode audit. Then `dispatchEventToWorkflows('audit.completed')`. Put verdicts on walk context **per contact**. |
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
| `supabase/migrations/014_house_audit_tag_notes.sql` | `workflow.firm_id` nullable; `contact_records.notes` |
| `server/wire-service/workflowWalk.ts` | House dispatch; `run_audit` / `ascribe_tag`; If on verdict |
| `server/wire-service/machine.ts` | 013 land still; do not auto-audit inside land |
| Ant Automations | House workflow; picker **Contact import**; actions Audit / Ascribe tag; If; delete node |
| Ant Contacts | Show `contact_tag` + `notes` on the row / inspect pane |
| Ant Book readiness | Load `audit_runs` (013) |

013 SQL (`import_batch`) still required first or in the same ship. `npm run build`. Manual: firm A and firm B each Confirm-book a CSV. One **house** automation active. Both produce `audit_runs` and tags/notes on those contacts. Change the If on the canvas, Save, next import follows the new graph. No repo edit.

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
