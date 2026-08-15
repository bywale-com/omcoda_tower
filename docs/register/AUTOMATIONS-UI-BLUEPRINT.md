# Automations — UI blueprint (from-scratch images)

**Seat:** Product Manager.  
**What this is:** image mocks for Automations. **Building from scratch** — call it what it is. The Ant translation does not have this part (Rule GUI / Input–Outcomes–Output). Hub has the complete plant; these plates are Ant chrome of that idea.  
**Flag:** Agents 15:43 untouched. Automations law: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md).  
**Mock = generate the image.** Do not plant a second editor this pass.

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

---

## Canon lineup (read in this order)

| # | File | What it is |
|---|------|------------|
| **A1** | [`A1-smallest-workflow.png`](./automations-blueprint/A1-smallest-workflow.png) | Smallest workflow: **trigger · rule · action**. Fewer pieces. Then build those pieces. |
| **A2** | [`A2-rule-gui.png`](./automations-blueprint/A2-rule-gui.png) | Open the rule. **GUI.** Toggles on families. Conditions as rows, not a code block. |
| **A3** | [`A3-rule-custom.png`](./automations-blueprint/A3-rule-custom.png) | Same rule. **Custom** — JSON when GUI isn’t enough. |
| **A4** | [`A4-gui-plus-named-code.png`](./automations-blueprint/A4-gui-plus-named-code.png) | Side-by-side: GUI outcome (constant) **plus** named code outcome, both **on/off**. |
| **A5** | [`A5-inside-trigger.png`](./automations-blueprint/A5-inside-trigger.png) | Inside the trigger. Event or schedule. |
| **A6** | [`A6-add-node.png`](./automations-blueprint/A6-add-node.png) | Add a node. Select Action. |
| **A7** | [`A7-action-two-kinds.png`](./automations-blueprint/A7-action-two-kinds.png) | Inside action: **Agents** vs **in the application**. |
| **A8** | [`A8-action-agents-objective.png`](./automations-blueprint/A8-action-agents-objective.png) | Agents as the action: select agent, or create the objective / form. |
| **A9** | [`A9-rule-output-gap.png`](./automations-blueprint/A9-rule-output-gap.png) | Rule output today vs unnamed complete idea. |
| **A10** | [`A10-output-classes-lattice.png`](./automations-blueprint/A10-output-classes-lattice.png) | Output classes as a **lattice**. Missing class: **required data**. Conditions on a class fork actions. |

Chrome: Operator → Configuration libraries → Automations. Light mode. Ant. From scratch.

---

### A1 — Smallest workflow

![A1 smallest workflow](./automations-blueprint/A1-smallest-workflow.png)

**On the glass:** Trigger (onboarding / audit completed) → Rule (Immigration · Service eligibility) → Action (call opt-in agent). Caption: smallest workflow.

**Not this plate:** GUI vs Custom. Form creation. Enrollment tab.

---

### A2 — Rule, GUI

![A2 rule GUI](./automations-blueprint/A2-rule-gui.png)

**On the glass:** Segmented **GUI | Custom**, GUI on. Outcome families with switches. Condition rows: field, operator, constant. Add condition. Families can be off.

**Not this plate:** Custom JSON. Hub View-code as the only authoring.

---

### A3 — Rule, Custom

![A3 rule Custom](./automations-blueprint/A3-rule-custom.png)

**On the glass:** Same modal, Custom on. JSON of the same rule. Escape hatch, not the default.

---

### A4 — GUI plus named code (both on/off)

![A4 GUI plus named code](./automations-blueprint/A4-gui-plus-named-code.png)

**On the glass:** One outcome as field/operator/constant. One outcome as **named** JavaScript, created in this rule, still toggled on. Prefer a constant when one exists.

**Not this plate:** Whole-rule Custom (that is A3). Inventing rule-output catalog.

---

### A5 — Inside trigger

![A5 inside trigger](./automations-blueprint/A5-inside-trigger.png)

**On the glass:** Event or schedule. Perform on this event.

---

### A6 — Add a node

![A6 add node](./automations-blueprint/A6-add-node.png)

**On the glass:** Insert control. Select Action as the node.

---

### A7 — Two kinds of action

![A7 action two kinds](./automations-blueprint/A7-action-two-kinds.png)

**On the glass:** **Agents** vs **in the application**. At least two kinds.

---

### A8 — Agents as the action

![A8 action agents objective](./automations-blueprint/A8-action-agents-objective.png)

**On the glass:** Select an agent, or create the objective (and the form). Objective limits the agent list.

---

### A9 — Rule output (today vs gap)

![A9 rule output gap](./automations-blueprint/A9-rule-output-gap.png)

**On the glass:** Today: headline, pass, nudge (re-engagement) signal, reactivation signal, services — one, the other, or both. Named gap: form, enrich, how actions consume. Do not invent the catalog in the picture.

---

### A10 — Output classes as a lattice; required-data missing

![A10 output classes lattice](./automations-blueprint/A10-output-classes-lattice.png)

**On the glass:** Existing classes as a lattice. Missing class: **required data**. A condition on a class forks three actions on the same data. Form questions come from the required-data set. Do not lock objective type to a signal.

**21:36 — no new plates this stamp.** Founder asked first whether model + UI already support a **listing** of requested data (more than one), a form that **references** it, and whether it **shows on rule-node output**. They do not (catalog unused; output is signals/result ids; forms are not bound). A9/A10 still name the gap. If we mock next: the missing class as **field rows on Output**, and form questions as those rows — refinements, not a new class name. Do not generate until asked.

---

## What this is not

- Not overwriting 15:43.
- Not planting these into `AntAutomationWorkbench` this pass.
- Not saying the evaluator must be operator-authored as code.
- Not throwing away Hub Rules. This is the Ant image of that grain.
- Not a full Automations DAG yet. Smallest workflow first; then the insides of those three pieces (A5–A8).
- Not filling rule-output as a complete catalog (A9 names the gap).
- Not generating new/refined plates on 21:36. Listing of requested data is not on rule output or bound in a form; A9/A10 stay as named gap until asked to mock the list.
