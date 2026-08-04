# Engagement contact — Consent

**Kind:** secondary  
**Subject:** Engagement contact (referenced participant)

**Statement**
> As Engagement contact, I can receive a firm-branded consent request and agree or ignore before any
> deeper collection.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** First firm→client engagement after the contact is sequence-ready.  
**Conditions:** Firm-branded; before deeper collection; agree or ignore both valid.

---

## Depth 1 — first How

**Q:** How do I receive a firm-branded consent request and agree or ignore before any deeper collection?

**Clarity:** Starting from the firm-branded Opt-in message, click the consent link / **Review request** control to open Consent request, then click **Agree** or **Ignore** before any Nudge / deeper form.

**DNA for children:**
1. get a firm-branded opt-in touchpoint on a channel I can reach
2. agree or ignore before any deeper form

---

### Leaf 1.1 — receive firm-branded opt-in

**Q:** How do I get a firm-branded opt-in touchpoint on a channel I can reach?

**Clarity:** Starting from the firm-branded Opt-in message (email/SMS as bound under firm identity), click the consent link / **Review request** control to open Consent request. Branding chrome is the firm's — not Om Coda's. Reachability was gated upstream by Book readiness; silenced contacts do not receive this send.

**Criteria — when:** When opt-in launch fires for a sequence-ready contact.  
**Conditions:** Reachability gate passed; contact not silenced; pack bound under firm identity.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Opt-in message | Module (channel surface) | **partial-existing** (touchpoints) | Firm-branded channel entry |
| Consent link / Review request | Block | **new** / **partial** | Click opens Consent request |
| Consent request | Modal / page | **new** / **partial** | Agree / Ignore surface |

**Requirements:** Operator Configuration libraries author opt-in template; Firm operations bind arms bound packs; Book readiness ensures reachable. Not a consultant-authored leaf.

---

### Leaf 1.2 — agree or ignore

**Q:** How do I agree or ignore before any deeper form?

**Clarity:** On Consent request, click **Agree** (primary button) or **Ignore** / dismiss. Agree writes consented state that unlocks later Nudge form / deeper collection (read by bound engagement runners). Ignore writes unconsented / no-deeper state — deeper collection forms do not open. Either choice is valid; neither opens Configuration libraries.

**Criteria — when:** Consent request is open.  
**Conditions:** Ignore leaves contact silenced-from-deeper or unconsented per policy; Agree unlocks later nudges.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Consent request | Modal / page | **new** / **partial** | Consent decision surface |
| Agree | Block | **new** | **Primary button** — writes consent (read by runners / Nudge unlock) |
| Ignore / dismiss | Block | **new** | Button / dismiss — writes no-deeper (runners honor) |
