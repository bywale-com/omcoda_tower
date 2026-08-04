/**
 * Firm operations bind — collection of firm bind records; packs/posture are scoped-record.
 */
import { useState, type ReactNode } from "react";
import type { Tokens } from "../../../components/tokens";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
} from "./operatorChrome";

const BIND_ROWS = [
  {
    firmId: DEMO_FIRMS[0].id,
    posture: "Active" as const,
    packs: ["Evaluation pack · v2", "Automation · Welcome armer", "Engagement · Opt-in Standard"],
    sendGate: "consent · clear",
  },
  {
    firmId: DEMO_FIRMS[1].id,
    posture: "Armed" as const,
    packs: ["Evaluation pack · v1", "Automation · Book armer", "Engagement · Nudge Standard"],
    sendGate: "domain not ready",
  },
  {
    firmId: DEMO_FIRMS[2].id,
    posture: "Armed" as const,
    packs: ["Evaluation pack · v2", "Automation · Welcome armer", "Engagement · Opt-in Standard"],
    sendGate: "suppression hold · 4",
  },
] as const;

export function FirmOperationsBindPanel({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Firm operations bind", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(BIND_ROWS[0].firmId);
  const row = BIND_ROWS.find((r) => r.firmId === selectedId) ?? BIND_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];

  const block = (label: string, title: string, body: string, extra?: ReactNode) =>
    surfaceBlock(
      t,
      label,
      focus.labelFocused(label),
      focus.labelHovered(label),
      <>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>{body}</p>
        {extra}
      </>,
    );

  return (
    <RegisterSurfaceMount
      label="Firm operations bind"
      focused={focus.focused}
      hovered={focus.hovered}
      t={t}
    >
      {panelShell(
        t,
        "Firm operations bind",
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
            <div style={sectionLabelStyle(t)}>Firm bind records</div>
            {BIND_ROWS.map((r) => {
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
                    {r.posture} · {r.packs.length} packs
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
              Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong>
            </div>

            {block(
              "Bind packs",
              "Bind packs",
              "House-authored Evaluation, Automation, and Engagement versions bound under this firm identity — not a house-global singleton.",
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {row.packs.map((pack) => (
                  <span
                    key={pack}
                    style={{
                      fontSize: 11,
                      color: t.textPrimary,
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "4px 8px",
                    }}
                  >
                    {pack}
                  </span>
                ))}
              </div>,
            )}
            {block(
              "Armed / Active",
              "Armed / Active",
              "Armed = template ready under this identity. Active = executing. Posture is per firm.",
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {statusChip(t, row.posture, row.posture === "Active" ? "accent" : "amber")}
              </div>,
            )}
            <div
              data-register-surface="Send gates"
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                background: t.bgSecondary,
                padding: 14,
                outline:
                  focusedEntry?.label === "Send gates"
                    ? `2px solid ${t.accent}`
                    : hoveredEntry?.label === "Send gates"
                      ? `1px solid ${t.accent}`
                      : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Send gates</span>
                {statusChip(t, row.sendGate, "muted")}
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Consent / deliverability / suppression gates for this tenancy — never on the consultant desk.
              </p>
            </div>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
