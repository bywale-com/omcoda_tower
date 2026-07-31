import { CORE_CLOSE_FLOW } from "./coreCloseFlow";
import type { JourneyFlow, JourneyFlowStep } from "./types";

export type { JourneyFlow, JourneyFlowStep } from "./types";
export { CORE_CLOSE_FLOW } from "./coreCloseFlow";

export const JOURNEY_FLOWS: JourneyFlow[] = [CORE_CLOSE_FLOW];

export function getJourneyFlow(id: string): JourneyFlow | undefined {
  return JOURNEY_FLOWS.find((flow) => flow.id === id);
}

export function getJourneyStep(stepId: string): JourneyFlowStep | undefined {
  for (const flow of JOURNEY_FLOWS) {
    const step = flow.steps.find((candidate) => candidate.id === stepId);
    if (step) return step;
  }
  return undefined;
}

export function getJourneyFlowForStep(stepId: string): JourneyFlow | undefined {
  return JOURNEY_FLOWS.find((flow) => flow.steps.some((step) => step.id === stepId));
}
