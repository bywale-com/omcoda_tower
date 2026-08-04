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
**Affordance rule:** Every Clarity names the control. Publishing here does **not** bind a firm — Firm operations bind dropdowns consume published versions later.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Continuously as methodology and rules evolve.  
**Conditions:** House authors; firms do not; open-box without code deploy for ops tweaks.

---

## Depth 1 — first How

**Q:** How do I author and version the evaluation packs, automation workflows, and engagement templates that run the product?

**Clarity:** Starting from Configuration libraries, click **Evaluation packs**, **Automation workflows**, or **Engagement templates** in the Libraries nav (left list). On the chosen catalog, click a row (or **New**), edit in the editor/canvas, then click **Publish version** (primary button) — so firms can later pick that version in Firm operations bind dropdowns. No firm picker exists on this module.

**DNA for children:**
1. author Evaluation packs
2. author Automation workflows
3. author Engagement templates

---

### Leaf 1.1 — Evaluation packs

**Q:** How do I author Evaluation packs?

**Clarity:** Starting from Configuration libraries, click **Evaluation packs** in the Libraries nav (left list). On Evaluation packs catalog, click a pack row (or **New pack**). On Evaluation pack editor, edit open-box rules / analysis against Reference data. Click **Publish version** (primary button). Catalog row shows status **Published** + version id; that version becomes selectable in Firm operations bind → Bind packs → Evaluation pack dropdown. Drafts stay **Draft** and do not appear in Bind dropdowns.

**Criteria — when:** Rules or analysis read-outs must change.  
**Conditions:** Inspectable and changeable without code deploy; consumes published reference tables; no tenancy picker on this module.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Configuration libraries | Module | **new** | House-global; Libraries nav |
| Evaluation packs | Block / list | **new** | Catalog list + **New pack** button |
| Evaluation pack editor | Modal | **new** (Automations Rule nodes today = **existing-wrong-seat** fragment) | Rule/analysis editor |
| Publish version | Block | **new** | **Primary button** on editor |
| Published / Draft status | Block | **new** | **View** chip on catalog row |
| Reference data | Module | **new** | Source criteria (separate module) |

**Requirements:** Runtime evaluation over Client Data after Firm operations bind — machinery.

---

### Leaf 1.2 — Automation workflows

**Q:** How do I author Automation workflows?

**Clarity:** Starting from Configuration libraries, click **Automation workflows** in the Libraries nav. On Automation workflows catalog, click a workflow row (or **New workflow**). On Workflow canvas, edit trigger → conditions/rules → actions (including enroll into an engagement template). Click **Publish version** (primary button). Catalog shows **Published** + version id; that version appears in Firm operations bind → Bind packs → Automation pack dropdown (published-only).

**Criteria — when:** Enrollment / eligibility motion graph must change.  
**Conditions:** Graph shape holds across verticals; packs swap underneath; no firm bind from this screen.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Automation workflows | Block / list | **new** | Catalog list + **New workflow** |
| Workflow canvas | Block | **existing-wrong-seat** as Hub Automations editor — **re-home** | Graph editor |
| Publish version | Block | **new** | **Primary button** |
| Trigger / Rule / Action nodes | Block | **existing-wrong-seat** | Canvas nodes |

---

### Leaf 1.3 — Engagement templates

**Q:** How do I author Engagement templates?

**Clarity:** Starting from Configuration libraries, click **Engagement templates** in the Libraries nav. On Engagement templates catalog, click a template row (or **New template**). On Agent / sequence editor, edit ordered channel + copy steps (opt-in, nudge, reactivation composites). Click **Publish version** (primary button). Catalog shows **Published** + version id; that version appears in Firm operations bind → Bind packs → Engagement template dropdown (published-only).

**Criteria — when:** Sequence methodology changes.  
**Conditions:** Authorship upstream of engagement record; firm does not author; no firm bind from this screen.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Engagement templates | Block / list | **new** | Catalog list + **New template** |
| Agent / sequence editor | Modal | **existing-wrong-seat** as Hub Agents — **re-home** | Sequence editor |
| Publish version | Block | **new** | **Primary button** |
| Step rail / Sequence canvas | Block | **existing-wrong-seat** | Step editor |

**Requirements:** Attempt / channel-ownership engine and Engine 2 precedence are runtime machinery under these templates — leaf process, not consultant outcome.
