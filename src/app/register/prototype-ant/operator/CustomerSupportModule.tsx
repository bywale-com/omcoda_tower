/**
 * Customer support — ticket queue Table, context Tabs, Resolve.
 * Tickets persist via primaryStore; Resolve appends auditTrail.
 * Queue starts empty — never DEMO_FIRMS ticket densification.
 */
import { useEffect, useState } from "react";
import { Button, Card, Col, Empty, Row, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useOperatorNav } from "../../prototype/operatorNav";
import {
  appendOperatorAudit,
  hydratePrimaryStoreRows,
  persistPrimaryStoreRow,
} from "../../prototype/operator/operatorWireHelpers";
import { ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";

const SUPPORT_TICKETS_COLLECTION = "support_tickets";

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
  { id: "bind", label: "Firm operations bind", jump: "Jump to Firm operations bind" },
  { id: "health", label: "Firm health", jump: "Jump to Firm health" },
  { id: "commercial", label: "Commercial / escrow", jump: "Jump to Commercial" },
  { id: "activation", label: "Activation state", jump: "Jump to Activation state" },
  { id: "audit", label: "Audit trail", jump: "Jump to Audit trail" },
];

export function CustomerSupportModule() {
  const { jumpTo } = useOperatorNav();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bind");
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hydratePrimaryStoreRows(SUPPORT_TICKETS_COLLECTION, [] as Ticket[]).then((stored) => {
      if (!cancelled) {
        setTickets(stored);
        setSelectedId(stored[0]?.id ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = selectedId ? tickets.find((x) => x.id === selectedId) ?? null : null;
  const ticketStatus = selected?.status;
  const tabMeta = CONTEXT_TABS.find((tab) => tab.id === activeTab)!;
  const contextRows = selected
    ? [{ k: "Scope", v: selected.firm }, { k: "Status", v: selected.status }]
    : [];

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
    { title: "Status", dataIndex: "status", key: "status", width: 90 },
  ];

  const resolveTicket = () => {
    if (!selected) return;
    const next: Ticket = { ...selected, status: "Resolved" };
    setTickets((prev) => prev.map((tk) => (tk.id === next.id ? next : tk)));
    void persistPrimaryStoreRow(SUPPORT_TICKETS_COLLECTION, next);
    void appendOperatorAudit({
      actorId: "ops.support",
      kind: "support.resolve",
      subjectType: "support_ticket",
      subjectId: next.id,
      action: `Resolve · ${next.id} · ${next.subject}`,
      kindLabel: "Support",
      before: selected.status,
      after: "Resolved",
      surface: "Customer support",
      firmName: next.firm,
    });
    setResolveNote("Resolved · Audit trail records closure");
  };

  return (
    <ModulePage title="Customer support" surface="Customer support">
      <Row gutter={16}>
        <Col span={10}>
          <Surface label="Ticket queue">
            {tickets.length === 0 ? (
              <Empty description="No support tickets" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                size="small"
                rowKey="id"
                columns={columns}
                dataSource={tickets}
                pagination={false}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selectedId ? [selectedId] : [],
                  onChange: (keys) => {
                    setSelectedId(keys[0] as string);
                    setJumpNote(null);
                    setResolveNote(null);
                  },
                }}
              />
            )}
          </Surface>
        </Col>
        <Col span={14}>
          {selected ? (
            <>
              <Surface label="Ticket">
                <Card size="small" title={`${selected.id} · ${selected.subject}`} extra={<StatusTag label={ticketStatus!} color={ticketStatus === "Resolved" ? "success" : "warning"} />}>
                  <Typography.Paragraph type="secondary">{selected.body}</Typography.Paragraph>
                  <Space wrap>
                    <Button data-register-surface="Linked per-tenancy actions" onClick={() => { const n = `${selected.jumpTarget} · ${selected.firm}`; jumpTo(n); setJumpNote(n); }}>
                      {selected.jumpTarget}
                    </Button>
                    <Button
                      type="primary"
                      data-register-surface="Resolve"
                      disabled={ticketStatus === "Resolved"}
                      onClick={resolveTicket}
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
                  items={CONTEXT_TABS.map((tab) => ({
                    key: tab.id,
                    label: tab.label,
                  }))}
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
                  onClick={() => { const n = `${tabMeta.jump} · ${selected.firm}`; jumpTo(n); setJumpNote(n); }}
                >
                  {tabMeta.jump}
                </Button>
              </Surface>
            </>
          ) : (
            <Surface label="Ticket">
              <Empty description="Select a ticket or wait for one to arrive" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Surface>
          )}
        </Col>
      </Row>
    </ModulePage>
  );
}
