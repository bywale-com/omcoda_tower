/**
 * Customer support — ticket queue Table, context Tabs, Resolve.
 */
import { useState } from "react";
import { Button, Card, Col, Row, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

type TicketStatus = "Open" | "Waiting" | "Resolved";

type Ticket = {
  id: string;
  subject: string;
  firm: string;
  severity: "High" | "Normal" | "Low";
  source: string;
  owner: string;
  status: TicketStatus;
  body: string;
  jumpTarget: string;
};

const CONTEXT_TABS = [
  { id: "bind", label: "Firm operations bind", jump: "Jump to Firm operations bind", badgeFor: (firm: string) => firm === DEMO_FIRMS[1].name ? { label: "stalled", color: "warning" as const } : null },
  { id: "health", label: "Firm health", jump: "Jump to Firm health", badgeFor: (firm: string) => firm === DEMO_FIRMS[1].name || firm === DEMO_FIRMS[3].name ? { label: "unhealthy", color: "error" as const } : null },
  { id: "commercial", label: "Commercial / escrow", jump: "Jump to Commercial", badgeFor: (firm: string) => firm === DEMO_FIRMS[2].name ? { label: "disputed", color: "error" as const } : firm === DEMO_FIRMS[1].name ? { label: "stalled", color: "warning" as const } : null },
  { id: "activation", label: "Activation state", jump: "Jump to Activation state", badgeFor: (firm: string) => firm === DEMO_FIRMS[1].name || firm === DEMO_FIRMS[2].name ? { label: "stalled", color: "warning" as const } : null },
  { id: "audit", label: "Audit trail", jump: "Jump to Audit trail", badgeFor: () => null },
];

const CONTEXT_SNAPSHOTS: Record<string, Record<string, { k: string; v: string }[]>> = {
  bind: {
    [DEMO_FIRMS[1].name]: [{ k: "Bound pack", v: "Evaluation · v2" }, { k: "Armed / Active", v: "Armed · outreach paused" }],
    [DEMO_FIRMS[0].name]: [{ k: "Bound pack", v: "Evaluation · v3" }, { k: "Armed / Active", v: "Active · running" }],
  },
  health: {
    [DEMO_FIRMS[1].name]: [{ k: "Sequence health", v: "Watch · 9 send holds" }, { k: "Reply rate", v: "7%" }],
    [DEMO_FIRMS[0].name]: [{ k: "Sequence health", v: "Healthy · 4 holds" }, { k: "Reply rate", v: "11%" }],
  },
  commercial: {
    [DEMO_FIRMS[1].name]: [{ k: "Escrow status", v: "release_pending_window" }, { k: "Terms version", v: "terms-v2" }],
    [DEMO_FIRMS[2].name]: [{ k: "Escrow status", v: "disputed" }, { k: "Terms version", v: "terms-v1" }],
  },
  activation: {
    [DEMO_FIRMS[1].name]: [{ k: "Progress", v: "50% · Authorize book stalled" }, { k: "Next gate", v: "authorize-book" }],
    [DEMO_FIRMS[0].name]: [{ k: "Progress", v: "Running" }, { k: "Next gate", v: "—" }],
  },
  audit: {
    [DEMO_FIRMS[1].name]: [{ k: "Last event", v: "Reachability audit · 2d ago" }, { k: "Actor", v: "operator@omcoda.com" }],
  },
};

const TICKETS: Ticket[] = [
  { id: "SUP-184", subject: "Authorize book stuck after CSV upload", firm: DEMO_FIRMS[1].name, severity: "High", source: "Consultant", owner: "ops-north", status: "Open", body: "Consultant uploaded a book export but Authorize book remains disabled.", jumpTarget: "Jump to Firm operations bind" },
  { id: "SUP-179", subject: "Escrow release evidence question", firm: DEMO_FIRMS[2].name, severity: "Normal", source: "Firm email", owner: "ops-west", status: "Waiting", body: "Firm asks which meeting evidence bundle is required before Release control can fire.", jumpTarget: "Jump to Commercial" },
  { id: "SUP-171", subject: "Quiet-hours policy override request", firm: DEMO_FIRMS[0].name, severity: "Low", source: "Agency policy", owner: "agency-desk", status: "Open", body: "Wants outbound after 20:00 local for one reactivation wave.", jumpTarget: "Jump to Founder & agency controls" },
];

export function CustomerSupportModule() {
  const [selectedId, setSelectedId] = useState(TICKETS[0].id);
  const [statuses, setStatuses] = useState<Record<string, TicketStatus>>(
    Object.fromEntries(TICKETS.map((tk) => [tk.id, tk.status])),
  );
  const [activeTab, setActiveTab] = useState("bind");
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string | null>(null);

  const selected = TICKETS.find((x) => x.id === selectedId) ?? TICKETS[0];
  const ticketStatus = statuses[selected.id] ?? selected.status;
  const tabMeta = CONTEXT_TABS.find((tab) => tab.id === activeTab)!;
  const contextRows = CONTEXT_SNAPSHOTS[activeTab]?.[selected.firm] ?? [{ k: "Scope", v: selected.firm }];

  const columns: ColumnsType<Ticket> = [
    { title: "Id", dataIndex: "id", key: "id", width: 90 },
    { title: "Subject", dataIndex: "subject", key: "subject", ellipsis: true },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 80,
      render: (s) => <StatusTag label={s} color={s === "High" ? "error" : s === "Normal" ? "warning" : "default"} />,
    },
    { title: "Status", key: "status", width: 90, render: (_, row) => statuses[row.id] ?? row.status },
  ];

  return (
    <ModulePage title="Customer support" surface="Customer support">
      <Row gutter={16}>
        <Col span={10}>
          <Surface label="Ticket queue">
            <Table
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={TICKETS}
              pagination={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys: [selectedId],
                onChange: (keys) => {
                  setSelectedId(keys[0] as string);
                  setJumpNote(null);
                  setResolveNote(null);
                },
              }}
            />
          </Surface>
        </Col>
        <Col span={14}>
          <Surface label="Ticket">
            <Card size="small" title={`${selected.id} · ${selected.subject}`} extra={<StatusTag label={ticketStatus} color={ticketStatus === "Resolved" ? "success" : "warning"} />}>
              <Typography.Paragraph type="secondary">{selected.body}</Typography.Paragraph>
              <Space wrap>
                <Button data-register-surface="Linked per-tenancy actions" onClick={() => setJumpNote(`${selected.jumpTarget} · ${selected.firm}`)}>
                  {selected.jumpTarget}
                </Button>
                <Button
                  type="primary"
                  data-register-surface="Resolve"
                  disabled={ticketStatus === "Resolved"}
                  onClick={() => {
                    setStatuses((prev) => ({ ...prev, [selected.id]: "Resolved" }));
                    setResolveNote("Resolved · Audit trail records closure");
                  }}
                >
                  Resolve
                </Button>
              </Space>
              {jumpNote ? <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>{jumpNote}</Typography.Text> : null}
              {resolveNote ? <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>{resolveNote}</Typography.Text> : null}
            </Card>
          </Surface>

          <Surface label="Support context" style={{ marginTop: 16 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={CONTEXT_TABS.map((tab) => {
                const badge = tab.badgeFor(selected.firm);
                return {
                  key: tab.id,
                  label: badge ? (
                    <span>
                      {tab.label}
                      <span data-register-surface="Context tab badge" style={{ marginLeft: 6 }}>
                        <StatusTag label={badge.label} color={badge.color} />
                      </span>
                    </span>
                  ) : tab.label,
                };
              })}
            />
            <Row gutter={8} style={{ marginTop: 12 }}>
              {contextRows.map((row) => (
                <Col span={12} key={row.k}>
                  <Card size="small" styles={{ body: { padding: 10 } }}>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{row.k}</Typography.Text>
                    <div style={{ fontWeight: 600 }}>{row.v}</div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Button
              style={{ marginTop: 12 }}
              data-register-surface="Jump to scoped module"
              onClick={() => setJumpNote(`${tabMeta.jump} · ${selected.firm}`)}
            >
              {tabMeta.jump}
            </Button>
          </Surface>
        </Col>
      </Row>
    </ModulePage>
  );
}
