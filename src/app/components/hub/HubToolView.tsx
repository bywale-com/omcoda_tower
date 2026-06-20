import type { Tokens } from "../tokens";

export function HubToolView({
  title,
  subtitle,
  t,
}: {
  title: string;
  subtitle: string;
  t: Tokens;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 32px",
        color: t.textPrimary,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 13,
          color: t.textMuted,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
