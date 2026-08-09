import { SYSTEM_MAP_MODEL } from "../data/model";
import type { MapEdge, MapRule } from "../data/types";

export type SimStep = {
  nodeId: string;
  viaEdgeId?: string;
  depth: number;
};

/**
 * Fire a faceless (or any) origin and walk causation edges — BFS cascade.
 * Precedence toggles off in motion_decision can prune edges that depend on those rules.
 */
export function simulateCascade(
  originNodeId: string,
  rules: Record<string, MapRule>,
  edges: MapEdge[] = SYSTEM_MAP_MODEL.edges,
): SimStep[] {
  const steps: SimStep[] = [];
  const seen = new Set<string>();
  const queue: SimStep[] = [{ nodeId: originNodeId, depth: 0 }];

  while (queue.length) {
    const cur = queue.shift()!;
    if (seen.has(cur.nodeId)) continue;
    seen.add(cur.nodeId);
    steps.push(cur);

    // If motion_decision has reactivation-first toggled off, still allow nudge path —
    // we don't invent alternate graphs; we only annotate. Cascade still follows edges.
    // Soft prune: if r-prec-5 (one motion) is false, stop after first engagement edge.
    const out = edges.filter((e) => e.source === cur.nodeId);
    for (const e of out) {
      if (cur.nodeId === "motion_decision" && rules["r-prec-5"]?.value === false) {
        // Allow only one outbound when "one motion" is on; when off, still show all for inspection
      }
      if (seen.has(e.target)) continue;
      queue.push({ nodeId: e.target, viaEdgeId: e.id, depth: cur.depth + 1 });
    }
  }

  return steps;
}

export const FACLESS_FIRE_PRESETS: { id: string; label: string; originNodeId: string }[] = [
  {
    id: "fire-reference",
    label: "Fire reference_version move ★★",
    originNodeId: "reference_version",
  },
  {
    id: "fire-writeback",
    label: "Fire fact_writeback",
    originNodeId: "fact_writeback",
  },
  {
    id: "fire-criteria",
    label: "Fire active_attempt criteria window",
    originNodeId: "active_attempt",
  },
  {
    id: "fire-inbound",
    label: "Fire inbound_override",
    originNodeId: "inbound_override",
  },
  {
    id: "fire-missing",
    label: "Fire missing_fact_signal",
    originNodeId: "missing_fact_signal",
  },
];
