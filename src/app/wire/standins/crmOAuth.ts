import { isFixturePresent, markFixture } from "../fixtures/store";
import type { CrmGrantState, CrmOAuthPort } from "../ports";

const grants = new Map<string, CrmGrantState>();

function empty(firmId: string): CrmGrantState {
  return { firmId, granted: false, revoked: false, scopes: [] };
}

export const standInCrmOAuth: CrmOAuthPort = {
  tag: "stand-in",
  async grant(firmId, scopes = ["contacts.read", "export"]) {
    markFixture({
      id: "oauth_granted",
      present: true,
      markedBy: "firm",
      firmId,
      note: "intentional firm OAuth grant",
    });
    const row: CrmGrantState = {
      firmId,
      granted: true,
      revoked: false,
      scopes,
      grantedAt: new Date().toISOString(),
    };
    grants.set(firmId, row);
    return row;
  },
  async revoke(firmId) {
    const prev = grants.get(firmId) ?? empty(firmId);
    const row: CrmGrantState = {
      ...prev,
      firmId,
      granted: false,
      revoked: true,
      revokedAt: new Date().toISOString(),
    };
    grants.set(firmId, row);
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
    const row = grants.get(firmId);
    if (row) return row;
    // Fixture without local row (e.g. restored) — grant present, not revoked.
    if (isFixturePresent("oauth_granted", firmId) || isFixturePresent("oauth_granted")) {
      return {
        firmId,
        granted: true,
        revoked: false,
        scopes: ["contacts.read", "export"],
      };
    }
    return empty(firmId);
  },
};

export function clearStandInCrmOAuth(): void {
  grants.clear();
}
