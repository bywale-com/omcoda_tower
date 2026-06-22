---
psd_id: PSD-tower-v0.2.0
scope: tower
version: 0.2.0
status: superseded
supersedes: PSD-tower-v0.1.0
as_of: 2026-06-18
authors:
  - Wale Omotayo
build: passing
related:
  - docs/product/PRODUCT-STATE-GUIDE.md
  - docs/product/psd/tower/PSD-tower-v0.1.0.md
  - docs/ideas/tower-product-vision.md
  - docs/ideas/audit-module.md
  - docs/product/console-state.md
  - docs/product/engagement-chart-gantt-decisions.md
---

# Tower — Product State v0.2.0

> Tower is a **client-side immigration engagement prototype**: a VS Code–like consultant shell with mock data, rich Sarah/Marcus journey UI, a live Console holon registry, **Hub Audits** (reachability gate), and new **Hub Agents** (sequence editor) and **Hub Automations** (React Flow workflow editor).

---

## 0. Document control

| Field | Value |
|-------|-------|
| **PSD ID** | `PSD-tower-v0.2.0` |
| **Scope** | Whole product (`tower`) |
| **Supersedes** | [`PSD-tower-v0.1.0`](./PSD-tower-v0.1.0.md) |
| **As of** | 2026-06-18 |
| **Build** | `npm run build` passing |
| **Guide** | [`PRODUCT-STATE-GUIDE.md`](../PRODUCT-STATE-GUIDE.md) |

---

## 1. Executive snapshot

**Product:** Tower — proactive eligibility + engagement platform for immigration firms (prototype).  
**Primary user:** Immigration consultant / firm operator working contacts through sequences.  
**Core loop (today):** Partially demonstrated — **Contacts → Audit → Agent sequence → Automation enrollment → Client engagement chart**. No live rule engine or backend.

### 1.1 Maturity at a glance

| Surface | Maturity | One line |
|---------|----------|----------|
| Shell (nav, tabs, panels) | **High** | Four-column layout, resizable Console/detail, theme toggle |
| Board (clients + tasks) | **High** | 10 clients, phase tooltips, task → activity focus |
| Client details + Activity | **High** (Sarah/Marcus) | Brief + Client Data + Journey/engagement chart |
| Contacts directory | **Medium** | List wired; contact tab body stub |
| Hub → Audits | **High** (mock) | Create, run gates, open complete audit, reachability table |
| Hub → **Agents** | **Medium** | Detail view, sequence editor (email + task steps), holon registry |
| Hub → **Automations** | **Medium** | React Flow workflow editor, build palette, edge insert, node toolbar |
| Console / holon register | **High** registry | Hover highlight + reveal; agent + automation holon trees |
| CSV import UX | **Medium** | Full dialog; **does not** mutate import list |
| Backend / persistence | **None** | All seed + in-memory session state |

### 1.2 Top 3 truths right now

1. **Everything runs in the browser** — seed files + React context; refresh loses in-session agent/automation edits.
2. **Sarah Jenkins remains the reference client** — full journey, CRS history, engagement inspector payloads.
3. **Hub now has three tool verticals** — Audits (reachability), **Agents** (sequencing brain), **Automations** (workflow graph that enrolls agents).

### 1.3 Top 3 limits right now

1. **No API, auth, or firm account model** — single-user prototype.
2. **Agent/automation edits are session-only** — no save/load beyond seed defaults.
3. **Agent Contacts/Activity/Report/Settings tabs and Automation Settings/Enrollment tabs are placeholders.**

---

## 2. Product position

Unchanged from v0.1.0 — see [`tower-product-vision.md`](../../ideas/tower-product-vision.md).

**New in v0.2.0 prototype:**

- **Agents** — vertical sequence canvas (email + consultant task steps) with collapsible step rail
- **Automations** — graph workflow editor on `@xyflow/react` with trigger → branch → action → exit blocks
- **Console holon depth** — agent editor, sequence canvas, step patterns, automation canvas child holons
- **`tower-chrome-soft-button`** — gray fill at rest, border on hover (Launch/Save/Add a step controls)

**Still not claimed:**

- Live rule engine, provider enrichment, firm accounts, production CRM sync

---

## 3. Shell & navigation

Unchanged from v0.1.0 §3 — layout, activity bar modes, default session (Board + Sarah details).

**Hub tool tabs:** `hub-agent-{id}` and `hub-automation-{id}` open full detail views via `HubToolDetailView`.

**Screenshots:** v0.1.0 gallery in [`screenshots/`](./screenshots/) remains valid for Board, Contacts, Audits, Console. Agent/Automation UI not yet captured in Appendix D.

---

## 4. Surfaces (detailed)

Sections **4.1–4.4** (Board, Workspace, Client Data, Contacts) unchanged from v0.1.0.

### 4.5 Hub

Three sections in sidebar (`HubBody`): Audits, Agents, Automations.

#### 4.5.1 Audits — **High** (unchanged from v0.1.0)

See v0.1.0 §4.5.1 for full audit flow, services panel, reachability table, gate simulation.

#### 4.5.2 Agents — **Medium**

**Purpose:** Sequencing brain — step order, channel touchpoints, consultant tasks, timing between attempts. Enrolled by Automations.

**Entry:** Hub → Agents → row (Intake triage, Nudge composer, Reactivation scout).

**Detail view** (`AgentDetailView`)

| Region | Content | Status |
|--------|---------|--------|
| Header | Agent name, user icon, automations count + hover panel, Launch agent, ⋯ (Add contacts) | **Implemented** |
| Editor tabs | Editor · Contacts · Activity · Report · Settings | **Partial** (Editor only) |
| Step toolbar | `{n} steps` rail toggle, Save changes | **Implemented** (save stub) |
| Empty state | Add a step menu (Email, Task), template/AI placeholders | **Implemented** |
| Sequence editor | Step rail + vertical canvas | **Implemented** |

**Agent header actions**

- **Automations control** — ⚡ + count beside title; hover panel lists linked workflows when count > 0
- **Launch agent** — soft-button chrome; no runtime wiring
- **More actions** — dropdown with Add contacts (stub)

**Sequence editor** (`AgentEditor` → `AgentSequenceEditor`)

- **Fixed vertical stack** — not React Flow; steps connected top-to-bottom
- **Step rail** (280px, collapsible via toolbar chevron) — full-width rows, no rounded cards; selected step = inset accent bar
- **Collapsible rail rows** — title + embedded **condition node** (timing chip); expanded shows summary + “+ Add A/B test” on email
- **Canvas** — large step nodes with condition pill above each node
- **Insert points** — “+ Add a step” between nodes and at end
- **Save changes** — in step toolbar (soft button); no persistence

**Step types (v0.2.0)**

| Kind | UI | Status |
|------|-----|--------|
| **Email** | Split editor (Template tab) + blue-tint preview pane; subject/type on one row | **Implemented** |
| **Task** | Priority select, note textarea, skip-after-due-days | **Implemented** |

**Placeholder tabs**

- Contacts, Activity, Report, Settings — copy stubs only

**Seed data**

- `agent-intake`, `agent-reactivation` — empty (`stepCount: 0`)
- `agent-nudge` — 2 seed steps (email + task) via `getInitialAgentSteps()`

**Holons** (`agentHolons.ts`)

- `agent-editor`, `agent-header-actions`, editor tabs, `agent-step-toolbar`, `agent-empty-state`, `agent-step-rail`, `agent-sequence-canvas`
- Pattern holons: `agent-email-step-node`, `agent-task-step-node`, `agent-step-condition`, `agent-add-step`
- Detail article: `agent-editor` in `holonDetailContent.ts` with child links

#### 4.5.3 Automations — **Medium**

**Purpose:** Workflow graph — triggers, filters/branches, actions that enroll agents or notify consultants.

**Entry:** Hub → Automations → row (Welcome armer, CRS alert, Stale file escalator).

**Detail view** (`AutomationDetailView`)

| Region | Content | Status |
|--------|---------|--------|
| Header | Workflow name, Share, Save, Launch workflow | **Implemented** (launch stub) |
| Editor tabs | Workflow · Settings · Enrollment | **Partial** (Workflow only) |
| Build palette | Draggable block list (toggle panel) | **Implemented** |
| Canvas | React Flow graph | **Implemented** |

**Workflow editor** (`AutomationWorkflowEditor`)

- **React Flow v12** (`@xyflow/react`) — pan/zoom, dot background, controls
- **Node types:** Trigger, Branch (filter/delay), Action, Exit
- **Build palette** — drops **unconnected** nodes; edge **+** inserts into chain
- **Node toolbar** — move, duplicate, delete (trigger not deletable)
- **Custom edge** — `AutomationInsertEdge` with hover insert menu
- **Settings / Enrollment tabs** — placeholder copy

**Seed workflows** (`automationWorkflows.ts`)

- Three workflows with pre-built node graphs
- Helpers: `insertNodeOnEdge`, `deleteWorkflowNode`, `duplicateWorkflowNode`, `createNodeFromBlock`

**Holons** (`automationHolons.ts`)

- `automation-workflow-editor`, `automation-workflow-actions`, tabs, canvas, build palette
- Pattern holons: trigger, branch, action, exit, edge insert
- Detail article: `automation-workflow-editor` in `holonDetailContent.ts`

---

### 4.6 Console

**Summary** (unchanged mechanics from v0.1.0)

- Panels tree from `HolonBoundary` registrations
- Hover → accent ring; eye → reveal; View Details → holon detail panel

**Holon detail articles (v0.2.0)**

| Holon | Article |
|-------|---------|
| Engagement Sequence Row | Full (v0.1.0) |
| **Agent Editor** | Full — links to rail, canvas, step patterns |
| **Automation Workflow Editor** | Full — links to canvas, palette, tabs |
| Most others | Placeholder or absent |

---

## 5. Domain modules

### 5.1–5.4

Unchanged from v0.1.0 (Audit, Sequence/engagement, Import, Rule engine).

### 5.6 Agents (new)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Define outreach sequence: email steps, consultant tasks, timing |
| **Entry** | Hub → Agents → open agent |
| **Model** | `AgentStep` in `agentSteps.ts`; kinds `email`, `consultant_task` |
| **Layout** | Vertical stack + collapsible rail (not a free graph) |
| **Enrollment** | Referenced by Automations via `linkedAutomationIds` on agent seed |
| **Persistence** | Session only (in-memory React state) |

### 5.7 Automations (new)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Event-triggered workflows that route contacts and enroll agents |
| **Entry** | Hub → Automations → open workflow |
| **Model** | `WorkflowDefinition` with React Flow nodes/edges |
| **Editor** | Graph canvas + build palette + edge insert |
| **Persistence** | Session only |

---

## 6. Data & persistence

### 6.1 Persistence model

| Layer | Persists? |
|-------|-----------|
| Seed TS modules | Static in repo |
| `AuditContext` | Session |
| Agent step edits | **Session** — lost on refresh |
| Automation graph edits | **Session** — lost on refresh |
| Tab/panel/theme state | Session |
| API / DB | **None** |

### 6.3 Key seed files (additions since v0.1.0)

| File | Role |
|------|------|
| `data/agentDefinitions.ts` | Agent metadata, tab config, step type menu |
| `data/agentSteps.ts` | Step model, create/insert helpers, nudge seed steps |
| `data/automationWorkflows.ts` | Workflow definitions, palette blocks, graph helpers |

All v0.1.0 seed files remain — see v0.1.0 §6.3.

---

## 7. UX & visual system (product-relevant)

| Topic | Behavior |
|-------|----------|
| **Soft buttons** | `.tower-chrome-soft-button` — accent fill, transparent border; border on hover |
| **Agent preview pane** | Blue tint (`accentBg`) + accent border |
| **Agent step inputs** | Compact 12px controls shared across email/task nodes |
| **Agent step rail** | Edge-to-edge rows, condition as nested node chip |
| **Automation canvas** | React Flow; selected node accent ring |
| **Tree scale / popover chrome** | Unchanged from v0.1.0 |

---

## 8. Known limitations & debt

| # | Limitation | Tag |
|---|------------|-----|
| 1 | No backend | `[Arch]` |
| 2 | CSV import does not append to `importList` | `[Data]` |
| 3 | Agent/automation Save/Launch not wired to runtime | `[UX]` |
| 4 | Agent non-Editor tabs stub | `[UX]` |
| 5 | Automation Settings/Enrollment stub | `[UX]` |
| 6 | Contact detail tab stub | `[UX]` |
| 7 | Account / Settings nav modes have no surface | `[UX]` |
| 8 | Agent/automation state lost on refresh | `[Data]` |
| 9 | Most holon detail articles still missing | `[Doc]` |
| 10 | v0.1.0 audit/UX debt items still open | see v0.1.0 §8 |

---

## 9. Open decisions

v0.1.0 decisions O-01–O-05 remain open.

| ID | Question | Options |
|----|----------|---------|
| O-06 | Agent vs Automation ownership | Agent = sequence only; Automation = enrollment + routing |
| O-07 | Agent canvas growth | Stay vertical stack vs allow branches later |
| O-08 | Persist hub tool edits | localStorage vs API-first |

---

## Δ. Changes since PSD-tower-v0.1.0

**Previous PSD:** [`PSD-tower-v0.1.0`](./PSD-tower-v0.1.0.md) (2026-06-19).

### Added

- **Hub Agents detail view** — header, editor tabs, empty state, sequence editor
- **Agent sequence canvas** — email + task step nodes, condition pills, add-step insert points
- **Agent step rail** — collapsible, full-width rows, embedded condition nodes
- **Hub Automations detail view** — workflow header, editor tabs
- **Automation workflow canvas** — React Flow (`@xyflow/react` ^12.11)
- **Build palette**, **edge insert (+)**, **node toolbar** (move/copy/delete)
- **Holon registry** — `agentHolons.ts`, `automationHolons.ts`, pattern holons, detail articles
- **`tower-chrome-soft-button`** CSS + `TOWER_CHROME_SOFT_BUTTON_CLASS`
- **Data modules** — `agentDefinitions.ts`, `agentSteps.ts`, `automationWorkflows.ts`

### Changed

- `HubToolDetailView` routes `agent` and `automation` kinds to dedicated detail views
- Hub maturity: Agents/Automations **Low → Medium**
- Console holon detail: agent-editor + automation-workflow-editor articles

### Removed / superseded

- Hub agent/automation **placeholder stub** (`HubToolView` only) for open tabs

### Unchanged (still accurate from v0.1.0)

- Board, Client Data, Contacts, Hub Audits, Console mechanics, engagement chart

---

## 10. Next expected state (v0.3.0 candidates)

Likely **MINOR** bump when:

- Agent/automation save persists (localStorage or API)
- Agent Contacts tab or Settings ruleset panels ship
- Automation enrollment criteria UI beyond stub
- Launch agent / Launch workflow wired to mock runtime

Likely **PATCH** bump for:

- Agent/Automation screenshots in Appendix D
- Holon detail articles batch
- CSV import writes to store

---

## Appendix A. Technical inventory (additions)

### Hub / Agent

| Component | Path |
|-----------|------|
| `AgentDetailView` | `components/hub/agent/AgentDetailView.tsx` |
| `AgentHeader` | `components/hub/agent/AgentHeader.tsx` |
| `AgentEditor` | `components/hub/agent/AgentEditor.tsx` |
| `AgentSequenceEditor` | `components/hub/agent/AgentSequenceEditor.tsx` |
| `AgentStepRail` | `components/hub/agent/AgentStepRail.tsx` |
| `AgentSequenceCanvas` | `components/hub/agent/AgentSequenceCanvas.tsx` |
| `EmailStepNode` / `TaskStepNode` | `components/hub/agent/nodes/` |

### Hub / Automation

| Component | Path |
|-----------|------|
| `AutomationDetailView` | `components/hub/automation/AutomationDetailView.tsx` |
| `AutomationWorkflowEditor` | `components/hub/automation/AutomationWorkflowEditor.tsx` |
| `AutomationWorkflowCanvas` | `components/hub/automation/AutomationWorkflowCanvas.tsx` |
| `AutomationBuildPalette` | `components/hub/automation/AutomationBuildPalette.tsx` |
| `AutomationInsertEdge` | `components/hub/automation/edges/` |
| Node components | `components/hub/automation/nodes/` |

### Holon config

| File | Path |
|------|------|
| Agent holons | `components/docs/agentHolons.ts` |
| Automation holons | `components/docs/automationHolons.ts` |
| Detail content | `components/docs/holonDetailContent.ts` |

---

## Appendix B. Verification checklist

Author verified on **2026-06-18**:

- [x] `npm run build` exits 0
- [x] Hub → Agents → Intake triage → empty state → Add email step → rail + canvas appear
- [x] Hub → Agents → Nudge composer → 2 seed steps, rail collapse, email preview tint
- [x] Hub → Automations → open workflow → React Flow canvas, palette, edge insert
- [x] Console → expand Agent Editor holons → hover highlights step nodes / condition / add step
- [x] Console → Automation Workflow Editor holons → pattern node highlight
- [ ] v0.1.0 audit flow (assumed unchanged — re-verify on release)

---

## Appendix D. Screen captures

v0.1.0 gallery (6 PNGs) in [`screenshots/`](./screenshots/) — still valid for Board, Hub sidebar, Audit detail, Contacts, Console, Sarah engagement.

**Not yet captured:** Agent sequence editor, Automation workflow canvas. Target for v0.2.1 PATCH.
