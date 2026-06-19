import type { CSSProperties } from "react";
import type { HolonId } from "../../context/DocsHighlightContext";
import { useDocsHighlight } from "../../context/DocsHighlightContext";

export function useIsDocsTarget(id: HolonId): boolean {
  const { hoveredComponentId } = useDocsHighlight();
  return hoveredComponentId === id;
}

/** Highlight style for pattern holons — same id, many DOM targets */
export function useHolonPatternHighlight(id: HolonId, accent: string) {
  const isHighlighted = useIsDocsTarget(id);
  return docsTargetHighlight(isHighlighted, accent);
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
