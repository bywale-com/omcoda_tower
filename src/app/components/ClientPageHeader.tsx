import { Calendar, CircleDot, Clock, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClientDetail } from "../data/clients";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { Tokens } from "./tokens";

type PillTone = "neutral" | "success" | "amber";

function PropertyPill({ children, tone, t }: { children: string; tone: PillTone; t: Tokens }) {
  const isDark = t.bgPrimary === "#000000";
  const styles: Record<PillTone, { bg: string; color: string; border: string }> = isDark
    ? {
        neutral: { bg: "#3a3a3a", color: "#e5e5e5", border: "#525252" },
        success: { bg: "#166534", color: "#bbf7d0", border: "#15803d" },
        amber: { bg: "#854d0e", color: "#fde68a", border: "#a16207" },
      }
    : {
        neutral: { bg: "#e5e5e5", color: "#171717", border: "#c7c7c7" },
        success: { bg: "#bbf7d0", color: "#14532d", border: "#4ade80" },
        amber: { bg: "#ddd6fe", color: "#5b21b6", border: "#a78bfa" },
      };
  const s = styles[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.35,
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

type PropertyRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  kind: "plain" | "pill";
  pillTone?: PillTone;
  valueColor?: string;
};

function statusPillTone(status: ClientDetail["status"]): PillTone {
  if (status === "eligible") return "success";
  if (status === "close") return "amber";
  return "neutral";
}

export function ClientPageHeader({
  client,
  t,
  paddingX = 28,
}: {
  client: ClientDetail;
  t: Tokens;
  paddingX?: number;
}) {
  const rows: PropertyRow[] = [
    { icon: Calendar, label: "Created time", value: client.addedDate, kind: "plain" },
    { icon: Route, label: "Pathway", value: client.pathway, kind: "pill", pillTone: "neutral" },
    {
      icon: CircleDot,
      label: "Status",
      value: client.statusLabel,
      kind: "pill",
      pillTone: statusPillTone(client.status),
    },
    {
      icon: Clock,
      label: "Expiry",
      value: client.workPermitExpiry,
      kind: "plain",
      valueColor: client.workPermitWarn ? t.amber : t.textPrimary,
    },
  ];

  return (
    <HolonBoundary
      id="client-header"
      label="Client Header"
      icon="user"
      order={SHELL_HOLON_ORDER["client-header"]}
      t={t}
      style={{ padding: `24px ${paddingX}px 10px`, flexShrink: 0, background: t.bgPrimary }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: t.textPrimary,
          margin: 0,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {client.name}
      </h1>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
        {rows.map(({ icon: Icon, label, value, kind, pillTone, valueColor }) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "18px 108px minmax(0, 1fr)",
              alignItems: "center",
              columnGap: 8,
              minHeight: 30,
              padding: "2px 0",
            }}
          >
            <Icon size={14} color={t.textDim} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.4 }}>{label}</span>
            <div style={{ minWidth: 0 }}>
              {kind === "pill" && pillTone ? (
                <PropertyPill tone={pillTone} t={t}>
                  {value}
                </PropertyPill>
              ) : (
                <span style={{ fontSize: 13, color: valueColor ?? t.textPrimary, lineHeight: 1.4 }}>
                  {value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </HolonBoundary>
  );
}
