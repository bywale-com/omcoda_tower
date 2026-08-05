/**
 * Reference data — Reference tables → edit/import → Publish version modal.
 * Furnish: dual-check / schema-contract / publish-group readiness glance (Confirm gated).
 * Densify: light ingestion stage rail (pipe detect→…→dual-check).
 */
import { useEffect, useMemo, useState } from "react";
import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  formatConstantValue,
  getConstantsForIndustry,
  type AutomationConstantIndustryId,
} from "../../../data/automationConstants";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type TableMeta = {
  id: AutomationConstantIndustryId;
  version: string;
  status: "Published" | "Draft";
  schemaOk: boolean;
  dualCheckOk: boolean;
  publishGroupOk: boolean;
  stage: "detect" | "fetch" | "parse" | "validate" | "draft" | "dual-check" | "ready";
};

const TABLES: TableMeta[] = [
  {
    id: "immigration",
    version: "v2.4",
    status: "Published",
    schemaOk: true,
    dualCheckOk: true,
    publishGroupOk: true,
    stage: "ready",
  },
  {
    id: "legal",
    version: "v0.1",
    status: "Draft",
    schemaOk: true,
    dualCheckOk: false,
    publishGroupOk: true,
    stage: "dual-check",
  },
  {
    id: "financial_services",
    version: "v0.0",
    status: "Draft",
    schemaOk: false,
    dualCheckOk: false,
    publishGroupOk: false,
    stage: "validate",
  },
];

const PIPE_STAGES = [
  "detect",
  "fetch",
  "parse",
  "validate",
  "draft",
  "dual-check",
  "ready",
] as const;

export function ReferenceDataModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Reference data", focusedEntry, hoveredEntry);
  const [tables, setTables] = useState<TableMeta[]>(TABLES);
  const [tableId, setTableId] = useState<AutomationConstantIndustryId>("immigration");
  const [importOpen, setImportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [importFile, setImportFile] = useState("");

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Reference data") return;
    if (
      focusedEntry.label === "Reference tables" ||
      focusedEntry.label === "Import criteria" ||
      focusedEntry.label === "Publish version" ||
      focusedEntry.label === "Dual-check glance" ||
      focusedEntry.label === "Ingestion stage rail"
    ) {
      setTableId("immigration");
    }
    if (focusedEntry.label === "Import criteria" || focusedEntry.label === "Ingestion stage rail") {
      setImportOpen(true);
    }
    if (focusedEntry.label === "Publish version" || focusedEntry.label === "Dual-check glance") {
      setPublishOpen(true);
    }
  }, [focusedEntry]);

  const meta = tables.find((row) => row.id === tableId) ?? tables[0];
  const industry = AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === tableId);
  const rows = useMemo(() => getConstantsForIndustry(tableId).slice(0, 8), [tableId]);
  const publishReady = meta.schemaOk && meta.dualCheckOk && meta.publishGroupOk;

  function onConfirmPublish() {
    if (!publishReady) return;
    const next = (parseFloat(meta.version.replace("v", "")) + 0.1).toFixed(1);
    const version = `v${next}`;
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              version,
              status: "Published" as const,
              schemaOk: true,
              dualCheckOk: true,
              publishGroupOk: true,
              stage: "ready",
            }
          : row,
      ),
    );
    setPublishOpen(false);
    setPublishNotes("");
  }

  function onImport() {
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              status: "Draft" as const,
              schemaOk: true,
              dualCheckOk: false,
              publishGroupOk: row.id !== "financial_services",
              stage: "dual-check",
            }
          : row,
      ),
    );
    setImportOpen(false);
    setImportFile("");
  }

  function advanceStage() {
    const idx = PIPE_STAGES.indexOf(meta.stage);
    if (idx < 0 || idx >= PIPE_STAGES.length - 1) return;
    const next = PIPE_STAGES[idx + 1];
    setTables((prev) =>
      prev.map((row) => {
        if (row.id !== tableId) return row;
        return {
          ...row,
          stage: next,
          schemaOk: next === "validate" || next === "draft" || next === "dual-check" || next === "ready" ? true : row.schemaOk,
          dualCheckOk: next === "ready",
          publishGroupOk: next === "ready" || next === "dual-check" ? true : row.publishGroupOk,
          status: next === "ready" ? row.status : ("Draft" as const),
        };
      }),
    );
  }

  const modalBackdrop = {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  };

  return (
    <RegisterSurfaceMount
      label="Reference data"
      focused={focus.focused && focusedEntry?.label === "Reference data"}
      hovered={hoveredEntry?.label === "Reference data"}
      t={t}
    >
      {panelShell(
        t,
        "Reference data",
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
            <div style={sectionLabelStyle(t)}>Reference tables</div>
            <div data-register-surface="Reference tables">
              {tables.map((row) => {
                const label =
                  AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === row.id)?.label ?? row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setTableId(row.id);
                      setPublishOpen(false);
                      setImportOpen(false);
                    }}
                    style={navBtnStyle(t, row.id === tableId)}
                  >
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                      {row.version} · {row.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>
                  {industry?.label ?? tableId}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                  {industry?.description}
                </div>
              </div>
              {statusChip(
                t,
                `${meta.status} · ${meta.version}`,
                meta.status === "Published" ? "success" : "amber",
              )}
            </div>

            {surfaceBlock(
              t,
              "Ingestion stage rail",
              focus.labelFocused("Ingestion stage rail"),
              focus.labelHovered("Ingestion stage rail"),
              <>
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
                    Ingestion run
                  </span>
                  {statusChip(t, `stage · ${meta.stage}`, meta.stage === "ready" ? "success" : "amber")}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Detect → Fetch → Parse → Validate → Draft → Dual-check → Publish. Failed stages stay
                  Draft and never become published-current.
                </p>
                <div
                  data-register-surface="Ingestion stage rail"
                  style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}
                >
                  {PIPE_STAGES.map((stage) => {
                    const idx = PIPE_STAGES.indexOf(meta.stage);
                    const sIdx = PIPE_STAGES.indexOf(stage);
                    const done = sIdx <= idx;
                    return statusChip(
                      t,
                      stage,
                      done ? (stage === meta.stage && stage !== "ready" ? "amber" : "success") : "muted",
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={meta.stage === "ready"}
                  onClick={advanceStage}
                  style={secondaryBtnStyle(t)}
                >
                  {meta.stage === "ready" ? "Ready for Publish" : "Advance stage"}
                </button>
              </>,
            )}

            <div
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                background: t.bgSecondary,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: t.hoverBg, textAlign: "left" }}>
                    {["Key", "Label", "Value", "Type"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 10px",
                          fontWeight: 600,
                          color: t.textMuted,
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 14, color: t.textMuted }}>
                        No constants authored for this industry yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.key}>
                        <td
                          style={{
                            padding: "7px 10px",
                            color: t.textDim,
                            borderBottom: `1px solid ${t.borderLight}`,
                          }}
                        >
                          {row.key}
                        </td>
                        <td
                          style={{
                            padding: "7px 10px",
                            color: t.textPrimary,
                            borderBottom: `1px solid ${t.borderLight}`,
                          }}
                        >
                          {row.label}
                        </td>
                        <td
                          style={{
                            padding: "7px 10px",
                            color: t.textPrimary,
                            fontWeight: 600,
                            borderBottom: `1px solid ${t.borderLight}`,
                          }}
                        >
                          {formatConstantValue(row)}
                        </td>
                        <td
                          style={{
                            padding: "7px 10px",
                            color: t.textMuted,
                            borderBottom: `1px solid ${t.borderLight}`,
                          }}
                        >
                          {row.type}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {surfaceBlock(
              t,
              "Import criteria",
              focus.labelFocused("Import criteria"),
              focus.labelHovered("Import criteria"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Import criteria
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Edit grid rows directly or load a criteria file — tables are data, not hard-coded deploys.
                </p>
                <button type="button" onClick={() => setImportOpen(true)} style={secondaryBtnStyle(t)}>
                  Import criteria
                </button>
              </>,
            )}

            {surfaceBlock(
              t,
              "Publish version",
              focus.labelFocused("Publish version") || focus.labelFocused("Dual-check glance"),
              focus.labelHovered("Publish version") || focus.labelHovered("Dual-check glance"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Publish version
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Current {meta.version}. Evaluation packs in Configuration libraries score against the
                  published reference snapshot. Confirm stays disabled until dual-check chips are green.
                </p>
                <div
                  data-register-surface="Dual-check glance"
                  style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
                >
                  {statusChip(
                    t,
                    meta.schemaOk ? "schema-contract · ok" : "schema-contract · red",
                    meta.schemaOk ? "success" : "danger",
                  )}
                  {statusChip(
                    t,
                    meta.dualCheckOk ? "dual-check · ok" : "dual-check · pending",
                    meta.dualCheckOk ? "success" : "amber",
                  )}
                  {statusChip(
                    t,
                    meta.publishGroupOk ? "publish-group · ok" : "publish-group · blocked",
                    meta.publishGroupOk ? "success" : "danger",
                  )}
                </div>
                <button type="button" onClick={() => setPublishOpen(true)} style={secondaryBtnStyle(t)}>
                  Publish version…
                </button>
              </>,
            )}
          </div>
        </div>,
      )}

      {importOpen ? (
        <div style={modalBackdrop} onClick={() => setImportOpen(false)}>
          <div
            data-register-surface="Import criteria"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
              Import criteria
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: t.textMuted }}>
              Load IRCC-shaped criteria into a draft table version for {industry?.label ?? tableId}.
            </p>
            <input
              type="file"
              onChange={(e) => setImportFile(e.target.files?.[0]?.name ?? "")}
              style={{ fontSize: 12, marginBottom: 14 }}
            />
            {importFile ? (
              <div style={{ fontSize: 11, color: t.accent, marginBottom: 10 }}>Selected · {importFile}</div>
            ) : null}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={!importFile}
                onClick={onImport}
                style={primaryBtnStyle(t, !importFile)}
              >
                Import
              </button>
              <button type="button" onClick={() => setImportOpen(false)} style={secondaryBtnStyle(t)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {publishOpen ? (
        <div style={modalBackdrop} onClick={() => setPublishOpen(false)}>
          <div
            data-register-surface="Publish version"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
              Publish version
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: t.textMuted }}>
              Publish {industry?.label ?? tableId} — Configuration libraries evaluation packs consume this
              version.
            </p>
            <div
              data-register-surface="Dual-check glance"
              style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
            >
              {statusChip(
                t,
                meta.schemaOk ? "schema-contract · ok" : "schema-contract · red",
                meta.schemaOk ? "success" : "danger",
              )}
              {statusChip(
                t,
                meta.dualCheckOk ? "dual-check · ok" : "dual-check · pending",
                meta.dualCheckOk ? "success" : "amber",
              )}
              {statusChip(
                t,
                meta.publishGroupOk ? "publish-group · ok" : "publish-group · blocked",
                meta.publishGroupOk ? "success" : "danger",
              )}
            </div>
            {!publishReady ? (
              <p style={{ margin: "0 0 12px", fontSize: 11, color: t.amber }}>
                Confirm disabled until schema contract, dual-check, and publish-group chips are green.
              </p>
            ) : null}
            <label style={{ display: "block", marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.textMuted,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Version notes
              </span>
              <textarea
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Updated provincial nominee cutoffs"
                style={{
                  ...filterSelectStyle(t),
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  resize: "vertical",
                  lineHeight: 1.45,
                }}
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={!publishReady}
                onClick={onConfirmPublish}
                style={primaryBtnStyle(t, !publishReady)}
              >
                Confirm
              </button>
              <button type="button" onClick={() => setPublishOpen(false)} style={secondaryBtnStyle(t)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RegisterSurfaceMount>
  );
}
