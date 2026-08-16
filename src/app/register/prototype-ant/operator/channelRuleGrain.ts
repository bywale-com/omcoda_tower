/** Channel-rules grain: this channel in this campaign. Shared by all variations. */
export type ChannelId = "text" | "email" | "call";
export type VariationApplyMode = "every" | "only_this" | "every_except";

export type ChannelRuleToggle = {
  key: string;
  label: string;
  condition: string;
};

/** Medium conditions only. Within time is one field per channel, not a toggle. */
export const CHANNEL_RULE_TOGGLES: Record<ChannelId, ChannelRuleToggle[]> = {
  text: [
    { key: "not_opened", label: "not opened", condition: "not opened" },
    { key: "not_delivered", label: "not delivered", condition: "not delivered" },
  ],
  email: [
    { key: "not_opened", label: "not opened", condition: "not opened" },
    { key: "link_not_clicked", label: "link not clicked", condition: "link not clicked" },
  ],
  call: [
    { key: "not_answered", label: "not answered", condition: "not answered" },
    { key: "not_completed", label: "not completed", condition: "not completed" },
  ],
};

export const DEFAULT_WITHIN_SECONDS: Record<ChannelId, number> = {
  text: 1800,
  email: 86400,
  call: 1800,
};

export const WITHIN_UNIT_OPTIONS = [
  { value: "minutes", label: "minutes" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
];

export function partsToSeconds(value: number | null | undefined, unit: string | null | undefined): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 30;
  const u = (unit ?? "minutes").toLowerCase();
  if (u.startsWith("hour")) return n * 3600;
  if (u.startsWith("day")) return n * 86400;
  return n * 60;
}

export function secondsToParts(seconds: number | null | undefined): { value: number; unit: string } {
  const s = typeof seconds === "number" && Number.isFinite(seconds) ? seconds : 1800;
  if (s % 86400 === 0 && s >= 86400) return { value: s / 86400, unit: "days" };
  if (s % 3600 === 0 && s >= 3600) return { value: s / 3600, unit: "hours" };
  return { value: Math.max(1, Math.round(s / 60)), unit: "minutes" };
}

/** Seeded C6 ids. Email link uses acr-email-link. */
export function globalCriteriaId(token: ChannelId, key: string): string {
  if (token === "email" && key === "link_not_clicked") return "acr-email-link";
  return `acr-${token}-${key}`;
}

export function sequenceCriteriaId(sequenceId: string, token: ChannelId, key: string): string {
  return `acr-seq-${sequenceId}-${token}-${key}`;
}

export const LEFTOVER_CRITERIA_IDS = new Set(["acr-text", "acr-email", "acr-form", "acr-sms-nonreply"]);

export const CHANNEL_LABEL: Record<ChannelId, string> = {
  text: "Text",
  email: "Email",
  call: "Call",
};

export const ALL_CHANNELS: ChannelId[] = ["text", "email", "call"];

export type ChannelRulesDraft = {
  override: boolean;
  toggles: Record<string, boolean>;
  withinTime: number | null;
  withinUnit: string | null;
};

export function emptyChannelRules(token?: ChannelId): ChannelRulesDraft {
  const parts = secondsToParts(token ? DEFAULT_WITHIN_SECONDS[token] : 1800);
  return { override: false, toggles: {}, withinTime: parts.value, withinUnit: parts.unit };
}

export type ChannelVariationDraft = {
  id: string;
  ord: number;
  applyMode: VariationApplyMode;
  attemptN: number | null;
  content: Record<string, unknown>;
};

export function emptyContent(token: ChannelId): Record<string, unknown> {
  if (token === "text") return { to: "", body: "" };
  if (token === "email") return { subject: "", from: "", reply_to: "", body_html: "", body_text: "" };
  return { voice: "", script: "", listening_prompt: "", goal: "", notes: "" };
}

export function emptyVariation(token: ChannelId, ord: number, id?: string): ChannelVariationDraft {
  return {
    id: id ?? `var-${token}-${ord}-${Date.now()}`,
    ord,
    applyMode: "every",
    attemptN: null,
    content: emptyContent(token),
  };
}

export const DISTANCE_OPTIONS: Array<{ label: string; seconds: number }> = [
  { label: "1 hour", seconds: 3600 },
  { label: "1 day", seconds: 86400 },
  { label: "2 days", seconds: 172800 },
  { label: "7 days", seconds: 604800 },
];

export function distanceLabel(seconds: number | null | undefined): string {
  if (seconds == null) return "1 day";
  const hit = DISTANCE_OPTIONS.find((row) => row.seconds === seconds);
  return hit?.label ?? "1 day";
}

export function pickVariationContent(
  variations: ChannelVariationDraft[],
  attemptN: number,
): Record<string, unknown> {
  const sorted = variations.slice().sort((a, b) => a.ord - b.ord);
  const only = sorted.find((row) => row.applyMode === "only_this" && row.attemptN === attemptN);
  if (only) return only.content ?? {};
  const excepted = sorted.find(
    (row) => row.applyMode === "every_except" && row.attemptN != null && row.attemptN !== attemptN,
  );
  if (excepted) return excepted.content ?? {};
  const every = sorted.find((row) => row.applyMode === "every");
  return (every ?? sorted[0])?.content ?? {};
}

export function eventKindProse(eventKind: string): string {
  const kind = eventKind.toLowerCase();
  if (kind.includes("open")) return "Opened";
  if (kind.includes("click")) return "Clicked";
  if (kind.includes("deliver")) return "Delivered";
  if (kind.includes("send") || kind === "sent") return "Sent";
  if (kind.includes("nullif") || kind.includes("halt")) return "Stopped";
  if (kind.includes("window") || kind.includes("escalat")) return "Escalated";
  if (kind.includes("fail")) return "Failed";
  if (kind.includes("answer")) return "Answered";
  if (kind.includes("complete")) return "Completed";
  return eventKind.replace(/_/g, " ");
}

export function channelFromPayload(
  eventKind: string,
  payload: Record<string, unknown>,
): string {
  const raw = payload.channel ?? payload.ownerChannel ?? payload.fromChannel;
  if (typeof raw === "string" && raw.trim()) {
    const t = raw.toLowerCase();
    if (t === "sms" || t === "text") return "Text";
    if (t === "email") return "Email";
    if (t === "call") return "Call";
    return raw;
  }
  const kind = eventKind.toLowerCase();
  if (kind.includes("sms") || kind.includes("text")) return "Text";
  if (kind.includes("email") || kind.includes("mail")) return "Email";
  if (kind.includes("call")) return "Call";
  return "—";
}
