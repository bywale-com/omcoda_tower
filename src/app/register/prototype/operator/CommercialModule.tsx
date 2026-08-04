/**
 * Commercial — Escrow status + Release control.
 */
import { useState } from "react";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
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

type EscrowStatus = "Held" | "Released" | "Disputed";

const COMMERCIAL_ROWS = [
  {
    firmId: DEMO_FIRMS[0].id,
    status: "Held",
    held: "$2,400 CAD",
    accepted: "Mon 11:18",
    predicate: "Meeting booked (attributed)",
  },
  {
    firmId: DEMO_FIRMS[1].id,
    status: "Released",
    held: "$1,800 CAD",
    accepted: "Tue 09:42",
    predicate: "First attended consult",
  },
  {
    firmId: DEMO_FIRMS[2].id,
    status: "Disputed",
    held: "$3,150 CAD",
    accepted: "Fri 15:04",
    predicate: "Settlement evidence incomplete",
  },
] as const satisfies readonly {
  firmId: string;
  status: EscrowStatus;
  held: string;
  accepted: string;
  predicate: string;
}[];

const INITIAL_STATUSES = COMMERCIAL_ROWS.reduce<Record<string, EscrowStatus>>((acc, row) => {
  acc[row.firmId] = row.status;
  return acc;
}, {});

export function CommercialModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Commercial", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(COMMERCIAL_ROWS[0].firmId);
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const [notes, setNotes] = useState<Record<string, string | undefined>>({});
  const row = COMMERCIAL_ROWS.find((r) => r.firmId === selectedId) ?? COMMERCIAL_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const status = statuses[row.firmId] ?? row.status;
  const note = notes[row.firmId];

  const updateEscrow = (nextStatus: EscrowStatus, nextNote: string) => {
    setStatuses((prev) => ({ ...prev, [row.firmId]: nextStatus }));
    setNotes((prev) => ({ ...prev, [row.firmId]: nextNote }));
  };

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
            <div style={sectionLabelStyle(t)}>Firm instruments</div>
            {COMMERCIAL_ROWS.map((commercialRow) => {
              const listFirm = DEMO_FIRMS.find((f) => f.id === commercialRow.firmId)!;
              const listStatus = statuses[commercialRow.firmId] ?? commercialRow.status;
              return (
                <button
                  key={commercialRow.firmId}
                  type="button"
                  onClick={() => setSelectedId(commercialRow.firmId)}
                  style={navBtnStyle(t, commercialRow.firmId === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{listFirm.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {listStatus} · {commercialRow.held}
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
                    { k: "Held principal", v: row.held },
                    { k: "Accepted", v: row.accepted },
                    { k: "Predicate", v: row.predicate },
                  ].map((metric) => (
                    <div
                      key={metric.k}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{metric.k}</div>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 3 }}
                      >
                        {metric.v}
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
                  dispute path stay house-overseen for the selected firm.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    style={primaryBtnStyle(t, status !== "Held")}
                    disabled={status !== "Held"}
                    onClick={() => updateEscrow("Released", "Release queued · evidence package attached")}
                  >
                    Release to Om Coda
                  </button>
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    disabled={status === "Released"}
                    onClick={() => updateEscrow("Disputed", "Dispute opened · return/forfeit path pending")}
                  >
                    Open dispute
                  </button>
                  {note ? <span style={{ fontSize: 11, color: t.accent }}>{note}</span> : null}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
