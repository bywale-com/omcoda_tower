# Operator — Firm operations bind

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can bind house-authored evaluation, automation, and campaign packs under a firm's
> identity — so that the Consultant's book is worked without the firm authoring anything.

**Note:** Completes authorship → bind → desk spine. Firms do not author packs.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Firm reaching or already running.  
**Conditions:** Packs exist in Configuration libraries; bind is per-tenancy identity.

---

## Depth 1 — first How

**Q:** How do I bind house-authored evaluation, automation, and campaign packs under a firm's identity?

**Clarity:** Starting from Firm operations bind, I choose packs from Configuration libraries and bind them under this firm identity, then arm so the book is worked without firm authorship.

**DNA for children:**
1. choose packs from Configuration libraries and bind them under this firm identity
2. arm so the book is worked without firm authorship

---

### Leaf 1.1 — choose and bind packs

**Q:** How do I choose packs from Configuration libraries and bind them under this firm identity?

**Clarity:** Starting from Firm operations bind, open Bind packs; On Bind packs, select Evaluation pack, Automation pack, and Engagement template versions and Bind to this firm.

**Criteria — when:** Activating or changing what runs for a tenancy.  
**Conditions:** Only house-authored versions selectable; Audit trail records bind.

| UI | Kind | Status |
|---|---|---|
| Firm operations bind | Module | **new** |
| Bind packs | Modal | **new** |
| Pack version pickers | Block | **new** |
| Configuration libraries | Module | **new** (source) |

---

### Leaf 1.2 — arm without firm authorship

**Q:** How do I arm so the book is worked without firm authorship?

**Clarity:** On Firm operations bind, set Armed / Active for the bound campaign under this identity. Consultant Board shows inhabited motion only — no pack editor required on the firm desk.

**Criteria — when:** After bind, when campaign should run.  
**Conditions:** Armed = template ready; Active = executing; consultant does not author.

| UI | Kind | Status |
|---|---|---|
| Armed / Active controls | Block | **new** |
| Board | Module | consultant **existing** (inhabit) |

**Requirements:** Runtime engagement machinery (opt-in → nudge → reactivation, evaluate, send) executes from bound packs — build-side requirement, not an Operator "I engage" outcome and never a Consultant authorship leaf.
