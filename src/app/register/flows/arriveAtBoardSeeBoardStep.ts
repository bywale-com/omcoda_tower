import {
  AUTH_SERVICE_NODE,
  CONSULTANT_WEB_APP_NODE,
  SUPABASE_NODE,
} from "../systems/registry";
import { SESSIONS_TABLE } from "../tables/registry";
import { ICEPANEL_OBJECTS } from "../../components/docs/icepanelLinks";
import type { RegisterFlowStep } from "./types";

const FLOW_LABEL = "See Board with client rows after signing in";

/**
 * Leaf test case: n-see-board — consultant sees Board after sign-in.
 * Flow anchor: n-arrive-board — after verification, redirect to app and Board.
 */
export const SEE_BOARD_AFTER_SIGN_IN_STEP: RegisterFlowStep = {
  id: "see-board-after-sign-in",
  flowId: "arrive-at-board-after-sign-in",
  flowLabel: FLOW_LABEL,
  stepLabel: "See Board after sign-in",
  purpose: "Validate session and render Board with firm client rows",
  nodes: [
    {
      id: "board-body",
      kind: "view",
      label: "Board · Clients",
      viewId: "board-clients",
      boundary: "Consultant Web App · Board",
      holonId: "board-body",
      position: { x: 40, y: 200 },
    },
    {
      id: "clients-section",
      kind: "view",
      label: "Clients Section",
      viewId: "board-clients",
      boundary: "Consultant Web App · Board Body",
      holonId: "clients-section",
      position: { x: 40, y: 320 },
    },
    {
      id: "auth-service",
      kind: "service",
      label: ICEPANEL_OBJECTS.authService.name,
      boundary: ICEPANEL_OBJECTS.authService.path,
      systemNodeId: AUTH_SERVICE_NODE.id,
      position: { x: 360, y: 120 },
    },
    {
      id: "sessions-table",
      kind: "store",
      label: SESSIONS_TABLE.name,
      boundary: "Supabase · sessions",
      position: { x: 600, y: 120 },
    },
    {
      id: "supabase",
      kind: "store",
      label: SUPABASE_NODE.label,
      boundary: SUPABASE_NODE.path,
      systemNodeId: SUPABASE_NODE.id,
      position: { x: 600, y: 240 },
    },
  ],
  edges: [
    {
      id: "board-loads-session",
      source: "board-body",
      target: "auth-service",
      label: "Validates session via",
      wireMeta: {
        method: "GET",
        path: "/auth/session",
      },
    },
    {
      id: "auth-service-reads-sessions",
      source: "auth-service",
      target: "sessions-table",
      label: "Reads session",
    },
    {
      id: "auth-service-renders-board",
      source: "auth-service",
      target: "board-body",
      label: "Authorizes app shell",
    },
  ],
  canvasWires: [
    {
      id: "navigate-to-app-after-verify",
      sourceSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "Route: /",
      conditions: [
        "Prior flow completed — tower_session cookie set (enter-email-verify-otp step 8)",
        "Browser navigates to app root after OTP verify",
      ],
      via: {
        mechanism: "navigate('/') after successful verify",
        location: "src/app/marketing/components/LoginForm.tsx · handleVerifySubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 1 },
    },
    {
      id: "auth-provider-session-check",
      sourceSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      targetSystemNodeId: AUTH_SERVICE_NODE.id,
      out: "Cookie: tower_session",
      conditions: [
        "AuthProvider mounts on app load",
        "AuthGate waits for session resolution",
      ],
      via: {
        mechanism: "GET /auth/session — cookie sent same-origin",
        location: "src/app/auth/AuthContext.tsx · refresh → src/app/auth/authClient.ts · fetchSession",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 2 },
    },
    {
      id: "auth-service-reads-sessions-table",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: SESSIONS_TABLE.id,
      out: "{ token_hash } → session row",
      conditions: [
        "Valid non-expired session for cookie",
        "Returns authenticated user + firm scope",
      ],
      via: {
        mechanism: "SELECT sessions JOIN users WHERE token_hash matches cookie",
        location: "Auth Service · session validation",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 3 },
    },
    {
      id: "auth-gate-passes-board",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "{ user, firm_id }",
      conditions: [
        "GET /auth/session returns 200 with user",
        "AuthGate renders children (not redirect to /login)",
      ],
      via: {
        mechanism: "isAuthenticated true → render app shell",
        location: "src/app/auth/AuthGate.tsx",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 4 },
    },
    {
      id: "board-body-shows-clients",
      sourceHolonId: "board-body",
      targetHolonId: "clients-section",
      out: "client rows",
      conditions: [
        "Board is signed-in landing view",
        "BoardPanel mounts Clients Section",
        "Client rows render with phase signals (prototype seed today)",
      ],
      via: {
        mechanism: "BoardPanel reads firm-scoped clientbase",
        location: "src/app/components/BoardPanel.tsx",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 5 },
    },
    {
      id: "supabase-hosts-sessions",
      sourceSystemNodeId: SUPABASE_NODE.id,
      targetTableNodeId: SESSIONS_TABLE.id,
      out: "schema",
      conditions: ["Postgres table in Firm Data Store project"],
      via: {
        mechanism: "Hosted by Supabase",
        location: "Tower Platform › Firm Data Store",
      },
      edgeStyle: "dashed",
    },
  ],
};
