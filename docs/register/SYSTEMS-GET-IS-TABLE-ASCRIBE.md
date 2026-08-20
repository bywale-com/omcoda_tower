# Systems — Get is a table SELECT. The module name is a label.

**Seat:** Systems Analyst.  
**When:** 2026-08-20 14:40 UTC.  
**What this is:** the machine truth of Get, against the glass. Not a new packet. No new table.  
**Why:** Founder: Get looks module-based; Activation state is a projection; “get firms at a stage / when a firm reaches X” feels like looking at that module. Do not translate that into a table so the feeling works.  
**Join:** [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md) · [`SYSTEMS-CHANGE-PACKET-017.md`](./SYSTEMS-CHANGE-PACKET-017.md) · [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md) · [`SYSTEMS-CHANGE-PACKET-020.md`](./SYSTEMS-CHANGE-PACKET-020.md).  
**Flag:** 15:43 untouched. **Do not recut 015.** Stood-up walker: `origin/main` `executeGet`.

---

## What Get actually is

The picker is labeled with **six module names**: Contacts, Firms, Audits, Imports, Agents, Reference.

The walker does **not** read “that module.” Each label is a hardcoded `SELECT` of **one table**:

| Glass label | SQL | Writes onto the handle |
|-------------|-----|-------------------------|
| Contacts | `SELECT id FROM contact_records` (optional `firm_id` / ids) | `contact_records` |
| Firms | `SELECT id FROM ct_firms` (or one id) | `ct_firms` |
| Audits | `SELECT id FROM audit_runs` | `audit_runs` |
| Imports | `SELECT id FROM import_batch WHERE kind='contact'` | `import_batch` |
| Agents | `SELECT id FROM campaign` (optional `sequence_id`) | `campaign` |
| Reference | nothing | empty |

Get Firms does **not** filter `posture`, `campaign_states`, grants, sending, or escrow. Get is not the Operator sider. Activation state is **not** in this list.

Where the desk module **owns** that table (Contacts → `contact_records`), the label and the machine match. Where the desk module is a **projection** (Activation state), there is nothing to Get. The label would be a lie.

---

## “Get all firms at stage X”

There is no stage column. Activation state’s “stage” is React over several independent writes.

Backend, if you mean a **real** fact:

- running → `campaign_states.state = 'running'`
- armed → `campaign_states.state = 'armed-for-activation'`
- book authorized → `crm_oauth_grants`
- firm exists → `ct_firms`

That is Get or If on **that table**, not Get “Activation state.”

If you mean the **composite** (all gates true): that fact is **never written**. A JOIN across those tables is a query you could name. It is still not the module containing a table. Storing the JOIN result as `firm_readiness` is the copy we already refused.

---

## “When any firm reaches X”

That is a **trigger**, not Get.

Triggers fire on a **table write**. “Reaches X” only exists if X **is** a write (`campaign_states` flipped to `running`, grant inserted, etc.).

Nothing fires when the Activation percent hits 100%. That percent is computed when the pane opens. A projection is not an event.

To automate the composite you either listen to **each gate write** and If the others, or you poll a JOIN (schedule). There is no “Activation module changed” event.

---

## Do not

- Recut 015.
- Add Activation state to `GET_MODULES` without naming the table the handle would hold.
- Mint `firm_readiness` so Get can look like the module.
- Treat Get’s module labels as the Operator sider.
- Overwrite 15:43.
