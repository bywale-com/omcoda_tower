# Pass 5 — Two-column join (bind extrusions)

**Method:** `docs/method/TWO-COLUMN-SYNTHESIS.md` · `docs/register/SYSTEMS-REQUIREMENTS.md` §1.3 · `docs/sme/HANDOFF-ROUTING.md` · `docs/sme/SURFACE-INTENT.md`

Practice column (faces) and capability/machine column (no face required) join by **shared events / outcomes / states**, not by forcing one roster into the other’s shape.

## Bind rule

Each control or pane is an extrusion onto a state Pass 3 already named. A control that lands on nothing is an orphan. A node with no faceless origin **and** no control is dead or missing an origin.

## Join table (intended product)

| Outcome / surface | Machine states touched | Initiation vs view | Column |
|---|---|---|---|
| Approach one-tap | `seed_capture`, `approach_impression`★, `session_attribution` | Initiation (stranger) | both |
| Prepared Workspace walk | `firm_public_facts`★, `prepared_workspace`, `firm_identity_binding` | View + route (agent presents) | both |
| Authorize book | `database_authorization` | Initiation (hard gate) | pm + cto ledger |
| Accept terms | `escrow_acceptance`, `escrow_terms` | Initiation (hard gate) | both |
| OTP / session | `otp_challenge`, `session`, `firm_tenancy` | Initiation | cto (generic wiring) |
| Book readiness Audit | `contact_record`, `reachability_verdict`★, `sequence_ready` | Initiation (run) + pane (verdicts) | both |
| Consent touchpoint | `optin_phase`, `consent_state`★ | Initiation (contact) | both |
| Halt outreach | `consent_state` / silence / halt | Initiation (consultant governance) | both |
| Configuration libraries — engagement templates (Agents) | `sequence_definition`, `content_order`, `reactivation_arm_state` | Initiation (operator authorship) | pm face; cto tables |
| Configuration libraries — automation workflows | `eligibility_evaluation`, `evaluation_ruleset`, `constants_pack`, `workflow` shape | Initiation (operator authorship) | both |
| Firm operations bind | bindings onto 7/10 packs; `campaign_state` | Initiation | both |
| Attempt runtime | `active_attempt`★, `inbound_override`★, `finishing_event`★ | **none** (faceless) | cto |
| Nudge / form | `fact_ask`, `field_class_routing`, `fact_writeback`★ | Initiation (contact) | both |
| Reference publish | `reference_version`★★ | Initiation (operator) + faceless ramification | both |
| Eligibility / Analysis | `eligibility_result`★, `analysis_readout` | Pane | pm pane; cto eval |
| Engine 2 | `signal`★, `motion_decision`★ | **none** | cto |
| Meeting booked | `meeting_booked`, `pending_capture`, `live_brief`★ | Initiation (contact) + pane (consultant) | both |
| Engagement record / Activity | `engagement_record`★ | Pane (record only) | pm pane |
| Board phase chips | `phase_state`, `reactivation_arm_state` | Pane | pm |

## Do not invent UI for CTO-only

Capability may complete with zero Register surface: warmup scheduler internals, event pipeline, DKIM provisioning residue, suppression consult before send. Surface intent = `none` until a view/initiation is actually required (`SURFACE-INTENT.md`).

## Do not invent Wiring fiction for PM-only

A How leaf without a named event/state path is theater. Consultant Core “receive booked meetings” requires `meeting_booked` and `live_brief`, not a painted calendar.

## Congruence maps (re-ranked)

`OUTCOME-SYSTEM-MAP.md` and `SYSTEM-COMPONENT-MAP.md` are **audits after Requirements**, not discovery. This experiment does not re-run them as if the machine were unknown. Known congruence notes from those files: Consultant Governance/halt was a Gap; priors exist as Extension/Authorship/Chrome/Parked. They do not add musts.

## Product north star both columns serve

Outside habitat: ad → phone → inbox (ALG). Inside habitat: always-on loop toward meeting booked. Not a substitute for either lattice.
