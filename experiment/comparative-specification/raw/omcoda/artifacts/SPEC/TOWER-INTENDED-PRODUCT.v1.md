# Tower — Intended Product Specification

**Contestant:** Omcoda (Contestant 2)  
**Framework:** Om Coda Register method (Seed → World → Systems Story → Systems Requirements ∥ Personas & Function → bind → SME practice ∥ capability → Enrichment/Furnish context → Phase Two micro-pass)  
**Source SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**Posture:** under-claim. Intended product, not as-built honesty. Where Seed/World/Story are silent, this document names the silence. It does not invent a founder decision.  
**Companion extracts:** `01-seed/` … `08-uncertainty/` in this artifact root.

This is a Register-shaped specification of **what Tower must be**. It is not a generic PRD, not an implementation plan, and not a claim that the pinned snapshot is shipped.

---

## 0. Method pins (how this document was produced)

1. **Seed is the dump.** Business facts come from `docs/register/SEED.md`. Nothing outside that dump plus later locked Register/SME/Phase Two founder wording is treated as product truth.
2. **World is derived, not filled.** Ecosystem, hops, and gates only. Treatment of seats is Personas craft, still from World.
3. **Two columns.** Machine (Story → Requirements → tables + dumb runtime) runs parallel to faces (Outcomes → How). Bind is late: controls change existing states; panes show existing states.
4. **How Analysis.** Human subjects only. DNA cuts. User-visible until leaf. Consultant core = hand-over · authorize · receive. Engagement machinery is requirement, not outcome.
5. **Practice SME modifies; capability SME adds.** Neither mints World seats. “CTO handles it” is not a terminal classification.
6. **Phase Two** is the same method at module grain. Agents flagship **15:43 UTC** is founder wording and is not replaced by a generated list.
7. **Decision constitution.** Work proceeds except at named founder-only gates. Catch-all TBD is a method failure.

---

## 1. What Tower is

**Company:** Om Coda. **Buyer:** immigration consultancies (B2B firm operators). **V1 geography/program shape:** Canadian immigration pathways (Express Entry / CEC / FSW / FST / PNP and related). Other countries are not forbidden later; they are a founder-only geography expansion.

**Product bet:** Firms pay for an always-on system that engages dormant and active contacts, keeps immigration facts fresh through firm→client touchpoints, re-evaluates **service eligibility** as IRCC-shaped rules and client facts move, and surfaces when someone is campaign-worthy — so consultants book meetings without manually rechecking every file.

Tower is **proactive eligibility wrapped in engagement**. It is not a reactive CRM, not a public finder of end-clients, not a money transmitter of immigrant funds, not an Agent desk (Agent is a feature), not a full end-client operator console in V1.

**Growth bet (ALG):** One tap in a Meta feed yields name + website + phone/email inside a click budget; the system forward-deploys a no-login prepared campaign under the firm’s identity; an agent (presentation only) earns database authorization and escrow; then the campaign **runs**. Assisted / operator-led entry (OLG) remains a real second door into the **same** application.

**Agency shape:** Om Coda runs Tower across firms. Evaluation rules, analysis, operational logic, engagement templates, and reference upkeep belong to an **operator/house** layer — inspectable and changeable without a code deploy (open box). The firm inhabits the book and the meetings. Firms do **not** author packs. House authors; tenancy binds.

**One-line value:** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

---

## 2. Facets and finish lines

| Facet | Meaning | Finish line |
|---|---|---|
| **Acquisition** | Cheap inputs to *provision*, inside click budget | Name + website + one channel (phone **or** email) |
| **Activation** | Path from provisioned stranger to *run* | Database authorization **and** escrow acceptance |
| **Application** | Desk performing once running | Continuously toward **meeting booked** |
| **Evolution** | Register-driven product change | Not a client lifecycle phase |

**Immutable walls:** Click budget cannot pull hard inputs backward. Forward-deploy is activation, not acquisition. Application desk is not shrunk to make ALG cheaper. One Approach per acquired non-house party (V1: Consultant). Engagement contacts are never acquired via Approach. House is never acquired via Approach.

**Contingent cost:** First ALG money door is **escrow** (firm↔Om Coda). Credits and sales-call are not peer doors at that moment. End-clients pay Tower nothing. Detection is free to the contact. **Escrow release definition is unspecified** (named silence).

---

## 3. Parties

| Party | Role in the intended product |
|---|---|
| **Firm** | Tenancy. Owns users and the private book. |
| **Consultant** | Sole acquired **persona**. Hands over the book, authorizes, takes meetings, may halt what they will not stand behind. Does not author engagement/eligibility operations under ALG. |
| **Engagement contact** | Referenced participant. Consents or silences, answers self-reportable facts, books. No payment to Om Coda. No V1 branded Tower operator console. |
| **Operator** | One house human, many surfaces (house-global + per-tenancy). Authors packs, binds tenancies, oversees, supports. Not a firm Board login persona. |
| **Agent presentation** | Feature across Approach, prepared workspace, and routing. Never fulfillment. Not a seat. |

Multi-consultant roles/permissions inside a firm are **open**. This spec does not mint extra firm-side personas.

---

## 4. Molecular outcomes (face track)

**North star — Consultant Core**

> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.

**How DNA (leaf grain):**

1. On **Prepared Workspace**, complete **Authorize book** and **Accept terms** (license + escrow). Those two commits are the activation hard inputs.
2. After running, **Meetings** receives booked rows with a **Live brief**. Board shows phase chips as inhabit. The consultant never opens Configuration libraries to produce motion.

**Secondary outcomes (complete lattice):**

- Consultant: **Governance** (see / halt) · **Access** (OTP → firm workspace).
- Engagement contact: **Consent** · **Refresh facts** (one consolidated self-reportable form) · **Silence** · **Book**.
- Operator house-global: **Acquisition & ads** · **Activation & forward-deploy** (candidate co-core) · **Reference data** · **Configuration libraries** · **Oversight** · **Audit trail** · **Register & evolution** (prototype-time house tooling; **shipped product contains no Register**) · **Founder & agency controls**.
- Operator per-tenancy: **Provision** · **Commercial** · **Firm operations bind** · **Book readiness** · **Firm health** · **Activation state**.
- Operator support: **Keep the firm running**.

**Closure:** Consultant core → contact arrives re-engaged → Book → Consultant takes the meeting. No outcome is subjected to Tower.

How trees for every outcome exist at `docs/register/how/`. This spec does not rewrite them. Index: `04-faces/HOW-LATTICE.md`.

---

## 5. The machine (twelve systems)

UI is not the system. The system must pre-exist the UI. Faceless events are first-class.

### 5.1 What the whole machine must continuously do

While a firm has contacts and hands-free is armed: engage · refresh facts · re-evaluate service eligibility · surface campaign-worthy people toward **meeting booked**.

### 5.2 Systems

1. **Acquisition** — Meta Approach; one-click constraint; legible output; continue-scroll; persist/attribute capture. Must not pull DB auth or escrow into the click budget; must not treat forward-deploy as acquisition; no cold-email V1 Approach.
2. **Provision / forward-deploy** — On seed land, scrape **public** firm facts, instantiate **Om Coda** methodology templates (launch → re-engagement → reactivation), serve no-login prepared workspace. Must not derive the campaign from the private book before authorization.
3. **Commercial / hard-input** — Land DB authorization + escrow; flip `campaign_state` to **running**. Escrow only as peer door. No immigrant settlement funds.
4. **Tenancy & access** — Versioned seed manifests; passwordless OTP; unprovisioned email → generic 200, no code; ALG and OLG land in one session matrix.
5. **Reachability / audit** — One question: can we reach them and start a sequence? Verdicts reachable / partial / unreachable. Sequence-ready gates enrollment. Not scoring, not ROI, not sales ceremony.
6. **Consent / suppression** — Opt-in before deep collection; silenced when not opted in or when opted out. Firm DB auth ≠ end-client consent.
7. **Engagement / sequencing** — Two engines, never conflated:
   - **7a Campaign calendar** — day-ordered content under Engine 2 precedence.
   - **7b Attempt / channel-ownership** — one owning channel at a time; waits nest under the failed owner; forward-only when criteria met; live inbound can override; finishing event closes and can arm the next. Engagement **record** authors nothing.
8. **Fact-refresh** — Nudges collect. Field class: self-reportable → forms; document-dependent → **never** a form (Manage); employer-directed → firm. Any write-back → immediate re-evaluation. Missing fact → signal.
9. **Reference-currency** — Versioned IRCC-shaped tables as **data**. A reference move is a faceless trigger. No code deploy to update facts.
10. **Eligibility re-evaluation** — Private book only. Trigger → Constants → Conditions → Rules → structured output. Pathway pass = **any** pathway assertion, not one favoured pathway. Analysis readout with machine output retained. Every determination (including missing-data) is a signal. Open-box.
11. **Engine 2 (signal / motion)** — Record every detection. Decide outreach separately: reactivation first; nudge only otherwise; one form consolidating all outstanding self-reportables; secondary signals as brief agenda; **one client, one motion, ever**.
12. **Meeting / loop-closer** — `meeting_booked` is the success event. Outstanding self-reportables → pending capture. Write-back → re-evaluate. Brief is **live**, not a snapshot.

### 5.3 Self-feeding ring

```
seed_capture → firm_public_facts → prepared_workspace
  → (database_authorization + escrow_acceptance) → campaign_state=running
      → reachability → sequence_ready → engagement
      → fact_ask / fact_writeback ─┐
      reference_version ───────────┼→ eligibility_evaluation → signal → motion_decision
                                   │                              ↓
                                   └──────── missing_fact_signal ←┘
meeting_booked → pending_capture → fact_writeback → live_brief (recompute)
```

Faceless injectors: `reference_version`, `fact_writeback` / `missing_fact_signal`, time/threshold criteria inside `active_attempt`, inbound override.

### 5.4 Table-first

The machine is **tables + a dumb runtime**. Kinds: **state | rule | sequence**. Anything that should be modifiable is a table. Runtime holds no content. Records that appear in a module come from tables — never hard-coded into the app.

### 5.5 Hard human gates the machine must not automate away

Seed capture · assisted provision · OTP · database authorization · escrow accept · client consent / not silenced · meeting booking · firm refusal of illegal/unethical outreach.

---

## 6. Workspaces and modules (faces)

### 6.1 Consultant firm desk (inhabit)

- **Board** — client list, phase signals (`view`)
- **Contacts** — directory, import confirm (assisted path)
- **Client Data** — profile, Q&A, forms, eligibility facts (`view` + capture)
- **Activity / Journey** — chronology of fired events (`view`; not authorship)
- **Meetings / Live brief** — take the meeting; brief recomputes
- **Halt** — governance initiation
- **Session** — OTP access

Hub inside the firm shell **today** is **existing-wrong-seat** for authorship. Intended authorship is operator Configuration libraries. Product face for operator translation = `/prototype-ant`. Hub is plant/reference, not the app.

### 6.2 Operator house-global

Acquisition & ads · Activation & forward-deploy · Reference data · **Configuration libraries** (Evaluation packs · Automation workflows · Engagement templates) · Oversight · Audit trail · Register & evolution (house tooling only) · Founder & agency controls · Customer support queue · *(capability additions: Sending infrastructure · Conversations/reply-triage)*

### 6.3 Operator per-tenancy

Provision · Commercial · **Firm operations bind** (published-only dropdowns: evaluation · automation · engagement; then Armed / Active) · Book readiness · Firm health · Activation state · Support context

Authorship → publish → bind → arm is the spine that lets the consultant “do nothing” after hard inputs.

---

## 7. Operator authorship grain (Phase Two, without overwriting Seed)

### 7.1 Agents (engagement authorship) — flagship 15:43

The operator defines outreach **sequencing** (sequence **and** the order it is deployed), **per firm or as a default** plus overrides; **escalation between attempts** (retry / attempt rules); and a **goal / goal criteria** that is itself an **escalation point** — to another agent, to a workflow, or it ends. Once met, met. Everything in the middle is modular.

App-facing container (does not replace the flag):

- **Sequence** = blank canvas that can hold multiple **campaigns**.
- **Campaign** = one **objective**. First thing on a campaign is the objective.
- Untemplated objective = binary event (happened or it didn’t), then named. Templated objective populates the campaign.
- Sequence templates (opt-in / re-engagement / reactivation) ≠ objective templates.
- Channels = medium. Channel rules = escalation on that medium. Attempt = cycle of the same sequence. Attempt rules are not at the channel.
- Sequencing (how many channels, order) at campaign level. Content inside the channel node.
- **Override this** reveals channel nodes as wires. Rules nest like CSS (global → sequence → campaign → channel).
- Empty world: no templates until authored.
- Agents enroll **starts the mission now**. Automations enroll waits on an event.

Three layers that must all be specified: **authorship** · **record** · **unattended runtime**. A pretty editor whose Activity pane lies after the operator leaves has failed.

**Parked (not Story must):** goal = completion of an objective; classes of sequence are classes of objective; goals-as-escalation-events between campaigns. Packet 022’s mechanism (objective met as Local event; escalation as **subscription** to `objective_met`; no destination column / no `goal` table required) is **settled as mechanism** and still awaits Story §7 **wording** promotion. This spec records both facts and does not promote.

**Call** appears on the face because the founder asked to see the node. The machine still has **form**. Do not drop form.

### 7.2 Automations (operations brain) — entered from Agents outskirts

On this **event** (schedule or trigger, Global or Local) → perform this **operation** → on this kind of result do X / on that kind do Y. DAG. Smallest workflow = trigger · rule · action. Canvas can chain.

- Forms / data requests are created **here**, not in Agents.
- A data request is already an origin event for Agents (recursive join).
- Automations does **not** author a new agent. Assign existing, or from a template. Select agent = whole sequence.
- Rule = composite of conditions + constants; togglable outcome families; GUI default, named-code escape; industry-modular.
- Rule output may include re-engagement and/or reactivation **signals** and a **required-data listing**. Forms bind to that listing. Deterministic: no AI to decide required fields.
- Two condition grains: inside the rule vs If node on previous result. Do not collapse.
- All objectives are events. Write-back **is** the event. No special return wire.
- Campaign failure is an event. In-app actions include ascribe a tag, run an audit, make a form (shape list — not a complete catalog).
- After a node: **every write that run made**. Next node picks. That is the primitive. Walker 015 is the live walk; this spec does not recut it.

### 7.3 Primitives (what can happen / what we can do)

**Listen:** in-app event (Global or Local) · Schedule · Manual · Webhook (ingress, not an action).

Named events so far: form submitted · campaign failed · opted out · firm created · audit finished · contact file imported · objective met. Not “any row changed.”

**Do:** send people to a goal (Agents) · do a named in-app thing (tag, audit, form, …). Not “write whatever table.”

---

## 8. Practice constraints that modify the lattice

SME Pass2 + Handoff densify how committed work is done. They do not mint seats. Selected load-bearing modifications:

- **Service-eligible** is a firm-offered service family with B-* and a **confidence tier**. Never “will get ITA.”
- Analysis never-sees: province-would-nominate; Tower-as-IRCC-determination; arranged-employment CRS boost unless republished.
- Forms stay self-reportable; documents stay Manage.
- Reference tables pin evaluations; cutoff moves enqueue re-eval and **must not** auto-fire outreach solely on a number move.
- CASL CEM triad on every firm-branded email and SMS. Express consent unchecked-by-default. Cold “email the book for consent” forbidden. Reachable ≠ permission-to-send. Agent first-text is CEM by default.
- Board accountability minimum: send-identity, armed/active, phase/silence, chronology of fired — not vanity.
- **Reactivation-worthy** has a **practice proposal** (`elig-04`: material service-posture change) that would fill a Story silence. It is **not** promoted into Story in this document.

Counsel-gated: money-transmitter boundary. Named `BLOCKED (counsel)`.

---

## 9. Capability additions (not visible on the practice axis)

These homes are **intended**. In-repo How absorb was not started; omitting them would repeat the CTO-sink failure.

| Addition | Why the product cannot work without it |
|---|---|
| **Sending infrastructure** | Core motion is messaging; inbox placement is a specialty (domain auth, warmup, reputation, suppression). |
| **Conversations / reply-triage** | Hands-free attempt engine must read inbound; distinct from the engagement **record**. |
| **Reference ingestion pipeline** | Open-box reference module without a currency pipeline is a shell. |
| **Book identity / dedup** | Reachable book is earned at ingestion, not only at Audit chrome. |
| **Forward-deploy generator** | Prepared Workspace without public-facts hydration cannot prove readiness. |
| **Escrow ledger + verified release** | Commercial surface without ledger cannot hold contingent cost. Release **unit** still a silence. |
| **Event / metrics pipeline** | Oversight and Approach instrumentation are otherwise empty shells. |

Connective tissue: messaging event stream shared by C1, C2, C7.

Human-provisioning residue (DNS, escrow accounts, real CRM OAuth, Meta ad account, counsel) is per-firm cost, not click-budget work, not “CTO handles it.”

---

## 10. Intended vs as-built (honesty, not a reduction of the bet)

Seed §11 and the GO cutover log are honesty about **progress**, not a rewrite of intended product.

**Went real (when secrets + DB are good):** Resend CEM, Twilio SMS, OTP mailer, sending domains, Postgres halt/consent/CRM grant/audit/primary store, Resend webhooks → messaging_events, worker tick, access links.

**Still stand-in / deferred:** Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress.

**Map-only vs Postgres:** some Story nodes (e.g. `state.finishing_event`) live on `/system-map` without being first-class PG tables. Name the split; do not confuse map, migrations, and named silence.

**Product face:** `/prototype-ant`. Hub is not the app.

Claiming production ALG Approach, live escrow, or full always-on eligibility as **shipped** would violate Seed §14.

---

## 11. Never invent

Public-before-contact end-client eligibility as Core · Agent seat · full Client operator console (until KU #4 closes) · Operator as firm Board login · credits/sales-call as peer activation doors · DB auth or escrow inside click budget · forward-deploy as acquisition · skip client opt-in because ALG · cold email V1 Approach · treating sales HTML as Audit · minting tables from pictures · treating plate captions as nodes · overwriting the 15:43 flag with a generated list · filling escrow release · promoting parked expansions into Story.

---

## 12. Completeness of this specification

**Specified and clear (intended product):**

- Why Tower exists, who it is for, ALG vs OLG, agency/open-box shape.
- Finish lines, hard gates, never-invent walls.
- Human outcomes and How DNA for the north star and the operator authorship/bind spine.
- Twelve systems, Engine 2 precedence, two sequencing layers, field-class routing, faceless ring.
- Table-first / data-in-tables.
- Agents flagship + Automations definite middle + primitives (listen/do/handle).
- Practice modifications that Handoff already wrote.
- Capability homes that must be added.
- As-built honesty vs intended.

**Specified but not closed (named, not invented):**

- Escrow release unit; DB-auth shape per stack; SaaS later packaging.
- Reactivation-worthy as Story must (practice proposal exists).
- Attempt window product-lock; SMS Y-reply escalation.
- D-01 / D-02 loop-closer builder representation.
- Client desk depth; multi-consultant roles; CRM bidirectional sync.
- Rule-pack IP/liability; Constants beyond Immigration; geography beyond Canada.
- Full Automations operations / exit catalogs; form-node vs embedded (lean embedded).
- Story wording promotion for goal/objective; Story §3 promotion for billable objectives.
- `BLOCKED (counsel)` transmitter boundary.
- Capability Register absorb into in-repo How/Outcomes files (specified here; not edited in Tower source).
- Build/verify gates `wiring-synced` and `ct-verify-green`.

Under Omcoda method, a specification is **complete** when remaining holes sit in those named classes — not when every KU is filled. Filling them here would be inventing founder or counsel decisions.

**This assignment therefore stops:** the intended Tower product is specified coherently on the Register spine; residuals are explicit; further work is either implementation (forbidden here), Story promotion (founder-only), counsel adjudication, or specialist numeric depth that does not change product identity.

---

## 13. Downstream passes (do not change identity)

**Enrichment** (60 persona Can’ts) names design gaps (“Right now I can’t…”) after Function. **Furnish** (60 items) is supporting UI that does not change Core Function. Neither may smuggle a new World seat or Story must.

**Wiring** traces implementations in event language; trigger-ness is path-relative; a node is a named unit of state one rung above its operating language. Critical interactions are user-originated writes whose targets are read elsewhere. Paper wiring is design-invariant and may run parallel once capability handoff exists. Build cutover (Resend/Twilio/Postgres) is honesty about ports, not a reduction of ALG/escrow/eligibility intent.

**Operator-revisions** remain a grade below Seed/World: domain modularity and open-box are already World-supported; numeric attempt windows and Hub-as-everyday-consultant-chrome are not destinations.

v1 of this file is preserved at `SPEC/TOWER-INTENDED-PRODUCT.v1.md`. This section is the only addition in v2.
