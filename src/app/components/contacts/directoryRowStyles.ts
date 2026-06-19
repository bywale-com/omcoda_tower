import type { CSSProperties } from "react";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import type { Tokens } from "../tokens";

/** Shared trailing meta column (phone, date) — fixed width keeps right margin stable */
export const DIRECTORY_ROW_META_WIDTH = 96;

/** Primary label in directory rows — ellipsizes before meta column */
export function directoryRowPrimaryStyle(color: string): CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: DOCS_TREE_LABEL_SIZE,
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color,
  };
}

/** Trailing meta in directory rows (phone, import date) */
export function directoryRowMetaStyle(t: Tokens): CSSProperties {
  return {
    width: DIRECTORY_ROW_META_WIDTH,
    textAlign: "right",
    fontSize: DOCS_TREE_LABEL_SIZE,
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color: t.textMuted,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}
