/**
 * Configuration libraries — Evaluation packs / Automation workflows / Engagement templates.
 * Libraries nav → catalog → editor/canvas → Publish version (drafts omitted from Bind).
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Tokens } from "../../../components/tokens";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  type ConfigPack,
  type PackKind,
  nextVersionId,
  packLabel,
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
  surfaceBlock,
} from "./operatorChrome";

export type ConfigLibSub =
  | "Evaluation packs"
  | "Automation workflows"
  | "Engagement templates";

const CONFIG_LIB_SUBS: { id: ConfigLibSub; kind: PackKind; newLabel: string }[] = [
  { id: "Evaluation packs", kind: "evaluation", newLabel: "New pack" },
  { id: "Automation workflows", kind: "automation", newLabel: "New workflow" },
  { id: "Engagement templates", kind: "engagement", newLabel: "New template" },
];

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
  focusedEntry,
  hoveredId,
  sub,
  onSubChange,
}: {
  t: Tokens;
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

  const catalog = useMemo(
    () => packs.filter((p) => p.kind === subMeta.kind),
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
      const nodes = ["Trigger · import landed", "Rule · verdict reachable", "Action · enroll template"];
      return (
        <>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textMuted }}>
            Trigger → conditions/rules → actions (including enroll into engagement template).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nodes.map((node, i) => (
              <div
                key={node}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 10px",
                  background: t.bgPrimary,
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: t.accentBg,
                    color: t.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: t.textPrimary }}>{node}</span>
              </div>
            ))}
          </div>
          <label style={{ marginTop: 10 }}>
            <span style={fieldLabel}>Workflow label</span>
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
        </>
      );
    }

    const steps = ["Opt-in message", "Nudge · channel A", "Meeting invite", "Loop-closer"];
    return (
      <>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textMuted }}>
          Ordered channel + copy steps — opt-in, nudge, reactivation composites.
        </p>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {steps.map((step, i) => (
            <li
              key={step}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "7px 10px",
                background: t.bgPrimary,
                border: `1px solid ${i === 0 ? t.accent : t.border}`,
                borderRadius: 4,
                fontSize: 12,
                color: t.textPrimary,
              }}
            >
              <span style={{ color: t.textDim, fontWeight: 600 }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <label style={{ marginTop: 10 }}>
          <span style={fieldLabel}>Template label</span>
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
      </>
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
                {item.id}
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
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  {sub} catalog
                </span>
                <button type="button" onClick={onNew} style={secondaryBtnStyle(t)}>
                  {subMeta.newLabel}
                </button>
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
                    <span data-register-surface="Published / Draft status" style={{ display: "inline-flex", gap: 4 }}>
                      {statusChip(
                        t,
                        pack.status,
                        pack.status === "Published" ? "success" : "amber",
                      )}
                      {pack.versionId ? (
                        <span style={{ fontSize: 10, color: t.textDim }}>{pack.versionId}</span>
                      ) : null}
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
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
                  <button
                    type="button"
                    data-register-surface="Publish version"
                    disabled={!selected}
                    onClick={onPublish}
                    style={primaryBtnStyle(t, !selected)}
                  >
                    Publish version
                  </button>
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
    </RegisterSurfaceMount>
  );
}
