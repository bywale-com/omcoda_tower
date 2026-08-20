import { useEffect, useState } from "react";
import { Button, Input, Select, Space, Typography } from "antd";
import {
  COMPARE_OPS,
  emptyCompare,
  newSwitchPath,
  operandSlot,
  type Compare,
  type SwitchPath,
} from "../../../../data/automationCompare";
import type { MappedChip, WorkflowNodeData } from "../../../../data/automationWorkflows";
import { CompareOperandBox } from "./CompareOperand";

function PathCompare({
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 56px 1fr", gap: 8, flex: 1 }}>
      <CompareOperandBox
        slot={leftSlot}
        operand={compare.left.mode === "chip" ? { ...compare.left, slot: leftSlot } : compare.left}
        chips={mappedSlots[leftSlot] ?? []}
        onOperand={(left) => onCompare({ ...compare, left: left.mode === "chip" ? { mode: "chip", slot: leftSlot } : left })}
        onChips={(chips) => setSlot(leftSlot, chips)}
      />
      <Select
        value={compare.op === "exists" ? "eq" : compare.op}
        options={COMPARE_OPS.filter((op) => op.id !== "exists").map((op) => ({
          value: op.id,
          label: op.id === "eq" ? "=" : "≠",
        }))}
        onChange={(op) => onCompare({ ...compare, op })}
      />
      <CompareOperandBox
        slot={rightSlot}
        operand={compare.right.mode === "chip" ? { ...compare.right, slot: rightSlot } : compare.right}
        chips={mappedSlots[rightSlot] ?? []}
        placeholder="value"
        onOperand={(right) =>
          onCompare({ ...compare, right: right.mode === "chip" ? { mode: "chip", slot: rightSlot } : right })
        }
        onChips={(chips) => setSlot(rightSlot, chips)}
      />
    </div>
  );
}

export function SwitchPlateModal({
  data,
  onSave,
  embed,
  onRegisterSave,
}: {
  data: WorkflowNodeData;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [paths, setPaths] = useState<SwitchPath[]>(data.paths ?? []);
  const [slots, setSlots] = useState<Record<string, MappedChip[]>>(data.mappedSlots ?? {});

  useEffect(() => {
    setPaths(data.paths ?? []);
    setSlots(data.mappedSlots ?? {});
  }, [data]);

  const commit = () =>
    onSave({
      paths,
      fallbackHandle: data.fallbackHandle ?? "fallback",
      mappedSlots: slots,
      configured: true,
      filterSummary: `${paths.length} paths`,
    });

  useEffect(() => {
    if (embed) onRegisterSave?.(commit);
  });

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {paths.map((path, index) => (
        <div key={path.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Input
            value={path.label ?? ""}
            placeholder={`path ${index + 1}`}
            style={{ width: 120 }}
            onChange={(event) =>
              setPaths(paths.map((row) => (row.id === path.id ? { ...row, label: event.target.value } : row)))
            }
          />
          <PathCompare
            prefix={`sw-${path.id}`}
            compare={path.compare ?? emptyCompare()}
            mappedSlots={slots}
            onCompare={(compare) => setPaths(paths.map((row) => (row.id === path.id ? { ...row, compare } : row)))}
            onSlots={setSlots}
          />
          <Button
            size="small"
            danger
            onClick={() => setPaths(paths.filter((row) => row.id !== path.id))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Typography.Text type="secondary">fallback</Typography.Text>
      <Button size="small" onClick={() => setPaths([...paths, newSwitchPath()])}>
        + Add path
      </Button>
    </Space>
  );
}
