/**
 * Tower World — machine twin of docs/register/WORLD.md
 * Persona UI / CT must call admits() — never hand-roll visibility.
 */

/** Desk seats + Approach lattice entity (operator is not a desk seat). */
export type WorldPersona = "consultant" | "engagement_contact" | "operator";

export type EngagementContactState =
  | "imported"
  | "audit_blocked"
  | "opt_in"
  | "re_engagement"
  | "reactivation_armed"
  | "reactivation_active"
  | "eligible"
  | "meeting_booked"
  | "silenced";

export type ApproachState = "in_feed" | "ad_legible" | "seed_captured" | "continued_scroll";

export type PreparedWorkspaceState =
  | "forward_deployed"
  | "db_auth_pending"
  | "escrow_pending"
  | "running"
  | "abandoned";

export type FirmSessionState = "unprovisioned" | "provisioned_signed_out" | "provisioned_signed_in";

export type WorldObject = "engagement_contact" | "approach" | "prepared_workspace" | "firm_session";

export type WorldSeat = {
  id: WorldPersona;
  name: string;
  /** Desk seat vs Approach-only lattice entity (Operator). */
  kind: "desk" | "lattice";
  whyExist: string;
  servedHow: string;
  purposeTheyServe: string;
  primaryObject: string;
  admitIff: string;
  neverSee: string[];
  naturalNeeds: string[];
  notAPersona: string;
  deskDepth?: string;
  facets?: string;
  interestFriction?: string;
};

export type AdmissionCell = "V" | "—" | "T" | "V · T";

export type EngagementAdmissionRow = {
  state: EngagementContactState;
  meaning: string;
  consultant: AdmissionCell;
  engagementContact: AdmissionCell;
};

export type ApproachAdmissionRow = {
  state: ApproachState;
  meaning: string;
  consultant: AdmissionCell;
  operator: AdmissionCell;
};

export type PreparedWorkspaceAdmissionRow = {
  state: PreparedWorkspaceState;
  meaning: string;
  consultant: AdmissionCell;
  operator: AdmissionCell;
};

export type FirmSessionAdmissionRow = {
  state: FirmSessionState;
  meaning: string;
  consultant: AdmissionCell;
};

export const WORLD_SENTENCE =
  "Tower is the always-on immigration-consultancy workspace that acquires a stranger consultant through a one-tap Meta Approach (name + website + channel within a click budget), activates by forward-deploying a no-login prepared campaign under their firm identity until they authorize database access and accept escrow, then runs the firm desk loop — keep the private contact book reachable, engage through opt-in → nudge → reactivation, refresh Client Data through touchpoints, re-evaluate service eligibility as facts and IRCC-shaped rules move, and campaign eligible people toward a booked meeting — without the consultant rechecking every file by hand, and without inventing public-before-contact detection of end-client eligibility.";

export const WORLD_SHAPE =
  "Acquisition ALG (Meta Approach; OLG/assisted still real). Activation forward-deploy + agent-earned hard inputs (DB auth + escrow). Application consultant-operated desk; Client engagement automation-led once armed. Agent = presentation feature, not a seat. Operator (Om Coda) = Approach lattice only — not a Consultant desk seat.";

export const WORLD_SEATS: WorldSeat[] = [
  {
    id: "consultant",
    name: "Consultant (firm operator)",
    kind: "desk",
    whyExist:
      "Without them there is no acquired stranger to provision for, no firm desk, no one to authorize DB / accept escrow, no one to arm audits / agents / automations, no one to take the booked meeting.",
    servedHow:
      "Acquisition: Meta Approach (feed → ad → capture → continue scroll). Activation: no-login prepared workspace + agent walkthrough until DB auth + escrow. Application: passwordless sign-in into firm-scoped Board; Contacts; Client Data; Hub; Activity. OLG path: assisted provision + OTP into the same desk.",
    purposeTheyServe:
      "Engagement contact can be reached, collected, evaluated, and invited to book — so the firm’s core outcome (meeting booked) can close.",
    primaryObject:
      "Approach session (acquisition) → Prepared workspace (activation) → Firm book of Engagement contacts / Clients + Hub configs (application)",
    admitIff:
      "Approach: stranger in Meta feed who can complete seed capture. Activation: seed inputs landed; prepared workspace served. Desk: provisioned users row under a firms tenancy + valid session (post-activation or OLG).",
    neverSee: [
      "Other firms’ books",
      "Unprovisioned create-your-firm as Core PLG",
      "Client-private channel contents not admitted to the firm",
      "Register / Om Coda internal tooling as product chrome",
      "Credits or sales-call as peer doors at activation payment",
    ],
    naturalNeeds: [
      "Acquisition: understand one-tap output; give name + website + phone/email within click budget; continue scroll if unclear",
      "Activation: walk prepared campaign; authorize DB; accept escrow; not asked for firm client PII before DB step",
      "Application: land on Board; phase / eligibility signals; import/add contacts; audit; sequences; automations; Client Data / Activity; silenced vs sequenced",
    ],
    notAPersona: "Firm admin, junior associate, VA — same Consultant seat with future permission features",
    facets:
      "Acquisition (seed inputs + click budget) → Activation (prepared workspace, DB auth, escrow) → Application (desk loop). Evolution lightly held.",
    interestFriction:
      "Interest: stale books + moving eligibility → lost meetings. Friction: distrust of feed claims; premature data/money commitment; click-budget intolerance. Residual: Meta CAC, escrow acceptability, DB-auth meaning per stack.",
  },
  {
    id: "engagement_contact",
    name: "Engagement contact (Client)",
    kind: "desk",
    whyExist:
      "Without them there is no eligibility subject, no data to refresh, no meeting to book — the consultant’s application outcome has nowhere to land.",
    servedHow:
      "Firm-branded touchpoints only (email / SMS / forms / Q&A) when admitted by sequence state — not a full operator desk in V1.",
    purposeTheyServe: "Provide / confirm facts and eventually book — so Consultant + automation can close Core outcome.",
    primaryObject: "Their own engagement record and the touchpoints currently addressed to them",
    admitIff:
      "Present in the firm book and in a state that allows outreach (not silenced; past audit when required; enrolled). Firm must already be running. Approach does not admit end-clients.",
    neverSee: [
      "Firm Board",
      "Hub Automations / Agents editors",
      "Other contacts",
      "Firm-wide audits",
      "Automations Analysis for other rows",
      "/register",
      "Approach / prepared-workspace activation chrome",
      "Escrow / firm money surfaces",
    ],
    naturalNeeds: [
      "Receive opt-in",
      "Understand why the firm is reaching out",
      "Respond to forms / Q&A",
      "Silence / opt out",
      "Book when invited",
    ],
    notAPersona: "Spouse / dependant — data on the Client record, not a second seat",
    deskDepth: "Touchpoint-only until Seed Known unknown on Client desk depth closes",
    facets:
      "No Approach; no activation as firm payer. Application touchpoints only once firm is running.",
    interestFriction:
      "Interest: timely advice when eligible. Friction: spam / trust / silence. Consent/CASL = residual (do not invent skip-opt-in because ALG).",
  },
  {
    id: "operator",
    name: "Operator (Om Coda house)",
    kind: "lattice",
    whyExist:
      "Without Om Coda operating Approach + forward-deploy, ALG has no supplier of ads, provision, templates, or agent presentation — Consultant’s acquisition/activation outcomes would dangle into “the system.”",
    servedHow:
      "Runs Meta Approach surfaces; scrapes public firm facts; instantiates Om Coda methodology templates; serves prepared workspace; agent presents walkthrough; requests DB auth + escrow; OLG-assisted bootstrap when ALG is not the path.",
    purposeTheyServe:
      "Consultant can be acquired within click budget and activated to running without sales-call as peer door and without shrinking the application desk.",
    primaryObject: "Approach surfaces + Prepared workspace (activation artifact). Not the firm’s engagement book as operator-of-record.",
    admitIff: "Om Coda house role on Approach / activation tooling — never as a Consultant product-desk login.",
    neverSee: [
      "Acting as the firm’s Consultant inside Board/Hub as if Om Coda were the client desk",
      "Inventing Operator as a third Board persona for end-users",
    ],
    naturalNeeds: [
      "Instrument don’t-understand vs understand-don’t-tap",
      "Earn hard inputs mid-layer",
      "Keep escrow-only payment door",
      "Hand off to running application",
    ],
    notAPersona:
      "Not a Consultant desk seat and not a Register product-user seat for immigration firms — Approach lattice entity only.",
    facets: "Owns acquisition (Approach) and activation (forward-deploy) supply side. Does not own application Core as a desk user.",
  },
];

/** Engagement contact admission — mirror of WORLD.md */
export const ENGAGEMENT_CONTACT_ADMISSION: EngagementAdmissionRow[] = [
  {
    state: "imported",
    meaning: "In firm book; not yet sequenced / no active opt-in",
    consultant: "V · T",
    engagementContact: "—",
  },
  {
    state: "audit_blocked",
    meaning: "Fail reachability for intended channel",
    consultant: "V · T",
    engagementContact: "—",
  },
  {
    state: "opt_in",
    meaning: "Opt-in launch active or pending first consent",
    consultant: "V · T",
    engagementContact: "V · T",
  },
  {
    state: "re_engagement",
    meaning: "Opted in; nudge cycles collecting / refreshing data",
    consultant: "V",
    engagementContact: "V · T",
  },
  {
    state: "reactivation_armed",
    meaning: "Quiet or stale; criteria met; template ready (firm-side ghost)",
    consultant: "V",
    engagementContact: "—",
  },
  {
    state: "reactivation_active",
    meaning: "Reactivation sequence executing",
    consultant: "V",
    engagementContact: "V · T",
  },
  {
    state: "eligible",
    meaning: "Rules / Analysis surfaced service eligibility",
    consultant: "V",
    engagementContact: "—",
  },
  {
    state: "meeting_booked",
    meaning: "Core outcome closed for this cycle",
    consultant: "V",
    engagementContact: "V · T",
  },
  {
    state: "silenced",
    meaning: "Opted out / excluded from auto outreach",
    consultant: "V · T",
    engagementContact: "V · T",
  },
];

/** Approach surfaces (acquisition) — Consultant + Operator. Engagement contact never admits. */
export const APPROACH_ADMISSION: ApproachAdmissionRow[] = [
  {
    state: "in_feed",
    meaning: "Scrolling Meta; Approach context available",
    consultant: "V",
    operator: "V · T",
  },
  {
    state: "ad_legible",
    meaning: "One-tap output understood (or instrumented as understood)",
    consultant: "V",
    operator: "V",
  },
  {
    state: "seed_captured",
    meaning: "Name + website + phone/email landed — acquisition ends",
    consultant: "V · T",
    operator: "V · T",
  },
  {
    state: "continued_scroll",
    meaning: "Did not tap / left — cheap disbelief",
    consultant: "V · T",
    operator: "V · T",
  },
];

/** Prepared workspace (activation) — Consultant + Operator. Engagement contact never admits. */
export const PREPARED_WORKSPACE_ADMISSION: PreparedWorkspaceAdmissionRow[] = [
  {
    state: "forward_deployed",
    meaning: "No-login prepared campaign under firm identity; walkthrough available",
    consultant: "V · T",
    operator: "V · T",
  },
  {
    state: "db_auth_pending",
    meaning: "Hard input requested: authorize firm database (or equivalent)",
    consultant: "V · T",
    operator: "V · T",
  },
  {
    state: "escrow_pending",
    meaning: "Hard input requested: accept escrow terms (contingent cost)",
    consultant: "V · T",
    operator: "V · T",
  },
  {
    state: "running",
    meaning: "Last activation inputs landed; campaign can perform — activation ends",
    consultant: "V · T",
    operator: "V",
  },
  {
    state: "abandoned",
    meaning: "Left before running",
    consultant: "V · T",
    operator: "V · T",
  },
];

export const FIRM_SESSION_ADMISSION: FirmSessionAdmissionRow[] = [
  {
    state: "unprovisioned",
    meaning: "Email not in users — generic OTP response, no code (anti-enumeration)",
    consultant: "—",
  },
  {
    state: "provisioned_signed_out",
    meaning: "User exists; no valid session",
    consultant: "V · T",
  },
  {
    state: "provisioned_signed_in",
    meaning: "Valid tower_session",
    consultant: "V · T",
  },
];

/** Personas with V (in view) for engagement_contact object — T is ownership, not visibility. */
const ENGAGEMENT_MATRIX: Record<EngagementContactState, readonly WorldPersona[]> = {
  imported: ["consultant"],
  audit_blocked: ["consultant"],
  opt_in: ["consultant", "engagement_contact"],
  re_engagement: ["consultant", "engagement_contact"],
  reactivation_armed: ["consultant"],
  reactivation_active: ["consultant", "engagement_contact"],
  eligible: ["consultant"],
  meeting_booked: ["consultant", "engagement_contact"],
  silenced: ["consultant", "engagement_contact"],
};

const APPROACH_MATRIX: Record<ApproachState, readonly WorldPersona[]> = {
  in_feed: ["consultant", "operator"],
  ad_legible: ["consultant", "operator"],
  seed_captured: ["consultant", "operator"],
  continued_scroll: ["consultant", "operator"],
};

const PREPARED_WORKSPACE_MATRIX: Record<PreparedWorkspaceState, readonly WorldPersona[]> = {
  forward_deployed: ["consultant", "operator"],
  db_auth_pending: ["consultant", "operator"],
  escrow_pending: ["consultant", "operator"],
  running: ["consultant", "operator"],
  abandoned: ["consultant", "operator"],
};

const FIRM_SESSION_MATRIX: Record<FirmSessionState, readonly WorldPersona[]> = {
  unprovisioned: [],
  provisioned_signed_out: ["consultant"],
  provisioned_signed_in: ["consultant"],
};

/**
 * True when persona may see the object in this state (V or V · T).
 * — cells return false. Operator never admits on engagement_contact or firm_session.
 * Engagement contact never admits on approach or prepared_workspace.
 */
export function admits(persona: WorldPersona, object: WorldObject, state: string): boolean {
  if (object === "engagement_contact") {
    if (persona === "operator") return false;
    const allowed = ENGAGEMENT_MATRIX[state as EngagementContactState];
    return allowed?.includes(persona) ?? false;
  }
  if (object === "approach") {
    if (persona === "engagement_contact") return false;
    const allowed = APPROACH_MATRIX[state as ApproachState];
    return allowed?.includes(persona) ?? false;
  }
  if (object === "prepared_workspace") {
    if (persona === "engagement_contact") return false;
    const allowed = PREPARED_WORKSPACE_MATRIX[state as PreparedWorkspaceState];
    return allowed?.includes(persona) ?? false;
  }
  if (object === "firm_session") {
    if (persona !== "consultant") return false;
    const allowed = FIRM_SESSION_MATRIX[state as FirmSessionState];
    return allowed?.includes(persona) ?? false;
  }
  return false;
}

/** @deprecated Use WORLD_SEATS — kept for older pane imports during reshape */
export const WORLD_SITS = WORLD_SEATS;

/** @deprecated Use ENGAGEMENT_CONTACT_ADMISSION */
export const CLIENT_ADMISSION = ENGAGEMENT_CONTACT_ADMISSION.map((row) => ({
  state: row.state,
  meaning: row.meaning,
  consultant: row.consultant,
  client: row.engagementContact,
}));
