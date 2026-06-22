import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import type { RegisterFlowNodeKind } from "../flows/types";
import {
  registerFlowBodyText,
  registerFlowHintText,
  registerFlowKindPill,
  registerFlowNodeShell,
} from "../registerFlowNodeStyles";

export type RegisterFlowGraphNodeData = {
  label: string;
  kind: RegisterFlowNodeKind;
  boundary?: string;
  holonId?: string;
  viewId?: string;
  t: Tokens;
};

export function RegisterFlowGraphNode({ data, selected }: NodeProps<Node<RegisterFlowGraphNodeData>>) {
  const { label, kind, boundary, t } = data;

  return (
    <div style={registerFlowNodeShell(t, selected ?? false)}>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          border: `2px solid ${t.textPrimary}`,
          background: t.bgPrimary,
        }}
      />
      <div style={{ padding: "8px 10px 0" }}>
        <span style={registerFlowKindPill(t, kind)}>{kind}</span>
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={registerFlowBodyText(t)}>{label}</div>
        {boundary ? (
          <div style={{ ...registerFlowHintText(t), marginTop: 6 }}>{boundary}</div>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Right}
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
