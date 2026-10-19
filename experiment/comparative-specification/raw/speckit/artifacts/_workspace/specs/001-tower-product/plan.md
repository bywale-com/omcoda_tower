# Implementation Plan: Tower Intended Product

**Branch**: `001-tower-product` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-tower-product/spec.md`

**Note**: Filled by `/speckit-plan`. This plan describes how the **existing** Tower repository maps to the intended product. Isolated experiment constraint: **do not implement application source**. Tasks generated later are a remaining-work ledger, not a license to cut product code in this run.

## Summary

Specify and close the intended Tower product: an agency-run immigration desk that authorizes a firm book, engages contacts under house-authored Agents + Automations, re-evaluates eligibility, and books meetings — inhabited at `/prototype-ant`. Technical approach is already chosen by the snapshot: Vite + React 18 SPA, Hono auth/wire on `:3001`, Postgres (Supabase migrations), dumb runtime (`cascade.ts`, `worker.ts`, `workflowWalk.ts`). Work remaining is alignment of Ant face + machine rows to locked packets, not a greenfield stack.

## Technical Context

**Language/Version**: TypeScript as authored in-repo (React 18 SPA). `tsc` is not a repository dependency.

**Primary Dependencies**: React 18, Vite, Ant Design / Radix, Hono, Postgres client via existing scripts; Resend (CEM) and Twilio (SMS) when secrets exist.

**Storage**: PostgreSQL via `supabase/migrations/` (`001`–`024` on this SHA) and `supabase/seeds/`.

**Testing**: Manual smoke on `/prototype-ant`; `npm run build`; repo `verify:*` scripts. No ESLint / Vitest / Playwright / Jest.

**Target Platform**: Web SPA (desktop operator/consultant desk) + Node Hono services. Linux-capable deploy.

**Project Type**: Brownfield web application (frontend SPA + optional backend wire/auth).

**Performance Goals**: Not locked in Seed. Standard interactive desk; no numeric SLA.

**Constraints**: Product face `/prototype-ant`; data-in-tables; do not recut `workflowWalk.ts`; consent/halt/silence gates; SEND_MODE / live-vs-stand-in ports; Hub is not the app; isolated experiment forbids application-code changes in this run.

**Scale/Scope**: Multi-tenant firms; house-global libraries bound per tenancy; twelve Story systems; Agents + Automations as core authorship; Meta/escrow/Register-as-product deferred.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Result |
|------|--------|
| I. Product face is Ant, not Hub | PASS — plan and validation target `/prototype-ant` |
| II. Records come from tables | PASS — data-model from migrations/seeds; no new SPA catalogs |
| III. Tables + dumb runtime | PASS — reuse walker/cascade/worker; do not rewrite 015 |
| IV. Named silences beat invented decisions | PASS — U-001–U-018 remain open; FR-035–037 not guessed |
| V. Write-set is the shape | PASS — contracts treat handle as write-set, not a client field list |
| Boundaries (consent, hard gates, no public eligibility) | PASS |
| Verification is manual on the face | PASS — quickstart is smoke, not a new test framework |
| Experiment: no application implementation | PASS — this plan produces spec artifacts only |

Post-design re-check: same PASS. Complexity of brownfield agency product is inherent, not a gate failure.

## Project Structure

### Documentation (this feature)

```text
specs/001-tower-product/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── checklists/
└── tasks.md
```

### Source Code (repository root)

```text
src/app/register/prototype-ant/     # product face (consultant + operator modules)
src/app/register/prototype-ant/operator/
src/app/register/prototype-ant/consultant/
src/app/wire/                       # ports, reals vs standins
src/app/system-map/                 # machine map (not the app)
server/auth-service/                # OTP, session, access redeem
server/wire-service/                # send, cascade, worker, workflowWalk, routes
supabase/migrations/                # stood-up tables
supabase/seeds/
docs/register/                      # Seed/World/Story/face/packets
```

**Structure Decision**: Keep the existing brownfield layout. Do not introduce a second app or a Hub-as-product tree. System map remains reference.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dual runtime paths (time worker + event walk) | Story 7b + 11 + Automations | One loop cannot both tick attempts and walk operator DAGs without conflating engines |
| House-global libraries + per-tenancy bind | Agency World shape | Firm-authored packs would contradict personas/Outcomes |
| Stand-in vs real ports | GO cutover honesty | Pretending Meta/escrow are live would violate named deferrals |
