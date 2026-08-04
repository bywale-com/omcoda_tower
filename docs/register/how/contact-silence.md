# Engagement contact — Silence

**Kind:** secondary  
**Subject:** Engagement contact

**Statement**
> As Engagement contact, I can silence or opt out at any point.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Any point in the journey.  
**Conditions:** Opt-out / silence stops automatic outreach.

---

## Depth 1 — first How → leaf

**Q:** How do I silence or opt out at any point?

**Clarity:** On any firm-branded touchpoint footer (Opt-in, Nudge, Meeting invitation) or on Consent request, click **Silence** / **Opt out** (or use List-Unsubscribe / one-click where the channel provides it). Confirm if prompted. That commit writes silenced state read by engagement runners, Send gates, and Book readiness (not sequence-ready for new automatic motion). Further automatic firm→client outreach stops; Consultant Halt must honor the same state.

**Criteria — when:** Anytime a touchpoint is reachable.  
**Conditions:** Silenced state recorded; bound sequences honor it.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Touchpoint footer | Block | **new** | Persistent **Silence / Opt out** control |
| Silence / Opt out | Block | **partial-existing** / **new** | **Button** / link — writes silenced (read by runners / Send gates / Book readiness) |
| Consent request | Modal / page | **new** / **partial** | May also expose Silence |
| List-Unsubscribe / one-click | Block (channel) | **partial-existing** | Channel-native unsubscribe when present |

**Requirements:** Engagement runners + Consultant Halt must respect silenced. Operator Book readiness treats silenced as not sequence-ready for new automatic motion.
