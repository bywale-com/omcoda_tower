import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SYSTEM_MAP_MODEL, getNode, resolutionReport } from "./data/model";
import { runCoverageChecks, coverageSummary } from "./data/coverage";
import { cloneTables, TABLE_RELATIONS } from "./data/tables";
import { modularityReport } from "./data/modularity";
import type { MachineTable } from "./data/tableTypes";
import { layoutPositions } from "./canvas/layout";
import { SYSTEM_MAP_NODE_TYPE, SystemMapNodeView, type SystemMapNodeData } from "./canvas/SystemMapNode";
import {
  FACLESS_FIRE_PRESETS,
  FIRM_SEQUENCE_BINDINGS,
  SEQUENCE_TEMPLATES,
  buildAttemptLadderFromTables,
  litNodesFromSteps,
  resolveSequenceForFirm,
  simulateCascadeFromTables,
} from "./sim/engine";
import { CORPUS_SOURCES, NO_LOGIN_CLIENT_VIEW_CHECK } from "./data/corpusSources";
import type { SequenceTemplate } from "./data/tableTypes";

const nodeTypes = { [SYSTEM_MAP_NODE_TYPE]: SystemMapNodeView };

export function SystemMapPage() {
  const report = useMemo(() => resolutionReport(), []);
  const coverage = useMemo(() => coverageSummary(runCoverageChecks(SYSTEM_MAP_MODEL)), []);
  const modBase = useMemo(() => modularityReport(), []);
  const [tables, setTables] = useState<MachineTable[]>(() => cloneTables());
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"top" | "attempt-interior" | "tables" | "templates">("top");
  const [cascadeLog, setCascadeLog] = useState<string[]>([]);
  const [templates, setTemplates] = useState<SequenceTemplate[]>(() =>
    structuredClone(SEQUENCE_TEMPLATES),
  );
  const [resolveClass, setResolveClass] =
    useState<SequenceTemplate["class"]>("reactivation");

  const positions = useMemo(() => layoutPositions(SYSTEM_MAP_MODEL.nodes), []);

  const topNodes: Node<SystemMapNodeData>[] = useMemo(
    () =>
      SYSTEM_MAP_MODEL.nodes.map((n) => ({
        id: n.id,
        type: SYSTEM_MAP_NODE_TYPE,
        position: positions[n.id],
        data: {
          label: n.label,
          holds: n.holds,
          faceless: n.faceless,
          facelessArchetype: n.facelessArchetype,
          lit: lit.has(n.id),
          hasSubMap: Boolean(n.subMapId),
          resolution: n.resolution,
        },
      })),
    [positions, lit],
  );

  const topEdges: Edge[] = useMemo(
    () =>
      SYSTEM_MAP_MODEL.edges.map((e) => {
        const active = lit.has(e.source) && lit.has(e.target);
        const rel = TABLE_RELATIONS.find((r) => r.edgeId === e.id);
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: rel ? `${rel.kind}: ${e.label}` : e.label,
          animated: active && Boolean(e.faceless),
          style: {
            stroke: active ? "#e8a35a" : e.faceless ? "#c45c26" : "#5c6370",
            strokeWidth: active ? 2.5 : e.ring ? 1.5 : 1,
            strokeDasharray: e.faceless ? "6 4" : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: active ? "#e8a35a" : e.faceless ? "#c45c26" : "#5c6370",
          },
          labelStyle: { fill: "#9aa0a6", fontSize: 9 },
        };
      }),
    [lit],
  );

  const ladder = useMemo(() => buildAttemptLadderFromTables(tables), [tables]);
  const attemptNodes: Node[] = useMemo(
    () =>
      ladder.nodes.map((n, i) => ({
        id: n.id,
        type: SYSTEM_MAP_NODE_TYPE,
        position: { x: 40 + i * 220, y: 80 },
        data: {
          label: n.label,
          holds: `token=${n.token} · from seq.channel_ownership_order`,
          faceless: false,
          lit: false,
          hasSubMap: false,
          resolution: "corpus-full" as const,
        } satisfies SystemMapNodeData,
      })),
    [ladder],
  );
  const attemptEdges: Edge[] = useMemo(
    () =>
      ladder.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        style: { stroke: "#c45c26", strokeDasharray: "4 3" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#c45c26", width: 12, height: 12 },
        labelStyle: { fill: "#9aa0a6", fontSize: 9 },
      })),
    [ladder],
  );

  const selected = selectedId ? getNode(selectedId) : undefined;
  const selectedTables = tables.filter((t) => t.nodeId === selectedId);

  const fire = useCallback(
    (originNodeId: string) => {
      const steps = simulateCascadeFromTables(originNodeId, tables);
      setLit(litNodesFromSteps(steps));
      setCascadeLog(
        steps.map(
          (s, i) =>
            `${i}. ${s.tableId} (node ${s.nodeId})${s.note ? ` — ${s.note}` : ""}${
              s.appliedRuleRowIds?.length ? ` · rows[${s.appliedRuleRowIds.join(",")}]` : ""
            }`,
        ),
      );
      setSelectedId(originNodeId);
      setView("top");
    },
    [tables],
  );

  const updateThreshold = (tableId: string, rowId: string, threshold: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              ruleRows: t.ruleRows?.map((r) => (r.id === rowId ? { ...r, threshold } : r)),
            },
      ),
    );
  };

  const toggleRuleRow = (tableId: string, rowId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              ruleRows: t.ruleRows?.map((r) => (r.id === rowId ? { ...r, enabled: !r.enabled } : r)),
            },
      ),
    );
  };

  const moveSequenceItem = (tableId: string, index: number, dir: -1 | 1) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId || !t.sequence) return t;
        const next = [...t.sequence];
        const j = index + dir;
        if (j < 0 || j >= next.length) return t;
        const tmp = next[index];
        next[index] = next[j];
        next[j] = tmp;
        return { ...t, sequence: next };
      }),
    );
  };

  const moveRuleOrd = (tableId: string, rowId: string, dir: -1 | 1) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId || !t.ruleRows) return t;
        const sorted = [...t.ruleRows].sort((a, b) => a.ord - b.ord);
        const i = sorted.findIndex((r) => r.id === rowId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= sorted.length) return t;
        const a = sorted[i];
        const b = sorted[j];
        const swapped = t.ruleRows.map((r) => {
          if (r.id === a.id) return { ...r, ord: b.ord };
          if (r.id === b.id) return { ...r, ord: a.ord };
          return r;
        });
        return { ...t, ruleRows: swapped };
      }),
    );
  };

  const channelSeq = tables.find((t) => t.id === "seq.channel_ownership_order");
  const showingCanvas = view === "top" || view === "attempt-interior";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0d0f12",
        color: "#e8eaed",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #2a2e36",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>System Map v3 — templates + binding</div>
          <div style={{ fontSize: 11, color: "#9aa0a6", marginTop: 2 }}>
            Tables + dumb runtime · {modBase.tableCount} tables · {SEQUENCE_TEMPLATES.length}{" "}
            templates · {FIRM_SEQUENCE_BINDINGS.length} firm bindings · bugs: {modBase.bugs.length} ·
            corpus includes guidelines/
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={view === "top" ? btnOn : btnStyle} onClick={() => setView("top")}>
            Top map
          </button>
          <button
            type="button"
            style={view === "attempt-interior" ? btnOn : btnStyle}
            onClick={() => setView("attempt-interior")}
          >
            Attempt interior (from seq)
          </button>
          <button
            type="button"
            style={view === "tables" ? btnOn : btnStyle}
            onClick={() => setView("tables")}
          >
            Tables / audit
          </button>
          <button
            type="button"
            style={view === "templates" ? btnOn : btnStyle}
            onClick={() => setView("templates")}
          >
            Templates / binding
          </button>
          {FACLESS_FIRE_PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => fire(p.originNodeId)} style={btnStyle}>
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setLit(new Set());
              setCascadeLog([]);
            }}
            style={btnStyle}
          >
            Clear cascade
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {view === "templates" ? (
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <h2 style={h2}>sequence_template (reorder cells = level-1)</h2>
            {templates.map((t) => (
              <div key={t.id} style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>
                  {t.id} · {t.class} · {t.variant}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{t.source}</div>
                {t.silences?.length ? (
                  <div style={{ fontSize: 10, color: "#e8a35a", marginTop: 4 }}>
                    silence: {t.silences.join(" · ")}
                  </div>
                ) : null}
                <ol style={{ fontSize: 11, margin: "8px 0 0", paddingLeft: 18 }}>
                  {t.cells.map((c, i) => (
                    <li key={c.id} style={{ marginBottom: 4 }}>
                      <code>{c.token}</code> [{c.mode}] {c.label}
                      {c.deferredSlots?.length ? (
                        <span style={{ color: "#e8a35a" }}>
                          {" "}
                          · deferred slots: {c.deferredSlots.join(",")}
                        </span>
                      ) : null}{" "}
                      <button
                        type="button"
                        style={btnTiny}
                        onClick={() => {
                          setTemplates((prev) =>
                            prev.map((x) => {
                              if (x.id !== t.id) return x;
                              const cells = [...x.cells];
                              if (i <= 0) return x;
                              const tmp = cells[i - 1];
                              cells[i - 1] = cells[i];
                              cells[i] = tmp;
                              return { ...x, cells };
                            }),
                          );
                        }}
                      >
                        ↑
                      </button>{" "}
                      <button
                        type="button"
                        style={btnTiny}
                        onClick={() => {
                          setTemplates((prev) =>
                            prev.map((x) => {
                              if (x.id !== t.id) return x;
                              const cells = [...x.cells];
                              if (i >= cells.length - 1) return x;
                              const tmp = cells[i + 1];
                              cells[i + 1] = cells[i];
                              cells[i] = tmp;
                              return { ...x, cells };
                            }),
                          );
                        }}
                      >
                        ↓
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <h2 style={{ ...h2, marginTop: 20 }}>firm_sequence_binding (level-2)</h2>
            <ul style={ul}>
              {FIRM_SEQUENCE_BINDINGS.map((b) => (
                <li key={b.id}>
                  <code>{b.firmId}</code> · {b.sequenceClass} → <code>{b.templateId}</code>
                </li>
              ))}
            </ul>

            <h2 style={{ ...h2, marginTop: 20 }}>Resolve instance (dumb runtime)</h2>
            <label style={{ fontSize: 11, display: "flex", gap: 8, alignItems: "center" }}>
              class
              <select
                value={resolveClass}
                onChange={(e) => setResolveClass(e.target.value as SequenceTemplate["class"])}
                style={{ ...inputStyle, width: "auto" }}
              >
                <option value="optin_launch">optin_launch</option>
                <option value="launch_day">launch_day</option>
                <option value="reengagement">reengagement</option>
                <option value="reactivation">reactivation</option>
              </select>
            </label>
            {(() => {
              const inst = resolveSequenceForFirm("firm.demo", resolveClass, templates);
              if (!inst) return <p style={p}>No binding.</p>;
              return (
                <div style={{ ...card, marginTop: 8 }}>
                  <div style={{ fontSize: 11 }}>
                    {inst.firmId} · {inst.templateId} · variant {inst.variant}
                  </div>
                  <ol style={{ fontSize: 11, paddingLeft: 18 }}>
                    {inst.cells.map((c) => (
                      <li key={c.id}>
                        {c.resolvedLabel} · vars: {JSON.stringify(c.boundVariables)}
                      </li>
                    ))}
                  </ol>
                  {inst.silences?.length ? (
                    <div style={{ fontSize: 10, color: "#e8a35a" }}>{inst.silences.join(" · ")}</div>
                  ) : null}
                </div>
              );
            })()}

            <h2 style={{ ...h2, marginTop: 20 }}>No-login client view check</h2>
            <p style={p}>
              Disposition: <code>{NO_LOGIN_CLIENT_VIEW_CHECK.disposition}</code> — foundInCode:{" "}
              {String(NO_LOGIN_CLIENT_VIEW_CHECK.foundInCode)}. {NO_LOGIN_CLIENT_VIEW_CHECK.note}
            </p>

            <h2 style={{ ...h2, marginTop: 20 }}>Corpus sources</h2>
            <ul style={ul}>
              {CORPUS_SOURCES.map((s) => (
                <li key={s.id}>
                  <code>{s.path}</code> — {s.role}
                </li>
              ))}
            </ul>
          </div>
        ) : view === "tables" ? (
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <h2 style={h2}>Modularity audit</h2>
            <p style={p}>
              Coverage faceless bugs: {coverage.bugs.length} · frozen-should-be-table:{" "}
              {modBase.bugs.length} · corpus-full nodes: {report.corpusFull.length}/
              {report.nodeCount}
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#9aa0a6" }}>
                  <th style={th}>table</th>
                  <th style={th}>kind</th>
                  <th style={th}>node</th>
                  <th style={th}>modular</th>
                  <th style={th}>reason / bug</th>
                </tr>
              </thead>
              <tbody>
                {modBase.audit.map((r) => (
                  <tr key={r.tableId} style={{ borderTop: "1px solid #2a2e36" }}>
                    <td style={td}>
                      <code>{r.tableId}</code>
                    </td>
                    <td style={td}>{r.kind}</td>
                    <td style={td}>
                      <code>{r.nodeId}</code>
                    </td>
                    <td style={td}>{r.modular ? "y" : "n"}</td>
                    <td style={td}>
                      {r.bug ? (
                        <span style={{ color: "#e07070" }}>{r.bug}: {r.bugDetail}</span>
                      ) : r.modular ? (
                        "—"
                      ) : (
                        <span style={{ color: "#9aa0a6" }}>
                          {r.structuralReason}: {r.structuralReasonDetail}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ ...h2, marginTop: 24 }}>Structural edit — channel order</h2>
            <p style={p}>Reorder `seq.channel_ownership_order`. Attempt interior + cascade read this list.</p>
            <SequenceEditor table={channelSeq} onMove={moveSequenceItem} />

            <h2 style={{ ...h2, marginTop: 24 }}>Relations (reads / writes / triggers)</h2>
            <ul style={ul}>
              {TABLE_RELATIONS.map((r) => (
                <li key={r.id}>
                  <code>{r.fromTableId}</code> —{r.kind}→ <code>{r.toTableId}</code> · {r.label}
                  {r.faceless ? " ★" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <ReactFlow
              nodes={view === "attempt-interior" ? attemptNodes : topNodes}
              edges={view === "attempt-interior" ? attemptEdges : topEdges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              onNodeClick={(_, node) => {
                if (view !== "top") return;
                setSelectedId(node.id);
                if (node.id === "active_attempt") setView("attempt-interior");
              }}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#2a2e36" />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  const d = n.data as SystemMapNodeData;
                  if (d?.lit) return "#e8a35a";
                  if (d?.facelessArchetype) return "#c45c26";
                  if (d?.faceless) return "#8a4b28";
                  return "#3a3f4b";
                }}
                maskColor="rgba(0,0,0,0.6)"
              />
            </ReactFlow>
          </div>
        )}

        <aside
          style={{
            width: 380,
            borderLeft: "1px solid #2a2e36",
            overflow: "auto",
            padding: 14,
            background: "#111318",
          }}
        >
          <section style={{ marginBottom: 14 }}>
            <h2 style={h2}>v2 law</h2>
            <p style={p}>
              Modifiable → table. Runtime is dumb. Parameter edit + structural edit both re-drive sim.
              Showing canvas: {showingCanvas ? "yes" : "audit"}.
            </p>
          </section>

          {cascadeLog.length ? (
            <section style={{ marginBottom: 14 }}>
              <h2 style={h2}>Cascade (table walk)</h2>
              <ol style={{ fontSize: 10, color: "#e8a35a", paddingLeft: 18, margin: 0 }}>
                {cascadeLog.map((line) => (
                  <li key={line} style={{ marginBottom: 4 }}>
                    {line}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {selected ? (
            <section>
              <h2 style={h2}>
                {selected.label}{" "}
                {selected.faceless ? (
                  <span style={{ color: "#c45c26" }}>{selected.facelessArchetype ? "★★" : "★"}</span>
                ) : null}
              </h2>
              <p style={p}>{selected.holds}</p>

              {selectedTables.map((t) => (
                <div key={t.id} style={{ marginBottom: 14 }}>
                  <h3 style={h3}>
                    {t.kind} table <code>{t.id}</code> {t.modular ? "" : `(wall: ${t.structuralReason})`}
                  </h3>
                  {t.kind === "sequence" && t.sequence ? (
                    <SequenceEditor table={t} onMove={moveSequenceItem} />
                  ) : null}
                  {t.kind === "rule" && t.ruleRows ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {[...t.ruleRows]
                        .sort((a, b) => a.ord - b.ord)
                        .map((r) => (
                          <li key={r.id} style={card}>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{r.label}</div>
                            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                              when: {r.when} · if: {r.condition}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                              <label style={{ fontSize: 11 }}>
                                <input
                                  type="checkbox"
                                  checked={r.enabled}
                                  onChange={() => toggleRuleRow(t.id, r.id)}
                                />{" "}
                                enabled
                              </label>
                              {typeof r.threshold === "number" ? (
                                <label style={{ fontSize: 11 }}>
                                  {r.thresholdUnit}{" "}
                                  <input
                                    type="number"
                                    value={r.threshold}
                                    onChange={(e) =>
                                      updateThreshold(t.id, r.id, Number(e.target.value))
                                    }
                                    style={inputStyle}
                                  />
                                </label>
                              ) : null}
                              <button type="button" style={btnTiny} onClick={() => moveRuleOrd(t.id, r.id, -1)}>
                                ↑
                              </button>
                              <button type="button" style={btnTiny} onClick={() => moveRuleOrd(t.id, r.id, 1)}>
                                ↓
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                  {t.kind === "state" ? (
                    <p style={p}>
                      fields:{" "}
                      {t.stateFields?.map((f) => `${f.label}∈${f.valueDomain}`).join("; ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </section>
          ) : (
            <p style={p}>
              Select a node to edit its tables. Use Tables / audit for the full inventory. Reorder
              channel ladder, then open Attempt interior.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function SequenceEditor({
  table,
  onMove,
}: {
  table?: MachineTable;
  onMove: (tableId: string, index: number, dir: -1 | 1) => void;
}) {
  if (!table?.sequence) return <p style={p}>No sequence table.</p>;
  return (
    <ol style={{ ...ul, listStyle: "decimal", paddingLeft: 20 }}>
      {table.sequence.map((item, i) => (
        <li key={item.id} style={{ marginBottom: 6 }}>
          <code>{item.token}</code> — {item.label}{" "}
          <button type="button" style={btnTiny} onClick={() => onMove(table.id, i, -1)}>
            ↑
          </button>{" "}
          <button type="button" style={btnTiny} onClick={() => onMove(table.id, i, 1)}>
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}

const btnStyle: CSSProperties = {
  background: "#1a1d24",
  border: "1px solid #3a3f4b",
  color: "#e8eaed",
  borderRadius: 4,
  padding: "6px 10px",
  fontSize: 11,
  cursor: "pointer",
};
const btnOn: CSSProperties = { ...btnStyle, borderColor: "#e8a35a", color: "#e8a35a" };
const btnTiny: CSSProperties = { ...btnStyle, padding: "2px 6px", fontSize: 10 };
const inputStyle: CSSProperties = {
  width: 64,
  background: "#0d0f12",
  border: "1px solid #3a3f4b",
  color: "#e8eaed",
  borderRadius: 3,
  padding: "2px 6px",
  marginLeft: 4,
};
const h2: CSSProperties = { fontSize: 13, margin: "0 0 6px", fontWeight: 700 };
const h3: CSSProperties = { fontSize: 11, margin: "10px 0 4px", fontWeight: 700, color: "#9aa0a6" };
const p: CSSProperties = { fontSize: 11, color: "#9aa0a6", margin: "0 0 8px", lineHeight: 1.4 };
const ul: CSSProperties = { fontSize: 11, color: "#c4c7cc", margin: 0, paddingLeft: 16, lineHeight: 1.45 };
const th: CSSProperties = { padding: "6px 8px", fontWeight: 600 };
const td: CSSProperties = { padding: "6px 8px", verticalAlign: "top" };
const card: CSSProperties = {
  marginBottom: 8,
  padding: 8,
  border: "1px solid #2a2e36",
  borderRadius: 4,
};
