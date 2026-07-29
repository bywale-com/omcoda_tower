/**
 * Versioned IRCC / OINP reference tables (Directive 3).
 * Same pattern as pathway_rule: rows, versions, superseded flags — update without code deploys.
 */

export type VersionedTableRow<T> = {
  id: string;
  version: number;
  effectiveFrom: string;
  superseded: boolean;
  supersededBy?: string;
  data: T;
};

export type CategoryOccupationRow = {
  stream: "healthcare" | "stem" | "trades" | "transport" | "education" | "agriculture" | "other";
  /** Result asserted when NOC matches */
  resultId: "R-CAT-01" | "R-CAT-02" | "R-CAT-03" | "R-CAT-04";
  nocCodes: string[];
};

export type DesignatedTradeRow = {
  nocCodes: string[];
  label: string;
};

export type DrawCutoffRow = {
  drawType: "all_program" | "cec" | "fsw" | "fst" | "pnp" | "category";
  categoryStream?: CategoryOccupationRow["stream"] | "french";
  crsCutoff: number;
  drawDate: string;
};

/** Active (non-superseded) category occupation lists — seed mirrors IRCC-style streams. */
export const CATEGORY_OCCUPATION_TABLE: VersionedTableRow<CategoryOccupationRow>[] = [
  {
    id: "cat-healthcare-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      stream: "healthcare",
      resultId: "R-CAT-01",
      nocCodes: ["32102", "31301", "31100", "32101"],
    },
  },
  {
    id: "cat-stem-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      stream: "stem",
      resultId: "R-CAT-02",
      nocCodes: ["21222", "21231", "21223", "21211", "21300"],
    },
  },
  {
    id: "cat-trades-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      stream: "trades",
      resultId: "R-CAT-03",
      nocCodes: ["72300", "72400", "72014", "63200"],
    },
  },
  {
    id: "cat-other-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      stream: "transport",
      resultId: "R-CAT-04",
      nocCodes: ["73300", "14400"],
    },
  },
];

export const DESIGNATED_TRADES_TABLE: VersionedTableRow<DesignatedTradeRow>[] = [
  {
    id: "fst-trades-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      label: "FST designated trades (seed)",
      nocCodes: ["72300", "72400", "72014", "63200", "72011"],
    },
  },
];

/** OINP In-Demand Skills eligible NOCs (versioned). */
export const OINP_IDS_OCCUPATION_TABLE: VersionedTableRow<{ nocCodes: string[]; label: string }>[] = [
  {
    id: "oinp-ids-v1",
    version: 1,
    effectiveFrom: "2026-01-01",
    superseded: false,
    data: {
      label: "OINP IDS occupations (seed)",
      nocCodes: ["32102", "44101", "75110", "94140"],
    },
  },
];

export const DRAW_CUTOFF_TABLE: VersionedTableRow<DrawCutoffRow>[] = [
  {
    id: "draw-all-2026-06",
    version: 1,
    effectiveFrom: "2026-06-01",
    superseded: false,
    data: {
      drawType: "all_program",
      crsCutoff: 524,
      drawDate: "2026-06-12",
    },
  },
  {
    id: "draw-cec-2026-06",
    version: 1,
    effectiveFrom: "2026-06-01",
    superseded: false,
    data: {
      drawType: "cec",
      crsCutoff: 515,
      drawDate: "2026-06-10",
    },
  },
  {
    id: "draw-category-stem-2026-05",
    version: 1,
    effectiveFrom: "2026-05-01",
    superseded: false,
    data: {
      drawType: "category",
      categoryStream: "stem",
      crsCutoff: 486,
      drawDate: "2026-05-22",
    },
  },
];

export function activeRows<T>(table: VersionedTableRow<T>[]): VersionedTableRow<T>[] {
  return table.filter((row) => !row.superseded);
}

/** Extract leading NOC digits from "21222 · Software engineer" */
export function parseNocCode(raw: unknown): string | null {
  if (raw == null) return null;
  const match = String(raw).match(/(\d{4,5})/);
  return match ? match[1] : null;
}

export function categoryResultsForNoc(nocRaw: unknown): string[] {
  const noc = parseNocCode(nocRaw);
  if (!noc) return [];
  const asserted: string[] = [];
  for (const row of activeRows(CATEGORY_OCCUPATION_TABLE)) {
    if (row.data.nocCodes.some((code) => noc.startsWith(code) || code.startsWith(noc))) {
      asserted.push(row.data.resultId);
    }
  }
  return [...new Set(asserted)];
}

export function nocIsDesignatedTrade(nocRaw: unknown): boolean {
  const noc = parseNocCode(nocRaw);
  if (!noc) return false;
  return activeRows(DESIGNATED_TRADES_TABLE).some((row) =>
    row.data.nocCodes.some((code) => noc.startsWith(code) || code.startsWith(noc)),
  );
}

export function nocIsOinpIds(nocRaw: unknown): boolean {
  const noc = parseNocCode(nocRaw);
  if (!noc) return false;
  return activeRows(OINP_IDS_OCCUPATION_TABLE).some((row) =>
    row.data.nocCodes.some((code) => noc.startsWith(code) || code.startsWith(noc)),
  );
}

export function latestCutoffForDrawType(
  drawType: DrawCutoffRow["drawType"] = "all_program",
): number | null {
  const rows = activeRows(DRAW_CUTOFF_TABLE)
    .filter((row) => row.data.drawType === drawType)
    .sort((a, b) => b.data.drawDate.localeCompare(a.data.drawDate));
  return rows[0]?.data.crsCutoff ?? null;
}
