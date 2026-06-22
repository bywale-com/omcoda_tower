import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Runtime holon id — registered via HolonBoundary */
export type HolonId = string;

/** @deprecated Use HolonId — kept for gradual migration */
export type DocsComponentId = HolonId;

type DocsHighlightContextValue = {
  hoveredComponentId: HolonId | null;
  setHoveredComponentId: (id: HolonId | null) => void;
  isHolonInspectMode: boolean;
  toggleHolonInspectMode: () => void;
  setHolonInspectMode: (active: boolean) => void;
};

const DocsHighlightContext = createContext<DocsHighlightContextValue | null>(null);

export function DocsHighlightProvider({ children }: { children: ReactNode }) {
  const [hoveredComponentId, setHoveredComponentId] = useState<HolonId | null>(null);
  const [isHolonInspectMode, setHolonInspectMode] = useState(false);

  const toggleHolonInspectMode = useCallback(() => {
    setHolonInspectMode((active) => !active);
  }, []);

  const value = useMemo(
    () => ({
      hoveredComponentId,
      setHoveredComponentId,
      isHolonInspectMode,
      toggleHolonInspectMode,
      setHolonInspectMode,
    }),
    [hoveredComponentId, isHolonInspectMode, toggleHolonInspectMode],
  );

  return (
    <DocsHighlightContext.Provider value={value}>
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
