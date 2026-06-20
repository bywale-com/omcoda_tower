import type { HolonId } from "../../context/DocsHighlightContext";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import {
  AUTOMATION_BUILD_PALETTE_HOLON,
  AUTOMATION_EDITOR_TABS_HOLON,
  AUTOMATION_ENROLLMENT_TAB_HOLON,
  AUTOMATION_SETTINGS_TAB_HOLON,
  AUTOMATION_WORKFLOW_ACTIONS_HOLON,
  AUTOMATION_WORKFLOW_CANVAS_HOLON,
  AUTOMATION_WORKFLOW_EDITOR_HOLON,
  AUTOMATION_WORKFLOW_TAB_HOLON,
} from "./automationHolons";
import {
  AGENT_ACTIVITY_TAB_HOLON,
  AGENT_ADD_STEP_HOLON,
  AGENT_CONTACTS_TAB_HOLON,
  AGENT_EDITOR_HOLON,
  AGENT_EDITOR_TABS_HOLON,
  AGENT_EDITOR_TAB_HOLON,
  AGENT_EMPTY_STATE_HOLON,
  AGENT_HEADER_ACTIONS_HOLON,
  AGENT_REPORT_TAB_HOLON,
  AGENT_SEQUENCE_CANVAS_HOLON,
  AGENT_SETTINGS_TAB_HOLON,
  AGENT_STEP_CONDITION_HOLON,
  AGENT_STEP_NODE_PATTERN_HOLONS,
  AGENT_STEP_RAIL_HOLON,
  AGENT_STEP_TOOLBAR_HOLON,
} from "./agentHolons";
import {
  ENGAGEMENT_ATTEMPT_ROW_HOLON,
  ENGAGEMENT_CHANNEL_ROW_HOLON,
  ENGAGEMENT_EVENT_ROW_HOLON,
  ENGAGEMENT_ESCALATION_ROW_HOLON,
  ENGAGEMENT_FORM_VISIT_ROW_HOLON,
  ENGAGEMENT_SEQUENCE_ROW_HOLON,
} from "./engagementListHolons";
import { ENGAGEMENT_SEQUENCE_BAR_HOLON } from "./engagementTimelineHolons";
import { CLIENT_DATA_TAB_HOLONS, ENGAGEMENT_LIST_HOLON } from "./clientDataHolons";

export type HolonDetailLink = {
  id: HolonId;
  label: string;
};

export type HolonDetailSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: HolonDetailLink[];
};

export type HolonDetailContent = {
  id: HolonId;
  label: string;
  icon: NotionIconName;
  summary: string;
  sections: HolonDetailSection[];
};

const ENGAGEMENT_CHART = CLIENT_DATA_TAB_HOLONS.logs.content;
const ENGAGEMENT_LIST = ENGAGEMENT_LIST_HOLON;

export const HOLON_DETAIL_CONTENT: Partial<Record<HolonId, HolonDetailContent>> = {
  [ENGAGEMENT_SEQUENCE_ROW_HOLON.id]: {
    id: ENGAGEMENT_SEQUENCE_ROW_HOLON.id,
    label: ENGAGEMENT_SEQUENCE_ROW_HOLON.label,
    icon: ENGAGEMENT_SEQUENCE_ROW_HOLON.icon,
    summary:
      "One row per nudge sequence in the engagement list — the top anchor for a sequence’s tree and its matching timeline lane.",
    sections: [
      {
        title: "Role",
        paragraphs: [
          "Sequence Row is the collapsible header for a single nudge sequence (e.g. 00f-optin-001-sarah-j). It names the sequence, shows its step badge, and toggles whether the attempt/channel/event tree beneath it is visible.",
        ],
      },
      {
        title: "How derived",
        paragraphs: [
          "Each row is emitted once per NudgeGroup when buildRows walks the client’s journey sequences. The live surface is NudgeGroupHeader — one pattern holon, many instances when multiple sequences are on screen.",
        ],
        links: [
          { id: ENGAGEMENT_LIST.id, label: ENGAGEMENT_LIST.label },
          { id: ENGAGEMENT_CHART.id, label: ENGAGEMENT_CHART.label },
        ],
      },
      {
        title: "What it enables",
        bullets: [
          "Expanding a sequence row renders its nested attempt, channel, form visit, event, and escalation rows in the list.",
          "The same sequence id drives a Sequence Bar in the engagement timeline — list row and gantt lane stay aligned.",
          "Collapse hides downstream row types from both the list and their in-view indicators in Console.",
        ],
        links: [
          { id: ENGAGEMENT_ATTEMPT_ROW_HOLON.id, label: ENGAGEMENT_ATTEMPT_ROW_HOLON.label },
          { id: ENGAGEMENT_CHANNEL_ROW_HOLON.id, label: ENGAGEMENT_CHANNEL_ROW_HOLON.label },
          { id: ENGAGEMENT_FORM_VISIT_ROW_HOLON.id, label: ENGAGEMENT_FORM_VISIT_ROW_HOLON.label },
          { id: ENGAGEMENT_EVENT_ROW_HOLON.id, label: ENGAGEMENT_EVENT_ROW_HOLON.label },
          { id: ENGAGEMENT_ESCALATION_ROW_HOLON.id, label: ENGAGEMENT_ESCALATION_ROW_HOLON.label },
          { id: ENGAGEMENT_SEQUENCE_BAR_HOLON.id, label: ENGAGEMENT_SEQUENCE_BAR_HOLON.label },
        ],
      },
    ],
  },
  [AUTOMATION_WORKFLOW_EDITOR_HOLON.id]: {
    id: AUTOMATION_WORKFLOW_EDITOR_HOLON.id,
    label: AUTOMATION_WORKFLOW_EDITOR_HOLON.label,
    icon: AUTOMATION_WORKFLOW_EDITOR_HOLON.icon,
    summary:
      "The automation workflow editor — tabbed surface for building trigger → filter → action flows on a React Flow canvas.",
    sections: [
      {
        title: "Role",
        paragraphs: [
          "Workflow Editor is the main body when a Hub automation is open. It hosts editor tabs, the workflow canvas, and the build palette for adding blocks.",
        ],
        links: [
          { id: AUTOMATION_WORKFLOW_ACTIONS_HOLON.id, label: AUTOMATION_WORKFLOW_ACTIONS_HOLON.label },
          { id: AUTOMATION_EDITOR_TABS_HOLON.id, label: AUTOMATION_EDITOR_TABS_HOLON.label },
        ],
      },
      {
        title: "What it enables",
        bullets: [
          "Workflow tab — drag nodes, insert steps on edges, duplicate/delete from node toolbars.",
          "Settings and Enrollment tabs — placeholder surfaces for workflow metadata and entry criteria.",
          "Build palette — drop unconnected blocks; edge + controls wire blocks into the chain.",
        ],
        links: [
          { id: AUTOMATION_WORKFLOW_TAB_HOLON.id, label: AUTOMATION_WORKFLOW_TAB_HOLON.label },
          { id: AUTOMATION_WORKFLOW_CANVAS_HOLON.id, label: AUTOMATION_WORKFLOW_CANVAS_HOLON.label },
          { id: AUTOMATION_BUILD_PALETTE_HOLON.id, label: AUTOMATION_BUILD_PALETTE_HOLON.label },
          { id: AUTOMATION_SETTINGS_TAB_HOLON.id, label: AUTOMATION_SETTINGS_TAB_HOLON.label },
          { id: AUTOMATION_ENROLLMENT_TAB_HOLON.id, label: AUTOMATION_ENROLLMENT_TAB_HOLON.label },
        ],
      },
    ],
  },
  [AGENT_EDITOR_HOLON.id]: {
    id: AGENT_EDITOR_HOLON.id,
    label: AGENT_EDITOR_HOLON.label,
    icon: AGENT_EDITOR_HOLON.icon,
    summary:
      "The agent editor — where sequencing steps, channel rulesets, and attempt logic are composed before enrollment via Automations.",
    sections: [
      {
        title: "Role",
        paragraphs: [
          "Agent Editor is the main body when a Hub agent is open. Agents define how Tower reaches contacts across channels — escalation rules, wait windows, and step order.",
        ],
        links: [
          { id: AGENT_HEADER_ACTIONS_HOLON.id, label: AGENT_HEADER_ACTIONS_HOLON.label },
          { id: AGENT_EDITOR_TABS_HOLON.id, label: AGENT_EDITOR_TABS_HOLON.label },
        ],
      },
      {
        title: "What it enables",
        bullets: [
          "Editor tab — vertical sequence canvas with email and task step nodes.",
          "Step rail — collapsible navigator with embedded condition nodes per step.",
          "Contacts, Activity, Report — operational surfaces for enrolled contacts and outcomes.",
          "Settings — channel rulesets, global limits, schedule windows, attempt logic.",
          "Launch agent and linked-automations controls in the header.",
        ],
        links: [
          { id: AGENT_EDITOR_TAB_HOLON.id, label: AGENT_EDITOR_TAB_HOLON.label },
          { id: AGENT_STEP_TOOLBAR_HOLON.id, label: AGENT_STEP_TOOLBAR_HOLON.label },
          { id: AGENT_EMPTY_STATE_HOLON.id, label: AGENT_EMPTY_STATE_HOLON.label },
          { id: AGENT_STEP_RAIL_HOLON.id, label: AGENT_STEP_RAIL_HOLON.label },
          { id: AGENT_SEQUENCE_CANVAS_HOLON.id, label: AGENT_SEQUENCE_CANVAS_HOLON.label },
          { id: AGENT_CONTACTS_TAB_HOLON.id, label: AGENT_CONTACTS_TAB_HOLON.label },
          { id: AGENT_ACTIVITY_TAB_HOLON.id, label: AGENT_ACTIVITY_TAB_HOLON.label },
          { id: AGENT_REPORT_TAB_HOLON.id, label: AGENT_REPORT_TAB_HOLON.label },
          { id: AGENT_SETTINGS_TAB_HOLON.id, label: AGENT_SETTINGS_TAB_HOLON.label },
          { id: AGENT_STEP_NODE_PATTERN_HOLONS.email.id, label: AGENT_STEP_NODE_PATTERN_HOLONS.email.label },
          { id: AGENT_STEP_NODE_PATTERN_HOLONS.task.id, label: AGENT_STEP_NODE_PATTERN_HOLONS.task.label },
          { id: AGENT_STEP_CONDITION_HOLON.id, label: AGENT_STEP_CONDITION_HOLON.label },
          { id: AGENT_ADD_STEP_HOLON.id, label: AGENT_ADD_STEP_HOLON.label },
        ],
      },
    ],
  },
};

export function getHolonDetailContent(id: HolonId): HolonDetailContent | null {
  return HOLON_DETAIL_CONTENT[id] ?? null;
}
