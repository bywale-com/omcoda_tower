# PM implementation — surface vocabulary (Tower)

Use these **exact Title Case** labels in click-paths. Invent only when nothing fits; keep consistent.

## Consultant desk
- Modules: **Board**, **Contacts**, **Meetings**, **Login**
- Blocks / panes: **Client row**, **Phase signal**, **Engagement record**, **Client Brief**, **Live brief**, **Halt outreach**, **Imports**, **Meeting row**
- Activation (consultant acts): **Prepared Workspace**, **Authorize book**, **Accept terms**, **License acknowledgement**, **Escrow terms**

## Engagement contact (firm-branded)
- **Opt-in message**, **Consent request**, **Nudge message**, **Nudge form**, **Silence / Opt out**, **Meeting invitation**, **Booking**, **Loop-closer form**, **Update facts**

## Operator — house-global
- **Acquisition & ads**, **Approach campaigns**, **Capture strip**, **Approach instrumentation**
- **Activation & forward-deploy**, **In-flight activations**, **Forward-deploy**, **Readiness walkthrough**
- **Reference data**, **Reference tables**, **Import criteria**, **Publish version**
- **Configuration libraries**, **Evaluation packs**, **Evaluation pack editor**, **Automation workflows**, **Workflow canvas**, **Engagement templates**, **Agent / sequence editor**
- **Oversight**, **Fleet health**, **Firm row**
- **Audit trail**, **Change event**, **Firm filter**, **Actor filter**
- **Register & evolution**, **Gaps**, **Gap**, **Regenerate handoff**
- **Founder & agency controls**, **Agency policy**, **Bounds**, **Kill-switch**
- **Customer support**, **Ticket queue**, **Ticket**, **Support context**

## Operator — per-tenancy
- **Provision**, **New firm**
- **Commercial**, **Escrow status**, **Release control**
- **Firm operations bind**, **Bind packs**, **Armed / Active**
- **Book readiness**, **Audits**, **Audit run**, **Verdict list**
- **Firm health**, **Sequence health**, **Engagement health**, **Sequence detail**
- **Activation state**, **Progress**

## Taxonomy
Module → Modal → Block → Submodal. Click-path: `Starting from {Module}` | `On {Surface}, you can now…`

## Module shape (cardinality)

Every operator module carries a **record shape** so builders (CTO / capability SME) do not guess from underseeded prototypes:

| Shape | Meaning |
|---|---|
| **singleton** | One house-global control surface (not an index of many) |
| **collection** | Index of many records (firms, packs, tickets, campaigns…) |
| **scoped-record** | Detail for one selected record (after pick from a collection) |

Also declare **scope:** `house` | `tenancy` | `record`.

Executable registry: `src/app/register/trace/moduleShapes.ts`. Prototype modules must seed enough fake records that the shape is visible in the UI (shape banner + multi-record content).
