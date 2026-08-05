/**
 * Oversight — Fleet health firm table + Firm row drill cue.
 */
import { useEffect, useMemo, useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  chipTone,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const FLEET_ROWS = [
  {
    firmId: DEMO_FIRMS[0].id,
    deliverability: "Healthy",
    sequence: "Healthy",
    engagement: "Watch",
    lastRun: "Today · 14:02",
  },
  {
    firmId: DEMO_FIRMS[1].id,
    deliverability: "Healthy",
    sequence: "Watch",
    engagement: "Watch",
    lastRun: "Today · 13:48",
  },
  {
    firmId: DEMO_FIRMS[2].id,
    deliverability: "Healthy",
    sequence: "Healthy",
    engagement: "Healthy",
    lastRun: "Today · 12:15",
  },
  {
    firmId: DEMO_FIRMS[3].id,
    deliverability: "Watch",
    sequence: "At risk",
    engagement: "At risk",
    lastRun: "Today · 11:52",
  },
] as const;

function isUnhealthy(row: (typeof FLEET_ROWS)[number]) {
  return (
    row.deliverability !== "Healthy" ||
    row.sequence !== "Healthy" ||
    row.engagement !== "Healthy"
  );
}

export function OversightModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Oversight", focusedEntry, hoveredEntry);
  const [sortBy, setSortBy] = useState("Last run");
  const [healthFilter, setHealthFilter] = useState("All signals");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Oversight") return;
    if (focusedEntry.label === "Firm row" || focusedEntry.label === "Fleet health") {
      setSelectedId(FLEET_ROWS.find(isUnhealthy)?.firmId ?? FLEET_ROWS[0].firmId);
    }
  }, [focusedEntry]);

  const rows = useMemo(() => {
    let list = [...FLEET_ROWS];
    if (healthFilter === "Unhealthy only") list = list.filter(isUnhealthy);
    if (sortBy === "Firm name") {
      list.sort((a, b) => {
        const fa = DEMO_FIRMS.find((f) => f.id === a.firmId)!.name;
        const fb = DEMO_FIRMS.find((f) => f.id === b.firmId)!.name;
        return fa.localeCompare(fb);
      });
    }
    return list;
  }, [sortBy, healthFilter]);

  const selected = selectedId
    ? DEMO_FIRMS.find((f) => f.id === selectedId)
    : null;
  const selectedRow = selectedId
    ? FLEET_ROWS.find((r) => r.firmId === selectedId)
    : null;
  const unhealthyCount = FLEET_ROWS.filter(isUnhealthy).length;

  return (
    <RegisterSurfaceMount
      label="Oversight"
      focused={focus.focused && focusedEntry?.label === "Oversight"}
      hovered={hoveredEntry?.label === "Oversight"}
      t={t}
      style={{ position: "relative" }}
    >
      {panelShell(
        t,
        "Oversight",
        statusChip(t, "cross-firm"),
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
            "Fleet health",
            focus.labelFocused("Fleet health"),
            focus.labelHovered("Fleet health"),
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  Fleet health
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span data-register-surface="Unhealthy firm count">
                    {statusChip(
                      t,
                      `${unhealthyCount} unhealthy`,
                      unhealthyCount > 0 ? "danger" : "success",
                    )}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={filterSelectStyle(t)}
                    aria-label="Sort firms"
                  >
                    <option>Last run</option>
                    <option>Firm name</option>
                  </select>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    style={filterSelectStyle(t)}
                    aria-label="Filter health"
                  >
                    <option>All signals</option>
                    <option>Unhealthy only</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: t.bgPrimary,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr repeat(3, 0.7fr) 0.9fr",
                    gap: 8,
                    padding: "8px 12px",
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: t.textDim,
                  }}
                >
                  <span>Firm</span>
                  <span>Deliverability</span>
                  <span>Sequence</span>
                  <span>Engagement</span>
                  <span>Last run</span>
                </div>
                {rows.map((row) => {
                  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId)!;
                  const active = row.firmId === selectedId;
                  return (
                    <div
                      key={row.firmId}
                      data-register-surface="Firm row"
                      onClick={() => setSelectedId(row.firmId)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr repeat(3, 0.7fr) 0.9fr",
                        gap: 8,
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        background: active ? t.accentBg : "transparent",
                        outline:
                          (focus.labelFocused("Firm row") || focus.labelHovered("Firm row")) &&
                          active
                            ? `2px solid ${t.accent}`
                            : "none",
                        outlineOffset: -2,
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                          {firm.name}
                        </div>
                        <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                          {firm.stage}
                        </div>
                      </div>
                      <div style={{ alignSelf: "center" }}>
                        {statusChip(t, row.deliverability, chipTone(row.deliverability))}
                      </div>
                      <div style={{ alignSelf: "center" }}>
                        {statusChip(t, row.sequence, chipTone(row.sequence))}
                      </div>
                      <div style={{ alignSelf: "center" }}>
                        {statusChip(t, row.engagement, chipTone(row.engagement))}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: t.textMuted,
                          alignSelf: "center",
                        }}
                      >
                        {row.lastRun}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selected && selectedRow && isUnhealthy(selectedRow) ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    borderRadius: 4,
                    background: t.amberBg,
                    border: `1px solid ${t.amber}`,
                    fontSize: 12,
                    color: t.textPrimary,
                  }}
                >
                  Drill cue · <strong>{selected.name}</strong> — open Firm health for Sequence
                  health, Engagement health, and Sequence detail (firm scope preserved).
                </div>
              ) : null}
            </>,
          )}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
