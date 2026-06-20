import { Copy, Move, Trash2 } from "lucide-react";
import type { Tokens } from "../../tokens";

type WorkflowNodeToolbarProps = {
  t: Tokens;
  onDuplicate: () => void;
  onDelete: () => void;
  canDuplicate: boolean;
  canDelete: boolean;
};

export function WorkflowNodeToolbar({
  t,
  onDuplicate,
  onDelete,
  canDuplicate,
  canDelete,
}: WorkflowNodeToolbarProps) {
  return (
    <div
      className="nodrag nopan nowheel"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "4px 6px",
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        title="Drag to move"
        aria-label="Drag to move"
        className="workflow-node-drag-handle nodrag nopan nowheel"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          border: "none",
          borderRadius: 6,
          background: "transparent",
          color: t.textMuted,
          cursor: "grab",
          padding: 0,
        }}
      >
        <Move size={14} strokeWidth={2} />
      </button>
      {canDuplicate && (
        <button
          type="button"
          title="Duplicate"
          aria-label="Duplicate node"
          className="nodrag nopan nowheel"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            border: "none",
            borderRadius: 6,
            background: "transparent",
            color: t.textPrimary,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Copy size={14} strokeWidth={2} />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          title="Delete"
          aria-label="Delete node"
          className="nodrag nopan nowheel"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            border: "none",
            borderRadius: 6,
            background: "transparent",
            color: t.textPrimary,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
