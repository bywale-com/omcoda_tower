/**
 * Meetings module shell — hi-fi list with Meeting row placeholders (Step 1).
 */
import type { Tokens } from "../../components/tokens";

const PLACEHOLDER_MEETINGS = [
  { id: "m1", title: "Sarah Chen · discovery", when: "Thu 2:00 PM", status: "Upcoming" },
  { id: "m2", title: "James Okonkwo · pathway review", when: "Fri 10:30 AM", status: "Upcoming" },
  { id: "m3", title: "Priya Nair · brief follow-up", when: "Next week", status: "Tentative" },
] as const;

type MeetingsModuleProps = {
  t: Tokens;
};

export function MeetingsModule({ t }: MeetingsModuleProps) {
  return (
    <div
      data-register-surface="Meetings"
      style={{
        flex: 1,
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
          Meetings
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.accent,
            background: t.accentBg,
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          constructing
        </span>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 0" }}>
        {PLACEHOLDER_MEETINGS.map((row) => (
          <div
            key={row.id}
            data-register-surface="Meeting row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 40,
              padding: "0 14px",
              borderLeft: `3px solid transparent`,
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
                  fontWeight: 500,
                  color: t.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.title}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted }}>{row.when}</div>
            </div>
            <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
