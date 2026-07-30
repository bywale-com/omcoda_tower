/**
 * Activation & forward-deploy — In-flight, Forward-deploy, Readiness walkthrough.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, sectionLabelStyle, navBtnStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const ACTIVATIONS = [
  {
    id: "act-cedar",
    firm: DEMO_FIRMS[1].name,
    stage: "Prepared Workspace",
    owner: "Ops · Lena",
    next: "Authorize book",
  },
  {
    id: "act-harbor",
    firm: DEMO_FIRMS[2].name,
    stage: "Escrow held",
    owner: "Ops · Marco",
    next: "Release evidence check",
  },
  {
    id: "act-atlas",
    firm: DEMO_FIRMS[3].name,
    stage: "Forward-deploy live",
    owner: "Ops · Lena",
    next: "Readiness walkthrough",
  },
] as const;

const WALKTHROUGH = [
  { id: "w1", title: "Firm identity stamped", detail: "Branding + channel under tenancy" },
  { id: "w2", title: "Demo book inhabited", detail: "No-login prepared campaign visible" },
  { id: "w3", title: "Authorize book door", detail: "Private book grant pending" },
  { id: "w4", title: "Accept terms / escrow", detail: "License + contingent cost" },
] as const;

export function ActivationForwardDeployModule({
  t,
  focusedEntry,
  hoveredId,
}: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Activation & forward-deploy", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(ACTIVATIONS[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Activation & forward-deploy") return;
    if (
      focusedEntry.label === "In-flight activations" ||
      focusedEntry.label === "Forward-deploy" ||
      focusedEntry.label === "Readiness walkthrough"
    ) {
      setSelectedId(ACTIVATIONS[0].id);
    }
  }, [focusedEntry]);

  const selected = ACTIVATIONS.find((a) => a.id === selectedId) ?? ACTIVATIONS[0];

  return (
    <RegisterSurfaceMount
      label="Activation & forward-deploy"
      focused={focus.focused && focusedEntry?.label === "Activation & forward-deploy"}
      hovered={hoveredEntry?.label === "Activation & forward-deploy"}
      t={t}
    >
      {panelShell(
        t,
        "Activation & forward-deploy",
        statusChip(t, "house-global"),
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
            <div style={sectionLabelStyle(t)}>In-flight activations</div>
            <div data-register-surface="In-flight activations">
              {ACTIVATIONS.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  style={navBtnStyle(t, row.id === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{row.firm}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{row.stage}</div>
                </button>
              ))}
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
            {surfaceBlock(
              t,
              "Forward-deploy",
              focus.labelFocused("Forward-deploy"),
              focus.labelHovered("Forward-deploy"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Forward-deploy
                  </span>
                  {statusChip(t, selected.stage, "amber")}
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Staging Prepared Workspace for <strong style={{ color: t.textPrimary }}>{selected.firm}</strong>{" "}
                  under firm identity until authorize + escrow land. Owner {selected.owner}.
                </p>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.textPrimary,
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "4px 8px",
                    }}
                  >
                    Next · {selected.next}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.textMuted,
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "4px 8px",
                    }}
                  >
                    No consultant login required yet
                  </span>
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Readiness walkthrough",
              focus.labelFocused("Readiness walkthrough"),
              focus.labelHovered("Readiness walkthrough"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                  Readiness walkthrough
                </div>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {WALKTHROUGH.map((step, i) => (
                    <li
                      key={step.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "9px 11px",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: i < 2 ? t.accentBg : t.hoverBg,
                          color: i < 2 ? t.accent : t.textDim,
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                          {step.detail}
                        </div>
                      </div>
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
