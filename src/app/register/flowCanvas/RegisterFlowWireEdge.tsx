import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import type { RegisterFlowWireMeta } from "../flows/types";
import { registerFlowHintText, registerFlowWireMetaText } from "./registerFlowNodeStyles";

export type RegisterFlowWireEdgeData = {
  label: string;
  wireMeta?: RegisterFlowWireMeta;
  t: Tokens;
};

function formatWireMeta(meta: RegisterFlowWireMeta): string {
  const method = meta.method ?? "POST";
  const path = meta.path ?? "";
  const body = meta.body ? ` ${meta.body}` : "";
  return `${method} ${path}${body}`;
}

export function RegisterFlowWireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const edgeData = data as RegisterFlowWireEdgeData | undefined;
  const t = edgeData?.t;
  const label = edgeData?.label ?? "";
  const wireMeta = edgeData?.wireMeta;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  if (!t) {
    return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />;
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              ...registerFlowHintText(t),
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              padding: "2px 6px",
              borderRadius: 0,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          {wireMeta ? (
            <span style={registerFlowWireMetaText(t)}>{formatWireMeta(wireMeta)}</span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
