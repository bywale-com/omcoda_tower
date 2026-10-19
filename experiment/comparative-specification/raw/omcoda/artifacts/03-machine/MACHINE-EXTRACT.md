# Pass 3 — Machine track extract

**Sources:** `docs/register/SYSTEMS-STORY.md` · `docs/register/SYSTEMS-REQUIREMENTS.md` · `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` · `docs/register/system-map/BUILD-system-map-v2-table-inventory.md` · `docs/register/DATA-IN-TABLES.md`  
**Seat law:** Systems analyst locks substance in Story. Requirements **extract**; they do not invent.  
**This pass does not promote:** `OPERATOR-REVISIONS.md`, `SYSTEMS-GOAL.md`, `SYSTEMS-OBJECTIVE-ESCROW.md` — denser than Seed/World, not Story musts until founder promotion.

## Doctrine (from SYSTEMS-REQUIREMENTS.md)

Tower is the **machine**. UI is only:

| Extrusion | Job |
|---|---|
| **Control** | Injects a change into a state that already exists |
| **Pane** | Displays a state the machine already has |

Faceless triggers (email opened, window elapsed, reference version published) are native to this track. Outskirts maps cannot see them.

## Spine the whole machine must continuously do

While a firm has contacts and hands-free is armed:

1. Keep engaging dormant and active contacts.
2. Keep immigration-relevant facts fresh via firm→client touchpoints.
3. Re-evaluate **service eligibility** as IRCC-shaped reference and client facts move.
4. Surface campaign-worthy people so consultants book meetings without manually rechecking every file.

Core pursuit: detect service-eligible candidates and initiate the right campaign motion (launch / nudge / reactivation) whose success event is **meeting booked**.

Cross-cutting: Agent presentation ≠ fulfillment. House/open-box: evaluation, analysis, operational logic, and reference upkeep stay inspectable and changeable without a code deploy.

## The twelve systems

| # | System | Must fulfill |
|---|---|---|
| 1 | Acquisition (seed-capture) | Three cheap inputs inside click budget; return to scroll |
| 2 | Provision / forward-deploy | No-login prepared workspace proving readiness, not value |
| 3 | Commercial / hard-input | DB authorization + escrow; flip campaign to **running** |
| 4 | Tenancy & access | Versioned manifests; OTP session; one desk either door |
| 5 | Reachability / audit | Can we reach them and start a sequence? |
| 6 | Consent / suppression | Opt-in; silenced when not opted in; DB auth ≠ consent |
| 7 | Engagement / sequencing | **7a** campaign calendar · **7b** attempt / channel-ownership — never conflated |
| 8 | Fact-refresh / data-collection | Nudges collect; field-class routing; write-back re-evaluates |
| 9 | Reference-currency | Versioned IRCC-shaped tables as data; faceless trigger on move |
| 10 | Eligibility re-evaluation | Private book; any-pathway; Analysis readout; every determination is a signal |
| 11 | Signal / motion (Engine 2) | Record every detection; one motion by fixed precedence |
| 12 | Meeting / loop-closer | meeting_booked → pending capture + live brief |

## Must-not walls (selected, not exhaustive)

- Pull DB auth or escrow into click budget; treat forward-deploy as acquisition; cold email V1 Approach.
- Credits/sales-call as peer activation door; hold immigrant settlement funds.
- Operator as firm Board login; Agent seat in admission.
- Audit as scoring / ROI / sales ceremony.
- Skip opt-in because ALG.
- Document-dependent facts in forms.
- Code deploy to update reference facts.
- Public-before-contact end-client eligibility as Core.
- Parallel motions for one client; Engine 2 replacing 7b inside a sequence.
- Engagement record authoring motion.

## Engine 2 precedence (system 11) — immutable

1. Reactivation first, always, if anything is reactivation-worthy.
2. Nudge only when nothing is reactivation-worthy.
3. One nudge consolidates **every** outstanding self-reportable need into **one** form.
4. When reactivation fires, secondary signals ride as **agenda** on the pre-meeting brief — never parallel outreach.
5. **One client, one motion, ever.**

**Silence inside this law:** what makes a signal **reactivation-worthy**. SME Handoff `elig-04` proposes a practice mechanism (material service-posture change). That is absorb, not a Story promotion. See `06-sme/` and `08-uncertainty/`.

## Chain web (Story)

```
Acquisition --seed land--> Provision --prepared--> Commercial --running--> Application (5–12)
Audit --sequence-ready--> Engagement enrollment
7b finishing event --> arm next sequence
Engagement nudge --> Fact-refresh
Fact write-back --> Eligibility
Reference move --> Eligibility
Every determination --> Engine 2 signal --> motion --> Engagement
meeting_booked --> pending capture write-back --> Eligibility (live brief)
```

Heartbeat: *seed → forward-deploy → run*, then self-feeding *detect → engage → collect → re-detect*, with Reference-currency injecting faceless external triggers.

## Named states (Requirements extract, fused)

Faceless-origin nodes (★) are first-class.

`firm_tenancy` · `user_account` · `session` · `otp_challenge` · `firm_identity_binding` · `seed_capture` · `approach_impression`★ · `session_attribution` · `firm_public_facts`★ · `prepared_workspace` · `database_authorization` · `escrow_acceptance` / `escrow_terms` · `campaign_state`★ · `contact_record` · `reachability_verdict`★ · `sequence_ready` · `reachability_issue` · `consent_state`★ · `optin_phase` · `sequence_definition` · `phase_state` · `reactivation_arm_state` · `content_order` · `active_attempt`★ · `inbound_override`★ · `finishing_event`★ · `engagement_record`★ · `fact_ask` · `field_class_routing` · `fact_writeback`★ · `missing_fact_signal`★ · `reference_version`★★ · `constants_pack` · `eligibility_evaluation`★ · `eligibility_result`★ · `analysis_readout` · `evaluation_ruleset` · `signal`★ · `motion_decision`★ · `meeting_booked` · `pending_capture` · `live_brief`★

Archetype faceless trigger: `reference_version` (a draw cutoff shifts with nobody present).

## Table-first law (v2 inventory)

The machine is **tables + a dumb runtime**.

| Kind | Holds |
|---|---|
| **State** | Values/status the machine tracks |
| **Rule** | When [trigger] + [condition] → change [target] to [value], as rows |
| **Sequence / order** | Ordered, rearrangeable lists |

Anything that should be modifiable must be a table. Frozen-in-prose that should vary is a bug unless it is a hard-gate / must-not / immutable wall.

**Data in tables (Phase Two law, 18:44):** records that show in a module come from tables. Never hard-code data into the app. Missing table/field is Systems Analyst ascribe — do not invent a store in the SPA.

## What Requirements must not extract yet

- A `goal` state from `SYSTEMS-GOAL.md` until Story §7 carries a promoted must. Packet 022 later settled a **mechanism** (objective met as Local event; escalation as subscription) without changing that wording rule.
- Escrow-as-billable-objective from `SYSTEMS-OBJECTIVE-ESCROW.md` until Story §3 is promoted. Direction: objective is the billable unit; not a build order.
- OPERATOR-REVISIONS attempt windows (30 min / 24 h) as Seed/World law.

These sit in `07-phase-two/` as **founder expansions parked**, and in `08-uncertainty/` as promotion gates — not as invented closures.

## Pass result

Machine substance and spec extraction exist. Bind faces onto these states; do not discover more machine from screens.
