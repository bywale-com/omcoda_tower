/**
 * Tower World — machine twin of docs/register/WORLD.md (ecosystem assembly, 2026-07-29).
 * Quarantined craft admission grids live only in WORLD-CRAFT-ARCHIVE.md — not current World.
 * Personas craft summary: docs/register/personas.md (compact constants below for the World pane).
 */

/** Desk / lattice party ids still used by outcomes.ts (craft-PM). Not an admission seat table. */
export type WorldPersona = "consultant" | "engagement_contact" | "operator";

// ─── §0 Opening ─────────────────────────────────────────────────────────────

export type WorldShapeLayer = {
  layer: "Acquisition" | "Activation" | "Application" | "Evolution";
  meaning: string;
};

export const WORLD_SHAPE_LAYERS: WorldShapeLayer[] = [
  {
    layer: "Acquisition",
    meaning:
      "ALG — one-tap Meta Approach yielding name + website + phone/email inside a click budget. Assisted / operator-led entry (OLG) is a second real door into the same application.",
  },
  {
    layer: "Activation",
    meaning:
      "Forward-deploy + agent-earned hard inputs. A no-login prepared campaign is served first; database authorization and escrow acceptance are earned after readiness is legible.",
  },
  {
    layer: "Application",
    meaning:
      "Always-on loop over a private firm book: detection → engagement → enriched data → re-detection, toward a booked meeting. Operations are house-configured; the firm inhabits the book and the meetings.",
  },
  {
    layer: "Evolution",
    meaning:
      "Named, lightly held. Running-firm friction → documented gap → written affordance or backend facet → regenerates into the product. Not a client lifecycle phase.",
  },
];

export const WORLD_JOB =
  "World assembles the Seed into the ecosystem: entities Seed names, value-chain relationships between them, and the assumption that justifies each relationship. World does not birth product treatment, visibility grids, success measures, or platform-craft paths.";

export const WORLD_SENTENCE =
  "Tower is the always-on immigration-consultancy workspace that acquires a stranger consultant through a one-tap Meta Approach (name + website + channel within a click budget), activates by forward-deploying a no-login prepared campaign under their firm identity until they authorize database access and accept escrow, then runs the firm desk loop — keep the private contact book reachable, engage through opt-in → nudge → reactivation, refresh contact facts through touchpoints, re-evaluate service eligibility as facts and IRCC-shaped rules move, and campaign eligible people toward a booked meeting — without the consultant rechecking every file by hand, and without inventing public-before-contact detection of end-client eligibility. Om Coda runs this as an agency product: the operations that keep eligibility and engagement running are house-configured, not left for the firm to invent alone.";

export const WORLD_FACET_DOCTRINE: string[] = [
  "Activation sets the target; acquisition fulfills the seed quota.",
  "Finish lines are input sets, not a vague yes. Acquisition ends when name + website + phone/email land. Activation ends when database authorization and escrow acceptance land and the campaign can run.",
  "Click budget lives in acquisition only. Nothing hard may be pulled backwards into it.",
  "Forward-deploy lives in activation. Serving a prepared workspace is not acquisition work.",
  "Entry paths are product paths. Approach gets the same Register discipline as the desk.",
  "One Approach per acquired non-house party. House is never acquired through Approach; engagement contact is never acquired through Approach.",
  "Application does not reshape to make the growth bet cheaper.",
  "The desk is the same desk either way — ALG-provisioned and assisted-provisioned firms land in one application.",
];

export const WORLD_INPUT_CONTRACT_PINS =
  "Acquisition finish line = name + website + phone/email. Activation finish line = database authorization + escrow acceptance. Forward-deploy ∈ activation. Click budget ∈ acquisition only.";

// ─── §1 Ecosystem ───────────────────────────────────────────────────────────

export type WorldEntity = {
  entity: string;
  interest: string;
};

export const WORLD_ENTITIES: WorldEntity[] = [
  {
    entity: "Firm (tenancy)",
    interest: "Holds the private contact book; owns users and contacts as the tenancy boundary.",
  },
  {
    entity: "Consultant / firm operator",
    interest:
      "Recover booked consults and retainer starts from a dark list; stop manually rechecking files as rules and facts move; avoid reputation damage from uninformed outreach.",
  },
  {
    entity: "Engagement contact (Client)",
    interest:
      "Timely advice when their situation or the rules changed and nobody re-engaged them; free of any payment to Om Coda.",
  },
  {
    entity: "Om Coda house",
    interest:
      "Runs Tower as an agency across firms. Acquires/activates consultants into running tenancies under contingent cost; holds the operator/house configuration-and-oversight layer; maintains versioned public-reference criteria; operates the assisted door; holds escrow terms.",
  },
  {
    entity: "Om Coda Approach / ads supply",
    interest:
      "Reach consultants in a Meta feed; make one-tap output legible; capture name + website + channel inside the click budget; instrument disbelief vs continue-scroll.",
  },
  {
    entity: "Om Coda reference-data upkeep",
    interest:
      "House function inside the operator/house layer: keep versioned immigration categories, trades, cutoffs, and related tables current as data.",
  },
  {
    entity: "Om Coda Register / internal tooling",
    interest:
      "House-side methodology tooling for writing and regenerating the product. Distinct from the firm desk and from the operator/house configuration layer that runs the product.",
  },
  {
    entity: "Agent presentation layer",
    interest:
      "Present, ask, and route — on Approach, beside the prepared workspace, and toward desk actions. Never scrape, instantiate templates, fire sequences, evaluate rules, send OTP, or move money.",
  },
];

export type WorldValueChainHop = {
  fromTo: string;
  relationship: string;
  assumption: string;
};

/** Compact hops — full justifying assumptions in WORLD.md §1.2. */
export const WORLD_VALUE_CHAIN: WorldValueChainHop[] = [
  {
    fromTo: "Approach / ads → Consultant",
    relationship: "Meta Approach collects seed inputs",
    assumption: "Consultants give name + website + channel inside a click budget when one-tap output is legible.",
  },
  {
    fromTo: "Consultant → House (seed land)",
    relationship: "Stranger supplies acquisition finish-line inputs",
    assumption: "Three cheap public inputs suffice to provision a credible prepared campaign.",
  },
  {
    fromTo: "House → Consultant (forward-deploy)",
    relationship: "No-login prepared workspace under firm identity",
    assumption: "Prepared workspace proves readiness without client PII before DB authorization.",
  },
  {
    fromTo: "Agent → Consultant (activation)",
    relationship: "Agent requests the two hard inputs",
    assumption: "Agent-earned DB auth + escrow converts without sales-call as primary door.",
  },
  {
    fromTo: "Consultant → House (hard inputs)",
    relationship: "Authorize database + accept escrow",
    assumption: "Firms authorize after readiness demo; contingent terms acceptable as first money door.",
  },
  {
    fromTo: "House → Firm (running)",
    relationship: "Campaign can run; tenancy provisioned; house keeps operator layer",
    assumption: "Same application either door; agency shape requires house layer after running.",
  },
  {
    fromTo: "Register tooling → House",
    relationship: "Methodology tooling to write/regenerate product",
    assumption: "House-side; distinct from firm desk and from config layer that runs firms.",
  },
  {
    fromTo: "Reference-data → Firm evaluations",
    relationship: "Versioned immigration tables consumed by evaluations",
    assumption: "Law / public-reference side of eligibility must stay current as data, not deploy.",
  },
  {
    fromTo: "House operator layer → Firm desk loop",
    relationship: "Configures eligibility + engagement operations",
    assumption: "Agency shape: ops belong to house; firm inhabits book and meetings. Open-box.",
  },
  {
    fromTo: "Firm / Consultant → Engagement contact",
    relationship: "Firm-branded touchpoints engage and refresh facts",
    assumption: "Always-on re-evaluation + engagement beats manual chase; life-change side requires asking.",
  },
  {
    fromTo: "Engagement contact → Consultant",
    relationship: "Consent/silence, self-report, book meeting",
    assumption: "Meeting booked is V1 success; consent can coexist with firm DB auth (flagged, not closed).",
  },
  {
    fromTo: "Agent → Fulfillment",
    relationship: "Agent presents/routes only; fulfillment does the work",
    assumption: "Agent is never fulfillment — else presentation absorbs unaccountable work.",
  },
];

export type WorldObject = {
  object: string;
  role: string;
};

export const WORLD_OBJECTS: WorldObject[] = [
  { object: "Firm session", role: "Desk access after provision; passwordless OTP for known users." },
  { object: "Approach strip", role: "Acquisition strip: feed → ad → capture → continue scroll." },
  {
    object: "Prepared workspace",
    role: "No-login activation artifact from forward-deploy; proves readiness, not value.",
  },
  {
    object: "Audit batch",
    role: "Reachability gate — can we reach them and start a sequence? Not pathway scoring.",
  },
  {
    object: "Agent sequence",
    role: "Ordered channel + copy composite. Authored config; engagement record does not decide logic.",
  },
  {
    object: "Automation workflow",
    role: "Trigger → conditions/rules → structured output → enroll or act. Graph holds across verticals.",
  },
  {
    object: "Immigration reference tables",
    role: "Versioned rule inputs house maintains as data inside the operator/house layer.",
  },
  {
    object: "Signal / motion",
    role: "Detection vs send decision; Engine 2 for calendar; attempt engine for runtime channel ownership.",
  },
  { object: "Engagement contact record", role: "Shared book object; touchpoint subject; eligibility subject." },
  {
    object: "Engagement record",
    role: "Chronology of events that already fired. Authorship of order/attempts lives upstream.",
  },
  {
    object: "Escrow / contingent terms",
    role: "Commercial door firm↔Om Coda at activation; cost zero or held until release terms.",
  },
];

// ─── §2 Shape necessities · §3 Operational laws · §4 Hard gates ─────────────

export const WORLD_SHAPE_NECESSITIES: { title: string; body: string }[] = [
  {
    title: "Operator / house layer (§2.1)",
    body: "Om Coda runs Tower as an agency across firms — not self-serve the firm configures alone — so evaluation rules, analysis, operational logic, and data criteria belong to a house configuration-and-oversight layer. Open-box: inspectable and changeable without a code deploy.",
  },
  {
    title: "Two sides of detection (§2.2)",
    body: "Law / public-reference change (versioned criteria in the house layer) vs life change on the contact (ask and tell). Static book dump serves only the first; engagement loop is required for the second.",
  },
  {
    title: "Vertical modularity (§2.3)",
    body: "Same product shape for another vertical by swapping industry criteria packs — graph holds; packs and cosmetics change.",
  },
];

export const WORLD_OPERATIONAL_LAWS: { title: string; body: string }[] = [
  {
    title: "Reachability gate (§3.1)",
    body: "Audit batch answers: can we reach this contact and start a sequence? Sequence-ready when passed. Not pathway scoring or sales pass/fail.",
  },
  {
    title: "Engagement record is a record (§3.2)",
    body: "Holds events that already fired. Channel order, attempt logic, and escalation are authored upstream — not decided by the record.",
  },
  {
    title: "Two sequencing layers (§3.3)",
    body: "Campaign calendar (Engine 2: reactivation > nudge; one client, one motion) vs attempt / channel-ownership engine (runtime: one channel owns the flow). Never conflate.",
  },
  {
    title: "Open-box evaluation (§3.4)",
    body: "Operations that produce answers must be inspectable and changeable by an operator without a code deploy — same necessity as the operator/house layer.",
  },
];

export type WorldHardGate = {
  gate: string;
  layer: string;
  who: string;
  why: string;
};

export const WORLD_HARD_GATES: WorldHardGate[] = [
  { gate: "Seed capture — name, website, channel", layer: "Acquisition", who: "Consultant", why: "Stranger must act; cheap by design" },
  { gate: "Firm and user provision (assisted door)", layer: "Application bootstrap", who: "Operator", why: "Tenancy is intentional, not self-minted" },
  { gate: "One-time-code verification", layer: "Application", who: "Consultant", why: "Proves control of the email" },
  { gate: "Database authorization", layer: "Activation", who: "Consultant", why: "High-trust act over the firm's own book" },
  { gate: "Escrow acceptance", layer: "Activation", who: "Consultant", why: "Money and terms" },
  { gate: "Client consent / not silenced", layer: "Application", who: "Engagement contact", why: "Ethics and law" },
  { gate: "Meeting booking", layer: "Application", who: "Engagement contact", why: "Human commitment — core success event" },
  { gate: "Refusing illegal or unethical outreach", layer: "Application", who: "Consultant", why: "Firm responsibility, not platform policy" },
];

export const WORLD_NOT_GATES =
  "Not Tower gates (other products' worlds): power of attorney before an officer, finder licensure, disbursement of public funds.";

export const WORLD_ARCHIVE_NOTE =
  "Prior craft admission grids (seats, V/T visibility tables, admits()) are quarantined in docs/register/WORLD-CRAFT-ARCHIVE.md. That archive is not an input to the craft-PM pass and is not current World.";

// ─── Personas craft summary (docs/register/personas.md) ─────────────────────

export const PERSONAS_CRAFT_SUMMARY = {
  solePersona:
    "Consultant alone is elevated to a workspace-owning persona — the only party World acquires into the system as its own seat (ALG Approach or assisted door into the same application). Firm is the tenancy boundary, not a second seat.",
  engagementContact:
    "Engagement contact is referenced / delivery-only — not a persona; needs fulfilled as firm-branded touchpoints. Never acquired through Approach.",
  operatorShape:
    "Operator/house layer = house-global console + per-tenancy admin (not one undifferentiated operator desk). House is never an acquired stranger through Approach.",
  houseGlobal: [
    "Acquisition & ads",
    "Activation & forward-deploy",
    "Reference data",
    "Configuration libraries (house-authored packs)",
    "Oversight / sequence health",
    "Audit trail",
    "Register & evolution (prototype-time; not shipped to firms)",
    "Founder & agency controls",
    "Customer support queue",
  ],
  perTenancy: [
    "Provision (assisted door)",
    "Commercial (escrow / contingent terms)",
    "Firm operations bind (bind house packs; firms do not author)",
    "Book readiness (audit / reachability)",
    "Firm health",
    "Activation state",
    "Support context",
  ],
  ratified: [
    "Register / methodology tooling is house-side only — never firm-facing; shipped product contains no Register.",
    "Configuration libraries are authored house-globally and bound per-tenancy.",
  ],
} as const;

// ─── Seed pane map (docs/register/SEED.md — navigable summary, not dump) ────

export type SeedMapSection = {
  id: string;
  title: string;
  body: string;
};

export const SEED_MAP_SECTIONS: SeedMapSection[] = [
  {
    id: "bet",
    title: "§0 Product bet",
    body: "Immigration firms will pay for always-on engagement + eligibility re-evaluation over their book so consultants book meetings without manually rechecking every file. Proactive eligibility wrapped in engagement — not a reactive CRM.",
  },
  {
    id: "growth",
    title: "§0 Growth bet (ALG)",
    body: "Convert via ALG: one Meta tap → legible prepared workspace from seed inputs → agent earns DB auth + escrow → campaign runs. Desk not reshaped for the experiment. OLG assisted path still real. Agent presents only — never fulfillment.",
  },
  {
    id: "loop",
    title: "§5 Core loop",
    body: "Contacts → Audit (reachability only) → engagement (opt-in → nudges → reactivation) → Client Data via touchpoints → Automations / rules (R-*/B-*/Analysis) → motions → meeting booked. Nudges = data collection. Audit ≠ sales ceremony.",
  },
  {
    id: "engine2",
    title: "§5.8 Engine 2",
    body: "Signal vs motion. Reactivation first, always; nudge only when nothing is reactivation-worthy; one form consolidates every self-reportable need; secondary signals ride the pre-meeting brief; one client, one motion. Loop-closer: live brief + immediate re-eval on write-back. D-01/D-02 open.",
  },
  {
    id: "money",
    title: "§7 Money",
    body: "Firm pays Tower; end-clients never pay. First ALG money moment = escrow at activation (contingent). Credits / sales-call are not peer doors at that moment. Escrow is firm↔Om Coda commercial terms — not immigrant settlement funds.",
  },
  {
    id: "consent",
    title: "§8 Trust / consent",
    body: "Firm DB auth ≠ end-client consent. Opt-in before deep collection; respect silence. Do not invent skip-all-opt-in because ALG. CASL/SMS consent is SME-critical.",
  },
  {
    id: "gates",
    title: "§9 Hard human gates",
    body: "Seed capture · assisted provision · OTP · DB auth · escrow · client consent · meeting booking · refusing illegal outreach. Not Tower: officer POA, finder licensure, state disbursement.",
  },
  {
    id: "kus",
    title: "§13 Known unknowns (sample)",
    body: "Escrow release definition · what DB auth means per stack · Meta CAC · client desk depth · D-01/D-02 · multi-consultant roles · rule-pack IP/liability · consent regimes by geography.",
  },
  {
    id: "never",
    title: "§14 Never invent",
    body: "No public-before-contact end-client eligibility as Core · no Agent seat · no full Client console · no Operator as firm Board persona · no credits/sales-call as activation peer doors · no DB auth/escrow inside click budget · no forward-deploy as acquisition · no skip client opt-in because ALG · no claiming ALG Approach or live persistence as shipped.",
  },
];

// ─── STALE / ARCHIVE — craft admission twin (not current World) ─────────────
// Kept as thin re-exports so accidental imports fail loudly in comments, not silently.
// Source of truth for these grids: docs/register/WORLD-CRAFT-ARCHIVE.md only.

/** @deprecated STALE/ARCHIVE — craft admission seats. Not current WORLD.md assembly. */
export type ArchiveWorldPersona = WorldPersona;

/**
 * @deprecated STALE/ARCHIVE — craft admission helper from WORLD-CRAFT-ARCHIVE.
 * Current World is ecosystem assembly only; do not use for craft-PM.
 */
export function admits(_persona: WorldPersona, _object: string, _state: string): boolean {
  return false;
}
