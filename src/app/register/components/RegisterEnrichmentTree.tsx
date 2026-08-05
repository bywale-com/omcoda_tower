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
  PERSONA_CANT_ITEMS,
  PERSONA_ENRICHMENT_SUBJECTS,
  PERSONA_FURNISH_ITEMS,
} from "../theory/enrichment";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { collectExpandableIds } from "./treeCollapse";

type EnrichmentKind = "cants" | "furnish";

type EnrichmentTreeNode = {
  id: string;
  label: string;
  icon: NotionIconName;
  subjectId?: string;
  kind?: EnrichmentKind;
  itemId?: string;
  children: EnrichmentTreeNode[];
};

function buildEnrichmentTree(kind: EnrichmentKind): EnrichmentTreeNode[] {
  const items = kind === "cants" ? PERSONA_CANT_ITEMS : PERSONA_FURNISH_ITEMS;
  const icon: NotionIconName = kind === "cants" ? "bell-slash" : "wrench";
  return PERSONA_ENRICHMENT_SUBJECTS.map((subject) => ({
    id: `${kind}-subject-${subject.id}`,
    label: `${subject.label} (${kind === "cants" ? subject.cantCount : subject.furnishCount})`,
    icon: "user-circle",
    subjectId: subject.id,
    kind,
    children: items
      .filter((item) => item.subjectId === subject.id)
      .map((item) => ({
        id: `${kind}-item-${item.id}`,
        label: item.id,
        icon,
        subjectId: subject.id,
        kind,
        itemId: item.id,
        children: [],
      })),
  }));
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
          ...(hasChildren ? docsBranchLabelStyle(t) : docsChildLabelStyle(t)),
          fontSize: DOCS_TREE_LABEL_SIZE,
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

function EnrichmentKindTree({ kind, t }: { kind: EnrichmentKind; t: Tokens }) {
  const {
    selectedEnrichmentKind,
    selectedEnrichmentSubjectId,
    selectedEnrichmentItemId,
    selectEnrichmentSubject,
    selectEnrichmentItem,
  } = useRegisterSelection();
  const tree = useMemo(() => buildEnrichmentTree(kind), [kind]);
  const expandable = useMemo(() => collectExpandableIds(tree), [tree]);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(expandable.slice(0, 3)));

  useEffect(() => {
    if (selectedEnrichmentKind !== kind || !selectedEnrichmentSubjectId) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.add(`${kind}-subject-${selectedEnrichmentSubjectId}`);
      return next;
    });
  }, [kind, selectedEnrichmentKind, selectedEnrichmentSubjectId]);

  const renderNode = (node: EnrichmentTreeNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const open = openIds.has(node.id);
    const isSelected =
      selectedEnrichmentKind === kind &&
      (node.itemId
        ? selectedEnrichmentItemId === node.itemId
        : !selectedEnrichmentItemId && selectedEnrichmentSubjectId === node.subjectId);
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
            if (node.itemId && node.subjectId) selectEnrichmentItem(kind, node.subjectId, node.itemId);
            else if (node.subjectId) selectEnrichmentSubject(kind, node.subjectId);
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

export function RegisterEnrichmentTree({ t }: { t: Tokens }) {
  return <EnrichmentKindTree kind="cants" t={t} />;
}

export function RegisterFurnishTree({ t }: { t: Tokens }) {
  return <EnrichmentKindTree kind="furnish" t={t} />;
}
