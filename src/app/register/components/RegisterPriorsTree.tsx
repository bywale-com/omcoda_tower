import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HolonTreeIcon } from "../../components/docs/HolonTreeIcon";
import { docsBranchLabelStyle, docsChildLabelStyle } from "../../components/docs/treeTypography";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_CHEVRON_GAP,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
} from "../../components/docs/treeLayout";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  PRIOR_ZONES,
  getPriorsForModule,
  type PriorMark,
  type PriorModule,
} from "../theory/priors";
import { collectExpandableIds } from "./treeCollapse";

type PriorsTreeNode = {
  id: string;
  label: string;
  icon: NotionIconName;
  moduleId?: PriorModule;
  itemId?: string;
  mark?: PriorMark;
  children: PriorsTreeNode[];
};

function markIcon(mark: PriorMark): NotionIconName {
  if (mark === "prior") return "lightning-bolt";
  if (mark === "weak") return "information-circle";
  return "dot-circle";
}

function buildPriorsTree(): PriorsTreeNode[] {
  return PRIOR_ZONES.map((zone) => {
    const items = getPriorsForModule(zone.id);
    const priorCount = items.filter((i) => i.mark === "prior").length;
    return {
      id: `prior-zone-${zone.id}`,
      label: `${zone.label} (${priorCount} prior / ${zone.count})`,
      icon: "list",
      moduleId: zone.id,
      children: items.map((item) => ({
        id: `prior-item-${item.id}`,
        label: item.title,
        icon: markIcon(item.mark),
        moduleId: zone.id,
        itemId: item.id,
        mark: item.mark,
        children: [],
      })),
    };
  });
}

function TreeRow({
  label,
  depth,
  isSelected,
  open,
  onToggle,
  onSelect,
  icon,
  t,
}: {
  label: string;
  depth: number;
  isSelected: boolean;
  open?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
  icon: NotionIconName;
  t: Tokens;
}) {
  const hasChildren = typeof open === "boolean";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        minHeight: DOCS_TREE_ROW_H,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        paddingRight: DOCS_TREE_ROW_PAD_X,
        cursor: "pointer",
        background: isSelected ? t.activeRowBg : "transparent",
        borderRadius: 4,
        margin: "0 4px",
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          onClick={(event) => {
            event.stopPropagation();
            onToggle?.();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: DOCS_TREE_CHEVRON_SIZE + 4,
            height: DOCS_TREE_CHEVRON_SIZE + 4,
            border: "none",
            background: "transparent",
            color: t.textMuted,
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <ChevronDown
            size={DOCS_TREE_CHEVRON_SIZE}
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 120ms" }}
          />
        </button>
      ) : (
        <span style={{ width: DOCS_TREE_CHEVRON_SIZE + 4, flexShrink: 0 }} />
      )}
      <span style={{ width: DOCS_TREE_ICON_SLOT, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
        <HolonTreeIcon name={icon} size={DOCS_TREE_ICON_SIZE} />
      </span>
      <span
        style={{
          ...(hasChildren
            ? docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, isSelected ? t.textPrimary : t.textDim, isSelected)
            : docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, t.textMuted, t)),
          marginLeft: DOCS_TREE_LABEL_CHEVRON_GAP,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function RegisterPriorsTree({ t }: { t: Tokens }) {
  const {
    selectedPriorModuleId,
    selectedPriorItemId,
    selectPriorModule,
    selectPriorItem,
  } = useRegisterSelection();
  const tree = useMemo(() => buildPriorsTree(), []);
  const expandable = useMemo(() => collectExpandableIds(tree), [tree]);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(expandable.slice(0, 3)));

  useEffect(() => {
    if (!selectedPriorModuleId) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.add(`prior-zone-${selectedPriorModuleId}`);
      return next;
    });
  }, [selectedPriorModuleId]);

  const renderNode = (node: PriorsTreeNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const open = openIds.has(node.id);
    const isSelected = node.itemId
      ? selectedPriorItemId === node.itemId
      : !selectedPriorItemId && selectedPriorModuleId === node.moduleId;
    return (
      <div key={node.id}>
        <TreeRow
          label={node.label}
          depth={depth}
          isSelected={isSelected}
          open={hasChildren ? open : undefined}
          icon={node.icon}
          onToggle={
            hasChildren
              ? () =>
                  setOpenIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(node.id)) next.delete(node.id);
                    else next.add(node.id);
                    return next;
                  })
              : undefined
          }
          onSelect={() => {
            if (node.itemId && node.moduleId) selectPriorItem(node.moduleId, node.itemId);
            else if (node.moduleId) selectPriorModule(node.moduleId);
          }}
          t={t}
        />
        {hasChildren && open
          ? node.children.map((child) => renderNode(child, depth + 1))
          : null}
      </div>
    );
  };

  return <div>{tree.map((node) => renderNode(node, 0))}</div>;
}
