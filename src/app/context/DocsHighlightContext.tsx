import { createContext, useContext, useState, type ReactNode } from "react";

/** Runtime holon id — registered via HolonBoundary */
export type HolonId = string;

/** @deprecated Use HolonId — kept for gradual migration */
export type DocsComponentId = HolonId;

type DocsHighlightContextValue = {
  hoveredComponentId: HolonId | null;
  setHoveredComponentId: (id: HolonId | null) => void;
};

const DocsHighlightContext = createContext<DocsHighlightContextValue | null>(null);

export function DocsHighlightProvider({ children }: { children: ReactNode }) {
  const [hoveredComponentId, setHoveredComponentId] = useState<HolonId | null>(null);

  return (
    <DocsHighlightContext.Provider value={{ hoveredComponentId, setHoveredComponentId }}>
      {children}
    </DocsHighlightContext.Provider>
  );
}

export function useDocsHighlight(): DocsHighlightContextValue {
  const ctx = useContext(DocsHighlightContext);
  if (!ctx) {
    throw new Error("useDocsHighlight must be used within DocsHighlightProvider");
  }
  return ctx;
}
