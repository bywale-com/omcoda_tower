import type { SmeSeat } from "../types";
import { seat as seat01 } from "./seats/01-immigration-pathway-eligibility";
import { seat as seat02 } from "./seats/02-ircc-reference-data";
import { seat as seat03 } from "./seats/03-canadian-privacy-casl";
import { seat as seat04 } from "./seats/04-consultancy-desk-ops";
import { seat as seat05 } from "./seats/05-platform-ads-meta-trust";
import { seat as seat06 } from "./seats/06-payments-escrow";
import { seat as seat07 } from "./seats/07-consultancy-crm-book-connect";
import { CAPABILITY_SME_SEATS } from "./capability";

/** Practice-axis SME seats (Pass2 + PM implementation). */
export const PRACTICE_SME_SEATS: SmeSeat[] = [
  seat01,
  seat02,
  seat03,
  seat04,
  seat05,
  seat06,
  seat07,
];

/** All SME seats — practice first, then capability (paper twins). */
export const SME_SEATS: SmeSeat[] = [...PRACTICE_SME_SEATS, ...CAPABILITY_SME_SEATS];

export { CAPABILITY_SME_SEATS };

export function getSmeSeat(seatId: string): SmeSeat | undefined {
  return SME_SEATS.find((seat) => seat.id === seatId);
}

export function getSmeItem(seatId: string, itemId: string) {
  const seat = getSmeSeat(seatId);
  return seat?.items.find((item) => item.id === itemId);
}
