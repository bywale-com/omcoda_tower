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
import type { Tokens } from "../../components/tokens";
import { SME_SEATS } from "../theory/sme";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { collectExpandableIds } from "./treeCollapse";

type SmeTreeNode = {
  id: string;
  label: string;
  seatId?: string;
  itemId?: string;
  children: SmeTreeNode[];
};

function buildSmeTree(): SmeTreeNode[] {
  return SME_SEATS.map((seat) => ({
    id: `sme-seat-${seat.id}`,
    label: seat.label,
    seatId: seat.id,
    children: seat.items.map((item) => ({
      id: `sme-item-${seat.id}-${item.id}`,
      label: item.id,
      seatId: seat.id,
      itemId: item.id,
      children: [],
    })),
  }));
}

function SmeTreeRow({
  nodeId,
  label,
  depth,
  isSelected,
  open,
  onToggle,
  onSelect,
  t,
}: {
  nodeId: string;
  label: string;
  depth: number;
  isSelected: boolean;
  open?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
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
      data-register-tree-sme={nodeId}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        background: isSelected ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
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
        <HolonTreeIcon notionIcon="user-circle" size={DOCS_TREE_ICON_SIZE} color={tone} accentColor={t.accent} />
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
        <span style={{ ...labelStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        {isBranch ? (
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
        ) : null}
      </span>
    </div>
  );
}

function SmeTreeBranch({
  nodes,
  depth,
  selectedSmeSeatId,
  selectedSmeItemId,
  closedIds,
  onToggleBranch,
  onSelectSeat,
  onSelectItem,
  t,
}: {
  nodes: SmeTreeNode[];
  depth: number;
  selectedSmeSeatId: string | null;
  selectedSmeItemId: string | null;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  onSelectSeat: (seatId: string) => void;
  onSelectItem: (seatId: string, itemId: string) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        const isSeat = Boolean(node.seatId && !node.itemId);
        const isSelected = isSeat
          ? selectedSmeSeatId === node.seatId && selectedSmeItemId == null
          : selectedSmeItemId === node.itemId && selectedSmeSeatId === node.seatId;

        return (
          <div key={node.id}>
            <SmeTreeRow
              nodeId={node.id}
              label={node.label}
              depth={depth}
              isSelected={isSelected}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => {
                if (node.seatId && node.itemId) {
                  onSelectItem(node.seatId, node.itemId);
                  return;
                }
                if (node.seatId) {
                  onSelectSeat(node.seatId);
                }
              }}
              t={t}
            />
            {hasChildren && isOpen ? (
              <SmeTreeBranch
                nodes={node.children}
                depth={depth + 1}
                selectedSmeSeatId={selectedSmeSeatId}
                selectedSmeItemId={selectedSmeItemId}
                closedIds={closedIds}
                onToggleBranch={onToggleBranch}
                onSelectSeat={onSelectSeat}
                onSelectItem={onSelectItem}
                t={t}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

type RegisterSmeTreeProps = {
  t: Tokens;
};

export function RegisterSmeTree({ t }: RegisterSmeTreeProps) {
  const { selectedSmeSeatId, selectedSmeItemId, selectSmeSeat, selectSmeItem } = useRegisterSelection();
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(() => new Set());
  const smeTree = useMemo(() => buildSmeTree(), []);

  useEffect(() => {
    const activeId = selectedSmeItemId
      ? `sme-item-${selectedSmeSeatId}-${selectedSmeItemId}`
      : selectedSmeSeatId
        ? `sme-seat-${selectedSmeSeatId}`
        : null;
    if (!activeId) return;
    document.querySelector(`[data-register-tree-sme="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedSmeSeatId, selectedSmeItemId]);

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (smeTree.length === 0) {
    return <p style={{ margin: 0, padding: "4px 12px 10px", fontSize: 13, color: t.textMuted }}>No SME seats yet.</p>;
  }

  return (
    <SmeTreeBranch
      nodes={smeTree}
      depth={0}
      selectedSmeSeatId={selectedSmeSeatId}
      selectedSmeItemId={selectedSmeItemId}
      closedIds={closedBranchIds}
      onToggleBranch={toggleBranch}
      onSelectSeat={(seatId) => selectSmeSeat(seatId)}
      onSelectItem={(seatId, itemId) => selectSmeItem(seatId, itemId)}
      t={t}
    />
  );
}
