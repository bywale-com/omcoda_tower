# Systems — change packet 015 (the handle: this run’s writes are the next node’s input)

**Seat:** Systems Analyst.  
**When:** 2026-08-17 12:50 UTC.  
**What this is:** the connect. Implementer **only implements**. No analysis.  
**Why:** After any node, the output is **every write that run made**. The next node **picks** which of those writes it is about. Live walk does not do this yet. Founder: go to the engineer.  
**Join:** [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md) 12:45 · [`SYSTEMS-CHANGE-PACKET-013.md`](./SYSTEMS-CHANGE-PACKET-013.md) lands the import · [`SYSTEMS-CHANGE-PACKET-014.md`](./SYSTEMS-CHANGE-PACKET-014.md) is the first graph that uses this handle. Ship **013 + 014 + this** together unless 013 already landed.  
**Flag:** 15:43 untouched.  
**Instructions:** founder only.

---

## Landed — PR [#94](https://github.com/bywale-com/omcoda_tower/pull/94) (with 013+014)

**Do not recut 015.** The handle type is done. Assessment: [`SYSTEMS-CUT-ASSESSMENT.md`](./SYSTEMS-CUT-ASSESSMENT.md). Get / Rule interiors (**#96**) **extend** it. Ascribe: [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md).

| Spec | On main |
|------|---------|
| `previousWrites` `{ table, id, contact_id? }[]` | `server/wire-service/runWrites.ts`. Trigger fills from payload. |
| Action | **Replaces** the handle with that module’s writes (last-node). |
| If | Does not invent writes. `evalIfPick`. **Pass-through** for then/else children (saves/restores). |
| Persist | `workflow_run.node_status` includes `writes`. |
| Audit wrap | **`executeAuditRun`**, not a recode. HTTP `handleAuditRunCreate` is the same function. |
| Import dispatch | Payload includes `writes`. No audit-on-upload. |

**015 boundary (not a failure):** live is last-node, not a stack of every ancestor. Enough for import → audit → If → tag. **Not** PR #96 “Input sees every prior node.” Do not recut the handle to get the stack — Input reads `node_status` / walks prior nodes.

**Chrome leftover:** If `previousResultFrom` is saved and **not read**. Pick UI is an enum + text, not a live list of this-run writes. Empty `contactIds` falls back to `sequence_ready ready=true LIMIT 50` — undocumented risk; not Get.

**SQL:** handle is walker. House + notes DDL is `015_house_notes_handle.sql`.

---

## What you are trying to achieve (plain)

The arrows already mean **then this**. After a node finishes, the next node must have **this run’s writes** — the same rows the module would have written if you had used the desk without Automations. Not a short list we specified. Not Hub preview JSON unless it is only a pointer to those rows.

The next node **picks** which write(s) to use. Audit picks the import (or those contacts) from the import node’s writes. If picks a field of a write from the Audit node’s writes (this person failed). Tag writes on that contact.

Same shape for trigger and action. New nodes do not get a new output format.

---

## What we already have (do not rebuild)

| Already there | What it does |
|---------------|--------------|
| `workflow.graph` nodes + edges | Order. Then this. |
| `workflow_trigger` on Activate | Listen for a named event. |
| `dispatchEventToWorkflows` | Wakes matching workflows, starts a walk. |
| Walker `visit` follows outgoing edges | Then this, live. |
| Audit module (`executeAuditRun`; HTTP = `handleAuditRunCreate`) | Writes `audit_runs`, `contact_records`, `reachability_verdicts`, `sequence_ready` and **returns** `{ id, verdicts, summary, writes }`. Walker **consumes** `writes` as the next handle (**#94**). |
| Provision module | Already writes the firm tables. Same idea later. Not this cut’s first graph. |
| `action.type` `run_audit` / `ascribe_tag` | Allowed. Walker **runs** them (**#94**). `call_agent` still enrolls. |
| Hub editor `lastOutput` → `lastInput` | Right **shape**, wrong **data** (demo pull). Do not treat as live. |
| A16 If | Face: reads **previous result**. Live: `evalIfPick` on `pickTable`/`pickField`. `previousResultFrom` chrome is **not** read. |
| `workflow_run.node_status` jsonb | Place to persist per-node write pointers for this run if you need them after the request. Not an events table. |

---

## What to cut (the reshape)

### 1. The handle on the walk (hard)

On `WalkContext`, hold **previous writes**: a list of `{ table, id }` (and contact_id when the row is per person). That list **is** the previous result.

When a **trigger** fires: fill it from the writes of **that event** (import: `import_batch` + each `contact_records` from that batch). Put the same list on the trigger node’s `node_status`.

When an **action** finishes: fill it from **every write that module made in this run**. Use what the module already returns / inserts. Do **not** hardcode “Audit outputs these three names.” If Audit writes four tables today, four pointers. If it later writes notes, those pointers appear without a packet change.

When **If** runs: it does not invent writes. It **picks** a field of a write already on the handle (person field → split people; run field → once). Then / else. The handle **passes through** (same writes still available after the If).

Do not mint an `events` table that copies the row.

### 2. Walker runs the action type

Stop enrolling because an action node exists.

| `action.type` | What it does |
|---------------|----------------|
| `run_audit` | Call **`executeAuditRun`** with the **picked** writes from the previous handle (the import / those contact ids). Do not recode Audit. Then replace the handle with **this Audit run’s writes**. Then `dispatchEventToWorkflows('audit.completed')` so a **second** automation can hear it. That event is not a substitute for the handle on **this** canvas. |
| `ascribe_tag` | INSERT `contact_tag` on the picked contact(s). Notes on `contact_records.notes` when authored. Handle = those tag (and notes) writes. |
| `call_agent` | Today’s enroll. Unchanged. Handle = the `enrollment` writes. |

### 3. Pick, on the node

Action / If node data: **which write(s)** from the previous handle. Not a global catalog of every table in the app. Only what the previous node actually wrote.

Glass: Contact import trigger; Audit the contacts (in the application); If this contact failed; Add tag on the contact; **delete node**. 014 list.

### 4. House + import

013 still lands the file and dispatches `contact_import` **with** the write-set in the payload (batch id + contact ids). 014 house `workflow.firm_id` NULL + dispatch hears those rows. Do not auto-audit inside the import.

---

## Files

| File | Why |
|------|-----|
| `server/wire-service/runWrites.ts` | `RunWrite` + `writesFromPayload` |
| `server/wire-service/workflowWalk.ts` | Handle on context; action by type; If picks from handle; persist pointers on `workflow_run.node_status` |
| `server/wire-service/auditRun.ts` | **`executeAuditRun`** — Audit write-set + `writes` |
| `server/wire-service/machine.ts` | Import dispatch includes write-set; HTTP audit wraps the same function; no audit-on-upload |
| 013 SQL | Landed as `014_contact_import.sql` |
| 014 SQL | Landed as `015_house_notes_handle.sql` (`firm_id` NULL; `notes`; house seed **draft**) |
| Ant Automations | Picker Contact import; Audit / tag actions; If pick; delete node |
| Ant Contacts | Tag + notes on the person |
| Ant Book readiness | Load `audit_runs` |

`npm run build`. Manual: **Activate** house seed → import CSV → Audit module actually ran (row in Book readiness) → unreachable people tagged invalid in Contacts. Change the If pick, Save, next import follows. No repo edit.

---

## What this is not

- Not overwriting 15:43.
- Not an events table.
- Not specifying Audit as run / verdict / sequence-ready (those may appear because Audit wrote them; they are not the format).
- Not Hub demo `lastOutput` as the live handle.
- Not enrolling because an action exists.
- Not skipping 013 or 014 — this is the reshape they sit on.
- Not Provision as the first graph.
- Not full-chain Input / Get / Rule emit listing — those are #96. Do not recut this handle for them.
