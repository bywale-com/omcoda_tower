/**
 * Oversight — Fleet health + Firm row list.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const FLEET = [
  { label: "Running", value: "12", tone: "success" as const },
  { label: "In activation", value: "5", tone: "amber" as const },
  { label: "At risk", value: "2", tone: "danger" as const },
  { label: "Send-gate holds", value: "3", tone: "muted" as const },
];

export function OversightModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Oversight", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(DEMO_FIRMS[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Oversight") return;
    if (focusedEntry.label === "Firm row" || focusedEntry.label === "Fleet health") {
      setSelectedId(DEMO_FIRMS[0].id);
    }
  }, [focusedEntry]);

  const selected = DEMO_FIRMS.find((f) => f.id === selectedId) ?? DEMO_FIRMS[0];

  return (
    <RegisterSurfaceMount
      label="Oversight"
      focused={focus.focused && focusedEntry?.label === "Oversight"}
      hovered={hoveredEntry?.label === "Oversight"}
      t={t}
    >
      {panelShell(
        t,
        "Oversight",
        statusChip(t, "cross-firm"),
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
          {surfaceBlock(
            t,
            "Fleet health",
            focus.labelFocused("Fleet health"),
            focus.labelHovered("Fleet health"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                Fleet health
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {FLEET.map((tile) => (
                  <div
                    key={tile.label}
                    style={{
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 10, color: t.textDim }}>{tile.label}</div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 650,
                        color: t.textPrimary,
                        marginTop: 4,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {tile.value}
                    </div>
                    <div style={{ marginTop: 6 }}>{statusChip(t, tile.tone, tile.tone)}</div>
                  </div>
                ))}
              </div>
            </>,
          )}

          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgSecondary,
              overflow: "hidden",
              flex: 1,
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: `1px solid ${t.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: t.textPrimary,
              }}
            >
              Firms
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {DEMO_FIRMS.map((firm) => {
                const active = firm.id === selectedId;
                return (
                  <div
                    key={firm.id}
                    data-register-surface="Firm row"
                    onClick={() => setSelectedId(firm.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr 0.8fr",
                      gap: 8,
                      padding: "10px 14px",
                      borderBottom: `1px solid ${t.borderLight}`,
                      background: active ? t.accentBg : "transparent",
                      outline:
                        (focus.labelFocused("Firm row") || focus.labelHovered("Firm row")) && active
                          ? `2px solid ${t.accent}`
                          : "none",
                      outlineOffset: -2,
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                        {firm.name}
                      </div>
                      <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{firm.id}</div>
                    </div>
                    <div style={{ fontSize: 12, color: t.textMuted, alignSelf: "center" }}>
                      {firm.stage}
                    </div>
                    <div style={{ alignSelf: "center" }}>
                      {statusChip(
                        t,
                        firm.health,
                        firm.health === "Healthy"
                          ? "success"
                          : firm.health === "Watch"
                            ? "amber"
                            : "danger",
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderTop: `1px solid ${t.border}`,
                fontSize: 11,
                color: t.textMuted,
              }}
            >
              Selected · {selected.name} — open Firm health / Activation state for tenancy slice
            </div>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
