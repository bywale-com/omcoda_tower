import { CheckSquare } from "lucide-react";
import type { AgentStep } from "../../../../data/agentSteps";
import { AGENT_STEP_NODE_PATTERN_HOLONS } from "../../../docs/agentHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import type { Tokens } from "../../../tokens";
import {
  agentStepFieldLabel,
  agentStepInputCompact,
  agentStepNumberInputCompact,
  agentStepTextareaCompact,
} from "../stepNodeStyles";
import { AgentStepFrame } from "./AgentStepFrame";

type TaskStepNodeProps = {
  step: AgentStep;
  stepIndex: number;
  t: Tokens;
  selected: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: () => void;
  onChange: (patch: Partial<NonNullable<AgentStep["task"]>>) => void;
};

const panePadding = 10;

export function TaskStepNode({
  step,
  stepIndex,
  t,
  selected,
  collapsed,
  onToggleCollapse,
  onSelect,
  onChange,
}: TaskStepNodeProps) {
  const task = step.task ?? { priority: "medium" as const, note: "", skipAfterDays: 0 };
  const patternHighlight = useHolonPatternHighlight(
    AGENT_STEP_NODE_PATTERN_HOLONS.task.id,
    t.accent,
  );

  return (
    <AgentStepFrame
      step={step}
      stepIndex={stepIndex}
      t={t}
      selected={selected}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onSelect={onSelect}
      icon={<CheckSquare size={14} strokeWidth={2} color={t.accent} />}
      maxWidth={560}
      shellHighlight={patternHighlight}
    >
      <div style={{ padding: panePadding, maxWidth: 520 }}>
        <label style={agentStepFieldLabel(t)}>
          Task priority*
          <select
            value={task.priority}
            style={agentStepInputCompact(t)}
            onChange={(event) =>
              onChange({ priority: event.target.value as "low" | "medium" | "high" })
            }
            onClick={(event) => event.stopPropagation()}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label style={{ ...agentStepFieldLabel(t), marginTop: 10 }}>
          Task note
          <textarea
            value={task.note}
            placeholder="e.g. Ask prospects about their pain points and share our compatibility case study with them"
            style={agentStepTextareaCompact(t, 120)}
            onChange={(event) => onChange({ note: event.target.value })}
            onClick={(event) => event.stopPropagation()}
          />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 500,
            color: t.textMuted,
          }}
        >
          <input
            type="checkbox"
            checked={task.skipAfterDays > 0}
            onChange={(event) => onChange({ skipAfterDays: event.target.checked ? 1 : 0 })}
            onClick={(event) => event.stopPropagation()}
          />
          Skip tasks
          <input
            type="number"
            min={0}
            value={task.skipAfterDays}
            style={agentStepNumberInputCompact(t, 48)}
            onChange={(event) => onChange({ skipAfterDays: Number(event.target.value) || 0 })}
            onClick={(event) => event.stopPropagation()}
          />
          days after due date
        </label>
      </div>
    </AgentStepFrame>
  );
}
