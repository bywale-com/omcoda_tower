---
title: PRD — Tower
status: final
created: 2026-10-19
updated: 2026-10-19
stakes: launch / agency product (Phase Two inhabit; not greenfield)
working_mode: fast-path headless
headless: true
skill: bmad-prd
sources:
  - ../briefs/brief-Tower-2026-10-19/brief.md
  - ../briefs/brief-Tower-2026-10-19/addendum.md
---

# PRD: Tower

*Working title confirmed from Seed / package.json / register: **Tower**. Company: **Om Coda**.*

## 0. Document Purpose

This PRD is the BMad Method planning contract for the **intended Tower product**, distilled from the repository at SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` plus origin pull refs this SHA’s docs name as live spec (PR #96 PM packets, PR #86 / #110 SA packets). It is for downstream UX, architecture, spec, and epic skills — not for inventing founder decisions.

Vocabulary is Glossary-anchored. Features group functional requirements with stable FR-n IDs. Inferences without a founder's written decision are tagged `[ASSUMPTION]`. Named silences stay in §8. UX plates and machine packets are not duplicated here; they remain companions.

## 1. Vision

Tower is the always-on immigration-consultancy workspace Om Coda runs as an agency. A stranger consultant is acquired through a one-tap Meta Approach (name + website + one channel inside a click budget) or through assisted provision into the **same** application. Activation forward-deploys a no-login prepared workspace under the firm identity until database authorization and escrow acceptance land. Then the Application loop runs: keep the private book reachable, engage through opt-in → re-engagement nudges → reactivation, refresh facts through touchpoints, re-evaluate service eligibility as facts and IRCC-shaped rules move, and campaign eligible people toward a **meeting booked** — without the consultant rechecking every file by hand, and without public-before-contact detection of end-client eligibility.

The operator authors outreach **sequencing** (order deployed), **per firm or as a default** plus **overrides**, **escalation between attempts**, and a **goal / goal criteria** that is itself an escalation point: to other agents, to other workflows, or it ends. Once met, met. Everything in the middle is modular. Automations is the operations brain on events; Agents sends people to goals. Presentation agents ask, explain, and route — they do not scrape, persist, fire sequences, evaluate, issue OTP, or move money.

## 2. Target User

### 2.1 Jobs To Be Done

- **Consultant (functional):** Give Tower the book; get booked meetings on people who are actually eligible now, without file-by-file recheck.
- **Consultant (emotional):** Trust that outreach is legal, consented, and on-brand — not spam the firm will be blamed for.
- **Operator (functional):** Author packs once; bind them per tenancy; see silent sequence failure across firms; provision and recover a tenancy without a deploy.
- **Engagement contact (functional):** Understand what is being asked (consent, a form, a meeting), opt out, and not be chased after silence.
- **Founder / agency (contextual):** Keep eligibility and engagement as open-box operations that survive IRCC change and industry-pack swap.

### 2.2 Non-Users (v1)

- End-clients acquired via Approach (contacts are never Approach-acquired).
- The Om Coda house as an Approach stranger.
- Firms that must author their own evaluation/automation/sequence libraries. [WORLD: authorship is house-global; tenancy binds.]
- LinkedIn Approach users (deferred).
- A “public detection” buyer who thinks a legal business name is enough to score immigrant eligibility.

### 2.3 Key User Journeys

- **UJ-1. Priya (RCIC) inhabits a running firm desk.** Priya authorized the book last week. She opens `/prototype-ant` as Consultant, sees Board detections keyed by `contact_records.id` (not Sarah). She opens a contact’s Client Data → Activity and reads the engagement record: what armed, what sent, what is silenced. A meeting appears on Meetings with a live brief. **Climax:** she walks into the meeting already knowing why this person is campaign-worthy. **Edge:** empty book → empty Board, never a painted Cedar roster.

- **UJ-2. Amira (Om Coda operator) authors then binds.** Amira opens Operator → Configuration libraries. She authors (or revises) an Automations graph: firm provisioned → audit contacts → If on that write-set → assign Agents from a template. She authors an Agents sequence as a blank canvas of campaigns (each campaign one objective; channels revealed by Override this). She binds those packs to Priya’s firm. **Climax:** the firm identity is running house methodology, not a blank CRM. **Edge:** if no templates exist, there are no templates (Agents FACE law 10).

- **UJ-3. Jordan (contact) opts in, then is left alone when they say so.** Jordan receives firm-branded SMS/email, completes consent, later submits a data-request form. They unsubscribe. Automations hears opt-out (global or local), ascribes the tag, halt/silence suppresses new enroll+send. **Climax:** silence is a first-class state, not a hope. **Edge:** never opted in is also silenced (World).

- **UJ-4. ALG stranger on Meta (growth path; Meta live deferred).** A scrolling consultant understands the one-tap output from the ad, taps, gives name + website + phone or email, continues the scroll. Forward-deploy stages a prepared workspace. A presentation agent walks them to book authorize + escrow. **Climax:** campaign can **run**. **Edge:** continue-scroll without tap is instrumented (understood vs not). **[ASSUMPTION: Meta go-live remains deferred; journey is still intended.]**

- **UJ-5. Operator recovers a failing tenancy.** Cross-firm Oversight shows sequence health. Drill to Firm health. Support queue has per-tenancy context (bind, commercial, recent house actions). Founder controls can halt. **Climax:** the firm keeps running without the consultant inventing ops.

## 3. Glossary

- **Tower** — Om Coda’s always-on immigration-consultancy workspace (this product).
- **Om Coda** — the agency that runs Tower across firms.
- **Firm** — tenancy boundary (users, contacts, book, brand). Not a persona.
- **Consultant** — the only acquired workspace-owning persona; inhabits the firm desk.
- **Operator / house** — Om Coda configuration-and-oversight layer (house-global console + per-tenancy admin). Not an acquired persona.
- **Engagement contact / Contact** — subject of engagement; not a branded Tower seat.
- **Book** — the firm’s private contact records.
- **Audit** — reachability gate only: can we reach this contact, and can we start a sequence? Verdicts reachable / partial / unreachable. Not pathway scoring.
- **Sequence** — blank container that can hold multiple campaigns (goals). Templates (opt-in / re-engagement / reactivation) are sequence templates, not objective names.
- **Campaign** — one objective inside a sequence.
- **Objective** — binary completion for a campaign (click / form / meeting as named kinds). All objectives are events.
- **Goal** — completion of an objective. Goal criteria on an Agent is an escalation point (other agent · other workflow · or end).
- **Channel** — medium (text / email / form). Channel rules = escalation on that medium. Not an objective.
- **Attempt** — a cycle/container of the same campaign sequencing; attempt rules are not at the channel.
- **Agent (module)** — operator authorship of sequencing, attempts, overrides, and goal-as-escalation; also the place to start a mission now.
- **Agent (presentation)** — conversational surface that asks, explains, routes. Must not fulfill scrape/templates/sequences/evaluate/OTP/money.
- **Automations** — event → definite operation → binary forks → in-app or Agents actions. Blank canvas that can chain. Does not create agents (assign existing or from template).
- **Handle / write-set** — after a node, every write that run made; the next node picks.
- **Global / Local** — all of an event kind vs this specific instance (this form, this campaign). Not “Settings.”
- **Signal vs motion** — detections record as signals; whether anything is sent is motion. Engine 2: one client, one motion; reactivation first; else one nudge consolidating self-reportable needs.
- **Armed / Active / Silenced** — template ready vs executing vs excluded (opt-out or never opted in).
- **Product face** — `/prototype-ant` (CT Ant).
- **Hub** — advanced plant for Automations/Rules; not the app.
- **Register** — prototype-time house methodology tooling; not shipped to firms.
- **Service eligibility** — what the firm can sell this person now (any pathway assertion, not one favoured pathway).
- **Reference tables** — versioned IRCC-shaped data the house maintains without a code deploy.
- **Escrow** — contingent terms between **firm and Om Coda**. Tower does not hold immigrant settlement funds.
- **ALG** — agent-led growth (cheap seed inputs → forward-deploy → earn hard inputs).
- **OLG** — assisted / operator-led entry into the same application.
- **Data in tables** — module records come from Postgres; never hard-coded SPA rows.
- **Click the node = configure** — opening a node configures it; `⋯` Switch means change this Trigger/Action’s **kind**, not the Switch node.

## 4. Features

### 4.1 Facet spine — Acquisition, Activation, Application, Evolution

**Description:** Seed facet order is an immutable wall. Acquisition delivers seed inputs only. Activation earns hard inputs and stages readiness. Application is the running desk loop. Evolution is Register-driven product change, not a client lifecycle. Realizes UJ-4, UJ-1.

#### FR-1: Capture ALG seed inputs inside the click budget

Approach can capture firm/consultant name, website, and one channel (phone **or** email) from a Meta (FB/IG) Approach in V1. One click is the design constraint. Output is legible in the ad (never persuade). After capture, the stranger continues the scroll.

**Consequences:**
- Seed input set is exactly those three; database authorization and escrow are **not** in the click budget.
- Continue-scroll without tap is instrumented as understood vs not.

**Out of Scope:** LinkedIn Approach; cold email Approach; pulling hard inputs into the ad.

#### FR-2: Forward-deploy a prepared workspace

On seed inputs land, the system scrapes **public firm facts** and instantiates **Om Coda’s** launch → re-engagement → reactivation methodology templates — not the firm’s client list — into a no-login prepared workspace that proves **readiness**, not value.

**Consequences:**
- Campaign is not derived from the private book before authorization.
- Firm identity is branding/auth detail, not a claim that Tower already holds their clients.

#### FR-3: Earn hard inputs then run

Activation ends when database authorization **and** escrow acceptance land and the campaign can run. Presentation agent may ask and route; Automations/Wiring persist and flip running.

**Consequences:**
- ALG and OLG land in one application, one session matrix.
- Application desk is not redesigned to make ALG cheaper.

#### FR-4: Evolution stays house-side

Running-firm friction may become documented gaps and regenerate the product through Register. The shipped firm product contains **no Register**.

### 4.2 Tenancy, access, and shell

**Description:** Firm is the tenancy. Consultant is the desk seat. Operator is house-global + per-tenancy. Contact uses access links / firm-branded touchpoints. Shell chrome (PR #96) is Consultant ▾ · Operator · Contact ▾. Realizes UJ-1, UJ-5.

#### FR-5: Passwordless known-user session

Known users enter via OTP / access-link redeem as specified in auth tables and `MAGIC-ACCESS-LINK.md`. Cedar-class “no auth user” remains an ops/honesty problem, not a second product.

#### FR-6: View-as / seat switch does not mint extra personas

Consultant, Operator, and Contact seats match personas.md. Firm is not a fourth persona. Register is not a firm module.

#### FR-7: Workspace until opt-out (intended; packet on PR #96)

Contact workspace persists until they opt out, per `WORKSPACE-UNTIL-OPT-OUT-PACKET.md` on PR #96. [ASSUMPTION: SHA FACE files may predate this packet; intended product includes it because the living Phase Two log on #96 names it.]

### 4.3 Book, reachability, consent

**Description:** Authorize book (CRM OAuth or equivalent) and/or import. Audit is the reachability gate. Consent, halt, and silence suppress send. Realizes UJ-1, UJ-3.

#### FR-8: Authorize and import the book

Consultant/operator can authorize the book (single handover) and import contacts (CSV / named import path). Contacts list is `contact_records` (and related), never a baked roster.

#### FR-9: Audit is reachability only

Audit answers: can we reach this contact, and can we start a sequence? Verdicts: reachable / partial / unreachable. Sequence-ready when passed. Not a sales ceremony, not pathway scoring, not a minimum-count gate.

#### FR-10: Consent, halt, silence, opt-out

Outbound send is gated on consent / halt / silence. Opt-out / unsubscribe is an event (global; local unnamed in primitives). Halt/Kill suppresses new enroll+send.

### 4.4 Eligibility, facts, reference, motion

**Description:** Keep facts fresh; re-evaluate service eligibility against versioned reference; record signals; decide motion under Engine 2. Realizes UJ-1.

#### FR-11: Fact classes

Self-reportable facts may enter forms and pre-meeting capture. Document-dependent facts **never** enter a form; they become tracked work items. Employer-directed asks route to the firm, not the contact.

#### FR-12: Reference currency

House maintains versioned immigration reference tables (categories, trades, cutoffs, provincial identifiers) as data, without a code deploy.

#### FR-13: Service eligibility re-evaluation

As facts and reference move, re-evaluate what the firm can sell now. Pathway pass = any pathway assertion, not one favoured pathway. Open-box: inspectable and changeable without deploy.

#### FR-14: Signal vs motion (Engine 2)

Every detection — including missing fact — is a signal. Outreach is one motion: reactivation first if anything is reactivation-worthy; else one nudge consolidating outstanding self-reportable needs into a **single** form. When reactivation fires, other signals ride the pre-meeting brief — never parallel outreach. One client, one motion.

### 4.5 Agents — operator authorship of engagement

**Description:** Flagship 15:43 + Agents FACE law. Sequence is a blank canvas of campaigns. Realizes UJ-2.

#### FR-15: Operator defines outreach sequencing

Operator defines the sequence and the **order it is deployed**, per firm or as a default, plus overrides. Nested like CSS: global Agents Settings → sequence Settings → campaign override → channel.

#### FR-16: Attempt and channel rules are distinct

Attempt = cycle of the same sequencing; distance after failed last node of an attempt is a rule. Channel rules = escalation on the medium (not opened, not clicked, …). Attempt rules are not at the channel. Per-campaign attempt rules live on the campaign; per-sequence in Sequence Settings; global in Agents Settings.

#### FR-17: Two objectives → two campaigns

If two things must be met, each requires its own campaign. Meeting a campaign’s objective may string the next. There is no “first objective” object and no qualify node between campaigns. A tick of “objective met” may be chrome, not a node.

#### FR-18: Objective is first on a campaign

Untemplated objective is a binary event (yes/no), then named. Templated objective populates the campaign. Objective kinds named in machine/packets include click, form, meeting. Do not put “opt-in” in the objective picker.

#### FR-19: Channels revealed by Override this; content by Override content

Override this on a campaign reveals wired channel nodes. Override content is a toggle **inside** the channel node and expands the composer for that medium. Attempt-specific copy is a variation on that node, not a sibling wire.

#### FR-20: Dual enroll doors

Agents Contacts displays enrolled contacts; Add contact in the sequence header starts the mission **now** (scope: Every firm default, or Select from). Automations enroll is the other door (on an event). Not Publish.

#### FR-21: Goal / goal criteria is an escalation point

Once the goal is met, it is met. Escalation: other agents, other workflows, or end. [ASSUMPTION: housing is Local event `objective_met` + subscription (packet 022), not a goal table. Story §7 promotion of wording remains open.]

#### FR-22: Engagement chart is a tree of outreach

Activity/engagement chart does **not** connect left to the trigger that created the agent. Lineage is queryable separately (Automations law 29).

### 4.6 Automations — operations brain

**Description:** FACE laws 1–33 + PRIMITIVES. Product face Ant; Hub is plant. Realizes UJ-2, UJ-3.

#### FR-23: Definite middle, DAG forks

On this event (schedule or trigger or manual or webhook-in) → perform this operation → on this kind of result do X / on that kind do Y. Smallest legal workflow: trigger · rule · action. Canvas may chain.

#### FR-24: Named listen catalog (shape so far)

In-app events: form submitted (global / this form); campaign failed (global / this campaign); opted out / unsubscribed (global); firm created/provisioned (global); audit finished (global; local probably none); contact file imported (global; local later if needed); objective met (kind / this instance). Not “any row changed.” Webhook is inbound, not an action.

#### FR-25: Two action kinds

(a) In the application: ascribe a tag; run an audit; who this applies to; make a form; provision a firm (later idea — Automations **hears** firm created). (b) Agents: assign existing sequence or create from a template. Do **not** author a new agent in Automations. Not “write whatever table.” If/Switch is a fork, not an action.

#### FR-26: Handle after a node

When a node completes, the next step has every write that run made (015 `previousWrites` / 017 `chainWrites`). Next node picks. Two doors: handle on this canvas vs a different automation listening to the completion event. Do not collapse.

#### FR-27: Rule is conditions + constants, togglable families

Rules are creatable, industry-modular, GUI default (field · operator · constant) with named-code escape. Two grains of condition: inside the rule vs If/Switch after previous result. Required-data listing is an output class; forms for data-request **are** those self-reportable rows (A40 / packet 021).

#### FR-28: Forms live in Automations

Agents does not create forms. Data-request objective creates the form in Automations. Form-as-own-node vs embedded in start-agent node is **not locked** (lean embedded). Opt-in/consent forms and loop-closer forms are different artifacts; do not collapse.

#### FR-29: Click the node = configure; Switch kind ≠ Switch node

Selecting a node opens configuration. `⋯` Switch changes Trigger/Action **kind** (A26). That is not the Switch node (If/Switch packet).

#### FR-30: Test, Run, Wait (intended packets)

Test: provide data on the trigger (TEST-PACKET). Run: execute now vs arm the event (RUN-PACKET). Wait: graph kind `wait` with approval (Consultant or Operator) or duration (WAIT-NOTE packets; SA 028). [ASSUMPTION: SHA SQL includes `024_wait_occupancy.sql`; FACE on SHA may not yet describe Wait.]

### 4.7 Actuation and meetings

**Description:** Worker/cascade applies bind; desks show the record; meeting booked is the loop win. Realizes UJ-1.

#### FR-31: Channel send with content

Text/email/form send writes `engagement_records` / `outbound_messages` (content fields exist from migration 009) and messaging events when webhooks live. One channel owns the flow at a time; motion forward-only when criteria are met; live inbound can override an in-flight attempt.

#### FR-32: Meeting booked is the success event of the Application loop

Story core outcome: detect eligible candidates and initiate the right motion whose success event is meeting booked. Live brief hydrates from facts. Loop-closer capture is pending the meeting (How trees).

### 4.8 Operator libraries, bind, oversight, commercial

**Description:** personas.md surfaces. Realizes UJ-2, UJ-5.

#### FR-33: Configuration libraries are house-authored

Evaluation/rules, automation workflows, sequence & campaign templates authored house-globally; never on the firm desk as authorship.

#### FR-34: Per-tenancy bind

Bind which house-authored packs run under this firm identity (Publish → Bind). Firms do not author packs.

#### FR-35: Oversight, audit trail, founder controls, support

Cross-firm sequence health with tenancy drill-down; operator audit of house changes; founder/agency controls (including halt); support queue + per-tenancy context.

#### FR-36: Commercial / escrow posture (capability target)

House holds contingent terms per firm. V1 presented door is escrow, not prepaid credits as a peer activation door. **Fulfillment is deferred by plan** (MODULES-ALIVE / cohesion): stand-in, not “the system,” unless Story already required live money movement.

### 4.9 Honesty, data-in-tables, product face

**Description:** PLACEHOLDER-REAL-MAP + DATA-IN-TABLES. Realizes UJ-1 edge.

#### FR-37: Empty real, not demo scenery

If a surface exists and the fact is machine-owned: no rows ⇒ empty UI; rows ⇒ personalized to the session firm. No Sarah/Marcus/Cedar/Harbor painted as live. No hard-coded SPA catalogs for module records.

#### FR-38: Product face is Ant; Hub is plant; do not plant Hub as the app

`/prototype-ant` is the product. Hub may remain as reference. Captions on plates are teaching, not spec (IMAGE-CAPTION-AUDIT / PLATE-READ on #96).

#### FR-39: Write-set is the shape for subsequent mapping

Do not hard-code a field catalog in the client for “what the last node produced.” Pick from the run’s writes.

## 5. Non-Goals (Explicit)

- Not a reactive CRM (“what do I do when someone emails?”).
- Not public-before-contact detection of end-client eligibility.
- Not holding immigrant settlement funds.
- Not shipping Register to firms.
- Not making Hub the product face.
- Not agent-as-fulfillment (scrape, templates, send, evaluate, OTP, money).
- Not “write any table” from Automations.
- Not webhook-as-an-action.
- Not putting Automations triggers on the Agents canvas.
- Not treating opt-in / re-engagement / reactivation as **objective** names (they are sequence templates / campaign names).
- Not minting tables from pictures or captions.
- Not recutting walker 015 or overwriting flagship 15:43.
- Not LinkedIn or cold-email as V1 Approach.
- Not self-serve long onboarding as the primary growth door.
- Not collapsing If/Switch with `⋯` Switch-kind.
- Not a thick fake world of seed people in React.

## 6. MVP Scope

### 6.1 In Scope

Phase One “most of the app” plus Phase Two module-by-module inhabit of Agents/Automations/Contact/shell as specified on the Ant face, bound to stood-up tables and the dumb runtime (cascade, worker, workflowWalk). Live send (Resend CEM, Twilio SMS) when secrets + DB exist. Honesty contract. Dual enroll doors. Primitives event/action catalogs as the **shape so far**.

### 6.2 Out of Scope for MVP (named deferrals)

- Meta ads **go-live** (capability remains; port is stand-in).
- Escrow **fulfillment** (posture specified; money movement stand-in).
- Register & evolution **house tooling in the shipped firm product**.
- Full operations/exit-point catalogs not yet named by founder.
- Queryable lineage as a dedicated module (minimum: queryable; do not mint a table from the sentence).
- Provision-as-Automations-action (later idea; hearing firm-created is in).

## 7. Success Metrics

Seed does **not** contain numeric CAC, conversion, or SLA targets. Metrics below are **demonstrable** from Story + honesty, not invented KPIs.

**Primary**
- **SM-1**: A running firm with a real book can be shown: sequence-ready contacts, an armed or active engagement, and a path to `meeting_booked` without painted demo people. Validates FR-8, FR-31, FR-32, FR-37.
- **SM-2**: Operator can author a smallest Automations (trigger · rule · action) and an Agents sequence with at least two campaigns, bind them, and enroll from both doors. Validates FR-15–FR-20, FR-23–FR-26.
- **SM-3**: Opt-out/halt stops new enroll+send. Validates FR-10.

**Secondary**
- **SM-4**: Empty book renders empty desks (Board/Contacts/Activity), not Sarah. Validates FR-37.
- **SM-5**: Eligibility re-eval produces inspectable rule outcomes (open-box), not a sealed score. Validates FR-13, FR-27.

**Counter-metrics (do not optimize)**
- **SM-C1**: Screen fullness (row counts painted in UI). Counterbalances SM-1.
- **SM-C2**: Hub chrome parity as a substitute for Ant plates. Counterbalances SM-2.
- **SM-C3**: Number of tables minted from pictures. Counterbalances modularity.

## 8. Open Questions

These are **repository-named** gaps. Do not fill them in this PRD.

1. Full list of Automations **operations** beyond the primitives shape list (FACE Open #1).
2. Full list of **exit points** besides start/select agent (FACE Open #2).
3. Form creation: own graph node vs embedded in start-agent node (lean embedded; not locked).
4. Remaining rule **output classes** besides required data (FACE Open #9).
5. Story §7 **promotion** of goal-as-completion wording vs packet 022 already cutting Local event housing.
6. Consent regime for the **first agent→consultant text** (Story §1 silence).
7. When/whether **email earns Meta entry**; Meta targeting / CAC (Seed silences).
8. Multi-consultant roles inside a firm (personas: remain open in World).
9. Word “event” vs “objective” residual vocabulary (law 28 settled they’re the same grain; C2b still uses both words in places).
10. Root README “prototype only / no backend” vs wired `server/` + migrations — no explicit founder withdrawal of README.
11. Which PM packets on PR #96 that post-date this SHA’s FACE files are **already liked** vs still pickup (living log on #96 Current = Wait-note Approver at fetch time; SHA log Current = A40 / SA 021).
12. Accessibility floor and i18n for Ant — not specified as WCAG target in register. [NOTE FOR PM]
13. Production SLA / RTO / on-call — not in Seed. [NOTE FOR PM]
14. Canadian privacy / CASL operational detail exists in SME docs as implementation consideration; founder product-law vs SME advice not merged into Seed.

## 9. Assumptions Index

- `[ASSUMPTION]` Intended product is Seed/World/Story/FACE/primitives, not stale root README prototype framing.
- `[ASSUMPTION]` Product face `/prototype-ant` remains law even where Hub looks more complete.
- `[ASSUMPTION]` Packet 022 housing (objective met = Local event + subscription) is the intended mechanism for 15:43 escalation; no goal table.
- `[ASSUMPTION]` PR #96 packets named from living logs are intended face law even when absent from SHA tree.
- `[ASSUMPTION]` SHA migrations `019`–`024` are stood-up machine for contact seat, workspace opt-out, objective local axis, pursuit exhausted, operator panes, wait occupancy — even when SHA `docs/README.md` still says pickup 022.
- `[ASSUMPTION]` Meta/Escrow remain deferred fulfillment, not silently in-scope for go-live.
- `[ASSUMPTION]` Fast-path headless: no founder review this run; status of this PRD for downstream is **partial** wherever §8 applies.

## 10. Constraints and Guardrails

- **Privacy / messaging:** CASL-class consent and halt are product-law (consent_records, halt_records, silence). Exact legal opinion is SME, not Seed.
- **Safety:** presentation agent must not fulfill. Illegal outreach refused (consultant governance How).
- **Cost:** contingent-cost bet at activation; do not replace escrow with credits as a peer door at that moment.
- **Modularity:** anything that should vary is a table; frozen-in-prose that should vary is a bug unless it is a hard-gate / must-not.

## 11. Platform

Web application (Vite + React 18). Product routes: `/prototype-ant` (and `/c/` deep paths per vite config). Optional Hono backend on `:3001` for `/auth` and `/wire`. Mobile/native not specified as a V1 ship target. [ASSUMPTION: desktop/laptop web is the inhabit environment of Phase Two.]

## 12. Integration and Dependencies

**Live when secrets + DB are good (docs/README on SHA):** Resend CEM, Twilio SMS, Resend webhooks → messaging_events, OTP mailer, sending_domains, Postgres halt/consent/CRM grant/audit/primary store, worker tick, access links.

**Stand-in / deferred:** Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress.

CRM OAuth grant is the authorize-book port (named live as crmOAuth in MODULES-ALIVE).

## 13. Data Governance (shape only)

Tenancy-scoped Postgres (firm_id on machine tables). Session firm is explicit (`VITE_DEV_FIRM_ID` has no demo-tenant default). No founder-specified retention schedule found. [NOTE FOR PM]

## 14. Why Now

Phase Two thesis: Phase One already put most of the app on a table-first spine; remaining work is inhabit — “I should be able to…” — especially Agents/Automations as most of the app. This PRD exists to hold the intended product coherent while implementation continues module-by-module.
