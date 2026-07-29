---
psd_id: PSD-tower-v0.4.0
scope: tower
version: 0.4.0
status: current
supersedes: PSD-tower-v0.3.0
as_of: 2026-07-10
authors:
  - Wale Omotayo
build: passing
related:
  - docs/product/PRODUCT-STATE-GUIDE.md
  - docs/product/psd/tower/PSD-tower-v0.3.0.md
  - docs/product/systems-register.md
  - docs/ideas/tower-product-vision.md
  - docs/product/console-state.md
  - docs/product/ui-first-build-methodology.md
  - docs/product/immigration-rules-engine2-giveback.md
---

# Tower — Product State v0.4.0

> Tower remains a **client-side immigration engagement prototype**. The material leap in this version is **Hub → Automations**: a peer-module workflow engine (Triggers, Constants, Conditions, Rules, Actions) with **manual data pull**, **If branching**, **industry constants**, and an **Immigration · Service eligibility** rule that emits enriched analysis (R-* outcomes, deltas, B-* services) — all still session-mock, all registered in the Console holon tree.

---

## 0. Document control

| Field | Value |
|-------|-------|
| **PSD ID** | `PSD-tower-v0.4.0` |
| **Scope** | Whole product (`tower`) |
| **Supersedes** | [`PSD-tower-v0.3.0`](./PSD-tower-v0.3.0.md) |
| **As of** | 2026-07-10 |
| **Build** | `npm run build` passing |
| **Guide** | [`PRODUCT-STATE-GUIDE.md`](../../PRODUCT-STATE-GUIDE.md) |

---

## 1. Executive snapshot

**Product:** Tower — proactive eligibility + engagement platform for immigration firms (prototype).  
**Primary user:** Immigration consultant / firm operator.  
**Core loop (today):** Partially demonstrated — **Contacts → Audit → Agent sequence → Automation enrollment → Client engagement chart**. Automations now **evaluate** pulled client/contact data through rules and branch gates in-session (mock engine, no backend).

### 1.1 Maturity at a glance

| Surface | Maturity | One line |
|---------|----------|----------|
| Shell (nav, tabs, panels) | **High** | Four-column layout, resizable Console/detail, theme toggle |
| Board (clients + tasks) | **High** | 10 clients, phase tooltips, task → activity focus |
| Client details + Activity | **High** (Sarah/Marcus) | Brief + Client Data + Journey/engagement chart |
| Contacts directory | **Medium** | List wired; contact tab body stub |
| Hub → Audits | **High** (mock) | Create, run gates, open complete audit, reachability table |
| Hub → Agents | **Medium** | Sequence editor (email + task steps), holon registry |
| Hub → Automations | **High** (mock) | Peer modules, manual pull, If, constants, rules + Analysis |
| Console / holon register | **High** | Hover highlight + reveal; automation surfaces registered as built |
| Systems Register (`/register`) | **Medium–High** | Components + Login flow map (unchanged intent from v0.3.0) |
| Marketing Login (`/login`) | **Medium** | Passwordless OTP UI wired to Auth Service |
| CSV import UX | **Medium** | Full dialog; **does not** mutate import list |
| Backend / persistence | **None** | All seed + in-memory session state |

### 1.2 Top 3 truths right now

1. **Automations are a real in-browser workflow surface** — trigger → pull → If / Rule → structured output, with Runs chrome and node config modals.
2. **Holon registration is continuous** — new automation UI (nodes, tabs, palette, edge insert) lands in the Console tree via `HolonBoundary` / `*Holons.ts` as part of normal build practice.
3. **Everything still runs in the browser** — seed files + React context; refresh loses in-session edits.

### 1.3 Top 3 limits right now

1. **Rule condition coverage is incomplete** — matrix R-* / B-* mechanism works; some pathways and field matches remain thin or stubbed.
2. **No persistence** — workflows, runs, and node config are session-only.
3. **Auth / Register remain as in v0.3.0** — local/dev Auth Service; register flows are maps, not executors.

---

## 2. Product position

Unchanged strategic position — see [`tower-product-vision.md`](../../../ideas/tower-product-vision.md).

**New in v0.4.0 prototype:**

- **Peer automation modules** — Triggers, Constants, Conditions (If), Operations, Rules, Actions as siblings (not nested under Rules)
- **Manual trigger** — applies-to data classes/scopes, name filters, enrollment summary, play/stop, real pull from seed clients/contacts
- **Industry constants** — Immigration catalog (Table D–style); Legal/Financial placeholders; palette opens workspace constant tabs
- **If node** — multi-condition AND/OR, constant/literal/field right values, true/false branch pass-through
- **Rules** — outcome-toggle UI; Immigration · Service eligibility pack → R-* results, deltas, B-* billing/services, Analysis pane
- **Attach / edge insert** — Conditions, Operations, Rules, Constants from canvas

**Still not claimed:**

- Live rule engine API, CRM sync, firm tenancy, persisted workflows, production Auth

---

## 3. Shell & navigation

Unchanged from v0.3.0 §3 for consultant shell (`/`), `/login`, and `/register`.

**Workspace tabs (automation-related additions):**

| Tab pattern | Surface |
|-------------|---------|
| Hub automation detail | Workflow / Runs / Settings / Enrollment |
| `hub-constants-{industry}` | Industry constants table (from build palette) |

---

## 4. Surfaces (detailed)

Sections **4.1–4.4**, **4.6–4.7** (Board, Workspace, Client Data, Contacts, Console, Systems Register) remain as in [`PSD-tower-v0.3.0`](./PSD-tower-v0.3.0.md) / v0.2.0 unless noted. Material change is **§4.5 Hub → Automations**.

### 4.5 Hub → Automations — **High** (mock)

**Purpose:** Build and run eligibility / engagement workflows on pulled firm data without leaving Hub.

**Entry:** Activity bar → Hub → Automations → open or create a workflow.

#### 4.5.1 Editor chrome

| Region | Content | Status |
|--------|---------|--------|
| Header | Workflow name, play/stop (manual), status | **Implemented** (session) |
| Tabs | Workflow, Runs, Settings, Enrollment | **Implemented** (Runs **Mock**; Settings/Enrollment **Partial**) |
| Build palette | Folders for Triggers, Constants, Conditions, Rules, … | **Implemented** |
| Canvas | React Flow nodes + insertable edges | **Implemented** |
| Node config modal | Config left; Output (Schema / Table / JSON) + run chrome | **Implemented** |
| Console holons | Editor, tabs, node patterns, edge insert | **Wired** (always registered with UI) |

#### 4.5.2 Peer modules (product model)

| Module | Role | Status |
|--------|------|--------|
| **Trigger** | Starts run; pulls scoped records | **Implemented** (manual); event triggers **Partial** |
| **Constants** | Industry criteria (env-var-like) referenced by If/Rules | **Implemented** (Immigration rich; others stub folders) |
| **Conditions (If)** | Branch gate; pass-through true/false | **Implemented** |
| **Operations** | Transform / compute steps | **Stub** / thin attach targets |
| **Rules** | Custom evaluators; emit enriched JSON + Analysis | **Implemented** (one immigration pack) |
| **Actions** | Downstream side effects | **Stub** on canvas |

**Flow (canonical):** Trigger pulls data → Rule and/or If evaluate → structured output → downstream nodes resolve `lastInput` from upstream edges (branch-aware).

#### 4.5.3 Manual trigger

**What's implemented**

- Applies to data classes / scopes (clients, contacts, …)
- Name filters and enrollment criteria summary
- Play / stop drives a mock run against seed data (`automationDataPull.ts`)
- Output pane: Schema tree, Table, JSON

**What's mock / stub**

- No server pull; seed lists only
- Event-based triggers exist in catalog but are thinner than manual

#### 4.5.4 If (branch) node

**What's implemented**

- Multiple conditions with AND/OR
- Right-hand values: constant, literal, or field
- True / false handles; wire highlighting after run
- Attach popup (does not auto-insert If)

**What's mock**

- Evaluation is in-session JS against pulled row fields

#### 4.5.5 Constants

**What's implemented**

- Immigration industry catalog (Table D–style criteria)
- Legal / Financial placeholder industries
- Palette folder opens workspace tab with table view

**What's stub**

- Non-immigration catalogs are placeholders
- Constants are not persisted firm config

#### 4.5.6 Rules — Immigration · Service eligibility

**What's implemented**

- Outcome families toggled in config (pathway, gaps, ops, category, draw) — not hand-wired condition graphs in the primary UI
- Evaluation maps to matrix **R-*** results
- Enriched **Analysis** pane: headline, nudge, reactivation, **B-*** services, narratives, deltas
- JSON tab retained for raw structured output

**What's partial / stub**

- Category list matching incomplete
- FSW / FST / PNP pathways thin
- Profile-stale math stub
- ECA / foreign-work when fields absent from pull
- Overall rule `pass` driven mainly by pathway + draw critical outcomes

#### 4.5.7 Key interactions

1. Open Automations → select workflow → Workflow tab canvas.
2. Configure Manual trigger (scopes + filters) → Play → inspect Output / Runs.
3. Attach If or Rule from edge insert / attach menu → configure → re-run.
4. From palette, open Immigration constants tab → browse criteria table.
5. On Rule node, toggle outcomes → run → read Analysis (R-* / B-* / deltas).

#### 4.5.8 Holon practice

New automation surfaces are registered in Console as they ship (`automationHolons.ts` + `HolonBoundary`). This is standing practice, not a one-off for v0.4.0.

---

## 5. Domain modules

| Domain | Status | Notes |
|--------|--------|-------|
| Clients / phases | **Mock** | Seed board clients |
| Contacts | **Partial** | Directory + automation pull |
| Audits | **Mock** | Hub audits unchanged intent |
| Agents | **Mock** | Sequence editor |
| Automations | **Mock** (engine in-browser) | Peer modules + immigration rule pack |
| Auth | **Partial** | Dev Auth Service + `/login` |
| Systems Register | **Implemented** (maps) | Login flow data-driven |

---

## 6. Data & persistence

| Concern | Reality |
|---------|---------|
| Workflow graph + node config | In-memory (`AutomationContext` / workflow seed) |
| Runs | Session mock run records |
| Constants / rules catalogs | Static TS modules under `src/app/data/` |
| Client/contact pull | Seed arrays; no API |
| Refresh | Loses in-session automation edits |

---

## 7. UX & visual system (product-relevant)

- Token-driven theme (`t.*`) on automation chrome
- Node frames, run chrome, config modal (Config | Output)
- Analysis pane is human-readable; JSON remains for power users
- Console holon highlight continues to cover automation editor regions

---

## 8. Known limitations & debt

| ID | Limitation |
|----|------------|
| L-01 | No persistence for workflows / runs / constants |
| L-02 | Immigration rule condition coverage incomplete (see §4.5.6) |
| L-03 | Operations and Actions largely stub |
| L-04 | Event triggers thinner than manual |
| L-05 | Auth / Register limits from v0.3.0 unchanged |
| L-06 | Automation screenshots not yet in Appendix D |

---

## 9. Open decisions

v0.2.0–v0.3.0 decisions remain unless noted.

| ID | Question | Options / lean |
|----|----------|----------------|
| O-11 | Register as agent input | Flow TS only vs generated JSON export |
| O-12 | Under-the-hood conditions GUI for Rules | Expose condition trees vs outcomes-only forever |
| O-13 | When to split scoped PSD `hub-automations` | Keep in tower PSD until module outgrows summary |
| O-14 | Persistence target for workflows | Local storage vs firm backend first |
| D-01 | Pre-meeting capture in builder | Tail of reactivation vs standalone `meeting_booked` sequence — see [`immigration-rules-engine2-giveback.md`](../../immigration-rules-engine2-giveback.md) |
| D-02 | In-meeting fallback surface | Which module shows form gaps for live resolve — same give-back |

**Build directives (evaluator):** Wire existing client fields (D1), FSW/FST/PNP + any-pathway pass (D2), versioned IRCC reference tables (D3). Full text in the give-back doc.

---

## Δ. Changes since PSD-tower-v0.3.0

**Previous PSD:** [`PSD-tower-v0.3.0`](./PSD-tower-v0.3.0.md) (2026-06-18).

### Added

- **Peer automation module model** — Triggers, Constants, Conditions, Operations, Rules, Actions
- **Manual trigger** — data-class scopes, filters, enrollment summary, seed pull, Output panes
- **If / Branch node** — AND/OR conditions, branch pass-through, run wire highlighting
- **Industry constants** — Immigration catalog + Legal/Financial placeholders + workspace table tabs
- **Immigration · Service eligibility rule** — outcome toggles → R-* / deltas / B-* + Analysis pane
- **Attach step + edge insert menus** — Conditions / Operations / Rules / Constants
- **Runs tab + node run chrome** — session mock execution UX
- **Automation holon coverage** — editor tabs, node patterns, edge insert registered in Console

### Changed

- Hub → Automations maturity: **Medium → High (mock)**
- Core loop claim: automations now **evaluate** pulled data in-session (still not live backend)
- Pass-through / `lastInput` resolution is branch-aware across the canvas

### Unchanged (still accurate from v0.3.0)

- Board, Client Data, Contacts, Hub Audits/Agents (intent), Systems Register Login map, Marketing `/login`, no backend persistence

---

## 10. Next expected state (v0.5.0 / PATCH candidates)

Likely **MINOR** when:

- Immigration rule **condition coverage** reaches consultant-usable completeness for primary pathways
- Workflow / run **persistence** (even local) or second rule pack ships
- Operations / Actions become first-class beyond stubs

Likely **PATCH** when:

- Appendix D automation screenshots
- Holon / Console doc sync only
- Thin pathway stubs filled without model change

---

## Appendix A. Technical inventory (additions)

### Automations — data

| Piece | Path |
|-------|------|
| Workflows seed | `src/app/data/automationWorkflows.ts` |
| Events / triggers catalog | `src/app/data/automationEvents.ts` |
| Constants | `src/app/data/automationConstants.ts` |
| Conditions helpers | `src/app/data/automationConditions.ts` |
| Rules + packs | `src/app/data/automationRules.ts` |
| Immigration matrix outcomes | `src/app/data/immigrationMatrixOutcomes.ts` |
| Data pull | `src/app/data/automationDataPull.ts` |
| Runs | `src/app/data/automationRuns.ts` |
| Node runtime | `src/app/data/automationNodeRuntime.ts` |
| Build modules | `src/app/data/automationBuildModules.ts` |

### Automations — UI / context

| Piece | Path |
|-------|------|
| Context | `src/app/context/AutomationContext.tsx` |
| Detail / editor | `src/app/components/hub/automation/AutomationDetailView.tsx` |
| Canvas | `…/AutomationWorkflowCanvas.tsx` |
| Config modal | `…/AutomationNodeConfigModal.tsx` |
| Output / Analysis | `…/NodeDataPane.tsx`, `…/RuleAnalysisPane.tsx`, `…/RuleOutcomesConfigForm.tsx` |
| Attach / edges | `…/AttachStepMenu.tsx`, `…/edges/EdgeInsertMenu.tsx` |
| Holons | `src/app/components/docs/automationHolons.ts` |

---

## Appendix B. Verification checklist

Author verified on **2026-07-10**:

- [x] `npm run build` exits 0
- [x] Hub → Automations opens workflow editor with palette + canvas
- [x] Manual trigger config + play pulls seed rows into Output
- [x] If node configures conditions and branches after run
- [x] Immigration constants open from palette into workspace tab
- [x] Rule outcomes → Analysis shows R-* / services / deltas (mock)
- [x] Console shows automation holons for editor / nodes (hover highlight)
- [ ] Appendix D screenshots for automation surfaces (deferred)

---

## Appendix C. Glossary (automation)

| Term | Meaning in Tower today |
|------|------------------------|
| **Peer module** | Top-level automation building block (not nested under Rules) |
| **Constant** | Named criterion value, organized by industry |
| **If** | Branch gate; true/false pass-through |
| **Rule** | Evaluator that emits enriched structured output |
| **R-*** | Matrix result codes (eligibility / pathway outcomes) |
| **B-*** | Billing / service recommendation codes |
| **Analysis** | Human Outcomes pane over rule JSON |

---

## Appendix D. Screen captures

v0.1.0 gallery in [`screenshots/`](./screenshots/) — still valid for Board, Hub list, Audits, Contacts, Console, Sarah engagement.

**Not yet captured for v0.4.0:** Automations canvas, Manual trigger Output, If branches, Rule Analysis, Constants industry table. Target for a PATCH (`v0.4.1`) or next MINOR.
