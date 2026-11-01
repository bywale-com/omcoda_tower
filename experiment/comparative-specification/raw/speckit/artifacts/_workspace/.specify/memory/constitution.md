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
