import type { CrmGrantState, CrmOAuthPort } from "../ports";
import { wireFetch } from "../http";
import { markFixture } from "../fixtures/store";

export const realCrmOAuth: CrmOAuthPort = {
  tag: "real",
  async grant(firmId, scopes) {
    const row = await wireFetch<CrmGrantState>("/oauth/grant", {
      method: "POST",
      body: JSON.stringify({ firmId, scopes }),
    });
    markFixture({
      id: "oauth_granted",
      present: true,
      markedBy: "firm",
      firmId,
      note: "durable grant",
    });
    return row;
  },
  async revoke(firmId) {
    const row = await wireFetch<CrmGrantState>(
      `/oauth/${encodeURIComponent(firmId)}/revoke`,
      { method: "POST", body: "{}" },
    );
    markFixture({
      id: "oauth_granted",
      present: false,
      markedBy: "firm",
      firmId,
      note: "grant revoked",
    });
    return row;
  },
  async get(firmId) {
    return wireFetch(`/oauth/${encodeURIComponent(firmId)}`);
  },
};
