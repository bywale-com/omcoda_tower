/**
 * Register & evolution — Gaps list with Theory (SME) deep-link + Regenerate handoff.
 */
import { useEffect, useMemo, useState } from "react";
import { useRegisterSelection } from "../../context/RegisterSelectionContext";
import { SME_SEATS } from "../../theory/sme";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type GapRow = {
  seatId: string;
  seatLabel: string;
  itemId: string;
  consideration: string;
  thesisGap: string;
  plant: string;
};

function collectGaps(): GapRow[] {
  const rows: GapRow[] = [];
  for (const seat of SME_SEATS) {
    for (const item of seat.items) {
      if (item.implementationPlant === "planted") continue;
      rows.push({
        seatId: seat.id,
        seatLabel: seat.label,
        itemId: item.id,
        consideration: item.consideration,
        thesisGap: item.thesisGap,
        plant: item.implementationPlant ?? "not_done",
      });
      if (rows.length >= 24) return rows;
    }
  }
  return rows;
}

export function RegisterEvolutionModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Register & evolution", focusedEntry, hoveredEntry);
  const { selectSmeItem } = useRegisterSelection();
  const gaps = useMemo(() => collectGaps(), []);
  const [selectedKey, setSelectedKey] = useState(
    () => (gaps[0] ? `${gaps[0].seatId}:${gaps[0].itemId}` : ""),
  );
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Register & evolution") return;
    if (focusedEntry.label === "Gaps" || focusedEntry.label === "Gap") {
      if (gaps[0]) setSelectedKey(`${gaps[0].seatId}:${gaps[0].itemId}`);
    }
  }, [focusedEntry, gaps]);

  const selected = gaps.find((g) => `${g.seatId}:${g.itemId}` === selectedKey) ?? gaps[0] ?? null;

  return (
    <RegisterSurfaceMount
      label="Register & evolution"
      focused={focus.focused && focusedEntry?.label === "Register & evolution"}
      hovered={hoveredEntry?.label === "Register & evolution"}
      t={t}
    >
      {panelShell(
        t,
        "Register & evolution",
        statusChip(t, "methodology"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Gaps</div>
            <div data-register-surface="Gaps">
              {gaps.map((gap) => {
                const key = `${gap.seatId}:${gap.itemId}`;
                return (
                  <button
                    key={key}
                    type="button"
                    data-register-surface="Gap"
                    onClick={() => setSelectedKey(key)}
                    style={{
                      ...navBtnStyle(t, key === selectedKey),
                      outline:
                        (focus.labelFocused("Gap") || focus.labelHovered("Gap")) &&
                        key === selectedKey
                          ? `2px solid ${t.accent}`
                          : undefined,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 11 }}>{gap.itemId}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: t.textMuted,
                        marginTop: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {gap.consideration}
                    </div>
                  </button>
                );
              })}
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
            {selected ? (
              surfaceBlock(
                t,
                "Gap",
                focus.labelFocused("Gap") ||
                  focusedEntry?.label === "Gaps" ||
                  focusedEntry?.label === "Register & evolution",
                focus.labelHovered("Gap"),
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
                      {selected.itemId} · Gap
                    </span>
                    {statusChip(t, selected.plant.replace("_", " "), "amber")}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>
                    Seat · {selected.seatLabel}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textPrimary }}>
                    {selected.consideration}
                  </p>
                  <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
                    {selected.thesisGap}
                  </p>
                  <button
                    type="button"
                    style={primaryBtnStyle(t)}
                    onClick={() => selectSmeItem(selected.seatId, selected.itemId)}
                  >
                    Open in Theory · SME
                  </button>
                </>,
              )
            ) : (
              <div style={{ fontSize: 12, color: t.textMuted }}>No open gaps in SME seats.</div>
            )}

            {surfaceBlock(
              t,
              "Regenerate handoff",
              focus.labelFocused("Regenerate handoff"),
              focus.labelHovered("Regenerate handoff"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Regenerate handoff
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Refresh PM handoff notes from open gaps and implementation plant status. Product
                  ship has no firm Register — this stays methodology tooling.
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    onClick={() =>
                      setHandoffNote(`Handoff draft refreshed · ${gaps.length} open gaps`)
                    }
                  >
                    Regenerate handoff
                  </button>
                  {handoffNote ? (
                    <span style={{ fontSize: 11, color: t.accent }}>{handoffNote}</span>
                  ) : null}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
