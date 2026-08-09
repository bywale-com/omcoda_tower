# Tower — Controls ledger (Latticed ∪ Weak ∪ Prior)

**Seat:** Systems analyst (controls completeness pass).
**Why this exists:** The systems map (`SYSTEMS-STORY` + `OUTCOME-SYSTEM-MAP`) is already the product as initiations. A system↔control join is only honest if **every interactive control** is enumerable in **one place**. This ledger is that place. It does **not** assign systems yet — that join is the next pass. Without this ledger, any "system→component" map fails its own test.

**What this is:** the union of the three Register control classes over the CT desk (plant + Ant):
1. **Latticed** — control named in How / howAnalysis / Furnish click-path language
2. **Weak** — from [`weak/`](./weak/00-INDEX.md) (foothold; control unnamed)
3. **Prior** — from [`priors/`](./priors/00-INDEX.md) (no lattice click-path)

**What this is not:** display-only chrome skipped by Priors/Weak method; CTO wiring; system assignment.

**Method — Latticed extraction**
- Bold-named controls in `src/app/register/howAnalysis/*.ts` `clarity` strings and `docs/register/how/*.md` Clarity / click-path lines
- Furnish bold affordance names (short labels only)
- surfaceCatalog labels that are referenced from How/howAnalysis, excluding titles already claimed by Prior/Weak
- Id = kebab of Title Case label; desk/module filled when surfaceCatalog matches

**Method — Weak / Prior:** copied from the existing full-app inventories (source of truth remains those folders + TS twins).

**Completeness claim:** Prior (111) + Weak (32) are the filed inventories. Latticed below is the **named-control extraction** from How/Furnish lattice paths as of this pass — not a second CT rescan. If a control is interactive in CT and missing here, it is a pass miss (should have been Prior/Weak) or an unnamed Latticed gap to promote.

---

## Totals

| Class | Count | Source |
|---|---|---|
| Latticed | 160 | Extracted this pass (How / howAnalysis / Furnish / surfaceCatalog∩How) |
| Weak | 32 | [`weak/00-INDEX.md`](./weak/00-INDEX.md) |
| Prior | 111 | [`priors/00-INDEX.md`](./priors/00-INDEX.md) |
| **Union** | 303 | |

---

## Next pass (not this document)

Join **each row** → its **immediate system** (the 12 constrained systems, or an analyst-named unconstrained path for Free modules). That join is what the CTO actually looks up. This ledger is the left column of that join.

---

## Latticed

| id | title | desk | module | sources |
|---|---|---|---|---|
| `board` | Board | consultant | Board | surfaceCatalog+how-reference |
| `client-brief` | Client Brief | consultant | Board | surfaceCatalog+how-reference |
| `client-row` | Client row | consultant | Board | surfaceCatalog+how-reference |
| `client-workspace` | Client workspace | consultant | Board | surfaceCatalog+how-reference |
| `confirm-halt` | Confirm halt | consultant | Board | howAnalysis/consultantGovernance.ts; how/consultant-governance.md |
| `engagement-record` | Engagement record | consultant | Board | howAnalysis/consultantGovernance.ts; how/consultant-governance.md |
| `halt-outreach` | Halt outreach | consultant | Board | howAnalysis/consultantGovernance.ts; howAnalysis/consultantCore.ts; how/consultant-governance.md +1 |
| `phase-signal` | Phase signal | consultant | Board | surfaceCatalog+how-reference |
| `confirm-book-for-tower` | Confirm book for Tower | consultant | Contacts | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `contacts` | Contacts | consultant | Contacts | surfaceCatalog+how-reference |
| `imports` | Imports | consultant | Contacts | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `code-field` | Code field | consultant | Login | surfaceCatalog+how-reference |
| `email-field` | Email field | consultant | Login | surfaceCatalog+how-reference |
| `login` | Login | consultant | Login | surfaceCatalog+how-reference |
| `send-code` | Send code | consultant | Login | howAnalysis/consultantAccess.ts; how/consultant-access.md |
| `verify` | Verify | consultant | Login | howAnalysis/consultantAccess.ts; how/consultant-access.md |
| `live-brief` | Live brief | consultant | Meetings | howAnalysis/consultantCore.ts; howAnalysis/consultantAccess.ts; how/consultant-access.md +1 |
| `meeting` | Meeting | consultant | Meetings | surfaceCatalog+how-reference |
| `meeting-row` | Meeting row | consultant | Meetings | surfaceCatalog+how-reference |
| `meetings` | Meetings | consultant | Meetings | howAnalysis/consultantAccess.ts; how/consultant-access.md |
| `accept` | Accept | consultant | Prepared Workspace | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `accept-terms` | Accept terms | consultant | Prepared Workspace | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `authorize` | Authorize | consultant | Prepared Workspace | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `authorize-book` | Authorize book | consultant | Prepared Workspace | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `escrow-terms` | Escrow terms | consultant | Prepared Workspace | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `license-acknowledgement` | License acknowledgement | consultant | Prepared Workspace | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `prepared-workspace` | Prepared Workspace | consultant | Prepared Workspace | surfaceCatalog+how-reference |
| `agree` | Agree | contact | Client portal | surfaceCatalog+how-reference |
| `book-a-time` | Book a time | contact | Client portal | howAnalysis/contactBook.ts; how/contact-book.md |
| `booking` | Booking | contact | Client portal | surfaceCatalog+how-reference |
| `booking-confirm` | Booking confirm | contact | Client portal | surfaceCatalog+how-reference |
| `channel-thread` | Channel thread | contact | Client portal | surfaceCatalog+how-reference |
| `confirm-booking` | Confirm booking | contact | Client portal | howAnalysis/contactBook.ts; how/contact-book.md |
| `consent-link-review-request` | Consent link / Review request | contact | Client portal | surfaceCatalog+how-reference |
| `consent-request` | Consent request | contact | Client portal | surfaceCatalog+how-reference |
| `ignore-dismiss` | Ignore / dismiss | contact | Client portal | surfaceCatalog+how-reference |
| `loop-closer-form` | Loop-closer form | contact | Client portal | howAnalysis/contactBook.ts; how/contact-book.md |
| `meeting-invitation` | Meeting invitation | contact | Client portal | surfaceCatalog+how-reference |
| `nudge-form` | Nudge form | contact | Client portal | howAnalysis/contactRefresh.ts; how/contact-refresh.md |
| `nudge-message` | Nudge message | contact | Client portal | surfaceCatalog+how-reference |
| `opt-in-message` | Opt-in message | contact | Client portal | surfaceCatalog+how-reference |
| `self-reportable-fields` | Self-reportable fields | contact | Client portal | surfaceCatalog+how-reference |
| `silence-opt-out` | Silence / Opt out | contact | Client portal | surfaceCatalog+how-reference |
| `slot-picker` | Slot picker | contact | Client portal | surfaceCatalog+how-reference |
| `submit` | Submit | contact | Client portal | surfaceCatalog+how-reference |
| `touchpoint-footer` | Touchpoint footer | contact | Client portal | surfaceCatalog+how-reference |
| `update-facts` | Update facts | contact | Client portal | howAnalysis/contactRefresh.ts; how/contact-refresh.md |
| `update-facts-change-update-link` | Update facts / Change update link | contact | Client portal | surfaceCatalog+how-reference |
| `update-fields` | Update fields | contact | Client portal | surfaceCatalog+how-reference |
| `acquisition-ads` | Acquisition & ads | operator | Acquisition & ads | surfaceCatalog+how-reference |
| `approach-campaign-editor` | Approach campaign editor | operator | Acquisition & ads | surfaceCatalog+how-reference |
| `approach-campaigns` | Approach campaigns | operator | Acquisition & ads | howAnalysis/operatorAcquisition.ts; how/operator-acquisition.md |
| `approach-instrumentation` | Approach instrumentation | operator | Acquisition & ads | howAnalysis/operatorAcquisition.ts; how/operator-acquisition.md |
| `capture-strip` | Capture strip | operator | Acquisition & ads | surfaceCatalog+how-reference |
| `save-publish-campaign` | Save / Publish campaign | operator | Acquisition & ads | surfaceCatalog+how-reference |
| `activation-forward-deploy` | Activation & forward-deploy | operator | Activation & forward-deploy | surfaceCatalog+how-reference |
| `forward-deploy` | Forward-deploy | operator | Activation & forward-deploy | howAnalysis/operatorActivation.ts; how/operator-activation.md |
| `hydrate` | Hydrate | operator | Activation & forward-deploy | howAnalysis/operatorActivation.ts; how/operator-activation.md |
| `in-flight-activations` | In-flight activations | operator | Activation & forward-deploy | howAnalysis/operatorActivation.ts; how/operator-activation.md |
| `readiness-walkthrough` | Readiness walkthrough | operator | Activation & forward-deploy | howAnalysis/operatorActivation.ts; how/operator-activation.md |
| `staging-status-chips` | Staging status chips | operator | Activation & forward-deploy | surfaceCatalog+how-reference |
| `template-version` | Template version | operator | Activation & forward-deploy | howAnalysis/operatorActivation.ts; how/operator-activation.md |
| `activation-state` | Activation state | operator | Activation state | surfaceCatalog+how-reference |
| `progress` | Progress | operator | Activation state | howAnalysis/operatorActivationState.ts; howAnalysis/operatorActivation.ts; how/operator-activation.md +1 |
| `actor-filter` | Actor filter | operator | Audit trail | howAnalysis/operatorAuditTrail.ts; how/operator-audit-trail.md |
| `audit-trail` | Audit trail | operator | Audit trail | surfaceCatalog+how-reference |
| `change-event` | Change event | operator | Audit trail | howAnalysis/operatorAuditTrail.ts; how/operator-audit-trail.md |
| `change-event-list` | Change event list | operator | Audit trail | surfaceCatalog+how-reference |
| `filter-chips` | Filter chips | operator | Audit trail | surfaceCatalog+how-reference |
| `firm-filter` | Firm filter | operator | Audit trail | howAnalysis/operatorAuditTrail.ts; how/operator-audit-trail.md |
| `audit-run` | Audit run | operator | Book readiness | surfaceCatalog+how-reference |
| `audits` | Audits | operator | Book readiness | howAnalysis/operatorBookReadiness.ts; how/operator-book-readiness.md |
| `book-readiness` | Book readiness | operator | Book readiness | surfaceCatalog+how-reference |
| `verdict-list` | Verdict list | operator | Book readiness | howAnalysis/operatorBookReadiness.ts; how/operator-book-readiness.md |
| `commercial` | Commercial | operator | Commercial | surfaceCatalog+how-reference |
| `escrow-status` | Escrow status | operator | Commercial | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `instrument-list-firm-row` | Instrument list / firm row | operator | Commercial | surfaceCatalog+how-reference |
| `release-control` | Release control | operator | Commercial | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `save-terms-version` | Save terms version | operator | Commercial | how/operator-commercial.md |
| `agent-sequence-editor` | Agent / sequence editor | operator | Configuration libraries | surfaceCatalog+how-reference |
| `automation-workflows` | Automation workflows | operator | Configuration libraries | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `configuration-libraries` | Configuration libraries | operator | Configuration libraries | surfaceCatalog+how-reference |
| `engagement-templates` | Engagement templates | operator | Configuration libraries | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `evaluation-pack-editor` | Evaluation pack editor | operator | Configuration libraries | surfaceCatalog+how-reference |
| `evaluation-packs` | Evaluation packs | operator | Configuration libraries | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `libraries-nav` | Libraries nav | operator | Configuration libraries | surfaceCatalog+how-reference |
| `published-draft-status` | Published / Draft status | operator | Configuration libraries | surfaceCatalog+how-reference |
| `workflow-canvas` | Workflow canvas | operator | Configuration libraries | surfaceCatalog+how-reference |
| `customer-support` | Customer support | operator | Customer support | surfaceCatalog+how-reference |
| `linked-per-tenancy-actions` | Linked per-tenancy actions | operator | Customer support | surfaceCatalog+how-reference |
| `resolve` | Resolve | operator | Customer support | howAnalysis/operatorSupport.ts; how/operator-support.md |
| `support-context` | Support context | operator | Customer support | howAnalysis/operatorSupport.ts; how/operator-support.md |
| `ticket` | Ticket | operator | Customer support | surfaceCatalog+how-reference |
| `ticket-queue` | Ticket queue | operator | Customer support | howAnalysis/operatorSupport.ts; how/operator-support.md |
| `ticket-row` | Ticket row | operator | Customer support | surfaceCatalog+how-reference |
| `engagement-health` | Engagement health | operator | Firm health | howAnalysis/operatorFirmHealth.ts; how/operator-firm-health.md |
| `firm-health` | Firm health | operator | Firm health | surfaceCatalog+how-reference |
| `open-support-context` | Open support context | operator | Firm health | howAnalysis/operatorFirmHealth.ts; how/operator-firm-health.md |
| `sequence-detail` | Sequence detail | operator | Firm health | howAnalysis/operatorFirmHealth.ts; how/operator-firm-health.md |
| `sequence-health` | Sequence health | operator | Firm health | howAnalysis/operatorFirmHealth.ts; how/operator-firm-health.md |
| `armed-active` | Armed / Active | operator | Firm operations bind | howAnalysis/operatorFirmBind.ts; how/operator-firm-bind.md |
| `automation-pack-version` | Automation pack version | operator | Firm operations bind | surfaceCatalog+how-reference |
| `bind` | Bind | operator | Firm operations bind | howAnalysis/operatorFirmBind.ts |
| `bind-packs` | Bind packs | operator | Firm operations bind | howAnalysis/operatorFirmBind.ts; how/operator-firm-bind.md |
| `bound-version-chips` | Bound-version chips | operator | Firm operations bind | surfaceCatalog+how-reference |
| `engagement-template-version` | Engagement template version | operator | Firm operations bind | surfaceCatalog+how-reference |
| `evaluation-pack-version` | Evaluation pack version | operator | Firm operations bind | surfaceCatalog+how-reference |
| `firm-operations-bind` | Firm operations bind | operator | Firm operations bind | surfaceCatalog+how-reference |
| `firm-bind-index` | Firm-bind index | operator | Firm operations bind | howAnalysis/operatorFirmBind.ts; how/operator-firm-bind.md |
| `send-gates` | Send gates | operator | Firm operations bind | surfaceCatalog+how-reference |
| `agency-policy` | Agency policy | operator | Founder & agency controls | howAnalysis/operatorFounderControls.ts; how/operator-founder-controls.md |
| `bounds` | Bounds | operator | Founder & agency controls | surfaceCatalog+how-reference |
| `founder-agency-controls` | Founder & agency controls | operator | Founder & agency controls | surfaceCatalog+how-reference |
| `kill-switch` | Kill-switch | operator | Founder & agency controls | howAnalysis/operatorFounderControls.ts; how/operator-founder-controls.md |
| `save-policy` | Save policy | operator | Founder & agency controls | how/operator-founder-controls.md |
| `firm-row` | Firm row | operator | Oversight | surfaceCatalog+how-reference |
| `fleet-health` | Fleet health | operator | Oversight | howAnalysis/operatorOversight.ts; how/operator-oversight.md |
| `oversight` | Oversight | operator | Oversight | surfaceCatalog+how-reference |
| `copy-login-path-send-invite` | Copy Login path / Send invite | operator | Provision | surfaceCatalog+how-reference |
| `new-firm` | New firm | operator | Provision | howAnalysis/operatorProvision.ts; how/operator-provision.md |
| `provision` | Provision | operator | Provision | howAnalysis/operatorProvision.ts; how/operator-provision.md |
| `provision-complete` | Provision complete | operator | Provision | surfaceCatalog+how-reference |
| `import-criteria` | Import criteria | operator | Reference data | howAnalysis/operatorReferenceData.ts; how/operator-reference-data.md |
| `publish-version` | Publish version | operator | Reference data | howAnalysis/operatorConfigurationLibraries.ts; howAnalysis/operatorReferenceData.ts; how/operator-reference-data.md +1 |
| `reference-data` | Reference data | operator | Reference data | surfaceCatalog+how-reference |
| `reference-tables` | Reference tables | operator | Reference data | howAnalysis/operatorReferenceData.ts; how/operator-reference-data.md |
| `gap` | Gap | operator | Register & evolution | surfaceCatalog+how-reference |
| `gaps` | Gaps | operator | Register & evolution | howAnalysis/operatorRegisterEvolution.ts; how/operator-register-evolution.md |
| `regenerate-handoff` | Regenerate handoff | operator | Register & evolution | howAnalysis/operatorRegisterEvolution.ts; how/operator-register-evolution.md |
| `register-evolution` | Register & evolution | operator | Register & evolution | surfaceCatalog+how-reference |
| `save-gap` | Save gap | operator | Register & evolution | how/operator-register-evolution.md |
| `affordance-rule` | Affordance rule: | — | — | how/operator-configuration-libraries.md; how/operator-firm-bind.md |
| `automation-pack` | Automation pack | — | — | howAnalysis/operatorFirmBind.ts |
| `clarity` | Clarity: | — | — | how/operator-audit-trail.md; how/contact-book.md; how/operator-reference-data.md +19 |
| `count` | Count: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `criteria-when` | Criteria — when: | — | — | how/operator-book-readiness.md |
| `does-not-change-core-function` | Does not change Core Function: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `engagement-template` | Engagement template | — | — | howAnalysis/operatorFirmBind.ts |
| `evaluation-pack` | Evaluation pack | — | — | howAnalysis/operatorFirmBind.ts |
| `execute-release` | Execute release | — | — | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `execute-return` | Execute return | — | — | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `fleet-wide` | Fleet-wide | — | — | howAnalysis/operatorFounderControls.ts; how/operator-founder-controls.md |
| `halt-motion` | Halt motion | — | — | howAnalysis/operatorFounderControls.ts; how/operator-founder-controls.md |
| `new-pack` | New pack | — | — | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `new-template` | New template | — | — | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `new-workflow` | New workflow | — | — | howAnalysis/operatorConfigurationLibraries.ts; how/operator-configuration-libraries.md |
| `open-dispute` | Open dispute | — | — | howAnalysis/operatorCommercial.ts; how/operator-commercial.md |
| `opt-out` | Opt out | — | — | howAnalysis/contactSilence.ts; how/contact-silence.md |
| `publish-campaign` | Publish campaign | — | — | howAnalysis/operatorAcquisition.ts; how/operator-acquisition.md |
| `selected-tenancies` | Selected tenancies | — | — | howAnalysis/operatorFounderControls.ts; how/operator-founder-controls.md |
| `silence` | Silence | — | — | howAnalysis/contactSilence.ts; how/contact-silence.md |
| `start-audit-run` | Start Audit run | — | — | howAnalysis/operatorBookReadiness.ts; how/operator-book-readiness.md |
| `status` | Status: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `subject` | Subject: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `supporting-affordance` | Supporting affordance: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `surfaceids` | SurfaceIds: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `existing-wrong-seat` | existing-wrong-seat | — | — | howAnalysis/consultantCore.ts; how/consultant-core.md |
| `implementationproblem` | implementationProblem: | — | — | furnish/operator-furnish.md; furnish/consultant-furnish.md; furnish/contact-furnish.md |
| `not` | not | — | — | how/operator-configuration-libraries.md |
| `published` | published | — | — | howAnalysis/operatorFirmBind.ts |

## Weak

| id | title | zone | where | kind | source |
|---|---|---|---|---|---|
| `ac-tree-expand` | Expand / collapse engagement tree nodes | consultant | plant JourneyTab + Ant Tree | toggle | weak/consultant.md |
| `ac-tree-select` | Select chronology / tree node | consultant | plant+Ant Engagement record tree | open | weak/consultant.md |
| `ac-why-this-schedule` | Why this schedule / Hide | consultant | plant JourneyTab ThoughtStrip | toggle | weak/consultant.md |
| `ag-add-consultant-task` | Add consultant task | operator-libraries | plant Add-a-step; Ant toolbar Task | commit | weak/operator-libraries.md |
| `ag-add-email` | Add email | operator-libraries | plant Add-a-step; Ant toolbar Email | commit | weak/operator-libraries.md |
| `ag-add-step` | Add a step | operator-libraries | plant step rail + canvas insert | menu | weak/operator-libraries.md |
| `ag-select-step` | Select step on canvas / rail | operator-libraries | plant sequence canvas + step rail | open | weak/operator-libraries.md |
| `ag-tab-editor` | Editor tab | operator-libraries | Agent editor tabs plant+Ant | tab | weak/operator-libraries.md |
| `ag-tab-settings` | Settings tab | operator-libraries | Agent editor tabs plant+Ant | tab | weak/operator-libraries.md |
| `ag-toggle-step-rail` | Collapse / expand step rail | operator-libraries | plant AgentEditor step toolbar | toggle | weak/operator-libraries.md |
| `au-run-checks-all` | Run checks (select all) | operator-libraries | plant Audit run services | checkbox | weak/operator-libraries.md |
| `auto-add-block-palette` | Add block (palette) | operator-libraries | Build palette / Ant Build aside | menu | weak/operator-libraries.md |
| `auto-add-trigger` | Add trigger | operator-libraries | Empty canvas / Build Triggers plant+Ant | menu | weak/operator-libraries.md |
| `auto-enrollment-open` | Open enrollment criteria | operator-libraries | plant Trigger Enrollment criteria | open | weak/operator-libraries.md |
| `auto-node-configure` | Open / configure node | operator-libraries | Workflow canvas node plant+Ant | open | weak/operator-libraries.md |
| `auto-tab-workflow` | Workflow tab | operator-libraries | Automation editor tabs plant+Ant | tab | weak/operator-libraries.md |
| `board-accepted-terms` | Accepted terms | consultant | plant+Ant Board chrome + Client workspace | open | weak/consultant.md |
| `board-newest-first` | Newest first / Oldest first | consultant | Ant BoardModule Segmented | toggle | weak/consultant.md |
| `board-phase-filter` | Phase filter (All / Silent / In motion / Meeting-ready / Halted) | consultant | plant BoardPanel | toggle | weak/consultant.md |
| `board-phase-legend-close` | Close Phase signal legend | consultant | plant BoardPanel legend panel | nav | weak/consultant.md |
| `cfg-compare-ab` | Version A / B pickers | operator-libraries | Compare versions modal plant+Ant | select | weak/operator-libraries.md |
| `contact-link-state-continue` | Continue | contact | plant+Ant Link state (Valid) | open | weak/contact.md |
| `contact-nudge-form-cta` | Open Nudge form | contact | plant+Ant Nudge message CEM CTA | open | weak/contact.md |
| `contacts-confirm-import` | Confirm import | consultant | plant CsvImportColumnMappingDialog | commit | weak/consultant.md |
| `contacts-import-file` | Import file… | consultant | plant CsvImportFlow popover | open | weak/consultant.md |
| `eval-pack-name` | Pack name field | operator-libraries | Evaluation pack editor plant+Ant | commit | weak/operator-libraries.md |
| `op-activation-firm-link` | Firm name link → Forward-deploy drawer | operator-house | Ant ActivationForwardDeploy table | open | weak/operator-house.md |
| `op-activation-row-radio` | In-flight radio select | operator-house | Ant ActivationForwardDeploy Table | select | weak/operator-house.md |
| `op-ads-save-draft` | Save draft (campaign) | operator-house | plant+Ant AcquisitionAds campaign editor | commit | weak/operator-house.md |
| `op-ads-staging-queue` | Staging queue | operator-house | plant+Ant AcquisitionAds | nav | weak/operator-house.md |
| `op-commercial-instrument-radio` | Instrument list radio select | operator-house | Ant CommercialModule instrument Table | select | weak/operator-house.md |
| `op-module-nav` | Operator module sider nav | operator-house | plant+Ant Operator sider Menu | nav | weak/operator-house.md |

## Prior

| id | title | zone | where | kind | source |
|---|---|---|---|---|---|
| `ac-client-data-history` | Client Data → History tab | consultant | plant ClientDataContent (Brief + Engagement record mounts) | tab | priors/consultant.md |
| `ac-client-data-information` | Client Data → Information tab | consultant | plant ClientDataContent (Brief + Engagement record mounts) | tab | priors/consultant.md |
| `ac-crs-history-scrub` | CRS History scrubber | consultant | plant ClientDataContent History tab | toggle | priors/consultant.md |
| `ac-gantt-segment` | Timeline segment / marker click | consultant | plant JourneyTab NudgeGantt segments | open | priors/consultant.md |
| `ac-inspector-close` | Close node inspector | consultant | plant EngagementNodePanel | nav | priors/consultant.md |
| `ac-inspector-prev-next` | Node inspector Prev / Next | consultant | plant EngagementNodePanel | nav | priors/consultant.md |
| `ac-inspector-tabs` | Node inspector Overview / Metadata tabs | consultant | plant EngagementNodePanel | tab | priors/consultant.md |
| `ac-pane-resize` | Pane resize (list ↔ timeline) | consultant | plant JourneyTab drag handle + Ant Splitter | resize | priors/consultant.md |
| `ac-reveal-thought` | Reveal escalation thought | consultant | plant JourneyTab nudge escalation row | toggle | priors/consultant.md |
| `ac-scroll-today` | Scroll to today / Today | consultant | plant JourneyTab Today button | scroll | priors/consultant.md |
| `ac-show-reasoning` | Show / Hide reasoning | consultant | plant JourneyTab ReasoningToggle | toggle | priors/consultant.md |
| `ac-zoom-in` | Zoom in (day axis) | consultant | plant JourneyTab + Ant ActivityTimeline | zoom | priors/consultant.md |
| `ac-zoom-out` | Zoom out (day axis) | consultant | plant JourneyTab + Ant ActivityTimeline | zoom | priors/consultant.md |
| `ag-add-contacts` | Add contacts | operator-libraries | plant More actions item | commit | priors/operator-libraries.md |
| `ag-collapse-step` | Collapse / expand step | operator-libraries | plant step frame + rail | toggle | priors/operator-libraries.md |
| `ag-email-compose-tabs` | Email Assisted / Prompt / Template tabs | operator-libraries | plant EmailStepNode | tab | priors/operator-libraries.md |
| `ag-email-preview-desktop` | Desktop preview | operator-libraries | plant EmailStepNode | toggle | priors/operator-libraries.md |
| `ag-email-preview-mobile` | Mobile preview | operator-libraries | plant EmailStepNode | toggle | priors/operator-libraries.md |
| `ag-email-preview-options` | Preview options | operator-libraries | plant EmailStepNode | menu | priors/operator-libraries.md |
| `ag-email-preview-refresh` | Refresh preview | operator-libraries | plant EmailStepNode | open | priors/operator-libraries.md |
| `ag-email-thread-type` | Email thread type (New / Reply) | operator-libraries | plant EmailStepNode select | select | priors/operator-libraries.md |
| `ag-empty-ai-assisted` | AI-assisted agent (empty state) | operator-libraries | plant AgentEditorEmptyState | open | priors/operator-libraries.md |
| `ag-empty-select-template` | Select a template (empty state) | operator-libraries | plant AgentEditorEmptyState | open | priors/operator-libraries.md |
| `ag-launch-agent` | Launch agent | operator-libraries | Agent header | commit | priors/operator-libraries.md |
| `ag-linked-automations` | Linked automations peek | operator-libraries | plant AgentHeader Zap | open | priors/operator-libraries.md |
| `ag-more-actions` | More actions menu | operator-libraries | plant AgentHeader ⋯ | menu | priors/operator-libraries.md |
| `ag-more-step-actions` | More step actions | operator-libraries | plant step frame ⋯ | menu | priors/operator-libraries.md |
| `ag-reorder-step` | Move step up / down | operator-libraries | Ant StepCard arrows | reorder | priors/operator-libraries.md |
| `ag-save-changes` | Save changes | operator-libraries | plant step toolbar | commit | priors/operator-libraries.md |
| `ag-tab-activity` | Activity tab (agent-local) | operator-libraries | Agent editor tabs | tab | priors/operator-libraries.md |
| `ag-tab-contacts` | Contacts tab | operator-libraries | Agent editor tabs | tab | priors/operator-libraries.md |
| `ag-tab-report` | Report tab | operator-libraries | Agent editor tabs | tab | priors/operator-libraries.md |
| `ag-task-priority` | Task priority select | operator-libraries | plant TaskStepNode | select | priors/operator-libraries.md |
| `ag-task-skip-after` | Skip after days checkbox + days | operator-libraries | plant TaskStepNode | checkbox | priors/operator-libraries.md |
| `au-export-download-records` | Export / Download records CSV | operator-libraries | Audit run · Records toolbar | download | priors/operator-libraries.md |
| `au-inspect-record` | Inspect record | operator-libraries | Audit run · Records toolbar (+ Ant eye) | inspect | priors/operator-libraries.md |
| `au-select-record-row` | Select / highlight record row | operator-libraries | Ant Records table onRow | open | priors/operator-libraries.md |
| `au-sort-records` | Sort records | operator-libraries | Audit run · Records toolbar | toggle | priors/operator-libraries.md |
| `auto-ant-palette-collapse` | Build palette section collapse | operator-libraries | Ant Build aside | toggle | priors/operator-libraries.md |
| `auto-attach-branch-handle` | Branch handle true / false | operator-libraries | Attach step menu | toggle | priors/operator-libraries.md |
| `auto-attach-close` | Close attach / insert menu | operator-libraries | Attach / Edge insert menu | nav | priors/operator-libraries.md |
| `auto-attach-pick-block` | Attach / insert menu · pick block | operator-libraries | Attach / Edge insert menu | menu | priors/operator-libraries.md |
| `auto-build-toggle` | Show / hide Build panel | operator-libraries | Editor tabs chrome | toggle | priors/operator-libraries.md |
| `auto-canvas-controls` | Canvas zoom / fit controls | operator-libraries | Workflow canvas | zoom | priors/operator-libraries.md |
| `auto-class-filter-done` | Done (class filter) | operator-libraries | Filter configuration panel | commit | priors/operator-libraries.md |
| `auto-compare-close` | Close compare | operator-libraries | Config libraries · Compare versions modal | nav | priors/operator-libraries.md |
| `auto-config-close` | Close node config | operator-libraries | Config modal / Ant Drawer | nav | priors/operator-libraries.md |
| `auto-config-run` | Run node | operator-libraries | Node config modal | commit | priors/operator-libraries.md |
| `auto-config-view-code` | View code / Hide code | operator-libraries | Config · Rule outcomes | toggle | priors/operator-libraries.md |
| `auto-edge-insert` | Insert step on edge | operator-libraries | Canvas edge | commit | priors/operator-libraries.md |
| `auto-enrollment-filter` | Edit class filter | operator-libraries | Enrollment criteria · class row | open | priors/operator-libraries.md |
| `auto-launch` | Launch workflow / Stop run | operator-libraries | Workflow detail / header | commit | priors/operator-libraries.md |
| `auto-node-manual-run` | Run / Stop manual trigger (node) | operator-libraries | Trigger node | commit | priors/operator-libraries.md |
| `auto-rename` | Rename automation | operator-libraries | Workflow detail / header | commit | priors/operator-libraries.md |
| `auto-save` | Save | operator-libraries | Workflow detail / header | commit | priors/operator-libraries.md |
| `auto-share` | Share workflow | operator-libraries | Workflow detail / header | commit | priors/operator-libraries.md |
| `auto-tab-enrollment` | Enrollment tab | operator-libraries | Editor tabs | tab | priors/operator-libraries.md |
| `auto-tab-runs` | Runs tab | operator-libraries | Editor tabs | tab | priors/operator-libraries.md |
| `auto-tab-settings` | Settings tab | operator-libraries | Editor tabs | tab | priors/operator-libraries.md |
| `auto-toolbar-attach` | Add connected step | operator-libraries | Node toolbar | menu | priors/operator-libraries.md |
| `auto-toolbar-delete` | Delete node | operator-libraries | Node toolbar | commit | priors/operator-libraries.md |
| `auto-toolbar-duplicate` | Duplicate node | operator-libraries | Node toolbar | commit | priors/operator-libraries.md |
| `board-clients-collapse` | Clients section expand / collapse | consultant | plant BoardPanel ClientsSectionHeader | toggle | priors/consultant.md |
| `board-console-toggle` | Console | consultant | plant ActivityBarHeader | toggle | priors/consultant.md |
| `board-halt-modal-dismiss` | Halt outreach dismiss (backdrop / Cancel) | consultant | plant+Ant Halt modal | nav | priors/consultant.md |
| `board-holon-inspect` | Inspect holons (logo) | consultant | plant ActivityBarHeader | toggle | priors/consultant.md |
| `board-lift-halt` | Lift halt | consultant | plant+Ant Client workspace (also Engagement record seat) | commit | priors/consultant.md |
| `board-list-workspace-resize` | Pane resize (Board/Contacts list ↔ workspace) | consultant | Ant BoardModule + ContactsModule Splitter | resize | priors/consultant.md |
| `board-more-account` | More views → Account | consultant | plant ActivityBarHeader more menu | nav | priors/consultant.md |
| `board-more-clients` | More views → Clients | consultant | plant ActivityBarHeader more menu | nav | priors/consultant.md |
| `board-more-settings` | More views → Settings | consultant | plant ActivityBarHeader more menu | nav | priors/consultant.md |
| `board-more-views` | More views menu | consultant | plant ActivityBarHeader | menu | priors/consultant.md |
| `board-resume-book` | Resume book | consultant | plant+Ant Board when firm book halted | commit | priors/consultant.md |
| `board-resume-outreach` | Resume outreach | consultant | plant BoardPanel row menu when contact halted | commit | priors/consultant.md |
| `board-row-actions-menu` | Client actions ⋯ | consultant | plant BoardPanel row menu | menu | priors/consultant.md |
| `board-task-row` | Task row open | consultant | plant BoardPanel TaskRow | open | priors/consultant.md |
| `board-task-status` | Task status toggle | consultant | plant BoardPanel TaskStatusToggle | commit | priors/consultant.md |
| `board-tasks-collapse` | Tasks section expand / collapse | consultant | plant BoardPanel TasksBody | toggle | priors/consultant.md |
| `board-view-as-client` | View as Client | consultant | plant BoardPanel row ⋯ menu (sarah) | open | priors/consultant.md |
| `board-view-in-activity` | View in Activity | consultant | plant PhaseTooltip on Client row | open | priors/consultant.md |
| `brief-open-client-data` | Open Client Data in new tab | consultant | plant ClientView DataPanel (Client Brief) | open | priors/consultant.md |
| `contact-ant-walk` | Walk: consent → booking → silence / Next walk step | contact-and-ct-chrome | Ant ContactAntScene ModulePage | nav | priors/contact-and-ct-chrome.md |
| `contact-demo-cem-channel` | Demo · EMAIL / Demo · SMS | contact-and-ct-chrome | plant+Ant Opt-in message + Nudge message | toggle | priors/contact-and-ct-chrome.md |
| `contact-demo-clear-outstanding` | Demo · clear outstanding | contact-and-ct-chrome | plant+Ant Booking (facts-not-on-file branch) | toggle | priors/contact-and-ct-chrome.md |
| `contact-link-state-flipper` | Link state · Valid / Expired / Already used / Wrong purpose | contact-and-ct-chrome | plant+Ant Link state Segmented/buttons | toggle | priors/contact-and-ct-chrome.md |
| `contact-portal-surface-nav` | Client portal surface nav (10 touchpoints) | contact-and-ct-chrome | plant+Ant Contact aside Menu/buttons | nav | priors/contact-and-ct-chrome.md |
| `contact-silence-modal-dismiss` | Silence confirm Cancel / backdrop | contact-and-ct-chrome | Ant Silence / Opt out Modal | nav | priors/contact-and-ct-chrome.md |
| `contacts-add-contact` | Add contact | consultant | plant ContactsSectionHeader + | commit | priors/consultant.md |
| `contacts-add-import` | Add import | consultant | plant ImportsSectionHeader + | commit | priors/consultant.md |
| `contacts-search` | Search contacts | consultant | Ant ContactsModule Input.Search | open | priors/consultant.md |
| `contacts-sort-contacts` | Sort contacts | consultant | plant ContactsSectionHeader sort | toggle | priors/consultant.md |
| `contacts-sort-imports` | Sort imports | consultant | plant ImportsSectionHeader sort | toggle | priors/consultant.md |
| `ct-ant-source-plant-link` | Source plant link | contact-and-ct-chrome | Ant PrototypeAntApp header | nav | priors/contact-and-ct-chrome.md |
| `ct-desk-tabs` | Consultant / Operator / Contact desk tabs | contact-and-ct-chrome | RegisterClickThroughPanel; Ant PrototypeAntApp Segmented | nav | priors/contact-and-ct-chrome.md |
| `ct-ds-toggle` | DS-I \ | contact-and-ct-chrome | Ant toggle | RegisterClickThroughPanel header | priors/contact-and-ct-chrome.md |
| `ct-journey-prev-next` | Journey Prev / Next / Play | contact-and-ct-chrome | RegisterClickThroughPanel flows mode | nav | priors/contact-and-ct-chrome.md |
| `ct-show-hide-columns` | Show register / Show theory / Hide CT (+ restore dock) | contact-and-ct-chrome | Register shell chrome | toggle | priors/contact-and-ct-chrome.md |
| `ct-theme-switch` | Light / Dark theme switch | contact-and-ct-chrome | Ant PrototypeAntApp Switch; Workspace theme toggle | toggle | priors/contact-and-ct-chrome.md |
| `login-change-email` | Change email | consultant | plant+Ant Login verify step | nav | priors/consultant.md |
| `meetings-brief-close` | Close / toggle Live brief | consultant | plant MeetingsModule Live brief button | nav | priors/consultant.md |
| `meetings-empty-demo` | Empty state / Show booked | consultant | plant+Ant Meetings header | toggle | priors/consultant.md |
| `meetings-list-detail-resize` | Pane resize (Meetings list ↔ detail) | consultant | Ant MeetingsModule Splitter | resize | priors/consultant.md |
| `op-activation-firm-row` | Firms in activation row select | operator-house | plant+Ant ActivationStateModule | open | priors/operator-house.md |
| `op-firm-health-firm-select` | Firm scope select | operator-house | plant+Ant FirmHealthModule | select | priors/operator-house.md |
| `op-gap-edit` | Edit gap / Edit | operator-house | plant+Ant RegisterEvolutionModule | open | priors/operator-house.md |
| `op-hifi-empty-fallback` | HiFi empty module shell | operator-house | plant OperatorPrototypeScene → HiFiEmptyModule | shell | priors/operator-house.md |
| `op-kill-apply` | Apply | operator-house | plant+Ant AcquisitionAds Kill / hold criteria | commit | priors/operator-house.md |
| `op-modal-close` | Modal/drawer Close · Cancel · Back · mask/X dismiss | operator-house | plant+Ant operator modals & drawers | nav | priors/operator-house.md |
| `op-review-confirmation` | Review confirmation | operator-house | plant+Ant FounderAgencyControls Kill-switch | nav | priors/operator-house.md |
| `op-section-house-tenancy-support` | House-global / Per-tenancy / Support section headers | operator-house | plant+Ant Operator sider | nav | priors/operator-house.md |
| `prepared-modal-close` | Close Authorize / Accept modal | consultant | plant+Ant Prepared modals (× / Cancel / backdrop) | nav | priors/consultant.md |

---

## Related

- Systems story: [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md)
- Outcome↔system (module grain): [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md)
- Earlier incomplete bind (module grain only): [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md)
- Priors: [`priors/00-INDEX.md`](./priors/00-INDEX.md)
- Weak: [`weak/00-INDEX.md`](./weak/00-INDEX.md)
