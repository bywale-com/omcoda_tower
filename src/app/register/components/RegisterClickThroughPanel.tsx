/**
 * Click-through panel — HQ hierarchy: flex:1 beside fixed theory strip.
 * Body: DS-I RegisterPrototypeCanvas or Ant Design translate (ctDesignSystem toggle).
 * Wiring flow steps may temporarily inhabit this panel when a wiring step is selected.
 * Flows pass: Prev/Next steps the persona journey on the same prototype.
 */
import type { Tokens } from "../../components/tokens";
import { RegisterFlowStepCanvas } from "../flowCanvas/RegisterFlowStepCanvas";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  useRegisterShell,
  type CtDeskId,
  type CtDesignSystem,
} from "../context/RegisterShellContext";
import {
  CORE_CLOSE_FLOW,
  getJourneyFlow,
  getJourneyStep,
} from "../journeyFlows";
import { AntCtHost } from "../prototype-ant/AntCtHost";
import { RegisterPrototypeCanvas } from "../prototype/RegisterPrototypeCanvas";
import { useOptionalRegisterTrace } from "../trace/RegisterTraceContext";
import { ShellHideButton, ShellShowButton, shellChromeBtnStyle } from "./RegisterShellChrome";

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
    ctDesignSystem,
    setCtDesignSystem,
    railVisible,
    theoryVisible,
    setRailVisible,
    setTheoryVisible,
  } = useRegisterShell();
  const {
    registerPassId,
    activeFlowStepId,
    selectedJourneyFlowId,
    selectedJourneyStepId,
    selectJourneyFlow,
    selectJourneyStep,
  } = useRegisterSelection();
  const trace = useOptionalRegisterTrace();

  const showWiringStepCanvas = registerPassId === "wiring" && activeFlowStepId != null;
  const journeyMode = registerPassId === "flows";
  const journeyFlow =
    (selectedJourneyFlowId ? getJourneyFlow(selectedJourneyFlowId) : null) ?? CORE_CLOSE_FLOW;
  const journeyStep = selectedJourneyStepId ? getJourneyStep(selectedJourneyStepId) : null;
  const journeyIndex = journeyStep
    ? journeyFlow.steps.findIndex((s) => s.id === journeyStep.id)
    : -1;

  const goJourneyStep = (index: number) => {
    const next = journeyFlow.steps[index];
    if (!next) return;
    selectJourneyFlow(journeyFlow.id);
    selectJourneyStep(next.id);
    trace?.focusSurface(next.surfaceLabel);
  };

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
          height: journeyMode ? 40 : 35,
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
            {showWiringStepCanvas ? "Flow step" : journeyMode ? "Journey" : "Click-through"}
          </span>
          {!showWiringStepCanvas ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
              <span
                aria-hidden
                style={{ width: 1, alignSelf: "stretch", background: t.border, margin: "0 2px" }}
              />
              {(["dsi", "ant"] as CtDesignSystem[]).map((ds) => (
                <button
                  key={ds}
                  type="button"
                  title={ds === "dsi" ? "DS-I plant chrome" : "Ant Design translate"}
                  onClick={() => setCtDesignSystem(ds)}
                  style={deskTabStyle(t, ctDesignSystem === ds)}
                >
                  {ds === "dsi" ? "DS-I" : "Ant"}
                </button>
              ))}
            </div>
          ) : null}
          {journeyMode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                disabled={journeyIndex <= 0 && journeyStep != null}
                onClick={() => {
                  if (journeyStep == null) goJourneyStep(0);
                  else goJourneyStep(Math.max(0, journeyIndex - 1));
                }}
                style={{
                  ...shellChromeBtnStyle(t),
                  opacity: journeyIndex <= 0 && journeyStep != null ? 0.45 : 1,
                }}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  if (journeyStep == null) goJourneyStep(0);
                  else if (journeyIndex < journeyFlow.steps.length - 1) goJourneyStep(journeyIndex + 1);
                }}
                style={shellChromeBtnStyle(t, "accent")}
              >
                {journeyStep == null ? "Play" : journeyIndex >= journeyFlow.steps.length - 1 ? "End" : "Next"}
              </button>
              <span style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap" }}>
                {journeyStep
                  ? `${journeyIndex + 1}/${journeyFlow.steps.length} · ${journeyStep.label}`
                  : `${journeyFlow.steps.length} steps · ${journeyFlow.label}`}
              </span>
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

      {showWiringStepCanvas && activeFlowStepId ? (
        <RegisterFlowStepCanvas stepId={activeFlowStepId} t={t} isDark={isDark} />
      ) : ctDesignSystem === "ant" ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <AntCtHost desk={ctDesk} isDark={isDark} />
        </div>
      ) : (
        <RegisterPrototypeCanvas t={t} isDark={isDark} />
      )}
    </section>
  );
}
