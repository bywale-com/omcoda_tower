/**
 * Icepanel object IDs — synced with Default domain / Tower Platform model.
 *
 * Naming rule: Icepanel component `name` and path leaf MUST match the Console
 * holon `label` (e.g. "Imports Section", "Add Import"). No extra suffixes like
 * "UI Module" or "Control". Backend services/stores keep their service names.
 */
import {
  ADD_IMPORT_CONTROL_HOLON,
  IMPORTS_SECTION_HOLON,
} from "./contactsBodyHolons";
import { DOCS_REGISTRY_HOLON } from "./docsRegistryHolons";

export const ICEPANEL_LANDSCAPE_ID = "H1FaXkARHWAdeonlJSDa";

const WEB_APP_PATH = "Tower Platform › Consultant Web App";

export type IcepanelObjectRef = {
  id: string;
  name: string;
  /** C4 path for display, e.g. Tower Platform › Consultant Web App › … */
  path: string;
};

function componentRef(objectId: string, holonLabel: string): IcepanelObjectRef {
  return {
    id: objectId,
    name: holonLabel,
    path: `${WEB_APP_PATH} › ${holonLabel}`,
  };
}

export const ICEPANEL_OBJECTS = {
  towerPlatform: {
    id: "GchDw8HRImEOum9TrCKA",
    name: "Tower Platform",
    path: "Tower Platform",
  },
  immigrationConsultant: {
    id: "Pmu5npo605BGkaqYGNEF",
    name: "Immigration Consultant",
    path: "Immigration Consultant",
  },
  consultantShellGroup: {
    id: "z6dOjQGuyukNU4nqI290",
    name: "Consultant Shell",
    path: "Consultant Shell",
  },
  backendV1Group: {
    id: "6NtnchyIsRQX680XyOEj",
    name: "Backend v1",
    path: "Backend v1",
  },
  consultantWebApp: {
    id: "pVpFwhQqmKbqkdrlZW7X",
    name: "Consultant Web App",
    path: WEB_APP_PATH,
  },
  importsSection: componentRef("5XDyqWES5Q1q69SDzHCo", IMPORTS_SECTION_HOLON.label),
  addImport: componentRef("VwUso1keWpGmfriXZZTr", ADD_IMPORT_CONTROL_HOLON.label),
  consoleRegistry: componentRef("nNZ0cMdF2eJdpaA2M0RJ", DOCS_REGISTRY_HOLON.label),
  loginForm: componentRef("gKrlaphzPezXQvRUpY3X", "Login Form"),
  emailProvider: {
    id: "NxHKN3CXBzpTP5b8tv8e",
    name: "Email Provider",
    path: "Email Provider",
  },
  authService: {
    id: "RkqLbHNV9fbIkZewyfcf",
    name: "Auth Service",
    path: "Tower Platform › Auth Service",
  },
  importService: {
    id: "wPrgzWtA4VGAAk5WuIki",
    name: "Import Service",
    path: "Tower Platform › Import Service",
  },
  auditGateService: {
    id: "NYFhqCQ71b9cZmSuPCdX",
    name: "Audit Gate Service",
    path: "Tower Platform › Audit Gate Service",
  },
  firmDataStore: {
    id: "HJT3AMkJTCXeT389N2TY",
    name: "Firm Data Store",
    path: "Tower Platform › Firm Data Store",
  },
} as const satisfies Record<string, IcepanelObjectRef>;

/** Named connections for auth slice — see ADR-004 in Icepanel. */
export const ICEPANEL_CONNECTIONS = {
  loginFormAuthenticatesVia: {
    id: "KcVKK36ljIF0rjknndes",
    name: "Authenticates via",
    originId: "gKrlaphzPezXQvRUpY3X",
    targetId: "RkqLbHNV9fbIkZewyfcf",
  },
  authServiceSendsOtpVia: {
    id: "jLlWBQGx6IuxnntxC3aW",
    name: "Sends OTP via",
    originId: "RkqLbHNV9fbIkZewyfcf",
    targetId: "NxHKN3CXBzpTP5b8tv8e",
  },
  authServiceReadsWritesStore: {
    id: "nORbrAy6ZJsfZkpVhv61",
    name: "Reads/writes firm + user",
    originId: "RkqLbHNV9fbIkZewyfcf",
    targetId: "HJT3AMkJTCXeT389N2TY",
  },
} as const;

/** Holon id → primary Icepanel component for systems-map cross-link. */
export const HOLON_TO_ICEPANEL: Partial<Record<string, IcepanelObjectRef>> = {
  "add-import-control": ICEPANEL_OBJECTS.addImport,
  "imports-section": ICEPANEL_OBJECTS.importsSection,
  "import-row": ICEPANEL_OBJECTS.importsSection,
  "docs-registry": ICEPANEL_OBJECTS.consoleRegistry,
  "docs-panels-branch": ICEPANEL_OBJECTS.consoleRegistry,
  "login-form": ICEPANEL_OBJECTS.loginForm,
  "login-email-field": ICEPANEL_OBJECTS.loginForm,
  "login-submit-control": ICEPANEL_OBJECTS.loginForm,
  "login-verify-code-field": ICEPANEL_OBJECTS.loginForm,
  "login-verify-submit-control": ICEPANEL_OBJECTS.loginForm,
  "docs-outline-row": ICEPANEL_OBJECTS.consoleRegistry,
};

export function getIcepanelRefForHolon(holonId: string): IcepanelObjectRef | undefined {
  return HOLON_TO_ICEPANEL[holonId];
}
