/**
 * Activation state — per-firm activation progress checklist with Jump links.
 */
import { useState } from "react";
import { Button, Progress, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

type Gate = { id: string; title: string; done: boolean; jump?: string };

const ACTIVATION_ROWS = [
  {
    firmId: DEMO_FIRMS[1].id,
    pct: 50,
    next: "Authorize book",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: true, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
  {
    firmId: DEMO_FIRMS[2].id,
    pct: 75,
    next: "Escrow held",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: true, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: true },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
  {
    firmId: DEMO_FIRMS[3].id,
    pct: 25,
    next: "Forward-deployed",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
];

export function ActivationStateModule() {
  const [selectedId, setSelectedId] = useState(ACTIVATION_ROWS[0].firmId);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  const row = ACTIVATION_ROWS.find((r) => r.firmId === selectedId) ?? ACTIVATION_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[1];
  const stalledCount = row.gates.filter((g) => !g.done && g.jump).length;

  const firmColumns: ColumnsType<typeof ACTIVATION_ROWS[0]> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => DEMO_FIRMS.find((f) => f.id === r.firmId)?.name,
    },
    { title: "Progress", dataIndex: "pct", key: "pct", width: 80, render: (p) => `${p}%` },
    { title: "Next gate", dataIndex: "next", key: "next", width: 140 },
  ];

  const gateColumns: ColumnsType<Gate> = [
    { title: "Gate", dataIndex: "title", key: "title" },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, g) => <StatusTag label={g.done ? "complete" : "pending"} color={g.done ? "success" : "warning"} />,
    },
    {
      title: "",
      key: "jump",
      width: 200,
      render: (_, g) =>
        !g.done && g.jump ? (
          <Button size="small" data-register-surface="Progress Jump" onClick={() => setJumpNote(g.jump!)}>
            {g.jump}
          </Button>
        ) : null,
    },
  ];

  return (
    <ModulePage title="Activation state" surface="Activation state">
      <Table
        size="small"
        rowKey="firmId"
        columns={firmColumns}
        dataSource={ACTIVATION_ROWS}
        pagination={false}
        rowSelection={{
          type: "radio",
          selectedRowKeys: [selectedId],
          onChange: (keys) => {
            setSelectedId(keys[0] as string);
            setJumpNote(null);
          },
        }}
      />

      <Surface label="Progress" style={{ marginTop: 16 }}>
        <Space wrap style={{ marginBottom: 8 }}>
          <Typography.Text type="secondary">
            Selected firm · <strong>{firm.name}</strong> · {firm.stage}
          </Typography.Text>
          {stalledCount > 0
            ? <StatusTag label={`${stalledCount} stalled · Jump available`} color="warning" />
            : <StatusTag label="Gates clear" color="success" />}
        </Space>
        {jumpNote ? <Typography.Text type="success">Opened · {jumpNote}</Typography.Text> : null}
        <Progress percent={row.pct} size="small" style={{ marginBottom: 16 }} />
        <Hint>
          Operator does not fake-complete consultant commits on authorize-book or escrow-held.
        </Hint>
        <Table size="small" rowKey="id" columns={gateColumns} dataSource={row.gates} pagination={false} />
      </Surface>
    </ModulePage>
  );
}
