import { useCallback, useMemo, useRef } from "react";
import type { AgentStepType } from "../../../data/agentDefinitions";
import type { AgentStep } from "../../../data/agentSteps";
import {
  AGENT_SEQUENCE_CANVAS_CHILD_HOLONS,
  AGENT_SEQUENCE_CANVAS_HOLON,
  AGENT_STEP_NODE_PATTERN_HOLONS,
  AGENT_STEP_CONDITION_HOLON,
  AGENT_ADD_STEP_HOLON,
} from "../../docs/agentHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { RegisterContentChildHolonsFromConfig } from "../../docs/RegisterContentChildHolons";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import type { Tokens } from "../../tokens";
import { AgentAddStepMenu } from "./AgentAddStepMenu";
import { EmailStepNode } from "./nodes/EmailStepNode";
import { AgentStepConnector } from "./nodes/AgentStepFrame";
import { TaskStepNode } from "./nodes/TaskStepNode";

type AgentSequenceCanvasProps = {
  steps: AgentStep[];
  selectedStepId: string | null;
  collapsedStepIds: Set<string>;
  t: Tokens;
  onSelectStep: (stepId: string) => void;
  onToggleStepCollapse: (stepId: string) => void;
  onUpdateStep: (stepId: string, updater: (step: AgentStep) => AgentStep) => void;
  onAddStep: (step: AgentStepType, afterIndex: number | null) => void;
};

export function AgentSequenceCanvas({
  steps,
  selectedStepId,
  collapsedStepIds,
  t,
  onSelectStep,
  onToggleStepCollapse,
  onUpdateStep,
  onAddStep,
}: AgentSequenceCanvasProps) {
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerStepRef = useCallback((stepId: string, node: HTMLDivElement | null) => {
    stepRefs.current[stepId] = node;
  }, []);

  const canvasChildInView = useMemo(
    () => ({
      [AGENT_STEP_NODE_PATTERN_HOLONS.email.id]: steps.some((step) => step.kind === "email"),
      [AGENT_STEP_NODE_PATTERN_HOLONS.task.id]: steps.some((step) => step.kind === "consultant_task"),
      [AGENT_STEP_CONDITION_HOLON.id]: steps.length > 0,
      [AGENT_ADD_STEP_HOLON.id]: steps.length > 0,
    }),
    [steps],
  );

  return (
    <HolonBoundary
      id={AGENT_SEQUENCE_CANVAS_HOLON.id}
      label={AGENT_SEQUENCE_CANVAS_HOLON.label}
      icon={AGENT_SEQUENCE_CANVAS_HOLON.icon}
      order={AGENT_SEQUENCE_CANVAS_HOLON.order}
      t={t}
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgSecondary,
      }}
    >
      <RegisterContentChildHolonsFromConfig
        children={AGENT_SEQUENCE_CANVAS_CHILD_HOLONS}
        inView={steps.length > 0}
        inViewById={canvasChildInView}
        t={t}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 24px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {steps.length === 0 ? (
          <div style={{ color: t.textMuted, fontSize: DOCS_TREE_LABEL_SIZE }}>
            Add a step to start building this agent.
          </div>
        ) : (
          steps.map((step, index) => {
            const selected = step.id === selectedStepId;
            const collapsed = collapsedStepIds.has(step.id);
            const commonProps = {
              step,
              stepIndex: index,
              t,
              selected,
              collapsed,
              onToggleCollapse: () => onToggleStepCollapse(step.id),
              onSelect: () => onSelectStep(step.id),
            };

            return (
              <div
                key={step.id}
                ref={(node) => registerStepRef(step.id, node)}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {index > 0 ? <AgentStepConnector t={t} /> : null}
                {step.kind === "email" ? (
                  <EmailStepNode
                    {...commonProps}
                    onChange={(patch) =>
                      onUpdateStep(step.id, (current) => ({
                        ...current,
                        email: { ...(current.email ?? { subject: "", body: "", threadType: "new" }), ...patch },
                      }))
                    }
                  />
                ) : (
                  <TaskStepNode
                    {...commonProps}
                    onChange={(patch) =>
                      onUpdateStep(step.id, (current) => ({
                        ...current,
                        task: {
                          ...(current.task ?? { priority: "medium", note: "", skipAfterDays: 0 }),
                          ...patch,
                        },
                      }))
                    }
                  />
                )}
                <AgentStepConnector t={t} />
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  <AgentAddStepMenu
                    t={t}
                    compact
                    align="center"
                    onAddStep={(stepType) => onAddStep(stepType, index)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </HolonBoundary>
  );
}
