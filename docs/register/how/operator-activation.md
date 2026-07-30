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

**Clarity:** I forward-deploy a Prepared Workspace from house templates and public facts, walk readiness with the firm, and secure database authorization plus escrow acceptance.

**DNA for children:**
1. forward-deploy a Prepared Workspace from house templates and public facts
2. walk readiness with the firm
3. secure database authorization plus escrow acceptance

---

### Leaf 1.1 — forward-deploy Prepared Workspace

**Q:** How do I forward-deploy a Prepared Workspace from house templates and public facts?

**Clarity:** Starting from Activation & forward-deploy, open In-flight activations; On a captured firm row, run Forward-deploy to stage Prepared Workspace under the firm's identity from Configuration libraries templates plus public firm facts — no client PII required yet.

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

**Clarity:** On Prepared Workspace, present Readiness walkthrough (agent presentation presents; fulfillment stays separate) so the consultant sees the staged campaign under their identity before hard inputs.

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

**Clarity:** On Prepared Workspace, confirm Authorize book and Accept terms complete for that firm; On Activation state (per-tenancy), mark hard inputs landed so the desk can run.

**Criteria — when:** After readiness is legible.  
**Conditions:** Both hard inputs required; Commercial holds escrow terms.

| UI | Kind | Status |
|---|---|---|
| Prepared Workspace | Module | **new** |
| Authorize book / Accept terms | Modal | **new** (consultant acts; operator secures/observes) |
| Activation state | Module (per-tenancy) | **new** |
| Commercial | Module (per-tenancy) | **new** |
