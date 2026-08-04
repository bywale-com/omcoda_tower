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
import {
  CANONICAL_NODES,
  CANT_ITEMS,
  FURNISH_ITEMS,
  HUMAN_PROVISIONING_NODES,
  WIRING_FUNCTION_TRACES,
} from "../theory/wiring";
import type { WiringPaperSection } from "../context/RegisterSelectionContext";
import { useRegisterSelection } from "../context/RegisterSelectionContext";

type WiringTreeNode = {
  id: string;
  label: string;
  icon: NotionIconName;
  section: WiringPaperSection;
  seatId?: string;
  traceId?: string;
  entityId?: string;
  children: WiringTreeNode[];
};

const ENTITY_SECTIONS = new Set<WiringPaperSection>(["nodes", "cants", "furnish", "human"]);

function buildWiringPaperTree(): WiringTreeNode[] {
  return [
    {
      id: "wiring-overview",
      label: "Overview",
      icon: "document",
      section: "overview",
      children: [],
    },
    {
      id: "wiring-function",
      label: "Function traces",
      icon: "list-bullet",
      section: "function",
      children: WIRING_FUNCTION_TRACES.map((seat) => ({
        id: `wiring-seat-${seat.id}`,
        label: seat.label,
        icon: "documents",
        section: "function",
        seatId: seat.id,
        children: seat.items.map((item) => ({
          id: `wiring-trace-${seat.id}-${item.id}`,
          label: item.id,
          icon: "document",
          section: "function",
          seatId: seat.id,
          traceId: item.id,
          children: [],
        })),
      })),
    },
    {
      id: "wiring-nodes",
      label: "Canonical nodes",
      icon: "dependency",
      section: "nodes",
      children: CANONICAL_NODES.map((node) => ({
        id: `wiring-nodes-item-${node.node}`,
        label: node.node,
        icon: "dot-circle",
        section: "nodes",
        entityId: node.node,
        children: [],
      })),
    },
    {
      id: "wiring-cants",
      label: "Can'ts",
      icon: "bell-slash",
      section: "cants",
      children: CANT_ITEMS.map((item) => ({
        id: `wiring-cants-item-${item.id}`,
        label: item.id,
        icon: "bell-slash",
        section: "cants",
        entityId: item.id,
        children: [],
      })),
    },
    {
      id: "wiring-furnish",
      label: "Furnish",
      icon: "wrench",
      section: "furnish",
      children: FURNISH_ITEMS.map((item) => ({
        id: `wiring-furnish-item-${item.id}`,
        label: item.id,
        icon: "wrench",
        section: "furnish",
        entityId: item.id,
        children: [],
      })),
    },
    {
      id: "wiring-human",
      label: "Human provisioning",
      icon: "user-circle",
      section: "human",
      children: HUMAN_PROVISIONING_NODES.map((node) => ({
        id: `wiring-human-item-${node.node}`,
        label: node.node,
        icon: "user-circle",
        section: "human",
        entityId: node.node,
        children: [],
      })),
    },
  ];
}

function initialClosedIds(nodes: WiringTreeNode[]): Set<string> {
  const closed = new Set<string>();
  for (const root of nodes) {
    if (root.section !== "function" && root.children.length > 0) closed.add(root.id);
    if (root.section === "function") {
      for (const seat of root.children) closed.add(seat.id);
    }
  }
  return closed;
}

function WiringTreeRow({
  node,
  depth,
  isSelected,
  open,
  onToggle,
  onSelect,
  t,
}: {
  node: WiringTreeNode;
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
      data-register-tree-wiring-paper={node.id}
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
        <HolonTreeIcon notionIcon={node.icon} size={DOCS_TREE_ICON_SIZE} color={tone} accentColor={t.accent} />
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
          {node.label}
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

function WiringTreeBranch({
  nodes,
  depth,
  selectedSection,
  selectedSeatId,
  selectedTraceId,
  selectedEntityId,
  closedIds,
  onToggleBranch,
  onSelectNode,
  t,
}: {
  nodes: WiringTreeNode[];
  depth: number;
  selectedSection: WiringPaperSection | null;
  selectedSeatId: string | null;
  selectedTraceId: string | null;
  selectedEntityId: string | null;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  onSelectNode: (node: WiringTreeNode) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        const isSectionOnly = !node.seatId && !node.traceId && !node.entityId;
        const isSelected =
          node.traceId != null
            ? selectedSeatId === node.seatId && selectedTraceId === node.traceId
            : node.seatId != null
              ? selectedSeatId === node.seatId && selectedTraceId == null
              : node.entityId != null
                ? selectedSection === node.section && selectedEntityId === node.entityId
                : isSectionOnly && selectedSection === node.section && selectedEntityId == null && selectedTraceId == null;

        return (
          <div key={node.id}>
            <WiringTreeRow
              node={node}
              depth={depth}
              isSelected={isSelected}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => onSelectNode(node)}
              t={t}
            />
            {hasChildren && isOpen ? (
              <WiringTreeBranch
                nodes={node.children}
                depth={depth + 1}
                selectedSection={selectedSection}
                selectedSeatId={selectedSeatId}
                selectedTraceId={selectedTraceId}
                selectedEntityId={selectedEntityId}
                closedIds={closedIds}
                onToggleBranch={onToggleBranch}
                onSelectNode={onSelectNode}
                t={t}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

type RegisterWiringPaperTreeProps = {
  t: Tokens;
};

export function RegisterWiringPaperTree({ t }: RegisterWiringPaperTreeProps) {
  const {
    selectedWiringPaperSection,
    selectedWiringSeatId,
    selectedWiringTraceId,
    selectedWiringEntityId,
    selectWiringPaperSection,
    selectWiringSeat,
    selectWiringTrace,
    selectWiringEntity,
  } = useRegisterSelection();
  const wiringTree = useMemo(() => buildWiringPaperTree(), []);
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(() => initialClosedIds(wiringTree));

  useEffect(() => {
    if (selectedWiringPaperSection === "function") {
      setClosedBranchIds((prev) => {
        const next = new Set(prev);
        next.delete("wiring-function");
        if (selectedWiringSeatId) next.delete(`wiring-seat-${selectedWiringSeatId}`);
        return next;
      });
    }
    if (selectedWiringPaperSection && ENTITY_SECTIONS.has(selectedWiringPaperSection)) {
      setClosedBranchIds((prev) => {
        const next = new Set(prev);
        next.delete(`wiring-${selectedWiringPaperSection}`);
        return next;
      });
    }
  }, [selectedWiringPaperSection, selectedWiringSeatId]);

  useEffect(() => {
    const activeId =
      selectedWiringPaperSection === "function" && selectedWiringSeatId && selectedWiringTraceId
        ? `wiring-trace-${selectedWiringSeatId}-${selectedWiringTraceId}`
        : selectedWiringPaperSection === "function" && selectedWiringSeatId
          ? `wiring-seat-${selectedWiringSeatId}`
          : selectedWiringPaperSection && selectedWiringEntityId
            ? `wiring-${selectedWiringPaperSection}-item-${selectedWiringEntityId}`
            : selectedWiringPaperSection
              ? `wiring-${selectedWiringPaperSection}`
              : null;
    if (!activeId) return;
    document.querySelector(`[data-register-tree-wiring-paper="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedWiringPaperSection, selectedWiringSeatId, selectedWiringTraceId, selectedWiringEntityId, closedBranchIds]);

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectNode = (node: WiringTreeNode) => {
    if (node.traceId && node.seatId) {
      selectWiringTrace(node.seatId, node.traceId);
      return;
    }
    if (node.seatId) {
      selectWiringSeat(node.seatId);
      return;
    }
    if (node.entityId && ENTITY_SECTIONS.has(node.section)) {
      selectWiringEntity(node.section as Exclude<WiringPaperSection, "overview" | "function">, node.entityId);
      return;
    }
    selectWiringPaperSection(node.section);
  };

  return (
    <WiringTreeBranch
      nodes={wiringTree}
      depth={0}
      selectedSection={selectedWiringPaperSection}
      selectedSeatId={selectedWiringSeatId}
      selectedTraceId={selectedWiringTraceId}
      selectedEntityId={selectedWiringEntityId}
      closedIds={closedBranchIds}
      onToggleBranch={toggleBranch}
      onSelectNode={selectNode}
      t={t}
    />
  );
}
