# Tower V1 — Personas (craft)

**Input:** [`WORLD.md`](./WORLD.md) only.  
**Posture:** craft rulings on who owns a workspace, how the operator/house layer is shaped, and which platform surfaces that layer must carry. World named the necessity of the class; this pass names the members.

---

## How I read the ecosystem

World inventories eight entities: **Firm (tenancy)**, **Consultant / firm operator**, **Engagement contact (Client)**, **Om Coda house**, **Approach / ads supply**, **reference-data upkeep**, **Register / internal tooling**, and **Agent presentation**. It also establishes — as world-shape, not as a treatment list — an **operator/house configuration-and-oversight layer** because Om Coda runs Tower as an agency across many firms.

I elevate **one** party to a workspace-owning persona: the **Consultant**. That is the only party World acquires into the system as its own seat (ALG one-tap Approach, or the assisted door into the same application). The Firm is the tenancy boundary the consultant inhabits, not a second seat. Everyone else fails the acquired-seat test and is either folded into surfaces or referenced only.

**Operator/house shape I chose:** a **house-global console** plus a **per-tenancy admin** surface — not a single undifferentiated operator desk. World’s ecosystem is many firms, one agency: cross-firm work (acquisition/ads, shared reference data, methodology evolution, founder-level oversight) is a different job from operations configured and overseen for one firm (provision, escrow posture for that tenancy, which packs and campaigns run under that firm’s identity, reachability of that book). Collapsing those into one surface would either leak cross-firm controls into a firm-scoped view or bury per-firm ops inside a global wall.

**Surfaces I add to that layer** (World named the class; craft names the members): evaluation/rules open-box console; versioned reference-data console; acquisition/ads operations; sequence & campaign-template authoring; automation-workflow admin; assisted tenancy provision; escrow/commercial oversight; cross-firm sequence-health observability; operator audit trail; Register/evolution module; founder/agency controls. Each is justified below with product-class precedent and a load-bearing reason for *this* agency-shaped product — not “nice to have.”

No ecosystem gap blocked this pass.

---

## 1. Personas

### Consultant (firm desk)

**Why it is a persona.** The consultant is the stranger World acquires — seed inputs via Approach, or assisted provision into the same application — then activates (hard inputs: database authorization and escrow acceptance) and seats in a running firm session. They are brought in, admitted, and operate their own branded desk: inhabit the private book, refuse illegal outreach, take meetings that engagement books. That is an acquired seat with a workspace head. The firm tenancy is the boundary of that workspace, not a separate persona.

---

## 2. Folded-in / referenced stakeholders

Apply the rule in the open: **persona only if acquired as its own seat.** House-side / never-acquired functions do not get personas; their needs live as modules under one shared house admission into the operator/house layer.

| Party (World) | Ruling | Why |
|---|---|---|
| **Firm (tenancy)** | Folded — tenancy container for the Consultant workspace; admin of that tenancy lives in **per-tenancy admin**, not as a firm “persona.” | World defines Firm as the tenancy boundary (users, contacts, book). Nothing is acquired *as the firm*; the consultant is acquired and the firm is provisioned. Multi-consultant roles remain open in World — no extra firm-side personas minted here. |
| **Engagement contact (Client)** | Referenced / delivery-only — not a persona; not built as a branded Tower workspace. Needs (consent, self-report, booking) are fulfilled as firm-branded touchpoints and loop-closer capture, owned in product terms by the firm desk loop. | World: never acquired through Approach; free of payment to Om Coda; success event is meeting booked with the consultant. They are subjects of engagement, not admitted seat-holders. |
| **Om Coda house** | Folded — the operator/house layer *is* how the house is served; not a persona beside the consultant. | House is never an acquired stranger through Approach. Agency operator, not a customer seat. |
| **Om Coda Approach / ads supply** | Folded — modules inside **house-global console** (acquisition/ads operations). | House function: reach, one-tap capture, instrument disbelief vs continue-scroll. Never a firm-acquired seat. |
| **Om Coda reference-data upkeep** | Folded — modules inside **house-global console** (versioned reference-data console). | World already places this inside the operator/house layer; keep categories/trades/cutoffs current as data. |
| **Om Coda Register / internal tooling** | Folded — modules inside **house-global console** (Register/evolution), under the same house admission — not a second persona workspace. | World: house-side methodology for writing/regenerating the product; distinct from the firm desk *and* from the config layer that *runs* firms — but still never acquired as its own seat. Craft places it as a house-global module beside configuration, not as a separate product persona. |
| **Agent presentation layer** | Referenced only — capability/role across Approach, prepared workspace, and desk routing; no stakeholder workspace. | World: presents, asks, routes; never fulfills scrape/templates/sequences/evaluate/OTP/money. Not a party with a stay-reason that needs a seat; building “for the agent” as a persona would invent a user World did not acquire. |

---

## 3. The operator/house layer — shape, membership, and surfaces

### Shape decision

**House-global console + per-tenancy admin.**

- **House-global console** — cross-firm: Approach/ads, shared immigration reference data, methodology/Register evolution, platform-level packs and template libraries, cross-firm oversight, founder/agency controls, operator audit of house actions.
- **Per-tenancy admin** — one firm at a time: intentional provision (assisted door), escrow/commercial posture for that firm, which evaluation and engagement operations are bound under that firm’s identity, reachability/audit of that book, firm-scoped health of sequences.

**Why this split from World’s ecosystem.** One agency runs many tenancies; the firm inhabits the book and meetings while the house configures and oversees the operations that run eligibility and engagement. Cross-firm functions (ads supply, versioned public-reference tables, product regeneration) have no natural home inside a single firm’s admin. Per-firm operations (provision this tenancy, arm this firm’s campaign, hold this firm’s contingent terms) have no natural home in a purely global wall. A single operator surface would blur those jobs; the split matches the agency shape World already stated.

### Module membership (from §2 → shape)

| Internal function | Lives under |
|---|---|
| Approach / ads supply | House-global — Acquisition & ads |
| Reference-data upkeep | House-global — Reference data |
| Register / methodology / evolution | House-global — Register & evolution |
| Founder / cross-firm oversight needs | House-global — Oversight & founder controls |
| Cross-firm sequence / engagement health | House-global — Oversight (with drill-down into tenancy) |
| Operator audit of house changes | House-global — Audit trail (tenancy-scoped events also visible from per-tenancy) |
| Platform-level evaluation packs, analysis config, automation graph, sequence/campaign templates | House-global — Configuration libraries |
| Assisted firm/user provision | Per-tenancy admin — Provision |
| Escrow / contingent terms for a firm | Per-tenancy admin — Commercial |
| Binding open-box ops to a running firm (what runs under that identity) | Per-tenancy admin — Firm operations bind |
| Audit batch / reachability for that book | Per-tenancy admin — Book readiness |
| Firm-scoped campaign/sequence health | Per-tenancy admin — Firm health |

### Surfaces it must carry

Surfaces no firm-party would name as their ask — each with **precedent + why load-bearing for Tower**.

| Surface | Shape home | Precedent | Why load-bearing here |
|---|---|---|---|
| **Evaluation & rules open-box console** | House-global (libraries) + inspect/bind on per-tenancy | CRM / marketing-ops rule builders (Salesforce Flow, HubSpot workflows); data-vendor criteria admin | World requires open-box evaluation: operations that decide eligibility and analysis must be inspectable and changeable without a code deploy; agency shape puts authorship in the house, not on the firm desk. |
| **Versioned reference-data console** | House-global | Statutory/criteria table consoles in tax, payroll, and compliance engines; versioned “packs” in credit/risk platforms | Law / public-reference side of eligibility must move as data; World places versioned immigration tables inside the operator/house layer explicitly. |
| **Acquisition & ads operations** | House-global | Growth/ads ops paired with product funnels (Meta Ads Manager + product analytics; agency media desks) | ALG is a primary door; Approach instrumentation (understood vs not; continue-scroll as data) is house work — the firm never asks for Meta-feed acquisition ops. |
| **Sequence & campaign-template authoring** | House-global | Engagement platforms where HQ authors journeys tenants run (Braze canvas, Customer.io, HubSpot sequences) | Forward-deploy instantiates Om Coda methodology templates; composing agent sequences is configuration upstream of the engagement record — firm asks for booked meetings, not template authorship. |
| **Automation workflow admin** | House-global | Operator workflow graphs (Zapier/n8n-class admin; HubSpot ops) with swappable packs | World shapes trigger → conditions/rules → enroll/act to hold across verticals with pack swap; that graph is house-configured, not desk-invented. |
| **Assisted tenancy provision** | Per-tenancy admin | B2B white-glove / partner provision consoles; intentional org minting in multi-tenant SaaS admin | Hard human gate: assisted door provisions firm and users intentionally — not self-minted; OLG is a real path beside ALG. |
| **Escrow & contingent-commercial oversight** | Per-tenancy admin | Marketplace / Connect-style billing-ops dashboards (escrow release, contingent terms) | House holds escrow terms and contingent cost posture; firm accepts the door, house must operate and oversee it. |
| **Cross-firm sequence-health observability** | House-global (fleet) + per-tenancy slice | Deliverability and journey-health dashboards (SendGrid/Twilio, Braze campaign health) | Agency runs always-on engagement across firms; silent sequence failure is a house oversight job. Firm parties ask for meetings and a reachable book — not fleet observability. |
| **Operator audit trail** | House-global (with tenancy filter) | Setup/admin audit trails (Salesforce Setup Audit Trail, CloudTrail-class change logs) | Open-box change of eligibility and engagement ops over real firm books requires accountable who/what/when; no consultant asks for house change logs. |
| **Register / evolution module** | House-global | Internal product-ops / methodology tooling beside the customer product | World’s Evolution facet: running-firm friction → documented gap → affordance/backend facet → regenerate product. Distinct from running the desk; still house-admitted, not a firm ask. |
| **Founder / agency controls** | House-global | Multi-tenant platform super-admin / org-level kill-switches and policy | One agency across many tenancies needs cross-firm controls and boundaries no firm party would request for themselves. |

---

## 4. High-level workspace shape

Module-level only — what already falls out of §§1–3.

### Consultant (firm desk)

- **Book** — private contacts; reachability posture as inhabited, not authored upstream
- **Engagement** — what’s armed / active / silenced; engagement record as chronology
- **Eligibility** — service candidates and analysis read-out the desk acts on
- **Meetings / brief** — live pre-meeting brief; loop-closer capture pending the meeting
- **Session** — passwordless entry for known users (access module, not a second product)

### House-global console

- **Acquisition & ads**
- **Reference data**
- **Configuration libraries** — evaluation/rules, automation workflows, sequence & campaign templates
- **Oversight** — cross-firm sequence health; drill to tenancy
- **Audit trail**
- **Register & evolution**
- **Founder & agency controls**

### Per-tenancy admin

- **Provision** — assisted firm/user mint when ALG is not the path
- **Commercial** — escrow / contingent terms for this firm
- **Firm operations bind** — which house libraries run under this identity
- **Book readiness** — audit / reachability gate for this book
- **Firm health** — sequence and engagement health scoped to this tenancy
