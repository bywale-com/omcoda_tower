import { ChevronsLeft, ChevronsRight, ListTree } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AGENT_EDITOR_TABS,
  type AgentDefinition,
  type AgentEditorTab,
  type AgentStepType,
} from "../../../data/agentDefinitions";
import {
  getInitialAgentSteps,
  insertAgentStep,
  type AgentStep,
} from "../../../data/agentSteps";
import {
  AGENT_ACTIVITY_TAB_HOLON,
  AGENT_CONTACTS_TAB_HOLON,
  AGENT_EDITOR_HOLON,
  AGENT_EDITOR_TAB_HOLON,
  AGENT_EDITOR_TABS_HOLON,
  AGENT_REPORT_TAB_HOLON,
  AGENT_SETTINGS_TAB_HOLON,
  AGENT_STEP_TOOLBAR_HOLON,
} from "../../docs/agentHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_CHROME_SOFT_BUTTON_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { AgentEditorEmptyState } from "./AgentEditorEmptyState";
import { AgentSequenceEditor } from "./AgentSequenceEditor";

type AgentEditorProps = {
  agent: AgentDefinition;
  t: Tokens;
};

export function AgentEditor({ agent, t }: AgentEditorProps) {
  const [tab, setTab] = useState<AgentEditorTab>("editor");
  const [railOpen, setRailOpen] = useState(true);
  const initialSteps = useMemo(() => getInitialAgentSteps(agent.id), [agent.id]);
  const [steps, setSteps] = useState<AgentStep[]>(initialSteps);

  useEffect(() => {
    setSteps(getInitialAgentSteps(agent.id));
    setTab("editor");
    setRailOpen(true);
  }, [agent.id]);

  const handleAddStep = useCallback((stepType: AgentStepType) => {
    if (stepType.id !== "email" && stepType.id !== "consultant_task") {
      return;
    }
    setSteps((current) => insertAgentStep(current, stepType.id, current.length - 1));
  }, []);

  const placeholderCopy = useMemo(() => {
    switch (tab) {
      case "contacts":
        return "Contacts enrolled in or eligible for this agent — enrollment and suppression rules will live here.";
      case "activity":
        return "Live runs, delivery events, and escalation outcomes for this agent.";
      case "report":
        return "Reach, reply, and conversion reporting for this agent across channels.";
      case "settings":
        return "Channel rulesets, attempt logic, global limits, and schedule windows for this agent.";
      default:
        return "";
    }
  }, [tab]);

  return (
    <HolonBoundary
      id={AGENT_EDITOR_HOLON.id}
      label={AGENT_EDITOR_HOLON.label}
      icon={AGENT_EDITOR_HOLON.icon}
      order={AGENT_EDITOR_HOLON.order}
      t={t}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {tab !== "editor" && (
        <HolonBoundary
          id={AGENT_EDITOR_TAB_HOLON.id}
          label={AGENT_EDITOR_TAB_HOLON.label}
          icon={AGENT_EDITOR_TAB_HOLON.icon}
          order={AGENT_EDITOR_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("editor")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}
      {tab !== "contacts" && (
        <HolonBoundary
          id={AGENT_CONTACTS_TAB_HOLON.id}
          label={AGENT_CONTACTS_TAB_HOLON.label}
          icon={AGENT_CONTACTS_TAB_HOLON.icon}
          order={AGENT_CONTACTS_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("contacts")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}
      {tab !== "activity" && (
        <HolonBoundary
          id={AGENT_ACTIVITY_TAB_HOLON.id}
          label={AGENT_ACTIVITY_TAB_HOLON.label}
          icon={AGENT_ACTIVITY_TAB_HOLON.icon}
          order={AGENT_ACTIVITY_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("activity")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}
      {tab !== "report" && (
        <HolonBoundary
          id={AGENT_REPORT_TAB_HOLON.id}
          label={AGENT_REPORT_TAB_HOLON.label}
          icon={AGENT_REPORT_TAB_HOLON.icon}
          order={AGENT_REPORT_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("report")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}
      {tab !== "settings" && (
        <HolonBoundary
          id={AGENT_SETTINGS_TAB_HOLON.id}
          label={AGENT_SETTINGS_TAB_HOLON.label}
          icon={AGENT_SETTINGS_TAB_HOLON.icon}
          order={AGENT_SETTINGS_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("settings")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}

      <HolonBoundary
        id={AGENT_EDITOR_TABS_HOLON.id}
        label={AGENT_EDITOR_TABS_HOLON.label}
        icon={AGENT_EDITOR_TABS_HOLON.icon}
        order={AGENT_EDITOR_TABS_HOLON.order}
        t={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 16px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        {AGENT_EDITOR_TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 4px",
                marginRight: 20,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: DOCS_TREE_LABEL_SIZE,
                fontWeight: active ? 600 : 500,
                color: active ? t.textPrimary : t.textMuted,
                borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent",
                letterSpacing: "-0.01em",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </HolonBoundary>

      {tab === "editor" ? (
        <>
          {steps.length > 0 ? (
            <HolonBoundary
              id={AGENT_STEP_TOOLBAR_HOLON.id}
              label={AGENT_STEP_TOOLBAR_HOLON.label}
              icon={AGENT_STEP_TOOLBAR_HOLON.icon}
              order={AGENT_STEP_TOOLBAR_HOLON.order}
              t={t}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 16px",
                borderBottom: `1px solid ${t.border}`,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setRailOpen((open) => !open)}
                className={cn(
                  TOWER_CHROME_SOFT_BUTTON_CLASS,
                  "inline-flex items-center gap-2 px-2 py-1",
                )}
                aria-label={railOpen ? "Collapse step rail" : "Expand step rail"}
                title={railOpen ? "Collapse step rail" : "Expand step rail"}
              >
                <ListTree size={14} strokeWidth={2} />
                {steps.length} {steps.length === 1 ? "step" : "steps"}
                {railOpen ? (
                  <ChevronsLeft size={14} strokeWidth={2} color={t.textMuted} />
                ) : (
                  <ChevronsRight size={14} strokeWidth={2} color={t.textMuted} />
                )}
              </button>
              <button
                type="button"
                className={cn(
                  TOWER_CHROME_SOFT_BUTTON_CLASS,
                  "inline-flex h-8 items-center px-3 py-1",
                )}
              >
                Save changes
              </button>
            </HolonBoundary>
          ) : null}

          <HolonBoundary
            id={AGENT_EDITOR_TAB_HOLON.id}
            label={AGENT_EDITOR_TAB_HOLON.label}
            icon={AGENT_EDITOR_TAB_HOLON.icon}
            order={AGENT_EDITOR_TAB_HOLON.order}
            t={t}
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            {steps.length === 0 ? (
              <AgentEditorEmptyState t={t} onAddStep={handleAddStep} />
            ) : (
              <AgentSequenceEditor
                agentId={agent.id}
                steps={steps}
                t={t}
                railOpen={railOpen}
                onStepsChange={setSteps}
              />
            )}
          </HolonBoundary>
        </>
      ) : (
        <HolonBoundary
          id={
            tab === "contacts"
              ? AGENT_CONTACTS_TAB_HOLON.id
              : tab === "activity"
                ? AGENT_ACTIVITY_TAB_HOLON.id
                : tab === "report"
                  ? AGENT_REPORT_TAB_HOLON.id
                  : AGENT_SETTINGS_TAB_HOLON.id
          }
          label={
            tab === "contacts"
              ? AGENT_CONTACTS_TAB_HOLON.label
              : tab === "activity"
                ? AGENT_ACTIVITY_TAB_HOLON.label
                : tab === "report"
                  ? AGENT_REPORT_TAB_HOLON.label
                  : AGENT_SETTINGS_TAB_HOLON.label
          }
          icon={
            tab === "contacts"
              ? AGENT_CONTACTS_TAB_HOLON.icon
              : tab === "activity"
                ? AGENT_ACTIVITY_TAB_HOLON.icon
                : tab === "report"
                  ? AGENT_REPORT_TAB_HOLON.icon
                  : AGENT_SETTINGS_TAB_HOLON.icon
          }
          order={
            tab === "contacts"
              ? AGENT_CONTACTS_TAB_HOLON.order
              : tab === "activity"
                ? AGENT_ACTIVITY_TAB_HOLON.order
                : tab === "report"
                  ? AGENT_REPORT_TAB_HOLON.order
                  : AGENT_SETTINGS_TAB_HOLON.order
          }
          t={t}
          style={{
            flex: 1,
            padding: 24,
            color: t.textMuted,
            fontSize: DOCS_TREE_LABEL_SIZE,
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0, maxWidth: 520 }}>{placeholderCopy}</p>
        </HolonBoundary>
      )}
    </HolonBoundary>
  );
}
