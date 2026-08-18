import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { formatGetSummary } from "../../../../data/automationGet";
import { NotionIcon } from "../../../icons/NotionIcon";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { workflowBodyText, workflowHintText, workflowNodeShell, workflowPill } from "../workflowNodeStyles";

export function GetNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t } = useAutomationEditor();

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="get" selected={!!selected}>
      <div style={workflowNodeShell(t, selected, 300)}>
        <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
        <div style={{ padding: "10px 12px 0" }}>
          <span style={workflowPill(t, "accent")}>
            <NotionIcon name="magnifying-glass" size={12} color={t.accent} />
            Get
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ ...workflowBodyText(t), fontWeight: 600, marginBottom: 4 }}>{data.label}</div>
          <div style={workflowHintText(t)}>{formatGetSummary(data)}</div>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
      </div>
    </WorkflowNodeFrame>
  );
}
