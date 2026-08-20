# Systems — Get: glass is the module; machine is the writes

**Seat:** Systems Analyst.  
**When:** 2026-08-20 14:50 UTC (interface lock). 14:40 UTC below is what the walker **is today**.  
**What this is:** founder law for Get going forward. Not this packet’s engineer cut (not priority). No new table.  
**Why:** Founder: stop wearing them on the backend. Get should feel like “I see it in that module, so I Get it from there” — contacts in Contacts, same thinking for every module. They will not name tables. SA makes the back fit existing practice.  
**Join:** [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md) · [`SYSTEMS-CHANGE-PACKET-020.md`](./SYSTEMS-CHANGE-PACKET-020.md) · [`SYSTEMS-OPERATOR-MODULES-ASCRIBE.md`](./SYSTEMS-OPERATOR-MODULES-ASCRIBE.md) · [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md).  
**Flag:** 15:43 untouched. **Do not recut 015.**

---

## Interface (locked)

Get is authored in **module language**.

You pick the module where you **see** the records. You pick the fields that module **shows**. You do not pick a table. You do not need to know the SELECT.

That is the same thinking for **every** module that is a pane of rows — not only the six names on the picker today.

SA maps module → the writes that pane already displays. Engineer implements that map. One fact, one write: do **not** mint a copy table so the picker has something to point at.

Prerequisite: **020**. If the module is paint or a calculator, “Get from that module” is a lie. First the module displays real rows. Then Get can offer that module.

Not this cut: do not expand `GET_MODULES` to the Operator sider until 020’s panes exist and this is priority.

---

## What the walker is today (14:40)

The picker has **six module names**: Contacts, Firms, Audits, Imports, Agents, Reference.

Each name is a hardcoded `SELECT` of **one table**:

| Glass label | SQL | Writes onto the handle |
|-------------|-----|-------------------------|
| Contacts | `SELECT id FROM contact_records` (optional `firm_id` / ids) | `contact_records` |
| Firms | `SELECT id FROM ct_firms` (or one id) | `ct_firms` |
| Audits | `SELECT id FROM audit_runs` | `audit_runs` |
| Imports | `SELECT id FROM import_batch WHERE kind='contact'` | `import_batch` |
| Agents | `SELECT id FROM campaign` (optional `sequence_id`) | `campaign` |
| Reference | nothing | empty |

Get Firms does **not** filter posture / campaign / gates. Activation state is **not** in the list. That is **today**, not the interface law above.

Where the module already owns the table (Contacts → `contact_records`), today already matches the law. Where the module is still a calculator (Activation state), today cannot match until 020 lists the gate rows — then Get “Activation state” maps to **those** writes (a query over existing tables, not `firm_readiness`).

---

## Triggers vs Get (unchanged)

**Get** = read what that module’s pane shows, now.

**When a firm reaches X** = trigger on the **write** that is X. A percent computed in the pane is not a write, so it is not a trigger. After 020, the pane shows rows; the event is still the gate write, not “the module changed.”

---

## Do not

- Recut 015.
- Ask the founder to name tables.
- Mint `firm_readiness` so Get can look like Activation.
- Expand the Get catalog in this packet (not priority).
- Overwrite 15:43.
