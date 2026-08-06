/**
 * Register Priors — desk→lattice census entries.
 * Entry = interactive control; purposes later (empty).
 */

export type PriorMark = "latticed" | "weak" | "prior";

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
  | "scroll";

export type PriorModule =
  | "Agents"
  | "Audits"
  | "Activity"
  | "Board"
  | "Contacts"
  | "Meetings"
  | "Prepared"
  | "Login"
  | "Contact desk"
  | "Operator"
  | "Global CT chrome";

export type PriorEntry = {
  id: string;
  module: PriorModule;
  title: string;
  /** Desk seat(s) — plant and/or Ant, deduped. */
  where: string;
  kind: PriorKind;
  mark: PriorMark;
  /** Lattice pointer when latticed/weak; empty when prior. */
  latticeHint: string;
  notes: string;
  /** Reserved — purposes later. */
  purposes: [];
};
