/**
 * Commercial — instrument list, terms/escrow, Save terms, Release control.
 * Escrow is deferred (P2) — list is honest empty or session-firm-only empty shells,
 * never DEMO_FIRMS held/disputed theater painted as live.
 */
import { useEffect, useState } from "react";
import { Button, Card, Col, Empty, Form, Input, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useWireTick } from "../../../wire";
import { Hint, ModulePage, Surface } from "../chrome";
import { chipTone, StatusTag } from "./operatorAntTags";
import {
  firmDisplayName,
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

type EscrowStatus = "held" | "release_pending_window" | "released" | "returned" | "disputed";

type TermsFields = { contingentCost: string; cap: string; releasePredicate: string; measurementWindow: string };

type CommercialRow = {
  firmId: string;
  status: EscrowStatus;
  held: string;
  accepted: string;
  termsVersion: string | null;
};

const STATUS_LABELS: Record<EscrowStatus, string> = {
  held: "held",
  release_pending_window: "release_pending_window",
  released: "released",
  returned: "returned",
  disputed: "disputed",
};

const DEFAULT_TERMS: TermsFields = {
  contingentCost: "",
  cap: "",
  releasePredicate: "Meeting booked (attributed)",
  measurementWindow: "14 days post-attendance",
};

/** Session/real firm shells only — no fake held/disputed balances. */
function rowsForFirms(firms: readonly OperatorFirm[]): CommercialRow[] {
  return firms.map((f) => ({
    firmId: f.id,
    status: "held" as EscrowStatus,
    held: "—",
    accepted: "—",
    termsVersion: null,
  }));
}

export function CommercialModule() {
  const tick = useWireTick();
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const [rows, setRows] = useState<CommercialRow[]>(() => rowsForFirms(peekOperatorFirms()));
  const [selectedId, setSelectedId] = useState<string | null>(() => peekOperatorFirms()[0]?.id ?? null);
  const [statuses, setStatuses] = useState<Record<string, EscrowStatus>>({});
  const [termsVersions, setTermsVersions] = useState<Record<string, string | null>>({});
  const [termsDraft, setTermsDraft] = useState<Record<string, TermsFields>>({});
  const [actionNote, setActionNote] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then((next) => {
      if (cancelled) return;
      setFirms(next);
      const nextRows = rowsForFirms(next);
      setRows(nextRows);
      setSelectedId((prev) => {
        if (prev && next.some((f) => f.id === prev)) return prev;
        return next[0]?.id ?? null;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const row = selectedId ? rows.find((r) => r.firmId === selectedId) ?? null : null;
  const firmName = row ? firmDisplayName(firms, row.firmId) : "No firm";
  const firmStage = row ? firms.find((f) => f.id === row.firmId)?.stage ?? "—" : "—";
  const status = row ? (statuses[row.firmId] ?? row.status) : "held";
  const termsVersion = row ? (termsVersions[row.firmId] ?? row.termsVersion) : null;
  const terms = row ? (termsDraft[row.firmId] ?? DEFAULT_TERMS) : DEFAULT_TERMS;
  const note = row ? actionNote[row.firmId] : undefined;

  const patchTerms = (patch: Partial<TermsFields>) => {
    if (!row) return;
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

  const listColumns: ColumnsType<CommercialRow> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => firmDisplayName(firms, r.firmId),
    },
    { title: "Held", dataIndex: "held", key: "held" },
    {
      title: "Escrow",
      key: "escrow",
      render: (_, r) => <StatusTag label={STATUS_LABELS[statuses[r.firmId] ?? r.status]} color={chipTone(statuses[r.firmId] ?? r.status)} />,
    },
  ];

  if (rows.length === 0) {
    return (
      <ModulePage title="Commercial" surface="Commercial">
        <Empty
          description="No session/real firm — escrow stand-in idle (deferred)"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </ModulePage>
    );
  }

  return (
    <ModulePage title="Commercial" surface="Commercial">
      <Hint>Escrow is deferred — rows are session/real firm shells only, not live balances.</Hint>
      <Surface label="Instrument list / firm row">
        <Table
          size="small"
          rowKey="firmId"
          columns={listColumns}
          dataSource={rows}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedId ? [selectedId] : [],
            onChange: (keys) => setSelectedId(keys[0] as string),
          }}
        />
      </Surface>

      {row ? (
        <>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
            Selected firm · <strong>{firmName}</strong> · {firmStage}
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
        </>
      ) : null}
    </ModulePage>
  );
}
