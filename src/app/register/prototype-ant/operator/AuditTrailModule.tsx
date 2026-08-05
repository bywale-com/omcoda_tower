/**
 * Audit trail — filters, change event Table, detail Modal, jump chips.
 */
import { useMemo, useState } from "react";
import { Button, Modal, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

const EVENTS = [
  { id: "ev-1", at: "Today · 14:22", firm: DEMO_FIRMS[0].name, actor: "ops.lena", action: "Bound Evaluation pack v2", kind: "Bind packs", before: "Evaluation pack v1 · armed", after: "Evaluation pack v2 · armed", surface: "Firm operations bind" },
  { id: "ev-2", at: "Today · 11:05", firm: DEMO_FIRMS[1].name, actor: "ops.marco", action: "Forward-deploy staged Prepared Workspace", kind: "Activation", before: "Capture complete", after: "Prepared Workspace staged", surface: "Activation & forward-deploy" },
  { id: "ev-3", at: "Yesterday · 16:40", firm: "House-global", actor: "founder", action: "Agency policy · outbound quiet hours updated", kind: "Kill-switch", before: "Quiet hours off", after: "Quiet hours 09:00–20:00", surface: "Founder & agency controls" },
  { id: "ev-4", at: "Yesterday · 09:12", firm: DEMO_FIRMS[0].name, actor: "ops.lena", action: "Open-box Publish version · Immigration constants", kind: "Publish version", before: "v2026.03.1", after: "v2026.03.2 published", surface: "Reference data" },
  { id: "ev-5", at: "Mon · 18:03", firm: DEMO_FIRMS[3].name, actor: "support.kai", action: "Support context attached to ticket SUP-184", kind: "Support", before: "Ticket unscoped", after: "Firm scope · Atlas Mobility", surface: "Customer support" },
  { id: "ev-6", at: "Mon · 10:44", firm: DEMO_FIRMS[2].name, actor: "ops.lena", action: "Escrow terms · published terms-v1", kind: "Escrow terms", before: "Draft terms", after: "terms-v1 published", surface: "Commercial" },
  { id: "ev-7", at: "Sun · 15:20", firm: DEMO_FIRMS[1].name, actor: "ops.marco", action: "Provision · Harbor RCIC Desk minted", kind: "Provision", before: "—", after: "Tenancy + consultant-owner seed", surface: "Provision" },
];

const ACTORS = ["All actors", "ops.lena", "ops.marco", "founder", "support.kai"];
const OPERATIONS = ["All operations", "Publish version", "Bind packs", "Kill-switch", "Escrow terms", "Provision", "Activation", "Support"];

export function AuditTrailModule() {
  const [firmFilter, setFirmFilter] = useState("All firms");
  const [actorFilter, setActorFilter] = useState("All actors");
  const [opFilter, setOpFilter] = useState("All operations");
  const [selected, setSelected] = useState<typeof EVENTS[0] | null>(null);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      EVENTS.filter((ev) => {
        if (firmFilter !== "All firms" && ev.firm !== firmFilter) return false;
        if (actorFilter !== "All actors" && ev.actor !== actorFilter) return false;
        if (opFilter !== "All operations" && ev.kind !== opFilter) return false;
        return true;
      }),
    [firmFilter, actorFilter, opFilter],
  );

  const filterChips = [
    firmFilter !== "All firms" ? { label: "Firm", value: firmFilter } : null,
    actorFilter !== "All actors" ? { label: "Actor", value: actorFilter } : null,
    opFilter !== "All operations" ? { label: "Operation", value: opFilter } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const columns: ColumnsType<typeof EVENTS[0]> = [
    { title: "Action", dataIndex: "action", key: "action", ellipsis: true },
    { title: "Kind", dataIndex: "kind", key: "kind", width: 110, render: (k) => <StatusTag label={k} /> },
    {
      title: "Surface",
      dataIndex: "surface",
      key: "surface",
      width: 160,
      render: (s) => <Tag color="processing">{s}</Tag>,
    },
    { title: "When", dataIndex: "at", key: "at", width: 110 },
  ];

  return (
    <ModulePage title="Audit trail" surface="Audit trail">
      <Space wrap style={{ marginBottom: 12 }}>
        <Surface label="Firm filter">
          <Select
            size="small"
            value={firmFilter}
            onChange={setFirmFilter}
            style={{ width: 180 }}
            options={[
              { value: "All firms", label: "All firms" },
              ...DEMO_FIRMS.map((f) => ({ value: f.name, label: f.name })),
              { value: "House-global", label: "House-global" },
            ]}
          />
        </Surface>
        <Surface label="Actor filter">
          <Select size="small" value={actorFilter} onChange={setActorFilter} style={{ width: 140 }} options={ACTORS.map((a) => ({ value: a, label: a }))} />
        </Surface>
        <Surface label="Operation filter">
          <Select size="small" value={opFilter} onChange={setOpFilter} style={{ width: 160 }} options={OPERATIONS.map((o) => ({ value: o, label: o }))} />
        </Surface>
      </Space>

      {filterChips.length > 0 ? (
        <Surface label="Filter chips">
          <Space wrap style={{ marginBottom: 12 }}>
            {filterChips.map((chip) => (
              <Tag key={chip.label}>{chip.label}: {chip.value}</Tag>
            ))}
          </Space>
        </Surface>
      ) : null}

      <Surface label="Change event list">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={false}
          onRow={(row) => ({
            onClick: () => {
              setSelected(row);
              setJumpNote(null);
            },
          })}
        />
      </Surface>

      <Modal
        title="Change event"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={
          <Space>
            <Button
              data-register-surface="Jump to affected surface"
              onClick={() =>
                selected &&
                setJumpNote(
                  `Jump to ${selected.surface}${selected.firm !== "House-global" ? ` · firm ${selected.firm}` : ""}`,
                )
              }
            >
              Jump to {selected?.surface}
            </Button>
            <Button onClick={() => setSelected(null)}>Close</Button>
          </Space>
        }
      >
        {selected ? (
          <Surface label="Change event">
            <dl style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, fontSize: 13 }}>
              <dt>When</dt><dd>{selected.at}</dd>
              <dt>Firm</dt><dd>{selected.firm}</dd>
              <dt>Actor</dt><dd>{selected.actor}</dd>
              <dt>Surface</dt><dd>{selected.surface}</dd>
              <dt>Before</dt><dd>{selected.before}</dd>
              <dt>After</dt><dd>{selected.after}</dd>
              <dt>Operation</dt><dd>{selected.action}</dd>
            </dl>
            <Surface label="Affected-surface chips" style={{ marginTop: 12 }}>
              <Space wrap>
                <Tag color="processing">{selected.surface}</Tag>
                <Tag>{selected.firm}</Tag>
                <Tag>{selected.actor}</Tag>
              </Space>
            </Surface>
            {jumpNote ? <div style={{ marginTop: 8, color: "#1677ff" }}>{jumpNote}</div> : null}
          </Surface>
        ) : null}
      </Modal>
    </ModulePage>
  );
}
