# Spec Kit reconstructed bundle

Coordinator reconstruction from transcript diffs. Native mirrors and some version snapshots were created by shell copy and may be missing.


===== STATUS.json =====

{
  "contestant_id": "speckit",
  "sha": "c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7",
  "framework": "github-spec-kit",
  "framework_version": "1.2.1",
  "status": "complete",
  "completion_claim": "GitHub Spec Kit v1.2.1 was installed and initialized with integration cursor-agent. The installed SDD path was followed: constitution → specify → clarify (no founder answers; silences kept) → plan (research, data-model, contracts, quickstart) → custom checklists → tasks → analyze. Implementation and converge were not run because the experiment forbids product-code changes. The intended Tower product is specified from repository evidence (Seed/World/Story/Outcomes/Phase Two flagship 15:43, Agents/Automations face law, primitives, migrations on this SHA, origin pull/96 packets and pull/86|/110 ascribes). Unclosed founder/Story silences remain explicit (CASL geography, reactivation-worthy criteria, escrow release, and the Named Silences table). No application source was modified.",
  "blocker": null,
  "artifact_root": "/home/ubuntu/tower-spec-output/"
}


===== EXPERIMENT-RECORD.md =====

# Experiment record — Contestant 3 (GitHub Spec Kit)

## Identifiers

- contestant_id: `speckit`
- started_at_utc: `2026-10-19T16:46:38Z`
- stopped_at_utc: `2026-10-19T16:53:52Z`
- confirmed_sha: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (HEAD already matched; no checkout)
- git working branch created locally for methodology only: `cursor/speckit-methodology-fa8c` (not pushed)
- framework: GitHub Spec Kit CLI `specify-cli` **1.2.1** from `git+https://github.com/github/spec-kit.git@v1.2.1` (resolved commit `9dca9bf42a031765ee5e5f2371137f2f26967e11`)
- integration: `cursor-agent` (invoke separator `-`; skills in `.cursor/skills/`)
- extensions added: **none**. Git/GitHub extensions skipped (experiment forbids issues/PRs/push). Community brownfield extensions are discovery-only; not installed.
- uv: `0.13.1` installed via `https://astral.sh/uv/install.sh` because it was missing
- bundled workflow `speckit` (specify→plan→tasks→implement) was **not** executed; it would have implemented. Skills were run by hand with implement omitted.

## Initial approach

1. Create `/home/ubuntu/tower-spec-output/` and confirm SHA.
2. Install genuine toolkit as prescribed; record `specify version` and `specify init`.
3. Let installed skills decide sequence. Official existing-project guide: constitution from evidence, then SDD. Documenting the entire intended system **is** the assignment, so that was the specify feature (`001-tower-product`).
4. Do not seat as Tower Engineer/PM/SA. Read those files only as product evidence.
5. Do not push, open PRs/issues, or ask the founder for new requirements.
6. Stop before `/speckit-implement` / `/speckit-converge` / `/speckit-taskstoissues`.

## Install evidence

See `install/specify-version.txt`, `install/specify-init.txt`, `install/init-options.json`, `install/integration.json`.

Init output (abridged): Project ready; skills in `.cursor/skills`; next steps constitution → specify → plan → tasks → implement → converge; optional clarify / analyze / checklist. Script type `sh`. `--here --force --non-interactive --ignore-agent-tools`.

## First substantive artifacts

1. `.specify/memory/constitution.md` v1.0.0 — five principles from register/AGENTS evidence (Ant face, data-in-tables, tables+dumb runtime, named silences, write-set handle) plus boundaries and verification honesty. Snapshot: `versions/constitution/constitution-v1.0.0.md`.
2. `specs/001-tower-product/spec.md` — full intended-product spec (north-star consultant outcome, operator authorship, ten stories, FR-001–037, entities, success criteria, assumptions, named silences). Snapshot: `versions/spec/spec-v1-after-specify.md`.
3. `analysis/EVIDENCE-INDEX.md` — source map and conflict handling (stale README vs later register).

## Later revisions / discoveries

- Origin pull refs named by the snapshot were fetched: `pull/96` (PM packets: Test/Run/If-Switch/Get/Plate-read/…), `pull/86` (SA ascribes 013–028), `pull/110` (022/023 pocket). Used as product evidence, not as other contestants’ work.
- SHA migrations include `019`–`024`; docs/README still says `001`–`018`. Data-model follows SQL on this SHA; drift recorded as U-018.
- Clarify could not ask the founder. Session 2026-10-19 recorded “No” to inventing CASL / reactivation-worthy / escrow-release. Spec v2: `versions/spec/spec-v2-after-clarify.md`.
- Plan produced research, data-model, HTTP+primitives contracts, quickstart (validation, not implementation).
- Custom checklists: `product-coherence.md`, `honesty-and-silences.md` (reviewer-owned, left unchecked).
- Tasks T001–T056 are a remaining-work ledger against the brownfield tree. Banner forbids executing them in this experiment.
- Analyze report: no CRITICAL constitution hits; HIGH = remaining NEEDS CLARIFICATION by design; FR-032 lineage gap closed with T056 after first pass.

## How next steps were chosen

Spec Kit installed workflow + skills:

constitution → specify → (optional) clarify → plan → (optional) checklist → tasks → (optional) analyze → implement → converge.

Full quality-gate path used through analyze. Implement/converge/taskstoissues skipped as execution constraints (no product implementation; no GitHub issues). Bundled `specify workflow run speckit` skipped because it includes implement.

## Why continued / revisited / stopped

Continued until the assignment’s specification deliverable existed and Spec Kit’s pre-implement quality gates had been run. Revisited spec after clarify (session bullets) and tasks after analyze (T056). Stopped because:

- Intended product is specified from available material.
- Uncertainties are explicit rather than invented.
- Next Spec Kit step is implementation, which this experiment forbids.

## Time / resource notes

- Wall clock ~7 minutes of recorded timestamps from start file to bundle (16:46:38Z–16:53:52Z), plus prior reading inside that window.
- Network used for: uv installer, specify-cli git install, official Spec Kit docs, `git fetch` of origin pull refs 86/96/110.
- No other contestant directories were searched.

## File inventory

See `INVENTORY.md`. Primary bundle: `BUNDLE.md`.

Live Spec Kit native dirs (also mirrored under `native-mirrors/final/`):

- `/workspace/.specify/`
- `/workspace/.cursor/skills/speckit-*`
- `/workspace/specs/001-tower-product/`
- `/workspace/.specify/feature.json`
- `/workspace/.specify/memory/constitution.md`

Preservation root also holds `STATUS.json`, this record, `START.md`, `analysis/`, `versions/`, `install/`, `primary/`.


===== analysis/EVIDENCE-INDEX.md =====

# Evidence index — Tower intended-product specification

Contestant: speckit. Source SHA: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.
Fetched origin pull refs named by that snapshot: `pull/96` (PM packets), `pull/86` (SA ascribes/log), `pull/110` (SA 022/023 pocket).

## How claims were sourced

| Claim class | Primary sources |
|-------------|-----------------|
| Why Tower exists | `docs/register/SEED.md` §0.1–0.4 |
| Ecosystem / terms | `docs/register/WORLD.md` |
| Machine must / must-not / silence | `docs/register/SYSTEMS-STORY.md` |
| Human outcomes | `docs/register/OUTCOMES.md` + `docs/register/how/` |
| Personas / seats | `docs/register/personas.md` |
| Agents flagship (founder wording) | `docs/register/PHASE-TWO-LOG.md` 2026-08-15 15:43 UTC |
| Agents face law | `docs/register/AGENTS-FACE.md` |
| Automations face law | `docs/register/AUTOMATIONS-FACE.md` |
| Listen / do primitives | `docs/register/PRIMITIVES.md` |
| Data-in-tables | `docs/register/DATA-IN-TABLES.md` |
| Product face / standing laws | `AGENTS.md`, `docs/README.md` |
| Phase Two method | `docs/register/PHASE-TWO.md` |
| Deferred vs live ports | `docs/wiring/wire-log/GO-CUTOVER.md`, `MODULES-ALIVE.md` |
| PM interior packets | origin `pull/96` (`TEST-PACKET`, `RUN-PACKET`, `IF-SWITCH-PACKET`, `GET-PACKET`, `PLATE-READ`, …) |
| SA machine cuts | origin `pull/86` / `pull/110`; packets 015, 022, 023 on snapshot docs |
| Stood-up stores | `supabase/migrations/001`–`024` |

## Conflicts treated as evidence, not invented resolution

1. Root `README.md` still describes a mock-data UI prototype with no auth/API. Later register, `AGENTS.md`, migrations, and wire-service contradict that. **Intended product follows Seed/World/Story/Phase Two + Ant face**, not the stale README status line.
2. Story parks goal-as-escalation until promotion; Phase Two flagship and packets 022/023 specify objective-met as Local event and failure as stop-spending/keep-listening. Spec records both: flagship/packets as specified machine behavior; Story “not promoted” as a remaining governance tension.
3. `docs/README.md` inventory of migrations (`001`–`018`) is behind this SHA (`019`–`024` exist). Spec uses SQL on this SHA as stood-up truth.
4. Hub is “complete Automations” as plant; Ant is the product face. Spec does not treat Hub as the app.

## What was not used as product requirements

- Third-party Spec Kit commentary
- Other contestants’ work
- Founder questions (forbidden by experiment)
- Invented defaults for Story silences (CASL geography, reactivation-worthy, escrow release)


===== analysis/ANALYZE-REPORT.md =====

# Spec Kit analyze report — 001-tower-product

**When:** 2026-10-19  
**Command:** `/speckit-analyze` (read-only)  
**Artifacts:** `spec.md`, `plan.md`, `tasks.md` plus research, data-model, contracts, checklists  
**Constitution:** `.specify/memory/constitution.md` v1.0.0 — non-negotiable

## Summary

No CRITICAL constitution violations. Spec, plan, and tasks agree that `/prototype-ant` is the product face, tables hold records, `workflowWalk` is not recut, and founder silences stay unnamed as decisions. Residual risk is **documented product uncertainty** (three NEEDS CLARIFICATION + Named Silences), not cross-artifact contradiction.

This experiment correctly **does not** invoke `/speckit-implement`.

## Findings

### CRITICAL (constitution)

None. Plan Constitution Check PASSes gates I–V; tasks T004–T006 encode the same gates.

### HIGH

| ID | Finding | Artifacts |
|----|---------|-----------|
| A1 | Three `[NEEDS CLARIFICATION]` remain (CASL, reactivation-worthy, escrow release). Specify checklist item “No NEEDS CLARIFICATION markers remain” is unchecked. Plan research **chooses to leave them open** rather than resolve Phase 0 unknowns as the template prefers. | spec FR-035–037; research.md; checklists/requirements.md |
| A2 | Story vs packets tension (U-014) is named in spec and research but tasks still implement 022/023 columns (T043/T044). That is consistent with “packets are specified behavior,” yet a later Story promotion could recut vocabulary. | spec U-014; tasks Phase 10 |

### MEDIUM

| ID | Finding | Artifacts |
|----|---------|-----------|
| A3 | Root README “prototype only” vs intended product is handled in Assumptions, not deleted. Downstream readers of README alone will still see the stale line. | spec Assumptions; plan Summary |
| A4 | docs/README migration inventory (`001`–`018`) lags SHA migrations `019`–`024`. Data-model uses SQL on this SHA; operator-docs drift is U-018. | data-model.md; spec U-018 |
| A5 | US1 north-star depends on US5/US6/US8 in the dependency graph while listed as P1 independent test. Spec claims independent testability; tasks honestly sequence US1 after bind/runtime. Mild template tension, not a product conflict. | spec US1; tasks Dependencies |
| A6 | Performance/scale numeric goals absent by evidence. Success criteria are qualitative/count-based. Acceptable under constitution IV. | spec SC-*; plan Technical Context |

### LOW

| ID | Finding |
|----|---------|
| A7 | Feature branch name in Spec Kit JSON (`001-tower-product`) differs from git branch `cursor/speckit-methodology-fa8c`. Harmless; git extension was not installed. |
| A8 | Custom checklists are unchecked (reviewer-owned). Built-in requirements checklist has two open items by design. |
| A9 | Entity list uses business names; some migration table names appear in tasks (needed for brownfield paths). Spec body stays mostly technology-agnostic. |

## Duplications

Agents enroll-now vs Automations event-enroll is repeated in spec US3/US4, FR-008, contracts, and tasks T022/T023. **Intentional** — it is a high-risk mix-up. Not a conflict.

Hub-is-not-the-app repeats across constitution, spec, plan, tasks. Intentional.

## Coverage map (stories → tasks)

| Story | Tasks | Gap |
|-------|-------|-----|
| US1 | T010–T012 | OK |
| US2 | T013–T017 | OK |
| US3 | T018–T022 | Activity-chart law is US2 T016; acceptable |
| US4 | T023–T029 + T008/T009 | OK |
| US5 | T030–T033 | OK |
| US6 | T034–T037 | OK |
| US7 | T038–T041 | OK; T041 is non-invention |
| US8 | T042–T045 | OK |
| US9 | T046–T048 | OK |
| US10 | T049–T052 | Sending infrastructure module exists in tree but is folded into bind/health per personas — not a missing story |
| Silences | T053 | OK |
| FR-032 lineage | T056 (added after first analyze pass) | Closed as a task row; still no UI module invented |

## Remediation (optional; not applied)

1. Keep FR-035–037 open until a founder/Story close — do not “fix” analyze by guessing.
2. If a later occupant updates docs/README migration table, that is documentation drift, not this spec’s job.
3. Do not run implement in this experiment.

## Verdict

**Ready for specification completeness** of the assignment. **Not** ready to pretend founder silences are closed. **Not** ready to implement in this run (constraint + A1).


===== _workspace/.specify/memory/constitution.md =====

<!--
Sync Impact Report
- Version change: (none, first Spec Kit constitution) → 1.0.0
- Modified principles: n/a (template placeholders replaced)
- Added sections: Product Boundaries And Honesty; Specification And Verification
- Removed sections: none (template slots filled)
- Follow-up TODOs: Ratification date is Spec Kit adoption (2026-10-19). Product laws themselves were locked earlier in register docs (Seed 2026-07-27; Agents flagship 2026-08-15 15:43 UTC). No founder ratification ceremony for this file exists in the snapshot.
-->

# Tower Constitution

## Core Principles

### I. Product Face Is The Ant Desk
The intended product is inhabited at `/prototype-ant`. Operator work starts at Operator → Configuration libraries → Agents / Automations. Hub is a plant and reference for those modules, not the app. A change that only makes Hub look complete while Ant is thin MUST be treated as the wrong surface.

Rationale: Phase Two and implementer law lock the Ant desk as the product face. Founder wording: “Don’t look at hub… That’s not the app.”

### II. Records Come From Tables
Records that show inside a module MUST come from tables. The desk shows what the query returns. When a table or field is minted — and where that store is already stood up — seeds MUST hold a reasonable row count so the module is not empty. Data MUST NOT be hard-coded into the application (not in React, not as a painted empty-state of people, tags, verdicts, runs, firms, or contacts).

If the table or field is missing or unspecified, that is a Systems Analyst ascribe. Chrome is not a license to invent a store in the SPA.

Rationale: Data-in-tables law (2026-08-19). Table-first machine law: anything that should be modifiable is a table.

### III. The Machine Is Tables Plus A Dumb Runtime
The machine MUST be tables plus a dumb runtime. Table kinds are **state**, **rule**, or **sequence**. Faceless transitions (email opened, window elapsed, reference version published) are native to the machine; they MUST NOT be discovered only from screens. UI is **control** (injects a change into an existing state) or **pane** (displays an existing state). A control MUST NOT mint substance the Story never required.

Runtime MUST NOT hold content. Time path and event path consume authored rows. `workflowWalk` is the Automations walk; it MUST be ignited (payload, until-node, configured-break), not rewritten as a second machine.

Rationale: Systems Story + table inventory + SA packet 015. Presentation is not fulfillment: an agent surface may ask, explain, and route; it MUST NOT scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money.

### IV. Named Silences Beat Invented Decisions
Where Seed, World, Story, face law, or a locked packet does not establish an answer, the gap MUST be named as a silence, an open question, or “specified but not clear.” A third bucket called “cousin / later / parked” MUST NOT be used to hide work. Founder wording on flags MUST be preserved; generated lists MUST NOT overwrite the flag.

Maximum of two specification buckets:

1. Specified and clear → the requirement stands.
2. Specified but not clear (packet incomplete, or store/control not ascribed) → list it and why. Do not invent the missing grain.

Rationale: Engineer two-bucket law; Story under-claim posture; Decision constitution against catch-all deferral.

### V. Write-Set Is The Shape After A Node
After a node finishes, the next step MUST have every write that run made. The next node picks which of those writes it is about. A field catalog MUST NOT be hard-coded in the client. Hearing a completion as a trigger on a different automation is a second door; it MUST NOT substitute for the handle on the same canvas.

Click the node = configure. Palette **Switch** is the many-path node. Node-menu **Switch** means change this Trigger/Action’s kind. Those words MUST NOT be mixed. Teaching copy and captions on plates are not nodes.

Rationale: Automations face law 33; Primitives; IMAGE-CAPTION-AUDIT; A26 vs If/Switch packet.

## Product Boundaries And Honesty

Tower is an always-on immigration-consultancy workspace run by Om Coda as an **agency product**, not a self-serve tool each firm configures alone. The consultant’s north-star outcome is: hand over the private book, authorize it to work under the firm license, and receive eligible clients booked — without authoring engagement. Operator / house configuration libraries author evaluation, automations, and sequences; per-tenancy admin **binds** those packs under a firm identity.

Engagement phases are Opt-in → Re-engagement (nudges) → Reactivation. Engine 2 motion law: reactivation first if anything is reactivation-worthy; nudge only otherwise; one nudge consolidates every outstanding self-reportable need into a single form; when reactivation fires, secondary signals ride as agenda on the live brief; **one client, one motion, ever**. Attempt / channel-ownership is a separate engine inside one sequence.

Hard human gates MUST NOT be automated away: seed capture; assisted provision and OTP verify; database authorization; escrow accept; client opt-in / not silenced; meeting booking; firm responsibility to refuse illegal or unethical outreach.

End-clients pay Tower nothing. Escrow is firm↔Om Coda contingent terms; Tower MUST NOT hold immigrant settlement funds. Public-before-contact detection of end-client eligibility is out of product. Cold email is not V1 Approach. Meta acquisition, Register/evolution as firm-facing product, and escrow fulfillment remain deferred or prototype-honest where the snapshot says so.

Send paths MUST respect consent, halt, and silence. Unprovisioned OTP requests MUST return generic success and issue no code (anti-enumeration).

## Specification And Verification

Locked plates are read with five buckets: Copy; Do not build; Implied; Completes; Out of scope this build. Captions on images are not spec.

Verification in this repository is **manual** on the running SPA at `/prototype-ant` (distinct screens) plus `npm run build`. There is no ESLint / Prettier / Vitest / Jest / Playwright / `tsc` gate. That absence is repository fact, not a quality claim that automated tests exist.

This constitution governs later Spec Kit planning and analysis. Unrealistic rules MUST NOT be invented merely to fill the template. Test-first automated TDD is **not** a standing Tower law in the snapshot and MUST NOT be asserted here.

## Governance

This constitution is derived from repository evidence at source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` and from origin pull refs named by that snapshot (PM packets on pull/96, SA ascribes on pull/86 and pull/110). It does not mint founder decisions.

Amendment procedure:

1. A change that restates an already-locked flag (especially PHASE-TWO-LOG 15:43 UTC Agents flagship) is forbidden; capture founder wording or label agent alignment.
2. A change that fills a Story silence MUST either cite a later locked packet / Story promotion or remain a named silence.
3. Versioning: MAJOR for principle removals or redefinitions; MINOR for new principles or materially expanded guidance; PATCH for clarifications.
4. Spec Kit artifacts (`spec.md`, `plan.md`, `tasks.md`) MUST be evaluated against this file. Conflicts are resolved by adjusting those artifacts, not by silent dilution of a principle.
5. Application source is not amended by specification work in the isolated experiment that adopted this file.

**Version**: 1.0.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19


===== _workspace/specs/001-tower-product/spec.md =====

# Feature Specification: Tower Intended Product

**Feature Branch**: `001-tower-product`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Examine the supplied Tower repository and establish a complete, coherent specification of the intended Tower product using the information already available. Do not implement. Where the existing material does not establish an answer, make the uncertainty explicit rather than inventing a founder decision."

## Product Overview

Tower is Om Coda’s always-on immigration-consultancy workspace. Firms hand over a private contact book; Tower keeps those people reachable, engages them through opt-in → re-engagement nudges → reactivation, refreshes immigration facts through touchpoints, re-evaluates **service eligibility** as IRCC-shaped rules and client facts move, and campaigns eligible people toward a **booked meeting** — so consultants do not recheck every file by hand.

Tower is **not** a reactive CRM (“what do I do when someone emails?”). It is proactive eligibility wrapped in engagement. Om Coda runs it as an **agency product**: house operators author the operations; firms inhabit the book and the meetings. It is **not** a self-serve tool each firm configures alone. It does **not** detect a stranger’s immigration eligibility from public databases.

**North-star (consultant):** hand the private book over, authorize Tower to work under the firm license, and receive eligible clients already re-engaged and current — without setting up, configuring, or running engagement.

**Author seat (operator):** define outreach sequencing (order deployed), per firm or as a default plus overrides, attempt/escalation rules, and a goal / goal criteria that is itself an escalation point — to another agent, to a workflow, or it ends. Once met, met. Everything in the middle is modular.

**Product face:** the Ant desk (`/prototype-ant`). Hub is plant/reference, not the app.

## Clarifications

### Session 2026-10-19

- Q: May the specification close CASL/SMS geography, reactivation-worthy criteria, or escrow-release terms by inventing a founder choice? → A: No. Isolated Spec Kit experiment forbids asking for additional product requirements. Those three remain `[NEEDS CLARIFICATION]` / Named Silences (U-001, U-002, U-003). Planning MUST treat them as out of closed lock, not as guessed defaults.
- Q: Which document wins when root README says “prototype only, no auth/API” and later register/Story/Ant face describe a wired product? → A: Seed/World/Story/Outcomes/Phase Two + `/prototype-ant` as the intended product; README status line is stale evidence, recorded in Assumptions.
- Q: Is Hub the app because Automations face says Hub is the complete module? → A: No. Hub is plant/reference; Ant is the product face (founder wording + standing laws).
- Q: Should goal-as-escalation wait for Story promotion even though packets 022/023 specify Local met and exhaustion? → A: Specify flagship 15:43 plus packets 022/023 as intended machine behavior; leave Story-promotion tension as U-014. Do not recut walker 015. Do not mint a chrome-only goal table.
- Coverage scan (Spec Kit clarify taxonomy): Functional scope Clear with named deferrals; Domain Partial (silences); NFR/compliance Partial (no SLA; CASL unclosed); Integrations Partial (stand-in ports). No further interactive questions — answers would require a founder.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultant hands over the book and receives meetings (Priority: P1)

As a Consultant, I hand my private book to Tower, authorize it to work under my license, and later see eligible contacts booked onto my calendar without authoring sequences, rules, or automations.

**Why this priority**: This is the sole north-star outcome. If it fails, Tower is not the product Seed describes.

**Independent Test**: After a firm is provisioned and the book is authorized, a sequence-ready eligible contact can be engaged without the consultant opening Configuration libraries, and a booked meeting appears on Meetings with a live brief.

**Acceptance Scenarios**:

1. **Given** a provisioned firm and a prepared workspace, **When** the consultant completes Authorize book (database grant or confirm import) and Accept terms (license + escrow posture), **Then** the campaign can run and the consultant lands in the same Application desk as an assisted-provisioned firm.
2. **Given** a running firm with sequence-ready contacts, **When** the consultant does not configure Agents or Automations, **Then** bound house operations still work the book and meetings can appear.
3. **Given** a meeting is booked, **When** the consultant opens Meetings, **Then** they see the meeting and a live brief that reflects current facts, not a frozen snapshot.

---

### User Story 2 - Consultant inhabits the firm desk (Priority: P1)

As a Consultant, I sign in (or redeem a direct access invite), land in my firm workspace, see the book and board, take booked meetings, and halt anything I will not stand behind.

**Why this priority**: Access, inhabit, and governance are what make the north-star usable and lawful.

**Independent Test**: A provisioned user redeems access or completes passwordless sign-in, sees only that firm’s book, can open a client, and can halt outreach under their license.

**Acceptance Scenarios**:

1. **Given** a provisioned user, **When** they redeem a direct access URL, **Then** they land in the Ant firm workspace with a session (OTP login remains fallback).
2. **Given** an unprovisioned email, **When** someone requests a sign-in code, **Then** the system reports generic success and issues no code.
3. **Given** a session for firm A, **When** the consultant opens Contacts / Board, **Then** they see firm A’s records, not another firm’s book.
4. **Given** outreach running under the firm license, **When** the consultant halt/kills outreach they will not stand behind, **Then** new enroll and send for that scope is suppressed.
5. **Given** a client on the board, **When** the consultant opens the client, **Then** Details (profile / facts) and Activity (engagement chronology) are available; Activity is a record of what already fired, not an authoring canvas.

---

### User Story 3 - Operator authors Agents (Priority: P1)

As an Operator, I author blank agent sequences that hold campaigns (objectives), channel order, nested rule overrides, content, enroll, and launch — so firms can be bound to house-authored engagement rather than inventing it.

**Why this priority**: Agents is the flagship module. Authorship of sequencing, attempts, and goals lives here.

**Independent Test**: On Ant Configuration libraries → Agents, create a sequence with two campaigns, override a campaign to reveal channels, set an objective, enroll contacts, and Launch (arm) without using Automations as the authoring place.

**Acceptance Scenarios**:

1. **Given** no templates exist, **When** the operator opens Agents, **Then** the world is empty until they author; opt-in / re-engagement / reactivation appear only as sequence templates once authored, not as objective names.
2. **Given** a sequence canvas, **When** the operator adds two objectives, **Then** they get two campaigns; meeting the first campaign’s objective may string the next; that distance is not a “qualify” node.
3. **Given** a campaign, **When** the operator sets the objective, **Then** they pick a templated objective or a from-scratch binary event (happened / did not) and name it.
4. **Given** a campaign, **When** they turn on Override this, **Then** channel nodes (text / email / form) appear as wires; campaign-level toggles stay on the campaign; Override content expands inside the channel.
5. **Given** a rule, **When** it is not overridden at campaign or sequence, **Then** it falls back like CSS: campaign → sequence Settings → Agents (global) Settings.
6. **Given** attempt rules, **When** they are per-campaign they live on that campaign; per-sequence they live in Sequence Settings; global they live in Agents Settings — not as cycles drawn between campaigns, and not on the channel node.
7. **Given** a sequence, **When** the operator uses Add contact in the sequence header, **Then** they can enroll Every firm (default) or Select from a list (all selected; deselect to pick); enroll **starts the mission now** (not waiting on an event, not Publish).
8. **Given** an engagement chart on a client, **When** outreach has run, **Then** the chart is a tree of outreach; it does not wire left to the trigger that created the agent.

---

### User Story 4 - Operator authors Automations (Priority: P1)

As an Operator, I author a blank operations canvas: on this event, perform this operation, then fork on results — including in-app actions and assigning existing agents — so the house brain can listen and act without growing a second agent editor.

**Why this priority**: Automations is the operations module; Agents without this perimeter cannot hear events or change the system.

**Independent Test**: On Ant Configuration libraries → Automations, place Trigger → Rule or in-app Action → If/Switch → Agents assign, provide trigger test data, Run now, and Launch to arm.

**Acceptance Scenarios**:

1. **Given** a blank Automations canvas, **When** the operator adds a trigger, **Then** the trigger is schedule, manual, webhook, or an in-app event with Global (all of that kind) vs Local (this specific one) where the event has a Local grain.
2. **Given** the smallest workflow, **When** they place trigger · rule · action, **Then** that is a complete automation; the canvas can also chain further (event → action → condition on previous result → another action).
3. **Given** a Rule, **When** they open it, **Then** they can author GUI conditions (field · operator · constant) and/or named code outcomes that still toggle on/off; a rule is a composite of conditions and constants, creatable across industries.
4. **Given** Rule output, **When** classes exist, **Then** each class can fork later actions; required data is a listing (the questions of a form), not a single flag; the loop is deterministic (no AI to decide required data).
5. **Given** an Action, **When** they choose Agents, **Then** they assign an existing sequence or create from a template — they do **not** author a new agent in Automations.
6. **Given** an Action, **When** they choose in-app, **Then** they can ascribe a tag, run an audit, make a form, or other named in-app actions already on the primitives list — not “write whatever to whatever table.”
7. **Given** a finished node, **When** the next node is configured, **Then** it picks from **every write that run made** (the handle); a different automation listening for “audit finished” is the other door, not a substitute.
8. **Given** If, **When** placed, **Then** it has two wires (true / false); true is the mode; both comparison sides accept typed text or a variable chip. **Given** Switch, **When** placed, **Then** it has many wires and Add path adds a wire. Palette Switch is not the node-menu Switch that changes kind.
9. **Given** Get as a node kind, **When** opened, **Then** parameters can scope Module / firm / contact (firm selected → that firm’s contacts selected; deselect to narrow). Get is not Audit and not Action.
10. **Given** canvas controls, **When** the operator uses them, **Then** Save persists; trigger-interior test data fills the event write-set without running the chain; **Run** walks now with that data and breaks on an unconfigured node; **Launch** only arms the event (does not also fire a manual run).

---

### User Story 5 - Operator binds, audits, and oversees a tenancy (Priority: P1)

As an Operator, I provision or activate a firm, bind house-authored packs under that identity, run the reachability gate, and watch firm health — so the consultant’s book is worked without the firm authoring operations.

**Why this priority**: Agency shape: authorship is house-global; bind and audit are per-tenancy.

**Independent Test**: Provision (or ALG activate) a firm, bind published packs, run book readiness, and see sequence-ready vs not; firm health reflects in-flight attempts.

**Acceptance Scenarios**:

1. **Given** assisted entry, **When** the operator provisions a firm and user from versioned seed manifests (not ad-hoc rows), **Then** that consultant lands in the same Application desk as ALG.
2. **Given** published evaluation / automation / sequence versions, **When** the operator binds them on Firm operations bind, **Then** those packs run under that firm’s identity; publishing in libraries does not itself bind a firm.
3. **Given** a book, **When** the operator runs Book readiness / audit, **Then** contacts receive reachable / partial / unreachable verdicts and sequence-ready or not; the audit does not score pathways, forecast ROI, or impose a minimum list size.
4. **Given** sequence-ready contacts, **When** bind is Active, **Then** enrollment / campaign state can run for that firm.
5. **Given** a running tenancy, **When** the operator opens Firm health or cross-firm Oversight, **Then** they can see engagement health and drill into a firm.
6. **Given** a house change, **When** the operator opens Audit trail, **Then** who/what/when/which firm is inspectable.

---

### User Story 6 - Engagement contact consents, answers, silences, books (Priority: P1)

As an Engagement contact (not a Tower persona workspace), I receive firm-branded touchpoints: consent before deeper collection, one consolidated form for outstanding self-reportable facts, silence/opt-out at any time, and a meeting invite that lands me with the firm already current.

**Why this priority**: The consultant’s so-that has nowhere to land if the contact loop does not close.

**Independent Test**: A contact can opt in, submit one form covering outstanding self-reportable fields, opt out (silencing further automatic outreach), and book when invited.

**Acceptance Scenarios**:

1. **Given** a contact not opted in, **When** automatic outreach would otherwise deepen collection, **Then** they first receive a firm-branded consent request and may agree or ignore; silenced-when-not-opted-in holds.
2. **Given** outstanding self-reportable facts, **When** a nudge fires, **Then** those needs are one form, not one message per field.
3. **Given** document-dependent facts, **When** collection is planned, **Then** they never enter a form; they become tracked work items. Employer-directed asks go to the firm, not the client.
4. **Given** any point in the loop, **When** the contact silences or unsubscribes, **Then** automatic outreach stops; that opt-out is an event that can ascribe a tag.
5. **Given** a meeting invite, **When** the contact books, **Then** meeting booked is the loop-closer; outstanding self-reportable fields open a pending capture; the consultant brief recomputes on write-back.

---

### User Story 7 - Eligibility, signals, and one motion (Priority: P2)

As an Operator (authorship) and Consultant (record), I need every determination — including missing data — recorded as a signal, and at most one outbound motion per client at a time, so the book is worked without parallel spam.

**Why this priority**: This is the always-on loop’s decision law. It is P2 only relative to inhabiting authorship + consent first.

**Independent Test**: A reference change or fact write-back re-evaluates a contact; signals are recorded; if reactivation-worthy, only reactivation sends; otherwise one nudge form; secondary signals attach to the brief, not a second send.

**Acceptance Scenarios**:

1. **Given** firm-held plus engagement-collected facts and current reference, **When** facts or reference move, **Then** service eligibility is recomputed privately for that book; pathway pass means **any** pathway assertion, not one favoured pathway.
2. **Given** an evaluation, **When** it completes, **Then** an Analysis readout exists (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath, inspectable without a code deploy.
3. **Given** detections, **When** Engine 2 chooses motion, **Then** reactivation wins if anything is reactivation-worthy; nudge only otherwise; one client, one motion, ever.
4. **Given** a live inbound mid-attempt (for example a form visit), **When** it occurs, **Then** it can override and nullify the in-flight attempt.
5. **Given** a finishing event, **When** it occurs, **Then** the sequence closes and the next may arm (armed = ready, nothing sending; active = executing).

---

### User Story 8 - Attempt engine inside a sequence (Priority: P2)

As an Operator, I define channel ownership and attempt cycles so that one channel owns the flow at a time, waits nest under the failed owner, and criteria escalate forward — distinct from Engine 2’s campaign-calendar motion.

**Why this priority**: Conflating calendar order with runtime ownership is a named Story failure mode.

**Independent Test**: A sequence in flight owns Text, then Email, then Form per authored order; local retries nest under the failed channel; live inbound can nullify.

**Acceptance Scenarios**:

1. **Given** an in-flight sequence, **When** it runs, **Then** one channel owns the flow at a time along the campaign’s channel order (default teaching order is Text → Email → Form unless overridden).
2. **Given** a failed owner, **When** criteria for escalation are met, **Then** motion is forward-only to the next channel; attempts are cycles of that campaign’s sequence work, not a top-level attempt spanning all campaigns.
3. **Given** the last node of an attempt fails, **When** attempt rules allow another cycle, **Then** the next attempt starts after the authored distance; when the ladder is exhausted, failure **stops spending** (no more outbound) but **keeps listening** so a later completion still counts.
4. **Given** an objective, **When** the completion write for **this** campaign/objective occurs, **Then** that objective is met (Local), not because the person ever booked/submitted/clicked anything in history.

---

### User Story 9 - Acquisition and activation (Priority: P3)

As an Operator, I can acquire a stranger consultant inside a one-click budget (name + website + phone or email), forward-deploy a no-login prepared workspace under their firm identity, and earn the two hard inputs — database authorization and escrow acceptance — until the campaign can run.

**Why this priority**: ALG is a primary growth bet in Seed, but Meta go-live and escrow fulfillment are explicitly deferred/prototype-honest in the snapshot. The capability target stands; live Meta is not required to inhabit the desk.

**Independent Test**: Seed inputs land → prepared workspace exists without private book PII → hard inputs flip the firm to running. Assisted provision is the second real door into the same desk.

**Acceptance Scenarios**:

1. **Given** a Meta Approach (V1 named channel; LinkedIn deferred), **When** a consultant taps, **Then** name, website, and one channel are captured and they return to their scroll (no thank-you dashboard). Continue-scroll without tap is a first-class non-action.
2. **Given** seed inputs, **When** forward-deploy runs, **Then** a no-login prepared workspace is staged from house templates + public firm facts — not from the firm’s private list.
3. **Given** the prepared workspace, **When** hard inputs land, **Then** the campaign is running; credits or a sales-call are not peer doors equal to escrow at that moment.
4. **Given** ALG or assisted entry, **When** the consultant reaches Application, **Then** it is the same desk.

---

### User Story 10 - House remaining surfaces (Priority: P3)

As an Operator, I keep versioned immigration reference current as data, run acquisition/ads ops, hold commercial posture, answer support tickets with firm context, and apply founder/agency bounds — without leaking house controls onto the consultant desk.

**Why this priority**: Load-bearing for the agency shape; several are deferred or thin (Meta, escrow fulfillment, Register as shipped firm product).

**Independent Test**: Reference publish triggers re-evaluation without a code deploy; support can open a firm’s bind/health/commercial context; Register/evolution is house-only and not on the firm desk.

**Acceptance Scenarios**:

1. **Given** a reference version change, **When** it is published, **Then** affected contacts re-evaluate; no deploy is required to update categories, trades, cutoffs, or provincial identifiers.
2. **Given** a running firm ticket, **When** support opens it, **Then** they have that firm’s bind, health, and commercial context.
3. **Given** founder/agency controls, **When** a kill-switch or bound is set, **Then** it applies across tenancies without appearing as a consultant-authored module.
4. **Given** Register / evolution, **When** it is used, **Then** it is prototype-time house tooling; the shipped firm product contains no Register.

---

### Edge Cases

- Contact not opted in: treated as silenced for automatic outreach; firm DB authorization MUST NOT skip opt-in.
- Contact opted out / unsubscribed: halt new automatic send; event may ascribe a tag; failure/exhaustion of a campaign still listens for a later genuine completion unless money-door nullification exists (nullification is escrow-era and **not built**).
- Unreachable or partial audit verdict: not sequence-ready; open issues surface as workspace meta; “list is stale” is a byproduct, not the engine.
- Duplicate / garbage / already-in-Tower / missing name / no matching channel: audit checks; enrollment MUST NOT treat these as sequence-ready.
- Live inbound during an attempt: may nullify the in-flight attempt; form re-entries do not reset an in-progress form clock where OPERATOR-REVISIONS state that (not Story law until promoted — see Assumptions).
- Objective met matching: a meeting booked last quarter MUST NOT complete today’s campaign; completion is Local to the bound objective.
- Exhausted campaign: stop outbound; do not leave the attempt open so the tick writes duplicate failure events.
- Unconfigured Automations node: Run breaks; it MUST NOT mark success and continue.
- Run vs Launch: Launch MUST NOT also start a manual run.
- Empty world: no templates until authored; empty modules show query results (empty), not painted demo people.
- Unprovisioned OTP: generic success, no code.
- Access link: single-use, TTL-bounded; re-issue invalidates prior; one active link per user.
- Multi-consultant roles inside a firm: **not specified** (Story silence). Do not invent a permission matrix.
- Document-dependent need appearing on a form: forbidden.
- Parallel motions for one client: forbidden.
- Agent presentation performing fulfillment (scrape, send, evaluate, OTP, money): forbidden.
- Hub-only completeness with thin Ant: wrong surface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST continuously, while a firm has contacts and hands-free operation is armed: keep engaging dormant and active contacts; keep immigration-relevant facts fresh via firm→client touchpoints; re-evaluate service eligibility as reference and facts move; surface campaign-worthy people so consultants book meetings without manually rechecking every file.
- **FR-002**: System MUST treat **meeting booked** as the core Application success / loop-closer event.
- **FR-003**: Consultant MUST be able to hand over the book, authorize Tower under the firm license, accept activation terms, inhabit Board / Contacts / Client Details / Activity / Meetings, and halt outreach they will not stand behind — without authoring Agents or Automations.
- **FR-004**: Operator MUST author evaluation packs, automation workflows, and engagement sequence templates in house-global Configuration libraries; firms MUST NOT author those packs. Per-tenancy admin MUST bind which published versions run under a firm identity.
- **FR-005**: Agents MUST be the place the operator defines outreach sequencing (including order deployed), per firm or as a default plus overrides, attempt / retry / escalation rules, and a goal / goal criteria that is an escalation point to another agent, another workflow, or end. Once met, met.
- **FR-006**: A sequence MUST be a blank container for one or more campaigns. Each campaign has one objective. Two things to meet MUST be two campaigns. Opt-in / re-engagement / reactivation are sequence templates (full canvases), not objective picker values.
- **FR-007**: Campaigns MUST hold sequencing (how many channels, in what order). Channels are the medium (text, email, form) with channel/escalation rules. Attempt rules MUST NOT live on the channel node. Content override MUST expand inside the channel. Rules nest campaign → sequence → global if not overridden.
- **FR-008**: Agents enroll MUST start the mission now from the sequence header Add contact, scoped Every firm (default) or Select from. Automations enroll MUST NOT start a mission now; it listens for an event.
- **FR-009**: Automations MUST follow: on this event (schedule, manual, webhook, or in-app Global/Local) → perform a definite operation → on this kind of result do X / on that kind do Y. Smallest workflow is trigger · rule · action. Canvas MAY chain.
- **FR-010**: After any Automations node, the next step MUST pick from every write that run made. Clients MUST NOT hard-code a field catalog. Completion as a trigger on another automation is a second door.
- **FR-011**: Automations MUST NOT create new agents. Agents action = assign existing sequence or instantiate from template. Forms for data-request objectives are created in Automations, not in Agents.
- **FR-012**: In-app actions named so far MUST include ascribe a tag, run an audit, make a form; webhook is a way in, not an action. If/condition is a fork, not an action. Get is its own node kind.
- **FR-013**: If MUST have two path wires (true is the mode). Switch MUST have many path wires with Add path. Node-menu Switch (change kind) MUST remain a different control.
- **FR-014**: Trigger test data MUST live inside the trigger (two doors: write already exists vs specimen when it does not). Canvas **Run** executes now with that handle and stops on unconfigured nodes. **Launch** arms only.
- **FR-015**: Engagement record / Activity chart MUST be chronology of fired events; it MUST NOT author channel order, attempts, or escalation.
- **FR-016**: Attempt engine (one sequence) MUST own one channel at a time, nest waits/attempts under the failed owner, escalate forward when criteria are met, accept live inbound override, and on finishing event close and arm next.
- **FR-017**: Engine 2 MUST record every detection as a signal and choose a single outbound motion: reactivation first if reactivation-worthy; else one nudge consolidating outstanding self-reportable needs; secondary signals as brief agenda; one client, one motion, ever.
- **FR-018**: Fact collection MUST route self-reportable → forms / pre-meeting capture; document-dependent → never a form; employer-directed → firm. Any write-back MUST immediately re-evaluate.
- **FR-019**: Reference tables MUST be versioned data updatable without a code deploy. A reference move is a faceless trigger for eligibility re-evaluation of affected contacts.
- **FR-020**: Eligibility MUST be private to the firm book (firm-held + collected facts vs house/firm-configured rules). Pathway pass = any pathway assertion. MUST NOT cold-detect strangers from public databases.
- **FR-021**: Consent / suppression MUST govern automatic touch. Silenced when not opted in and when opted out. Firm database authorization MUST NOT substitute for end-client consent.
- **FR-022**: Reachability audit MUST answer only: can we reach this contact, and can we start a sequence? Verdicts: reachable / partial / unreachable. Sequence-ready is the enrollment precondition. MUST NOT produce pathway scoring, ROI forecasts, or sales PASS/FAIL ceremony.
- **FR-023**: Tenancy MUST own users and the book. Passwordless OTP and direct access-link redeem MUST admit known users. Unprovisioned emails MUST NOT be enumerable via OTP. ALG and assisted doors MUST land in one Application / session matrix. Session firm MUST be the provisioned firm.
- **FR-024**: Acquisition MUST capture name, website, and one channel (phone or email) inside a one-click budget from Meta in V1, then continue scroll. MUST NOT pull database authorization or escrow into that click budget. Cold email is not V1 Approach. Engagement contacts are never acquired via Approach.
- **FR-025**: Activation MUST forward-deploy a no-login prepared workspace from house templates + public facts, then accept database authorization and escrow as the running finish line. Tower MUST NOT hold immigrant settlement funds. End-clients pay Tower nothing.
- **FR-026**: Objective met MUST be detected as a Local event on the completion write bound to **this** objective/campaign, not “any historical completion of that kind.”
- **FR-027**: Campaign failure / exhaustion MUST stop outbound spending and keep listening for a later completion. Duplicate failure events from a still-open attempt MUST NOT fire. Money-door nullification (stop listening) is specified as escrow-era and is **not built**.
- **FR-028**: Send paths MUST respect consent, halt, and silence. Operator MUST be able to Halt / Kill to suppress new enroll and send.
- **FR-029**: Presentation surfaces MAY ask, explain, and route. They MUST NOT scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money.
- **FR-030**: Product face MUST be the Ant desk. Hub MUST NOT be treated as the app. Records shown in modules MUST come from tables; empty worlds stay empty until queries return rows.
- **FR-031**: Teaching captions on plates MUST NOT be minted as nodes or fields. Click node = configure.
- **FR-032**: Lineage of an objective (who created it — agent or hand — path, completion, duration) MUST be queryable at minimum; that is querying, not a new module.
- **FR-033**: In-app events named so far (Global / Local where applicable) MUST include: form submitted; campaign failed; opted out / unsubscribed; firm created / provisioned; audit finished; contact file imported; objective met. New “when X happens” that is not this list is unsupported until a primitive is named on purpose.
- **FR-034**: Hard human gates MUST remain human: seed capture; assisted provision and OTP verify; database authorization; escrow accept; client opt-in; meeting booking; firm refusal of illegal/unethical outreach.
- **FR-035**: CASL/SMS consent regimes by geography MUST [NEEDS CLARIFICATION: Seed/World assert the need but do not close which rules apply to firm→client vs first agent→consultant text, by country].
- **FR-036**: Engine 2 MUST know what makes a signal reactivation-worthy using [NEEDS CLARIFICATION: Story names this silence; no locked criteria pack in Seed/World].
- **FR-037**: Escrow release (when contingent firm↔Om Coda cost is released) MUST [NEEDS CLARIFICATION: Seed/World leave release trigger and outcome undefined; escrow fulfillment is deferred/prototype].

### Key Entities

- **Firm (tenancy)**: Boundary owning users and the private contact book. ALG and assisted provision land in one desk.
- **Consultant**: Acquired persona; inhabits the firm desk (hand over, authorize, receive, govern, take meetings).
- **Engagement contact**: Subject of the book, consent, facts, and meeting; not a branded Tower persona workspace.
- **Operator / Om Coda house**: Agency author and overseer; house-global libraries + per-tenancy admin.
- **Sequence template (agent)**: Blank container of campaigns; authored in Agents; bound per firm.
- **Campaign**: One objective inside a sequence; holds channel order, defaults, optional overrides, attempt grain.
- **Campaign objective**: Binary completion the campaign pursues (form / meeting / click and named types as locked); completion is Local.
- **Channel**: Medium (text, email, form) with escalation rules and optional content override / attempt variation.
- **Attempt cycle**: Retry container for a campaign’s sequence work after last node fails.
- **Enrollment / active attempt / engagement record**: Runtime state and fired chronology (record does not author).
- **Automation workflow**: Event/schedule/manual/webhook → operations graph → actions; blank canvas; DAG-like.
- **Workflow trigger**: Listen (Global/Local in-app event, or non-event schedule/manual/webhook).
- **Rule / constants pack**: Composite of conditions and constants; GUI and named-code outcomes; industry-swappable.
- **Action**: Agents assign/template, or named in-app action (tag, audit, form, …).
- **Write-set / handle**: Every write a module run made; next node’s input.
- **Contact record / import batch / tags**: Book objects; tags are in-app records (e.g. subscribed/not).
- **Consent / halt / silence**: Suppression state distinct from firm DB authorization.
- **Reachability verdict / sequence-ready / audit run**: Gate before engagement.
- **Reference version / collectible field**: Versioned public-reference and field-class routing (self-reportable / document-dependent / employer-directed).
- **Eligibility evaluation / result / analysis / signal / motion decision**: Detect vs send split.
- **Fact writeback / missing-fact signal**: Collection loop into re-evaluation.
- **Meeting booked / live brief**: Loop-closer and consultant pre-meeting view.
- **Prepared workspace / escrow acceptance**: Activation artifacts (escrow fulfillment deferred).
- **Access link / session / OTP challenge**: Admission without treating invite as a marketing portal.
- **Outbound message / messaging event**: Send + provider events (open, click, bounce) feeding attempt criteria and click objectives.
- **Campaign failure**: Exhaustion event (stop spending, keep listening).
- **Event test data / event write-set**: Trigger-provided specimen vs existing writes for Run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A consultant who has authorized the book can receive a booked meeting for an eligible, sequence-ready contact without opening Configuration libraries in that session.
- **SC-002**: 100% of automatic deeper collection attempts are preceded by a recorded opt-in (or the contact remains silenced). Zero sends after halt/silence/opt-out for that contact.
- **SC-003**: For any in-flight client, observers can point to at most one outbound motion at a time (no parallel nudge + reactivation sends).
- **SC-004**: An operator can author a two-campaign sequence, enroll at least one contact, and arm it from Agents without creating the sequence inside Automations.
- **SC-005**: An operator can author trigger → operation → If/Switch → action, fill trigger test data, Run until an unconfigured node stops, and Launch without that Launch also firing the run.
- **SC-006**: After an Automations action that invoked a real module (e.g. audit), the next node can be pointed at writes from **that** run rather than “latest audit for this firm.”
- **SC-007**: Completing an objective for campaign B does not mark campaign A complete; only the bound Local completion counts.
- **SC-008**: A newly provisioned firm’s Contacts view is that firm’s query result (empty if none), not another firm’s people.
- **SC-009**: A reference publish causes affected contacts to be re-evaluated without a software release.
- **SC-010**: Unprovisioned sign-in requests never confirm whether the email exists (generic success, no code).
- **SC-011**: Meeting booked with outstanding self-reportable facts presents pending capture, and the consultant brief reflects write-backs without a manual refresh reconstruct.
- **SC-012**: Audit never displays pathway scores, ROI forecasts, or a sales pass/fail as its verdict; verdicts are reachable / partial / unreachable plus sequence-ready.

## Assumptions

- Intended product is Seed/World/Story/Outcomes/Phase Two + Ant face, not the stale root README “prototype only, no auth/API” status line (contradicted by later register, migrations, and wire cutover notes).
- Hub remains an advanced plant for Agents/Automations visuals; Ant is the product to specify and inhabit.
- Contact is delivery-only (firm-branded touchpoints + access/capture), not a second acquired persona workspace. Access links for consultants are a direct URL, not a login-portal product. Depth of an authenticated **contact** portal beyond touchpoints remains a Story silence; this spec does not invent a full client app.
- OPERATOR-REVISIONS numeric windows (30 min text, 24 h email/form) are prototype clarifiers, **not** Story law until promoted. Spec requires authored criteria; it does not freeze those numbers as founder-ratified product lock.
- Goal-as-escalation is flagship law (15:43). Packet 022/023 specify Local objective-met and exhaustion-vs-listen. Story still labels a related expansion “not promoted”; this spec treats the flagship + those packets as specified behavior and records the Story-promotion tension as unresolved governance, not as permission to mint a separate goal table from chrome.
- Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, and list-unsubscribe ingress remain deferred/stand-in where the snapshot says so. Capability targets in Story still stand.
- Register/evolution is house-only prototype-time tooling; shipped firm product has no Register.
- V1 evaluation truth is Canada / IRCC-shaped immigration; other industries are pack-swap direction, not a locked second vertical.
- Dual entry to Agents: Automations `call_agent` **and** Agent-native enroll.
- Verification in-repo is manual on `/prototype-ant` plus production build; no automated UI test suite is specified as a product requirement.
- Reasonable web-app performance and session continuity are assumed where unspecified; no numeric SLA is locked in Seed.

## Named Silences And Unresolved Questions

These are **not** decided here. Do not fill them with a founder-shaped guess.

| ID | Topic | Why unresolved |
|----|--------|----------------|
| U-001 | CASL/SMS consent regimes by geography | Story silence; FR-035 |
| U-002 | What makes a signal reactivation-worthy | Story silence; FR-036 |
| U-003 | Escrow release trigger / outcome; ongoing SaaS vs escrow peer door | Story silence; FR-037; fulfillment deferred |
| U-004 | Concrete shape of “database authorization” per practice stack | Story silence |
| U-005 | Multi-consultant roles / permissions inside a firm | World/Story open |
| U-006 | Client desk depth (touchpoint-only vs authenticated portal); D-01/D-02 loop-closer builder placement | Story silence |
| U-007 | Whether email Approach earns Meta entry; Meta targeting / CAC | Story silence |
| U-008 | SMS reply-failure escalation | Story silence |
| U-009 | Import fully mutating the living list; CRM bidirectional sync | Story silence / V2 backlog |
| U-010 | Rule-pack IP / liability; Constants packs beyond Immigration | Story silence |
| U-011 | Form-as-own-graph-node vs embedded with calling the agent | Founder leans embedded; not locked |
| U-012 | Full in-app action catalog beyond named primitives | Face: do not invent the rest |
| U-013 | Full event catalog beyond the primitives table | Face: do not invent the rest |
| U-014 | Story promotion of SYSTEMS-GOAL vs 022/023 already specified | Governance tension; do not recut 015 |
| U-015 | Production hosting / worker packaging / “prod E2E green” | GO cutover is code-level, not a prod-green claim |
| U-016 | Spoken “call” channel as a medium | Agents face still open in 18:25 stamp |
| U-017 | Mixing objective types in one sequence beyond “technically you should be able to” | Not a locked UI rule beyond multiple campaigns |
| U-018 | Packet 020 Operator panes vs `firm_readiness` (waiting on #86 in docs/README) | Snapshot docs disagree with later migrations `023_operator_panes.sql`; ascribe vs landed cut needs SA confirmation — not invented here |


===== _workspace/specs/001-tower-product/plan.md =====

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


===== _workspace/specs/001-tower-product/research.md =====

# Research: Tower Intended Product

Phase 0 of `/speckit-plan`. Unknowns taken from Technical Context and spec silences. Decisions are **from the repository**, not invented founder choices.

## Decision: Intended product vs stale README

- **Decision**: Specify Seed/World/Story/Outcomes/Phase Two + Ant face as the intended product.
- **Rationale**: Later register, `AGENTS.md`, migrations `001`–`024`, and GO cutover contradict README “no auth/API.”
- **Alternatives considered**: Treat README as law (rejects the rest of the corpus); merge without noting conflict (hides evidence).

## Decision: Product face

- **Decision**: `/prototype-ant` is the product. Hub is plant/reference.
- **Rationale**: Standing laws; Automations face “Don’t look at hub… That’s not the app.”
- **Alternatives considered**: Specify Hub as the app (explicitly forbidden).

## Decision: Runtime

- **Decision**: Keep `workflowWalk.ts` as Automations walk; `cascade.ts` + `worker.ts` as attempt/time path. Ignite walker (payload, until-node, configured-break). Do not recut 015.
- **Rationale**: SA 015; constitution III.
- **Alternatives considered**: Second walker for Test/Run (forbidden); Hub `lastOutput` as live path (named as smell only).

## Decision: Stack

- **Decision**: Existing Vite + React 18 + Hono + Postgres. No new framework.
- **Rationale**: Already stood up; constitution forbids inventing a parallel machine.
- **Alternatives considered**: Greenfield rewrite (out of scope; experiment forbids implementation anyway).

## Decision: Testing

- **Decision**: Manual `/prototype-ant` smoke + `npm run build` + existing `verify:*` scripts. Do not add Vitest/Playwright as a constitution requirement.
- **Rationale**: Repository explicitly has no those tools.
- **Alternatives considered**: Invent TDD law to fill Spec Kit template (forbidden by constitution).

## Decision: Unresolved product silences (FR-035–037)

- **Decision**: Leave CASL geography, reactivation-worthy criteria, and escrow release **unresolved**. Planning MUST NOT pick defaults.
- **Rationale**: Story silences; experiment forbids asking founder; Spec Kit clarify recorded “No.”
- **Alternatives considered**: Industry-standard CASL guess; copy OPERATOR-REVISIONS windows as lock; invent escrow release on meeting booked. All would mint founder decisions.

## Decision: Objective met and failure

- **Decision**: Treat packets 022/023 as specified machine behavior (Local completion axis; exhaustion stops spend, keeps listen). Record Story-promotion tension as U-014.
- **Rationale**: Flagship 15:43; packets on snapshot; migrations `021_objective_local_axis.sql`, `022_pursuit_exhausted.sql` exist on this SHA.
- **Alternatives considered**: Wait forever for Story promotion (would ignore locked packets); mint a `goal` table from chrome (forbidden).

## Decision: Deferred capabilities

- **Decision**: Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup, list-unsubscribe ingress stay stand-in/deferred. Register/evolution stays house-only tooling.
- **Rationale**: `GO-CUTOVER.md`, `MODULES-ALIVE.md`, personas, Outcomes.
- **Alternatives considered**: Specify them as V1 must-ship (contradicts snapshot honesty).

## Decision: Data location

- **Decision**: Postgres tables + seeds. Client stand-ins only mirror table shape when wire is off.
- **Rationale**: DATA-IN-TABLES.md.
- **Alternatives considered**: Paint demo rows in React (forbidden).

## Performance / scale

- **Decision**: No numeric SLA. Desk must remain usable as an operator/consultant workspace. Scale is multi-tenant firms, not a locked concurrent-user number.
- **Rationale**: Seed does not specify; constitution IV.
- **Alternatives considered**: Invent “95% under 1s” (Spec Kit default temptation; not Tower evidence).


===== _workspace/specs/001-tower-product/data-model.md =====

# Data Model: Tower Intended Product

Derived from spec Key Entities and `supabase/migrations/` on SHA `c5bd617`. Classification follows table-first law: **state | rule | sequence**. Fields listed are conceptual (business), not a license to invent columns. Stood-up SQL is the column source of truth.

## Tenancy and admission (state)

| Entity | Role | Relationships |
|--------|------|----------------|
| Firm | Tenancy boundary | Has users, contacts, bindings, campaigns |
| User | Consultant or house operator login | Belongs to firm |
| Session / OTP challenge | Passwordless admission | User; unprovisioned email issues no code |
| Access link | Direct invite URL | User; single-use; TTL; re-issue invalidates prior |
| CT firm / sending domain | Wire/send identity | Firm |

Validation: session `firm_id` is the provisioned firm. Dual UUID/TEXT tenancy appears in backlog as a conservative split — do not invent a third id.

## Book and suppression (state)

| Entity | Role |
|--------|------|
| Contact record | Private book person |
| Import batch | Upload instance; Local axis for import events |
| Consent record | Opt-in / silenced / waitlisted |
| Halt record | Firm or contact suppress new enroll+send |
| Contact tag | In-app ascribed tag (e.g. subscribed/not) |
| Contact upload / contact access link | Contact-seat artifacts (later migrations) |

Validation: silenced when not opted in; halt and silence gate send; firm DB auth ≠ consent.

## Reachability (state + rule)

| Entity | Kind | Role |
|--------|------|------|
| Audit run | state | Batch of checks |
| Reachability verdict | state | reachable / partial / unreachable |
| Sequence-ready | state | Enrollment precondition |
| Rule reachability checks | rule | What the audit evaluates |

Must-not: pathway/ROI/sales ceremony as verdict.

## Agents authorship (sequence + rule + state)

| Entity | Kind | Role |
|--------|------|------|
| Sequence template | sequence | Blank canvas of campaigns |
| Firm sequence binding | state | Per-firm template + overrides |
| Campaign | sequence | One objective container |
| Campaign objective | state | Binary completion pursued |
| Campaign channel | sequence | Medium + order |
| Channel variation | state | Attempt-N content |
| Seq channel rules / ownership order / phase order | rule/sequence | Escalation and order as data |
| Seq attempt cycle | rule | Attempt distance / cycles |
| Rule attempt criteria / motion precedence / field class / eligibility / cohort / metrics | rule | Nested like CSS: global / sequence / campaign |
| Rule pack | rule | Versioned evaluation pack |
| Collectible fields | rule | Required-data listing / field class |

Validation: two objectives → two campaigns. Attempt rules not on channel node. Empty world allowed.

## Runtime engagement (state)

| Entity | Role | Transitions |
|--------|------|-------------|
| Enrollment | Contact on a sequence/campaign | cursor = campaign_id |
| Active attempt | In-flight ownership | open → exhausted (stop spend) / inbound-nullified; do not reuse nullified for exhaustion |
| Engagement record | Fired chronology | Append-only; does not author |
| Outbound message | Send in pursuit of objective | Must carry enrollment/campaign/objective/attempt when in sequence |
| Messaging event | Provider open/click/bounce | Feeds criteria and click objectives |
| Campaign failure | Exhaustion event | Global/Local; one event per exhaustion, not tick-spam |
| Campaign state | Armed vs active vs bind | Armed = nothing sending |

## Automations (state + sequence)

| Entity | Kind | Role |
|--------|------|------|
| Workflow | sequence | Blank DAG graph |
| Workflow trigger | state | Event/schedule/manual/webhook; Global vs Local axes |
| Workflow state / target / run | state | Activation and instances |
| Action | state | Agents assign/template or in-app; payload_binding for Local return |
| Event write-set | rule/state | What an event writes (handle shape) |
| Event test data | state | Trigger specimen for Run (must not INSERT live on that control) |
| Wait occupancy | state | Wait node occupancy (migration 024) |

Validation: next node picks from write-set of **that** run. Launch arms; Run walks now.

## Eligibility loop (state + rule)

| Entity | Kind | Role |
|--------|------|------|
| Reference version | state | Versioned IRCC-shaped data |
| Constants pack | rule | Industry constants |
| Eligibility evaluation / result | state | Private to book |
| Signal | state | Every determination including missing |
| Motion decision | state | Engine 2 choice |
| Missing fact signal | state | Detection of gap |
| Fact writeback | state | Collection; Local form_ref / objective axis when pursuing |
| Meeting booked | state | Loop-closer; Local objective axis |

Validation: one client, one motion. Document-dependent never on forms. Immediate re-eval on write-back.

## Activation / commercial (state)

| Entity | Role | Honesty |
|--------|------|---------|
| Prepared workspace | No-login readiness | Capability stands |
| Escrow acceptance | Hard input | Fulfillment / release **unresolved** (U-003) |
| CRM OAuth grant | Book authorize | Shape per practice stack **unresolved** (U-004) |

## Operator panes (state)

| Entity | Role |
|--------|------|
| Register gaps | House evolution notes (not firm-facing product) |
| Audit events | Who/what/when/which firm |
| Primary store rows | Legacy CT bags; not a second catalog for machine objects |

## Relationships (causal, not only FK)

```text
Acquisition seed land → prepared workspace → hard inputs → running
Audit sequence-ready → enrollment
Eligibility / reference / writeback → signals → Engine 2 motion → engagement sequence
Attempt finishing / objective Local write → arm next or escalate (agent | workflow | end)
Exhaustion → campaign_failure (stop outbound, keep listen)
Automations: event/write-set → walk → action → module writes → handle
```


===== _workspace/specs/001-tower-product/quickstart.md =====

# Quickstart / validation guide — Tower intended product

This run **must not implement** application code. Use this guide to validate that the **specification** matches inhabited surfaces and to smoke the snapshot as-is.

## Prerequisites

- Node dependencies installed (`npm install` if needed).
- For SPA-only: `VITE_WIRE_REAL=false` (else `/wire` calls need backend).
- For real-data: `.env` from `.env.sandbox.example`; URL-encode `$` in `DATABASE_URL` as `%24`; `npm run dev:auth` on `3001` and `npm run dev` on `5173`.
- Optional DB: `npm run db:migrate` && `npm run db:seed`. Platform firm id in `supabase/seeds/manifest.json`.
- If login stuck with auth disabled: `sessionStorage.removeItem('tower.loggedOut')`.

## Build gate

```bash
npm run build
```

## Product face smoke (manual)

Open `/prototype-ant` (not Hub as the app).

| Story | Where | Expect |
|-------|--------|--------|
| US2 Access | Login / `/a/<token>` | Session into firm desk; unprovisioned OTP does not confirm existence |
| US2 Inhabit | Consultant Board, Contacts, Meetings | Records = query; empty if none; no painted demo people |
| US2 Activity | Client Activity | Chronology of outreach; not Agents canvas |
| US3 Agents | Operator → Configuration libraries → Agents | Blank sequence, campaigns, Override this, enroll header, Launch arms |
| US4 Automations | Configuration libraries → Automations | Trigger Global/Local; test data inside trigger; Run vs Launch split; If two wires / Switch many wires |
| US5 Bind/Audit | Firm operations bind, Book readiness, Firm health | Bind published packs; audit verdicts reachable/partial/unreachable |
| US6 Contact | Consent / form / silence | One form for outstanding self-reportable; silence stops send |
| US1 North-star | Meetings after bind | Meeting + live brief without consultant authoring libraries |

Do not treat Hub completeness as a pass.

## Wire probes (when secrets + DB)

- `GET /auth/health`, `GET /wire/health`
- `POST /wire/send/cem` and `/wire/send/sms` with platform `firmId` + `TEST_EMAIL_TO` / `TEST_SMS_TO` (no contactId skips consent/halt)

## Honesty checks

- Meta / escrow fulfillment / Register-as-firm-product: MUST still read as deferred or house-only.
- Objective-met: a historic meeting MUST NOT complete an unrelated campaign (Local axis).
- Exhaustion: no duplicate `campaign_failure` spam from a still-open attempt.

## Silences (do not fail the spec for these being unimplemented decisions)

CASL geography, reactivation-worthy definition, escrow release (U-001–U-003).


===== _workspace/specs/001-tower-product/tasks.md =====

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


===== _workspace/specs/001-tower-product/contracts/events-and-primitives.md =====

# Contract: Events, actions, and the write-set handle

Canonical product primitives from `docs/register/PRIMITIVES.md` and Automations/Agents face law. Unsupported “when/do” MUST be refused or named as a new primitive on purpose.

## Listen (triggers)

| Kind | Grain |
|------|--------|
| In-app event | Global (all of that kind) or Local (this instance) when an axis exists |
| Schedule | Time; not an in-app event |
| Manual | Operator pressed; not an in-app event |
| Webhook | Outside told us; way **in**, never an action |

### In-app events named so far

| Event | Global | Local |
|-------|--------|-------|
| Form submitted | All forms | This form |
| Campaign failed | All failures | This campaign |
| Opted out / unsubscribed | All | — |
| Firm created / provisioned | All new firms | — |
| Audit finished | All audits | Usually none (one-time) |
| Contact file imported | All imports | This batch / firm — later if needed |
| Objective met | Completions of that kind | This objective / campaign |

Local matching requires an instance axis on the completion/write row (packet 022). Historical “any meeting ever” MUST NOT satisfy “this campaign’s meeting.”

## Do (actions)

**Agents:** assign existing sequence OR create from template. Do not author a new agent here.

**In-app (named):** ascribe a tag; run an audit; make a form (questions = required data listing); who-this-applies-to is audience, not mission-now. Provision-as-action is directionally in primitives; canonical listen is “firm was created.”

Not actions: If/Switch (forks); webhook; “write whatever.”

## Handle after a node

When a node completes, the next node’s input is **every write that run made**. Pick a write (or a field of a write). Person-row writes split people; run-row writes are artifacts.

Two doors MUST NOT collapse:

1. Same canvas: Event → Action → If on that handle.
2. Different automation: hear “audit finished” as a trigger.

## Rule output

Deterministic classes including required-data **listing**. GUI (field · operator · constant) and named-code outcomes that still toggle. After the rule, If/Switch calls from previous result — that is not the same grain as conditions inside the rule.

## Engine 2 vs attempt engine

Do not interchange:

- Engine 2: which motion (reactivation vs nudge); one client, one motion.
- 7b: channel ownership inside the chosen sequence.


===== _workspace/specs/001-tower-product/contracts/http-auth-wire.md =====

# Contract: Auth and Wire HTTP

Product-facing services already mounted. This is a specification of intended ports, not new API design. Paths exist under `/auth` and `/wire` (Vite also proxies `/api/*`).

## Auth (`server/auth-service`)

| Method | Path | Intent |
|--------|------|--------|
| GET | `/auth/health` | Liveness |
| POST | `/auth/otp/send` | Request code; unprovisioned → generic success, no code |
| POST | `/auth/otp/verify` | Session; returns firm id for active firm |
| POST | `/auth/otp/abandon` | Drop challenge |
| GET | `/auth/session` | Current session |
| POST | `/auth/logout` | Clear session |
| POST | `/auth/access/issue` | Mint direct access link |
| POST | `/auth/access/redeem` | One-time redeem → session cookie → Ant desk |
| GET/POST | `/auth/register/*` | House register lock/status (not firm product) |

Errors MUST NOT enumerate whether an email is provisioned.

## Wire send and suppression

| Method | Path | Intent |
|--------|------|--------|
| GET | `/wire/health` | Liveness |
| POST | `/wire/send/cem` | Email (Resend when live) |
| POST | `/wire/send/sms` | SMS (Twilio when live) |
| POST | `/wire/webhooks/resend` | Messaging events; hard-bounce silence |
| POST/GET | `/wire/halt*` | Halt commit/lift/list/contact/firm-book |
| POST/GET | `/wire/consent*` | Consent set/silence/get |
| POST/GET | `/wire/oauth*` | CRM grant/revoke/get |
| POST/GET | `/wire/audit*` | Operator audit append/list |
| GET/POST | `/wire/pool*` | Sending domain allocate/verify/chips |
| GET | `/wire/store/:collection` | Primary store (legacy bags) |

Send MUST no-op or reject when halt/consent/silence forbids. Probe without `contactId` may skip consent/halt (ops probe only).

## Machine

| Method | Path | Intent |
|--------|------|--------|
| GET | `/wire/machine/health` | Machine liveness |
| GET/POST | `/wire/machine/tick` | Time path (cascade) |
| CRUD-ish | `/wire/machine/workflows*` | List/create/activate/pause/runs |
| POST | `/wire/machine/enrollments` | Enroll (Agents mission-now vs Automations event — product split is in spec, not a second endpoint family) |
| POST | `/wire/machine/reference` | Publish reference (faceless eligibility trigger) |
| POST/GET | `/wire/machine/audit-runs*` | Audit module |
| POST | `/wire/machine/contact-import` | Import batch |
| GET | `/wire/machine/event-test-contract` | Write-set shape for trigger test data |
| GET | `/wire/machine/board` | Board detections |
| GET | `/wire/machine/templates` | Sequence templates |
| POST | `/wire/hook/:webhookId` | Webhook listen (not an action) |

## Intended ignition (Run vs Launch)

These are product contracts on existing walk, not new routes unless already present:

- **Launch**: activate/arm workflow so future events dispatch. MUST NOT also `startManualRun`.
- **Run**: walk `workflowWalk` now with trigger test-data / payload writes; stop when `configured === false` or `untilNodeId`.
- **Test data**: fills trigger output from existing writes or specimen (`event_test_data`); MUST NOT INSERT the live event as a side effect of the control.

Live vs stand-in: Meta, escrow fulfillment, enrich, Postmaster, warmup, list-unsubscribe remain stand-in.


===== _workspace/specs/001-tower-product/checklists/requirements.md =====

# Specification Quality Checklist: Tower Intended Product

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-19
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [ ] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Three `[NEEDS CLARIFICATION]` markers remain on purpose (CASL/SMS geography, reactivation-worthy criteria, escrow release). Experiment forbids asking the founder; they are also Story silences. Spec Kit specify limits markers to three; remaining gaps are in **Named Silences And Unresolved Questions**.
- FR-035–FR-037 therefore lack closed acceptance until those silences are filled. Other FRs are testable via the user-story scenarios.
- Product-face route `/prototype-ant` is named as the inhabited desk (product location), not as a tech-stack choice.
- Validation iteration 1: checked implementation leakage (SQL, React, Hono, Vite) — none in FR/SC body. Entity list names business objects; table names appear only in Assumptions where they identify snapshot evidence, not as implementation how.
- Do not treat this checklist as implementation complete. `[x]` here means requirement-quality, except the two unchecked items which remain blocked on founder/Story silences.


===== _workspace/specs/001-tower-product/checklists/product-coherence.md =====

# Product Coherence Checklist: Tower Intended Product

**Purpose**: Unit tests for whether the specification keeps Agents, Automations, engines, and seats distinct
**Created**: 2026-10-19
**Feature**: [spec.md](../spec.md)

**Note**: Generated by `/speckit-checklist`. Reviewer-owned. `[x]` means requirements quality, not implementation complete.
**Review Ownership**: Author/reviewer of the specification artifacts.
**Marker Semantics**: Unchecked until a reviewer confirms the English is sufficient.

## Requirement Completeness

- [ ] CHK001 Does the spec state that Hub is not the product face and name the Ant desk as the inhabited surface?
- [ ] CHK002 Are consultant verbs limited to hand over / authorize / receive / govern / take meetings, with authorship on the operator?
- [ ] CHK003 Is the Agents flagship (sequencing, overrides, attempt rules, goal as escalation endpoint) present without substituting a generated trigger list inside Agents?
- [ ] CHK004 Are Automations listen/do primitives listed as a closed-enough table with an explicit “do not invent the rest” rule?

## Requirement Clarity

- [ ] CHK005 Is “Switch” disambiguated (palette many-path node vs node-menu change kind)?
- [ ] CHK006 Are Run, Launch, and trigger test-data three different controls with non-collapsed jobs?
- [ ] CHK007 Is the write-set handle defined as every write that run made, distinct from hearing a completion on another automation?
- [ ] CHK008 Are Engine 2 (one motion) and the attempt/channel-ownership engine specified as non-interchangeable?

## Requirement Consistency

- [ ] CHK009 Do two-objectives → two-campaigns (Agents) and Automations-does-not-create-agents agree?
- [ ] CHK010 Does “forms live in Automations” agree with “Agents send people to a goal”?
- [ ] CHK011 Does Local objective-met (FR-026) agree with “once met, met” without using any-historical-completion?
- [ ] CHK012 Does data-in-tables agree with empty-world / no painted demo people?

## Scenario Coverage

- [ ] CHK013 Are ALG and assisted provision specified as the same Application desk?
- [ ] CHK014 Is enroll-now (Agents) vs enroll-on-event (Automations) covered in acceptance scenarios?
- [ ] CHK015 Is Activity/engagement chart specified as record-not-author?

## Ambiguities & Conflicts

- [ ] CHK016 Is U-014 (Story promotion vs packets 022/023) named rather than silently resolved?
- [ ] CHK017 Are teaching captions forbidden as nodes, consistent with IMAGE-CAPTION-AUDIT?

## Notes

- Interaction defaults used (experiment cannot ask founder): depth Standard; audience Author; focus coherence of modules and engines.


===== _workspace/specs/001-tower-product/checklists/honesty-and-silences.md =====

# Honesty And Silences Checklist: Tower Intended Product

**Purpose**: Unit tests for whether the spec under-claims, names deferrals, and refuses invented founder decisions
**Created**: 2026-10-19
**Feature**: [spec.md](../spec.md)

**Note**: Generated by `/speckit-checklist`. Leave items unchecked for reviewer evaluation.

## Requirement Completeness

- [ ] CHK001 Are hard human gates listed and required to remain human?
- [ ] CHK002 Are consent / halt / silence send gates specified independently of firm database authorization?
- [ ] CHK003 Are Meta, escrow fulfillment, and Register-as-firm-product explicitly deferred or house-only?
- [ ] CHK004 Is public-before-contact eligibility detection out of scope?

## Requirement Clarity

- [ ] CHK005 Are FR-035–FR-037 marked NEEDS CLARIFICATION rather than filled with industry defaults?
- [ ] CHK006 Is the Named Silences table mapped to Story silences (CASL, reactivation-worthy, escrow release, multi-consultant, client portal depth)?
- [ ] CHK007 Does the spec distinguish capability target (ALG/escrow) from live-port honesty (GO cutover)?

## Acceptance Criteria Quality

- [ ] CHK008 Can SC-002 (zero send after silence/halt) be verified without knowing adapters?
- [ ] CHK009 Can SC-007 (Local objective met) be verified with two campaigns on one contact?
- [ ] CHK010 Are success criteria free of framework/database names?

## Edge Case Coverage

- [ ] CHK011 Is unprovisioned OTP anti-enumeration specified?
- [ ] CHK012 Is exhausted-but-still-listening specified, and nullification reserved for unbuilt escrow-era?
- [ ] CHK013 Is duplicate campaign_failure from a still-open attempt forbidden?
- [ ] CHK014 Is document-dependent data on a form forbidden?

## Non-Functional Requirements

- [ ] CHK015 Is the absence of a numeric SLA documented as unspecified rather than invented?
- [ ] CHK016 Is verification method (manual Ant smoke + build) documented as repository fact?

## Dependencies & Assumptions

- [ ] CHK017 Is the stale README vs intended-product conflict recorded in Assumptions?
- [ ] CHK018 Are OPERATOR-REVISIONS time windows labeled not-Story-law until promoted?

## Notes

- Reviewer should not mark silences `[x]` as “decided”; `[x]` only if the spec honestly leaves them open.
