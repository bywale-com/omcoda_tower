---
status: draft
stepsCompleted: [step-01-extract, step-02-epics-headless-analog, step-03-stories-headless-analog]
inputDocuments:
  - planning-artifacts/prds/prd-Tower-2026-10-19/prd.md
  - planning-artifacts/prds/prd-Tower-2026-10-19/addendum.md
  - planning-artifacts/ux-designs/ux-Tower-2026-10-19/DESIGN.md
  - planning-artifacts/ux-designs/ux-Tower-2026-10-19/EXPERIENCE.md
  - planning-artifacts/architecture/architecture-Tower-2026-10-19/ARCHITECTURE-SPINE.md
  - specs/spec-tower/SPEC.md
note: >
  bmad-create-epics-and-stories is interactive (halt for Continue / approval).
  No founder is available. Steps 2–3 are a headless analog so the specification
  names remaining work without implying bmad-build. Not a user-approved sprint backlog.
---

# Tower - Epic Breakdown

## Overview

Decomposition of the intended Tower product (PRD FR-1–FR-39, UX spines, architecture AD-1–AD-12) into value-shaped epics. Several capabilities are **already stood up** on SHA `c5bd617` (migrations through `024`, walker, Ant face). Stories therefore distinguish **ratify/honesty** vs **still-specified-not-clear** vs **named deferral**. This document is specification of remaining coherence, not a license to implement in this experiment.

## Requirements Inventory

### Functional Requirements

FR-1 ALG seed capture · FR-2 forward-deploy · FR-3 hard inputs then run · FR-4 Evolution house-side · FR-5 passwordless session · FR-6 seats/shell · FR-7 workspace until opt-out · FR-8 authorize/import book · FR-9 audit reachability · FR-10 consent/halt/silence · FR-11 fact classes · FR-12 reference currency · FR-13 eligibility re-eval · FR-14 Engine 2 motion · FR-15 sequencing authorship · FR-16 attempt vs channel rules · FR-17 two objectives two campaigns · FR-18 objective first · FR-19 override this/content · FR-20 dual enroll · FR-21 goal as escalation · FR-22 engagement chart ≠ lineage · FR-23 Automations DAG · FR-24 event catalog · FR-25 two action kinds · FR-26 handle/write-set · FR-27 rules GUI · FR-28 forms in Automations · FR-29 click node / Switch-kind · FR-30 Test Run Wait · FR-31 channel send · FR-32 meeting booked · FR-33 house libraries · FR-34 tenancy bind · FR-35 oversight/support · FR-36 commercial/escrow posture · FR-37 empty real · FR-38 Ant face · FR-39 write-set mapping in client.

### NonFunctional Requirements

- Tenancy isolation (AD-10)
- Send gates (AD-9)
- Open-box without deploy (AD-1)
- No WCAG/SLA numbers in Seed (open)
- Privacy/CASL-shaped consent (shape; legal opinion is SME)

### Additional Requirements

Architecture AD-1–AD-12. Do not recut 015. Do not overwrite 15:43. Packet≠migration after 012.

### UX Design Requirements

Lock Ant chrome; Light mode plates; empty real; click-node configure; Garet/marketing tokens stay off the desk; Contact forms assumed mobile-capable.

### FR Coverage Map

| Epic | FRs |
|------|-----|
| E1 Honesty & face | 37, 38, 6 |
| E2 Book, consent, send gates | 8, 9, 10, 31 |
| E3 Agents authorship | 15–22, 29 (Agents) |
| E4 Automations brain | 23–30, 39, 3 (handle) |
| E5 Eligibility & facts | 11–14, 28 |
| E6 Meetings & chronology | 22, 32 |
| E7 Operator bind & oversight | 33–35, 5 |
| E8 Acquisition & activation | 1–4, 7, 36 |
| E9 Named deferrals (track only) | Meta/escrow/Register live |

## Epic List

1. **E1 — Honest Ant desk** — Empty-or-personalized product face; Hub is plant.
2. **E2 — Reachable consented book** — Authorize/import/audit/send gates.
3. **E3 — Operator authors Agents** — Flagship 15:43 on the canvas.
4. **E4 — Automations as operations brain** — Events, handle, in-app + assign.
5. **E5 — Eligibility wrapped in engagement** — Reference, rules, required-data forms, Engine 2.
6. **E6 — Record and meeting** — Activity tree + meeting booked.
7. **E7 — Agency bind and recover** — Libraries, bind, health, support, halt.
8. **E8 — Get a firm running** — ALG/OLG, forward-deploy, hard inputs, workspace-until-opt-out.
9. **E9 — Named stand-ins** — Do not pretend Meta/escrow/Register are live.

Each epic is standalone as a *product slice* (a running firm with an honest desk is valuable even before ALG ads go live). E9 is tracking, not a fake build.

## Epic 1: Honest Ant desk

Consultant and operator can trust the glass: query results, locked chrome, correct seats.

### Story 1.1: Empty real on consultant panes

As a consultant, I want empty tables to look empty, so that I never confuse plant people for my book.

**Acceptance Criteria:**

**Given** a session firm with no `contact_records`
**When** I open Board, Contacts, Activity
**Then** panes are honestly empty
**And** no Sarah/Marcus/Cedar rows render

### Story 1.2: Product face is Ant

As an implementer, I want `/prototype-ant` to be the smoked face, so that Hub is not shipped as the app.

**Given** the product
**When** a plate or module is built
**Then** chrome matches PLATE-CHROME-RULE
**And** Hub is not required to complete the journey

### Story 1.3: Seats in shell

As Priya/Amira/Jordan, I want Consultant · Operator · Contact seats, so that World’s acquired-seat rule holds.

**Given** shell chrome packets on PR #96
**When** I switch seats
**Then** I do not get a Firm persona or a Register firm module

## Epic 2: Reachable consented book

### Story 2.1: Authorize and import

As a consultant, I want to authorize the book or import contacts, so that Agents have real enrollments.

### Story 2.2: Audit is reachability

As an operator, I want audit verdicts reachable/partial/unreachable, so that sequence-ready is not a sales score.

### Story 2.3: Halt and silence suppress send

As a contact who unsubscribed, I want no new automatic send, so that silence is real.

## Epic 3: Operator authors Agents

### Story 3.1: Blank sequence of campaigns

As Amira, I want a sequence that holds multiple campaigns each with an objective, so that two goals are two campaigns.

### Story 3.2: Override this / Override content

As Amira, I want Override this to reveal channels and Override content to expand the composer inside the channel, so that sequencing stays at campaign grain.

### Story 3.3: Nested rules like CSS

As Amira, I want global / sequence / campaign / channel fallback, with attempt rules at the correct grain, so that everything is an override.

### Story 3.4: Enroll now from Contacts

As Amira, I want Add contact in the sequence header (Every firm | Select from), so that Agents can start a mission without an event.

### Story 3.5: Goal met ends or escalates

As Amira, I want objective met to be the endpoint (other agent, other workflow, or end), so that 15:43 holds without a qualify node.

## Epic 4: Automations as operations brain

### Story 4.1: Smallest workflow

As Amira, I want trigger · rule · action on a blank canvas that can chain, so that firm-created → audit → If → assign Agents is possible.

### Story 4.2: Handle after the node

As Amira, I want the next node to pick from every write that run made, so that If/mapped-box do not guess.

### Story 4.3: Named events Global/Local

As Amira, I want the primitives listen catalog, so that “this form” and “all forms” are both legal.

### Story 4.4: In-app actions vs Agents assign

As Amira, I want tag/audit/form/who-this-applies-to and assign-existing-or-from-template, so that Automations does not author agents and does not write arbitrary tables.

### Story 4.5: Test, Run, Wait

As Amira, I want Test data on the trigger, Run now vs arm, and Wait (approval Consultant|Operator or duration), so that packets TEST/RUN/WAIT hold.

**Open:** walker Wait kind vs SQL `024` alignment is an SA/engineer cut, not invented here.

## Epic 5: Eligibility wrapped in engagement

### Story 5.1: Open-box rules + reference

As Amira, I want togglable rule families against versioned reference, so that eligibility changes without a deploy.

### Story 5.2: Required-data listing occupies the form

As Amira, I want the data-request form to *be* this run’s self-reportable missing facts, so that A40 holds.

### Story 5.3: One motion

As the machine, I want reactivation-first else one consolidating nudge, so that Jordan is not hit in parallel.

## Epic 6: Record and meeting

### Story 6.1: Activity is a tree of outreach

As Priya, I want engagement chronology without a left-side trigger lineage, so that the chart stays pristine.

### Story 6.2: Meeting booked + live brief

As Priya, I want the loop win to be a meeting with facts as agenda, so that Story system 12 holds.

## Epic 7: Agency bind and recover

### Story 7.1: House authors, tenancy binds

As Amira, I want libraries house-global and bind per firm, so that firms do not author packs.

### Story 7.2: Health, audit trail, halt, support

As Amira, I want fleet health and a support context pane, so that a failing tenancy is recoverable.

## Epic 8: Get a firm running

### Story 8.1: Two doors, one app

As a stranger consultant, I want ALG seed inputs **or** assisted provision to land in the same desk.

### Story 8.2: Prepared workspace then hard inputs

As that consultant, I want a no-login readiness workspace, then authorize + escrow acceptance, before the campaign runs.

### Story 8.3: Contact workspace until opt-out

As Jordan, I want the contact seat to persist until opt-out (PR #96 packet).

**Fulfillment of Meta and escrow money movement is E9, not this epic’s live port.**

## Epic 9: Named stand-ins (track only)

### Story 9.1: Call stand-ins by name

As a reviewer, I want Meta, escrow fulfillment, enrich crawl, Register-in-firm-product labeled deferred, so that nobody calls them the system.

## Workflow limitation

`bmad-create-epics-and-stories` step files forbid proceeding without user `C`. This file is a **headless analog**. It is not Sofia-approved `tickets.toml`. `bmad-sprint-planning` / `bmad-build` were **not** run (experiment forbids product implementation).
