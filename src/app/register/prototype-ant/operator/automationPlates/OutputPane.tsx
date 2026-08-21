import { useMemo, useState } from "react";
import { Empty, Table, Tag } from "antd";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { collectibleLabel } from "../../../../data/collectibleFields";
import {
  handleTreeTables,
  requiredDataKeys,
  writeFolderLabel,
  writesFromHandle,
} from "../../../../data/eventTestContract";

function displayValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

const SKIP = new Set(["table"]);

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
  const hasListingWrites = writesFromHandle(data.lastOutput).some(
    (row) => row.table === "missing_fact_signals",
  );
  if (required && !hasListingWrites) {
    classes.push({ key: "required", label: "Required data", rows: required });
  }
  return classes;
}

export function OutputPane({ data }: { data: WorkflowNodeData }) {
  const writes = writesFromHandle(data.lastOutput);
  const grouped = handleTreeTables(data.lastOutput);
  const lattice = latticeClasses(data);
  const door = (data.lastOutput as { door?: number } | null | undefined)?.door;
  const listing = requiredDataKeys(data.lastOutput);
  const chips = [
    ...grouped.map((row) => ({
      key: `write:${row.table}`,
      label: writeFolderLabel(row.table),
      kind: "write" as const,
      table: row.table,
      rows: row.rows,
    })),
    ...lattice.map((row) => ({
      key: `class:${row.key}`,
      label: row.label,
      kind: "class" as const,
      table: undefined as string | undefined,
      rows: row.rows,
    })),
  ];
  const [selected, setSelected] = useState<string | null>(chips[0]?.key ?? null);
  const active = chips.find((row) => row.key === (selected ?? chips[0]?.key));

  const fieldRows = useMemo(() => {
    if (!active || active.kind !== "write" || !Array.isArray(active.rows)) return [];
    return (active.rows as Array<Record<string, unknown>>).flatMap((item, index) =>
      Object.entries(item)
        .filter(([key]) => !SKIP.has(key))
        .map(([field, value]) => ({
          key: `${index}-${field}`,
          row: index + 1,
          field,
          value: displayValue(value),
        })),
    );
  }, [active]);

  if (chips.length === 0 && writes.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />;
  }

  const showListing =
    (active?.table === "missing_fact_signals" || active?.key === "class:required") && listing.length > 0;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
        {door === 2 ? <Tag>Specimen</Tag> : null}
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
      {showListing ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(_, index) => String(index)}
          dataSource={listing.map((key) => ({
            id: key,
            label: collectibleLabel(key),
          }))}
          columns={[{ title: "Field", dataIndex: "label" }]}
        />
      ) : active?.kind === "write" ? (
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={fieldRows}
          columns={[
            ...(grouped.find((row) => `write:${row.table}` === active.key)?.rows.length ?? 0) > 1
              ? [{ title: "#", dataIndex: "row", width: 48 }]
              : [],
            { title: "Field", dataIndex: "field", width: 180 },
            { title: "Value", dataIndex: "value", ellipsis: true },
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
          {JSON.stringify(active?.rows ?? null, null, 2)}
        </pre>
      )}
    </div>
  );
}
