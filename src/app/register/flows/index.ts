import { SEE_BOARD_AFTER_SIGN_IN_STEP } from "./arriveAtBoardSeeBoardStep";
import { LOGIN_SEND_OTP_STEP } from "./loginSendOtpStep";
import { LOGIN_VERIFY_OTP_STEP } from "./loginVerifyOtpStep";
import type { RegisterFlow, RegisterFlowStep } from "./types";

export type {
  RegisterFlow,
  RegisterFlowStep,
  RegisterFlowCanvasWire,
  RegisterFlowGraphEdge,
  RegisterFlowGraphNode,
  RegisterFlowWireMeta,
  RegisterFlowWireVia,
} from "./types";
export { LOGIN_SEND_OTP_STEP } from "./loginSendOtpStep";
export { LOGIN_VERIFY_OTP_STEP } from "./loginVerifyOtpStep";
export { SEE_BOARD_AFTER_SIGN_IN_STEP } from "./arriveAtBoardSeeBoardStep";

/** Flow anchor: n-verify — submit email, receive code, finish signing in. */
export const ENTER_EMAIL_VERIFY_OTP_FLOW: RegisterFlow = {
  id: "enter-email-verify-otp",
  howAnchorId: "n-verify",
  label: "Submit email, receive code, and finish signing in",
  steps: [LOGIN_SEND_OTP_STEP, LOGIN_VERIFY_OTP_STEP],
};

/** Flow anchor: n-arrive-board — redirect to app and see Board after verification. */
export const ARRIVE_AT_BOARD_AFTER_SIGN_IN_FLOW: RegisterFlow = {
  id: "arrive-at-board-after-sign-in",
  howAnchorId: "n-arrive-board",
  label: "See Board with client rows after signing in",
  steps: [SEE_BOARD_AFTER_SIGN_IN_STEP],
};

export const REGISTER_FLOWS: RegisterFlow[] = [
  ENTER_EMAIL_VERIFY_OTP_FLOW,
  ARRIVE_AT_BOARD_AFTER_SIGN_IN_FLOW,
];

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
