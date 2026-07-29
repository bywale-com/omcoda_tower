import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, GripVertical, Info, Search } from "lucide-react";
import type { IfBranchOutput } from "../../../data/automationConditions";
import type { NodeDataPayload } from "../../../data/automationNodeRuntime";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { setFieldPathDragData } from "./FieldPathDropInput";

type DataViewMode = "schema" | "table" | "json";

type NodeDataPaneProps = {
  title: string;
  emptyHint: string;
  data: NodeDataPayload | null | undefined;
  t: Tokens;
  /** When true, show run selector + success chrome (output panes). */
  showRunChrome?: boolean;
  /** If node branch output — shows true / false pass-through tabs. */
  branchOutput?: IfBranchOutput;
  /** Upstream sources for Input-by-node switching. */
  sourceOptions?: { id: string; label: string; role?: "direct" | "ancestor" }[];
  selectedSourceId?: string | null;
  onSelectSource?: (id: string) => void;
  /** Enable drag of schema leaf/branch paths into Parameters. */
  enableFieldDrag?: boolean;
};

type SchemaTypeKind = "string" | "number" | "boolean" | "object" | "array" | "null" | "unknown";

function typeKind(value: unknown): SchemaTypeKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}

function typeIcon(kind: SchemaTypeKind): string {
  switch (kind) {
    case "string":
      return "T";
    case "number":
      return "#";
    case "boolean":
      return "✓";
    case "object":
      return "{}";
    case "array":
      return "[]";
    case "null":
      return "∅";
    default:
      return "?";
  }
}

function formatLeafValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function countItems(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value != null && "itemCount" in value) {
    return Number((value as { itemCount: number }).itemCount) || 0;
  }
  if (typeof value === "object" && value != null && Array.isArray((value as { items?: unknown[] }).items)) {
    return (value as { items: unknown[] }).items.length;
  }
  return 1;
}

function resolveViewRoot(data: NodeDataPayload | null | undefined, itemIndex: number): unknown {
  if (!data) return null;
  if (Array.isArray(data.items) && data.items.length > 0) {
    return data.items[Math.min(itemIndex, data.items.length - 1)] ?? null;
  }
  return data;
}

function flattenForTable(value: unknown, prefix = ""): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (value == null || typeof value !== "object") {
    if (prefix) row[prefix] = value;
    return row;
  }
  if (Array.isArray(value)) {
    row[prefix || "value"] = JSON.stringify(value);
    return row;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child != null && typeof child === "object" && !Array.isArray(child)) {
      Object.assign(row, flattenForTable(child, path));
    } else {
      row[path] = child;
    }
  }
  return row;
}

function pullTableRows(data: NodeDataPayload | null | undefined): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data.items)) {
    return data.items.map((item, index) => ({
      item: index + 1,
      ...flattenForTable(item),
    }));
  }
  return [flattenForTable(data)];
}

function SchemaTreeNode({
  name,
  path,
  value,
  depth,
  t,
  defaultExpanded,
  enableFieldDrag,
}: {
  name: string;
  path: string;
  value: unknown;
  depth: number;
  t: Tokens;
  defaultExpanded?: boolean;
  enableFieldDrag?: boolean;
}) {
  const kind = typeKind(value);
  const expandable = kind === "object" || kind === "array";
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2);
  const canDrag = Boolean(enableFieldDrag && path);

  const entries: { key: string; child: unknown }[] = useMemo(() => {
    if (kind === "object" && value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>).map(([key, child]) => ({
        key,
        child,
      }));
    }
    if (kind === "array" && Array.isArray(value)) {
      return value.map((child, index) => ({ key: String(index), child }));
    }
    return [];
  }, [kind, value]);

  return (
    <div>
      <button
        type="button"
        draggable={canDrag}
        onDragStart={(event) => {
          if (!canDrag) return;
          setFieldPathDragData(event, path);
        }}
        onClick={() => expandable && setExpanded((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "3px 0",
          paddingLeft: depth * 14,
          border: "none",
          background: "transparent",
          cursor: canDrag ? "grab" : expandable ? "pointer" : "default",
          textAlign: "left",
        }}
        title={canDrag ? `Drag ${path} into Parameters` : path || name}
      >
        <span style={{ width: 12, flexShrink: 0, color: t.textMuted }}>
          {expandable ? (
            expanded ? <ChevronDown size={12} strokeWidth={2} /> : <ChevronRight size={12} strokeWidth={2} />
          ) : canDrag ? (
            <GripVertical size={11} strokeWidth={2} />
          ) : null}
        </span>
        <span
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 700,
            color: t.textMuted,
            border: `1px solid ${t.border}`,
            background: t.boardPanel,
          }}
          title={kind}
        >
          {typeIcon(kind)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>{name}</span>
        {!expandable && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: t.textMuted,
              maxWidth: "55%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={formatLeafValue(value)}
          >
            {formatLeafValue(value)}
          </span>
        )}
        {expandable && kind === "array" && (
          <span style={{ fontSize: 11, color: t.textMuted }}>
            {Array.isArray(value) ? `${value.length} items` : ""}
          </span>
        )}
      </button>
      {expandable && expanded && (
        <div>
          {entries.map(({ key, child }) => (
            <SchemaTreeNode
              key={`${path}.${key}`}
              name={key}
              path={path ? `${path}.${key}` : key}
              value={child}
              depth={depth + 1}
              t={t}
              defaultExpanded={depth < 1}
              enableFieldDrag={enableFieldDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SchemaTreeView({
  value,
  t,
  enableFieldDrag,
}: {
  value: unknown;
  t: Tokens;
  enableFieldDrag?: boolean;
}) {
  if (value == null) {
    return (
      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        No schema fields
      </p>
    );
  }

  if (typeof value !== "object") {
    return (
      <SchemaTreeNode
        name="value"
        path="value"
        value={value}
        depth={0}
        t={t}
        defaultExpanded
        enableFieldDrag={enableFieldDrag}
      />
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return (
      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        Empty object
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {enableFieldDrag && (
        <p
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ margin: "0 0 8px", color: t.textMuted, fontSize: 10, lineHeight: 1.4 }}
        >
          Drag a field into Parameters to bind its path.
        </p>
      )}
      {entries.map(([key, child]) => (
        <SchemaTreeNode
          key={key}
          name={key}
          path={key}
          value={child}
          depth={0}
          t={t}
          defaultExpanded
          enableFieldDrag={enableFieldDrag}
        />
      ))}
    </div>
  );
}

export function NodeDataPane({
  title,
  emptyHint,
  data,
  t,
  showRunChrome = false,
  branchOutput,
  sourceOptions,
  selectedSourceId,
  onSelectSource,
  enableFieldDrag = false,
}: NodeDataPaneProps) {
  const [mode, setMode] = useState<DataViewMode>("schema");
  const [itemIndex, setItemIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<"true" | "false">("true");

  const branchData = branchOutput?.branches[activeBranch] ?? null;
  const displayData = branchOutput ? branchData : data;

  const itemCount = useMemo(() => {
    if (!displayData) return 0;
    if (typeof displayData === "object" && displayData != null && "itemCount" in displayData) {
      return Number((displayData as { itemCount: number }).itemCount) || 0;
    }
    if (typeof displayData === "object" && displayData != null && Array.isArray((displayData as { items?: unknown[] }).items)) {
      return (displayData as { items: unknown[] }).items.length;
    }
    return displayData ? 1 : 0;
  }, [displayData]);

  const viewRoot = useMemo(
    () => resolveViewRoot(displayData ?? null, itemIndex),
    [displayData, itemIndex],
  );
  const rows = useMemo(() => pullTableRows(displayData ?? null), [displayData]);
  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) keys.add(key);
    }
    return [...keys];
  }, [rows]);

  const filteredJson = useMemo(() => {
    if (!search.trim()) return viewRoot;
    const q = search.trim().toLowerCase();
    const text = JSON.stringify(viewRoot, null, 2).toLowerCase();
    return text.includes(q) ? viewRoot : null;
  }, [viewRoot, search]);

  const trueCount = useMemo(() => countItems(branchOutput?.branches.true), [branchOutput]);
  const falseCount = useMemo(() => countItems(branchOutput?.branches.false), [branchOutput]);

  const modes: { id: DataViewMode; label: string }[] = [
    { id: "schema", label: "Schema" },
    { id: "table", label: "Table" },
    { id: "json", label: "JSON" },
  ];

  const runLabel =
    itemCount > 0
      ? `Run 1 of 1 (${itemCount} item${itemCount === 1 ? "" : "s"})`
      : "Run";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        background: t.bgPrimary,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "10px 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              style={{
                fontSize: DOCS_TREE_LABEL_SIZE,
                fontWeight: 600,
                color: t.textPrimary,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
            {showRunChrome && displayData && (
              <>
                <button
                  type="button"
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className={cn(
                    "tower-chrome-menu-item inline-flex h-6 w-6 items-center justify-center rounded-sm outline-none",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  )}
                  style={{ color: t.textMuted }}
                  aria-label="Search output"
                >
                  <Search size={13} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "tower-chrome-menu-item rounded-sm px-2 py-1 outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: mode === item.id ? t.textPrimary : t.textMuted,
                  background: mode === item.id ? t.hoverBg : "transparent",
                  border: mode === item.id ? `1px solid ${t.border}` : "1px solid transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {sourceOptions && sourceOptions.length > 0 && onSelectSource && (
          <select
            value={selectedSourceId ?? sourceOptions[0]?.id ?? ""}
            onChange={(event) => onSelectSource(event.target.value)}
            style={{
              width: "100%",
              padding: "5px 8px",
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.boardPanel,
              color: t.textPrimary,
              fontSize: 11,
            }}
            aria-label="Input data source node"
          >
            {sourceOptions.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
                {source.role === "ancestor" ? " · earlier" : ""}
              </option>
            ))}
          </select>
        )}

        {branchOutput && (
          <div style={{ display: "flex", gap: 4 }}>
            {(
              [
                { id: "true" as const, label: `True (${trueCount})`, color: t.success },
                { id: "false" as const, label: `False (${falseCount})`, color: t.red },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveBranch(tab.id);
                  setItemIndex(0);
                }}
                className={cn(
                  "tower-chrome-menu-item rounded-sm px-2 py-1 outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: activeBranch === tab.id ? tab.color : t.textMuted,
                  background: activeBranch === tab.id ? t.hoverBg : "transparent",
                  border: `1px solid ${activeBranch === tab.id ? tab.color : t.border}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {showRunChrome && displayData && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {itemCount > 1 ? (
              <select
                value={itemIndex}
                onChange={(event) => setItemIndex(Number(event.target.value))}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: `1px solid ${t.border}`,
                  background: t.boardPanel,
                  color: t.textPrimary,
                  fontSize: 11,
                }}
              >
                {Array.from({ length: itemCount }, (_, index) => (
                  <option key={index} value={index}>
                    Run 1 of 1 · Item {index + 1} of {itemCount}
                  </option>
                ))}
              </select>
            ) : (
              <div
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: `1px solid ${t.border}`,
                  background: t.boardPanel,
                  color: t.textPrimary,
                  fontSize: 11,
                }}
              >
                {runLabel}
              </div>
            )}
            <CheckCircle2 size={14} strokeWidth={2} color={t.green ?? "#22c55e"} />
            <Info size={14} strokeWidth={2} color={t.textMuted} />
          </div>
        )}

        {searchOpen && (
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search fields…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "6px 8px",
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.bgPrimary,
              color: t.textPrimary,
              fontSize: 11,
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
        {!displayData && !branchOutput ? (
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted, lineHeight: 1.45 }}>
            {emptyHint}
          </p>
        ) : branchOutput && !branchData ? (
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted, lineHeight: 1.45 }}>
            No items routed to the {activeBranch} branch.
          </p>
        ) : mode === "json" ? (
          <pre
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.45,
              color: t.textPrimary,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {JSON.stringify(branchOutput ? displayData : data, null, 2)}
          </pre>
        ) : mode === "schema" ? (
          search.trim() && !filteredJson ? (
            <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
              No matching fields
            </p>
          ) : (
            <SchemaTreeView value={viewRoot} t={t} enableFieldDrag={enableFieldDrag} />
          )
        ) : rows.length === 0 ? (
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
            No tabular rows
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      draggable={enableFieldDrag}
                      onDragStart={(event) => {
                        if (!enableFieldDrag) return;
                        setFieldPathDragData(event, col);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "6px 8px",
                        borderBottom: `1px solid ${t.border}`,
                        color: t.textMuted,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: enableFieldDrag ? "grab" : "default",
                      }}
                      title={enableFieldDrag ? `Drag ${col}` : col}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: "6px 8px",
                          borderBottom: `1px solid ${t.borderLight}`,
                          color: t.textPrimary,
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={String(row[col] ?? "")}
                      >
                        {row[col] == null
                          ? "—"
                          : typeof row[col] === "object"
                            ? JSON.stringify(row[col])
                            : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
