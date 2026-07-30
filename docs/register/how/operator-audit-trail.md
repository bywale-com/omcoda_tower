# Operator — Audit trail

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can see who changed which operation, when, and on which firm — so that support and
> founder oversight can account for every change over real client books.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** After any open-box or bind change over firm books.  
**Conditions:** Who / what / when / which firm accountable.

---

## Depth 1 — first How → leaves

**Q:** How do I see who changed which operation, when, and on which firm?

**Clarity:** Starting from Audit trail, filter by firm or actor, and open a Change event to see what operation changed.

**DNA for children:**
1. filter by firm or actor
2. open a Change event to see what operation changed

---

### Leaf 1.1 — filter trail

**Q:** How do I filter by firm or actor?

**Clarity:** Starting from Audit trail, use Firm filter and Actor filter to scope the log.

**Criteria — when:** Investigating or reviewing house changes.  
**Conditions:** Tenancy-scoped events visible; cross-firm when unfiltered.

| UI | Kind | Status |
|---|---|---|
| Audit trail | Module | **new** |
| Firm filter / Actor filter | Block | **new** |

---

### Leaf 1.2 — open change event

**Q:** How do I open a Change event to see what operation changed?

**Clarity:** On Audit trail, open Change event to read operation, before/after or summary, timestamp, and firm.

**Criteria — when:** A row is selected.  
**Conditions:** Open-box and bind changes both appear.

| UI | Kind | Status |
|---|---|---|
| Change event | Modal | **new** |
