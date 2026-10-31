# Hub Agents → Register CT prototype gap map

**Date:** 2026-08-11  
**Scope:** Hub Agents module (`src/app/components/hub/agent/**`) + Hub shell/nav reach  
**Counterparts:** Ant `AntAgentWorkbench` / `ConfigurationLibrariesModule`; Plant `ConfigurationLibrariesPanel`

## Architectural rule

| Seat | How Agents is reached | Detail surface |
|------|----------------------|----------------|
| **Hub** | Board strip → Hub icon → `HubBody` Agents section → row → `HubToolDetailView` → `AgentDetailView` | Native Hub tree under `hub/agent/` |
| **Plant** | Operator → Configuration libraries → Libraries nav **Agents** (`Engagement templates`) → catalog | **Embeds Hub** `AgentDetailView` |
| **Ant** | Operator → Configuration libraries → Libraries nav **Agents** → `AgentLibrary` | **Rewrite** `AntAgentWorkbench` (thinned) |

**Implication:** For every Hub detail leaf below, Plant counterpart is **EMBED** (same Hub symbols). Ant is the true Register CT product-face gap. Catalog/nav chrome differs in Plant/Ant vs Hub firm shell.

Status legend: **MISSING** | **OBFUSCATED** | **PARTIAL** | TRANSLATED (omitted from focus list unless critical).  
Focus below: **MISSING / OBFUSCATED / PARTIAL-critical** only.

---

## A. Hub shell / nav reach (outside `hub/agent/`)

| Hub path | Hub file:symbol | Ant counterpart | Plant counterpart | Status | Why it matters |
|----------|-----------------|-----------------|-------------------|--------|----------------|
| Hub > shell > Hub icon / HubBody | `BoardPanel.tsx` → `HubBody` | NONE in firm shell; Agents live under Operator Configuration libraries | NONE in firm shell; same Operator libraries path | **OBFUSCATED** | Hub Agents is a firm-seat tool; CT moves authorship to operator desk under a different module name |
| Hub > Agents > section header (label, count) | `AgentsSectionHeader.tsx`:`AgentsSectionHeader` | `ConfigurationLibrariesModule.tsx`:`AgentLibrary` CatalogShell title `"Agents"` / pack kind `engagement` id `"Engagement templates"` | `ConfigurationLibrariesPanel.tsx` CONFIG_LIB_SUBS `navLabel: "Agents"` / id `"Engagement templates"` | **OBFUSCATED** | Catalog id is Engagement templates; Hub concept “Agents” is findable only via navLabel |
| Hub > Agents > Add agent (+) | `AgentsSectionHeader` → `DirectorySectionHeader` `plusTitle="Add agent"` (no `onPlusClick` wired) | `AgentLibrary` `"New template"` button (creates draft agent) | `"New template"` on catalog (creates pack row; editor still demo agent) | **PARTIAL** | Create affordance renamed + Ant creates agent; Hub plus is unwired; Plant new pack ≠ opening that agent |
| Hub > Agents > Sort agents | `AgentsSectionHeader` `sortTitle="Sort agents"` (icon only, unwired) | NONE | NONE | **MISSING** | Sort chrome exists in Hub list; CT libraries have no sort control |
| Hub > Agents > agent row open | `HubBody.tsx` + `HubToolRow.tsx` `kind: "agent"` | `LibraryCatalogItem` in `AgentLibrary` | Catalog row select → still mounts fixed `DEMO_AGENT_ID` | **PARTIAL** | Ant selects real agent into workbench; Plant catalog selection does not drive embedded Hub agent id |

---

## B. Detail shell / header

| Hub path | Hub file:symbol | Ant counterpart | Plant counterpart | Status | Why it matters |
|----------|-----------------|-----------------|-------------------|--------|----------------|
| Agents > detail > not-found | `AgentDetailView.tsx` empty `"Agent not found."` | NONE (assumes selected agent) | EMBED | **MISSING** (Ant) | Ant has no not-found empty for bad id |
| Agents > detail > header title | `AgentHeader.tsx`:`AgentHeader` | `AntAgentWorkbench` Title + status Tag | EMBED | TRANSLATED (+ Ant adds status Tag Hub header lacks) | — |
| Agents > detail > linked automations peek | `AgentHeader.tsx`:`AutomationsControl` HoverCard names+status | Tag `"{n} linked automation(s)"` only | EMBED | **PARTIAL** | Hub lets you inspect linked workflow names; Ant collapses to a count badge |
| Agents > detail > Launch agent | `AgentDetailView` `handleLaunch` + `AgentHeader` button | `AntAgentWorkbench` `handleLaunch` | EMBED | TRANSLATED | — |
| Agents > detail > More actions ⋯ | `AgentHeader` DropdownMenu | NONE | EMBED | **MISSING** | Overflow menu surface absent in Ant |
| Agents > detail > More > Add contacts | `AgentHeader` DropdownMenuItem | NONE | EMBED | **MISSING** | Enrollment entry from header has no Ant counterpart |

---

## C. Tabs strip

| Hub path | Hub file:symbol | Ant counterpart | Plant counterpart | Status | Why it matters |
|----------|-----------------|-----------------|-------------------|--------|----------------|
| Agents > tabs > Editor | `AgentEditor.tsx` tab `"editor"` | `AntAgentWorkbench` Tabs `editor` | EMBED | TRANSLATED | — |
| Agents > tabs > Contacts (placeholder) | `AgentEditor` `placeholderCopy` contacts | `emptyCopy.contacts` Empty | EMBED | TRANSLATED (both stubs) | Not a CT gap vs Hub depth — both empty |
| Agents > tabs > Activity (placeholder) | `AgentEditor` activity copy | `emptyCopy.activity` Empty | EMBED | TRANSLATED (both stubs) | Same class as APP-ELEVATION-GAP note — neither has live runs UI |
| Agents > tabs > Report (placeholder) | `AgentEditor` report copy | `emptyCopy.report` Empty | EMBED | TRANSLATED (both stubs) | — |
| Agents > tabs > Settings | `AgentEditor` settings **placeholder paragraph** | `AgentSettingsPanel` (attempt criteria, channel order, cohort scoring, metrics thresholds, phase order) | EMBED (Hub placeholder) | **PARTIAL** (Hub thinned; **Ant surpasses**) | Hub Settings is copy-only; Ant Settings is the live modular rules editor — CT did not lose Settings, Hub did |

---

## D. Editor chrome / sequence layout

| Hub path | Hub file:symbol | Ant counterpart | Plant counterpart | Status | Why it matters |
|----------|-----------------|-----------------|-------------------|--------|----------------|
| Agents > Editor > step toolbar (count + rail toggle + Save) | `AgentEditor.tsx` `AGENT_STEP_TOOLBAR_HOLON` | Save in header; aside labeled “Step toolbar” is **add-step buttons only** | EMBED | **OBFUSCATED** | “Step toolbar” in Ant ≠ Hub’s steps-count / collapse-rail / save strip |
| Agents > Editor > Collapse / expand step rail | `AgentEditor` ChevronsLeft/Right `railOpen` | NONE (aside always shown) | EMBED | **MISSING** | Dual-pane show/hide chrome gone |
| Agents > Editor > Save changes | `AgentEditor` `handleSave` | Header `Save` `handleSave` | EMBED | TRANSLATED (relocated) | — |
| Agents > Editor > sequence editor (rail + canvas) | `AgentSequenceEditor.tsx`:`AgentSequenceEditor` | Timeline + `StepCard` list (no rail/canvas split) | EMBED | **OBFUSCATED** | Hub dual-pane authoring model collapsed to a single Timeline |
| Agents > Editor > step rail (select, grip, title, condition, summary) | `AgentStepRail.tsx`:`AgentStepRail` | Aside add buttons only; no per-step rail list | EMBED | **MISSING** | Primary navigation among steps is gone; selection chrome absent |
| Agents > Editor > rail condition node (timing + pencil) | `AgentStepRail`:`RailConditionNode` | Read-only `agentStepTimingLabel` text on card | EMBED | **PARTIAL** | Timing visible but not as editable condition chrome |
| Agents > Editor > rail + Add A/B test | `AgentStepRail` `"+ Add A/B test"` | NONE | EMBED | **MISSING** | A/B experiment entry on email steps has no Ant surface |
| Agents > Editor > rail footer Add a step | `AgentStepRail` → `AgentAddStepMenu` | Aside `AGENT_STEP_TYPES` Buttons | EMBED | **PARTIAL** | Add exists but not as popover menu at rail foot |
| Agents > Editor > sequence canvas | `AgentSequenceCanvas.tsx`:`AgentSequenceCanvas` | Timeline region `data-register-surface="Agent / sequence editor"` | EMBED | **OBFUSCATED** | Vertical node canvas → Ant Timeline cards |
| Agents > Editor > step connectors | `AgentStepFrame.tsx`:`AgentStepConnector` | Timeline spine (Ant Timeline) | EMBED | **PARTIAL** | Visual sequence link exists only as Ant Timeline chrome, not Hub connectors |
| Agents > Editor > insert Add-a-step between nodes | `AgentSequenceCanvas` compact `AgentAddStepMenu` after each step | NONE (append-only via aside / empty CTAs) | EMBED | **MISSING** | Cannot insert a step after a chosen index in Ant |
| Agents > Editor > Add-a-step menu (Email / Task) | `AgentAddStepMenu.tsx`:`AgentAddStepMenu` | Direct Email / Task buttons | EMBED | **PARTIAL** | Menu pattern replaced by always-visible buttons; same two kinds |
| Agents > Editor > empty state hero | `AgentEditorEmptyState.tsx`:`AgentEditorEmptyState` | `Empty` + Add email / Add consultant task | EMBED | **PARTIAL** | Thinned: no template / AI paths |
| Agents > Editor > empty > Select a template | `AgentEditorEmptyState` button | NONE | EMBED | **MISSING** | Template bootstrap path absent in Ant |
| Agents > Editor > empty > AI-assisted agent | `AgentEditorEmptyState` button | NONE | EMBED | **MISSING** | AI bootstrap path absent in Ant |

---

## E. Step frame / nodes

| Hub path | Hub file:symbol | Ant counterpart | Plant counterpart | Status | Why it matters |
|----------|-----------------|-----------------|-------------------|--------|----------------|
| Agents > step > timing pill + pencil | `AgentStepFrame.tsx` timing pill | Timing as secondary Text only | EMBED | **PARTIAL** | Condition/timing edit affordance not findable as Hub pill |
| Agents > step > collapse / expand | `AgentStepFrame` collapse control (+ rail collapse) | NONE | EMBED | **MISSING** | Dense sequences cannot collapse nodes in Ant |
| Agents > step > More step actions ⋯ | `AgentStepFrame` ellipsis (unwired) | NONE | EMBED | **MISSING** | Step overflow menu absent (Hub also unwired, but chrome exists) |
| Agents > step > select on canvas/rail | `AgentSequenceEditor` `selectedStepId` | NONE (no selection state) | EMBED | **MISSING** | No selected-step highlighting / rail sync in Ant |
| Agents > step > reorder | Grip affordance on rail (visual only) | `StepCard` Move up/down (**Ant only**) | EMBED | Hub **MISSING** reorder; Ant has it | Reverse: Ant surpasses Hub on reorder |
| Agents > Email step > node shell | `EmailStepNode.tsx`:`EmailStepNode` | `StepCard` email branch (subject + body inputs) | EMBED | **PARTIAL** | Core fields kept; compose chrome stripped |
| Agents > Email > Assisted / Prompt / Template tabs | `EmailStepNode` tab row | NONE | EMBED | **MISSING** | Authoring modes (assisted/prompt/template) not in Ant |
| Agents > Email > Subject field | `EmailStepNode` Subject input | `StepCard` Input subject | EMBED | TRANSLATED | — |
| Agents > Email > Thread type (New / Reply) | `EmailStepNode` Type select | NONE (hardcodes `threadType: "new"` on hydrate) | EMBED | **MISSING** | Reply-vs-new thread authoring lost |
| Agents > Email > Body field | `EmailStepNode` Body textarea | `StepCard` TextArea body | EMBED | TRANSLATED | — |
| Agents > Email > Preview pane | `EmailStepNode` right column Preview | NONE | EMBED | **MISSING** | No live subject/body preview surface in Ant |
| Agents > Email > Preview > Refresh | `EmailStepNode` RefreshCw | NONE | EMBED | **MISSING** | — |
| Agents > Email > Preview > Desktop / Mobile | `EmailStepNode` Monitor / Smartphone | NONE | EMBED | **MISSING** | Viewport preview toggles absent |
| Agents > Email > Preview > options (Eye) | `EmailStepNode` Eye | NONE | EMBED | **MISSING** | — |
| Agents > Email > Preview > To: Select contact | `EmailStepNode` hint | NONE | EMBED | **MISSING** | Preview recipient stub absent |
| Agents > Task step > node shell | `TaskStepNode.tsx`:`TaskStepNode` | `StepCard` task branch (note only) | EMBED | **PARTIAL** | Task note kept; priority/skip stripped |
| Agents > Task > priority select | `TaskStepNode` Task priority* | NONE (defaults `"medium"` internally) | EMBED | **MISSING** | Priority not authorable in Ant |
| Agents > Task > note | `TaskStepNode` Task note | `StepCard` task note TextArea | EMBED | TRANSLATED | — |
| Agents > Task > Skip tasks N days after due | `TaskStepNode` checkbox + number | NONE (`skipAfterDays: 0` hardcoded) | EMBED | **MISSING** | Skip-after-due policy not authorable in Ant |

---

## F. Ant-only surpassing Hub (not Hub→Ant gaps; recorded for rigor)

| Ant surface | Ant file:symbol | Hub | Note |
|-------------|-----------------|-----|------|
| Settings modular editors | `AntAgentWorkbench.tsx`:`AgentSettingsPanel` | Settings placeholder only | Ant > Hub |
| Status Tag on header | `AntAgentWorkbench` `agentStatusLabel` | Not shown in `AgentHeader` | Ant > Hub |
| Move step up / down | `StepCard` arrows | No working reorder | Ant > Hub |
| New template in libraries | `AgentLibrary` | Hub Add agent unwired | Ant > Hub (create) |

---

## Critical gap summary (Ant = true CT gap)

1. **OBFUSCATED seat:** Hub Agents ↔ CT “Engagement templates” / Configuration libraries (not Hub shell).  
2. **MISSING dual-pane:** Step rail + sequence canvas + insert-between + rail collapse.  
3. **MISSING email authoring depth:** Assisted/Prompt/Template, thread type, full preview (desktop/mobile/refresh).  
4. **MISSING task authoring depth:** priority + skip-after-days.  
5. **MISSING header ops:** More actions / Add contacts; linked automations thinned to count.  
6. **MISSING empty-state paths:** Select a template, AI-assisted agent.  
7. **MISSING A/B** affordance on email rail rows.  
8. **Settings inverted:** Hub placeholder; **Ant Settings surpasses** — do not treat Settings as an Ant gap.

**Plant:** Detail leaves are Hub embeds — Plant does not create an independent Agents UI gap; catalog selection still pinned to `DEMO_AGENT_ID` (PARTIAL at library level only).
