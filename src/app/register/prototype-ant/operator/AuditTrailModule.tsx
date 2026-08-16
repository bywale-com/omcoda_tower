/**
 * Audit trail — filters, change event Table, detail Modal, jump chips.
 * Firm filter = session/real firms; empty trail when auditTrail has no events
 * (never DEMO_AUDIT densification).
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Modal, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useOperatorNav } from "../../prototype/operatorNav";
import {
  loadAuditTrailEvents,
  type AuditTrailUiEvent,
} from "../../prototype/operator/operatorWireHelpers";
import { useWireTick } from "../../../wire";
import { ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";
import {
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

export function AuditTrailModule() {
  const { jumpTo } = useOperatorNav();
  const tick = useWireTick();
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const [events, setEvents] = useState<AuditTrailUiEvent[]>([]);
  const [firmFilter, setFirmFilter] = useState("All firms");
  const [actorFilter, setActorFilter] = useState("All actors");
  const [opFilter, setOpFilter] = useState("All operations");
  const [selected, setSelected] = useState<AuditTrailUiEvent | null>(null);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then(async (nextFirms) => {
      if (cancelled) return;
      setFirms(nextFirms);
      const rows = await loadAuditTrailEvents(nextFirms);
      if (!cancelled) setEvents(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const actors = useMemo(() => {
    const set = new Set(events.map((e) => e.actor));
    return ["All actors", ...Array.from(set).sort()];
  }, [events]);

  const operations = useMemo(() => {
    const set = new Set(events.map((e) => e.kind));
    return ["All operations", ...Array.from(set).sort()];
  }, [events]);

  const filtered = useMemo(
    () =>
      events.filter((ev) => {
        if (firmFilter !== "All firms" && ev.firm !== firmFilter) return false;
        if (actorFilter !== "All actors" && ev.actor !== actorFilter) return false;
        if (opFilter !== "All operations" && ev.kind !== opFilter) return false;
        return true;
      }),
    [events, firmFilter, actorFilter, opFilter],
  );

  const filterChips = [
    firmFilter !== "All firms" ? { label: "Firm", value: firmFilter } : null,
    actorFilter !== "All actors" ? { label: "Actor", value: actorFilter } : null,
    opFilter !== "All operations" ? { label: "Operation", value: opFilter } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const columns: ColumnsType<AuditTrailUiEvent> = [
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
              ...firms.map((f) => ({ value: f.name, label: f.name })),
              { value: "House-global", label: "House-global" },
            ]}
          />
        </Surface>
        <Surface label="Actor filter">
          <Select
            size="small"
            value={actorFilter}
            onChange={setActorFilter}
            style={{ width: 140 }}
            options={actors.map((a) => ({ value: a, label: a }))}
          />
        </Surface>
        <Surface label="Operation filter">
          <Select
            size="small"
            value={opFilter}
            onChange={setOpFilter}
            style={{ width: 160 }}
            options={operations.map((o) => ({ value: o, label: o }))}
          />
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
        {filtered.length === 0 ? (
          <Empty description="No audit events" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
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
        )}
      </Surface>

      <Modal
        title="Change event"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={
          <Space>
            <Button
              data-register-surface="Jump to affected surface"
              onClick={() => {
                if (!selected) return;
                const n = `Jump to ${selected.surface}${selected.firm !== "House-global" ? ` · firm ${selected.firm}` : ""}`;
                jumpTo(n);
                setJumpNote(n);
              }}
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
