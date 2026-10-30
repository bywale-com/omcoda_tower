# Feature Specification: Tower Intended Product

**Feature Branch**: `001-tower-product`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Examine the supplied Tower repository and establish a complete, coherent specification of the intended Tower product using the information already available. Do not implement. Where the existing material does not establish an answer, make the uncertainty explicit rather than inventing a founder decision."

## Product Overview

Tower is Om Coda’s always-on immigration-consultancy workspace. Firms hand over a private contact book; Tower keeps those people reachable, engages them through opt-in → re-engagement nudges → reactivation, refreshes immigration facts through touchpoints, re-evaluates **service eligibility** as IRCC-shaped rules and client facts move, and campaigns eligible people toward a **booked meeting** — so consultants do not recheck every file by hand.

Tower is **not** a reactive CRM (“what do I do when someone emails?”). It is proactive eligibility wrapped in engagement. Om Coda runs it as an **agency product**: house operators author the operations; firms inhabit the book and the meetings. It is **not** a self-serve tool each firm configures alone. It does **not** detect a stranger’s immigration eligibility from public databases.

**North-star (consultant):** hand the private book over, authorize Tower to work under the firm license, and receive eligible clients already re-engaged and current — without setting up, configuring, or running engagement.

**Author seat (operator):** define outreach sequencing (order deployed), per firm or as a default plus overrides, attempt/escalation rules, and a goal / goal criteria that is itself an escalation point — to another agent, to a workflow, or it ends. Once met, met. Everything in the middle is modular.

**Product face:** the Ant desk (`/prototype-ant`). Hub is plant/reference, not the app.

## Clarifications

### Session 2026-10-19

- Q: May the specification close CASL/SMS geography, reactivation-worthy criteria, or escrow-release terms by inventing a founder choice? → A: No. Isolated Spec Kit experiment forbids asking for additional product requirements. Those three remain `[NEEDS CLARIFICATION]` / Named Silences (U-001, U-002, U-003). Planning MUST treat them as out of closed lock, not as guessed defaults.
- Q: Which document wins when root README says “prototype only, no auth/API” and later register/Story/Ant face describe a wired product? → A: Seed/World/Story/Outcomes/Phase Two + `/prototype-ant` as the intended product; README status line is stale evidence, recorded in Assumptions.
- Q: Is Hub the app because Automations face says Hub is the complete module? → A: No. Hub is plant/reference; Ant is the product face (founder wording + standing laws).
- Q: Should goal-as-escalation wait for Story promotion even though packets 022/023 specify Local met and exhaustion? → A: Specify flagship 15:43 plus packets 022/023 as intended machine behavior; leave Story-promotion tension as U-014. Do not recut walker 015. Do not mint a chrome-only goal table.
- Coverage scan (Spec Kit clarify taxonomy): Functional scope Clear with named deferrals; Domain Partial (silences); NFR/compliance Partial (no SLA; CASL unclosed); Integrations Partial (stand-in ports). No further interactive questions — answers would require a founder.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultant hands over the book and receives meetings (Priority: P1)

As a Consultant, I hand my private book to Tower, authorize it to work under my license, and later see eligible contacts booked onto my calendar without authoring sequences, rules, or automations.

**Why this priority**: This is the sole north-star outcome. If it fails, Tower is not the product Seed describes.

**Independent Test**: After a firm is provisioned and the book is authorized, a sequence-ready eligible contact can be engaged without the consultant opening Configuration libraries, and a booked meeting appears on Meetings with a live brief.

**Acceptance Scenarios**:

1. **Given** a provisioned firm and a prepared workspace, **When** the consultant completes Authorize book (database grant or confirm import) and Accept terms (license + escrow posture), **Then** the campaign can run and the consultant lands in the same Application desk as an assisted-provisioned firm.
2. **Given** a running firm with sequence-ready contacts, **When** the consultant does not configure Agents or Automations, **Then** bound house operations still work the book and meetings can appear.
3. **Given** a meeting is booked, **When** the consultant opens Meetings, **Then** they see the meeting and a live brief that reflects current facts, not a frozen snapshot.

---

### User Story 2 - Consultant inhabits the firm desk (Priority: P1)

As a Consultant, I sign in (or redeem a direct access invite), land in my firm workspace, see the book and board, take booked meetings, and halt anything I will not stand behind.

**Why this priority**: Access, inhabit, and governance are what make the north-star usable and lawful.

**Independent Test**: A provisioned user redeems access or completes passwordless sign-in, sees only that firm’s book, can open a client, and can halt outreach under their license.

**Acceptance Scenarios**:

1. **Given** a provisioned user, **When** they redeem a direct access URL, **Then** they land in the Ant firm workspace with a session (OTP login remains fallback).
2. **Given** an unprovisioned email, **When** someone requests a sign-in code, **Then** the system reports generic success and issues no code.
3. **Given** a session for firm A, **When** the consultant opens Contacts / Board, **Then** they see firm A’s records, not another firm’s book.
4. **Given** outreach running under the firm license, **When** the consultant halt/kills outreach they will not stand behind, **Then** new enroll and send for that scope is suppressed.
5. **Given** a client on the board, **When** the consultant opens the client, **Then** Details (profile / facts) and Activity (engagement chronology) are available; Activity is a record of what already fired, not an authoring canvas.

---

### User Story 3 - Operator authors Agents (Priority: P1)

As an Operator, I author blank agent sequences that hold campaigns (objectives), channel order, nested rule overrides, content, enroll, and launch — so firms can be bound to house-authored engagement rather than inventing it.

**Why this priority**: Agents is the flagship module. Authorship of sequencing, attempts, and goals lives here.

**Independent Test**: On Ant Configuration libraries → Agents, create a sequence with two campaigns, override a campaign to reveal channels, set an objective, enroll contacts, and Launch (arm) without using Automations as the authoring place.

**Acceptance Scenarios**:

1. **Given** no templates exist, **When** the operator opens Agents, **Then** the world is empty until they author; opt-in / re-engagement / reactivation appear only as sequence templates once authored, not as objective names.
2. **Given** a sequence canvas, **When** the operator adds two objectives, **Then** they get two campaigns; meeting the first campaign’s objective may string the next; that distance is not a “qualify” node.
3. **Given** a campaign, **When** the operator sets the objective, **Then** they pick a templated objective or a from-scratch binary event (happened / did not) and name it.
4. **Given** a campaign, **When** they turn on Override this, **Then** channel nodes (text / email / form) appear as wires; campaign-level toggles stay on the campaign; Override content expands inside the channel.
5. **Given** a rule, **When** it is not overridden at campaign or sequence, **Then** it falls back like CSS: campaign → sequence Settings → Agents (global) Settings.
6. **Given** attempt rules, **When** they are per-campaign they live on that campaign; per-sequence they live in Sequence Settings; global they live in Agents Settings — not as cycles drawn between campaigns, and not on the channel node.
7. **Given** a sequence, **When** the operator uses Add contact in the sequence header, **Then** they can enroll Every firm (default) or Select from a list (all selected; deselect to pick); enroll **starts the mission now** (not waiting on an event, not Publish).
8. **Given** an engagement chart on a client, **When** outreach has run, **Then** the chart is a tree of outreach; it does not wire left to the trigger that created the agent.

---

### User Story 4 - Operator authors Automations (Priority: P1)

As an Operator, I author a blank operations canvas: on this event, perform this operation, then fork on results — including in-app actions and assigning existing agents — so the house brain can listen and act without growing a second agent editor.

**Why this priority**: Automations is the operations module; Agents without this perimeter cannot hear events or change the system.

**Independent Test**: On Ant Configuration libraries → Automations, place Trigger → Rule or in-app Action → If/Switch → Agents assign, provide trigger test data, Run now, and Launch to arm.

**Acceptance Scenarios**:

1. **Given** a blank Automations canvas, **When** the operator adds a trigger, **Then** the trigger is schedule, manual, webhook, or an in-app event with Global (all of that kind) vs Local (this specific one) where the event has a Local grain.
2. **Given** the smallest workflow, **When** they place trigger · rule · action, **Then** that is a complete automation; the canvas can also chain further (event → action → condition on previous result → another action).
3. **Given** a Rule, **When** they open it, **Then** they can author GUI conditions (field · operator · constant) and/or named code outcomes that still toggle on/off; a rule is a composite of conditions and constants, creatable across industries.
4. **Given** Rule output, **When** classes exist, **Then** each class can fork later actions; required data is a listing (the questions of a form), not a single flag; the loop is deterministic (no AI to decide required data).
5. **Given** an Action, **When** they choose Agents, **Then** they assign an existing sequence or create from a template — they do **not** author a new agent in Automations.
6. **Given** an Action, **When** they choose in-app, **Then** they can ascribe a tag, run an audit, make a form, or other named in-app actions already on the primitives list — not “write whatever to whatever table.”
7. **Given** a finished node, **When** the next node is configured, **Then** it picks from **every write that run made** (the handle); a different automation listening for “audit finished” is the other door, not a substitute.
8. **Given** If, **When** placed, **Then** it has two wires (true / false); true is the mode; both comparison sides accept typed text or a variable chip. **Given** Switch, **When** placed, **Then** it has many wires and Add path adds a wire. Palette Switch is not the node-menu Switch that changes kind.
9. **Given** Get as a node kind, **When** opened, **Then** parameters can scope Module / firm / contact (firm selected → that firm’s contacts selected; deselect to narrow). Get is not Audit and not Action.
10. **Given** canvas controls, **When** the operator uses them, **Then** Save persists; trigger-interior test data fills the event write-set without running the chain; **Run** walks now with that data and breaks on an unconfigured node; **Launch** only arms the event (does not also fire a manual run).

---

### User Story 5 - Operator binds, audits, and oversees a tenancy (Priority: P1)

As an Operator, I provision or activate a firm, bind house-authored packs under that identity, run the reachability gate, and watch firm health — so the consultant’s book is worked without the firm authoring operations.

**Why this priority**: Agency shape: authorship is house-global; bind and audit are per-tenancy.

**Independent Test**: Provision (or ALG activate) a firm, bind published packs, run book readiness, and see sequence-ready vs not; firm health reflects in-flight attempts.

**Acceptance Scenarios**:

1. **Given** assisted entry, **When** the operator provisions a firm and user from versioned seed manifests (not ad-hoc rows), **Then** that consultant lands in the same Application desk as ALG.
2. **Given** published evaluation / automation / sequence versions, **When** the operator binds them on Firm operations bind, **Then** those packs run under that firm’s identity; publishing in libraries does not itself bind a firm.
3. **Given** a book, **When** the operator runs Book readiness / audit, **Then** contacts receive reachable / partial / unreachable verdicts and sequence-ready or not; the audit does not score pathways, forecast ROI, or impose a minimum list size.
4. **Given** sequence-ready contacts, **When** bind is Active, **Then** enrollment / campaign state can run for that firm.
5. **Given** a running tenancy, **When** the operator opens Firm health or cross-firm Oversight, **Then** they can see engagement health and drill into a firm.
6. **Given** a house change, **When** the operator opens Audit trail, **Then** who/what/when/which firm is inspectable.

---

### User Story 6 - Engagement contact consents, answers, silences, books (Priority: P1)

As an Engagement contact (not a Tower persona workspace), I receive firm-branded touchpoints: consent before deeper collection, one consolidated form for outstanding self-reportable facts, silence/opt-out at any time, and a meeting invite that lands me with the firm already current.

**Why this priority**: The consultant’s so-that has nowhere to land if the contact loop does not close.

**Independent Test**: A contact can opt in, submit one form covering outstanding self-reportable fields, opt out (silencing further automatic outreach), and book when invited.

**Acceptance Scenarios**:

1. **Given** a contact not opted in, **When** automatic outreach would otherwise deepen collection, **Then** they first receive a firm-branded consent request and may agree or ignore; silenced-when-not-opted-in holds.
2. **Given** outstanding self-reportable facts, **When** a nudge fires, **Then** those needs are one form, not one message per field.
3. **Given** document-dependent facts, **When** collection is planned, **Then** they never enter a form; they become tracked work items. Employer-directed asks go to the firm, not the client.
4. **Given** any point in the loop, **When** the contact silences or unsubscribes, **Then** automatic outreach stops; that opt-out is an event that can ascribe a tag.
5. **Given** a meeting invite, **When** the contact books, **Then** meeting booked is the loop-closer; outstanding self-reportable fields open a pending capture; the consultant brief recomputes on write-back.

---

### User Story 7 - Eligibility, signals, and one motion (Priority: P2)

As an Operator (authorship) and Consultant (record), I need every determination — including missing data — recorded as a signal, and at most one outbound motion per client at a time, so the book is worked without parallel spam.

**Why this priority**: This is the always-on loop’s decision law. It is P2 only relative to inhabiting authorship + consent first.

**Independent Test**: A reference change or fact write-back re-evaluates a contact; signals are recorded; if reactivation-worthy, only reactivation sends; otherwise one nudge form; secondary signals attach to the brief, not a second send.

**Acceptance Scenarios**:

1. **Given** firm-held plus engagement-collected facts and current reference, **When** facts or reference move, **Then** service eligibility is recomputed privately for that book; pathway pass means **any** pathway assertion, not one favoured pathway.
2. **Given** an evaluation, **When** it completes, **Then** an Analysis readout exists (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath, inspectable without a code deploy.
3. **Given** detections, **When** Engine 2 chooses motion, **Then** reactivation wins if anything is reactivation-worthy; nudge only otherwise; one client, one motion, ever.
4. **Given** a live inbound mid-attempt (for example a form visit), **When** it occurs, **Then** it can override and nullify the in-flight attempt.
5. **Given** a finishing event, **When** it occurs, **Then** the sequence closes and the next may arm (armed = ready, nothing sending; active = executing).

---

### User Story 8 - Attempt engine inside a sequence (Priority: P2)

As an Operator, I define channel ownership and attempt cycles so that one channel owns the flow at a time, waits nest under the failed owner, and criteria escalate forward — distinct from Engine 2’s campaign-calendar motion.

**Why this priority**: Conflating calendar order with runtime ownership is a named Story failure mode.

**Independent Test**: A sequence in flight owns Text, then Email, then Form per authored order; local retries nest under the failed channel; live inbound can nullify.

**Acceptance Scenarios**:

1. **Given** an in-flight sequence, **When** it runs, **Then** one channel owns the flow at a time along the campaign’s channel order (default teaching order is Text → Email → Form unless overridden).
2. **Given** a failed owner, **When** criteria for escalation are met, **Then** motion is forward-only to the next channel; attempts are cycles of that campaign’s sequence work, not a top-level attempt spanning all campaigns.
3. **Given** the last node of an attempt fails, **When** attempt rules allow another cycle, **Then** the next attempt starts after the authored distance; when the ladder is exhausted, failure **stops spending** (no more outbound) but **keeps listening** so a later completion still counts.
4. **Given** an objective, **When** the completion write for **this** campaign/objective occurs, **Then** that objective is met (Local), not because the person ever booked/submitted/clicked anything in history.

---

### User Story 9 - Acquisition and activation (Priority: P3)

As an Operator, I can acquire a stranger consultant inside a one-click budget (name + website + phone or email), forward-deploy a no-login prepared workspace under their firm identity, and earn the two hard inputs — database authorization and escrow acceptance — until the campaign can run.

**Why this priority**: ALG is a primary growth bet in Seed, but Meta go-live and escrow fulfillment are explicitly deferred/prototype-honest in the snapshot. The capability target stands; live Meta is not required to inhabit the desk.

**Independent Test**: Seed inputs land → prepared workspace exists without private book PII → hard inputs flip the firm to running. Assisted provision is the second real door into the same desk.

**Acceptance Scenarios**:

1. **Given** a Meta Approach (V1 named channel; LinkedIn deferred), **When** a consultant taps, **Then** name, website, and one channel are captured and they return to their scroll (no thank-you dashboard). Continue-scroll without tap is a first-class non-action.
2. **Given** seed inputs, **When** forward-deploy runs, **Then** a no-login prepared workspace is staged from house templates + public firm facts — not from the firm’s private list.
3. **Given** the prepared workspace, **When** hard inputs land, **Then** the campaign is running; credits or a sales-call are not peer doors equal to escrow at that moment.
4. **Given** ALG or assisted entry, **When** the consultant reaches Application, **Then** it is the same desk.

---

### User Story 10 - House remaining surfaces (Priority: P3)

As an Operator, I keep versioned immigration reference current as data, run acquisition/ads ops, hold commercial posture, answer support tickets with firm context, and apply founder/agency bounds — without leaking house controls onto the consultant desk.

**Why this priority**: Load-bearing for the agency shape; several are deferred or thin (Meta, escrow fulfillment, Register as shipped firm product).

**Independent Test**: Reference publish triggers re-evaluation without a code deploy; support can open a firm’s bind/health/commercial context; Register/evolution is house-only and not on the firm desk.

**Acceptance Scenarios**:

1. **Given** a reference version change, **When** it is published, **Then** affected contacts re-evaluate; no deploy is required to update categories, trades, cutoffs, or provincial identifiers.
2. **Given** a running firm ticket, **When** support opens it, **Then** they have that firm’s bind, health, and commercial context.
3. **Given** founder/agency controls, **When** a kill-switch or bound is set, **Then** it applies across tenancies without appearing as a consultant-authored module.
4. **Given** Register / evolution, **When** it is used, **Then** it is prototype-time house tooling; the shipped firm product contains no Register.

---

### Edge Cases

- Contact not opted in: treated as silenced for automatic outreach; firm DB authorization MUST NOT skip opt-in.
- Contact opted out / unsubscribed: halt new automatic send; event may ascribe a tag; failure/exhaustion of a campaign still listens for a later genuine completion unless money-door nullification exists (nullification is escrow-era and **not built**).
- Unreachable or partial audit verdict: not sequence-ready; open issues surface as workspace meta; “list is stale” is a byproduct, not the engine.
- Duplicate / garbage / already-in-Tower / missing name / no matching channel: audit checks; enrollment MUST NOT treat these as sequence-ready.
- Live inbound during an attempt: may nullify the in-flight attempt; form re-entries do not reset an in-progress form clock where OPERATOR-REVISIONS state that (not Story law until promoted — see Assumptions).
- Objective met matching: a meeting booked last quarter MUST NOT complete today’s campaign; completion is Local to the bound objective.
- Exhausted campaign: stop outbound; do not leave the attempt open so the tick writes duplicate failure events.
- Unconfigured Automations node: Run breaks; it MUST NOT mark success and continue.
- Run vs Launch: Launch MUST NOT also start a manual run.
- Empty world: no templates until authored; empty modules show query results (empty), not painted demo people.
- Unprovisioned OTP: generic success, no code.
- Access link: single-use, TTL-bounded; re-issue invalidates prior; one active link per user.
- Multi-consultant roles inside a firm: **not specified** (Story silence). Do not invent a permission matrix.
- Document-dependent need appearing on a form: forbidden.
- Parallel motions for one client: forbidden.
- Agent presentation performing fulfillment (scrape, send, evaluate, OTP, money): forbidden.
- Hub-only completeness with thin Ant: wrong surface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST continuously, while a firm has contacts and hands-free operation is armed: keep engaging dormant and active contacts; keep immigration-relevant facts fresh via firm→client touchpoints; re-evaluate service eligibility as reference and facts move; surface campaign-worthy people so consultants book meetings without manually rechecking every file.
- **FR-002**: System MUST treat **meeting booked** as the core Application success / loop-closer event.
- **FR-003**: Consultant MUST be able to hand over the book, authorize Tower under the firm license, accept activation terms, inhabit Board / Contacts / Client Details / Activity / Meetings, and halt outreach they will not stand behind — without authoring Agents or Automations.
- **FR-004**: Operator MUST author evaluation packs, automation workflows, and engagement sequence templates in house-global Configuration libraries; firms MUST NOT author those packs. Per-tenancy admin MUST bind which published versions run under a firm identity.
- **FR-005**: Agents MUST be the place the operator defines outreach sequencing (including order deployed), per firm or as a default plus overrides, attempt / retry / escalation rules, and a goal / goal criteria that is an escalation point to another agent, another workflow, or end. Once met, met.
- **FR-006**: A sequence MUST be a blank container for one or more campaigns. Each campaign has one objective. Two things to meet MUST be two campaigns. Opt-in / re-engagement / reactivation are sequence templates (full canvases), not objective picker values.
- **FR-007**: Campaigns MUST hold sequencing (how many channels, in what order). Channels are the medium (text, email, form) with channel/escalation rules. Attempt rules MUST NOT live on the channel node. Content override MUST expand inside the channel. Rules nest campaign → sequence → global if not overridden.
- **FR-008**: Agents enroll MUST start the mission now from the sequence header Add contact, scoped Every firm (default) or Select from. Automations enroll MUST NOT start a mission now; it listens for an event.
- **FR-009**: Automations MUST follow: on this event (schedule, manual, webhook, or in-app Global/Local) → perform a definite operation → on this kind of result do X / on that kind do Y. Smallest workflow is trigger · rule · action. Canvas MAY chain.
- **FR-010**: After any Automations node, the next step MUST pick from every write that run made. Clients MUST NOT hard-code a field catalog. Completion as a trigger on another automation is a second door.
- **FR-011**: Automations MUST NOT create new agents. Agents action = assign existing sequence or instantiate from template. Forms for data-request objectives are created in Automations, not in Agents.
- **FR-012**: In-app actions named so far MUST include ascribe a tag, run an audit, make a form; webhook is a way in, not an action. If/condition is a fork, not an action. Get is its own node kind.
- **FR-013**: If MUST have two path wires (true is the mode). Switch MUST have many path wires with Add path. Node-menu Switch (change kind) MUST remain a different control.
- **FR-014**: Trigger test data MUST live inside the trigger (two doors: write already exists vs specimen when it does not). Canvas **Run** executes now with that handle and stops on unconfigured nodes. **Launch** arms only.
- **FR-015**: Engagement record / Activity chart MUST be chronology of fired events; it MUST NOT author channel order, attempts, or escalation.
- **FR-016**: Attempt engine (one sequence) MUST own one channel at a time, nest waits/attempts under the failed owner, escalate forward when criteria are met, accept live inbound override, and on finishing event close and arm next.
- **FR-017**: Engine 2 MUST record every detection as a signal and choose a single outbound motion: reactivation first if reactivation-worthy; else one nudge consolidating outstanding self-reportable needs; secondary signals as brief agenda; one client, one motion, ever.
- **FR-018**: Fact collection MUST route self-reportable → forms / pre-meeting capture; document-dependent → never a form; employer-directed → firm. Any write-back MUST immediately re-evaluate.
- **FR-019**: Reference tables MUST be versioned data updatable without a code deploy. A reference move is a faceless trigger for eligibility re-evaluation of affected contacts.
- **FR-020**: Eligibility MUST be private to the firm book (firm-held + collected facts vs house/firm-configured rules). Pathway pass = any pathway assertion. MUST NOT cold-detect strangers from public databases.
- **FR-021**: Consent / suppression MUST govern automatic touch. Silenced when not opted in and when opted out. Firm database authorization MUST NOT substitute for end-client consent.
- **FR-022**: Reachability audit MUST answer only: can we reach this contact, and can we start a sequence? Verdicts: reachable / partial / unreachable. Sequence-ready is the enrollment precondition. MUST NOT produce pathway scoring, ROI forecasts, or sales PASS/FAIL ceremony.
- **FR-023**: Tenancy MUST own users and the book. Passwordless OTP and direct access-link redeem MUST admit known users. Unprovisioned emails MUST NOT be enumerable via OTP. ALG and assisted doors MUST land in one Application / session matrix. Session firm MUST be the provisioned firm.
- **FR-024**: Acquisition MUST capture name, website, and one channel (phone or email) inside a one-click budget from Meta in V1, then continue scroll. MUST NOT pull database authorization or escrow into that click budget. Cold email is not V1 Approach. Engagement contacts are never acquired via Approach.
- **FR-025**: Activation MUST forward-deploy a no-login prepared workspace from house templates + public facts, then accept database authorization and escrow as the running finish line. Tower MUST NOT hold immigrant settlement funds. End-clients pay Tower nothing.
- **FR-026**: Objective met MUST be detected as a Local event on the completion write bound to **this** objective/campaign, not “any historical completion of that kind.”
- **FR-027**: Campaign failure / exhaustion MUST stop outbound spending and keep listening for a later completion. Duplicate failure events from a still-open attempt MUST NOT fire. Money-door nullification (stop listening) is specified as escrow-era and is **not built**.
- **FR-028**: Send paths MUST respect consent, halt, and silence. Operator MUST be able to Halt / Kill to suppress new enroll and send.
- **FR-029**: Presentation surfaces MAY ask, explain, and route. They MUST NOT scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money.
- **FR-030**: Product face MUST be the Ant desk. Hub MUST NOT be treated as the app. Records shown in modules MUST come from tables; empty worlds stay empty until queries return rows.
- **FR-031**: Teaching captions on plates MUST NOT be minted as nodes or fields. Click node = configure.
- **FR-032**: Lineage of an objective (who created it — agent or hand — path, completion, duration) MUST be queryable at minimum; that is querying, not a new module.
- **FR-033**: In-app events named so far (Global / Local where applicable) MUST include: form submitted; campaign failed; opted out / unsubscribed; firm created / provisioned; audit finished; contact file imported; objective met. New “when X happens” that is not this list is unsupported until a primitive is named on purpose.
- **FR-034**: Hard human gates MUST remain human: seed capture; assisted provision and OTP verify; database authorization; escrow accept; client opt-in; meeting booking; firm refusal of illegal/unethical outreach.
- **FR-035**: CASL/SMS consent regimes by geography MUST [NEEDS CLARIFICATION: Seed/World assert the need but do not close which rules apply to firm→client vs first agent→consultant text, by country].
- **FR-036**: Engine 2 MUST know what makes a signal reactivation-worthy using [NEEDS CLARIFICATION: Story names this silence; no locked criteria pack in Seed/World].
- **FR-037**: Escrow release (when contingent firm↔Om Coda cost is released) MUST [NEEDS CLARIFICATION: Seed/World leave release trigger and outcome undefined; escrow fulfillment is deferred/prototype].

### Key Entities

- **Firm (tenancy)**: Boundary owning users and the private contact book. ALG and assisted provision land in one desk.
- **Consultant**: Acquired persona; inhabits the firm desk (hand over, authorize, receive, govern, take meetings).
- **Engagement contact**: Subject of the book, consent, facts, and meeting; not a branded Tower persona workspace.
- **Operator / Om Coda house**: Agency author and overseer; house-global libraries + per-tenancy admin.
- **Sequence template (agent)**: Blank container of campaigns; authored in Agents; bound per firm.
- **Campaign**: One objective inside a sequence; holds channel order, defaults, optional overrides, attempt grain.
- **Campaign objective**: Binary completion the campaign pursues (form / meeting / click and named types as locked); completion is Local.
- **Channel**: Medium (text, email, form) with escalation rules and optional content override / attempt variation.
- **Attempt cycle**: Retry container for a campaign’s sequence work after last node fails.
- **Enrollment / active attempt / engagement record**: Runtime state and fired chronology (record does not author).
- **Automation workflow**: Event/schedule/manual/webhook → operations graph → actions; blank canvas; DAG-like.
- **Workflow trigger**: Listen (Global/Local in-app event, or non-event schedule/manual/webhook).
- **Rule / constants pack**: Composite of conditions and constants; GUI and named-code outcomes; industry-swappable.
- **Action**: Agents assign/template, or named in-app action (tag, audit, form, …).
- **Write-set / handle**: Every write a module run made; next node’s input.
- **Contact record / import batch / tags**: Book objects; tags are in-app records (e.g. subscribed/not).
- **Consent / halt / silence**: Suppression state distinct from firm DB authorization.
- **Reachability verdict / sequence-ready / audit run**: Gate before engagement.
- **Reference version / collectible field**: Versioned public-reference and field-class routing (self-reportable / document-dependent / employer-directed).
- **Eligibility evaluation / result / analysis / signal / motion decision**: Detect vs send split.
- **Fact writeback / missing-fact signal**: Collection loop into re-evaluation.
- **Meeting booked / live brief**: Loop-closer and consultant pre-meeting view.
- **Prepared workspace / escrow acceptance**: Activation artifacts (escrow fulfillment deferred).
- **Access link / session / OTP challenge**: Admission without treating invite as a marketing portal.
- **Outbound message / messaging event**: Send + provider events (open, click, bounce) feeding attempt criteria and click objectives.
- **Campaign failure**: Exhaustion event (stop spending, keep listening).
- **Event test data / event write-set**: Trigger-provided specimen vs existing writes for Run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A consultant who has authorized the book can receive a booked meeting for an eligible, sequence-ready contact without opening Configuration libraries in that session.
- **SC-002**: 100% of automatic deeper collection attempts are preceded by a recorded opt-in (or the contact remains silenced). Zero sends after halt/silence/opt-out for that contact.
- **SC-003**: For any in-flight client, observers can point to at most one outbound motion at a time (no parallel nudge + reactivation sends).
- **SC-004**: An operator can author a two-campaign sequence, enroll at least one contact, and arm it from Agents without creating the sequence inside Automations.
- **SC-005**: An operator can author trigger → operation → If/Switch → action, fill trigger test data, Run until an unconfigured node stops, and Launch without that Launch also firing the run.
- **SC-006**: After an Automations action that invoked a real module (e.g. audit), the next node can be pointed at writes from **that** run rather than “latest audit for this firm.”
- **SC-007**: Completing an objective for campaign B does not mark campaign A complete; only the bound Local completion counts.
- **SC-008**: A newly provisioned firm’s Contacts view is that firm’s query result (empty if none), not another firm’s people.
- **SC-009**: A reference publish causes affected contacts to be re-evaluated without a software release.
- **SC-010**: Unprovisioned sign-in requests never confirm whether the email exists (generic success, no code).
- **SC-011**: Meeting booked with outstanding self-reportable facts presents pending capture, and the consultant brief reflects write-backs without a manual refresh reconstruct.
- **SC-012**: Audit never displays pathway scores, ROI forecasts, or a sales pass/fail as its verdict; verdicts are reachable / partial / unreachable plus sequence-ready.

## Assumptions

- Intended product is Seed/World/Story/Outcomes/Phase Two + Ant face, not the stale root README “prototype only, no auth/API” status line (contradicted by later register, migrations, and wire cutover notes).
- Hub remains an advanced plant for Agents/Automations visuals; Ant is the product to specify and inhabit.
- Contact is delivery-only (firm-branded touchpoints + access/capture), not a second acquired persona workspace. Access links for consultants are a direct URL, not a login-portal product. Depth of an authenticated **contact** portal beyond touchpoints remains a Story silence; this spec does not invent a full client app.
- OPERATOR-REVISIONS numeric windows (30 min text, 24 h email/form) are prototype clarifiers, **not** Story law until promoted. Spec requires authored criteria; it does not freeze those numbers as founder-ratified product lock.
- Goal-as-escalation is flagship law (15:43). Packet 022/023 specify Local objective-met and exhaustion-vs-listen. Story still labels a related expansion “not promoted”; this spec treats the flagship + those packets as specified behavior and records the Story-promotion tension as unresolved governance, not as permission to mint a separate goal table from chrome.
- Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, and list-unsubscribe ingress remain deferred/stand-in where the snapshot says so. Capability targets in Story still stand.
- Register/evolution is house-only prototype-time tooling; shipped firm product has no Register.
- V1 evaluation truth is Canada / IRCC-shaped immigration; other industries are pack-swap direction, not a locked second vertical.
- Dual entry to Agents: Automations `call_agent` **and** Agent-native enroll.
- Verification in-repo is manual on `/prototype-ant` plus production build; no automated UI test suite is specified as a product requirement.
- Reasonable web-app performance and session continuity are assumed where unspecified; no numeric SLA is locked in Seed.

## Named Silences And Unresolved Questions

These are **not** decided here. Do not fill them with a founder-shaped guess.

| ID | Topic | Why unresolved |
|----|--------|----------------|
| U-001 | CASL/SMS consent regimes by geography | Story silence; FR-035 |
| U-002 | What makes a signal reactivation-worthy | Story silence; FR-036 |
| U-003 | Escrow release trigger / outcome; ongoing SaaS vs escrow peer door | Story silence; FR-037; fulfillment deferred |
| U-004 | Concrete shape of “database authorization” per practice stack | Story silence |
| U-005 | Multi-consultant roles / permissions inside a firm | World/Story open |
| U-006 | Client desk depth (touchpoint-only vs authenticated portal); D-01/D-02 loop-closer builder placement | Story silence |
| U-007 | Whether email Approach earns Meta entry; Meta targeting / CAC | Story silence |
| U-008 | SMS reply-failure escalation | Story silence |
| U-009 | Import fully mutating the living list; CRM bidirectional sync | Story silence / V2 backlog |
| U-010 | Rule-pack IP / liability; Constants packs beyond Immigration | Story silence |
| U-011 | Form-as-own-graph-node vs embedded with calling the agent | Founder leans embedded; not locked |
| U-012 | Full in-app action catalog beyond named primitives | Face: do not invent the rest |
| U-013 | Full event catalog beyond the primitives table | Face: do not invent the rest |
| U-014 | Story promotion of SYSTEMS-GOAL vs 022/023 already specified | Governance tension; do not recut 015 |
| U-015 | Production hosting / worker packaging / “prod E2E green” | GO cutover is code-level, not a prod-green claim |
| U-016 | Spoken “call” channel as a medium | Agents face still open in 18:25 stamp |
| U-017 | Mixing objective types in one sequence beyond “technically you should be able to” | Not a locked UI rule beyond multiple campaigns |
| U-018 | Packet 020 Operator panes vs `firm_readiness` (waiting on #86 in docs/README) | Snapshot docs disagree with later migrations `023_operator_panes.sql`; ascribe vs landed cut needs SA confirmation — not invented here |
