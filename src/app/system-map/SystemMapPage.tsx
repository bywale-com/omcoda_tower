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
import { SYSTEM_MAP_MODEL, cloneEditableRules, getNode, resolutionReport } from "./data/model";
import { runCoverageChecks, coverageSummary } from "./data/coverage";
import type { MapRule } from "./data/types";
import { layoutPositions, layoutSubMap } from "./canvas/layout";
import { SYSTEM_MAP_NODE_TYPE, SystemMapNodeView, type SystemMapNodeData } from "./canvas/SystemMapNode";
import { FACLESS_FIRE_PRESETS, simulateCascade } from "./sim/engine";

const nodeTypes = { [SYSTEM_MAP_NODE_TYPE]: SystemMapNodeView };

export function SystemMapPage() {
  const report = useMemo(() => resolutionReport(), []);
  const coverage = useMemo(() => coverageSummary(runCoverageChecks(SYSTEM_MAP_MODEL)), []);
  const [rules, setRules] = useState<Record<string, MapRule>>(() => cloneEditableRules());
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subMapId, setSubMapId] = useState<string | null>(null);
  const [cascadeLog, setCascadeLog] = useState<string[]>([]);

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
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
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

  const activeSub = SYSTEM_MAP_MODEL.subMaps.find((s) => s.id === subMapId);
  const subLayout = useMemo(
    () => (activeSub ? layoutSubMap(activeSub.nodes.length) : []),
    [activeSub],
  );
  const subNodes: Node[] = useMemo(() => {
    if (!activeSub) return [];
    return activeSub.nodes.map((n, i) => ({
      id: n.id,
      type: SYSTEM_MAP_NODE_TYPE,
      position: subLayout[i] ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        holds: n.kind + (n.ruleIds?.length ? ` · rules: ${n.ruleIds.join(", ")}` : ""),
        faceless: Boolean(n.faceless),
        lit: false,
        hasSubMap: false,
        resolution: "corpus-full" as const,
      } satisfies SystemMapNodeData,
    }));
  }, [activeSub, subLayout]);

  const subEdges: Edge[] = useMemo(() => {
    if (!activeSub) return [];
    return activeSub.edges.map((e) => {
      const rule = e.ruleId ? rules[e.ruleId] : undefined;
      const ruleHint =
        rule?.kind === "threshold"
          ? ` (${rule.value}${rule.notes ? " " + rule.notes : ""})`
          : rule?.kind === "precedence" && rule.value === false
            ? " [OFF]"
            : "";
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: `${e.label ?? ""}${ruleHint}`,
        style: {
          stroke: rule?.kind === "precedence" && rule.value === false ? "#555" : "#c45c26",
          strokeDasharray: "4 3",
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#c45c26", width: 12, height: 12 },
        labelStyle: { fill: "#9aa0a6", fontSize: 9 },
      };
    });
  }, [activeSub, rules]);

  const selected = selectedId ? getNode(selectedId) : undefined;

  const fire = useCallback(
    (originNodeId: string, label: string) => {
      const steps = simulateCascade(originNodeId, rules);
      setLit(new Set(steps.map((s) => s.nodeId)));
      setCascadeLog(
        steps.map((s, i) => `${i}. ${s.nodeId}${s.viaEdgeId ? ` ← ${s.viaEdgeId}` : " (origin)"}`),
      );
      setSelectedId(originNodeId);
      setSubMapId(null);
      void label;
    },
    [rules],
  );

  const updateRule = (ruleId: string, value: string | number | boolean) => {
    setRules((prev) => ({
      ...prev,
      [ruleId]: { ...prev[ruleId], value },
    }));
  };

  const showingSub = Boolean(activeSub);

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
          <div style={{ fontSize: 15, fontWeight: 700 }}>Interactive System Map</div>
          <div style={{ fontSize: 11, color: "#9aa0a6", marginTop: 2 }}>
            Machine only — no faces · {report.nodeCount} nodes · {report.facelessCount} faceless ★ ·{" "}
            {report.fractalParents.length} fractal interiors · coverage bugs: {coverage.bugs.length}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FACLESS_FIRE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => fire(p.originNodeId, p.label)}
              style={btnStyle}
            >
              {p.label}
            </button>
          ))}
          <button type="button" onClick={() => { setLit(new Set()); setCascadeLog([]); }} style={btnStyle}>
            Clear cascade
          </button>
          {showingSub ? (
            <button type="button" onClick={() => setSubMapId(null)} style={{ ...btnStyle, borderColor: "#e8a35a" }}>
              ↑ Top map
            </button>
          ) : null}
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ReactFlow
            nodes={showingSub ? subNodes : topNodes}
            edges={showingSub ? subEdges : topEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            onNodeClick={(_, node) => {
              if (showingSub) return;
              setSelectedId(node.id);
              const mapNode = getNode(node.id);
              if (mapNode?.subMapId) setSubMapId(mapNode.subMapId);
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

        <aside
          style={{
            width: 360,
            borderLeft: "1px solid #2a2e36",
            overflow: "auto",
            padding: 14,
            background: "#111318",
          }}
        >
          <section style={{ marginBottom: 16 }}>
            <h2 style={h2}>Resolution</h2>
            <p style={p}>
              Corpus-full: {report.corpusFull.length} · Named-silent: {report.namedSilent.length}
            </p>
            <details>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "#9aa0a6" }}>
                Named-silent nodes
              </summary>
              <ul style={{ fontSize: 11, color: "#9aa0a6", paddingLeft: 16 }}>
                {report.namedSilent.map((n) => (
                  <li key={n.id} style={{ marginBottom: 6 }}>
                    <code>{n.id}</code>
                    {n.silences.length ? ` — ${n.silences.join("; ")}` : ""}
                  </li>
                ))}
              </ul>
            </details>
            {coverage.bugs.length ? (
              <div style={{ marginTop: 8, color: "#e07070", fontSize: 11 }}>
                Coverage bugs:
                <ul>
                  {coverage.bugs.map((b) => (
                    <li key={b.nodeId + b.code}>
                      {b.nodeId}: {b.detail}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p style={{ ...p, color: "#6fbf73" }}>Coverage checks: no bugs</p>
            )}
          </section>

          {cascadeLog.length ? (
            <section style={{ marginBottom: 16 }}>
              <h2 style={h2}>Cascade</h2>
              <ol style={{ fontSize: 11, color: "#e8a35a", paddingLeft: 18, margin: 0 }}>
                {cascadeLog.map((line) => (
                  <li key={line}>{line}</li>
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
              <p style={{ ...p, color: "#6b7280" }}>
                systems: {selected.systems.join(", ")} · resolution: {selected.resolution}
              </p>
              {selected.subMapId ? (
                <button
                  type="button"
                  style={{ ...btnStyle, marginBottom: 10 }}
                  onClick={() => setSubMapId(selected.subMapId!)}
                >
                  Open interior (fractal)
                </button>
              ) : null}

              <h3 style={h3}>Transitions (Δ)</h3>
              <ul style={ul}>
                {selected.transitions.map((t) => (
                  <li key={t.id}>
                    [{t.origin}] {t.label}
                  </li>
                ))}
              </ul>

              <h3 style={h3}>Ramifications (⇒)</h3>
              <ul style={ul}>
                {selected.ramifications.map((r) => (
                  <li key={r.id}>
                    {r.label}
                    {r.toNodeId ? ` → ${r.toNodeId}` : ""}
                  </li>
                ))}
              </ul>

              <h3 style={h3}>Rules (editable thresholds / precedence)</h3>
              {selected.rules.length === 0 ? (
                <p style={p}>No contained rules.</p>
              ) : (
                <ul style={{ ...ul, listStyle: "none", paddingLeft: 0 }}>
                  {selected.rules.map((r) => {
                    const live = rules[r.id] ?? r;
                    return (
                      <li
                        key={r.id}
                        style={{
                          marginBottom: 10,
                          padding: 8,
                          border: "1px solid #2a2e36",
                          borderRadius: 4,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{live.label}</div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                          {live.kind} · {live.source} · {live.resolution}
                        </div>
                        {live.editable && live.kind === "threshold" ? (
                          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, fontSize: 11 }}>
                            value
                            <input
                              type="number"
                              value={Number(live.value)}
                              onChange={(e) => updateRule(r.id, Number(e.target.value))}
                              style={{
                                width: 72,
                                background: "#0d0f12",
                                border: "1px solid #3a3f4b",
                                color: "#e8eaed",
                                borderRadius: 3,
                                padding: "2px 6px",
                              }}
                            />
                            <span style={{ color: "#9aa0a6" }}>{live.notes}</span>
                          </label>
                        ) : null}
                        {live.editable && live.kind === "precedence" ? (
                          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, fontSize: 11 }}>
                            <input
                              type="checkbox"
                              checked={Boolean(live.value)}
                              onChange={(e) => updateRule(r.id, e.target.checked)}
                            />
                            enabled in sim
                          </label>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {selected.silences?.length ? (
                <>
                  <h3 style={h3}>Silences</h3>
                  <ul style={ul}>
                    {selected.silences.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ) : (
            <p style={p}>Select a node. ★ = faceless origin. Double-purpose click opens fractal interior when present.</p>
          )}

          {showingSub && activeSub ? (
            <section style={{ marginTop: 16, borderTop: "1px solid #2a2e36", paddingTop: 12 }}>
              <h2 style={h2}>Interior: {activeSub.title}</h2>
              <p style={p}>
                Threshold edges show live rule values from the parent node. Toggle rules on the parent
                (select parent on top map) then re-open interior.
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
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

const h2: CSSProperties = { fontSize: 13, margin: "0 0 6px", fontWeight: 700 };
const h3: CSSProperties = { fontSize: 11, margin: "12px 0 4px", fontWeight: 700, color: "#9aa0a6" };
const p: CSSProperties = { fontSize: 11, color: "#9aa0a6", margin: "0 0 8px", lineHeight: 1.4 };
const ul: CSSProperties = { fontSize: 11, color: "#c4c7cc", margin: 0, paddingLeft: 16, lineHeight: 1.45 };
