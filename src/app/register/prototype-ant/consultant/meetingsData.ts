export type {
  LiveBriefFact,
  StoredMeeting as LiveBriefMeeting,
  TodayMeetingChip,
} from "../../prototype/shared/meetingsStore";
export {
  getMeetings,
  useMeetings,
  selectConsultantTodayMeetings,
  selectMeetingReadyClientIds,
  subscribeMeetings,
  addMeeting,
  confirmContactBooking,
  hydrateFactsFromMachine,
  mergeFactsPreferMachine,
} from "../../prototype/shared/meetingsStore";

import {
  getMeetings,
  selectConsultantTodayMeetings,
  selectMeetingReadyClientIds,
} from "../../prototype/shared/meetingsStore";

/** @deprecated Prefer useMeetings() — snapshot for non-reactive reads. */
export const DEMO_MEETINGS = getMeetings();

export const CONSULTANT_TODAY_MEETINGS = selectConsultantTodayMeetings(getMeetings());

export const MEETING_READY_CLIENT_IDS = selectMeetingReadyClientIds(getMeetings());
