/**
 * Firm operations bind — firm-bind index → Bind packs modal → Armed / Active segmented control.
 */
import { useMemo, useState } from "react";
import type { Tokens } from "../../../components/tokens";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  type ConfigPack,
  packLabel,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
} from "./operatorChrome";

type Posture = "Armed" | "Active";

type FirmBindState = {
  firmId: string;
  evalPackId: string | null;
  autoPackId: string | null;
  engPackId: string | null;
  posture: Posture;
};

function seedBindRows(): FirmBindState[] {
  return [
    {
      firmId: DEMO_FIRMS[0].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "auto-welcome",
      engPackId: "eng-optin",
      posture: "Active",
    },
    {
      firmId: DEMO_FIRMS[1].id,
      evalPackId: "eval-soft-v1",
      autoPackId: "auto-book",
      engPackId: "eng-nudge",
      posture: "Armed",
    },
    {
      firmId: DEMO_FIRMS[2].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "auto-welcome",
      engPackId: "eng-optin",
      posture: "Armed",
    },
    {
      firmId: DEMO_FIRMS[3].id,
      evalPackId: null,
      autoPackId: null,
      engPackId: null,
      posture: "Armed",
    },
  ];
}

function isBound(row: FirmBindState): boolean {
  return Boolean(row.evalPackId && row.autoPackId && row.engPackId);
}

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
  const [packs] = useState<ConfigPack[]>(seedConfigPacks);
  const [rows, setRows] = useState<FirmBindState[]>(seedBindRows);
  const [selectedId, setSelectedId] = useState(rows[0].firmId);
  const [bindOpen, setBindOpen] = useState(false);
  const [pickEval, setPickEval] = useState("");
  const [pickAuto, setPickAuto] = useState("");
  const [pickEng, setPickEng] = useState("");

  const row = rows.find((r) => r.firmId === selectedId) ?? rows[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const bound = isBound(row);

  const evalOptions = useMemo(() => publishedPacks("evaluation", packs), [packs]);
  const autoOptions = useMemo(() => publishedPacks("automation", packs), [packs]);
  const engOptions = useMemo(() => publishedPacks("engagement", packs), [packs]);

  const boundPacks = useMemo(() => {
    const find = (id: string | null) => packs.find((p) => p.id === id);
    return {
      eval: find(row.evalPackId),
      auto: find(row.autoPackId),
      eng: find(row.engPackId),
    };
  }, [packs, row]);

  function openBindModal() {
    setPickEval(row.evalPackId ?? evalOptions[0]?.id ?? "");
    setPickAuto(row.autoPackId ?? autoOptions[0]?.id ?? "");
    setPickEng(row.engPackId ?? engOptions[0]?.id ?? "");
    setBindOpen(true);
  }

  function onBind() {
    if (!pickEval || !pickAuto || !pickEng) return;
    setRows((prev) =>
      prev.map((r) =>
        r.firmId === row.firmId
          ? { ...r, evalPackId: pickEval, autoPackId: pickAuto, engPackId: pickEng }
          : r,
      ),
    );
    setBindOpen(false);
  }

  function setPosture(posture: Posture) {
    if (!bound) return;
    setRows((prev) =>
      prev.map((r) => (r.firmId === row.firmId ? { ...r, posture } : r)),
    );
  }

  const canBind = Boolean(pickEval && pickAuto && pickEng);
  const selectStyle = { ...filterSelectStyle(t), width: "100%", minWidth: 0, boxSizing: "border-box" as const };

  return (
    <RegisterSurfaceMount
      label="Firm operations bind"
      focused={focus.focused && focusedEntry?.label === "Firm operations bind"}
      hovered={hoveredEntry?.label === "Firm operations bind"}
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
            <div style={sectionLabelStyle(t)}>Firm-bind index</div>
            <div data-register-surface="Firm-bind index">
              {rows.map((r) => {
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
                      {isBound(r) ? `${r.posture} · 3 packs` : "Unbound"}
                    </div>
                  </button>
                );
              })}
            </div>
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

            {surfaceBlock(
              t,
              "Bind packs",
              focus.labelFocused("Bind packs"),
              focus.labelHovered("Bind packs"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Bind packs
                  </span>
                  <button type="button" onClick={openBindModal} style={secondaryBtnStyle(t)}>
                    Bind packs
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  House-authored published versions only — drafts from Configuration libraries omitted.
                </p>
                {bound ? (
                  <div
                    data-register-surface="Bound-version chips"
                    style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                  >
                    {boundPacks.eval ? statusChip(t, packLabel(boundPacks.eval), "muted") : null}
                    {boundPacks.auto ? statusChip(t, packLabel(boundPacks.auto), "muted") : null}
                    {boundPacks.eng ? statusChip(t, packLabel(boundPacks.eng), "muted") : null}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: t.textDim }}>No packs bound — open Bind packs</span>
                )}
              </>,
            )}

            {surfaceBlock(
              t,
              "Armed / Active",
              focus.labelFocused("Armed / Active"),
              focus.labelHovered("Armed / Active"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Armed / Active
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Armed = bound packs ready (no contact-facing sends). Active = execution on. Disabled
                  until three bound versions exist.
                </p>
                <div style={{ display: "flex", gap: 0, borderRadius: 4, overflow: "hidden", border: `1px solid ${t.border}` }}>
                  {(["Armed", "Active"] as Posture[]).map((p) => {
                    const active = row.posture === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={!bound}
                        onClick={() => setPosture(p)}
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          padding: "8px 12px",
                          border: "none",
                          cursor: bound ? "pointer" : "not-allowed",
                          background: active ? t.accent : t.bgPrimary,
                          color: active ? "#fff" : bound ? t.textPrimary : t.textDim,
                          opacity: bound ? 1 : 0.55,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}

      {bindOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setBindOpen(false)}
        >
          <div
            data-register-surface="Bind packs"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 18,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
              Bind packs
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: t.textMuted }}>
              {firm.name} — select three published versions from Configuration libraries.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label data-register-surface="Evaluation pack version">
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
                  Evaluation pack
                </span>
                <select value={pickEval} onChange={(e) => setPickEval(e.target.value)} style={selectStyle}>
                  <option value="">Select published version…</option>
                  {evalOptions.map((p) => (
                    <option key={p.id} value={p.id}>{packLabel(p)}</option>
                  ))}
                </select>
              </label>
              <label data-register-surface="Automation pack version">
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
                  Automation pack
                </span>
                <select value={pickAuto} onChange={(e) => setPickAuto(e.target.value)} style={selectStyle}>
                  <option value="">Select published version…</option>
                  {autoOptions.map((p) => (
                    <option key={p.id} value={p.id}>{packLabel(p)}</option>
                  ))}
                </select>
              </label>
              <label data-register-surface="Engagement template version">
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
                  Engagement template
                </span>
                <select value={pickEng} onChange={(e) => setPickEng(e.target.value)} style={selectStyle}>
                  <option value="">Select published version…</option>
                  {engOptions.map((p) => (
                    <option key={p.id} value={p.id}>{packLabel(p)}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                data-register-surface="Bind"
                disabled={!canBind}
                onClick={onBind}
                style={primaryBtnStyle(t, !canBind)}
              >
                Bind
              </button>
              <button type="button" onClick={() => setBindOpen(false)} style={secondaryBtnStyle(t)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RegisterSurfaceMount>
  );
}
