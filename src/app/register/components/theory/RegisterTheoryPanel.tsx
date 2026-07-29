import type { CSSProperties, ReactNode } from "react";
import type { Tokens } from "../../components/tokens";

export function registerFieldLabelStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: t.textDim,
    margin: 0,
  };
}

export function RegisterTheoryPanel({
  title,
  right,
  children,
  t,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  t: Tokens;
}) {
  return (
    <div
      style={{
        background: t.bgSecondary,
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.boardPanel,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, lineHeight: 1.25 }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}
