import { SME_SEATS as PRACTICE_SME_SEATS, getSmeItem as getPracticeSmeItem, getSmeSeat as getPracticeSmeSeat } from "./sme/index";
import { CAPABILITY_SME_SEATS, getCapabilitySmeItem, getCapabilitySmeSeat } from "./sme/capability";

export {
  CAPABILITY_SME_SEATS,
  getCapabilitySmeItem,
  getCapabilitySmeSeat,
  getPracticeSmeItem,
  getPracticeSmeSeat,
  PRACTICE_SME_SEATS,
};

export const SME_SEATS = [...PRACTICE_SME_SEATS, ...CAPABILITY_SME_SEATS];

export function getSmeSeat(seatId: string) {
  return getPracticeSmeSeat(seatId) ?? getCapabilitySmeSeat(seatId);
}

export function getSmeItem(seatId: string, itemId: string) {
  return getPracticeSmeItem(seatId, itemId) ?? getCapabilitySmeItem(seatId, itemId);
}
