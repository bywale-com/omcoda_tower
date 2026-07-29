import { getAutomationConstant } from "./automationConstants";

export type ConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "exists"
  | "not_exists";

export type ConditionRightValue =
  | { kind: "constant"; constantKey: string }
  | { kind: "literal"; value: string }
  | { kind: "field"; path: string };

export type IfConditionRow = {
  id: string;
  leftField: string;
  operator: ConditionOperator;
  right: ConditionRightValue;
};

export type IfConditionConfig = {
  conditions: IfConditionRow[];
  combinator: "and" | "or";
  convertTypes?: boolean;
};

export type IfBranchOutput = {
  branches: {
    true: unknown | null;
    false: unknown | null;
  };
  combinator: "and" | "or";
  routedAt: string;
};

export function isIfBranchOutput(value: unknown): value is IfBranchOutput {
  return (
    value != null &&
    typeof value === "object" &&
    "branches" in value &&
    typeof (value as IfBranchOutput).branches === "object"
  );
}

export const CONDITION_OPERATORS: { id: ConditionOperator; label: string; phrase: string }[] = [
  { id: "eq", label: "=", phrase: "is equal to" },
  { id: "neq", label: "≠", phrase: "is not equal to" },
  { id: "gt", label: ">", phrase: "is greater than" },
  { id: "gte", label: "≥", phrase: "is greater than or equal to" },
  { id: "lt", label: "<", phrase: "is less than" },
  { id: "lte", label: "≤", phrase: "is less than or equal to" },
  { id: "contains", label: "∋", phrase: "contains" },
  { id: "not_contains", label: "∌", phrase: "does not contain" },
  { id: "exists", label: "∃", phrase: "exists" },
  { id: "not_exists", label: "∄", phrase: "does not exist" },
];

function newRowId(): string {
  return `cond-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyIfConditionRow(): IfConditionRow {
  return {
    id: newRowId(),
    leftField: "",
    operator: "eq",
    right: { kind: "constant", constantKey: "cec.min_hours" },
  };
}

export function emptyIfConditionConfig(): IfConditionConfig {
  return {
    conditions: [
      {
        id: newRowId(),
        leftField: "client_data.information.canadian_skilled_hours",
        operator: "gte",
        right: { kind: "constant", constantKey: "cec.min_hours" },
      },
    ],
    combinator: "and",
    convertTypes: false,
  };
}

/** Migrate legacy single-field configs from persisted workflows. */
export function normalizeIfConditionConfig(config?: IfConditionConfig | LegacyIfConditionConfig): IfConditionConfig {
  if (!config) return emptyIfConditionConfig();
  if ("conditions" in config && Array.isArray(config.conditions)) {
    return {
      combinator: config.combinator ?? "and",
      convertTypes: config.convertTypes ?? false,
      conditions: config.conditions.length > 0 ? config.conditions : [emptyIfConditionRow()],
    };
  }
  const legacy = config as LegacyIfConditionConfig;
  if (legacy.leftField) {
    return {
      combinator: "and",
      convertTypes: false,
      conditions: [
        {
          id: newRowId(),
          leftField: legacy.leftField,
          operator: legacy.operator ?? "eq",
          right: { kind: "constant", constantKey: legacy.rightConstantKey ?? "cec.min_hours" },
        },
      ],
    };
  }
  return emptyIfConditionConfig();
}

type LegacyIfConditionConfig = {
  leftField?: string;
  operator?: ConditionOperator;
  rightConstantKey?: string;
};

export function isIfConditionConfigured(config?: IfConditionConfig | LegacyIfConditionConfig): boolean {
  const normalized = normalizeIfConditionConfig(config);
  return normalized.conditions.some(
    (row) => row.leftField.trim() && isRightValueConfigured(row.right),
  );
}

function isRightValueConfigured(right: ConditionRightValue): boolean {
  switch (right.kind) {
    case "constant":
      return Boolean(right.constantKey.trim());
    case "literal":
      return right.value.trim().length > 0;
    case "field":
      return Boolean(right.path.trim());
  }
}

function formatRightSummary(right: ConditionRightValue): string {
  switch (right.kind) {
    case "constant": {
      const constant = getAutomationConstant(right.constantKey);
      return constant ? `${constant.key} (${constant.value})` : right.constantKey;
    }
    case "literal":
      return `"${right.value}"`;
    case "field":
      return right.path;
  }
}

export function formatIfConditionRowSummary(row: IfConditionRow): string {
  const op = CONDITION_OPERATORS.find((item) => item.id === row.operator);
  const phrase = op?.phrase ?? row.operator;
  return `${row.leftField} ${phrase} ${formatRightSummary(row.right)}`;
}

export function formatIfConditionSummary(config?: IfConditionConfig | LegacyIfConditionConfig): string {
  const normalized = normalizeIfConditionConfig(config);
  const configured = normalized.conditions.filter(
    (row) => row.leftField.trim() && isRightValueConfigured(row.right),
  );
  if (configured.length === 0) return "Add condition";
  if (configured.length === 1) return formatIfConditionRowSummary(configured[0]);
  const join = normalized.combinator === "or" ? " OR " : " AND ";
  const preview = configured.slice(0, 2).map(formatIfConditionRowSummary).join(join);
  if (configured.length > 2) return `${preview} +${configured.length - 2}`;
  return preview;
}

function readPath(data: unknown, path: string): unknown {
  if (!path.trim()) return undefined;

  if (data && typeof data === "object" && "items" in (data as object)) {
    const pull = data as { items: unknown[] };
    if (Array.isArray(pull.items) && pull.items.length > 0) {
      const parts = path.split(".").filter(Boolean);
      if (parts.length >= 1) {
        const classId = parts[0];
        const item = pull.items.find(
          (entry) =>
            entry &&
            typeof entry === "object" &&
            classId in (entry as Record<string, unknown>),
        ) as Record<string, unknown> | undefined;
        if (item && item[classId]) {
          let current: unknown = item[classId];
          for (let i = 1; i < parts.length; i++) {
            if (current == null || typeof current !== "object") return undefined;
            current = (current as Record<string, unknown>)[parts[i]];
          }
          return current;
        }
      }
    }
  }

  return readPathLegacy(data, path);
}

function readPathFromItem(item: unknown, path: string): unknown {
  if (!path.trim() || item == null) return undefined;
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return undefined;

  let current: unknown = item;
  if (
    current &&
    typeof current === "object" &&
    parts[0] in (current as Record<string, unknown>) &&
    !("items" in (current as object))
  ) {
    current = (current as Record<string, unknown>)[parts[0]];
    for (let i = 1; i < parts.length; i++) {
      if (current == null || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[parts[i]];
    }
    return current;
  }

  return readPath(item, path);
}

function readPathLegacy(data: unknown, path: string): unknown {
  if (!path.trim()) return undefined;
  if (data == null || typeof data !== "object") return undefined;
  const parts = path.split(".").filter(Boolean);
  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function resolveRightValue(
  right: ConditionRightValue,
  input: unknown,
  item?: unknown,
): unknown {
  switch (right.kind) {
    case "constant": {
      const constant = getAutomationConstant(right.constantKey);
      return constant?.value;
    }
    case "literal":
      return right.value;
    case "field":
      return item != null
        ? readPathFromItem(item, right.path)
        : readPath(input, right.path);
  }
}

function coerceComparable(
  left: unknown,
  right: unknown,
  convertTypes: boolean,
): { left: unknown; right: unknown } {
  if (!convertTypes) return { left, right };
  const lNum = typeof left === "number" ? left : Number(left);
  const rNum = typeof right === "number" ? right : Number(right);
  if (Number.isFinite(lNum) && Number.isFinite(rNum)) {
    return { left: lNum, right: rNum };
  }
  return { left, right };
}

function compare(
  left: unknown,
  operator: ConditionOperator,
  right: unknown,
  convertTypes = false,
): boolean {
  const coerced = coerceComparable(left, right, convertTypes);
  left = coerced.left;
  right = coerced.right;

  if (operator === "exists") return left !== undefined && left !== null;
  if (operator === "not_exists") return left === undefined || left === null;

  const lNum = typeof left === "number" ? left : Number(left);
  const rNum = typeof right === "number" ? right : Number(right);
  const bothNumeric = Number.isFinite(lNum) && Number.isFinite(rNum);

  if (bothNumeric) {
    switch (operator) {
      case "gte":
        return lNum >= rNum;
      case "gt":
        return lNum > rNum;
      case "lte":
        return lNum <= rNum;
      case "lt":
        return lNum < rNum;
      case "eq":
        return lNum === rNum;
      case "neq":
        return lNum !== rNum;
      default:
        break;
    }
  }

  const lStr = left == null ? "" : String(left);
  const rStr = right == null ? "" : String(right);

  switch (operator) {
    case "eq":
      return left === right || lStr === rStr;
    case "neq":
      return left !== right && lStr !== rStr;
    case "contains":
      return lStr.toLowerCase().includes(rStr.toLowerCase());
    case "not_contains":
      return !lStr.toLowerCase().includes(rStr.toLowerCase());
    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return false;
    default:
      return false;
  }
}

function evaluateRow(
  row: IfConditionRow,
  input: unknown,
  item: unknown | undefined,
  convertTypes: boolean,
): boolean {
  if (!row.leftField.trim()) return false;
  const leftValue = item != null
    ? readPathFromItem(item, row.leftField)
    : readPath(input, row.leftField);
  const rightValue = resolveRightValue(row.right, input, item);
  return compare(leftValue, row.operator, rightValue, convertTypes);
}

function evaluateConfigOnItem(
  config: IfConditionConfig,
  input: unknown,
  item?: unknown,
): boolean {
  const rows = config.conditions.filter(
    (row) => row.leftField.trim() && isRightValueConfigured(row.right),
  );
  if (rows.length === 0) return false;
  const convertTypes = config.convertTypes ?? false;
  const results = rows.map((row) => evaluateRow(row, input, item, convertTypes));
  return config.combinator === "or" ? results.some(Boolean) : results.every(Boolean);
}

function clonePullWithItems(input: unknown, items: unknown[]): unknown {
  if (input && typeof input === "object" && "items" in (input as object)) {
    return {
      ...(input as Record<string, unknown>),
      items,
      itemCount: items.length,
    };
  }
  return items.length > 0 ? items[0] : null;
}

/**
 * Split upstream input across true / false branches.
 * Items that pass route to true; failures route to false.
 */
export function splitInputByIfConditions(
  input: unknown,
  config?: IfConditionConfig | LegacyIfConditionConfig,
): IfBranchOutput {
  const normalized = normalizeIfConditionConfig(config);

  if (input && typeof input === "object" && Array.isArray((input as { items?: unknown[] }).items)) {
    const pull = input as { items: unknown[] };
    const trueItems: unknown[] = [];
    const falseItems: unknown[] = [];
    for (const item of pull.items) {
      if (evaluateConfigOnItem(normalized, input, item)) {
        trueItems.push(item);
      } else {
        falseItems.push(item);
      }
    }
    return {
      branches: {
        true: clonePullWithItems(input, trueItems),
        false: clonePullWithItems(input, falseItems),
      },
      combinator: normalized.combinator,
      routedAt: new Date().toISOString(),
    };
  }

  const pass = evaluateConfigOnItem(normalized, input, undefined);
  return {
    branches: {
      true: pass ? input : null,
      false: pass ? null : input,
    },
    combinator: normalized.combinator,
    routedAt: new Date().toISOString(),
  };
}

/** @deprecated Use splitInputByIfConditions — kept for any legacy callers */
export function evaluateIfCondition(
  config: IfConditionConfig | LegacyIfConditionConfig,
  input: unknown,
): { pass: boolean; summary: string } {
  const normalized = normalizeIfConditionConfig(config);
  const pass = evaluateConfigOnItem(normalized, input, undefined);
  return {
    pass,
    summary: formatIfConditionSummary(normalized),
  };
}
