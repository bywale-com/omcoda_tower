# Priors census — Agents · Audits · Activity

**Scope:** CT plant (`src/app/register/prototype/`) + Ant remake (`src/app/register/prototype-ant/`), deduped.  
**Class:** Priors — entry = control; purposes empty.  
**Marks:** `latticed` | `weak` | `prior`

---

<a id="agents"></a>
## Agents

Desk seat: Configuration libraries → Libraries nav **Agents** / **Engagement templates** → catalog + **Agent / sequence editor** (plant: `AgentDetailView`; Ant: `AntAgentWorkbench`).

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| ag-nav-libraries-agents | Libraries nav → Agents | plant+Ant Config libraries aside | nav | latticed | How `operator-configuration-libraries` leaf 1.3 Engagement templates | Plant/Ant label **Agents**; How names Engagement templates |
| ag-catalog-row | Select agent / template catalog row | plant+Ant Engagement templates catalog | open | latticed | How leaf 1.3 — click template row | Opens Agent / sequence editor |
| ag-new-template | New template | plant+Ant catalog actions | commit | latticed | How leaf 1.3 **New template** | Creates draft row; omitted from Bind until publish |
| ag-publish-version | Publish version | plant Config libraries editor chrome (Agents sub) | commit | latticed | How leaf 1.3 **Publish version**; Furnish Published/Draft | Ant Agents workbench relies on shared Config libraries publish chrome when present |
| ag-compare-versions | Compare versions | plant+Ant Config libraries (Agents sub) | open | latticed | Enrichment `op-cant-18` Compare versions Need | View-only; does not Bind |
| ag-tab-editor | Editor tab | plant AgentEditor + Ant workbench Tabs | tab | latticed | How **Agent / sequence editor**; C2 SME step-rail authorship | Default authorship surface |
| ag-tab-contacts | Contacts tab | plant+Ant agent tabs | tab | prior | | Empty placeholder copy only |
| ag-tab-activity | Activity tab (agent-local) | plant+Ant agent tabs | tab | prior | | Empty placeholder — not consultant Engagement record |
| ag-tab-report | Report tab | plant+Ant agent tabs | tab | prior | | Empty placeholder |
| ag-tab-settings | Settings tab | plant+Ant agent tabs | tab | weak | C2 / OPERATOR-REVISIONS channel rulesets live on step rail / Settings intent; How does not name Settings tab | Empty placeholder; authorship named on step rail instead |
| ag-launch-agent | Launch agent | plant AgentHeader + Ant header | commit | prior | | Soft commit stub; no lattice statement |
| ag-more-actions | More actions menu | plant AgentHeader ⋯ | menu | prior | | Opens dropdown |
| ag-add-contacts | Add contacts | plant More actions item | commit | prior | | Stub menu item |
| ag-linked-automations | Linked automations peek | plant AgentHeader Zap control | open | prior | | HoverCard list; Ant shows count Tag only |
| ag-toggle-step-rail | Collapse / expand step rail | plant step toolbar | toggle | weak | How / C2 name **step rail** as authorship surface | Control itself unnamed |
| ag-save-changes | Save changes | plant step toolbar | commit | prior | | Stub; lattice commit is **Publish version** |
| ag-add-step | Add a step | plant empty state + canvas insert + Ant step toolbar | commit | weak | How “edit ordered channel + copy steps”; C2 step rail | Menu/control label not in How |
| ag-add-step-email | Add step → Email | plant Add-step menu + Ant toolbar | commit | weak | How ordered channel steps; C2 email/send steps | |
| ag-add-step-task | Add step → Consultant task | plant Add-step menu + Ant toolbar | commit | weak | How / C2 consultant-task steps | |
| ag-empty-select-template | Select a template (empty state) | plant AgentEditorEmptyState | open | prior | | Placeholder beside Add a step |
| ag-empty-ai-assisted | AI-assisted agent (empty state) | plant AgentEditorEmptyState | open | prior | | Placeholder |
| ag-select-step | Select step on canvas / rail | plant sequence canvas + step rail | open | weak | How Step rail / Sequence canvas | Selection chrome unnamed |
| ag-collapse-step | Collapse / expand step | plant step frame + rail | toggle | prior | | |
| ag-more-step-actions | More step actions | plant step frame ⋯ | menu | prior | | No menu items wired |
| ag-reorder-step | Move step up / down | Ant StepCard arrows | reorder | prior | | Plant has no reorder control; order implied by insert |
| ag-email-compose-tabs | Email Assisted / Prompt / Template tabs | plant EmailStepNode | tab | prior | | Template styled active; others inert |
| ag-email-thread-type | Email thread type (New / Reply) | plant EmailStepNode select | select | prior | | |
| ag-email-preview-refresh | Refresh preview | plant EmailStepNode | open | prior | | |
| ag-email-preview-desktop | Desktop preview | plant EmailStepNode | toggle | prior | | |
| ag-email-preview-mobile | Mobile preview | plant EmailStepNode | toggle | prior | | |
| ag-email-preview-options | Preview options | plant EmailStepNode | menu | prior | | |
| ag-task-priority | Task priority select | plant TaskStepNode | select | prior | | |
| ag-task-skip-after | Skip after days checkbox + days | plant TaskStepNode | checkbox | prior | | |

---

<a id="audits"></a>
## Audits

Desk seat: Book readiness → **Audits** catalog + **Audit run** (plant: `BookReadinessPanel` + `AuditDetailView`; Ant: `BookReadinessModule`).

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| au-select-audit | Select Audits catalog row | plant+Ant Audits aside list | open | latticed | How `operator-book-readiness` — click **Audits** / open Audit run | Opens Audit run detail |
| au-checkboxes | Audit services / check checkboxes | plant AuditServicesPanel + Ant Services/checks | checkbox | latticed | How leaf 1.1 check email/phone/channel/dedupe/consent/name | Plant also has Run-checks select-all |
| au-verdict-filter | Verdict filter | Ant Book readiness Select (All/Pass/Fail/Pending) | select | latticed | Enrichment `op-cant-06` Verdict filter Need | **Ant only** — plant list has no filter |
| au-re-audit-remainder | Re-audit remainder | Ant Book readiness button | commit | latticed | Enrichment `op-cant-06` Re-audit remainder Need | **Ant only** — plant missing |
| au-sort-records | Sort records | plant AuditRecordsTable + Ant Records toolbar | toggle | prior | | Plant icon stub; Ant toggles name asc/desc |
| au-inspect-record | Inspect record | plant toolbar + Ant eye / row click | inspect | prior | | No lattice inspect affordance; How only **view** verdict chips |
| au-export-download-records | Export / Download records CSV | plant Export + Ant Download CSV | download | prior | | |
| au-select-record-row | Select / highlight record row | Ant Records table onRow | open | prior | | Sets inspected highlight |

**Lattice-named but absent on both desks (not rows):** How **Start Audit run** primary + **batch dropdown** — desk has hydrated audits + checkboxes / Re-audit instead. Hub `AddAuditFlow` (Add audit / Select Data / Run) is not mounted in CT Book readiness shells.

---

<a id="activity"></a>
## Activity

Desk seat: Client workspace → **Engagement record** (plant: `ConsultantClientWorkspace` → `ClientDataContent` / `JourneyTab`; Ant: `ClientWorkspace` dual-pane Tree + timeline).

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| ac-tab-engagement | Engagement record tab | plant+Ant Client workspace tabs | tab | latticed | How `consultant-governance` leaf 1.1 Engagement record (Activity) | Opens chronology surface |
| ac-halt-outreach | Halt outreach | plant+Ant Engagement record / workspace chrome | commit | latticed | How governance leaf 1.2 **Halt outreach** | Also on Board; included because mounted on Activity seat |
| ac-lift-halt | Lift halt | plant+Ant when halted | commit | prior | | Inverse of Halt; not named in How |
| ac-export-chronology | Export chronology | Ant Engagement record actions | download | latticed | Furnish `cons-furnish-20` Export chronology | **Ant only** — plant missing |
| ac-tree-expand | Expand / collapse engagement tree nodes | plant JourneyTab headers + Ant Tree onExpand | toggle | weak | How chronology **rows** (view) | Tree chrome unnamed |
| ac-tree-select | Select chronology / tree node | plant touchpoint select + Ant Tree onSelect | open | weak | How / C2 Engagement record chronology | Selection → highlight / inspector |
| ac-show-reasoning | Show / Hide reasoning | plant JourneyTab ReasoningToggle | toggle | prior | | |
| ac-node-inspect | Open node inspector | plant JourneyTab channel/form inspect | inspect | weak | C2 “chronology stays inspectable”; no named inspector control | Opens EngagementNodePanel |
| ac-inspector-tabs | Node inspector Overview / Metadata tabs | plant EngagementNodePanel | tab | prior | | |
| ac-inspector-close | Close node inspector | plant EngagementNodePanel | nav | prior | | |
| ac-zoom-in | Zoom in (day axis) | plant JourneyTab + Ant ActivityTimeline | zoom | prior | | Product gantt log only — outside lattice refs |
| ac-zoom-out | Zoom out (day axis) | plant JourneyTab + Ant ActivityTimeline | zoom | prior | | |
| ac-scroll-today | Scroll to today / Today | plant JourneyTab Today button | scroll | prior | | **Plant only** |
| ac-pane-resize | Pane resize (list ↔ timeline) | plant JourneyTab drag handle + Ant Splitter | resize | prior | | |
| ac-gantt-segment | Timeline segment / marker click | plant NudgeGantt interactive segments | open | prior | | Ant timeline bars are title-tooltips only (non-click) |
| ac-reveal-thought | Reveal escalation thought | plant nudge escalation row | toggle | prior | | |

---

## Counts (this slice)

| Module | Rows | latticed | weak | prior |
|---|---:|---:|---:|---:|
| Agents | 34 | 7 | 8 | 19 |
| Audits | 8 | 4 | 0 | 4 |
| Activity | 16 | 3 | 3 | 10 |
| **Total** | **58** | **14** | **11** | **33** |
