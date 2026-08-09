import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Resolution } from "../data/types";

export type SystemMapNodeData = {
  label: string;
  holds: string;
  faceless: boolean;
  facelessArchetype?: boolean;
  lit?: boolean;
  hasSubMap?: boolean;
  resolution: Resolution;
  selected?: boolean;
};

export const SYSTEM_MAP_NODE_TYPE = "systemMapNode";

export function SystemMapNodeView({ data }: NodeProps) {
  const d = data as SystemMapNodeData;
  const border = d.facelessArchetype
    ? "2px dashed #c45c26"
    : d.faceless
      ? "2px solid #c45c26"
      : "1px solid #3a3f4b";
  const bg = d.lit ? "#2a2118" : d.faceless ? "#1a1612" : "#14161c";
  const glow = d.lit ? "0 0 0 2px #e8a35a, 0 0 24px rgba(232,163,90,0.35)" : "none";

  return (
    <div
      style={{
        width: 200,
        padding: "10px 12px",
        borderRadius: 6,
        border,
        background: bg,
        boxShadow: glow,
        color: "#e8eaed",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#888" }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em" }}>{d.label}</div>
        {d.faceless ? (
          <span
            title="Faceless origin — no control, no pane"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#c45c26",
              border: "1px solid #c45c26",
              borderRadius: 3,
              padding: "1px 4px",
            }}
          >
            {d.facelessArchetype ? "★★" : "★"}
          </span>
        ) : null}
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: "#9aa0a6", lineHeight: 1.35 }}>
        {d.holds.length > 90 ? `${d.holds.slice(0, 90)}…` : d.holds}
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 6, fontSize: 9, color: "#6b7280" }}>
        {d.hasSubMap ? <span>◉ interior</span> : null}
        {d.resolution === "named-silent" ? <span>silence</span> : null}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#888" }} />
    </div>
  );
}
