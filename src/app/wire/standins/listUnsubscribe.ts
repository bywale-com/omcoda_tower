import type { StandInTag } from "../ports";
import { standInConsentSilence } from "./consentSilence";

/** Modelable: mailbox one-click List-Unsubscribe POST → silence. */
export type ListUnsubscribePort = {
  tag: StandInTag | "real";
  accept(input: {
    firmId: string;
    contactId: string;
    messageId?: string;
  }): Promise<{ accepted: true }>;
};

export const standInListUnsubscribe: ListUnsubscribePort = {
  tag: "stand-in",
  async accept(input) {
    await standInConsentSilence.silence(input.contactId, input.firmId, "list-unsubscribe");
    return { accepted: true };
  },
};
