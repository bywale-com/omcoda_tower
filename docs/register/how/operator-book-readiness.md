# Operator — Book readiness

**Kind:** secondary  
**Subject:** Operator (per-tenancy)

**Statement**
> As Operator, I can run the reachability gate over a firm's book — so that only reachable contacts
> enter engagement.

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** On / after import or book connect for a tenancy.  
**Conditions:** One operational question — can we reach them and start a sequence? Not pathway scoring.

---

## Depth 1 — first How

**Q:** How do I run the reachability gate over a firm's book?

**Clarity:** Starting from Book readiness, open Audits, click Start Audit run for this firm's import/book batch, then open Verdict list and read reachable / partial / unreachable rows so only sequence-ready contacts enter engagement.

**DNA for children:**
1. run an Audit batch for this firm's book
2. read Reachability verdicts so only sequence-ready contacts enter engagement

---

### Leaf 1.1 — run audit batch

**Q:** How do I run an Audit batch for this firm's book?

**Clarity:** Starting from Book readiness, open Audits; on Audit run, choose this firm's import/book batch from the batch dropdown, select email/phone validity, channel match, dedupe, consent/silenced, and name-present checks, then click Start Audit run.

**Criteria — when:** Import landed or book connected.  
**Conditions:** Data-validity / sequence-ready only — not CRS / sales ROI.

| UI | Kind | Status |
|---|---|---|
| Book readiness | Module | **new** (rightful home) |
| Audits / Audit run | Block / Modal | **existing-wrong-seat** as Hub Audits — **re-home** or dual-open from per-tenancy |

---

### Leaf 1.2 — read verdicts / sequence-ready

**Q:** How do I read Reachability verdicts so only sequence-ready contacts enter engagement?

**Clarity:** On Audit run, click Verdict list; read reachable / partial / unreachable chips per contact row, and only rows with reachable + sequence-ready may enter the bound engagement.

**Criteria — when:** Batch finishes.  
**Conditions:** Passed = sequence-ready; silenced excluded from automatic motion.

| UI | Kind | Status |
|---|---|---|
| Verdict list | Block | **partial-existing** / **new** |
| Contacts reachability indicator | Block | consultant **existing** (inhabit) |

**Requirements:** External validation providers may sit at leaf process. Engagement enrollment honors verdicts — machinery.
