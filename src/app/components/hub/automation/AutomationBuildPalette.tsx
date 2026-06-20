import { GripVertical } from "lucide-react";
import type { PaletteBlock } from "../../../data/automationWorkflows";
import { WORKFLOW_PALETTE_BLOCKS } from "../../../data/automationWorkflows";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

type AutomationBuildPaletteProps = {
  t: Tokens;
  onAddBlock: (block: PaletteBlock) => void;
};

function PaletteRow({
  block,
  t,
  onAdd,
}: {
  block: PaletteBlock;
  t: Tokens;
  onAdd: () => void;
}) {
  const iconName =
    block.category === "actions" ? "directional-sign" : block.nodeType === "exit" ? "dot-circle" : "filter";

  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        "tower-chrome-menu-item flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left outline-none",
        "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <GripVertical size={12} strokeWidth={2} className="shrink-0 text-muted-foreground opacity-50" />
      <NotionIcon name={iconName} size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: "block",
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {block.label}
        </span>
        <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
          {block.description}
        </span>
      </span>
    </button>
  );
}

export function AutomationBuildPalette({ t, onAddBlock }: AutomationBuildPaletteProps) {
  const rules = WORKFLOW_PALETTE_BLOCKS.filter((b) => b.category === "rules");
  const actions = WORKFLOW_PALETTE_BLOCKS.filter((b) => b.category === "actions");

  return (
    <div
      style={{
        width: 248,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${t.border}` }}>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Build
        </div>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
          Click to drop on canvas
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ padding: "4px 8px 6px", color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
        >
          Rules
        </div>
        {rules.map((block) => (
          <PaletteRow key={block.id} block={block} t={t} onAdd={() => onAddBlock(block)} />
        ))}

        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ padding: "12px 8px 6px", color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
        >
          Actions
        </div>
        {actions.map((block) => (
          <PaletteRow key={block.id} block={block} t={t} onAdd={() => onAddBlock(block)} />
        ))}
      </div>
    </div>
  );
}
