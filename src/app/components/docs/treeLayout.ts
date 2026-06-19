export const TREE_SCALE = 0.9;
export const s = (n: number) => n * TREE_SCALE;

export const DOCS_TREE_ROW_H = s(30);
export const DOCS_TREE_LABEL_SIZE = s(13);
export const DOCS_TREE_ICON_SLOT = s(20);
export const DOCS_TREE_ICON_SIZE = s(16);
export const DOCS_TREE_CHEVRON_SIZE = s(12);
export const DOCS_TREE_ROW_GAP = s(8);
export const DOCS_TREE_ROW_PAD_X = s(10);
/** Extra right inset so in-view + row-actions fit without clipping */
export const DOCS_REGISTRY_ROW_PAD_RIGHT = s(14);
export const DOCS_TREE_ROW_PAD_LEFT = s(12);
export const DOCS_TREE_ROW_PAD_LEFT_ACTIVE = s(10);
export const DOCS_TREE_BRANCH_LEADING = s(20);
export const DOCS_TREE_LABEL_CHEVRON_GAP = s(4);
export const DOCS_TREE_UNDERLINE_OFFSET = s(2);
export const DOCS_TREE_ROW_RADIUS = s(4);
export const DOCS_TREE_ACTIVE_BORDER = s(2);

/** Child row left padding — one nest level under a branch */
export function docsTreeChildPadLeft(active = false) {
  const base = active ? DOCS_TREE_ROW_PAD_LEFT_ACTIVE : DOCS_TREE_ROW_PAD_LEFT;
  return base + DOCS_TREE_BRANCH_LEADING;
}
