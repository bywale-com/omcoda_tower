/**
 * Register & evolution — Gaps catalog, Gap modal, Written toggle, Regenerate handoff.
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  operatorModal,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type GapRow = {
  id: string;
  summary: string;
  ticket?: string;
  firm?: string;
  source?: string;
  written: boolean;
};

const SEED_GAPS: GapRow[] = [
  {
    id: "gap-seq-silence",
    summary: "Sequence silence clock not visible on Fleet health — Atlas stuck 9 contacts unnoticed.",
    ticket: "SUP-184",
    firm: "Atlas Mobility",
    source: "Firm health",
    written: false,
  },
  {
    id: "gap-bind-gate",
    summary: "Bind pack commit lacks before/after on Audit trail for Send gate reviewers.",
    firm: "Cedar Pathways",
    source: "Firm operations bind",
    written: true,
  },
  {
    id: "gap-approach-cap",
    summary: "Approach click budget bound not enforced when firm re-binds mid-campaign.",
    source: "Acquisition & ads",
    written: false,
  },
];

const SOURCE_SURFACES = [
  "Oversight",
  "Firm health",
  "Customer support",
  "Firm operations bind",
  "Acquisition & ads",
  "Commercial",
  "Activation & forward-deploy",
] as const;

export function RegisterEvolutionModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Register & evolution", focusedEntry, hoveredEntry);
  const [gaps, setGaps] = useState<GapRow[]>(SEED_GAPS);
  const [selectedId, setSelectedId] = useState(SEED_GAPS[0].id);
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [editingNew, setEditingNew] = useState(false);
  const [formSummary, setFormSummary] = useState("");
  const [formTicket, setFormTicket] = useState("");
  const [formFirm, setFormFirm] = useState("");
  const [formSource, setFormSource] = useState("");
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  const selected = gaps.find((g) => g.id === selectedId) ?? gaps[0] ?? null;

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Register & evolution") return;
    if (focusedEntry.label === "Gap" || focusedEntry.label === "Gaps") {
      setGapModalOpen(true);
      if (gaps[0]) setSelectedId(gaps[0].id);
    }
  }, [focusedEntry, gaps]);

  const openNewGap = () => {
    setEditingNew(true);
    setFormSummary("");
    setFormTicket("");
    setFormFirm("");
    setFormSource("");
    setGapModalOpen(true);
  };

  const openEditGap = (gap: GapRow) => {
    setEditingNew(false);
    setFormSummary(gap.summary);
    setFormTicket(gap.ticket ?? "");
    setFormFirm(gap.firm ?? "");
    setFormSource(gap.source ?? "");
    setSelectedId(gap.id);
    setGapModalOpen(true);
  };

  const saveGap = () => {
    if (!formSummary.trim()) return;
    if (editingNew) {
      const id = `gap-${Date.now()}`;
      const row: GapRow = {
        id,
        summary: formSummary.trim(),
        ticket: formTicket.trim() || undefined,
        firm: formFirm.trim() || undefined,
        source: formSource.trim() || undefined,
        written: false,
      };
      setGaps((prev) => [row, ...prev]);
      setSelectedId(id);
    } else if (selected) {
      setGaps((prev) =>
        prev.map((g) =>
          g.id === selected.id
            ? {
                ...g,
                summary: formSummary.trim(),
                ticket: formTicket.trim() || undefined,
                firm: formFirm.trim() || undefined,
                source: formSource.trim() || undefined,
              }
            : g,
        ),
      );
    }
    setGapModalOpen(false);
  };

  const toggleWritten = (gapId: string) => {
    setGaps((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, written: !g.written } : g)),
    );
  };

  return (
    <RegisterSurfaceMount
      label="Register & evolution"
      focused={focus.focused && focusedEntry?.label === "Register & evolution"}
      hovered={hoveredEntry?.label === "Register & evolution"}
      t={t}
      style={{ position: "relative" }}
    >
      {panelShell(
        t,
        "Register & evolution",
        statusChip(t, "house-only"),
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
              <button
                type="button"
                style={{
                  ...navBtnStyle(t, false),
                  fontWeight: 600,
                  color: t.accent,
                }}
                onClick={openNewGap}
              >
                + New gap
              </button>
              {gaps.map((gap) => (
                <button
                  key={gap.id}
                  type="button"
                  data-register-surface="Gap"
                  onClick={() => {
                    setSelectedId(gap.id);
                    openEditGap(gap);
                  }}
                  style={{
                    ...navBtnStyle(t, gap.id === selectedId),
                    outline:
                      (focus.labelFocused("Gap") || focus.labelHovered("Gap")) &&
                      gap.id === selectedId
                        ? `2px solid ${t.accent}`
                        : undefined,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 11 }}>{gap.id}</span>
                    {gap.written ? statusChip(t, "Written", "success") : null}
                  </div>
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
                    {gap.summary}
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
            {selected ? (
              surfaceBlock(
                t,
                "Gap",
                focus.labelFocused("Gap"),
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
                      {selected.id}
                    </span>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        color: t.textPrimary,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.written}
                        onChange={() => toggleWritten(selected.id)}
                      />
                      Affordance / backend facet · Written
                    </label>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, lineHeight: 1.5, color: t.textPrimary }}>
                    {selected.summary}
                  </p>
                  {selected.ticket ? (
                    <div style={{ fontSize: 11, color: t.textMuted }}>
                      Support ticket · {selected.ticket}
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    {selected.firm
                      ? statusChip(t, selected.firm, "muted")
                      : null}
                    {selected.source
                      ? statusChip(t, selected.source, "accent")
                      : null}
                  </div>
                  <button
                    type="button"
                    style={{ ...secondaryBtnStyle(t), marginTop: 12 }}
                    onClick={() => openEditGap(selected)}
                  >
                    Edit gap
                  </button>
                </>,
              )
            ) : (
              <div style={{ fontSize: 12, color: t.textMuted }}>No gaps logged.</div>
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
                  Writes handoff state for Configuration libraries authoring — never on the firm desk.
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    style={primaryBtnStyle(t)}
                    onClick={() =>
                      setHandoffNote(
                        `Handoff regenerated · ${gaps.filter((g) => g.written).length} Written gaps`,
                      )
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

      {gapModalOpen
        ? operatorModal(
            t,
            "Gap",
            editingNew ? "New gap" : "Gap",
            focus.labelFocused("Gap"),
            focus.labelHovered("Gap"),
            () => setGapModalOpen(false),
            <>
              <label style={{ display: "block", fontSize: 12, color: t.textPrimary, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Friction summary</div>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    fontSize: 12,
                    fontFamily: "inherit",
                    padding: "8px 10px",
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    background: t.bgPrimary,
                    color: t.textPrimary,
                    resize: "vertical",
                  }}
                />
              </label>
              <label style={{ display: "block", fontSize: 12, color: t.textPrimary, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                  Support ticket id (optional)
                </div>
                <input
                  value={formTicket}
                  onChange={(e) => setFormTicket(e.target.value)}
                  placeholder="SUP-184"
                  style={{
                    width: "100%",
                    fontSize: 12,
                    fontFamily: "inherit",
                    padding: "6px 8px",
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    background: t.bgPrimary,
                    color: t.textPrimary,
                  }}
                />
              </label>
              <div
                data-register-surface="Gap firm / source"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
              >
                <label style={{ display: "block", fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                    Firm tenancy
                  </div>
                  <select
                    value={formFirm}
                    onChange={(e) => setFormFirm(e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 12,
                      fontFamily: "inherit",
                      padding: "6px 8px",
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      background: t.bgPrimary,
                      color: t.textPrimary,
                    }}
                  >
                    <option value="">—</option>
                    {DEMO_FIRMS.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "block", fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                    Source surface
                  </div>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: 12,
                      fontFamily: "inherit",
                      padding: "6px 8px",
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      background: t.bgPrimary,
                      color: t.textPrimary,
                    }}
                  >
                    <option value="">—</option>
                    {SOURCE_SURFACES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            </>,
            <>
              <button type="button" style={secondaryBtnStyle(t)} onClick={() => setGapModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                data-register-surface="Save gap"
                disabled={!formSummary.trim()}
                style={{
                  ...primaryBtnStyle(t, !formSummary.trim()),
                  outline:
                    focus.labelFocused("Save gap") || focus.labelHovered("Save gap")
                      ? `2px solid ${t.textPrimary}`
                      : "none",
                }}
                onClick={saveGap}
              >
                Save gap
              </button>
            </>,
          )
        : null}
    </RegisterSurfaceMount>
  );
}
