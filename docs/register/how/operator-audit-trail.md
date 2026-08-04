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

**Clarity:** Starting from Audit trail, select a firm from the **Firm filter** dropdown and/or an actor from the **Actor filter** dropdown, then click a Change event row to view operation, before/after summary, timestamp, actor, and firm.

**DNA for children:**
1. filter by firm or actor
2. open a Change event to see what operation changed

---

### Leaf 1.1 — filter trail

**Q:** How do I filter by firm or actor?

**Clarity:** Starting from Audit trail, select a firm from the **Firm filter** dropdown and/or an actor from the **Actor filter** dropdown to scope the log; selected filter chips stay visible above the Change event list. Filter chips are view chrome (session scope) unless a saved audit view is persisted — nothing downstream outside Audit trail reads them.

**Criteria — when:** Investigating or reviewing house changes.  
**Conditions:** Tenancy-scoped events visible; cross-firm when unfiltered.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Audit trail | Module | **new** | House-global change log |
| Firm filter | Block | **new** | **Dropdown** |
| Actor filter | Block | **new** | **Dropdown** |
| Filter chips | Block | **new** | **View** chips above list |

---

### Leaf 1.2 — open change event

**Q:** How do I open a Change event to see what operation changed?

**Clarity:** On Audit trail, click a Change event row to open **Change event** and view operation, before/after or summary, timestamp, actor, firm, and affected surface. Open-box Publish version and Bind packs commits both appear as rows.

**Criteria — when:** A row is selected.  
**Conditions:** Open-box and bind changes both appear.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Change event list | Block | **new** | Clickable rows |
| Change event | Modal | **new** | Detail **view** of one commit |
