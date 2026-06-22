import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import { getRegisterFlowCanvasFocus } from "../flows/flowFocus";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  REGISTER_TABLE_DOMAIN_COLORS,
  type RegisterTableField,
} from "../tables/registry";

const FLOW_DIM_OPACITY = 0.28;
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export type RegisterTableNodeData = {
  tableId: string;
  name: string;
  domain: "tenancy" | "auth";
  fields: RegisterTableField[];
  t: Tokens;
};

function TableFieldRow({ field, t }: { field: RegisterTableField; t: Tokens }) {
  return (
    <div
      style={{
        fontSize: 11,
        lineHeight: 1.45,
        fontFamily: mono,
        color: t.textPrimary,
      }}
    >
      <span>{field.name}</span>
      <span style={{ color: t.textMuted }}>: {field.type}</span>
      {field.note ? (
        <span style={{ color: t.textDim, fontSize: 10 }}> {field.note}</span>
      ) : null}
    </div>
  );
}

export function RegisterTableNode({ data, selected }: NodeProps<Node<RegisterTableNodeData>>) {
  const { tableId, name, domain, fields, t } = data;
  const { activeFlowStepId, activeFlowId } = useRegisterSelection();
  const domainColors = REGISTER_TABLE_DOMAIN_COLORS[domain];

  const { tableIds: focusTableIds } = getRegisterFlowCanvasFocus(activeFlowStepId, activeFlowId);
  const flowFocusActive = focusTableIds.length > 0;
  const inFlowFocus = flowFocusActive && focusTableIds.includes(tableId);
  const dimmedByFlow = flowFocusActive && !inFlowFocus;
  const highlighted = selected || inFlowFocus;

  return (
    <div
      data-register-table={tableId}
      style={{
        width: 200,
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
        className="register-table-drag-handle"
        style={{
          padding: "6px 10px",
          background: domainColors.header,
          borderBottom: `1px solid ${t.border}`,
          cursor: "grab",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: domainColors.headerText,
            fontFamily: mono,
          }}
        >
          {name}
        </div>
      </div>
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {fields.map((field) => (
          <TableFieldRow key={field.name} field={field} t={t} />
        ))}
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
