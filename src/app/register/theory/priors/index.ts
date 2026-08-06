export type {
  PriorEntry,
  PriorKind,
  PriorMark,
  PriorModule,
  PriorZoneMeta,
} from "./types";
export { AUTOMATIONS_PRIORS } from "./automations";
export {
  ACTIVITY_PRIORS,
  AGENTS_AUDITS_ACTIVITY_PRIORS,
  AGENTS_PRIORS,
  AUDITS_PRIORS,
} from "./agentsAuditsActivity";
export {
  BOARD_PRIORS,
  CONTACT_DESK_PRIORS,
  CONTACTS_PRIORS,
  DESK_ZONE_PRIORS,
  GLOBAL_CT_PRIORS,
  LOGIN_PRIORS,
  MEETINGS_PRIORS,
  OPERATOR_ZONE_PRIORS,
  PREPARED_PRIORS,
} from "./deskZones";

import type { PriorEntry, PriorMark, PriorModule, PriorZoneMeta } from "./types";
import { AUTOMATIONS_PRIORS } from "./automations";
import {
  ACTIVITY_PRIORS,
  AGENTS_PRIORS,
  AUDITS_PRIORS,
} from "./agentsAuditsActivity";
import {
  BOARD_PRIORS,
  CONTACT_DESK_PRIORS,
  CONTACTS_PRIORS,
  GLOBAL_CT_PRIORS,
  LOGIN_PRIORS,
  MEETINGS_PRIORS,
  OPERATOR_ZONE_PRIORS,
  PREPARED_PRIORS,
} from "./deskZones";

/** Left-tree zone order for the Priors pass. */
export const PRIOR_ZONE_ORDER: PriorModule[] = [
  "Automations",
  "Agents",
  "Audits",
  "Activity",
  "Board",
  "Contacts",
  "Meetings",
  "Prepared",
  "Login",
  "Contact desk",
  "Operator",
  "Global CT chrome",
];

export const ALL_PRIOR_ENTRIES: PriorEntry[] = [
  ...AUTOMATIONS_PRIORS,
  ...AGENTS_PRIORS,
  ...AUDITS_PRIORS,
  ...ACTIVITY_PRIORS,
  ...BOARD_PRIORS,
  ...CONTACTS_PRIORS,
  ...MEETINGS_PRIORS,
  ...PREPARED_PRIORS,
  ...LOGIN_PRIORS,
  ...CONTACT_DESK_PRIORS,
  ...OPERATOR_ZONE_PRIORS,
  ...GLOBAL_CT_PRIORS,
];

export function getPriorsForModule(module: PriorModule): PriorEntry[] {
  return ALL_PRIOR_ENTRIES.filter((entry) => entry.module === module);
}

export function getPriorEntry(id: string): PriorEntry | undefined {
  return ALL_PRIOR_ENTRIES.find((entry) => entry.id === id);
}

export function countPriorsByMark(mark: PriorMark): number {
  return ALL_PRIOR_ENTRIES.filter((entry) => entry.mark === mark).length;
}

export const PRIOR_ZONES: PriorZoneMeta[] = PRIOR_ZONE_ORDER.map((id) => ({
  id,
  label: id,
  count: getPriorsForModule(id).length,
}));
