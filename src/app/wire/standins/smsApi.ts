import { isFixturePresent } from "../fixtures/store";
import type { StandInTag } from "../ports";

/** Modelable SMS API — fails closed without tcr_filed; account fixture is founder-input advisory. */
export type SmsApiPort = {
  tag: StandInTag | "real";
  send(input: {
    to: string;
    body: string;
    firmId: string;
  }): Promise<
    | { ok: true; messageSid: string }
    | { ok: false; deny: "registration" | "throughput" | "STOP" }
  >;
};

export const standInSmsApi: SmsApiPort = {
  tag: "stand-in",
  async send(input) {
    const filed = isFixturePresent("tcr_filed", input.firmId) || isFixturePresent("tcr_filed");
    if (!filed) return { ok: false, deny: "registration" };
    // Sink even without sms_account_provisioned (founder advisory for real cutover).
    return { ok: true, messageSid: `sms-${Date.now()}-${input.firmId}` };
  },
};
