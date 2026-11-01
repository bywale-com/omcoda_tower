# Design

## Context

See `proposal.md` for why. OpenSpec on this SHA starts with an empty `openspec/specs/` inventory. The intended product already exists as Seed → World → Story → Requirements → Face laws → packets → SQL, plus a stale root README that still says “mock data, no backend.”

This change is **specification capture**. Application-code apply is forbidden by the experiment. Hub versus `/prototype-ant`, Story silences versus later packets, and house-authored packs versus flagship overrides are already named in the specs; this design records how those tensions were handled, not a second product invention.

## Goals / Non-Goals

**Goals:**

- One OpenSpec capability per Story system (1–12), plus Automations, three desks/touchpoints, outbound actuation, and product-purpose constraints.
- Intended behavior as SHALL/MUST with WHEN/THEN scenarios.
- As-built SQL/walker/ports labeled when they only partially house the intended law.
- Named silences remain UNRESOLVED requirements, not filled decisions.
- After review, `openspec-sync-specs` lands main `openspec/specs/` without claiming the product was implemented.

**Non-Goals:**

- Implementing Tower, recutting `workflowWalk.ts`, minting tables, or generating plates.
- Asking the founder to resolve silences.
- Treating Hub as the product face.
- A coordinator-template rewrite of these specs.

## Decisions

### Decision: Capability grain follows Story, then Face

**Choice:** Twelve Story systems stay twelve capabilities. Automations is its own capability (Story system 11 is Engine 2 motion; Automations Face is the operations canvas). Desks (`consultant-desk`, `operator-house`, `contact-touchpoints`) and `outbound-actuation` are Face/Wiring extrusions Story excludes by law (UI is control/pane only). `product-purpose` holds north-star, facet walls, face-vs-Hub, data-in-tables, and presentation ≠ fulfillment.

**Why:** Story forbids conflating engines. OpenSpec forbids catch-all capabilities. Folding Agents into Automations would recreate the 14:58 error (triggers inside Agents). Folding desks into systems would invent UI as the machine.

**Alternatives considered:**

- One mega `tower-product` spec — rejected; OpenSpec asks for cohesive evolving boundaries.
- Face modules only — rejected; faceless triggers (reference move, email opened, window elapsed) would disappear, which is the Systems Requirements discovery.

### Decision: Evidence ranking

1. Founder flagship 15:43 (quoted, not paraphrased into a trigger list)
2. Seed + World + Story must / must-not / chain / silence
3. Face laws and Primitives
4. Outcomes / How trees
5. SA packets on this SHA
6. Origin pull refs this SHA tells you to fetch: `pull/96/head` (PM packets), `pull/86/head` and `pull/110/head` (SA) — inspected, not merged
7. Migrations `001`–`024`, walker, dispatch — as-built
8. Root README / older Hub-as-app sentences — historical overlay

**Why:** Seed wins on business conflict; flagship wins on Agents definition; SQL wins on “what is stood up”; Face “Open” and Story silences stay open.

### Decision: Spec-only change; no product apply

**Choice:** `tasks.md` is OpenSpec authoring, validate, and sync. `/opsx-apply` against Tower source is out of scope.

**Why:** Experiment constraint. OpenSpec apply would edit application code.

**Alternative:** Archive without sync — rejected; main `openspec/specs/` would stay empty, so the durable inventory would live only in a change folder.

### Decision: Name tensions instead of picking a winner

Kept both sides in specs:

| Tension | Handling |
|---------|----------|
| House-authored packs vs flagship firm/default/overrides | Named; not deleted |
| Face chaining vs v1 validated walker | Named gap |
| Story parks goal-as-escalation vs packets 022/023 + migrations 021/022 | Story silence remains; Local objective-met is as-built ascription |
| Meta / escrow required by Story, deferred in prototype honesty | Specified and marked deferred |

### Decision: Product face is Ant

`Router.tsx` redirects `/` to `/prototype-ant`. Phase Two / AGENTS.md / Face laws agree. Hub remains plant for Automations/Rules grain.

## Risks / Trade-offs

- [Off-snapshot living packets] → This SHA’s Current pointer names origin `pull/96/head` (PM packets) and `pull/86/head` / `pull/110/head` (SA). Those refs were inspected after first sync. Selected packet laws were folded into Automations/Contact specs. Remaining packet chrome (plate interiors, mapped-box look, wait-note plates) is Face-complete on #96 and only partly restated here. Mitigation: inventory those files under preservation `OFF-SNAPSHOT-PACKETS.md` rather than pretending the SHA tree contained them.
- [Stale docs/README current pointer] → README still says do 022; this SHA already has `021_objective_local_axis.sql` and `022_pursuit_exhausted.sql`. Mitigation: SQL-as-stood-up labeled in specs.
- [OpenSpec apply temptation] → Tasks explicitly forbid application-code work.
- [500-character requirement descriptions] → One behavior per requirement; details in scenarios. `--strict` may still warn; split if it fails.
- [Capability count] → Eighteen files is large but matches Story’s non-conflatable engines plus required faces.

## Migration Plan

1. Validate the change (`openspec validate specify-intended-tower-product --strict`).
2. Sync deltas into `openspec/specs/` (`openspec-sync-specs`).
3. Do not apply application code.
4. Mirror `openspec/` into `/home/ubuntu/tower-spec-output/` (experiment preservation). Do not push origin.

Rollback: delete the change folder and synced specs; Tower application source is untouched.

## Open Questions

None that can be answered later without changing specs. Remaining product unknowns are already UNRESOLVED requirements (Story silences and Automations Face “Open” items).
