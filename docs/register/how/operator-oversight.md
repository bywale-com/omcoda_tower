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

**Clarity:** Starting from Oversight, open Fleet health, scan firm rows with deliverability / sequence / engagement status chips, then click an unhealthy Firm row to open that tenancy's Firm health slice.

**DNA for children:**
1. read Fleet health across firms
2. drill into a Tenancy slice when one is failing

---

### Leaf 1.1 — fleet health

**Q:** How do I read Fleet health across firms?

**Clarity:** Starting from Oversight, open Fleet health and scan the firm table by deliverability, sequence, and engagement status chips plus last-run timestamp across tenancies.

**Criteria — when:** Ongoing agency ops.  
**Conditions:** Silent sequence failure is visible at fleet level.

| UI | Kind | Status |
|---|---|---|
| Oversight | Module | **new** |
| Fleet health | Block | **new** |

---

### Leaf 1.2 — drill to tenancy

**Q:** How do I drill into a Tenancy slice when one is failing?

**Clarity:** On Fleet health, click a Firm row with an unhealthy chip to land on Firm health (per-tenancy), preserving that firm filter for Sequence health, Engagement health, and Sequence detail.

**Criteria — when:** A firm shows unhealthy signals.  
**Conditions:** Drill preserves firm scope; Support can pick up from same context.

| UI | Kind | Status |
|---|---|---|
| Firm row | Block | **new** |
| Firm health | Module | **new** (per-tenancy) |
