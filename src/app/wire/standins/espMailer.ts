import { isSendingIdentityReady } from "../fixtures/store";
import type { EspMailerPort, EspSendInput, EspSendResult, MessagingEvent } from "../ports";
import { standInConsentSilence } from "./consentSilence";
import { setFirmQuarantined } from "./sendGate";
import { standInWarmup } from "./warmup";

const events: MessagingEvent[] = [];
const outbox: Array<EspSendInput & { messageId: string; acceptedAt: string }> = [];

export function getStandInEspOutbox() {
  return outbox;
}

export function clearStandInEspMailer(): void {
  events.length = 0;
  outbox.length = 0;
}

export const standInEspMailer: EspMailerPort = {
  tag: "stand-in",
  async send(input: EspSendInput): Promise<EspSendResult> {
    if (input.forceDeny) {
      return { ok: false, deny: input.forceDeny, detail: `forced ${input.forceDeny}` };
    }

    if (!isSendingIdentityReady(input.firmId)) {
      return { ok: false, deny: "auth", detail: "sending identity fixtures incomplete" };
    }

    const warmup = await standInWarmup.get(input.firmId);
    if (warmup.remaining <= 0 || warmup.stage === "hold") {
      return { ok: false, deny: "throttle", detail: "warmup cap / hold" };
    }

    // Stand-in sink — does not leave the process. Real ESP cutover needs
    // founder fixture `esp_account_provisioned` (advisory chip only here).
    const messageId = `esp-${Date.now()}-${outbox.length + 1}`;
    const acceptedAt = new Date().toISOString();
    outbox.push({ ...input, messageId, acceptedAt });
    await standInWarmup.recordSend(input.firmId);

    events.push({
      id: `evt-${events.length + 1}`,
      at: acceptedAt,
      firmId: input.firmId,
      messageId,
      class: "accepted",
      contactId: input.contactId,
    });
    return { ok: true, messageId, acceptedAt };
  },

  async injectEvent(partial) {
    const event: MessagingEvent = {
      id: `evt-${events.length + 1}`,
      at: partial.at ?? new Date().toISOString(),
      firmId: partial.firmId,
      messageId: partial.messageId,
      class: partial.class,
      contactId: partial.contactId,
    };
    events.push(event);

    if (event.class === "bounce_hard" && event.contactId) {
      await standInConsentSilence.silence(event.contactId, event.firmId, "hard-bounce");
    }
    if (event.class === "complaint") {
      setFirmQuarantined(event.firmId, true);
    }
    return event;
  },

  async listEvents(firmId) {
    return firmId ? events.filter((e) => e.firmId === firmId) : [...events];
  },
};
