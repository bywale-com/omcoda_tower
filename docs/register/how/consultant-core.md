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

**Clarity:** On Prepared Workspace I complete Authorize book + Accept terms; afterward Meetings receives booked rows with Live brief — without me opening Configuration libraries or Hub Automations / Agents.

**DNA for children (clause order):**
1. hand over my private book and authorize Tower to work under my license
2. eligible clients appear booked on my calendar without me setting up, configuring, or running engagement

---

## Depth 2a — hand over · authorize

**Q:** How do I hand over my private book and authorize Tower to work under my license?

**Clarity:** On Prepared Workspace, complete Authorize book (database grant or confirm import) and Accept terms (license + escrow). Those two commits are the hard inputs Activation state / Commercial read.

**DNA for children:**
1. connect my contact book
2. accept that outreach runs under my license and escrow

### Leaf 2a.1 — connect the book

**Q:** How do I connect my contact book?

**Clarity:** Starting from Prepared Workspace, click **Authorize book**. On Authorize book modal, click Connect CRM / grant database access (or Upload / confirm assisted import), then click **Authorize** (primary button). That commit writes book-handover state read by Book readiness Audits and Activation state Progress (authorize-book row). When the assisted path already holds the list: Starting from Contacts, click **Imports**, click the imported batch row, and click **Confirm book for Tower** so the same handover state is set — without authoring sequences.

**Criteria — when:** During activation (ALG) or after assisted provision when the book must be confirmed.  
**Conditions:** Prepared Workspace is staged; Authorize book is available; or Contacts already holds the assisted import.

| UI | Kind | Seat | Status | Affordance |
|---|---|---|---|---|
| Prepared Workspace | Module | shared / activation | **new** (activation artifact; not firm-nav chrome) | Activation shell |
| Authorize book | Modal | consultant (acts) / operator (stages) | **new** | Grant / confirm controls |
| Authorize | Block | consultant | **new** | **Primary button** — writes handover (read by Book readiness + Activation state) |
| Contacts | Module | consultant | **existing** | Assisted confirm path |
| Imports | Block | consultant | **existing** | Batch row + **Confirm book for Tower** |

**Requirements (build side):** Operator · Activation & forward-deploy stages Prepared Workspace. Operator · Book readiness can audit reachability after connect. Do **not** require the consultant to author sequences to hand the book over.

---

### Leaf 2a.2 — authorize under license + escrow

**Q:** How do I accept that outreach runs under my license and escrow?

**Clarity:** On Prepared Workspace, click **Accept terms**. On Accept terms modal, click **License acknowledgement** to expand it, select the authorizing licensee from the identity dropdown (or confirm the named licensee), view Escrow terms panel rows, check the acknowledgment checkbox, then click **Accept** (primary button). That commit writes license+escrow acceptance read by Commercial (instrument held) and Activation state Progress (escrow-held / running gates). Not a settings screen I maintain later.

**Criteria — when:** At the activation hard-input step, after readiness is legible.  
**Conditions:** Escrow terms presented; license acknowledgement explicit; consultant completes Accept terms.

| UI | Kind | Seat | Status | Affordance |
|---|---|---|---|---|
| Prepared Workspace | Module | shared / activation | **new** | Activation shell |
| Accept terms | Modal | consultant (acts) | **new** | License + escrow commit |
| License acknowledgement | Block | consultant | **new** | Identity **dropdown** + acknowledgment **checkbox** |
| Escrow terms | Block | consultant (accepts) / operator (holds) | **new** (operator Commercial oversees) | **View** panel of terms |
| Accept | Block | consultant | **new** | **Primary button** — writes acceptance (read by Commercial + Activation state) |

**Requirements:** Operator · Commercial holds escrow. Operator · Activation walks readiness. Governance (halt) is a separate secondary outcome — not this leaf.

---

## Depth 2b — receive booked clients without running engagement

**Q:** How do eligible clients appear booked on my calendar without me setting up, configuring, or running engagement?

**Clarity:** Bound packs (operator Firm operations bind) keep the book worked; I only receive Meeting rows and open Live brief — Board shows Phase signal chips as inhabit, never pack editors.

**DNA for children:**
1. house-authored packs bound to my firm keep the book worked *(requirement — not consultant action)*
2. I receive booked meetings on Meetings and open each with a live brief
3. I never set up Automations, Agents, or engagement templates

### Leaf 2b.1 — packs keep the book worked (cross-desk requirement)

**Q:** How do house-authored packs bound to my firm keep the book worked?

**Clarity:** They don't live in my workspace. On the operator desk, Firm operations bind already has packs picked from Bind packs dropdowns and set Armed / Active — engagement and eligibility proceed from those published versions without me authoring them. On Board I only click Client rows and view Phase signal chips (inhabit result). I never open Configuration libraries or Hub Automations / Agents to produce motion.

**Criteria — when:** Continuously after the firm is running.  
**Conditions:** Firm operations bind has active packs; Configuration libraries authored upstream; consultant is not editing Hub Automations / Agents to produce motion.

| UI | Kind | Seat | Status | Affordance |
|---|---|---|---|---|
| Firm operations bind | Module | operator | **new** | Bind packs + Armed/Active (off-desk) |
| Configuration libraries | Module | operator | **new** (Hub Automations/Agents = **existing-wrong-seat** today) | Publish version upstream |
| Board | Module | consultant | **existing** — inhabit only | Client rows / Phase chips (**view**) |
| Client row / Phase signal | Block | consultant | **existing** — result, not authorship | **View** chip — reads bound pack runtime |

**Requirements (the machinery — build side, not consultant outcome):**  
opt-in → nudge → reactivation · touchpoint refresh · eligibility re-evaluate · reachability gate · sequence send — owned by Operator Configuration libraries + Firm operations bind + Book readiness + Oversight. **Do not** add consultant How children that ask “How do I configure a nudge.”

---

### Leaf 2b.2 — receive booked meetings + live brief

**Q:** How do I receive booked meetings on Meetings and open each with a live brief?

**Clarity:** Starting from Meetings, click a booked Meeting row to open Meeting. On Meeting, click **Live brief** panel to view current fact rows and evaluative signal chips before I join. On Board, the same Client row shows a ready-for-meeting Phase signal chip without me having enrolled a sequence. Booking was written by contact Booking confirm (bound packs) — consultant only receives.

**Criteria — when:** When an eligible contact books.  
**Conditions:** Meeting invitation was sent by bound engagement packs; Live brief re-computes on write-back; consultant did not manually enroll the sequence.

| UI | Kind | Seat | Status | Affordance |
|---|---|---|---|---|
| Meetings | Module | consultant | **new** (calendar receive surface; gap vs Board-only today) | Meeting row list |
| Meeting row | Block | consultant | **new** | Click to open Meeting |
| Live brief | Block | consultant | **partial-existing** as Client Brief — promote/rename as meeting-facing | **Panel** — reads contact write-back |
| Board | Module | consultant | **existing** | Phase signal **chip** (view) |
| Client Brief | Block | consultant | **existing** | Same facts outside meeting context |

**Requirements:** Engagement contact · Book closes the loop. Loop-closer capture pending meeting is machinery requirement under bound packs — not a consultant setup leaf.

---

### Leaf 2b.3 — never set up Automations / Agents / templates

**Q:** How do I never set up Automations, Agents, or engagement templates?

**Clarity:** Firm primary nav exposes Board, Meetings, Contacts, Client workspace — not Configuration libraries, Bind packs, or pack editors. Starting from Board or Meetings I only click Client / Meeting rows and click **Live brief** / **Halt outreach**. Pack authorship stays on the operator desk (Configuration libraries → Publish version; Firm operations bind → Bind). Today's Hub Automations / Hub Agents inside the firm shell is **existing-wrong-seat** revision debt — not this outcome's path.

**Criteria — when:** Always under ALG application.  
**Conditions:** Consultant nav does not expose pack authorship as a required job; operator bind is what arms the firm.

| UI | Kind | Seat | Status | Affordance |
|---|---|---|---|---|
| Board | Module | consultant | **existing** | Inhabit only |
| Meetings | Module | consultant | **new** | Receive only |
| Configuration libraries | Module | operator | **new** | Absent from consultant nav |
| Hub Automations / Hub Agents | Module (parked) | operator rightful / firm shell today | **existing-wrong-seat** | Must not be required consultant path |

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
