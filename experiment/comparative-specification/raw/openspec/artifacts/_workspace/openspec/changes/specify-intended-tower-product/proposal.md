# Proposal

## Why

Tower already has a dense intended-product corpus (Seed, World, Systems Story, Face laws, packets, SQL) but no OpenSpec capability inventory. This change captures that intended product as reviewable specs from repository evidence at SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`, so the intended machine and desks are one coherent contract instead of a stack of overlays.

## What Changes

- Add OpenSpec main-spec capabilities covering the intended Tower product (machine systems, Automations/Agents authorship, desks, outbound gates).
- Record named silences and Face “Open” items as **UNRESOLVED** instead of filling them.
- Distinguish intended behavior from as-built code/SQL where they diverge (including a stale root README that still calls the repo a mock-only prototype).
- Fold living PM packet laws from origin `pull/96/head` (If/Switch, Test, Run/Launch, Get, extra events, in-app affordances) into Automations and Contact specs. Those packets are pointed at by this SHA’s Current pointer; they were inspected, not merged into the application tree.
- Do **not** change Tower application source. `/opsx-apply` against the product is out of scope.

## Capabilities

### New Capabilities

- `product-purpose`: Why Tower exists, north-star consultant outcome, facet walls, product face vs Hub vs Register, data-in-tables honesty, presentation ≠ fulfillment.
- `acquisition-seed-capture`: One-tap Approach capture of cheap seed inputs; continue-scroll; no hard inputs in the click budget.
- `provision-forward-deploy`: After seed inputs land, stage a no-login prepared workspace under firm identity from Om Coda templates.
- `commercial-hard-input`: Database authorization and escrow as activation finish line; firm↔Om Coda money only.
- `tenancy-access`: Firm tenancy, passwordless OTP, access links, same application desk for ALG and assisted doors.
- `reachability-audit`: Reachability-only audit; sequence-ready verdicts; not pathway scoring.
- `consent-suppression`: Opt-in, silence, halt; firm DB auth does not substitute for end-client consent.
- `engagement-sequencing`: Operator-authored outreach sequencing (Agents flagship), campaign calendar vs attempt engine, enroll-now vs event enroll.
- `fact-refresh`: Touchpoints as data collection; field classes; write-back triggers re-evaluation.
- `reference-currency`: Versioned IRCC-shaped reference as data; faceless reference-move trigger; no deploy to update facts.
- `eligibility-evaluation`: Private service eligibility; open-box rules; every determination is a signal.
- `signal-motion`: Engine 2 records every detection and chooses one outbound motion by fixed precedence.
- `meeting-loop-closer`: Meeting booked is the loop win; pending capture; live (not snapshot) brief.
- `automations-orchestration`: Event → operation → binary exits; write-set handle after a node; named events/actions; Global vs Local.
- `consultant-desk`: Consultant workspace (hand over · authorize · receive · halt); Board, Client Data, Contacts, Meetings, Prepared.
- `operator-house`: House-global console plus per-tenancy admin; configuration libraries authored house-side and bound per firm.
- `contact-touchpoints`: Engagement-contact consent, refresh, silence, and booking as firm-branded delivery, not a Tower persona workspace.
- `outbound-actuation`: Composing ≠ sending; consent/halt/silence gates; live vs stand-in ports.

### Modified Capabilities

- None. `openspec list --specs` is empty; this is the first capability inventory.

## Impact

- OpenSpec artifacts only (`openspec/specs/`, this change folder). No application-code, schema, or walker changes.
- Does not recut SA 015 (`workflowWalk.ts`), overwrite the 15:43 Agents flagship, plant Hub as the app, or mint tables from pictures.
- Downstream implementation remains gated by existing packets and named silences; this change does not authorize building deferred Meta, escrow fulfillment, or Register-in-the-firm-product.
