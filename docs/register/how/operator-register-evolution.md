# Operator — Register & evolution

**Kind:** secondary  
**Subject:** Operator (house-global)  
**Scope:** Prototype-time house tooling only — **no firm-facing Register surface.**

**Statement**
> As Operator, I can document friction from running firms and regenerate the methodology into house
> build tooling — so that the next authored operations reach the configuration libraries.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Running-firm friction appears.  
**Conditions:** House build tooling only; shipped firm product contains no Register.

---

## Depth 1 — first How

**Q:** How do I document friction from running firms and regenerate the methodology into house build tooling?

**Clarity:** Starting from Register & evolution, click **Gaps**, click **New gap** (or an existing Gap row) and click **Save gap** on Gap modal, then on Gap toggle Affordance / backend facet to Written and click **Regenerate handoff** so Configuration libraries can take the next authored operations.

**DNA for children:**
1. log a Gap from running-firm friction
2. regenerate methodology so Configuration libraries can take the next authored operations

---

### Leaf 1.1 — log gap

**Q:** How do I log a Gap from running-firm friction?

**Clarity:** Starting from Register & evolution, click **Gaps**. Click **New gap** (or an existing Gap row). On Gap modal, type the friction summary, optionally link a Support ticket id, and click **Save gap** (primary button). Gap is house-only methodology friction — never a firm-desk ticket UI on Consultant Board.

**Criteria — when:** Friction found via Support or Oversight.  
**Conditions:** Gap is house-only; never exposed on Consultant Board.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Register & evolution | Module | **partial-existing** as `/register` — **house-only** | House tooling |
| Gaps | Block | **new** / **partial** | Gap catalog + **New gap** |
| Gap | Modal | **new** | Summary field + optional ticket link |
| Save gap | Block | **new** | **Primary button** — writes Gap (read by Regenerate handoff path) |

---

### Leaf 1.2 — regenerate into libraries path

**Q:** How do I regenerate methodology so Configuration libraries can take the next authored operations?

**Clarity:** On Gap, toggle Affordance / backend facet to Written; on Register & evolution, click **Regenerate handoff** (primary button). Regenerate writes handoff state read by Configuration libraries authoring path — still never on the firm desk.

**Criteria — when:** Gap resolved into written affordance.  
**Conditions:** Output is house config evolution, not firm Register chrome.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Regenerate handoff | Block | **new** | **Primary button** — writes handoff (read by Configuration libraries) |
| Configuration libraries | Module | **new** (downstream) | Authoring target (read by Regenerate handoff) |
