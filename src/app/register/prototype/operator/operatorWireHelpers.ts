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

export type ForwardDeployStaging = "idle" | "enriching" | "hydrated" | "stale";

export type ForwardDeployActivationRow = {
  id: string;
  firmId: string;
  firm: string;
  owner: string;
  staging: ForwardDeployStaging;
  factsFresh: "fresh" | "stale" | "pending";
  brandPinned: "pinned" | "placeholder" | "missing";
  authorizeBook: "pending" | "complete";
  acceptTerms: "pending" | "complete";
  publicUrl: string;
  brandPackage: string;
  templateVersion: string;
};

export type InFlightAttemptRow = {
  contactId: string;
  ownerChannel: string;
  status: string;
  waitingOn: string;
  step: string;
};

export type EngagementRecordSummary = {
  total: number;
  kinds: { kind: string; count: number }[];
};

function preparedWorkspaceId(firmId: string): string {
  return `pw-${firmId}`;
}

export async function hydrateForwardDeployRows<T extends ForwardDeployActivationRow>(
  initial: T[],
): Promise<T[]> {
  const workspaces = await wirePorts.machineApi.listPreparedWorkspaces();
  if (workspaces.length === 0) return initial;

  const byId = new Map(workspaces.map((w) => [w.id, w]));
  const byFirmId = new Map(
    workspaces.map((w) => [(w.body?.firmId as string | undefined) ?? w.firm_id, w]),
  );

  return initial.map((row) => {
    const ws =
      byId.get(preparedWorkspaceId(row.firmId)) ?? byFirmId.get(row.firmId);
    if (!ws?.body || Object.keys(ws.body).length === 0) return row;

    const body = ws.body as Partial<T>;
    const stagingFromStatus: ForwardDeployStaging | undefined =
      ws.status === "hydrated"
        ? "hydrated"
        : ws.status === "staged"
          ? body.staging ?? "idle"
          : undefined;

    return {
      ...row,
      ...body,
      id: row.id,
      firmId: row.firmId,
      ...(stagingFromStatus && body.staging === undefined ? { staging: stagingFromStatus } : {}),
    };
  });
}

export async function persistForwardDeployRow<T extends ForwardDeployActivationRow>(
  row: T,
): Promise<void> {
  await wirePorts.machineApi.upsertPreparedWorkspace({
    id: preparedWorkspaceId(row.firmId),
    status: row.staging === "hydrated" ? "hydrated" : "staged",
    body: { ...row } as Record<string, unknown>,
  });
}

export async function loadForwardDeployStagingForFirm(
  firmId: string,
): Promise<ForwardDeployStaging | null> {
  const workspaces = await wirePorts.machineApi.listPreparedWorkspaces();
  const ws =
    workspaces.find((w) => w.id === preparedWorkspaceId(firmId)) ??
    workspaces.find(
      (w) => (w.body?.firmId as string | undefined) === firmId || w.firm_id === firmId,
    );
  if (!ws) return null;

  const staging = ws.body?.staging;
  if (staging === "idle" || staging === "enriching" || staging === "hydrated" || staging === "stale") {
    return staging;
  }
  return ws.status === "hydrated" ? "hydrated" : "idle";
}

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

  // Empty-or-personalized: no DEMO_FLEET Healthy theater when machine has nothing.
  return firms.map((firm) => {
    const hasMachineData =
      workflows.some((w) => w.firm_id === firm.id) ||
      allRuns.some((r) => r.firm_id === firm.id) ||
      detections.enrollments.some((e) => e.firm_id === firm.id) ||
      campaign.firmId === firm.id;

    if (!hasMachineData) {
      return {
        firmId: firm.id,
        deliverability: "Watch" as HealthSignal,
        sequence: "Watch" as HealthSignal,
        engagement: "Watch" as HealthSignal,
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
  inFlightAttempts: InFlightAttemptRow[];
  engagementRecords: EngagementRecordSummary;
}> {
  const [templatesPack, detections, workflows, activeAttempts, engagementRecordRows] =
    await Promise.all([
      wirePorts.machineApi.listTemplates(),
      wirePorts.machineApi.boardDetections(),
      wirePorts.machineApi.listWorkflows(),
      wirePorts.machineApi.listActiveAttempts(),
      wirePorts.machineApi.listEngagementRecords(),
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

  // Empty when no bindings — do not paint DEMO_SEQUENCES as live fleet health.
  const sequences: SequenceHealthRow[] =
    firmBindings.length > 0
      ? firmBindings.map((bind) => {
          const tpl = templatesPack.templates.find((t) => t.id === bind.template_id);
          const relatedRuns = firmRuns.filter((r) =>
            String(r.trigger_label ?? "").includes(bind.sequence_class),
          );
          const failed = relatedRuns.some((r) => r.status === "failed");
          const last = relatedRuns[0];
          return {
            id: bind.id,
            name: tpl?.label ?? bind.sequence_class,
            health: (failed ? "At risk" : last ? "Healthy" : "Watch") as HealthSignal,
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
        })
      : [];

  // Empty when no enrollments/motions — do not paint DEMO_ENGAGEMENT fake metrics.
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
      : [];

  const firmAttempts = activeAttempts.filter((a) => a.firm_id === firmId);
  const inFlightAttempts: InFlightAttemptRow[] = firmAttempts.map((a) => {
    const state = a.state ?? {};
    const waitingOn =
      typeof state.waitingOn === "string"
        ? state.waitingOn
        : state.waitingOn != null
          ? String(state.waitingOn)
          : "—";
    const step =
      typeof state.step === "number" || typeof state.step === "string"
        ? String(state.step)
        : "—";
    return {
      contactId: a.contact_id,
      ownerChannel: a.owner_channel ?? "—",
      status: a.status,
      waitingOn,
      step,
    };
  });

  const firmRecords = engagementRecordRows.filter((r) => r.firm_id === firmId);
  const kindCounts = new Map<string, number>();
  for (const record of firmRecords) {
    kindCounts.set(record.event_kind, (kindCounts.get(record.event_kind) ?? 0) + 1);
  }
  const engagementRecords: EngagementRecordSummary = {
    total: firmRecords.length,
    kinds: [...kindCounts.entries()]
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind)),
  };

  return { sequences, engagement, inFlightAttempts, engagementRecords };
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
