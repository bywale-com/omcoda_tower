import type {
  ActiveAttemptRow,
  EngagementRecordRow,
} from "../../../../wire/machineTypes";

export type ActivityRowKind =
  | "send"
  | "window"
  | "cell"
  | "form_visit"
  | "inbound"
  | "nullify"
  | "meeting"
  | "other";

export type ActivitySignal = {
  key: "sent" | "delivered" | "opened" | "clicked" | "form" | "submitted";
  label: string;
  on: boolean;
};

export type ChronologyStatus = "historical" | "active" | "armed" | "waiting";

export type ActivityRow = {
  id: string;
  at: string;
  atMs: number;
  kind: ActivityRowKind;
  eventKind: string;
  title: string;
  channel: string | null;
  attemptId: string | null;
  criteriaId: string | null;
  criteriaLabel: string | null;
  fromChannel: string | null;
  toChannel: string | null;
  waitWindow: string | null;
  waitMs: number | null;
  thoughtSummary: string | null;
  outcomeSummary: string | null;
  messageId: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  payload: Record<string, unknown>;
  attemptStatus: string | null;
  attemptState: Record<string, unknown> | null;
  firedCriteria: Record<string, unknown> | null;
  signals: ActivitySignal[];
  chronologyStatus: ChronologyStatus;
};

export type AttemptBand = {
  id: string;
  startMs: number;
  endMs: number;
  status: string;
  channel: string | null;
  colorIndex: number;
};

export type ChannelBar = {
  id: string;
  channel: string;
  startMs: number;
  endMs: number;
};

export type WaitBar = {
  id: string;
  startMs: number;
  endMs: number;
  label: string;
  rowId: string;
};

function str(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v;
  if (typeof v === "number") return String(v);
  return null;
}

function kindOf(eventKind: string): ActivityRowKind {
  if (eventKind === "send_live" || eventKind === "send_dry_run") return "send";
  if (eventKind === "window_fired") return "window";
  if (eventKind === "cell_advanced") return "cell";
  if (eventKind === "form_visit") return "form_visit";
  if (
    eventKind === "inbound_reply" ||
    eventKind === "inbound_override" ||
    eventKind === "email_opened" ||
    eventKind === "link_clicked"
  ) {
    return "inbound";
  }
  if (eventKind === "attempt_nullified") return "nullify";
  if (eventKind === "meeting_booked") return "meeting";
  return "other";
}

function titleFor(eventKind: string, payload: Record<string, unknown>): string {
  const channel = str(payload.channel) ?? str(payload.toChannel);
  switch (eventKind) {
    case "send_live":
      return `Send · ${channel ?? "channel"} (live)`;
    case "send_dry_run":
      return `Send · ${channel ?? "channel"} (dry-run)`;
    case "window_fired":
      return `Window fired · ${str(payload.criteriaId) ?? "criteria"}`;
    case "cell_advanced":
      return `Cell advanced · ${str(payload.cellLabel) ?? str(payload.cellId) ?? "step"}`;
    case "form_visit":
      return "Form visit";
    case "inbound_reply":
      return "Inbound reply";
    case "inbound_override":
      return "Inbound override";
    case "attempt_nullified":
      return "Attempt nullified";
    case "meeting_booked":
      return "Meeting booked";
    default:
      return eventKind.replace(/_/g, " ");
  }
}

function waitMsFrom(payload: Record<string, unknown>): number | null {
  const threshold = Number(payload.threshold);
  if (!Number.isFinite(threshold)) return null;
  const unit = (str(payload.threshold_unit) ?? "hours").toLowerCase();
  if (unit.startsWith("min")) return threshold * 60_000;
  if (unit.startsWith("sec")) return threshold * 1000;
  if (unit.startsWith("day")) return threshold * 86_400_000;
  return threshold * 3_600_000;
}

function waitWindowFrom(payload: Record<string, unknown>): string | null {
  const threshold = payload.threshold;
  const unit = str(payload.threshold_unit);
  if (threshold == null) return null;
  return unit ? `${threshold} ${unit}` : String(threshold);
}

function thoughtFrom(
  payload: Record<string, unknown>,
  attempt: ActiveAttemptRow | undefined,
): string | null {
  const direct =
    str(payload.thought) ??
    str(payload.reason) ??
    str(payload.setValue) ??
    str(payload.cellLabel);
  if (direct) return direct;
  if (payload.fromChannel && payload.toChannel) {
    return `${str(payload.fromChannel)} → ${str(payload.toChannel)}`;
  }
  const fired = attempt?.fired_criteria;
  if (fired && typeof fired === "object") {
    const keys = Object.keys(fired as object);
    if (keys.length) return `Fired criteria: ${keys.join(", ")}`;
  }
  return null;
}

function outcomeFrom(payload: Record<string, unknown>, kind: ActivityRowKind): string | null {
  if (kind === "send") {
    if (payload.reason) return `Outcome · dry-run (${str(payload.reason)})`;
    if (payload.messageId) return "Outcome · accepted";
  }
  if (kind === "window" && payload.setValue) return `Outcome · ${str(payload.setValue)}`;
  if (kind === "nullify") return "Outcome · attempt closed";
  if (kind === "inbound") return "Outcome · inbound recorded";
  return null;
}

function signalsFrom(
  kind: ActivityRowKind,
  state: Record<string, unknown> | null | undefined,
): ActivitySignal[] {
  const s = state ?? {};
  const sent = kind === "send" || Boolean(s.delivered || s.delivered_at || s.opened || s.opened_at);
  return [
    { key: "sent", label: "Sent", on: sent },
    { key: "delivered", label: "Delivered", on: Boolean(s.delivered || s.delivered_at) },
    { key: "opened", label: "Opened", on: Boolean(s.opened || s.opened_at) },
    { key: "clicked", label: "Clicked", on: Boolean(s.link_clicked) },
    { key: "form", label: "Form", on: Boolean(s.form_started || s.form_started_at) || kind === "form_visit" },
    { key: "submitted", label: "Submitted", on: Boolean(s.form_submitted) },
  ];
}

function chronologyStatusFor(
  kind: ActivityRowKind,
  attempt: ActiveAttemptRow | undefined,
  waitMs: number | null,
): ChronologyStatus {
  if (attempt?.status === "open") {
    if (kind === "window" || waitMs != null) return "waiting";
    return "active";
  }
  if (kind === "window" && waitMs != null) return "waiting";
  if (kind === "send" && !attempt) return "armed";
  return "historical";
}

export function projectEngagementRows(
  records: EngagementRecordRow[],
  attempts: ActiveAttemptRow[],
): ActivityRow[] {
  const byAttempt = new Map(attempts.map((a) => [a.id, a]));
  return records
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((r) => {
      const payload = (r.payload ?? {}) as Record<string, unknown>;
      const attemptId = str(payload.attemptId);
      const attempt = attemptId ? byAttempt.get(attemptId) : undefined;
      const kind = kindOf(r.event_kind);
      const waitMs = waitMsFrom(payload);
      const atMs = Date.parse(r.created_at) || 0;
      return {
        id: r.id,
        at: r.created_at,
        atMs,
        kind,
        eventKind: r.event_kind,
        title: titleFor(r.event_kind, payload),
        channel: str(payload.channel) ?? str(payload.toChannel) ?? attempt?.owner_channel ?? null,
        attemptId,
        criteriaId: str(payload.criteriaId),
        criteriaLabel: str(payload.criteriaLabel) ?? str(payload.criteriaId),
        fromChannel: str(payload.fromChannel),
        toChannel: str(payload.toChannel),
        waitWindow: waitWindowFrom(payload),
        waitMs,
        thoughtSummary: thoughtFrom(payload, attempt),
        outcomeSummary: outcomeFrom(payload, kind),
        messageId: str(payload.messageId) ?? str(payload.outboundMessageId),
        subject: str(payload.subject),
        bodyText: str(payload.bodyText) ?? str(payload.body),
        bodyHtml: str(payload.bodyHtml) ?? str(payload.html),
        payload,
        attemptStatus: attempt?.status ?? null,
        attemptState: attempt?.state ?? null,
        firedCriteria: (attempt?.fired_criteria as Record<string, unknown> | undefined) ?? null,
        signals: signalsFrom(kind, attempt?.state),
        chronologyStatus: chronologyStatusFor(kind, attempt, waitMs),
      };
    });
}

export function buildAttemptBands(
  attempts: ActiveAttemptRow[],
  rows: ActivityRow[],
  nowMs = Date.now(),
): AttemptBand[] {
  return attempts.map((attempt, index) => {
    const related = rows.filter((r) => r.attemptId === attempt.id);
    const startCandidates = [
      Date.parse(attempt.window_started_at ?? ""),
      Date.parse(attempt.created_at),
      ...related.map((r) => r.atMs),
    ].filter((n) => Number.isFinite(n) && n > 0);
    const endCandidates = [
      Date.parse(attempt.updated_at),
      ...related.map((r) => r.atMs),
      attempt.status === "open" ? nowMs : 0,
    ].filter((n) => Number.isFinite(n) && n > 0);
    const startMs = startCandidates.length ? Math.min(...startCandidates) : nowMs;
    const endMs = Math.max(startMs + 60_000, ...(endCandidates.length ? endCandidates : [startMs + 60_000]));
    return {
      id: attempt.id,
      startMs,
      endMs,
      status: attempt.status,
      channel: attempt.owner_channel,
      colorIndex: index,
    };
  });
}

export function buildChannelBars(rows: ActivityRow[]): ChannelBar[] {
  const byChannel = new Map<string, ActivityRow[]>();
  for (const row of rows) {
    if (!row.channel || (row.kind !== "send" && row.kind !== "cell" && row.kind !== "form_visit")) continue;
    const list = byChannel.get(row.channel) ?? [];
    list.push(row);
    byChannel.set(row.channel, list);
  }
  const bars: ChannelBar[] = [];
  for (const [channel, list] of byChannel) {
    const sorted = list.slice().sort((a, b) => a.atMs - b.atMs);
    if (!sorted.length) continue;
    bars.push({
      id: `ch-${channel}`,
      channel,
      startMs: sorted[0].atMs,
      endMs: Math.max(sorted[0].atMs + 60_000, sorted[sorted.length - 1].atMs),
    });
  }
  return bars;
}

export function buildWaitBars(rows: ActivityRow[]): WaitBar[] {
  return rows
    .filter((r) => r.kind === "window" && r.waitMs != null && r.waitMs > 0)
    .map((r) => ({
      id: `wait-${r.id}`,
      startMs: Math.max(0, r.atMs - (r.waitMs ?? 0)),
      endMs: r.atMs,
      label: r.waitWindow ? `Wait · ${r.waitWindow}` : "Wait window",
      rowId: r.id,
    }));
}

export function isHistoryFieldKey(fieldKey: string | null | undefined): boolean {
  if (!fieldKey) return false;
  return /crs|score|threshold|permit|draw/i.test(fieldKey);
}
