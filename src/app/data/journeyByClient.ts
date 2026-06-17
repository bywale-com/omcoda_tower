import type { JourneyGanttData, JourneyGroup } from "./journeyTree";
import {
  JOURNEY_GANTT_BY_GROUP,
  JOURNEY_SEQUENCES,
  REACTIVATION_SEQUENCE_ID,
  SEQUENCE_ID_ALIASES,
} from "./journeySequences";
import {
  MARCUS_CLIENT_ID,
  MARCUS_GANTT_BY_GROUP,
  MARCUS_JOURNEY_SEQUENCES,
  MARCUS_REACTIVATION_ID,
  MARCUS_SEQUENCE_ALIASES,
} from "./marcusJourney";

export type ClientJourneyBundle = {
  sequences: JourneyGroup[];
  ganttByGroup: Record<string, JourneyGanttData>;
  sequenceIdAliases: Record<string, string>;
  reactivationSequenceId: string;
};

const SARAH_JOURNEY: ClientJourneyBundle = {
  sequences: JOURNEY_SEQUENCES,
  ganttByGroup: JOURNEY_GANTT_BY_GROUP,
  sequenceIdAliases: SEQUENCE_ID_ALIASES,
  reactivationSequenceId: REACTIVATION_SEQUENCE_ID,
};

const MARCUS_JOURNEY: ClientJourneyBundle = {
  sequences: MARCUS_JOURNEY_SEQUENCES,
  ganttByGroup: MARCUS_GANTT_BY_GROUP,
  sequenceIdAliases: MARCUS_SEQUENCE_ALIASES,
  reactivationSequenceId: MARCUS_REACTIVATION_ID,
};

const JOURNEY_BY_CLIENT: Record<string, ClientJourneyBundle> = {
  sarah: SARAH_JOURNEY,
  [MARCUS_CLIENT_ID]: MARCUS_JOURNEY,
};

export function getClientJourney(clientId: string): ClientJourneyBundle {
  return JOURNEY_BY_CLIENT[clientId] ?? SARAH_JOURNEY;
}
