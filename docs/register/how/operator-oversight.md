# Operator — Oversight

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can watch engagement and sequence health across every firm and drill into any one —
> so that a failing tenancy is caught before the Consultant loses meetings.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Continuously across the agency fleet.  
**Conditions:** Cross-firm view with tenancy drill-down.

---

## Depth 1 — first How

**Q:** How do I watch engagement and sequence health across every firm and drill into any one?

**Clarity:** Starting from Oversight, I read Fleet health across firms, then drill into a Tenancy slice when one is failing.

**DNA for children:**
1. read Fleet health across firms
2. drill into a Tenancy slice when one is failing

---

### Leaf 1.1 — fleet health

**Q:** How do I read Fleet health across firms?

**Clarity:** Starting from Oversight, open Fleet health and scan deliverability / sequence / engagement signals across tenancies.

**Criteria — when:** Ongoing agency ops.  
**Conditions:** Silent sequence failure is visible at fleet level.

| UI | Kind | Status |
|---|---|---|
| Oversight | Module | **new** |
| Fleet health | Block | **new** |

---

### Leaf 1.2 — drill to tenancy

**Q:** How do I drill into a Tenancy slice when one is failing?

**Clarity:** On Fleet health, open a Firm row to land on Firm health (per-tenancy) for that tenancy's sequence and engagement detail.

**Criteria — when:** A firm shows unhealthy signals.  
**Conditions:** Drill preserves firm scope; Support can pick up from same context.

| UI | Kind | Status |
|---|---|---|
| Firm row | Block | **new** |
| Firm health | Module | **new** (per-tenancy) |
