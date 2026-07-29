import type { HowGraph } from "./types";
import { CONSULTANT_ON_TOWER_GRAPH } from "./consultantOnTower";
import { TOWER_CORE_OUTCOME_GRAPH } from "./towerCoreOutcome";

/** Epics sorted by epicOrder — universal left-to-right priority. */
export const HOW_GRAPHS: HowGraph[] = [CONSULTANT_ON_TOWER_GRAPH, TOWER_CORE_OUTCOME_GRAPH].sort(
  (a, b) => a.epicOrder - b.epicOrder,
);

export function getHowGraph(id: string): HowGraph | undefined {
  return HOW_GRAPHS.find((graph) => graph.id === id);
}
