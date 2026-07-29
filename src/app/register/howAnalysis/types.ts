/**
 * How Analysis — consultant-perspective decomposition.
 * Authoring guide: docs/product/ui-first-build-methodology.md
 *
 * Visibility rule (strict):
 * - Outcome and every node before a true leaf: question, clarity, and criteria stay
 *   consultant-visible. No process / invisible language (stores, APIs, Auth Service, etc.).
 * - True leaves only: may use process language in question, clarity, criteria, and
 *   components — the last Q/A pair in that chain.
 *
 * If the next How would repeat the parent or need invisible language before the leaf,
 * stop at a leaf (e.g. "How do contacts appear on the Board?" owns import→store→query).
 *
 * DNA: each child question must trace to a phrase in the parent answer. Process names
 * appear in the leaf answer, not the question.
 *
 * Flow anchors: Register flow is born at the parent when the first leaf appears (flow
 * crystallization). All sibling children must then also be leaves. One flow per anchor.
 * Sibling order: left-to-right = clause order in parent answer (position.x).
 * Epic order: HowGraph.epicOrder — universal priority across trees.
 */
export type HowNodeKind = "outcome" | "answer" | "leaf";

export type HowComponents = {
  ui?: string[];
  runtime?: string[];
  stores?: string[];
  external?: string[];
};

/** A condition is when + what must be true. When is filled per node as the map matures. */
export type HowCriteria = {
  /** Trigger / timing — under what circumstances does this hold or fire? */
  when?: string | null;
  /** What must be true when the above applies. */
  conditions: string[];
};

export type HowNode = {
  id: string;
  parentId: string | null;
  kind: HowNodeKind;
  depth: number;
  question: string | null;
  clarity: string;
  criteria: HowCriteria;
  components: HowComponents;
  phraseKeys?: string[];
  mergeWithId?: string;
  isLeaf?: boolean;
  prototypeRef?: string[];
  /** Register flow born at this node when it is a flow anchor (children are all leaves). */
  flowId?: string;
  position: { x: number; y: number };
};

export type HowGraph = {
  id: string;
  label: string;
  /** Universal order among epics — lower appears first (leftmost in roadmap). */
  epicOrder: number;
  /** World / outcome persona this How belongs to. */
  personaId: "consultant" | "engagement_contact" | "operator";
  /** Outcome id in theory/outcomes.ts (not the How root node id). */
  outcomeId: string;
  nodes: HowNode[];
};

export const HOW_ANSWER_DISPLAY_MAX = 110;

export function truncateHowAnswer(text: string, max = HOW_ANSWER_DISPLAY_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.trimEnd()}…`;
}
