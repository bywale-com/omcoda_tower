**PRIOR CRAFT OUTPUT — NOT WORLD ASSEMBLY.**
Extracted from WORLD.md on 2026-07-29. This is product-craft decided in an earlier pass
(personas, seats, admission, outcomes, agent treatment, machine twin). It is retained as
reference and as the grading rubric for the craft-PM pass. **It is not an input to the PM.**
Do not cite it into the new WORLD.md.

---

# Tower V1 — World craft archive (quarantined from World assembly)

The sections below were moved **verbatim** from `WORLD.md` on 2026-07-29.

---

<!-- archived: §0.2 Persona emergence law -->
### 0.2 Persona emergence law

> A Register persona exists only if omitting them leaves a **value-chain gap** — a capability or outcome with nowhere to land.

Consequences, held strictly:

- **Org-chart roles are delegation, not seats.** Firm admin, junior associate, virtual assistant, receptionist — same **Consultant** seat, differing later by permission features. They become a seat only when a capability cannot be attributed to the Consultant without breaking a chain. (Multi-consultant roles/permissions are an open Seed unknown — see residual 23.)
- **Operator is named for closure, not for need.** Without Om Coda operating the ads, the capture, the scrape, the templates, the prepared workspace and the two hard-input requests, the Consultant's acquisition and activation capabilities dangle into "the system". Naming Operator keeps those hops honest. It does **not** grant Om Coda a product desk.
- **The agent is not a seat.** It has no capability that is not a presentation of another entity's capability.
- **The end-client's household is not a seat.** Spouse/dependant facts live on the engagement record; Seed provides no household entity, so World provides none.

---

<!-- archived: §1 Value-chain seats (§1.1–§1.4) -->
## 1. Value-chain seats

### 1.1 Consultant (firm operator) — desk seat, acquired persona

| | |
|---|---|
| **Why they exist** | Omit them and there is no stranger to prepare a workspace for, no one to authorize a database, no one to accept terms, no one to arm audits/sequences/automations, no one whose book is being worked, and no one to take the booked meeting. Every other hop in the lattice terminates on them or starts from them. |
| **Served how — acquisition** | Meta feed context → ad whose only job is to make one-tap output legible → capture of name + website + phone/email → **continue your scroll**. Pre-framed that an agent will follow and prepare, so the first message does not read as spam. No thank-you dashboard; the agent comes to them. |
| **Served how — activation** | A no-login prepared workspace staged under their firm identity, built from public firm facts plus Om Coda's own launch → re-engagement → reactivation methodology. An agent walks beside them with narration and deep links, positioned as *"I prepared this campaign"* — not *"look at our platform."* Then two requests: authorize the database, accept escrow. Unbudgeted: effort here is allowed to be non-trivial because the agent is present. |
| **Served how — application** | Passwordless sign-in into a firm-scoped workspace: **Board** (client list, phase signals, entry to a client), **Client Data** (profile, Q&A, forms, eligibility-relevant facts), **Activity / journey** (timeline of touchpoints, escalations, armed vs active), **Contacts** (directory, indicators, import), **Hub** (Audits, Agents, Automations and related workspace tabs). |
| **Served how — assisted door** | Firm and users provisioned through versioned seed manifests, then one-time-code sign-in into the same desk. Assisted onboarding can also supply the activation inputs. |
| **Purpose they serve** | So that an **Engagement contact** can be reached on a working channel, asked once for what they know, judged on current facts and current rules, left alone when they ask, and invited to a meeting that is worth their time. |
| **Primary object, by facet** | Approach session (acquisition) → Prepared workspace (activation) → the firm's book of Engagement contacts plus Hub configuration (application). |
| **Admit iff** | **Approach:** a stranger in a Meta feed who can complete seed capture. **Activation:** seed inputs landed and a prepared workspace served. **Desk:** a provisioned user row under a firm tenancy with a valid session — reached either post-activation or through assisted provision. |
| **Never see** | Another firm's book. A "create your firm from nothing" self-serve path presented as the core door. Client-private channel content the firm was never admitted to. Om Coda's internal Register tooling as product chrome. Credits or a sales call offered as equal doors at the activation payment moment. |
| **Natural needs — acquisition** | Understand what one tap yields. Give three cheap facts without a form. Be able to disbelieve cheaply and keep scrolling. Not be persuaded at. Not be asked for a database. |
| **Natural needs — activation** | See something real before giving anything hard. Check the claim without logging in. Understand that firm branding on the workspace is identity, not a claim that Om Coda already holds their clients. Authorize a database on their own terms. Face one money door with held cost. Not be asked for client personal data before the database step. |
| **Natural needs — application** | Land on a Board that looks like their own book. See phase and eligibility signals without opening every file. Bring contacts in. Know who is reachable. Author sequences that sound like the firm. Let automations re-evaluate. Read *why* someone is eligible in language, not machine output. See who is sequenced, silenced, unsequenced. Arrive at a meeting already briefed. Trust that no client is getting two motions at once. |
| **Not a persona** | Firm admin, junior associate, virtual assistant, office manager — the same seat, plus future permission features. |
| **Interest** | Booked consults and retainer starts are leaking out of a list that sits dark. Time is going into manually rechecking files as draws, permits, language results, work history and provincial facts move. Reputation is at risk from uninformed outreach. |
| **Friction** | Distrust of an outsized claim in a feed. Fear of committing data or money before proof. Zero tolerance for click cost. A book so dirty they cannot start sequences at all. |
| **Build honesty** | The desk exists in prototype shape: journeys and UI are there; runtime is largely mock or session-scoped; workflow, run and constants edits do not survive refresh; contact import opens but does not fully mutate the living list; operations and actions modules are stubs; event triggers are thinner than manual ones; one-time-code sign-in is real for provisioned users. **Approach, forward-deploy and the escrow door are a bet, not a build.** |

### 1.2 Engagement contact (Client) — desk seat, touchpoint-only

| | |
|---|---|
| **Why they exist** | Omit them and there is no eligibility subject, no fact to refresh, no meeting to book. The Consultant's entire application chain has nowhere to land, and the core outcome cannot close. |
| **Served how** | Firm-branded touchpoints only — email, text, forms, question-and-answer — delivered when their state allows outreach. Not an operator console. Not a mirror of the firm's workspace. |
| **Purpose they serve** | So that the **Consultant** can hold a current picture of their situation, offer a service that is actually available now, and close a booked meeting. |
| **Primary object** | Their own engagement record, and the touchpoints currently addressed to them. Nothing else. |
| **Admit iff** | Present in the firm's book **and** in a state that permits outreach — not silenced, past the reachability gate where the intended channel requires it, and enrolled by a sequence or automation. The firm must already be **running**; Approach never admits end-clients. |
| **Never see** | The firm's Board. The Hub's Agents or Automations editors. Any other contact. Firm-wide audit results. Another row's Analysis. Om Coda's internal Register tooling. The Approach strip or the prepared-workspace activation chrome. Escrow or any firm money surface. |
| **Natural needs** | Receive a consent request before deep collection. Understand *why this firm is messaging me*. Be asked once, for things they actually know, rather than field by field. Not be asked to produce paperwork through a form field. Be able to go quiet. Pay nothing. Be invited to a meeting only when there is a reason. |
| **Not a persona** | A spouse or dependant on the same immigration file. Their facts live on the record; Seed provides no household entity. |
| **Desk depth ceiling** | **Touchpoint-only.** Whether this ever becomes an authenticated client portal is an open Seed unknown. Do not plant a client console that mirrors the consultant's information architecture. |
| **Interest** | Timely advice at the moment their situation or the rules changed, from a firm that already knows them. |
| **Friction** | Outreach that feels like spam. Being asked repeatedly. Being asked for documents in a web form. Not being able to stop it. |
| **Facets** | **No Approach** — one Approach per acquired non-operator persona, and that is the Consultant. **No activation inputs** — they are never the payer. They appear only in **application**, only once the firm is running. |
| **Money** | Detection and engagement are free to them. They never transact with Om Coda. |

### 1.3 Operator (Om Coda house) — lattice entity, **not** a desk seat

| | |
|---|---|
| **Why they exist** | Omit them and the Consultant's acquisition and activation capabilities have no counterparty: no one serves the ad, holds the click budget, persists the capture, reads the public firm facts, instantiates the templates, serves the prepared workspace, presents the walkthrough, requests the two hard inputs, holds the terms, or flips the campaign to running. Those hops would dangle into "the system" — which is exactly the failure this law exists to prevent. |
| **Served how** | Om Coda runs the Approach surfaces and instruments them; persists captures and attributes sessions; reads public firm facts; instantiates its own methodology templates; serves the prepared workspace; presents the agent walkthrough; requests database authorization and escrow acceptance; stores the authorization, holds escrow, and flips the campaign to running; and operates the assisted door (seeded provision plus one-time-code sign-in) when ALG is not the path. |
| **Purpose they serve** | So that the **Consultant** can be acquired inside a click budget and carried to running without a sales call as a peer door, without prepayment, and without the application desk being shrunk to make the growth bet easier. |
| **Primary object** | Approach surfaces and the Prepared workspace. **Not** the firm's engagement book as operator-of-record. |
| **Admit iff** | An Om Coda house role on Approach or activation tooling. **Never** as a login on a firm's product desk. |
| **Never see / never do** | Act as the firm's consultant inside Board or Hub as though Om Coda were the client desk. Appear as a third persona in the firm's own product. Take end-client outreach decisions that belong to the firm. |
| **Natural needs** | Instrument the two acquisition failure modes separately: *did not understand* versus *understood and did not tap*. Treat continue-scroll as data rather than loss. Earn the hard inputs in the middle of activation rather than at the front. Keep escrow the only door at the payment moment. Hand off to a desk they did not have to redesign. |
| **Not a persona (desk)** | Not a consultant desk seat, and not a Register product-user seat for immigration firms. Lattice entity only. |
| **Facets** | Owns the **supply side** of acquisition (Approach) and activation (forward-deploy, hard-input requests, terms). Does **not** own application as a desk user. Feeds **evolution** by turning running-firm friction into documented gaps. |
| **Boundary residual** | Om Coda also keeps immigration reference data current as versioned data, which lands inside application. World records this as **house supply**, not as promotion of Operator to an application desk seat. Who owns rule packs — and who carries the liability — is open (residual 19). |

### 1.4 Agent — feature, not a seat

Covered fully in §8. It has no admission column anywhere in this document, and no capability of its own.

---

---

<!-- archived: §2 Facet map -->
## 2. Facet map

What must be true, per seat, per facet.

| Facet | Consultant | Engagement contact | Operator (lattice) |
|---|---|---|---|
| **Acquisition** | Meets Approach in a Meta feed. Understands one-tap output. Gives name + website + phone/email inside the click budget. May continue scrolling at no cost. Is **not** asked for a database, a payment, or an onboarding form. | **Not acquired.** No Approach, no capture, no ad. Their entry into the world is the firm's book, after the firm is running. | Serves a legible ad (never a persuasive one). Pre-frames the agent follow-up. Holds the budget at one click. Persists the capture and attributes the session. Instruments *did not understand* versus *understood and did not tap*. |
| **Activation** | Walks a no-login prepared campaign under their firm identity. Authorizes the database (or the equivalent that makes the campaign real). Accepts escrow. Effort is unbudgeted because the agent is beside them. Is not asked for client personal data before the database step. | **No role.** Never the payer, never a party to activation, never shown activation chrome. | Forward-deploys from public firm facts plus Om Coda templates. Serves the prepared workspace and narrates it. Requests the two hard inputs through the agent while automation stores, holds and flips. Keeps escrow the only door — no prepaid credits, no sales call as a peer. |
| **Application** | Runs the desk loop over the private firm book, from intake through reachability, consent, nudges, re-evaluation, reactivation and booked meeting. | Receives touchpoints, answers what they know, goes quiet if they want, books when invited. | **Not a desk user.** House supply only: keeps versioned immigration reference data current so the firm's evaluations can move without a code deploy. |
| **Evolution** | Their friction while running is the raw input. Named, not instrumented. | Their silence, non-response and complaint patterns are potential inputs. Named, not instrumented. | Turns running-firm friction into documented gaps, then written affordances or backend facets, then regenerated product. Named, not instrumented. |

**Input-contract pins.** Acquisition finish line = name + website + phone/email. Activation finish line = database authorization + escrow acceptance, after which the campaign can **run**. Forward-deploy belongs to activation. The click budget belongs to acquisition only. Nothing in this table permits moving a hard input earlier or a prepared workspace later.

---

---

<!-- archived: §3 Primary objects and admission matrices (§3.1–§3.5) -->
## 3. Primary objects and admission matrices

### 3.1 Object inventory

| Object | Role in World | Has an admission matrix here |
|---|---|---|
| **Firm** | Tenancy; owns users and the book | Via firm session |
| **Consultant (user)** | Firm operator; the acquired persona | It is a seat, not an object |
| **Engagement contact / Client** | Shared book object; touchpoint subject; eligibility subject | **Yes** (§3.2) |
| **Approach surfaces** | The acquisition strip | **Yes** (§3.3) |
| **Prepared workspace** | The activation artifact | **Yes** (§3.4) |
| **Firm session** | Desk access, both doors | **Yes** (§3.5) |
| **Audit batch** | Reachability gate over a set | Secondary — named by Consultant capability |
| **Agent sequence** | Ordered channel + copy composite | Secondary |
| **Automation workflow** | Trigger → evaluate → enroll/act | Secondary |
| **Immigration reference tables** | Versioned rule inputs | Secondary; house-maintained |
| **Signal / motion** | Detection record versus outreach decision | Not an object with states in V1 — it is the law that governs contact-state transitions |

**Cell notation, all matrices.** **V** = the persona may see the object in this state. **—** = not in view; showing it is a world bug. **T** = the persona owns a named transition out of or into this state. **V · T** = both.

### 3.2 Engagement contact (application)

| State | Meaning | Consultant | Engagement contact |
|---|---|---|---|
| `imported` | In the firm's book; not yet sequenced, no active consent | V · T *import / add* | — |
| `audit_blocked` | Fails reachability for the intended channel | V · T *fix / exclude* | — |
| `opt_in` | Consent launch active or first consent pending | V · T *arm / stop* | V · T *consent / ignore* |
| `re_engagement` | Consented; nudge cycles collecting and refreshing facts | V | V · T *reply / submit form* |
| `reactivation_armed` | Quiet or stale; criteria met; template ready, nothing sending | V | — |
| `reactivation_active` | Reactivation sequence executing | V | V · T *reply / submit form* |
| `eligible` | Rules and Analysis surfaced service eligibility | V | — *(firm-side unless a touchpoint carries it)* |
| `meeting_booked` | Core outcome closed for this cycle | V | V · T *book* (when an invitation exists) |
| `silenced` | Opted out or excluded from automatic outreach | V · T *mark / clear* | V · T *silence* |

**Happy spine.** `imported` → (reachability clear) → `opt_in` → `re_engagement` → `eligible` may assert at any point once facts exist → `reactivation_armed` / `reactivation_active` as warranted → `meeting_booked`.

**Branches.** Any state → `silenced`. `imported` → `audit_blocked` until fixed or excluded.

**Laws the matrix encodes.**

- `eligible` is a **signal**, not a motion. Reaching it does not authorize a send; Engine 2 precedence decides that separately.
- `reactivation_armed` is deliberately client-invisible. Armed means ready, not sent.
- Whether `eligible` and `reactivation_armed` coexist with a nudge is decided by precedence, never by whichever module noticed first.
- `meeting_booked` closes a **cycle**, not the relationship: facts and rules keep moving and the contact re-enters the loop.
- Two motions on one contact at once is a world bug regardless of what the matrix permits row by row.

### 3.3 Approach surfaces (acquisition) — Consultant | Operator only

| State | Meaning | Consultant | Operator |
|---|---|---|---|
| `in_feed` | Scrolling Meta; Approach context available | V | V · T *serve ad* |
| `ad_legible` | One-tap output is understood — or instrumented as understood | V | V |
| `seed_captured` | Name + website + phone/email landed — **acquisition ends** | V · T *give seed inputs* | V · T *receive, persist, attribute* |
| `continued_scroll` | Did not tap, or left — cheap disbelief | V · T *leave* | V · T *instrument* |

**Spine.** `in_feed` → `ad_legible` → `seed_captured` → handoff into the prepared workspace. **Branch.** `in_feed` or `ad_legible` → `continued_scroll`.

**Pins.** The click budget applies through `seed_captured` and nowhere else. Database authorization and escrow are **not** Approach states and must never be added as ones. `continued_scroll` is a legitimate terminal state producing data, not a funnel leak to be plugged with persuasion.

**Engagement contact: never a column here.** Approach acquires the firm, not the firm's clients.

### 3.4 Prepared workspace (activation) — Consultant | Operator only

| State | Meaning | Consultant | Operator |
|---|---|---|---|
| `forward_deployed` | No-login prepared campaign under the firm's identity; walkthrough available | V · T *walk / inspect* | V · T *deploy / narrate* |
| `db_auth_pending` | Hard input requested: authorize the firm database, or the equivalent that makes the campaign real | V · T *authorize* | V · T *request through the agent* |
| `escrow_pending` | Hard input requested: accept contingent terms | V · T *accept* | V · T *present — one door only* |
| `running` | Last activation input landed; the campaign can perform — **activation ends** | V · T *enter the desk* | V |
| `abandoned` | Left before running | V · T *leave* | V · T *instrument* |

**Spine.** `forward_deployed` → `db_auth_pending` and `escrow_pending` (order may interleave) → `running`. **Branch.** Any state → `abandoned`.

**Pins.** Forward-deploy is activation work. The firm's identity on the workspace is branding and authentication detail — never a claim that Om Coda already holds their clients. The workspace proves **readiness**; value is proved by escrow plus a real run. Marginal cost is a public read plus compute — the agent presents, automation executes. Prepaid credits and a sales call are **not** peer cells at `escrow_pending`.

**Engagement contact: never a column here.** No client PII is required to reach `running`.

### 3.5 Firm session (application, both doors)

| State | Meaning | Consultant |
|---|---|---|
| `unprovisioned` | Email is not a known user — generic success response, no code sent (so the surface cannot be used to enumerate who is a customer) | — |
| `provisioned_signed_out` | User exists; no valid session | V · T *request and verify a one-time code* |
| `provisioned_signed_in` | Valid session cookie | V · T *sign out* |

**Join note.** The ALG path provisions the user as part of activation reaching `running`. The assisted path provisions through versioned seed manifests. Same matrix, same desk, either way. Om Coda's internal Register gate is internal tooling and is not product chrome for firms.

**Engagement contact and Operator: never columns here.**

---

---

<!-- archived: §4.2 Gate versus decision chrome -->
### 4.2 Gate versus decision chrome — bug and fix

A **gate** is a hard human act that must happen. A **decision** is a rendering choice about what a persona sees. Confusing the two produces these bugs:

| Bug | Fix |
|---|---|
| Showing "eligible" as client-facing chrome on a touchpoint that only asked for one form field | Eligibility is Consultant and automation view. Seed adds no client-facing eligibility notice — do not invent one |
| Showing Board phase icons to a client | Clients never see the Board |
| Treating `reactivation_armed` as client-visible | Armed is a firm-side ghost. Clients admit at `reactivation_active`, or on a sent touchpoint |
| Implying a client can read Automations Analysis | Matrix cell is **—** |
| Showing a client any Approach, prepared-workspace or escrow surface | Engagement contact never admits on those objects at all |
| Presenting the reachability gate as a pass/fail score, a forecast, or a minimum-contact threshold | Audit asks one operational question: can we reach them and start a sequence |
| Presenting an external assessment narrative as the in-app reachability product | Sales collateral may sell trust; the in-app surface stays operational |
| Firing one nudge per missing field | One motion, one consolidated form, every outstanding self-reportable need |
| Sending a nudge while something is reactivation-worthy | Reactivation outranks nudge, always. Secondary signals become brief agenda |
| Showing a snapshot brief at the meeting | The brief is live; write-back re-evaluates immediately |
| Offering credits or a sales call beside escrow at the payment moment | Escrow is the only door at that moment |
| Asking for a database or a payment inside the Approach strip | Both are activation, both are outside the click budget |
| Narrating automation work as "the agent did it" | The agent presents, asks and routes. See §8 |

---

<!-- archived: §4.3 The ritual -->
### 4.3 The ritual (run before any persona UI)

1. Name the object in play and the persona in the seat.
2. Name the state. If you cannot name it, the state is missing from World — write it here first.
3. Walk the matrix row. Anything on screen that the row marks **—** is a world bug, not a design preference.
4. Check ownership: is this persona actually the **T** for the action being offered, or are you offering someone else's transition?
5. Check the motion law before rendering any outreach affordance: is there already a motion on this contact?
6. Check the facet: is this surface asking for something that belongs to a different layer (a hard input inside acquisition, a click budget inside activation)?
7. Only then design. Fix World before planting anything downstream.

---

---

<!-- archived: §7 Agent — feature, not a seat -->
## 7. Agent — feature, not a seat

The conversational or text agent, and the Hub's sequence composer, are **presentation and configuration** over verbs that belong elsewhere. The agent requests, responds and routes. It never fulfils.

| The agent does this (presentation) | This is **not** the agent — it is automation and wiring |
|---|---|
| Asks for name, website, phone or email on Approach | Persists the capture and attributes the session |
| Explains what the prepared workspace already shows | Forward-deploys the workspace; reads public firm facts; instantiates methodology templates |
| Asks the consultant to authorize the database and accept terms | Stores the authorization, holds the terms, flips the campaign to running |
| Points at "arm this reachability check" or "send this sequence" in the Hub | Runs the reachability pull, enrols contacts, sends messages on schedule |
| Answers "why is this person eligible?" by routing to Analysis | Evaluates immigration rules against Client Data |
| Presents a consolidated form to a client | Decides that a nudge may fire at all, under precedence |
| Narrates what the brief says | Re-evaluates on write-back and keeps the brief live |
| — | Sends one-time codes, issues session cookies, moves money |

**Consequences held in this document.**

- The agent has **no admission column** in §3. It cannot, because it has no state of its own to be admitted to.
- Every capability it appears to have is an Operator or Consultant capability being presented.
- Composing a sequence is configuration; sending it is automation. Both may appear in the same Hub, and they are not the same act.
- Never label the automation runtime or the authentication service as "the agent doing work." Doing so is how a presentation feature quietly becomes an unaccountable seat.

---

---

<!-- archived: §8 Machine twin -->
## 8. Machine twin

`src/app/register/theory/world.ts` is the machine twin of this document. It exports the world sentence and shape, the seat profiles, the four admission arrays, and `admits(persona, object, state)`.

**Rules of the twin.**

- Persona UI and anything downstream **must** call `admits()`. Never hand-roll visibility that contradicts §3.
- `admits()` returns true for **V** and **V · T**, false for **—**. **T** is ownership of a transition, not a licence to view.
- Structural guarantees the twin enforces: Operator never admits on the engagement contact or the firm session; the Engagement contact never admits on Approach or the prepared workspace; only the Consultant admits on the firm session, and never in the unprovisioned state.
- State names in this document are unchanged from the current twin, so existing admission arrays and matrices remain valid as written.
- If this document and the twin disagree, **this document wins** and the twin is a bug — and if Seed and this document disagree, **Seed wins** and this document is a bug.

---

---

