/**
 * Firm health — Sequence / Engagement health + Sequence detail.
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

const SEQUENCES = [
  {
    id: "seq-optin",
    name: "Opt-in Standard",
    health: "Healthy",
    enrolled: 128,
    stuck: 3,
    detail: "Consent → welcome → channel confirm. Drop-offs concentrated on WhatsApp confirm.",
  },
  {
    id: "seq-nudge",
    name: "Nudge · dormant 90d",
    health: "Watch",
    enrolled: 64,
    stuck: 11,
    detail: "Silence clock honored. Elevated unsubscribe on step 2 — review copy under Engagement templates.",
  },
  {
    id: "seq-react",
    name: "Reactivation · CEC window",
    health: "At risk",
    enrolled: 22,
    stuck: 9,
    detail: "Send gates holding 4 contacts — consent ledger incomplete after book import.",
  },
] as const;

const FIRM_HEALTH_ROWS = [
  {
    firmId: DEMO_FIRMS[0].id,
    activeSequences: 3,
    sendGateHolds: 4,
    replyRate: "11%",
  },
  {
    firmId: DEMO_FIRMS[1].id,
    activeSequences: 3,
    sendGateHolds: 9,
    replyRate: "7%",
  },
  {
    firmId: DEMO_FIRMS[2].id,
    activeSequences: 2,
    sendGateHolds: 1,
    replyRate: "15%",
  },
] as const;

export function FirmHealthModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Firm health", focusedEntry, hoveredEntry);
  const [selectedFirmId, setSelectedFirmId] = useState(FIRM_HEALTH_ROWS[0].firmId);
  const [selectedId, setSelectedId] = useState(SEQUENCES[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Firm health") return;
    if (
      focusedEntry.label === "Sequence health" ||
      focusedEntry.label === "Sequence detail" ||
      focusedEntry.label === "Engagement health"
    ) {
      setSelectedFirmId(FIRM_HEALTH_ROWS[0].firmId);
      setSelectedId(SEQUENCES[0].id);
    }
  }, [focusedEntry]);

  const healthRow = FIRM_HEALTH_ROWS.find((r) => r.firmId === selectedFirmId) ?? FIRM_HEALTH_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === healthRow.firmId) ?? DEMO_FIRMS[0];
  const selected = SEQUENCES.find((s) => s.id === selectedId) ?? SEQUENCES[0];

  return (
    <RegisterSurfaceMount
      label="Firm health"
      focused={focus.focused && focusedEntry?.label === "Firm health"}
      hovered={hoveredEntry?.label === "Firm health"}
      t={t}
    >
      {panelShell(
        t,
        "Firm health",
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
            <div style={sectionLabelStyle(t)}>Firm health tenancies</div>
            {FIRM_HEALTH_ROWS.map((row) => {
              const listFirm = DEMO_FIRMS.find((f) => f.id === row.firmId)!;
              return (
                <button
                  key={row.firmId}
                  type="button"
                  onClick={() => {
                    setSelectedFirmId(row.firmId);
                    setSelectedId(SEQUENCES[0].id);
                  }}
                  style={navBtnStyle(t, row.firmId === selectedFirmId)}
                >
                  <div style={{ fontWeight: 600 }}>{listFirm.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {listFirm.health} · {row.activeSequences} sequences
                  </div>
                </button>
              );
            })}
            <div style={{ ...sectionLabelStyle(t), marginTop: 8 }}>Sequences under firm</div>
            <div data-register-surface="Sequence health">
              {SEQUENCES.map((seq) => (
                <button
                  key={seq.id}
                  type="button"
                  onClick={() => setSelectedId(seq.id)}
                  style={navBtnStyle(t, seq.id === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{seq.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {seq.enrolled} enrolled · {seq.stuck} stuck
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
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong> · {firm.stage}
            </div>

            {surfaceBlock(
              t,
              "Engagement health",
              focus.labelFocused("Engagement health"),
              focus.labelHovered("Engagement health"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 10 }}>
                  Engagement health
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { k: "Active sequences", v: String(healthRow.activeSequences) },
                    { k: "Send-gate holds", v: String(healthRow.sendGateHolds) },
                    { k: "7d reply rate", v: healthRow.replyRate },
                  ].map((tile) => (
                    <div
                      key={tile.k}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{tile.k}</div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 650,
                          color: t.textPrimary,
                          marginTop: 4,
                        }}
                      >
                        {tile.v}
                      </div>
                    </div>
                  ))}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Sequence detail",
              focus.labelFocused("Sequence detail") ||
                focus.labelFocused("Sequence health") ||
                focusedEntry?.label === "Firm health",
              focus.labelHovered("Sequence detail"),
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
                    Sequence detail · {selected.name}
                  </span>
                  {statusChip(
                    t,
                    selected.health,
                    selected.health === "Healthy"
                      ? "success"
                      : selected.health === "Watch"
                        ? "amber"
                        : "danger",
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
                  {selected.detail}
                </p>
                <div style={{ marginTop: 10, fontSize: 11, color: t.textDim }}>
                  {selected.enrolled} enrolled · {selected.stuck} stuck at gate or silence
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
