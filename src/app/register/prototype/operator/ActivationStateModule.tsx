/**
 * Activation state — collection of firms in activation; Progress is scoped-record.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const ACTIVATION_ROWS = [
  {
    firmId: DEMO_FIRMS[1].id,
    pct: 40,
    next: "Authorize book",
    steps: [
      { id: "s1", title: "Approach / Provision capture", done: true },
      { id: "s2", title: "Forward-deploy Prepared Workspace", done: true },
      { id: "s3", title: "Authorize book", done: false },
      { id: "s4", title: "Accept terms · escrow", done: false },
      { id: "s5", title: "Running under firm identity", done: false },
    ],
  },
  {
    firmId: DEMO_FIRMS[2].id,
    pct: 80,
    next: "Accept terms · escrow",
    steps: [
      { id: "s1", title: "Approach / Provision capture", done: true },
      { id: "s2", title: "Forward-deploy Prepared Workspace", done: true },
      { id: "s3", title: "Authorize book", done: true },
      { id: "s4", title: "Accept terms · escrow", done: false },
      { id: "s5", title: "Running under firm identity", done: false },
    ],
  },
  {
    firmId: DEMO_FIRMS[3].id,
    pct: 20,
    next: "Forward-deploy Prepared Workspace",
    steps: [
      { id: "s1", title: "Approach / Provision capture", done: true },
      { id: "s2", title: "Forward-deploy Prepared Workspace", done: false },
      { id: "s3", title: "Authorize book", done: false },
      { id: "s4", title: "Accept terms · escrow", done: false },
      { id: "s5", title: "Running under firm identity", done: false },
    ],
  },
] as const;

export function ActivationStateModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Activation state", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(ACTIVATION_ROWS[0].firmId);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Activation state") return;
    if (focusedEntry.label === "Progress" || focusedEntry.label === "Activation state") {
      setSelectedId(ACTIVATION_ROWS[0].firmId);
    }
  }, [focusedEntry]);

  const row = ACTIVATION_ROWS.find((r) => r.firmId === selectedId) ?? ACTIVATION_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[1];

  return (
    <RegisterSurfaceMount
      label="Activation state"
      focused={focus.focused && focusedEntry?.label === "Activation state"}
      hovered={hoveredEntry?.label === "Activation state"}
      t={t}
    >
      {panelShell(
        t,
        "Activation state",
        statusChip(t, "per-tenancy"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Firms in activation</div>
            {ACTIVATION_ROWS.map((r) => {
              const f = DEMO_FIRMS.find((d) => d.id === r.firmId)!;
              return (
                <button
                  key={r.firmId}
                  type="button"
                  onClick={() => setSelectedId(r.firmId)}
                  style={navBtnStyle(t, r.firmId === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {r.pct}% · next {r.next}
                  </div>
                </button>
              );
            })}
          </aside>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong> · {firm.stage}
            </div>

            {surfaceBlock(
              t,
              "Progress",
              focus.labelFocused("Progress") || focusedEntry?.label === "Activation state",
              focus.labelHovered("Progress"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Progress</span>
                  {statusChip(t, `${row.pct}%`, "amber")}
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: t.hoverBg,
                    overflow: "hidden",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ width: `${row.pct}%`, height: "100%", background: t.accent }} />
                </div>
                <ol
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {row.steps.map((step, i) => (
                    <li
                      key={step.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "9px 11px",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: step.done ? t.accentBg : t.hoverBg,
                          color: step.done ? t.accent : t.textDim,
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {step.done ? "✓" : i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: step.done ? t.textPrimary : t.textMuted,
                        }}
                      >
                        {step.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
