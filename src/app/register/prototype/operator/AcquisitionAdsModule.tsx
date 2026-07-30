/**
 * Acquisition & ads — Approach campaigns, Capture strip, Instrumentation.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const CAMPAIGNS = [
  {
    id: "camp-q3",
    name: "Meta Approach · Q3 RCIC pilots",
    status: "Live",
    budget: "≤ 3 clicks / lead",
    captures: 42,
  },
  {
    id: "camp-retarget",
    name: "Warm retarget · site visitors",
    status: "Paused",
    budget: "≤ 2 clicks / lead",
    captures: 18,
  },
  {
    id: "camp-assist",
    name: "Assisted OLG mirror (non-Meta)",
    status: "Draft",
    budget: "Operator-led",
    captures: 0,
  },
] as const;

const INSTRUMENTATION = [
  { id: "ctr", label: "CTR (Approach)", value: "2.4%", note: "Last 7d" },
  { id: "cpl", label: "Cost / capture", value: "$18.20", note: "Name+site+channel" },
  { id: "budget", label: "Click budget burn", value: "61%", note: "Campaign ceiling" },
  { id: "qualify", label: "Firm-ready rate", value: "38%", note: "Passed capture QA" },
] as const;

export function AcquisitionAdsModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Acquisition & ads", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState<string>(CAMPAIGNS[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Acquisition & ads") return;
    if (focusedEntry.label === "Approach campaigns" || focusedEntry.label === "Capture strip") {
      setSelectedId(CAMPAIGNS[0].id);
    }
  }, [focusedEntry]);

  const selected = CAMPAIGNS.find((c) => c.id === selectedId) ?? CAMPAIGNS[0];

  return (
    <RegisterSurfaceMount
      label="Acquisition & ads"
      focused={focus.focused && focusedEntry?.label === "Acquisition & ads"}
      hovered={hoveredEntry?.label === "Acquisition & ads"}
      t={t}
    >
      {panelShell(
        t,
        "Acquisition & ads",
        statusChip(t, "house-global"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            overflow: "hidden",
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Approach campaigns</div>
            <div data-register-surface="Approach campaigns">
              {CAMPAIGNS.map((camp) => (
                <button
                  key={camp.id}
                  type="button"
                  onClick={() => setSelectedId(camp.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    border: "none",
                    borderLeft:
                      camp.id === selectedId ? `3px solid ${t.accent}` : "3px solid transparent",
                    background: camp.id === selectedId ? t.accentBg : "transparent",
                    color: t.textPrimary,
                    fontSize: 12,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{camp.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {camp.status} · {camp.captures} captures
                  </div>
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
            }}
          >
            {surfaceBlock(
              t,
              "Capture strip",
              focus.labelFocused("Capture strip"),
              focus.labelHovered("Capture strip"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Capture strip
                  </span>
                  {statusChip(t, selected.status === "Live" ? "live" : "idle", selected.status === "Live" ? "success" : "muted")}
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  One-tap Meta Approach lands name + website + channel inside the click budget —{" "}
                  {selected.name}.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    { k: "Name", v: "Priya Desai, RCIC" },
                    { k: "Website", v: "cedarpathways.ca" },
                    { k: "Channel", v: "WhatsApp · +1…" },
                  ].map((field) => (
                    <div
                      key={field.k}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim, marginBottom: 3 }}>{field.k}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{field.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: t.textDim }}>
                  Budget · {selected.budget} · next firm seed → {DEMO_FIRMS[1].name}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Approach instrumentation",
              focus.labelFocused("Approach instrumentation"),
              focus.labelHovered("Approach instrumentation"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                  Approach instrumentation
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {INSTRUMENTATION.map((block) => (
                    <div
                      key={block.id}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{block.label}</div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 650,
                          color: t.textPrimary,
                          marginTop: 4,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {block.value}
                      </div>
                      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{block.note}</div>
                    </div>
                  ))}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
