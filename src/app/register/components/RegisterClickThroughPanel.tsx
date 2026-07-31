/**
 * Click-through panel — HQ hierarchy: flex:1 beside fixed theory strip.
 * Body: hi-fi RegisterPrototypeCanvas. Wiring flow steps may temporarily
 * inhabit this panel when a wiring step is selected.
 * Tower tokens + Inter.
 */
import type { Tokens } from "../../components/tokens";
import { RegisterFlowStepCanvas } from "../flowCanvas/RegisterFlowStepCanvas";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { useRegisterShell, type CtDeskId } from "../context/RegisterShellContext";
import { RegisterPrototypeCanvas } from "../prototype/RegisterPrototypeCanvas";
import { ShellHideButton, ShellShowButton } from "./RegisterShellChrome";

type RegisterClickThroughPanelProps = {
  t: Tokens;
  isDark: boolean;
};

function deskTabStyle(t: Tokens, active: boolean) {
  return {
    padding: "4px 10px",
    border: `1px solid ${active ? t.accent : t.border}`,
    borderRadius: 4,
    background: active ? t.accentBg : t.bgSecondary,
    color: active ? t.accent : t.textMuted,
    fontSize: 12,
    fontWeight: 500 as const,
    fontFamily: "inherit" as const,
    cursor: "pointer" as const,
  };
}

const DESK_TABS: { id: CtDeskId; label: string }[] = [
  { id: "consultant", label: "Consultant" },
  { id: "operator", label: "Operator" },
  { id: "contact", label: "Contact" },
];

export function RegisterClickThroughPanel({ t, isDark }: RegisterClickThroughPanelProps) {
  const {
    setCtVisible,
    ctDesk,
    setCtDesk,
    railVisible,
    theoryVisible,
    setRailVisible,
    setTheoryVisible,
  } = useRegisterShell();
  const { registerPassId, activeFlowStepId } = useRegisterSelection();

  const showFlowStepCanvas = registerPassId === "wiring" && activeFlowStepId != null;

  return (
    <section
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: t.hoverBg,
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", color: t.textPrimary }}>
            {showFlowStepCanvas ? "Flow step" : "Click-through"}
          </span>
          {!showFlowStepCanvas ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DESK_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCtDesk(id)}
                  style={deskTabStyle(t, ctDesk === id)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {!railVisible ? (
            <ShellShowButton t={t} label="Show register" onClick={() => setRailVisible(true)} />
          ) : null}
          {!theoryVisible ? (
            <ShellShowButton t={t} label="Show theory" onClick={() => setTheoryVisible(true)} />
          ) : null}
          <ShellHideButton t={t} onClick={() => setCtVisible(false)} />
        </div>
      </header>

      {showFlowStepCanvas && activeFlowStepId ? (
        <RegisterFlowStepCanvas stepId={activeFlowStepId} t={t} isDark={isDark} />
      ) : (
        <RegisterPrototypeCanvas t={t} isDark={isDark} />
      )}
    </section>
  );
}
