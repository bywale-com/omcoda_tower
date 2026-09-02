# Hub → Register CT prototype gap map

**Date:** 2026-08-11  
**Branch:** `cursor/hub-prototype-gap-map-6565`  
**Question answered:** For every model / submodel / block inside Hub **Agents**, **Automations**, and **Clients** (Board → click client), what is the specific counterpart in the Register CT prototype — and where is there none?

---

## Method

1. Walk the Hub tree to **leaves** (tabs, panels, node chrome, modal sections, replay surfaces).
2. For each leaf ask: *What is the specific counterpart in Ant? In Plant?*
3. Classify:

| Status | Meaning |
|--------|---------|
| **TRANSLATED** | Clear counterpart; re-skin or embed OK |
| **PARTIAL** | Structure present; critical depth missing |
| **OBFUSCATED** | Intent diluted (renamed seat, free-text, tooltip-only) so the Hub concept is not recoverable |
| **MISSING** | No counterpart |
| **HUB-GAP** | Hub itself never shipped it (not a CT miss) |
| **ANT SURPASSES** | Ant deeper than Hub (recorded so it is not miscounted as a gap) |

4. **Ant is the product face** (`/prototype-ant`). Plant often **embeds Hub** components — that counts as TRANSLATED for Plant even when Ant is MISSING.

### Counterpart seats

| Hub module | Hub reach | Ant counterpart | Plant counterpart |
|------------|-----------|-----------------|-------------------|
| **Agents** | Hub body → Agents → `AgentDetailView` | `ConfigurationLibrariesModule` → `AntAgentWorkbench` (rewrite, thinned) | Libraries → embeds Hub `AgentDetailView` (frozen `DEMO_AGENT_ID`) |
| **Automations** | Hub body → Automations → `AutomationDetailView` | Libraries → `AntAutomationWorkbench` (rewrite, thinned) | Libraries → embeds Hub `AutomationDetailView` (frozen `DEMO_AUTOMATION_ID`) |
| **Clients** | Board row click → `ClientView` + `DataPanel` → Activity=`JourneyTab` → `EngagementNodePanel` | `BoardModule` → `ClientWorkspace` (rewrite) | `ConsultantClientWorkspace` embeds Hub `ClientView` / `ClientDataContent` → `JourneyTab` |

Leaf inventories (exhaustive tables):

- [HUB-AGENTS-PROTOTYPE-GAP-MAP.md](./HUB-AGENTS-PROTOTYPE-GAP-MAP.md)
- [HUB-AUTOMATION-PROTOTYPE-GAP-MAP.md](./HUB-AUTOMATION-PROTOTYPE-GAP-MAP.md)
- [HUB-CLIENT-MODULE-GAP-MAP.md](./HUB-CLIENT-MODULE-GAP-MAP.md)

This document is the **rollup**: only MISSING / OBFUSCATED / critical PARTIAL, plus the inverted ANT SURPASSES cases.

---

## Cross-cutting rule (easy to miss)

| Pattern | What it means for the map |
|---------|---------------------------|
| Plant embeds Hub detail | Leaf is **TRANSLATED in Plant** — do not list as Plant gap |
| Ant rewrites the same module | Leaf often **MISSING or OBFUSCATED in Ant** — that is the CT product gap |
| Plant catalog select ignores id | Catalog chrome is **PARTIAL**: canvas stays pinned to one DEMO agent / automation |
| Hub Settings / Enrollment stubs | Empty Hub placeholders are **not** Ant losses when Ant already ships real Settings |

---

## 1. Agents — Hub leaves without Ant counterparts

**Seat:** Hub Agents → CT “Engagement templates” / Configuration libraries (**OBFUSCATED**).

| Hub leaf | Hub symbol | Ant | Status |
|----------|------------|-----|--------|
| Agents list sort | `AgentsSectionHeader` sort | NONE | **MISSING** |
| Header More ⋯ / Add contacts | `AgentHeader` DropdownMenu | NONE | **MISSING** |
| Linked automations peek (names+status) | `AutomationsControl` HoverCard | Count Tag only | **PARTIAL** |
| Dual-pane: step rail + sequence canvas | `AgentStepRail` + `AgentSequenceCanvas` | Timeline cards only | **MISSING** rail / **OBFUSCATED** canvas |
| Collapse / expand step rail | `AgentEditor` `railOpen` | NONE | **MISSING** |
| Insert step between nodes | canvas `AgentAddStepMenu` | Append-only | **MISSING** |
| Rail “+ Add A/B test” | `AgentStepRail` | NONE | **MISSING** |
| Empty → Select a template / AI-assisted | `AgentEditorEmptyState` | NONE | **MISSING** |
| Step select / collapse / ⋯ | `AgentStepFrame` | NONE | **MISSING** |
| Email Assisted / Prompt / Template tabs | `EmailStepNode` | NONE | **MISSING** |
| Email thread type New / Reply | `EmailStepNode` Type select | Hardcoded `"new"` | **MISSING** |
| Email Preview pane (+ refresh / desktop / mobile / eye / To) | `EmailStepNode` preview column | NONE | **MISSING** |
| Task priority | `TaskStepNode` | Hardcoded `"medium"` | **MISSING** |
| Task Skip N days after due | `TaskStepNode` | Hardcoded `0` | **MISSING** |

**Not an Ant gap:** Contacts / Activity / Report tabs are stubs in **both** Hub and Ant.  
**ANT SURPASSES:** `AgentSettingsPanel` (attempt criteria, channel order, cohort, metrics, phase) vs Hub Settings placeholder; step up/down reorder; working “New template”.

**Plant:** detail leaves = Hub embed. Only library-level PARTIAL (catalog does not drive `DEMO_AGENT_ID`).

---

## 2. Automations — Hub leaves without Ant counterparts

**Seat:** Hub Automations → Configuration libraries “Automations” (**OBFUSCATED**).

| Hub leaf | Hub symbol | Ant | Status |
|----------|------------|-----|--------|
| Header Share | `AutomationWorkflowHeader` | NONE | **MISSING** |
| Enrollment tab | `EDITOR_TABS` Enrollment | No tab; Settings free-text | **MISSING** tab / **OBFUSCATED** criteria |
| Build modules (Constants / Conditions / Operations / Rules / Actions) | `AutomationBuildPalette` | Collapse by XYFlow node type | **OBFUSCATED** |
| Constants industry folders → table | palette + `ConstantsIndustryTableView` | NONE | **MISSING** |
| Empty canvas + Add trigger CTA | `AutomationEmptyCanvas` + `AutomationAddTriggerMenu` | Bare ReactFlow | **MISSING** |
| Typed node chrome (configure / run / If handles / enrollment on node) | `nodes/*` + `WorkflowNodeFrame` | One `AntWorkflowNode` Card | **OBFUSCATED** |
| Node toolbar (move / attach / duplicate / delete) | `WorkflowNodeToolbar` | NONE | **MISSING** |
| Attach step menu | `AttachStepMenu` | Palette drop only | **MISSING** |
| Mid-edge insert (+) | `AutomationInsertEdge` / `EdgeInsertMenu` | NONE | **MISSING** |
| Node run overlays | `WorkflowNodeRunChrome` | NONE | **MISSING** |
| 3-col config modal (Input · Params · Output) + Run | `AutomationNodeConfigModal` | Narrow Drawer (label + sparse fields) | **OBFUSCATED** |
| Input / Output Schema · Table · JSON | `NodeDataPane` | NONE | **MISSING** |
| Field path drop into conditions | `FieldPathDropInput` | NONE | **MISSING** |
| If condition form | `IfConditionConfigForm` | `NodeConfigFields` returns null for branch | **MISSING** |
| Rule outcomes + Rule analysis | `RuleOutcomesConfigForm` + `RuleAnalysisPane` | null for rule | **MISSING** |
| Manual trigger Applies-to + enrollment criteria | `ManualParams` + `ManualEnrollmentCriteriaSummary` | “launch from the header” copy | **MISSING** |
| Data class scope selector | `DataClassScopeSelector` | NONE | **MISSING** |
| Manual class name filter panel | `AutomationManualClassFilterPanel` | NONE | **MISSING** |
| Event trigger scopes / mutation multi-select | `EventParams` + scopes | Event id `Select` only | **PARTIAL** (critical) |
| Structured enrollment criteria | criteria UI | Settings `enrollmentHint` textarea | **OBFUSCATED** |
| Runs row density / entity meta | `AutomationRunsTab` | Thinner `List` | **PARTIAL** |

**ANT SURPASSES:** Settings Eligibility pipeline reorder (`seq_eligibility_pipeline`) — Hub Settings is still a stub; do not count pipeline as a Hub translate.

**Plant:** Hub `AutomationDetailView` embed = TRANSLATED for graph/modal depth, with caveats: frozen `DEMO_AUTOMATION_ID`; `onOpenConstantsIndustry` unwired (**PARTIAL**).

---

## 3. Clients — Hub leaves without Ant counterparts

**Clients module** = Board → click client → workspace + Client Data submodules (Information / CRS History / Activity). Deepest critical leaf: Activity timeline/list node → inspect → channel replay.

### Founder’s example (how deep this map goes)

| Leaf | Hub | Plant | Ant |
|------|-----|-------|-----|
| Timeline/list node click → side inspector | `JourneyTab.openNodeInspector` → `EngagementNodePanel` | **EXISTS** (Hub embed) | **MISSING** — Tree `onSelect` + gantt `title=` tooltips only |
| Email replay | `EmailOutputPreview` + `ThreadsBlock` | EXISTS | **MISSING** |
| SMS / text replay | `ClientMessagePanel` | EXISTS | **MISSING** |
| Form replay (output + capture typing + session) | `FormOutputPreview` / `FormCaptureReplay` / `FormReplayViewer` | EXISTS | **MISSING** |
| Call replay | Not in `INSPECTABLE_CHANNELS` | — | **HUB-GAP** (Hub never shipped call replay) |

### Other Ant-critical gaps

| Hub leaf | Hub symbol | Ant | Status |
|----------|------------|-----|--------|
| Client Header property row | `ClientPageHeader` | Title + Descriptions only | **OBFUSCATED** |
| Client Brief narrative (Overview / Pathway / History / Tower observation) | `ClientNarrative` | Phase snapshot Descriptions | **MISSING** (narrative) |
| Client Data bottom panel (Information / History / Activity chips) | `DataPanel` / `ClientDataContent` | No Information/History; Engagement tab ≠ Activity document | **MISSING** |
| Information profile table | `InformationTab` / `ProfileTable` | Phase fields only | **MISSING** |
| CRS History scrubber / stats / chart | `CrsHistoryTab` + CRS holons | NONE | **MISSING** |
| Full-page Activity (`ClientDataPage`) | `ClientDataPage` | NONE | **MISSING** |
| Engagement signal icons | `EngagementSignalIcons` | Status Tag only | **MISSING** |
| In-list reasoning / thought / criteria / outcome | `ReasoningToggle`, `ThoughtStrip`, … | NONE | **MISSING** |
| Escalation wait thought-chain reveal | `NudgeEscalationRow` | Tag only | **OBFUSCATED** |
| Timeline zoom tiers (week/day/hour/halfHour), Today, pinch | JourneyTab zoom | Zoom in/out clamp only | **PARTIAL** |
| Board PhaseTooltip → View in Activity (focus node) | `PhaseTooltip` → `setFocusTouchpointId` | No tooltip; `activityKick` opens tab only | **MISSING** |
| Task touchpoint side panel | `TaskTouchpointPanel` | NONE | **MISSING** |

**Plant Clients:** replay stack **EXISTS** via Hub `JourneyTab`. Remaining Plant risks: Brief|Engagement split (**OBFUSCATED** composition); `onViewInActivity` opens Engagement tab but **does not** focus touchpoint (**PARTIAL**).

---

## Priority remake queue (Ant = true CT gaps)

Ordered by “easy to miss / critical product depth,” not by chrome polish.

1. **Clients · engagement node inspect + channel replay** — mount or reimplement `EngagementNodePanel` + email/SMS/form replay (`inspector/*`). Chronology without look-inside is obfuscation.
2. **Automations · node config fidelity** — Input/Output panes, If + Rule forms, Manual/Event scope+enrollment (not `enrollmentHint`).
3. **Automations · graph authoring** — AttachStep, edge insert, typed node chrome, empty-canvas trigger CTA, run overlays.
4. **Agents · email/task authoring depth** — preview pane, Assisted/Prompt/Template, thread type, task priority + skip-after-days, step rail + insert-between.
5. **Clients · Client Data Information + CRS History** — not replaceable by phase Descriptions.
6. **Clients · Brief narrative + header** — consultant story of the file.
7. **Automations · Build taxonomy + Constants industry table** from Automations.
8. **Agents · header enrollment (Add contacts) + linked-automation peek**.
9. **Seat clarity** — document Hub Agents/Automations vs Configuration libraries as intentional remapping, or restore Hub-shaped lists in CT.

---

## What this map deliberately excludes

- Escrow / Meta / surfaces outside Agents, Automations, Clients.
- Ant-only densify chrome (inhabit Tags, Export chronology button) that is not a Hub leaf.
- Hub stubs that Ant also stubs (Agent Contacts/Activity/Report) — no depth lost.
- Call replay — **HUB-GAP**, not a prototype miss.

---

## Proof anchors (spot-checked in code)

| Claim | Evidence |
|-------|----------|
| Ant Clients has no node inspector | `ClientWorkspace.tsx`: Tree `onSelect` + `ActivityTimeline` `title=` only; no `EngagementNodePanel` import |
| Plant Clients has Hub journey | `ConsultantClientWorkspace.tsx` imports `ClientDataContent` |
| Ant Automations If/Rule unconfigurable | `NodeConfigFields` handles trigger/action/constant; branch/rule fall through to null |
| Ant Automations enrollment obfuscated | Settings `enrollmentHint` textarea; Manual trigger copy only |
| Ant Agents email preview / priority / skip missing | Hydrate hardcodes `threadType: "new"`, `priority: "medium"`, `skipAfterDays: 0`; no Preview UI |
| Plant Agents/Automations are Hub embeds | `ConfigurationLibrariesPanel.tsx` mounts `AgentDetailView` / `AutomationDetailView` with DEMO ids |
