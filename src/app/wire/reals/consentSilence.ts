import type { ConsentSilencePort } from "../ports";
import { wireFetch } from "../http";

export const realConsentSilence: ConsentSilencePort = {
  tag: "real",
  async setConsent(contactId, firmId, basis) {
    await wireFetch("/consent", {
      method: "POST",
      body: JSON.stringify({ contactId, firmId, basis }),
    });
  },
  async silence(contactId, firmId, source) {
    await wireFetch("/consent/silence", {
      method: "POST",
      body: JSON.stringify({ contactId, firmId, source }),
    });
  },
  async get(contactId) {
    return wireFetch(`/consent/${encodeURIComponent(contactId)}`);
  },
};
