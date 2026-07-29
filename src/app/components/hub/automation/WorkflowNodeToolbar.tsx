import { Copy, Move, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PaletteBlock } from "../../../data/automationWorkflows";
import type { Tokens } from "../../tokens";
import { AttachStepMenu } from "./AttachStepMenu";

type WorkflowNodeToolbarProps = {
  t: Tokens;
  onDuplicate: () => void;
  onDelete: () => void;
  onAttachBlock?: (block: PaletteBlock, sourceHandle?: string) => void;
  canDuplicate: boolean;
  canDelete: boolean;
  canAttach?: boolean;
  showBranchPicker?: boolean;
};

export function WorkflowNodeToolbar({
  t,
  onDuplicate,
  onDelete,
  onAttachBlock,
  canDuplicate,
  canDelete,
  canAttach = false,
  showBranchPicker = false,
}: WorkflowNodeToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [branchHandle, setBranchHandle] = useState<"true" | "false">("true");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as HTMLElement)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className="nodrag nopan nowheel"
      style={{ position: "relative", flexShrink: 0 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: "4px 6px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
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
        {canAttach && onAttachBlock && (
          <button
            type="button"
            title="Add connected step"
            aria-label="Add connected step"
            className="nodrag nopan nowheel"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              border: "none",
              borderRadius: 6,
              background: menuOpen ? t.hoverBg : "transparent",
              color: t.textPrimary,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
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

      {menuOpen && onAttachBlock && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 30,
          }}
        >
          <AttachStepMenu
            t={t}
            title="Add step"
            showBranchPicker={showBranchPicker}
            branchHandle={branchHandle}
            onBranchHandleChange={setBranchHandle}
            onSelect={(block) => {
              onAttachBlock(block, showBranchPicker ? branchHandle : undefined);
              setMenuOpen(false);
            }}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
