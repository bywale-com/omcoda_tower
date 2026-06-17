import type { JourneyGroup } from "./journeyTree";
import { OPT_IN_GANTT, OPT_IN_TREE, OPT_IN_SEQUENCE_ID } from "./optInLaunchTree";
import { SARAH_NUDGE_GANTT, SARAH_NUDGE_GROUP_ID, SARAH_NUDGE_TREE } from "./sarahNudgeTimeline";
import { REACTIVATION_GANTT, REACTIVATION_SEQUENCE_ID, REACTIVATION_TREE } from "./reactivationTree";

export { OPT_IN_SEQUENCE_ID, REACTIVATION_SEQUENCE_ID };

/** Three peer sequences on one continuous journey — same row style as nudge */
export const JOURNEY_SEQUENCES: JourneyGroup[] = [
  {
    id: OPT_IN_SEQUENCE_ID,
    label: OPT_IN_SEQUENCE_ID,
    defaultOpen: false,
    badgeLetter: "O",
    status: "complete",
    sectionStyle: "historical",
    tree: OPT_IN_TREE,
    touchpoints: [],
  },
  {
    id: SARAH_NUDGE_GROUP_ID,
    label: SARAH_NUDGE_GROUP_ID,
    defaultOpen: true,
    badgeLetter: "N",
    status: "complete",
    sectionStyle: "active",
    tree: SARAH_NUDGE_TREE,
    touchpoints: [],
  },
  {
    id: REACTIVATION_SEQUENCE_ID,
    label: REACTIVATION_SEQUENCE_ID,
    defaultOpen: true,
    badgeLetter: "R",
    status: "armed",
    sectionStyle: "armed",
    tree: REACTIVATION_TREE,
    touchpoints: [],
  },
];

/** Legacy activity-node ids → sequence id (deep-link / board focus) */
export const SEQUENCE_ID_ALIASES: Record<string, string> = {
  "opt-in": OPT_IN_SEQUENCE_ID,
  "nudges": SARAH_NUDGE_GROUP_ID,
  "reactivation": REACTIVATION_SEQUENCE_ID,
};

export const JOURNEY_GANTT_BY_GROUP = {
  [OPT_IN_SEQUENCE_ID]: OPT_IN_GANTT,
  [SARAH_NUDGE_GROUP_ID]: SARAH_NUDGE_GANTT,
  [REACTIVATION_SEQUENCE_ID]: REACTIVATION_GANTT,
};
