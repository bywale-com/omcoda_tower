import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "A consultant signs in to Tower and lands in their firm workspace.",
    criteria: {
      when: "When a provisioned consultant opens Tower for the first time or returns to work",
      conditions: [
        "Consultant has a registered work email",
        "Firm workspace visible after sign-in",
      ],
    },
    components: {},
    position: { x: 320, y: 0 },
  },
  {
    id: "n-signin-land",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How does a consultant sign in to Tower and land in their firm workspace?",
    clarity:
      "Consultant enters their work email, verifies a one-time code, and arrives at the Board with their client list.",
    criteria: {
      when: "When consultant navigates to Tower and is not already signed in",
      conditions: [
        "Sign-in then verify steps complete",
        "Board visible after redirect",
      ],
    },
    components: {
      ui: ["LoginForm", "Board"],
    },
    position: { x: 320, y: 130 },
  },
  {
    id: "n-verify",
    parentId: "n-signin-land",
    kind: "answer",
    depth: 2,
    question: "How does a consultant enter their work email and verify a one-time code to sign in?",
    clarity:
      "Consultant opens the login page, submits their email, receives a code, and enters the code to finish signing in.",
    criteria: {
      when: "When consultant is on the login page",
      conditions: [
        "Sign-in step then verify step",
        "Generic message shown after email submit",
      ],
    },
    components: {
      ui: ["LoginForm", "Login · Verify"],
    },
    flowId: "enter-email-verify-otp",
    position: { x: 80, y: 270 },
  },
  {
    id: "n-arrive-board",
    parentId: "n-signin-land",
    kind: "answer",
    depth: 2,
    question: "How does a consultant arrive at the Board with their client list after signing in?",
    clarity:
      "After verification, consultant is redirected to the app and sees the Board with client rows.",
    criteria: {
      when: "When verification succeeds",
      conditions: [
        "App shell loads",
        "Board is the signed-in landing view",
      ],
    },
    components: {
      ui: ["BoardPanel", "Clients Section"],
    },
    flowId: "arrive-at-board-after-sign-in",
    position: { x: 520, y: 270 },
  },
  {
    id: "n-send-email",
    parentId: "n-verify",
    kind: "leaf",
    depth: 3,
    question: "How does a consultant open the login page and submit their work email?",
    clarity:
      "Consultant enters email on sign-in card and submits; Auth Service resolves user, sends OTP via Resend, UI advances to verify step.",
    criteria: {
      when: "When consultant submits the sign-in form with a valid email format",
      conditions: [
        "POST /auth/otp/send",
        "Generic success message regardless of provisioning",
        "Verify step shown on 200",
      ],
    },
    components: {
      ui: ["LoginForm sign-in step", "Send code control"],
      runtime: ["Auth Service"],
      external: ["Resend"],
      stores: ["users", "otp_challenges"],
    },
    isLeaf: true,
    prototypeRef: ["login-sign-in"],
    position: { x: 0, y: 410 },
  },
  {
    id: "n-enter-code",
    parentId: "n-verify",
    kind: "leaf",
    depth: 3,
    question: "How does a consultant receive and enter a one-time code to complete sign-in?",
    clarity:
      "Consultant enters six-digit OTP on verify card; Auth Service validates code, creates session, sets tower_session cookie.",
    criteria: {
      when: "When consultant submits OTP before expiry",
      conditions: [
        "POST /auth/otp/verify",
        "Session row created in store",
        "HttpOnly cookie set on success",
      ],
    },
    components: {
      ui: ["LoginForm verify step", "OTP input"],
      runtime: ["Auth Service"],
      stores: ["sessions", "otp_challenges"],
    },
    isLeaf: true,
    prototypeRef: ["login-verify"],
    position: { x: 200, y: 410 },
  },
  {
    id: "n-see-board",
    parentId: "n-arrive-board",
    kind: "leaf",
    depth: 3,
    question: "How does a consultant see the Board after signing in?",
    clarity:
      "AuthGate reads tower_session on app load; valid session renders app shell with BoardPanel and client rows from firm clientbase query.",
    criteria: {
      when: "When consultant hits / with valid session cookie",
      conditions: [
        "GET /auth/session returns authenticated",
        "BoardPanel mounts with client list",
      ],
    },
    components: {
      ui: ["AuthGate", "BoardPanel", "Primary Navigation", "Clients Section"],
      runtime: ["Auth Service"],
    },
    isLeaf: true,
    prototypeRef: ["board-body"],
    position: { x: 520, y: 410 },
  },
];

export const CONSULTANT_ON_TOWER_GRAPH: HowGraph = {
  id: "consultant-on-tower",
  label: "Consultant Gets On Tower",
  epicOrder: 1,
  personaId: "consultant",
  outcomeId: "consultant-access",
  nodes,
};

export function getConsultantOnTowerNode(nodeId: string): HowNode | undefined {
  return nodes.find((node) => node.id === nodeId);
}
