/**
 * Founder & agency controls — Agency policy, Bounds, Kill-switch.
 */
import { useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const KILL_SCOPE_TARGETS = [DEMO_FIRMS[0], DEMO_FIRMS[2], DEMO_FIRMS[3]] as const;

export function FounderAgencyControlsModule({
  t,
  focusedEntry,
  hoveredId,
}: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Founder & agency controls", focusedEntry, hoveredEntry);
  const [quietHours, setQuietHours] = useState(true);
  const [maxDaily, setMaxDaily] = useState("40");
  const [armed, setArmed] = useState(false);
  const [killed, setKilled] = useState(false);
  const [killScope, setKillScope] = useState<string>("fleet");
  const selectedScopeFirm = KILL_SCOPE_TARGETS.find((firm) => firm.id === killScope);
  const killScopeLabel = selectedScopeFirm?.name ?? "Fleet";

  return (
    <RegisterSurfaceMount
      label="Founder & agency controls"
      focused={focus.focused && focusedEntry?.label === "Founder & agency controls"}
      hovered={hoveredEntry?.label === "Founder & agency controls"}
      t={t}
    >
      {panelShell(
        t,
        "Founder & agency controls",
        statusChip(
          t,
          killed ? (selectedScopeFirm ? "tenancy halted" : "fleet halted") : "armed-ready",
          killed ? "danger" : "accent",
        ),
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
            "Agency policy",
            focus.labelFocused("Agency policy"),
            focus.labelHovered("Agency policy"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                Agency policy
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                House defaults that every tenancy inherits unless Firm operations bind overrides a
                gate.
              </p>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: t.textPrimary,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={quietHours}
                  onChange={(e) => setQuietHours(e.target.checked)}
                />
                Enforce quiet hours (09:00–20:00 local)
              </label>
              <label style={{ display: "block", fontSize: 12, color: t.textPrimary }}>
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                  Max outbound / firm / day
                </div>
                <input
                  value={maxDaily}
                  onChange={(e) => setMaxDaily(e.target.value)}
                  style={{
                    width: 100,
                    fontSize: 12,
                    fontFamily: "inherit",
                    padding: "6px 8px",
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    background: t.bgPrimary,
                    color: t.textPrimary,
                  }}
                />
              </label>
            </>,
          )}

          {surfaceBlock(
            t,
            "Bounds",
            focus.labelFocused("Bounds"),
            focus.labelHovered("Bounds"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                Bounds
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { k: "Approach click budget", v: "≤ 3 clicks to capture" },
                  { k: "CASL triad", v: "Consent · identity · unsubscribe always on" },
                  { k: "Escrow rail", v: "Firm↔Om Coda only — no client funds" },
                  { k: "Authorship seat", v: "Configuration libraries · never firm Hub" },
                ].map((row) => (
                  <div
                    key={row.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: t.textMuted }}>{row.k}</span>
                    <span style={{ color: t.textPrimary, fontWeight: 600, textAlign: "right" }}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>
            </>,
          )}

          {surfaceBlock(
            t,
            "Kill-switch",
            focus.labelFocused("Kill-switch"),
            focus.labelHovered("Kill-switch"),
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
                  Kill-switch
                </span>
                {statusChip(
                  t,
                  killed ? `${killScopeLabel} halted` : "standby",
                  killed ? "danger" : "muted",
                )}
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Halts outbound and Approach spend at fleet scope or for a named tenancy. Requires dual
                confirmation — Founder arm, then execute.
              </p>
              <div
                style={{
                  background: t.bgPrimary,
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 8 }}>
                  Kill scope · house control choosing fleet or named tenancy targets
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  {[
                    { id: "fleet", label: "Fleet-wide", meta: "all firm outbound + Approach spend" },
                    ...KILL_SCOPE_TARGETS.map((firm) => ({
                      id: firm.id,
                      label: firm.name,
                      meta: `${firm.stage} · ${firm.health}`,
                    })),
                  ].map((scope) => {
                    const selected = scope.id === killScope;
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => {
                          setKillScope(scope.id);
                          setKilled(false);
                        }}
                        style={{
                          textAlign: "left",
                          fontFamily: "inherit",
                          background: selected ? t.accentBg : t.bgSecondary,
                          color: t.textPrimary,
                          border: `1px solid ${selected ? t.accent : t.border}`,
                          borderRadius: 4,
                          padding: "8px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{scope.label}</div>
                        <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>{scope.meta}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  style={secondaryBtnStyle(t)}
                  onClick={() => {
                    setArmed((v) => !v);
                    if (armed) setKilled(false);
                  }}
                >
                  {armed ? "Disarm" : "Arm kill-switch"}
                </button>
                <button
                  type="button"
                  disabled={!armed || killed}
                  style={primaryBtnStyle(t, !armed || killed)}
                  onClick={() => setKilled(true)}
                >
                  Execute {selectedScopeFirm ? "tenancy" : "fleet"} halt
                </button>
                {killed ? (
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    onClick={() => {
                      setKilled(false);
                      setArmed(false);
                    }}
                  >
                    Restore {selectedScopeFirm ? "tenancy" : "fleet"}
                  </button>
                ) : null}
              </div>
            </>,
          )}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
