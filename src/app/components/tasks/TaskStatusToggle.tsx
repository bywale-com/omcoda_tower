import { Check, CheckSquare } from "lucide-react";
import { TASK_STATUS_TOGGLE_HOLON } from "../docs/boardBodyHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_ICON_SLOT } from "../docs/treeLayout";
import type { Tokens } from "../tokens";

export function TaskStatusToggle({
  isOpen,
  t,
  onToggle,
}: {
  isOpen: boolean;
  t: Tokens;
  onToggle: () => void;
}) {
  const statusColor = isOpen ? t.red : t.success;
  const isStatusHighlighted = useIsDocsTarget(TASK_STATUS_TOGGLE_HOLON.id);

  return (
    <button
      type="button"
      title={isOpen ? "Mark complete" : "Reopen task"}
      aria-label={isOpen ? "Mark complete" : "Reopen task"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        borderRadius: 4,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${isOpen ? `${statusColor}55` : `${t.success}44`}`,
        background: isOpen ? "transparent" : `${t.success}18`,
        cursor: "pointer",
        padding: 0,
        ...docsTargetHighlight(isStatusHighlighted, t.accent),
      }}
    >
      {isOpen ? (
        <CheckSquare size={DOCS_TREE_ICON_SIZE} color={statusColor} strokeWidth={1.75} />
      ) : (
        <Check size={DOCS_TREE_ICON_SIZE - 2} color={statusColor} strokeWidth={2.5} />
      )}
    </button>
  );
}
