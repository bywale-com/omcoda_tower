import { BookOpen, Send, Sparkles } from "lucide-react";
import type { AgentStepType } from "../../../data/agentDefinitions";
import { AGENT_EMPTY_STATE_CHILD_HOLONS, AGENT_EMPTY_STATE_HOLON } from "../../docs/agentHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { RegisterContentChildHolonsFromConfig } from "../../docs/RegisterContentChildHolons";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { AgentAddStepMenu } from "./AgentAddStepMenu";

type AgentEditorEmptyStateProps = {
  t: Tokens;
  onAddStep: (step: AgentStepType) => void;
};

export function AgentEditorEmptyState({ t, onAddStep }: AgentEditorEmptyStateProps) {
  return (
    <HolonBoundary
      id={AGENT_EMPTY_STATE_HOLON.id}
      label={AGENT_EMPTY_STATE_HOLON.label}
      icon={AGENT_EMPTY_STATE_HOLON.icon}
      order={AGENT_EMPTY_STATE_HOLON.order}
      t={t}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <RegisterContentChildHolonsFromConfig
        children={AGENT_EMPTY_STATE_CHILD_HOLONS}
        inView
        t={t}
      />
      <div style={{ maxWidth: 420, textAlign: "center" }}>
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
          <Send size={24} strokeWidth={1.75} color={t.accent} />
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
          Your agent is empty
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: DOCS_TREE_LABEL_SIZE,
            color: t.textMuted,
            lineHeight: 1.5,
          }}
        >
          Add steps to build channel escalation, attempt logic, and sequencing rules.
        </p>

        <AgentAddStepMenu t={t} align="center" onAddStep={onAddStep} />

        <div
          style={{
            margin: "18px 0",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.textMuted,
          }}
        >
          Or
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className={cn(
              "tower-chrome-menu-item inline-flex h-8 items-center gap-2 rounded-sm px-3 py-1 outline-none",
              "cursor-pointer hover:bg-accent hover:text-accent-foreground",
            )}
            style={{ color: t.textPrimary, border: `1px solid ${t.border}` }}
          >
            <BookOpen size={14} strokeWidth={2} />
            Select a template
          </button>
          <button
            type="button"
            className={cn(
              "tower-chrome-menu-item inline-flex h-8 items-center gap-2 rounded-sm px-3 py-1 outline-none",
              "cursor-pointer hover:bg-accent hover:text-accent-foreground",
            )}
            style={{ color: t.textPrimary, border: `1px solid ${t.border}` }}
          >
            <Sparkles size={14} strokeWidth={2} />
            AI-assisted agent
          </button>
        </div>
      </div>
    </HolonBoundary>
  );
}
