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

**Clarity:** I get a firm-branded opt-in touchpoint on a channel I can reach, then I agree or ignore before any deeper form.

**DNA for children:**
1. get a firm-branded opt-in touchpoint on a channel I can reach
2. agree or ignore before any deeper form

---

### Leaf 1.1 — receive firm-branded opt-in

**Q:** How do I get a firm-branded opt-in touchpoint on a channel I can reach?

**Clarity:** Starting from the firm-branded Opt-in message (email/SMS as bound), I open the Consent request. Branding is the firm's — not Om Coda's.

**Criteria — when:** When opt-in launch fires for a sequence-ready contact.  
**Conditions:** Reachability gate passed; contact not silenced; pack bound under firm identity.

| UI | Kind | Status |
|---|---|---|
| Opt-in message | Module (channel surface) | **partial-existing** (touchpoints) |
| Consent request | Modal / page | **new** / **partial** |

**Requirements:** Operator Configuration libraries author opt-in template; Firm operations bind runs it; Book readiness ensures reachable. Not a consultant-authored leaf.

---

### Leaf 1.2 — agree or ignore

**Q:** How do I agree or ignore before any deeper form?

**Clarity:** On Consent request, choose Agree or Ignore (dismiss / no action). Deeper collection forms do not open until Agree.

**Criteria — when:** Consent request is open.  
**Conditions:** Ignore leaves contact silenced-from-deeper or unconsented per policy; Agree unlocks later nudges.

| UI | Kind | Status |
|---|---|---|
| Consent request | Modal / page | **new** / **partial** |
| Agree control | Block | **new** |
| Ignore / dismiss | Block | **new** |
