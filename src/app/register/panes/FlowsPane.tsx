/**
 * Flows pass theory — journey summary + selected step beat.
 * Play happens on Click-through (desk + surface focus), not here.
 */
import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  JOURNEY_FLOWS,
  getJourneyFlow,
  getJourneyStep,
} from "../journeyFlows";
import { RegisterTheoryPanel } from "../components/theory/RegisterTheoryPanel";

type FlowsPaneProps = {
  t: Tokens;
};

function personaLabel(persona: string): string {
  if (persona === "consultant") return "Consultant";
  if (persona === "operator") return "Operator";
  return "Contact";
}

export function FlowsPane({ t }: FlowsPaneProps) {
  const { selectedJourneyFlowId, selectedJourneyStepId } = useRegisterSelection();
  const flow =
    (selectedJourneyFlowId ? getJourneyFlow(selectedJourneyFlowId) : null) ?? JOURNEY_FLOWS[0];
  const step = selectedJourneyStepId ? getJourneyStep(selectedJourneyStepId) : null;
  const stepIndex = step && flow ? flow.steps.findIndex((s) => s.id === step.id) : -1;

  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <RegisterTheoryPanel title="Flows" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
          Persona journeys on the click-through canvas — focused happy paths, not CTO wire graphs.
          Wiring (below) keeps contract / holon maps. Select a step in the rail (or use Prev / Next on
          Click-through) to walk desks and surfaces.
        </p>
      </RegisterTheoryPanel>

      {flow ? (
        <RegisterTheoryPanel title={flow.label} t={t}>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textPrimary, lineHeight: 1.5 }}>
            {flow.summary}
          </p>
          <ol
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 12,
              color: t.textMuted,
              lineHeight: 1.55,
            }}
          >
            {flow.steps.map((s) => (
              <li
                key={s.id}
                style={{
                  marginBottom: 4,
                  color: step?.id === s.id ? t.textPrimary : t.textMuted,
                  fontWeight: step?.id === s.id ? 600 : 400,
                }}
              >
                {s.label}{" "}
                <span style={{ color: t.textDim, fontWeight: 400 }}>
                  · {personaLabel(s.persona)}
                </span>
              </li>
            ))}
          </ol>
        </RegisterTheoryPanel>
      ) : null}

      {step && flow ? (
        <RegisterTheoryPanel
          title={`Step ${stepIndex + 1} · ${step.label}`}
          t={t}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: t.accent, fontWeight: 600 }}>
            {personaLabel(step.persona)} · {step.surfaceLabel}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: t.textPrimary, lineHeight: 1.5 }}>
            {step.beat}
          </p>
        </RegisterTheoryPanel>
      ) : (
        <RegisterTheoryPanel title="Play on click-through" t={t}>
          <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
            Pick a numbered step under {flow?.label ?? "the flow"} in the rail. Click-through jumps to
            that persona desk and surface.
          </p>
        </RegisterTheoryPanel>
      )}
    </div>
  );
}
