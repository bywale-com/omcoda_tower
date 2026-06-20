import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TASKS_SECTION_HOLON } from "../docs/boardBodyHolons";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { docsBranchLabelStyle } from "../docs/treeTypography";
import {
  DOCS_TREE_CHEVRON_SIZE,
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

export function TasksSectionHeader({
  count,
  open,
  onToggle,
  t,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const labelColor = t.textDim;

  return (
    <HolonBoundary
      id={TASKS_SECTION_HOLON.id}
      label={TASKS_SECTION_HOLON.label}
      icon={TASKS_SECTION_HOLON.icon}
      order={SHELL_HOLON_ORDER["tasks-section"]}
      t={t}
      onClick={onToggle}
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
        marginTop: s(4),
        borderTop: `1px solid ${t.border}`,
        cursor: "pointer",
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
        <NotionIcon
          name={TASKS_SECTION_HOLON.icon}
          size={DOCS_TREE_ICON_SIZE}
          color={labelColor}
        />
      </span>
      <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, labelColor, hovered || open)}>
        Tasks
      </span>
      <span style={{ flex: 1, minWidth: 0 }} />
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
    </HolonBoundary>
  );
}
