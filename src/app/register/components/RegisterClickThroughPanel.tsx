/**
 * Click-through panel — HQ hierarchy: flex:1 beside fixed theory strip.
 * Default: lo-fi CT plant stub (desks plant later). Wiring flow steps may
 * temporarily inhabit this panel until CT desks absorb them.
 * Tower tokens + Inter.
 */
import type { Tokens } from "../../components/tokens";
import { RegisterFlowStepCanvas } from "../flowCanvas/RegisterFlowStepCanvas";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { useRegisterShell, type CtDeskId } from "../context/RegisterShellContext";

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

function CtPlantStub({ t, desk }: { t: Tokens; desk: CtDeskId }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: t.hoverBg,
        color: t.textMuted,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          border: `1px dashed ${t.border}`,
          borderRadius: 6,
          padding: "28px 20px",
          background: t.bgSecondary,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
          Click-through · {desk === "consultant" ? "Consultant desk" : "Operator desk"}
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, fontStyle: "italic" }}>
          Lo-fi CT plant lands here (HQ shape). Theory stays in the strip on the left — selecting a persona or
          outcome expands there. Opening a How leaf reveals this panel. Hide click-through to expand Theory.
        </p>
      </div>
    </div>
  );
}

export function RegisterClickThroughPanel({ t, isDark }: RegisterClickThroughPanelProps) {
  const { setCtVisible, ctDesk, setCtDesk } = useRegisterShell();
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", color: t.textPrimary }}>
            {showFlowStepCanvas ? "Flow step" : "Click-through"}
          </span>
          {!showFlowStepCanvas ? (
            <div style={{ display: "flex", gap: 6 }}>
              {(
                [
                  ["consultant", "Consultant"],
                  ["operator", "Operator"],
                ] as const
              ).map(([id, label]) => (
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
        <button
          type="button"
          onClick={() => setCtVisible(false)}
          style={{
            padding: "4px 10px",
            border: `1px solid ${t.border}`,
            borderRadius: 4,
            background: t.bgSecondary,
            color: t.textMuted,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Hide
        </button>
      </header>

      {showFlowStepCanvas && activeFlowStepId ? (
        <RegisterFlowStepCanvas stepId={activeFlowStepId} t={t} isDark={isDark} />
      ) : (
        <CtPlantStub t={t} desk={ctDesk} />
      )}
    </section>
  );
}
