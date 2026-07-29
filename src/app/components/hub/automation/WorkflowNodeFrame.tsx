import { useState, type ReactNode } from "react";
import type { WorkflowNodeType } from "../../../data/automationWorkflows";
import {
  canDeleteWorkflowNode,
  canDuplicateWorkflowNode,
} from "../../../data/automationWorkflows";
import { useAutomationEditor } from "./AutomationEditorContext";
import { WorkflowNodeToolbar } from "./WorkflowNodeToolbar";

type WorkflowNodeFrameProps = {
  nodeId: string;
  nodeType: WorkflowNodeType;
  selected: boolean;
  children: ReactNode;
  showBranchPicker?: boolean;
};

export function WorkflowNodeFrame({
  nodeId,
  nodeType,
  selected,
  children,
  showBranchPicker = false,
}: WorkflowNodeFrameProps) {
  const { t, onDeleteNode, onDuplicateNode, onAttachBlockAfterNode } = useAutomationEditor();
  const [hovered, setHovered] = useState(false);

  const canDelete = canDeleteWorkflowNode(nodeType);
  const canDuplicate = canDuplicateWorkflowNode(nodeType);
  const canAttach = nodeType !== "exit";
  const showToolbar =
    (selected || hovered) && (canDelete || canDuplicate || canAttach);

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {showToolbar && (
        <WorkflowNodeToolbar
          t={t}
          canDelete={canDelete}
          canDuplicate={canDuplicate}
          canAttach={canAttach}
          showBranchPicker={showBranchPicker}
          onDelete={() => onDeleteNode(nodeId)}
          onDuplicate={() => onDuplicateNode(nodeId)}
          onAttachBlock={(block, sourceHandle) =>
            onAttachBlockAfterNode(nodeId, block, sourceHandle)
          }
        />
      )}
    </div>
  );
}
