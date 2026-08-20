# Systems — Operator Workspace: each module’s function vs tables

**Seat:** Systems Analyst.  
**When:** 2026-08-20 12:50 UTC.  
**What this is:** the Operator desk (`/prototype-ant` Operator sider) named by **function**, then set against **what Postgres actually holds**. Not chrome. Not a second Activation flag.  
**Why:** Founder: Activation state *looks* like it monitors firm readiness; that made the whole Operator Workspace suspect. The gap is: **modules that picture a journey vs tables that only hold current snapshots (or paint).**  
**Desk:** House-global · Per-tenancy · Support — [`surfaceCatalog.ts`](../../src/app/register/trace/surfaceCatalog.ts). Agents / Automations sit **inside** Configuration libraries, not as top sider rows.  
**Flag:** 15:43 untouched. **Do not recut 015.**  
**Instructions:** founder only.

---

## The gap (what you are intuiting)

A module can **look like** it is the system that watches a firm move from provision → ready → running. On this desk that module is **Activation state**. It shows a percent and a “next” step.

It does **not** write, and does not read, a readiness-journey table. There isn’t one. It **computes** five booleans from *other* stores (CRM grant, sending identity fixture, escrow stand-in, prepared-workspace bag, `campaign_states`). The percent is React arithmetic.

That pattern repeats: Oversight and Firm health **project** health from enrollments / runs / attempts. Register & evolution and Acquisition (editor) keep **bags**. Commercial Save is **paint**. Provision *does* write — existence, not a stage log.

So: **the Operator Workspace is mostly panes of other states, plus a few true write-buttons.** It is not a second ledger of “where the firm is on the journey.”

Kinds used below:

| Kind | Meaning |
|------|---------|
| **Write** | Desk control INSERTs/UPDATEs a named table |
| **Read** | Pane of an existing table |
| **Projection** | Computes a view from several tables; owns no journey row |
| **Bag** | JSON in `primary_store_rows` / `prepared_workspaces.body` |
| **Paint** | `setState` / DEMO rows / `message.success` — no machine write |
| **Stand-in** | Port still deferred (escrow, Meta, warmup counters, enrich) |

---

## Per-tenancy (this is the firm journey you were pointing at)

### Provision

**Create the firm.** The form (name, website, email, role) is the first existence write: `firms` + `ct_firms` (`posture = Idle`) + `campaign_states` (`armed-for-activation`) + `users` + `access_links`. Dispatch `ct_firms`.

**Hand the consultant in.** Copy login / send invite writes another `access_links` row (`issueAccessInvite`). Website and role stay on the response — **not columns**.

### Commercial

**Hold money / terms / release.** Instrument list, Save terms, Release / Return / Dispute. That is the commercial function.

**Tables:** `escrow_acceptances` exists. This Ant module does **not** call it. Save/Release are **paint** on `DEMO_FIRMS`. Escrow port is still **stand-in**. Activation state *reads* that stand-in as a gate.

### Firm operations bind

**Bind packs.** Modal: pick evaluation / automation / engagement packs for this firm → `firm_sequence_binding` + evaluation pin + `activateWorkflow`.

**Armed / Active.** Segmented control. Active → `campaign_states.state = running` (and activate). Armed → `armed-for-activation`. This is the **last firm snapshot** that exists (`running`), not a log of how they got there. `ct_firms.posture` Idle/Armed/Active is the send-gate cousin; Bind is what flips campaign state.

### Book readiness

**Land a book.** Upload CSV → `import_batch` + `contact_records` (same door as Confirm book).

**Run Audit.** Start Audit / Re-audit → `audit_runs` + `reachability_verdicts` + `sequence_ready` **per contact**. The pane of `audit_runs` is this module. Sequence-ready here is **people**, not firm readiness.

### Firm health

**See whether this firm’s outreach is healthy.** Table of sequences, engagement, in-flight attempts; Sequence detail **modal**.

**Open support context.** Jump chip — not a write.

**Tables:** projection of `firm_sequence_binding` / `sequence_template`, `enrollment`, `workflow_run`, `active_attempts`, `engagement_records`, `motion_decisions`. No `firm_health` table.

### Activation state

**Monitor activation progress for a firm.** Percent, next step, jump links. This is the module that *feels* like the readiness journey.

**Tables:** **none of its own.** It ORs:

| Gate on glass | Actually |
|---------------|----------|
| Forward-deployed | `prepared_workspaces.body.staging` |
| Authorize book | `crm_oauth_grants` |
| Ready to send | sending-identity **fixture** (not a journey column) |
| Escrow held | escrow **stand-in** (not Ant Commercial) |
| Running | `campaign_states.state = running` |

No history. Missing row → gate false. The “next” label is whichever gate is still false.

---

## House-global

### Acquisition & ads

**Review Meta campaigns / delivery.** Table + editor **drawer**.

**Kill / hold criteria.** Modal.

**Staging queue / instrumentation.** Cards beside the table.

**Tables:** campaign rows go to `primary_store_rows` collection `acquisition_campaigns` (**bag**). Meta ads port is **stand-in**. Save on the editor is not a machine campaign table.

### Activation & forward-deploy

**Hydrate a prepared workspace for a firm.** In-flight table, Hydrate, staging chips, readiness **steps**, detail **drawer**.

**Tables:** `prepared_workspaces` (`status` + JSON `body` for staging / facts / brand). Enrich crawl is **stand-in**. This is a **workspace bag**, not firm posture.

### Reference data

**Author industry/reference tables.** Grid.

**Import criteria.** Modal.

**Publish version.** Modal — dual-check; writes `reference_versions`.

### Configuration libraries

Three core functions (the inner nav):

**Evaluation packs.** Toggle / reorder `rule_eligibility_pathway`, `rule_motion_precedence`, `rule_field_class_routing`, `rule_reachability_checks`; pin via `putEvaluationPin`. Compare versions **modal**.

**Automations.** Full workbench: graph → `workflow` + `workflow_trigger`; Launch / Run as those packets. Settings pipeline → `seq_eligibility_pipeline`.

**Agents.** Full workbench: Save housing → `campaign` / `sequence_template` / `firm_sequence_binding` / attempt + channel rules; enroll / Launch → `enrollment`.

Draft pack catalog in the SPA is not Bind until Publish (some publish paths still **paint** the catalog only).

### Sending infrastructure

**Allocate a branded send subdomain for a firm.** Writes `sending_domains` (+ pool port). Envelope preview.

**Mark founder fixtures.** ESP / Postmaster / SMS — explicit chips, not auto-green. Warmup counters still **stand-in**.

### Oversight

**Fleet health at a glance.** Table of firms: deliverability / sequence / engagement / last run. Filter unhealthy.

**Tables:** same projection family as Firm health (`workflow`, `workflow_run`, `enrollment`, `campaign_states`, motion). No `oversight` table. “Stage” under the firm name is operator-index chrome, not `ct_firms.posture`.

### Audit trail

**List change events.** Filters; detail **modal**; jump chips.

**Tables:** `audit_events` when something actually appended. Many Operator actions never append. This is a log of *some* writes, not the readiness journey.

### Register & evolution

**Capture product gaps.** Gap **modal**, save, regenerate handoff.

**Tables:** **paint** (`SEED_GAPS` in React). Not `audit_events`. Not a register table.

### Founder & agency controls

**Agency policy bounds.** Card of key/value rules — **paint** (local state).

**Kill-switch.** Modal + confirm → `halt_records` (firm-book halt). That write is real; send gates honor it.

---

## Support

### Customer support

**Work tickets.** Queue table, context tabs (jumps into Bind / Health / Commercial / Activation / Audit), Resolve.

**Tables:** tickets in `primary_store_rows` collection `support_tickets` (**bag**). Resolve may append `audit_events`. Context snapshots for DEMO firms are **paint**.

---

## Side by side — firm “readiness”

| What the glass suggests | What the machine has |
|-------------------------|----------------------|
| Activation state = the journey | **Projection.** No journey table |
| Provision = stage 1 | **Existence writes.** `ct_firms.posture = Idle` |
| Bind Active = last stage | **Current column.** `campaign_states = running` |
| Sequence-ready | **Per contact** `sequence_ready` |
| Commercial / escrow in the checklist | Stand-in + unused `escrow_acceptances` |
| One table that recorded Idle → Armed → Active → running over time | **Silent** |

---

## Do not

- Treat Activation state as proof a journey table exists.
- Mint `firm_readiness` in this file — that is a new ask.
- Recut 015. Overwrite 15:43. Plant Hub as the Operator desk.
