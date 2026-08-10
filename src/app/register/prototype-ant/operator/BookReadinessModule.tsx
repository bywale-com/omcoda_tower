/**
 * Book readiness — Ant-translated Audits / Audit run workbench.
 * Start Audit → machineApi.createAuditRun; verdicts + sequence_ready from response.
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
  message,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UploadOutlined,
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
import type { AuditContactVerdict, ReachabilityVerdict } from "../../../wire/machineTypes";
import { wirePorts } from "../../../wire/registry";
import { parseCsvFileToContacts } from "../../prototype/operator/operatorWireHelpers";
import { Hint, ModulePage, Surface } from "../chrome";

type VerdictFilter = "All" | "pass" | "fail" | "pending";
type SortDir = "asc" | "desc";

type MachineVerdictByContact = Record<
  string,
  { verdict: ReachabilityVerdict; ready: boolean }
>;

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

function machineVerdictTag(verdict: ReachabilityVerdict, ready: boolean) {
  const color = verdict === "reachable" ? "success" : verdict === "partial" ? "warning" : "error";
  return (
    <Space size={4} wrap>
      <Tag color={color}>{verdict}</Tag>
      <Tag color={ready ? "success" : "default"}>sequence_ready · {ready ? "yes" : "no"}</Tag>
    </Space>
  );
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
  const [machineVerdicts, setMachineVerdicts] = useState<MachineVerdictByContact>({});
  const [lastAuditRunId, setLastAuditRunId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const readyCount = useMemo(
    () => Object.values(machineVerdicts).filter((v) => v.ready).length,
    [machineVerdicts],
  );

  const recordColumns: ColumnsType<AuditRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => {
        const machine = machineVerdicts[record.id];
        return (
          <Space size={6} wrap>
            <Typography.Text strong={record.id === inspectedRecordId}>{name}</Typography.Text>
            {machine
              ? machineVerdictTag(machine.verdict, machine.ready)
              : selected.status === "complete"
                ? reachabilityTag(recordReachability(record))
                : null}
          </Space>
        );
      },
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

  const applyMachineVerdicts = (verdicts: AuditContactVerdict[]) => {
    const next: MachineVerdictByContact = {};
    for (const row of verdicts) {
      next[row.contactId] = { verdict: row.verdict, ready: row.ready };
    }
    setMachineVerdicts(next);
  };

  const startAuditRun = async () => {
    const auditId = selected.id;
    const records = recordsForAudit(selected);
    setStarting(true);
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              status: "running",
              meta: "Running · machine audit",
              gateSteps: audit.gateSteps.map((step) =>
                audit.enabledChecks.includes(step.checkId)
                  ? { ...step, status: "pending", durationMs: undefined }
                  : step,
              ),
            }
          : audit,
      ),
    );
    try {
      const result = await wirePorts.machineApi.createAuditRun({
        importIds: selected.importIds,
        contactIds: records.map((record) => ({
          id: record.id,
          email: record.email || undefined,
          phone: record.phone || undefined,
          name: record.name || undefined,
        })),
      });
      setLastAuditRunId(result.id);
      if (result.verdicts?.length) {
        applyMachineVerdicts(result.verdicts);
      } else {
        // Fallback: board detections do not carry reachability; derive from local channels.
        applyMachineVerdicts(
          records.map((record) => {
            const reach = recordReachability(record);
            const verdict: ReachabilityVerdict =
              reach === "both" ? "reachable" : reach === "partial" ? "partial" : "unreachable";
            return {
              contactId: record.id,
              verdict,
              ready: verdict !== "unreachable",
              email: record.email,
              phone: record.phone,
              name: record.name,
            };
          }),
        );
      }
      setAudits((prev) =>
        prev.map((audit) => {
          if (audit.id !== auditId) return audit;
          const gateSteps = audit.gateSteps.map((step, index) =>
            audit.enabledChecks.includes(step.checkId)
              ? {
                  ...step,
                  status: resolveGateOutcome(step.checkId, records),
                  durationMs: 40 + index * 12,
                }
              : { ...step, status: "pending" as const, durationMs: undefined },
          );
          return finalizeAudit({
            ...audit,
            records,
            gateSteps,
            meta: `Machine · ${result.id} · ${result.contacts} contacts`,
          });
        }),
      );
      message.success(`Audit run ${result.id} · ${result.contacts} contacts`);
      // Match plant AuditContext: after contacts land + sequence_ready, fire onboarding enroll.
      if (result.contacts > 0) {
        void wirePorts.machineApi.fireOnboarding().catch(() => undefined);
      }
    } catch (err) {
      setAudits((prev) =>
        prev.map((audit) =>
          audit.id === auditId ? { ...audit, status: "complete", meta: `Failed · ${String(err)}` } : audit,
        ),
      );
      message.error(`Start Audit failed: ${String(err)}`);
    } finally {
      setStarting(false);
    }
  };

  const reAudit = () => {
    void startAuditRun();
  };

  const handleBookUpload = async (file: File) => {
    setUploading(true);
    try {
      const contacts = await parseCsvFileToContacts(file);
      if (contacts.length === 0) {
        message.warning("No mutable contacts parsed from upload");
        return;
      }
      const importId = `imp-upload-${Date.now()}`;
      const auditId = `audit-upload-${Date.now()}`;
      const records = contacts.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
      }));
      setAudits((prev) => [
        {
          id: auditId,
          label: `Upload · ${file.name}`,
          meta: "Running · mutable contacts",
          status: "running",
          importIds: [importId],
          records,
          enabledChecks: AUDIT_CHECKS.map((c) => c.id),
          gateSteps: AUDIT_CHECKS.map((c) => ({
            checkId: c.id,
            label: c.label,
            status: "pending" as const,
          })),
        },
        ...prev,
      ]);
      setSelectedId(auditId);
      const result = await wirePorts.machineApi.createAuditRun({
        importIds: [importId],
        contactIds: contacts.map((c) => ({
          id: c.id,
          email: c.email || undefined,
          phone: c.phone || undefined,
          name: c.name || undefined,
        })),
      });
      setLastAuditRunId(result.id);
      if (result.verdicts?.length) {
        applyMachineVerdicts(result.verdicts);
      }
      setAudits((prev) =>
        prev.map((audit) => {
          if (audit.id !== auditId) return audit;
          const gateSteps = audit.gateSteps.map((step, index) => ({
            ...step,
            status: resolveGateOutcome(step.checkId, records),
            durationMs: 40 + index * 12,
          }));
          return finalizeAudit({
            ...audit,
            records,
            gateSteps,
            meta: `Upload · ${result.id} · ${result.contacts} contacts`,
          });
        }),
      );
      message.success(`Uploaded ${contacts.length} contacts · audit run ${result.id}`);
      // Match plant AuditContext: upload → sequence_ready → onboarding enroll when campaign running.
      if (result.contacts > 0) {
        void wirePorts.machineApi.fireOnboarding().catch(() => undefined);
      }
    } catch (err) {
      message.error(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
    }
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
              <Space size={6} wrap>
                <Tag color={verdictColor(selectedVerdict)}>{sequenceReadyGlance(selected)}</Tag>
                {Object.keys(machineVerdicts).length > 0 ? (
                  <Tag color={readyCount > 0 ? "success" : "warning"}>
                    sequence_ready · {readyCount}/{Object.keys(machineVerdicts).length}
                  </Tag>
                ) : null}
                {lastAuditRunId ? <Tag>run · {lastAuditRunId}</Tag> : null}
              </Space>
            </Surface>
            <Surface label="Re-audit remainder">
              <Button
                size="small"
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={starting}
                onClick={() => void startAuditRun()}
                data-register-surface="Start Audit run"
              >
                Start Audit run
              </Button>
              <Button size="small" onClick={reAudit} style={{ marginLeft: 8 }} disabled={starting}>
                Re-audit remainder
              </Button>
              <Button
                size="small"
                icon={<UploadOutlined />}
                loading={uploading}
                style={{ marginLeft: 8 }}
                data-register-surface="Upload book"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv,.tsv,text/csv,text/tab-separated-values";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (file) void handleBookUpload(file);
                  };
                  input.click();
                }}
              >
                Upload book CSV
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
