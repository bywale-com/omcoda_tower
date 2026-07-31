/**
 * Live brief — meeting-grade brief panel for Meetings take-meeting flow.
 * Thin pattern borrowed from ClientView narrative sections.
 */
import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";

export type LiveBriefMeeting = {
  id: string;
  contactName: string;
  time: string;
  status: "Upcoming" | "Tentative" | "In progress";
  purpose: string;
  overview: string;
  pathway: string;
  observation: string;
  highlight?: string;
};

type LiveBriefPanelProps = {
  meeting: LiveBriefMeeting;
  t: Tokens;
};

function BriefSection({ title, children, t }: { title: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, margin: "0 0 8px 0" }}>{title}</h2>
      {children}
    </div>
  );
}

function Para({ children, t }: { children: ReactNode; t: Tokens }) {
  return (
    <p
      style={{
        fontSize: 13,
        fontWeight: 400,
        color: t.textPrimary,
        lineHeight: 1.65,
        margin: "0 0 10px 0",
        maxWidth: 560,
      }}
    >
      {children}
    </p>
  );
}

function Hl({ children, t }: { children: ReactNode; t: Tokens }) {
  return (
    <span
      style={{
        fontSize: 12,
        background: t.accentBg,
        color: t.accent,
        padding: "1px 6px",
        borderRadius: 3,
      }}
    >
      {children}
    </span>
  );
}

export function LiveBriefPanel({ meeting, t }: LiveBriefPanelProps) {
  return (
    <div
      data-register-surface="Live brief"
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.01em" }}>
          Live brief
        </span>
        <span style={{ fontSize: 11, color: t.textMuted }}>{meeting.time}</span>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 18px 20px" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
            {meeting.contactName}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>{meeting.purpose}</div>
          {meeting.highlight ? (
            <div style={{ marginTop: 8 }}>
              <Hl t={t}>{meeting.highlight}</Hl>
            </div>
          ) : null}
        </div>

        <BriefSection title="Overview" t={t}>
          <Para t={t}>{meeting.overview}</Para>
        </BriefSection>

        <BriefSection title="Pathway" t={t}>
          <Para t={t}>{meeting.pathway}</Para>
        </BriefSection>

        <BriefSection title="Tower's observation" t={t}>
          <Para t={t}>{meeting.observation}</Para>
        </BriefSection>
      </div>
    </div>
  );
}
