/**
 * Activation state — Progress checklist (leaf 1.3): forward-deployed,
 * authorize-book, escrow-held, running + Jump links (op-furnish-02).
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type GateId = "forward-deployed" | "authorize-book" | "escrow-held" | "running";

type Gate = { id: GateId; title: string; done: boolean; jump?: string };

const ACTIVATION_ROWS = [
  {
    firmId: DEMO_FIRMS[1].id,
    pct: 50,
    next: "Authorize book",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: true, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
  {
    firmId: DEMO_FIRMS[2].id,
    pct: 75,
    next: "Escrow held",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: true, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: true },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
  {
    firmId: DEMO_FIRMS[3].id,
    pct: 25,
    next: "Forward-deployed",
    gates: [
      { id: "forward-deployed", title: "Forward-deployed", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "authorize-book", title: "Authorize book", done: false, jump: "Jump to Activation & forward-deploy" },
      { id: "escrow-held", title: "Escrow held", done: false, jump: "Jump to Commercial" },
      { id: "running", title: "Running", done: false },
    ] satisfies Gate[],
  },
] as const;

export function ActivationStateModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Activation state", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(ACTIVATION_ROWS[0].firmId);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Activation state") return;
    if (
      focusedEntry.label === "Progress" ||
      focusedEntry.label === "Activation state" ||
      focusedEntry.label === "Progress Jump"
    ) {
      setSelectedId(ACTIVATION_ROWS[0].firmId);
    }
  }, [focusedEntry]);

  const row = ACTIVATION_ROWS.find((r) => r.firmId === selectedId) ?? ACTIVATION_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[1];
  const stalledCount = row.gates.filter((g) => !g.done && g.jump).length;

  return (
    <RegisterSurfaceMount
      label="Activation state"
      focused={focus.focused && focusedEntry?.label === "Activation state"}
      hovered={hoveredEntry?.label === "Activation state"}
      t={t}
    >
      {panelShell(
        t,
        "Activation state",
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
            <div style={sectionLabelStyle(t)}>Firms in activation</div>
            {ACTIVATION_ROWS.map((r) => {
              const f = DEMO_FIRMS.find((d) => d.id === r.firmId)!;
              return (
                <button
                  key={r.firmId}
                  type="button"
                  onClick={() => {
                    setSelectedId(r.firmId);
                    setJumpNote(null);
                  }}
                  style={navBtnStyle(t, r.firmId === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {r.pct}% · next {r.next}
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
            <div style={{ fontSize: 12, color: t.textMuted, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span>
                Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong> · {firm.stage}
              </span>
              {stalledCount > 0
                ? statusChip(t, `${stalledCount} stalled · Jump available`, "amber")
                : statusChip(t, "Gates clear", "success")}
            </div>
            {jumpNote ? (
              <div style={{ fontSize: 11, color: t.accent }}>Opened · {jumpNote}</div>
            ) : null}

            {surfaceBlock(
              t,
              "Progress",
              focus.labelFocused("Progress") ||
                focus.labelFocused("Progress Jump") ||
                focusedEntry?.label === "Activation state",
              focus.labelHovered("Progress") || focus.labelHovered("Progress Jump"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Progress</span>
                  {statusChip(t, `${row.pct}%`, "amber")}
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  View checklist rows for this firm. On stalled authorize-book or escrow-held rows,
                  Jump to Activation &amp; forward-deploy or Jump to Commercial. Running opens only
                  when authorize-book and escrow-held are both green. Operator does not fake-complete
                  consultant commits.
                </p>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: t.hoverBg,
                    overflow: "hidden",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ width: `${row.pct}%`, height: "100%", background: t.accent }} />
                </div>
                <ol
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {row.gates.map((gate, i) => (
                    <li
                      key={gate.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        background: t.bgPrimary,
                        border: `1px solid ${!gate.done && gate.jump ? t.amber : t.border}`,
                        borderRadius: 4,
                        padding: "9px 11px",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: gate.done ? t.accentBg : t.hoverBg,
                          color: gate.done ? t.accent : t.textDim,
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {gate.done ? "✓" : i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: gate.done ? t.textPrimary : t.textMuted,
                          }}
                        >
                          {gate.title}
                        </div>
                        {statusChip(
                          t,
                          gate.done ? "complete" : "pending",
                          gate.done ? "success" : "amber",
                        )}
                      </div>
                      {!gate.done && gate.jump ? (
                        <button
                          type="button"
                          data-register-surface="Progress Jump"
                          onClick={() => setJumpNote(gate.jump!)}
                          style={secondaryBtnStyle(t)}
                        >
                          {gate.jump}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
