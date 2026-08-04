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

| UI | Kind | Status |
|---|---|---|
| Activation & forward-deploy | Module | **new** |
| In-flight activations | Block | **new** |
| Forward-deploy control | Block | **new** |
| Prepared Workspace | Module | **new** |
| Configuration libraries | Module | **new** (template source) |

---

### Leaf 1.2 — walk readiness

**Q:** How do I walk readiness with the firm?

**Clarity:** On Prepared Workspace, open Readiness walkthrough, step through template preview, public facts, brand state, and next-step chips; the agent presentation presents and routes only, so fulfillment stays separate while the consultant sees the staged campaign under their identity before hard inputs.

**Criteria — when:** Prepared Workspace is staged.  
**Conditions:** Readiness proof, not value proof; no-login still.

| UI | Kind | Status |
|---|---|---|
| Prepared Workspace | Module | **new** |
| Readiness walkthrough | Block | **new** |

**Requirements:** Agent presentation layer presents/asks/routes only.

---

### Leaf 1.3 — secure auth + escrow

**Q:** How do I secure database authorization plus escrow acceptance?

**Clarity:** On Prepared Workspace, confirm Authorize book completion and Accept terms completion chips for that firm; on Activation state → Progress, mark hard inputs landed only when book authorization and escrow acceptance rows are green so the desk can run.

**Criteria — when:** After readiness is legible.  
**Conditions:** Both hard inputs required; Commercial holds escrow terms.

| UI | Kind | Status |
|---|---|---|
| Prepared Workspace | Module | **new** |
| Authorize book / Accept terms | Modal | **new** (consultant acts; operator secures/observes) |
| Activation state | Module (per-tenancy) | **new** |
| Commercial | Module (per-tenancy) | **new** |
