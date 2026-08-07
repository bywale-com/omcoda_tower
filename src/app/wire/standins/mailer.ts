import type { MailerPort, MailerSendInput, MailerSendResult } from "../ports";

/** In-memory stand-in mailer — records sends; does not leave the process. */
const outbox: Array<MailerSendInput & MailerSendResult> = [];

export function getStandInMailerOutbox(): ReadonlyArray<MailerSendInput & MailerSendResult> {
  return outbox;
}

export function clearStandInMailerOutbox(): void {
  outbox.length = 0;
}

export const standInMailer: MailerPort = {
  tag: "stand-in",
  async send(input) {
    const result: MailerSendResult = {
      messageId: `standin-mail-${Date.now()}-${outbox.length + 1}`,
      acceptedAt: new Date().toISOString(),
    };
    outbox.push({ ...input, ...result });
    return result;
  },
};
