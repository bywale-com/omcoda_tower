import { BOARD_CLIENTS_VIEW } from "./boardClientsView";
import { LOGIN_SIGN_IN_VIEW } from "./loginSignInView";
import { LOGIN_VERIFY_VIEW } from "./loginVerifyView";
import type { RegisterViewManifest } from "./types";

export type { RegisterViewHolonRef, RegisterViewManifest } from "./types";
export { BOARD_CLIENTS_VIEW } from "./boardClientsView";
export { LOGIN_SIGN_IN_VIEW } from "./loginSignInView";
export { LOGIN_VERIFY_VIEW } from "./loginVerifyView";

export const REGISTER_VIEWS: RegisterViewManifest[] = [
  BOARD_CLIENTS_VIEW,
  LOGIN_SIGN_IN_VIEW,
  LOGIN_VERIFY_VIEW,
];

export function getRegisterView(id: string): RegisterViewManifest | undefined {
  return REGISTER_VIEWS.find((view) => view.id === id);
}
