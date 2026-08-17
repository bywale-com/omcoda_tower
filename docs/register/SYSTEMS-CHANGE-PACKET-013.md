# Systems — change packet 013 (contact import → audit; Book readiness is the pane)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 21:57 UTC.  
**What this is:** the next cut for this ask. Implementer **only implements**. No analysis.  
**Why:** Founder on the Consultant desk: Contacts has no upload. **Confirm book for Tower** is supposed to land the book. Automations: trigger **contact import** → action **audit the contacts**. Operator **Book readiness** is the pane for every audit artifact. Canvas must **remove** a node.  
**Flag:** 15:43 untouched. 012 still stands (timer / A18 / A19). This packet does not wait on 012.  
**Instructions:** founder only.

---

## What is wrong on the glass today

| Glass | Today | Law |
|-------|-------|-----|
| Consultant **Contacts** → Confirm book for Tower | `crmOAuth.grant` only. No file. Empty book says upload as **Operator**. | That button **imports the book**. |
| Prepared **Authorize book** | Modal: CRM / upload / file. Upload copy exists. Contacts does not share the path. | Authorize = grant. Upload/file = **same import write** as Confirm book. Two doors, one write. |
| Automations picker | Hub leftover `import.created` | Event is **`contact_import`**. Other import kinds later. Do not use the Hub name. |
| Automations canvas | Add node. **No remove.** | Delete the node. Save the graph without it. |
| Operator **Book readiness** | In-memory list. Empty on refresh. | Pane of **`audit_runs`**. Every audit on Tower is a row. |

Consultant desk vs Operator desk stay two seats. Consultant owns the book. Operator owns the house audit pane. Do not merge the desks.

---

## Confirm book for Tower = contact import

Not a grant. Not “tell Operator to upload.”

**Copy:** On Consultant **Contacts**, **Confirm book for Tower** opens a file picker (CSV). Consultant picks the file. That **lands** the book.

Same land path from Prepared Authorize book when the radio is **Upload** or **File export**. CRM radio stays `crmOAuth.grant` — that is permission, not people.

```sql
-- 013 (spec — implementer cuts)

CREATE TABLE import_batch (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'contact'
    CHECK (kind IN ('contact')),          -- widen when another import kind is a new ask
  source TEXT NOT NULL DEFAULT 'file'
    CHECK (source IN ('file', 'crm', 'assisted')),
  filename TEXT,
  row_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX import_batch_firm_idx ON import_batch (firm_id, created_at DESC);

ALTER TABLE contact_records
  ADD COLUMN IF NOT EXISTS import_batch_id TEXT
    REFERENCES import_batch(id) ON DELETE SET NULL;
```

**On Confirm book / upload:**

1. INSERT `import_batch` (`kind='contact'`, this `firm_id`, filename, row_count).
2. UPSERT `contact_records` for this firm (name, email, phone) with that `import_batch_id`.
3. **Then** `dispatchEventToWorkflows({ eventName: 'contact_import', firmId, payload: { import_batch_id } })`.

The INSERT in (1) **is** the event. Do not mint an `events` table. Do not dispatch per contact row.

Empty Contacts: “This firm’s book is empty — Confirm book for Tower to upload.” Do not send them to Operator Book readiness to upload.

---

## Automations — contact import → audit the contacts

Smallest: **trigger → action**. No condition this pass. If they add If later, A16.

| Node | Persist |
|------|---------|
| Trigger | `workflow_trigger.type='event'`, `event_name='contact_import'` |
| Action | `action.type='run_audit'` (already in the CHECK) |

Picker lists `contact_import` as **Contact import**. Do not list a generic “import.” Do not list Hub `import.created`.

**A18:** Global = every contact import (all firms this automation’s audience covers). Local = **this** `import_batch` / this firm’s imports. Audience is still A19 (who). No condition required to ship this chain.

**`run_audit` walker:** INSERT `audit_runs` for that `firm_id`, `status='complete'`, `import_ids` includes the `import_batch_id`. Write `reachability_verdicts` + `sequence_ready` for those `contact_records` (same grain as today’s `handleAuditRunCreate`). Then `dispatchEventToWorkflows('audit.completed')`. The audit **row** is the artifact. Do not skip the INSERT.

---

## Book readiness is the pane of every audit

Yes. That is the shape.

Every `audit_runs` INSERT — Operator **Start Audit**, Automations `run_audit`, anyone — **appears** in Operator **Book readiness**.

Not in-memory. On load: `SELECT * FROM audit_runs` (this firm if a firm is bound; Operator house may list all, filter by firm). Columns: when, firm, status, contact count / ready from `summary`. Open a run → verdicts from `reachability_verdicts` for that run’s contacts.

Do not keep a second “operator-only” audit list. There is one table.

---

## Remove a node

Chrome. No table.

Select a node on the Automations canvas. **Delete / Backspace**, or a Remove control. Edges to it go. Save writes `workflow.graph` without that node. Trigger-only leftover is allowed (smallest can be one node). Do not leave a ghost.

Same pattern on Agents canvas if a node can be added — if you can add it, you can remove it.

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/013_contact_import.sql` | `import_batch` + `contact_records.import_batch_id` |
| `server/wire-service/machine.ts` | Confirm-book / upload lands batch + contacts + dispatch `contact_import` |
| `server/wire-service/workflowWalk.ts` | `run_audit` writes `audit_runs`; dispatch `audit.completed` |
| Ant Consultant Contacts | Confirm book = file picker. Same land path. |
| Ant Prepared Authorize | Upload/file radios call that path. CRM radio stays grant. |
| Ant Automations | Event **Contact import**. Delete node. |
| Ant Book readiness | Load `audit_runs`. Stop using empty React state as the list. |

`npm run build`. Manual: Consultant Confirm book → CSV → `import_batch` + contacts. Automation contact_import → run_audit → row in Book readiness. Delete a node → Save → gone.

---

## What this is not

- Not overwriting 15:43.
- Not merging Consultant and Operator desks.
- Not `crmOAuth.grant` as the import.
- Not Hub `import.created`.
- Not an `events` table.
- Not a condition node this pass.
- Not filling the import-kind catalog. `contact` only until a new ask.
- Not skipping 012.
