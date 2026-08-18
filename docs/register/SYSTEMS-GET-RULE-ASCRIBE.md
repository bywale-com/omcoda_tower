# Systems — Get / Rule ascribe (PR #96). Do not recut 015.

**Seat:** Systems Analyst.  
**When:** 2026-08-18 18:50 UTC.  
**What this is:** short answers to the PM Get / Rule Output / Rule Outcomes packets. Shape ascribe. **No new tables.** **Do not recut [`SYSTEMS-CHANGE-PACKET-015.md`](./SYSTEMS-CHANGE-PACKET-015.md).** Flag **15:43**.  
**Packets (open PR [#96](https://github.com/bywale-com/omcoda_tower/pull/96)):** [`GET-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/GET-PACKET.md) · [`RULE-OUTPUT-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/RULE-OUTPUT-PACKET.md) · [`RULE-OUTCOMES-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/RULE-OUTCOMES-PACKET.md).  
**Join:** assessment [`SYSTEMS-CUT-ASSESSMENT.md`](./SYSTEMS-CUT-ASSESSMENT.md).

`reference_versions` / `rv_01HZ…` on A23 is **example furniture**. We do not have a validated pack-update write-set. Do not freeze it as schema.

---

## Get — A. Where a module-read-at-grain already lives. What is silent.

Get is a **new node kind** (not in `WorkflowNodeType` today: `trigger | constant | branch | rule | action | exit`). It **reads** records that already exist, at a grain. The writes it produces **are those records**. Same handle as 015 / law 33: every write that run made.

Live `workflowWalk` is **previous-node replace**. Input of every prior node in this chain is **named in #96**, not missing from 015.

| Already a read-at-grain | Where | Not Get |
|-------------------------|-------|---------|
| This firm’s book | `SELECT … FROM contact_records WHERE firm_id=$1`. C8 / C8b / A19. Dispatch `every_firm` with no ids loads the book. | Audience / enroll, not a Get node |
| This import’s people | `contact_records.import_batch_id` + trigger payload `writes` | The **trigger** already offered those rows |
| This audit’s contacts | `audit_runs` + verdicts keyed by `details.auditRunId` | The **Audit action** already wrote them |
| Firm list | `ct_firms` (TEXT). Auth `firms` UUID is the other tenancy — ununified | Provision face, not Get |
| Sequence / campaign | `sequence_template` · `campaign` · `firm_sequence_binding` | Agents housing |
| Listing names the pack reads | `COLLECTIBLE_FIELDS` in the SPA. Unused by the evaluator. | Catalog, not a run write |

**Silent (do not invent a table to fill):**

- Node kind **`get`**. Walker has no case.
- Applying a **left-side write into** the level-2 / level-3 boxes (Parameters as input boxes).
- Input **stack** of every ancestor’s write-set (n8n). Live has one `previousWrites`.
- Direct Input “pick who already exists” as an authored set (A19 is the cousin on the workflow, not inside the Rule).
- Empty-walk fallback `sequence_ready ready=true LIMIT 50` is **not** Get. It is a blunt load. Do not reuse it.

Do not use **Audit as a people-pump**. If the trigger wrote no people, Get (or direct Input) makes the records available. Audit writes verdicts.

---

## Get — B. Three classes per module we already have. Or silent.

Inherent: (1) every X / select X, (2) first class, (3) second class. Contacts on A23 = Every firm / Firm / Contact. One Get kind; Module restamps the three. **From writes that exist. Do not mint a grain catalog.**

| Module | 1 every / select | 2 first class | 3 second class |
|--------|------------------|---------------|----------------|
| **Contacts** | Every firm / Select firm | Firm — `ct_firms.id` = `contact_records.firm_id` | Contact — `contact_records` |
| **Firms** | Every firm / Select firm | Firm — `ct_firms` (this pass’s provisioned write). Auth `firms` UUID silent as the picker key. | **Silent.** No stood-up second class (do not invent “users” as Get-Firms). Stopping at firm is valid. |
| **Audits** | Every firm / Select firm (same tenancy door) | Firm | Audit run — `audit_runs` |
| **Imports** | Every firm / Select firm | Firm | Import — `import_batch` (`kind='contact'` only until a new ask) |
| **Reference** | **Silent as a validated event.** Pack / criteria updated is the **teaching trigger** on A22, not a stood-up `event_name` with a known write-set. Do **not** use `reference_versions`. Closest store: Hub packs / `COLLECTIBLE_FIELDS` names — catalog, not this-run writes. Fit a **known** write-set into the Input tree when a workflow needs that table. | | |
| **Agents** | Every firm / Select firm | Sequence — `sequence_template` (via `firm_sequence_binding` for this firm) | Campaign — `campaign` (child of that sequence). Not `enrollment` (that is the person write after Call agent). |

Default when Select firm and Contact (or the module’s second class) stays closed: **all of that parent’s children**, same as C8b. Deselect all is Get chrome (fix Add contact later).

---

## Rule Output (A20) — A. House / partial / silent

| On A20 | House | Partial | Silent |
|--------|-------|---------|--------|
| Top = every write this run made | 015 `previousWrites` + `node_status.writes` after **action** | Rule node **does not** put writes on the handle. Stub: `pass: true`, listing ids from config, no INSERT | Output chips as **this run’s** classes |
| Click chip → preview that write | — | Hub dumps Analysis + JSON. Ant Rule modal still listing-from-`COLLECTIBLE_FIELDS` | Preview pane that **switches** |
| Required data | Table **`missing_fact_signals`** exists (`004`). HTTP insert + clear on fact writeback. | **Rule node does not emit it.** Evaluator does not produce the listing. | Bottom honest only if this run wrote those rows |
| Lattice class names (pass, nudge, reactivation, recommended services, required-data, headline) | Named in FACE / A20 packet | Not a CHECK. Not all are writes today | Do not invent extra classes. Absent class = absent chip |
| `COLLECTIBLE_FIELDS` | SPA catalog of names the pack **can** read | Painted as listing; unused by live eval | Not the required-data **write** |
| `RuleEvaluationSummary` signals / R-* | Hub | Not field rows | Not A20 |

---

## Rule Output — B. Smallest change so the picture is honest

**Yes — the rule run has to emit required data as a write.**

Smallest: when the rule actually evaluates missing pack fields, **INSERT `missing_fact_signals`** (table already there). Those rows **are** the required-data output. Put them on this node’s handle (`{ table: 'missing_fact_signals', id, contact_id }`). Do **not** mint a listing table. Do **not** invent a new class catalog. Do **not** recut 015.

If this run did not make a class, the chip is absent or empty. Do not dump the whole catalog always-on (A11 dead).

---

## Rule Outcomes (A21) — A. Hub vs Ant

| A21 | Already | Ant-missing |
|-----|---------|-------------|
| Families / toggles / field · operator · constant | **Hub** Rule GUI | Ant has **no** Rule GUI (`RulePlateModal` is listing chrome, not A21) |
| Per-outcome GUI \| JS | Hub has page-level GUI/Custom (A2 dead as tabs) and A4 JS look | Tiny GUI\|JS **per outcome**, stacked, on/off empty |
| Evaluate against Input writes | Live rule is a **stub** (`pass: true`) | Outcomes authoring + eval on the person the Input points at |
| `COLLECTIBLE_FIELDS` | Catalog | Unused by evaluator |

---

## Rule Outcomes — B. Direct Input vs Get. Where full-chain Input is housed.

Outcomes read **fields on the person** the Input writes point at — not CEC hours on the trigger.

| Path | When | House |
|------|------|-------|
| **Direct Input** | Who **already exists** (this automation’s Contacts / the book) | Cousin = **A19** `workflow.audience_*` + `contact_records`. Not a fetch action. Live blunt load (`LIMIT 50` / whole book) is **not** authored Direct Input. |
| **Get in the chain** | The write **does not exist yet** (pack update wrote no people) | New kind. See Get A/B. Not Audit. |
| **Every prior node** on Input | n8n stack | **Named, not recut here.** Live = last `previousWrites`. Persist per-node pointers already land on `workflow_run.node_status` — that is the **place** to stack for the editor/live Input. Do not mint a copy table. Do not recut 015’s handle type. |

A rule runs for **two reasons only**: re-engagement (nudge / data request) or reactivation. Trigger is a justification. Do not invent a third.

---

## Do not

- Recut 015.
- Mint tables from A20–A23.
- Freeze `reference_versions` as pack-update schema.
- Use Audit to fetch people.
- Overwrite 15:43.
- Plant a Hub Get.
