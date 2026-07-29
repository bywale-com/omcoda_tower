/**
 * Immigration traceability matrix → Tower result keys (R-*) and billing services (B-*).
 * These are the matrix "last things" — what service eligibility evaluation asserts.
 */

export type MatrixResultFamily =
  | "pathway"
  | "gap"
  | "ops"
  | "category"
  | "draw";

export type MatrixResultDefinition = {
  id: string;
  label: string;
  family: MatrixResultFamily;
  description: string;
  /** Billing refs this result can fire */
  billingIds: string[];
};

export type MatrixBillingDefinition = {
  id: string;
  label: string;
  service: string;
  /** Result keys that trigger this billing/service */
  whenResultIds: string[];
};

export const MATRIX_RESULT_CATALOG: MatrixResultDefinition[] = [
  {
    id: "R-OPS-01",
    label: "Presence / status routing",
    family: "ops",
    description: "In-Canada / status gates for CEC and OINP routing",
    billingIds: ["B-10"],
  },
  {
    id: "R-OPS-02",
    label: "No Express Entry profile",
    family: "ops",
    description: "EE profile missing — create / strategy needed",
    billingIds: ["B-01"],
  },
  {
    id: "R-OPS-03",
    label: "Stale or expired profile",
    family: "ops",
    description: "Profile older than stale/expire windows",
    billingIds: ["B-01"],
  },
  {
    id: "R-OPS-04",
    label: "Monitoring cadence",
    family: "ops",
    description: "Ongoing PR readiness monitoring",
    billingIds: ["B-10"],
  },
  {
    id: "R-OPS-05",
    label: "Reactivation narrative ready",
    family: "ops",
    description: "Signals support a reactivation sequence",
    billingIds: ["B-10"],
  },
  {
    id: "R-OPS-06",
    label: "Prior-app / filing conflict",
    family: "ops",
    description: "Pending application may block new filing",
    billingIds: ["B-10"],
  },
  {
    id: "R-CEC-01",
    label: "CEC eligible",
    family: "pathway",
    description: "≥1560 skilled CA hours in 3yr, CLB7+, TEER 0–3, status OK",
    billingIds: ["B-02"],
  },
  {
    id: "R-FSW-01",
    label: "FSW eligible",
    family: "pathway",
    description: "Foreign skilled work + CLB7+ + grid signals",
    billingIds: ["B-03"],
  },
  {
    id: "R-FST-01",
    label: "FST eligible",
    family: "pathway",
    description: "Trade pathway — hours/CLB/offer-or-certificate gates",
    billingIds: ["B-04a"],
  },
  {
    id: "R-PNP-01",
    label: "OINP Foreign Worker / employer",
    family: "pathway",
    description: "Ontario + offer + employer thresholds",
    billingIds: ["B-04"],
  },
  {
    id: "R-PNP-02",
    label: "OINP International Student",
    family: "pathway",
    description: "Ontario intent + student/work context",
    billingIds: ["B-04"],
  },
  {
    id: "R-PNP-03",
    label: "OINP In-Demand Skills",
    family: "pathway",
    description: "NOC on IDS list + Ontario offer",
    billingIds: ["B-05"],
  },
  {
    id: "R-GAP-01",
    label: "Canadian hours shortfall",
    family: "gap",
    description: "Below CEC hour/year threshold — months/hours to go",
    billingIds: ["B-07"],
  },
  {
    id: "R-GAP-02",
    label: "Foreign work shortfall",
    family: "gap",
    description: "Below FSW foreign-work minimum",
    billingIds: ["B-07"],
  },
  {
    id: "R-GAP-03",
    label: "Language gap",
    family: "gap",
    description: "Missing/invalid/below-CLB language results",
    billingIds: ["B-08"],
  },
  {
    id: "R-GAP-04",
    label: "ECA missing or expired",
    family: "gap",
    description: "Foreign credential needs ECA",
    billingIds: ["B-06"],
  },
  {
    id: "R-GAP-05",
    label: "Profile freshness gap",
    family: "gap",
    description: "Profile update overdue relative to stale window",
    billingIds: ["B-01"],
  },
  {
    id: "R-GAP-06",
    label: "CRS foreign-exp window gap",
    family: "gap",
    description: "Foreign experience outside 5-year CRS points window",
    billingIds: ["B-07"],
  },
  {
    id: "R-GAP-07",
    label: "Document / continuity gap",
    family: "gap",
    description: "Gaps in employment continuity or supporting docs",
    billingIds: ["B-07"],
  },
  {
    id: "R-CAT-01",
    label: "Category · Healthcare",
    family: "category",
    description: "NOC in healthcare category draw list",
    billingIds: ["B-09"],
  },
  {
    id: "R-CAT-02",
    label: "Category · STEM",
    family: "category",
    description: "NOC in STEM category draw list",
    billingIds: ["B-09"],
  },
  {
    id: "R-CAT-03",
    label: "Category · Trades",
    family: "category",
    description: "NOC in trades category draw list",
    billingIds: ["B-09"],
  },
  {
    id: "R-CAT-04",
    label: "Category · Other streams",
    family: "category",
    description: "Transport / education / ag / other active streams",
    billingIds: ["B-09"],
  },
  {
    id: "R-CAT-05",
    label: "Category · French",
    family: "category",
    description: "French NCLC thresholds for French category",
    billingIds: ["B-08", "B-09"],
  },
  {
    id: "R-DRAW-01",
    label: "Draw competitive",
    family: "draw",
    description: "CRS at or above latest cutoff",
    billingIds: ["B-02", "B-07"],
  },
];

export const MATRIX_BILLING_CATALOG: MatrixBillingDefinition[] = [
  {
    id: "B-01",
    label: "B-01",
    service: "Profile create/reactivate + strategy",
    whenResultIds: ["R-OPS-02", "R-OPS-03", "R-GAP-05"],
  },
  {
    id: "B-02",
    label: "B-02",
    service: "CEC verify + CRS re-score + filing prep",
    whenResultIds: ["R-CEC-01", "R-DRAW-01"],
  },
  {
    id: "B-03",
    label: "B-03",
    service: "FSW review + docs + ECA referral",
    whenResultIds: ["R-FSW-01"],
  },
  {
    id: "B-04a",
    label: "B-04a",
    service: "FST filing + PNP alignment",
    whenResultIds: ["R-FST-01"],
  },
  {
    id: "B-04",
    label: "B-04",
    service: "OINP FW / International Student package",
    whenResultIds: ["R-PNP-01", "R-PNP-02"],
  },
  {
    id: "B-05",
    label: "B-05",
    service: "OINP In-Demand Skills package",
    whenResultIds: ["R-PNP-03"],
  },
  {
    id: "B-06",
    label: "B-06",
    service: "ECA advisory + CRS impact",
    whenResultIds: ["R-GAP-04"],
  },
  {
    id: "B-07",
    label: "B-07",
    service: "Gap analysis + timeline + LMIA strategy",
    whenResultIds: ["R-GAP-01", "R-GAP-02", "R-GAP-06", "R-GAP-07"],
  },
  {
    id: "B-08",
    label: "B-08",
    service: "Language strategy + retake modeling",
    whenResultIds: ["R-CAT-05", "R-GAP-03"],
  },
  {
    id: "B-09",
    label: "B-09",
    service: "Category draw strategy",
    whenResultIds: ["R-CAT-01", "R-CAT-02", "R-CAT-03", "R-CAT-04"],
  },
  {
    id: "B-10",
    label: "B-10",
    service: "PR readiness retainer / monitoring",
    whenResultIds: ["R-OPS-01", "R-OPS-04", "R-OPS-05", "R-OPS-06"],
  },
];

export const MATRIX_FAMILY_LABELS: Record<MatrixResultFamily, string> = {
  pathway: "Pathway detection",
  gap: "Gaps",
  ops: "Profile & operations",
  category: "Category draws",
  draw: "Draw competitiveness",
};

export function getMatrixResult(id: string): MatrixResultDefinition | undefined {
  return MATRIX_RESULT_CATALOG.find((item) => item.id === id);
}

export function getMatrixBilling(id: string): MatrixBillingDefinition | undefined {
  return MATRIX_BILLING_CATALOG.find((item) => item.id === id);
}

export function billingsForResults(resultIds: string[]): MatrixBillingDefinition[] {
  const set = new Set(resultIds);
  return MATRIX_BILLING_CATALOG.filter((billing) =>
    billing.whenResultIds.some((id) => set.has(id)),
  );
}
