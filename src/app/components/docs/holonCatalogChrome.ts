import {
  DOCS_OUTLINE_ROW_CHILD_HOLONS,
  DOCS_OUTLINE_ROW_HOLON,
} from "./docsRegistryHolons";

/** Holon ids for Console chrome — hidden under Components in /register, still in catalog. */
export const CONSOLE_CHROME_HOLON_IDS = new Set([
  "docs-header",
  "docs-registry",
  "docs-home-branch",
  "docs-panels-branch",
  DOCS_OUTLINE_ROW_HOLON.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.name.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.inViewIndicator.id,
  DOCS_OUTLINE_ROW_CHILD_HOLONS.rowActions.id,
]);
