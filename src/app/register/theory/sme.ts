import type { SmeSeat } from "./types";

/**
 * SME seats — domain lanes (build-room personas, not product users).
 * Populate Pass1/Pass2 from docs/sme/ as methodology matures.
 */
export const SME_SEATS: SmeSeat[] = [
  {
    id: "immigration-rules",
    label: "Immigration rules & eligibility specialist",
    domain: "Service eligibility, matrix outcomes, jurisdiction-specific rules",
    whyExists:
      "Automations and Hub rules encode domain facts — PM/CTO cannot invent visa categories or eligibility thresholds.",
    items: [
      {
        id: "ir-01",
        consideration:
          "Service eligibility for immigration consultancies depends on visa category, country pair, and firm-specific service lines — not a single boolean on the contact record.",
        thesisGap:
          "Rule nodes may treat eligibility as one filter field when the matrix is multi-dimensional.",
        solution:
          "On the Rule node, consultants configure outcomes against the immigration matrix so that enrollment respects category + corridor + service line.",
        references: [{ title: "Tower immigration matrix (product doc — docs/product/immigration-rules-engine2-giveback.md)", url: "" }],
        implementationProblem:
          "Without matrix-aware outcomes, automations could enroll contacts who fail service eligibility silently.",
        implementation:
          "Starting from Hub Automations Module, open the workflow editor Modal.\nInside the Rule node Block, relative to Outcomes, you can now pick matrix rows and see which enrollment paths they gate.",
        implementationAdds: ["matrix outcome picker"],
        implementsSurfaceIds: ["hub-automation-rule-node"],
        implementationPlant: "not_done",
        status: "partial",
      },
    ],
  },
  {
    id: "automation-runtime",
    label: "Automation runtime & enrollment specialist",
    domain: "Triggers, enrollment criteria, manual vs event vs schedule runs",
    whyExists:
      "The Automations builder UI must match how runs actually enqueue — event order, enrollment caps, and manual class filters.",
    items: [
      {
        id: "ar-01",
        consideration:
          "Manual enrollment automations require explicit class filters — consultants must not accidentally enroll the entire directory when testing a workflow.",
        thesisGap: "Trigger configuration may not surface enrollment scope before first run.",
        solution:
          "On Manual trigger configuration, require Data Class scope selection before the workflow can be saved or run.",
        references: [],
        implementationProblem:
          "A consultant could run a manual workflow against all contacts without noticing scope.",
        implementation:
          "Starting from Hub Automations Module, open Manual trigger configuration Block.\nRelative to Enrollment criteria, you must select a Data Class scope before Run or Save is enabled.",
        implementsSurfaceIds: ["hub-automation-manual-trigger"],
        implementationPlant: "not_done",
        status: "needs-verification",
      },
    ],
  },
];

export function getSmeSeat(seatId: string): SmeSeat | undefined {
  return SME_SEATS.find((seat) => seat.id === seatId);
}

export function getSmeItem(seatId: string, itemId: string) {
  const seat = getSmeSeat(seatId);
  return seat?.items.find((item) => item.id === itemId);
}
