/**
 * Meetings module — receive booked rows · Meeting pane · Live brief panel (leaves 1.3 / 2b.2).
 */
import { useEffect, useState } from "react";
import type { Tokens } from "../../components/tokens";
import { LeafSurface } from "./registerSurfaceChrome";
import { LiveBriefPanel, type LiveBriefMeeting } from "./LiveBriefPanel";

const DEMO_MEETINGS: LiveBriefMeeting[] = [
  {
    id: "m1",
    contactName: "Sarah Chen",
    time: "Thu 2:00 PM",
    status: "Upcoming",
    purpose: "Discovery · Express Entry / CEC",
    highlight: "Work permit · 47 days",
    overview:
      "Sarah is a software engineer on a Canadian work permit pursuing PR through Express Entry CEC. File is clean; CRS sits above the recent CEC draw line. Activation window is now.",
    pathway:
      "Qualifies under CEC on 12+ months skilled work (TEER 1), CLB 9, and valid TR status. Primary risk is timing — permit lapse before ITA would break CEC eligibility until status is renewed.",
    observation:
      "Meeting-grade brief for take-meeting. Close the loop on permit timing; she does not need chasing — she needs a consultant decision in session.",
    facts: [
      { label: "Work permit end", value: "Sep 15, 2026", signal: "Timing risk" },
      { label: "CRS estimate", value: "487", signal: "Above CEC line" },
      { label: "CLB lowest", value: "CLB 9", signal: "Language met" },
      { label: "EE pool", value: "In pool · Jan refresh", signal: "Current" },
    ],
  },
  {
    id: "m2",
    contactName: "James Okonkwo",
    time: "Fri 10:30 AM",
    status: "Upcoming",
    purpose: "Pathway review · FSW → CEC",
    highlight: "CRS 421 · below recent FSW",
    overview:
      "James is accumulating Canadian work experience toward the 12-month CEC mark. Current FSW CRS sits below recent draws; stream switch is the forward path.",
    pathway:
      "Language meets both streams. TEER-eligible occupation. Reassessment triggers at the work-history milestone — not a chase activation today.",
    observation:
      "Use the session to confirm documentation readiness for the stream switch and set expectations on timing. No illegal/unethical motion on this file.",
    facts: [
      { label: "Canadian work months", value: "9 of 12", signal: "CEC pending" },
      { label: "CRS (FSW)", value: "421", signal: "Below FSW draw" },
      { label: "Language", value: "CLB 8", signal: "Meets both streams" },
    ],
  },
  {
    id: "m3",
    contactName: "Priya Nair",
    time: "Next week · TBD",
    status: "Tentative",
    purpose: "Brief follow-up · PNP nomination",
    highlight: "Nomination under review",
    overview:
      "Priya's provincial nomination remains under review. Federal profile alone is not competitive; nomination is the critical path item.",
    pathway:
      "Monitor nomination decision. Language reassessment (CLB step-up) is the hedge if processing continues to slip.",
    observation:
      "Tentative booking — confirm attendance before deep prep. Live brief still loads so the desk can refuse or proceed with eyes open.",
    facts: [
      { label: "PNP status", value: "Under review", signal: "Critical path" },
      { label: "Federal CRS alone", value: "Not competitive", signal: "Needs nomination" },
    ],
  },
];

type MeetingsModuleProps = {
  t: Tokens;
  focusLabel?: string | null;
  focusSeq?: number;
};

export function MeetingsModule({ t, focusLabel = null, focusSeq = 0 }: MeetingsModuleProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(true);

  useEffect(() => {
    if (!focusLabel) return;
    if (
      focusLabel === "Meeting row" ||
      focusLabel === "Meeting" ||
      focusLabel === "Live brief" ||
      focusLabel === "Meetings"
    ) {
      if (focusLabel === "Live brief" || focusLabel === "Meeting row" || focusLabel === "Meeting") {
        setSelectedId((prev) => prev ?? DEMO_MEETINGS[0].id);
      }
      if (focusLabel === "Live brief") setBriefOpen(true);
    }
  }, [focusLabel, focusSeq]);

  const selected = DEMO_MEETINGS.find((m) => m.id === selectedId) ?? null;

  return (
    <div
      data-register-surface="Meetings"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        gap: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: selected ? 240 : "100%",
          maxWidth: selected ? 260 : undefined,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: t.bgPrimary,
          border: `1px solid ${t.border}`,
          borderRadius: 6,
          overflow: "hidden",
          transition: "width 0.15s ease",
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
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Meetings
          </span>
          <span style={{ fontSize: 11, color: t.textDim }}>{DEMO_MEETINGS.length} booked</span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "6px 0" }}>
          {DEMO_MEETINGS.map((row) => {
            const active = row.id === selectedId;
            return (
              <button
                key={row.id}
                type="button"
                data-register-surface="Meeting row"
                onClick={() => {
                  setSelectedId(row.id);
                  setBriefOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  minHeight: 52,
                  padding: "8px 14px",
                  border: "none",
                  borderLeft: active ? `3px solid ${t.accent}` : "3px solid transparent",
                  background: active ? t.accentBg : "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: row.status === "Tentative" ? t.textDim : t.accent,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.textPrimary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.contactName}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{row.time}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div
          data-register-surface="Meeting"
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
            <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
              Meeting · {selected.contactName}
            </span>
            <span style={{ fontSize: 11, color: t.textMuted }}>{selected.time}</span>
          </header>

          <div
            style={{
              flexShrink: 0,
              display: "flex",
              gap: 6,
              padding: "8px 12px",
              borderBottom: `1px solid ${t.borderLight}`,
              background: t.bgPrimary,
            }}
          >
            <LeafSurface
              label="Live brief"
              focused={focusLabel === "Live brief"}
              hovered={false}
              t={t}
            >
              <button
                type="button"
                onClick={() => setBriefOpen((o) => !o)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 4,
                  border: `1px solid ${briefOpen ? t.accent : t.border}`,
                  background: briefOpen ? t.accentBg : t.bgSecondary,
                  color: briefOpen ? t.accent : t.textPrimary,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Live brief
              </button>
            </LeafSurface>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
            {briefOpen ? (
              <LiveBriefPanel meeting={selected} t={t} embedded />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.textMuted,
                  fontSize: 12,
                  padding: 16,
                }}
              >
                Click Live brief to view current fact rows before joining.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
