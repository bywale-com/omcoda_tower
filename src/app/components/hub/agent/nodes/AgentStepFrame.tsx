import { ChevronDown, ChevronUp, Clock, Ellipsis, Pencil } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { AgentStep } from "../../../../data/agentSteps";
import { agentStepTimingLabel, agentStepTitle } from "../../../../data/agentSteps";
import { AGENT_STEP_CONDITION_HOLON } from "../../../docs/agentHolons";
import { useHolonPatternHighlight, type HolonInspectTargetProps } from "../../../docs/docsHighlight";
import { DOCS_TREE_LABEL_SIZE } from "../../../docs/treeLayout";
import { cn } from "../../../ui/utils";
import type { Tokens } from "../../../tokens";
import { agentStepHintText, agentStepNodeShell, agentStepTimingPill } from "../stepNodeStyles";

type AgentStepFrameProps = {
  step: AgentStep;
  stepIndex: number;
  t: Tokens;
  selected: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: () => void;
  icon: ReactNode;
  children: ReactNode;
  maxWidth?: number;
  shellHighlight?: CSSProperties;
  shellInspectProps?: HolonInspectTargetProps;
};

export function AgentStepFrame({
  step,
  stepIndex,
  t,
  selected,
  collapsed,
  onToggleCollapse,
  onSelect,
  icon,
  children,
  maxWidth = 920,
  shellHighlight,
  shellInspectProps,
}: AgentStepFrameProps) {
  const timingLabel = agentStepTimingLabel(step);
  const { style: conditionHighlightStyle, ...conditionInspectProps } = useHolonPatternHighlight(
    AGENT_STEP_CONDITION_HOLON.id,
    t.accent,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div
        {...conditionInspectProps}
        style={{ ...agentStepTimingPill(t), ...conditionHighlightStyle }}
      >
        <Clock size={11} strokeWidth={2} />
        {timingLabel}
        <Pencil size={10} strokeWidth={2} style={{ opacity: 0.6 }} />
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        {...shellInspectProps}
        style={{ ...agentStepNodeShell(t, selected, maxWidth), ...shellHighlight }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 12px",
            borderBottom: collapsed ? "none" : `1px solid ${t.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {icon}
            <span
              style={{
                fontSize: DOCS_TREE_LABEL_SIZE,
                fontWeight: 600,
                color: t.textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {agentStepTitle(step, stepIndex)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={agentStepHintText(t)}>{timingLabel}</span>
            <button
              type="button"
              aria-label="More step actions"
              className={cn(
                "tower-chrome-menu-item inline-flex h-7 w-7 items-center justify-center rounded-sm outline-none",
                "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              )}
              style={{ color: t.textMuted }}
              onClick={(event) => event.stopPropagation()}
            >
              <Ellipsis size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label={collapsed ? "Expand step" : "Collapse step"}
              className={cn(
                "tower-chrome-menu-item inline-flex h-7 w-7 items-center justify-center rounded-sm outline-none",
                "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              )}
              style={{ color: t.textMuted }}
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse();
              }}
            >
              {collapsed ? (
                <ChevronDown size={14} strokeWidth={2} />
              ) : (
                <ChevronUp size={14} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {!collapsed ? children : null}
      </div>
    </div>
  );
}

export function AgentStepConnector({ t }: { t: Tokens }) {
  return (
    <div
      aria-hidden
      style={{
        width: 2,
        height: 28,
        background: t.border,
        margin: "4px 0",
      }}
    />
  );
}
