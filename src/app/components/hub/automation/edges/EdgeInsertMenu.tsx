import type { PaletteBlock } from "../../../../data/automationWorkflows";
import { WORKFLOW_PALETTE_BLOCKS } from "../../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../../docs/treeLayout";
import type { Tokens } from "../../../tokens";

const INSERTABLE_BLOCKS = WORKFLOW_PALETTE_BLOCKS.filter((block) => block.nodeType !== "trigger");

type EdgeInsertMenuProps = {
  t: Tokens;
  onSelect: (block: PaletteBlock) => void;
  onClose: () => void;
};

export function EdgeInsertMenu({ t, onSelect, onClose }: EdgeInsertMenuProps) {
  return (
    <div
      className="nodrag nopan nowheel"
      style={{
        marginTop: 8,
        width: 220,
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{
          padding: "8px 10px",
          borderBottom: `1px solid ${t.border}`,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textMuted,
        }}
      >
        Insert step
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto", padding: 4 }}>
        {INSERTABLE_BLOCKS.map((block) => (
          <button
            key={block.id}
            type="button"
            className="nodrag nopan nowheel"
            onClick={() => onSelect(block)}
            style={{
              display: "block",
              width: "100%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 6,
              color: t.textPrimary,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = t.hoverBg;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: DOCS_TREE_LABEL_SIZE,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {block.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
