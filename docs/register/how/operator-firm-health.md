# Operator — Firm health

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can see engagement health scoped to one firm — so that support can restore it and
> the Consultant keeps getting meetings.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Investigating or monitoring one tenancy.  
**Conditions:** Firm-scoped slice of fleet oversight.

---

## Depth 1 — first How → leaf

**Q:** How do I see engagement health scoped to one firm?

**Clarity:** Starting from Firm health, click **Sequence health** and **Engagement health** panels and view status rows for this tenancy. Click a failing Sequence row to open **Sequence detail** with stuck reason, last runner event, and channel gate chips. Click **Open support context** when Support needs the same firm scope on a Ticket.

**Criteria — when:** Drill from Oversight or direct per-tenancy open.  
**Conditions:** Scoped to one firm; actionable for Support restore.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Firm health | Module | **new** | Per-tenancy health |
| Sequence health | Block | **new** | Status **rows** |
| Engagement health | Block | **new** | Status **rows** |
| Sequence detail | Modal | **new** | Stuck reason + gate **chips** |
| Open support context | Block | **new** | **Button** → Customer support Ticket scope |
| Customer support | Module | **new** (downstream) | Ticket queue |

**Requirements:** Deliverability / runner signals at process leaf. Consultant Board is inhabit only — not this operator health surface.
