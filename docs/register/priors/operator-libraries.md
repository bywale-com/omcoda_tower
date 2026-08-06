# Priors — Operator libraries (Automations · Agents · Audits)

**Zones:** Automations · Agents · Audits  
**Count:** 49 priors (24 Automations · 21 Agents · 4 Audits)  
**Purposes:** empty (`—`)

## Automations

| id | title | where | kind | notes | purposes |
|---|---|---|---|---|---|
| auto-compare-close | Close compare | Config libraries · Compare versions modal | nav | plant+Ant dismiss | — |
| auto-rename | Rename automation | Workflow detail / header | commit | plant+Ant | — |
| auto-share | Share workflow | Workflow detail / header | commit | plant only; unwired | — |
| auto-save | Save | Workflow detail / header | commit | plant+Ant; not Publish | — |
| auto-launch | Launch workflow / Stop run | Workflow detail / header | commit | Ant Stop; plant Launch stubbed | — |
| auto-tab-runs | Runs tab | Editor tabs | tab | plant+Ant | — |
| auto-tab-settings | Settings tab | Editor tabs | tab | plant+Ant empty | — |
| auto-tab-enrollment | Enrollment tab | Editor tabs | tab | plant only | — |
| auto-build-toggle | Show / hide Build panel | Editor tabs chrome | toggle | plant only | — |
| auto-node-manual-run | Run / Stop manual trigger (node) | Trigger node | commit | plant only | — |
| auto-enrollment-filter | Edit class filter | Enrollment criteria · class row | open | plant pencil | — |
| auto-class-filter-done | Done (class filter) | Filter configuration panel | commit | plant only | — |
| auto-toolbar-attach | Add connected step | Node toolbar | menu | plant only | — |
| auto-toolbar-duplicate | Duplicate node | Node toolbar | commit | plant only | — |
| auto-toolbar-delete | Delete node | Node toolbar | commit | plant only | — |
| auto-edge-insert | Insert step on edge | Canvas edge | commit | plant | — |
| auto-attach-pick-block | Attach / insert menu · pick block | Attach / Edge insert menu | menu | plant | — |
| auto-attach-branch-handle | Branch handle true / false | Attach step menu | toggle | plant | — |
| auto-attach-close | Close attach / insert menu | Attach / Edge insert menu | nav | plant | — |
| auto-config-run | Run node | Node config modal | commit | plant | — |
| auto-config-close | Close node config | Config modal / Ant Drawer | nav | plant+Ant | — |
| auto-config-view-code | View code / Hide code | Config · Rule outcomes | toggle | plant | — |
| auto-canvas-controls | Canvas zoom / fit controls | Workflow canvas | zoom | plant+Ant | — |
| auto-ant-palette-collapse | Build palette section collapse | Ant Build aside | toggle | Ant only | — |

## Agents

| id | title | where | kind | notes | purposes |
|---|---|---|---|---|---|
| ag-tab-contacts | Contacts tab | Agent editor tabs | tab | plant+Ant empty | — |
| ag-tab-activity | Activity tab (agent-local) | Agent editor tabs | tab | plant+Ant empty | — |
| ag-tab-report | Report tab | Agent editor tabs | tab | plant+Ant empty | — |
| ag-launch-agent | Launch agent | Agent header | commit | plant+Ant stub | — |
| ag-more-actions | More actions menu | plant AgentHeader ⋯ | menu | plant | — |
| ag-add-contacts | Add contacts | plant More actions item | commit | plant stub | — |
| ag-linked-automations | Linked automations peek | plant AgentHeader Zap | open | plant HoverCard | — |
| ag-save-changes | Save changes | plant step toolbar | commit | plant stub | — |
| ag-empty-select-template | Select a template (empty state) | plant AgentEditorEmptyState | open | plant | — |
| ag-empty-ai-assisted | AI-assisted agent (empty state) | plant AgentEditorEmptyState | open | plant | — |
| ag-collapse-step | Collapse / expand step | plant step frame + rail | toggle | plant | — |
| ag-more-step-actions | More step actions | plant step frame ⋯ | menu | plant unwired | — |
| ag-reorder-step | Move step up / down | Ant StepCard arrows | reorder | Ant only | — |
| ag-email-compose-tabs | Email Assisted / Prompt / Template tabs | plant EmailStepNode | tab | plant | — |
| ag-email-thread-type | Email thread type (New / Reply) | plant EmailStepNode select | select | plant | — |
| ag-email-preview-refresh | Refresh preview | plant EmailStepNode | open | plant | — |
| ag-email-preview-desktop | Desktop preview | plant EmailStepNode | toggle | plant | — |
| ag-email-preview-mobile | Mobile preview | plant EmailStepNode | toggle | plant | — |
| ag-email-preview-options | Preview options | plant EmailStepNode | menu | plant | — |
| ag-task-priority | Task priority select | plant TaskStepNode | select | plant | — |
| ag-task-skip-after | Skip after days checkbox + days | plant TaskStepNode | checkbox | plant | — |

## Audits

| id | title | where | kind | notes | purposes |
|---|---|---|---|---|---|
| au-sort-records | Sort records | Audit run · Records toolbar | toggle | plant+Ant | — |
| au-inspect-record | Inspect record | Audit run · Records toolbar (+ Ant eye) | inspect | plant+Ant | — |
| au-export-download-records | Export / Download records CSV | Audit run · Records toolbar | download | plant+Ant | — |
| au-select-record-row | Select / highlight record row | Ant Records table onRow | open | Ant only | — |
