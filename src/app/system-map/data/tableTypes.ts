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

/** Concrete = fixed cell; templated = variables bound at firm instantiation. */
export type CellMode = "concrete" | "templated";

export type SequenceClass =
  | "optin_launch"
  | "launch_day"
  | "reengagement"
  | "reactivation";

export type TemplateCell = {
  id: string;
  label: string;
  /** Day / step token for ordering. */
  token: string;
  channel?: string;
  mode: CellMode;
  /** Variable slots when templated, e.g. firm_name, firm_logo, tower_logo, copy. */
  variables?: string[];
  concreteValue?: string;
  /** Slot references without asserting a backing table (e.g. no_login_view_link). */
  deferredSlots?: string[];
};

export type SequenceTemplate = {
  id: string;
  class: SequenceClass;
  variant: string;
  label: string;
  /** Reorderable content cells (level-1 variation). */
  cells: TemplateCell[];
  source: string;
  silences?: string[];
};

export type FirmSequenceBinding = {
  id: string;
  firmId: string;
  sequenceClass: SequenceClass;
  templateId: string;
  /** Per-firm overrides of template cells. */
  overrides?: { cellId: string; concreteValue?: string; variables?: Record<string, string> }[];
  /** Firm-scoped variable bindings for templated cells. */
  variableBindings: Record<string, string>;
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
  /** First-class: table cells are concrete or templated (v3). */
  cellMode?: CellMode | "mixed";
  /** When this MachineTable mirrors a sequence_template id. */
  templateId?: string;
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
