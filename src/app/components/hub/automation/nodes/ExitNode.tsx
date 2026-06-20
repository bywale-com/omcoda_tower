import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { CircleCheck } from "lucide-react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";

export function ExitNode({ id, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t } = useAutomationEditor();
  const patternHighlight = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.exit.id,
    t.accent,
  );

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="exit" selected={!!selected}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          ...patternHighlight,
          borderRadius: 8,
          padding: 4,
        }}
      >
      <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `2px solid ${selected ? t.accent : t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.bgPrimary,
        }}
      >
        <CircleCheck size={16} strokeWidth={2} color={t.textMuted} />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: t.textMuted,
          letterSpacing: "-0.01em",
        }}
      >
        Exit
      </span>
      </div>
    </WorkflowNodeFrame>
  );
}
