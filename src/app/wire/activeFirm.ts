/**
 * Session firm for CT surfaces — never default to demo Cedar for a real session.
 * Seed/demo labels stay in demoIds.ts; call sites that hit the wire use this.
 */
import { getActiveFirmId, peekActiveFirmId } from "./sessionFirm";
import { CT_DEMO } from "./demoIds";

/** Firm for machine/wire calls. Throws if no session firm (fail closed). */
export function wireFirmId(): string {
  return getActiveFirmId();
}

/**
 * Firm for UI that must show something before login.
 * Prefer session; only fall back to seed demo when no session is bound.
 */
export function displayFirmId(): string {
  return peekActiveFirmId() ?? CT_DEMO.firmId;
}
