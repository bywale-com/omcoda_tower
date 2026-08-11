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

export type ActivityRow = {
  id: string;
  at: string;
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
  thoughtSummary: string | null;
  messageId: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  payload: Record<string, unknown>;
  attemptStatus: string | null;
  attemptState: Record<string, unknown> | null;
  firedCriteria: Record<string, unknown> | null;
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
      return {
        id: r.id,
        at: r.created_at,
        kind: kindOf(r.event_kind),
        eventKind: r.event_kind,
        title: titleFor(r.event_kind, payload),
        channel: str(payload.channel) ?? str(payload.toChannel) ?? attempt?.owner_channel ?? null,
        attemptId,
        criteriaId: str(payload.criteriaId),
        criteriaLabel: str(payload.criteriaLabel) ?? str(payload.criteriaId),
        fromChannel: str(payload.fromChannel),
        toChannel: str(payload.toChannel),
        waitWindow: waitWindowFrom(payload),
        thoughtSummary: thoughtFrom(payload, attempt),
        messageId: str(payload.messageId) ?? str(payload.outboundMessageId),
        subject: str(payload.subject),
        bodyText: str(payload.bodyText) ?? str(payload.body),
        bodyHtml: str(payload.bodyHtml) ?? str(payload.html),
        payload,
        attemptStatus: attempt?.status ?? null,
        attemptState: attempt?.state ?? null,
        firedCriteria: (attempt?.fired_criteria as Record<string, unknown> | undefined) ?? null,
      };
    });
}

export function isHistoryFieldKey(fieldKey: string | null | undefined): boolean {
  if (!fieldKey) return false;
  return /crs|score|threshold|permit|draw/i.test(fieldKey);
}
