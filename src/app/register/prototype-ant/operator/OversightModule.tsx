/**
 * Oversight — fleet health Table, unhealthy count, firm row selection.
 */
import { useMemo, useState } from "react";
import { Alert, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { chipTone, StatusTag } from "./operatorAntTags";

const FLEET_ROWS = [
  { firmId: DEMO_FIRMS[0].id, deliverability: "Healthy", sequence: "Healthy", engagement: "Watch", lastRun: "Today · 14:02" },
  { firmId: DEMO_FIRMS[1].id, deliverability: "Healthy", sequence: "Watch", engagement: "Watch", lastRun: "Today · 13:48" },
  { firmId: DEMO_FIRMS[2].id, deliverability: "Healthy", sequence: "Healthy", engagement: "Healthy", lastRun: "Today · 12:15" },
  { firmId: DEMO_FIRMS[3].id, deliverability: "Watch", sequence: "At risk", engagement: "At risk", lastRun: "Today · 11:52" },
];

function isUnhealthy(row: typeof FLEET_ROWS[0]) {
  return row.deliverability !== "Healthy" || row.sequence !== "Healthy" || row.engagement !== "Healthy";
}

export function OversightModule() {
  const [sortBy, setSortBy] = useState("Last run");
  const [healthFilter, setHealthFilter] = useState("All signals");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = [...FLEET_ROWS];
    if (healthFilter === "Unhealthy only") list = list.filter(isUnhealthy);
    if (sortBy === "Firm name") {
      list.sort((a, b) => {
        const fa = DEMO_FIRMS.find((f) => f.id === a.firmId)!.name;
        const fb = DEMO_FIRMS.find((f) => f.id === b.firmId)!.name;
        return fa.localeCompare(fb);
      });
    }
    return list;
  }, [sortBy, healthFilter]);

  const unhealthyCount = FLEET_ROWS.filter(isUnhealthy).length;
  const selected = selectedId ? DEMO_FIRMS.find((f) => f.id === selectedId) : null;
  const selectedRow = selectedId ? FLEET_ROWS.find((r) => r.firmId === selectedId) : null;

  const columns: ColumnsType<typeof FLEET_ROWS[0]> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, row) => {
        const firm = DEMO_FIRMS.find((f) => f.id === row.firmId)!;
        return (
          <span data-register-surface="Firm row">
            <strong>{firm.name}</strong>
            <div style={{ fontSize: 11, color: "#888" }}>{firm.stage}</div>
          </span>
        );
      },
    },
    {
      title: "Deliverability",
      dataIndex: "deliverability",
      key: "deliverability",
      render: (v) => <StatusTag label={v} color={chipTone(v)} />,
    },
    {
      title: "Sequence",
      dataIndex: "sequence",
      key: "sequence",
      render: (v) => <StatusTag label={v} color={chipTone(v)} />,
    },
    {
      title: "Engagement",
      dataIndex: "engagement",
      key: "engagement",
      render: (v) => <StatusTag label={v} color={chipTone(v)} />,
    },
    { title: "Last run", dataIndex: "lastRun", key: "lastRun", width: 120 },
  ];

  return (
    <ModulePage
      title="Oversight"
      surface="Oversight"
      extra={
        <Space wrap>
          <span data-register-surface="Unhealthy firm count">
            <StatusTag
              label={`${unhealthyCount} unhealthy`}
              color={unhealthyCount > 0 ? "error" : "success"}
            />
          </span>
          <Select size="small" value={sortBy} onChange={setSortBy} options={[{ value: "Last run", label: "Last run" }, { value: "Firm name", label: "Firm name" }]} />
          <Select
            size="small"
            value={healthFilter}
            onChange={setHealthFilter}
            options={[{ value: "All signals", label: "All signals" }, { value: "Unhealthy only", label: "Unhealthy only" }]}
          />
        </Space>
      }
    >
      <Surface label="Fleet health">
        <Table
          size="small"
          rowKey="firmId"
          columns={columns}
          dataSource={rows}
          pagination={false}
          onRow={(row) => ({
            onClick: () => setSelectedId(row.firmId),
            style: { cursor: "pointer", background: row.firmId === selectedId ? "#e6f4ff" : undefined },
          })}
        />
        {selected && selectedRow && isUnhealthy(selectedRow) ? (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            showIcon
            message={`Drill cue · ${selected.name}`}
            description="Open Firm health for Sequence health, Engagement health, and Sequence detail (firm scope preserved)."
          />
        ) : null}
      </Surface>
    </ModulePage>
  );
}
