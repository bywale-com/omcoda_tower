import { useState } from "react";
import { ChevronDown, FileText, MoreHorizontal } from "lucide-react";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import {
  docsBranchLabelStyle,
  docsChildLabelStyle,
  docsLabelStyle,
} from "./docs/treeTypography";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_CHEVRON_GAP,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  DOCS_REGISTRY_ROW_PAD_RIGHT,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_UNDERLINE_OFFSET,
  s,
} from "./docs/treeLayout";
import type { HolonId } from "../context/DocsHighlightContext";
import { useDocsHighlight } from "../context/DocsHighlightContext";
import { useHolonDetail } from "../context/HolonDetailContext";
import type { HolonTreeNode } from "../context/DocsRegistryContext";
import { useDocsRegistry } from "../context/DocsRegistryContext";
import { HolonBoundary } from "./docs/HolonBoundary";
import { docsTargetHighlight, holonInspectTargetProps, useIsDocsTarget } from "./docs/docsHighlight";
import {
  DOCS_HOME_BRANCH_HOLON,
  DOCS_HOME_PLACEHOLDER_ENTRIES,
  DOCS_INVIEW_INDICATOR_HOLON,
  DOCS_OUTLINE_ROW_HOLON,
  DOCS_PANELS_BRANCH_HOLON,
  DOCS_REGISTRY_HOLON,
  DOCS_ROW_ACTIONS_HOLON,
  DOCS_ROW_NAME_HOLON,
} from "./docs/docsRegistryHolons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  TOWER_POPOVER_CONTENT_CLASS,
  TOWER_POPOVER_MENU_ITEM_CLASS,
} from "./ui/towerChrome";
import { HolonTreeIcon } from "./docs/HolonTreeIcon";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { HolonLucideIconName } from "./docs/holonIcons";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";

/** Panel header — not scaled with tree */
const HEADER_LABEL_SIZE = 13;

type DocsPanelProps = {
  width: number;
  t: Tokens;
};

function DocsOutlineRow({
  label,
  icon,
  lucideIcon,
  depth = 0,
  isSelected = false,
  open,
  onToggle,
  onSelect,
  docsTargetId,
  inView,
  onReveal,
  onViewDetails,
  t,
}: {
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  depth?: number;
  isSelected?: boolean;
  open?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  docsTargetId?: HolonId;
  /** Holon visibility — shows eye indicator on hover when set with docsTargetId */
  inView?: boolean;
  onReveal?: (id: HolonId) => void;
  onViewDetails?: (id: HolonId) => void;
  t: Tokens;
}) {
  const isBranch = onToggle != null;
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setHoveredComponentId } = useDocsHighlight();
  const isHolonHighlighted = useIsDocsTarget(docsTargetId ?? "");
  const isOutlineRowHighlighted = useIsDocsTarget(DOCS_OUTLINE_ROW_HOLON.id);
  const isNameHighlighted = useIsDocsTarget(DOCS_ROW_NAME_HOLON.id);
  const isInViewHighlighted = useIsDocsTarget(DOCS_INVIEW_INDICATOR_HOLON.id);
  const isRowActionsHighlighted = useIsDocsTarget(DOCS_ROW_ACTIONS_HOLON.id);
  const showHolonControls = docsTargetId != null && inView != null;
  const showRowActions = showHolonControls && (hovered || menuOpen);
  const tone = t.textPrimary;
  const isChild = depth > 0;

  const labelStyle = isChild
    ? docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, tone, t, DOCS_TREE_UNDERLINE_OFFSET)
    : docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, tone, isBranch && (hovered || isSelected));

  return (
    <div
      {...(docsTargetId ? holonInspectTargetProps(docsTargetId) : {})}
      onClick={() => {
        onSelect?.();
        onToggle?.();
      }}
      onMouseEnter={() => {
        setHovered(true);
        if (docsTargetId) setHoveredComponentId(docsTargetId);
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (docsTargetId) setHoveredComponentId(null);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_REGISTRY_ROW_PAD_RIGHT}px 0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 4,
        ...docsTargetHighlight(
          isOutlineRowHighlighted || Boolean(docsTargetId && isHolonHighlighted),
          t.accent,
        ),
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
      <span style={{ display: "inline-flex", alignItems: "center", gap: DOCS_TREE_LABEL_CHEVRON_GAP, minWidth: 0, flex: 1 }}>
        <span style={{
          ...labelStyle,
          borderRadius: 4,
          ...docsTargetHighlight(isNameHighlighted, t.accent),
        }}>{label}</span>
        {isBranch && (
          <ChevronDown
            size={DOCS_TREE_CHEVRON_SIZE}
            color={t.textMuted}
            strokeWidth={2}
            style={{
              flexShrink: 0,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.12s ease",
            }}
          />
        )}
      </span>
      {showHolonControls && hovered && (
        <button
          type="button"
          title={inView ? "In view" : "Reveal in workspace"}
          disabled={inView}
          onClick={(e) => {
            e.stopPropagation();
            if (!inView) onReveal?.(docsTargetId);
          }}
          style={{
            width: DOCS_TREE_ICON_SLOT,
            height: DOCS_TREE_ICON_SLOT,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: inView ? "default" : "pointer",
            borderRadius: 4,
            ...docsTargetHighlight(isInViewHighlighted, t.accent),
          }}
        >
          <NotionIcon
            name={inView ? "eye" : "eye-slash"}
            size={DOCS_TREE_CHEVRON_SIZE}
            color={inView ? t.accent : t.textDim}
          />
        </button>
      )}
      {showRowActions && (
        <span
          style={{
            display: "flex",
            flexShrink: 0,
            borderRadius: 4,
            ...docsTargetHighlight(isRowActionsHighlighted, t.accent),
          }}
        >
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Holon actions"
                aria-label="Holon actions"
                onClick={(e) => e.stopPropagation()}
                className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted-foreground outline-none"
              >
                <MoreHorizontal size={14} strokeWidth={2} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={6}
              className={TOWER_POPOVER_CONTENT_CLASS}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={TOWER_POPOVER_MENU_ITEM_CLASS}
                onClick={() => {
                  onViewDetails?.(docsTargetId);
                  setMenuOpen(false);
                }}
              >
                <FileText size={14} strokeWidth={2} className="text-muted-foreground" />
                View Details
              </button>
            </PopoverContent>
          </Popover>
        </span>
      )}
    </div>
  );
}

function PanelsHolonTree({
  nodes,
  depth,
  selectedId,
  onSelect,
  closedIds,
  onToggleBranch,
  onReveal,
  onViewDetails,
  t,
}: {
  nodes: HolonTreeNode[];
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
  closedIds: Set<string>;
  onToggleBranch: (id: string) => void;
  onReveal: (id: HolonId) => void;
  onViewDetails: (id: HolonId) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = !closedIds.has(node.id);
        return (
          <div key={node.id}>
            <DocsOutlineRow
              label={node.label}
              icon={node.icon}
              lucideIcon={node.lucideIcon}
              depth={depth}
              isSelected={selectedId === node.id}
              open={hasChildren ? isOpen : undefined}
              onToggle={hasChildren ? () => onToggleBranch(node.id) : undefined}
              onSelect={() => onSelect(node.id)}
              docsTargetId={node.id}
              inView={node.inView}
              onReveal={onReveal}
              onViewDetails={onViewDetails}
              t={t}
            />
            {hasChildren && isOpen && (
              <PanelsHolonTree
                nodes={node.children}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                closedIds={closedIds}
                onToggleBranch={onToggleBranch}
                onReveal={onReveal}
                onViewDetails={onViewDetails}
                t={t}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function DocsPanel({ width, t }: DocsPanelProps) {
  const [homeOpen, setHomeOpen] = useState(true);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string>("home");
  const [closedBranchIds, setClosedBranchIds] = useState<Set<string>>(() => new Set());
  const { tree, focusHolon } = useDocsRegistry();
  const { openHolonDetail } = useHolonDetail();
  const homeInView = true;
  const outlineRowsInView = true;

  const handleViewDetails = (id: HolonId) => {
    setSelectedOutlineId(id);
    openHolonDetail(id);
  };

  const toggleBranch = (id: string) => {
    setClosedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        background: t.boardPanel,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <HolonBoundary
        id="docs-header"
        label="Console Header"
        icon="document"
        order={SHELL_HOLON_ORDER["docs-header"]}
        t={t}
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          boxSizing: "border-box",
        }}
      >
        <span style={docsLabelStyle(HEADER_LABEL_SIZE, t.textPrimary)}>
          Console
        </span>
      </HolonBoundary>

      <HolonBoundary
        id={DOCS_REGISTRY_HOLON.id}
        label={DOCS_REGISTRY_HOLON.label}
        icon={DOCS_REGISTRY_HOLON.icon}
        order={SHELL_HOLON_ORDER["docs-registry"]}
        t={t}
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingTop: s(6),
          paddingBottom: s(6),
          paddingRight: s(4),
        }}
      >
        <HolonBoundary
          id={DOCS_HOME_BRANCH_HOLON.id}
          label={DOCS_HOME_BRANCH_HOLON.label}
          icon={DOCS_HOME_BRANCH_HOLON.icon}
          order={DOCS_HOME_BRANCH_HOLON.order}
          registerOnly
          inView={homeInView}
          onFocus={() => setHomeOpen(true)}
          t={t}
        >
          {null}
        </HolonBoundary>
        <HolonBoundary
          id={DOCS_PANELS_BRANCH_HOLON.id}
          label={DOCS_PANELS_BRANCH_HOLON.label}
          icon={DOCS_PANELS_BRANCH_HOLON.icon}
          order={DOCS_PANELS_BRANCH_HOLON.order}
          registerOnly
          inView={panelsOpen}
          onFocus={() => setPanelsOpen(true)}
          t={t}
        >
          {null}
        </HolonBoundary>
        <HolonBoundary
          id={DOCS_OUTLINE_ROW_HOLON.id}
          label={DOCS_OUTLINE_ROW_HOLON.label}
          icon={DOCS_OUTLINE_ROW_HOLON.icon}
          order={DOCS_OUTLINE_ROW_HOLON.order}
          registerOnly
          inView={outlineRowsInView}
          t={t}
        >
          <HolonBoundary
            id={DOCS_ROW_NAME_HOLON.id}
            label={DOCS_ROW_NAME_HOLON.label}
            icon={DOCS_ROW_NAME_HOLON.icon}
            order={DOCS_ROW_NAME_HOLON.order}
            registerOnly
            inView={outlineRowsInView}
            t={t}
          >
            {null}
          </HolonBoundary>
          <HolonBoundary
            id={DOCS_INVIEW_INDICATOR_HOLON.id}
            label={DOCS_INVIEW_INDICATOR_HOLON.label}
            icon={DOCS_INVIEW_INDICATOR_HOLON.icon}
            order={DOCS_INVIEW_INDICATOR_HOLON.order}
            registerOnly
            inView={outlineRowsInView}
            t={t}
          >
            {null}
          </HolonBoundary>
          <HolonBoundary
            id={DOCS_ROW_ACTIONS_HOLON.id}
            label={DOCS_ROW_ACTIONS_HOLON.label}
            lucideIcon={DOCS_ROW_ACTIONS_HOLON.lucideIcon}
            order={DOCS_ROW_ACTIONS_HOLON.order}
            registerOnly
            inView={outlineRowsInView}
            t={t}
          >
            {null}
          </HolonBoundary>
        </HolonBoundary>

        <DocsOutlineRow
          label={DOCS_HOME_BRANCH_HOLON.label}
          icon={DOCS_HOME_BRANCH_HOLON.icon}
          isSelected={selectedOutlineId === "home"}
          open={homeOpen}
          onSelect={() => setSelectedOutlineId("home")}
          onToggle={() => setHomeOpen((o) => !o)}
          docsTargetId={DOCS_HOME_BRANCH_HOLON.id}
          inView={homeInView}
          onReveal={focusHolon}
          onViewDetails={handleViewDetails}
          t={t}
        />
        {homeOpen &&
          DOCS_HOME_PLACEHOLDER_ENTRIES.map((item) => (
            <DocsOutlineRow
              key={item.id}
              label={item.label}
              icon={item.icon}
              depth={1}
              isSelected={selectedOutlineId === item.id}
              onSelect={() => setSelectedOutlineId(item.id)}
              t={t}
            />
          ))}

        <div
          style={{
            margin: `${s(8)}px ${s(12)}px ${s(6)}px`,
            borderTop: `1px solid ${t.borderLight}`,
          }}
        />

        <DocsOutlineRow
          label={DOCS_PANELS_BRANCH_HOLON.label}
          icon={DOCS_PANELS_BRANCH_HOLON.icon}
          isSelected={selectedOutlineId === "panels"}
          open={panelsOpen}
          onSelect={() => setSelectedOutlineId("panels")}
          onToggle={() => setPanelsOpen((o) => !o)}
          docsTargetId={DOCS_PANELS_BRANCH_HOLON.id}
          inView={panelsOpen}
          onReveal={focusHolon}
          onViewDetails={handleViewDetails}
          t={t}
        />
        {panelsOpen && (
          <PanelsHolonTree
            nodes={tree}
            depth={1}
            selectedId={selectedOutlineId}
            onSelect={setSelectedOutlineId}
            closedIds={closedBranchIds}
            onToggleBranch={toggleBranch}
            onReveal={focusHolon}
            onViewDetails={handleViewDetails}
            t={t}
          />
        )}
      </HolonBoundary>
    </div>
  );
}
