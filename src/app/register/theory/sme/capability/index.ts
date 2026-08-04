import type { SmeSeat } from "../../types";
import { seat as cap01 } from "./seats/C1-email-deliverability";
import { seat as cap02 } from "./seats/C2-agentic-engagement-runtime";
import { seat as cap03 } from "./seats/C3-eligibility-reference-pipeline";
import { seat as cap04 } from "./seats/C4-book-ingestion-identity";
import { seat as cap05 } from "./seats/C5-forward-deploy-generation";
import { seat as cap06 } from "./seats/C6-escrow-payment-mechanics";
import { seat as cap07 } from "./seats/C7-instrumentation-analytics";

/** Capability-axis SME seats — auto-generated; do not edit by hand. */
export const CAPABILITY_SME_SEATS: SmeSeat[] = [
  cap01,
  cap02,
  cap03,
  cap04,
  cap05,
  cap06,
  cap07,
];

export function getCapabilitySmeSeat(seatId: string): SmeSeat | undefined {
  return CAPABILITY_SME_SEATS.find((seat) => seat.id === seatId);
}

export function getCapabilitySmeItem(seatId: string, itemId: string) {
  const seat = getCapabilitySmeSeat(seatId);
  return seat?.items.find((item) => item.id === itemId);
}
