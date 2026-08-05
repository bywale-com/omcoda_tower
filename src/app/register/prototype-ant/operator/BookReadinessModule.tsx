/**
 * Book readiness — Ant-translated Audits / Audit run workbench.
 */
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  List,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  AUDIT_CHECKS,
  buildConsolidatedRecords,
  finalizeAudit,
  getInitialAudits,
  resolveGateOutcome,
  type Audit,
  type AuditCheckId,
  type AuditGateStatus,
  type AuditRecord,
} from "../../../data/audits";
import { recordReachability, type RecordReachability } from "../../../data/auditRecordReachability";
import { Hint, ModulePage, Surface } from "../chrome";

type VerdictFilter = "All" | "pass" | "fail" | "pending";
type SortDir = "asc" | "desc";

function auditVerdict(audit: Audit): "pass" | "fail" | "pending" {
  const steps = audit.gateSteps;
  if (steps.some((s) => s.status === "fail")) return "fail";
  if (steps.every((s) => s.status === "pass")) return "pass";
  return "pending";
}

function sequenceReadyGlance(audit: Audit): string {
  const fails = audit.gateSteps.filter((s) => s.status === "fail").length;
  if (fails === 0 && audit.gateSteps.every((s) => s.status === "pass")) return "sequence-ready · yes";
  if (fails > 0) return `sequence-ready · blocked (${fails} fails)`;
  return "sequence-ready · pending";
}

function gateColor(status: AuditGateStatus) {
  if (status === "pass") return "success";
  if (status === "fail") return "error";
  if (status === "running") return "processing";
  return "warning";
}

function verdictColor(verdict: ReturnType<typeof auditVerdict>) {
  if (verdict === "pass") return "success";
  if (verdict === "fail") return "error";
  return "warning";
}

function reachabilityTag(reachability: RecordReachability) {
  if (reachability === "both") return <Tag color="success">reachable · phone + email</Tag>;
  if (reachability === "partial") return <Tag color="warning">reachable · partial</Tag>;
  return <Tag color="error">unreachable</Tag>;
}

function recordsForAudit(audit: Audit): AuditRecord[] {
  return audit.records.length > 0 ? audit.records : buildConsolidatedRecords(audit.importIds);
}

function downloadRecordsCsv(audit: Audit) {
  const records = recordsForAudit(audit);
  const csv = [
    "Name,Phone,Email",
    ...records.map((record) =>
      [record.name, record.phone, record.email]
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${audit.id}-records.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BookReadinessModule() {
  const [audits, setAudits] = useState(() => getInitialAudits());
  const [selectedId, setSelectedId] = useState("audit-crs-drift");
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("All");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [inspectedRecordId, setInspectedRecordId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (verdictFilter === "All") return audits;
    return audits.filter((a) => auditVerdict(a) === verdictFilter);
  }, [audits, verdictFilter]);

  const selected = audits.find((a) => a.id === selectedId) ?? audits[0];
  const selectedRecords = useMemo(() => {
    const records = recordsForAudit(selected);
    return [...records].sort((a, b) =>
      sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  }, [selected, sortDir]);

  const recordColumns: ColumnsType<AuditRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space size={6} wrap>
          <Typography.Text strong={record.id === inspectedRecordId}>{name}</Typography.Text>
          {selected.status === "complete" ? reachabilityTag(recordReachability(record)) : null}
        </Space>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 160 },
    { title: "Email", dataIndex: "email", key: "email", width: 240 },
  ];

  const updateEnabledChecks = (checks: AuditCheckId[]) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === selected.id
          ? {
              ...audit,
              enabledChecks: checks,
            }
          : audit,
      ),
    );
  };

  const reAudit = () => {
    const auditId = selected.id;
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              status: "running",
              meta: "Running",
              gateSteps: audit.gateSteps.map((step) =>
                audit.enabledChecks.includes(step.checkId)
                  ? { ...step, status: "pending", durationMs: undefined }
                  : step,
              ),
            }
          : audit,
      ),
    );

    window.setTimeout(() => {
      setAudits((prev) =>
        prev.map((audit) => {
          if (audit.id !== auditId) return audit;
          const records = recordsForAudit(audit);
          const gateSteps = audit.gateSteps.map((step, index) =>
            audit.enabledChecks.includes(step.checkId)
              ? {
                  ...step,
                  status: resolveGateOutcome(step.checkId, records),
                  durationMs: 80 + index * 22,
                }
              : { ...step, status: "pending" as const, durationMs: undefined },
          );
          return finalizeAudit({ ...audit, records, gateSteps });
        }),
      );
    }, 600);
  };

  const selectedVerdict = auditVerdict(selected);

  return (
    <ModulePage title="Book readiness" surface="Book readiness">
      <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <Surface label="Verdict filter">
          <Space wrap>
            <Select
              size="small"
              value={verdictFilter}
              onChange={setVerdictFilter}
              style={{ width: 140 }}
              options={[
                { value: "All", label: "All verdicts" },
                { value: "pass", label: "Pass" },
                { value: "fail", label: "Fail" },
                { value: "pending", label: "Pending" },
              ]}
            />
            <Surface label="Verdict list">
              <Space wrap>
                <Tag color="success">pass</Tag>
                <Tag color="error">fail</Tag>
                <Tag color="warning">pending</Tag>
              </Space>
            </Surface>
            <Surface label="Sequence-ready glance">
              <Tag color={verdictColor(selectedVerdict)}>{sequenceReadyGlance(selected)}</Tag>
            </Surface>
            <Surface label="Re-audit remainder">
              <Button size="small" onClick={reAudit}>
                Re-audit remainder
              </Button>
            </Surface>
          </Space>
        </Surface>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            border: "1px solid var(--ant-color-split)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--ant-color-bg-container)",
          }}
        >
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: "1px solid var(--ant-color-split)",
              overflow: "auto",
              background: "var(--ant-color-bg-layout)",
            }}
          >
            <Surface label="Audits">
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ant-color-split)" }}>
                <Typography.Text strong>Audits</Typography.Text>
                <Hint>Book readiness runs from hydrated imports.</Hint>
              </div>
              <List
                dataSource={filtered}
                renderItem={(audit) => {
                  const verdict = auditVerdict(audit);
                  const active = audit.id === selected.id;
                  return (
                    <List.Item
                      onClick={() => setSelectedId(audit.id)}
                      style={{
                        cursor: "pointer",
                        padding: "10px 12px",
                        background: active ? "var(--ant-color-primary-bg)" : "transparent",
                        borderBlockEnd: "1px solid var(--ant-color-split)",
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Space size={6} wrap>
                            <Typography.Text strong={active}>{audit.label}</Typography.Text>
                            <Tag color={verdictColor(verdict)}>{verdict}</Tag>
                          </Space>
                        }
                        description={
                          <Space size={6} wrap>
                            <Typography.Text type="secondary">{audit.meta}</Typography.Text>
                            <Tag>{audit.importIds.length} import</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Surface>
          </aside>

          <Surface
            label="Audit run"
            style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--ant-color-split)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Typography.Title level={5} style={{ margin: 0 }}>
                {selected.label}
              </Typography.Title>
              <Tag color={selected.status === "running" ? "processing" : "success"}>{selected.status}</Tag>
              <Tag color={verdictColor(selectedVerdict)}>{selectedVerdict}</Tag>
              <Typography.Text type="secondary">{selected.meta}</Typography.Text>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Card size="small" title="Services / checks">
                  <Checkbox.Group
                    value={selected.enabledChecks}
                    onChange={(values) => updateEnabledChecks(values as AuditCheckId[])}
                    style={{ width: "100%" }}
                  >
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      {AUDIT_CHECKS.map((check) => {
                        const step = selected.gateSteps.find((item) => item.checkId === check.id);
                        const status = step?.status ?? "pending";
                        return (
                          <Checkbox key={check.id} value={check.id}>
                            <Space size={8} wrap>
                              <span>{check.label}</span>
                              <Tag color={gateColor(status)}>{status}</Tag>
                              {step?.durationMs ? (
                                <Typography.Text type="secondary">{step.durationMs}ms</Typography.Text>
                              ) : null}
                            </Space>
                          </Checkbox>
                        );
                      })}
                    </Space>
                  </Checkbox.Group>
                </Card>

                <Card
                  size="small"
                  title="Records"
                  extra={
                    <Space size={4}>
                      <Tooltip title={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}>
                        <Button
                          size="small"
                          icon={sortDir === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                          onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                        />
                      </Tooltip>
                      <Tooltip title="Inspect first record">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          disabled={selectedRecords.length === 0}
                          onClick={() => setInspectedRecordId(selectedRecords[0]?.id ?? null)}
                        />
                      </Tooltip>
                      <Tooltip title="Download records CSV">
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadRecordsCsv(selected)}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Table
                    size="small"
                    rowKey="id"
                    columns={recordColumns}
                    dataSource={selectedRecords}
                    pagination={false}
                    onRow={(record) => ({
                      onClick: () => setInspectedRecordId(record.id),
                      style: {
                        cursor: "pointer",
                        background:
                          record.id === inspectedRecordId ? "var(--ant-color-primary-bg)" : undefined,
                      },
                    })}
                  />
                </Card>
              </Space>
            </div>
          </Surface>
        </div>
      </div>
    </ModulePage>
  );
}
