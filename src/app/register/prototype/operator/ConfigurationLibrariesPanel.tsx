/**
 * Configuration libraries — Evaluation packs / Automation workflows / Engagement templates.
 * Libraries nav → catalog → editor/canvas → Publish version (drafts omitted from Bind).
 * Furnish: Published / Draft chips; densify: Compare versions (view-only, no bind).
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  type ConfigPack,
  type PackKind,
  nextVersionId,
  packLabel,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";
import {
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
} from "./operatorChrome";
import type { Tokens } from "../../../components/tokens";
import { AgentDetailView } from "../../../components/hub/agent/AgentDetailView";
import { AutomationDetailView } from "../../../components/hub/automation/AutomationDetailView";
import { AutomationProvider } from "../../../context/AutomationContext";
import { getAllAgentDefinitions } from "../../../data/agentDefinitions";
import { getAllWorkflowDefinitions } from "../../../data/automationWorkflows";


export type ConfigLibSub =
  | "Evaluation packs"
  | "Automation workflows"
  | "Engagement templates";

const CONFIG_LIB_SUBS: { id: ConfigLibSub; kind: PackKind; newLabel: string; navLabel: string }[] = [
  { id: "Evaluation packs", kind: "evaluation", newLabel: "New pack", navLabel: "Evaluation packs" },
  { id: "Automation workflows", kind: "automation", newLabel: "New workflow", navLabel: "Automations" },
  { id: "Engagement templates", kind: "engagement", newLabel: "New template", navLabel: "Agents" },
];

const DEMO_AUTOMATION_ID = getAllWorkflowDefinitions()[0]?.id ?? "auto-welcome";
const DEMO_AGENT_ID =
  getAllAgentDefinitions().find((a) => a.stepCount > 0)?.id ??
  getAllAgentDefinitions()[0]?.id ??
  "agent-nudge";

const EDITOR_SURFACE: Record<ConfigLibSub, string> = {
  "Evaluation packs": "Evaluation pack editor",
  "Automation workflows": "Workflow canvas",
  "Engagement templates": "Agent / sequence editor",
};

export function resolveConfigLibSub(entry: RegisterSurfaceEntry | null): ConfigLibSub | null {
  if (!entry || entry.module !== "Configuration libraries") return null;
  if (entry.label === "Evaluation packs" || entry.label === "Evaluation pack editor")
    return "Evaluation packs";
  if (
    entry.label === "Automation workflows" ||
    entry.label === "Workflow canvas"
  )
    return "Automation workflows";
  if (
    entry.label === "Engagement templates" ||
    entry.label === "Agent / sequence editor"
  )
    return "Engagement templates";
  if (entry.label === "Configuration libraries") return "Evaluation packs";
  return null;
}

export function ConfigurationLibrariesPanel({
  t,
  isDark,
  focusedEntry,
  hoveredId,
  sub,
  onSubChange,
}: {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
  sub: ConfigLibSub;
  onSubChange: (sub: ConfigLibSub) => void;
}) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Configuration libraries", focusedEntry, hoveredEntry);
  const subMeta = CONFIG_LIB_SUBS.find((s) => s.id === sub)!;

  const [packs, setPacks] = useState<ConfigPack[]>(seedConfigPacks);
  const [selectedId, setSelectedId] = useState<string | null>("eval-alg-v2");
  const [editorNote, setEditorNote] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const catalog = useMemo(
    () => packs.filter((p) => p.kind === subMeta.kind),
    [packs, subMeta.kind],
  );
  const publishedCatalog = useMemo(
    () => publishedPacks(subMeta.kind, packs),
    [packs, subMeta.kind],
  );
  const selected = catalog.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Configuration libraries") return;
    const resolved = resolveConfigLibSub(focusedEntry);
    if (resolved) {
      const kind = CONFIG_LIB_SUBS.find((s) => s.id === resolved)!.kind;
      const first = packs.find((p) => p.kind === kind);
      if (first) setSelectedId(first.id);
    }
  }, [focusedEntry, packs]);

  useEffect(() => {
    const first = catalog[0];
    if (!selectedId || !catalog.some((p) => p.id === selectedId)) {
      setSelectedId(first?.id ?? null);
    }
  }, [sub, catalog, selectedId]);

  function onNew() {
    const id = `${subMeta.kind}-new-${Date.now()}`;
    const pack: ConfigPack = {
      id,
      kind: subMeta.kind,
      name: `Untitled ${subMeta.kind}`,
      versionId: null,
      status: "Draft",
      summary: "Draft — publish to appear in Firm operations bind dropdowns",
    };
    setPacks((prev) => [...prev, pack]);
    setSelectedId(id);
    setEditorNote("");
  }

  function onPublish() {
    if (!selected) return;
    const versionId = nextVersionId(selected.kind, packs);
    setPacks((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, status: "Published", versionId } : p,
      ),
    );
  }

  function openCompare() {
    const a = publishedCatalog[0]?.id ?? "";
    const b = publishedCatalog[1]?.id ?? publishedCatalog[0]?.id ?? "";
    setCompareA(a);
    setCompareB(b);
    setCompareOpen(true);
  }

  const packA = packs.find((p) => p.id === compareA) ?? null;
  const packB = packs.find((p) => p.id === compareB) ?? null;

  const fieldLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    marginBottom: 4,
    display: "block",
  };
  const textInput: CSSProperties = {
    ...filterSelectStyle(t),
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  };

  function editorBody() {
    if (!selected) {
      return (
        <p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>
          Select a row or click {subMeta.newLabel} to open the editor.
        </p>
      );
    }

    if (sub === "Evaluation packs") {
      return (
        <>
          <label>
            <span style={fieldLabel}>Pack name</span>
            <input
              value={selected.name}
              onChange={(e) =>
                setPacks((prev) =>
                  prev.map((p) =>
                    p.id === selected.id ? { ...p, name: e.target.value } : p,
                  ),
                )
              }
              style={textInput}
            />
          </label>
          <label style={{ marginTop: 10 }}>
            <span style={fieldLabel}>Open-box rules / analysis</span>
            <textarea
              value={editorNote || selected.summary}
              onChange={(e) => setEditorNote(e.target.value)}
              rows={4}
              style={{ ...textInput, resize: "vertical", lineHeight: 1.45 }}
            />
          </label>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: t.textDim }}>
            Scores against published Reference data tables — no firm picker on this module.
          </p>
        </>
      );
    }

    if (sub === "Automation workflows") {
      return (
        <div style={{ flex: 1, minHeight: 280, display: "flex", margin: "0 -4px" }}>
          <AutomationProvider>
            <AutomationDetailView automationId={DEMO_AUTOMATION_ID} t={t} isDark={isDark} />
          </AutomationProvider>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, minHeight: 280, display: "flex", margin: "0 -4px" }}>
        <AgentDetailView agentId={DEMO_AGENT_ID} t={t} isDark={isDark} />
      </div>
    );
  }

  const catalogSurface = sub;
  const editorSurface = EDITOR_SURFACE[sub];

  return (
    <RegisterSurfaceMount
      label="Configuration libraries"
      focused={focus.focused && focusedEntry?.label === "Configuration libraries"}
      hovered={hoveredEntry?.label === "Configuration libraries"}
      t={t}
    >
      {panelShell(
        t,
        "Configuration libraries",
        statusChip(t, "house-global"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)} data-register-surface="Libraries nav">
              Libraries
            </div>
            {CONFIG_LIB_SUBS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSubChange(item.id)}
                style={navBtnStyle(t, sub === item.id)}
              >
                {item.navLabel}
              </button>
            ))}
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              data-register-surface={catalogSurface}
              style={{
                flexShrink: 0,
                borderBottom: `1px solid ${t.border}`,
                background: t.bgSecondary,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  {sub} catalog
                </span>
                <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    data-register-surface="Compare versions"
                    disabled={publishedCatalog.length < 1}
                    onClick={openCompare}
                    style={secondaryBtnStyle(t)}
                  >
                    Compare versions
                  </button>
                  <button type="button" onClick={onNew} style={secondaryBtnStyle(t)}>
                    {subMeta.newLabel}
                  </button>
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {catalog.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(pack.id);
                      setEditorNote("");
                    }}
                    style={{
                      ...navBtnStyle(t, pack.id === selectedId),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{pack.name}</span>
                    <span
                      data-register-surface="Published / Draft status"
                      style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
                    >
                      {pack.status === "Published" && pack.versionId
                        ? statusChip(t, `Published · ${pack.versionId}`, "success")
                        : statusChip(t, "Draft", "amber")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 14 }}>
              <RegisterSurfaceMount
                label={editorSurface}
                focused={
                  focus.focused &&
                  (focusedEntry?.label === editorSurface ||
                    focusedEntry?.label === catalogSurface)
                }
                hovered={
                  hoveredEntry?.label === editorSurface ||
                  hoveredEntry?.label === catalogSurface
                }
                t={t}
                style={{
                  flex: "unset",
                  minHeight: 0,
                  border: `1px solid ${t.border}`,
                  borderRadius: 6,
                  background: t.bgSecondary,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    {editorSurface}
                  </span>
                  {selected
                    ? statusChip(
                        t,
                        selected.status,
                        selected.status === "Published" ? "success" : "amber",
                      )
                    : null}
                </div>
                {editorBody()}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    data-register-surface="Publish version"
                    disabled={!selected}
                    onClick={onPublish}
                    style={primaryBtnStyle(t, !selected)}
                  >
                    Publish version
                  </button>
                  {selected?.status === "Published" && selected.versionId ? (
                    <button
                      type="button"
                      data-register-surface="Compare versions"
                      onClick={openCompare}
                      style={secondaryBtnStyle(t)}
                    >
                      Compare versions
                    </button>
                  ) : null}
                  {selected?.versionId ? (
                    <span style={{ fontSize: 11, color: t.textMuted }}>
                      Current · {packLabel(selected)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: t.textDim }}>
                      Primary · draft rows omitted from Bind dropdowns
                    </span>
                  )}
                </div>
              </RegisterSurfaceMount>
            </div>
          </div>
        </div>,
      )}

      {compareOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setCompareOpen(false)}
        >
          <div
            data-register-surface="Compare versions"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 18,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
              Compare versions
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: t.textMuted }}>
              View-only diff of published {sub.toLowerCase()} — does not Bind. Use Firm operations
              bind → Bind packs to pin a version.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <label>
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
                  Version A
                </span>
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  style={{ ...filterSelectStyle(t), width: "100%", minWidth: 0, boxSizing: "border-box" }}
                >
                  {publishedCatalog.map((p) => (
                    <option key={p.id} value={p.id}>{packLabel(p)}</option>
                  ))}
                </select>
              </label>
              <label>
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
                  Version B
                </span>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  style={{ ...filterSelectStyle(t), width: "100%", minWidth: 0, boxSizing: "border-box" }}
                >
                  {publishedCatalog.map((p) => (
                    <option key={p.id} value={p.id}>{packLabel(p)}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[packA, packB].map((pack, i) => (
                <div
                  key={pack?.id ?? i}
                  style={{
                    border: `1px solid ${t.border}`,
                    borderRadius: 6,
                    padding: 12,
                    background: t.bgSecondary,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                    {pack ? packLabel(pack) : "—"}
                  </div>
                  {pack ? statusChip(t, `Published · ${pack.versionId}`, "success") : null}
                  <p style={{ margin: "8px 0 0", fontSize: 11, lineHeight: 1.45, color: t.textMuted }}>
                    {pack?.summary ?? "Select a published version"}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => setCompareOpen(false)} style={secondaryBtnStyle(t)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RegisterSurfaceMount>
  );
}
