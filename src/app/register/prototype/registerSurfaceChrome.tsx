/**
 * Shared Register prototype surface chrome — focus ring + nav styles.
 */
import type { CSSProperties, ReactNode } from "react";
import type { Tokens } from "../../components/tokens";

export function navBtnStyle(t: Tokens, active: boolean): CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "7px 10px",
    border: "none",
    borderLeft: active ? `3px solid ${t.accent}` : "3px solid transparent",
    background: active ? t.accentBg : "transparent",
    color: active ? t.textPrimary : t.textMuted,
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    fontFamily: "inherit",
    cursor: "pointer",
    borderRadius: "0 4px 4px 0",
  };
}

export function sectionLabelStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: t.textDim,
    padding: "10px 12px 4px",
  };
}

/** Tight primary control — matches operator primaryBtnStyle footprint. */
export function primaryControlStyle(t: Tokens, disabled = false): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    color: disabled ? t.textDim : "#fff",
    background: disabled ? t.hoverBg : t.accent,
    border: "none",
    borderRadius: 4,
    padding: "7px 12px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    lineHeight: 1.2,
  };
}

/** Tight secondary control. */
export function secondaryControlStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    padding: "7px 12px",
    cursor: "pointer",
    lineHeight: 1.2,
  };
}

/** Leaf block mount — outline ring for Register trace focus. */
export function LeafSurface({
  label,
  focused,
  hovered,
  t,
  children,
  style,
}: {
  label: string;
  focused?: boolean;
  hovered?: boolean;
  t: Tokens;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      data-register-surface={label}
      style={{
        outline: focused ? `2px solid ${t.accent}` : hovered ? `1px solid ${t.accent}` : "none",
        outlineOffset: focused || hovered ? 2 : 0,
        borderRadius: 4,
        transition: "outline-color 0.15s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function RegisterSurfaceMount({
  label,
  focused,
  hovered,
  t,
  children,
  style,
}: {
  label: string;
  focused: boolean;
  hovered: boolean;
  t: Tokens;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      data-register-surface={label}
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        outline: focused ? `2px solid ${t.accent}` : hovered ? `1px solid ${t.accent}` : "none",
        outlineOffset: focused || hovered ? -2 : 0,
        borderRadius: 4,
        transition: "outline-color 0.15s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
