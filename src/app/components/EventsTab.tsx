import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Mail, MessageSquare, Phone, CheckSquare, Globe, Users, Zap,
  CheckCircle, XCircle, ArrowRight,
} from "lucide-react";
import type { Tokens } from "./tokens";

type CampaignType = "opt-in" | "nudge" | "reactivation";
type Channel = "email" | "sms" | "call" | "visit" | "meeting" | "task" | "system";
type Pill = { label: string; color: "green" | "amber" | "grey" | "teal" | "red" };
type StepOutcome = "delivered" | "no-response" | "queued" | "opened" | "booked" | "completed" | "visited" | "pending" | "confirmed";

type CampaignEntry =
  | { kind: "thought"; time: string; depth: "light" | "full"; decision?: string; lines: string[] }
  | {
      kind: "step";
      phase?: string;
      time: string;
      channel: Channel;
      label: string;
      outcome: StepOutcome;
      detail?: string;
      card?: { subject?: string; body?: string; pills?: Pill[]; meta?: string };
    };

type Campaign = {
  id: string;
  type: CampaignType;
  title: string;
  trigger: string;
  dateRange: string;
  status: "active" | "complete" | "failed";
  success?: boolean;
  channels?: Channel[];
  footer: string;
  entries: CampaignEntry[];
};

type Milestone = {
  id: string;
  date: string;
  time: string;
  label: string;
  pill?: Pill;
  meta?: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "reactivation-r001",
    type: "reactivation",
    title: "Reactivation Launch",
    trigger: "CEC Eligibility Detected",
    dateRange: "Jun 13 – 15, 2026",
    status: "complete",
    success: true,
    channels: ["sms", "email", "visit", "meeting"],
    footer: "Activation complete — pathway review session confirmed",
    entries: [
      {
        kind: "thought",
        time: "10:58",
        depth: "full",
        decision: "Green light",
        lines: [
          "48h window elapsed. SMS was delivered, no inbound reply. CEC eligibility re-confirmed.",
          "Permit now at 45 days. Window is narrowing. Escalating to Reactivation Launch — consultant awareness flagged but no action required yet.",
        ],
      },
      {
        kind: "step",
        phase: "Day 0",
        time: "11:00",
        channel: "sms",
        label: "SMS primer",
        outcome: "delivered",
        detail: "+1 604 555 0192",
        card: {
          body: "Sarah — Tower has confirmed your eligibility. Your consultant is ready. Tap to view.",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        phase: "Day 0",
        time: "11:02",
        channel: "email",
        label: "Eligibility email",
        outcome: "delivered",
        detail: "sarah.jenkins@gmail.com · no-login view link",
        card: {
          subject: "Your pathway is ready — view without logging in",
          body: "Hi Sarah — click below to see your eligibility summary. No login required.",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        phase: "Day 0",
        time: "11:45",
        channel: "visit",
        label: "No-login view opened",
        outcome: "opened",
        detail: "3m 12s on page · no-login pathway view",
        card: { pills: [{ label: "View opened", color: "teal" }] },
      },
      {
        kind: "step",
        phase: "Days 1–3",
        time: "09:00",
        channel: "email",
        label: "Nurture email 1",
        outcome: "delivered",
        detail: "sarah.jenkins@gmail.com",
        card: {
          subject: "Three things to do before your permit expires",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        phase: "Days 1–3",
        time: "09:00",
        channel: "email",
        label: "Nurture email 2",
        outcome: "delivered",
        detail: "sarah.jenkins@gmail.com",
        card: {
          subject: "Sarah — your CRS score is above threshold",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        phase: "Day 3",
        time: "16:32",
        channel: "meeting",
        label: "Slot opened — meeting booked",
        outcome: "booked",
        detail: "30 min pathway review · Jun 15, 2026",
        card: { pills: [{ label: "Booked", color: "green" }] },
      },
      {
        kind: "step",
        phase: "Day 3",
        time: "16:32",
        channel: "task",
        label: "Activation complete",
        outcome: "completed",
        card: {
          pills: [
            { label: "Completed", color: "green" },
            { label: "Activation", color: "teal" },
          ],
        },
      },
    ],
  },
  {
    id: "N-001",
    type: "nudge",
    title: "Nudge Sequence · N-001",
    trigger: "Work Permit Expiry < 60 days",
    dateRange: "Jun 11, 2026",
    status: "complete",
    success: true,
    channels: ["email", "sms"],
    footer: "Escalated to Reactivation Launch after 48h window",
    entries: [
      {
        kind: "thought",
        time: "09:00",
        depth: "full",
        decision: "Sequence trigger",
        lines: [
          "Work permit expiry now < 60 days. CRS 447 confirmed above current draw threshold of 443.",
          "Client is in the activation window. No consultant input needed — initiating Nudge Sequence N-001.",
        ],
      },
      {
        kind: "step",
        time: "09:14",
        channel: "email",
        label: "Email sent",
        outcome: "delivered",
        detail: "Subject: Your Express Entry update · sarah.jenkins@gmail.com",
        card: {
          subject: "Your Express Entry update",
          body: "Hi Sarah — your work permit expires in under 60 days. Here's what you need to do now.",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        time: "09:44",
        channel: "system",
        label: "No response (30m window)",
        outcome: "no-response",
        detail: "Escalation rule R-02 triggered",
        card: {
          pills: [{ label: "No response", color: "amber" }],
          meta: "30-minute window elapsed.",
        },
      },
      {
        kind: "thought",
        time: "09:44",
        depth: "light",
        lines: ["No response in 30m window. Rule R-02 applies. Scheduling SMS fallback — no consultant input needed."],
      },
      {
        kind: "step",
        time: "10:02",
        channel: "sms",
        label: "SMS fallback",
        outcome: "delivered",
        detail: "+1 604 555 0192 · via Twilio",
        card: {
          body: "Hi Sarah, just following up on our email. Your permit window is short — let us know when you're free.",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        time: "10:02",
        channel: "system",
        label: "Reassessment queued",
        outcome: "pending",
        detail: "Reassessment scheduled Jun 13",
        card: {
          pills: [{ label: "Pending", color: "grey" }],
          meta: "48h monitoring window open.",
        },
      },
    ],
  },
  {
    id: "opt-in-launch",
    type: "opt-in",
    title: "Opt-in Launch Sequence",
    trigger: "Firm authority transfer · onboarding cohort",
    dateRange: "Mar 15 – 16, 2024",
    status: "complete",
    success: true,
    channels: ["sms", "email", "visit"],
    footer: "Client opted in · consent logged",
    entries: [
      {
        kind: "thought",
        time: "08:01",
        depth: "light",
        lines: ["New client. Profile matches Express Entry CEC criteria. No intervention required — launching Opt-in Sequence."],
      },
      {
        kind: "step",
        phase: "Day 1",
        time: "10:00",
        channel: "sms",
        label: "SMS primer",
        outcome: "delivered",
        detail: "+1 604 555 0192",
        card: {
          body: "Hi Sarah — you've been selected for early access to Tower. We'll be in touch shortly.",
          pills: [{ label: "Delivered", color: "green" }],
        },
      },
      {
        kind: "step",
        phase: "Day 1",
        time: "10:02",
        channel: "email",
        label: "Announcement email",
        outcome: "opened",
        card: {
          subject: "You've been selected for early access",
          body: "Sarah, we're reaching out because your profile matches our express entry criteria...",
          pills: [
            { label: "Opened", color: "teal" },
            { label: "2 clicks", color: "teal" },
          ],
        },
      },
      {
        kind: "step",
        phase: "Day 3",
        time: "14:22",
        channel: "visit",
        label: "Waitlist page visited",
        outcome: "visited",
        detail: "1m 48s on page · tower.app/join",
        card: { pills: [{ label: "Visited", color: "grey" }] },
      },
      {
        kind: "step",
        phase: "Day 3",
        time: "14:25",
        channel: "task",
        label: "Sign-up completed",
        outcome: "confirmed",
        detail: "Client submitted opt-in form. Consent logged.",
        card: { pills: [{ label: "Confirmed", color: "green" }] },
      },
    ],
  },
];

const MILESTONES: Milestone[] = [
  {
    id: "m0",
    date: "Mar 14, 2024",
    time: "08:00",
    label: "Client record created from Batch Audit · Audit 003",
    pill: { label: "Entry point", color: "grey" },
    meta: "Express Entry · CEC pathway assigned automatically.",
  },
];

const channelIcon: Record<Channel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
  visit: Globe,
  meeting: Users,
  task: CheckSquare,
  system: Zap,
};

const typeLabel: Record<CampaignType, string> = {
  "opt-in": "Opt-in",
  nudge: "Nudge",
  reactivation: "Reactivation",
};

function pillStyle(pill: Pill, t: Tokens) {
  const map: Record<Pill["color"], { bg: string; color: string; border: string }> = {
    green: { bg: `${t.green}1a`, color: t.green, border: `${t.green}40` },
    teal:  { bg: t.accentBg, color: t.accent, border: `${t.accent}44` },
    amber: { bg: t.amberBg, color: t.amber, border: `${t.amber}40` },
    grey:  { bg: t.tagNeutralBg, color: t.textMuted, border: t.border },
    red:   { bg: `${t.red}14`, color: t.red, border: `${t.red}33` },
  };
  return map[pill.color];
}

function PillBadge({ pill, t }: { pill: Pill; t: Tokens }) {
  const s = pillStyle(pill, t);
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: "2px 8px",
      borderRadius: 999,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      display: "inline-block",
    }}>
      {pill.label}
    </span>
  );
}

function outcomeColor(t: Tokens, outcome: StepOutcome) {
  const map: Record<StepOutcome, string> = {
    delivered: t.green,
    "no-response": t.amber,
    queued: t.amber,
    opened: t.accent,
    booked: t.green,
    completed: t.green,
    visited: t.textMuted,
    pending: t.textDim,
    confirmed: t.green,
  };
  return map[outcome];
}

function ThoughtBlock({ entry, t }: { entry: Extract<CampaignEntry, { kind: "thought" }>; t: Tokens }) {
  return (
    <div style={{
      margin: "10px 0",
      borderLeft: `2px solid ${t.accent}33`,
      background: t.accentBg,
      borderRadius: "0 6px 6px 0",
      padding: "7px 12px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: entry.depth === "full" ? 5 : 3,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: t.accent }}>
          Tower · {entry.time}
        </span>
        {entry.decision && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: 3,
            background: t.accent,
            color: t.cardBg,
          }}>
            {entry.decision}
          </span>
        )}
      </div>
      {entry.lines.map((line, i) => (
        <p key={i} style={{
          fontSize: 11,
          color: t.textMuted,
          margin: 0,
          fontStyle: "italic",
          lineHeight: 1.55,
          marginBottom: i < entry.lines.length - 1 ? 4 : 0,
        }}>
          {line}
        </p>
      ))}
    </div>
  );
}

function StepDetail({ card, t }: { card: NonNullable<Extract<CampaignEntry, { kind: "step" }>["card"]>; t: Tokens }) {
  const [expanded, setExpanded] = useState(false);
  const body = card.body ?? "";
  const truncated = body.length > 90;

  return (
    <div style={{
      marginTop: 6,
      border: `1px solid ${t.borderLight}`,
      borderRadius: 6,
      background: t.bgPrimary,
      padding: "8px 10px",
    }}>
      {card.subject && (
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
          {card.subject}
        </div>
      )}
      {body && (
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.55, marginBottom: card.pills ? 6 : 0 }}>
          {expanded || !truncated ? body : `${body.slice(0, 90)}…`}
          {truncated && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, padding: "0 0 0 4px" }}
            >
              {expanded ? "View less" : "View more"}
            </button>
          )}
        </div>
      )}
      {card.pills && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {card.pills.map((p, i) => <PillBadge key={i} pill={p} t={t} />)}
        </div>
      )}
      {card.meta && (
        <div style={{ fontSize: 11, color: t.textDim, marginTop: card.pills ? 6 : 0 }}>{card.meta}</div>
      )}
    </div>
  );
}

function StepRow({ entry, isLast, t }: { entry: Extract<CampaignEntry, { kind: "step" }>; isLast: boolean; t: Tokens }) {
  const Icon = channelIcon[entry.channel];
  const phaseLabel = entry.phase ? `${entry.phase} · ` : "";

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0 }}>
        <div style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: outcomeColor(t, entry.outcome),
          flexShrink: 0,
          marginTop: 5,
        }} />
        {!isLast && <div style={{ width: 1, flex: 1, background: t.borderLight, minHeight: 12 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: t.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}>
            <Icon size={11} color={t.accent} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>
                {phaseLabel}{entry.label}
              </span>
              <span style={{ fontSize: 10, color: t.textDim }}>{entry.time}</span>
            </div>
            {entry.detail && (
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{entry.detail}</div>
            )}
            {entry.card && <StepDetail card={entry.card} t={t} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign, t }: { campaign: Campaign; t: Tokens }) {
  const steps = campaign.entries.filter((e): e is Extract<CampaignEntry, { kind: "step" }> => e.kind === "step");
  let stepIdx = 0;

  return (
    <div style={{
      border: `1px solid ${t.border}`,
      borderRadius: 10,
      overflow: "hidden",
      background: t.bgPrimary,
    }}>
      <div style={{
        padding: "12px 14px",
        borderBottom: `1px solid ${t.borderLight}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 999,
              background: t.accentBg,
              color: t.accent,
              border: `1px solid ${t.accent}33`,
            }}>
              {typeLabel[campaign.type]}
            </span>
            <span style={{ fontSize: 10, color: t.textDim }}>{campaign.id}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
            {campaign.title}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>
            Trigger: {campaign.trigger}
          </div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 3 }}>
            {campaign.dateRange}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {campaign.channels?.map((ch) => {
            const ChIcon = channelIcon[ch];
            return <ChIcon key={ch} size={13} color={t.textMuted} strokeWidth={1.5} />;
          })}
          {campaign.success !== undefined && (
            campaign.success
              ? <CheckCircle size={14} color={t.green} strokeWidth={1.5} />
              : <XCircle size={14} color={t.textMuted} strokeWidth={1.5} />
          )}
        </div>
      </div>

      <div style={{ padding: "10px 14px 12px" }}>
        {campaign.entries.map((entry, i) => {
          if (entry.kind === "thought") {
            return <ThoughtBlock key={`thought-${i}`} entry={entry} t={t} />;
          }
          const isLastStep = stepIdx === steps.length - 1;
          stepIdx += 1;
          return <StepRow key={`step-${i}`} entry={entry} isLast={isLastStep} t={t} />;
        })}
      </div>

      <div style={{
        borderTop: `1px solid ${t.borderLight}`,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: t.bgPrimary,
      }}>
        <ArrowRight size={11} color={t.textDim} strokeWidth={2} />
        <span style={{ fontSize: 11, color: t.textMuted }}>{campaign.footer}</span>
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, t }: { milestone: Milestone; t: Tokens }) {
  return (
    <div style={{
      border: `1px solid ${t.borderLight}`,
      borderRadius: 8,
      padding: "10px 14px",
      background: t.bgPrimary,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: t.textDim }}>{milestone.date} · {milestone.time}</span>
        {milestone.pill && <PillBadge pill={milestone.pill} t={t} />}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>{milestone.label}</div>
      {milestone.meta && (
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{milestone.meta}</div>
      )}
    </div>
  );
}

export function EventsTab({ t }: { t: Tokens }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px 32px" }}>
      <div style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: t.textDim,
        fontWeight: 600,
        marginBottom: 12,
      }}>
        Campaigns · {CAMPAIGNS.length} total
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {CAMPAIGNS.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} t={t} />
        ))}
      </div>

      {MILESTONES.length > 0 && (
        <>
          <div style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: t.textDim,
            fontWeight: 600,
            marginBottom: 10,
          }}>
            Milestones
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MILESTONES.map((m) => (
              <MilestoneRow key={m.id} milestone={m} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
