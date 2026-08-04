# Engagement contact — Book

**Kind:** secondary (closure hop)  
**Subject:** Engagement contact

**Statement**
> As Engagement contact, I can book a meeting when invited and arrive where the firm already knows my
> current facts — so that the Consultant takes the meeting with a live brief.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** When invited after eligibility warrants a meeting.  
**Conditions:** Invitation firm-branded; facts already on the firm side for Live brief.

---

## Depth 1 — first How

**Q:** How do I book a meeting when invited and arrive where the firm already knows my current facts?

**Clarity:** Starting from the firm-branded Meeting invitation, click **Book a time** to open Booking, select a slot in the Slot picker, and click **Confirm booking**; on Booking confirm (or Loop-closer form), type/select outstanding self-reportable answers and click **Submit** so Live brief already holds current facts.

**DNA for children:**
1. open a firm-branded Meeting invitation and pick a time to book
2. arrive so the firm already holds my current facts for the consultant's live brief

---

### Leaf 1.1 — book from invitation

**Q:** How do I open a firm-branded Meeting invitation and pick a time to book?

**Clarity:** Starting from the firm-branded Meeting invitation (email/SMS link), click **Book a time** to open Booking. On Booking, select a slot in the Slot picker (date/time list or calendar), then click **Confirm booking** (primary button). That commit writes the meeting (read by Consultant Meetings Meeting rows and Board ready-for-meeting Phase chip). Contact must not be silenced.

**Criteria — when:** Invitation sent (bound campaign toward meeting).  
**Conditions:** Eligible / invited; contact not silenced.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Meeting invitation | Module (channel) | **new** / **partial** | Firm-branded link entry |
| Booking | Modal / page | **new** | Slot selection surface |
| Slot picker | Block | **new** | Date/time **list** / calendar choose |
| Confirm booking | Block | **new** | **Primary button** — writes meeting (read by Consultant Meetings) |

**Requirements:** Operator packs invite; Consultant Meetings receives the booking (closure onto Consultant).

---

### Leaf 1.2 — firm already knows current facts

**Q:** How do I arrive so the firm already holds my current facts for the consultant's live brief?

**Clarity:** On Booking confirm (or a pending **Loop-closer form** before the meeting), view outstanding self-reportable form fields only; type/select answers and click **Submit** (primary button). Write-back updates fact rows that Live brief reads — I don't re-explain from scratch. Document-dependent asks never appear on this form (those stay Manage on the consultant desk).

**Criteria — when:** At book or pending meeting.  
**Conditions:** Loop-closer consolidates outstanding self-reportable; write-back re-evaluates.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Loop-closer form | Modal / page | **new** | Self-reportable **fields** only |
| Booking confirm | Block | **new** | May embed Loop-closer |
| Submit | Block | **new** | **Primary button** — writes facts (read by Live brief / re-evaluate) |
| Live brief | Block | consultant-side **partial-existing** | Downstream **view** of submitted facts |

**Requirements:** Write-back → re-evaluate is machinery under bound evaluation packs. Closes Consultant core so-that.
