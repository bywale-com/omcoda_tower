# Tower — Seed (dense provision)

**Product:** Tower  
**Company:** Om Coda  
**Audience / buyer:** Immigration consultancies (B2B firm operators)  
**As of:** 2026-07-27  
**Status:** Validated 2026-07-27 — World derived in `WORLD.md`  

**Law of Seed:** Everything we know, every assumption, every bet — product *and* how they get in. Under-provisioning Seed is the primary cause of thin Worlds — ecosystems that look complete on the page but lack enough density for seats, admission, and outcomes to stay honest. World is *derived* from this dump by a world-builder BA; agents must not invent business facts outside it.

**Related sources folded in (Seed wins on conflict):** `docs/ideas/tower-product-vision.md`, `docs/ideas/audit-module.md`, `docs/product/psd/tower/PSD-tower-v0.4.0.md`, `docs/product/immigration-rules-engine2-giveback.md`, `docs/product/auth-service-contract.md`, `docs/product/database-seeding-protocol.md`, How graphs (`consultantOnTower`, `towerCoreOutcome`), ALG acquisition/activation conversation (2026-07), operator shape bets in [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md), channel methodology first pass in `guidelines/Reactivation.md`.

---

## 0. The bets we’re making (read first)

### 0.1 Product bet (why Tower exists)

**We are betting that immigration firms will pay for an always-on system that engages their dormant and active contacts, keeps immigration facts fresh through firm→client touchpoints, re-evaluates service eligibility as IRCC-shaped rules and client facts move, and surfaces when someone is campaign-worthy — so consultants book meetings without manually rechecking every file.**

Tower is **not** a reactive CRM (“what do I do when someone emails?”). It is **proactive eligibility wrapped in engagement**.

**One-line value:** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

### 0.2 Growth bet (how firms get in — ALG)

**ALG** = agent-led growth: cheap acquire + get to proof without a sales call as the primary door and without making the stranger self-serve through a long onboarding form. (Defined fully in §6.)

**We are betting that immigration consultancies will convert into *running* Tower clients through ALG — not through sales calls as the primary door and not through self-serve onboarding forms — if one tap in a Meta feed makes a prepared campaign workspace legible, cheap public seed inputs provision that workspace, and an agent earns the hard inputs (database authorization + escrow) before the campaign actually runs.**

Compressed growth bets:

1. **Acquisition:** Consultant scrolling Meta (FB/IG) gives name + website + phone/email within a **click budget** if they understand what one tap yields — without persuasion theater. Pull, not push. “Email enters on evidence, not on ideas.”
2. **Activation:** From those seed inputs alone, automation **forward-deploys** a no-login prepared workspace (Om Coda launch → re-engagement → reactivation methodology staged under their firm identity) and an agent walks them until they authorize DB access and accept **escrow** — then the campaign can **run**.
3. **Application retention:** Once running, the always-on desk loop (below) is what retains and justifies ongoing money — **without reshaping the application desk** for the acquisition experiment.
4. **Anti-bets:** Cold email is not V1 on ideas. Credits and sales-call are not peer doors at activation. Public-before-contact detection of *end-client* eligibility is not Tower. **Agent is never fulfillment** — the chat/voice surface does not *do* the work (it does not scrape the firm site, instantiate campaign templates, fire sequences, evaluate rules, send OTP, or move money). Those jobs belong to Automations and Wiring; the agent only presents, asks, and routes the human toward them.

If the growth bet is wrong, we learn it cheaply on ads and a planted click-through of the feed→capture journey — not by rebuilding the product first.

### 0.3 Contingent-cost bet (Om Coda money posture)

Across Om Coda products we prefer **contingent cost**: the buyer’s cost is zero (or held) until outcome terms are met. For Tower ALG activation, the presented door is **escrow**, not prepaid credits. Ongoing SaaS packaging may still exist later — it must not replace escrow as a peer door at the activation payment moment.

### 0.4 Agent bet

**Agent = presentation only** (request / respond / route). Picture the split:

| Agent does (presentation) | Not agent — Automations / Wiring |
|---------------------------|----------------------------------|
| Asks for name, website, phone/email on Approach | Persists the capture and attributes the session |
| Explains what the prepared workspace already shows | Forward-deploys the workspace; scrapes public firm facts; instantiates Om Coda methodology templates |
| Asks the consultant to authorize DB access / accept escrow | Stores the authorization; holds escrow; flips campaign to **running** |
| Points at “arm this audit” / “send this sequence” in Hub | Runs the audit pull, enrolls contacts, fires messages on schedule |
| Answers “why is this person eligible?” by routing to Analysis | Evaluates immigration rules against Client Data |

Never label Automations runtime or Auth Service as “the agent doing work.”

---

## 1. What Seed is (and is not)

| Seed is | Seed is not |
|---------|-------------|
| Bets, market, product mechanics, eligibility law, Hub modules, engagement philosophy, ALG lattice, money, gates, prototype honesty, assumptions, open decisions | Derived ecosystem (**World**) |
| Enough density that a BA can derive seats, admission, and facet outcomes without inventing the business | SME Pass1 answers or platform strategy from SMEs |
| Both **application truth** and **how strangers become running clients** | A funnel sketch or a feature backlog |

**Activation sets the target; acquisition fulfills the seed quota.** Application is the desk that performs once running. Evolution is product change from running feedback — named, lightly specified here.

---

## 2. Market & buyer

### 2.1 Who buys

Immigration consultancies / practices that hold or can obtain **contact lists** (past clients, leads, CRM exports, spreadsheets) and sell immigration services (pathway advice, applications, retainers). Primary operator: **consultant / firm operator** at the desk.

### 2.2 What they lose today

- Booked consults and retainer starts when eligible people sit dark in a list.
- Consultant time spent manually chasing and re-checking files as IRCC draws, permits, language, work history, and province facts move.
- Trust erosion when outreach is spammy or uninformed; or when the firm’s own list is so dirty they cannot start sequences.

### 2.3 What the contact loses

Timely advice when their situation or the rules changed and nobody re-engaged them.

### 2.4 Who holds the list

The **firm**. End-client eligibility is **private** — computed from firm-held + engagement-collected facts and firm-configured / Om Coda–shipped rules. Tower does **not** cold-detect strangers’ immigration eligibility from public databases as Core Function. (Other Om Coda bets can run on public records before contact; Tower cannot — the firm already holds the list.)

### 2.5 Adjacent incumbents (not Tower)

| Incumbent class | Why insufficient |
|-----------------|------------------|
| Classic CRM | Reactive inbox / pipeline — waits for the human |
| Marketing automation | Blasts without immigration rule depth or re-evaluation loop |
| Spreadsheet + memory | No always-on re-crunch; no sequence system |
| Sales “database opportunity assessment” HTML | Trust-building collateral — **not** the in-app Audit product |

### 2.6 Geography / program shape (working assumption)

Product language and prototype center on **Canadian immigration** pathways (Express Entry / CEC / FSW / FST / PNP, CRS draws, ECA, EE profile freshness, category draws, etc.). Seed does not forbid other countries later; V1 truth and matrix are Canada-shaped. SME must validate program coverage and liability of shipped rule packs.

---

## 3. What Tower is / is not

### 3.1 Is

- A **proactive eligibility engine wrapped in engagement** for immigration firms.
- Always-on: sequence → data in → rules out → next nudge / reactivation / meeting path.
- Firm-scoped workspace: Board, Contacts, Client Data, Hub (Audits, Agents, Automations), Activity / engagement visibility.
- Immigration-specific sequences as a **firm → client free value-add** (“staying informed” / eligibility freshness), not a one-time assessment.
- Rule-centric: when draws move or facts change, recalculate what they qualify for *now* and decide what to send next.

### 3.2 Is not

- A reactive CRM.
- A public finder / scrape-first acquisition of end-clients.
- A money transmitter holding immigrant funds.
- A sales ROI ceremony dressed as Audit.
- An Agent desk / Agent seat (Agent is a feature).
- A full end-client operator console in V1 (touchpoints only — Known unknown if that changes).

---

## 4. Core molecular outcomes (application language)

These are the desk truths How Analysis already carries. World folds them into seats and admission; do not delete the DNA.

**Core outcome (always-on):**

> Tower automatically detects eligible candidates and initiates a campaign to get them to book a meeting.

Meaning locked in How:

- Eligible = **service-eligible** candidates under rules / matrix.
- Campaign = **launch, nudge, or reactivation** (and related enrollment).
- Success = **meeting booked**.
- Continuously, while the firm has contacts in Tower and hands-free operation is enabled / armed.

**Access outcome:**

> A consultant signs in to Tower and lands in their firm workspace.

(OTP → Board with firm client list.)

---

## 5. Core loop (application mechanics — dense)

```
Contacts / import
  → Audit (reachability / sequence-start gate)
  → Standard engagement sequence (opt-in → re-engagement nudges → …)
  → Collect & refresh Client Data via touchpoints
  → Rule engine / Automations (re-evaluate eligibility — R-* / B-* / Analysis)
  → Nudges / escalations / reactivation / consultant signals
  → Meeting booked (loop-closer — see Engine 2)
  → (repeat as facts & rules move)
```

### 5.1 Contacts enter the book

- Sources: CRM export, spreadsheet, lead list, manual add.
- Prototype: Contacts sidebar + CSV import UX; **CSV does not fully mutate** the living list yet (honesty).
- Channels matter: email and/or phone must be usable for the intended sequence channel.

### 5.2 Audit (Hub → Audits)

**Operational question only:**

> Can we reach this contact, and can we start a sequence on them?

Audit runs against **imports / the book** as **data-validity checks** (email valid, phone valid, channel match to the intended sequence, dedupe, already-in-Tower, consent/silenced, name present) — not pathway scoring and not sales ROI. Checks are intended to connect to **external validation systems** where needed. The job is to make contacts **sequence-ready** for Agents / Automations.

| In scope | Out of scope (not Audit) |
|----------|---------------------------|
| Email valid, phone valid, ≥1 reachable channel matching sequence | Pathway / CRS scoring |
| Typo/garbage, dedupe, already-in-Tower, consent/silenced, name present | Activation probability / ROI forecasts |
| Open reachability issues as Hub meta | Minimum contact-count gates; sales PASS/FAIL ceremony |

**Verdicts (conceptual):** Reachable / Partial / Unreachable.  
**Secondary benefit:** Dirty list teaches the firm their DB is stale — byproduct, not the engine.  
**Sales vs product:** External “Database Opportunity Assessment” HTML is **marketing**. In-app Audit must feel **operational**.

Shape bets (open-box Hub, eventual agency view): [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md).

### 5.3 Engagement phases (product model)

| Phase | Purpose |
|-------|---------|
| **Opt-in** | Firm → client; consent and first channel open |
| **Re-engagement (nudges)** | Ongoing touchpoints; collect and refresh data |
| **Reactivation** | Re-engage dormant / quiet contacts when rules or data warrant |

**Board phase language (prototype):** opt-in, re-engagement, reactivation; also silenced / opted-out indicators; reactivation can be **armed** (ghost template ready) vs **active** (sequence executing).

**Contact indicators (prototype):** sequenced / silenced / unsequenced (silenced when not opted in).

### 5.4 Nudges are not spam — they are the data collection mechanism

Each touchpoint can ask for or infer facts that affect eligibility: work history, language, permit expiry, province, job change, EE profile freshness, ECA status, etc.

**Collectible field classification (settled law):**

| Flag | Meaning | Downstream |
|------|---------|------------|
| **Self-reportable** | Client knows offhand (scores, dates, statuses) | Eligible for forms / pre-meeting capture |
| **Document-dependent** | ECA reports, LMIA paperwork, employer revenue, etc. | **Never** enter a form; become tracked **Manage** items |
| **Employer-directed** | Ask is aimed at the **firm**, not the client | Separate routing |

### 5.5 Agents (Hub → Agents)

- Author **sequences**: ordered steps of channel + copy (email, SMS, tasks today; extensible).
- Reactivation / launch agents are **composites** of those steps.
- Automations **select / enroll** agents as actions when criteria match (How: Automations trigger reactivation agent when criteria met).
- Agent composer is config UI; runtime send is automation/Wiring.

**Two sequencing layers (don’t conflate):**

1. **Campaign day calendar** (opt-in / reactivation content order) — `guidelines/Reactivation.md`.
2. **Attempt / channel-ownership engine** (what Sarah’s nudge shows: Text → Email → Form, Attempt 1/2/3 under the owner that failed, criteria windows, forward-only handoff) — reference story in `src/app/data/sarahNudgeTimeline.ts`; laws in [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) §5b and `docs/product/engagement-chart-gantt-decisions.md`. Authored in Agents; Activity is the event record only.

### 5.6 Automations (Hub → Automations) — peer modules

Product model (not nested under Rules):

| Module | Role |
|--------|------|
| **Trigger** | Starts run; pulls scoped records (manual rich; event thinner) |
| **Constants** | Industry criteria (Immigration rich; Legal / Financial / Insurance placeholders) — versioned packs; segment swap bet |
| **Conditions (If)** | Branch gate; AND/OR; true/false pass-through |
| **Operations** | Transform/compute — stub |
| **Rules** | Pre-packaged evaluators over constants + industry conditions; Immigration · Service eligibility → R-* / deltas / B-* + Analysis (open box, not sealed) |
| **Actions** | Downstream side effects — stub |

**Canonical flow:** Trigger pulls → Rule and/or If evaluate → structured output → downstream nodes resolve `lastInput` (branch-aware).

**Manual trigger:** applies-to data classes/scopes, filters, enrollment summary, play/stop against pulled rows.

**Shape bet:** same graph + new Constants/Rules pack ≈ new vertical with a similar firm-book shape; evaluation stays inspectable (agency/operator view is the intended eventual home — today Hub sits in the firm workspace). See [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md).

### 5.7 Eligibility / immigration matrix (product claim)

- Outcome families (pathway, gaps, ops, category, draw) toggled in Rule config — not primarily hand-wired condition graphs in the primary UI.
- Pathway pass = **any** pathway assertion (CEC **or** FSW **or** FST **or** PNP-*), not CEC-only (Directive 2 law).
- Reference tables (categories, trades, cutoffs, OINP IDS, etc.) are **versioned data Tower maintains** — no code deploy to update (Directive 3).
- Analysis pane: human-readable headlines, nudge/reactivation hints, B-* services, narratives, deltas; JSON retained for power users.

**Fields that unlock gaps/ops (examples):** `eca_status`, `ee_profile_exists`, `ee_profile_last_updated`, `foreign_work_years`, plus existing language/TEER-style gates, CRS/draw constants.

### 5.8 Engine 2 law — signal / action (settled; orchestration open)

Every detection — including **missing-data** — is recorded as a **signal** when found. Outreach is decided separately by fixed precedence:

1. **Reactivation first, always** if anything is reactivation-worthy.
2. **Nudge only** when nothing is reactivation-worthy.
3. When a nudge fires, consolidate **every** outstanding self-reportable need into **one form** — never one nudge per field.
4. When reactivation fires, secondary signals attach as **agenda** to the consultant’s **pre-meeting brief** — no parallel outreach.
5. **One client, one motion, ever.**

**Loop-closer (behavior settled; builder open):**

- On `meeting_booked` with outstanding self-reportable fields → data-capture form pending the meeting.
- Write-back (form or consultant entry) → **immediate re-evaluation**.
- Brief is **live**, not a snapshot.

**Open decisions:**

- **D-01:** Pre-meeting capture = tail of reactivation sequence vs standalone `meeting_booked` sequence.
- **D-02:** Which module is the in-meeting fallback surface for unresolved form gaps.

### 5.9 Consultant visibility surfaces (application)

| Surface | Job |
|---------|-----|
| **Board** | Client list, phase signals, entry to client |
| **Client Data** | Profile, Q&A, forms, eligibility-related facts |
| **Activity / Journey / engagement chart** | Timeline of touchpoints, escalations, armed/active states |
| **Contacts** | Directory + indicators; import |
| **Hub** | Audits, Agents, Automations (and related workspace tabs e.g. constants) |
| **Login** | Passwordless OTP marketing/app entry |

### 5.10 Auth & tenancy (application / OLG path)

- Firms + users enter via **versioned seed manifests** only (no ad hoc SQL) — assisted onboarding / bootstrap.
- Passwordless OTP: send → verify → `tower_session` HttpOnly cookie.
- Unprovisioned emails: **generic 200**, no code (anti-enumeration).
- Session validation for route guard; logout clears cookie.
- Register gate (`REGISTER_PASSWORD`) is **internal Om Coda tooling**, not product chrome for firms.

---

## 6. ALG lattice (growth — dense)

### 6.1 Definitions (corrected)

| Term | Meaning |
|------|---------|
| **Acquisition** | Obtain **seed inputs** required to *provision*, from a stranger, autonomously, within click budget. Ends when seed inputs land. |
| **Activation** | Systemize path from provisioned stranger → **last inputs required to run**. Includes forward-deploy and earning hard inputs. Ends when campaign can run. |
| **Application** | Desk/product performing Core outcome once running. |
| **Running** | After last activation input; campaign performs without asking for more *required* activation inputs. |
| **Evolution** | Product changes from running-client feedback through Register passes (a friction becomes a documented gap, then a written affordance or backend facet, then regenerates into the product). Not a client lifecycle phase. |
| **Approach** | Acquisition strip of surfaces: feed → ad → capture → continue scroll (entry surfaces are product surfaces). |
| **Agentic acquisition** | Self-managing ads later — **not** required for ALG. Hand-built ads + automated post-click is still ALG. |

**Growth models (same input set; different supplier):**

- **OLG/SLG** — operator collects inputs (call / assisted).
- **PLG** — persona fills forms themselves.
- **ALG** — cheap public seed given; system extrapolates / forward-deploys; agent earns hard inputs mid-activation.

We had been wrongly attributing activation work to acquisition. **Activation sets the target; acquisition fulfills the seed quota.**

### 6.2 Acquisition input contract (finish line)

| Input | Notes |
|-------|--------|
| Name (firm / consultant) | Public / freely given |
| Website | Public |
| Phone **or** email | Channel for agent follow-up |

**Channel V1:** Meta (Facebook / Instagram). LinkedIn deferred.  
**Click budget:** stranger → these inputs only. Force at **one click** as design constraint; relax only as a finding. Easier to add clicks than remove.  
**Approach strip:** feed context → ad → capture → **continue your scroll**.  
**Ad job:** make one-tap **output legible** — never persuade. Hypothesis: if they understand what they receive, a meaningful share taps; non-tappers self-select out (data). Instrument two failure modes: don’t understand vs understand and don’t tap.  
**Pre-frame:** ad must establish that an agent will follow / prepare — else first text reads as spam.  
**Post-capture surface:** continue scroll — agent comes to them (not a thank-you dashboard).

### 6.3 Activation input contract (finish line)

| Input | Notes |
|-------|--------|
| Authorization / authentication into **firm database** (or equivalent that makes the campaign real) | Hard; after demonstration |
| Acceptance of payment terms — **escrow** | Contingent; one presented door |

**Unbudgeted.** Agent walks beside them.

**Forward-deploy (∈ activation, not acquisition):**

- After acquisition inputs land: scrape **public firm facts**, instantiate from **existing Om Coda templates** (launch → re-engagement → reactivation — methodology is Om Coda’s, **not** derived from their client list).
- Serve **no-login prepared workspace** + agent text walkthrough / deep links.
- Positioning: **“I prepared this campaign,”** not “look at our platform.”
- Firm identity = authentication / branding detail — **not** a claim we already have their clients.
- Marginal cost ≈ scrape + compute (agent presents; automation executes).
- Prepared workspace proves **readiness**; **value** proves via escrow + run.

**Payment doors:** Escrow only as peer door at this moment. Credits = prepayment (breaks contingent promise). Sales-call as equal door pulls ALG → OLG — do not present as peer.

**What activation is not:** Redesigning the application to need fewer inputs. That would change Seed/World application constraints. We did **not** make that move; desk stays.

### 6.4 Structural gap vs public-detection products (honest)

Some products can take one cheap **public** fact (e.g. a legal business name or a parcel ID) and that fact is already enough to run real detection. Tower is different: real end-client eligibility needs **the firm’s book** — so Approach must **not** demand database upload inside the click budget. Forward-deploy + escrow splits proof: readiness before hard inputs; value after.

### 6.5 OLG / assisted path (still real)

Seed manifests + OTP remain a valid bootstrap into the same application and can supply activation inputs via assisted onboarding. ALG is the **growth bet**; OLG is not deleted.

### 6.6 Pass order (methodology)

```
seed → world → acquisition (click budget) → application → wiring
```

Single Wiring across acquisition↔activation seams (attribution, provision-on-capture, first outbound, consent). Approach surfaces get the same Register discipline as desk surfaces (decomposition, admission, gap writing, affordance writing) — and on Approach, affordance writing is mostly **persuasion texture**, not desk inhabit. One Approach per **acquired** non-operator persona (Tower V1: Consultant). Operator never needs an Approach as acquired stranger.

---

## 7. Money (full)

| Question | Answer |
|----------|--------|
| Who pays Tower? | The **firm** |
| Do end-clients pay Tower? | **No** — engagement is firm→client value-add |
| First ALG money moment | **Escrow** at activation (contingent until outcome terms) |
| Escrow release definition | **Known unknown** — must be specified before spend |
| Ongoing packaging | SaaS / seats / usage — **Known unknown**; not a peer door at activation |
| Credits | Available later if asked; **not** peer door at activation |
| Sales-call | Not peer door at activation |
| Detection cost to contact | Free to the contact |
| Escrow / immigrant funds | Tower is **not** holding immigrant settlement funds; escrow here is **firm↔Om Coda** commercial terms |

---

## 8. Trust, consent, zero-risk

### 8.1 Firm / consultant

- First ALG touch: legible one-tap claim; disbelief OK if cheap to check (continue scroll).
- First desk touch (OLG or post-activation): land on Board that looks like their book.
- Outsized-but-true claims must survive skeptical feed + platform review (SME: anti-scam / ad policy species).

### 8.2 End-client

- Firm-branded value-add; clear why this message.
- Opt-in before deep collection; respect silence / opted-out.
- No payment to Tower.
- **Do not invent “skip all opt-in because ALG.”** Firm DB auth ≠ end-client consent. CASL/SMS consent for first agent text and for client outreach are SME-critical.

### 8.3 Sales collateral vs product

External assessment narratives may sell trust. In-app Audit / Board / Hub must stay operational.

---

## 9. Hard human gates (inventory)

| Gate | Layer | Why human / hard |
|------|-------|------------------|
| Seed capture (name/site/channel) | Acquisition | Stranger action — but cheap |
| Firm/user provision (OLG) | Application bootstrap | Intentional tenancy |
| OTP verify | Application | Prove email control |
| DB authorization | Activation | High-trust firm act |
| Escrow accept | Activation | Money / terms |
| Client opt-in / not silenced | Application | Ethics + law |
| Meeting booking | Application | Human commitment |
| Illegal / unethical outreach | Application | Firm responsibility |

**Not Tower gates:** officer POA, finder licensure, state disbursement (other products’ worlds).

---

## 10. Primary objects (named for World)

| Object | Role |
|--------|------|
| Firm | Tenancy; owns users and book |
| Consultant (user) | Firm operator; acquired persona V1 |
| Engagement contact / Client | Shared book object; touchpoint subject |
| Audit batch | Reachability gate over a set |
| Agent sequence | Ordered channel+copy composite |
| Automation workflow | Trigger → evaluate → enroll/action |
| Approach surfaces | Acquisition strip |
| Prepared workspace | Activation artifact (no-login) |
| Immigration reference tables | Versioned rule inputs |
| Signal / motion | Engine 2 detection vs outreach |

**Agent = feature, not object seat.**  
**Operator (Om Coda house)** may appear in Approach/activation facets as a lattice entity — not a firm Board seat.

---

## 11. Prototype honesty (do not let agents claim shipped)

| Claim | Reality (PSD-tower-v0.4.0 era + Register work) |
|-------|-----------------------------------------------|
| Always-on loop | Shape in UI + journeys; runtime largely mock/session |
| Automations evaluate eligibility | In-browser mock; R-*/B-* Analysis; not persisted |
| Rule coverage | Improved (FSW/FST/PNP any-pathway); category/list still table-dependent; some stubs remain |
| Operations / Actions | Stub |
| Event triggers | Thinner than manual |
| Auth OTP | Real Auth Service for provisioned users |
| Persistence | Workflows/runs/constants: session / static TS — refresh loses edits |
| CSV import | Dialog exists; does not fully mutate living list |
| ALG Approach / forward-deploy / escrow door | **Bet — not built** |
| Client operator desk | **Not** V1 |
| Engine 2 orchestration / loop-closer builder | Behavior partly settled; D-01/D-02 open; not built |
| Systems Register | Theory workspace in progress; not product |

---

## 12. Assumptions register (explicit)

### Product / market

1. Firms have or can export contact lists worth engaging.
2. Always-on re-evaluation + engagement beats manual chase for this buyer.
3. Immigration-specific sequences as free value-add is acceptable firm→client positioning.
4. Canada-shaped pathway matrix is the right V1 domain depth.
5. Om Coda–shipped rule packs + firm config can be made liability-safe enough to ship (KU: IP/liability).
6. Meeting booked is the right Core success metric for V1.
7. Touchpoint-only Client is enough until Seed KU on desk depth closes.

### Eligibility / Engine 2

8. Signal/action precedence (reactivation > nudge; one motion) is correct ops law.
9. Self-reportable vs document-dependent classification is enough to drive forms vs Manage.
10. Live brief on meeting_booked is correct loop-closer behavior once D-01/D-02 resolve.

### ALG / growth

11. Meta can reach immigration consultants at acceptable CAC.
12. Name + website + channel suffice to provision a credible prepared workspace from templates + public firm facts.
13. Consultants will understand “one tap → prepared campaign + agent follows” if the ad is legible; disbelief is good if cheap to check.
14. Escrow is acceptable as first money door; firms will authorize DB after readiness demo.
15. Forward-deploy does not require firm client PII before DB auth.
16. Om Coda methodology campaigns are sufficient **readiness** proof; value proof is escrow + run.
17. Application desk need not reshape for the ALG bet to be testable.
18. Consent/CASL can coexist with firm DB auth + client opt-in model (**SME-test — not closed**).

---

## 13. Known unknowns & open decisions

1. Exact escrow terms / release outcome definition.  
2. What “database authorization” means per practice stack (OAuth CRM vs CSV export — must not silently move into acquisition click budget).  
3. Meta targeting quality / CAC for this professional audience.  
4. Client desk depth (touchpoint-only vs authenticated portal).  
5. D-01, D-02 (loop-closer builder representation).  
6. Multi-consultant / roles / permissions inside a firm.  
7. CRM sync bidirectional.  
8. When/whether email channel earns entry from Meta evidence.  
9. Rule-pack ownership / IP / liability (Om Coda vs firm-authored).  
10. Production firm onboarding protocol beyond seed manifests.  
11. Evolution instrumentation (which running signals become documented product gaps).  
12. Persistence target for workflows (local vs firm backend).  
13. Whether Rules stay outcomes-toggle-primary or expose condition trees (O-12).  
14. SMS/email consent regimes by geography for firm→client and agent→consultant first text.  
15. Channel-order escalations when SMS Y-reply fails; no-login eligibility view as core vs static page (see `guidelines/Reactivation.md` open questions).  
16. Whether Constants industry packs beyond Immigration stay placeholders or ship as real segments (domain modularity bet — [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md)).

---

## 14. Never invent (Seed hard stops)

- Public-before-contact **end-client** eligibility detection as Core  
- Agent seat / Agent column in admission  
- Full Client operator console mirroring Hub (until KU closes)  
- Operator as firm Board login persona  
- Credits or sales-call as peer doors at activation payment  
- DB auth or escrow inside acquisition / click budget  
- Forward-deploy as acquisition  
- Skip all client opt-in because ALG  
- Cold email V1 Approach on ideas  
- Contingency/escrow as the *only* money forever (SaaS later allowed as KU — escrow is first ALG door)  
- Officer POA / finder licensure / state disbursement as Tower gates  
- Treating sales assessment HTML as in-app Audit  
- Claiming live backend persistence or production ALG Approach as shipped  

---

## 15. SME chairs to name later (scoping — not Pass1)

After Seed validation + World, SME-scoping seat produces roster with closure reasoning. Likely lanes (not final):

1. Immigration pathway / EE / PNP eligibility ops  
2. IRCC reference data currency  
3. Canadian privacy / CASL / SMS consent (client + first agent text)  
4. Immigration consultancy desk operations  
5. Automation / enrollment / audit ops (reachability vs analytics)  
6. Platform ads / Meta policy / in-feed capture  
7. Trust / anti-scam (outsized-but-true feed claims)  
8. Payments / escrow mechanics  
9. Consultancy CRM / data-connection patterns  

---

## 16. Doctrine pins (do not dilute)

1. Product bet = always-on eligibility + engagement → meeting booked.  
2. Growth bet = ALG Approach → forward-deploy activation → running desk.  
3. Activation sets target; acquisition fulfills seed quota.  
4. Finish lines = **input sets**, not a vague yes.  
5. Forward-deploy ∈ activation; click budget ∈ acquisition only.  
6. Entry surfaces are product surfaces (Approach).  
7. One Approach per acquired non-operator persona.  
8. Ad = legibility; never persuade.  
9. Nudges = data collection; not spam.  
10. Audit = reachability; not sales ceremony.  
11. Engine 2: reactivation > nudge; one client, one motion.  
12. Agent presents; automation executes.  
13. Escrow-only door at activation payment moment.  
14. seed → world → acquisition → application → wiring (single Wiring).  

---

## 17. Instruction (after human validates this Seed)

**Validated.** World derived: [`WORLD.md`](./WORLD.md) + `admits()` twin. Prefer under-claim. Mark residuals. Do not invent against §14. Next gate: SME Pass1 when you say.
