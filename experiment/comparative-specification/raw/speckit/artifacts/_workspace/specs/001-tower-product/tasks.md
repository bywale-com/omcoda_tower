# Tasks: Tower Intended Product

**Input**: Design documents from `/specs/001-tower-product/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested as automated tests. Validation is manual `/prototype-ant` smoke per quickstart.md.

**Organization**: Remaining-work ledger against the intended product. Brownfield code already exists. **This isolated Spec Kit experiment MUST NOT execute these tasks as application-code changes.** `/speckit-implement` is out of bounds for this run.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US10 from spec.md
- Paths are repository-relative

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm brownfield layout; do not scaffold a second app

- [ ] T001 Confirm product face lives under `src/app/register/prototype-ant/` and is routed as `/prototype-ant` in `vite.config.ts`
- [ ] T002 [P] Confirm wire/auth split: `server/auth-service/`, `server/wire-service/`, `src/app/wire/`
- [ ] T003 [P] Confirm table inventory `supabase/migrations/001_auth_tables.sql` through `024_wait_occupancy.sql` matches `specs/001-tower-product/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Honesty and machine spine that every story depends on

- [ ] T004 Preserve `server/wire-service/workflowWalk.ts` as the only Automations walk (ignite via payload / untilNodeId / configured-break; do not recut 015)
- [ ] T005 [P] Keep Hub out of product-face work; do not pad Hub to satisfy Ant gaps (`src/app/register/` plant vs `prototype-ant/`)
- [ ] T006 [P] Enforce data-in-tables: no demo people in React modules; seeds in `supabase/seeds/`
- [ ] T007 Confirm send gates in `server/wire-service/dispatchSend.ts` honor consent, halt, silence
- [ ] T008 Split Launch (arm) from Run (walk now) wherever `src/app/register/prototype-ant/operator/` still combines activate + startManualRun
- [ ] T009 Expose trigger test data from `event_write_set` / `event_test_data` (`017_event_test_contract.sql`) inside the Trigger node, not a canvas Test tab

**Checkpoint**: Foundation is the existing machine. Story work is alignment, not a new runtime.

---

## Phase 3: User Story 1 - Consultant hands over the book and receives meetings (Priority: P1) 🎯 MVP

**Goal**: North-star: authorize book + terms; meetings appear without consultant authoring libraries

- [ ] T010 [US1] Prepared workspace Authorize book + Accept terms in `src/app/register/prototype-ant/consultant/PreparedModule.tsx` write hard inputs (grant / escrow posture) without inventing release terms (U-003)
- [ ] T011 [US1] Bind path so a running firm can enroll without the consultant opening Configuration libraries
- [ ] T012 [US1] Meetings + live brief in `src/app/register/prototype-ant/consultant/MeetingsModule.tsx` recompute on fact write-back

---

## Phase 4: User Story 2 - Consultant inhabits the firm desk (Priority: P1)

**Goal**: Access, firm-scoped book, Activity as record, halt

- [ ] T013 [P] [US2] Direct access redeem `/a/:token` via `server/auth-service` + `008_access_links.sql` lands `/prototype-ant`
- [ ] T014 [P] [US2] OTP unprovisioned anti-enumeration in `server/auth-service` otp send
- [ ] T015 [US2] Session firm scoping for Contacts/Board (`src/app/register/prototype-ant/consultant/ContactsModule.tsx`, `BoardModule.tsx`)
- [ ] T016 [US2] Client Details vs Activity: Activity is engagement chronology, not Agents canvas
- [ ] T017 [US2] Halt/Kill from consultant governance surfaces to `/wire/halt`

---

## Phase 5: User Story 3 - Operator authors Agents (Priority: P1)

**Goal**: Flagship Agents canvas and enroll-now

- [ ] T018 [US3] Sequence as blank campaign container in Agents workbench under `src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx` (Agents editor)
- [ ] T019 [US3] Two campaigns for two objectives; no qualify node between them
- [ ] T020 [US3] Override this reveals channel wires; Override content expands inside channel; attempt rules not on channel
- [ ] T021 [US3] CSS-like rule fallback: campaign → sequence Settings → Agents Settings (`rule_*`, `firm_sequence_binding`)
- [ ] T022 [US3] Header Add contact enroll Every firm / Select from; starts mission now (not Publish, not event)

---

## Phase 6: User Story 4 - Operator authors Automations (Priority: P1)

**Goal**: Brain canvas: event, handle, If/Switch, Run vs Launch

- [ ] T023 [US4] Trigger Global vs Local using Local axes already in `016_trigger_local_cascade.sql` / packet 022 columns
- [ ] T024 [US4] Rule GUI + named-code toggle outcomes; required-data listing from `collectible_fields` (`018_collectible_fields.sql`)
- [ ] T025 [US4] Agents action = assign existing or from template only
- [ ] T026 [US4] After node, next Input is write-set from that run (`015` handle; `contracts/events-and-primitives.md`)
- [ ] T027 [US4] If two wires / Switch many wires + Add path; do not mix ⋯ Switch kind-change (`IF-SWITCH` packet)
- [ ] T028 [US4] Get node kind parameters (firm selected → contacts selected)
- [ ] T029 [US4] In-app actions: ascribe tag, run audit, make form — no generic table poke

---

## Phase 7: User Story 5 - Operator binds, audits, oversees (Priority: P1)

**Goal**: Agency bind + reachability + health

- [ ] T030 [P] [US5] Provision assisted door `src/app/register/prototype-ant/operator/ProvisionModule.tsx` via versioned manifests
- [ ] T031 [US5] Firm operations bind published pack versions (`FirmOperationsBindModule.tsx`); Publish ≠ Bind
- [ ] T032 [US5] Book readiness audit verdicts only reachable/partial/unreachable (`BookReadinessModule.tsx`, `audit_runs`)
- [ ] T033 [P] [US5] Firm health / Oversight / Audit trail modules read machine rows, not painted scenery

---

## Phase 8: User Story 6 - Engagement contact loop (Priority: P1)

**Goal**: Consent, one form, silence, book

- [ ] T034 [US6] Opt-in before deeper collection; silenced when not opted in (`consent_records`)
- [ ] T035 [US6] One nudge form for all outstanding self-reportable; never document-dependent on forms (`rule_field_class_routing`, `collectible_fields`)
- [ ] T036 [US6] Opt-out event can ascribe tag; send stops
- [ ] T037 [US6] Meeting booked opens pending capture; brief live (`meeting_booked`, `fact_writebacks`)

---

## Phase 9: User Story 7 - Eligibility and one motion (Priority: P2)

**Goal**: Engine 2

- [ ] T038 [US7] Evaluations emit signals including missing data (`signals`, `missing_fact_signals`)
- [ ] T039 [US7] Motion precedence table `rule_motion_precedence`: reactivation first; else one nudge; one client one motion
- [ ] T040 [US7] Reference publish `POST /wire/machine/reference` re-evaluates without deploy
- [ ] T041 [US7] Do not invent reactivation-worthy criteria (U-002 / FR-036)

---

## Phase 10: User Story 8 - Attempt engine (Priority: P2)

**Goal**: Channel ownership + Local objective + exhaustion

- [ ] T042 [US8] One owning channel at a time from `seq_channel_ownership_order` / campaign channels in `server/wire-service/cascade.ts`
- [ ] T043 [US8] Local objective axis on outbound / fact_writebacks / meeting_booked (`021_objective_local_axis.sql`)
- [ ] T044 [US8] Exhaustion status stops spend, keeps listen (`022_pursuit_exhausted.sql`); no duplicate failure dispatch
- [ ] T045 [US8] Live inbound can nullify in-flight attempt

---

## Phase 11: User Story 9 - Acquisition and activation (Priority: P3)

**Goal**: ALG capability with honest Meta deferral

- [ ] T046 [US9] Capture seed inputs finish line; continue-scroll as non-action (`AcquisitionAdsModule.tsx`)
- [ ] T047 [US9] Forward-deploy prepared workspace from templates + public facts, not private book (`ActivationForwardDeployModule.tsx`)
- [ ] T048 [US9] Keep Meta port stand-in until secrets/product lock; do not claim live ads

---

## Phase 12: User Story 10 - House remaining surfaces (Priority: P3)

**Goal**: Reference, support, founder bounds, Register house-only

- [ ] T049 [P] [US10] Reference data versioning in `ReferenceDataModule.tsx`
- [ ] T050 [P] [US10] Support context pane `CustomerSupportModule.tsx`
- [ ] T051 [P] [US10] Founder/agency controls without leaking to consultant desk
- [ ] T052 [US10] Register evolution remains house-only (`RegisterEvolutionModule.tsx`); not on firm desk

---

## Phase 13: Polish / silences

- [ ] T053 Do not close U-001 CASL geography, U-003 escrow release, U-005 multi-consultant roles, U-006 contact portal depth without founder/Story promotion
- [ ] T056 [P] Lineage of an objective (creator, path, completion, duration) is queryable (FR-032) — querying, not a new module
- [ ] T054 Manual smoke per `specs/001-tower-product/quickstart.md` and `npm run build`
- [ ] T055 [P] Re-read constitution gates after any future implementation (not this experiment)

---

## Dependencies

- Phase 2 blocks story alignment that would rewrite the walker or plant Hub.
- US1 depends on US5 bind + US6/US8 runtime for meetings to be real.
- US4 Run/Launch depends on T008/T009.
- US8 T043/T044 depend on packets 022/023 already migrated.
- US7 T041 and Phase 13 are explicit non-invention.

## Parallel example

- T002/T003; T005/T006; T013/T014; T030/T033; T049–T051 can proceed in parallel.
- US3 and US4 canvases can proceed in parallel after Phase 2.

## Implementation strategy

MVP demonstration of the intended product: Phase 2 + US2 + US3 + US4 + US5 + US6. US1 is the proof those compose. US7–US10 deepen. **Do not run `/speckit-implement` in the isolated specification experiment.**
