import { useState } from "react";
import type { ConsultantTask } from "../../data/tasks";
import {
  TASK_LABEL_HOLON,
  TASK_META_HOLON,
  TASK_ROW_HOLON,
} from "../docs/boardBodyHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import {
  DOCS_TREE_ACTIVE_BORDER,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
} from "../docs/treeLayout";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "../contacts/directoryRowStyles";
import type { Tokens } from "../tokens";
import { TaskStatusToggle } from "./TaskStatusToggle";

export function TaskRow({
  task,
  isActive,
  t,
  onTaskClick,
  onToggleStatus,
}: {
  task: ConsultantTask;
  isActive: boolean;
  t: Tokens;
  onTaskClick: (task: ConsultantTask) => void;
  onToggleStatus: (taskId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isOpen = task.status === "open";
  const isDocsHighlighted = useIsDocsTarget(TASK_ROW_HOLON.id);
  const isLabelHighlighted = useIsDocsTarget(TASK_LABEL_HOLON.id);
  const isMetaHighlighted = useIsDocsTarget(TASK_META_HOLON.id);
  const labelColor = isOpen ? t.textPrimary : t.textMuted;

  return (
    <div
      onClick={() => onTaskClick(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${task.label} · ${task.clientName} · opens in Activity`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: "pointer",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        borderLeft: isActive
          ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}`
          : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
        ...docsTargetHighlight(isDocsHighlighted, t.accent),
      }}
    >
      <TaskStatusToggle
        isOpen={isOpen}
        t={t}
        onToggle={() => onToggleStatus(task.id)}
      />

      <span
        style={{
          ...directoryRowPrimaryStyle(labelColor),
          textDecoration: isOpen ? "none" : "line-through",
          borderRadius: 4,
          ...docsTargetHighlight(isLabelHighlighted, t.accent),
        }}
        title={task.label}
      >
        {task.label}
      </span>

      <span
        style={{
          ...directoryRowMetaStyle(t),
          borderRadius: 4,
          ...docsTargetHighlight(isMetaHighlighted, t.accent),
        }}
      >
        {task.createdAt}
      </span>
    </div>
  );
}
