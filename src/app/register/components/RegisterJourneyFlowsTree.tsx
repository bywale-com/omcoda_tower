/**
 * Flows pass rail — persona journey flows (not Wiring wire graphs).
 * Selecting a step focuses the matching CT surface.
 */
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { docsBranchLabelStyle, docsChildLabelStyle } from "../../components/docs/treeTypography";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
} from "../../components/docs/treeLayout";
import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { JOURNEY_FLOWS, getJourneyFlow, getJourneyStep } from "../journeyFlows";
import { useOptionalRegisterTrace } from "../trace/RegisterTraceContext";

type RegisterJourneyFlowsTreeProps = {
  t: Tokens;
};

function personaTone(persona: string): string {
  if (persona === "consultant") return "Consultant";
  if (persona === "operator") return "Operator";
  return "Contact";
}

export function RegisterJourneyFlowsTree({ t }: RegisterJourneyFlowsTreeProps) {
  const {
    selectedJourneyFlowId,
    selectedJourneyStepId,
    selectJourneyFlow,
    selectJourneyStep,
  } = useRegisterSelection();
  const trace = useOptionalRegisterTrace();
  const [openFlowIds, setOpenFlowIds] = useState<Set<string>>(
    () => new Set(JOURNEY_FLOWS.map((f) => f.id)),
  );

  useEffect(() => {
    if (!selectedJourneyStepId) return;
    document
      .querySelector(`[data-register-tree-journey-step="${selectedJourneyStepId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedJourneyStepId]);

  const activateStep = (flowId: string, stepId: string) => {
    selectJourneyFlow(flowId);
    selectJourneyStep(stepId);
    const step = getJourneyStep(stepId);
    if (step) trace?.focusSurface(step.surfaceLabel);
  };

  return (
    <div style={{ padding: "0 0 8px" }}>
      {JOURNEY_FLOWS.map((flow) => {
        const open = openFlowIds.has(flow.id);
        const flowSelected = selectedJourneyFlowId === flow.id && !selectedJourneyStepId;

        return (
          <div key={flow.id} style={{ marginBottom: 2 }}>
            <div
              data-register-tree-journey-flow={flow.id}
              onClick={() => {
                selectJourneyFlow(flow.id);
                setOpenFlowIds((prev) => {
                  const next = new Set(prev);
                  next.add(flow.id);
                  return next;
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: DOCS_TREE_ROW_GAP,
                minHeight: DOCS_TREE_ROW_H,
                padding: `0 ${DOCS_TREE_ROW_PAD_X}px 0 ${DOCS_TREE_ROW_PAD_LEFT}px`,
                cursor: "pointer",
                userSelect: "none",
                background: flowSelected ? t.activeRowBg : "transparent",
                borderRadius: 4,
                margin: "0 4px",
              }}
            >
              <button
                type="button"
                aria-label={open ? "Collapse flow" : "Expand flow"}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenFlowIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(flow.id)) next.delete(flow.id);
                    else next.add(flow.id);
                    return next;
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <ChevronDown
                  size={DOCS_TREE_CHEVRON_SIZE}
                  color={t.textMuted}
                  strokeWidth={2}
                  style={{
                    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.12s ease",
                  }}
                />
              </button>
              <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, t.textPrimary, true)}>
                {flow.label}
              </span>
            </div>

            {open
              ? flow.steps.map((step, index) => {
                  const selected = selectedJourneyStepId === step.id;
                  return (
                    <div
                      key={step.id}
                      data-register-tree-journey-step={step.id}
                      onClick={() => activateStep(flow.id, step.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minHeight: DOCS_TREE_ROW_H,
                        padding: `0 ${DOCS_TREE_ROW_PAD_X}px 0 ${
                          DOCS_TREE_ROW_PAD_LEFT + DOCS_TREE_BRANCH_LEADING
                        }px`,
                        cursor: "pointer",
                        userSelect: "none",
                        background: selected ? t.activeRowBg : "transparent",
                        borderRadius: 4,
                        margin: "0 4px",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          flexShrink: 0,
                          fontSize: 11,
                          fontWeight: 600,
                          color: selected ? t.accent : t.textMuted,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {index + 1}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, t.textPrimary, t)}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>
                          {personaTone(step.persona)}
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        );
      })}

      {selectedJourneyFlowId && getJourneyFlow(selectedJourneyFlowId) == null ? (
        <p style={{ margin: "8px 12px", fontSize: 12, color: t.textMuted }}>Unknown flow.</p>
      ) : null}
    </div>
  );
}
