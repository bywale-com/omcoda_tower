/**
 * v2 — machine = tables + dumb runtime.
 * Every modular thing is a state | rule | sequence table.
 */

export type TableKind = "state" | "rule" | "sequence";

export type StructuralReason =
  | "hard-gate"
  | "must-not"
  | "immutable-wall"
  | "named-silence";

export type RuleRow = {
  id: string;
  /** Human label for the row. */
  label: string;
  enabled: boolean;
  /** Trigger / when clause (content, not code). */
  when?: string;
  /** Condition clause. */
  condition?: string;
  /** Target state-table id this row writes. */
  writesStateTableId?: string;
  /** Target field / value to set. */
  setValue?: string | number | boolean;
  /** Threshold numeric value when applicable. */
  threshold?: number;
  thresholdUnit?: "minutes" | "hours" | "days";
  source: string;
  /** Order among precedence/pipeline rows (also reorderable). */
  ord: number;
};

export type SequenceItem = {
  id: string;
  label: string;
  /** Opaque token the runtime consumes (e.g. "text"). */
  token: string;
};

export type StateField = {
  id: string;
  label: string;
  /** Example / enum of values the state can hold. */
  valueDomain: string;
};

export type MachineTable = {
  id: string;
  kind: TableKind;
  label: string;
  /** Node id this table primarily belongs to / materializes. */
  nodeId: string;
  modular: boolean;
  /** Required when modular=false. */
  structuralReason?: StructuralReason;
  structuralReasonDetail?: string;
  /** Rule table rows (kind=rule). */
  ruleRows?: RuleRow[];
  /** Sequence items (kind=sequence). */
  sequence?: SequenceItem[];
  /** State fields (kind=state). */
  stateFields?: StateField[];
  source: string;
};

export type TableRelationKind = "reads" | "writes" | "triggers";

export type TableRelation = {
  id: string;
  fromTableId: string;
  toTableId: string;
  kind: TableRelationKind;
  label: string;
  /** Optional link to map edge id. */
  edgeId?: string;
  faceless?: boolean;
};

export type ModularityAuditRow = {
  tableId: string;
  nodeId: string;
  kind: TableKind;
  modular: boolean;
  structuralReason?: StructuralReason;
  structuralReasonDetail?: string;
  bug?: "frozen-should-be-table";
  bugDetail?: string;
};
