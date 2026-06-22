import {
  AUTH_SERVICE_NODE,
  CONSULTANT_WEB_APP_NODE,
  RESEND_NODE,
  SUPABASE_NODE,
} from "../systems/registry";
import {
  FIRMS_TABLE,
  OTP_CHALLENGES_TABLE,
  USERS_TABLE,
} from "../tables/registry";
import { LOGIN_SUBMIT_CONTROL_HOLON } from "../../components/docs/loginHolons";
import { ICEPANEL_OBJECTS } from "../../components/docs/icepanelLinks";
import type { RegisterFlowStep } from "./types";

export const LOGIN_SEND_OTP_STEP: RegisterFlowStep = {
  id: "login-send-otp",
  flowId: "login",
  flowLabel: "Login",
  stepLabel: "Send OTP",
  purpose: "Start passwordless sign-in",
  nodes: [
    {
      id: "login-submit-control",
      kind: "control",
      label: LOGIN_SUBMIT_CONTROL_HOLON.label,
      boundary: "Consultant Web App · Login Form",
      holonId: LOGIN_SUBMIT_CONTROL_HOLON.id,
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
      id: "supabase",
      kind: "store",
      label: SUPABASE_NODE.label,
      boundary: SUPABASE_NODE.path,
      systemNodeId: SUPABASE_NODE.id,
      position: { x: 560, y: 160 },
    },
    {
      id: "otp-challenges-table",
      kind: "store",
      label: OTP_CHALLENGES_TABLE.name,
      boundary: "Supabase · otp_challenges",
      position: { x: 800, y: 120 },
    },
    {
      id: "login-verify-view",
      kind: "view",
      label: "Login · Verify",
      viewId: "login-verify",
      boundary: "Consultant Web App · Login Form",
      position: { x: 800, y: 272 },
    },
  ],
  edges: [
    {
      id: "login-submit-authenticates-auth-service",
      source: "login-submit-control",
      target: "auth-service",
      label: "Authenticates via",
      wireMeta: {
        method: "POST",
        path: "/auth/otp/send",
        body: "{ email }",
      },
    },
    {
      id: "auth-service-sends-otp-resend",
      source: "auth-service",
      target: "resend",
      label: "Sends OTP via",
    },
    {
      id: "auth-service-writes-otp-challenges",
      source: "auth-service",
      target: "otp-challenges-table",
      label: "Writes OTP state",
    },
    {
      id: "auth-service-shows-login-verify",
      source: "auth-service",
      target: "login-verify-view",
      label: "Shows verify step",
    },
  ],
  canvasWires: [
    {
      id: "login-submit-to-consultant-web-app",
      sourceHolonId: LOGIN_SUBMIT_CONTROL_HOLON.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "{ email }",
      conditions: [
        "Route: /login · Login · Sign in view",
        "Email held in LoginForm React state (from Email Field holon)",
        "User clicked Log In (form submit)",
        "Local validation passes (non-empty email, not already submitting)",
      ],
      via: {
        mechanism:
          "In-app only — form submit → handleEmailSubmit: validate, set submitting state. No network yet.",
        location:
          "src/app/marketing/pages/LoginPage.tsx → src/app/marketing/components/LoginForm.tsx · handleEmailSubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 1 },
    },
    {
      id: "consultant-web-app-to-auth-service",
      sourceSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      targetSystemNodeId: AUTH_SERVICE_NODE.id,
      out: "{ email }",
      conditions: [
        "In-app validation already passed (Consultant Web App wire)",
        "App initiates outbound auth request (stub skips network today)",
      ],
      via: {
        mechanism: "POST /auth/otp/send { email } — leaves Consultant Web App",
        location:
          "src/app/marketing/components/LoginForm.tsx · handleEmailSubmit (until auth client extracted)",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 2 },
    },
    {
      id: "auth-service-reads-firms",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: FIRMS_TABLE.id,
      out: "{ email } → lookup firm_id",
      conditions: ["Firm provisioned before login (assisted onboarding)", "Match user email to firm tenancy", "Logical read — implemented as single JOIN with step 3b"],
      via: {
        mechanism: "SELECT firms JOIN users ON firm_id WHERE email = $1",
        location: "Auth Service · tenancy resolver",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 3, suffix: "a" },
    },
    {
      id: "auth-service-reads-users",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: USERS_TABLE.id,
      out: "{ email, firm_id }",
      conditions: ["User row exists for consultant email", "Runs after firm resolved", "Logical decomposition of step 3 — sequential in Auth Service"],
      via: {
        mechanism: "SELECT * FROM users WHERE email = $1 AND firm_id = $2",
        location: "Auth Service · user lookup",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 3, suffix: "b" },
    },
    {
      id: "auth-service-writes-otp-challenges",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetTableNodeId: OTP_CHALLENGES_TABLE.id,
      out: "{ firm_id, email, code_hash, expires_at, created_at }",
      conditions: ["OTP generated (never store plaintext code)", "Prior unconsumed challenges invalidated on new send", "Logical decomposition of step 3 — sequential in Auth Service"],
      via: {
        mechanism: "INSERT INTO otp_challenges (firm_id, email, code_hash, expires_at, created_at)",
        location: "Auth Service · OTP persistence",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 3, suffix: "c" },
    },
    {
      id: "auth-service-sends-resend",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetSystemNodeId: RESEND_NODE.id,
      out: "{ to: email, subject, html with OTP }",
      conditions: ["OTP row persisted", "Deliver code to consultant inbox", "Logical decomposition of step 3 — runs after commit; 503 if Resend fails"],
      via: {
        mechanism: "POST Resend API /emails",
        location: "Auth Service · email delivery",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 3, suffix: "d" },
    },
    {
      id: "auth-service-success-to-consultant-web-app",
      sourceSystemNodeId: AUTH_SERVICE_NODE.id,
      targetSystemNodeId: CONSULTANT_WEB_APP_NODE.id,
      out: "{ ok: true }",
      conditions: ["Send OTP succeeded", "App advances to Login · Verify view"],
      via: {
        mechanism: "HTTP 200 → setStep('verify') in LoginForm",
        location: "src/app/marketing/components/LoginForm.tsx · handleEmailSubmit",
      },
      edgeStyle: "dashed",
      flowOrder: { step: 4 },
    },
    {
      id: "supabase-hosts-otp-challenges",
      sourceSystemNodeId: SUPABASE_NODE.id,
      targetTableNodeId: OTP_CHALLENGES_TABLE.id,
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
