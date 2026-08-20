/** If / Switch compare. Chip pointer or typed text. Always text at resolve. SA 019. */

export type CompareOperand =
  | { mode: "chip"; slot: string }
  | { mode: "text"; value: string };

export type CompareOp = "eq" | "neq" | "exists";

export type Compare = {
  left: CompareOperand;
  op: CompareOp;
  right: CompareOperand;
};

export type SwitchPath = {
  id: string;
  sourceHandle: string;
  label?: string;
  compare: Compare;
};

export const COMPARE_OPS: { id: CompareOp; label: string }[] = [
  { id: "eq", label: "is equal to" },
  { id: "neq", label: "is not equal to" },
  { id: "exists", label: "exists" },
];

export function emptyOperand(): CompareOperand {
  return { mode: "text", value: "" };
}

export function emptyCompare(): Compare {
  return { left: emptyOperand(), op: "eq", right: emptyOperand() };
}

export function newSwitchPath(): SwitchPath {
  const id = `path-${Math.random().toString(36).slice(2, 9)}`;
  return { id, sourceHandle: id, label: "", compare: emptyCompare() };
}

export function operandSlot(prefix: string, side: "left" | "right"): string {
  return `${prefix}-${side}`;
}
