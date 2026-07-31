/**
 * Reference data — versioned tables, Import criteria, Publish version.
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
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const TABLES: {
  id: AutomationConstantIndustryId;
  version: string;
  status: "Published" | "Draft";
}[] = [
  { id: "immigration", version: "v2.4", status: "Published" },
  { id: "legal", version: "v0.1", status: "Draft" },
  { id: "financial_services", version: "v0.0", status: "Draft" },
];

export function ReferenceDataModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Reference data", focusedEntry, hoveredEntry);
  const [tableId, setTableId] = useState<AutomationConstantIndustryId>("immigration");
  const [publishNote, setPublishNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Reference data") return;
    if (
      focusedEntry.label === "Reference tables" ||
      focusedEntry.label === "Import criteria" ||
      focusedEntry.label === "Publish version"
    ) {
      setTableId("immigration");
    }
  }, [focusedEntry]);

  const meta = TABLES.find((row) => row.id === tableId) ?? TABLES[0];
  const industry = AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === tableId);
  const rows = useMemo(() => getConstantsForIndustry(tableId).slice(0, 8), [tableId]);

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
        statusChip(t, "versioned"),
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
              {TABLES.map((row) => {
                const label =
                  AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === row.id)?.label ?? row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setTableId(row.id);
                      setPublishNote(null);
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
              {statusChip(t, meta.status === "Published" ? "published" : "draft", meta.status === "Published" ? "success" : "amber")}
            </div>

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
                        <td style={{ padding: "7px 10px", color: t.textDim, borderBottom: `1px solid ${t.borderLight}` }}>
                          {row.key}
                        </td>
                        <td style={{ padding: "7px 10px", color: t.textPrimary, borderBottom: `1px solid ${t.borderLight}` }}>
                          {row.label}
                        </td>
                        <td style={{ padding: "7px 10px", color: t.textPrimary, fontWeight: 600, borderBottom: `1px solid ${t.borderLight}` }}>
                          {formatConstantValue(row)}
                        </td>
                        <td style={{ padding: "7px 10px", color: t.textMuted, borderBottom: `1px solid ${t.borderLight}` }}>
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
                  Pull IRCC-shaped criteria from the eligibility matrix into a draft table version.
                  House authorship only — never under firm Hub.
                </p>
                <button type="button" style={secondaryBtnStyle(t)}>
                  Import from matrix…
                </button>
              </>,
            )}

            {surfaceBlock(
              t,
              "Publish version",
              focus.labelFocused("Publish version"),
              focus.labelHovered("Publish version"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Publish version
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Current {meta.version}. Publishing binds Evaluation packs to this criteria snapshot.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    style={primaryBtnStyle(t)}
                    onClick={() =>
                      setPublishNote(`Queued publish · ${industry?.label ?? tableId} → next patch`)
                    }
                  >
                    Publish version
                  </button>
                  {publishNote ? (
                    <span style={{ fontSize: 11, color: t.accent }}>{publishNote}</span>
                  ) : null}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
