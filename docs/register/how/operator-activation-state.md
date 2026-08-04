# Operator — Activation state

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can see a firm's forward-deploy and hard-input progress toward running — so that a
> stalled firm is moved to a running desk.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Firm is between capture and running.  
**Conditions:** Shows forward-deploy + DB auth + escrow progress.

---

## Depth 1 — first How → leaf

**Q:** How do I see a firm's forward-deploy and hard-input progress toward running?

**Clarity:** Starting from Activation state, open Progress and read the forward-deployed, authorize-book, escrow-held, and running checklist rows for this firm; on a stalled row, click Jump to Activation & forward-deploy or Jump to Commercial to unblock the exact gate.

**Criteria — when:** Monitoring in-flight activation.  
**Conditions:** Stalled steps actionable; Support can use same context.

| UI | Kind | Status |
|---|---|---|
| Activation state | Module | **new** |
| Progress | Block | **new** |
| Activation & forward-deploy | Module | **new** (unblock) |
| Commercial | Module | **new** (unblock) |
