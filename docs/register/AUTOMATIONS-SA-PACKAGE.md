# Automations — Systems Analyst package (2026-08-15)

**What this is:** a dated prompt. Paste into a Systems Analyst chat. Not Story. Not a second Automations flag. Not a rewrite of the Agents flagship.  
**Seat that wrote it:** Product Manager.  
**Later (2026-08-17):** the one epistemic question — when a node finishes, the next step has what that **module** produced. Do **not** circle pipe vs this-then-that. Read [`SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md`](./SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md) and [`PRIMITIVES.md`](./PRIMITIVES.md) **before** ascribing the teaching walk. Face **law 33**. Live `workflowWalk` is not that yet.

**Law:** Agents [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Automations face [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Chosen images + spec [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) (A1–A13; priors kept; revisions canonical). **Caption audit (read before ascribing pixels):** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md) — teaching copy on the plates is not a node. **Later plates (after this package was issued):** **A14** — assign existing vs from a template; no create-agent in Automations. **A15–A17** — chain, If, firm-provisioned trigger. **Node interior (shared vs kind):** [`NODE-INTERIOR.md`](./NODE-INTERIOR.md) — Input and Output are every node; Get Parameters and Rule Outcomes are kind. **A20** Output: [`RULE-OUTPUT-PACKET.md`](./RULE-OUTPUT-PACKET.md). **A21** Outcomes: [`RULE-OUTCOMES-PACKET.md`](./RULE-OUTCOMES-PACKET.md). **A22–A23 Get:** [`GET-PACKET.md`](./GET-PACKET.md). **A26 trigger select:** [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md) (Global / Local shape). **A27–A28 place:** [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md). **A29 Input look:** [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md). **Trigger test-data:** [`TEST-PACKET.md`](./TEST-PACKET.md) (on the trigger, not a canvas run). **Run vs Launch:** [`RUN-PACKET.md`](./RUN-PACKET.md) (law 43). **Mapped box / close Input / resize:** [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md). **In-app Action:** [`IN-APP-ACTION-PACKET.md`](./IN-APP-ACTION-PACKET.md) (law 41). Ascribe later plates with the same two questions if you reach them. Do not mint nodes from banner sentences. Do not build A10/A13 as a page.  
**Context you already have (do not re-ask the PM to restate it):** that FACE, that blueprint in **lineup order**, Hub Automations (`/hub`) as the **complete plant**, CT Ant Automations as a poorer **translation** (Rule GUI **does not exist** there). Logs in [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) from **20:24** through **22:17**. Transcripts are not accessible — if it is not in those files, it is not in this package.  
**Your identity and walk:** [`../README.md`](../README.md) § Systems Analyst. Answer lands in [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md). If the Agents package is still unanswered, walk + first question still come first; this package is **next**, not a replacement.

---

## Paste this

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flags are read-only — 15:43 Agents flagship stands. Automations face is docs/register/AUTOMATIONS-FACE.md.

If you have not already walked the machine (Story → Requirements → migrations 001–009 → cascade/worker/workflowWalk → live vs stand-in ports) and inventoried tables/fields/relations, do that first. Then the Agents package if it is still waiting. Then open this package: docs/register/AUTOMATIONS-SA-PACKAGE.md.

This is what we are thinking. These plates are the systems traversing. The images are the mock; the UI is going to look like this. Ascribe. Find a way — usually tables, workers, fields, relationships, live vs stand-in. Do not mint tables from pictures. Read docs/register/IMAGE-CAPTION-AUDIT.md first — teaching copy on the plates (workflow titles, “smallest workflow…”, “If X”, “you do not create an agent here…”) is not a node and not a field.

For each chosen plate in lineup order (A1 → A13, including priors; then later plate A14 if you reach it), answer two questions. Short. Quote SQL / cascade / workflowWalk / ports, not screens.

A. Our system. Tables, workers, runtime, Story — what are we looking at on this plate? What already houses it, what partially houses it, what is silent?

B. External systems the picture is clearly calling — especially because this is the mock and the image will look like this. Look at the configurations we are implying or expecting to have, to do what the plate shows. Is that possible as stood up (live vs stand-in)? Does anything have to change in the UI for this picture to be honest? Do we have the affordances we are hoping for?

Then a rollup: possible / gaps / UI would have to change if…

Do not mint tables from pictures. Do not treat A13 as a screen to build (it is a lattice diagram). Do not collapse “condition inside the rule” with “If node after the rule.” Do not put Automations triggers on the Agents canvas. Do not invent a full operations or output-class catalog. Do not overwrite 15:43. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Per plate (same two questions; the picture is different)

Read the plate in [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) (image + spec). Priors stay in the lineup; the revision is canonical for that idea.

Hub node kinds already named in code (`WorkflowNodeType`): `trigger` | `constant` | `branch` | `rule` | `action` | `exit`. Action kinds already named: `enroll_sequence` | `manage_lists` | `assign_task` | `notify_consultant` plus `agentRef`. Trigger kinds: `event` | `schedule` | `manual` | `webhook` | `constant`. Rule pack in Hub: Immigration · Service eligibility. Collectible catalog: `src/app/data/collectibleFields.ts` — **unused**. Rule output today: `RuleEvaluationSummary` (signals / R-* ids, not a field listing). If node: `runIfConditionNode` / `splitInputByIfConditions` reads previous `lastOutput`. Runtime walk: `server/wire-service/workflowWalk.ts`. Action `call_agent` → enroll.

| Plate | What we are thinking (so you know what to ascribe) |
|-------|------------------------------------------------------|
| **A1** | Smallest workflow: **trigger · rule · action**. Definite middle. Not an Agents sequence. |
| **A2** | Rule **GUI**. Toggles on families. Condition rows = field · operator · constant. Rules creatable; industry-modular. |
| **A3** | Same rule, **Custom** JSON. Escape hatch. |
| **A4** | GUI outcome (constant) **beside** named code (JS/Python), both on/off, created in the rules module. Prefer a constant when possible. |
| **A5** | Inside **trigger**: event or schedule. Automations’ event-of-origin — do not collapse with Agents C2b “event.” |
| **A6** | Add a node, select **Action**. |
| **A7** | Two kinds of action: **Agents** vs **in the application**. Actions are not only outreach. Hub already names in-app kinds — do not invent a longer catalog. |
| **A8** (prior) | Agents as the action: select agent = **whole sequence**. Campaigns inside. Re-engagement is a **campaign**. Form lives in Automations. Form on this plate is still a **blank builder** — not canon for the form. |
| **A12** (canon form) | Form questions **are** the required-data listing. Bound from rule output. Document-dependent never enter. Do not lock objective type to a signal. |
| **A9** (prior) | Rule Output **today**: headline, pass, nudge signal, reactivation signal, services — one, the other, or both. Named gap: form / enrich / consume. Do not split the rule. |
| **A11** (canon Output) | **Required data** as a **listing of field rows** on Output. Catalog fields only. Self-reportable → form. Document-dependent → never a form. 21:36: **not stood up**. |
| **A10** (prior, **diagram**) | Output classes are a **lattice**. Missing class: required data. A condition on a class forks actions on the same data. **Not a screen.** |
| **A13** (canon **diagram**) | Same lattice; required data is the **listing** class. If listing not empty → create form from those rows. **Not a screen.** Founder 22:17: different kind of picture. The DAG fork is the **If node** — now on the glass as **A16**. |
| **A14** (later, canon assign) | Assign to an **existing** sequence, or **create from a template**. You do **not** create an agent here. Sequence pick is a **radio** — nothing further, no chevron. A8 still holds select-agent = whole sequence. A12 still holds the form. |
| **A15** (later) | Blank canvas. Chain: firm provisioned → audit contacts → if X → agents. A1 stays the smallest. |
| **A16** (later) | First Ant If plate. Calls from previous result (the audit). Not a rule. |
| **A17** (later) | Trigger event = firm created / provisioned. Companion to A5. |

**Under-specified remainder** (blueprint § “Under-specified”): If node is now A15/A16; inside of audit not drawn; constants as a canvas node; full operations catalog; full exit points; form-as-own-node vs embedded (lean embedded); remaining output classes; in-system actions besides the one named (**ascribe a tag** on campaign failure / unsubscribe); word “event”; Ant Rule GUI missing; required-data listing; form completion / campaign failure / opt-out as events; **global vs local** (not Settings); **lineage queryable** (who created the objective — agent vs hand — path, completion, time). Hub is the advanced **module plant**, not the app — do not ascribe Hub screens as the product. Name whether the machine already has a place, or Story is silent. Do not invent UI. Do not mint tables.

---

## Answer shape

One short block per plate:

```text
A# —
A. Our system: …
B. Externals / configs / possible?: …
Affordances: stood-up | partial | missing. UI would change if: … | UI can look like this if: …
```

Then **Rollup** (not a new flag):

1. What in **our** machine this lineup is looking at (tables / workers / runtime), in one paragraph. Include: rule packs / constants / conditions **inside** the rule, **If node after** the rule, collectible fields, workflow walk, enroll/action.
2. Which **external** systems the pictures clearly call (webhook trigger, send/enroll that hits Resend/Twilio via Agents, any other), and whether the implied configuration is possible as stood up.
3. Whether the UI can look like this given current affordances — and the smallest set of cases where the picture would have to change to stay honest. Call out: Ant has no Rule GUI; Hub does. A13 is not a screen. Required-data listing is not on `RuleEvaluationSummary` today.
4. **Changes / additions** (fields, relationships, workers) — only what the modularity law requires and Story can bear. If Story is silent, **name the silence**. Do not mint a table from A11/A12/A13.

---

## What this is not

- Not overwriting 15:43.
- Not minting Postgres from pixels.
- Not asking you to redesign Ant chrome. UI law: control or pane on states you already named.
- Not the PM restating the face. FACE + BLUEPRINT already did that.
- Not collapsing the two condition grains.
- Not treating CT Ant Automations as the source plant.
- Not a second Agents package. Agents package still stands.
- Not ascribing founder captions as nodes. Read [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md) first.
