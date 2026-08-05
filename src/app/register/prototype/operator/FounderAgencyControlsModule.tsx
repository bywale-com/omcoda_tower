/**
 * Founder & agency controls — Agency policy Bounds + Kill-switch modal.
 */
import { useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
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

type BoundRow = { key: string; value: string };

const DEFAULT_BOUNDS: BoundRow[] = [
  { key: "Approach click budget", value: "≤ 3 clicks to capture" },
  { key: "CASL triad", value: "Consent · identity · unsubscribe always on" },
  { key: "Escrow rail", value: "Firm↔Om Coda only — no client funds" },
  { key: "Authorship seat", value: "Configuration libraries · never firm Hub" },
];

const LAST_SAVED_SEED = {
  at: "Today · 11:05",
  actor: "founder",
};

export function FounderAgencyControlsModule({
  t,
  focusedEntry,
  hoveredId,
}: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Founder & agency controls", focusedEntry, hoveredEntry);
  const [bounds, setBounds] = useState<BoundRow[]>(DEFAULT_BOUNDS);
  const [lastSaved, setLastSaved] = useState(LAST_SAVED_SEED);
  const [killOpen, setKillOpen] = useState(false);
  const [killScopeMode, setKillScopeMode] = useState<"fleet" | "selected">("fleet");
  const [killReason, setKillReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [killed, setKilled] = useState(false);

  const updateBound = (index: number, value: string) => {
    setBounds((prev) => prev.map((row, i) => (i === index ? { ...row, value } : row)));
  };

  const selectedTargets = DEMO_FIRMS.slice(0, 3);
  const firmCount = killScopeMode === "fleet" ? DEMO_FIRMS.length : selectedTargets.length;
  const firmIds =
    killScopeMode === "fleet"
      ? DEMO_FIRMS.map((f) => f.name).join(" · ")
      : selectedTargets.map((f) => f.name).join(" · ");

  const closeKill = () => {
    setKillOpen(false);
    setConfirmStep(false);
  };

  return (
    <RegisterSurfaceMount
      label="Founder & agency controls"
      focused={focus.focused && focusedEntry?.label === "Founder & agency controls"}
      hovered={hoveredEntry?.label === "Founder & agency controls"}
      t={t}
      style={{ position: "relative" }}
    >
      {panelShell(
        t,
        "Founder & agency controls",
        statusChip(t, killed ? "halted" : "house-global", killed ? "danger" : "accent"),
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
            "Agency policy",
            focus.labelFocused("Agency policy"),
            focus.labelHovered("Agency policy"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                Agency policy
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Cross-firm limits, what may bind, and what may send — never on Consultant nav.
              </p>
              <div
                data-register-surface="Last-saved glance"
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {statusChip(t, `last-saved · ${lastSaved.at}`, "muted")}
                {statusChip(t, lastSaved.actor, "accent")}
              </div>

              <div data-register-surface="Bounds">
                <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Bounds
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bounds.map((row, index) => (
                    <div
                      key={row.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.2fr",
                        gap: 10,
                        alignItems: "center",
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                        outline:
                          (focus.labelFocused("Bounds") || focus.labelHovered("Bounds")) &&
                          index === 0
                            ? `2px solid ${t.accent}`
                            : "none",
                        outlineOffset: -2,
                      }}
                    >
                      <span style={{ fontSize: 12, color: t.textMuted }}>{row.key}</span>
                      <input
                        value={row.value}
                        onChange={(e) => updateBound(index, e.target.value)}
                        style={{
                          fontSize: 12,
                          fontFamily: "inherit",
                          padding: "6px 8px",
                          border: `1px solid ${t.border}`,
                          borderRadius: 4,
                          background: t.bgSecondary,
                          color: t.textPrimary,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  data-register-surface="Save policy"
                  style={{
                    ...primaryBtnStyle(t),
                    outline:
                      focus.labelFocused("Save policy") || focus.labelHovered("Save policy")
                        ? `2px solid ${t.textPrimary}`
                        : "none",
                  }}
                  onClick={() =>
                    setLastSaved({
                      at: new Date().toLocaleTimeString(),
                      actor: "founder",
                    })
                  }
                >
                  Save policy
                </button>
              </div>
            </>,
          )}

          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgSecondary,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                Kill-switch
              </span>
              {statusChip(t, killed ? "halted" : "standby", killed ? "danger" : "muted")}
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
              Halts outbound and Approach spend — fleet-wide or selected tenancies.
            </p>
            <button
              type="button"
              style={secondaryBtnStyle(t)}
              onClick={() => {
                setConfirmStep(false);
                setKillOpen(true);
              }}
            >
              Open Kill-switch
            </button>
          </div>
        </div>,
      )}

      {killOpen || focus.labelFocused("Kill-switch")
        ? operatorModal(
            t,
            "Kill-switch",
            confirmStep ? "Confirm Halt motion" : "Kill-switch",
            focus.labelFocused("Kill-switch"),
            focus.labelHovered("Kill-switch"),
            closeKill,
            confirmStep ? (
              <div data-register-surface="Kill-switch confirmation">
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Review scope and reason before Halt writes Audit trail and engagement runners
                  honor the kill-switch state.
                </p>
                <dl
                  style={{
                    margin: 0,
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: "8px 10px",
                    fontSize: 12,
                  }}
                >
                  <dt style={{ color: t.textDim }}>Scope</dt>
                  <dd style={{ margin: 0, color: t.textPrimary }}>
                    {killScopeMode === "fleet" ? "Fleet-wide" : "Selected tenancies"}
                  </dd>
                  <dt style={{ color: t.textDim }}>Firm count</dt>
                  <dd style={{ margin: 0, color: t.textPrimary }}>{firmCount}</dd>
                  <dt style={{ color: t.textDim }}>Firms</dt>
                  <dd style={{ margin: 0, color: t.textMuted }}>{firmIds}</dd>
                  <dt style={{ color: t.textDim }}>Reason</dt>
                  <dd style={{ margin: 0, color: t.textPrimary }}>{killReason.trim()}</dd>
                  <dt style={{ color: t.textDim }}>Audit preview</dt>
                  <dd style={{ margin: 0, color: t.textMuted }}>
                    Kill-switch · {killScopeMode} · {firmCount} firms · actor founder
                  </dd>
                </dl>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 10, color: t.textDim, marginBottom: 8 }}>Scope</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setKillScopeMode("fleet")}
                    style={{
                      textAlign: "left",
                      fontFamily: "inherit",
                      background: killScopeMode === "fleet" ? t.accentBg : t.bgSecondary,
                      color: t.textPrimary,
                      border: `1px solid ${killScopeMode === "fleet" ? t.accent : t.border}`,
                      borderRadius: 4,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Fleet-wide</div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>
                      All firm outbound + Approach spend
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKillScopeMode("selected")}
                    style={{
                      textAlign: "left",
                      fontFamily: "inherit",
                      background: killScopeMode === "selected" ? t.accentBg : t.bgSecondary,
                      color: t.textPrimary,
                      border: `1px solid ${killScopeMode === "selected" ? t.accent : t.border}`,
                      borderRadius: 4,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Selected tenancies</div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>
                      Named firm targets only
                    </div>
                  </button>
                </div>

                {killScopeMode === "selected" ? (
                  <div style={{ marginBottom: 14, fontSize: 11, color: t.textMuted }}>
                    Targets · {selectedTargets.map((f) => f.name).join(" · ")}
                  </div>
                ) : null}

                <label style={{ display: "block", fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Reason</div>
                  <textarea
                    value={killReason}
                    onChange={(e) => setKillReason(e.target.value)}
                    rows={3}
                    placeholder="Policy enforcement or emergency reason…"
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
              </>
            ),
            confirmStep ? (
              <>
                <button type="button" style={secondaryBtnStyle(t)} onClick={() => setConfirmStep(false)}>
                  Back
                </button>
                <button
                  type="button"
                  style={primaryBtnStyle(t)}
                  onClick={() => {
                    setKilled(true);
                    closeKill();
                  }}
                >
                  Halt motion
                </button>
              </>
            ) : (
              <>
                <button type="button" style={secondaryBtnStyle(t)} onClick={closeKill}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!killReason.trim()}
                  style={primaryBtnStyle(t, !killReason.trim())}
                  onClick={() => setConfirmStep(true)}
                >
                  Review confirmation
                </button>
              </>
            ),
          )
        : null}
    </RegisterSurfaceMount>
  );
}
