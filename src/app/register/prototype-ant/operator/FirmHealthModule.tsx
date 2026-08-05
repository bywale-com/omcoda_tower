/**
 * Firm health — health Table, firm filter, Sequence detail Modal, Open support context.
 */
import { useState } from "react";
import { Button, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { chipTone, StatusTag } from "./operatorAntTags";

const SEQUENCES = [
  { id: "seq-optin", name: "Opt-in Standard", health: "Healthy", stuckReason: "3 contacts on WhatsApp confirm step", lastRunner: "Runner tick · Today 14:01", gates: ["Consent OK", "Send gate open", "Channel WhatsApp"] },
  { id: "seq-nudge", name: "Nudge · dormant 90d", health: "Watch", stuckReason: "11 contacts past silence clock", lastRunner: "Runner tick · Today 13:52", gates: ["Consent OK", "Send gate open"] },
  { id: "seq-react", name: "Reactivation · CEC window", health: "At risk", stuckReason: "9 contacts — consent ledger incomplete", lastRunner: "Runner tick · Today 11:48", gates: ["Consent partial", "Send gate hold"] },
];

const ENGAGEMENT_ROWS = [
  { label: "7d reply rate", value: "11%", health: "Watch" },
  { label: "Send-gate holds", value: "4", health: "At risk" },
  { label: "Active enrollments", value: "214", health: "Healthy" },
];

export function FirmHealthModule() {
  const [selectedFirmId, setSelectedFirmId] = useState(DEMO_FIRMS[0].id);
  const [stickyFirmId, setStickyFirmId] = useState<string | null>(DEMO_FIRMS[3].id);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [supportCue, setSupportCue] = useState<string | null>(null);

  const scopedId = stickyFirmId ?? selectedFirmId;
  const firm = DEMO_FIRMS.find((f) => f.id === scopedId) ?? DEMO_FIRMS[0];
  const detail = detailId ? SEQUENCES.find((s) => s.id === detailId) : null;

  const seqColumns: ColumnsType<typeof SEQUENCES[0]> = [
    { title: "Sequence", dataIndex: "name", key: "name" },
    { title: "Stuck", dataIndex: "stuckReason", key: "stuckReason", ellipsis: true },
    {
      title: "Health",
      dataIndex: "health",
      key: "health",
      width: 100,
      render: (h) => <StatusTag label={h} color={chipTone(h)} />,
    },
  ];

  const engColumns: ColumnsType<typeof ENGAGEMENT_ROWS[0]> = [
    { title: "Metric", dataIndex: "label", key: "label" },
    { title: "Value", dataIndex: "value", key: "value", width: 80 },
    {
      title: "Health",
      dataIndex: "health",
      key: "health",
      width: 100,
      render: (h) => <StatusTag label={h} color={chipTone(h)} />,
    },
  ];

  const seedSupport = (seq?: typeof SEQUENCES[0]) => {
    const reason = seq ? `${seq.name} · ${seq.stuckReason}` : "Firm health drill";
    setSupportCue(`Customer support · Ticket seeded · ${firm.name} · ${reason}`);
  };

  return (
    <ModulePage title="Firm health" surface="Firm health" extra={<StatusTag label={firm.name} />}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary">Firm scope · <strong>{firm.name}</strong></Typography.Text>
        {stickyFirmId ? (
          <Tag closable onClose={() => setStickyFirmId(null)} data-register-surface="Firm-filter chip" color="processing">
            Sticky · {firm.name}
          </Tag>
        ) : (
          <Select
            size="small"
            value={selectedFirmId}
            onChange={(v) => {
              setSelectedFirmId(v);
              setStickyFirmId(v);
            }}
            style={{ width: 200 }}
            options={DEMO_FIRMS.map((f) => ({ value: f.id, label: f.name }))}
          />
        )}
      </Space>

      <Surface label="Sequence health">
        <Table
          size="small"
          rowKey="id"
          columns={seqColumns}
          dataSource={SEQUENCES}
          pagination={false}
          onRow={(row) => ({
            onClick: () => setDetailId(row.id),
            style: { cursor: "pointer" },
          })}
        />
      </Surface>

      <Surface label="Engagement health" style={{ marginTop: 16 }}>
        <Table size="small" rowKey="label" columns={engColumns} dataSource={ENGAGEMENT_ROWS} pagination={false} />
      </Surface>

      <Surface label="Open support context" style={{ marginTop: 16 }}>
        <Button type="primary" onClick={() => seedSupport()}>Open support context</Button>
        {supportCue ? <Typography.Text type="success" style={{ marginLeft: 12 }}>{supportCue}</Typography.Text> : null}
      </Surface>

      <Modal
        title={detail ? `Sequence detail · ${detail.name}` : "Sequence detail"}
        open={Boolean(detail)}
        onCancel={() => setDetailId(null)}
        footer={
          <Button type="primary" data-register-surface="Open support context" onClick={() => detail && seedSupport(detail)}>
            Open support context
          </Button>
        }
      >
        {detail ? (
          <Surface label="Sequence detail">
            <StatusTag label={detail.health} color={chipTone(detail.health)} />
            <dl style={{ marginTop: 12, fontSize: 13, display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
              <dt>Stuck reason</dt><dd>{detail.stuckReason}</dd>
              <dt>Last runner</dt><dd>{detail.lastRunner}</dd>
            </dl>
            <Space wrap style={{ marginTop: 12 }}>
              {detail.gates.map((gate) => (
                <Tag key={gate} color={gate.includes("hold") || gate.includes("partial") ? "warning" : "success"}>
                  {gate}
                </Tag>
              ))}
            </Space>
          </Surface>
        ) : null}
      </Modal>
    </ModulePage>
  );
}
