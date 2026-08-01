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
import { REGISTER_FLOWS } from "../flows";
import { getFlowFocusHolonIds, getFlowStepFocusHolonIds } from "../flows/flowFocus";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { collectExpandableIds } from "./treeCollapse";

type FlowTreeNode = {
  id: string;
  label: string;
  icon: NotionIconName;
  stepId?: string;
  children: FlowTreeNode[];
};

function buildFlowTree(): FlowTreeNode[] {
  return REGISTER_FLOWS.map((flow) => ({
    id: flow.id,
    label: flow.label,
    icon: "user",
    children: flow.steps.map((step) => ({
      id: step.id,
      label: step.stepLabel,
      icon: "cursor-click",
      stepId: step.id,
      children: [],
    })),
  }));
}

function RegisterFlowRow({
  nodeId,
  label,
  icon,
  depth,
  isSelected,
  open,
  onToggle,
  onSelect,
  onHoverStart,
  onHoverEnd,
  t,
}: {
  nodeId: string;
  label: string;
  icon: NotionIconName;
  depth: number;
  isSelected: boolean;
  open?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
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
      data-register-tree-flow={nodeId}
      onClick={onSelect}
      onMouseEnter={() => {
        setHovered(true);
        onHoverStart?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverEnd?.();
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
        <HolonTreeIcon notionIcon={icon} size={DOCS_TREE_ICON_SIZE} color={tone} accentColor={t.accent} />
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

function RegisterFlowTreeBranch({
  nodes,
  depth,
  selectedStepId,
  selectedFlowId,
  closedIds,
  onToggleBranch,
  onSelectStep,
  onSelectFlow,
  onHoverStepStart,
  onHoverStepEnd,
  onHoverFlowStart,
  onHoverFlowEnd,
  t,
}: {
  nodes: FlowTreeNode[];
  depth: number;
  selectedStepId: string | null;
  selectedFlowId: string | null;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  onSelectStep: (stepId: string) => void;
  onSelectFlow: (flowId: string) => void;
  onHoverStepStart: (stepId: string) => void;
  onHoverStepEnd: () => void;
  onHoverFlowStart: (flowId: string) => void;
  onHoverFlowEnd: () => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        const isStep = node.stepId != null;
        const isSelected = isStep
          ? selectedStepId === node.stepId
          : selectedFlowId === node.id && selectedStepId == null;

        return (
          <div key={node.id}>
            <RegisterFlowRow
              nodeId={node.id}
              label={node.label}
              icon={node.icon}
              depth={depth}
              isSelected={isSelected}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => {
                if (isStep && node.stepId) {
                  onSelectStep(node.stepId);
                  return;
                }
                onSelectFlow(node.id);
              }}
              onHoverStart={
                isStep && node.stepId
                  ? () => onHoverStepStart(node.stepId!)
                  : () => onHoverFlowStart(node.id)
              }
              onHoverEnd={isStep ? onHoverStepEnd : onHoverFlowEnd}
              t={t}
            />
            {hasChildren && isOpen && (
              <RegisterFlowTreeBranch
                nodes={node.children}
                depth={depth + 1}
                selectedStepId={selectedStepId}
                selectedFlowId={selectedFlowId}
                closedIds={closedIds}
                onToggleBranch={onToggleBranch}
                onSelectStep={onSelectStep}
                onSelectFlow={onSelectFlow}
                onHoverStepStart={onHoverStepStart}
                onHoverStepEnd={onHoverStepEnd}
                onHoverFlowStart={onHoverFlowStart}
                onHoverFlowEnd={onHoverFlowEnd}
                t={t}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

type RegisterFlowsTreeProps = {
  t: Tokens;
};

export function RegisterFlowsTree({ t }: RegisterFlowsTreeProps) {
  const {
    selectedFlowStepId,
    selectedFlowId,
    selectFlowStep,
    selectFlow,
    setHoveredFlowStepId,
    setHoveredFlowId,
    setHoveredHolonId,
  } = useRegisterSelection();
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(() => new Set());
  const flowTree = useMemo(() => buildFlowTree(), []);

  const handleHoverStepStart = (stepId: string) => {
    setHoveredFlowStepId(stepId);
    const [focusHolonId] = getFlowStepFocusHolonIds(stepId);
    setHoveredHolonId(focusHolonId ?? null);
  };

  const handleHoverStepEnd = () => {
    setHoveredFlowStepId(null);
  };

  const handleHoverFlowStart = (flowId: string) => {
    setHoveredFlowId(flowId);
    const [focusHolonId] = getFlowFocusHolonIds(flowId);
    setHoveredHolonId(focusHolonId ?? null);
  };

  const handleHoverFlowEnd = () => {
    setHoveredFlowId(null);
  };

  useEffect(() => {
    const activeId = selectedFlowStepId ?? selectedFlowId;
    if (!activeId) return;
    for (const flow of flowTree) {
      if (
        flow.id === activeId ||
        flow.children.some((step) => step.stepId === activeId)
      ) {
        setClosedBranchIds((prev) => {
          if (!prev.has(flow.id)) return prev;
          const next = new Set(prev);
          next.delete(flow.id);
          return next;
        });
        break;
      }
    }
  }, [selectedFlowStepId, selectedFlowId, flowTree]);

  useEffect(() => {
    const activeId = selectedFlowStepId ?? selectedFlowId;
    if (!activeId) return;
    document
      .querySelector(`[data-register-tree-flow="${activeId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedFlowStepId, selectedFlowId, closedBranchIds]);

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (flowTree.length === 0) {
    return <p style={{ margin: 0, padding: "4px 12px 10px", fontSize: 13, color: t.textMuted }}>No flows yet.</p>;
  }

  return (
    <RegisterFlowTreeBranch
      nodes={flowTree}
      depth={0}
      selectedStepId={selectedFlowStepId}
      selectedFlowId={selectedFlowId}
      closedIds={closedBranchIds}
      onToggleBranch={toggleBranch}
      onSelectStep={selectFlowStep}
      onSelectFlow={selectFlow}
      onHoverStepStart={handleHoverStepStart}
      onHoverStepEnd={handleHoverStepEnd}
      onHoverFlowStart={handleHoverFlowStart}
      onHoverFlowEnd={handleHoverFlowEnd}
      t={t}
    />
  );
}
