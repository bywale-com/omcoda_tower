/**
 * Halt outreach — contact-scope + book-scope refusal controls.
 * Never opens Configuration libraries / Hub editors.
 */
import { Hand } from "lucide-react";
import type { Tokens } from "./tokens";

export type HaltOutreachBarProps = {
  t: Tokens;
  bookHalted: boolean;
  haltedContactCount: number;
  onHaltBook: () => void;
  onResumeBook?: () => void;
};

export function HaltOutreachBar({
  t,
  bookHalted,
  haltedContactCount,
  onHaltBook,
  onResumeBook,
}: HaltOutreachBarProps) {
  return (
    <div
      data-register-surface="Halt outreach"
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderBottom: `1px solid ${t.border}`,
        background: bookHalted ? "rgba(220, 38, 38, 0.06)" : t.bgSecondary,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: bookHalted ? "rgba(220, 38, 38, 0.12)" : t.accentBg,
          color: bookHalted ? t.red : t.accent,
          flexShrink: 0,
        }}
      >
        <Hand size={12} strokeWidth={2.25} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          Halt outreach
        </div>
        <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.3, marginTop: 1 }}>
          {bookHalted
            ? "Book halted — no further automatic firm→client sends"
            : haltedContactCount > 0
              ? `${haltedContactCount} contact${haltedContactCount === 1 ? "" : "s"} halted · book still live`
              : "Refuse further automatic sends — contact or book"}
        </div>
      </div>
      <button
        type="button"
        onClick={() => (bookHalted ? onResumeBook?.() : onHaltBook())}
        style={{
          flexShrink: 0,
          height: 26,
          padding: "0 10px",
          borderRadius: 4,
          border: `1px solid ${bookHalted ? t.border : t.red}`,
          background: bookHalted ? t.bgPrimary : "rgba(220, 38, 38, 0.08)",
          color: bookHalted ? t.textPrimary : t.red,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {bookHalted ? "Resume book" : "Halt book"}
      </button>
    </div>
  );
}
