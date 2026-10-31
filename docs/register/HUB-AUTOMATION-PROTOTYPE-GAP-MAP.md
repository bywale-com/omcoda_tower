# Hub Automations → Register CT prototype gap map

**Scope:** `src/app/components/hub/automation/**` + Hub nav entry for Automations (`AutomationsSectionHeader` / `HubBody` rows).  
**Counterparts:** Ant `prototype-ant/operator/AntAutomationWorkbench.tsx` + `ConfigurationLibrariesModule.tsx`; Plant `prototype/operator/ConfigurationLibrariesPanel.tsx` (embeds Hub `AutomationDetailView`).  
**Statuses:** `TRANSLATED` · `PARTIAL` · `OBFUSCATED` · `MISSING`  
**Plant rule:** Plant embeds Hub `AutomationDetailView` for frozen `wf-eligibility-reactivation` → those Hub leaves are **TRANSLATED (Plant embed)** even when Ant is still MISSING/OBFUSCATED. Callouts below mark that split.

---

## Counterpart anchors

| Layer | Path | What it covers |
| --- | --- | --- |
| Hub source of truth | `src/app/components/hub/automation/*` | Full editor tree |
| Hub nav | `AutomationsSectionHeader.tsx`, `HubBody.tsx` rows | Firm Hub sidebar Automations list + Add |
| Plant | `ConfigurationLibrariesPanel.tsx` → `<AutomationDetailView automationId={DEMO…} />` | One frozen workflow; real Hub UI |
| Ant catalog shell | `ConfigurationLibrariesModule.tsx` → `AutomationLibrary` | Catalog + New workflow + workbench host |
| Ant workbench | `AntAutomationWorkbench.tsx` | Synthesized thinner canvas (MATCH-REPORT: synthesize) |

---

## Gap inventory (MISSING / OBFUSCATED / critical PARTIAL)

Focus set only. Fully TRANSLATED leaves (Plant embed + Ant present with comparable job) are omitted except where the Ant/Plant split matters.

### 1. Hub nav — Automations section

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Hub sidebar · Automations section header + Add | `AutomationsSectionHeader.tsx` | Libraries nav label `"Automations"` inside Configuration libraries (`CONFIG_LIB_SUBS.navLabel`) — **not** a Hub body section | Same Libraries nav `"Automations"` | **OBFUSCATED** | Firm-seat Hub list/create is remapped to operator Configuration libraries. Add automation becomes catalog **New workflow**. Wrong seat if CT is meant to prove Hub authorship. |
| Hub sidebar · automation rows | `HubBody.tsx` + `HubToolRow` | Catalog `List` of workflows in `AutomationLibrary` | Catalog buttons of packs + frozen editor for one DEMO id | **PARTIAL** (Ant) / **OBFUSCATED** (Plant) | Ant lists live workflows; Plant catalog is pack rows while canvas is hard-pinned to `DEMO_AUTOMATION_ID` (selection does not swap the embedded Hub graph). |

---

### 2. Shell — header / tabs

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Detail header · Share | `AutomationWorkflowHeader.tsx` | No Share control | TRANSLATED (embed) | **MISSING** (Ant) | Hub chrome action absent in Ant header. |
| Detail header · rename / Save / Launch | `AutomationWorkflowHeader.tsx` | Inline `Input` + Save + Launch/Stop | TRANSLATED (embed) | **TRANSLATED** (Ant) | — |
| Tabs · Workflow / Runs / Settings | `AutomationWorkflowEditor.tsx` `EDITOR_TABS` | `Tabs` keys `workflow` / `runs` / `settings` | TRANSLATED (embed) | **TRANSLATED** (Ant) | Labels: Hub “Workflow” ≈ Ant “Workflow”. |
| Tabs · **Enrollment** | `AutomationWorkflowEditor.tsx` | **No Enrollment tab** — enrollment folded into Settings free-text | TRANSLATED (embed; Hub tab is still a placeholder copy) | **MISSING** (Ant tab) / Hub itself stub | Hub holon `AUTOMATION_ENROLLMENT_TAB_HOLON` has no Ant tab. Ant Settings “Enrollment summary” is a string field — **OBFUSCATED** vs Hub’s intended enrollment criteria surfaces. |
| Settings tab body | Hub: placeholder paragraph only | Ant: Schedule/enrollment fields + **Eligibility pipeline reorder** (`seq_eligibility_pipeline`) | TRANSLATED (embed = Hub stub) | **PARTIAL** both ways | Ant Settings is richer (pipeline) but Hub Settings is empty stub. Do not treat Ant pipeline as a translate of Hub Settings. |

---

### 3. Build palette / empty canvas / triggers

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Build palette · module sections (Constants / Conditions / Operations / Rules / Actions) | `AutomationBuildPalette.tsx` + `automationBuildModules.ts` | Collapse by **node type** (Trigger/Constant/Branch/Rule/Action/Exit) | TRANSLATED (embed) | **OBFUSCATED** (Ant) | Module taxonomy (conditions vs operations vs rules packages) collapses to XYFlow node types. Constants industry folders gone. |
| Build palette · industry folders → constants table | `AutomationBuildPalette.tsx` `IndustryFolderRow` | None | Embed present but `onOpenConstantsIndustry` **not wired** in Plant panel | **MISSING** (Ant) / **PARTIAL** (Plant) | Hub opens `ConstantsIndustryTableView` via Hub tool tab. Plant shows folders that no-op. |
| Constants industry table | `ConstantsIndustryTableView.tsx` | None in Automations workbench (Reference Data module is a different seat) | Not opened from Automations embed | **MISSING** | Criteria library browse from Automations Build is gone in both CT paths. |
| Empty canvas · “Add a trigger to start” + centered menu | `AutomationEmptyCanvas.tsx` + `AutomationAddTriggerMenu.tsx` | Bare empty ReactFlow; triggers only from left palette | TRANSLATED (embed) | **MISSING** (Ant) | First-run empty state + on-canvas trigger CTA lost. |
| Trigger kinds (event / schedule / manual / webhook / constant) | Hub menus + palette | Ant palette exposes same `WORKFLOW_TRIGGER_OPTIONS` | TRANSLATED (embed) | **TRANSLATED** (Ant list) | Config depth per kind still gapped below. |

---

### 4. Canvas graph chrome

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Typed nodes (Trigger/Constant/Branch/Rule/Action/Exit) with Hub chrome | `nodes/*.tsx` + `WorkflowNodeFrame.tsx` | Single `AntWorkflowNode` Card for all types | TRANSLATED (embed) | **OBFUSCATED** (Ant) | Lost: configure CTAs, manual run button on trigger, If true/false handles, enrollment summary on node, run-status shell. |
| Node toolbar (move / + attach / duplicate / delete) | `WorkflowNodeToolbar.tsx` | None (ReactFlow defaults only) | TRANSLATED (embed) | **MISSING** (Ant) | Graph authoring affordances. |
| Attach step menu (+ connected step, branch picker) | `AttachStepMenu.tsx` | None — palette drop only, no edge-connected attach | TRANSLATED (embed) | **MISSING** (Ant) | Hub’s primary “add next step” path. |
| Edge insert (+) + `EdgeInsertMenu` | `edges/AutomationInsertEdge.tsx`, `EdgeInsertMenu.tsx` | Default edges; no mid-edge insert | TRANSLATED (embed) | **MISSING** (Ant) | Insert-on-edge authoring. |
| Node run overlays | `WorkflowNodeRunChrome.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Manual/run walk visualization on nodes. |
| Workflow canvas shell | `AutomationWorkflowCanvas.tsx` | ReactFlow + Background/MiniMap/Controls | TRANSLATED (embed) | **PARTIAL** (Ant) | Canvas exists; missing empty state, insert edges, editor context (config/filter/run). |

---

### 5. Node config modal — structure & data panes

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| 3-column modal (Input · Parameters/Outcomes · Output) + Run | `AutomationNodeConfigModal.tsx` | Narrow `Drawer` “Node details” (label + sparse fields + Descriptions) | TRANSLATED (embed) | **OBFUSCATED** (Ant) | Hub’s inspection/run model replaced by a label editor. |
| Input Schema / Table / JSON | `NodeDataPane.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Upstream payload inspection + field drag source. |
| Output Schema / Table / JSON (+ If branch true/false) | `NodeDataPane.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Downstream contract visibility. |
| Rule output analysis pane | `RuleAnalysisPane.tsx` (+ `RuleOutputPane` in modal) | None | TRANSLATED (embed) | **MISSING** (Ant) | Eligibility pathway outcomes UI. |
| Field path drop input | `FieldPathDropInput.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Drag field paths from Input schema into If conditions. |

---

### 6. Node config — typed parameter sections

| Hub path | File / section | Ant `NodeConfigFields` | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Manual trigger · Applies to + enrollment criteria | Modal `ManualParams` + `DataClassScopeSelector` + `ManualEnrollmentCriteriaSummary` | Text: “Manual trigger — launch from the header.” | TRANSLATED (embed) | **MISSING** (Ant) | Manual enrollment is core Hub behavior. |
| Manual class name filter panel | `AutomationManualClassFilterPanel.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Per-class name filter side panel. |
| Event trigger · mutation events + data-class scopes | Modal `EventParams` / `DataClassScopeSelectorList` | Single Select of `WORKFLOW_EVENT_CATALOG` id | TRANSLATED (embed) | **PARTIAL** → critical | Event pick exists; scopes / mutation multi-select / enrollment criteria gone. |
| Schedule params | Modal `ScheduleParams` | Cron `Input` on trigger + Settings schedule summary | TRANSLATED (embed) | **PARTIAL** (Ant) | Cron only; Hub schedule UX richer in modal. |
| Webhook params | Modal `WebhookParams` | Webhook id `Input` + URL hint | TRANSLATED (embed) | **TRANSLATED** (Ant, thin) | Acceptable thin translate. |
| If / branch condition form | `IfConditionConfigForm.tsx` | **Returns null** for branch | TRANSLATED (embed) | **MISSING** (Ant) | No condition authoring in Ant Drawer. |
| Rule outcomes form | `RuleOutcomesConfigForm.tsx` | **Returns null** for rule | TRANSLATED (embed) | **MISSING** (Ant) | Rule packs unconfigurable in Ant. |
| Action · agent ref | Modal `ActionParams` | Select `WORKFLOW_AGENT_OPTIONS` | TRANSLATED (embed) | **PARTIAL** (Ant) | Agent pick only; Hub action types/summaries richer. |
| Constant · pack / kind | Modal `ConstantParams` | Select `WORKFLOW_CONSTANT_PACK_OPTIONS` | TRANSLATED (embed) | **PARTIAL** (Ant) | Pack pick only; no industry table path. |
| Exit node copy | Modal exit branch | No config (null) | TRANSLATED (embed) | **PARTIAL** | Acceptable (exit has little config). |

**Orphan Hub panels (same semantics as modal sections; not mounted in Hub app tree today):**  
`AutomationEventTriggerConfigPanel.tsx`, `AutomationManualTriggerConfigPanel.tsx` — still **MISSING** in Ant; treat as duplicate of Event/Manual modal sections for gap counting (do not double-count as separate product surfaces).

---

### 7. Enrollment filter cluster (Hub-native)

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Manual enrollment criteria summary (node + modal) | `ManualEnrollmentCriteriaSummary.tsx` | Settings `enrollmentHint` textarea only | TRANSLATED (embed) | **OBFUSCATED** (Ant) | Structured criteria → free-text marketing copy. |
| Data class scope selector | `DataClassScopeSelector.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Who the trigger applies to. |
| Manual class filter panel | `AutomationManualClassFilterPanel.tsx` | None | TRANSLATED (embed) | **MISSING** (Ant) | Name-level filter for a data class. |
| Enrollment tab (dedicated) | Editor tab stub | Missing tab | TRANSLATED (embed stub) | **MISSING** (Ant) | Tab chrome for enrollment holon. |

---

### 8. Runs

| Hub path | File | Ant | Plant | Status | Why it matters |
| --- | --- | --- | --- | --- | --- |
| Runs tab · entity row / status / duration / timestamp | `AutomationRunsTab.tsx` | Ant `List` of runs (triggerLabel + status Tag + entity · startedAt) | TRANSLATED (embed) | **PARTIAL** (Ant) | History exists; Hub directory-row density + entity-kind icons/meta thinner in Ant. |

---

## Status rollup (Ant vs Plant)

| Bucket | Ant count (approx.) | Plant posture |
| --- | --- | --- |
| **MISSING** | Empty canvas, node toolbar, AttachStepMenu, edge insert, run chrome, NodeDataPane I/O, FieldPathDrop, If form, Rule outcomes, Rule analysis, Manual enrollment stack, DataClassScopeSelector, ManualClassFilter, ConstantsIndustryTable, Enrollment tab, Share | Almost none inside `AutomationDetailView` **except** Constants industry open path (`onOpenConstantsIndustry` unwired) and Hub-sidebar nav (different seat) |
| **OBFUSCATED** | Hub nav → Config libraries; Build modules → node-type Collapse; typed nodes → one Card; 3-col modal → Drawer; enrollment criteria → `enrollmentHint` string | Hub Automations nav → Libraries “Automations”; Plant catalog selection does not drive embedded DEMO id |
| **Critical PARTIAL** | Event trigger (id only), Action/Constant selects, Runs list, canvas shell, Settings (Ant-only pipeline ≠ Hub stub) | Constants folders clickable but dead without Hub tab wiring |

**Plant TRANSLATED (embed) caveat:** one frozen workflow only. Surfaces that require other workflows, Hub list CRUD across many automations, or opening Constants as a Hub tool tab are **not** proven by the embed even though the component tree is Hub’s.

---

## Ant “present but not Hub” (do not count as Hub translate)

| Ant-only | Location | Note |
| --- | --- | --- |
| Eligibility pipeline reorder | Settings tab in `AntAutomationWorkbench` | Operator machine surface; Hub Settings is an empty placeholder — not a Hub Automations leaf translate. |
| MiniMap / Controls | Ant ReactFlow | Chrome addition; does not replace missing Hub graph chrome. |

---

## Priority remake queue (Ant)

1. **Node config fidelity** — restore Input/Parameters/Output + Run; If + Rule forms; Manual/Event scope+filter (highest product risk).  
2. **Graph authoring** — AttachStepMenu, edge insert, typed node chrome, empty-canvas trigger CTA.  
3. **Build taxonomy** — module sections + Constants industry open path.  
4. **Enrollment** — structured criteria (not `enrollmentHint`); decide Enrollment tab vs Settings.  
5. **Nav seat clarity** — document Hub Automations vs Configuration libraries Automations as intentional remapping or restore Hub-shaped list in CT.

---

## Source holons (Hub inventory checklist)

From `src/app/components/docs/automationHolons.ts`: Workflow Actions, Workflow Editor, Editor Tabs, Workflow/Runs/Settings/Enrollment tabs, Run Row, Workflow Canvas, Build Palette, Trigger/Rule/Constant/Branch/Action/Exit nodes, Edge Insert Control — plus Hub body Automations section (`hubBodyHolons`).
