# Operator — Commercial (escrow / contingent terms)

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can hold and oversee a firm's escrow and contingent terms — so that the Consultant
> can accept the terms and reach running.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Around activation money door and while contingent terms remain open.  
**Conditions:** Escrow is firm↔Om Coda contingent cost — not immigrant settlement funds.

---

## Depth 1 — first How

**Q:** How do I hold and oversee a firm's escrow and contingent terms?

**Clarity:** Starting from Commercial, open the firm instrument list, select a firm row, set the scoped escrow terms, then use Escrow status and Release control on that instrument through hold, window, release, return, or dispute.

**DNA for children:**
1. set Escrow terms for the firm
2. oversee Escrow status through acceptance and release

---

### Leaf 1.1 — set terms

**Q:** How do I set Escrow terms for the firm?

**Clarity:** Starting from Commercial, select the firm row in the instrument list; on the scoped record, open Escrow terms, enter contingent cost, cap, release predicate, and measurement window fields, then save the terms version that the firm will Accept on Prepared Workspace.

**Criteria — when:** Before or during activation for that tenancy.  
**Conditions:** Terms presentable on Accept terms.

| UI | Kind | Status |
|---|---|---|
| Commercial | Module | **new** |
| Escrow terms | Block / Modal | **new** |

---

### Leaf 1.2 — oversee status

**Q:** How do I oversee Escrow status through acceptance and release?

**Clarity:** On Commercial, select a firm/instrument row and open Escrow status to read held / release_pending_window / released / returned / disputed chips; on Release control, click Execute release, Execute return, or Open dispute only when the scoped instrument's terms and evidence enable the action.

**Criteria — when:** After terms offered.  
**Conditions:** Consultant acceptance is the hard gate; operator oversees.

| UI | Kind | Status |
|---|---|---|
| Escrow status | Block | **new** |
| Release control | Block | **new** |
| Accept terms | Modal | consultant-facing **new** (paired) |
