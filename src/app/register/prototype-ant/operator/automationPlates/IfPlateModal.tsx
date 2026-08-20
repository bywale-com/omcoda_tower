import { useEffect, useState } from "react";
import { Button, Select, Space, Typography } from "antd";
import {
  COMPARE_OPS,
  emptyCompare,
  operandSlot,
  type Compare,
  type CompareOp,
} from "../../../../data/automationCompare";
import type { MappedChip, WorkflowNodeData } from "../../../../data/automationWorkflows";
import { CompareOperandBox } from "./CompareOperand";

function hydrateIf(data: WorkflowNodeData): {
  compare: Compare;
  and: Compare[];
  slots: Record<string, MappedChip[]>;
} {
  if (data.compare) {
    return { compare: data.compare, and: data.and ?? [], slots: data.mappedSlots ?? {} };
  }
  const pickTable = data.pickTable?.trim() ?? "";
  const pickField = data.pickField?.trim() ?? "";
  if (pickTable && pickField) {
    const leftSlot = operandSlot("if", "left");
    const op: CompareOp =
      data.pickOp === "neq" || data.pickOp === "exists" ? data.pickOp : "eq";
    return {
      compare: {
        left: { mode: "chip", slot: leftSlot },
        op,
        right: { mode: "text", value: String(data.pickValue ?? "") },
      },
      and: [],
      slots: {
        ...(data.mappedSlots ?? {}),
        [leftSlot]: [
          {
            fromNodeId: "",
            table: pickTable,
            field: pickField,
            label: `${pickTable}.${pickField}`,
          },
        ],
      },
    };
  }
  return { compare: emptyCompare(), and: data.and ?? [], slots: data.mappedSlots ?? {} };
}

function CompareRow({
  prefix,
  compare,
  mappedSlots,
  onCompare,
  onSlots,
}: {
  prefix: string;
  compare: Compare;
  mappedSlots: Record<string, MappedChip[]>;
  onCompare: (next: Compare) => void;
  onSlots: (next: Record<string, MappedChip[]>) => void;
}) {
  const leftSlot = operandSlot(prefix, "left");
  const rightSlot = operandSlot(prefix, "right");
  const setSlot = (slot: string, chips: MappedChip[]) => {
    const next = { ...mappedSlots };
    if (chips.length) next[slot] = chips;
    else delete next[slot];
    onSlots(next);
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compare.op === "exists" ? "1fr 140px" : "1fr 140px 1fr",
        gap: 8,
        alignItems: "center",
      }}
    >
      <CompareOperandBox
        slot={leftSlot}
        operand={compare.left.mode === "chip" ? { ...compare.left, slot: leftSlot } : compare.left}
        chips={mappedSlots[leftSlot] ?? []}
        onOperand={(left) => onCompare({ ...compare, left: left.mode === "chip" ? { mode: "chip", slot: leftSlot } : left })}
        onChips={(chips) => setSlot(leftSlot, chips)}
      />
      <Select
        value={compare.op}
        options={COMPARE_OPS.map((op) => ({ value: op.id, label: op.label }))}
        onChange={(op) => onCompare({ ...compare, op })}
      />
      {compare.op === "exists" ? null : (
        <CompareOperandBox
          slot={rightSlot}
          operand={compare.right.mode === "chip" ? { ...compare.right, slot: rightSlot } : compare.right}
          chips={mappedSlots[rightSlot] ?? []}
          onOperand={(right) =>
            onCompare({ ...compare, right: right.mode === "chip" ? { mode: "chip", slot: rightSlot } : right })
          }
          onChips={(chips) => setSlot(rightSlot, chips)}
        />
      )}
    </div>
  );
}

export function IfPlateModal({
  data,
  onSave,
  embed,
  onRegisterSave,
}: {
  data: WorkflowNodeData;
  previousOptions?: { id: string; label: string }[];
  onCancel?: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [compare, setCompare] = useState<Compare>(() => hydrateIf(data).compare);
  const [andRows, setAndRows] = useState<Compare[]>(() => hydrateIf(data).and);
  const [slots, setSlots] = useState<Record<string, MappedChip[]>>(() => hydrateIf(data).slots);

  useEffect(() => {
    const next = hydrateIf(data);
    setCompare(next.compare);
    setAndRows(next.and);
    setSlots(next.slots);
  }, [data]);

  const commit = () =>
    onSave({
      compare,
      and: andRows,
      mappedSlots: slots,
      branchKind: "if",
      configured: true,
      filterSummary: "True",
    });

  useEffect(() => {
    if (embed) onRegisterSave?.(commit);
  });

  const body = (
    <div>
      <Typography.Text strong style={{ display: "block", marginBottom: 12 }}>
        True
      </Typography.Text>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <CompareRow
          prefix="if"
          compare={compare}
          mappedSlots={slots}
          onCompare={setCompare}
          onSlots={setSlots}
        />
        {andRows.map((row, index) => (
          <div key={`and-${index}`}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
              AND
            </Typography.Text>
            <CompareRow
              prefix={`if-and-${index}`}
              compare={row}
              mappedSlots={slots}
              onCompare={(next) => setAndRows(andRows.map((item, i) => (i === index ? next : item)))}
              onSlots={setSlots}
            />
          </div>
        ))}
        <Button
          size="small"
          onClick={() => setAndRows([...andRows, emptyCompare()])}
        >
          + Add condition
        </Button>
      </Space>
    </div>
  );

  return body;
}
