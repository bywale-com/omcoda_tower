# Tower — Systems Requirements (filled machine spec, derived from Systems Story)

**Seat:** Systems analyst pass, executed.
**Method:** For each of the twelve systems in `SYSTEMS-STORY.md`, extract **states** (named units of machine state), **transitions** (what changes each state — control, chain, or faceless), **ramifications** (what a change initiates downstream), and **faceless triggers** (state changes with no control and no pane). Extraction only — no must is invented; every state traces to a Story claim. Silences stay silent (named, not filled).
**Output:** the state/transition spec per system, then a **fused canonical node map** (§13). Nodes = the deduplicated states named here. No tables, no schema — the machine map that the wiring pass consumes.

**Reading key per state:** `state_name` — what it holds. **Δ:** transitions in (what writes/changes it). **⇒:** ramifications out. **∅face:** true if this state changes with no control and no pane (faceless origin).

---

## 1. Acquisition (seed-capture)

- `seed_capture` — the three cheap inputs (firm/consultant name, website, one channel: phone|email) from a stranger. **Δ:** stranger one-tap on Meta Approach (control). **⇒:** *seed inputs land* → initiates Provision (2). **∅face:** no.
- `approach_impression` — a stranger saw the Approach and did/didn't tap. **Δ:** ad served; scroll continues without tap. **⇒:** feeds instrumentation (distinguish *did-not-understand* vs *understood-did-not-tap*). **∅face:** **yes** — "continue-scroll without tapping" is a first-class non-action trigger, no control, no pane.
- `session_attribution` — which session/source a capture belongs to. **Δ:** on `seed_capture` persist (fulfillment, not agent presentation). **⇒:** attribution for Provision + analytics. **∅face:** no (rides the capture event).

**Scope wall:** Approach captures exactly **one** acquired non-house party (V1 Consultant). Engagement contacts and the house are **never** acquired here.
**Silences (unfilled):** email→Meta entry; Meta targeting/CAC; consent regime for first agent→consultant text.

## 2. Provision / forward-deploy

- `firm_public_facts` — scraped public firm facts. **Δ:** on *seed inputs land*, scrape (faceless automation). **⇒:** feeds workspace instantiation. **∅face:** **yes** — fires off the chain event, no human click.
- `prepared_workspace` — no-login staged workspace instantiated from **Om Coda's** methodology templates (launch→re-engagement→reactivation), under firm identity as branding only. **Δ:** on `firm_public_facts` ready + template instantiation. **⇒:** the object Commercial (3) walks; readiness precondition for hard-input ask. **∅face:** partially (automation executes; agent may walk it).
- `firm_identity_binding` — firm identity as auth/branding detail (not a claim Tower holds their clients). **Δ:** set at provision. **⇒:** consumed by Tenancy (4) and every firm-faced surface. **∅face:** no.

**Must-not:** derive campaign from firm's private book pre-authorization.
**Silences:** ALG approach/forward-deploy/escrow door are bets (capability target stands).

## 3. Commercial / hard-input

- `database_authorization` — the hard input that makes the campaign real. **Δ:** firm grants (hard human gate). **⇒:** precondition to flip campaign running. **∅face:** no (hard gate).
- `escrow_acceptance` — escrow terms accepted; the **only** peer door at activation payment. **Δ:** firm accepts (hard human gate). **⇒:** with auth, flips `campaign_state`. **∅face:** no.
- `escrow_terms` — held terms of the escrow. **Δ:** set at acceptance. **⇒:** governs release (release trigger is a **silence**). **∅face:** no.
- `campaign_state` — {armed-for-activation → **running**}. **Δ:** both `database_authorization` + `escrow_acceptance` present → **running**. **⇒:** *running* opens the Application desk (systems 5–12) to that firm; after running, campaign performs with no further required activation inputs. **∅face:** the flip is chain-driven off the two gates.

**Must-not:** credits/sales-call as peer door; migrate DB-auth into acquisition click budget. Tower holds no settlement funds; end-clients pay nothing.
**Silences:** escrow **release** trigger/outcome; concrete shape of database authorization; later SaaS packaging must not replace escrow peer door.

## 4. Tenancy & access

- `firm_tenancy` — Firm owns users + book. **Δ:** provision via **versioned seed manifest** only (no ad hoc SQL). **⇒:** RLS/scоping anchor for all firm-scoped state. **∅face:** no.
- `user_account` — user under a firm (Consultant = firm operator/acquired persona V1). **Δ:** manifest provision. **⇒:** subject of sessions. **∅face:** no.
- `otp_challenge` — passwordless code lifecycle. **Δ:** send → verify (control). On **unprovisioned** email: return generic success, **issue no code** (anti-enumeration). **⇒:** verified challenge mints a session. **∅face:** no.
- `session` — held verified session. **Δ:** mint on OTP verify; validate on guarded actions; clear on logout. **⇒:** gates guarded actions; lands assisted/OLG and self-serve/ALG into the **same** application/session matrix. **∅face:** no (but expiry, if added, would be faceless — currently a silence).

**Must-not:** Operator as a firm Board login persona; Agent seat/column in admission.
**Silences:** multi-consultant roles/permissions; production onboarding beyond manifests.

## 5. Reachability / audit

- `contact_record` — a contact in the firm book (the thing checks run over). **Δ:** import/book entry. **⇒:** subject of reachability + everything downstream. **∅face:** no. *(Note Story silence: import does not yet fully mutate the living list.)*
- `reachability_verdict` — {reachable | partial | unreachable} per contact. **Δ:** data-validity checks (email valid, phone valid, ≥1 channel matching **intended** sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present); may call **external validation**. **⇒:** sets `sequence_ready`. **∅face:** the check run can be batch/faceless over imports.
- `sequence_ready` — contact is/ isn't startable for the intended sequence. **Δ:** derived from `reachability_verdict` + consent state. **⇒:** **precondition for Engagement (7) enrollment**. **∅face:** no.
- `reachability_issue` — open issue surfaced as workspace meta ("stale list" is a byproduct signal, not the engine). **Δ:** check finds a problem. **⇒:** display + operator attention. **∅face:** partially.

**Must-not:** pathway/CRS scoring, ROI/probability forecasts, min-contact gates, sales PASS/FAIL, or confusing marketing "DOA" HTML with in-app Audit.
**Silences:** import→living-list mutation; CRM bidirectional sync.

## 6. Consent / suppression

- `consent_state` — per contact {sequenced | silenced | unsequenced}; **silenced when not opted-in** (and when opted-out). **Δ:** opt-in phase (firm→client consent + first channel open); opt-out. **⇒:** feeds `reachability_verdict`; **gates Engagement (7) and Fact-refresh (8)**; gates deep data collection. **∅face:** opt-out arriving via inbound could be faceless; opt-in request is control-driven.
- `optin_phase` — the opt-in phase run for a contact. **Δ:** initiated by firm→client consent motion. **⇒:** on success flips `consent_state`→sequenced. **∅face:** no.

**Must-not:** "skip all opt-in because ALG/firm DB-auth"; charge end-clients.
**Silences:** CASL/SMS consent regimes by geography (firm→client and first agent→consultant text).

## 7. Engagement / sequencing — **two non-conflatable engines**

**Shared:**
- `sequence_definition` — ordered steps of channel+copy; reactivation/launch agents are composites of steps. **Δ:** authored (composing = configuration, control). **⇒:** enrolled when criteria match. **∅face:** no.
- `phase_state` — per contact along Opt-in → Re-engagement(nudges) → Reactivation. **Δ:** phase progression. **⇒:** selects which content order applies. **∅face:** no.
- `reactivation_arm_state` — {armed (ghost template ready, nothing sending) | active (executing)}. **Δ:** arm; activate. **⇒:** active → attempt engine runs. **∅face:** no.

### 7a. Campaign calendar
- `content_order` — day-ordered engagement content for a phase (opt-in/nudge/reactivation). **Δ:** authored; obeys **Engine 2 precedence** when choosing which motion's content runs. **⇒:** supplies content to 7b. **∅face:** no. **Must-not:** decide channel ownership/waits/retries (that's 7b).

### 7b. Attempt / channel-ownership engine (one in-flight sequence)
- `active_attempt` — the single in-flight attempt under **one owning channel** along Text→Email→Form (forward-only). **Δ:** enroll; waits/attempts nest under the **owning channel that failed**; escalate forward when **criteria met**. **⇒:** on finishing event, closes sequence and **arms next**. **∅face:** **yes** — criteria are time/threshold based (e.g. text-delivered-not-opened-30min→Email; email-opened-link-not-clicked-24h→next; form-started-not-submitted-24h→Text). These fire with **no control and no pane**.
- `inbound_override` — a live inbound mid-attempt (e.g. live form visit) that can **nullify** the in-flight attempt / open the next step. **Δ:** inbound event arrives. **⇒:** overrides `active_attempt`. **∅face:** **yes** — inbound arrival is faceless.
- `finishing_event` — the event that closes a sequence. **Δ:** criteria-met terminal (e.g. form submitted). **⇒:** closes sequence; **arms next** (e.g. reactivation scheduled); chosen next-motions arrive from Engine 2. **∅face:** **yes**.
- `engagement_record` — chronology of events that already fired; **authors nothing**. **Δ:** every fired event appends. **⇒:** display/audit only; must **not** author motion/channel order. **∅face:** append is faceless (rides other events).

**Must-not:** Engine 2 replacing the attempt engine inside a sequence; the record authoring channel order/attempts.
**Silences:** exact product-locked criteria windows; SMS reply-failure escalation; event-based enrollment trigger set beyond manual pull.
*(Windows above are OPERATOR-REVISIONS, not Seed/World law until promoted.)*

## 8. Fact-refresh / data-collection

- `fact_ask` — a nudge that asks for/infers an eligibility-affecting fact. **Δ:** nudge touchpoint fires (from 7). **⇒:** routes by field class. **∅face:** the ask rides a touchpoint.
- `field_class_routing` — classification+route of a needed field: **self-reportable**→forms/pre-meeting capture; **document-dependent**→**never a form**, tracked work item; **employer-directed**→ask the **firm**, not the client. **Δ:** field identified. **⇒:** determines capture surface / work-item. **∅face:** no.
- `fact_writeback` — an answer landing (client, or consultant hand-entry). **Δ:** answer submitted/entered. **⇒:** **initiates immediate re-evaluation (10)**. **∅face:** partially — a client submit is control; a system-received answer can be faceless.
- `missing_fact_signal` — a *missing* fact recorded as a signal. **Δ:** fact needed but absent. **⇒:** **Engine 2 (11) input**. **∅face:** **yes** — "missing" is detected, not clicked.

**Must-not:** document-dependent needs in forms.
**Silences:** client desk depth (touchpoint vs authenticated portal); D-02 in-meeting fallback.

## 9. Reference-currency

- `reference_version` — versioned IRCC-shaped reference facts (categories, trades, cutoffs, provincial identifiers) as **data**. **Δ:** operator/house updates the data (open-box, **no code deploy**). **⇒:** a reference move **triggers Eligibility (10) re-evaluation for every affected contact** — the law/public-reference side of detection. **∅face:** **yes** — a reference move (draw threshold/cutoff shift, category added, trade/provincial change) is a **first-class faceless trigger**, no screen, no click.
- `constants_pack` — versioned industry criteria packs (Constants); V1 truth Canada-shaped. **Δ:** pack versioned. **⇒:** consumed by Eligibility automation. **∅face:** no.

**Must-not:** require a code deploy to update reference facts.
**Silences:** rule-pack IP/liability; Constants beyond Immigration.

## 10. Eligibility re-evaluation

- `eligibility_evaluation` — a run of the automation shape: **Trigger** (scoped pull — manual rich; event thinner) → **Constants** → **Conditions** → **Rules** → structured output → downstream resolution. **Δ:** any of: `fact_writeback` (8), `reference_version` move (9), manual pull, `meeting capture` write-back (12). **⇒:** produces `eligibility_result` + emits determination. **∅face:** **yes** on the event-triggered paths (fact/reference); manual pull is control.
- `eligibility_result` — structured determination for a client×pathway; pathway pass = **any** assertion (CEC|FSW|FST|PNP-*), not one favoured pathway; evaluated against **house-held/firm-configured** rules over **firm-private** book. **Δ:** written by an `eligibility_evaluation`. **⇒:** **every** determination (including missing-data) → **signal to Engine 2 (11)**. **∅face:** written by faceless eval.
- `analysis_readout` — human readout (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath. **Δ:** derived from `eligibility_result`. **⇒:** consultant-facing surface (a **pane**). **∅face:** no.
- `evaluation_ruleset` — the inspectable/changeable-without-deploy house/open-box logic. **Δ:** operator edits (open-box). **⇒:** governs future evaluations. **∅face:** no.

**Must-not:** cold-detect strangers from public DBs as Core Function; treat static book dump as sufficient for the life-change side.
**Silences:** Operations & Actions initiation (stubs); event-trigger set; Rules-UI toggles vs condition trees; workflow persistence target.

## 11. Signal / motion orchestration (Engine 2)

- `signal` — every recorded detection (including missing-data), recorded **when found**, separate from the decision to act. **Δ:** any `eligibility_result` / `missing_fact_signal`. **⇒:** input to motion decision. **∅face:** **yes** — recording rides detection.
- `motion_decision` — the single chosen outbound motion under **fixed precedence**: (1) **reactivation first** whenever anything reactivation-worthy; (2) **nudge only** when nothing reactivation-worthy; (3) a nudge consolidates **every** outstanding self-reportable need into **one** form; (4) reactivation attaches secondary signals as **agenda** on the pre-meeting brief, never parallel outreach; (5) **one client, one motion, ever**. **Δ:** evaluated over outstanding `signal`s for a client. **⇒:** hands work to Engagement (7) as reactivation/nudge. **∅face:** **yes** — decision is computed, not clicked.

**Must-not:** replace attempt engine inside a sequence; fire parallel motions for one client.
**Silences:** what makes a signal **reactivation-worthy**; D-01/D-02 builder placement.

## 12. Meeting / loop-closer

- `meeting_booked` — the core success / loop-closer event. **Δ:** human books (hard human gate). **⇒:** with outstanding self-reportable fields, opens `pending_capture`; is the escrow-release-adjacent success event (release definition is a **silence** in 3). **∅face:** no (human commitment) — but as a *downstream* trigger it initiates faceless capture.
- `pending_capture` — a data-capture form opened pending the meeting, for outstanding self-reportable fields. **Δ:** on `meeting_booked` with outstanding fields. **⇒:** write-backs feed Eligibility. **∅face:** no (client fills) — opening it is faceless/chain-driven.
- `live_brief` — the pre-meeting brief, **recomputed** (not a snapshot). **Δ:** any write-back (capture or consultant entry) → **immediate re-evaluation (10)** → brief recomputes. **⇒:** consultant-facing pane, always current. **∅face:** recompute is faceless.

**Silences:** D-01 (capture as tail of reactivation vs standalone `meeting_booked` sequence); D-02 (in-meeting fallback module).

---

## 13. Fused canonical node map (states deduplicated across systems)

The states above, fused where the same unit is touched by multiple systems. **This is the node list** — the machine's state-units, independent of any control or pane. Faceless-origin nodes (★) are the ones a UI-first pass structurally cannot see.

| Node | Systems that touch it | Faceless origin? |
|---|---|---|
| `firm_tenancy` | 2,3,4,5–12 (scope anchor) | — |
| `user_account` | 4 | — |
| `session` | 4 | — |
| `otp_challenge` | 4 | — |
| `firm_identity_binding` | 2,4 | — |
| `seed_capture` | 1,2 | — |
| `approach_impression` | 1 | ★ (non-tap non-action) |
| `session_attribution` | 1 | — |
| `firm_public_facts` | 2 | ★ (scrape on chain) |
| `prepared_workspace` | 2,3 | — |
| `database_authorization` | 3 | — |
| `escrow_acceptance` / `escrow_terms` | 3 | — |
| `campaign_state` | 3 → opens 5–12 | ★ (chain flip) |
| `contact_record` | 5,6,7,8,10 | — |
| `reachability_verdict` | 5 | ★ (batch check) |
| `sequence_ready` | 5→7 | — |
| `reachability_issue` | 5 | — |
| `consent_state` | 5,6,7,8 | ★ (inbound opt-out) |
| `optin_phase` | 6,7 | — |
| `sequence_definition` | 7 | — |
| `phase_state` | 7 | — |
| `reactivation_arm_state` | 7 | — |
| `content_order` | 7a | — |
| `active_attempt` | 7b | ★ (time/threshold criteria) |
| `inbound_override` | 7b | ★ (live inbound) |
| `finishing_event` | 7b→7,11 | ★ |
| `engagement_record` | 7b (append) | ★ (append rides events) |
| `fact_ask` | 8 | — |
| `field_class_routing` | 8 | — |
| `fact_writeback` | 8→10,12 | ★ (system-received answer) |
| `missing_fact_signal` | 8→11 | ★ (absence detected) |
| `reference_version` | 9→10 | ★★ (the archetype faceless trigger) |
| `constants_pack` | 9,10 | — |
| `eligibility_evaluation` | 10 | ★ (event-triggered runs) |
| `eligibility_result` | 10→11 | ★ (written by faceless eval) |
| `analysis_readout` | 10 (pane) | — |
| `evaluation_ruleset` | 10 (open-box) | — |
| `signal` | 11 | ★ (records on detection) |
| `motion_decision` | 11→7 | ★ (computed under precedence) |
| `meeting_booked` | 12,3 | — (human) |
| `pending_capture` | 12→10 | — |
| `live_brief` | 12 (pane) | ★ (recompute) |

**Count:** ~43 nodes; **~18 carry faceless origins** — the machinery a controls/panes derivation misses by structure. `reference_version` (★★) is the archetype the doctrine named ("someone opens an email" / a draw cutoff shifts): faceless, first-class, and the whole detection ring depends on it.

---

## 14. The self-feeding ring (the machine's heartbeat, in nodes)

The Story's spine — *seed → forward-deploy → run*, then a self-feeding *detect → engage → collect → re-detect* ring — in node terms:

```
seed_capture → firm_public_facts → prepared_workspace → (database_authorization + escrow_acceptance) → campaign_state=running
                                                                                                          │ opens
                                                                                                          ▼
   ┌────────────────────────── the ring ──────────────────────────┐
   reference_version ─★─┐                        contact_record → reachability_verdict → sequence_ready
   fact_writeback ──────┼─► eligibility_evaluation → eligibility_result → signal → motion_decision → active_attempt
   (reference/fact move)                                                     ▲                          │ fires touchpoint
                                                                            │                          ▼
                                                                     missing_fact_signal ◄──────── fact_ask
                                                                            ▲                          │ finishing_event
                                                                            └──────────────────────────┘ arms next
   meeting_booked → pending_capture → fact_writeback ─(re-enters ring)─► eligibility_evaluation → live_brief (recompute)
```

Two **faceless injectors** drive the ring with no human present: `reference_version` moves (9) and `fact_writeback`/`missing_fact_signal` (8) — plus the time/threshold criteria inside `active_attempt` (7b). These are precisely what a controls/panes derivation could not surface, and why the machine must be specified from the Story, not the faces.

---

## 15. What this is NOT (scope honesty)

- **Not tables/schema.** These are state-units, not columns. Materialization (Postgres, RLS, cardinality) is a later build step off this map.
- **Not faces.** No control or pane is named here. Controls/panes bind onto these states *after* this map exists — a control changes one of these nodes; a pane displays one of these nodes.
- **Silences stay silent.** Escrow-release trigger, reactivation-worthy criteria, attempt-window product-locks, event-trigger set, import→living-list mutation, CASL regimes — all named in the Story as silences, none invented here. Each is a `motion_decision`/`eligibility`/`escrow` refinement the founder must fill before the dependent node is fully specified.

## 16. Immediate use

- **Wiring** consumes §13 as the node set and §14 as the edge skeleton — replacing any UI-derived node guess.
- **Coverage check** (from the critical-interaction doctrine): every ★ node must have a **non-UI origin** wired (job/webhook/schedule/event). If a ★ node has only a control feeding it, that's the bug the whole two-day bottleneck was about — a faceless origin left unbuilt.
- **Controls/panes reconciliation:** every existing control must land on one of these nodes; every pane must display one. A control landing on nothing = orphan; a node with no faceless origin *and* no control = a state nothing can change = either dead or a missing origin.
