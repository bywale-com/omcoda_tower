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

**Clarity:** Starting from Activation state, read Progress (forward-deployed → auth → escrow → running) for this firm; On a stalled step, jump to Activation & forward-deploy or Commercial to unblock.

**Criteria — when:** Monitoring in-flight activation.  
**Conditions:** Stalled steps actionable; Support can use same context.

| UI | Kind | Status |
|---|---|---|
| Activation state | Module | **new** |
| Progress | Block | **new** |
| Activation & forward-deploy | Module | **new** (unblock) |
| Commercial | Module | **new** (unblock) |
