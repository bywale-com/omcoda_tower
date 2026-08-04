# Operator — Firm operations bind

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can bind house-authored evaluation, automation, and campaign packs under a firm's
> identity — so that the Consultant's book is worked without the firm authoring anything.

**Note:** Completes authorship → bind → desk spine. Firms do not author packs.  
**Affordance rule:** Every Clarity names the control (dropdown, button, segmented control, panel). Nothing is inferred.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Firm reaching or already running.  
**Conditions:** Packs exist as **published** versions in Configuration libraries; bind is per-tenancy identity.

---

## Depth 1 — first How

**Q:** How do I bind house-authored evaluation, automation, and campaign packs under a firm's identity?

**Clarity:** Starting from Firm operations bind, I select a firm row in the firm-bind index, open Bind packs, choose three published pack versions from dropdowns, click Bind, then set Armed / Active — so the book is worked without firm authorship.

**DNA for children:**
1. choose packs from Configuration libraries and bind them under this firm identity
2. arm so the book is worked without firm authorship

---

### Leaf 1.1 — choose and bind packs

**Q:** How do I choose packs from Configuration libraries and bind them under this firm identity?

**Clarity:** Starting from Firm operations bind, click a firm row in the **firm-bind index** (left list). On that firm’s detail, click **Bind packs** (opens Bind packs modal). On Bind packs modal:  
1. **Evaluation pack** — dropdown listing only **published** Evaluation pack versions from Configuration libraries (drafts omitted); pick one version.  
2. **Automation pack** — dropdown listing only **published** Automation workflow versions; pick one version.  
3. **Engagement template** — dropdown listing only **published** Engagement template versions; pick one version.  
4. Click **Bind** (primary button). Modal closes; the firm detail shows three bound-version chips (label + version id) sourced from Configuration libraries.  
Audit trail appends a Change event: firm id, three version ids, actor, timestamp.

**Criteria — when:** Activating or changing what runs for a tenancy.  
**Conditions:** Dropdowns show published-only; Bind disabled until all three slots have a selection; no inline pack editor inside Bind packs.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Firm operations bind | Module | **new** | Firm-bind index (collection) → firm detail |
| Firm-bind index | Block / list | **new** | Clickable firm rows |
| Bind packs | Modal | **new** | Opened by **Bind packs** button on firm detail |
| Evaluation pack version | Block | **new** | **Dropdown** (published versions only) |
| Automation pack version | Block | **new** | **Dropdown** (published versions only) |
| Engagement template version | Block | **new** | **Dropdown** (published versions only) |
| Bind | Block | **new** | **Primary button** on Bind packs modal |
| Bound-version chips | Block | **new** | **View** chips on firm detail after Bind |
| Configuration libraries | Module | **new** (source) | Authorship only — not opened from Bind |

---

### Leaf 1.2 — arm without firm authorship

**Q:** How do I arm so the book is worked without firm authorship?

**Clarity:** On Firm operations bind firm detail (selected firm), use the **Armed / Active** segmented control: click **Armed** (bound packs ready; no contact-facing sends) or **Active** (execution on). Control is disabled until Bind packs has three bound versions. Consultant Board for that firm shows inhabited motion only — no pack editor on the firm desk.

**Criteria — when:** After bind, when campaign should run.  
**Conditions:** Armed = ready; Active = executing; consultant does not author.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Armed / Active | Block | **new** | **Segmented control** (Armed \| Active) on firm detail |
| Board | Module | consultant **existing** (inhabit) | **View** inhabited client motion |

**Requirements:** Runtime engagement machinery (opt-in → nudge → reactivation, evaluate, send) executes from bound packs — build-side requirement, not an Operator "I engage" outcome and never a Consultant authorship leaf.
