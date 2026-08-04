# Operator — Activation & forward-deploy

**Kind:** secondary *(candidate co-core — ALG onramp)*  
**Subject:** Operator (house-global + per-firm staging)

**Statement**
> As Operator, I can stage a no-login prepared workspace for a captured firm from house templates and
> public facts, walk the firm through readiness, and secure its database authorization and escrow —
> so that the Consultant reaches a running desk.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** After seed inputs land (ALG) for a captured firm.  
**Conditions:** House templates + public facts suffice for readiness proof; hard inputs still earned.

---

## Depth 1 — first How

**Q:** How do I stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow?

**Clarity:** Starting from Activation & forward-deploy, open In-flight activations, run Forward-deploy for a captured firm row to create Prepared Workspace from published house templates and public facts, walk Readiness walkthrough, then verify Authorize book and Accept terms before running opens.

**DNA for children:**
1. forward-deploy a Prepared Workspace from house templates and public facts
2. walk readiness with the firm
3. secure database authorization plus escrow acceptance

---

### Leaf 1.1 — forward-deploy Prepared Workspace

**Q:** How do I forward-deploy a Prepared Workspace from house templates and public facts?

**Clarity:** Starting from Activation & forward-deploy, open In-flight activations; on a captured firm row, click Forward-deploy, choose a published Engagement template version, bind public firm-facts and brand package fields, then click Hydrate to stage Prepared Workspace under the firm's identity — no client PII required yet.

**Criteria — when:** Seed inputs landed.  
**Conditions:** Templates available; public facts readable; no-login artifact staged.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Activation & forward-deploy | Module | **new** | Capture → stage |
| In-flight activations | Block | **new** | Captured firm **rows** |
| Forward-deploy | Block | **new** | **Button** opens hydrate |
| Template version | Block | **new** | Published Engagement template **dropdown** |
| Hydrate | Block | **new** | **Primary button** — stages Prepared Workspace |
| Prepared Workspace | Module | **new** | No-login artifact (downstream) |
| Configuration libraries | Module | **new** (template source) | Published templates only |

---

### Leaf 1.2 — walk readiness

**Q:** How do I walk readiness with the firm?

**Clarity:** On Prepared Workspace, click **Readiness walkthrough**. Step through template preview, public facts, brand state, and next-step chips (Next / Back); chips are view/progress chrome unless a step commits a staged fact. Agent presentation presents and routes only — fulfillment stays separate while the consultant sees the staged campaign under their identity before Authorize book / Accept terms.

**Criteria — when:** Prepared Workspace is staged.  
**Conditions:** Readiness proof, not value proof; no-login still.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Prepared Workspace | Module | **new** | No-login staged shell |
| Readiness walkthrough | Block | **new** | Stepper + **Next / Back** |
| Next-step chips | Block | **new** | **View** progress chips |

**Requirements:** Agent presentation layer presents/asks/routes only.

---

### Leaf 1.3 — secure auth + escrow

**Q:** How do I secure database authorization plus escrow acceptance?

**Clarity:** On Prepared Workspace, view Authorize book and Accept terms completion chips (green only after consultant primary-button commits). Operator does not fake-complete those chips. On Activation state, open **Progress** and view authorize-book / escrow-held / running checklist rows; on a stalled row, click **Jump to** the blocking module. Running opens only when both hard-input rows are green — Commercial holds the escrow terms the consultant accepted.

**Criteria — when:** After readiness is legible.  
**Conditions:** Both hard inputs required; Commercial holds escrow terms.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Prepared Workspace | Module | **new** | Completion **chips** (view of consultant commits) |
| Authorize book / Accept terms | Modal | **new** (consultant acts; operator secures/observes) | Consultant **primary buttons** write hard inputs |
| Activation state | Module (per-tenancy) | **new** | Progress checklist |
| Progress | Block | **new** | Checklist **rows** + Jump links |
| Commercial | Module (per-tenancy) | **new** | Escrow terms source |
