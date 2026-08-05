# Operator — Enrichment Can'ts

**Subject:** Operator  
**Count:** 20  
**Status:** paper — Register Enrichment

### `op-cant-01` — Approach kill criteria from instrumentation
- **Right now I can't:** Set or read campaign kill criteria beside Approach instrumentation counts — so a variant that only scores on proxy aggregates keeps spending.
- **SurfaceIds:** ["Acquisition & ads", "Approach instrumentation"]
- **Gap:** Instrumentation shows don't-understand / understand-don't-tap / continue-scroll, but no desk control ties those counts to a kill / hold rule the operator can act on.
- **Need:** Kill-criteria panel on Approach instrumentation (threshold + action) that marks a campaign unscoreable or held without leaving Acquisition & ads.

### `op-cant-02` — Hydrate vs readiness separation on in-flight
- **Right now I can't:** Tell whether an in-flight firm is blocked on Hydrate, stale public facts, or consultant hard inputs — staging chips collapse into one “not ready.”
- **SurfaceIds:** ["Activation & forward-deploy", "In-flight activations", "Activation state"]
- **Gap:** Forward-deploy Hydrate and Activation state Progress are separate leaves, but the in-flight row does not expose hydrate-failed / facts-stale / authorize-pending / escrow-pending as distinct chips.
- **Need:** Per-gate status chips on In-flight activations that mirror Activation state Progress rows and link to the blocking module.

### `op-cant-03` — Readiness walkthrough stall without Jump
- **Right now I can't:** From a stalled Readiness walkthrough step, jump to the exact operator control that unblocks brand, facts, or template pin.
- **SurfaceIds:** ["Activation & forward-deploy", "Prepared Workspace", "Activation state"]
- **Gap:** Readiness walkthrough is view/progress chrome; when a step stays closed, the operator has no Jump to Forward-deploy fields or Commercial terms.
- **Need:** Stalled-step Jump controls from Readiness walkthrough / Activation state Progress into the owning block.

### `op-cant-04` — Bind packs draft omission reason
- **Right now I can't:** See why a pack version is missing from Bind packs dropdowns — draft, unpublished, or Bounds-blocked look identical (empty list).
- **SurfaceIds:** ["Firm operations bind", "Bind packs", "Configuration libraries", "Founder & agency controls"]
- **Gap:** Bind packs correctly omit drafts, but the desk gives no published-only / Bounds-blocked explanation when a version the operator expects is absent.
- **Need:** Dropdown empty-state or disabled-option chrome that states Draft omitted / Not published / Bounds blocked, with Jump to Configuration libraries or Agency policy.

### `op-cant-05` — Armed / Active blocked without bind completeness
- **Right now I can't:** Read the exact missing bind slot that keeps Armed / Active disabled on firm detail.
- **SurfaceIds:** ["Firm operations bind"]
- **Gap:** Segmented control is disabled until three published versions bind, but the desk does not name which Evaluation / Automation / Engagement slot is empty.
- **Need:** Bind-completeness glance under Armed / Active listing each slot as bound or missing before the control enables.

### `op-cant-06` — Book audit verdict remainder work
- **Right now I can't:** Filter Verdict list to partial / unreachable only and re-run Audit on that remainder after a fix.
- **SurfaceIds:** ["Book readiness", "Verdict list", "Audits"]
- **Gap:** Verdict list shows reachable / partial / unreachable chips, but there is no remainder filter or scoped Start Audit run for non-sequence-ready rows.
- **Need:** Verdict filter chips + Re-audit remainder action scoped to the current firm’s non-ready contacts.

### `op-cant-07` — Oversight drill preserves firm filter
- **Right now I can't:** Drill Fleet health → Firm health and keep that firm filter across Sequence health, Engagement health, and Sequence detail without re-selecting.
- **SurfaceIds:** ["Oversight", "Fleet health", "Firm health"]
- **Gap:** Unhealthy Firm row click is specified, but firm-scope chrome is not sticky when opening Sequence detail or Open support context.
- **Need:** Persistent firm-filter chip on Firm health (and Support context open) that survives panel switches and clears only on explicit dismiss.

### `op-cant-08` — Reference publish dual-check visibility
- **Right now I can't:** See dual-check / schema-contract / publish-group readiness before I Confirm Publish version on a Reference table.
- **SurfaceIds:** ["Reference data", "Reference tables", "Publish version"]
- **Gap:** Publish version modal asks for notes + Confirm; dual-check and dependent-family readiness are invisible, so a half-ready publish can look confirmable.
- **Need:** Dual-check status glance (schema contract, dependent publish-group members) on Publish version, with Confirm disabled until green.

### `op-cant-09` — Commercial terms vs escrow status glance
- **Right now I can't:** Glance the published Escrow terms version and Escrow status chips on the same Commercial instrument row without opening two blocks.
- **SurfaceIds:** ["Commercial", "Escrow terms", "Escrow status"]
- **Gap:** Terms version and hold / release_pending_window / released / disputed live in separate opens; Support and Activation stalls need both at once.
- **Need:** Instrument-row glance: terms version chip + Escrow status chip + Jump to Release control when actionable.

### `op-cant-10` — Support context without leaving Ticket
- **Right now I can't:** Work bind, health, commercial, activation, and recent audit facts for a firm from Ticket Support context without losing the queue row.
- **SurfaceIds:** ["Customer support", "Support context", "Ticket queue"]
- **Gap:** Support context tabs are named in How, but adjacent gap is deep fix requiring Jump that drops ticket ownership / severity chrome.
- **Need:** Support context pane that stays docked on Ticket while Jump opens scoped modules in a side rail or return-preserving stack.

### `op-cant-11` — Founder kill-switch confirmation before Halt
- **Right now I can't:** Confirm fleet-wide vs selected-tenancy scope and typed reason in a final chrome step before Halt motion commits.
- **SurfaceIds:** ["Founder & agency controls", "Kill-switch", "Audit trail"]
- **Gap:** Kill-switch modal collects scope + reason + Halt in one commit surface; adjacent safety gap is no confirmation summary of firms affected.
- **Need:** Confirmation chrome listing scope, firm count / ids, reason, and Audit trail preview before Halt motion writes.

### `op-cant-12` — Agency Bounds impact preview on bind
- **Right now I can't:** Preview which Firm operations bind / send postures a new Bounds row would block before Save policy.
- **SurfaceIds:** ["Founder & agency controls", "Agency policy", "Firm operations bind"]
- **Gap:** Bounds edit + Save policy writes state read by bind/send, but there is no impact preview of currently bound firms that would violate the new bound.
- **Need:** Bounds impact glance (affected firm count + sample rows) on Agency policy before Save policy.

### `op-cant-13` — Audit Change event jump to surface
- **Right now I can't:** From a Change event, jump to the Module / Bind packs / Publish version surface that produced the commit.
- **SurfaceIds:** ["Audit trail", "Change event"]
- **Gap:** Change event shows operation, before/after, actor, firm, affected surface as view — no Jump to that surface with firm filter applied.
- **Need:** Jump to affected surface control on Change event that opens the owning Module scoped to the firm when applicable.

### `op-cant-14` — Register Gap linked to ticket and firm
- **Right now I can't:** Log a Gap with both Support ticket id and firm tenancy so Regenerate handoff carries the friction source.
- **SurfaceIds:** ["Register & evolution", "Gaps", "Customer support"]
- **Gap:** Gap modal allows optional ticket link; firm tenancy and Oversight source are not first-class, so evolution loses which desk friction regenerated.
- **Need:** Gap fields for ticket id + firm filter + source surface, written into handoff state Configuration libraries can read.

### `op-cant-15` — Provision → Activation handoff visibility
- **Right now I can't:** After Provision succeeds, see that firm’s Activation state Progress (or In-flight activations absence) without hunting per-tenancy nav.
- **SurfaceIds:** ["Provision", "Activation state", "Activation & forward-deploy"]
- **Gap:** Provision complete offers Copy Login path / Send invite; assisted-door firms still need activation posture glance on the same completion surface.
- **Need:** Post-Provision handoff card: Activation state Progress summary + Jump to Activation state / Commercial for that firm.

### `op-cant-16` — Sequence detail stuck reason → Support
- **Right now I can't:** From Sequence detail stuck reason and channel gate chips, open Support context already scoped to that firm and sequence.
- **SurfaceIds:** ["Firm health", "Sequence detail", "Customer support", "Support context"]
- **Gap:** Open support context exists on Firm health; Sequence detail does not carry the same scoped handoff with stuck reason attached to the Ticket.
- **Need:** Open support context on Sequence detail that seeds Ticket with firm + stuck reason + gate chips.

### `op-cant-17` — Capture → staging queue unread
- **Right now I can't:** See how many Approach captures are waiting for Forward-deploy Hydrate versus already in Activation state Progress.
- **SurfaceIds:** ["Acquisition & ads", "Activation & forward-deploy", "In-flight activations"]
- **Gap:** Capture writes to In-flight activations, but Acquisition & ads has no waiting-for-hydrate count bridging ads ops to activation ops.
- **Need:** Staging-queue count card on Acquisition & ads (and matching filter on In-flight activations) for captures not yet hydrated.

### `op-cant-18` — Configuration libraries version compare before bind
- **Right now I can't:** Diff two published Evaluation / Automation / Engagement versions before choosing which one Bind packs will pin.
- **SurfaceIds:** ["Configuration libraries", "Firm operations bind", "Bind packs"]
- **Gap:** Catalog shows Published + version id; Bind packs dropdowns pick a version with no side-by-side diff of rules / steps / triggers.
- **Need:** Compare versions affordance on Configuration libraries (and optional peek from Bind packs) that is view-only and does not bind.

### `op-cant-19` — Audit trail filter by operation class
- **Right now I can't:** Filter Change events by operation class (Publish version, Bind packs, Kill-switch, Escrow terms, Provision) alongside firm / actor.
- **SurfaceIds:** ["Audit trail"]
- **Gap:** Firm filter and Actor filter exist; operation-class filter does not, so support hunting a bind vs publish commit scrolls the full log.
- **Need:** Operation filter dropdown + chips above Change event list, composable with firm / actor.

### `op-cant-20` — Escrow release evidence glance before Execute
- **Right now I can't:** See release-evidence / measurement-window / terms-frozen glance on Release control before Execute release / return / Open dispute.
- **SurfaceIds:** ["Commercial", "Release control", "Escrow status"]
- **Gap:** Release control buttons enable from terms + evidence, but the desk does not show the evidence package summary that makes the button legal to press.
- **Need:** Evidence glance (window, predicate, frozen terms version, verification chip) on Release control with actions disabled until glance is green.
