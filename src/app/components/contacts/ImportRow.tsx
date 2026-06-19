import { useState } from "react";
import type { ContactImport } from "../../data/imports";
import { IMPORT_ROW_HOLON } from "../docs/contactsBodyHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import {
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
} from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "./directoryRowStyles";

export function ImportRow({
  item,
  isActive = false,
  t,
}: {
  item: ContactImport;
  isActive?: boolean;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const isDocsHighlighted = useIsDocsTarget(IMPORT_ROW_HOLON.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: "default",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
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
        <NotionIcon name="document-arrow-up" size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
      </span>

      <span style={directoryRowPrimaryStyle(t.textPrimary)} title={item.label}>
        {item.label}
      </span>

      <span style={directoryRowMetaStyle(t)}>{item.importedAt}</span>
    </div>
  );
}
