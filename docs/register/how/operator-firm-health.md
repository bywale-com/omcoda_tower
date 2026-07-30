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

**Clarity:** Starting from Firm health, read Sequence health and Engagement health for this tenancy; open a failing Sequence to see what's stuck, then hand context to Support if needed.

**Criteria — when:** Drill from Oversight or direct per-tenancy open.  
**Conditions:** Scoped to one firm; actionable for Support restore.

| UI | Kind | Status |
|---|---|---|
| Firm health | Module | **new** |
| Sequence health | Block | **new** |
| Engagement health | Block | **new** |
| Sequence detail | Modal | **new** |
| Customer support | Module | **new** (downstream) |

**Requirements:** Deliverability / runner signals at process leaf. Consultant Board is inhabit only — not this ops surface.
