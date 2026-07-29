import type { CSSProperties } from "react";
import type { WorkflowNodeRunStatus } from "../../../data/automationNodeRuntime";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import type { Tokens } from "../../tokens";

export function workflowNodeShell(
  t: Tokens,
  selected: boolean,
  width = 320,
  runStatus: WorkflowNodeRunStatus = "idle",
): CSSProperties {
  const statusBorder =
    runStatus === "success"
      ? t.success
      : runStatus === "failed"
        ? t.red
        : selected
          ? t.accent
          : t.border;

  return {
    width,
    borderRadius: 10,
    border: `1px solid ${statusBorder}`,
    background: t.bgPrimary,
    boxShadow:
      runStatus === "success"
        ? `0 0 0 1px ${t.success}`
        : runStatus === "failed"
          ? `0 0 0 1px ${t.red}`
          : selected
            ? `0 0 0 1px ${t.accent}`
            : undefined,
    overflow: runStatus === "running" ? "visible" : "hidden",
    position: "relative",
  };
}

export function workflowPill(t: Tokens, tone: "accent" | "muted" | "danger"): CSSProperties {
  const bg =
    tone === "accent" ? t.accentBg : tone === "danger" ? `${t.red}22` : t.hoverBg;
  const color = tone === "accent" ? t.accent : tone === "danger" ? t.red : t.textMuted;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    background: bg,
    color,
  };
}

export const workflowBodyText = (t: Tokens): CSSProperties => ({
  fontSize: DOCS_TREE_LABEL_SIZE,
  fontWeight: 500,
  lineHeight: 1.35,
  letterSpacing: "-0.01em",
  color: t.textPrimary,
});

export const workflowHintText = (t: Tokens): CSSProperties => ({
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.35,
  color: t.textMuted,
});
