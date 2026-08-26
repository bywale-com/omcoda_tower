/**
 * Commercial — escrow_acceptances is the instrument. Save terms UPSERT;
 * Release / Return / Dispute set status. Index = session/real firms (020).
 * Stripe rail stays stand-in; this pane is the acceptance / status row.
 */
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { wirePorts } from "../../../wire";
import type { EscrowAcceptanceRow, EscrowInstrumentStatus } from "../../../wire/machineTypes";
import { Hint, ModulePage, Surface } from "../chrome";
import { chipTone, StatusTag } from "./operatorAntTags";
import {
  firmDisplayName,
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

type TermsFields = { contingentCost: string; cap: string; releasePredicate: string; measurementWindow: string };

const STATUS_LABELS: Record<EscrowInstrumentStatus, string> = {
  held: "held",
  release_pending_window: "release_pending_window",
  released: "released",
  returned: "returned",
  disputed: "disputed",
};

const DEFAULT_TERMS: TermsFields = {
  contingentCost: "",
  cap: "",
  releasePredicate: "",
  measurementWindow: "",
};

function termsFromRow(row: EscrowAcceptanceRow | null): TermsFields {
  const terms = row?.terms ?? {};
  return {
    contingentCost: typeof terms.contingentCost === "string" ? terms.contingentCost : DEFAULT_TERMS.contingentCost,
    cap: typeof terms.cap === "string" ? terms.cap : DEFAULT_TERMS.cap,
    releasePredicate: typeof terms.releasePredicate === "string" ? terms.releasePredicate : DEFAULT_TERMS.releasePredicate,
    measurementWindow: typeof terms.measurementWindow === "string" ? terms.measurementWindow : DEFAULT_TERMS.measurementWindow,
  };
}

function emptyEscrow(firmId: string): EscrowAcceptanceRow {
  return {
    firmId,
    accepted: false,
    terms: {},
    acceptedAt: null,
    status: null,
    missing: true,
  };
}

export function CommercialModule() {
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const [selectedId, setSelectedId] = useState<string | null>(() => peekOperatorFirms()[0]?.id ?? null);
  const [escrows, setEscrows] = useState<Record<string, EscrowAcceptanceRow>>({});
  const [termsDraft, setTermsDraft] = useState<Record<string, TermsFields>>({});
  const [actionNote, setActionNote] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then(async (nextFirms) => {
      if (cancelled) return;
      setFirms(nextFirms);
      setSelectedId((prev) => {
        if (prev && nextFirms.some((f) => f.id === prev)) return prev;
        return nextFirms[0]?.id ?? null;
      });
      const nextEscrows: Record<string, EscrowAcceptanceRow> = {};
      await Promise.all(
        nextFirms.map(async (f) => {
          try {
            nextEscrows[f.id] = await wirePorts.machineApi.getEscrow(f.id);
          } catch {
            nextEscrows[f.id] = emptyEscrow(f.id);
          }
        }),
      );
      if (!cancelled) setEscrows(nextEscrows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const firmId = selectedId ?? firms[0]?.id ?? null;
  const firmName = firmId ? firmDisplayName(firms, firmId) : "No firm";
  const firm = firmId ? firms.find((f) => f.id === firmId) : null;
  const escrow = firmId ? (escrows[firmId] ?? emptyEscrow(firmId)) : null;
  const status = escrow?.status ?? null;
  const termsVersion = typeof escrow?.terms?.version === "string" ? escrow.terms.version : null;
  const terms = firmId ? (termsDraft[firmId] ?? termsFromRow(escrow)) : DEFAULT_TERMS;
  const note = firmId ? actionNote[firmId] : undefined;

  const patchTerms = (patch: Partial<TermsFields>) => {
    if (!firmId) return;
    setTermsDraft((prev) => ({ ...prev, [firmId]: { ...terms, ...patch } }));
  };

  const refreshEscrow = async (id: string) => {
    try {
      const row = await wirePorts.machineApi.getEscrow(id);
      setEscrows((prev) => ({ ...prev, [id]: row }));
    } catch {
      /* keep last */
    }
  };

  const evidence = {
    verification:
      status === "release_pending_window"
        ? "verified"
        : status === "held" && termsVersion
          ? "pending window"
          : "blocked",
  };
  const canRelease = Boolean(termsVersion) && status === "release_pending_window" && evidence.verification === "verified";
  const canReturn = status === "held" || status === "release_pending_window";
  const canDispute = Boolean(status) && status !== "disputed" && status !== "returned" && status !== "released";

  const setStatus = async (next: EscrowInstrumentStatus, noteText: string) => {
    if (!firmId) return;
    setSaving(true);
    try {
      const row = await wirePorts.machineApi.putEscrow({ firmId, status: next });
      setEscrows((prev) => ({ ...prev, [firmId]: row }));
      setActionNote((p) => ({ ...p, [firmId]: noteText }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Escrow write failed");
    } finally {
      setSaving(false);
    }
  };

  const listColumns: ColumnsType<OperatorFirm> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => firmDisplayName(firms, r.id),
    },
    {
      title: "Held",
      key: "held",
      render: (_, r) => {
        const cost = escrows[r.id]?.terms?.contingentCost;
        return typeof cost === "string" && cost.trim() ? cost : "—";
      },
    },
    {
      title: "Escrow",
      key: "escrow",
      render: (_, r) => {
        const s = escrows[r.id]?.status;
        return s ? <StatusTag label={STATUS_LABELS[s]} color={chipTone(s)} /> : <Typography.Text type="secondary">—</Typography.Text>;
      },
    },
  ];

  return (
    <ModulePage title="Commercial" surface="Commercial">
      <Surface label="Instrument list / firm row">
        <Table
          size="small"
          rowKey="id"
          columns={listColumns}
          dataSource={firms}
          pagination={false}
          locale={{ emptyText: "No firms — provision or select a session firm." }}
          rowSelection={
            firms.length > 0
              ? {
                  type: "radio",
                  selectedRowKeys: firmId ? [firmId] : [],
                  onChange: (keys) => setSelectedId(keys[0] as string),
                }
              : undefined
          }
        />
      </Surface>

      {firmId ? (
        <>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
            Selected firm · <strong>{firmName}</strong>
            {firm?.stage ? ` · ${firm.stage}` : ""}
          </Typography.Text>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Surface label="Escrow terms">
                <Card size="small" title="Escrow terms">
                  <Hint>Save writes escrow_acceptances.terms + accepted. Stripe rail stays stand-in.</Hint>
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
                  <Button
                    type="primary"
                    loading={saving}
                    data-register-surface="Save terms version"
                    onClick={() => {
                      const next = `terms-v${Date.now().toString().slice(-4)}`;
                      void (async () => {
                        setSaving(true);
                        try {
                          const row = await wirePorts.machineApi.putEscrow({
                            firmId,
                            accepted: true,
                            terms: { ...terms, version: next },
                          });
                          setEscrows((prev) => ({ ...prev, [firmId]: row }));
                          setTermsDraft((prev) => {
                            const copy = { ...prev };
                            delete copy[firmId];
                            return copy;
                          });
                          message.success(`Published ${next}`);
                          await refreshEscrow(firmId);
                        } catch (err) {
                          message.error(err instanceof Error ? err.message : "Save failed");
                        } finally {
                          setSaving(false);
                        }
                      })();
                    }}
                  >
                    Save terms version
                  </Button>
                </Card>
              </Surface>
            </Col>
            <Col span={12}>
              <Surface label="Escrow status">
                <Card
                  size="small"
                  title="Escrow status"
                  extra={
                    status
                      ? <StatusTag label={STATUS_LABELS[status]} color={chipTone(status)} />
                      : <Typography.Text type="secondary">no row</Typography.Text>
                  }
                >
                  <Space wrap style={{ marginBottom: 12 }}>
                    {(Object.keys(STATUS_LABELS) as EscrowInstrumentStatus[]).map((s) => (
                      <Tag key={s} color={s === status ? chipTone(s) : "default"}>{STATUS_LABELS[s]}</Tag>
                    ))}
                  </Space>
                  <Surface label="Terms / escrow glance">
                    <Space wrap>
                      <Tag>Held · {typeof escrow?.terms?.contingentCost === "string" && escrow.terms.contingentCost ? escrow.terms.contingentCost : "—"}</Tag>
                      <Tag>Accepted · {escrow?.acceptedAt ? new Date(escrow.acceptedAt).toLocaleString() : "—"}</Tag>
                    </Space>
                  </Surface>
                </Card>
              </Surface>

              <Surface label="Release control" style={{ marginTop: 16 }}>
                <Card size="small" title="Release control">
                  <Surface label="Evidence glance">
                    <Space wrap style={{ marginBottom: 12 }}>
                      <Tag>window · {terms.measurementWindow || "—"}</Tag>
                      <Tag color={termsVersion ? "processing" : "error"}>frozen · {termsVersion ?? "none"}</Tag>
                      <Tag color={evidence.verification === "verified" ? "success" : "warning"}>{evidence.verification}</Tag>
                    </Space>
                  </Surface>
                  <Space wrap>
                    <Button type="primary" disabled={!canRelease || saving} onClick={() => void setStatus("released", "Execute release · transfer queued")}>
                      Execute release
                    </Button>
                    <Button disabled={!canReturn || saving} onClick={() => void setStatus("returned", "Execute return · principal returned")}>
                      Execute return
                    </Button>
                    <Button disabled={!canDispute || saving} onClick={() => void setStatus("disputed", "Open dispute · release jobs frozen")}>
                      Open dispute
                    </Button>
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
