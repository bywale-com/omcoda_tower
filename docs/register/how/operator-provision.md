# Operator — Provision (assisted door)

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can provision a firm and its user through the assisted door — so that the Consultant
> reaches the same desk when ALG isn't the path.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** OLG / assisted path chosen instead of ALG.  
**Conditions:** Intentional mint — not self-serve; same application desk as ALG.

---

## Depth 1 — first How → leaves

**Q:** How do I provision a firm and its user through the assisted door?

**Clarity:** Starting from Provision, open New firm, enter firm and user seed fields, click Provision, then hand the consultant the same Login OTP path into Board.

**DNA for children:**
1. create the Firm tenancy and User
2. hand the consultant the same Login path into the desk

---

### Leaf 1.1 — mint firm + user

**Q:** How do I create the Firm tenancy and User?

**Clarity:** Starting from Provision (per-tenancy admin), open New firm; on New firm, enter firm name, website, primary user email, and role seed fields, then click Provision. (Seed manifests remain a valid backend path — leaf process.)

**Criteria — when:** Assisted onboarding.  
**Conditions:** Tenancy intentional; user email will OTP.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Provision | Module | **new** | Assisted mint |
| New firm | Modal | **new** | Seed form |
| Firm / user fields | Block | **new** | Name / website / email / role inputs |
| Provision | Block | **new** | **Primary button** — writes tenancy+user (read by Login OTP) |

**Requirements:** Database seeding / manifests (existing protocol) at process leaf.

---

### Leaf 1.2 — same Login desk

**Q:** How do I hand the consultant the same Login path into the desk?

**Clarity:** On Provision complete, click Copy Login path (or Send invite); the consultant opens Login, completes OTP, and lands on the same Board module — no separate assisted app.

**Criteria — when:** After provision succeeds.  
**Conditions:** Same session matrix as ALG-provisioned firms.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Copy Login path / Send invite | Block | **new** | **Button** — hands path to consultant |
| Login | Module | **existing** (consultant-facing) | OTP entry (downstream) |
| Board | Module | **existing** | Signed-in landing |
