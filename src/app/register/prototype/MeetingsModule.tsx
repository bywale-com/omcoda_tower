/**
 * Meetings module — receive booked rows · Meeting pane · Live brief panel.
 * Furnish: List/Calendar toggle, empty-state, Phase on rows, Copy/Starts-in via Live brief.
 */
import { useEffect, useState } from "react";
import type { Tokens } from "../../components/tokens";
import { LeafSurface, secondaryControlStyle } from "./registerSurfaceChrome";
import { LiveBriefPanel, type LiveBriefMeeting } from "./LiveBriefPanel";
import {
  getMeetings,
  selectConsultantTodayMeetings,
  selectMeetingReadyClientIds,
  useMeetings,
} from "./shared/meetingsStore";

/** @deprecated Use selectConsultantTodayMeetings(useMeetings()) in components. */
export const CONSULTANT_TODAY_MEETINGS = selectConsultantTodayMeetings(getMeetings());

/** @deprecated Use selectMeetingReadyClientIds(useMeetings()) in components. */
export const MEETING_READY_CLIENT_IDS = selectMeetingReadyClientIds(getMeetings());

export {
  useMeetings,
  selectConsultantTodayMeetings,
  selectMeetingReadyClientIds,
} from "./shared/meetingsStore";

type MeetingsModuleProps = {
  t: Tokens;
  focusLabel?: string | null;
  focusSeq?: number;
  /** Demo empty Meetings surface when true. */
  forceEmpty?: boolean;
  initialSelectedId?: string | null;
  onBackToBoard?: () => void;
  firmName?: string;
};

export function MeetingsModule({
  t,
  focusLabel = null,
  focusSeq = 0,
  forceEmpty = false,
  initialSelectedId = null,
  onBackToBoard,
  firmName = "Cedar Pathways",
}: MeetingsModuleProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [briefOpen, setBriefOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [demoEmpty, setDemoEmpty] = useState(forceEmpty);
  const meetings = useMeetings();

  useEffect(() => {
    if (!focusLabel) return;
    if (
      focusLabel === "Meeting row" ||
      focusLabel === "Meeting" ||
      focusLabel === "Live brief" ||
      focusLabel === "Meetings"
    ) {
      if (focusLabel === "Live brief" || focusLabel === "Meeting row" || focusLabel === "Meeting") {
        setSelectedId((prev) => prev ?? meetings[0]?.id ?? null);
        setDemoEmpty(false);
      }
      if (focusLabel === "Live brief") setBriefOpen(true);
    }
  }, [focusLabel, focusSeq, meetings]);

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setBriefOpen(true);
      setDemoEmpty(false);
    }
  }, [initialSelectedId]);

  const rows = demoEmpty ? [] : meetings;
  const selected = rows.find((m) => m.id === selectedId) ?? null;

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
          width: selected ? 260 : "100%",
          maxWidth: selected ? 280 : undefined,
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
          <span style={{ fontSize: 11, color: t.textDim }} title="Firm identity">
            {firmName} · {rows.length} booked
          </span>
        </header>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 10px",
            borderBottom: `1px solid ${t.borderLight}`,
          }}
        >
          <div style={{ display: "inline-flex", border: `1px solid ${t.border}`, borderRadius: 4, overflow: "hidden" }}>
            {(["list", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "4px 10px",
                  border: "none",
                  background: viewMode === mode ? t.accentBg : t.bgSecondary,
                  color: viewMode === mode ? t.accent : t.textMuted,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {mode === "list" ? "List" : "Calendar"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setDemoEmpty((e) => !e);
              setSelectedId(null);
            }}
            style={{ ...secondaryControlStyle(t), padding: "4px 8px", fontSize: 10 }}
            title="Toggle empty-state demo"
          >
            {demoEmpty ? "Show booked" : "Empty state"}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: viewMode === "calendar" ? 10 : "6px 0" }}>
          {rows.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                No meetings booked yet
              </div>
              <p style={{ margin: 0, fontSize: 12, color: t.textMuted, lineHeight: 1.5, maxWidth: 260 }}>
                Nothing booked under bound packs. Board still shows book inhabit — receive waits on contact booking.
              </p>
              {onBackToBoard ? (
                <button type="button" onClick={onBackToBoard} style={secondaryControlStyle(t)}>
                  Back to Board
                </button>
              ) : null}
            </div>
          ) : viewMode === "calendar" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Thu", "Fri", "Next week"].map((day) => {
                const dayRows = rows.filter((r) => r.time.startsWith(day) || (day === "Next week" && r.time.includes("Next")));
                return (
                  <div key={day}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: t.textDim, marginBottom: 4, textTransform: "uppercase" }}>
                      {day}
                    </div>
                    {dayRows.length === 0 ? (
                      <div style={{ fontSize: 11, color: t.textDim, padding: "6px 8px" }}>—</div>
                    ) : (
                      dayRows.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          data-register-surface="Meeting row"
                          onClick={() => {
                            setSelectedId(row.id);
                            setBriefOpen(true);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 10px",
                            marginBottom: 4,
                            borderRadius: 4,
                            border: `1px solid ${selectedId === row.id ? t.accent : t.border}`,
                            background: selectedId === row.id ? t.accentBg : t.bgSecondary,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{row.contactName}</div>
                          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                            {row.time} · {row.phase}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            rows.map((row) => {
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
                    minHeight: 56,
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
                    <div style={{ fontSize: 10, fontWeight: 600, color: t.accent, marginTop: 2 }}>{row.phase}</div>
                  </div>
                </button>
              );
            })
          )}
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
            <span style={{ fontSize: 11, color: t.textMuted }}>
              {selected.time} · {selected.phase}
            </span>
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
