import { useMemo, useState } from "react";
import { Empty, Input, Segmented, Table, Tag, Typography } from "antd";
import {
  authoredNodeOutputs,
  listUpstreamDataSources,
  type WorkflowNodeData,
  type WorkflowNodeType,
} from "../../../../data/automationWorkflows";
import type { Edge, Node } from "@xyflow/react";
import { PLATE_NODE_TAG } from "./plateChrome";

function flattenRecord(value: unknown, prefix = ""): { path: string; value: string }[] {
  if (value == null) return prefix ? [{ path: prefix, value: "null" }] : [];
  if (typeof value !== "object") {
    return [{ path: prefix || "value", value: String(value) }];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [{ path: prefix || "items", value: "[]" }];
    return value.flatMap((item, index) => flattenRecord(item, prefix ? `${prefix}[${index}]` : `[${index}]`));
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return [{ path: prefix || "object", value: "{}" }];
  return entries.flatMap(([key, child]) => flattenRecord(child, prefix ? `${prefix}.${key}` : key));
}

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

  const filtered = useMemo(() => {
    return sources
      .map((source) => {
        const sourceNode = nodes.find((n) => n.id === source.nodeId);
        const payload =
          source.data ?? (sourceNode ? authoredNodeOutputs(sourceNode) : null);
        const rows = flattenRecord(payload).filter((row) => {
          if (!hay) return true;
          return (
            row.path.toLowerCase().includes(hay) ||
            row.value.toLowerCase().includes(hay) ||
            source.label.toLowerCase().includes(hay)
          );
        });
        return { source, payload, rows };
      })
      .filter((row) => (hay ? row.rows.length > 0 : true));
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
            Object.fromEntries(filtered.map((row) => [row.source.label, row.payload])),
            null,
            2,
          )}
        </pre>
      ) : view === "table" ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(row) => `${row.node}-${row.path}`}
          dataSource={filtered.flatMap((row) =>
            row.rows.map((item) => ({ node: row.source.label, path: item.path, value: item.value })),
          )}
          columns={[
            { title: "Node", dataIndex: "node", width: 140 },
            { title: "Field", dataIndex: "path" },
            { title: "Value", dataIndex: "value", ellipsis: true },
          ]}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(({ source, rows }) => {
            const chip = PLATE_NODE_TAG[source.nodeType as WorkflowNodeType] ?? PLATE_NODE_TAG.action;
            return (
              <div key={source.nodeId} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
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
                {rows.length === 0 ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    —
                  </Typography.Text>
                ) : (
                  <div style={{ paddingLeft: 8, borderLeft: "2px solid #f0f0f0" }}>
                    {rows.slice(0, 40).map((row) => (
                      <div
                        key={row.path}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          fontSize: 12,
                          padding: "2px 0",
                        }}
                      >
                        <Typography.Text style={{ fontFamily: "ui-monospace, monospace" }}>{row.path}</Typography.Text>
                        <Tag style={{ marginInlineEnd: 0, maxWidth: 220 }}>{row.value}</Tag>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
