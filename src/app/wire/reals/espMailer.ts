import type { EspMailerPort, EspSendResult, MessagingEvent } from "../ports";
import { wireFetch } from "../http";

export const realEspMailer: EspMailerPort = {
  tag: "real",
  async send(input) {
    return wireFetch<EspSendResult>("/send/cem", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async injectEvent(partial) {
    // Real path uses Resend webhooks; inject is CT-only synthetic — store via events list noop
    const event: MessagingEvent = {
      id: `local-${Date.now()}`,
      at: partial.at ?? new Date().toISOString(),
      firmId: partial.firmId,
      messageId: partial.messageId,
      class: partial.class,
      contactId: partial.contactId,
    };
    return event;
  },
  async listEvents(firmId) {
    const q = firmId ? `?firmId=${encodeURIComponent(firmId)}` : "";
    const res = await wireFetch<{ events: MessagingEvent[] }>(`/events${q}`);
    return res.events;
  },
};
