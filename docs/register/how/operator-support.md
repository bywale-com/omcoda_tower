# Operator — Customer support / success

**Kind:** secondary  
**Subject:** Operator (house-global queue + per-tenancy context)

**Statement**
> As Operator, I can answer a running firm's questions and work its tickets with that firm's bind,
> health, and commercial context — so that the Consultant's firm keeps running.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Running firm asks or operational ticket opens.  
**Conditions:** Agency queue + firm-scoped context; not a firm-desk persona.

---

## Depth 1 — first How

**Q:** How do I answer a running firm's questions and work its tickets with that firm's bind, health, and commercial context?

**Clarity:** Starting from Customer support, open Ticket queue, select a Ticket row, inspect Support context tabs for bind, health, commercial, activation, and audit facts, then click Resolve after the linked per-tenancy control is fixed.

**DNA for children:**
1. work the Ticket queue
2. open a Ticket with that firm's Support context (bind, health, commercial)
3. resolve so the Consultant's firm keeps running

---

### Leaf 1.1 — ticket queue

**Q:** How do I work the Ticket queue?

**Clarity:** Starting from Customer support, open Ticket queue and click an open Ticket row for a running firm; row chips show firm, severity, source, and current owner.

**Criteria — when:** Tickets exist.  
**Conditions:** House-global queue; firm identity on each row.

| UI | Kind | Status |
|---|---|---|
| Customer support | Module | **new** |
| Ticket queue | Block | **new** |
| Ticket row | Block | **new** |

---

### Leaf 1.2 — per-tenancy support context

**Q:** How do I open a Ticket with that firm's Support context (bind, health, commercial)?

**Clarity:** On Ticket, open Support context pane and use tabs for Firm operations bind, Firm health, Commercial / escrow, Activation state, and recent Audit trail events for that tenancy — without leaving the ticket.

**Criteria — when:** Ticket selected.  
**Conditions:** Context is read/ops for this firm only; no cross-firm leak in the pane.

| UI | Kind | Status |
|---|---|---|
| Ticket | Modal | **new** |
| Support context | Block | **new** |
| Firm operations bind / Firm health / Commercial / Activation state / Audit trail | Modules (linked) | **new** |

---

### Leaf 1.3 — resolve / keep running

**Q:** How do I resolve so the Consultant's firm keeps running?

**Clarity:** On Ticket, click the linked per-tenancy action (re-bind, restore health, commercial unblock), apply the fix on that scoped control, return to the Ticket, and click Resolve; Consultant Access / Board / Meetings keep working without the firm authoring packs.

**Criteria — when:** Root cause addressed.  
**Conditions:** Resolution auditable; Consultant remains receive/govern only.

| UI | Kind | Status |
|---|---|---|
| Resolve control | Block | **new** |
| Linked per-tenancy actions | Block | **new** |
| Audit trail | Module | **new** |
