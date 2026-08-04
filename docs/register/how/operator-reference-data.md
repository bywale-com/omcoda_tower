# Operator — Reference data

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can keep the immigration reference tables versioned and current as data, without a
> code deploy — so that house-authored evaluation packs score eligibility on today's rules.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** When law / public-reference criteria move.  
**Conditions:** Versioned as data inside operator layer; no code deploy required.

---

## Depth 1 — first How → leaves

**Q:** How do I keep the immigration reference tables versioned and current as data, without a code deploy?

**Clarity:** Starting from Reference data, open Reference tables, select a table row, edit rows or run Import criteria, then click Publish version so Evaluation packs consume the new version.

**DNA for children:**
1. open a Reference table and edit or import the current criteria
2. publish a new version that evaluation packs consume

---

### Leaf 1.1 — edit / import criteria

**Q:** How do I open a Reference table and edit or import the current criteria?

**Clarity:** Starting from Reference data, open Reference tables; on a table row (categories, trades, cutoffs, provincial identifiers), edit grid rows directly or click Import criteria to load a criteria file.

**Criteria — when:** Criteria change known.  
**Conditions:** Tables are data, not hard-coded deploys.

| UI | Kind | Status |
|---|---|---|
| Reference data | Module | **new** |
| Reference tables | Block | **new** |
| Import criteria | Modal | **new** |

---

### Leaf 1.2 — publish version for packs

**Q:** How do I publish a new version that evaluation packs consume?

**Clarity:** On Reference table, click Publish version, enter version notes, and confirm; the published version chip becomes the reference that Configuration libraries evaluation packs score against.

**Criteria — when:** Edits ready to go live.  
**Conditions:** Version retained; packs read current published version.

| UI | Kind | Status |
|---|---|---|
| Publish version | Modal | **new** |
| Configuration libraries | Module | **new** (consumer) |

**Requirements:** Evaluation open-box uses published reference — machinery at runtime, not a separate outcome.
