/**
 * Commercial — instrument list, terms/escrow, Save terms, Release control.
 */
import { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { chipTone, StatusTag } from "./operatorAntTags";

type EscrowStatus = "held" | "release_pending_window" | "released" | "returned" | "disputed";

type TermsFields = { contingentCost: string; cap: string; releasePredicate: string; measurementWindow: string };

const STATUS_LABELS: Record<EscrowStatus, string> = {
  held: "held",
  release_pending_window: "release_pending_window",
  released: "released",
  returned: "returned",
  disputed: "disputed",
};

const COMMERCIAL_ROWS = [
  { firmId: DEMO_FIRMS[0].id, status: "held" as EscrowStatus, held: "$2,400 CAD", accepted: "Mon 11:18", termsVersion: "terms-v3" },
  { firmId: DEMO_FIRMS[1].id, status: "release_pending_window" as EscrowStatus, held: "$1,800 CAD", accepted: "Tue 09:42", termsVersion: "terms-v2" },
  { firmId: DEMO_FIRMS[2].id, status: "disputed" as EscrowStatus, held: "$3,150 CAD", accepted: "Fri 15:04", termsVersion: "terms-v1" },
];

const DEFAULT_TERMS: TermsFields = {
  contingentCost: "$2,400 CAD",
  cap: "$3,000 CAD",
  releasePredicate: "Meeting booked (attributed)",
  measurementWindow: "14 days post-attendance",
};

export function CommercialModule() {
  const [selectedId, setSelectedId] = useState(COMMERCIAL_ROWS[0].firmId);
  const [statuses, setStatuses] = useState<Record<string, EscrowStatus>>(
    Object.fromEntries(COMMERCIAL_ROWS.map((r) => [r.firmId, r.status])),
  );
  const [termsVersions, setTermsVersions] = useState<Record<string, string | null>>(
    Object.fromEntries(COMMERCIAL_ROWS.map((r) => [r.firmId, r.termsVersion])),
  );
  const [termsDraft, setTermsDraft] = useState<Record<string, TermsFields>>({});
  const [actionNote, setActionNote] = useState<Record<string, string | undefined>>({});

  const row = COMMERCIAL_ROWS.find((r) => r.firmId === selectedId) ?? COMMERCIAL_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const status = statuses[row.firmId] ?? row.status;
  const termsVersion = termsVersions[row.firmId] ?? row.termsVersion;
  const terms = termsDraft[row.firmId] ?? DEFAULT_TERMS;
  const note = actionNote[row.firmId];

  const patchTerms = (patch: Partial<TermsFields>) => {
    setTermsDraft((prev) => ({ ...prev, [row.firmId]: { ...terms, ...patch } }));
  };

  const evidence = {
    verification:
      status === "release_pending_window"
        ? "verified"
        : status === "held" && termsVersion
          ? "pending window"
          : "blocked",
  };
  const canRelease = Boolean(termsVersion) && (status === "release_pending_window" || status === "held") && evidence.verification === "verified";
  const canReturn = status === "held" || status === "release_pending_window";
  const canDispute = status !== "disputed" && status !== "returned" && status !== "released";

  const listColumns: ColumnsType<typeof COMMERCIAL_ROWS[0]> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => DEMO_FIRMS.find((f) => f.id === r.firmId)?.name,
    },
    { title: "Held", dataIndex: "held", key: "held" },
    {
      title: "Escrow",
      key: "escrow",
      render: (_, r) => <StatusTag label={STATUS_LABELS[statuses[r.firmId] ?? r.status]} color={chipTone(statuses[r.firmId] ?? r.status)} />,
    },
  ];

  return (
    <ModulePage title="Commercial" surface="Commercial">
      <Surface label="Instrument list / firm row">
        <Table
          size="small"
          rowKey="firmId"
          columns={listColumns}
          dataSource={COMMERCIAL_ROWS}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: [selectedId],
            onChange: (keys) => setSelectedId(keys[0] as string),
          }}
        />
      </Surface>

      <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
        Selected firm · <strong>{firm.name}</strong> · {firm.stage}
      </Typography.Text>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Surface label="Escrow terms">
            <Card size="small" title="Escrow terms">
              <Hint>Firm↔Om Coda contingent cost — published version appears on Accept terms.</Hint>
              {termsVersion ? <Typography.Text type="secondary">Bound version · {termsVersion}</Typography.Text> : null}
              <Form layout="vertical" style={{ marginTop: 12 }}>
                <Form.Item label="Contingent cost">
                  <Input value={terms.contingentCost} onChange={(e) => patchTerms({ contingentCost: e.target.value })} />
                </Form.Item>
                <Form.Item label="Cap">
                  <Input value={terms.cap} onChange={(e) => patchTerms({ cap: e.target.value })} />
                </Form.Item>
                <Form.Item label="Release predicate">
                  <Input value={terms.releasePredicate} onChange={(e) => patchTerms({ releasePredicate: e.target.value })} />
                </Form.Item>
                <Form.Item label="Measurement window">
                  <Input value={terms.measurementWindow} onChange={(e) => patchTerms({ measurementWindow: e.target.value })} />
                </Form.Item>
              </Form>
              <Button type="primary" data-register-surface="Save terms version" onClick={() => {
                const next = `terms-v${Date.now().toString().slice(-4)}`;
                setTermsVersions((prev) => ({ ...prev, [row.firmId]: next }));
                message.success(`Published ${next}`);
              }}>
                Save terms version
              </Button>
            </Card>
          </Surface>
        </Col>
        <Col span={12}>
          <Surface label="Escrow status">
            <Card size="small" title="Escrow status" extra={<StatusTag label={STATUS_LABELS[status]} color={chipTone(status)} />}>
              <Space wrap style={{ marginBottom: 12 }}>
                {(Object.keys(STATUS_LABELS) as EscrowStatus[]).map((s) => (
                  <Tag key={s} color={s === status ? chipTone(s) : "default"}>{STATUS_LABELS[s]}</Tag>
                ))}
              </Space>
              <Surface label="Terms / escrow glance">
                <Space wrap>
                  <Tag>Held · {row.held}</Tag>
                  <Tag>Accepted · {row.accepted}</Tag>
                </Space>
              </Surface>
            </Card>
          </Surface>

          <Surface label="Release control" style={{ marginTop: 16 }}>
            <Card size="small" title="Release control">
              <Surface label="Evidence glance">
                <Space wrap style={{ marginBottom: 12 }}>
                  <Tag>window · {terms.measurementWindow}</Tag>
                  <Tag color={termsVersion ? "processing" : "error"}>frozen · {termsVersion ?? "none"}</Tag>
                  <Tag color={evidence.verification === "verified" ? "success" : "warning"}>{evidence.verification}</Tag>
                </Space>
              </Surface>
              <Space wrap>
                <Button type="primary" disabled={!canRelease} onClick={() => {
                  setStatuses((p) => ({ ...p, [row.firmId]: "released" }));
                  setActionNote((p) => ({ ...p, [row.firmId]: "Execute release · transfer queued" }));
                }}>Execute release</Button>
                <Button disabled={!canReturn} onClick={() => {
                  setStatuses((p) => ({ ...p, [row.firmId]: "returned" }));
                  setActionNote((p) => ({ ...p, [row.firmId]: "Execute return · principal returned" }));
                }}>Execute return</Button>
                <Button disabled={!canDispute} onClick={() => {
                  setStatuses((p) => ({ ...p, [row.firmId]: "disputed" }));
                  setActionNote((p) => ({ ...p, [row.firmId]: "Open dispute · release jobs frozen" }));
                }}>Open dispute</Button>
              </Space>
              {note ? <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>{note}</Typography.Text> : null}
            </Card>
          </Surface>
        </Col>
      </Row>
    </ModulePage>
  );
}
