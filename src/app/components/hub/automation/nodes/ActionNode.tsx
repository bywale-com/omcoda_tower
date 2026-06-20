import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { NotionIcon } from "../../../icons/NotionIcon";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { workflowBodyText, workflowHintText, workflowNodeShell, workflowPill } from "../workflowNodeStyles";

const ACTION_ICONS: Record<string, "directional-sign" | "list" | "checkmark-list" | "bell"> = {
  enroll_sequence: "directional-sign",
  manage_lists: "list",
  assign_task: "checkmark-list",
  notify_consultant: "bell",
};

export function ActionNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t } = useAutomationEditor();
  const patternHighlight = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.action.id,
    t.accent,
  );
  const icon = ACTION_ICONS[data.actionType ?? "enroll_sequence"] ?? "directional-sign";

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="action" selected={!!selected}>
      <div style={{ ...workflowNodeShell(t, selected, 300), ...patternHighlight }}>
      <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
      <div style={{ padding: "10px 12px 0" }}>
        <span style={workflowPill(t, "muted")}>Action</span>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <NotionIcon name={icon} size={16} color={t.textMuted} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...workflowBodyText(t), fontWeight: 600, marginBottom: 4 }}>{data.label}</div>
          {!data.configured ? (
            <button
              type="button"
              style={{
                ...workflowPill(t, "danger"),
                border: "none",
                cursor: "pointer",
                padding: "6px 10px",
              }}
            >
              Add configuration
            </button>
          ) : (
            <span style={workflowHintText(t)}>{data.actionSummary}</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
      </div>
    </WorkflowNodeFrame>
  );
}
