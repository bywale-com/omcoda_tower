import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type RegisterSelectionContextValue = {
  selectedHolonId: string | null;
  hoveredHolonId: string | null;
  selectedFlowStepId: string | null;
  hoveredFlowStepId: string | null;
  selectedFlowId: string | null;
  hoveredFlowId: string | null;
  /** Pinned or hovered composite step (Send OTP, Verify OTP) */
  activeFlowStepId: string | null;
  /** Pinned or hovered parent flow (Login) — only when no step is active */
  activeFlowId: string | null;
  setSelectedHolonId: (id: string | null) => void;
  selectHolon: (id: string) => void;
  setHoveredHolonId: (id: string | null) => void;
  selectFlowStep: (stepId: string | null) => void;
  setHoveredFlowStepId: (stepId: string | null) => void;
  selectFlow: (flowId: string | null) => void;
  setHoveredFlowId: (flowId: string | null) => void;
};

const RegisterSelectionContext = createContext<RegisterSelectionContextValue | null>(null);

export function RegisterSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedHolonId, setSelectedHolonId] = useState<string | null>(null);
  const [hoveredHolonId, setHoveredHolonId] = useState<string | null>(null);
  const [selectedFlowStepId, setSelectedFlowStepId] = useState<string | null>(null);
  const [hoveredFlowStepId, setHoveredFlowStepIdState] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [hoveredFlowId, setHoveredFlowIdState] = useState<string | null>(null);

  const selectHolon = useCallback((id: string) => {
    setSelectedHolonId(id);
  }, []);

  const selectFlowStep = useCallback((stepId: string | null) => {
    setSelectedFlowStepId(stepId);
    if (stepId) setSelectedFlowId(null);
  }, []);

  const setHoveredFlowStepId = useCallback((stepId: string | null) => {
    setHoveredFlowStepIdState(stepId);
    if (stepId) setHoveredFlowIdState(null);
  }, []);

  const selectFlow = useCallback((flowId: string | null) => {
    setSelectedFlowId(flowId);
    if (flowId) setSelectedFlowStepId(null);
  }, []);

  const setHoveredFlowId = useCallback((flowId: string | null) => {
    setHoveredFlowIdState(flowId);
    if (flowId) setHoveredFlowStepIdState(null);
  }, []);

  const activeFlowStepId = selectedFlowStepId ?? hoveredFlowStepId;
  const activeFlowId =
    activeFlowStepId == null ? selectedFlowId ?? hoveredFlowId : null;

  const value = useMemo(
    () => ({
      selectedHolonId,
      hoveredHolonId,
      selectedFlowStepId,
      hoveredFlowStepId,
      selectedFlowId,
      hoveredFlowId,
      activeFlowStepId,
      activeFlowId,
      setSelectedHolonId,
      selectHolon,
      setHoveredHolonId,
      selectFlowStep,
      setHoveredFlowStepId,
      selectFlow,
      setHoveredFlowId,
    }),
    [
      selectedHolonId,
      hoveredHolonId,
      selectedFlowStepId,
      hoveredFlowStepId,
      selectedFlowId,
      hoveredFlowId,
      activeFlowStepId,
      activeFlowId,
      selectHolon,
      selectFlowStep,
      setHoveredFlowStepId,
      selectFlow,
      setHoveredFlowId,
    ],
  );

  return (
    <RegisterSelectionContext.Provider value={value}>
      {children}
    </RegisterSelectionContext.Provider>
  );
}

export function useRegisterSelection(): RegisterSelectionContextValue {
  const ctx = useContext(RegisterSelectionContext);
  if (!ctx) {
    throw new Error("useRegisterSelection must be used within RegisterSelectionProvider");
  }
  return ctx;
}

/** Collect ancestor holon ids from root to target (inclusive). */
export function collectHolonAncestorIds(
  nodes: { id: string; children: { id: string; children: unknown[] }[] }[],
  targetId: string,
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return [node.id];
    const childPath = collectHolonAncestorIds(node.children, targetId);
    if (childPath) return [node.id, ...childPath];
  }
  return null;
}
