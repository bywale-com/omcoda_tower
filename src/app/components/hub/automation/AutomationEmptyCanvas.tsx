import { Zap } from "lucide-react";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import type { Tokens } from "../../tokens";
import type { WorkflowTriggerKind } from "../../../data/automationWorkflows";
import { AutomationAddTriggerMenu } from "./AutomationAddTriggerMenu";

type AutomationEmptyCanvasProps = {
  t: Tokens;
  onAddTrigger: (triggerKind: WorkflowTriggerKind) => void;
};

export function AutomationEmptyCanvas({ t, onAddTrigger }: AutomationEmptyCanvasProps) {
  return (
    <div
      className="nodrag nopan nowheel"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          maxWidth: 360,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 16px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.hoverBg,
            border: `1px solid ${t.border}`,
          }}
        >
          <Zap size={24} strokeWidth={1.75} color={t.accent} />
        </div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Add a trigger to start
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: DOCS_TREE_LABEL_SIZE,
            color: t.textMuted,
            lineHeight: 1.5,
          }}
        >
          Choose an event-based or schedule-based trigger — the first step in every automation.
        </p>
        <AutomationAddTriggerMenu t={t} align="center" onAddTrigger={onAddTrigger} />
      </div>
    </div>
  );
}
