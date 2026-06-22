import type { CSSProperties } from "react";
import { DOCS_TREE_LABEL_SIZE } from "../../components/docs/treeLayout";
import type { Tokens } from "../../components/tokens";
import type { RegisterFlowNodeKind } from "../flows/types";

export function registerFlowNodeShell(
  t: Tokens,
  selected: boolean,
  width = 240,
): CSSProperties {
  return {
    width,
    borderRadius: 0,
    border: `2px solid ${selected ? t.accent : t.textPrimary}`,
    background: t.bgPrimary,
    boxShadow: selected ? `0 0 0 1px ${t.accent}` : undefined,
    overflow: "hidden",
  };
}

export function registerFlowKindPill(t: Tokens, kind: RegisterFlowNodeKind): CSSProperties {
  const labels: Record<RegisterFlowNodeKind, { text: string; bg: string; color: string }> = {
    control: { text: "Control", bg: "#FEF3C7", color: "#92400E" },
    service: { text: "Service", bg: t.accentBg, color: t.accent },
    provider: { text: "Provider", bg: t.hoverBg, color: t.textMuted },
    store: { text: "Store", bg: "#E0F2FE", color: "#0369A1" },
    view: { text: "View", bg: "#F3E8FF", color: "#7C3AED" },
  };
  const tone = labels[kind];
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: 0,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    background: tone.bg,
    color: tone.color,
  };
}

export const registerFlowBodyText = (t: Tokens): CSSProperties => ({
  fontSize: DOCS_TREE_LABEL_SIZE,
  fontWeight: 600,
  lineHeight: 1.35,
  letterSpacing: "-0.01em",
  color: t.textPrimary,
});

export const registerFlowHintText = (t: Tokens): CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.35,
  color: t.textMuted,
});

export const registerFlowWireMetaText = (t: Tokens): CSSProperties => ({
  fontSize: 10,
  fontWeight: 500,
  lineHeight: 1.3,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  color: t.textPrimary,
  background: t.bgPrimary,
  border: `1px solid ${t.border}`,
  padding: "3px 6px",
  borderRadius: 0,
  whiteSpace: "nowrap",
});
