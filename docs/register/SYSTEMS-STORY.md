# Tower — Systems Story (machine substance)

**Seat:** Systems analyst — locks **what the machine must be able to do** (the CTO later **extracts** Systems Requirements and wires).
**Method:** Immutable, technology-free statements derived from [`SEED.md`](./SEED.md) + [`WORLD.md`](./WORLD.md) **alone**. Each statement is a **must** (capability), a **must-not** (hard stop), a **chain** (one system's done initiates another), or a **silence** (named, never filled). Controls and panes are out of scope — they only extrude later onto states this Story already requires.
**Job of this doc:** Say, directly and inflexibly, what Tower must do so that any competent technical professional can write Systems Requirements from it without inventing substance. Requirements rearrange Story into states / transitions / ramifications — they do **not** invent what Story never claimed.
**Status:** Substance pass (replaces the thinner first-pass initiation sketch). Under-claim where Seed/World are silent. Founder clarifiers denser than Seed/World (e.g. attempt windows) are labeled **OPERATOR-REVISIONS** and are **not** Seed/World law until promoted.

---

## Spine — what the whole machine must continuously do

The system must be able to, while a firm has contacts and hands-free operation is armed:

1. Keep engaging dormant and active contacts.
2. Keep immigration-relevant facts fresh via firm→client touchpoints.
3. Re-evaluate **service eligibility** as IRCC-shaped reference and client facts move.
4. Surface campaign-worthy people so consultants book meetings without manually rechecking every file.

(`Seed §0.1, §4, §16.1`; `World §2.2`)

**Core outcome the machine must pursue:** detect service-eligible candidates and initiate the right campaign motion (launch / nudge / reactivation) whose success event is **meeting booked** (`Seed §4`).

**Facet order (immutable walls):** Acquisition → Activation → Application → Evolution. Evolution is Register-driven product change, **not** a client lifecycle system (`Seed §6.1`; `World §0.3, §1.4`).

**Cross-cutting constraint — presentation ≠ fulfillment:** Agent presentation may ask, explain, and route. It must **not** scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money. Those belong to Automations / Wiring (`Seed §0.4, §16.12`; `World §1.1`).

**House / open-box constraint:** Because Om Coda is agency, evaluation rules, analysis, operational logic, and reference upkeep live in an **operator/house layer** that must stay inspectable and changeable **without a code deploy** (`World §2.1, §3.4`; `Seed §5.7`).

---

## The twelve systems

Twelve distinct systems are latent in Seed + World. Each is an initiation-engine. Numbering follows facet order; engines stay non-conflatable.

1. Acquisition (seed-capture)
2. Provision / forward-deploy
3. Commercial / hard-input
4. Tenancy & access
5. Reachability / audit
6. Consent / suppression
7. Engagement / sequencing — **7a** campaign calendar · **7b** attempt / channel-ownership
8. Fact-refresh / data-collection
9. Reference-currency
10. Eligibility re-evaluation
11. Signal / motion orchestration (Engine 2)
12. Meeting / loop-closer

---

### 1. Acquisition (seed-capture)

**Must fulfill:** Obtain the three cheap seed inputs from a stranger consultant inside the click budget, then return them to their scroll.

**The system must be able to:**

- Capture **firm/consultant name**, **website**, and **one channel** — phone **or** email — as the acquisition finish line (`Seed §6.2`; `World §0.3.2`).
- Do that from a Meta (FB/IG) Approach in V1; LinkedIn is deferred (`Seed §6.2`).
- Force **one click** as the design constraint; relax only as a finding (`Seed §6.2`; `World §0.3.3`).
- Make the one-tap **output legible** in the ad (never persuade); pre-frame that an agent will follow/prepare so the first text is not read as spam (`Seed §6.2, §16.8`).
- After capture, continue the stranger's scroll — no thank-you dashboard (`Seed §6.2`).
- Treat **continue-scroll without tapping** as a first-class non-action trigger and instrument *did not understand* vs *understood and did not tap* (`Seed §6.2`; `World §1.1`).
- Persist the capture and attribute the session (fulfillment, not agent presentation) (`Seed §0.4`).
- Scope Approach to **one acquired non-house party** (V1: Consultant). Engagement contacts are **never** acquired via Approach; the house is never acquired via Approach (`World §0.3.6`).

**Must not:**

- Pull database authorization or escrow into the click budget (`Seed §6.4, §14`; `World §0.3.3`).
- Treat forward-deploy as acquisition (`Seed §14`; `World §0.3.4`).
- Use cold email as a V1 Approach (`Seed §0.2, §14`).

**Chains to:** *seed inputs land* initiates Provision / forward-deploy (`Seed §6.2→§6.3`; `World §1.2`).

**Silences:** When/whether email earns Meta entry (`Seed §13.8`); Meta targeting / CAC (`Seed §13.3`); consent regime for the first agent→consultant text (`Seed §8.2, §13.14`).

---

### 2. Provision / forward-deploy

**Must fulfill:** After seed inputs land, stage a no-login prepared workspace that proves **readiness** (not value) under the firm's identity.

**The system must be able to:**

- On *seed inputs land*, scrape **public firm facts** and instantiate from **Om Coda's** launch → re-engagement → reactivation methodology templates — **not** from the firm's client list (`Seed §6.3`; `World §0.3.4`).
- Serve a **no-login prepared workspace** (agent may walk it; automation executes the provision) (`Seed §6.3`).
- Keep firm identity as authentication/branding detail — not a claim that Tower already holds their clients (`Seed §6.3`).
- Belong to **Activation**, even when it looks like marketing (`World §0.3.4`).

**Must not:**

- Derive the campaign from the firm's private book before database authorization (`Seed §6.3`).
- Redesign the Application desk to need fewer inputs so ALG is cheaper (`Seed §6.3`; `World §0.3.7`).

**Chains to:** Prepared workspace is the object Commercial walks; readiness is the precondition of asking for hard inputs (`Seed §6.3`).

**Silences:** ALG Approach / forward-deploy / escrow door remain bets not fully built in prototype honesty (`Seed §11`) — capability target still stands.

---

### 3. Commercial / hard-input

**Must fulfill:** Land the two hard inputs and flip the campaign to **running**.

**The system must be able to:**

- Accept **database authorization** (or the equivalent that makes the campaign real) and **escrow acceptance** as the activation finish line (`Seed §6.1, §6.3`; `World §0.3.2`).
- Hold escrow terms and flip the campaign to **running** — after which the campaign performs without further *required* activation inputs (`Seed §0.4, §6.1`; `World §0.4`).
- Present **escrow only** as the peer door at the activation payment moment (`Seed §0.3, §7`; `World §0.4`).
- Keep commercial terms **firm↔Om Coda**; Tower holds **no** immigrant settlement funds; end-clients pay Tower nothing (`Seed §7, §8.2`; `World §0.4`).
- Keep charging the firm (not the contact) for detection cost to the contact = free (`Seed §7, §8.2`).

**Must not:**

- Present credits or a sales-call as a peer door equal to escrow at activation (`Seed §6.3, §7, §14`).
- Silently migrate database authorization into the acquisition click budget (`Seed §13.2`).

**Chains to:** *running* opens the Application desk (Audit, Engagement, Eligibility loops) to that firm (`World §0.3.2`); house continues holding the operator layer for that firm after running (`World §1.2`).

**Silences:** Escrow **release** trigger / outcome definition (`Seed §7, §13.1`); concrete shape of “database authorization” per practice stack (`Seed §13.2`); ongoing SaaS packaging later must not replace escrow as peer door at activation (`Seed §7`).

---

### 4. Tenancy & access

**Must fulfill:** Provision firms/users and hold verified sessions so either door lands in **one** Application desk.

**The system must be able to:**

- Provision firms and users only via **versioned seed manifests** (assisted / OLG bootstrap — no ad hoc SQL) (`Seed §5.10`).
- Run passwordless OTP: send → verify → hold a session; validate session for guarded actions; clear session on logout (`Seed §5.10`).
- On an **unprovisioned** email request: return generic success and **issue no code** (anti-enumeration) (`Seed §5.10`).
- Land assisted/OLG and self-serve/ALG into the **same** application / session matrix (`Seed §6.5`; `World §0.3.8`).
- Treat Firm as tenancy owning users and book; Consultant as firm operator / acquired persona V1 (`Seed §10`; `World §1.1`).

**Must not:**

- Treat Operator as a firm Board login persona (`Seed §14`).
- Mint an Agent seat / Agent column in admission (`Seed §14`).

**Chains to:** Either provision door lands the firm in one Application desk (`World §0.3.8`).

**Silences:** Multi-consultant roles/permissions (`Seed §13.6`; `World §1.1`); production onboarding beyond manifests (`Seed §13.10`).

---

### 5. Reachability / audit

**Must fulfill:** Answer only — can we reach this contact, and can we start a sequence on them?

**The system must be able to:**

- Run data-validity checks over imports / the book: email valid, phone valid, ≥1 channel matching the **intended** sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present (`Seed §5.2`; `World §3.1`).
- Connect to **external validation** where a check needs it (`Seed §5.2`).
- Emit verdicts **reachable / partial / unreachable** and mark contacts **sequence-ready** or not (`Seed §5.2`; `World §0.4`).
- Surface open reachability issues as workspace meta; treat “list is stale” as a byproduct signal, not the engine (`Seed §5.2`).

**Must not:**

- Produce pathway/CRS scoring, ROI/activation-probability forecasts, minimum contact-count gates, or sales PASS/FAIL ceremony (`Seed §5.2`; `World §3.1`).
- Confuse marketing “Database Opportunity Assessment” HTML with in-app Audit (`Seed §5.2, §14`).

**Chains to:** *sequence-ready* is a precondition for Engagement enrollment (`Seed §5.2`).

**Silences:** Contact-entry via import does not fully mutate the living list (`Seed §5.1, §11`); CRM bidirectional sync (`Seed §13.7`).

---

### 6. Consent / suppression

**Must fulfill:** Govern who may be touched automatically; keep firm DB auth from substituting for end-client consent.

**The system must be able to:**

- Run an **opt-in** phase: firm→client consent and first channel open (`Seed §5.3`; `World §0.4`).
- Treat contacts as sequenced / silenced / unsequenced, with **silenced when not opted in** (and when opted out) (`Seed §5.3`; `World §0.4`).
- Gate deep data collection on opt-in; respect silence (`Seed §8.2`).
- Feed consent/silenced state into Audit reachability (`Seed §5.2`).

**Must not:**

- Invent “skip all opt-in because ALG / firm DB auth” (`Seed §8.2, §14`).
- Charge end-clients for Tower (`Seed §7, §8.2`).

**Chains to:** Consent state gates Engagement and Fact-refresh (`Seed §8.2`).

**Silences:** CASL/SMS consent regimes by geography for firm→client and for first agent→consultant text — asserted necessary, not closed (`Seed §8.2, §13.14`; `World §1.2`).

---

### 7. Engagement / sequencing

Two engines that must **never** be conflated (`Seed §5.5`; `World §3.3`). The engagement **record** (Activity / chart) is a chronology of events that already fired — it authors nothing (`Seed §5.5`; `World §3.2`).

#### Shared phase law

**The system must be able to:**

- Run phases: **Opt-in** → **Re-engagement (nudges)** → **Reactivation** (`Seed §5.3`; `World §0.4`).
- Hold reactivation as **armed** (ghost template ready, nothing sending) vs **active** (executing) (`Seed §5.3`; `World §0.4`).
- Author sequences as ordered steps of channel + copy; treat reactivation/launch agents as composites of those steps; enroll when criteria match (`Seed §5.5`).
- Keep composing = configuration; sending = automation/Wiring (`Seed §5.5`; `World §1.3`).

#### 7a. Campaign calendar (content order across days)

**Must fulfill:** Decide day-ordered engagement content for a phase, under Engine 2 precedence.

**The system must be able to:**

- Hold opt-in / nudge / reactivation **content order** across days (`Seed §5.5`; `World §0.4, §3.3`).
- Obey Engine 2 precedence when choosing which motion's content runs (`World §3.3`).

**Must not:** Decide runtime channel ownership, waits, or attempt retries (that is 7b) (`World §3.3`).

#### 7b. Attempt / channel-ownership engine (one sequence at runtime)

**Must fulfill:** Run a single in-flight sequence under one owning channel, forward-only, with faceless criteria and inbound override.

**The system must be able to:**

- Own the flow under one channel at a time along **Text → Email → Form** (forward-only handoff) (`Seed §5.5`; `World §3.3`).
- Nest waits / attempts under the owning channel that failed; escalate forward when **criteria are met** (`Seed §5.5`; `World §0.4, §3.3`).
- Accept a **live inbound** mid-attempt as an override that can nullify the in-flight attempt (`World §0.4, §3.3`).
- On a **finishing event**, close the sequence and **arm the next** (`World §3.3`).
- Record every fired event on the engagement record without letting the record author motion (`Seed §5.5`; `World §3.2`).

**OPERATOR-REVISIONS clarifiers (not Seed/World law until promoted)** — denser prototype criteria in [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) §5b:

- Text delivered not opened in **30 min** → Email.
- Email opened, link not clicked in **24 h** → next attempt.
- Form started not submitted in **24 h** → Text; re-entries do not reset the clock.
- Attempts are **local retries** under the failed owner (fresh Text→Email→Form), not a top-level Attempt spanning all channels.
- Live **form visit** is a named inbound override that can open the next step.
- Form submitted closes the nudge and can arm the next (e.g. reactivation scheduled).

**Must not:**

- Let Engine 2 replace the attempt engine inside a sequence (`World §0.4`).
- Let the engagement record author channel order or attempts (`World §3.2`).

**Chains to:** Each touchpoint carries Fact-refresh data asks; finishing events arm the next sequence; chosen motions arrive from Engine 2 (`Seed §5.4, §5.8`; `World §3.3`).

**Silences:** Exact product-locked criteria windows (beyond World’s “when criteria are met”); SMS reply-failure escalation (`Seed §13.15`); event-based enrollment trigger set beyond manual pull (`Seed §5.6, §11`).

---

### 8. Fact-refresh / data-collection

**Must fulfill:** Use touchpoints as the data-collection mechanism; route answers by field class; write back into eligibility.

**The system must be able to:**

- Fire nudges that ask for or infer facts affecting eligibility (`Seed §5.4`; `World §0.4`).
- Classify fields and route:
  - **Self-reportable** → forms / pre-meeting capture.
  - **Document-dependent** → **never** a form; tracked work items.
  - **Employer-directed** → ask the **firm**, not the client (`Seed §5.4`; `World §0.4`).
- Accept answers from the client or consultant hand-entry; on any write-back, initiate **immediate re-evaluation** (`Seed §5.8`).
- Record a *missing* fact as a signal (Engine 2 input) (`Seed §5.8`).

**Must not:** Put document-dependent needs into forms (`Seed §5.4`).

**Chains to:** Every write-back triggers Eligibility; missing facts feed Engine 2 (`Seed §5.8`).

**Silences:** Client desk depth (touchpoint-only vs authenticated portal) (`Seed §13.4`); D-02 in-meeting fallback surface (`Seed §5.8, §13.5`).

---

### 9. Reference-currency

**Must fulfill:** Keep IRCC-shaped reference facts current as versioned data, with no code deploy.

**The system must be able to:**

- Maintain versioned reference tables (categories, trades, cutoffs, provincial identifiers, etc.) as **data** (`Seed §5.7`; `World §1.3, §2.2.1`).
- Treat a reference move (draw threshold/cutoff shift, category added, trade/provincial identifier change) as a **faceless** first-class trigger — no screen, no human click (`Seed §5.7`; `World §2.2.1`).
- Hold industry criteria packs (Constants) as versioned packs; V1 truth is Canada-shaped (`Seed §5.6, §2.6`).

**Must not:** Require a code deploy to update reference facts (`Seed §5.7` Directive 3).

**Chains to:** A reference change triggers Eligibility re-evaluation for every affected contact — the **law / public-reference** side of detection (`World §2.2`).

**Silences:** Ownership / IP / liability of rule packs (`Seed §13.9`; `World §1.2`); Constants packs beyond Immigration (`Seed §13.16`).

---

### 10. Eligibility re-evaluation

**Must fulfill:** Recompute private service eligibility when client facts or reference move; emit every determination as a signal.

**The system must be able to:**

- Evaluate from firm-held + engagement-collected client facts against house-held / firm-configured rules — **private** to the firm book (`Seed §2.4`; `World §0.4`).
- Accept two detection sides: (1) law/public-reference moves, (2) life-change facts only the person/firm-file knows (`World §2.2`).
- Run the automation shape: Trigger (scoped pull — manual rich; event thinner) → Constants → Conditions → Rules → structured output → downstream resolution (`Seed §5.6`; `World §0.4, §2.3`).
- Treat pathway pass as **any** pathway assertion (CEC **or** FSW **or** FST **or** PNP-*), not one favoured pathway (`Seed §5.7` Directive 2; `World §0.4`).
- Produce an **Analysis** readout (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath (`Seed §5.7`; `World §0.4`).
- Emit **every** determination — including missing-data — as a signal (`Seed §5.8`).
- Keep evaluation inspectable/changeable without deploy (open-box / house layer) (`World §3.4, §2.1`).

**Must not:**

- Cold-detect strangers’ immigration eligibility from public databases as Core Function (`Seed §2.4, §14`; `World §0.4`).
- Treat a static book dump as sufficient for the life-change side (`World §2.2`).

**Chains to:** Every emitted signal triggers Engine 2 (`Seed §5.8`).

**Silences:** Operations & Actions initiation law (stubs) (`Seed §5.6, §11`); event-trigger set (`Seed §5.6, §11`); Rules UI toggles vs condition trees (`Seed §13.13`); workflow persistence target (`Seed §13.12`).

---

### 11. Signal / motion orchestration (Engine 2)

**Must fulfill:** Record every detection; choose the single outbound motion by fixed precedence.

**The system must be able to:**

- Record every detection — including missing data — as a **signal** when found (`Seed §5.8`; `World §0.4`).
- Decide outreach separately from recording, under fixed precedence (`Seed §5.8`):
  1. **Reactivation first**, whenever anything is reactivation-worthy.
  2. **Nudge only** when nothing is reactivation-worthy.
  3. When a nudge fires, consolidate **every** outstanding self-reportable need into **one** form — never one nudge per field.
  4. When reactivation fires, attach secondary signals as **agenda** on the consultant’s pre-meeting brief — never parallel outreach.
  5. **One client, one motion, ever** (`Seed §5.8, §16.11`; `World §3.3`).

**Must not:** Replace the attempt engine inside a sequence (`World §0.4`); fire parallel motions for one client (`Seed §5.8`).

**Chains to:** Chosen motion hands work to Engagement (reactivation or nudge sequence) (`Seed §5.8`; `World §3.3`).

**Silences:** What makes a signal **reactivation-worthy** (`Seed §5.8`); D-01 / D-02 builder placement (`Seed §5.8, §13.5`).

---

### 12. Meeting / loop-closer

**Must fulfill:** On meeting booked, close the loop with pending capture and a live brief.

**The system must be able to:**

- Treat **meeting booked** as the core success / loop-closer event (`Seed §4, §5.8`).
- On `meeting_booked` with outstanding self-reportable fields, open a data-capture form pending the meeting (`Seed §5.8`; `World §0.4`).
- On any write-back against that capture (or consultant entry), run **immediate re-evaluation** (`Seed §5.8`).
- Keep the pre-meeting brief **live** (recomputed), not a snapshot (`Seed §5.8`; `World §0.4`).

**Chains to:** Write-backs re-trigger Eligibility, keeping the brief current (`Seed §5.8`).

**Silences:** D-01 — pre-meeting capture as tail of reactivation vs standalone `meeting_booked` sequence; D-02 — in-meeting fallback module (`Seed §5.8, §13.5`).

---

## Cross-system trigger web

Initiations where one system's output is another's trigger:

| From | Trigger event | To |
|---|---|---|
| 1 Acquisition | seed inputs land | 2 Provision |
| 3 Commercial | hard inputs land / campaign **running** | Application desk open (5–12) |
| 5 Audit | sequence-ready verdict | 7 Engagement enrollment |
| 7b Attempt | finishing event | 7 arms next sequence |
| 7 Engagement | nudge touchpoint fires | 8 Fact-refresh (data ask) |
| 8 Fact-refresh | write-back | 10 Eligibility |
| 9 Reference-currency | reference move | 10 Eligibility |
| 10 Eligibility | every determination (incl. missing) | 11 Engine 2 (signal) |
| 11 Engine 2 | chosen motion | 7 Engagement (reactivation / nudge) |
| 12 Meeting | meeting_booked → capture write-back | 10 Eligibility (live brief) |

**Spine shape:** *seed → forward-deploy → run*, then a self-feeding *detect → engage → collect → re-detect* ring, with Reference-currency injecting faceless external triggers into the ring (`World §2.2`).

---

## Hard human gates (machine must not automate these away)

From `Seed §9` / `World §4`:

- Seed capture (stranger action)
- Firm/user provision (OLG) and OTP verify
- Database authorization
- Escrow accept
- Client opt-in / not silenced
- Meeting booking (human commitment)
- Firm responsibility to refuse illegal/unethical outreach

---

## Silences master list (not filled)

| Silence | System |
|---|---|
| Escrow release definition | 3 |
| Shape of database authorization | 3 |
| Ongoing SaaS packaging vs escrow peer door | 3 |
| Email earns Meta entry; Meta CAC | 1 |
| CASL/SMS consent regimes | 6, 1 |
| Reactivation-worthy criteria | 11 |
| Attempt criteria windows (product lock) | 7b |
| SMS reply-failure escalation | 7b |
| Event-trigger set; Operations & Actions stubs | 10 / stubs |
| Import fully mutates living list | book → 5 |
| D-01 / D-02 loop-closer builder | 12, 11 |
| Client desk depth | 8, 12 |
| Multi-consultant roles | 4 |
| Rule-pack IP/liability; Constants beyond Immigration | 9, 10 |

---

## What this Story is for next

1. **Founder challenge** this substance — missing musts, false musts, silences wrongly filled.
2. **Systems Requirements** = **spec extraction** from these statements (states, transitions, ramifications, extrusion index late) — not a second invention pass. See [`SYSTEMS-REQUIREMENTS.md`](./SYSTEMS-REQUIREMENTS.md).
3. Faces (controls / panes) bind only after Requirements name the states these musts imply.
