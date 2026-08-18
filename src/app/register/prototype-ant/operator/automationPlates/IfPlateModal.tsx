import { useEffect, useState } from "react";
import { Button, Input, Modal, Radio, Select, Space, Tag, Typography } from "antd";
import {
  CONDITION_OPERATORS,
  emptyIfConditionConfig,
  emptyIfConditionRow,
  type IfConditionConfig,
} from "../../../../data/automationConditions";
import { MODAL_SCROLL } from "../modalScroll";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";

export function IfPlateModal({
  open,
  data,
  previousOptions,
  onCancel,
  onSave,
  embed,
  onRegisterSave,
}: {
  open: boolean;
  data: WorkflowNodeData;
  previousOptions: { id: string; label: string }[];
  onCancel: () => void;
  onSave: (patch: Partial<WorkflowNodeData>) => void;
  embed?: boolean;
  onRegisterSave?: (fn: () => void) => void;
}) {
  const [label, setLabel] = useState(data.label || "If X — previous result");
  const [previousResultFrom, setPreviousResultFrom] = useState(
    data.previousResultFrom ?? previousOptions[0]?.id ?? "",
  );
  const [pickTable, setPickTable] = useState(data.pickTable ?? "sequence_ready");
  const [pickField, setPickField] = useState(data.pickField ?? "ready");
  const [pickOp, setPickOp] = useState(data.pickOp ?? "eq");
  const [pickValue, setPickValue] = useState(data.pickValue ?? "false");
  const [config, setConfig] = useState<IfConditionConfig>(data.conditionConfig ?? emptyIfConditionConfig());
  const [ifThen, setIfThen] = useState(data.ifThen ?? "Assign agent");
  const [ifElse, setIfElse] = useState(data.ifElse ?? "stop");

  useEffect(() => {
    if (!open) return;
    setLabel(data.label || "If X — previous result");
    setPreviousResultFrom(data.previousResultFrom ?? previousOptions[0]?.id ?? "");
    setPickTable(data.pickTable ?? "sequence_ready");
    setPickField(data.pickField ?? "ready");
    setPickOp(data.pickOp ?? "eq");
    setPickValue(data.pickValue ?? "false");
    setConfig(data.conditionConfig ?? emptyIfConditionConfig());
    setIfThen(data.ifThen ?? "Assign agent");
    setIfElse(data.ifElse ?? "stop");
  }, [open, data]);

  const rows = config.conditions.length ? config.conditions : [emptyIfConditionRow()];

  const commit = () =>
    onSave({
      label,
      previousResultFrom,
      pickTable,
      pickField,
      pickOp,
      pickValue,
      conditionConfig: config,
      ifThen,
      ifElse,
      branchKind: "if",
      configured: true,
      filterSummary: `${pickTable}.${pickField} ${pickOp} ${pickValue}`,
    });

  useEffect(() => {
    if (embed && open) onRegisterSave?.(commit);
  });

  const body = (
    <>
      <Typography.Paragraph type="secondary">
        Picks a field of a write already on the handle (this run’s writes). Person fields split
        people; run fields fire once.
      </Typography.Paragraph>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
        Pick write
      </Typography.Text>
      <Select
        value={pickTable}
        style={{ width: "100%", marginBottom: 12 }}
        options={[
          { value: "sequence_ready", label: "sequence_ready" },
          { value: "reachability_verdicts", label: "reachability_verdicts" },
          { value: "audit_runs", label: "audit_runs" },
          { value: "import_batch", label: "import_batch" },
          { value: "contact_records", label: "contact_records" },
          { value: "contact_tag", label: "contact_tag" },
        ]}
        onChange={setPickTable}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 88px 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Input value={pickField} placeholder="field" onChange={(e) => setPickField(e.target.value)} />
        <Select
          value={pickOp}
          options={[
            { value: "eq", label: "eq" },
            { value: "neq", label: "neq" },
            { value: "exists", label: "exists" },
          ]}
          onChange={setPickOp}
        />
        <Input value={pickValue} placeholder="value" onChange={(e) => setPickValue(e.target.value)} />
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
        Previous result
      </Typography.Text>
      <Select
        value={previousResultFrom || undefined}
        placeholder="Previous node · output"
        style={{ width: "100%", marginBottom: 16 }}
        options={previousOptions.map((row) => ({
          value: row.id,
          label: `${row.label} · output`,
        }))}
        onChange={setPreviousResultFrom}
      />
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        If
      </Typography.Text>
      <Space direction="vertical" size={8} style={{ width: "100%", marginBottom: 12 }}>
        {rows.map((row, index) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 72px 1fr",
              gap: 8,
            }}
          >
            <Input
              value={row.leftField}
              placeholder="status"
              onChange={(event) => {
                const next = rows.map((item, i) =>
                  i === index ? { ...item, leftField: event.target.value } : item,
                );
                setConfig({ ...config, conditions: next });
              }}
            />
            <Select
              value={row.operator}
              options={CONDITION_OPERATORS.map((op) => ({ value: op.id, label: op.label }))}
              onChange={(operator) => {
                const next = rows.map((item, i) => (i === index ? { ...item, operator } : item));
                setConfig({ ...config, conditions: next });
              }}
            />
            <Input
              value={row.right.kind === "literal" ? row.right.value : row.right.kind === "constant" ? row.right.constantKey : row.right.path}
              placeholder="passed"
              onChange={(event) => {
                const next = rows.map((item, i) =>
                  i === index ? { ...item, right: { kind: "literal" as const, value: event.target.value } } : item,
                );
                setConfig({ ...config, conditions: next });
              }}
            />
          </div>
        ))}
        <Button
          size="small"
          onClick={() => setConfig({ ...config, conditions: [...rows, emptyIfConditionRow()] })}
        >
          + Add condition
        </Button>
      </Space>
      <Space direction="vertical" size={10}>
        <Space>
          <Typography.Text style={{ width: 48 }}>Then</Typography.Text>
          <Radio.Group value={ifThen} onChange={(event) => setIfThen(event.target.value)}>
            <Radio value="Assign agent">Assign agent</Radio>
          </Radio.Group>
        </Space>
        <Space>
          <Typography.Text style={{ width: 48 }}>Else</Typography.Text>
          <Radio.Group value={ifElse} onChange={(event) => setIfElse(event.target.value)}>
            <Radio value="stop">stop</Radio>
          </Radio.Group>
        </Space>
      </Space>
    </>
  );

  if (embed) return body;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      {...MODAL_SCROLL}
      title={
        <div>
          <Input
            value={label}
            variant="borderless"
            onChange={(event) => setLabel(event.target.value)}
            style={{ fontSize: 20, fontWeight: 600, paddingInline: 0 }}
          />
          <Tag color="orange" style={{ marginTop: 6 }}>
            Condition
          </Tag>
        </div>
      }
      width={640}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, maxWidth: 360 }}>
            This is not a rule. The rule is a different node. This If reads the last output.
          </Typography.Text>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={commit}>
              Save
            </Button>
          </Space>
        </div>
      }
    >
      {body}
    </Modal>
  );
}
