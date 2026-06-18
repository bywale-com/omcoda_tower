import type { CSSProperties } from "react";
import type { HolonId } from "../../context/DocsHighlightContext";
import { useDocsHighlight } from "../../context/DocsHighlightContext";

export function useIsDocsTarget(id: HolonId): boolean {
  const { hoveredComponentId } = useDocsHighlight();
  return hoveredComponentId === id;
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
