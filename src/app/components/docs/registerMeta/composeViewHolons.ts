import { REGISTER_HOLON_META_LIST, REGISTER_HOLON_META_MAP } from "./registry";
import type { ComposedHolonNode, RegisterHolonMeta } from "./types";

function isHolonInView(meta: RegisterHolonMeta, viewId: string): boolean {
  return meta.views?.includes(viewId) ?? false;
}

export function getHolonMeta(holonId: string): RegisterHolonMeta | undefined {
  return REGISTER_HOLON_META_MAP.get(holonId);
}

export function composeViewHolonRoots(viewId: string): ComposedHolonNode[] {
  const visible = REGISTER_HOLON_META_LIST.filter((meta) => isHolonInView(meta, viewId));
  const visibleIds = new Set(visible.map((meta) => meta.id));

  function buildNode(meta: RegisterHolonMeta): ComposedHolonNode {
    const children = visible
      .filter((child) => child.parentId === meta.id)
      .sort(sortHolons)
      .map(buildNode);
    return { meta, children };
  }

  const roots = visible
    .filter((meta) => !meta.parentId || !visibleIds.has(meta.parentId))
    .sort(sortHolons)
    .map(buildNode);

  return roots;
}

function sortHolons(a: RegisterHolonMeta, b: RegisterHolonMeta): number {
  return a.order - b.order || a.label.localeCompare(b.label);
}

export function getPatternInstanceCount(meta: RegisterHolonMeta, viewId: string): number {
  return meta.patternInstances?.[viewId] ?? 1;
}
