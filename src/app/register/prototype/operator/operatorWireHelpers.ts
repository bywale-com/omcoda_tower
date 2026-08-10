/**
 * Shared wire helpers for operator prototype cohesion (Plant + Ant).
 */
import type { AuditEvent } from "../../../wire/ports";
import type {
  EnrollmentRow,
  MotionDecisionRow,
  WorkflowRunRow,
  WorkflowRow,
} from "../../../wire/machineTypes";
import { wirePorts } from "../../../wire";
import { guessTargetForHeader } from "../../../components/imports/parseCsvPreview";
import Papa from "papaparse";

export type HealthSignal = "Healthy" | "Watch" | "At risk";

export type AuditTrailUiEvent = {
  id: string;
  at: string;
  firm: string;
  actor: string;
  action: string;
  kind: string;
  before: string;
  after: string;
  surface: string;
};

export const DEMO_AUDIT_TRAIL_EVENTS: AuditTrailUiEvent[] = [
  {
    id: "ev-1",
    at: "Today · 14:22",
    firm: "Northwind Immigration",
    actor: "ops.lena",
    action: "Bound Evaluation pack v2",
    kind: "Bind packs",
    before: "Evaluation pack v1 · armed",
    after: "Evaluation pack v2 · armed",
    surface: "Firm operations bind",
  },
  {
    id: "ev-2",
    at: "Today · 11:05",
    firm: "Cedar Pathways",
    actor: "ops.marco",
    action: "Forward-deploy staged Prepared Workspace",
    kind: "Activation",
    before: "Capture complete",
    after: "Prepared Workspace staged",
    surface: "Activation & forward-deploy",
  },
  {
    id: "ev-3",
    at: "Yesterday · 16:40",
    firm: "House-global",
    actor: "founder",
    action: "Agency policy · outbound quiet hours updated",
    kind: "Kill-switch",
    before: "Quiet hours off",
    after: "Quiet hours 09:00–20:00",
    surface: "Founder & agency controls",
  },
  {
    id: "ev-4",
    at: "Yesterday · 09:12",
    firm: "Northwind Immigration",
    actor: "ops.lena",
    action: "Open-box Publish version · Immigration constants",
    kind: "Publish version",
    before: "v2026.03.1",
    after: "v2026.03.2 published",
    surface: "Reference data",
  },
  {
    id: "ev-5",
    at: "Mon · 18:03",
    firm: "Atlas Mobility",
    actor: "support.kai",
    action: "Support context attached to ticket SUP-184",
    kind: "Support",
    before: "Ticket unscoped",
    after: "Firm scope · Atlas Mobility",
    surface: "Customer support",
  },
  {
    id: "ev-6",
    at: "Mon · 10:44",
    firm: "Harbor RCIC Desk",
    actor: "ops.lena",
    action: "Escrow terms · published terms-v1",
    kind: "Escrow terms",
    before: "Draft terms",
    after: "terms-v1 published",
    surface: "Commercial",
  },
  {
    id: "ev-7",
    at: "Sun · 15:20",
    firm: "Cedar Pathways",
    actor: "ops.marco",
    action: "Provision · Harbor RCIC Desk minted",
    kind: "Provision",
    before: "—",
    after: "Tenancy + consultant-owner seed",
    surface: "Provision",
  },
];

export type FleetHealthRow = {
  firmId: string;
  deliverability: HealthSignal;
  sequence: HealthSignal;
  engagement: HealthSignal;
  lastRun: string;
};

export type SequenceHealthRow = {
  id: string;
  name: string;
  health: HealthSignal;
  stuckReason: string;
  lastRunner: string;
  gates: string[];
};

export type EngagementHealthRow = {
  label: string;
  value: string;
  health: HealthSignal;
};

const DEMO_FLEET: FleetHealthRow[] = [
  {
    firmId: "firm-northwind",
    deliverability: "Healthy",
    sequence: "Healthy",
    engagement: "Watch",
    lastRun: "Today · 14:02",
  },
  {
    firmId: "firm-cedar",
    deliverability: "Healthy",
    sequence: "Watch",
    engagement: "Watch",
    lastRun: "Today · 13:48",
  },
  {
    firmId: "firm-harbor",
    deliverability: "Healthy",
    sequence: "Healthy",
    engagement: "Healthy",
    lastRun: "Today · 12:15",
  },
  {
    firmId: "firm-atlas",
    deliverability: "Watch",
    sequence: "At risk",
    engagement: "At risk",
    lastRun: "Today · 11:52",
  },
];

const DEMO_SEQUENCES: SequenceHealthRow[] = [
  {
    id: "seq-optin",
    name: "Opt-in Standard",
    health: "Healthy",
    stuckReason: "3 contacts on WhatsApp confirm step",
    lastRunner: "Runner tick · Today 14:01 · step advance",
    gates: ["Consent OK", "Send gate open", "Channel WhatsApp"],
  },
  {
    id: "seq-nudge",
    name: "Nudge · dormant 90d",
    health: "Watch",
    stuckReason: "11 contacts past silence clock on step 2",
    lastRunner: "Runner tick · Today 13:52 · silence hold",
    gates: ["Consent OK", "Send gate open", "Unsubscribe armed"],
  },
  {
    id: "seq-react",
    name: "Reactivation · CEC window",
    health: "At risk",
    stuckReason: "9 contacts — consent ledger incomplete after import",
    lastRunner: "Runner tick · Today 11:48 · send gate blocked",
    gates: ["Consent partial", "Send gate hold", "Channel Email"],
  },
];

const DEMO_ENGAGEMENT: EngagementHealthRow[] = [
  { label: "7d reply rate", value: "11%", health: "Watch" },
  { label: "Send-gate holds", value: "4", health: "At risk" },
  { label: "Active enrollments", value: "214", health: "Healthy" },
];

function firmNameById(firmId: string, firms: readonly { id: string; name: string }[]): string {
  return firms.find((f) => f.id === firmId)?.name ?? firmId;
}

function formatAuditAt(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return `Yesterday · ${time}`;
  }
  const weekday = d.toLocaleDateString([], { weekday: "short" });
  return `${weekday} · ${time}`;
}

function formatLastRun(at: string | null | undefined): string {
  if (!at) return "—";
  return formatAuditAt(at);
}

export function mapAuditEventToUi(
  ev: AuditEvent,
  firms: readonly { id: string; name: string }[],
): AuditTrailUiEvent {
  const payload = ev.payload ?? {};
  const firmName =
    (typeof payload.firmName === "string" && payload.firmName) ||
    firmNameById(ev.subjectId, firms);
  return {
    id: ev.id,
    at: formatAuditAt(ev.at),
    firm: firmName,
    actor: ev.actorId,
    action: (typeof payload.action === "string" && payload.action) || ev.kind,
    kind: (typeof payload.kindLabel === "string" && payload.kindLabel) || ev.kind,
    before: (typeof payload.before === "string" && payload.before) || "—",
    after: (typeof payload.after === "string" && payload.after) || "—",
    surface: (typeof payload.surface === "string" && payload.surface) || "—",
  };
}

export async function loadAuditTrailEvents(
  firms: readonly { id: string; name: string }[],
): Promise<AuditTrailUiEvent[]> {
  const events = await wirePorts.auditTrail.list();
  if (events.length === 0) return DEMO_AUDIT_TRAIL_EVENTS;
  return events
    .map((ev) => mapAuditEventToUi(ev, firms))
    .sort((a, b) => b.id.localeCompare(a.id));
}

export async function appendOperatorAudit(input: {
  actorId: string;
  kind: string;
  subjectType: string;
  subjectId: string;
  action: string;
  kindLabel: string;
  before?: string;
  after?: string;
  surface: string;
  firmName?: string;
}): Promise<void> {
  await wirePorts.auditTrail.append({
    actorId: input.actorId,
    kind: input.kind,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    payload: {
      action: input.action,
      kindLabel: input.kindLabel,
      before: input.before ?? "—",
      after: input.after ?? "—",
      surface: input.surface,
      firmName: input.firmName,
    },
  });
}

function deriveHealthFromScore(score: number): HealthSignal {
  if (score >= 2) return "Healthy";
  if (score >= 1) return "Watch";
  return "At risk";
}

function fleetRowFromMachine(
  firmId: string,
  workflows: WorkflowRow[],
  runs: WorkflowRunRow[],
  campaignState: string | null,
  enrollments: EnrollmentRow[],
  motions: MotionDecisionRow[],
): FleetHealthRow {
  const firmWorkflows = workflows.filter((w) => w.firm_id === firmId);
  const firmRuns = runs
    .filter((r) => r.firm_id === firmId)
    .sort((a, b) => b.started_at.localeCompare(a.started_at));
  const failedRuns = firmRuns.filter((r) => r.status === "failed").length;
  const activeWorkflows = firmWorkflows.filter((w) => w.status === "active").length;
  const enrollCount = enrollments.filter((e) => e.firm_id === firmId).length;
  const motionActive = motions.filter((m) => m.firm_id === firmId && m.motion !== "none").length;

  const deliverability =
    campaignState === "running"
      ? "Healthy"
      : campaignState === "armed-for-activation"
        ? "Watch"
        : deriveHealthFromScore(campaignState ? 1 : 0);

  const sequence =
    failedRuns > 0
      ? "At risk"
      : activeWorkflows > 0
        ? "Healthy"
        : firmRuns.length > 0
          ? "Watch"
          : "Watch";

  const engagement =
    motionActive > 5
      ? "Healthy"
      : enrollCount > 20
        ? "Healthy"
        : enrollCount > 0 || motionActive > 0
          ? "Watch"
          : "Watch";

  return {
    firmId,
    deliverability,
    sequence,
    engagement,
    lastRun: formatLastRun(firmRuns[0]?.finished_at ?? firmRuns[0]?.started_at),
  };
}

export async function loadFleetHealthRows(
  firms: readonly { id: string; name: string; health?: string }[],
): Promise<FleetHealthRow[]> {
  const [workflows, detections, campaign] = await Promise.all([
    wirePorts.machineApi.listWorkflows(),
    wirePorts.machineApi.boardDetections(),
    wirePorts.machineApi.getCampaignState(),
  ]);

  const runLists = await Promise.all(workflows.map((w) => wirePorts.machineApi.listRuns(w.id)));
  const allRuns = runLists.flat();

  const demoByFirm = new Map(DEMO_FLEET.map((r) => [r.firmId, r]));

  return firms.map((firm) => {
    const hasMachineData =
      workflows.some((w) => w.firm_id === firm.id) ||
      allRuns.some((r) => r.firm_id === firm.id) ||
      detections.enrollments.some((e) => e.firm_id === firm.id) ||
      campaign.firmId === firm.id;

    if (!hasMachineData) {
      return demoByFirm.get(firm.id) ?? {
        firmId: firm.id,
        deliverability: (firm.health as HealthSignal) ?? "Watch",
        sequence: (firm.health as HealthSignal) ?? "Watch",
        engagement: (firm.health as HealthSignal) ?? "Watch",
        lastRun: "—",
      };
    }

    const campaignState = campaign.firmId === firm.id ? campaign.state : null;
    return fleetRowFromMachine(
      firm.id,
      workflows,
      allRuns,
      campaignState,
      detections.enrollments,
      detections.motionDecisions,
    );
  });
}

export async function loadFirmHealthData(firmId: string): Promise<{
  sequences: SequenceHealthRow[];
  engagement: EngagementHealthRow[];
}> {
  const [templatesPack, detections, workflows] = await Promise.all([
    wirePorts.machineApi.listTemplates(),
    wirePorts.machineApi.boardDetections(),
    wirePorts.machineApi.listWorkflows(),
  ]);

  const firmBindings = templatesPack.bindings.filter((b) => b.firm_id === firmId);
  const firmWorkflows = workflows.filter((w) => w.firm_id === firmId);
  const runLists = await Promise.all(firmWorkflows.map((w) => wirePorts.machineApi.listRuns(w.id)));
  const firmRuns = runLists.flat().sort((a, b) => b.started_at.localeCompare(a.started_at));
  const enrollCount = detections.enrollments.filter((e) => e.firm_id === firmId).length;
  const motionHolds = detections.motionDecisions.filter(
    (m) => m.firm_id === firmId && m.motion === "none",
  ).length;
  const motionActive = detections.motionDecisions.filter(
    (m) => m.firm_id === firmId && m.motion !== "none",
  ).length;

  let sequences: SequenceHealthRow[] = DEMO_SEQUENCES;
  if (firmBindings.length > 0) {
    sequences = firmBindings.map((bind) => {
      const tpl = templatesPack.templates.find((t) => t.id === bind.template_id);
      const relatedRuns = firmRuns.filter((r) =>
        String(r.trigger_label ?? "").includes(bind.sequence_class),
      );
      const failed = relatedRuns.some((r) => r.status === "failed");
      const last = relatedRuns[0];
      return {
        id: bind.id,
        name: tpl?.label ?? bind.sequence_class,
        health: failed ? "At risk" : last ? "Healthy" : "Watch",
        stuckReason:
          motionHolds > 0
            ? `${motionHolds} contacts past silence / hold`
            : "Runner monitoring",
        lastRunner: last
          ? `Runner tick · ${formatLastRun(last.finished_at ?? last.started_at)} · ${last.status}`
          : "No recent runner tick",
        gates: [
          enrollCount > 0 ? "Consent OK" : "Consent partial",
          failed ? "Send gate hold" : "Send gate open",
          `Channel ${tpl?.sequence_class ?? "email"}`,
        ],
      };
    });
  }

  const engagement: EngagementHealthRow[] =
    enrollCount > 0 || motionActive > 0
      ? [
          {
            label: "7d reply rate",
            value: motionActive > 0 ? "11%" : "—",
            health: motionActive > 2 ? "Watch" : "Healthy",
          },
          {
            label: "Send-gate holds",
            value: String(motionHolds),
            health: motionHolds > 3 ? "At risk" : motionHolds > 0 ? "Watch" : "Healthy",
          },
          {
            label: "Active enrollments",
            value: String(enrollCount),
            health: enrollCount > 50 ? "Healthy" : enrollCount > 0 ? "Watch" : "At risk",
          },
        ]
      : DEMO_ENGAGEMENT;

  return { sequences, engagement };
}

export async function hydratePrimaryStoreRows<T extends { id: string }>(
  collection: string,
  initial: T[],
): Promise<T[]> {
  const stored = await wirePorts.primaryStore.list<T>(collection);
  if (stored.length === 0) return initial;
  const merged = new Map<string, T>();
  for (const row of initial) merged.set(row.id, row);
  for (const row of stored) merged.set(row.id, row);
  return [...merged.values()];
}

export async function persistPrimaryStoreRow<T extends { id: string }>(
  collection: string,
  row: T,
): Promise<void> {
  await wirePorts.primaryStore.put(collection, row);
}

export type ParsedUploadContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export function parseCsvFileToContacts(file: File): Promise<ParsedUploadContact[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0]?.message ?? "Failed to parse file."));
          return;
        }
        const stamp = Date.now();
        const contacts: ParsedUploadContact[] = [];
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          let name = "";
          let email = "";
          let phone = "";
          for (const [header, value] of Object.entries(row)) {
            const target = guessTargetForHeader(header);
            const trimmed = value?.trim() ?? "";
            if (target === "name" && !name) name = trimmed;
            if (target === "email" && !email) email = trimmed;
            if (target === "phone" && !phone) phone = trimmed;
          }
          if (!name && !email && !phone) continue;
          contacts.push({
            id: `contact-upload-${stamp}-${i}`,
            name,
            phone,
            email,
          });
        }
        resolve(contacts);
      },
      error: (err) => reject(err),
    });
  });
}

export async function loadClientMachineNote(clientId: string): Promise<string | null> {
  const data = await wirePorts.machineApi.boardDetections();
  const enrollment = data.enrollments.find((e) => e.contact_id === clientId);
  if (enrollment) {
    return `Machine · enrolled · ${enrollment.agent_ref}`;
  }
  const motion = data.motionDecisions.find((m) => m.contact_id === clientId);
  if (motion && motion.motion !== "none") {
    return `Machine · motion · ${motion.motion}`;
  }
  const elig = data.eligibilityResults.find((e) => e.contact_id === clientId);
  if (elig?.any_pathway_pass) {
    return "Machine · eligibility · pathway pass";
  }
  return null;
}
