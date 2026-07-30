# Consultant — Core

**Kind:** core (sole north-star)  
**Subject:** Consultant

**Statement**
> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and
> get eligible clients booked onto my calendar — without setting up, configuring, or running any of
> the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged
> and current.

**Handoff flag:** This tree is deliberately short on the consultant desk. Engagement / eligibility
machinery falls out as **requirements** attributed to **operator** modules. Do not pull that
machinery back under Consultant.

---

## Root — outcome

**Clarity:** *(statement above)*  
**Criteria — when:** After the firm has been acquired and while the consultant is activating or already running.  
**Conditions:** Book can be handed over; license authorization possible; meetings can land without consultant-authored engagement.

---

## Depth 1 — first How (mirrors outcome)

**Q:** How do I hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar without setting up, configuring, or running any of the engagement myself?

**Clarity:** I hand over my private book and authorize Tower to work under my license; then eligible clients appear booked on my calendar without me setting up, configuring, or running engagement.

**DNA for children (clause order):**
1. hand over my private book and authorize Tower to work under my license
2. eligible clients appear booked on my calendar without me setting up, configuring, or running engagement

---

## Depth 2a — hand over · authorize

**Q:** How do I hand over my private book and authorize Tower to work under my license?

**Clarity:** On the prepared activation path I connect my contact book and accept that outreach runs under my license and escrow; once those hard inputs land, the book is handed over.

**DNA for children:**
1. connect my contact book
2. accept that outreach runs under my license and escrow

### Leaf 2a.1 — connect the book

**Q:** How do I connect my contact book?

**Clarity:** Starting from Prepared Workspace, open Authorize book and grant database access (or the equivalent that makes the campaign real). When the assisted path already holds the list, Starting from Contacts I confirm the imported book is the one Tower will work.

**Criteria — when:** During activation (ALG) or after assisted provision when the book must be confirmed.  
**Conditions:** Prepared Workspace is staged; Authorize book is available; or Contacts already holds the assisted import.

| UI | Kind | Seat | Status |
|---|---|---|---|
| Prepared Workspace | Module | shared / activation | **new** (activation artifact; not firm-nav chrome) |
| Authorize book | Modal | consultant (acts) / operator (stages) | **new** |
| Contacts | Module | consultant | **existing** |
| Imports | Block | consultant | **existing** |

**Requirements (build side):** Operator · Activation & forward-deploy stages Prepared Workspace. Operator · Book readiness can audit reachability after connect. Do **not** require the consultant to author sequences to hand the book over.

---

### Leaf 2a.2 — authorize under license + escrow

**Q:** How do I accept that outreach runs under my license and escrow?

**Clarity:** On Prepared Workspace, open Accept terms and confirm outreach under my license plus escrow / contingent cost. That acceptance is the money-and-license door — not a settings screen I maintain later.

**Criteria — when:** At the activation hard-input step, after readiness is legible.  
**Conditions:** Escrow terms presented; license acknowledgement explicit; consultant completes Accept terms.

| UI | Kind | Seat | Status |
|---|---|---|---|
| Prepared Workspace | Module | shared / activation | **new** |
| Accept terms | Modal | consultant (acts) | **new** |
| License acknowledgement | Block | consultant | **new** |
| Escrow terms | Block | consultant (accepts) / operator (holds) | **new** (operator Commercial oversees) |

**Requirements:** Operator · Commercial holds escrow. Operator · Activation walks readiness. Governance (halt) is a separate secondary outcome — not this leaf.

---

## Depth 2b — receive booked clients without running engagement

**Q:** How do eligible clients appear booked on my calendar without me setting up, configuring, or running engagement?

**Clarity:** Once authorized, house-authored packs bound to my firm keep the book worked; I receive booked meetings on Meetings and open each with a live brief — I never set up Automations, Agents, or engagement templates to make that happen.

**DNA for children:**
1. house-authored packs bound to my firm keep the book worked *(requirement — not consultant action)*
2. I receive booked meetings on Meetings and open each with a live brief
3. I never set up Automations, Agents, or engagement templates

### Leaf 2b.1 — packs keep the book worked (cross-desk requirement)

**Q:** How do house-authored packs bound to my firm keep the book worked?

**Clarity:** They don't live in my workspace. On Firm operations bind (operator), packs from Configuration libraries are already bound under my firm identity; engagement and eligibility run from those packs without me authoring them. On Board I only see the inhabited result — clients progressing — not the authorship.

**Criteria — when:** Continuously after the firm is running.  
**Conditions:** Firm operations bind has active packs; Configuration libraries authored upstream; consultant is not editing Hub Automations / Agents to produce motion.

| UI | Kind | Seat | Status |
|---|---|---|---|
| Firm operations bind | Module | operator | **new** |
| Configuration libraries | Module | operator | **new** (Hub Automations/Agents = **existing-wrong-seat** today) |
| Board | Module | consultant | **existing** — inhabit only |
| Client row / Phase signal | Block | consultant | **existing** — result, not authorship |

**Requirements (the machinery — build side, not consultant outcome):**  
opt-in → nudge → reactivation · touchpoint refresh · eligibility re-evaluate · reachability gate · sequence send — owned by Operator Configuration libraries + Firm operations bind + Book readiness + Oversight. **Do not** add consultant How children that ask “How do I configure a nudge.”

---

### Leaf 2b.2 — receive booked meetings + live brief

**Q:** How do I receive booked meetings on Meetings and open each with a live brief?

**Clarity:** Starting from Meetings, open a booked Meeting row; On Meeting, open Live brief to see current facts before I join. On Board, the same client shows ready-for-meeting without me having sequenced them.

**Criteria — when:** When an eligible contact books.  
**Conditions:** Meeting invitation was sent by bound engagement packs; Live brief re-computes on write-back; consultant did not manually enroll the sequence.

| UI | Kind | Seat | Status |
|---|---|---|---|
| Meetings | Module | consultant | **new** (calendar receive surface; gap vs Board-only today) |
| Meeting row | Block | consultant | **new** |
| Live brief | Block | consultant | **partial-existing** as Client Brief — promote/rename as meeting-facing |
| Board | Module | consultant | **existing** |
| Client Brief | Block | consultant | **existing** |

**Requirements:** Engagement contact · Book closes the loop. Loop-closer capture pending meeting is machinery requirement under bound packs — not a consultant setup leaf.

---

### Leaf 2b.3 — never set up Automations / Agents / templates

**Q:** How do I never set up Automations, Agents, or engagement templates?

**Clarity:** My firm workspace has no authorship entry for those. Starting from Board or Meetings I work clients and briefs only; Configuration libraries and Firm operations bind stay on the operator desk. (Today's Hub list inside the firm shell is the wrong seat — treat as revision debt, not as my outcome.)

**Criteria — when:** Always under ALG application.  
**Conditions:** Consultant nav does not expose pack authorship as a required job; operator bind is what arms the firm.

| UI | Kind | Seat | Status |
|---|---|---|---|
| Board | Module | consultant | **existing** |
| Meetings | Module | consultant | **new** |
| Configuration libraries | Module | operator | **new** |
| Hub Automations / Hub Agents | Module (parked) | operator rightful / firm shell today | **existing-wrong-seat** |

**Requirements:** None for consultant action. Product shape must not reintroduce Hub authorship as the consultant core path.

---

## Flow anchors

| Anchor | Children all leaves? | Flow job |
|---|---|---|
| Depth 2a (hand over · authorize) | yes | Activation hard inputs → running |
| Depth 2b (receive without running) | yes | Running desk receives meetings; machinery off-desk |

---

## Explicit non-leaves (do not add)

- How do I run opt-in / nudge / reactivation?
- How do I configure Automations to detect eligibility?
- How do I author an agent sequence?

Those are **requirements** of leaves 2b.1 / operator trees — not Consultant How children.
