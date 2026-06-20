import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { TRIGGER_EVENTS_BY_TARGET } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { NotionIcon } from "../../../icons/NotionIcon";
import { useAutomationEditor } from "../AutomationEditorContext";
import { workflowBodyText, workflowHintText, workflowNodeShell, workflowPill } from "../workflowNodeStyles";

export function TriggerNode({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t } = useAutomationEditor();
  const patternHighlight = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.trigger.id,
    t.accent,
  );
  const eventLabel = data.triggerEvent
    ? TRIGGER_EVENTS_BY_TARGET[data.target ?? "audit"]?.find((e) => e.id === data.triggerEvent)?.label
    : undefined;

  return (
    <div style={{ ...workflowNodeShell(t, selected), ...patternHighlight }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ padding: "10px 12px 0" }}>
        <span style={workflowPill(t, "accent")}>
          <Zap size={12} strokeWidth={2} />
          When this happens
        </span>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <NotionIcon name="lightning-bolt" size={16} color={t.accent} />
          <span style={{ ...workflowBodyText(t), fontWeight: 600 }}>{data.label}</span>
        </div>
        {!data.configured ? (
          <button
            type="button"
            style={{
              ...workflowPill(t, "danger"),
              border: "none",
              cursor: "pointer",
              width: "100%",
              justifyContent: "center",
              padding: "6px 10px",
            }}
          >
            Add configuration
          </button>
        ) : (
          <span style={workflowHintText(t)}>
            Target · {data.target ?? "audit"} · {eventLabel ?? data.triggerEvent}
          </span>
        )}
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <div style={{ ...workflowHintText(t), textTransform: "uppercase", fontSize: 10, marginBottom: 6 }}>
            Enrollment criteria
          </div>
          <p style={{ ...workflowHintText(t), margin: 0 }}>{data.enrollmentHint}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
    </div>
  );
}
