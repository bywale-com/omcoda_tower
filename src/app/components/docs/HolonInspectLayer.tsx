import { useEffect, useRef } from "react";
import {
  HOLON_INSPECT_ID_ATTR,
  HOLON_INSPECT_PICK_ATTR,
} from "./docsHighlight";
import { useDocsHighlight } from "../../context/DocsHighlightContext";
import { useHolonDetail } from "../../context/HolonDetailContext";
import { useDocsRegistry } from "../../context/DocsRegistryContext";

type HolonInspectLayerProps = {
  onEnsureConsoleOpen: () => void;
};

function resolveInspectableHolonId(target: EventTarget | null, holonIds: Set<string>): string | null {
  if (!(target instanceof Element)) return null;

  const pickEl = target.closest(`[${HOLON_INSPECT_PICK_ATTR}]`);
  if (!pickEl) return null;

  const id = pickEl.getAttribute(HOLON_INSPECT_ID_ATTR);
  if (!id || !holonIds.has(id)) return null;
  return id;
}

export function HolonInspectLayer({ onEnsureConsoleOpen }: HolonInspectLayerProps) {
  const { isHolonInspectMode, setHoveredComponentId, setHolonInspectMode } = useDocsHighlight();
  const { openHolonDetail } = useHolonDetail();
  const { holons } = useDocsRegistry();
  const holonsRef = useRef(holons);
  holonsRef.current = holons;

  useEffect(() => {
    if (!isHolonInspectMode) return;

    const onMove = (event: MouseEvent) => {
      const holonIds = new Set(holonsRef.current.keys());
      const id = resolveInspectableHolonId(event.target, holonIds);
      setHoveredComponentId(id);
    };

    const onClick = (event: MouseEvent) => {
      const holonIds = new Set(holonsRef.current.keys());
      const id = resolveInspectableHolonId(event.target, holonIds);
      if (!id) return;

      event.preventDefault();
      event.stopPropagation();
      onEnsureConsoleOpen();
      openHolonDetail(id);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHolonInspectMode(false);
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.cursor = "crosshair";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.cursor = "";
      setHoveredComponentId(null);
    };
  }, [
    isHolonInspectMode,
    onEnsureConsoleOpen,
    openHolonDetail,
    setHolonInspectMode,
    setHoveredComponentId,
  ]);

  return null;
}
