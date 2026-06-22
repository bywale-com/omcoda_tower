import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { workflowBodyText, workflowHintText, workflowNodeShell, workflowPill } from "../workflowNodeStyles";

export function BranchNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t } = useAutomationEditor();
  const { style: patternHighlightStyle, ...patternInspectProps } = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.branch.id,
    t.accent,
  );
  const isDelay = data.branchKind === "delay";

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="branch" selected={!!selected}>
      <div
        {...patternInspectProps}
        style={{ ...workflowNodeShell(t, selected, isDelay ? 280 : 320), ...patternHighlightStyle }}
      >
      <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
      <div style={{ padding: "10px 12px 0" }}>
        <span style={workflowPill(t, "muted")}>
          <GitBranch size={12} strokeWidth={2} />
          Then do this
        </span>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ ...workflowBodyText(t), fontWeight: 600, marginBottom: 6 }}>{data.label}</div>
        {isDelay ? (
          <span style={workflowHintText(t)}>Wait · {data.delayLabel ?? "1 hour"}</span>
        ) : (
          <>
            <span style={{ ...workflowHintText(t), display: "block", marginBottom: 8 }}>
              Filter split criteria
            </span>
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
              <span style={workflowHintText(t)}>{data.filterSummary}</span>
            )}
          </>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
      </div>
    </WorkflowNodeFrame>
  );
}
