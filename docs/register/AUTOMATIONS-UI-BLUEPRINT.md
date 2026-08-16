# Automations — UI blueprint (from-scratch images)

**Seat:** Product Manager.  
**What this is:** the **UI blueprint** for Automations, before Systems Analyst extract. Not a systems blueprint. Do not invent tables from this file.  
**Flag:** Agents [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Law and excerpts:** [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). This file is the **chosen image lineup + spec**. Rationale lives in the log stamps named on each plate. Transcripts are not accessible — if it is not in the log or this spec, it is not in the package.  
**Founder (2026-08-15 22:17):** terrain is enclosed enough. Line up **chosen images in order**. If a plate is a **revision**, keep the **prior** in the lineup and make the revision **canonical**. Spec why each thing does what we wanted. Then the SA package. Hub is the complete plant; Ant Automations is a poorer translation; Rule GUI **does not exist in Ant** — mocks are from scratch.

**Mock = generate the image.** Do not plant `AntAutomationWorkbench`.

Chrome for every **node chrome** plate unless noted: Operator desk → Configuration libraries → Automations. Light mode. Ant.

---

## PM verdict (so we do not stay stuck on “is it all code?”)

The **authored** logic is simple enough for a GUI. A condition is **field · operator · constant**. A rule is **togglable families of those**. That is blocks, not code.

What stays under the hood (operator does not write it): the evaluator that turns those rows into analysis / R-* / billing.

**Two options on the rule:**

| Mode | When |
|------|------|
| **GUI** | Default, where the logic is this simple |
| **Custom** | When the GUI isn’t enough — same idea as JSON |

Hub’s “View code” can remain as under-the-hood. It must not be the only way to author.

**Two grains of “condition” (do not collapse):**

1. **Inside the rule** — outcome rows: field · operator · constant (or named code). That is A2 / A4.
2. **After the rule, on the DAG** — a **condition / If node** that **calls from the previous result** (rule Output) and forks actions. Hub already has this (`branch` / `if`; `lastOutput` → next node). A10 / A13 are **diagrams of that idea**, not a screenshot of that node. There is **no Ant plate** of the If node. Named remainder.

**Constants** live in two places Hub already names: as the right-hand of a condition, and as their own **constant node** on the canvas. A4 shows them inside the rule. The canvas constant node is Hub-as-built; not drawn as its own Ant plate.

---

## Chosen lineup (read in this order)

These files are **chosen**. Later plates revise earlier ones only where the table says so. The revision is **canonical** for that idea; the prior stays so you can see why it evolved. Do not treat unlisted files as face.

| # | File | Kind | What it is | Born from (log) | Revises / canon |
|---|------|------|------------|-----------------|-----------------|
| **A1** | [`A1-smallest-workflow.png`](./automations-blueprint/A1-smallest-workflow.png) | chrome | Smallest workflow: **trigger · rule · action**. Fewer pieces. Then build those pieces. | 20:54 | — |
| **A2** | [`A2-rule-gui.png`](./automations-blueprint/A2-rule-gui.png) | chrome | Open the rule. **GUI.** Toggles on families. Conditions as rows. | 20:54 | — |
| **A3** | [`A3-rule-custom.png`](./automations-blueprint/A3-rule-custom.png) | chrome | Same rule. **Custom** — JSON when GUI isn’t enough. | 20:54 | companion to A2 |
| **A4** | [`A4-gui-plus-named-code.png`](./automations-blueprint/A4-gui-plus-named-code.png) | chrome | Side-by-side: GUI outcome (constant) **plus** named code outcome, both **on/off**. | 21:10 | — |
| **A5** | [`A5-inside-trigger.png`](./automations-blueprint/A5-inside-trigger.png) | chrome | Inside the trigger. Event or schedule. | 21:10 | — |
| **A6** | [`A6-add-node.png`](./automations-blueprint/A6-add-node.png) | chrome | Add a node. Select Action. | 21:10 | — |
| **A7** | [`A7-action-two-kinds.png`](./automations-blueprint/A7-action-two-kinds.png) | chrome | Inside action: **Agents** vs **in the application**. | 21:10 | — |
| **A8** | [`A8-action-agents-objective.png`](./automations-blueprint/A8-action-agents-objective.png) | chrome | Agents as the action: select agent, or create the objective / form. Form here is still a **blank builder**. | 21:10 | **prior.** Form bind → **A12** |
| **A12** | [`A12-form-from-required-data.png`](./automations-blueprint/A12-form-from-required-data.png) | chrome | **Canonical form.** Questions **are** the required-data rows. Bound from listing. | 21:36 then 21:48 | **revises A8** (form only). Select-agent law still A8 |
| **A9** | [`A9-rule-output-gap.png`](./automations-blueprint/A9-rule-output-gap.png) | chrome | Rule Output **today** vs unnamed complete idea. Signals, not a field listing. | 21:10 | **prior.** Listing → **A11** |
| **A11** | [`A11-rule-output-required-data-listing.png`](./automations-blueprint/A11-rule-output-required-data-listing.png) | chrome | **Canonical Output.** Required data as **field rows**. Not a flag. | 21:36 then 21:48 | **revises A9** |
| **A10** | [`A10-output-classes-lattice.png`](./automations-blueprint/A10-output-classes-lattice.png) | **diagram** | Output classes as a **lattice**. Missing class: **required data**. A condition on a class forks actions. | 21:28 | **prior.** Listing class → **A13** |
| **A13** | [`A13-lattice-required-data-listing.png`](./automations-blueprint/A13-lattice-required-data-listing.png) | **diagram** | Lattice with required data as a **listing class**. If listing not empty → create form from those rows. | 21:48 · founder 22:17: this is a **different kind of picture** | **revises A10.** Not a node screenshot. Not the If node |
| **A14** | [`A14-action-assign-or-template.png`](./automations-blueprint/A14-action-assign-or-template.png) | chrome | Action · Agents: **assign to an existing sequence** or **create from a template**. You do **not** create an agent here. | 00:02 | **revises A8** (assign path only). Select-agent = sequence still A8. Form still **A12** |

**Why A10 / A13 are in the lineup and still not chrome:** they are the **idea** of output classes as a lattice (a simple condition on a class forks actions on the **same data**). They are not Operator screens to rebuild as a “lattice page.” The DAG piece that does that fork is Hub’s **If / condition node after the rule**, which reads previous results. That node is **not drawn** as an Ant plate. Keep both diagrams so the evolution (hole → listing) is visible. Do not ascribe A13 as a screen.

### Discarded (none this module)

No Automations plates were discarded. A8 / A9 / A10 stay as **priors**, not as trash.

In-app Ant Automations workbench is **not** this blueprint. Mock = generated image.

### Known stale pixels (do not silently “fix” in systems)

- Generated chrome sometimes mislabels the background workflow (opt-in vs reactivation agent). Trust the **modal contents**.
- A8 still shows a blank “Field label / + Add field” form. **A12** is the form revision.
- A9 still names the Output gap. **A11** is the listing on Output.
- A10 still shows required data as a dashed hole. **A13** fills the hole **as a diagram**.
- A1 smallest workflow is trigger · rule · action with **no If node** on the canvas. The If-after-rule is Hub-as-built and founder-named (22:17); it is not on A1.
- **A14** nav chrome sometimes drifts (Home / Workspaces vs House-global). Trust the **modal contents**.

---

## Click paths (operator)

Not a test script. The path that produces each chrome plate. Hub `/hub` Automations is the **source plant** for the same path with working Rule GUI.

| Path | Lands on |
|------|----------|
| Operator → Configuration libraries → Automations | Workflow list. Open **New firm → opt-in launch** (or equivalent). |
| Open the workflow | Canvas: **trigger · rule · action** (A1). Smallest. |
| Open the **Trigger** node | Event or schedule (A5). Perform on this event. |
| Insert / add a node | Palette. Select **Action** (A6). |
| Open the **Action** node | Kind: **Agents** vs **in the application** (A7). |
| Action kind = Agents | First: **assign existing** or **from a template** (**A14**). Then select agent (whole sequence) · declare objective · if data request, create the form (A8 prior / **A12** canon). You do **not** author a new agent here. |
| Open the **Rule** node | Immigration · Service eligibility. GUI \| Custom (A2 / A3). Outcomes toggle on/off. GUI + named code (A4). |
| Rule tab **Output** | Today’s signals (A9 prior) · required-data **listing** (**A11** canon). |
| After the rule, on the DAG | **Condition / If node** that reads that Output and forks. **Hub has this. No Ant plate.** A10 / A13 diagram the idea. |

Fallback: if Ant has no Rule GUI (it does not), the picture is still the face. Hub is what is stood up for Rules.

---

## Spec per plate

### A1 — Smallest workflow

![A1 smallest workflow](./automations-blueprint/A1-smallest-workflow.png)

**Rationale (20:54):** A rule lets us create the smallest looking automation: trigger, rule, action. Fewer pieces to think about. Then look **inside** those pieces.

**On the glass:**
- Canvas, three nodes down: **Trigger** (onboarding / audit completed) → **Rule** (Immigration · Service eligibility) → **Action** (call opt-in agent).
- Caption: smallest workflow.

**Why this does what we wanted:** encloses the definite middle. Not an Agents sequence. Not a full DAG yet.

**Not this plate:** GUI vs Custom. Form creation. If node after the rule. Enrollment tab.

---

### A2 — Rule, GUI

![A2 rule GUI](./automations-blueprint/A2-rule-gui.png)

**Rationale (20:44, 20:54):** Look at Rules to see the end goal. Toggles on outcome families. A rule is a **composite of conditions and constants**. Creatable. Industry-modular. Authored logic is simple enough for a GUI.

**On the glass:**
- Modal: Immigration · Service eligibility · Rule.
- Segmented **GUI | Custom**, GUI on.
- Families with switches (Pathway, Gaps, …). A family can be off.
- Condition rows: field · operator · constant. Add condition.

**Why this does what we wanted:** operator authors blocks, not code. Constants are referenced. Inside-the-rule **condition** grain.

**Not this plate:** Custom JSON (A3). Named code beside GUI (A4). The If node **after** the rule.

---

### A3 — Rule, Custom

![A3 rule Custom](./automations-blueprint/A3-rule-custom.png)

**Rationale (20:54):** Two options. Custom when the GUI isn’t enough — same idea as JSON. Escape hatch, not the default.

**On the glass:** Same modal, **Custom** on. JSON of the same rule.

**Why this does what we wanted:** not limited to code; not forbidden from code.

**Not this plate:** Named-code **outcome** inside GUI (that is A4).

---

### A4 — GUI plus named code (both on/off)

![A4 GUI plus named code](./automations-blueprint/A4-gui-plus-named-code.png)

**Rationale (21:10):** Some outcomes have a constant (GUI). Some have no constant — especially across industries — and must be **named code** (JS or Python), **created in this rule**, still **on or off**, you **name it**. Prefer a constant when one exists.

**On the glass:**
- One outcome: field / operator / constant, toggle on, tag GUI.
- One outcome: named JavaScript, toggle on, tag Named code.
- Caption: created in this rule; not hard-coded.

**Why this does what we wanted:** still the rules module. Still a toggle. Not a hard-coded special case.

**Not this plate:** Whole-rule Custom (A3). Inventing rule-output catalog.

---

### A5 — Inside trigger

![A5 inside trigger](./automations-blueprint/A5-inside-trigger.png)

**Rationale (21:10):** Not satisfied with canvas-only. Look **inside trigger**. Perform **on this event** (schedule or trigger).

**On the glass:** Event or schedule. The start of the definite middle.

**Why this does what we wanted:** Automations’ event-of-origin is schedule | trigger — not Agents’ “event” on C2b. Do not collapse those words.

**Not this plate:** Constant-change trigger / webhook as a full catalog. Named remainder.

---

### A6 — Add a node

![A6 add node](./automations-blueprint/A6-add-node.png)

**Rationale (21:10):** See what it looks like to select a node, add a node, then select **Action** as a node.

**On the glass:** Insert control. Select Action.

**Why this does what we wanted:** the DAG is authored. Action is a kind you pick, not a hidden enroll.

**Not this plate:** The If / condition node in that same picker — Hub palette has it; this plate shows Action.

---

### A7 — Two kinds of action

![A7 action two kinds](./automations-blueprint/A7-action-two-kinds.png)

**Rationale (21:10, law 19):** At least two kinds: **in the application** (change something inside the system) and **agents** (send people to a goal). Actions are not only outreach.

**On the glass:** Agents vs in the application.

**Why this does what we wanted:** Automations touches more of the app. Hub already names in-app kinds (`manage_lists`, `assign_task`, `notify_consultant`) and agent enroll (`enroll_sequence` + agent ref). Do not invent a longer catalog in the picture.

**Not this plate:** Form builder. Objective picker.

---

### A8 — Agents as the action (prior)

![A8 action agents objective](./automations-blueprint/A8-action-agents-objective.png)

**Rationale (20:24, 21:10):** End node mirrors Agents’ beginning. Select an agent **or** create/select the objective. Select agent = **the whole sequence**. Campaigns live inside. Re-engagement is a **campaign / sequence template**, not an objective. If you create the objective and it is a data request, you create the form **here** (embedded lean). Objective **limits** which agents you can select.

**On the glass:**
- Kind: Agents.
- Select an agent: Opt-in / Re-engagement / Reactivation as **sequence templates**.
- Create the objective. Blank form builder (Field label / + Add field).

**Why this does what we wanted (and why it evolved):** this plate locked **select agent = sequence** and **form lives in Automations**. The form itself was still a blank builder — that is why **A12** exists. Keep A8 so the agent/objective law is visible without pretending the blank builder is canon.

**Canonical for the form:** A12. **Canonical for select-agent / sequence templates:** still this plate. **Canonical for assign-existing vs from-template (no create-agent here):** **A14**.

**Not this plate:** Binding questions to rule Output (A12). In-app action kinds (A7). The 00:02 assign choice (A14).

---

### A12 — Form questions are those rows (canonical form)

![A12 form from required data](./automations-blueprint/A12-form-from-required-data.png)

**Rationale (21:28, 21:36, 21:48):** When we need a form, we know everything that must exist in it because of **required data**. Questions **are** the required fields. The form **references the listing**. Not a blank Add-field authoring. Document-dependent never enter a form. Do not lock an objective type to a given signal. Re-engagement stays a campaign.

**On the glass:**
- Same Action · Agents chrome as A8.
- Re-engagement **sequence template** selected.
- Objective is a **data request** (on). Name example: Close outstanding facts.
- Banner: **Questions from required data (rule output)**.
- Rows (catalog only): Canadian skilled hours · Language CLB · Foreign work years · EE profile last updated — each **from listing**.
- Note: document-dependent (ECA status, job offer) never enter this form.

**Why this does what we wanted:** the form is not invented in Agents and not typed from scratch in Automations. It is the listing, as questions.

**Not this plate:** Inventing extra questions. Locking this objective to “re-engagement signal only.”

---

### A9 — Rule output today vs gap (prior)

![A9 rule output gap](./automations-blueprint/A9-rule-output-gap.png)

**Rationale (21:10):** We do not yet have a congruent complete idea of **what a rule outputs**. That output is supposedly what we use to create a form, and maybe enrich many other things. Do **not** split the rule to separate re-engagement from reactivation. One, the other, or both — that is why different **actions** exist.

**On the glass:**
- Output tab.
- Today: headline, pass, nudge (re-engagement) signal, reactivation signal, recommended services — one, the other, or both.
- Named gap: what we use to create a form · what enriches · how actions consume.
- Caption: do not invent the catalog in this picture.

**Why this does what we wanted (and why it evolved):** named the hole without filling a fake catalog. **A11** fills **one** missing class as a listing. Keep A9 so SA can see Hub-today vs the listing.

**Canonical for Output:** A11.

---

### A11 — Rule Output: required data as a listing (canonical Output)

![A11 rule output required-data listing](./automations-blueprint/A11-rule-output-required-data-listing.png)

**Rationale (21:28, 21:36, 21:48):** Required data is a **class**. It is a **listing**, not a flag. More than one field. It must **show on rule-node output**. Catalog fields only. Self-reportable → form. Document-dependent → never a form. 21:36: this listing is **not stood up** in code today (`COLLECTIBLE_FIELDS` unused; Hub summary is signals / R-* ids).

**On the glass:**
- Same Output tab. Existing classes still present (headline, pass, nudge, reactivation, services).
- **Required data:** field rows — Canadian skilled hours, Language CLB, Foreign work years, EE profile last updated — self-reportable, tagged **form**.
- ECA status: document-dependent, **never a form**.
- Caption: this listing is the output class; form questions come from these rows.

**Why this does what we wanted:** the next node (If / action / form) can **call from previous results**. A form can bind. A condition can ask “listing not empty.”

**Not this plate:** Binding UI (A12). Inventing fields not in the catalog.

---

### A10 — Lattice; required-data missing (prior, diagram)

![A10 output classes lattice](./automations-blueprint/A10-output-classes-lattice.png)

**Rationale (21:28):** Output classes are a **lattice**. Each class is something you can put a simple **condition** on, which **forks actions** on the **same data** (if re-engagement · if **only** re-engagement · if **anything other than that**). At least one class missing: **required data**. Deterministic. Do not lock an objective type to a signal.

**On the glass (diagram, not a node):** class cards; required data dashed / missing; three forks → three actions.

**Why this does what we wanted (and why it evolved):** named the missing class. **A13** fills it as a listing **on the same kind of diagram**. Keep A10 so the hole is visible.

**This is not a screen.** The fork on the DAG is Hub’s If node after the rule.

---

### A13 — Lattice: required data is the listing class (canonical diagram)

![A13 lattice required-data listing](./automations-blueprint/A13-lattice-required-data-listing.png)

**Rationale (21:48):** Same lattice as A10, with the hole filled as a **listing**. Founder (22:17): this last image is a **different kind of picture** — do not confuse it with node chrome or with the **condition node that sits after the rule output** and says “if this,” calling from previous results.

**On the glass (diagram, not a node):**
- Required data is a **solid** class containing field chips (catalog names).
- Caption: a listing, not a flag.
- Condition **if required data (listing not empty)** → **create form from those rows**.
- The other three forks on the same data still stand.

**Why this does what we wanted:** the class is the listing; a condition on it forks the form. **Ascribe the idea, not a lattice page.**

**Not this plate:** A screenshot of Hub If. A replacement of A10 (A10 stays as the prior). Building a “lattice” screen in Ant.

---

### A14 — Assign existing, or from a template (canonical assign)

![A14 action assign or template](./automations-blueprint/A14-action-assign-or-template.png)

**Rationale (00:02):** Leftover 6. Keep it simple. **Do not create agents inside Automations.** Create the agent in Agents, then assign. Two choices only: **assign to an existing sequence**, or **create from a template**. Can evolve later — not now. A8 stays so select-agent = whole sequence is visible. A12 stays the form.

**On the glass:**
- Same Operator-desk chrome as A8 / A7 / A1 (00:51 rebuild). Do not invent surrounding.
- Kind: Agents.
- Line: “You do not create an agent here. Create the agent in Agents, then assign.”
- Two cards: **Assign to an existing sequence** (put them on one you already authored) · **Create from a template** (new copy from a sequence template, then put them on that).
- Same three names on both sides (Opt-in / Re-engagement / Reactivation) — left tagged Existing, right tagged Sequence template. Each row is a **radio**. One selected. **No chevron / arrow.** There is nothing further after you pick the sequence (select agent = the whole sequence).
- Footer: “Not a third option: author a new agent in this module.”

**Why this does what we wanted:** the copy-vs-assign choice is obvious on the glass. It is not a third authoring place.

**Not this plate:** Authoring a sequence (that is Agents / C1). Form bind (A12). Hand enroll (C8).

---

## Under-specified (named, not filled)

| Remainder | What we know | What is not drawn |
|-----------|--------------|-------------------|
| **If / condition node after the rule** | Hub: `branch` / `if`; reads previous `lastOutput`; true/false (or defined binaries). Founder 22:17: that node is already calling from previous results. A10/A13 diagram the idea. | No Ant plate of opening that node. |
| **Constants as a canvas node** | Hub palette: constant node. Also the right-hand of A2/A4 rows. | No Ant plate of the constant node itself. |
| **Full operations catalog** | Data request is one. Engagement spoken as a maybe. | Do not invent. |
| **Full exit points** | Start/select agent is one. | Do not invent. |
| **Form as own graph node vs embedded** | Lean: **embedded** in the start-agent node. Not locked. | A12 draws embedded. |
| **Remaining output classes besides required data** | Lattice classes named on A9–A13: pass, re-engagement signal, reactivation signal, recommended services, required-data listing. | Do not invent the rest. |
| **In-system action kinds** | Hub names `manage_lists`, `assign_task`, `notify_consultant` plus agent enroll. A7 is the split. | Do not invent a longer catalog. |
| **Word “event”** | Agents C2b vs Automations event-of-origin. Form completion **is** an Automations trigger (23:16). | Do not collapse C2b with this. |
| **Event: global vs local** | **Global:** all of that kind. **Local:** this specific one. Named: form completion, campaign failure, opt-out / unsubscribe. Not “Settings.” | No plate. Do not fill the catalog. |
| **In-app action: ascribe a tag** | Campaign fails → record / tag. Subscription bell is that tag. | Named. Do not invent the rest. |
| **Lineage queryable** | Who created the objective (agent vs hand), path to completion, completion event, time. | Queryable at minimum. Not a new screen. |
| **Assign existing vs from template** | **Settled 00:02.** A14. No create-agent in Automations. | Drawn. |
| **Ant Rule GUI** | Does not exist. Hub does. | Pictures are the face until built. |
| **Required-data listing in code** | 21:36: not stood up. Catalog unused. | SA: what would have to change — do not mint from the picture. |

---

## What this is not

- Not overwriting 15:43.
- Not a table inventory. Not Story. Not “where it touches Postgres” — that is the SA package.
- Not planting these into `AntAutomationWorkbench`.
- Not treating A13 as a screen to build.
- Not throwing away Hub Rules / If / constants.
- Not a full Automations DAG. Smallest workflow first; insides of those pieces; Output listing; form bind; lattice **idea**.
- Not filling a complete output-class catalog.
- Not restoring a blank form builder as canon (A8 stays as prior).
- Not creating agents inside Automations (A14).

**SA:** read 15:43 (do not overwrite), then [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md), then **this file in lineup order**. Dated prompt: [`AUTOMATIONS-SA-PACKAGE.md`](./AUTOMATIONS-SA-PACKAGE.md). Extract the machine from the law + these plates. Do not design a different Automations module from Ant’s poor translation. Hub is the source plant.
