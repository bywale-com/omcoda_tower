import { CheckSquare, ChevronDown, ChevronUp, Clock, GripVertical, Mail, Pencil } from "lucide-react";
import { useState } from "react";
import type { AgentStepType } from "../../../data/agentDefinitions";
import type { AgentStep } from "../../../data/agentSteps";
import {
  agentStepRailSummary,
  agentStepTimingLabel,
  agentStepTitle,
} from "../../../data/agentSteps";
import {
  AGENT_STEP_CONDITION_HOLON,
  AGENT_STEP_RAIL_HOLON,
} from "../../docs/agentHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { useHolonPatternHighlight } from "../../docs/docsHighlight";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { AgentAddStepMenu } from "./AgentAddStepMenu";
import { agentStepConditionNode } from "./stepNodeStyles";

type AgentStepRailProps = {
  steps: AgentStep[];
  selectedStepId: string | null;
  t: Tokens;
  onSelectStep: (stepId: string) => void;
  onAddStep: (step: AgentStepType, afterIndex: number | null) => void;
};

function stepIcon(step: AgentStep, t: Tokens) {
  if (step.kind === "email") {
    return <Mail size={13} strokeWidth={2} color={t.accent} />;
  }
  return <CheckSquare size={13} strokeWidth={2} color={t.accent} />;
}

function RailConditionNode({ step, t }: { step: AgentStep; t: Tokens }) {
  const { style: conditionHighlightStyle, ...conditionInspectProps } = useHolonPatternHighlight(
    AGENT_STEP_CONDITION_HOLON.id,
    t.accent,
  );

  return (
    <div
      {...conditionInspectProps}
      style={{ ...agentStepConditionNode(t), ...conditionHighlightStyle }}
    >
      <Clock size={10} strokeWidth={2} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {agentStepTimingLabel(step)}
      </span>
      <Pencil size={9} strokeWidth={2} style={{ opacity: 0.55, flexShrink: 0 }} />
    </div>
  );
}

export function AgentStepRail({
  steps,
  selectedStepId,
  t,
  onSelectStep,
  onAddStep,
}: AgentStepRailProps) {
  const [collapsedRailIds, setCollapsedRailIds] = useState<Set<string>>(() => new Set());

  const toggleRailCollapse = (stepId: string) => {
    setCollapsedRailIds((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  return (
    <HolonBoundary
      id={AGENT_STEP_RAIL_HOLON.id}
      label={AGENT_STEP_RAIL_HOLON.label}
      icon={AGENT_STEP_RAIL_HOLON.icon}
      order={AGENT_STEP_RAIL_HOLON.order}
      t={t}
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: t.bgPrimary,
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {steps.map((step, index) => {
          const selected = step.id === selectedStepId;
          const collapsed = collapsedRailIds.has(step.id);

          return (
            <div
              key={step.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectStep(step.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectStep(step.id);
                }
              }}
              className={cn(
                "tower-chrome-menu-item cursor-pointer outline-none",
                "hover:bg-accent/60 hover:text-accent-foreground",
              )}
              style={{
                width: "100%",
                borderBottom: `1px solid ${t.border}`,
                background: selected ? t.activeRowBg : t.bgPrimary,
                boxShadow: selected ? `inset 2px 0 0 ${t.accent}` : undefined,
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 8px 4px",
                }}
              >
                <GripVertical size={13} strokeWidth={2} color={t.textDim} />
                {stepIcon(step, t)}
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: DOCS_TREE_LABEL_SIZE,
                    fontWeight: 600,
                    color: t.textPrimary,
                    letterSpacing: "-0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agentStepTitle(step, index)}
                </span>
                <button
                  type="button"
                  aria-label={collapsed ? "Expand step in rail" : "Collapse step in rail"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleRailCollapse(step.id);
                  }}
                  className={cn(
                    "tower-chrome-menu-item inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm outline-none",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  )}
                  style={{ color: t.textMuted }}
                >
                  {collapsed ? (
                    <ChevronDown size={13} strokeWidth={2} />
                  ) : (
                    <ChevronUp size={13} strokeWidth={2} />
                  )}
                </button>
              </div>

              <div style={{ padding: "0 8px 6px 27px" }}>
                <RailConditionNode step={step} t={t} />
              </div>

              {!collapsed ? (
                <div style={{ padding: "0 8px 8px 27px" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: t.textPrimary,
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {agentStepRailSummary(step)}
                  </div>
                  {step.kind === "email" ? (
                    <div style={{ marginTop: 6, fontSize: 10, color: t.accent }}>+ Add A/B test</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: 10,
          borderTop: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <AgentAddStepMenu
          t={t}
          compact
          align="start"
          onAddStep={(stepType) => onAddStep(stepType, steps.length - 1)}
        />
      </div>
    </HolonBoundary>
  );
}
