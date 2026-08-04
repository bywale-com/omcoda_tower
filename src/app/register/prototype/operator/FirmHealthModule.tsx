/**
 * Firm health — Sequence / Engagement health rows, Sequence detail modal, Open support context.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  chipTone,
  moduleFocus,
  operatorModal,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const SEQUENCES = [
  {
    id: "seq-optin",
    name: "Opt-in Standard",
    health: "Healthy",
    stuckReason: "3 contacts on WhatsApp confirm step",
    lastRunner: "Runner tick · Today 14:01 · step advance",
    gates: ["Consent OK", "Send gate open", "Channel WhatsApp"],
  },
  {
    id: "seq-nudge",
    name: "Nudge · dormant 90d",
    health: "Watch",
    stuckReason: "11 contacts past silence clock on step 2",
    lastRunner: "Runner tick · Today 13:52 · silence hold",
    gates: ["Consent OK", "Send gate open", "Unsubscribe armed"],
  },
  {
    id: "seq-react",
    name: "Reactivation · CEC window",
    health: "At risk",
    stuckReason: "9 contacts — consent ledger incomplete after import",
    lastRunner: "Runner tick · Today 11:48 · send gate blocked",
    gates: ["Consent partial", "Send gate hold", "Channel Email"],
  },
] as const;

const ENGAGEMENT_ROWS = [
  { label: "7d reply rate", value: "11%", health: "Watch" },
  { label: "Send-gate holds", value: "4", health: "At risk" },
  { label: "Active enrollments", value: "214", health: "Healthy" },
] as const;

export function FirmHealthModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Firm health", focusedEntry, hoveredEntry);
  const [selectedFirmId, setSelectedFirmId] = useState(DEMO_FIRMS[0].id);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [supportCue, setSupportCue] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Firm health") return;
    if (
      focusedEntry.label === "Sequence health" ||
      focusedEntry.label === "Sequence detail" ||
      focusedEntry.label === "Engagement health"
    ) {
      setSelectedFirmId(DEMO_FIRMS[0].id);
      setDetailId(SEQUENCES.find((s) => s.health !== "Healthy")?.id ?? SEQUENCES[0].id);
    }
    if (focusedEntry.label === "Open support context") {
      setSupportCue(`Support context · ${DEMO_FIRMS[0].name}`);
    }
  }, [focusedEntry]);

  const firm = DEMO_FIRMS.find((f) => f.id === selectedFirmId) ?? DEMO_FIRMS[0];
  const detail = detailId ? SEQUENCES.find((s) => s.id === detailId) : null;

  return (
    <RegisterSurfaceMount
      label="Firm health"
      focused={focus.focused && focusedEntry?.label === "Firm health"}
      hovered={hoveredEntry?.label === "Firm health"}
      t={t}
      style={{ position: "relative" }}
    >
      {panelShell(
        t,
        "Firm health",
        statusChip(t, firm.name, "muted"),
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              Firm scope · <strong style={{ color: t.textPrimary }}>{firm.name}</strong>
            </span>
            <select
              value={selectedFirmId}
              onChange={(e) => setSelectedFirmId(e.target.value)}
              style={{
                fontSize: 11,
                fontFamily: "inherit",
                padding: "4px 8px",
                border: `1px solid ${t.border}`,
                borderRadius: 4,
                background: t.bgPrimary,
                color: t.textPrimary,
              }}
            >
              {DEMO_FIRMS.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {surfaceBlock(
            t,
            "Sequence health",
            focus.labelFocused("Sequence health"),
            focus.labelHovered("Sequence health"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                Sequence health
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SEQUENCES.map((seq) => (
                  <button
                    key={seq.id}
                    type="button"
                    onClick={() => setDetailId(seq.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 0.8fr auto",
                      gap: 8,
                      alignItems: "center",
                      textAlign: "left",
                      fontFamily: "inherit",
                      padding: "10px 12px",
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      background: detailId === seq.id ? t.accentBg : t.bgPrimary,
                      color: t.textPrimary,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{seq.name}</span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>{seq.stuckReason}</span>
                    {statusChip(t, seq.health, chipTone(seq.health))}
                  </button>
                ))}
              </div>
            </>,
          )}

          {surfaceBlock(
            t,
            "Engagement health",
            focus.labelFocused("Engagement health"),
            focus.labelHovered("Engagement health"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                Engagement health
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ENGAGEMENT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: 8,
                      alignItems: "center",
                      padding: "10px 12px",
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      background: t.bgPrimary,
                    }}
                  >
                    <span style={{ fontSize: 12, color: t.textMuted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 650, color: t.textPrimary }}>
                      {row.value}
                    </span>
                    {statusChip(t, row.health, chipTone(row.health))}
                  </div>
                ))}
              </div>
            </>,
          )}

          <div
            data-register-surface="Open support context"
            style={{
              outline:
                focus.labelFocused("Open support context") ||
                focus.labelHovered("Open support context")
                  ? `2px solid ${t.accent}`
                  : "none",
              outlineOffset: 2,
              borderRadius: 4,
            }}
          >
            <button
              type="button"
              style={primaryBtnStyle(t)}
              onClick={() =>
                setSupportCue(`Customer support · Ticket scope · ${firm.name} · SUP-queued`)
              }
            >
              Open support context
            </button>
            {supportCue ? (
              <div style={{ marginTop: 8, fontSize: 11, color: t.accent }}>{supportCue}</div>
            ) : null}
          </div>
        </div>,
      )}

      {detail
        ? operatorModal(
            t,
            "Sequence detail",
            `Sequence detail · ${detail.name}`,
            focus.labelFocused("Sequence detail"),
            focus.labelHovered("Sequence detail"),
            () => setDetailId(null),
            <>
              <div style={{ marginBottom: 10 }}>
                {statusChip(t, detail.health, chipTone(detail.health))}
              </div>
              <dl
                style={{
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  gap: "8px 10px",
                  fontSize: 12,
                }}
              >
                <dt style={{ color: t.textDim }}>Stuck reason</dt>
                <dd style={{ margin: 0, color: t.textPrimary }}>{detail.stuckReason}</dd>
                <dt style={{ color: t.textDim }}>Last runner event</dt>
                <dd style={{ margin: 0, color: t.textMuted }}>{detail.lastRunner}</dd>
              </dl>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 6 }}>
                  Channel gate chips
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {detail.gates.map((gate) => (
                    <span key={gate}>
                      {statusChip(
                        t,
                        gate,
                        gate.includes("hold") || gate.includes("partial") ? "amber" : "success",
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </>,
          )
        : null}
    </RegisterSurfaceMount>
  );
}
