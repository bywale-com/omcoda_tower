import type { CSSProperties } from "react";
import type { HolonId } from "../../context/DocsHighlightContext";
import { useDocsHighlight } from "../../context/DocsHighlightContext";

export const HOLON_INSPECT_ID_ATTR = "data-holon-id";
export const HOLON_INSPECT_PICK_ATTR = "data-holon-inspect-pick";

export type HolonInspectTargetProps = {
  [HOLON_INSPECT_ID_ATTR]: HolonId;
  [HOLON_INSPECT_PICK_ATTR]: "";
};

export type HolonPatternTarget = {
  style: Pick<CSSProperties, "boxShadow" | "transition">;
} & HolonInspectTargetProps;

export function holonInspectTargetProps(id: HolonId): HolonInspectTargetProps {
  return {
    [HOLON_INSPECT_ID_ATTR]: id,
    [HOLON_INSPECT_PICK_ATTR]: "",
  };
}

export function useIsDocsTarget(id: HolonId): boolean {
  const { hoveredComponentId } = useDocsHighlight();
  return hoveredComponentId === id;
}

/** Highlight style for pattern holons — same id, many DOM targets */
export function useHolonPatternHighlight(id: HolonId, accent: string): HolonPatternTarget {
  const isHighlighted = useIsDocsTarget(id);
  return {
    style: docsTargetHighlight(isHighlighted, accent),
    ...holonInspectTargetProps(id),
  };
}

export function docsTargetHighlight(
  active: boolean,
  accent: string,
): Pick<CSSProperties, "boxShadow" | "transition"> {
  return {
    boxShadow: active ? `inset 0 0 0 2px ${accent}` : "none",
    transition: "box-shadow 0.12s ease",
  };
}

/** Outer ring on a positioned node (bars, markers) — not full row lanes */
export function docsNodeHighlight(
  active: boolean,
  accent: string,
): Pick<CSSProperties, "boxShadow" | "transition" | "zIndex"> {
  return {
    boxShadow: active ? `0 0 0 2px ${accent}` : "none",
    transition: "box-shadow 0.12s ease",
    zIndex: active ? 20 : undefined,
  };
}
