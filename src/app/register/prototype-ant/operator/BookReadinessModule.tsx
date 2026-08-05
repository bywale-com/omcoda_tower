/**
 * Book readiness — Audits Table, verdict filter, re-audit, sequence-ready glance, Steps rail.
 */
import { useMemo, useState } from "react";
import { Button, Drawer, Select, Space, Steps, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getInitialAudits, type Audit, type AuditGateStep } from "../../../data/audits";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";

type VerdictFilter = "All" | "pass" | "fail" | "pending";

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

export function BookReadinessModule() {
  const [audits, setAudits] = useState(() => getInitialAudits());
  const [selectedId, setSelectedId] = useState("audit-crs-drift");
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    if (verdictFilter === "All") return audits;
    return audits.filter((a) => auditVerdict(a) === verdictFilter);
  }, [audits, verdictFilter]);

  const selected = audits.find((a) => a.id === selectedId) ?? audits[0];

  const columns: ColumnsType<Audit> = [
    { title: "Audit", dataIndex: "label", key: "label" },
    { title: "Meta", dataIndex: "meta", key: "meta", width: 80 },
    {
      title: "Verdict",
      key: "verdict",
      width: 90,
      render: (_, row) => {
        const v = auditVerdict(row);
        return <StatusTag label={v} color={v === "pass" ? "success" : v === "fail" ? "error" : "warning"} />;
      },
    },
    {
      title: "Sequence-ready",
      key: "seq",
      width: 140,
      render: (_, row) => <Tag>{sequenceReadyGlance(row)}</Tag>,
    },
  ];

  const reAudit = () => {
    setAudits((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? {
              ...a,
              gateSteps: a.gateSteps.map((s) => ({ ...s, status: "pending" as AuditGateStep["status"] })),
            }
          : a,
      ),
    );
    window.setTimeout(() => {
      setAudits((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? {
                ...a,
                gateSteps: a.gateSteps.map((s, i) => ({
                  ...s,
                  status: i === 3 ? "fail" : "pass",
                  durationMs: 80 + i * 20,
                })),
              }
            : a,
        ),
      );
    }, 600);
  };

  return (
    <ModulePage title="Book readiness" surface="Book readiness">
      <Surface label="Verdict filter">
        <Space wrap style={{ marginBottom: 12 }}>
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
          <Surface label="Verdict legend">
            <Space wrap>
              <Tag color="success">pass</Tag>
              <Tag color="error">fail</Tag>
              <Tag color="warning">pending</Tag>
            </Space>
          </Surface>
        </Space>
      </Surface>

      <Surface label="Audits">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={false}
          onRow={(row) => ({
            onClick: () => {
              setSelectedId(row.id);
              setDrawerOpen(true);
            },
          })}
        />
      </Surface>

      <Drawer
        title="Audit run"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          <Button data-register-surface="Re-audit remainder" onClick={reAudit}>
            Re-audit remainder
          </Button>
        }
      >
        <Surface label="Audit run">
          <Typography.Title level={5}>{selected.label}</Typography.Title>
          <Surface label="Sequence-ready glance" style={{ marginBottom: 16 }}>
            <Tag color={auditVerdict(selected) === "pass" ? "success" : auditVerdict(selected) === "fail" ? "error" : "warning"}>
              {sequenceReadyGlance(selected)}
            </Tag>
          </Surface>
          <Surface label="Verdict list">
            <Steps
              direction="vertical"
              size="small"
              current={selected.gateSteps.findIndex((s) => s.status === "running")}
              items={selected.gateSteps.map((s) => ({
                title: s.label,
                status: s.status === "pass" ? "finish" : s.status === "fail" ? "error" : s.status === "running" ? "process" : "wait",
                description: s.durationMs ? `${s.durationMs}ms` : undefined,
              }))}
            />
          </Surface>
        </Surface>
      </Drawer>
    </ModulePage>
  );
}
