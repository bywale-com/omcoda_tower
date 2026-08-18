import { useMemo, useState } from "react";
import { Empty, Table, Tag, Typography } from "antd";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { COLLECTIBLE_FIELDS } from "../../../../data/collectibleFields";

type WriteRow = { table: string; id: string; contact_id?: string | null; [key: string]: unknown };

function writesFromNode(data: WorkflowNodeData): WriteRow[] {
  const out = data.lastOutput as Record<string, unknown> | null | undefined;
  if (!out) return [];
  const raw = out.writes;
  if (Array.isArray(raw)) {
    return raw.filter((row): row is WriteRow => Boolean(row && typeof row === "object" && "table" in row && "id" in row));
  }
  return [];
}

function latticeClasses(data: WorkflowNodeData): { key: string; label: string; rows: unknown }[] {
  const out = (data.lastOutput ?? {}) as Record<string, unknown>;
  const classes: { key: string; label: string; rows: unknown }[] = [];
  if (out.headline) classes.push({ key: "headline", label: "Headline", rows: out.headline });
  if (out.pass != null) classes.push({ key: "pass", label: "Pass / fail", rows: out.pass });
  if (out.nudge) classes.push({ key: "nudge", label: "Re-engagement", rows: out.nudge });
  if (out.reactivation) classes.push({ key: "reactivation", label: "Reactivation", rows: out.reactivation });
  if (out.recommendedServices) {
    classes.push({ key: "services", label: "Recommended services", rows: out.recommendedServices });
  }
  const required = out.requiredData ?? out.listing;
  if (required) classes.push({ key: "required", label: "Required data", rows: required });
  return classes;
}

export function OutputPane({ data }: { data: WorkflowNodeData }) {
  const writes = writesFromNode(data);
  const grouped = useMemo(() => {
    const map = new Map<string, WriteRow[]>();
    for (const row of writes) {
      const list = map.get(row.table) ?? [];
      list.push(row);
      map.set(row.table, list);
    }
    return [...map.entries()].map(([table, rows]) => ({ table, rows }));
  }, [writes]);
  const lattice = latticeClasses(data);
  const chips = [
    ...grouped.map((row) => ({ key: `write:${row.table}`, label: row.table, kind: "write" as const, rows: row.rows })),
    ...lattice.map((row) => ({ key: `class:${row.key}`, label: row.label, kind: "class" as const, rows: row.rows })),
  ];
  const [selected, setSelected] = useState<string | null>(chips[0]?.key ?? null);
  const active = chips.find((row) => row.key === (selected ?? chips[0]?.key));

  if (chips.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />;
  }

  const requiredRows = Array.isArray(active?.rows)
    ? (active?.rows as unknown[])
    : typeof active?.rows === "object" && active?.rows != null
      ? [active.rows]
      : active?.rows != null
        ? [{ value: active.rows }]
        : [];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {chips.map((chip) => (
          <Tag
            key={chip.key}
            color={chip.key === (selected ?? chips[0]?.key) ? "blue" : undefined}
            style={{ cursor: "pointer", padding: "4px 10px" }}
            onClick={() => setSelected(chip.key)}
          >
            {chip.label}
          </Tag>
        ))}
      </div>
      {active?.key === "class:required" && Array.isArray(active.rows) ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(_, index) => String(index)}
          dataSource={(active.rows as string[]).map((id) => {
            const field = COLLECTIBLE_FIELDS.find((row) => row.id === id || row.path === id);
            return {
              id,
              label: field?.label ?? id,
              capture: field?.capture === "self_reportable" ? "form" : "never a form",
            };
          })}
          columns={[
            { title: "Field", dataIndex: "label" },
            {
              title: "",
              dataIndex: "capture",
              width: 140,
              render: (value: string) =>
                value === "form" ? <Tag color="blue">form</Tag> : <Typography.Text type="secondary">never a form</Typography.Text>,
            },
          ]}
        />
      ) : (
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 360,
          }}
        >
          {JSON.stringify(requiredRows, null, 2)}
        </pre>
      )}
    </div>
  );
}
