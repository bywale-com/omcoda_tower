import { LOGIN_SEND_OTP_STEP } from "./loginSendOtpStep";
import { LOGIN_VERIFY_OTP_STEP } from "./loginVerifyOtpStep";
import type { RegisterFlow, RegisterFlowStep } from "./types";

export type { RegisterFlow, RegisterFlowStep, RegisterFlowCanvasWire, RegisterFlowGraphEdge, RegisterFlowGraphNode, RegisterFlowWireMeta, RegisterFlowWireVia } from "./types";
export { LOGIN_SEND_OTP_STEP } from "./loginSendOtpStep";
export { LOGIN_VERIFY_OTP_STEP } from "./loginVerifyOtpStep";

export const LOGIN_FLOW: RegisterFlow = {
  id: "login",
  label: "Login",
  steps: [LOGIN_SEND_OTP_STEP, LOGIN_VERIFY_OTP_STEP],
};

export const REGISTER_FLOWS: RegisterFlow[] = [LOGIN_FLOW];

export function getRegisterFlow(id: string): RegisterFlow | undefined {
  return REGISTER_FLOWS.find((flow) => flow.id === id);
}

export function getRegisterFlowStep(stepId: string): RegisterFlowStep | undefined {
  for (const flow of REGISTER_FLOWS) {
    const step = flow.steps.find((candidate) => candidate.id === stepId);
    if (step) return step;
  }
  return undefined;
}
