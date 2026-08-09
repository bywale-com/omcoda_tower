/**
 * Interactive System Map — data model.
 * Machine state-units + rules + causation. No component/face language.
 */

export type Resolution =
  | "corpus-full" /** every specified rule pulled in; no invented fills */
  | "named-silent"; /** corpus leaves a gap; silence carried */

export type RuleKind =
  | "threshold"
  | "ordering"
  | "precedence"
  | "condition"
  | "constraint"
  | "must-not"
  | "silence";

export type MapRule = {
  id: string;
  kind: RuleKind;
  label: string;
  /** Concrete value when corpus is concrete (minutes, enum, bool, …). */
  value?: string | number | boolean;
  /** Editable in the simulator when kind is threshold / condition. */
  editable?: boolean;
  /** Where the rule was pulled from (Seed/World/Story/OPERATOR/…). */
  source: string;
  resolution: Resolution;
  notes?: string;
};

export type TransitionOrigin =
  | "control"
  | "chain"
  | "faceless"
  | "hard-gate"
  | "pure-source";

export type MapTransition = {
  id: string;
  /** What writes/changes this node. */
  label: string;
  origin: TransitionOrigin;
  fromNodeId?: string;
};

export type MapRamification = {
  id: string;
  label: string;
  toNodeId?: string;
};

export type SubMapNode = {
  id: string;
  label: string;
  kind: "state" | "rule-step" | "channel" | "decision";
  faceless?: boolean;
  ruleIds?: string[];
};

export type SubMapEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  /** Optional rule id that gates this edge (sim uses current rule values). */
  ruleId?: string;
};

export type SubMap = {
  id: string;
  parentNodeId: string;
  title: string;
  nodes: SubMapNode[];
  edges: SubMapEdge[];
};

export type SystemId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | "7a"
  | "7b"
  | 8
  | 9
  | 10
  | 11
  | 12;

export type MapNode = {
  id: string;
  label: string;
  holds: string;
  systems: SystemId[];
  /** Faceless origin — changes with no control and no pane. */
  faceless: boolean;
  /** Archetype faceless (e.g. reference_version). */
  facelessArchetype?: boolean;
  transitions: MapTransition[];
  ramifications: MapRamification[];
  rules: MapRule[];
  subMapId?: string;
  resolution: Resolution;
  silences?: string[];
  /** Layout hint for top map (ring / spine). */
  layoutGroup: "spine" | "ring" | "support" | "close";
};

export type MapEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  /** Faceless causation edge. */
  faceless?: boolean;
  ring?: boolean;
};

export type CoverageIssue = {
  code: "faceless-missing-non-ui-origin" | "dead-node" | "ok";
  nodeId: string;
  detail: string;
};

export type SystemMapModel = {
  version: string;
  nodes: MapNode[];
  edges: MapEdge[];
  subMaps: SubMap[];
};
