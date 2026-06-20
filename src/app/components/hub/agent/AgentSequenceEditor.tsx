import { useCallback, useEffect, useState } from "react";
import type { AgentStepType } from "../../../data/agentDefinitions";
import type { AgentStep } from "../../../data/agentSteps";
import { insertAgentStep } from "../../../data/agentSteps";
import type { Tokens } from "../../tokens";
import { AgentSequenceCanvas } from "./AgentSequenceCanvas";
import { AgentStepRail } from "./AgentStepRail";

type AgentSequenceEditorProps = {
  agentId: string;
  steps: AgentStep[];
  t: Tokens;
  railOpen: boolean;
  onStepsChange: (steps: AgentStep[]) => void;
};

export function AgentSequenceEditor({
  agentId,
  steps,
  t,
  railOpen,
  onStepsChange,
}: AgentSequenceEditorProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(steps[0]?.id ?? null);
  const [collapsedStepIds, setCollapsedStepIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSelectedStepId(steps[0]?.id ?? null);
    setCollapsedStepIds(new Set());
  }, [agentId]);

  useEffect(() => {
    if (selectedStepId && !steps.some((step) => step.id === selectedStepId)) {
      setSelectedStepId(steps[0]?.id ?? null);
    }
  }, [steps, selectedStepId]);

  const handleAddStep = useCallback(
    (stepType: AgentStepType, afterIndex: number | null) => {
      if (stepType.id !== "email" && stepType.id !== "consultant_task") {
        return;
      }

      const next = insertAgentStep(steps, stepType.id, afterIndex);
      const created = next[afterIndex === null ? 0 : afterIndex + 1];
      onStepsChange(next);
      if (created) {
        setSelectedStepId(created.id);
      }
    },
    [steps, onStepsChange],
  );

  const handleUpdateStep = useCallback(
    (stepId: string, updater: (step: AgentStep) => AgentStep) => {
      onStepsChange(steps.map((step) => (step.id === stepId ? updater(step) : step)));
    },
    [steps, onStepsChange],
  );

  const handleToggleStepCollapse = useCallback((stepId: string) => {
    setCollapsedStepIds((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", minWidth: 0 }}>
      {railOpen ? (
        <AgentStepRail
          steps={steps}
          selectedStepId={selectedStepId}
          t={t}
          onSelectStep={setSelectedStepId}
          onAddStep={handleAddStep}
        />
      ) : null}
      <AgentSequenceCanvas
        steps={steps}
        selectedStepId={selectedStepId}
        collapsedStepIds={collapsedStepIds}
        t={t}
        onSelectStep={setSelectedStepId}
        onToggleStepCollapse={handleToggleStepCollapse}
        onUpdateStep={handleUpdateStep}
        onAddStep={handleAddStep}
      />
    </div>
  );
}
