/**
 * Persona journey flows — happy-path walk through CT desks/surfaces.
 * Distinct from Wiring REGISTER_FLOWS (CTO wire graphs).
 */
import type { CtDeskId } from "../context/RegisterShellContext";

export type JourneyFlowStep = {
  id: string;
  /** Short rail label */
  label: string;
  /** Persona owning this beat */
  persona: CtDeskId;
  /** SURFACE-VOCAB label — drives focusSurface on CT */
  surfaceLabel: string;
  /** One-line beat for Theory */
  beat: string;
};

export type JourneyFlow = {
  id: string;
  label: string;
  /** Short summary paragraph */
  summary: string;
  steps: JourneyFlowStep[];
};
