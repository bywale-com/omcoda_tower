/**
 * Register Priors — full-app priors-only inventory.
 * Entry = interactive control with no lattice click-path; purposes later (empty).
 */

export type PriorKind =
  | "nav"
  | "open"
  | "commit"
  | "tab"
  | "toggle"
  | "menu"
  | "select"
  | "checkbox"
  | "reorder"
  | "resize"
  | "inspect"
  | "download"
  | "zoom"
  | "scroll"
  | "shell";

export type PriorZone =
  | "Consultant"
  | "Contact"
  | "Global CT chrome"
  | "Automations"
  | "Agents"
  | "Audits"
  | "Operator house";

export type PriorZoneMeta = {
  id: PriorZone;
  label: string;
  count: number;
};

export type PriorEntry = {
  id: string;
  zone: PriorZone;
  title: string;
  /** Desk seat(s) — plant and/or Ant, deduped. */
  where: string;
  kind: PriorKind;
  notes: string;
  /** Reserved — purposes later. */
  purposes: [];
};
