import type { StandInTag } from "../ports";

/** Modelable: public-web crawl + robots — fixture sites only. */
export type EnrichCrawlPort = {
  tag: StandInTag | "real";
  fetchPublic(input: {
    rootUrl: string;
    path?: string;
  }): Promise<
    | { ok: true; status: number; body: string; robotsAllowed: boolean; fetchedAt: string }
    | { ok: false; reason: "robots-deny" | "unreachable"; robotsAllowed: boolean }
  >;
};

const FIXTURE_SITES: Record<string, { body: string; allow: boolean }> = {
  "https://cedar.example": {
    body: "<html><title>Cedar Pathways</title><body>RCIC firm</body></html>",
    allow: true,
  },
  "https://blocked.example": {
    body: "",
    allow: false,
  },
};

export const standInEnrichCrawl: EnrichCrawlPort = {
  tag: "stand-in",
  async fetchPublic(input) {
    const root = input.rootUrl.replace(/\/$/, "");
    const site = FIXTURE_SITES[root];
    if (!site) {
      return { ok: false, reason: "unreachable", robotsAllowed: false };
    }
    if (!site.allow) {
      return { ok: false, reason: "robots-deny", robotsAllowed: false };
    }
    return {
      ok: true,
      status: 200,
      body: site.body,
      robotsAllowed: true,
      fetchedAt: new Date().toISOString(),
    };
  },
};
