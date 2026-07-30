/**
 * Firm operations bind — Bind packs / Armed·Active / Send gates.
 */
import type { ReactNode } from "react";
import type { Tokens } from "../../../components/tokens";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import { moduleFocus, panelShell, resolveHoveredEntry, statusChip, surfaceBlock } from "./operatorChrome";

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
          {block(
            "Bind packs",
            "Bind packs",
            "Select house-authored Evaluation pack, Automation pack, and Engagement template versions and bind them under this firm identity.",
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Evaluation pack · v2", "Automation · Welcome armer", "Engagement · Opt-in Standard"].map(
                (pack) => (
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
                ),
              )}
            </div>,
          )}
          {block(
            "Armed / Active",
            "Armed / Active",
            "Armed = template ready under this identity. Active = executing. Consultant Board shows inhabited motion only — no pack editor on the firm desk.",
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.amber,
                  background: t.amberBg,
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                Armed
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.accent,
                  background: t.accentBg,
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                Active
              </span>
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
              {statusChip(t, "consent", "muted")}
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
              Consent ledger and send-gate configuration live here — never on the consultant desk.
              Placeholder until Step 6 densifies the gate controls.
            </p>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
