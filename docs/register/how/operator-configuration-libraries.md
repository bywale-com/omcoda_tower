# Operator — Configuration libraries

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can author and version the evaluation packs, automation workflows, and engagement
> templates that run the product — so that a firm's operations can be bound from house-authored packs
> rather than built per firm.

**Note:** This is where engagement / eligibility **authorship** lives. Execution after bind is
requirement at leaves — not a Consultant outcome. Hub Automations / Agents today are
**existing-wrong-seat**; rightful Module is Configuration libraries (operator).

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Continuously as methodology and rules evolve.  
**Conditions:** House authors; firms do not; open-box without code deploy for ops tweaks.

---

## Depth 1 — first How

**Q:** How do I author and version the evaluation packs, automation workflows, and engagement templates that run the product?

**Clarity:** Starting from Configuration libraries, I author Evaluation packs, Automation workflows, and Engagement templates as versioned libraries firms will bind — not build per firm.

**DNA for children:**
1. author Evaluation packs
2. author Automation workflows
3. author Engagement templates

---

### Leaf 1.1 — Evaluation packs

**Q:** How do I author Evaluation packs?

**Clarity:** Starting from Configuration libraries, open Evaluation packs; On Evaluation pack editor, define open-box rules / analysis against Reference data and publish a pack version.

**Criteria — when:** Rules or analysis read-outs must change.  
**Conditions:** Inspectable and changeable without code deploy; consumes published reference tables.

| UI | Kind | Status |
|---|---|---|
| Configuration libraries | Module | **new** |
| Evaluation packs | Block / list | **new** |
| Evaluation pack editor | Modal | **new** (Automations Rule nodes today = **existing-wrong-seat** fragment) |
| Reference data | Module | **new** |

**Requirements:** Runtime evaluation over Client Data after Firm operations bind — machinery.

---

### Leaf 1.2 — Automation workflows

**Q:** How do I author Automation workflows?

**Clarity:** Starting from Configuration libraries, open Automation workflows; On Workflow canvas, author trigger → conditions/rules → actions (including enroll into an engagement template) and publish.

**Criteria — when:** Enrollment / eligibility motion graph must change.  
**Conditions:** Graph shape holds across verticals; packs swap underneath.

| UI | Kind | Status |
|---|---|---|
| Automation workflows | Block / list | **new** |
| Workflow canvas | Block | **existing-wrong-seat** as Hub Automations editor — **re-home** |
| Trigger / Rule / Action nodes | Block | **existing-wrong-seat** |

---

### Leaf 1.3 — Engagement templates

**Q:** How do I author Engagement templates?

**Clarity:** Starting from Configuration libraries, open Engagement templates; On Template / Agent editor, author ordered channel + copy steps (opt-in, nudge, reactivation composites) and publish for bind.

**Criteria — when:** Sequence methodology changes.  
**Conditions:** Authorship upstream of engagement record; firm does not author.

| UI | Kind | Status |
|---|---|---|
| Engagement templates | Block / list | **new** |
| Agent / sequence editor | Modal | **existing-wrong-seat** as Hub Agents — **re-home** |
| Step rail / Sequence canvas | Block | **existing-wrong-seat** |

**Requirements:** Attempt / channel-ownership engine and Engine 2 precedence are runtime machinery under these templates — leaf process, not consultant outcome.
