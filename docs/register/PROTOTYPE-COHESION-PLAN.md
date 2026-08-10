# INITIATIVE — Prototype cohesion (table-first product wire)

**Status:** EXECUTING — founder greenlit 2026-08-10. Branch `cursor/prototype-cohesion-wire-6565`.  
**Face:** Register prototype / CT (Plant + Ant) **is the product**. Hub authorship is wrong-seat debt.  
**Date locked:** 2026-08-10  
**Companion analysis:** [`PROTOTYPE-COHESION-ANALYSIS.md`](./PROTOTYPE-COHESION-ANALYSIS.md)

---

## Purpose

Make the prototype one cohesive system: operator provisions a firm → firm gets workspace access → contacts upload → house-authored Automations + Agents (and modular Settings/Evaluation) bind and **live-send** into that book. No mixed wiring. No dry-run default.

---

## Non-negotiables (founder lock)

| Decision | Rule |
|----------|------|
| Product face | Prototype / CT only — not Hub |
| One wire | `machineApi` + auth for this spine; no parallel fake CT stores for the same facts |
| Live send | Default **live** (Resend/Twilio). Dry-run is not the product posture |
| Halt (H1) | Suppress **new** enrollments and **new** sends. Leave in-flight attempts alone. Kill = same, firm-wide |
| Book handover (H2) | **Authorize book** is the single write. “Confirm book” = alias to same grant |
| Firm brand (H3) | One `firm_id`, one brand everywhere (fix Cedar vs Tower Immigration label bug) |
| Bind versions (H4) | Automation = `workflow` id(s); Engagement = `sequence_template` + `firm_sequence_binding`; Evaluation = pin `reference_version` + ruleset id — **no new Evaluation table** |
| Deferred only | Meta go-live · Register & evolution (house tooling) · Escrow (stays prototype) |

---

## Plan delta — modular authorship faces

Canvas alone is insufficient. Empty tabs become real editors for modular tables the worker already reads:

| Face | Writes |
|------|--------|
| **Agents → Settings** | `rule_attempt_criteria`, `seq_channel_ownership_order`, cohort/metrics thresholds |
| **Automations → Settings** | schedule / enrollment / `seq_eligibility_pipeline` / `workflow_trigger` schedule |
| **Evaluation pack editor** | pin `reference_version` + ruleset; `rule_eligibility_pathway`, `rule_motion_precedence`, `rule_field_class_routing` (+ reachability if not only on Book) |

Without these, Bind Active only runs **seeded** law. With them, house modulates table-first rules in UI.

---

## Build order

1. Shared Publish/Draft catalog → Bind reads published ids (H4)  
2. Automations canvas + Runs → graph, triggers, Activate, walk, **live send**  
3. Agents Editor → `sequence_template` steps; enroll  
4. **Agents Settings** → attempt criteria + channel ladder  
5. **Automations Settings** → schedule / enrollment / pipeline  
6. **Evaluation pack editor** → pathways / motion / field-class + pins  
7. Spine: Provision → Login → Prepared/Authorize → Bind Active → Book upload/audit → live kick-in → Board/Halt  
8. Remaining modules per capability list in analysis (Reference, Sending, Audit trail, Oversight, Firm health, Support, Contact portal, Meetings/Live brief, …)  
9. Deferred: Meta go-live, Register & evolution, Escrow  

---

## Done = capability contract

Every prototype module capability listed in [`PROTOTYPE-COHESION-ANALYSIS.md`](./PROTOTYPE-COHESION-ANALYSIS.md) §Capabilities works on one wire — except the three deferred items.

Proof spine:

**Provision → invite/OTP → Board → Prepared Authorize → Config libraries (Automations + Agents + Settings + Evaluation) → Bind Active → Book readiness (upload/audit) → live sequences → Board motion / Halt**

---

## Explicitly out of this initiative’s first execute PR until greenlight

Implementation. This document PR **records** the plan and analysis only.
