/**
 * Shared Hide / Show chrome for the three Register columns.
 */
import type { CSSProperties } from "react";
import type { Tokens } from "../../components/tokens";

export function shellChromeBtnStyle(t: Tokens, emphasis: "muted" | "accent" = "muted"): CSSProperties {
  return {
    padding: "4px 10px",
    border: `1px solid ${emphasis === "accent" ? t.accent : t.border}`,
    borderRadius: 4,
    background: emphasis === "accent" ? t.accentBg : t.bgSecondary,
    color: emphasis === "accent" ? t.accent : t.textMuted,
    fontSize: 12,
    fontWeight: emphasis === "accent" ? 600 : 500,
    fontFamily: "inherit",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  };
}

export function ShellHideButton({
  t,
  onClick,
  label = "Hide",
}: {
  t: Tokens;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" onClick={onClick} style={shellChromeBtnStyle(t)}>
      {label}
    </button>
  );
}

export function ShellShowButton({
  t,
  onClick,
  label,
}: {
  t: Tokens;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} style={shellChromeBtnStyle(t, "accent")}>
      {label}
    </button>
  );
}

/** Slim left dock when rail and/or theory are retracted — always reachable restore. */
export function RegisterRestoreDock({
  t,
  showRail,
  showTheory,
  onShowRail,
  onShowTheory,
}: {
  t: Tokens;
  showRail: boolean;
  showTheory: boolean;
  onShowRail: () => void;
  onShowTheory: () => void;
}) {
  if (!showRail && !showTheory) return null;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 36,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "8px 4px",
        borderRight: `1px solid ${t.border}`,
        background: t.bgSecondary,
      }}
      aria-label="Restore Register columns"
    >
      {showRail ? (
        <button
          type="button"
          title="Show Register"
          aria-label="Show Register"
          onClick={onShowRail}
          style={{
            flex: showTheory ? undefined : 1,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            padding: "10px 4px",
            border: `1px solid ${t.accent}`,
            borderRadius: 4,
            background: t.accentBg,
            color: t.accent,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Register
        </button>
      ) : null}
      {showTheory ? (
        <button
          type="button"
          title="Show Theory"
          aria-label="Show Theory"
          onClick={onShowTheory}
          style={{
            flex: 1,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            padding: "10px 4px",
            border: `1px solid ${t.accent}`,
            borderRadius: 4,
            background: t.accentBg,
            color: t.accent,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Theory
        </button>
      ) : null}
    </div>
  );
}
