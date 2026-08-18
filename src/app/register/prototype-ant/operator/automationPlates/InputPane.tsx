import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { Empty, Input, Segmented, Select, Table, Tag, Typography } from "antd";
import {
  CheckSquareOutlined,
  FontSizeOutlined,
  NumberOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  authoredNodeOutputs,
  listUpstreamDataSources,
  type MappedChip,
  type WorkflowNodeData,
  type WorkflowNodeType,
} from "../../../../data/automationWorkflows";
import { handleTreeTables } from "../../../../data/eventTestContract";
import type { Edge, Node } from "@xyflow/react";
import { PLATE_NODE_TAG } from "./plateChrome";

export const HANDLE_CHIP_MIME = "application/x-tower-handle-chip";

type FieldKind = "string" | "number" | "boolean" | "object" | "array";

function inferKind(value: unknown): FieldKind {
  if (Array.isArray(value)) return "array";
  if (value != null && typeof value === "object") return "object";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

function displayValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `${value.length} rows`;
  return JSON.stringify(value);
}

const KIND_OPTIONS: { value: FieldKind; label: ReactNode }[] = [
  { value: "string", label: <FontSizeOutlined /> },
  { value: "number", label: <NumberOutlined /> },
  { value: "boolean", label: <CheckSquareOutlined /> },
  { value: "object", label: <TableOutlined /> },
  { value: "array", label: <UnorderedListOutlined /> },
];

function TypeControl({ kind }: { kind: FieldKind }) {
  const [value, setValue] = useState<FieldKind>(kind);
  return (
    <Select
      size="small"
      value={value}
      onChange={setValue}
      variant="borderless"
      popupMatchSelectWidth={false}
      options={KIND_OPTIONS}
      style={{ width: 28, padding: 0 }}
      suffixIcon={null}
    />
  );
}

function startChipDrag(event: DragEvent, chip: MappedChip & { origin: string }) {
  event.dataTransfer.setData(HANDLE_CHIP_MIME, JSON.stringify(chip));
  event.dataTransfer.effectAllowed = "copy";
}

function TreeRow({
  name,
  value,
  kind,
  chip,
}: {
  name: string;
  value: unknown;
  kind: FieldKind;
  chip: MappedChip & { origin: string };
}) {
  const preview = displayValue(value);
  return (
    <div
      draggable
      onDragStart={(event) => startChipDrag(event, chip)}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr auto",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        padding: "3px 4px",
        borderRadius: 4,
        cursor: "grab",
      }}
    >
      <TypeControl kind={kind} />
      <Typography.Text style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{name}</Typography.Text>
      <Tag style={{ marginInlineEnd: 0, maxWidth: 240 }} title={preview}>
        {preview}
      </Tag>
    </div>
  );
}

const HIDDEN_KEYS = new Set(["table", "contact_id"]);

export function InputPane({
  nodeId,
  nodes,
  edges,
}: {
  nodeId: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}) {
  const [view, setView] = useState<"schema" | "table" | "json">("schema");
  const [query, setQuery] = useState("");
  const sources = useMemo(() => listUpstreamDataSources(nodeId, nodes, edges), [nodeId, nodes, edges]);
  const hay = query.trim().toLowerCase();

  const trees = useMemo(() => {
    return sources
      .map((source) => {
        const sourceNode = nodes.find((n) => n.id === source.nodeId);
        const payload = source.data ?? (sourceNode ? authoredNodeOutputs(sourceNode) : null);
        const tables = handleTreeTables(payload);
        return { source, payload, tables };
      })
      .filter((row) => {
        if (!hay) return true;
        const blob = JSON.stringify(row.payload ?? {}).toLowerCase();
        return row.source.label.toLowerCase().includes(hay) || blob.includes(hay);
      });
  }, [sources, hay, nodes]);

  if (sources.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Segmented
          value={view}
          onChange={(value) => setView(value as typeof view)}
          options={[
            { label: "Schema", value: "schema" },
            { label: "Table", value: "table" },
            { label: "JSON", value: "json" },
          ]}
        />
        <Input.Search
          placeholder="Search"
          allowClear
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      {view === "json" ? (
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 420,
          }}
        >
          {JSON.stringify(
            Object.fromEntries(trees.map((row) => [row.source.label, row.payload])),
            null,
            2,
          )}
        </pre>
      ) : view === "table" ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(row) => `${row.node}-${row.table}-${row.path}`}
          dataSource={trees.flatMap((row) => {
            if (row.tables.length) {
              return row.tables.flatMap((table) =>
                table.rows.flatMap((item, index) =>
                  Object.entries(item)
                    .filter(([key]) => !HIDDEN_KEYS.has(key))
                    .map(([path, value]) => ({
                      node: row.source.label,
                      table: table.table,
                      path: table.rows.length > 1 ? `${index}.${path}` : path,
                      value: displayValue(value),
                    })),
                ),
              );
            }
            return Object.entries((row.payload as Record<string, unknown>) ?? {}).map(([path, value]) => ({
              node: row.source.label,
              table: "—",
              path,
              value: displayValue(value),
            }));
          })}
          columns={[
            { title: "Node", dataIndex: "node", width: 140 },
            { title: "Table", dataIndex: "table", width: 140 },
            { title: "Field", dataIndex: "path" },
            { title: "Value", dataIndex: "value", ellipsis: true },
          ]}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trees.map(({ source, payload, tables }) => {
            const chip = PLATE_NODE_TAG[source.nodeType as WorkflowNodeType] ?? PLATE_NODE_TAG.action;
            const origin = source.label;
            return (
              <div key={source.nodeId} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10 }}>
                <div
                  draggable
                  onDragStart={(event) =>
                    startChipDrag(event, {
                      fromNodeId: source.nodeId,
                      label: source.label,
                      origin,
                    })
                  }
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "grab" }}
                >
                  <span
                    style={{
                      background: chip.bg,
                      color: chip.color,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "1px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {chip.label}
                  </span>
                  <Typography.Text strong>{source.label}</Typography.Text>
                </div>
                {tables.length === 0 ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    —
                  </Typography.Text>
                ) : (
                  <div style={{ paddingLeft: 4 }}>
                    {tables.map((table) => {
                      const sample = table.rows[0] ?? { table: table.table, id: table.table };
                      const fields = Object.entries(sample).filter(([key]) => !HIDDEN_KEYS.has(key));
                      return (
                        <div key={table.table} style={{ marginBottom: 8 }}>
                          <TreeRow
                            name={table.table}
                            value={table.rows}
                            kind="object"
                            chip={{
                              fromNodeId: source.nodeId,
                              table: table.table,
                              label: table.table,
                              origin,
                            }}
                          />
                          <div style={{ paddingLeft: 12, borderLeft: "2px solid #f0f0f0", marginLeft: 12 }}>
                            {fields.map(([name, value]) => (
                              <TreeRow
                                key={name}
                                name={name}
                                value={value}
                                kind={inferKind(value)}
                                chip={{
                                  fromNodeId: source.nodeId,
                                  table: table.table,
                                  field: name,
                                  id: typeof sample.id === "string" ? sample.id : undefined,
                                  label: `${table.table}.${name}`,
                                  origin,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {tables.length === 0 && payload ? (
                  <div style={{ paddingLeft: 8, borderLeft: "2px solid #f0f0f0" }}>
                    {Object.entries(payload as Record<string, unknown>)
                      .slice(0, 24)
                      .map(([name, value]) => (
                        <TreeRow
                          key={name}
                          name={name}
                          value={value}
                          kind={inferKind(value)}
                          chip={{
                            fromNodeId: source.nodeId,
                            field: name,
                            label: name,
                            origin,
                          }}
                        />
                      ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
