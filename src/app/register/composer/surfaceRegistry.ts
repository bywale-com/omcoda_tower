import type { RegisterHolonRenderKey } from "../../components/docs/registerMeta";
import type { RegisterSurfaceComponent } from "./surfaceTypes";
import {
  LoginEmailFieldSurface,
  LoginFormBannerSurface,
  LoginFormSurface,
  LoginSubmitControlSurface,
  LoginVerifyCodeFieldSurface,
  LoginVerifySubmitControlSurface,
} from "../surfaces/loginSurfaces";
import {
  BoardBodySurface,
  ClientNameSurface,
  ClientRowSurface,
  ClientsSectionSurface,
  PhaseSignalSurface,
  PrimaryNavigationSurface,
  RowActionsSurface,
  TaskLabelSurface,
  TaskMetaSurface,
  TaskRowSurface,
  TasksSectionSurface,
  TaskStatusToggleSurface,
} from "../surfaces/boardSurfaces";

export const REGISTER_SURFACE_REGISTRY: Record<RegisterHolonRenderKey, RegisterSurfaceComponent> = {
  "login-form": LoginFormSurface,
  "login-form-banner": LoginFormBannerSurface,
  "login-email-field": LoginEmailFieldSurface,
  "login-submit-control": LoginSubmitControlSurface,
  "login-verify-code-field": LoginVerifyCodeFieldSurface,
  "login-verify-submit-control": LoginVerifySubmitControlSurface,
  "primary-navigation": PrimaryNavigationSurface,
  "clients-section": ClientsSectionSurface,
  "board-body": BoardBodySurface,
  "client-row": ClientRowSurface,
  "phase-signal": PhaseSignalSurface,
  "client-name": ClientNameSurface,
  "row-actions": RowActionsSurface,
  "tasks-section": TasksSectionSurface,
  "task-row": TaskRowSurface,
  "task-status-toggle": TaskStatusToggleSurface,
  "task-label": TaskLabelSurface,
  "task-meta": TaskMetaSurface,
};

export function getRegisterSurface(renderKey: RegisterHolonRenderKey | undefined): RegisterSurfaceComponent | undefined {
  if (!renderKey) return undefined;
  return REGISTER_SURFACE_REGISTRY[renderKey];
}
