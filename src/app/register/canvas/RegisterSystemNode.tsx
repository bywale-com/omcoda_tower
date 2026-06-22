import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ResendLogo } from "../../components/icons/ResendLogo";
import { SupabaseLogo } from "../../components/icons/SupabaseLogo";
import { TowerAppLogo } from "../../components/icons/TowerAppLogo";
import type { Tokens } from "../../components/tokens";
import { getRegisterFlowCanvasFocus } from "../flows/flowFocus";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import type { RegisterSystemNodeKind, RegisterSystemVendor } from "../systems/registry";

const FLOW_DIM_OPACITY = 0.28;

export type RegisterSystemNodeData = {
  systemId: string;
  label: string;
  path: string;
  kind: RegisterSystemNodeKind;
  vendor: RegisterSystemVendor;
  t: Tokens;
};

function systemKindLabel(kind: RegisterSystemNodeKind): string {
  if (kind === "app") return "App";
  if (kind === "service") return "Service";
  if (kind === "provider") return "Provider";
  if (kind === "platform") return "Database";
  return kind;
}

function systemKindPillStyle(kind: RegisterSystemNodeKind, t: Tokens) {
  if (kind === "provider") {
    return { background: t.hoverBg, color: t.textPrimary };
  }
  if (kind === "platform") {
    return { background: "#E0F2FE", color: "#0369A1" };
  }
  return { background: t.accentBg, color: t.accent };
}

function SystemVendorLogo({ vendor, size = 10 }: { vendor: RegisterSystemVendor; size?: number }) {
  if (vendor === "resend") return <ResendLogo size={size} />;
  if (vendor === "supabase") return <SupabaseLogo size={size} />;
  return <TowerAppLogo size={size} title="Tower owned" opticalScale={56 / 64} />;
}

export function RegisterSystemNode({ data, selected }: NodeProps<Node<RegisterSystemNodeData>>) {
  const { systemId, label, path, kind, vendor, t } = data;
  const { activeFlowStepId, activeFlowId } = useRegisterSelection();

  const { systemIds: focusSystemIds } = getRegisterFlowCanvasFocus(activeFlowStepId, activeFlowId);
  const flowFocusActive = focusSystemIds.length > 0;
  const inFlowFocus = flowFocusActive && focusSystemIds.includes(systemId);
  const dimmedByFlow = flowFocusActive && !inFlowFocus;
  const highlighted = selected || inFlowFocus;

  return (
    <div
      data-register-system={systemId}
      style={{
        width: 220,
        boxSizing: "border-box",
        borderRadius: 0,
        border: `2px solid ${highlighted ? t.accent : t.textPrimary}`,
        background: t.bgPrimary,
        boxShadow: highlighted ? `0 0 0 1px ${t.accent}` : undefined,
        opacity: dimmedByFlow ? FLOW_DIM_OPACITY : 1,
        transition: "box-shadow 0.12s ease, opacity 0.12s ease",
        overflow: "hidden",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          border: `2px solid ${t.textPrimary}`,
          background: t.bgPrimary,
        }}
      />
      <div
        className="register-system-drag-handle"
        style={{
          padding: "8px 10px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          cursor: "grab",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 6px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            ...systemKindPillStyle(kind, t),
          }}
        >
          <SystemVendorLogo vendor={vendor} />
          {systemKindLabel(kind)}
        </span>
      </div>
      <div style={{ padding: "10px 10px 12px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            lineHeight: 1.35,
            color: t.textMuted,
          }}
        >
          {path}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          border: `2px solid ${t.textPrimary}`,
          background: t.bgPrimary,
        }}
      />
    </div>
  );
}
