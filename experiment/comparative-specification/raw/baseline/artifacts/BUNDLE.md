# Tower intended-product specification

Concatenated bundle. Source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.
Primary files live in `SPEC/`. This file is the return bundle.


===== 00-HOW-TO-READ.md =====

# Tower — Intended product specification

**Contestant:** 1 — Baseline  
**Source SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**Kind:** Specification of the *intended* product, derived only from the supplied repository (plus origin git history of that repository).  
**Not:** an implementation plan, a seat prompt, or a claim that the running snapshot already is this product.

## How this spec is organized

| File | Contents |
|------|----------|
| `01-IDENTITY.md` | What Tower is, who it is for, bets, what it is not |
| `02-ACTORS-AND-DESKS.md` | Consultant, Operator, Contact; three desks; Hub/Register status |
| `03-CORE-LOOP-AND-SYSTEMS.md` | Application loop and the twelve systems |
| `04-CONSULTANT-DESK.md` | Firm-desk modules and consultant outcomes |
| `05-OPERATOR-DESK.md` | House-global, per-tenancy, support |
| `06-CONTACT-EXPERIENCE.md` | Firm-branded engagement, workspace seat |
| `07-AGENTS.md` | Outreach authorship |
| `08-AUTOMATIONS.md` | Operations brain |
| `09-ELIGIBILITY-AND-MOTION.md` | Rules, reference, Engine 2, meeting loop-closer |
| `10-DATA-AND-RUNTIME.md` | Tables, walker, send, auth |
| `11-CONSTRAINTS.md` | Must-nots, hard human gates, data-in-tables |
| `12-GLOSSARY.md` | Terms used consistently |
| `13-UNCERTAINTY.md` | Silences, conflicts, not-invented decisions |

Uncertainties are collected in `13-UNCERTAINTY.md` and marked inline as **UNRESOLVED**.

## Authority rules used here

1. **Founder wording on flags is not restated into a generated list.** The Agents flagship is quoted.
2. **Personas/Outcomes beat Seed’s Hub-in-firm seating.** Authorship lives on the Operator. The consultant inhabits the book and meetings.
3. **Phase Two Agents/Automations face beats Seed §5.6’s Hub peer-module sketch** for how those two modules work on the product face — while Seed’s eligibility/Engine 2 laws still stand.
4. **Story silences stay silent.** Named holes are not filled with guesses.
5. **Capability SME paper** (`docs/sme/capability/`) is not absorbed product law. Sending infrastructure exists as a module name on the Operator desk; the 158-item capability roster is not treated as specified product.
6. **Hub is not the app.** Product face = `/prototype-ant`. Hub is an advanced plant / reference for Automations Rules grain.
7. **Register methodology tooling is house-side.** The shipped firm product does not contain Register. A house-global **Register & evolution** module is named for prototype-time house work.

## Honesty about as-built

This snapshot contains a dense prototype: Ant desks, Postgres machine tables, a workflow walker, Resend/Twilio ports, OTP auth. Much of that implements fragments of this spec. The spec describes the *intended* product, not a claim of production completeness. Where live code contradicts later law, the contradiction is named.


===== 01-IDENTITY.md =====

# 1. Product identity

## 1.1 One-line value

Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

## 1.2 What Tower is

Tower is a **proactive eligibility engine wrapped in engagement** for immigration consultancies, operated by **Om Coda as an agency product** across firms — not a self-serve tool each firm configures alone.

While a firm has contacts and hands-free operation is armed, Tower must continuously:

1. Keep engaging dormant and active contacts.
2. Keep immigration-relevant facts fresh via firm→client touchpoints.
3. Re-evaluate **service eligibility** as IRCC-shaped reference and client facts move.
4. Surface campaign-worthy people so consultants book meetings without rechecking every file.

**Core outcome:** detect service-eligible candidates and initiate the right campaign motion (launch / nudge / reactivation) whose success event is **meeting booked**.

**World sentence (compressed):** Tower acquires a stranger consultant (one-tap Meta Approach: name + website + channel inside a click budget, or an assisted door into the same app), activates by forward-deploying a no-login prepared campaign under their firm identity until they authorize database access and accept escrow, then runs the firm desk loop over the private book toward booked meetings — without inventing public-before-contact detection of end-client eligibility.

## 1.3 Buyer and market

- **Buyer:** Immigration consultancies / practices that hold or can obtain contact lists (past clients, leads, CRM exports, spreadsheets) and sell immigration services.
- **Primary acquired persona:** Consultant / firm operator at the desk.
- **Geography (V1 working assumption):** Canadian immigration pathways (Express Entry / CEC / FSW / FST / PNP, CRS draws, ECA, EE profile freshness, category draws). Other countries are not forbidden later; V1 truth and matrix are Canada-shaped.
- **Who holds the list:** The **firm**. End-client eligibility is private — computed from firm-held + engagement-collected facts against house-held / configured rules.

## 1.4 What Tower is not

- A reactive CRM (“what do I do when someone emails?”).
- A public finder / scrape-first acquisition of **end-clients**.
- A money transmitter holding immigrant settlement funds. End-clients pay Tower nothing.
- A sales “Database Opportunity Assessment” ceremony dressed as Audit.
- An Agent desk / Agent seat. Agent presentation is a capability, not a persona.
- A full end-client operator console in V1. Contacts receive firm-branded touchpoints (and, later in the snapshot, a no-login workspace). **UNRESOLVED:** how deep the contact desk should go (touchpoint-only vs authenticated portal) was a Seed silence; a contact workspace later appeared without a Seed rewrite.
- Self-serve onboarding as the growth bet. The stranger filling long forms is not the Tower bet.

## 1.5 Adjacent incumbents (insufficient)

| Class | Why not Tower |
|-------|----------------|
| Classic CRM | Reactive inbox / pipeline |
| Marketing automation | Blasts without immigration re-evaluation |
| Spreadsheet + memory | No always-on re-crunch, no sequence system |
| Sales HTML “opportunity assessment” | Marketing collateral, not in-app Audit |

## 1.6 Bets (from Seed; still the intended commercial posture)

**Product bet.** Firms will pay for always-on engagement + eligibility re-crunch over their book.

**Growth bet (ALG).** Consultancies convert into *running* clients if one tap in a Meta feed makes a prepared campaign workspace legible, cheap public seed inputs provision that workspace, and an agent earns the hard inputs (database authorization + escrow) before the campaign runs. Assisted / operator-led entry (OLG) remains a real second door into the **same** application.

**Contingent-cost bet.** Prefer buyer cost zero or held until outcome terms are met. At the activation payment moment the presented door is **escrow**, not prepaid credits and not a sales-call as a peer door. Ongoing SaaS packaging later **must not** replace escrow as a peer door at that moment. **UNRESOLVED:** escrow *release* trigger / outcome definition.

**Agent bet.** Agent presentation may ask, explain, and route. It must **not** scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money. Those belong to Automations / Wiring.

**Vertical modularity bet.** The same product shape (always-on eligibility + engagement over a private book) should serve another vertical by swapping industry criteria packs, not by forking the graph.

## 1.7 Company shape (why an Operator desk exists)

Om Coda runs Tower across firms as an agency. Therefore evaluation rules, analysis, operational logic, data criteria, and reference-data upkeep belong to an **operator/house configuration-and-oversight layer** that must stay inspectable and changeable **without a code deploy** (open box). Firms inhabit the book and the meetings; they do **not** author the packs that run the product.

## 1.8 Facet order (immutable)

**Acquisition → Activation → Application → Evolution.**

| Facet | Finish line |
|-------|-------------|
| Acquisition | Name + website + one channel (phone or email) inside the click budget |
| Activation | Database authorization + escrow acceptance; campaign can **run** |
| Application | Detect → engage → collect → re-detect toward meeting booked |
| Evolution | Product change from running-firm feedback. Not a client lifecycle phase. |

Forward-deploy belongs to Activation, even when it looks like marketing. The click budget belongs to Acquisition only. Application must not be redesigned to make the growth bet cheaper.

## 1.9 Two sides of eligibility

1. **Law / public-reference change** — versioned IRCC-shaped tables the house maintains as data.
2. **Life change on the contact** — facts only the person or the firm file can know.

Storing the book and never reaching out serves only (1). (2) requires asking and telling — the engagement loop — which is why consent / PII posture is necessary.


===== 02-ACTORS-AND-DESKS.md =====

# 2. Actors and desks

## 2.1 Personas vs stakeholders

**One acquired persona:** Consultant.

Everyone else fails the acquired-seat test:

| Party | Ruling |
|-------|--------|
| Firm | Tenancy container. Not a persona. |
| Engagement contact | Referenced participant. Delivery-only. Not a branded Tower customer seat. |
| Om Coda house | Served as the Operator layer. Not a customer persona. |
| Ads supply / reference upkeep / Register tooling | House functions, not personas. |
| Agent presentation | Capability across Approach, prepared workspace, and routing. Not a seat. |

**Operator** is one house/agency human working many surfaces — not many personas.

**UNRESOLVED (Seed/World silence):** multi-consultant roles and permissions inside a firm. Not minted.

## 2.2 Three desks (product face)

The intended product face is **`/prototype-ant`**.

| Desk | Who | Job |
|------|-----|-----|
| **Consultant** | Firm operator | Hand over the book, authorize license, inhabit Board/Contacts/Meetings, halt outreach, take meetings with a live brief |
| **Operator** | Om Coda house | Author packs, bind them per firm, acquire/activate firms, oversee health, support |
| **Contact** | Engagement contact | Firm-branded consent, facts, booking, silence; no-login workspace at `/c/<token>` |

**Production seats vs modeling chrome.** A provisioned consultant lands on the consultant desk only. Operator is a house admission, not a firm Board persona. Contact enters via `/c/<token>` with no desk switcher. Shell chrome **Consultant ▾ · Operator · Contact ▾** is modeling / platform-admin **view-as** (SHELL-CHROME packet), not three logins for every user.

Hub (`/hub` in older plant) is **not** the app. It is an advanced plant for Automations/Rules. Seed’s “Hub lives in the firm shell” is **existing-wrong-seat** relative to Personas/Outcomes.

Register (`/register`) is **house-side methodology tooling**. The shipped firm product contains no Register. House-global **Register & evolution** is prototype-time gap writing, not a consultant module.

## 2.3 Consultant outcomes

**Core (sole north-star)**

> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.

Verbs: **hand over · authorize · receive**. In the application layer under ALG the consultant initiates nothing and configures nothing. Opt-in / nudge / reactivation / refresh / re-evaluate are **machinery**, not consultant outcomes.

**Governance (secondary)**

> As Consultant, I can keep everything running under my license and halt anything I won't stand behind — so that the book is worked lawfully in my name.

**Access (secondary)**

> As Consultant, I can sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me.

## 2.4 Engagement-contact outcomes (loop closers)

- **Consent:** receive a firm-branded consent request; agree or ignore before deeper collection.
- **Refresh facts:** answer **one** consolidated form for outstanding self-reportable facts; reply when the situation changes.
- **Silence:** opt out at any point.
- **Book:** book a meeting when invited; arrive so the firm already knows current facts (live brief).

Contacts pay Om Coda nothing.

## 2.5 Operator outcomes (house-global)

| Surface | Outcome (so that) |
|---------|-------------------|
| Acquisition & ads | Captured firm can be staged for activation |
| Activation & forward-deploy | Consultant reaches a running desk (candidate co-core) |
| Reference data | Evaluation packs score on today’s rules, no code deploy |
| Configuration libraries | Firm operations are bound from house-authored packs |
| Oversight | Failing tenancy caught before lost meetings |
| Audit trail | Support and founder can account for every change |
| Register & evolution | Next authored operations reach the libraries (house tooling) |
| Founder & agency controls | Many tenancies overseen without leaking controls into a firm workspace |
| Customer support | Tickets answered with firm context |

## 2.6 Operator outcomes (per-tenancy)

| Surface | Outcome |
|---------|---------|
| Provision | Assisted door into the same desk |
| Commercial | Escrow / contingent terms held so the consultant can accept and reach running |
| Firm operations bind | House packs run under the firm identity |
| Book readiness | Only reachable contacts enter engagement |
| Firm health | Support can restore a tenancy |
| Activation state | Stalled firm moved to running |

## 2.7 Authorship vs inhabit

**House authors. Tenancy binds. Consultant inhabits.**

Configuration libraries (evaluation packs, automation workflows, engagement templates) are authored house-globally and **published**. Firm operations bind selects **published** versions under a firm identity and sets **Armed** (ready, nothing sending) vs **Active** (executing). The consultant Board shows phase chips and records; it does not contain pack editors.

## 2.8 Admission

- Firms/users enter via **assisted Provision** or **ALG seed → forward-deploy → hard inputs**. Both land in **one** application / session matrix.
- Consultant access: passwordless **OTP** (`tower_session` HttpOnly cookie) or **magic access link** `/a/<token>` (single-use, TTL). Unprovisioned emails: generic success, **no code** (anti-enumeration).
- Operator is **not** a firm Board login persona.
- Do not mint an Agent seat in admission.
- Register unlock (`REGISTER_PASSWORD`) is internal Om Coda tooling, not firm product chrome.

**UNRESOLVED:** production onboarding beyond manifests / Provision UI; multi-user roles.


===== 03-CORE-LOOP-AND-SYSTEMS.md =====

# 3. Core loop and twelve systems

## 3.1 Application loop

```
Contacts / import
  → Audit (reachability / sequence-start gate)
  → Engagement sequence (opt-in → re-engagement nudges → reactivation)
  → Collect & refresh facts via touchpoints
  → Eligibility re-evaluation (rules + versioned reference)
  → Engine 2 chooses one motion (reactivation | nudge | none)
  → Meeting booked (loop-closer)
  → (repeat as facts and rules move)
```

Causal authorship ring (Phase Two Type A):

**Book in → firm-bound agent (rules / sequence / content) ↔ automations (when / motion / structured output) → enroll / attempt → what goes out → Activity / Board → meeting booked.**

Dual entry into an agent:

| Entry | Meaning |
|-------|---------|
| From Automations | An event/graph action hands contacts into a sequence |
| From Agents itself | Operator enrolls / launches the mission **now** (Contacts on that sequence) |

Agents is both a **library** the machine can call and a **place to start engagement**. Automations does **not** start a mission right now.

## 3.2 The twelve systems

Each is an initiation engine. They must stay non-conflatable.

### 1. Acquisition (seed-capture)

Capture firm/consultant **name**, **website**, and **one channel** (phone or email) from a Meta Approach in V1 (LinkedIn deferred). One click as design constraint. Make one-tap output **legible**, never persuade. After capture, continue the stranger’s scroll — no thank-you dashboard. Instrument continue-scroll without tap as a first-class non-action (*did not understand* vs *understood and did not tap*). Persist capture as fulfillment, not agent presentation.

Must not pull database authorization or escrow into the click budget. Must not treat forward-deploy as acquisition. Must not use cold email as V1 Approach. Engagement contacts are never acquired via Approach.

### 2. Provision / forward-deploy

On seed land: scrape **public** firm facts; instantiate Om Coda methodology templates (launch → re-engagement → reactivation); serve a **no-login prepared workspace** under firm identity as branding, not as a claim Tower already holds their clients. Must not derive the campaign from the private book before authorization.

### 3. Commercial / hard-input

Land **database authorization** and **escrow acceptance**; flip campaign to **running**. Escrow is firm↔Om Coda. Tower holds no immigrant funds. Credits / sales-call are not peer doors at this moment.

**UNRESOLVED:** escrow release definition; concrete shape of “database authorization” per practice stack.

Direction (not Story-promoted, not a build order): objectives become the billable unit; money held while pursuing or exhausted; only firm withdrawal **nullifies** the objective (see §9 / packet 023).

### 4. Tenancy & access

Provision firms/users; OTP sessions; same desk either door. See §2.8.

### 5. Reachability / audit

One question: can we reach this contact, and can we start a sequence? Checks: email valid, phone valid, ≥1 channel matching the **intended** sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present; external validation where needed. Verdicts: **reachable / partial / unreachable**. Passed contacts are **sequence-ready**.

Must not: pathway/CRS scoring, ROI forecasts, minimum contact-count gates, sales PASS/FAIL, or marketing DOA HTML.

**UNRESOLVED:** import fully mutating the living list; CRM bidirectional sync.

### 6. Consent / suppression

Opt-in phase: firm→client consent and first channel open. Contacts are sequenced / silenced / unsequenced; **silenced when not opted in** and when opted out. Firm DB authorization does **not** skip end-client consent. Deep collection gated on opt-in.

**UNRESOLVED:** CASL/SMS consent regimes by geography (firm→client and first agent→consultant text).

### 7. Engagement / sequencing (two engines — never conflated)

Shared phases: **Opt-in → Re-engagement (nudges) → Reactivation**. Reactivation may be **armed** (ghost, nothing sending) or **active**. Sequences are ordered channel + copy. Composing = configuration; sending = automation/Wiring. The **engagement record** is chronology only — it authors nothing.

**7a Campaign calendar:** day-ordered content for a phase, under Engine 2 precedence. Does not decide runtime channel ownership.

**7b Attempt / channel-ownership engine:** one owning channel at a time; waits/attempts nest under the owner that failed; escalate forward when criteria met; live inbound can override an in-flight attempt; finishing event closes the sequence and can arm the next.

Operator-revisions (denser than Seed; **not Story law until promoted**): Text delivered not opened in 30 min → Email; Email opened, link not clicked in 24 h → next attempt; Form started not submitted in 24 h → Text; re-entries do not reset the clock; attempts are local retries under the failed owner; live form visit can open the next step; form submitted closes the nudge.

**Channel ladder conflict — UNRESOLVED as a founder lock:** Story/Seed/prototype chart use **Text → Email → Form**. Agents face later shows **text → email → call** (ElevenLabs) and says do not silently drop form from the machine. SQL `campaign_channel.token` CHECK is `'text'|'email'|'call'`. Specify both until Story is recut: **form remains a data-collection medium**; **call is on the Agents face**; which ladder is default sequencing is not closed.

### 8. Fact-refresh

Nudges ask for or infer eligibility-affecting facts. Field classes:

| Class | Route |
|-------|--------|
| Self-reportable | Forms / pre-meeting capture |
| Document-dependent | **Never** a form; tracked work items |
| Employer-directed | Ask the **firm**, not the client |

Any write-back initiates immediate re-evaluation. A missing fact is a signal.

### 9. Reference-currency

Versioned reference tables as data; a reference move is a **faceless** trigger that re-evaluates affected contacts. No code deploy to update law-side facts.

### 10. Eligibility re-evaluation

Private to the firm book. Pathway pass = **any** pathway assertion (CEC or FSW or FST or PNP-*), not one favoured pathway. Produce Analysis (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained. Every determination, including missing-data, is a signal. Open-box: inspectable/changeable without deploy.

Must not cold-detect strangers from public databases as Core Function.

### 11. Signal / motion (Engine 2)

Record every detection. Decide outreach separately:

1. **Reactivation first**, whenever anything is reactivation-worthy.
2. **Nudge only** when nothing is.
3. A nudge consolidates **every** outstanding self-reportable need into **one** form.
4. When reactivation fires, secondary signals attach as **agenda** on the pre-meeting brief — never parallel outreach.
5. **One client, one motion, ever.**

**UNRESOLVED:** what makes a signal **reactivation-worthy**; D-01 / D-02 builder placement.

### 12. Meeting / loop-closer

**Meeting booked** is the success event. Outstanding self-reportable fields open a capture form pending the meeting. Write-back → immediate re-evaluation. Pre-meeting brief is **live**, not a snapshot.

**UNRESOLVED D-01:** pre-meeting capture as tail of reactivation vs standalone `meeting_booked` sequence.  
**UNRESOLVED D-02:** in-meeting fallback surface for unresolved form gaps.

## 3.3 Cross-system trigger web

| From | Event | To |
|------|-------|-----|
| 1 Acquisition | seed inputs land | 2 Provision |
| 3 Commercial | running | Application 5–12 open |
| 5 Audit | sequence-ready | 7 enrollment |
| 7b | finishing event | 7 arms next |
| 7 | nudge fires | 8 fact-ask |
| 8 | write-back | 10 Eligibility |
| 9 | reference move | 10 Eligibility |
| 10 | every determination | 11 Engine 2 |
| 11 | chosen motion | 7 Engagement |
| 12 | meeting_booked capture write-back | 10 Eligibility |

## 3.4 Hard human gates (must not be automated away)

- Seed capture (stranger action)
- Firm/user provision (OLG) and OTP verify
- Database authorization
- Escrow accept
- Client opt-in / not silenced
- Meeting booking (human commitment)
- Firm responsibility to refuse illegal/unethical outreach


===== 04-CONSULTANT-DESK.md =====

# 4. Consultant desk

Product face: `/prototype-ant` → Consultant. Persistent left nav. Modules revealed up front.

## 4.1 Modules

| Module | Job |
|--------|-----|
| **Board** | Client list with **Phase signal** chips (opt-in / re-engagement / reactivation / silenced). Entry to **Client workspace**. Inhabit only — not pack authorship. |
| **Contacts** | Private book directory; **Imports**; **Confirm book for Tower** on an assisted import batch (same handover as Authorize book). |
| **Meetings** | Booked rows; **Live brief** (recomputed); copy brief / starts-in chrome as named. |
| **Prepared Workspace** | Activation artifact (shared / not everyday nav chrome in the ALG story). **Authorize book** and **Accept terms**. |
| **Login** | Passwordless OTP: email → send code → verify. Fallback when magic link is not used. |

Client workspace (from a Board row) holds **Client Brief** / Information, **History**, and **Activity** (engagement record / chart). Activity is a **tree of outreach** — chronology of what already fired. It does **not** connect left to the Automations trigger that assigned the agent. Lineage is a different, queryable thing (Automations law 29).

## 4.2 Activation on this desk

On Prepared Workspace:

1. **Authorize book** — Connect CRM / grant database access, or Upload / confirm assisted import, then **Authorize**. Writes book-handover read by Book readiness and Activation state.
2. **Accept terms** — License acknowledgement (licensee identity) + Escrow terms panel + acknowledgment + **Accept**. Writes license+escrow acceptance read by Commercial and Activation state.

Those two commits are the hard inputs. The consultant does not open Configuration libraries to complete activation.

Assisted path: Contacts → Imports → batch → **Confirm book for Tower**.

## 4.3 Governance: Halt outreach

From Board or Client workspace: **Halt outreach**. Scope: **This contact** or **Firm book**. Optional reason. **Confirm halt** writes halt/silence that runners and send gates honor. Halt is refusal under the consultant’s license — not editing a house template.

**Lift halt** is named in surface vocab.

## 4.4 What the consultant sees of engagement

- Phase chips: what is in motion (armed vs active as inhabited result).
- Engagement record: events that already fired (channels, attempts, escalations). Record only.
- Live brief on a meeting: current analysis, outstanding facts, secondary signals as agenda when reactivation fired.
- Board may show today’s meetings, search, newest-first, export chronology as named chrome.

The consultant does **not** author sequences, rules, or automations on this desk.

## 4.5 Client Data (inside Client workspace)

Profile, Q&A, forms, eligibility-related facts. Facts come from the book and from touchpoint write-backs. CRS/pathway charts exist in the older prototype story; intended data source is tables (`fact_writebacks`, eligibility results), not painted scenery.

**Honesty law:** records that show in a module come from tables. Empty book = empty module. Do not hard-code demo people into the SPA.

## 4.6 Access paths

- OTP login → Board for that session’s firm.
- Magic link `/a/<token>` → redeem → session → `/prototype-ant`.
- Session firm **is** the provisioned firm (one UUID across auth and machine). A freshly provisioned firm lands on an empty book until import/connect.

**UNRESOLVED:** Cedar-class vs Apex-class density is a prototype honesty issue, not a product type. Multi-consultant sharing of one firm desk is unnamed.


===== 05-OPERATOR-DESK.md =====

# 5. Operator desk

Product face: `/prototype-ant` → Operator. Nav groups: **House-global**, **Per-tenancy**, **Support**.

## 5.1 House-global modules

### Acquisition & ads

Run Approach campaigns: feed creative → ad → Capture strip (name, website, channel) inside the click budget. Instrumentation: understood-but-didn’t-tap vs didn’t-understand vs continue-scroll. Meta supply is **external intent** — Tower configures what to send; no Meta Ads Manager cloned inside Tower. **Stand-in / deferred in as-built:** Meta go-live.

### Activation & forward-deploy

In-flight activations. Forward-deploy from house templates + public facts. Hydrate / staging status. Readiness walkthrough. Hard-input status. Serves Prepared Workspace. Agent may walk the workspace; automation executes provision.

### Reference data

Versioned immigration tables (categories, trades, cutoffs, provincial identifiers, etc.). Import criteria. **Publish version**. A published move is a faceless eligibility trigger. No code deploy.

### Configuration libraries

Three catalogs. **No firm picker on this module.** Publish does not bind a firm.

| Catalog | Editor | Bind target |
|---------|--------|-------------|
| **Evaluation packs** | Open-box rules / analysis against reference | Firm operations bind → Evaluation pack |
| **Automation workflows** | Workflow canvas (see §8) | Bind → Automation pack |
| **Engagement templates** | Agents sequence canvas (see §7) | Bind → Engagement template |

Drafts do not appear in Bind dropdowns. Status: Draft | Published + version id.

### Sending infrastructure

House-managed branded sending subdomain per firm (allocate, authenticate on house zone, warmup, CEM envelope preview). Custom-domain attach is a **deferred upgrade**. DNS auth chips must not flip green automatically on allocate. SME C1 paper is deeper than this module’s named job; extra deliverability mechanics remain paper unless absorbed.

### Oversight

Cross-firm sequence / engagement health. Drill into a tenancy. Capability SME C7 (instrumentation pipeline) is paper; this module is the named home for fleet health, not a completed analytics product.

### Audit trail

Who changed which operation, when, on which firm. Filter by firm / actor.

### Register & evolution

House-only gap writing → regenerate methodology. Not shipped to firms.

### Founder & agency controls

Agency policy, bounds (what may bind / send), **kill-switch** fleet-wide or per tenancy. Never appear in Consultant nav.

## 5.2 Per-tenancy modules

### Provision

**New firm:** firm name, website, primary user email, role seed → **Provision**. Hands the consultant Login OTP and/or access invite. Intentional mint — not self-serve. Same desk as ALG.

### Commercial

Escrow / contingent terms for this firm: cost, cap, release predicate, measurement window. Status through hold / window / release / return / dispute. Terms version is what Accept terms presents. **Escrow fulfillment is deferred as a live port**; the module and Story still require the door.

### Firm operations bind

Firm-bind index → firm detail → **Bind packs** (three published versions) → **Bind**. Then **Armed / Active**. Disabled until three versions bound. Audit trail logs the change. Consultant Board shows inhabited motion only.

### Book readiness

**Audits** for this firm’s import/book batch. Checks as §3 system 5. **Start Audit run**. Verdict list: reachable / partial / unreachable. Only sequence-ready contacts enter engagement. Enrollment after verdict is machinery, not an operator enroll control on this screen (Agents Contacts / Automations are the enroll doors).

Automations may **run an audit** as an in-app action (same audit the desk runs).

### Firm health

Sequence and engagement health scoped to one tenancy (active attempts, engagement records).

### Activation state

This firm’s forward-deploy / hard-input progress toward running (authorize-book row, escrow-held, running gates).

## 5.3 Support

**Customer support:** house-global ticket queue + per-tenancy support context (bind, health, commercial, recent house actions).

## 5.4 Wait / approval notes

Later packets introduce **Wait occupancy**: when a workflow parks for approval or a duration, a note overlay appears for consultant or operator approver with **Approve now** / **Approve later**. Palette still lists a Wait node; a later cut (packet 028 on this SHA’s history) recut Wait kind vs overlay. **UNRESOLVED:** whether Wait remains a first-class canvas node, an overlay-only occupancy, or both. Occupancy table exists (`wait_occupancy`).


===== 06-CONTACT-EXPERIENCE.md =====

# 6. Engagement contact experience

Not a persona. Firm-branded. Free of payment to Om Coda.

## 6.1 Channel touchpoints (How trees)

| Surface | Behavior |
|---------|----------|
| **Opt-in message** | Firm-branded email/SMS. Consent link / Review request. Branding is the firm’s, not Om Coda’s. |
| **Consent request** | **Agree** (unlocks later nudges / deeper collection) or **Ignore** (no deeper). Either is valid. |
| **Nudge message / Nudge form** | One consolidated form of outstanding **self-reportable** fields. Submit writes facts → re-evaluate. Document-dependent fields never appear. |
| **Update facts** | Later life-change: thread reply or update link; same write-back path. |
| **Meeting invitation / Booking** | Book a time → slot picker → **Confirm booking**. Writes `meeting_booked`. |
| **Loop-closer form** | If outstanding self-reportable fields remain at booking, capture pending the meeting. |
| **Silence / Opt out** | On any touchpoint footer, Consent request, or List-Unsubscribe. Stops automatic outreach. Runners, send gates, and Book readiness honor it. |

## 6.2 Contact workspace seat (later packet; present on this SHA)

No-login, firm-branded workspace. Token family **`/c/<token>`**. Do not ship a 10-item flipper. Nav:

| Tab | Job |
|-----|-----|
| **Now** | Current ask: consent (Agree/Ignore), form (self-reportable fields + Submit), or meeting (slot + Confirm booking) |
| **History** | Asks that prompted outreach; outstanding vs done; open outstanding in Now |
| **Upload** | Contact puts information into the firm (“any type, or a kind”) |

Persistent **Opt out**. Opting out of the workspace can refuse further workspace use (`workspace_opted_out`).

This densifies Seed’s “touchpoints only” silence without a founder close on a full authenticated portal. **UNRESOLVED:** whether this workspace is the V1 contact desk, or still “delivery-only touchpoints” with workspace as an access-link shell.

## 6.3 Access

Magic/direct access links for consultants are `/a/<token>`. Contact seat tokens are `/c/<token>` (`contact_access_links`). Links can be invalidated on silence / consume / opt-out.

## 6.4 What the contact never sees

- Om Coda operator chrome
- Configuration libraries
- Eligibility matrix internals (they may see firm-facing forms and booking, not the open-box rule editor)
- Other contacts in the firm book


===== 07-AGENTS.md =====

# 7. Agents (engagement authorship)

**Author seat:** Operator (Configuration libraries → Engagement templates). Firm / default / overrides are **scope of application**, not the nature of the module.

## 7.1 Flagship (founder wording, 2026-08-15 15:43 UTC)

Agents is the place where the **operator** defines:

- **Outreach sequencing** — not only the sequence itself, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, and other kinds of **overrides**.
- **Escalations** between nodes — or better: escalation between **attempts**; **retry rules**; **attempt rules**.
- A **goal / goal criteria**. The goal is itself an **escalation point**: to **other agents**, to **other workflows**, or **it ends there**. Once it is met, it is met. That is the **endpoint**.
- Everything in the middle of that is **modular**.

Do **not** put **triggers** inside this flagship. Triggers stay on Automations (and the dual-entry perimeter). The 14:58 numbered list is superseded.

## 7.2 Package shape

An **agent is a sequence**, not a campaign. A sequence is a **blank container** that can hold **multiple campaigns (goals)**.

```
SEQUENCE TEMPLATE  (blank canvas)
  sequence templates (empty world until authored): opt-in · re-engagement · reactivation
│
├─ Campaign  = one OBJECTIVE
│    first thing: the objective
│      template → populates the campaign
│      from scratch → binary event (yes/no), then name it
│    sequencing (how many channels, order)     ← campaign level
│    rules fall back: campaign override → sequence Settings → Agents Settings
│    per-campaign attempt rules live ON this campaign
│    [ Override this ]  → reveals wired CHANNEL nodes
│         └─ Channel node  (medium)
│              [ Override content ] inside the node → composer
│              attempt-N copy = variation on the same node
│              channel rules = escalation on that medium (hang off when opened)
│              attempt rules do NOT live here
│
├─ Contacts  = who is enrolled on THIS sequence
│    Add contact in the sequence HEADER (same row as Save / Launch)
│    scope: Every firm (default) · Select from
│    starts the mission now (not an event, not Publish)
│
└─ next Campaign  when previous objective is met
     distance may show a tick; it is NOT a qualify node
```

**Two objectives → two campaigns.** There is no “first objective” object. The distance between campaigns is not a qualify node. Teaching copy on plates is not spec.

## 7.3 Objective ≠ sequence

| Layer | What it is | Examples |
|-------|------------|----------|
| Sequence template | Full canvas class | Opt-in, re-engagement, reactivation |
| Objective / campaign | One yes/no the enrolled are campaigned to do | From scratch: click this link · book this calendar · submit this form. Then name it. |
| Objective template | Populates one campaign | Teaching names: Launch window, Launch day (operator may rename). Those names are **not** frozen system types. |

You do not put “opt-in” in the objective picker. Opt-in is a sequence.

Untemplated objective kinds stood up in SQL: **`click` | `form` | `meeting`** with completion tables `messaging_events` | `fact_writebacks` | `meeting_booked`. Webhook / table-lookup completion is named as later, not minted.

**Class completions (founder expansion, Story not fully promoted):**

| Sequence class | Objective of the class | Completion |
|----------------|------------------------|------------|
| Opt-in | Consent / first channel open | Sign-up (waitlist is a mini-goal / first signal) |
| Re-engagement | Data request | Form / facts in |
| Reactivation | Meeting request | Meeting booked |

A goal is **completion of an objective**. Escalation levels (do not collapse): (1) attempt sequencing inside a node (2) mini-goals (3) sequence/class completion (4) **between campaigns**, goal as escalation event → other agent · other workflow · or end.

Mechanism (packet 022): **objective met is a Local event**. The completion write **is** the event. Outbound stamps the objective; inbound matches that axis. Escalation is a **subscription** to `objective_met` — no destination column required. Do not mint a separate `goal` table for the 15:43 hole.

## 7.4 Defaults and overrides (CSS nesting)

There is a **default on every rule**. Failure rules are **part of escalation**, not a separate “actions on goals” family.

| Rule family | Meaning | Where it lives |
|-------------|---------|----------------|
| Channel rules | Escalation on that medium (not opened, not clicked, …) | Open channel node. Fallback: campaign → sequence Settings → Agents Settings |
| Attempt rules | Number of attempts; cycle of the same sequence; distance after failed last node; optional nth-attempt exception | Per campaign: on the campaign. Per sequence: Sequence Settings. Global: Agents Settings. Never middle of canvas. Never on the channel. |
| Content | What goes out | Override content **inside** the channel node. Sequence/global via Settings. Attempt = variation. |
| Sequencing | How many channels, order | Campaign |
| Campaign objective | The one yes/no | The campaign. When met, may string the next |

`firm_sequence_binding` + `rule_*.firm_id` NULL = firm vs platform default.

**Override this** is the first toggle on a campaign. It materializes child channel nodes as wires. Campaign-level toggles stay on the campaign.

## 7.5 Settings surfaces

| Surface | Grain |
|---------|--------|
| Agents Settings | Global defaults |
| Sequence Settings | This sequence; inherit unless overridden |

Both may hold attempt rules, channel rules, content defaults, default channel order.

## 7.6 Enroll vs Launch vs Automations

- **Add contact / Contacts** on the sequence: start the mission **now**. Scope: Every firm (default) or Select from (list opens all selected; deselect to pick). Same look as Automations A19.
- Automations enroll is the **other door** (on an event). Automations does **not** author a new agent; it **assigns** an existing sequence or **creates from a template**.
- Canvas chrome: **Save · Run · Launch** (later packets). Test data lives **on the trigger** (Automations). Launch arms; it does not also start a manual run as a second machine. **UNRESOLVED vs older map:** v2 backlog still records “Activate vs Launch” cosmetic mapping.

## 7.7 What Agents is not

- Not a form builder. Data-request forms are created in Automations.
- Not Automations triggers on this canvas.
- Not the engagement chart as lineage query.
- Not flattening a campaign into “four emails in a Timeline.”
- Not treating teaching captions as nodes.

## 7.8 House methodology content (not frozen types)

`guidelines/Reactivation.md` (first-pass opt-in launch architecture) is **content of a house-authored sequence template**, not a fourth sequence class and not campaign type keys. It specifies a 5–7 day launch window: Day 1 SMS primer + announcement email, micro-yes / waitlist, nurture, then launch-day sign-up. Success metrics there (SMS Y-reply, waitlist conversion, slot booking, …) are **mini-goals / cohort signals**, not the campaign objective object. Forward-deploy instantiates Om Coda’s methodology under the firm’s identity; the operator may override via the canvas/Settings rules in this chapter. Do not freeze “Launch window” / “Launch day” as system types — Agents FACE already forbids that.

## 7.9 Open (do not fill)

- Additional unnamed objectives inside the teaching opt-in sequence besides launch window / launch day.
- Word for untemplated objective (“event” vs another word).
- Whether mixed objective types in one sequence are practical or only technical.
- Call vs form on the machine ladder (see §3.2 / 7b).
- Filter catalog on Add contact beyond Every firm / Select from.


===== 08-AUTOMATIONS.md =====

# 8. Automations (operations brain)

Entered from Agents outskirts. Author seat: Operator (Configuration libraries → Automation workflows).

## 8.1 What Automations is

Automations is the **brain / operations**: **on this event** (schedule or trigger) → **perform this operation** (definite middle) → **on this kind of result do X / on that kind do Y**. Results are binary (or the binaries defined). More DAG-like than Agents’ sequence canvas.

**Smallest legal workflow:** trigger · rule · action.

**Canvas is blank and may chain:** event → action → If on that output → another action. Teaching walk: firm provisioned → audit contacts → if X → agents.

Agents sends people to accomplish a goal. Automations performs operations, creates data-request forms, changes things **inside the system**, and can assign an agent.

## 8.2 Two kinds of listen (triggers)

| Kind | What it is |
|------|------------|
| Something happened in the app | An **event**. Global = all of that kind. Local = this specific one. |
| Not an in-app event | **Schedule** (time). **Manual** (pressed). **Webhook** (outside told us). |

Webhook is a way **in**. It is not an action.

Trigger types in SQL: `event | schedule | manual | webhook | constant`.

### Named in-app events (shape list)

Do not treat “any row changed” as an event.

| Event | Global | Local |
|-------|--------|-------|
| Form submitted | All forms | **This form** |
| Campaign failed | All campaign failures | **This campaign** |
| Opted out / unsubscribed | All | (contact grain exists in later select list) |
| Firm created / provisioned | All new firms | — |
| Audit finished | All audits | probably none (one-time) |
| Contact file imported | All imports | This batch / later |
| An objective was met | Completions of that kind | **This** objective / campaign |

Later trigger-select list on this SHA also names: **New contact**, **Contact uploaded information**, and a silent **Reference pack updated** (row may show, nothing fires until wired). A26 named list: do not add eligibility / halt / meeting as trigger-select rows unless a packet recuts that list.

Global vs local is **not** an Automations “Settings” modal. It matches Agents’ CSS nesting without copying that modal. Global/local of the event also depends on **which contacts are enrolled**.

## 8.3 Two kinds of actions

**1. Agents** — send people to a goal  
- Assign an **existing** sequence  
- Create **from a template**  
- Do **not** author a new agent here  
- Selecting an agent = the **whole sequence** (campaigns live inside). Which agents may be selected can be limited by the objective.

**2. In the application** — do a thing the app already does

Named in primitives:

| Action | Plain |
|--------|--------|
| Ascribe a tag | Put a tag on the person |
| Run an audit | Same audit the desk runs |
| Who this applies to | Contacts on the automation; does not start a mission now |
| Make a form | Automations owns the form; questions are the required data |
| Provision a firm | Later idea in primitives; canonical Automations **hears** firm created |

SQL `action.type` also includes `manage_lists`, `assign_task`, `notify_consultant` besides `call_agent`, `ascribe_tag`, `run_audit`. **UNRESOLVED:** whether those extra types are intended product actions or housing ahead of face. Primitives list is the face-named catalog; do not invent “write whatever into whatever table.”

If / Switch is **not** an action. It is a fork after a result.

## 8.4 Handle after a node (primitive)

When a node finishes, the next step has **every write that run made**. The action sends work to the **real** module. The next node **picks** which of those writes it is about. Not a boolean “done.” Not a short field catalog baked into the client.

Two doors, do not collapse:

| Door | Meaning |
|------|---------|
| On this canvas | Event → action → If on **that** run’s writes |
| A different automation | Hear the completion as an event (Global/Local) |

Hub `lastOutput` → `lastInput` is the smell of the handle, not the live path. Live walk is `workflowWalk.ts` (`previousWrites` / `chainWrites`). Do not recut that walker into a second machine.

## 8.5 Rules (interior of the operation)

Look at Hub Rules grain (Immigration · Service eligibility) as the plant:

- A **rule** is a composite of **conditions** and **constants**.
- Operator toggles outcome families on/off (pathway, gaps, profile & operations, category draws, draw competitiveness — Hub plate).
- Creatable; modular across industries.
- Two options: **GUI** (field · operator · constant) default where possible; **Custom** (named code / JSON) when GUI is not enough. Named code still toggles on/off.
- Prefer always defining a constant when possible.

**Two grains of condition — do not collapse:**

1. Inside the rule: field · operator · constant (or named code).
2. After the rule, on the DAG: **If** (two wires: true/false) or **Switch** (many paths + fallback) calling from the **previous result**.

A rule can emit re-engagement and/or reactivation **signals** — one, the other, or both. Do not split the rule to separate them. Engine 2 still chooses one outbound motion.

**Required data** is a missing output **class** and a **listing**, not a flag. Forms are built from that listing. Do not lock an objective type to a given signal. Collectible fields belong in tables (`collectible_fields`), not a unused code catalog.

## 8.6 Palette (product-face add-node)

On the Ant canvas, add-node kinds present in this snapshot:

| Node | Hint |
|------|------|
| Get | Retrieve data |
| Rule | Branch logic / evaluation |
| Action | Run a task or update |
| If | Two wires — true / false |
| Switch | Many paths plus fallback |
| Wait | Park until approval or a duration |
| Exit | End the workflow |

Click node = configure. `⋯` **Switch** on a Trigger/Action means **change this node’s kind** — that is not the Switch node. Do not mix those words.

Get maps previous writes into slots (`mappedSlots`). Direct input vs mapped box is plate law (INPUT-LOOK / MAPPED-BOX packets on PR #96).

## 8.7 Test, Run, Launch (later packets on origin #96)

- Provide **test data on the trigger** (not a Test tab).
- Canvas: **Save · Run · Launch**.
- Run walks now with those writes.
- Launch arms only.

## 8.8 Forms

The form for a **data request** is created in Automations (lean: **embedded** in the start-agent / objective node; form-as-own-graph-node is **not locked**). Agents does not create forms. Form occupancy / collectible fields (A40 / packet 021) bind questions to required-data listings.

## 8.9 Campaign failure

Failure of a campaign is an event (global and local). In-app action: ascribe a tag (named example: subscription bell). Packet **023**: failure mode is **stop spending, keep listening**. Exhaustion closes outbound attempts; the objective remains claimable if it later completes. Only **nullification** (firm pulls money — escrow era, not built) closes inbound.

## 8.10 Lineage

Queryable at minimum: what created the objective (agent vs hand); path to completion; completion event; time it took. Not a new module. **UNRESOLVED:** exact query UI.

## 8.11 What Automations is not

- Not overwriting 15:43.
- Not treating re-engagement / opt-in / reactivation as objectives (those are sequence templates / campaign names).
- Not creating agents.
- Not Hub as the app.
- Not a full catalog of operations or exit points (named silence).
- Not n8n-for-its-own-sake. The product is the handle after the node.

## 8.12 Older Seed §5.6 sketch (do not silently kill)

Seed named peer modules: Trigger, Constants, Conditions (If), Operations (stub), Rules, Actions (stub), plus a v1 walker shape `Trigger → Constants → Conditions/Branch → Rules → Action → Exit` (`V2-BACKLOG.md`). Phase Two recasts the face as a blank DAG with Get/Rule/Action/If/Switch. **Intended now:** Phase Two + packets. **Still required:** Constants packs, Rules toggles, structured eligibility output. Do not delete Constants/Rules because the smallest workflow is three nodes.

Arbitrary graph walk (cycles, parallel fan-in/out, multi-trigger join) is **deferred to a later walker generation** in `V2-BACKLOG.md` (repo root). Whether that backlog still binds after If/Switch shipped is **UNRESOLVED**; If/Switch did ship as a packet on this SHA’s ancestry.


===== 09-ELIGIBILITY-AND-MOTION.md =====

# 9. Eligibility, Engine 2, and the meeting loop

## 9.1 Evaluation packs (open box)

House authors inspectable rules against **Constants** (versioned industry criteria) and **Reference tables**. V1 pack is Immigration · Service eligibility.

Outcome families (toggleable; Hub plant):

- Pathway detection
- Gaps
- Profile & operations
- Category draws
- Draw competitiveness

Pathway pass = **any** of CEC / FSW / FST / PNP-* asserting — not CEC-only.

Example fields that unlock gaps/ops (not an exhaustive catalog): `eca_status`, `ee_profile_exists`, `ee_profile_last_updated`, `foreign_work_years`, plus language/TEER-style gates, CRS/draw constants.

**Analysis readout** (pane): headlines, deltas, service candidates (B-*), nudge/reactivation hints, narratives. Machine JSON retained underneath.

A reference version publish re-evaluates affected contacts without a code deploy.

**UNRESOLVED:** rule-pack IP / liability; Constants packs beyond Immigration.

## 9.2 Collectible field classification

| Flag | Meaning | Downstream |
|------|---------|------------|
| Self-reportable | Client knows offhand | Forms / pre-meeting capture |
| Document-dependent | Paperwork | Never a form; tracked work items |
| Employer-directed | Aimed at the firm | Separate routing |

Required-data listings on rule output must be the source of form questions. Deterministic — no AI to decide what data is required. If that ever stops being true, say so.

## 9.3 Engine 2 (motion)

Signals are recorded when found. Outreach is a separate decision. Precedence in §3.2 system 11.

**UNRESOLVED:** reactivation-worthy criteria. Without that, the machine cannot close “when do we invite to a meeting vs ask for data?” as a complete rule.

## 9.4 Attempt engine vs Engine 2

Engine 2 chooses **which sequence motion** (reactivation vs nudge). The attempt engine runs **inside** the chosen sequence (channel ownership, retries). Neither replaces the other.

## 9.5 Objective met and failure (packets 022 / 023)

**Met:** completion write (click → messaging event on a stamped send; form → `fact_writebacks` with form/objective axis; meeting → `meeting_booked` with objective axis) matches the campaign that asked. Global “any meeting this person ever booked” is the bug 022 forbids.

**Failure / exhausted:** stop outbound spending; **keep listening**. Attempt status `exhausted`; enrollment `pursuit_state` pursuing | exhausted. Do not null `campaign_id`, do not consume access links, do not disable booking/form doors on exhaustion.

**Nullified:** escrow-era only — firm pulls money; inbound refused. Not built. Direction: objectives are the billable unit (`SYSTEMS-OBJECTIVE-ESCROW.md`) — **not Story-promoted, not a build order**.

## 9.6 Meeting loop-closer

Human books (hard gate) → `meeting_booked` → pending capture if facts outstanding → write-back → immediate re-eval → **live brief** on Consultant Meetings.

D-01 / D-02 remain silences (§3.2 system 12).


===== 10-DATA-AND-RUNTIME.md =====

# 10. Data, runtime, and wiring

## 10.1 Machine law

The machine is **tables + a dumb runtime**. Kinds: **state | rule | sequence**. Anything that should be modifiable is a table. Frozen-in-prose that should vary is a bug unless it is a hard-gate / must-not / immutable wall.

**Data in tables:** module records come from queries. Seed a reasonable row count when a table is minted. Never hard-code demo rows into React. If the table/field is unspecified, that is a silence — do not invent a store in the SPA.

## 10.2 Tenancy and identity tables

| Table | Role |
|-------|------|
| `firms`, `users` | Auth tenancy |
| `otp_challenges`, `sessions`, `otp_send_log` | Passwordless login |
| `access_links` | Consultant magic invite `/a/<token>` |
| `ct_firms` | CT/wire firm row (same UUID as `firms` after firm-binding) |
| `contact_records` | Firm book |
| `import_batch` | CSV/import batches |
| `contact_access_links`, `contact_uploads` | Contact seat |
| `consent_records`, `halt_records` | Consent / consultant halt |
| `crm_oauth_grants` | Book authorization |

## 10.3 Agents housing (sequence ⊃ campaigns)

| Table | Role |
|-------|------|
| `sequence_template` | Sequence container; class; cells |
| `firm_sequence_binding` | Per-firm template + overrides |
| `campaign` | One objective; ord; Override this; per-campaign attempt params |
| `campaign_objective` | kind click\|form\|meeting; completion table; template\|scratch |
| `campaign_channel` | Medium nodes + content |
| `campaign_channel_variation` | Attempt-N copy |
| `seq_attempt_cycle` | Attempt rules at sequence/global grain |
| `seq_channel_ownership_order`, `seq_phase_order` | Ladders |
| `seq_channel_rules` | Channel/escalation rules |
| `rule_attempt_criteria` | Faceless attempt windows |
| `campaign_failure` | Exhaustion event |
| `enrollment` | Cursor; `campaign_id`; `pursuit_state` |
| `active_attempts` | In-flight attempt |
| `engagement_records` | Chronology |
| `outbound_messages`, `messaging_events` | What went out / provider events |
| `sequence_ready`, `reachability_verdicts`, `audit_runs` | Book readiness |

## 10.4 Automations housing

| Table | Role |
|-------|------|
| `workflow`, `workflow_state`, `workflow_target`, `workflow_run` | Graph + runs |
| `workflow_trigger` | Event/schedule/manual/webhook/constant |
| `action` | call_agent / in-app types |
| `rule_pack` | Togglable families + named code |
| `event_write_set`, `event_test_data` | Test contract / write-set |
| `collectible_fields` | Form occupancy |
| `contact_tag` | Ascribe-tag action |
| `wait_occupancy` | Parked waits / approval notes |

## 10.5 Eligibility / motion housing

| Table | Role |
|-------|------|
| `reference_versions`, `constants_packs` | Law-side data |
| `rule_eligibility_pathway`, `rule_field_class_routing`, `rule_motion_precedence`, `rule_cohort_scoring`, `rule_metrics_thresholds`, `rule_reachability_checks` | Open-box rules as rows |
| `eligibility_evaluations`, `eligibility_results` | Runs and structured output |
| `signals`, `motion_decisions` | Engine 2 |
| `fact_writebacks`, `missing_fact_signals` | Collection |
| `meeting_booked` | Success event |
| `prepared_workspaces`, `escrow_acceptances` | Activation |
| `campaign_states` | Armed / running |
| `register_gaps` | House evolution |
| `audit_events` | Operator audit trail |
| `sending_domains` | Sending pool |
| `primary_store_rows` | Legacy CT bags — not the intended source of module records |

Map-only vs Postgres: some Story nodes (e.g. `state.finishing_event`) exist on `/system-map` without a first-class table. Name the split; do not pretend the map is stood up.

## 10.6 Runtime

| Process | Job |
|---------|-----|
| `workflowWalk.ts` | Automations walk. Ignition: payload writes, until-node, configured-break. Handle = previousWrites / chainWrites. |
| `cascade.ts` | Shared enroll / escalate / send; attempt criteria; channel ownership |
| `worker.ts` | Time path (tick) |
| `dispatchSend.ts` | Live send gates: consent / halt / silence / SEND_MODE |
| Auth service | OTP, session, access redeem |
| Wire routes | `/wire/*`, `/wire/machine/*`, `/wire/hook/:webhookId`, send CEM/SMS, Resend webhooks |

**SEND_MODE** gates live send. Default in later docs is live when secrets+DB are good; older actuation reports defaulted dry-run. **UNRESOLVED as product copy:** which default is intended for production vs sandbox. Gates themselves are required.

## 10.7 Live vs stand-in ports (as-built honesty, not a product shrink)

Live when secrets + DB are good: Resend CEM, Twilio SMS, Resend webhooks → messaging_events, OTP mailer, sending pool / sending_domains, Postgres halt/consent/CRM grant/audit/primary store, worker tick, access links.

Still stand-in / deferred: **Meta ads**, **escrow fulfillment**, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress.

Deferred is a product choice for Escrow · Meta unless Story already required the capability (it does require the *door*; it does not require the payment processor to be live).

## 10.8 Send identity

Outreach is **firm-branded**. House allocates a sending subdomain per firm. Custom domain attach deferred. Consultant halt and contact silence suppress new enroll+send.

## 10.9 Auth contract (intended login)

- `POST /auth/otp/send` — generic 200; no code if unprovisioned
- `POST /auth/otp/verify` — sets `tower_session` HttpOnly cookie; no token in JSON
- `GET /auth/session`, `POST /auth/logout`
- `POST /auth/access/redeem` for magic links

Rate limits and delivery failure (`503`) are specified in `docs/product/auth-service-contract.md`.


===== 11-CONSTRAINTS.md =====

# 11. Constraints and laws

## 11.1 Must-not (product)

- Cold-detect end-client eligibility from public databases as Core Function.
- Skip opt-in because the firm authorized their database.
- Charge the engagement contact.
- Hold immigrant settlement funds.
- Present credits or a sales-call as a peer door equal to escrow at activation.
- Pull hard inputs into the acquisition click budget.
- Let the engagement record author motion.
- Let Engine 2 replace the attempt engine inside a sequence.
- Fire parallel outbound motions for one client.
- Put document-dependent needs on forms.
- Treat marketing DOA HTML as Audit.
- Treat Operator as a firm Board login persona.
- Mint an Agent seat.
- Treat Hub as the app or plant Hub chrome as the product.
- Put Register methodology tooling on the firm desk.
- Let firms author the configuration libraries (they bind, they do not author).
- Hard-code module records into the SPA.
- Put Automations triggers on the Agents canvas.
- Create agents inside Automations.
- Mix “⋯ Switch” (change node kind) with the Switch node.
- Recut `workflowWalk.ts` into a second machine.
- Overwrite the 15:43 Agents flagship with a generated list.

## 11.2 UI law (machine vs glass)

Tower is the machine. UI is only:

- **Control** — injects a change into an existing state, or
- **Pane** — displays an existing state.

Faceless triggers (email opened, window elapsed, reference version published) are native to the machine. Faces cannot see them unless a pane is bound.

## 11.3 Teaching copy is not a node

Captions on plates (“qualify — first objective met”, “smallest workflow…”) are teaching. Do not mint nodes or fields from those sentences. A tick between campaigns for “objective met” is allowed chrome, not a qualify node.

## 11.4 Click the node = configure

On Automations/Agents canvases, clicking a node opens configuration. Adding nodes uses the palette. Override this on a campaign reveals child wires.

## 11.5 Write-set is the shape

After a node, the next step picks from **every write that run made**. Do not hard-code a field catalog in the client.

## 11.6 Honesty / empty-or-personalized

No Sarah/Cedar scenery as product truth. Demo seeds may exist for development; the desk shows the query. Prototype README’s “Sarah Jenkins richest mock” is historical plant, not intended production data.


===== 12-GLOSSARY.md =====

# 12. Glossary

| Term | Meaning |
|------|---------|
| **ALG** | Agent-led growth: cheap public seed → forward-deploy → agent earns hard inputs |
| **OLG** | Operator-led / assisted entry into the same application |
| **Approach** | Acquisition strip: feed → ad → capture → continue scroll |
| **Seed inputs** | Name, website, phone or email |
| **Click budget** | Cap on stranger effort in acquisition; forced at one click unless relaxed as a finding |
| **Forward-deploy** | Stage a working campaign under firm identity from public facts + house templates |
| **Prepared workspace** | No-login activation artifact; proves readiness, not value |
| **Hard inputs** | Database authorization + escrow acceptance |
| **Running** | Campaign performs without further required activation inputs |
| **Escrow** | Contingent commercial terms firm↔Om Coda |
| **Armed** | Bound and ready; nothing sending |
| **Active** | Sequence / packs executing |
| **Audit** | Reachability / sequence-start gate, not scoring |
| **Sequence-ready** | Passed audit + consent posture allows enrollment |
| **Sequence / agent** | Blank container of campaigns; the outreach package |
| **Campaign** | One objective inside a sequence |
| **Objective** | One binary yes/no the enrolled are campaigned to do |
| **Goal** | Completion of an objective |
| **Channel** | Medium (text / email / form and/or call) |
| **Channel rules** | Escalation on that medium |
| **Attempt** | A cycle of the campaign’s sequence work |
| **Override this** | Opens a campaign to reveal channel nodes |
| **Engagement record** | Chronology of fired events; authors nothing |
| **Nudge** | Touchpoint that carries a data ask |
| **Silenced** | Opted out or never opted in; excluded from automatic outreach |
| **Signal** | A recorded detection (including missing data) |
| **Motion** | The single chosen outbound (reactivation or nudge or none) |
| **Engine 2** | Signal/motion precedence |
| **Self-reportable** | Fact the client knows offhand |
| **Live brief** | Pre-meeting view, recomputed on write-back |
| **Open box** | Operations inspectable/changeable without code deploy |
| **Global / Local** | All of an event kind vs this specific instance |
| **Handle / write-set** | Every write that run made, available to the next node |
| **Product face** | `/prototype-ant` |
| **Hub** | Advanced plant / reference, not the app |
| **House** | Om Coda operator/agency layer |
| **Firm** | Tenancy owning users and the private book |


===== 13-UNCERTAINTY.md =====

# 13. Uncertainty register

These are **not** decided in the snapshot. This specification does **not** invent founder decisions for them.

## 13.1 Named Story silences (still open)

| Silence | System |
|---------|--------|
| Escrow **release** trigger / outcome definition | 3 |
| Concrete shape of database authorization per practice stack | 3 |
| Ongoing SaaS packaging vs escrow as peer door (packaging later must not replace the door) | 3 |
| When/whether email earns Meta entry; Meta targeting / CAC | 1 |
| CASL/SMS consent regimes by geography (firm→client and first agent→consultant text) | 6, 1 |
| What makes a signal **reactivation-worthy** | 11 |
| Exact product-locked attempt criteria windows (30 min / 24 h are operator-revisions, not promoted Story musts) | 7b |
| SMS reply-failure escalation | 7b |
| Import fully mutates the living list | 5 |
| CRM bidirectional sync | 5 |
| D-01: pre-meeting capture as tail of reactivation vs standalone meeting_booked sequence | 12 |
| D-02: in-meeting fallback module | 12 |
| Client desk depth (touchpoint-only vs authenticated portal) vs later `/c/` workspace | 8, 12 |
| Multi-consultant roles / permissions | 4 |
| Production onboarding beyond manifests / Provision | 4 |
| Rule-pack IP / liability | 9 |
| Constants packs beyond Immigration | 9, 10 |
| Operations & Actions initiation law (Seed stubs) — partially filled by primitives, not a complete catalog | 10 |
| Event-trigger set beyond the named primitives list | 10 |

## 13.2 Conflicts between layers (do not pick a silent winner)

1. **Hub seating.** Seed §5 puts Audits/Agents/Automations in the firm Hub. Personas/Outcomes/Phase Two put authorship on Operator Configuration libraries; product face is `/prototype-ant`; Hub is plant. **Intended seating:** Operator. Hub remains reference.

2. **Channel ladder.** Story: Text → Email → Form. Agents face: text → email → call; “do not silently drop form.” SQL `campaign_channel`: text \| email \| call. **Not closed.**

3. **Sequence class count.** Three phases (opt-in, re-engagement, reactivation) vs historical SQL four-class CHECK including `launch_day`. Later housing: launch window / launch day are **campaign names**, not sequence classes. **Intended:** three sequence templates; launch window/day are campaigns inside opt-in.

4. **Automations graph.** Seed §5.6 + V2-BACKLOG v1 validated pipeline vs Phase Two blank DAG with Get/If/Switch/chain. **Intended face:** Phase Two. Constants/Rules still required.

5. **Wait node.** Palette still lists Wait; packet 028 recut Wait kind to occupancy/approval notes. **Not closed** whether Wait remains a palette node.

6. **Root README** (“prototype only, no auth/API”) vs wire/Postgres/OTP on this SHA. README is stale. Intended product has auth, wire, and tables.

7. **PSD v0.4.0 “current”** (2026-07-10) vs Phase Two (2026-08). PSD is historical.

8. **Goal as Story must.** SYSTEMS-GOAL is founder expansion, “not Seed/World law until promoted,” while packets 022/023 implement objective-met as Local event. Mechanism is stood up; Story promotion wording remains unfinished.

9. **action.type extras** (`manage_lists`, `assign_task`, `notify_consultant`) vs primitives’ shorter in-app list.

10. **SEND_MODE default** dry-run (older actuation) vs live (later MODULES-ALIVE / AGENTS.md).

11. **Capability SME** 158 items — paper, not absorbed. Sending infrastructure and some gates exist; do not treat the full roster as specified.

12. **Objectives as billable unit / nullification** — direction, not a build order, not Story 3 promoted.

## 13.3 Automations FACE still-open tinkering list (verbatim silences)

- Full list of operations Automations performs.
- Full list of exit points besides start/select agent.
- Form-as-own-node vs embedded (lean: embedded).
- Remaining rule output classes besides required data.
- Queryable lineage UI.
- Word “event” for untemplated objectives (FACE says settled as objectives-are-events; AGENTS still lists the word as open).

## 13.4 Agents FACE still-open tinkering list

- Additional unnamed objectives in the teaching opt-in sequence.
- Mixed objective types in one sequence: practical or only technical.
- Add-contact filter catalog beyond Every firm / Select from.

## 13.5 What this spec refuses to invent

- Pricing numbers, CAC, Meta targeting.
- A complete in-app action catalog beyond named primitives + SQL extras flagged uncertain.
- A complete collectible-field dictionary.
- Legal opinions on CASL/PIPEDA (compliance SME exists as paper; not folded as product law here).
- Conversations / reply-triage module (capability C2 paper).
- Exact ElevenLabs call runtime.
- Whether Hub leaf parity is ever required (Phase Two: no — Hub is not the app).
