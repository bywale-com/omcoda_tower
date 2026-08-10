/**
 * Firm health — health Table, firm filter, Sequence detail Modal, Open support context.
 */
import { useEffect, useState } from "react";
import { Button, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  loadFirmHealthData,
  type EngagementHealthRow,
  type EngagementRecordSummary,
  type InFlightAttemptRow,
  type SequenceHealthRow,
} from "../../prototype/operator/operatorWireHelpers";
import { ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { chipTone, StatusTag } from "./operatorAntTags";

export function FirmHealthModule() {
  const [selectedFirmId, setSelectedFirmId] = useState(DEMO_FIRMS[0].id);
  const [stickyFirmId, setStickyFirmId] = useState<string | null>(DEMO_FIRMS[3].id);
  const [sequences, setSequences] = useState<SequenceHealthRow[]>([]);
  const [engagementRows, setEngagementRows] = useState<EngagementHealthRow[]>([]);
  const [inFlightAttempts, setInFlightAttempts] = useState<InFlightAttemptRow[]>([]);
  const [engagementRecords, setEngagementRecords] = useState<EngagementRecordSummary>({
    total: 0,
    kinds: [],
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [supportCue, setSupportCue] = useState<string | null>(null);

  const scopedId = stickyFirmId ?? selectedFirmId;
  const firm = DEMO_FIRMS.find((f) => f.id === scopedId) ?? DEMO_FIRMS[0];
  const detail = detailId ? sequences.find((s) => s.id === detailId) : null;

  useEffect(() => {
    let cancelled = false;
    void loadFirmHealthData(scopedId).then((data) => {
      if (!cancelled) {
        setSequences(data.sequences);
        setEngagementRows(data.engagement);
        setInFlightAttempts(data.inFlightAttempts);
        setEngagementRecords(data.engagementRecords);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [scopedId]);

  const seqColumns: ColumnsType<SequenceHealthRow> = [
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

  const engColumns: ColumnsType<EngagementHealthRow> = [
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

  const attemptColumns: ColumnsType<InFlightAttemptRow> = [
    { title: "Contact", dataIndex: "contactId", key: "contactId" },
    { title: "Channel", dataIndex: "ownerChannel", key: "ownerChannel", width: 90 },
    { title: "Status", dataIndex: "status", key: "status", width: 80 },
    { title: "Waiting on", dataIndex: "waitingOn", key: "waitingOn", ellipsis: true },
    { title: "Step", dataIndex: "step", key: "step", width: 60 },
  ];

  const seedSupport = (seq?: SequenceHealthRow) => {
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
          dataSource={sequences}
          pagination={false}
          onRow={(row) => ({
            onClick: () => setDetailId(row.id),
            style: { cursor: "pointer" },
          })}
        />
      </Surface>

      <Surface label="Engagement health" style={{ marginTop: 16 }}>
        <Table size="small" rowKey="label" columns={engColumns} dataSource={engagementRows} pagination={false} />
      </Surface>

      <Surface label="In-flight attempts" style={{ marginTop: 16 }}>
        <Table
          size="small"
          rowKey={(row) => `${row.contactId}-${row.ownerChannel}-${row.status}`}
          columns={attemptColumns}
          dataSource={inFlightAttempts}
          pagination={false}
          locale={{ emptyText: "No in-flight attempts for this firm." }}
        />
      </Surface>

      <Surface label="Engagement records" style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          Recent records · <strong>{engagementRecords.total}</strong> total
        </Typography.Text>
        {engagementRecords.kinds.length === 0 ? (
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            No engagement records for this firm.
          </Typography.Text>
        ) : (
          <Space wrap style={{ marginTop: 8 }}>
            {engagementRecords.kinds.map((kind) => (
              <Tag key={kind.kind}>
                {kind.kind} · {kind.count}
              </Tag>
            ))}
          </Space>
        )}
      </Surface>

      <Surface label="Open support context" style={{ marginTop: 16 }}>
        <Button type="primary" onClick={() => seedSupport()}>
          Open support context
        </Button>
        {supportCue ? (
          <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>
            {supportCue}
          </Typography.Text>
        ) : null}
      </Surface>

      <Modal
        title={detail ? `Sequence detail · ${detail.name}` : "Sequence detail"}
        open={Boolean(detail)}
        onCancel={() => setDetailId(null)}
        footer={
          <Space>
            <Button
              data-register-surface="Open support context"
              onClick={() => detail && seedSupport(detail)}
            >
              Open support context
            </Button>
            <Button onClick={() => setDetailId(null)}>Close</Button>
          </Space>
        }
      >
        {detail ? (
          <Surface label="Sequence detail">
            <StatusTag label={detail.health} color={chipTone(detail.health)} />
            <dl style={{ marginTop: 12, display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
              <dt>Stuck reason</dt>
              <dd>{detail.stuckReason}</dd>
              <dt>Last runner</dt>
              <dd>{detail.lastRunner}</dd>
            </dl>
            <Space wrap style={{ marginTop: 12 }}>
              {detail.gates.map((gate) => (
                <Tag key={gate} color={gate.includes("hold") ? "warning" : "success"}>{gate}</Tag>
              ))}
            </Space>
          </Surface>
        ) : null}
      </Modal>
    </ModulePage>
  );
}
