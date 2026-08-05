/**
 * Audit trail — Firm / Actor / Operation filters, filter chips, Change event list + modal.
 */
import { useEffect, useMemo, useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  operatorModal,
  panelShell,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  type OperatorModuleProps,
} from "./operatorChrome";

const EVENTS = [
  {
    id: "ev-1",
    at: "Today · 14:22",
    firm: DEMO_FIRMS[0].name,
    actor: "ops.lena",
    action: "Bound Evaluation pack v2",
    kind: "Bind packs",
    before: "Evaluation pack v1 · armed",
    after: "Evaluation pack v2 · armed",
    surface: "Firm operations bind",
  },
  {
    id: "ev-2",
    at: "Today · 11:05",
    firm: DEMO_FIRMS[1].name,
    actor: "ops.marco",
    action: "Forward-deploy staged Prepared Workspace",
    kind: "Activation",
    before: "Capture complete",
    after: "Prepared Workspace staged",
    surface: "Activation & forward-deploy",
  },
  {
    id: "ev-3",
    at: "Yesterday · 16:40",
    firm: "House-global",
    actor: "founder",
    action: "Agency policy · outbound quiet hours updated",
    kind: "Kill-switch",
    before: "Quiet hours off",
    after: "Quiet hours 09:00–20:00",
    surface: "Founder & agency controls",
  },
  {
    id: "ev-4",
    at: "Yesterday · 09:12",
    firm: DEMO_FIRMS[0].name,
    actor: "ops.lena",
    action: "Open-box Publish version · Immigration constants",
    kind: "Publish version",
    before: "v2026.03.1",
    after: "v2026.03.2 published",
    surface: "Reference data",
  },
  {
    id: "ev-5",
    at: "Mon · 18:03",
    firm: DEMO_FIRMS[3].name,
    actor: "support.kai",
    action: "Support context attached to ticket SUP-184",
    kind: "Support",
    before: "Ticket unscoped",
    after: "Firm scope · Atlas Mobility",
    surface: "Customer support",
  },
  {
    id: "ev-6",
    at: "Mon · 10:44",
    firm: DEMO_FIRMS[2].name,
    actor: "ops.lena",
    action: "Escrow terms · published terms-v1",
    kind: "Escrow terms",
    before: "Draft terms",
    after: "terms-v1 published",
    surface: "Commercial",
  },
  {
    id: "ev-7",
    at: "Sun · 15:20",
    firm: DEMO_FIRMS[1].name,
    actor: "ops.marco",
    action: "Provision · Harbor RCIC Desk minted",
    kind: "Provision",
    before: "—",
    after: "Tenancy + consultant-owner seed",
    surface: "Provision",
  },
] as const;

const ACTORS = ["All actors", "ops.lena", "ops.marco", "founder", "support.kai"] as const;
const OPERATIONS = [
  "All operations",
  "Publish version",
  "Bind packs",
  "Kill-switch",
  "Escrow terms",
  "Provision",
  "Activation",
  "Support",
] as const;

export function AuditTrailModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Audit trail", focusedEntry, hoveredEntry);
  const [firmFilter, setFirmFilter] = useState("All firms");
  const [actorFilter, setActorFilter] = useState<(typeof ACTORS)[number]>("All actors");
  const [opFilter, setOpFilter] = useState<(typeof OPERATIONS)[number]>("All operations");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Audit trail") return;
    if (focusedEntry.label === "Change event" || focusedEntry.label === "Change event list") {
      setSelectedId(EVENTS[0].id);
    }
  }, [focusedEntry]);

  const filtered = useMemo(
    () =>
      EVENTS.filter((ev) => {
        if (firmFilter !== "All firms" && ev.firm !== firmFilter) return false;
        if (actorFilter !== "All actors" && ev.actor !== actorFilter) return false;
        if (opFilter !== "All operations" && ev.kind !== opFilter) return false;
        return true;
      }),
    [firmFilter, actorFilter, opFilter],
  );

  const selected = filtered.find((e) => e.id === selectedId) ?? null;
  const filterChips = [
    firmFilter !== "All firms" ? { label: "Firm", value: firmFilter } : null,
    actorFilter !== "All actors" ? { label: "Actor", value: actorFilter } : null,
    opFilter !== "All operations" ? { label: "Operation", value: opFilter } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <RegisterSurfaceMount
      label="Audit trail"
      focused={focus.focused && focusedEntry?.label === "Audit trail"}
      hovered={hoveredEntry?.label === "Audit trail"}
      t={t}
      style={{ position: "relative" }}
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
              flexWrap: "wrap",
            }}
          >
            <div data-register-surface="Firm filter">
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Firm filter</div>
              <select
                value={firmFilter}
                onChange={(e) => setFirmFilter(e.target.value)}
                style={{
                  ...filterSelectStyle(t),
                  outline:
                    focus.labelFocused("Firm filter") || focus.labelHovered("Firm filter")
                      ? `2px solid ${t.accent}`
                      : "none",
                }}
              >
                <option>All firms</option>
                {DEMO_FIRMS.map((f) => (
                  <option key={f.id}>{f.name}</option>
                ))}
                <option>House-global</option>
              </select>
            </div>
            <div data-register-surface="Actor filter">
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Actor filter</div>
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value as (typeof ACTORS)[number])}
                style={{
                  ...filterSelectStyle(t),
                  outline:
                    focus.labelFocused("Actor filter") || focus.labelHovered("Actor filter")
                      ? `2px solid ${t.accent}`
                      : "none",
                }}
              >
                {ACTORS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div data-register-surface="Operation filter">
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Operation filter</div>
              <select
                value={opFilter}
                onChange={(e) => setOpFilter(e.target.value as (typeof OPERATIONS)[number])}
                style={{
                  ...filterSelectStyle(t),
                  outline:
                    focus.labelFocused("Operation filter") || focus.labelHovered("Operation filter")
                      ? `2px solid ${t.accent}`
                      : "none",
                }}
              >
                {OPERATIONS.map((op) => (
                  <option key={op}>{op}</option>
                ))}
              </select>
            </div>
          </div>

          {filterChips.length > 0 ? (
            <div
              data-register-surface="Filter chips"
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                padding: "8px 16px",
                borderBottom: `1px solid ${t.border}`,
                background: t.hoverBg,
                outline:
                  focus.labelFocused("Filter chips") || focus.labelHovered("Filter chips")
                    ? `2px solid ${t.accent}`
                    : "none",
                outlineOffset: -2,
              }}
            >
              {filterChips.map((chip) => (
                <span
                  key={chip.label}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 3,
                    background: t.bgPrimary,
                    border: `1px solid ${t.border}`,
                    color: t.textPrimary,
                  }}
                >
                  {chip.label}: {chip.value}
                </span>
              ))}
            </div>
          ) : null}

          <div
            data-register-surface="Change event list"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 12,
              outline:
                focus.labelFocused("Change event list") || focus.labelHovered("Change event list")
                  ? `2px solid ${t.accent}`
                  : "none",
              outlineOffset: -2,
            }}
          >
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
                    onClick={() => {
                      setSelectedId(ev.id);
                      setJumpNote(null);
                    }}
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
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{ev.action}</span>
                      {statusChip(t, ev.kind, "muted")}
                    </div>
                    <div
                      data-register-surface="Affected-surface chips"
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 6,
                      }}
                    >
                      {statusChip(t, ev.surface, "accent")}
                      {statusChip(t, ev.firm, "muted")}
                      {statusChip(t, ev.actor, "muted")}
                      {statusChip(t, ev.at, "muted")}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>,
      )}

      {selected
        ? operatorModal(
            t,
            "Change event",
            "Change event",
            focus.labelFocused("Change event"),
            focus.labelHovered("Change event"),
            () => setSelectedId(null),
            <>
              <dl
                style={{
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
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
                <dt style={{ color: t.textDim }}>Surface</dt>
                <dd style={{ margin: 0, color: t.textPrimary }}>{selected.surface}</dd>
                <dt style={{ color: t.textDim }}>Before</dt>
                <dd style={{ margin: 0, color: t.textMuted }}>{selected.before}</dd>
                <dt style={{ color: t.textDim }}>After</dt>
                <dd style={{ margin: 0, color: t.textPrimary }}>{selected.after}</dd>
                <dt style={{ color: t.textDim }}>Operation</dt>
                <dd style={{ margin: 0, color: t.textPrimary }}>{selected.action}</dd>
              </dl>
              {jumpNote ? (
                <div style={{ marginTop: 10, fontSize: 11, color: t.accent }}>{jumpNote}</div>
              ) : null}
            </>,
            <>
              <button
                type="button"
                data-register-surface="Jump to affected surface"
                style={secondaryBtnStyle(t)}
                onClick={() =>
                  setJumpNote(
                    `Jump to ${selected.surface}${
                      selected.firm !== "House-global" ? ` · firm ${selected.firm}` : ""
                    }`,
                  )
                }
              >
                Jump to {selected.surface}
              </button>
              <button type="button" style={secondaryBtnStyle(t)} onClick={() => setSelectedId(null)}>
                Close
              </button>
            </>,
          )
        : null}
    </RegisterSurfaceMount>
  );
}
