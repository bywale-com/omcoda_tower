/**
 * Hi-fi empty module — Tower panel chrome for unbuilt / constructing surfaces.
 */
import type { Tokens } from "../../components/tokens";
import type { SurfaceBuildStatus } from "../trace/surfaceCatalog";

type HiFiEmptyModuleProps = {
  title: string;
  t: Tokens;
  status?: SurfaceBuildStatus;
  /** Optional detail under the Constructing line. */
  hint?: string;
};

function statusBadge(status: SurfaceBuildStatus | undefined, t: Tokens) {
  if (!status || status === "exists") return null;
  const label = status === "wrong-seat" ? "wrong-seat" : "new";
  const color = status === "wrong-seat" ? t.amber : t.accent;
  const bg = status === "wrong-seat" ? t.amberBg : t.accentBg;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        background: bg,
        padding: "2px 6px",
        borderRadius: 3,
      }}
    >
      {label}
    </span>
  );
}

export function HiFiEmptyModule({ title, t, status, hint }: HiFiEmptyModuleProps) {
  return (
    <div
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
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {title}
        </span>
        {statusBadge(status, t)}
      </header>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgSecondary,
            marginBottom: 14,
            boxShadow: `inset 0 0 0 1px ${t.borderLight}`,
          }}
        />
        <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted, maxWidth: 320 }}>
          Constructing — addressable from click-path
        </p>
        {hint ? (
          <p style={{ margin: "8px 0 0", fontSize: 11, lineHeight: 1.45, color: t.textDim, maxWidth: 320 }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
