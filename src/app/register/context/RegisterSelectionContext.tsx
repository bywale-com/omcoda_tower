import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { RegisterPassId } from "../passes/registerPasses";
import {
  OUTCOME_PERSONAS,
  getOutcomeByHowGraphId,
  getOutcomeById,
  getPersonaForHowGraphId,
} from "../theory/outcomes";

type RegisterSelectionContextValue = {
  registerPassId: RegisterPassId;
  selectedHolonId: string | null;
  hoveredHolonId: string | null;
  selectedFlowStepId: string | null;
  hoveredFlowStepId: string | null;
  selectedFlowId: string | null;
  hoveredFlowId: string | null;
  selectedHowGraphId: string | null;
  selectedHowNodeId: string | null;
  selectedPersonaId: string | null;
  selectedOutcomeId: string | null;
  selectedSmeSeatId: string | null;
  selectedSmeItemId: string | null;
  /** Pinned or hovered composite step (Send OTP, Verify OTP) */
  activeFlowStepId: string | null;
  /** Pinned or hovered parent flow (Login) — only when no step is active */
  activeFlowId: string | null;
  selectRegisterPass: (id: RegisterPassId) => void;
  setSelectedHolonId: (id: string | null) => void;
  selectHolon: (id: string) => void;
  setHoveredHolonId: (id: string | null) => void;
  selectFlowStep: (stepId: string | null) => void;
  setHoveredFlowStepId: (stepId: string | null) => void;
  selectFlow: (flowId: string | null) => void;
  setHoveredFlowId: (flowId: string | null) => void;
  selectHowGraph: (graphId: string | null) => void;
  selectHowNode: (nodeId: string | null) => void;
  selectPersona: (personaId: string | null) => void;
  selectOutcome: (outcomeId: string, howGraphId?: string | null) => void;
  selectSmeSeat: (seatId: string | null) => void;
  selectSmeItem: (seatId: string, itemId: string) => void;
};

const RegisterSelectionContext = createContext<RegisterSelectionContextValue | null>(null);

export function RegisterSelectionProvider({ children }: { children: ReactNode }) {
  const [registerPassId, setRegisterPassId] = useState<RegisterPassId>("world");
  const [selectedHolonId, setSelectedHolonId] = useState<string | null>(null);
  const [hoveredHolonId, setHoveredHolonId] = useState<string | null>(null);
  const [selectedFlowStepId, setSelectedFlowStepId] = useState<string | null>(null);
  const [hoveredFlowStepId, setHoveredFlowStepIdState] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [hoveredFlowId, setHoveredFlowIdState] = useState<string | null>(null);
  const [selectedHowGraphId, setSelectedHowGraphId] = useState<string | null>(null);
  const [selectedHowNodeId, setSelectedHowNodeId] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [selectedSmeSeatId, setSelectedSmeSeatId] = useState<string | null>(null);
  const [selectedSmeItemId, setSelectedSmeItemId] = useState<string | null>(null);

  const clearHowSelection = useCallback(() => {
    setSelectedHowGraphId(null);
    setSelectedHowNodeId(null);
    setSelectedPersonaId(null);
    setSelectedOutcomeId(null);
  }, []);

  const clearFlowSelection = useCallback(() => {
    setSelectedFlowStepId(null);
    setSelectedFlowId(null);
  }, []);

  const clearSmeSelection = useCallback(() => {
    setSelectedSmeSeatId(null);
    setSelectedSmeItemId(null);
  }, []);

  const selectRegisterPass = useCallback(
    (id: RegisterPassId) => {
      setRegisterPassId(id);
      if (id !== "components") {
        setSelectedHolonId(null);
      }
      if (id !== "wiring") {
        clearFlowSelection();
      }
      if (id !== "personas-function") {
        clearHowSelection();
      }
      if (id !== "sme") {
        clearSmeSelection();
      }
    },
    [clearFlowSelection, clearHowSelection, clearSmeSelection],
  );

  const selectHolon = useCallback(
    (id: string) => {
      setRegisterPassId("components");
      setSelectedHolonId(id);
      clearHowSelection();
      clearFlowSelection();
      clearSmeSelection();
    },
    [clearFlowSelection, clearHowSelection, clearSmeSelection],
  );

  const selectFlowStep = useCallback(
    (stepId: string | null) => {
      setRegisterPassId("wiring");
      setSelectedFlowStepId(stepId);
      if (stepId) {
        setSelectedFlowId(null);
        clearHowSelection();
        clearSmeSelection();
        setSelectedHolonId(null);
      }
    },
    [clearHowSelection, clearSmeSelection],
  );

  const setHoveredFlowStepId = useCallback((stepId: string | null) => {
    setHoveredFlowStepIdState(stepId);
    if (stepId) setHoveredFlowIdState(null);
  }, []);

  const selectFlow = useCallback(
    (flowId: string | null) => {
      setRegisterPassId("wiring");
      setSelectedFlowId(flowId);
      if (flowId) {
        setSelectedFlowStepId(null);
        clearHowSelection();
        clearSmeSelection();
        setSelectedHolonId(null);
      }
    },
    [clearHowSelection, clearSmeSelection],
  );

  const setHoveredFlowId = useCallback((flowId: string | null) => {
    setHoveredFlowIdState(flowId);
    if (flowId) setHoveredFlowStepIdState(null);
  }, []);

  const selectHowGraph = useCallback(
    (graphId: string | null) => {
      setRegisterPassId("personas-function");
      setSelectedHowGraphId(graphId);
      setSelectedHowNodeId(null);
      if (graphId) {
        const outcome = getOutcomeByHowGraphId(graphId);
        const persona = getPersonaForHowGraphId(graphId);
        setSelectedOutcomeId(outcome?.id ?? null);
        setSelectedPersonaId(persona?.id ?? null);
        clearFlowSelection();
        clearSmeSelection();
        setSelectedHolonId(null);
      } else {
        setSelectedOutcomeId(null);
      }
    },
    [clearFlowSelection, clearSmeSelection],
  );

  const selectHowNode = useCallback((nodeId: string | null) => {
    setRegisterPassId("personas-function");
    setSelectedHowNodeId(nodeId);
  }, []);

  const selectPersona = useCallback(
    (personaId: string | null) => {
      setRegisterPassId("personas-function");
      setSelectedPersonaId(personaId);
      setSelectedOutcomeId(null);
      setSelectedHowGraphId(null);
      setSelectedHowNodeId(null);
      if (personaId) {
        clearFlowSelection();
        clearSmeSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowSelection, clearSmeSelection],
  );

  const selectOutcome = useCallback(
    (outcomeId: string, howGraphId?: string | null) => {
      setRegisterPassId("personas-function");
      const outcome = getOutcomeById(outcomeId);
      const graphId = howGraphId !== undefined ? howGraphId : outcome?.howGraphId ?? null;
      const persona = OUTCOME_PERSONAS.find((p) => p.outcomes.some((o) => o.id === outcomeId));
      setSelectedOutcomeId(outcomeId);
      setSelectedHowGraphId(graphId);
      setSelectedHowNodeId(null);
      setSelectedPersonaId(persona?.id ?? null);
      clearFlowSelection();
      clearSmeSelection();
      setSelectedHolonId(null);
    },
    [clearFlowSelection, clearSmeSelection],
  );

  const selectSmeSeat = useCallback(
    (seatId: string | null) => {
      setRegisterPassId("sme");
      setSelectedSmeSeatId(seatId);
      setSelectedSmeItemId(null);
      if (seatId) {
        clearHowSelection();
        clearFlowSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowSelection, clearHowSelection],
  );

  const selectSmeItem = useCallback(
    (seatId: string, itemId: string) => {
      setRegisterPassId("sme");
      setSelectedSmeSeatId(seatId);
      setSelectedSmeItemId(itemId);
      clearHowSelection();
      clearFlowSelection();
      setSelectedHolonId(null);
    },
    [clearFlowSelection, clearHowSelection],
  );

  const activeFlowStepId = selectedFlowStepId ?? hoveredFlowStepId;
  const activeFlowId = activeFlowStepId == null ? selectedFlowId ?? hoveredFlowId : null;

  const value = useMemo(
    () => ({
      registerPassId,
      selectedHolonId,
      hoveredHolonId,
      selectedFlowStepId,
      hoveredFlowStepId,
      selectedFlowId,
      hoveredFlowId,
      selectedHowGraphId,
      selectedHowNodeId,
      selectedPersonaId,
      selectedOutcomeId,
      selectedSmeSeatId,
      selectedSmeItemId,
      activeFlowStepId,
      activeFlowId,
      selectRegisterPass,
      setSelectedHolonId,
      selectHolon,
      setHoveredHolonId,
      selectFlowStep,
      setHoveredFlowStepId,
      selectFlow,
      setHoveredFlowId,
      selectHowGraph,
      selectHowNode,
      selectPersona,
      selectOutcome,
      selectSmeSeat,
      selectSmeItem,
    }),
    [
      registerPassId,
      selectedHolonId,
      hoveredHolonId,
      selectedFlowStepId,
      hoveredFlowStepId,
      selectedFlowId,
      hoveredFlowId,
      selectedHowGraphId,
      selectedHowNodeId,
      selectedPersonaId,
      selectedOutcomeId,
      selectedSmeSeatId,
      selectedSmeItemId,
      activeFlowStepId,
      activeFlowId,
      selectRegisterPass,
      selectHolon,
      selectFlowStep,
      setHoveredFlowStepId,
      selectFlow,
      setHoveredFlowId,
      selectHowGraph,
      selectHowNode,
      selectPersona,
      selectOutcome,
      selectSmeSeat,
      selectSmeItem,
    ],
  );

  return (
    <RegisterSelectionContext.Provider value={value}>{children}</RegisterSelectionContext.Provider>
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
