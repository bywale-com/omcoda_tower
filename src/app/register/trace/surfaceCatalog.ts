/**
 * Register surface catalog — every Title Case label from
 * docs/sme/implementation/00-SURFACE-VOCAB.md, plus migration aliases.
 */

export type SurfaceDesk = "consultant" | "operator" | "contact";
export type SurfaceBuildStatus = "exists" | "wrong-seat" | "new";

export type RegisterSurfaceEntry = {
  id: string;
  label: string;
  desk: SurfaceDesk;
  /** Top module to navigate within the desk scene. */
  module: string;
  status: SurfaceBuildStatus;
  aliases?: string[];
};

function entry(
  label: string,
  desk: SurfaceDesk,
  module: string,
  status: SurfaceBuildStatus,
  aliases?: string[],
): RegisterSurfaceEntry {
  return {
    id: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    label,
    desk,
    module,
    status,
    ...(aliases ? { aliases } : {}),
  };
}

/** Full catalog — exact vocab labels only (aliases are non-vocab migration keys). */
export const SURFACE_CATALOG: RegisterSurfaceEntry[] = [
  // ── Consultant desk ──────────────────────────────────────────────
  entry("Board", "consultant", "Board", "exists"),
  entry("Contacts", "consultant", "Contacts", "exists"),
  entry("Meetings", "consultant", "Meetings", "new"),
  entry("Login", "consultant", "Login", "exists", [
    "Email field / Send code",
    "Verify code",
    "Access OTP",
  ]),
  entry("Client row", "consultant", "Board", "exists"),
  entry("Phase signal", "consultant", "Board", "exists"),
  entry("Engagement record", "consultant", "Contacts", "exists"),
  entry("Client Brief", "consultant", "Contacts", "exists"),
  entry("Live brief", "consultant", "Meetings", "exists"),
  entry("Halt outreach", "consultant", "Board", "new"),
  entry("Imports", "consultant", "Contacts", "exists"),
  entry("Meeting row", "consultant", "Meetings", "new"),
  entry("Prepared Workspace", "consultant", "Prepared Workspace", "new"),
  entry("Authorize book", "consultant", "Prepared Workspace", "new"),
  entry("Accept terms", "consultant", "Prepared Workspace", "new"),
  entry("License acknowledgement", "consultant", "Prepared Workspace", "new"),
  entry("Escrow terms", "consultant", "Prepared Workspace", "new"),

  // ── Engagement contact ───────────────────────────────────────────
  entry("Opt-in message", "contact", "Client portal", "exists"),
  entry("Consent request", "contact", "Client portal", "exists"),
  entry("Nudge message", "contact", "Client portal", "exists"),
  entry("Nudge form", "contact", "Client portal", "exists"),
  entry("Silence / Opt out", "contact", "Client portal", "new"),
  entry("Meeting invitation", "contact", "Client portal", "new"),
  entry("Booking", "contact", "Client portal", "new"),
  entry("Loop-closer form", "contact", "Client portal", "new"),
  entry("Update facts", "contact", "Client portal", "new"),

  // ── Operator — house-global ──────────────────────────────────────
  entry("Acquisition & ads", "operator", "Acquisition & ads", "new"),
  entry("Approach campaigns", "operator", "Acquisition & ads", "new"),
  entry("Capture strip", "operator", "Acquisition & ads", "new"),
  entry("Approach instrumentation", "operator", "Acquisition & ads", "new"),
  entry("Activation & forward-deploy", "operator", "Activation & forward-deploy", "new"),
  entry("In-flight activations", "operator", "Activation & forward-deploy", "new"),
  entry("Forward-deploy", "operator", "Activation & forward-deploy", "new"),
  entry("Template version", "operator", "Activation & forward-deploy", "new"),
  entry("Hydrate", "operator", "Activation & forward-deploy", "new"),
  entry("Staging status chips", "operator", "Activation & forward-deploy", "new"),
  entry("Readiness walkthrough", "operator", "Activation & forward-deploy", "new"),
  entry("Hard-input status", "operator", "Activation & forward-deploy", "new"),
  entry("Reference data", "operator", "Reference data", "new"),
  entry("Reference tables", "operator", "Reference data", "new"),
  entry("Import criteria", "operator", "Reference data", "new"),
  entry("Publish version", "operator", "Reference data", "new"),
  entry("Configuration libraries", "operator", "Configuration libraries", "new"),
  entry("Evaluation packs", "operator", "Configuration libraries", "wrong-seat"),
  entry("Evaluation pack editor", "operator", "Configuration libraries", "wrong-seat"),
  entry("Automation workflows", "operator", "Configuration libraries", "wrong-seat", [
    "Automations",
  ]),
  entry("Workflow canvas", "operator", "Configuration libraries", "wrong-seat", [
    "Hub Automations",
  ]),
  entry("Engagement templates", "operator", "Configuration libraries", "wrong-seat", ["Agents"]),
  entry("Agent / sequence editor", "operator", "Configuration libraries", "wrong-seat", [
    "Hub Agents",
  ]),
  entry("Oversight", "operator", "Oversight", "new"),
  entry("Fleet health", "operator", "Oversight", "new"),
  entry("Firm row", "operator", "Oversight", "new"),
  entry("Audit trail", "operator", "Audit trail", "new"),
  entry("Change event", "operator", "Audit trail", "new"),
  entry("Firm filter", "operator", "Audit trail", "new"),
  entry("Actor filter", "operator", "Audit trail", "new"),
  entry("Register & evolution", "operator", "Register & evolution", "new"),
  entry("Gaps", "operator", "Register & evolution", "new"),
  entry("Gap", "operator", "Register & evolution", "new"),
  entry("Regenerate handoff", "operator", "Register & evolution", "new"),
  entry("Founder & agency controls", "operator", "Founder & agency controls", "new"),
  entry("Agency policy", "operator", "Founder & agency controls", "new"),
  entry("Bounds", "operator", "Founder & agency controls", "new"),
  entry("Kill-switch", "operator", "Founder & agency controls", "new"),
  entry("Customer support", "operator", "Customer support", "new"),
  entry("Ticket queue", "operator", "Customer support", "new"),
  entry("Ticket", "operator", "Customer support", "new"),
  entry("Support context", "operator", "Customer support", "new"),

  // ── Operator — per-tenancy ───────────────────────────────────────
  entry("Provision", "operator", "Provision", "new"),
  entry("New firm", "operator", "Provision", "new"),
  entry("Commercial", "operator", "Commercial", "new"),
  entry("Escrow status", "operator", "Commercial", "new"),
  entry("Release control", "operator", "Commercial", "new"),
  entry("Firm operations bind", "operator", "Firm operations bind", "new"),
  entry("Bind packs", "operator", "Firm operations bind", "new"),
  entry("Armed / Active", "operator", "Firm operations bind", "new"),
  entry("Book readiness", "operator", "Book readiness", "wrong-seat"),
  entry("Audits", "operator", "Book readiness", "wrong-seat"),
  entry("Audit run", "operator", "Book readiness", "wrong-seat"),
  entry("Verdict list", "operator", "Book readiness", "wrong-seat"),
  entry("Firm health", "operator", "Firm health", "new"),
  entry("Sequence health", "operator", "Firm health", "new"),
  entry("Engagement health", "operator", "Firm health", "new"),
  entry("Sequence detail", "operator", "Firm health", "new"),
  entry("Activation state", "operator", "Activation state", "new"),
  entry("Progress", "operator", "Activation state", "new"),
];

const byId = new Map(SURFACE_CATALOG.map((e) => [e.id, e]));
const byLabel = new Map(SURFACE_CATALOG.map((e) => [e.label, e]));

/** Exact label or id lookup. */
export function getSurfaceByLabel(label: string): RegisterSurfaceEntry | undefined {
  const trimmed = label.trim();
  return byLabel.get(trimmed) ?? byId.get(trimmed) ?? byId.get(trimmed.toLowerCase());
}

type MatchNeedle = { needle: string; entry: RegisterSurfaceEntry };

const MATCH_NEEDLES: MatchNeedle[] = (() => {
  const items: MatchNeedle[] = [];
  for (const e of SURFACE_CATALOG) {
    items.push({ needle: e.label, entry: e });
    for (const alias of e.aliases ?? []) {
      items.push({ needle: alias, entry: e });
    }
  }
  items.sort((a, b) => b.needle.length - a.needle.length);
  return items;
})();

/**
 * Longest alias/label match against free text (or exact needle).
 * Prefer exact full-string match when the input is a single label/alias.
 */
export function resolveSurfaceLabel(text: string): RegisterSurfaceEntry | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  for (const { needle, entry: e } of MATCH_NEEDLES) {
    if (needle === trimmed) return e;
  }

  let best: MatchNeedle | undefined;
  for (const item of MATCH_NEEDLES) {
    if (!trimmed.includes(item.needle)) continue;
    if (!best || item.needle.length > best.needle.length) best = item;
  }
  return best?.entry;
}

/** Vocab Title Case labels (no aliases) — longest-first for scanning. */
export function listVocabLabels(): string[] {
  return SURFACE_CATALOG.map((e) => e.label).sort((a, b) => b.length - a.length);
}

/** Operator house-global top modules (nav order). */
export const OPERATOR_HOUSE_MODULES = [
  "Acquisition & ads",
  "Activation & forward-deploy",
  "Reference data",
  "Configuration libraries",
  "Oversight",
  "Audit trail",
  "Register & evolution",
  "Founder & agency controls",
] as const;

/** Support section (house-global support queue). */
export const OPERATOR_SUPPORT_MODULES = ["Customer support"] as const;

/** Operator per-tenancy top modules (nav order). */
export const OPERATOR_TENANCY_MODULES = [
  "Provision",
  "Commercial",
  "Firm operations bind",
  "Book readiness",
  "Firm health",
  "Activation state",
] as const;

/** Consultant desk modules for Step 0 mini nav. */
export const CONSULTANT_NAV_MODULES = ["Board", "Contacts", "Meetings"] as const;
