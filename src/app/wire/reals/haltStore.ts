import type { HaltRecord, HaltStorePort } from "../ports";
import { wireFetch } from "../http";

export const realHaltStore: HaltStorePort = {
  tag: "real",
  async commit(input) {
    return wireFetch<HaltRecord>("/halt", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async lift(haltId) {
    const res = await wireFetch<{ record: HaltRecord | null }>(
      `/halt/${encodeURIComponent(haltId)}/lift`,
      { method: "POST", body: "{}" },
    );
    return res.record;
  },
  async listActive(firmId) {
    const q = firmId ? `?firmId=${encodeURIComponent(firmId)}` : "";
    const res = await wireFetch<{ records: HaltRecord[] }>(`/halt${q}`);
    return res.records;
  },
  async isContactHalted(contactId) {
    const res = await wireFetch<{ halted: boolean }>(
      `/halt/contact/${encodeURIComponent(contactId)}`,
    );
    return res.halted;
  },
  async isFirmBookHalted(firmId) {
    const res = await wireFetch<{ halted: boolean }>(
      `/halt/firm-book/${encodeURIComponent(firmId)}`,
    );
    return res.halted;
  },
};
