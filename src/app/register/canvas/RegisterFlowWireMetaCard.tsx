import type { Tokens } from "../../components/tokens";
import { getFlowWireEndpointLabels } from "../flows/flowWireEndpointLabels";
import type { RegisterFlowCanvasWire } from "../flows/types";
import { RegisterFlowWireStepBadge } from "./RegisterFlowWireStepBadge";

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function metaRow(label: string, value: string, t: Tokens, monoValue = false) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span
        style={{
          width: 36,
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textDim,
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.45,
          color: t.textPrimary,
          fontFamily: monoValue ? mono : "inherit",
        }}
      >
        {value}
      </span>
    </div>
  );
}

type RegisterFlowWireMetaCardProps = {
  wire: RegisterFlowCanvasWire;
  t: Tokens;
  compact?: boolean;
};

export function RegisterFlowWireMetaCard({ wire, t, compact = false }: RegisterFlowWireMetaCardProps) {
  const showIn = wire.in != null && wire.in !== wire.out;
  const endpoints = getFlowWireEndpointLabels(wire);

  return (
    <div
      className="nodrag nopan nowheel"
      style={{
        minWidth: compact ? 200 : 280,
        maxWidth: 320,
        padding: "8px 10px",
        borderRadius: 0,
        border: `2px solid ${t.textPrimary}`,
        background: t.bgPrimary,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      {wire.flowOrder && endpoints ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <RegisterFlowWireStepBadge
            order={wire.flowOrder}
            active
            accentColor={t.accent}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
              color: t.textPrimary,
            }}
          >
            <span>{endpoints.source}</span>
            <span style={{ color: t.textMuted, margin: "0 5px" }}>→</span>
            <span>{endpoints.target}</span>
          </div>
        </div>
      ) : null}
      {metaRow("Out", wire.out, t, true)}
      {!compact && wire.conditions?.length ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span
            style={{
              width: 36,
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: t.textDim,
              lineHeight: 1.4,
            }}
          >
            When
          </span>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {wire.conditions.map((condition) => (
              <span
                key={condition}
                style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.45, color: t.textPrimary }}
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {!compact && showIn ? metaRow("In", wire.in!, t, true) : null}
      {metaRow("Via", wire.via.mechanism, t)}
      {!compact ? metaRow("", wire.via.location, t, true) : null}
    </div>
  );
}
