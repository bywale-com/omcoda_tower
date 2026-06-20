import type { CSSProperties } from "react";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import type { Tokens } from "../../tokens";

export function agentStepNodeShell(t: Tokens, selected: boolean, maxWidth = 920): CSSProperties {
  return {
    width: "100%",
    maxWidth,
    borderRadius: 10,
    border: `1px solid ${selected ? t.accent : t.border}`,
    background: t.bgPrimary,
    boxShadow: selected ? `0 0 0 1px ${t.accent}` : undefined,
    overflow: "hidden",
  };
}

export const agentStepBodyText = (t: Tokens): CSSProperties => ({
  fontSize: DOCS_TREE_LABEL_SIZE,
  fontWeight: 500,
  lineHeight: 1.35,
  letterSpacing: "-0.01em",
  color: t.textPrimary,
});

export const agentStepHintText = (t: Tokens): CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.35,
  color: t.textMuted,
});

export const agentStepFieldLabel = (t: Tokens): CSSProperties => ({
  display: "block",
  marginBottom: 4,
  fontSize: 10,
  fontWeight: 600,
  color: t.textMuted,
});

export const agentStepCompactLabel = (t: Tokens): CSSProperties => ({
  fontSize: 10,
  fontWeight: 600,
  color: t.textMuted,
  whiteSpace: "nowrap",
});

export function agentStepInput(t: Tokens): CSSProperties {
  return {
    width: "100%",
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.bgPrimary,
    color: t.textPrimary,
    fontSize: DOCS_TREE_LABEL_SIZE,
    padding: "8px 10px",
    outline: "none",
  };
}

export function agentStepInputCompact(t: Tokens): CSSProperties {
  return {
    ...agentStepInput(t),
    fontSize: 12,
    padding: "4px 8px",
    lineHeight: 1.35,
  };
}

export function agentStepNumberInputCompact(t: Tokens, width = 48): CSSProperties {
  return {
    ...agentStepInputCompact(t),
    width,
    minWidth: width,
    textAlign: "center",
  };
}

export function agentStepConditionNode(t: Tokens): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 8px",
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.bgPrimary,
    color: t.textMuted,
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.35,
    maxWidth: "100%",
  };
}

export function agentStepTimingPill(t: Tokens): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
    padding: "3px 8px",
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    background: t.bgPrimary,
    color: t.textMuted,
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.35,
  };
}

export function agentStepTextarea(t: Tokens, minHeight = 120): CSSProperties {
  return {
    ...agentStepInput(t),
    minHeight,
    resize: "vertical" as const,
    lineHeight: 1.45,
  };
}

export function agentStepTextareaCompact(t: Tokens, minHeight = 200): CSSProperties {
  return {
    ...agentStepInputCompact(t),
    minHeight,
    resize: "vertical" as const,
    lineHeight: 1.4,
  };
}
