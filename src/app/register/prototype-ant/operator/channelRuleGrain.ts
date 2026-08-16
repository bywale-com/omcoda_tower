/** Channel-rules grain: this channel in this campaign. Shared by all variations. */
export type ChannelId = "text" | "email" | "call";
export type VariationApplyMode = "every" | "only_this" | "every_except";

export type ChannelRuleToggle = {
  key: string;
  label: string;
  condition: string;
};

export const CHANNEL_RULE_TOGGLES: Record<ChannelId, ChannelRuleToggle[]> = {
  text: [
    { key: "not_opened", label: "not opened", condition: "not opened" },
    { key: "not_delivered", label: "not delivered", condition: "not delivered" },
    { key: "within_time", label: "within time", condition: "within time" },
  ],
  email: [
    { key: "not_opened", label: "not opened", condition: "not opened" },
    { key: "link_not_clicked", label: "link not clicked", condition: "link not clicked" },
    { key: "within_time", label: "within time", condition: "within time" },
  ],
  call: [
    { key: "not_answered", label: "not answered", condition: "not answered" },
    { key: "not_completed", label: "not completed", condition: "not completed" },
    { key: "within_time", label: "within time", condition: "within time" },
  ],
};

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

export function emptyChannelRules(): ChannelRulesDraft {
  return { override: false, toggles: {}, withinTime: 30, withinUnit: "minutes" };
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
