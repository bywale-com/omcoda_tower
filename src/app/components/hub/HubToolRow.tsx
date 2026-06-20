import { useState } from "react";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import {
  DOCS_TREE_ACTIVE_BORDER,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
} from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "../contacts/directoryRowStyles";

export function HubToolRow({
  label,
  meta,
  icon,
  iconColor,
  iconSpin = false,
  holonId,
  isActive,
  t,
  onClick,
}: {
  label: string;
  meta: string;
  icon: NotionIconName;
  iconColor?: string;
  iconSpin?: boolean;
  holonId: string;
  isActive: boolean;
  t: Tokens;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isDocsHighlighted = useIsDocsTarget(holonId);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: onClick ? "pointer" : "default",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        borderLeft: isActive
          ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}`
          : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
        ...docsTargetHighlight(isDocsHighlighted, t.accent),
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
          name={icon}
          size={DOCS_TREE_ICON_SIZE}
          color={iconColor ?? (isActive ? t.accent : t.textMuted)}
          spin={iconSpin}
        />
      </span>

      <span style={directoryRowPrimaryStyle(t.textPrimary)} title={label}>
        {label}
      </span>

      <span style={directoryRowMetaStyle(t)}>{meta}</span>
    </div>
  );
}
