/**
 * Customer support — Ticket queue, Ticket, Support context.
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

const TICKETS = [
  {
    id: "SUP-184",
    subject: "Authorize book stuck after CSV upload",
    firm: DEMO_FIRMS[1].name,
    priority: "High",
    status: "Open",
    body: "Consultant uploaded a book export but Authorize book remains disabled. Suspect reachability audit gate.",
  },
  {
    id: "SUP-179",
    subject: "Escrow release evidence question",
    firm: DEMO_FIRMS[2].name,
    priority: "Normal",
    status: "Waiting",
    body: "Firm asks which meeting evidence bundle is required before Release control can fire.",
  },
  {
    id: "SUP-171",
    subject: "Quiet-hours policy override request",
    firm: DEMO_FIRMS[0].name,
    priority: "Low",
    status: "Open",
    body: "Wants outbound after 20:00 local for one reactivation wave — check Agency policy bounds.",
  },
] as const;

export function CustomerSupportModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Customer support", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(TICKETS[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Customer support") return;
    if (
      focusedEntry.label === "Ticket" ||
      focusedEntry.label === "Ticket queue" ||
      focusedEntry.label === "Support context"
    ) {
      setSelectedId(TICKETS[0].id);
    }
  }, [focusedEntry]);

  const selected = TICKETS.find((x) => x.id === selectedId) ?? TICKETS[0];

  return (
    <RegisterSurfaceMount
      label="Customer support"
      focused={focus.focused && focusedEntry?.label === "Customer support"}
      hovered={hoveredEntry?.label === "Customer support"}
      t={t}
    >
      {panelShell(
        t,
        "Customer support",
        statusChip(t, "queue"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 240,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Ticket queue</div>
            <div data-register-surface="Ticket queue">
              {TICKETS.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  style={navBtnStyle(t, ticket.id === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{ticket.id}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    {ticket.subject}
                  </div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>
                    {ticket.firm} · {ticket.status}
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
            {surfaceBlock(
              t,
              "Ticket",
              focus.labelFocused("Ticket") || focusedEntry?.label === "Customer support",
              focus.labelHovered("Ticket"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    {selected.id} · {selected.subject}
                  </span>
                  {statusChip(
                    t,
                    selected.priority,
                    selected.priority === "High" ? "danger" : selected.priority === "Normal" ? "amber" : "muted",
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
                  {selected.body}
                </p>
                <div style={{ marginTop: 10, fontSize: 11, color: t.textDim }}>
                  Status · {selected.status}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Support context",
              focus.labelFocused("Support context"),
              focus.labelHovered("Support context"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Support context
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Per-tenancy snapshot for {selected.firm} — activation stage, bound packs, and
                  recent audit events without leaving the queue.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { k: "Stage", v: DEMO_FIRMS.find((f) => f.name === selected.firm)?.stage ?? "—" },
                    { k: "Health", v: DEMO_FIRMS.find((f) => f.name === selected.firm)?.health ?? "—" },
                    { k: "Bound pack", v: "Evaluation · v2" },
                    { k: "Last audit", v: "Reachability · 2d ago" },
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
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
