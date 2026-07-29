import {
  AUTH_SERVICE_NODE,
  CONSULTANT_WEB_APP_NODE,
  RESEND_NODE,
  SUPABASE_NODE,
} from "../systems/registry";
import {
  OTP_CHALLENGES_TABLE,
  SESSIONS_TABLE,
} from "../tables/registry";
import { LOGIN_VERIFY_SUBMIT_CONTROL_HOLON } from "../../components/docs/loginHolons";
import { ICEPANEL_OBJECTS } from "../../components/docs/icepanelLinks";
import type { RegisterFlowStep } from "./types";

export const LOGIN_VERIFY_OTP_STEP: RegisterFlowStep = {
  id: "login-verify-otp",
  flowId: "enter-email-verify-otp",
  flowLabel: "Submit email, receive code, and finish signing in",
  stepLabel: "Verify OTP",
  purpose: "Complete passwordless sign-in and issue session",
  nodes: [
    {
      id: "login-verify-submit-control",
      kind: "control",
      label: LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.label,
      boundary: "Consultant Web App · Login Form",
      holonId: LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.id,
      position: { x: 40, y: 160 },
    },
    {
      id: "auth-service",
      kind: "service",
      label: ICEPANEL_OBJECTS.authService.name,
      boundary: ICEPANEL_OBJECTS.authService.path,
      systemNodeId: AUTH_SERVICE_NODE.id,
      position: { x: 320, y: 160 },
    },
    {
      id: "resend",
      kind: "provider",
      label: RESEND_NODE.label,
      boundary: RESEND_NODE.path,
      systemNodeId: RESEND_NODE.id,
      position: { x: 560, y: 48 },
    },
    {
      id: "otp-challenges-table",
      kind: "store",
      label: OTP_CHALLENGES_TABLE.name,
      boundary: "Supabase · otp_challenges",
      position: { x: 560, y: 272 },
    },
    {
      id: "sessions-table",
      kind: "store",
      label: SESSIONS_TABLE.name,
      boundary: "Supabase · sessions",
      position: { x: 800, y: 160 },
    },
  ],
  edges: [
    {
      id: "login-verify-authenticates-auth-service",
      source: "login-verify-submit-control",
      target: "auth-service",
      label: "Authenticates via",
      wireMeta: {
        method: "POST",
        path: "/auth/otp/verify",
        body: "{ email, code }",
      },
    },
    {
      id: "auth-service-writes-sessions",
      source: "auth-service",
      target: "sessions-table",
      label: "Issues session",
    },
  ],
  canvasWires: [
    {
      id: "verify-submit-to-consultant-web-app",
      sourceHolonId: LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "{ email, code }",
      conditions: [
        "Route: /login · Login · Verify view",
        "Code held in LoginForm React state (from Verification Code Field holon)",
        "User clicked Verify Email Address (form submit)",
        "Local validation passes (non-empty code, not already submitting)",
      ],
      via: {
        mechanism:
          "In-app only — form submit → handleVerifySubmit: validate, set submitting state. No network yet.",
        location:
          "src/app/marketing/components/LoginForm.tsx · handleVerifySubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 5 },
    },
    {
      id: "consultant-web-app-verify-to-auth-service",
      sourceSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      targetSystemNodeId: AUTH_SERVICE_NODE.id,
      out: "{ email, code }",
      conditions: [
        "In-app validation already passed",
        "App initiates outbound verify request (stub skips network today)",
      ],
      via: {
        mechanism: "POST /auth/otp/verify { email, code } — leaves Consultant Web App",
        location:
          "src/app/marketing/components/LoginForm.tsx · handleVerifySubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 6 },
    },
    {
      id: "auth-service-reads-otp-challenges",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: OTP_CHALLENGES_TABLE.id,
      out: "{ email, firm_id } → challenge row",
      conditions: [
        "Latest unconsumed challenge for email",
        "Not expired",
        "code_hash matches submitted code",
        "Logical decomposition of step 7 — sequential in Auth Service; single transaction with 7b",
      ],
      via: {
        mechanism:
          "SELECT + UPDATE otp_challenges SET consumed_at = now() WHERE email = $1 AND firm_id = $2",
        location: "Auth Service · OTP verification",
      },
      in: "{ consumed_at }",
      edgeStyle: "dashed",
      flowOrder: { step: 7, suffix: "a" },
    },
    {
      id: "auth-service-writes-sessions",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: SESSIONS_TABLE.id,
      out: "{ user_id, firm_id, token_hash, expires_at, created_at }",
      conditions: ["OTP verified", "Issue firm-scoped session", "Logical decomposition of step 7 — follows 7a in same transaction"],
      via: {
        mechanism: "INSERT INTO sessions (user_id, firm_id, token_hash, expires_at, created_at)",
        location: "Auth Service · session issuance",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 7, suffix: "b" },
    },
    {
      id: "auth-service-session-to-consultant-web-app",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "Set-Cookie: tower_session",
      conditions: [
        "Verify succeeded",
        "HTTP-only session cookie set (O-10 — no token in response body)",
        "App navigates to Board",
      ],
      via: {
        mechanism: "HTTP 200 + Set-Cookie: tower_session → navigate('/')",
        location: "src/app/marketing/components/LoginForm.tsx · handleVerifySubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 8 },
    },
    {
      id: "consultant-web-app-resend-branch",
      sourceSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      targetSystemNodeId: AUTH_SERVICE_NODE.id,
      out: "{ email }",
      conditions: [
        "User clicked Try sending again (handleResendCode)",
        "Reuses send-OTP path (register steps 3–4) — abbreviated canvas slice",
        "Rate-limited by Auth Service",
      ],
      via: {
        mechanism: "POST /auth/otp/send { email } — resend branch inside Verify view",
        location: "src/app/marketing/components/LoginForm.tsx · handleResendCode",
      },
      edgeStyle: "solid",
      flowOrder: { step: 9, suffix: "a" },
    },
    {
      id: "auth-service-resend-to-resend",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetSystemNodeId: RESEND_NODE.id,
      out: "{ to: email, subject, html with OTP }",
      conditions: ["Resend branch only — new OTP email"],
      via: {
        mechanism: "POST Resend API /emails",
        location: "Auth Service · email delivery (resend)",
      },
      edgeStyle: "solid",
      flowOrder: { step: 9, suffix: "b" },
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
