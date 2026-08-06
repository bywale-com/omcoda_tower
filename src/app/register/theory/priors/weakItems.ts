import type { PriorZone, PriorZoneMeta, WeakEntry } from "./types";

/** Full-app weak inventory (lattice foothold; control itself unnamed). */
export const ALL_WEAK_ENTRIES: WeakEntry[] = [
  // —— Consultant (9) ——
  {
    id: "board-accepted-terms",
    zone: "Consultant",
    title: "Accepted terms",
    where: "plant+Ant Board chrome + Client workspace",
    kind: "open",
    latticeFoothold:
      "Accept terms / License acknowledgement / Escrow terms — How consultant-core 2a.2; cons-cant-08",
    notes: "Re-open door; no Title Case click-path for this control",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/BoardPanel.tsx",
        symbol: "BoardPanel",
        locator: "Accepted terms",
      },
      {
        era: "plant",
        file: "src/app/register/prototype/ConsultantClientWorkspace.tsx",
        symbol: "ConsultantClientWorkspace",
        locator: "Accepted terms",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/consultant/ClientWorkspace.tsx",
        symbol: "ClientWorkspace",
        locator: "Accepted terms",
      },
    ],
    purposes: [],
  },
  {
    id: "board-phase-filter",
    zone: "Consultant",
    title: "Phase filter (All / Silent / In motion / Meeting-ready / Halted)",
    where: "plant BoardPanel",
    kind: "toggle",
    latticeFoothold: "Board / Phase signal — How; cons-cant-20 Need",
    notes: "Plant only",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/BoardPanel.tsx",
        symbol: "BoardPanel",
        locator: "Meeting-ready",
      },
    ],
    purposes: [],
  },
  {
    id: "board-newest-first",
    zone: "Consultant",
    title: "Newest first / Oldest first",
    where: "Ant BoardModule Segmented",
    kind: "toggle",
    latticeFoothold: "Furnish cons-furnish-06 Newest first on Engagement record",
    notes: "Ant only; mis-seated Board list sort",
    codeRefs: [
      {
        era: "ant",
        file: "src/app/register/prototype-ant/consultant/BoardModule.tsx",
        symbol: "BoardModule",
        locator: "Newest first",
      },
    ],
    purposes: [],
  },
  {
    id: "board-phase-legend-close",
    zone: "Consultant",
    title: "Close Phase signal legend",
    where: "plant BoardPanel legend panel",
    kind: "nav",
    latticeFoothold: "Furnish cons-furnish-01 Phase signal legend",
    notes: "Open latticed; Close only prose",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/BoardPanel.tsx",
        symbol: "BoardPanel",
        locator: "setLegendOpen(false)",
      },
    ],
    purposes: [],
  },
  {
    id: "contacts-import-file",
    zone: "Consultant",
    title: "Import file…",
    where: "plant CsvImportFlow popover",
    kind: "open",
    latticeFoothold: "Imports — How consultant-core 2a.1; SME crm-02 Land import",
    notes: "Child under Add import Prior host",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/imports/CsvImportFlow.tsx",
        symbol: "CsvImportFlow",
        locator: "Import file…",
      },
    ],
    purposes: [],
  },
  {
    id: "contacts-confirm-import",
    zone: "Consultant",
    title: "Confirm import",
    where: "plant CsvImportColumnMappingDialog",
    kind: "commit",
    latticeFoothold: "Imports / SME crm-02 Land import",
    notes: "Title Case ≠ Land import",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/imports/CsvImportColumnMappingDialog.tsx",
        symbol: "CsvImportColumnMappingDialog",
        locator: "Confirm import",
      },
    ],
    purposes: [],
  },
  {
    id: "ac-why-this-schedule",
    zone: "Consultant",
    title: "Why this schedule / Hide",
    where: "plant JourneyTab ThoughtStrip",
    kind: "toggle",
    latticeFoothold: "Engagement record — How governance 1.1; cons-furnish-06",
    notes: "Distinct from Show reasoning (Prior)",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/JourneyTab.tsx",
        symbol: "ThoughtStrip",
        locator: "Why this schedule",
      },
    ],
    purposes: [],
  },
  {
    id: "ac-tree-expand",
    zone: "Consultant",
    title: "Expand / collapse engagement tree nodes",
    where: "plant JourneyTab + Ant Tree",
    kind: "toggle",
    latticeFoothold: "How Engagement record chronology rows",
    notes: "Tree chrome unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/JourneyTab.tsx",
        symbol: "NudgeChannelHeader",
        locator: "aria-label={hasChildren ? (open ? \"Collapse\" : \"Expand\") : undefined}",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/consultant/ClientWorkspace.tsx",
        symbol: "ClientWorkspace",
        locator: "onExpand",
      },
    ],
    purposes: [],
  },
  {
    id: "ac-tree-select",
    zone: "Consultant",
    title: "Select chronology / tree node",
    where: "plant+Ant Engagement record tree",
    kind: "open",
    latticeFoothold: "How / C2 Engagement record chronology",
    notes: "Selection → inspector",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/JourneyTab.tsx",
        symbol: "NudgeChannelHeader",
        locator: "onInspect",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/consultant/ClientWorkspace.tsx",
        symbol: "ClientWorkspace",
        locator: "onSelect",
      },
    ],
    purposes: [],
  },

  // —— Contact (2) ——
  {
    id: "contact-nudge-form-cta",
    zone: "Contact",
    title: "Open Nudge form",
    where: "plant+Ant Nudge message CEM CTA",
    kind: "open",
    latticeFoothold: "How contact-refresh: Nudge message → Nudge form",
    notes: "Path named; CTA unlabeled as surface",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/ContactPrototypeScene.tsx",
        symbol: "NudgeMessage",
        locator: "Open Nudge form",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/contact/ContactAntScene.tsx",
        symbol: "NudgeMessage",
        locator: "Open Nudge form",
      },
    ],
    purposes: [],
  },
  {
    id: "contact-link-state-continue",
    zone: "Contact",
    title: "Continue",
    where: "plant+Ant Link state (Valid)",
    kind: "open",
    latticeFoothold: "Furnish-10 Link state Valid continues",
    notes: "Parent named; Continue button unlabeled",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/ContactPrototypeScene.tsx",
        symbol: "LinkStatePage",
        locator: "Continue",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/contact/ContactAntScene.tsx",
        symbol: "LinkStatePage",
        locator: "Continue",
      },
    ],
    purposes: [],
  },

  // —— Automations (7) ——
  {
    id: "auto-tab-workflow",
    zone: "Automations",
    title: "Workflow tab",
    where: "Automation editor tabs plant+Ant",
    kind: "tab",
    latticeFoothold: "How Workflow canvas",
    notes: "canvas latticed; tab unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/automation/AutomationWorkflowEditor.tsx",
        symbol: "AutomationWorkflowEditor",
        locator: "label: \"Workflow\"",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx",
        symbol: "AntAutomationWorkbench",
        locator: "label: \"Workflow\"",
      },
    ],
    purposes: [],
  },
  {
    id: "auto-add-trigger",
    zone: "Automations",
    title: "Add trigger",
    where: "Empty canvas / Build Triggers plant+Ant",
    kind: "menu",
    latticeFoothold: "How Trigger nodes · Workflow canvas",
    notes: "add control unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/automation/AutomationAddTriggerMenu.tsx",
        symbol: "AutomationAddTriggerMenu",
        locator: "Add trigger",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx",
        symbol: "AntAutomationWorkbench",
        locator: "createTriggerNode",
      },
    ],
    purposes: [],
  },
  {
    id: "auto-add-block-palette",
    zone: "Automations",
    title: "Add block (palette)",
    where: "Build palette / Ant Build aside",
    kind: "menu",
    latticeFoothold: "How Trigger/Rule/Action nodes",
    notes: "palette add unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/automation/AutomationBuildPalette.tsx",
        symbol: "AutomationBuildPalette",
        locator: "onAddBlock",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx",
        symbol: "AntAutomationWorkbench",
        locator: "createNodeFromBlock",
      },
    ],
    purposes: [],
  },
  {
    id: "auto-node-configure",
    zone: "Automations",
    title: "Open / configure node",
    where: "Workflow canvas node plant+Ant",
    kind: "open",
    latticeFoothold: "How Workflow canvas · nodes",
    notes: "open/configure unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/automation/nodes/TriggerNode.tsx",
        symbol: "TriggerNode",
        locator: "onOpenNodeConfig",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx",
        symbol: "AntAutomationWorkbench",
        locator: "onNodeClick",
      },
    ],
    purposes: [],
  },
  {
    id: "auto-enrollment-open",
    zone: "Automations",
    title: "Open enrollment criteria",
    where: "plant Trigger Enrollment criteria",
    kind: "open",
    latticeFoothold: "How enroll-into-template; SME C1/C2",
    notes: "plant open control unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/automation/nodes/TriggerNode.tsx",
        symbol: "TriggerNode",
        locator: "Enrollment criteria",
      },
    ],
    purposes: [],
  },
  {
    id: "cfg-compare-ab",
    zone: "Automations",
    title: "Version A / B pickers",
    where: "Compare versions modal plant+Ant",
    kind: "select",
    latticeFoothold: "Enrichment op-cant-18 Compare versions",
    notes: "A/B pickers unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/operator/ConfigurationLibrariesPanel.tsx",
        symbol: "ConfigurationLibrariesPanel",
        locator: "Version A",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx",
        symbol: "ConfigurationLibrariesModule",
        locator: "compareA",
      },
    ],
    purposes: [],
  },
  {
    id: "eval-pack-name",
    zone: "Automations",
    title: "Pack name field",
    where: "Evaluation pack editor plant+Ant",
    kind: "commit",
    latticeFoothold: "How Evaluation pack editor",
    notes: "rename field unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/operator/ConfigurationLibrariesPanel.tsx",
        symbol: "ConfigurationLibrariesPanel",
        locator: "Pack name",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx",
        symbol: "ConfigurationLibrariesModule",
        locator: "Pack name",
      },
    ],
    purposes: [],
  },

  // —— Agents (7) ——
  {
    id: "ag-tab-editor",
    zone: "Agents",
    title: "Editor tab",
    where: "Agent editor tabs plant+Ant",
    kind: "tab",
    latticeFoothold: "How Agent / sequence editor · Step rail",
    notes: "tab unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/agent/AgentEditor.tsx",
        symbol: "AgentEditor",
        locator: "useState<AgentEditorTab>(\"editor\")",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx",
        symbol: "AntAgentWorkbench",
        locator: "useState<AgentEditorTab>(\"editor\")",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-tab-settings",
    zone: "Agents",
    title: "Settings tab",
    where: "Agent editor tabs plant+Ant",
    kind: "tab",
    latticeFoothold: "Step rail / C2 channel-ruleset authorship",
    notes: "Settings unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/agent/AgentEditor.tsx",
        symbol: "AgentEditor",
        locator: "case \"settings\":",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx",
        symbol: "AntAgentWorkbench",
        locator: "settings:",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-add-step",
    zone: "Agents",
    title: "Add a step",
    where: "plant step rail + canvas insert",
    kind: "menu",
    latticeFoothold: "How Step rail / Sequence canvas",
    notes: "menu label unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/agent/AgentAddStepMenu.tsx",
        symbol: "AgentAddStepMenu",
        locator: "Add a step",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-add-email",
    zone: "Agents",
    title: "Add email",
    where: "plant Add-a-step; Ant toolbar Email",
    kind: "commit",
    latticeFoothold: "How Step rail",
    notes: "add-email unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/data/agentDefinitions.ts",
        symbol: "AGENT_STEP_TYPES",
        locator: "label: \"Email\"",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx",
        symbol: "AntAgentWorkbench",
        locator: "Add email",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-add-consultant-task",
    zone: "Agents",
    title: "Add consultant task",
    where: "plant Add-a-step; Ant toolbar Task",
    kind: "commit",
    latticeFoothold: "How Step rail",
    notes: "add-task unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/data/agentDefinitions.ts",
        symbol: "AGENT_STEP_TYPES",
        locator: "label: \"Task\"",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx",
        symbol: "AntAgentWorkbench",
        locator: "Add consultant task",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-toggle-step-rail",
    zone: "Agents",
    title: "Collapse / expand step rail",
    where: "plant AgentEditor step toolbar",
    kind: "toggle",
    latticeFoothold: "How Step rail",
    notes: "show/hide chrome unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/agent/AgentEditor.tsx",
        symbol: "AgentEditor",
        locator: "Collapse step rail",
      },
    ],
    purposes: [],
  },
  {
    id: "ag-select-step",
    zone: "Agents",
    title: "Select step on canvas / rail",
    where: "plant sequence canvas + step rail",
    kind: "open",
    latticeFoothold: "How Step rail / Sequence canvas",
    notes: "selection chrome unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/agent/AgentStepRail.tsx",
        symbol: "AgentStepRail",
        locator: "onSelectStep",
      },
    ],
    purposes: [],
  },

  // —— Audits (1) ——
  {
    id: "au-run-checks-all",
    zone: "Audits",
    title: "Run checks (select all)",
    where: "plant Audit run services",
    kind: "checkbox",
    latticeFoothold: "How Audit run checkboxes",
    notes: "select-all unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/components/hub/AuditServicesPanel.tsx",
        symbol: "AuditServicesPanel",
        locator: "audit-check-all",
      },
    ],
    purposes: [],
  },

  // —— Operator house (6) ——
  {
    id: "op-module-nav",
    zone: "Operator house",
    title: "Operator module sider nav",
    where: "plant+Ant Operator sider Menu",
    kind: "nav",
    latticeFoothold: "How Starting-from each Module",
    notes: "sider chrome unnamed",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/OperatorPrototypeScene.tsx",
        symbol: "OperatorPrototypeScene",
        locator: "House-global",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/OperatorAntScene.tsx",
        symbol: "OperatorAntScene",
        locator: "House-global",
      },
    ],
    purposes: [],
  },
  {
    id: "op-ads-save-draft",
    zone: "Operator house",
    title: "Save draft (campaign)",
    where: "plant+Ant AcquisitionAds campaign editor",
    kind: "commit",
    latticeFoothold: "How Save / Publish campaign",
    notes: "secondary draft save",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/operator/AcquisitionAdsModule.tsx",
        symbol: "AcquisitionAdsModule",
        locator: "Saved draft",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AcquisitionAdsModule.tsx",
        symbol: "AcquisitionAdsModule",
        locator: "Saved draft",
      },
    ],
    purposes: [],
  },
  {
    id: "op-ads-staging-queue",
    zone: "Operator house",
    title: "Staging queue",
    where: "plant+Ant AcquisitionAds",
    kind: "nav",
    latticeFoothold: "Furnish Waiting-for-hydrate → In-flight",
    notes: "card title not lattice Title Case",
    codeRefs: [
      {
        era: "plant",
        file: "src/app/register/prototype/operator/AcquisitionAdsModule.tsx",
        symbol: "AcquisitionAdsModule",
        locator: "Staging queue",
      },
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/AcquisitionAdsModule.tsx",
        symbol: "AcquisitionAdsModule",
        locator: "Staging queue",
      },
    ],
    purposes: [],
  },
  {
    id: "op-activation-firm-link",
    zone: "Operator house",
    title: "Firm name link → Forward-deploy drawer",
    where: "Ant ActivationForwardDeploy table",
    kind: "open",
    latticeFoothold: "How In-flight firm row · Forward-deploy",
    notes: "unnamed firm link",
    codeRefs: [
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/ActivationForwardDeployModule.tsx",
        symbol: "ActivationForwardDeployModule",
        locator: "type=\"link\"",
      },
    ],
    purposes: [],
  },
  {
    id: "op-activation-row-radio",
    zone: "Operator house",
    title: "In-flight radio select",
    where: "Ant ActivationForwardDeploy Table",
    kind: "select",
    latticeFoothold: "How In-flight activations · firm row",
    notes: "selection chrome",
    codeRefs: [
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/ActivationForwardDeployModule.tsx",
        symbol: "ActivationForwardDeployModule",
        locator: "type: \"radio\"",
      },
    ],
    purposes: [],
  },
  {
    id: "op-commercial-instrument-radio",
    zone: "Operator house",
    title: "Instrument list radio select",
    where: "Ant CommercialModule instrument Table",
    kind: "select",
    latticeFoothold: "How Instrument list / firm row",
    notes: "selection chrome",
    codeRefs: [
      {
        era: "ant",
        file: "src/app/register/prototype-ant/operator/CommercialModule.tsx",
        symbol: "CommercialModule",
        locator: "Instrument list / firm row",
      },
    ],
    purposes: [],
  },
];

/** Left-tree zone order for the Weak pass (no Global CT chrome weaks). */
export const WEAK_ZONE_ORDER: PriorZone[] = [
  "Consultant",
  "Contact",
  "Automations",
  "Agents",
  "Audits",
  "Operator house",
];

export function getWeaksForZone(zone: PriorZone): WeakEntry[] {
  return ALL_WEAK_ENTRIES.filter((entry) => entry.zone === zone);
}

export function getWeakEntry(id: string): WeakEntry | undefined {
  return ALL_WEAK_ENTRIES.find((entry) => entry.id === id);
}

export const WEAK_ZONES: PriorZoneMeta[] = WEAK_ZONE_ORDER.map((id) => ({
  id,
  label: id,
  count: getWeaksForZone(id).length,
}));
