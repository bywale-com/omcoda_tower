import type { ConsentBasis, ConsentSilencePort } from "../ports";

type Row = { firmId: string; basis: ConsentBasis; silenced: boolean };
const byContact = new Map<string, Row>();

export const standInConsentSilence: ConsentSilencePort = {
  tag: "stand-in",
  async setConsent(contactId, firmId, basis) {
    const prev = byContact.get(contactId);
    byContact.set(contactId, {
      firmId,
      basis,
      silenced: prev?.silenced ?? false,
    });
  },
  async silence(contactId, firmId, _source) {
    const prev = byContact.get(contactId);
    byContact.set(contactId, {
      firmId,
      basis: prev?.basis ?? "none",
      silenced: true,
    });
  },
  async get(contactId) {
    const row = byContact.get(contactId);
    return { basis: row?.basis ?? "none", silenced: row?.silenced ?? false };
  },
};

export function clearStandInConsentSilence(): void {
  byContact.clear();
}
