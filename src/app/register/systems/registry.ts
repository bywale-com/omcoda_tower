import { ICEPANEL_OBJECTS } from "../../components/docs/icepanelLinks";

export type RegisterSystemNodeKind = "app" | "service" | "provider" | "platform";

export type RegisterSystemVendor = "tower" | "resend" | "supabase";

/** Reusable system nodes on the register canvas — wired to by flows. */
export type RegisterSystemNodeDef = {
  id: string;
  label: string;
  path: string;
  kind: RegisterSystemNodeKind;
  vendor: RegisterSystemVendor;
  defaultPosition: { x: number; y: number };
};

export const CONSULTANT_WEB_APP_NODE: RegisterSystemNodeDef = {
  id: "consultant-web-app",
  label: ICEPANEL_OBJECTS.consultantWebApp.name,
  path: ICEPANEL_OBJECTS.consultantWebApp.path,
  kind: "app",
  vendor: "tower",
  defaultPosition: { x: 48, y: 520 },
};

export const AUTH_SERVICE_NODE: RegisterSystemNodeDef = {
  id: "auth-service",
  label: ICEPANEL_OBJECTS.authService.name,
  path: ICEPANEL_OBJECTS.authService.path,
  kind: "service",
  vendor: "tower",
  defaultPosition: { x: 300, y: 520 },
};

export const RESEND_NODE: RegisterSystemNodeDef = {
  id: "resend",
  label: "Resend",
  path: ICEPANEL_OBJECTS.emailProvider.path,
  kind: "provider",
  vendor: "resend",
  defaultPosition: { x: 560, y: 400 },
};

export const SUPABASE_NODE: RegisterSystemNodeDef = {
  id: "supabase",
  label: "Supabase",
  path: ICEPANEL_OBJECTS.firmDataStore.path,
  kind: "platform",
  vendor: "supabase",
  defaultPosition: { x: 560, y: 640 },
};

export const REGISTER_SYSTEM_NODES: RegisterSystemNodeDef[] = [
  CONSULTANT_WEB_APP_NODE,
  AUTH_SERVICE_NODE,
  RESEND_NODE,
  SUPABASE_NODE,
];

export function getRegisterSystemNode(id: string): RegisterSystemNodeDef | undefined {
  return REGISTER_SYSTEM_NODES.find((node) => node.id === id);
}
