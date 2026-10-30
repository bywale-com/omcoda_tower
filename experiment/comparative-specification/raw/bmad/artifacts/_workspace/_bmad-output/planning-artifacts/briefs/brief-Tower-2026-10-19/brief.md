---
title: Product Brief — Tower
status: final
created: 2026-10-19
updated: 2026-10-19
sources:
  - SHA c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7
  - docs/register/SEED.md
  - docs/register/WORLD.md
  - docs/register/PHASE-TWO.md
  - docs/register/PHASE-TWO-LOG.md (flagship 2026-08-15 15:43 UTC)
  - docs/register/personas.md
  - docs/register/PRIMITIVES.md
  - docs/register/AGENTS-FACE.md
  - docs/register/AUTOMATIONS-FACE.md
  - docs/register/DATA-IN-TABLES.md
  - docs/register/SYSTEMS-STORY.md
headless: true
skill: bmad-product-brief
---

# Product Brief: Tower

## Executive Summary

Tower is Om Coda’s always-on immigration-consultancy workspace. It is **not** a reactive CRM. It is **proactive eligibility wrapped in engagement**: given a firm’s private contact book, the system keeps engaging dormant and active people, refreshes immigration-relevant facts through firm→client touchpoints, re-evaluates **service eligibility** as IRCC-shaped reference and client facts move, and surfaces campaign-worthy people so consultants book meetings without rechecking every file by hand.

Om Coda runs Tower as an **agency product across many firms**, not as a self-serve tool each firm configures alone. House operators author evaluation rules, automation graphs, and sequence/campaign templates in **configuration libraries**; a **per-tenancy admin** binds those packs under a firm’s identity. The consultant inhabits the book and the meetings. The engagement contact is a subject of outreach — consent, forms, booking — not a branded Tower seat.

The product face is **CT Ant** (`/prototype-ant`). Hub is an advanced plant / reference, not the app. Register is prototype-time house methodology tooling and is **not shipped to firms**.

## The Problem

Immigration consultancies lose work sitting in dormant books. Eligibility (pathways, draws, documents, scores) moves while consultants are in meetings. Rechecking every file by hand does not scale. Public-before-contact detection of *end-client* eligibility is the wrong product class: real eligibility needs the firm’s own book.

Consultants need the book reachable, consent respected, and outreach that is methodology — opt-in, data-request re-engagement, reactivation toward a meeting — not a mail-merge. The agency needs those operations inspectable and changeable **without a code deploy**.

## The Solution

Tower runs a continuous loop over a private firm book:

**Book in → house-authored agent (rules / sequence / content) ↔ automations (when / motion / structured info) → enroll / attempt → send → Activity / Board → meeting booked.**

- **Automations** is the operations brain: on an event (or schedule / manual / webhook), perform a definite operation, then fork on binary results. Actions are **in-app** (audit, tag, form, provision) or **Agents** (assign an existing sequence or instantiate from a template). After a node, the next step has **every write that run made**.
- **Agents** is where the **operator** authors outreach sequencing: order deployed, per firm or default plus overrides, attempt/retry/escalation, and a **goal / goal criteria** that is itself an escalation point — to another agent, to another workflow, or it ends. Once met, met.
- **Consultant desk** inhabits the book, Activity chronology, eligibility read-out, and meetings. **Contact** touchpoints are firm-branded (consent, forms, booking). **Operator** house-global + per-tenancy admin provisions, binds, oversees.

Growth door (ALG): one-tap Meta Approach captures name + website + one channel inside a click budget; forward-deploy stages a no-login prepared workspace; an agent *presents* until the firm authorizes the book and accepts escrow. Assisted provision remains a real second door into the **same** application.

## What Makes This Different

- **Eligibility wrapped in engagement**, not a CRM inbox.
- **Agency authorship**: house writes packs; firms bind; consultants inhabit. Firms do not author libraries.
- **Open-box operations**: rules, constants, sequences, and workflows are data + a dumb runtime — not sealed model weights and not “write any table.”
- **Goal as endpoint**, not a dashboard metric. Objective met is an event; escalation is a subscription, not a destination column. [ASSUMPTION: SA packet 022 on this SHA / PR #110 is the intended housing; Story §7 promotion of that wording is still named, not silently done.]
- **Honesty contract**: records on a desk come from tables. Empty book → empty UI. No Sarah/Cedar scenery.

Do not fabricate a technical moat beyond execution of this shape. Hub quality is the visual plant for Automations/Rules; Ant is the translation that must match the plates.

## Who This Serves

- **Primary acquired seat — Consultant (firm desk):** inhabits the private book; refuses illegal outreach; takes meetings the loop books. Success = booked meetings on eligible people without file-by-file recheck.
- **Operator / Om Coda house (not an acquired persona):** authors libraries, provisions and binds firms, keeps reference current, oversees fleet health, answers support. House-global console + per-tenancy admin.
- **Engagement contact (not a persona):** consent, self-report, silence, booking as firm-branded touchpoints.

Non-users in V1: LinkedIn Approach (deferred); cold-email Approach; self-serve long onboarding as the primary door; public-detection products; a branded contact “Tower workspace.”

## Success Criteria

User: a running firm’s book is sequence-ready; eligible people surface; meetings book without the consultant rechecking every file; opt-out and halt are honored.

Business: ALG cheaply tests the growth bet; contingent-cost / escrow is the activation money posture (not built as fulfillment — deferred by plan). Open-box packs swap industry criteria without a deploy.

Honesty: desks show query results; stand-in ports (Meta, escrow, enrich crawl) are named as stand-in, not “the system.”

**No numeric conversion/CAC targets are in Seed.** [NOTE FOR PM: Seed leaves Meta targeting / CAC and first-text consent regime as silences.]

## Scope

**In (intended product, Phase One + Phase Two module-by-module):** twelve Story systems (acquisition through meeting); consultant / operator / contact surfaces as in personas + How trees; Agents + Automations as authored on the Ant face (plates + PM packets); tables + worker + `workflowWalk.ts`; live send when secrets exist (Resend / Twilio); data-in-tables.

**Explicitly out / deferred by named plan:** Meta go-live as live ads ops; Escrow fulfillment (prototype / stand-in); Register & evolution as a shipped firm module; Hub as the product face; minting tables from captions; recutting walker **015**; overwriting flagship **15:43**.

Phase Two is not a second Seed/World rewrite. Work is “I should be able to…” mapped to missing component, missing system, both, or already-exists.

## Vision

If it works: Om Coda runs many immigration firms on one agency machine. House evolves packs as IRCC moves. Consultants live in a desk that is already working when they sit down. The same graph-shaped operations layer is what later verticals swap packs into — Tower V1 is immigration, not a generic engagement OS pretending to be finished.

Grounded limit: V1 Approach is Meta; the desk does not shrink to make ALG cheaper; Evolution stays house methodology, not a client lifecycle.
