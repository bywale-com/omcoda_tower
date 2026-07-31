/**
 * Audit trail — Change events with Firm / Actor filters.
 */
import { useEffect, useMemo, useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const EVENTS = [
  {
    id: "ev-1",
    at: "Today · 14:22",
    firm: DEMO_FIRMS[0].name,
    actor: "ops.lena",
    action: "Bound Evaluation pack v2",
    kind: "Bind",
  },
  {
    id: "ev-2",
    at: "Today · 11:05",
    firm: DEMO_FIRMS[1].name,
    actor: "ops.marco",
    action: "Forward-deploy staged Prepared Workspace",
    kind: "Activation",
  },
  {
    id: "ev-3",
    at: "Yesterday · 16:40",
    firm: DEMO_FIRMS[2].name,
    actor: "founder",
    action: "Agency policy · outbound quiet hours updated",
    kind: "Policy",
  },
  {
    id: "ev-4",
    at: "Yesterday · 09:12",
    firm: DEMO_FIRMS[0].name,
    actor: "ops.lena",
    action: "Send gates · consent ledger review",
    kind: "Gate",
  },
  {
    id: "ev-5",
    at: "Mon · 18:03",
    firm: DEMO_FIRMS[3].name,
    actor: "support.kai",
    action: "Support context attached to ticket SUP-184",
    kind: "Support",
  },
] as const;

const ACTORS = ["All actors", "ops.lena", "ops.marco", "founder", "support.kai"] as const;

export function AuditTrailModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Audit trail", focusedEntry, hoveredEntry);
  const [firmFilter, setFirmFilter] = useState("All firms");
  const [actorFilter, setActorFilter] = useState<(typeof ACTORS)[number]>("All actors");
  const [selectedId, setSelectedId] = useState(EVENTS[0].id);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Audit trail") return;
    if (focusedEntry.label === "Change event") setSelectedId(EVENTS[0].id);
  }, [focusedEntry]);

  const filtered = useMemo(
    () =>
      EVENTS.filter((ev) => {
        if (firmFilter !== "All firms" && ev.firm !== firmFilter) return false;
        if (actorFilter !== "All actors" && ev.actor !== actorFilter) return false;
        return true;
      }),
    [firmFilter, actorFilter],
  );

  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;

  return (
    <RegisterSurfaceMount
      label="Audit trail"
      focused={focus.focused && focusedEntry?.label === "Audit trail"}
      hovered={hoveredEntry?.label === "Audit trail"}
      t={t}
    >
      {panelShell(
        t,
        "Audit trail",
        statusChip(t, "accountability"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 16px",
              borderBottom: `1px solid ${t.border}`,
              background: t.bgSecondary,
              flexShrink: 0,
            }}
          >
            <div data-register-surface="Firm filter">
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Firm filter</div>
              <select
                value={firmFilter}
                onChange={(e) => setFirmFilter(e.target.value)}
                style={{
                  ...filterSelectStyle(t),
                  outline: focus.labelFocused("Firm filter") || focus.labelHovered("Firm filter")
                    ? `2px solid ${t.accent}`
                    : "none",
                }}
              >
                <option>All firms</option>
                {DEMO_FIRMS.map((f) => (
                  <option key={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div data-register-surface="Actor filter">
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Actor filter</div>
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value as (typeof ACTORS)[number])}
                style={{
                  ...filterSelectStyle(t),
                  outline: focus.labelFocused("Actor filter") || focus.labelHovered("Actor filter")
                    ? `2px solid ${t.accent}`
                    : "none",
                }}
              >
                {ACTORS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1.2, minWidth: 0, overflowY: "auto", padding: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: t.textMuted }}>
                  No change events for this filter.
                </div>
              ) : (
                filtered.map((ev) => {
                  const active = selected?.id === ev.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      data-register-surface="Change event"
                      onClick={() => setSelectedId(ev.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        marginBottom: 8,
                        padding: 12,
                        border: `1px solid ${t.border}`,
                        borderRadius: 6,
                        background: active ? t.accentBg : t.bgSecondary,
                        color: t.textPrimary,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        outline:
                          (focus.labelFocused("Change event") || focus.labelHovered("Change event")) &&
                          active
                            ? `2px solid ${t.accent}`
                            : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{ev.action}</span>
                        {statusChip(t, ev.kind, "muted")}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                        {ev.at} · {ev.firm} · {ev.actor}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div style={{ flex: 1, minWidth: 220, borderLeft: `1px solid ${t.border}`, padding: 16 }}>
              {selected ? (
                surfaceBlock(
                  t,
                  "Change event",
                  focus.labelFocused("Change event"),
                  focus.labelHovered("Change event"),
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                      Change event
                    </div>
                    <dl
                      style={{
                        margin: 0,
                        display: "grid",
                        gridTemplateColumns: "90px 1fr",
                        gap: "8px 10px",
                        fontSize: 12,
                      }}
                    >
                      <dt style={{ color: t.textDim }}>When</dt>
                      <dd style={{ margin: 0, color: t.textPrimary }}>{selected.at}</dd>
                      <dt style={{ color: t.textDim }}>Firm</dt>
                      <dd style={{ margin: 0, color: t.textPrimary }}>{selected.firm}</dd>
                      <dt style={{ color: t.textDim }}>Actor</dt>
                      <dd style={{ margin: 0, color: t.textPrimary }}>{selected.actor}</dd>
                      <dt style={{ color: t.textDim }}>Kind</dt>
                      <dd style={{ margin: 0, color: t.textPrimary }}>{selected.kind}</dd>
                      <dt style={{ color: t.textDim }}>Action</dt>
                      <dd style={{ margin: 0, color: t.textPrimary }}>{selected.action}</dd>
                    </dl>
                  </>,
                  { height: "100%" },
                )
              ) : (
                <div style={{ fontSize: 12, color: t.textMuted }}>Select a change event.</div>
              )}
            </div>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
