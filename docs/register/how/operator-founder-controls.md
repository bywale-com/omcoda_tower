# Operator — Founder & agency controls

**Kind:** secondary  
**Subject:** Operator (house-global)

**Statement**
> As Operator, I can set cross-firm bounds, kill-switches, and agency policy — so that many tenancies
> are overseen without leaking controls into any firm's workspace.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** Agency-wide policy or emergency control needed.  
**Conditions:** Controls stay house-global — never appear as firm-desk settings.

---

## Depth 1 — first How

**Q:** How do I set cross-firm bounds, kill-switches, and agency policy?

**Clarity:** Starting from Founder & agency controls, open Agency policy, edit Bounds rows, and use Kill-switch controls to halt motion fleet-wide or for selected tenancies without putting those controls on a firm workspace.

**DNA for children:**
1. set Agency policy and Bounds
2. throw a Kill-switch

---

### Leaf 1.1 — policy and bounds

**Q:** How do I set Agency policy and Bounds?

**Clarity:** Starting from Founder & agency controls, click **Agency policy**. On Bounds, edit Bounds rows for cross-firm limits, what may bind, and what may send; click **Save policy** (primary button). Save writes policy state read by Firm operations bind / Send gates and a Change event on Audit trail. Controls never appear in Consultant nav.

**Criteria — when:** Policy change.  
**Conditions:** Changes audit-logged; not visible in Consultant nav.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Founder & agency controls | Module | **new** | House-global controls |
| Agency policy | Block | **new** | Policy surface |
| Bounds | Block | **new** | Editable **rows** |
| Save policy | Block | **new** | **Primary button** — writes bounds (read by bind/send + Audit trail) |

---

### Leaf 1.2 — kill-switch

**Q:** How do I throw a Kill-switch?

**Clarity:** On Founder & agency controls, open Kill-switch, choose Fleet-wide or Selected tenancies, enter a reason, and click Halt motion; Audit trail records actor and scope.

**Criteria — when:** Emergency or policy enforcement.  
**Conditions:** Honor by engagement runners; Audit trail records actor.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Kill-switch | Modal | **new** | Scope choose + reason + **Halt motion** |
| Audit trail | Module | **new** (records) | Downstream Change event |
