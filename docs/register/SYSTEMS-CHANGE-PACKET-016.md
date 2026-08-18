# Systems — change packet 016 (event contract: write-set + test data, versioned)

**Seat:** Systems Analyst.  
**When:** 2026-08-18 23:22 UTC.  
**What this is:** the contract so Test never hardcodes fields, and so a new trigger cannot ship without knowing its writes **and** its values. Implementer **only implements**.  
**Why:** Founder: two facts, both need upkeep — (1) which tables this trigger writes, (2) the data under those classes. Versioning + a protocol to update. SA: **two tables.** Not a third header. Not an events log.  
**Join:** [`SYSTEMS-TEST-ASCRIBE.md`](./SYSTEMS-TEST-ASCRIBE.md) · 015 handle stays live truth for a **run**. This is the **kind** contract for Test and for connect.  
**Flag:** 15:43 untouched. **Do not recut 015.**  
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| Versioned **contract** of what an `event_name` writes, plus **specimen values** for Test | An `events` table that copies every live INSERT |
| What Test reads when sourcing **Trigger Output** (door 2; door 1 still prefers a real instance) | The live handle (`previousWrites` from the module this run) |
| Upkeep when the module grows a write: **new version**, both tables | UPDATE in place. A list in Ant. AI |

23:18 said “don’t mint, handler is enough.” **Incomplete.** Handler drifts from Test unless the contract is a table that **must** bump with the handler. Two tables. Protocol below.

---

## Two tables (final count)

Not three. Version is an integer on both. Active contract = `max(version)` for that `event_name`. History stays.

```sql
-- 016 (spec — implementer cuts)

CREATE TABLE event_write_set (
  event_name TEXT NOT NULL,
  version    INT  NOT NULL,
  table_name TEXT NOT NULL,
  ord        INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (event_name, version, table_name)
);

CREATE TABLE event_test_data (
  id         TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  version    INT  NOT NULL,
  table_name TEXT NOT NULL,
  ord        INT  NOT NULL DEFAULT 0,
  body       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX event_test_data_ev_idx
  ON event_test_data (event_name, version, table_name, ord);
```

| Table | Fact | Rows |
|-------|------|------|
| **`event_write_set`** | Which tables this trigger **impacts** at this version | One row per table. Contact import v1: `import_batch`, `contact_records` |
| **`event_test_data`** | Specimen **values** under those classes | One or more `body` jsonb per table (one batch, several contacts). Keys in `body` = that table’s columns. Not extra toy fields |

`body` is jsonb because classes do not share columns. It is the specimen row, not a live copy and not operator chrome stuffed in a bag.

**Protocol (the upkeep — this is the contract):**

1. **Never ship a new `event_name`** (A26 / dispatch) without version **1** of **both** tables. If you cannot fill them, the event stays silent (pack-update today).
2. **Never UPDATE** a shipping version. Handler grows a write → `version + 1` on **both**. Copy forward, add the new table + its specimen `body`. Test uses `max(version)`.
3. Every `table_name` in `event_write_set` at `(event_name, version)` has **≥1** `event_test_data` row. Incomplete version is not active — do not bump `max` until both are in.
4. **Do not** INSERT into these from a live fire. Live writes stay on the real tables. Door 1 Test **loads those**. These two tables are the kind contract, not the log.
5. Live walk (015) still uses **actual** `writes[]` from the handler. If live writes a table **not** in the active `event_write_set`, that is a **failed cut** — bump version. Do not freeze 015 to this list.

---

## Seed — events that already dispatch (v1)

Do not seed pack-update. Do not seed `contact.created` until it dispatches.

| `event_name` | `event_write_set` table_name (ord) | `event_test_data` |
|--------------|-------------------------------------|-------------------|
| `contact_import` | `import_batch` 0 · `contact_records` 1 | One batch body + ≥1 contact body (name, email, phone, firm_id, id) |
| `fact_writebacks` | `fact_writebacks` | One body with `form_ref` |
| `campaign_failure` | `campaign_failure` | One body with `campaign_id` |
| `consent_records.opt_out` | `consent_records` | One body (`contact_id`, `firm_id`, opt-out shape that table already has) |
| `ct_firms` | `ct_firms` | One firm body |
| `audit.completed` | `audit_runs` 0 · `contact_records` 1 · `reachability_verdicts` 2 · `sequence_ready` 3 | One run + contacts + verdict/ready bodies — **same fields `executeAuditRun` writes**, not a fake score column |
| `eligibility.changed` | the four eligibility tables that cascade already writes | Match `runContactEligibilityCascade` — do not invent |
| `halt_records` | `halt_records` | One body |
| `meeting_booked` | `meeting_booked` | One body |

A26 picker rows without a v1 contract stay unlistable for Test. Schedule / manual / webhook: **no rows** (not table-change events).

Specimen `body` values: canonical enough to map (Harbor-style is fine **in this table**, not painted in the SPA). Door 1 still wins when a real import exists.

---

## Test walk (unchanged then-this)

1. Read workflow’s trigger `event_name`.
2. Door 1: if an instance exists, load **live** rows (real `import_batch` + contacts). Contract still tells the tree **which tables** to show.
3. Door 2: `SELECT` write_set + test_data at `max(version)`. That is Trigger Output (fields **and** values).
4. Later nodes: previous Output → module(`commit: false`) → next Input. Get is a DAG node. Not a fallback.

Ant does **not** contain a field list.

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/016_event_test_contract.sql` | Two tables + v1 seed for dispatching events |
| `server/wire-service/` Test path | Load contract / live instance; fill trigger handle; walk with no persist |
| Ant Test button | Save · Test · Launch. Fills A29 / A20 from that handle |

`npm run build`. Manual: new canvas, Contact import, Test with no prior import → tree shows `import_batch` + `contact_records` **with values** from `event_test_data`. Add a table to import handler without 016 version bump = failed cut.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015.
- Not an events log.
- Not a third `event_contract` header (max version is the protocol). Add a header later only if draft/active must be a row.
- Not AI.
- Not packing A26 until the event has v1 of **both**.
