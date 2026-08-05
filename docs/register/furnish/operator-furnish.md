# Operator — Furnish

**Subject:** Operator  
**Count:** 20  
**Status:** paper — Register Furnish

### `op-furnish-01` — In-flight hydrate status chips
- **Supporting affordance:** View Hydrate / facts-fresh / brand-pinned staging chips on each In-flight activations row.
- **SurfaceIds:** ["Activation & forward-deploy", "In-flight activations"]
- **implementationProblem:** Operators cannot tell hydrate progress from hard-input stalls when scanning the capture queue.
- **implementation:** Starting from Activation & forward-deploy, click In-flight activations. On each captured firm row, view Hydrate status, facts-fresh, and brand-pinned chips; chips are view-only of staging state written by Hydrate.
- **Does not change Core Function:** Does not add Hydrate, templates, or hard-input commits — only glances existing forward-deploy state.

### `op-furnish-02` — Activation Progress Jump chrome
- **Supporting affordance:** Jump to Activation & forward-deploy / Commercial links on stalled Activation state Progress rows.
- **SurfaceIds:** ["Activation state", "Progress", "Commercial", "Activation & forward-deploy"]
- **implementationProblem:** Stalled checklist rows name the gate but leave the operator to hunt the unblock module.
- **implementation:** Starting from Activation state, click Progress. On a stalled authorize-book or escrow-held row, click Jump to Activation & forward-deploy or Jump to Commercial; Progress itself does not fake-complete hard inputs.
- **Does not change Core Function:** Navigation chrome only — consultant Authorize book / Accept terms remain the hard-input writers.

### `op-furnish-03` — Bind packs published-only hint
- **Supporting affordance:** Published-only helper text and Draft omitted empty-state on Bind packs dropdowns.
- **SurfaceIds:** ["Firm operations bind", "Bind packs", "Configuration libraries"]
- **implementationProblem:** Empty or short published lists look broken when drafts exist in Configuration libraries.
- **implementation:** On Firm operations bind, click Bind packs. On each Evaluation / Automation / Engagement dropdown, view “Published versions only — drafts omitted” helper text; when empty, view Jump to Configuration libraries.
- **Does not change Core Function:** Does not author or publish packs; bind still selects published versions only.

### `op-furnish-04` — Bound-version chips on firm detail
- **Supporting affordance:** View three bound-version chips (label + version id) on Firm operations bind firm detail after Bind.
- **SurfaceIds:** ["Firm operations bind"]
- **implementationProblem:** After Bind closes, operators need an at-a-glance proof of what identity is pinned without reopening the modal.
- **implementation:** On Firm operations bind firm detail, view Evaluation / Automation / Engagement bound-version chips sourced from the last Bind commit; chips are view-only.
- **Does not change Core Function:** Display of bind result only — Armed / Active and Bind remain the writers.

### `op-furnish-05` — Book readiness verdict legend
- **Supporting affordance:** Reachable / partial / unreachable / sequence-ready legend beside Verdict list.
- **SurfaceIds:** ["Book readiness", "Verdict list"]
- **implementationProblem:** Chip colors alone do not teach which rows may enter bound engagement.
- **implementation:** On Audit run, click Verdict list. View the chip legend above contact rows; sequence-ready rows remain the only enrollment-eligible class — no Operator enroll control.
- **Does not change Core Function:** Legend is view chrome; Start Audit run and verdict computation stay unchanged.

### `op-furnish-06` — Sequence-ready percentage glance
- **Supporting affordance:** Firm-scoped sequence-ready % glance on Book readiness after an Audit run.
- **SurfaceIds:** ["Book readiness"]
- **implementationProblem:** Support and bind ops need a one-number readiness posture without scanning every verdict row.
- **implementation:** Starting from Book readiness, after an Audit run completes, view Sequence-ready % glance (ready / total) for this firm’s latest batch.
- **Does not change Core Function:** Aggregates existing verdicts — does not re-score pathways or enroll contacts.

### `op-furnish-07` — Fleet unhealthy chip count
- **Supporting affordance:** Unhealthy firm count ticker on Oversight Fleet health.
- **SurfaceIds:** ["Oversight", "Fleet health"]
- **implementationProblem:** Fleet tables bury how many tenancies need drill-down when scrolling long firm lists.
- **implementation:** Starting from Oversight, click Fleet health. View unhealthy-firm count ticker above the firm table; ticker is view chrome derived from deliverability / sequence / engagement chips.
- **Does not change Core Function:** Does not change drill-down or Firm health — count only.

### `op-furnish-08` — Firm-filter sticky chip
- **Supporting affordance:** Sticky firm-filter chip on Firm health after Fleet drill-down.
- **SurfaceIds:** ["Oversight", "Firm health", "Support context"]
- **implementationProblem:** Leaving Sequence detail or opening Support context drops the firm scope the operator just drilled.
- **implementation:** On Fleet health, click an unhealthy Firm row. On Firm health, view sticky firm-filter chip across Sequence health / Engagement health / Sequence detail; dismiss clears scope.
- **Does not change Core Function:** Scope chrome only — health panels still read the same firm slice.

### `op-furnish-09` — Reference dual-check glance
- **Supporting affordance:** Dual-check / schema-contract / publish-group readiness glance on Publish version.
- **SurfaceIds:** ["Reference data", "Publish version"]
- **implementationProblem:** Confirm looks available while dependent tables or schema contract are still red.
- **implementation:** On Reference table, click Publish version. View dual-check status chips (schema contract, dependent publish-group members) above version notes; Confirm stays disabled until chips are green.
- **Does not change Core Function:** Visibility + disable chrome over existing publish gates — does not invent new reference tables.

### `op-furnish-10` — Escrow terms version chip on instrument row
- **Supporting affordance:** Published Escrow terms version chip beside Escrow status on Commercial instrument list.
- **SurfaceIds:** ["Commercial", "Escrow terms", "Escrow status"]
- **implementationProblem:** Activation and Support need terms version and hold status without opening Escrow terms then Escrow status separately.
- **implementation:** Starting from Commercial, view each instrument row’s terms-version chip and Escrow status chip; click row still opens Escrow terms / Escrow status / Release control for detail.
- **Does not change Core Function:** Glance of existing terms + status — Save terms version and Release control unchanged.

### `op-furnish-11` — Release evidence glance
- **Supporting affordance:** Measurement-window / frozen-terms / verification chips on Release control before Execute actions.
- **SurfaceIds:** ["Commercial", "Release control"]
- **implementationProblem:** Execute release / return / Open dispute can look pressable without the evidence package being legible.
- **implementation:** On Commercial instrument, click Release control. View evidence glance chips (window, frozen terms version, verification); Execute release / Execute return / Open dispute remain gated on those chips.
- **Does not change Core Function:** Surfaces existing evidence predicates — does not add release states.

### `op-furnish-12` — Support context tab badges
- **Supporting affordance:** Unhealthy / stalled / disputed badges on Support context tabs inside Ticket.
- **SurfaceIds:** ["Customer support", "Support context", "Ticket"]
- **implementationProblem:** Operators open every tab to find which firm slice is red while the ticket waits.
- **implementation:** On Ticket, click Support context. View badges on Firm operations bind / Firm health / Commercial / Activation state / Audit trail tabs when that slice is unhealthy or stalled; tab bodies stay view-only rows plus Jump to.
- **Does not change Core Function:** Badge chrome on existing context tabs — Resolve and Jump remain the writers.

### `op-furnish-13` — Ticket severity and owner chips
- **Supporting affordance:** Firm / severity / source / owner chips on Ticket queue rows.
- **SurfaceIds:** ["Customer support", "Ticket queue"]
- **implementationProblem:** Queue triage needs glanceable ownership without opening every Ticket.
- **implementation:** Starting from Customer support, click Ticket queue. View firm, severity, source, and current-owner chips on each open Ticket row before selecting.
- **Does not change Core Function:** Row chrome only — does not change ticket workflow or Resolve.

### `op-furnish-14` — Kill-switch confirmation chrome
- **Supporting affordance:** Scope summary, firm count, reason replay, and Audit preview before Halt motion.
- **SurfaceIds:** ["Founder & agency controls", "Kill-switch", "Audit trail"]
- **implementationProblem:** Fleet-wide Halt is one click away from scope + reason with no final inhabited confirmation.
- **implementation:** On Founder & agency controls, click Kill-switch. After choosing Fleet-wide or Selected tenancies and typing reason, view confirmation chrome (scope, firm count / ids, reason, Audit trail preview), then click Halt motion.
- **Does not change Core Function:** Confirmation furniture around the same Halt commit — engagement runners still honor the written kill-switch state.

### `op-furnish-15` — Agency policy last-saved glance
- **Supporting affordance:** Last-saved timestamp and actor chip on Agency policy / Bounds.
- **SurfaceIds:** ["Founder & agency controls", "Agency policy", "Audit trail"]
- **implementationProblem:** Operators cannot tell whether Bounds on screen match the last audited Save policy without opening Audit trail.
- **implementation:** Starting from Founder & agency controls, click Agency policy. View last-saved timestamp + actor chip above Bounds rows; chip reads the latest Audit trail Change event for policy save.
- **Does not change Core Function:** Read-only glance of existing audit facts — Save policy unchanged.

### `op-furnish-16` — Approach instrumentation count cards
- **Supporting affordance:** Don't-understand / understand-don't-tap / continue-scroll count cards with campaign filter.
- **SurfaceIds:** ["Acquisition & ads", "Approach instrumentation"]
- **implementationProblem:** Kill and creative decisions need the three disbelief modes glanceable beside the campaign filter.
- **implementation:** On Acquisition & ads, click Approach instrumentation. Select campaign from filter dropdown; view the three count cards as metrics (view-only aggregates).
- **Does not change Core Function:** Metrics furniture — Publish campaign and capture path unchanged.

### `op-furnish-17` — Staging-queue waiting-for-hydrate card
- **Supporting affordance:** Waiting-for-hydrate count card bridging Acquisition & ads to In-flight activations.
- **SurfaceIds:** ["Acquisition & ads", "In-flight activations"]
- **implementationProblem:** Ads ops cannot see how many captures still need Forward-deploy Hydrate.
- **implementation:** On Acquisition & ads, view Waiting-for-hydrate count card; click through to In-flight activations filtered to not-yet-hydrated rows.
- **Does not change Core Function:** Count + filter chrome over existing capture → staging handoff — does not Hydrate.

### `op-furnish-18` — Configuration libraries Published / Draft chips
- **Supporting affordance:** Published + version id / Draft status chips on Evaluation packs, Automation workflows, and Engagement templates catalog rows.
- **SurfaceIds:** ["Configuration libraries"]
- **implementationProblem:** Authors and binders need catalog proof of what Bind packs may select without opening each editor.
- **implementation:** Starting from Configuration libraries, click Evaluation packs (or Automation workflows / Engagement templates). View Published + version id or Draft chip on each catalog row after Publish version.
- **Does not change Core Function:** Status chrome for existing publish state — authorship and Publish version unchanged.

### `op-furnish-19` — Audit Change event surface chip
- **Supporting affordance:** Affected-surface chip and firm chip on each Change event row before opening detail.
- **SurfaceIds:** ["Audit trail", "Change event"]
- **implementationProblem:** Scanning the log for Bind packs vs Publish version vs Kill-switch requires opening every row.
- **implementation:** Starting from Audit trail, view operation, affected-surface, firm, actor, and timestamp chips on Change event list rows; click row still opens Change event detail.
- **Does not change Core Function:** List chrome over existing Change events — filters and detail view unchanged.

### `op-furnish-20` — Provision complete Login-path chrome
- **Supporting affordance:** Copy Login path / Send invite plus Activation state glance on Provision complete.
- **SurfaceIds:** ["Provision", "Activation state", "Login"]
- **implementationProblem:** After assisted mint, operators hand Login OTP but lose sight of whether Activation state Progress has started for that firm.
- **implementation:** On Provision complete, click Copy Login path or Send invite; view Activation state Progress summary chips for the new firm and Jump to Activation state when staging is required.
- **Does not change Core Function:** Handoff furniture after Provision — does not change New firm mint or Login OTP.
