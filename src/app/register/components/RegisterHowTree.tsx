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
import { getHowGraph, getHowNodeChildren, truncateHowAnswer } from "../howAnalysis";
import type { HowGraph, HowNode } from "../howAnalysis/types";
import { OUTCOME_PERSONAS, type Outcome } from "../theory/outcomes";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { useRegisterShell, type CtDeskId } from "../context/RegisterShellContext";
import { useRegisterTrace } from "../trace/RegisterTraceContext";
import { getSurfaceByLabel, resolveSurfaceLabel } from "../trace/surfaceCatalog";
import { collectExpandableIds } from "./treeCollapse";

function deskForPersona(personaId: string | undefined): CtDeskId {
  if (personaId === "operator") return "operator";
  if (personaId === "engagement_contact" || personaId === "contact") return "contact";
  return "consultant";
}

function firstCatalogSurfaceLabel(uiLabels: string[] | undefined): string | null {
  for (const label of uiLabels ?? []) {
    if (getSurfaceByLabel(label) || resolveSurfaceLabel(label)) return label;
  }
  return null;
}

type HowTreeNode = {
  id: string;
  label: string;
  /** persona | outcome | how-node */
  kind: "persona" | "outcome" | "how";
  personaId?: string;
  outcomeId?: string;
  graphId?: string;
  howNodeId?: string;
  children: HowTreeNode[];
};

function buildHowSubtree(graph: HowGraph, node: HowNode): HowTreeNode {
  return {
    id: `how-${graph.id}-${node.id}`,
    label: truncateHowAnswer(node.clarity, 52),
    kind: "how",
    graphId: graph.id,
    howNodeId: node.id,
    children: getHowNodeChildren(graph, node.id).map((child) => buildHowSubtree(graph, child)),
  };
}

function buildOutcomeNode(outcome: Outcome): HowTreeNode {
  const graph = outcome.howGraphId ? getHowGraph(outcome.howGraphId) : undefined;
  const howChildren =
    graph != null
      ? graph.nodes.filter((n) => n.parentId === null).map((n) => buildHowSubtree(graph, n))
      : [];
  return {
    id: `how-outcome-${outcome.id}`,
    label: outcome.core ? `${outcome.label} · Core` : outcome.label,
    kind: "outcome",
    outcomeId: outcome.id,
    graphId: outcome.howGraphId,
    children: howChildren,
  };
}

function buildPersonaHowTree(): HowTreeNode[] {
  return OUTCOME_PERSONAS.map((persona) => ({
    id: `how-persona-${persona.id}`,
    label: persona.label,
    kind: "persona" as const,
    personaId: persona.id,
    children: persona.outcomes.map(buildOutcomeNode),
  }));
}

function HowTreeRow({
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
      data-register-tree-how={nodeId}
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
        <HolonTreeIcon notionIcon="chart-bar-line" size={DOCS_TREE_ICON_SIZE} color={tone} accentColor={t.accent} />
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

function HowTreeBranch({
  nodes,
  depth,
  selectedGraphId,
  selectedHowNodeId,
  selectedOutcomeId,
  selectedPersonaId,
  closedIds,
  onToggleBranch,
  onSelectNode,
  t,
}: {
  nodes: HowTreeNode[];
  depth: number;
  selectedGraphId: string | null;
  selectedHowNodeId: string | null;
  selectedOutcomeId: string | null;
  selectedPersonaId: string | null;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  onSelectNode: (node: HowTreeNode) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        const isSelected =
          node.kind === "persona"
            ? selectedPersonaId === node.personaId && selectedOutcomeId == null && selectedHowNodeId == null
            : node.kind === "outcome"
              ? selectedOutcomeId === node.outcomeId && selectedHowNodeId == null
              : selectedHowNodeId === node.howNodeId && selectedGraphId === node.graphId;

        return (
          <div key={node.id}>
            <HowTreeRow
              nodeId={node.id}
              label={node.label}
              depth={depth}
              isSelected={isSelected}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => onSelectNode(node)}
              t={t}
            />
            {hasChildren && isOpen ? (
              <HowTreeBranch
                nodes={node.children}
                depth={depth + 1}
                selectedGraphId={selectedGraphId}
                selectedHowNodeId={selectedHowNodeId}
                selectedOutcomeId={selectedOutcomeId}
                selectedPersonaId={selectedPersonaId}
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

type RegisterHowTreeProps = {
  t: Tokens;
};

export function RegisterHowTree({ t }: RegisterHowTreeProps) {
  const {
    selectedHowGraphId,
    selectedHowNodeId,
    selectedOutcomeId,
    selectedPersonaId,
    selectHowGraph,
    selectHowNode,
    selectOutcome,
    selectPersona,
  } = useRegisterSelection();
  const { revealCt, revealTheory } = useRegisterShell();
  const { focusSurface } = useRegisterTrace();
  const howTree = useMemo(() => buildPersonaHowTree(), []);
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(
    () => new Set(collectExpandableIds(buildPersonaHowTree())),
  );

  useEffect(() => {
    const activeId = selectedHowNodeId
      ? `how-${selectedHowGraphId}-${selectedHowNodeId}`
      : selectedOutcomeId
        ? `how-outcome-${selectedOutcomeId}`
        : selectedPersonaId
          ? `how-persona-${selectedPersonaId}`
          : null;
    if (!activeId) return;
    document.querySelector(`[data-register-tree-how="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedHowGraphId, selectedHowNodeId, selectedOutcomeId, selectedPersonaId]);

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (howTree.length === 0) {
    return <p style={{ margin: 0, padding: "4px 12px 10px", fontSize: 13, color: t.textMuted }}>No how maps yet.</p>;
  }

  return (
    <HowTreeBranch
      nodes={howTree}
      depth={0}
      selectedGraphId={selectedHowGraphId}
      selectedHowNodeId={selectedHowNodeId}
      selectedOutcomeId={selectedOutcomeId}
      selectedPersonaId={selectedPersonaId}
      closedIds={closedBranchIds}
      onToggleBranch={toggleBranch}
      onSelectNode={(node) => {
        revealTheory();
        if (node.kind === "persona" && node.personaId) {
          selectPersona(node.personaId);
          return;
        }
        if (node.kind === "outcome" && node.outcomeId) {
          selectOutcome(node.outcomeId, node.graphId ?? null);
          return;
        }
        if (node.kind === "how" && node.graphId && node.howNodeId) {
          selectHowGraph(node.graphId);
          selectHowNode(node.howNodeId);
          const graph = getHowGraph(node.graphId);
          const howNode = graph?.nodes.find((n) => n.id === node.howNodeId);
          const leaf = howNode != null && (howNode.isLeaf === true || howNode.kind === "leaf");
          if (leaf && howNode) {
            revealCt(deskForPersona(graph?.personaId ?? selectedPersonaId ?? undefined));
            const first = firstCatalogSurfaceLabel(howNode.components.ui);
            if (first) focusSurface(first);
          }
        }
      }}
      t={t}
    />
  );
}
