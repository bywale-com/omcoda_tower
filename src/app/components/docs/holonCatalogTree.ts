/**
 * Static holon catalog — mirrors Console Panels registry when the app shell is not mounted.
 * Keep in sync when adding new HolonBoundary registrations in the product UI.
 */
import type { ContentChildHolon } from "./clientDataHolons";
import {
  CLIENT_DATA_OPEN_TAB_HOLON,
  CLIENT_DATA_TAB_HOLONS,
  PANEL_CHIPS,
  tabHolonId,
} from "./clientDataHolons";
import {
  CLIENT_NAME_HOLON,
  CLIENT_ROW_HOLON,
  PHASE_SIGNAL_HOLON,
  ROW_ACTIONS_HOLON,
  TASK_LABEL_HOLON,
  TASK_META_HOLON,
  TASK_ROW_HOLON,
  TASK_STATUS_TOGGLE_HOLON,
  TASKS_SECTION_HOLON,
} from "./boardBodyHolons";
import {
  ADD_IMPORT_CONTROL_HOLON,
  CONTACT_ROW_HOLON,
  CONTACTS_BODY_HOLON,
  IMPORT_ROW_HOLON,
  IMPORTS_SECTION_HOLON,
} from "./contactsBodyHolons";
import {
  DOCS_HOME_BRANCH_HOLON,
  DOCS_PANELS_BRANCH_HOLON,
  DOCS_REGISTRY_HOLON,
  DOCS_OUTLINE_ROW_HOLON,
  DOCS_OUTLINE_ROW_CHILD_HOLONS,
} from "./docsRegistryHolons";
import {
  AGENT_ADD_STEP_HOLON,
  AGENT_CONTACTS_TAB_HOLON,
  AGENT_EDITOR_HOLON,
  AGENT_EDITOR_TAB_HOLON,
  AGENT_EDITOR_TABS_HOLON,
  AGENT_EMPTY_STATE_HOLON,
  AGENT_HEADER_ACTIONS_HOLON,
  AGENT_SEQUENCE_CANVAS_CHILD_HOLONS,
  AGENT_SEQUENCE_CANVAS_HOLON,
  AGENT_SETTINGS_TAB_HOLON,
  AGENT_STEP_RAIL_HOLON,
  AGENT_STEP_TOOLBAR_HOLON,
  AGENT_ACTIVITY_TAB_HOLON,
  AGENT_REPORT_TAB_HOLON,
} from "./agentHolons";
import {
  AUTOMATION_BUILD_PALETTE_HOLON,
  AUTOMATION_CANVAS_CHILD_HOLONS,
  AUTOMATION_EDITOR_TAB_HOLONS,
  AUTOMATION_EDITOR_TABS_HOLON,
  AUTOMATION_SETTINGS_TAB_HOLON,
  AUTOMATION_WORKFLOW_ACTIONS_HOLON,
  AUTOMATION_WORKFLOW_CANVAS_HOLON,
  AUTOMATION_WORKFLOW_EDITOR_HOLON,
  AUTOMATION_WORKFLOW_TAB_HOLON,
} from "./automationHolons";
import {
  AGENT_ROW_HOLON,
  AUDIT_ROW_HOLON,
  AUDITS_SECTION_HOLON,
  AUTOMATION_ROW_HOLON,
  AGENTS_SECTION_HOLON,
  AUTOMATIONS_SECTION_HOLON,
  HUB_BODY_HOLON,
} from "./hubBodyHolons";
import {
  LOGIN_FORM_HOLON,
  LOGIN_FORM_CHILD_HOLONS,
} from "./loginHolons";
import { SHELL_HOLON_ORDER } from "./shellHolonOrder";

const LOGIN_FORM_TREE: ContentChildHolon = {
  ...LOGIN_FORM_HOLON,
  children: LOGIN_FORM_CHILD_HOLONS,
};

function shellHolon(
  id: keyof typeof SHELL_HOLON_ORDER,
  label: string,
  icon: ContentChildHolon["icon"],
  children?: ContentChildHolon[],
): ContentChildHolon {
  return {
    id,
    label,
    icon,
    order: SHELL_HOLON_ORDER[id],
    children,
  };
}

const CLIENT_ROW_TREE: ContentChildHolon = {
  ...CLIENT_ROW_HOLON,
  children: [PHASE_SIGNAL_HOLON, CLIENT_NAME_HOLON, ROW_ACTIONS_HOLON],
};

const TASK_ROW_TREE: ContentChildHolon = {
  ...TASK_ROW_HOLON,
  children: [TASK_STATUS_TOGGLE_HOLON, TASK_LABEL_HOLON, TASK_META_HOLON],
};

const IMPORTS_SECTION_TREE: ContentChildHolon = {
  ...IMPORTS_SECTION_HOLON,
  children: [ADD_IMPORT_CONTROL_HOLON, IMPORT_ROW_HOLON],
};

const AGENT_EDITOR_TREE: ContentChildHolon = {
  ...AGENT_EDITOR_HOLON,
  children: [
    AGENT_HEADER_ACTIONS_HOLON,
    {
      ...AGENT_EDITOR_TABS_HOLON,
      children: [
        AGENT_EDITOR_TAB_HOLON,
        AGENT_CONTACTS_TAB_HOLON,
        AGENT_ACTIVITY_TAB_HOLON,
        AGENT_REPORT_TAB_HOLON,
        AGENT_SETTINGS_TAB_HOLON,
      ],
    },
    AGENT_STEP_TOOLBAR_HOLON,
    { ...AGENT_EMPTY_STATE_HOLON, children: [AGENT_ADD_STEP_HOLON] },
    AGENT_STEP_RAIL_HOLON,
    { ...AGENT_SEQUENCE_CANVAS_HOLON, children: AGENT_SEQUENCE_CANVAS_CHILD_HOLONS },
  ],
};

const AUTOMATION_EDITOR_TREE: ContentChildHolon = {
  ...AUTOMATION_WORKFLOW_EDITOR_HOLON,
  children: [
    AUTOMATION_WORKFLOW_ACTIONS_HOLON,
    {
      ...AUTOMATION_EDITOR_TABS_HOLON,
      children: [...AUTOMATION_EDITOR_TAB_HOLONS],
    },
    { ...AUTOMATION_WORKFLOW_CANVAS_HOLON, children: AUTOMATION_CANVAS_CHILD_HOLONS },
    AUTOMATION_BUILD_PALETTE_HOLON,
  ],
};

const DATA_PANEL_TAB_TREES: ContentChildHolon[] = PANEL_CHIPS.map((chip) => {
  const meta = CLIENT_DATA_TAB_HOLONS[chip.id];
  const content = meta.content;
  return {
    id: tabHolonId(chip.id),
    label: chip.label,
    icon: meta.icon,
    order: meta.order,
    children: content.children
      ? [{ ...content, children: content.children }]
      : [{ id: content.id, label: content.label, icon: content.icon, order: 0 }],
  };
});

/** Holon ids for Console chrome — hidden under Components in /register, still in catalog. */
export const CONSOLE_CHROME_HOLON_IDS = new Set([
  "docs-header",
  "docs-registry",
  "docs-home-branch",
  "docs-panels-branch",
  DOCS_OUTLINE_ROW_HOLON.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.name.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.inViewIndicator.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.rowActions.id,
]);

export const HOLON_CATALOG_ROOTS: ContentChildHolon[] = [
  LOGIN_FORM_TREE,
  shellHolon("primary-navigation", "Primary Navigation", "compass"),
  shellHolon("clients-section", "Clients Section", "people"),
  shellHolon("board-body", "Board Body", "list-bullet", [CLIENT_ROW_TREE]),
  { ...TASKS_SECTION_HOLON, order: SHELL_HOLON_ORDER["tasks-section"], children: [TASK_ROW_TREE] },
  shellHolon("contacts-section", "Contacts Section", "user-squares"),
  { ...CONTACTS_BODY_HOLON, order: SHELL_HOLON_ORDER["contacts-body"], children: [
    CONTACT_ROW_HOLON,
    IMPORTS_SECTION_TREE,
    IMPORT_ROW_HOLON,
  ]},
  shellHolon("hub-body", "Hub Body", "compass", [
    AUDITS_SECTION_HOLON,
    AUDIT_ROW_HOLON,
    AGENTS_SECTION_HOLON,
    AGENT_ROW_HOLON,
    AUTOMATIONS_SECTION_HOLON,
    AUTOMATION_ROW_HOLON,
  ]),
  shellHolon("tab-bar", "Tab Bar", "list-bullet"),
  shellHolon("workspace-tab", "Workspace Tab", "document"),
  shellHolon("breadcrumb", "Breadcrumb", "directional-sign"),
  shellHolon("workspace-empty", "Workspace Empty", "document"),
  shellHolon("client-header", "Client Header", "user"),
  shellHolon("client-brief", "Client Brief", "document"),
  shellHolon("contact-header", "Contact Header", "user"),
  shellHolon("contact-record", "Contact Record", "checkmark-list"),
  shellHolon("hub-tool-header", "Hub Tool Header", "compass"),
  shellHolon("hub-tool-body", "Hub Tool Body", "list-bullet", [
    AGENT_EDITOR_TREE,
    AUTOMATION_EDITOR_TREE,
  ]),
  shellHolon("data-panel-header", "Client Data Header", "information-circle", [
    CLIENT_DATA_OPEN_TAB_HOLON,
    ...DATA_PANEL_TAB_TREES,
  ]),
  shellHolon("status-bar", "Status Bar", "information-circle"),
  shellHolon("holon-detail-header", "Holon Detail Header", "document"),
  shellHolon("holon-detail-body", "Holon Detail Body", "list-bullet"),
  shellHolon("docs-header", "Console Header", "document"),
  {
    ...DOCS_REGISTRY_HOLON,
    order: SHELL_HOLON_ORDER["docs-registry"],
    children: [
      DOCS_HOME_BRANCH_HOLON,
      DOCS_PANELS_BRANCH_HOLON,
      {
        ...DOCS_OUTLINE_ROW_HOLON,
        children: Object.values(DOCS_OUTLINE_ROW_CHILD_HOLONS),
      },
    ],
  },
];
