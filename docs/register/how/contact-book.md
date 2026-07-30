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

**Clarity:** I open a firm-branded Meeting invitation, pick a time to book, and arrive so the firm already holds my current facts for the consultant's live brief.

**DNA for children:**
1. open a firm-branded Meeting invitation and pick a time to book
2. arrive so the firm already holds my current facts for the consultant's live brief

---

### Leaf 1.1 — book from invitation

**Q:** How do I open a firm-branded Meeting invitation and pick a time to book?

**Clarity:** Starting from Meeting invitation, open Booking and choose a slot; confirm to book.

**Criteria — when:** Invitation sent (bound campaign toward meeting).  
**Conditions:** Eligible / invited; contact not silenced.

| UI | Kind | Status |
|---|---|---|
| Meeting invitation | Module (channel) | **new** / **partial** |
| Booking | Modal / page | **new** |
| Slot picker | Block | **new** |

**Requirements:** Operator packs invite; Consultant Meetings receives the booking (closure onto Consultant).

---

### Leaf 1.2 — firm already knows current facts

**Q:** How do I arrive so the firm already holds my current facts for the consultant's live brief?

**Clarity:** On Booking confirm (or a pending Loop-closer form before the meeting), I can fill outstanding self-reportable fields; those write back so On Live brief the consultant already sees current facts — I don't re-explain from scratch.

**Criteria — when:** At book or pending meeting.  
**Conditions:** Loop-closer consolidates outstanding self-reportable; write-back re-evaluates.

| UI | Kind | Status |
|---|---|---|
| Loop-closer form | Modal / page | **new** |
| Booking confirm | Block | **new** |
| Live brief | Block | consultant-side **partial-existing** |

**Requirements:** Write-back → re-evaluate is machinery under bound evaluation packs. Closes Consultant core so-that.
