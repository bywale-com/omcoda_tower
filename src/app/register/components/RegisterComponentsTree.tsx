import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { HolonTreeNode } from "../../context/DocsRegistryContext";
import { useDocsRegistry } from "../../context/DocsRegistryContext";
import { CONSOLE_CHROME_HOLON_IDS } from "../../components/docs/holonCatalogTree";
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
import type { HolonLucideIconName } from "../../components/docs/holonIcons";
import type { Tokens } from "../../components/tokens";
import {
  collectHolonAncestorIds,
  useRegisterSelection,
} from "../context/RegisterSelectionContext";

function filterComponentsTree(nodes: HolonTreeNode[]): HolonTreeNode[] {
  return nodes
    .filter((node) => !CONSOLE_CHROME_HOLON_IDS.has(node.id))
    .map((node) => ({
      ...node,
      children: filterComponentsTree(node.children),
    }));
}

function RegisterHolonRow({
  holonId,
  label,
  icon,
  lucideIcon,
  depth = 0,
  isSelected,
  isHighlighted,
  open,
  onToggle,
  onSelect,
  onHoverStart,
  onHoverEnd,
  t,
}: {
  holonId: string;
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  depth?: number;
  isSelected: boolean;
  isHighlighted: boolean;
  open?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  t: Tokens;
}) {
  const isBranch = onToggle != null;
  const [hovered, setHovered] = useState(false);
  const tone = t.textPrimary;
  const labelStyle =
    depth > 0
      ? docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, tone, t)
      : docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, tone, isBranch && (hovered || isSelected));

  return (
    <div
      data-register-tree-holon={holonId}
      onClick={onSelect}
      onMouseEnter={() => {
        setHovered(true);
        onHoverStart();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverEnd();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 12px 0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 4,
        background: isSelected
          ? t.activeRowBg
          : hovered || isHighlighted
            ? t.hoverBg
            : "transparent",
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <HolonTreeIcon
          notionIcon={icon}
          lucideIcon={lucideIcon}
          size={DOCS_TREE_ICON_SIZE}
          color={tone}
          accentColor={t.accent}
        />
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: DOCS_TREE_LABEL_CHEVRON_GAP,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span style={labelStyle}>{label}</span>
        {isBranch && (
          <span
            onClick={(event) => {
              event.stopPropagation();
              onToggle?.();
            }}
            style={{ display: "inline-flex", flexShrink: 0 }}
          >
            <ChevronDown
              size={DOCS_TREE_CHEVRON_SIZE}
              color={t.textMuted}
              strokeWidth={2}
              style={{
                transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.12s ease",
              }}
            />
          </span>
        )}
      </span>
    </div>
  );
}

function RegisterHolonTree({
  nodes,
  depth,
  selectedId,
  highlightedId,
  onSelect,
  onHoverStart,
  onHoverEnd,
  closedIds,
  onToggleBranch,
  t,
}: {
  nodes: HolonTreeNode[];
  depth: number;
  selectedId: string | null;
  highlightedId: string | null;
  onSelect: (id: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        return (
          <div key={node.id}>
            <RegisterHolonRow
              holonId={node.id}
              label={node.label}
              icon={node.icon}
              lucideIcon={node.lucideIcon}
              depth={depth}
              isSelected={selectedId === node.id}
              isHighlighted={highlightedId === node.id}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => onSelect(node.id)}
              onHoverStart={() => onHoverStart(node.id)}
              onHoverEnd={onHoverEnd}
              t={t}
            />
            {hasChildren && isOpen && (
              <RegisterHolonTree
                nodes={node.children}
                depth={depth + 1}
                selectedId={selectedId}
                highlightedId={highlightedId}
                onSelect={onSelect}
                onHoverStart={onHoverStart}
                onHoverEnd={onHoverEnd}
                closedIds={closedIds}
                onToggleBranch={onToggleBranch}
                t={t}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

type RegisterComponentsTreeProps = {
  t: Tokens;
};

export function RegisterComponentsTree({ t }: RegisterComponentsTreeProps) {
  const { tree } = useDocsRegistry();
  const { selectedHolonId, hoveredHolonId, selectHolon, setHoveredHolonId } = useRegisterSelection();
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(() => new Set());

  const componentsTree = useMemo(() => filterComponentsTree(tree), [tree]);

  useEffect(() => {
    if (!selectedHolonId) return;
    const path = collectHolonAncestorIds(componentsTree, selectedHolonId);
    if (!path) return;
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      for (const id of path) next.delete(id);
      return next;
    });
  }, [selectedHolonId, componentsTree]);

  useEffect(() => {
    if (!selectedHolonId) return;
    document
      .querySelector(`[data-register-tree-holon="${selectedHolonId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedHolonId, closedBranchIds]);

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (componentsTree.length === 0) {
    return <p style={{ margin: 0, padding: "4px 12px 10px", fontSize: 13, color: t.textMuted }}>No components yet.</p>;
  }

  return (
    <RegisterHolonTree
      nodes={componentsTree}
      depth={0}
      selectedId={selectedHolonId}
      highlightedId={hoveredHolonId}
      onSelect={selectHolon}
      onHoverStart={setHoveredHolonId}
      onHoverEnd={() => setHoveredHolonId(null)}
      closedIds={closedBranchIds}
      onToggleBranch={toggleBranch}
      t={t}
    />
  );
}
