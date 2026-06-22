import { DEFAULT_SIDEBAR_WIDTH } from "../../../constants/layout";
import type { RegisterViewManifest } from "./types";

export const LOGIN_SIGN_IN_VIEW: RegisterViewManifest = {
  id: "login-sign-in",
  title: "Login · Sign in",
  subtitle: "Email step",
  width: 360,
  region: "login-page",
  layout: "login-card",
  layoutProps: { step: "email" },
};

export const LOGIN_VERIFY_VIEW: RegisterViewManifest = {
  id: "login-verify",
  title: "Login · Verify",
  subtitle: "Verification code step",
  width: 360,
  region: "login-page",
  layout: "login-card",
  layoutProps: { step: "verify" },
};

export const BOARD_CLIENTS_VIEW: RegisterViewManifest = {
  id: "board-clients",
  title: "Board · Clients",
  subtitle: "Left sidebar — Board nav active",
  width: DEFAULT_SIDEBAR_WIDTH,
  region: "board-sidebar",
  layout: "board-sidebar",
  layoutProps: { activeNav: "board" },
};

export const REGISTER_VIEWS: RegisterViewManifest[] = [
  BOARD_CLIENTS_VIEW,
  LOGIN_SIGN_IN_VIEW,
  LOGIN_VERIFY_VIEW,
];

export function getRegisterView(id: string): RegisterViewManifest | undefined {
  return REGISTER_VIEWS.find((view) => view.id === id);
}
