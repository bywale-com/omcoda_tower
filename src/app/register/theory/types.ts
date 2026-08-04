/**
 * Theory pane types — join keys and click-path discipline.
 * Interaction shape from omcoda Register; styled with Tower tokens.
 */

export type UiKind = "module" | "modal" | "block" | "submodal";

export type HowUiRef = {
  id: string;
  kind: UiKind;
  /** Exact label as it appears in leaf / implementation text. */
  label: string;
  does?: string;
  /** CT SurfaceBoundary join when click-through exists. */
  surfaceId?: string;
};

export type SmeReference = {
  title: string;
  url: string;
};

export type SmeItem = {
  id: string;
  consideration: string;
  thesisGap: string;
  solution: string;
  references: SmeReference[];
  implementationProblem?: string;
  implementation?: string;
  implementationAdds?: string[];
  implementsSurfaceIds?: string[];
  implementationPlant?: "not_done" | "planted" | "deferred";
  status?: "verified" | "partial" | "needs-verification";
};

export type SmeSeat = {
  id: string;
  label: string;
  domain: string;
  whyExists: string;
  /** Practice/regime axis vs capability axis — omit/undefined treated as practice. */
  axis?: "practice" | "capability";
  items: SmeItem[];
};

/** World types live in `theory/world.ts` (machine twin of docs/register/WORLD.md). */