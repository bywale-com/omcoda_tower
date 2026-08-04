# Operator — Acquisition & ads

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can run the firm-acquisition Approach (feed → ad → capture, inside the click budget)
> and read who understood-but-didn't-tap versus didn't-understand — so that a captured firm can be
> staged for activation.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Continuously while ALG is the growth door.  
**Conditions:** Click budget held; seed inputs only (name + website + channel).

---

## Depth 1 — first How

**Q:** How do I run the firm-acquisition Approach (feed → ad → capture, inside the click budget) and read who understood-but-didn't-tap versus didn't-understand?

**Clarity:** Starting from Acquisition & ads, open Approach campaigns, edit feed creative, ad, and Capture strip fields inside the click budget, then open Approach instrumentation to compare understand-don't-tap, don't-understand, and continue-scroll counts.

**DNA for children:**
1. run Approach supply from feed through ad to capture inside the click budget
2. read Approach instrumentation for understood-but-didn't-tap versus didn't-understand

---

### Leaf 1.1 — run Approach supply

**Q:** How do I run Approach supply from feed through ad to capture inside the click budget?

**Clarity:** Starting from Acquisition & ads, click **Approach campaigns**. On Approach campaigns list, click a campaign row (or **New campaign**). On Approach campaign editor, type feed creative, ad copy, and Capture strip fields so name, website, and channel seed inputs land in one tap; click **Save** / **Publish campaign** (primary button). Captured seed writes state read by Activation & forward-deploy In-flight activations — no database or payment inside the click budget. Meta ad supply is external intent (Tower configures what to send; no Meta UI affordances in Tower).

**Criteria — when:** Operating ALG acquisition.  
**Conditions:** Capture limited to name + website + phone/email; continue-scroll allowed.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Acquisition & ads | Module | **new** | House-global acquisition |
| Approach campaigns | Modal / list | **new** | Campaign catalog + **New campaign** |
| Approach campaign editor | Modal | **new** | Feed / ad / Capture strip fields |
| Capture strip | Block | **new** | Seed inputs (name · website · channel) |
| Save / Publish campaign | Block | **new** | **Primary button** — campaign live (read by capture → Activation staging) |

**Requirements:** Meta ads supply external; seed land hands to Activation staging. Agent presentation may sit beside Approach — presentation only.

---

### Leaf 1.2 — read instrumentation

**Q:** How do I read Approach instrumentation for understood-but-didn't-tap versus didn't-understand?

**Clarity:** On Acquisition & ads, click **Approach instrumentation**. Select an Approach campaign from the campaign filter dropdown; view don't-understand, understand-don't-tap, and continue-scroll count cards. Cards are view/metrics (read stream aggregates) — no write unless clicking a linked Oversight / Support action.

**Criteria — when:** After impressions / taps accumulate.  
**Conditions:** Instrumentation distinguishes the two disbelief modes.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Acquisition & ads | Module | **new** | Parent module |
| Approach instrumentation | Block | **new** | Metric **cards** + campaign **dropdown** filter |
| Count cards | Block | **new** | **View** — don't-understand / understand-don't-tap / continue-scroll |
