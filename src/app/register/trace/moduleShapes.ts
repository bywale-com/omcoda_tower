/**
 * Module record-shape metadata — cardinality contract for builders / CTO / SME.
 * Backed by docs/sme/implementation/00-SURFACE-VOCAB.md § Module shape.
 *
 * Underseeding one demo firm made collections look like singletons. This is the
 * explicit contract; prototype seed must demonstrate it.
 */

export type RecordShape = "singleton" | "collection" | "scoped-record";
export type ModuleScope = "house" | "tenancy" | "record";

export type ModuleShapeMeta = {
  /** Exact surface-catalog module label */
  module: string;
  /**
   * singleton — one house-global control surface
   * collection — index of many records (firms, packs, tickets…)
   * scoped-record — detail for one selected record (after pick from collection)
   */
  recordShape: RecordShape;
  scope: ModuleScope;
  /** Builder-facing one-liner */
  shapeNote: string;
  /** What the prototype must show so shape is visible */
  seedExpectation: string;
};

/** Module-level shape registry (operator first). */
export const MODULE_SHAPES: ModuleShapeMeta[] = [
  {
    module: "Activation state",
    recordShape: "collection",
    scope: "tenancy",
    shapeNote:
      "Index of firms in activation; selecting a firm opens that firm’s Progress (scoped-record).",
    seedExpectation: "≥3 firms in the Activation index; Progress for the selected firm.",
  },
  {
    module: "Firm operations bind",
    recordShape: "collection",
    scope: "tenancy",
    shapeNote:
      "Index of firm bind records; each firm has its own pack binds and Armed/Active posture.",
    seedExpectation: "≥3 firms with distinct bind / posture states; detail for the selected firm.",
  },
  {
    module: "Commercial",
    recordShape: "collection",
    scope: "tenancy",
    shapeNote: "Per-tenancy commercial instruments; Escrow status / Release are scoped to a firm.",
    seedExpectation: "≥3 firm instruments with distinct escrow statuses.",
  },
  {
    module: "Firm health",
    recordShape: "collection",
    scope: "tenancy",
    shapeNote:
      "Pick a firm, then see that firm’s sequence/engagement health collection (nested collection).",
    seedExpectation: "≥3 firms selectable; ≥2 sequences under the selected firm.",
  },
  {
    module: "Configuration libraries",
    recordShape: "collection",
    scope: "house",
    shapeNote: "House-authored catalogs — Evaluation packs, Automations, Engagement templates are lists.",
    seedExpectation: "≥2 items visible in each library list (not a single orphan form).",
  },
  {
    module: "Founder & agency controls",
    recordShape: "singleton",
    scope: "house",
    shapeNote:
      "House-global policy/bounds/kill-switch; kill scope may target fleet or named tenancies (tenancy list is a control, not the module’s primary records).",
    seedExpectation: "One house control surface + ≥2 tenancies listed as kill-scope targets.",
  },
  {
    module: "Oversight",
    recordShape: "collection",
    scope: "house",
    shapeNote: "Fleet glance plus Firm row collection across tenancies.",
    seedExpectation: "≥3 firm rows under Fleet health.",
  },
  {
    module: "Customer support",
    recordShape: "collection",
    scope: "house",
    shapeNote: "Ticket queue is a collection; Ticket is a scoped-record.",
    seedExpectation: "≥2 tickets in the queue.",
  },
  {
    module: "Activation & forward-deploy",
    recordShape: "collection",
    scope: "house",
    shapeNote: "In-flight activations across the fleet.",
    seedExpectation: "≥3 in-flight activation rows.",
  },
  {
    module: "Provision",
    recordShape: "collection",
    scope: "house",
    shapeNote: "New-firm intake and provisioned tenancy list.",
    seedExpectation: "≥2 provisioned / in-progress firms.",
  },
  {
    module: "Book readiness",
    recordShape: "collection",
    scope: "tenancy",
    shapeNote: "Audits / verdict lists under a firm’s book.",
    seedExpectation: "≥2 audit runs or verdict rows when densified.",
  },
  {
    module: "Reference data",
    recordShape: "collection",
    scope: "house",
    shapeNote: "Reference tables and published versions are catalogs.",
    seedExpectation: "≥2 reference tables / versions listed.",
  },
  {
    module: "Acquisition & ads",
    recordShape: "collection",
    scope: "house",
    shapeNote: "Approach campaigns are a collection; Capture strip samples many captures.",
    seedExpectation: "≥2 campaigns; capture strip shows ≥2 samples when densified.",
  },
  {
    module: "Audit trail",
    recordShape: "collection",
    scope: "house",
    shapeNote: "Change events are a filterable collection.",
    seedExpectation: "≥3 change events.",
  },
];

const byModule = new Map(MODULE_SHAPES.map((m) => [m.module, m]));

export function getModuleShape(module: string): ModuleShapeMeta | undefined {
  return byModule.get(module);
}

export function recordShapeLabel(shape: RecordShape): string {
  switch (shape) {
    case "singleton":
      return "singleton";
    case "collection":
      return "collection";
    case "scoped-record":
      return "scoped-record";
  }
}
