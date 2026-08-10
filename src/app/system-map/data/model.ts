import { SYSTEM_MAP_EDGES } from "./edges";
import { SYSTEM_MAP_NODES } from "./nodes";
import { SYSTEM_MAP_SUBMAPS } from "./submaps";
import type { MapNode, MapRule, SystemMapModel } from "./types";
import { runCoverageChecks, coverageSummary } from "./coverage";

export const SYSTEM_MAP_MODEL: SystemMapModel = {
  version: "3.0.0-templates-binding",
  nodes: SYSTEM_MAP_NODES,
  edges: SYSTEM_MAP_EDGES,
  subMaps: SYSTEM_MAP_SUBMAPS,
};

export function getNode(id: string): MapNode | undefined {
  return SYSTEM_MAP_MODEL.nodes.find((n) => n.id === id);
}

export function resolutionReport(model: SystemMapModel = SYSTEM_MAP_MODEL) {
  const full = model.nodes.filter((n) => n.resolution === "corpus-full");
  const silent = model.nodes.filter((n) => n.resolution === "named-silent");
  const faceless = model.nodes.filter((n) => n.faceless);
  const withSub = model.nodes.filter((n) => n.subMapId);
  const coverage = coverageSummary(runCoverageChecks(model));
  return {
    nodeCount: model.nodes.length,
    edgeCount: model.edges.length,
    subMapCount: model.subMaps.length,
    corpusFull: full.map((n) => n.id),
    namedSilent: silent.map((n) => ({
      id: n.id,
      silences: n.silences ?? [],
    })),
    facelessCount: faceless.length,
    facelessIds: faceless.map((n) => n.id),
    fractalParents: withSub.map((n) => n.id),
    coverage,
  };
}

/** Clone rules for editable sim state. */
export function cloneEditableRules(model: SystemMapModel = SYSTEM_MAP_MODEL): Record<string, MapRule> {
  const out: Record<string, MapRule> = {};
  for (const n of model.nodes) {
    for (const r of n.rules) {
      out[r.id] = { ...r };
    }
  }
  return out;
}
