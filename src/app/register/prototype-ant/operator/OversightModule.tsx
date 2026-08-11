/**
 * Oversight — fleet health Table, unhealthy count, firm row selection.
 * Fleet from real/session firms or empty — never DEMO_FIRMS Healthy theater.
 */
import { useEffect, useMemo, useState } from "react";
import { Alert, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  loadFleetHealthRows,
  type FleetHealthRow,
} from "../../prototype/operator/operatorWireHelpers";
import { useWireTick } from "../../../wire";
import { ModulePage, Surface } from "../chrome";
import { chipTone, StatusTag } from "./operatorAntTags";
import {
  firmDisplayName,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

function isUnhealthy(row: FleetHealthRow) {
  return row.deliverability !== "Healthy" || row.sequence !== "Healthy" || row.engagement !== "Healthy";
}

export function OversightModule() {
  const tick = useWireTick();
  const [firms, setFirms] = useState<OperatorFirm[]>([]);
  const [fleetRows, setFleetRows] = useState<FleetHealthRow[]>([]);
  const [sortBy, setSortBy] = useState("Last run");
  const [healthFilter, setHealthFilter] = useState("All signals");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then(async (nextFirms) => {
      if (cancelled) return;
      setFirms(nextFirms);
      const rows = nextFirms.length === 0 ? [] : await loadFleetHealthRows(nextFirms);
      if (!cancelled) setFleetRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const rows = useMemo(() => {
    let list = [...fleetRows];
    if (healthFilter === "Unhealthy only") list = list.filter(isUnhealthy);
    if (sortBy === "Firm name") {
      list.sort((a, b) => {
        const fa = firmDisplayName(firms, a.firmId);
        const fb = firmDisplayName(firms, b.firmId);
        return fa.localeCompare(fb);
      });
    }
    return list;
  }, [sortBy, healthFilter, fleetRows, firms]);

  const unhealthyCount = fleetRows.filter(isUnhealthy).length;
  const selected = selectedId ? firms.find((f) => f.id === selectedId) : null;
  const selectedRow = selectedId ? fleetRows.find((r) => r.firmId === selectedId) : null;

  const columns: ColumnsType<FleetHealthRow> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, row) => {
        const name = firmDisplayName(firms, row.firmId);
        const stage = firms.find((f) => f.id === row.firmId)?.stage ?? "—";
        return (
          <span data-register-surface="Firm row">
            <strong>{name}</strong>
            <div style={{ fontSize: 11, color: "#888" }}>{stage}</div>
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
          locale={{ emptyText: "No firms in fleet — provision or select a session firm." }}
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
