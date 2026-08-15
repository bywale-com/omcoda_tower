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

## What this is not

- Not overwriting 15:43.
- Not planting these into `AntAutomationWorkbench` this pass.
- Not saying the evaluator must be operator-authored as code.
- Not throwing away Hub Rules. This is the Ant image of that grain.
- Not a full Automations DAG yet. Smallest workflow first.
