/**
 * Commercial — Escrow status + Release control.
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

export function CommercialModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Commercial", focusedEntry, hoveredEntry);
  const firm = DEMO_FIRMS[2];
  const [status, setStatus] = useState<"Held" | "Released" | "Disputed">("Held");
  const [note, setNote] = useState<string | null>(null);

  return (
    <RegisterSurfaceMount
      label="Commercial"
      focused={focus.focused && focusedEntry?.label === "Commercial"}
      hovered={hoveredEntry?.label === "Commercial"}
      t={t}
    >
      {panelShell(
        t,
        "Commercial",
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
          <div style={{ fontSize: 12, color: t.textMuted }}>
            Firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong>
          </div>

          {surfaceBlock(
            t,
            "Escrow status",
            focus.labelFocused("Escrow status") || focusedEntry?.label === "Commercial",
            focus.labelHovered("Escrow status"),
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
                  Escrow status
                </span>
                {statusChip(
                  t,
                  status,
                  status === "Held" ? "amber" : status === "Released" ? "success" : "danger",
                )}
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Firm↔Om Coda contingent cost for Tower service consideration — not client settlement
                funds. Hold immobilizes value against named release predicates.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { k: "Held principal", v: "$2,400 CAD" },
                  { k: "Accepted", v: "Mon 11:18" },
                  { k: "Predicate", v: "Meeting booked (attributed)" },
                ].map((row) => (
                  <div
                    key={row.k}
                    style={{
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "8px 10px",
                    }}
                  >
                    <div style={{ fontSize: 10, color: t.textDim }}>{row.k}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 3 }}>
                      {row.v}
                    </div>
                  </div>
                ))}
              </div>
            </>,
          )}

          {surfaceBlock(
            t,
            "Release control",
            focus.labelFocused("Release control"),
            focus.labelHovered("Release control"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                Release control
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Evidence bundle required: attributed booking + attendance window. Silence clock and
                dispute path stay house-overseen.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  style={primaryBtnStyle(t, status !== "Held")}
                  disabled={status !== "Held"}
                  onClick={() => {
                    setStatus("Released");
                    setNote("Release queued · evidence package attached");
                  }}
                >
                  Release to Om Coda
                </button>
                <button
                  type="button"
                  style={secondaryBtnStyle(t)}
                  disabled={status === "Released"}
                  onClick={() => {
                    setStatus("Disputed");
                    setNote("Dispute opened · return/forfeit path pending");
                  }}
                >
                  Open dispute
                </button>
                {note ? <span style={{ fontSize: 11, color: t.accent }}>{note}</span> : null}
              </div>
            </>,
          )}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
