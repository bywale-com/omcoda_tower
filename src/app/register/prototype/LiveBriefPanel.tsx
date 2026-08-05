/**
 * Live brief — meeting-grade brief panel with fact rows + evaluative signal chips.
 * Furnish: Copy brief, Starts-in cue, chip tooltips, as-of freshness.
 */
import { useState, type ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { secondaryControlStyle } from "./registerSurfaceChrome";

export type LiveBriefFact = {
  label: string;
  value: string;
  signal: string;
  signalHint?: string;
};

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
  facts?: LiveBriefFact[];
  startsIn?: string;
  asOf?: string;
};

type LiveBriefPanelProps = {
  meeting: LiveBriefMeeting;
  t: Tokens;
  /** When nested inside Meeting pane — no outer chrome border. */
  embedded?: boolean;
};

function BriefSection({ title, children, t }: { title: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, margin: "0 0 8px 0" }}>
        {title}
      </h2>
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

function SignalChip({
  children,
  t,
  title,
}: {
  children: ReactNode;
  t: Tokens;
  title?: string;
}) {
  return (
    <span
      tabIndex={0}
      title={title}
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: t.accentBg,
        color: t.accent,
        padding: "2px 6px",
        borderRadius: 3,
        whiteSpace: "nowrap",
        cursor: title ? "help" : "default",
      }}
    >
      {children}
    </span>
  );
}

export function LiveBriefPanel({ meeting, t, embedded = false }: LiveBriefPanelProps) {
  const facts = meeting.facts ?? [];
  const [copied, setCopied] = useState(false);

  function copyBrief() {
    const lines = [
      `${meeting.contactName} · ${meeting.purpose}`,
      meeting.startsIn ? `Starts: ${meeting.startsIn}` : `Time: ${meeting.time}`,
      meeting.asOf ?? "",
      "",
      ...facts.map((f) => `${f.label}: ${f.value} (${f.signal})`),
      "",
      meeting.overview,
    ].filter(Boolean);
    void navigator.clipboard?.writeText(lines.join("\n")).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

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
        border: embedded ? "none" : `1px solid ${t.border}`,
        borderRadius: embedded ? 0 : 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: embedded ? 40 : 35,
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
        <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Live brief
          </span>
          {meeting.startsIn ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.accent,
                background: t.accentBg,
                padding: "2px 6px",
                borderRadius: 3,
              }}
              title="Starts-in cue"
            >
              Starts {meeting.startsIn}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: t.textMuted }}>{meeting.time}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {meeting.asOf ? (
            <span style={{ fontSize: 10, color: t.textDim }} title="Freshness / last-updated">
              {meeting.asOf}
            </span>
          ) : null}
          <button
            type="button"
            onClick={copyBrief}
            style={{ ...secondaryControlStyle(t), padding: "4px 8px", fontSize: 11 }}
            title="Copy brief facts"
          >
            {copied ? "Copied" : "Copy brief"}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px 18px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
            {meeting.contactName}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>{meeting.purpose}</div>
          {meeting.highlight ? (
            <div style={{ marginTop: 8 }}>
              <SignalChip t={t} title="Evaluative highlight from write-back">
                {meeting.highlight}
              </SignalChip>
            </div>
          ) : null}
        </div>

        {facts.length > 0 ? (
          <BriefSection title="Current facts" t={t}>
            <div
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {facts.map((fact, i) => (
                <div
                  key={fact.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "8px 12px",
                    borderTop: i === 0 ? "none" : `1px solid ${t.borderLight}`,
                    background: t.bgSecondary,
                    fontSize: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: t.textPrimary }}>{fact.label}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{fact.value}</div>
                  </div>
                  <SignalChip t={t} title={fact.signalHint ?? fact.signal}>
                    {fact.signal}
                  </SignalChip>
                </div>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 10, color: t.textDim, lineHeight: 1.45 }}>
              Write-back from contact Loop-closer / Nudge / Update facts — view only on consultant desk.
              Hover signal chips for plain-language meaning.
            </p>
          </BriefSection>
        ) : null}

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
