import { useState, type CSSProperties, type ReactNode } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { WIRE_ADD_KINDS } from "../../../../data/automationTriggerSelect";
import { WORKFLOW_PALETTE_BLOCKS, type PaletteBlock } from "../../../../data/automationWorkflows";

export function WireAddMenu({
  onPick,
  buttonStyle,
}: {
  onPick: (block: PaletteBlock) => void;
  buttonStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nodrag nopan nowheel" style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Add node"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          border: "1px solid #1677ff",
          background: "#1677ff",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          ...buttonStyle,
        }}
      >
        <PlusOutlined />
      </button>
      {open ? <WireAddList onPick={onPick} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

export function WireAddList({
  onPick,
  onClose,
}: {
  onPick: (block: PaletteBlock) => void;
  onClose?: () => void;
}): ReactNode {
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: -8,
        width: 220,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: 6,
        zIndex: 1000,
      }}
    >
      {WIRE_ADD_KINDS.map((choice) => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === choice.blockId);
        return (
          <button
            key={choice.blockId}
            type="button"
            disabled={!block}
            onClick={(event) => {
              event.stopPropagation();
              if (!block) return;
              onPick(block);
              onClose?.();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              border: "none",
              borderRadius: 6,
              background: "transparent",
              cursor: block ? "pointer" : "not-allowed",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{choice.title}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{choice.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
