# Tower — Systems Story (systems-analyst, first pass)

**Seat:** Systems analyst — *architects the system* (the CTO later builds/wires it).
**Method:** the system told from its own point of view, technology-free, as a web of **initiations**. The atomic unit is a **trigger** (an entity or event that initiates); **inputs** and **outputs** hang off it. A trigger exists whether or not any person clicks or any screen shows. Controls/views are not designed here — only noted, at most, in passing. Silences are marked, never filled.
**Source (hard constraint):** derived from [`SEED.md`](./SEED.md) + [`WORLD.md`](./WORLD.md) **alone** — no How leaves, SME, enrichment/furnish, wiring, implementation, or code; no existing controls/views. The point of this pass is to show what Seed + World *already* seed.
**Status:** First pass. Under-claim; where Seed/World are silent, the gap is named, not filled.

---

## The systems latent in Seed + World

Twelve distinct systems are derivable. They fall in the four-facet order (`Seed §6.1`, `World §1.4`) but each is its own initiation-engine:

1. **Acquisition (seed-capture)** — a stranger's one-tap yields the three cheap inputs.
2. **Provision / forward-deploy** — seed inputs landing initiates a prepared campaign.
3. **Commercial / hard-input** — earning database authorization + escrow flips a campaign to *running*.
4. **Tenancy & access** — provision, prove email control, hold a session.
5. **Reachability / audit** — decide whether a contact can be reached and sequenced.
6. **Consent / suppression** — opt-in, silence, opt-out govern who may be touched.
7. **Engagement / sequencing** — two non-conflatable engines: the campaign calendar and the attempt/channel-ownership engine.
8. **Fact-refresh / data-collection** — touchpoints carry data asks; answers write back.
9. **Reference-currency** — versioned immigration reference facts move as data.
10. **Eligibility re-evaluation** — recompute service eligibility when facts or reference move.
11. **Signal / motion orchestration (Engine 2)** — record every detection; decide the single motion by precedence.
12. **Meeting / loop-closer** — a booked meeting initiates capture, agenda, and a live brief.

---

## Each system, as initiations

### 1. Acquisition (seed-capture) system
- **Triggers:** a scrolling consultant taps the one-tap Meta Approach (`Seed §6.2`, `World §1.2`); a consultant *continues the scroll without tapping* — a first-class non-action trigger that self-selects a non-tapper and is itself data (`Seed §6.2`, `World §1.1 / §0.4`).
- **Inputs consumed:** firm/consultant name, website, and one channel — phone **or** email; the feed/ad context that made the one-tap output legible (`Seed §6.2`).
- **Outputs / state changes:** seed inputs land (acquisition finish line reached) (`World §0.3.2`); an attributed capture of the session; a distinction recorded between *did not understand* and *understood and did not tap* (`Seed §6.2`); the stranger is returned to their scroll — no thank-you surface (`Seed §6.2`).
- **Chains to:** *seed inputs land* is the trigger of the Provision system.

### 2. Provision / forward-deploy system
- **Triggers:** seed inputs land for a stranger firm (`Seed §6.3`, `World §1.2`).
- **Inputs consumed:** the three seed inputs; public firm facts read from the open world; Om Coda's own launch → re-engagement → reactivation methodology templates (not the firm's client list) (`Seed §6.3`).
- **Outputs / state changes:** a no-login prepared workspace staged under the firm's identity; a campaign in a not-yet-running state that proves **readiness, not value** (`Seed §6.3`, `World §0.4 / §1.3`).
- **Chains to:** the prepared workspace becomes the object the Commercial system's agent walks; readiness legibility is the precondition of asking for hard inputs.

### 3. Commercial / hard-input system
- **Triggers:** the firm operator authorizes access to the firm's book (or the equivalent that makes the campaign real); the firm operator accepts escrow terms (`Seed §6.3, §7`, `World §1.2`); *escrow release terms are met* (a trigger the docs assert exists but leave undefined — see Silences).
- **Inputs consumed:** the readiness demonstration (prepared workspace); the presented escrow door (the only peer door at this moment — not credits, not a sales call) (`Seed §6.3, §7`).
- **Outputs / state changes:** the two hard inputs land (activation finish line); the campaign flips to **running** (`Seed §6.1`, `World §0.3.2`); held commercial terms between firm and Om Coda are established (Tower holds no immigrant funds) (`Seed §7`).
- **Chains to:** *running* is the trigger that opens the entire Application desk (Audit, Engagement, Eligibility loops) to that firm.

### 4. Tenancy & access system
- **Triggers:** an operator provisions a firm and its users via versioned seed manifests (assisted/OLG door) (`Seed §5.10, §6.5`); a known user requests entry (one-time-code send); a user submits the code (verify); a session is presented for a guarded action; a logout (`Seed §5.10`); an *unprovisioned* email requests entry (`Seed §5.10`).
- **Inputs consumed:** the manifest; the user's email; the submitted code; the presented session (`Seed §5.10`).
- **Outputs / state changes:** a provisioned firm tenancy and users; a verified session held after send→verify; on an unprovisioned email, a generic success with **no code issued** (anti-enumeration) — a deliberately *silent* output (`Seed §5.10`); session cleared on logout.
- **Chains to:** either provision door (assisted here, or running from the Commercial system) lands the firm in **one** application desk (`World §0.3.8`).

### 5. Reachability / audit system
- **Triggers:** a set of contacts (import / the book) is presented for a reachability check (`Seed §5.2`, `World §3.1`); a contact's channel data changes such that its reachability could change (implied by "open reachability issues" as ongoing meta).
- **Inputs consumed:** each contact's email, phone, name-present, consent/silenced state, and the channel required by the **intended** sequence; external validation where a check needs it (`Seed §5.2`, `World §1.3`).
- **Outputs / state changes:** a verdict — reachable / partial / unreachable (`Seed §5.2`); a contact marked **sequence-ready** or not; open reachability issues surfaced as workspace meta; a byproduct signal that the firm's list is stale (`Seed §5.2`). Explicitly **not** produced: pathway scoring, ROI forecasts, minimum-count gates (`Seed §5.2`, `World §3.1`).
- **Chains to:** *sequence-ready* is a precondition trigger for the Engagement system enrolling a contact.

### 6. Consent / suppression system
- **Triggers:** a contact opts in (consent + first channel open) (`Seed §5.3`); a contact opts out or is otherwise excluded (silenced) (`Seed §5.3`, `World §0.4`); a contact who *never opted in* (silenced-by-default state) (`Seed §5.3`).
- **Inputs consumed:** the contact's consent state; the applicable consent regime for the channel (asserted as necessary but not specified — see Silences) (`Seed §8.2`).
- **Outputs / state changes:** a contact becomes eligible for automatic outreach, or is suppressed from it; the opt-in state that gates *deep* data collection (`Seed §8.2`).
- **Chains to:** consent state gates the Engagement and Fact-refresh systems; firm database authorization (Commercial system) does **not** substitute for end-client consent (`Seed §8.2`).

### 7. Engagement / sequencing system
Two engines that must never be conflated (`Seed §5.5`, `World §3.3`):

**7a. Campaign calendar (content order across days)**
- **Triggers:** a contact becomes eligible to enter a phase (opt-in / re-engagement / reactivation) (`Seed §5.3`); a reactivation template is *armed* (ghost ready) vs *activated* (executing) (`Seed §5.3`, `World §0.4`).
- **Inputs consumed:** the phase content order; Engine 2 precedence (`World §3.3`).
- **Outputs / state changes:** the day-ordered content to run; an armed or active sequence state.

**7b. Attempt / channel-ownership engine (single sequence at runtime)**
- **Triggers:** a sequence step's channel owns the flow; an attempt's criteria window elapses; a live inbound arrives mid-attempt; a finishing event fires (`Seed §5.5`, `World §0.4 / §3.3`).
- **Inputs consumed:** the authored channel + copy steps; attempt/owner state; criteria windows (`Seed §5.5`).
- **Outputs / state changes:** forward-only motion under the owning channel (Text → Email → Form, Attempt 1/2/3); an in-flight attempt overridden by a live inbound; the sequence closed and the **next armed** by a finishing event (`World §3.3`); an engagement **record** of events that already fired (record only — it authors nothing) (`Seed §5.5`, `World §3.2`).
- **Chains to:** a finishing event *arms the next* sequence; each touchpoint is also the carrier for the Fact-refresh system.

### 8. Fact-refresh / data-collection system
- **Triggers:** a touchpoint (nudge) fires carrying a data ask (`Seed §5.4`); a client answers a self-reportable field; a consultant enters a fact by hand; a document-dependent or employer-directed need is detected (`Seed §5.4`).
- **Inputs consumed:** the field classification — self-reportable, document-dependent, employer-directed (`Seed §5.4`, `World §0.4`); the answer or write-back.
- **Outputs / state changes:** self-reportable answers eligible for a **form / pre-meeting capture**; document-dependent needs routed to tracked work items (**never** a form); employer-directed asks routed to the firm, not the client (`Seed §5.4`); on any write-back, an **immediate re-evaluation** is initiated (`Seed §5.8`).
- **Chains to:** every write-back is a trigger of the Eligibility re-evaluation system; a *missing* fact is itself recorded as a signal (Engine 2).

### 9. Reference-currency system
- **Triggers:** an IRCC-shaped fact moves — a draw threshold/cutoff shifts, a category is added, a trade/provincial identifier changes (`Seed §5.7`, `World §2.2.1`). This trigger has **no screen and no human click** and is a first-class initiator.
- **Inputs consumed:** the current versioned reference tables (categories, trades, cutoffs, provincial identifiers) (`Seed §5.7`, `World §1.3 / §2.2`).
- **Outputs / state changes:** a new version of the reference facts, updated **as data** with no code deploy (`Seed §5.7 Directive 3`, `World §2.2.1`).
- **Chains to:** a reference change is a trigger of the Eligibility re-evaluation system for every affected contact — the **law / public-reference side** of eligibility change (`World §2.2`).

### 10. Eligibility re-evaluation system
- **Triggers:** a client fact changes (from Fact-refresh); a reference fact moves (from Reference-currency); a scoped pull runs (manual pull rich, event pull thinner) (`Seed §5.6, §5.8`, `World §2.2`).
- **Inputs consumed:** firm-held + engagement-collected client facts; industry criteria packs (Constants); condition gates; pre-packaged evaluators (Rules) over constants + conditions (`Seed §5.6, §5.7`).
- **Outputs / state changes:** a structured evaluation resolved by downstream nodes (branch-aware); an **Analysis** read-out — headlines, deltas, service candidates (R-* / B-*), nudge/reactivation hints — with machine output retained underneath (`Seed §5.7`, `World §0.4`); a **service-eligibility** determination where *any* pathway assertion passes (not one favoured pathway) (`Seed §5.7`, `World §0.4`). Every determination — **including a missing-data finding** — is emitted as a signal (`Seed §5.8`).
- **Chains to:** every emitted signal is the trigger of Engine 2's motion decision; these operations live in the house/operator layer and must stay inspectable/changeable without a code deploy (open-box) (`World §2.1 / §3.4`).

### 11. Signal / motion orchestration (Engine 2)
- **Triggers:** a signal is recorded (any detection, including missing data) (`Seed §5.8`, `World §0.4 / §3.3`).
- **Inputs consumed:** the set of outstanding signals for one client; the fixed precedence law (`Seed §5.8`).
- **Outputs / state changes, by precedence:** reactivation is chosen first whenever anything is reactivation-worthy; a nudge fires only when nothing is; a firing nudge consolidates **every** outstanding self-reportable need into **one** form (never one nudge per field); when reactivation fires, secondary signals attach as **agenda** to the consultant's pre-meeting brief rather than as parallel outreach; **one client, one motion, ever** (`Seed §5.8`, `World §3.3`).
- **Chains to:** the chosen motion is the trigger that hands work to the Engagement system (a reactivation or nudge sequence).

### 12. Meeting / loop-closer system
- **Triggers:** a meeting is booked (`meeting_booked`) (`Seed §5.8`); a write-back arrives against a pending capture (`Seed §5.8`).
- **Inputs consumed:** the client's outstanding self-reportable fields; the current evaluation (`Seed §5.8`).
- **Outputs / state changes:** on `meeting_booked` with outstanding self-reportable fields, a data-capture form pending the meeting; on any write-back, an **immediate re-evaluation**; a **live** (not snapshot) pre-meeting brief (`Seed §5.8`).
- **Chains to:** `meeting_booked` is the loop-closer / core success event; its write-backs re-trigger the Eligibility system, keeping the brief live.

---

## Cross-system trigger web

The handful of initiations where one system's output is another's trigger:

- **seed inputs land** (Acquisition) → initiates **forward-deploy** (Provision) (`Seed §6.2→§6.3`).
- **hard inputs land / campaign runs** (Commercial) → opens the **Application desk** to that firm (`World §0.3.2`).
- **sequence-ready verdict** (Audit) → gates **enrollment** (Engagement) (`Seed §5.2`).
- **finishing event** (Attempt engine) → **arms the next** sequence (Engagement) (`World §3.3`).
- **each nudge touchpoint** (Engagement) → carries a **data ask** (Fact-refresh) (`Seed §5.4`).
- **write-back** (Fact-refresh) and **reference move** (Reference-currency) → both trigger **re-evaluation** (Eligibility) (`Seed §5.7, §5.8`).
- **every determination, incl. missing data** (Eligibility) → emits a **signal** (Engine 2) (`Seed §5.8`).
- **Engine 2's chosen motion** → hands a **reactivation/nudge** back to Engagement — closing detection → engagement → enriched data → re-detection into one loop (`World §2.2`).
- **meeting_booked** (Meeting) → pending **capture form** whose write-back re-triggers Eligibility, keeping the **live brief** current (`Seed §5.8`).

The spine: *seed → forward-deploy → run*, then a self-feeding *detect → engage → collect → re-detect* ring, with Reference-currency injecting external triggers into the ring from outside any human action.

---

## Silences (implied systems whose triggers are unspecified — not filled)

- **Escrow release.** The Commercial system asserts a *release* exists but its trigger — what event meets release terms — is a Known Unknown (`Seed §7, §13.1`).
- **What "database authorization" is.** The hard-input trigger's actual shape (connect vs export vs equivalent) is undefined, and must not silently migrate into the acquisition click budget (`Seed §13.2`).
- **Event-based automation triggers.** Seed states event pulls are "thinner than manual" (`Seed §11`); the event trigger set beyond the manual pull is under-specified (`Seed §5.6`).
- **Operations & Actions initiations.** Named as slots but **stubs** — triggers and outputs unspecified (`Seed §5.6, §11`).
- **Loop-closer placement (D-01) and in-meeting fallback surface (D-02).** Open (`Seed §5.8`).
- **"Reactivation-worthy" criteria.** Engine 2 names *reactivation first if reactivation-worthy* but the condition that makes a signal reactivation-worthy is not specified (`Seed §5.8`).
- **Consent-regime triggers.** CASL/SMS legal conditions per geography, for firm→client and for the first agent→consultant text, asserted as necessary and explicitly **not closed** (`Seed §8.2, §13.14`, `World §1.2`).
- **Escalation on failed reply.** Channel-order escalation when an SMS reply fails is open (`Seed §13.15`).
- **Contact-entry mutation.** The "contact enters the book" trigger via import is only partial — import does not fully mutate the living list (`Seed §5.1, §11`).
- **Email-channel entry from Meta.** When/whether email earns entry from Meta evidence is open (`Seed §13.8`).
- **Additional firm-side initiators.** Multi-consultant roles/permissions open; World declines to mint extra firm-side parties (`Seed §13.6`, `World §1.1`).
