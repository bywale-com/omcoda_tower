import { isFixturePresent } from "../fixtures/store";
import type { StandInTag } from "../ports";
import { standInConsentSilence } from "./consentSilence";

/**
 * Modelable SMS API — Canadian path.
 * A2P 10DLC / TCR is US-only; `tcr_filed` does NOT gate this path (N/A).
 * Fail closed on: Canadian sending number provisioned + CASL consent basis (when contact known).
 */
export type SmsApiPort = {
  tag: StandInTag | "real";
  send(input: {
    to: string;
    body: string;
    firmId: string;
    contactId?: string;
  }): Promise<
    | { ok: true; messageSid: string }
    | { ok: false; deny: "ca-number" | "consent" | "STOP" | "throughput" }
  >;
};

export const standInSmsApi: SmsApiPort = {
  tag: "stand-in",
  async send(input) {
    const numberOk =
      isFixturePresent("ca_sms_number_provisioned", input.firmId) ||
      isFixturePresent("ca_sms_number_provisioned");
    if (!numberOk) return { ok: false, deny: "ca-number" };

    if (input.contactId) {
      const consent = await standInConsentSilence.get(input.contactId);
      if (consent.silenced) return { ok: false, deny: "STOP" };
      if (consent.basis === "none") return { ok: false, deny: "consent" };
    }

    // Sink — real leave needs sms_account_provisioned (founder advisory for cutover).
    return { ok: true, messageSid: `sms-${Date.now()}-${input.firmId}` };
  },
};
