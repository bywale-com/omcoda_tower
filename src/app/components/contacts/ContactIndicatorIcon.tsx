import type { ContactIndicator } from "../../data/contacts";
import {
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
} from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";

export function ContactIndicatorIcon({
  indicator,
  t,
  isRowActive,
}: {
  indicator: ContactIndicator;
  t: Tokens;
  isRowActive: boolean;
}) {
  const color =
    indicator === "sequenced"
      ? t.accent
      : indicator === "silenced"
        ? t.red
        : isRowActive
          ? t.textPrimary
          : t.textMuted;

  return (
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
      <NotionIcon name="user" size={DOCS_TREE_ICON_SIZE} color={color} />
    </span>
  );
}
