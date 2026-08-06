/**
 * Register Priors / Weak — full-app inventory types.
 * Prior = interactive control with no lattice click-path; purposes later (empty).
 * Weak = interactive control with lattice foothold but control itself unnamed.
 */

/** Which inventory branch is selected in the Priors pass. */
export type DeskLatticeKind = "prior" | "weak";

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
  | "shell"
  | "input";

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

/**
 * Machine join from Prior/Weak entry → concrete CT control in source.
 * CTO agents resolve the button via file + symbol + locator (grep-stable).
 */
export type PriorCodeRef = {
  era: "plant" | "ant";
  /** Repo-relative path, e.g. src/app/register/prototype/... */
  file: string;
  /** Component / export / enclosing symbol */
  symbol: string;
  /**
   * Grep-stable locator for the exact control:
   * visible label, handler name, aria-label, or distinctive JSX string.
   */
  locator: string;
};

export type PriorEntry = {
  id: string;
  zone: PriorZone;
  title: string;
  /** Desk seat(s) — plant and/or Ant, deduped. */
  where: string;
  kind: PriorKind;
  notes: string;
  /** Code joins — at least one; plant and/or Ant when both mount the control. */
  codeRefs: PriorCodeRef[];
  /** Reserved — purposes later. */
  purposes: [];
};

/** Weak = lattice foothold present; control itself not named. */
export type WeakEntry = {
  id: string;
  /** Reuse PriorZone; Contact for contact weaks; no Global CT chrome in this inventory. */
  zone: PriorZone;
  title: string;
  where: string;
  kind: PriorKind | "input";
  latticeFoothold: string;
  notes: string;
  /** Code joins — at least one; plant and/or Ant when both mount the control. */
  codeRefs: PriorCodeRef[];
  purposes: [];
};
