# Register Priors — Automations desk→lattice census

**Class:** Priors (own Register class — not How / SME / Can'ts / Furnish retrofit)  
**Module:** Automations (`Configuration libraries` → Automation workflows)  
**Surfaces surveyed:** plant `src/app/register/prototype/operator/ConfigurationLibrariesPanel.tsx` (+ shared hub `AutomationDetailView` tree) · Ant `src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx` + `AntAutomationWorkbench.tsx`  
**Lattice refs checked:** `docs/register/how/operator-configuration-libraries.md` · `docs/register/enrichment/operator-cants.md` · `docs/register/furnish/operator-furnish.md` · `docs/sme/capability/C1-email-deliverability.md` · `docs/sme/capability/C2-agentic-engagement-runtime.md` · `src/app/register/theory/` twins  
**Marks:** `latticed` = backed by How leaf / SME click-path / Enrichment Can't / Furnish · `weak` = partially named under a parent canvas/editor · `prior` = interactive with no lattice backing  
**Purposes:** left empty (Priors entry = control)  
**Dedup:** DS-I plant + Ant remake counted once; era notes when affordance differs or is era-only.

## Scope notes

- Catalog / Publish / Compare live on Configuration libraries chrome while Automations sub is selected (both eras).
- Plant editor = re-homed Hub `AutomationDetailView` (full palette, tabs, node toolbar, config modal).
- Ant editor = `AntAutomationWorkbench` (simpler: Workflow / Runs / Settings only; Collapse palette; node Drawer).
- Skipped: Published/Draft chips (view-only Furnish), dead “Add configuration” buttons on Action/Constant nodes (no handlers), Hub Board `AutomationsSectionHeader` (wrong seat; not CT Configuration libraries mount), Constants industry folders (handler unwired on CT plant mount).

## Census table

| id | title | where (module/panel) | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| auto-nav-automations | Libraries nav → Automations | Configuration libraries / Libraries nav | nav-tab | latticed | how/operator-configuration-libraries.md · Leaf 1.2 | Plant `navLabel` “Automations”; Ant Menu key `Automation workflows` |
| auto-catalog-row | Open workflow catalog row | Automations / catalog | row-action | latticed | how · Leaf 1.2 (“click a workflow row”) | Ant selects real `WorkflowDefinition`; plant pack row does not swap DEMO automation id |
| auto-new-workflow | New workflow | Automations / catalog | button | latticed | how · Leaf 1.2 | Primary create; Ant `createAutomation()`; plant seeds Draft pack |
| auto-compare-versions | Compare versions | Automations / catalog chrome | button | latticed | enrichment/operator-cants.md · `op-cant-18` | Densify fill of Can't; also editor secondary when Published (plant) |
| auto-publish-version | Publish version | Automations / editor chrome | button | latticed | how · Leaf 1.2 | Ant top chrome; plant footer of Workflow canvas shell |
| auto-compare-version-a | Compare · Version A | Compare versions modal | select | weak | under `op-cant-18` Compare affordance | View-only picker; not a standalone lattice entry |
| auto-compare-version-b | Compare · Version B | Compare versions modal | select | weak | under `op-cant-18` Compare affordance | Same |
| auto-compare-close | Close compare | Compare versions modal | button | prior | — | Modal dismiss; not named |
| auto-rename | Rename automation | Workflow detail / header | button→input | prior | — | Plant click-to-edit title; Ant borderless Input |
| auto-share | Share workflow | Workflow detail / header | button | prior | — | Plant/DS-I only; no handler beyond chrome; Ant omits |
| auto-save | Save | Workflow detail / header | button | prior | — | Both eras; persists graph |
| auto-launch | Launch workflow / Stop run | Workflow detail / header | button | prior | — | Ant toggles Stop via manual run; plant Launch stubbed |
| auto-tab-workflow | Workflow tab | Editor tabs | tab | weak | how · Leaf 1.2 Workflow canvas (parent) | Switches to latticed canvas; tab itself not named |
| auto-tab-runs | Runs tab | Editor tabs | tab | prior | — | Both eras; run rows are display-only (no open/inspect handler) |
| auto-tab-settings | Settings tab | Editor tabs | tab | prior | — | Empty placeholder both eras |
| auto-tab-enrollment | Enrollment tab | Editor tabs | tab | prior | — | Plant/DS-I only; Ant has no Enrollment tab; empty placeholder |
| auto-build-toggle | Show / hide Build panel | Editor tabs chrome | toggle | prior | — | Plant/DS-I only (`PanelRight`); Ant palette always mounted |
| auto-empty-add-trigger | Empty canvas · Add trigger | Workflow canvas / empty state | menu | weak | how · Leaf 1.2 Trigger nodes; SME C1/C2 trigger→… path | Plant `AutomationAddTriggerMenu`; Ant empty uses palette triggers when canvas empty |
| auto-palette-add-trigger | Build palette · Add trigger | Build palette | button | weak | how · Leaf 1.2 Trigger nodes | Event / schedule / manual / constant (plant); Ant Collapse Trigger section |
| auto-palette-add-block | Build palette · Add block | Build palette | button | weak | how · Leaf 1.2 Trigger/Rule/Action nodes; SME C1/C2 enroll-into-template | Constant / branch / rule / action / exit blocks; not standalone lattice entries |
| auto-node-open | Open / select canvas node | Workflow canvas | canvas-select | weak | how · Leaf 1.2 nodes + Workflow canvas | Plant selects + may open config; Ant opens Node details Drawer |
| auto-node-configure | Configure node | Canvas node | button | weak | how · Leaf 1.2 (edit trigger→conditions/rules→actions) | Plant: trigger/rule/branch open config modal; Ant: Drawer label edit |
| auto-node-manual-run | Run / Stop manual trigger (node) | Trigger node | button | prior | — | Plant/DS-I only when manual trigger configured |
| auto-enrollment-open | Open enrollment criteria | Trigger node · Enrollment criteria card | button | weak | how Clarity enroll-into-template; SME C1/C2 enrollment action | Plant manual-trigger summary opens config; not a lattice-named control |
| auto-enrollment-filter | Edit class filter | Enrollment criteria · class row | row-action | prior | — | Plant pencil → Filter configuration panel |
| auto-class-filter-done | Done (class filter) | Filter configuration panel | button | prior | — | Plant/DS-I only |
| auto-toolbar-attach | Add connected step | Node toolbar | menu | prior | — | Plant/DS-I; opens Attach step menu |
| auto-toolbar-duplicate | Duplicate node | Node toolbar | button | prior | — | Plant/DS-I |
| auto-toolbar-delete | Delete node | Node toolbar | button | prior | — | Plant/DS-I |
| auto-edge-insert | Insert step on edge | Canvas edge | button | prior | — | Plant/DS-I `+` → Edge insert menu |
| auto-attach-pick-block | Attach / insert menu · pick block | Attach step / Edge insert menu | menu-item | prior | — | Plant/DS-I commit path distinct from palette |
| auto-attach-branch-handle | Branch handle true / false | Attach step menu | toggle | prior | — | Plant/DS-I when attaching from If node |
| auto-attach-close | Close attach / insert menu | Attach / Edge insert menu | button | prior | — | Plant/DS-I |
| auto-config-run | Run node | Node config modal | button | prior | — | Plant/DS-I; manual / If / Rule |
| auto-config-close | Close node config | Node config modal / Ant Drawer | button | prior | — | Plant Dialog close; Ant Drawer onClose |
| auto-config-view-code | View code / Hide code | Node config · Rule outcomes | toggle | prior | — | Plant/DS-I RuleOutcomesConfigForm only |
| auto-canvas-controls | Canvas zoom / fit controls | Workflow canvas | button-group | prior | — | ReactFlow `<Controls>` both eras; Ant also MiniMap pan/zoom |
| auto-ant-palette-collapse | Build palette section collapse | Ant Build aside | toggle | prior | — | Ant-only Collapse (Trigger / Constant / Branch / Rule / Action / Exit) |

## Mark tallies (deduped)

| mark | count |
|---|---|
| latticed | 5 |
| weak | 10 |
| prior | 22 |
| **total** | **37** |

## Lattice backing (Automations-relevant)

| Lattice | What it names for Automations |
|---|---|
| How Leaf 1.2 | Libraries nav Automations · catalog row · New workflow · Workflow canvas · Publish version · Trigger/Rule/Action nodes |
| Enrichment `op-cant-18` | Compare versions (view-only diff before Bind) |
| Furnish `op-furnish-18` | Published/Draft chips (view-only — not in interactive census) |
| SME C1 / C2 click-paths | Workflow canvas; trigger → condition/rule → enroll-into-template action; Publish version |
