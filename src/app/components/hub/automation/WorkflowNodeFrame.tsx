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
};

export function WorkflowNodeFrame({
  nodeId,
  nodeType,
  selected,
  children,
}: WorkflowNodeFrameProps) {
  const { t, onDeleteNode, onDuplicateNode } = useAutomationEditor();
  const [hovered, setHovered] = useState(false);

  const canDelete = canDeleteWorkflowNode(nodeType);
  const canDuplicate = canDuplicateWorkflowNode(nodeType);
  const showToolbar = (selected || hovered) && (canDelete || canDuplicate);

  if (!canDelete && !canDuplicate) {
    return <>{children}</>;
  }

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
          onDelete={() => onDeleteNode(nodeId)}
          onDuplicate={() => onDuplicateNode(nodeId)}
        />
      )}
    </div>
  );
}
