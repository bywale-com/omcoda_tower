import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getJourneyFlowForStep } from "../journeyFlows";
import type { RegisterPassId } from "../passes/registerPasses";
import {
  OUTCOME_PERSONAS,
  getOutcomeByHowGraphId,
  getOutcomeById,
  getPersonaForHowGraphId,
} from "../theory/outcomes";
import type { PriorModule } from "../theory/priors";

export type WiringPaperSection = "overview" | "function" | "nodes" | "cants" | "furnish" | "human";
export type EnrichmentKind = "cants" | "furnish";

type RegisterSelectionContextValue = {
  registerPassId: RegisterPassId;
  selectedHolonId: string | null;
  hoveredHolonId: string | null;
  selectedFlowStepId: string | null;
  hoveredFlowStepId: string | null;
  selectedFlowId: string | null;
  hoveredFlowId: string | null;
  /** Persona journey flow (Flows pass) — not Wiring wire graphs */
  selectedJourneyFlowId: string | null;
  selectedJourneyStepId: string | null;
  selectedHowGraphId: string | null;
  selectedHowNodeId: string | null;
  selectedPersonaId: string | null;
  selectedOutcomeId: string | null;
  selectedSmeSeatId: string | null;
  selectedSmeItemId: string | null;
  selectedWiringPaperSection: WiringPaperSection | null;
  selectedWiringSeatId: string | null;
  selectedWiringTraceId: string | null;
  selectedWiringEntityId: string | null;
  selectedEnrichmentKind: EnrichmentKind | null;
  selectedEnrichmentSubjectId: string | null;
  selectedEnrichmentItemId: string | null;
  selectedPriorModuleId: PriorModule | null;
  selectedPriorItemId: string | null;
  /** Pinned or hovered composite step (Send OTP, Verify OTP) — Wiring only */
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
  selectJourneyFlow: (flowId: string | null) => void;
  selectJourneyStep: (stepId: string | null) => void;
  selectHowGraph: (graphId: string | null) => void;
  selectHowNode: (nodeId: string | null) => void;
  selectPersona: (personaId: string | null) => void;
  selectOutcome: (outcomeId: string, howGraphId?: string | null) => void;
  selectSmeSeat: (seatId: string | null) => void;
  selectSmeItem: (seatId: string, itemId: string) => void;
  selectWiringPaperSection: (section: WiringPaperSection | null) => void;
  selectWiringSeat: (seatId: string | null) => void;
  selectWiringTrace: (seatId: string, traceId: string) => void;
  selectWiringEntity: (section: Exclude<WiringPaperSection, "overview" | "function">, entityId: string) => void;
  selectEnrichmentSubject: (kind: EnrichmentKind, subjectId: string | null) => void;
  selectEnrichmentItem: (kind: EnrichmentKind, subjectId: string, itemId: string) => void;
  selectPriorModule: (moduleId: PriorModule | null) => void;
  selectPriorItem: (moduleId: PriorModule, itemId: string) => void;
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
  const [selectedJourneyFlowId, setSelectedJourneyFlowId] = useState<string | null>(null);
  const [selectedJourneyStepId, setSelectedJourneyStepId] = useState<string | null>(null);
  const [selectedHowGraphId, setSelectedHowGraphId] = useState<string | null>(null);
  const [selectedHowNodeId, setSelectedHowNodeId] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [selectedSmeSeatId, setSelectedSmeSeatId] = useState<string | null>(null);
  const [selectedSmeItemId, setSelectedSmeItemId] = useState<string | null>(null);
  const [selectedWiringPaperSection, setSelectedWiringPaperSection] = useState<WiringPaperSection | null>(null);
  const [selectedWiringSeatId, setSelectedWiringSeatId] = useState<string | null>(null);
  const [selectedWiringTraceId, setSelectedWiringTraceId] = useState<string | null>(null);
  const [selectedWiringEntityId, setSelectedWiringEntityId] = useState<string | null>(null);
  const [selectedEnrichmentKind, setSelectedEnrichmentKind] = useState<EnrichmentKind | null>(null);
  const [selectedEnrichmentSubjectId, setSelectedEnrichmentSubjectId] = useState<string | null>(null);
  const [selectedEnrichmentItemId, setSelectedEnrichmentItemId] = useState<string | null>(null);
  const [selectedPriorModuleId, setSelectedPriorModuleId] = useState<PriorModule | null>(null);
  const [selectedPriorItemId, setSelectedPriorItemId] = useState<string | null>(null);

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

  const clearFlowHover = useCallback(() => {
    setHoveredFlowStepIdState(null);
    setHoveredFlowIdState(null);
  }, []);

  const clearJourneySelection = useCallback(() => {
    setSelectedJourneyFlowId(null);
    setSelectedJourneyStepId(null);
  }, []);

  const clearSmeSelection = useCallback(() => {
    setSelectedSmeSeatId(null);
    setSelectedSmeItemId(null);
  }, []);

  const clearWiringPaperSelection = useCallback(() => {
    setSelectedWiringPaperSection(null);
    setSelectedWiringSeatId(null);
    setSelectedWiringTraceId(null);
    setSelectedWiringEntityId(null);
  }, []);

  const clearEnrichmentSelection = useCallback(() => {
    setSelectedEnrichmentKind(null);
    setSelectedEnrichmentSubjectId(null);
    setSelectedEnrichmentItemId(null);
  }, []);

  const clearPriorsSelection = useCallback(() => {
    setSelectedPriorModuleId(null);
    setSelectedPriorItemId(null);
  }, []);

  const selectRegisterPass = useCallback(
    (id: RegisterPassId) => {
      setRegisterPassId(id);
      if (id !== "components") {
        setSelectedHolonId(null);
      }
      if (id !== "wiring") {
        clearFlowSelection();
        clearFlowHover();
        clearWiringPaperSelection();
      }
      if (id !== "flows") {
        clearJourneySelection();
      }
      if (id !== "personas-function") {
        clearHowSelection();
      }
      if (id !== "sme") {
        clearSmeSelection();
      }
      if (id !== "enrichment" && id !== "furnish") {
        clearEnrichmentSelection();
      } else {
        const kind: EnrichmentKind = id === "furnish" ? "furnish" : "cants";
        setSelectedEnrichmentKind(kind);
        setSelectedEnrichmentSubjectId(null);
        setSelectedEnrichmentItemId(null);
      }
      if (id !== "priors") {
        clearPriorsSelection();
      } else {
        setSelectedPriorModuleId(null);
        setSelectedPriorItemId(null);
      }
    },
    [
      clearEnrichmentSelection,
      clearFlowHover,
      clearFlowSelection,
      clearHowSelection,
      clearJourneySelection,
      clearPriorsSelection,
      clearSmeSelection,
      clearWiringPaperSelection,
    ],
  );

  const selectHolon = useCallback(
    (id: string) => {
      setRegisterPassId("components");
      setSelectedHolonId(id);
      clearHowSelection();
      clearFlowSelection();
      clearFlowHover();
      clearJourneySelection();
      clearSmeSelection();
      clearWiringPaperSelection();
      clearEnrichmentSelection();
      clearPriorsSelection();
    },
    [
      clearEnrichmentSelection,
      clearFlowHover,
      clearFlowSelection,
      clearHowSelection,
      clearJourneySelection,
      clearPriorsSelection,
      clearSmeSelection,
      clearWiringPaperSelection,
    ],
  );

  const selectFlowStep = useCallback(
    (stepId: string | null) => {
      setRegisterPassId("wiring");
      setSelectedFlowStepId(stepId);
      if (stepId) {
        setSelectedFlowId(null);
        clearHowSelection();
        clearSmeSelection();
        clearJourneySelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearHowSelection, clearJourneySelection, clearSmeSelection, clearWiringPaperSelection],
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
        clearJourneySelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearHowSelection, clearJourneySelection, clearSmeSelection, clearWiringPaperSelection],
  );

  const setHoveredFlowId = useCallback((flowId: string | null) => {
    setHoveredFlowIdState(flowId);
    if (flowId) setHoveredFlowStepIdState(null);
  }, []);

  const selectJourneyFlow = useCallback(
    (flowId: string | null) => {
      setRegisterPassId("flows");
      setSelectedJourneyFlowId(flowId);
      if (flowId) {
        setSelectedJourneyStepId(null);
        clearHowSelection();
        clearFlowSelection();
        clearFlowHover();
        clearSmeSelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowHover, clearFlowSelection, clearHowSelection, clearSmeSelection, clearWiringPaperSelection],
  );

  const selectJourneyStep = useCallback(
    (stepId: string | null) => {
      setRegisterPassId("flows");
      setSelectedJourneyStepId(stepId);
      if (stepId) {
        const parent = getJourneyFlowForStep(stepId);
        if (parent) setSelectedJourneyFlowId(parent.id);
        clearHowSelection();
        clearFlowSelection();
        clearFlowHover();
        clearSmeSelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowHover, clearFlowSelection, clearHowSelection, clearSmeSelection, clearWiringPaperSelection],
  );

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
        clearFlowHover();
        clearJourneySelection();
        clearSmeSelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      } else {
        setSelectedOutcomeId(null);
      }
    },
    [clearFlowHover, clearFlowSelection, clearJourneySelection, clearSmeSelection, clearWiringPaperSelection],
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
        clearFlowHover();
        clearJourneySelection();
        clearSmeSelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowHover, clearFlowSelection, clearJourneySelection, clearSmeSelection, clearWiringPaperSelection],
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
      clearFlowHover();
      clearJourneySelection();
      clearSmeSelection();
      clearWiringPaperSelection();
      setSelectedHolonId(null);
    },
    [clearFlowHover, clearFlowSelection, clearJourneySelection, clearSmeSelection, clearWiringPaperSelection],
  );

  const selectSmeSeat = useCallback(
    (seatId: string | null) => {
      setRegisterPassId("sme");
      setSelectedSmeSeatId(seatId);
      setSelectedSmeItemId(null);
      if (seatId) {
        clearHowSelection();
        clearFlowSelection();
        clearFlowHover();
        clearJourneySelection();
        clearWiringPaperSelection();
        setSelectedHolonId(null);
      }
    },
    [clearFlowHover, clearFlowSelection, clearHowSelection, clearJourneySelection, clearWiringPaperSelection],
  );

  const selectSmeItem = useCallback(
    (seatId: string, itemId: string) => {
      setRegisterPassId("sme");
      setSelectedSmeSeatId(seatId);
      setSelectedSmeItemId(itemId);
      clearHowSelection();
      clearFlowSelection();
      clearFlowHover();
      clearJourneySelection();
      clearWiringPaperSelection();
      setSelectedHolonId(null);
    },
    [clearFlowHover, clearFlowSelection, clearHowSelection, clearJourneySelection, clearWiringPaperSelection],
  );

  const enterWiringPaper = useCallback(() => {
    setRegisterPassId("wiring");
    clearFlowSelection();
    clearFlowHover();
    clearHowSelection();
    clearSmeSelection();
    clearJourneySelection();
    setSelectedHolonId(null);
  }, [clearFlowHover, clearFlowSelection, clearHowSelection, clearJourneySelection, clearSmeSelection]);

  const selectWiringPaperSection = useCallback(
    (section: WiringPaperSection | null) => {
      enterWiringPaper();
      setSelectedWiringPaperSection(section);
      setSelectedWiringSeatId(null);
      setSelectedWiringTraceId(null);
      setSelectedWiringEntityId(null);
    },
    [enterWiringPaper],
  );

  const selectWiringSeat = useCallback(
    (seatId: string | null) => {
      enterWiringPaper();
      setSelectedWiringPaperSection("function");
      setSelectedWiringSeatId(seatId);
      setSelectedWiringTraceId(null);
      setSelectedWiringEntityId(null);
    },
    [enterWiringPaper],
  );

  const selectWiringTrace = useCallback(
    (seatId: string, traceId: string) => {
      enterWiringPaper();
      setSelectedWiringPaperSection("function");
      setSelectedWiringSeatId(seatId);
      setSelectedWiringTraceId(traceId);
      setSelectedWiringEntityId(null);
    },
    [enterWiringPaper],
  );

  const selectWiringEntity = useCallback(
    (section: Exclude<WiringPaperSection, "overview" | "function">, entityId: string) => {
      enterWiringPaper();
      setSelectedWiringPaperSection(section);
      setSelectedWiringSeatId(null);
      setSelectedWiringTraceId(null);
      setSelectedWiringEntityId(entityId);
    },
    [enterWiringPaper],
  );

  const selectEnrichmentSubject = useCallback((kind: EnrichmentKind, subjectId: string | null) => {
    setRegisterPassId(kind === "furnish" ? "furnish" : "enrichment");
    setSelectedEnrichmentKind(kind);
    setSelectedEnrichmentSubjectId(subjectId);
    setSelectedEnrichmentItemId(null);
    clearHowSelection();
    clearFlowSelection();
    clearFlowHover();
    clearJourneySelection();
    clearSmeSelection();
    clearWiringPaperSelection();
    clearPriorsSelection();
    setSelectedHolonId(null);
  }, [
    clearFlowHover,
    clearFlowSelection,
    clearHowSelection,
    clearJourneySelection,
    clearPriorsSelection,
    clearSmeSelection,
    clearWiringPaperSelection,
  ]);

  const selectEnrichmentItem = useCallback(
    (kind: EnrichmentKind, subjectId: string, itemId: string) => {
      setRegisterPassId(kind === "furnish" ? "furnish" : "enrichment");
      setSelectedEnrichmentKind(kind);
      setSelectedEnrichmentSubjectId(subjectId);
      setSelectedEnrichmentItemId(itemId);
      clearHowSelection();
      clearFlowSelection();
      clearFlowHover();
      clearJourneySelection();
      clearSmeSelection();
      clearWiringPaperSelection();
      clearPriorsSelection();
      setSelectedHolonId(null);
    },
    [
      clearFlowHover,
      clearFlowSelection,
      clearHowSelection,
      clearJourneySelection,
      clearPriorsSelection,
      clearSmeSelection,
      clearWiringPaperSelection,
    ],
  );

  const selectPriorModule = useCallback(
    (moduleId: PriorModule | null) => {
      setRegisterPassId("priors");
      setSelectedPriorModuleId(moduleId);
      setSelectedPriorItemId(null);
      clearHowSelection();
      clearFlowSelection();
      clearFlowHover();
      clearJourneySelection();
      clearSmeSelection();
      clearWiringPaperSelection();
      clearEnrichmentSelection();
      setSelectedHolonId(null);
    },
    [
      clearEnrichmentSelection,
      clearFlowHover,
      clearFlowSelection,
      clearHowSelection,
      clearJourneySelection,
      clearSmeSelection,
      clearWiringPaperSelection,
    ],
  );

  const selectPriorItem = useCallback(
    (moduleId: PriorModule, itemId: string) => {
      setRegisterPassId("priors");
      setSelectedPriorModuleId(moduleId);
      setSelectedPriorItemId(itemId);
      clearHowSelection();
      clearFlowSelection();
      clearFlowHover();
      clearJourneySelection();
      clearSmeSelection();
      clearWiringPaperSelection();
      clearEnrichmentSelection();
      setSelectedHolonId(null);
    },
    [
      clearEnrichmentSelection,
      clearFlowHover,
      clearFlowSelection,
      clearHowSelection,
      clearJourneySelection,
      clearSmeSelection,
      clearWiringPaperSelection,
    ],
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
      selectedJourneyFlowId,
      selectedJourneyStepId,
      selectedHowGraphId,
      selectedHowNodeId,
      selectedPersonaId,
      selectedOutcomeId,
      selectedSmeSeatId,
      selectedSmeItemId,
      selectedWiringPaperSection,
      selectedWiringSeatId,
      selectedWiringTraceId,
      selectedWiringEntityId,
      selectedEnrichmentKind,
      selectedEnrichmentSubjectId,
      selectedEnrichmentItemId,
      selectedPriorModuleId,
      selectedPriorItemId,
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
      selectJourneyFlow,
      selectJourneyStep,
      selectHowGraph,
      selectHowNode,
      selectPersona,
      selectOutcome,
      selectSmeSeat,
      selectSmeItem,
      selectWiringPaperSection,
      selectWiringSeat,
      selectWiringTrace,
      selectWiringEntity,
      selectEnrichmentSubject,
      selectEnrichmentItem,
      selectPriorModule,
      selectPriorItem,
    }),
    [
      registerPassId,
      selectedHolonId,
      hoveredHolonId,
      selectedFlowStepId,
      hoveredFlowStepId,
      selectedFlowId,
      hoveredFlowId,
      selectedJourneyFlowId,
      selectedJourneyStepId,
      selectedHowGraphId,
      selectedHowNodeId,
      selectedPersonaId,
      selectedOutcomeId,
      selectedSmeSeatId,
      selectedSmeItemId,
      selectedWiringPaperSection,
      selectedWiringSeatId,
      selectedWiringTraceId,
      selectedWiringEntityId,
      selectedEnrichmentKind,
      selectedEnrichmentSubjectId,
      selectedEnrichmentItemId,
      selectedPriorModuleId,
      selectedPriorItemId,
      activeFlowStepId,
      activeFlowId,
      selectRegisterPass,
      selectHolon,
      selectFlowStep,
      setHoveredFlowStepId,
      selectFlow,
      setHoveredFlowId,
      selectJourneyFlow,
      selectJourneyStep,
      selectHowGraph,
      selectHowNode,
      selectPersona,
      selectOutcome,
      selectSmeSeat,
      selectSmeItem,
      selectWiringPaperSection,
      selectWiringSeat,
      selectWiringTrace,
      selectWiringEntity,
      selectEnrichmentSubject,
      selectEnrichmentItem,
      selectPriorModule,
      selectPriorItem,
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
