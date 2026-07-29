/**
 * Collectible field classification (Engine 2 prerequisite).
 * Self-reportable → eligible for pre-meeting form.
 * Document-dependent → never enter a form; exit meetings as Manage items.
 * Employer-directed asks target the firm, not the client.
 */

export type CollectibleCaptureKind = "self_reportable" | "document_dependent";

export type CollectibleFieldDefinition = {
  id: string;
  label: string;
  /** Path on pulled client_data (or conceptual record path) */
  path: string;
  capture: CollectibleCaptureKind;
  /** Ask is directed at the firm, not the client */
  employerDirected?: boolean;
  /** Related matrix / gap signals when missing */
  signalHints?: string[];
};

export const COLLECTIBLE_FIELDS: CollectibleFieldDefinition[] = [
  {
    id: "foreign_work_years",
    label: "Foreign work years",
    path: "client_data.information.foreign_work_years",
    capture: "self_reportable",
    signalHints: ["R-GAP-02", "R-FSW-01"],
  },
  {
    id: "ee_profile_exists",
    label: "Express Entry profile exists",
    path: "client_data.information.ee_profile_exists",
    capture: "self_reportable",
    signalHints: ["R-OPS-02"],
  },
  {
    id: "ee_profile_last_updated",
    label: "EE profile last updated",
    path: "client_data.information.ee_profile_last_updated",
    capture: "self_reportable",
    signalHints: ["R-OPS-03", "R-GAP-05"],
  },
  {
    id: "canadian_skilled_hours",
    label: "Canadian skilled hours",
    path: "client_data.information.canadian_skilled_hours",
    capture: "self_reportable",
    signalHints: ["R-GAP-01", "R-CEC-01"],
  },
  {
    id: "language_clb",
    label: "Language CLB",
    path: "client_data.crs.language_clb",
    capture: "self_reportable",
    signalHints: ["R-GAP-03"],
  },
  {
    id: "crs_score",
    label: "CRS score",
    path: "client_data.crs.score",
    capture: "self_reportable",
    signalHints: ["R-DRAW-01"],
  },
  {
    id: "noc",
    label: "NOC",
    path: "client_data.crs.noc",
    capture: "self_reportable",
    signalHints: ["R-CAT-01", "R-CAT-02", "R-CAT-03"],
  },
  {
    id: "teer_category",
    label: "TEER category",
    path: "client_data.crs.teer_category",
    capture: "self_reportable",
  },
  {
    id: "eca_status",
    label: "ECA status",
    path: "client_data.information.eca_status",
    capture: "document_dependent",
    signalHints: ["R-GAP-04"],
  },
  {
    id: "foreign_trade_hours",
    label: "Foreign trade hours",
    path: "client_data.information.foreign_trade_hours",
    capture: "self_reportable",
    signalHints: ["R-FST-01"],
  },
  {
    id: "has_trade_certificate",
    label: "Trade certificate",
    path: "client_data.information.has_trade_certificate",
    capture: "document_dependent",
    signalHints: ["R-FST-01"],
  },
  {
    id: "has_qualifying_job_offer",
    label: "Qualifying job offer",
    path: "client_data.information.has_qualifying_job_offer",
    capture: "document_dependent",
    employerDirected: true,
    signalHints: ["R-FST-01", "R-PNP-01"],
  },
  {
    id: "has_ontario_job_offer",
    label: "Ontario job offer",
    path: "client_data.information.has_ontario_job_offer",
    capture: "document_dependent",
    employerDirected: true,
    signalHints: ["R-PNP-01", "R-PNP-03"],
  },
  {
    id: "oinp_employer_revenue",
    label: "OINP employer revenue",
    path: "client_data.information.oinp_employer_revenue",
    capture: "document_dependent",
    employerDirected: true,
    signalHints: ["R-PNP-01"],
  },
  {
    id: "lmia_paperwork",
    label: "LMIA paperwork",
    path: "client_data.information.lmia_paperwork",
    capture: "document_dependent",
    employerDirected: true,
  },
];

export function collectibleFieldsByCapture(
  capture: CollectibleCaptureKind,
): CollectibleFieldDefinition[] {
  return COLLECTIBLE_FIELDS.filter((field) => field.capture === capture);
}

export function selfReportableOutstandingPaths(
  presentPaths: Set<string>,
): CollectibleFieldDefinition[] {
  return COLLECTIBLE_FIELDS.filter(
    (field) => field.capture === "self_reportable" && !presentPaths.has(field.path),
  );
}
