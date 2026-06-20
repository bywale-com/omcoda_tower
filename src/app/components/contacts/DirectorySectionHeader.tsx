import { useState, type ReactNode } from "react";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import { HolonBoundary } from "../docs/HolonBoundary";
import { docsBranchLabelStyle } from "../docs/treeTypography";
import {
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  s,
} from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";

function DirectorySectionIconButton({
  icon,
  title,
  t,
  onClick,
}: {
  icon: NotionIconName;
  title: string;
  t: Tokens;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "none",
        borderRadius: 4,
        background: hovered ? t.hoverBg : "transparent",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <NotionIcon name={icon} size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
    </button>
  );
}

function DirectorySectionCountBadge({ count, t }: { count: number; t: Tokens }) {
  return (
    <span
      style={{
        minWidth: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        padding: "0 5px",
        borderRadius: 999,
        background: t.sidebarBadgeBg,
        color: t.sidebarBadgeFg,
        fontSize: s(10),
        fontWeight: 500,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      {count}
    </span>
  );
}

type DirectorySectionHeaderProps = {
  holonId: string;
  holonLabel: string;
  holonIcon: NotionIconName;
  holonOrder: number;
  sectionIcon: NotionIconName;
  label: string;
  count: number;
  plusTitle: string;
  sortTitle: string;
  marginTop?: number;
  plusButton?: ReactNode;
  t: Tokens;
};

export function DirectorySectionHeader({
  holonId,
  holonLabel,
  holonIcon,
  holonOrder,
  sectionIcon,
  label,
  count,
  plusTitle,
  sortTitle,
  marginTop = 0,
  plusButton,
  t,
}: DirectorySectionHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const labelColor = t.textDim;

  return (
    <HolonBoundary
      id={holonId}
      label={holonLabel}
      icon={holonIcon}
      order={holonOrder}
      t={t}
      onMouseEnter={(e) => {
        setHovered(true);
        (e.currentTarget as HTMLElement).style.background = t.hoverBg;
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT,
        marginTop,
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
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
        <NotionIcon name={sectionIcon} size={DOCS_TREE_ICON_SIZE} color={labelColor} />
      </span>
      <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, labelColor, hovered)}>
        {label}
      </span>
      <span style={{ flex: 1, minWidth: 0 }} />
      {plusButton ?? (
        <DirectorySectionIconButton icon="plus" title={plusTitle} t={t} />
      )}
      <DirectorySectionIconButton icon="arrows-up-down" title={sortTitle} t={t} />
      <DirectorySectionCountBadge count={count} t={t} />
    </HolonBoundary>
  );
}
