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

**Clarity:** Starting from Activation state, click **Progress**. View checklist rows for forward-deployed, authorize-book, escrow-held, and running with status chips. On a stalled row, click **Jump to Activation & forward-deploy** or **Jump to Commercial** to unblock the exact gate. Checklist rows read consultant/operator commits — Progress itself does not fake-complete hard inputs.

**Criteria — when:** Monitoring in-flight activation.  
**Conditions:** Stalled steps actionable; Support can use same context.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Activation state | Module | **new** | Per-tenancy activation progress |
| Progress | Block | **new** | Checklist **rows** + status **chips** |
| Jump to Activation & forward-deploy | Block | **new** | Link control (unblock) |
| Jump to Commercial | Block | **new** | Link control (unblock) |
| Activation & forward-deploy | Module | **new** (unblock) | Staging / forward-deploy |
| Commercial | Module | **new** (unblock) | Escrow terms |
