# 5. Operator desk

Product face: `/prototype-ant` → Operator. Nav groups: **House-global**, **Per-tenancy**, **Support**.

## 5.1 House-global modules

### Acquisition & ads

Run Approach campaigns: feed creative → ad → Capture strip (name, website, channel) inside the click budget. Instrumentation: understood-but-didn’t-tap vs didn’t-understand vs continue-scroll. Meta supply is **external intent** — Tower configures what to send; no Meta Ads Manager cloned inside Tower. **Stand-in / deferred in as-built:** Meta go-live.

### Activation & forward-deploy

In-flight activations. Forward-deploy from house templates + public facts. Hydrate / staging status. Readiness walkthrough. Hard-input status. Serves Prepared Workspace. Agent may walk the workspace; automation executes provision.

### Reference data

Versioned immigration tables (categories, trades, cutoffs, provincial identifiers, etc.). Import criteria. **Publish version**. A published move is a faceless eligibility trigger. No code deploy.

### Configuration libraries

Three catalogs. **No firm picker on this module.** Publish does not bind a firm.

| Catalog | Editor | Bind target |
|---------|--------|-------------|
| **Evaluation packs** | Open-box rules / analysis against reference | Firm operations bind → Evaluation pack |
| **Automation workflows** | Workflow canvas (see §8) | Bind → Automation pack |
| **Engagement templates** | Agents sequence canvas (see §7) | Bind → Engagement template |

Drafts do not appear in Bind dropdowns. Status: Draft | Published + version id.

### Sending infrastructure

House-managed branded sending subdomain per firm (allocate, authenticate on house zone, warmup, CEM envelope preview). Custom-domain attach is a **deferred upgrade**. DNS auth chips must not flip green automatically on allocate. SME C1 paper is deeper than this module’s named job; extra deliverability mechanics remain paper unless absorbed.

### Oversight

Cross-firm sequence / engagement health. Drill into a tenancy.

### Audit trail

Who changed which operation, when, on which firm. Filter by firm / actor.

### Register & evolution

House-only gap writing → regenerate methodology. Not shipped to firms.

### Founder & agency controls

Agency policy, bounds (what may bind / send), **kill-switch** fleet-wide or per tenancy. Never appear in Consultant nav.

## 5.2 Per-tenancy modules

### Provision

**New firm:** firm name, website, primary user email, role seed → **Provision**. Hands the consultant Login OTP and/or access invite. Intentional mint — not self-serve. Same desk as ALG.

### Commercial

Escrow / contingent terms for this firm: cost, cap, release predicate, measurement window. Status through hold / window / release / return / dispute. Terms version is what Accept terms presents. **Escrow fulfillment is deferred as a live port**; the module and Story still require the door.

### Firm operations bind

Firm-bind index → firm detail → **Bind packs** (three published versions) → **Bind**. Then **Armed / Active**. Disabled until three versions bound. Audit trail logs the change. Consultant Board shows inhabited motion only.

### Book readiness

**Audits** for this firm’s import/book batch. Checks as §3 system 5. **Start Audit run**. Verdict list: reachable / partial / unreachable. Only sequence-ready contacts enter engagement. Enrollment after verdict is machinery, not an operator enroll control on this screen (Agents Contacts / Automations are the enroll doors).

Automations may **run an audit** as an in-app action (same audit the desk runs).

### Firm health

Sequence and engagement health scoped to one tenancy (active attempts, engagement records).

### Activation state

This firm’s forward-deploy / hard-input progress toward running (authorize-book row, escrow-held, running gates).

## 5.3 Support

**Customer support:** house-global ticket queue + per-tenancy support context (bind, health, commercial, recent house actions).

## 5.4 Wait / approval notes

Later packets introduce **Wait occupancy**: when a workflow parks for approval or a duration, a note overlay appears for consultant or operator approver with **Approve now** / **Approve later**. Palette still lists a Wait node; a later cut (packet 028 on this SHA’s history) recut Wait kind vs overlay. **UNRESOLVED:** whether Wait remains a first-class canvas node, an overlay-only occupancy, or both. Occupancy table exists (`wait_occupancy`).
