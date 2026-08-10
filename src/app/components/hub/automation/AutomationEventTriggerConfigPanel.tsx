import type { Node } from "@xyflow/react";
import {
  AUTOMATION_DATA_CLASSES,
  formatEventTriggerSummary,
  type AutomationDataClassId,
  type DataClassScopeSelection,
  type EventTriggerConfig,
} from "../../../data/automationEvents";
import {
  WORKFLOW_EVENT_CATALOG,
  type WorkflowNodeData,
  type WorkflowTriggerEvent,
} from "../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { Checkbox } from "../../ui/checkbox";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";
import { DataClassScopeSelectorList } from "./DataClassScopeSelector";

const SCOPE_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

type AutomationEventTriggerConfigPanelProps = {
  node: Node<WorkflowNodeData>;
  t: Tokens;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
};

function SectionLabel({ children, t }: { children: string; t: Tokens }) {
  return (
    <div
      className={TOWER_DIALOG_HINT_CLASS}
      style={{
        marginBottom: 8,
        color: t.textMuted,
        textTransform: "uppercase",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </div>
  );
}

export function AutomationEventTriggerConfigPanel({
  node,
  t,
  onUpdate,
  onClose,
}: AutomationEventTriggerConfigPanelProps) {
  const config: EventTriggerConfig = node.data.eventTriggerConfig ?? {
    mutationEvents: [],
    scopes: {},
  };
  const selectedEvent = node.data.triggerEvent ?? "eligibility.changed";

  function patchConfig(patch: Partial<EventTriggerConfig>) {
    const nextConfig: EventTriggerConfig = {
      mutationEvents: patch.mutationEvents ?? config.mutationEvents,
      scopes: patch.scopes ?? config.scopes,
    };
    onUpdate({
      eventTriggerConfig: nextConfig,
      triggerEvent: selectedEvent,
      configured: Boolean(selectedEvent),
    });
  }

  function updateClassScope(
    classId: AutomationDataClassId,
    selection: DataClassScopeSelection | undefined,
  ) {
    const nextScopes = { ...config.scopes };
    if (!selection) delete nextScopes[classId];
    else nextScopes[classId] = selection;
    patchConfig({ scopes: nextScopes });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 280 }}>
      <div>
        <SectionLabel t={t}>Machine event</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {WORKFLOW_EVENT_CATALOG.map((event) => {
            const checked = selectedEvent === event.id;
            return (
              <label
                key={event.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${checked ? t.accent : t.border}`,
                  background: checked ? t.accentBg : t.bgPrimary,
                  cursor: "pointer",
                }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => {
                    if (value !== true) return;
                    onUpdate({
                      triggerEvent: event.id as WorkflowTriggerEvent,
                      eventTriggerConfig: config,
                      configured: true,
                      enrollmentHint: `Fires on ${event.id}`,
                    });
                  }}
                  className={SCOPE_CHECKBOX_CLASS}
                />
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: DOCS_TREE_LABEL_SIZE,
                      fontWeight: 500,
                      color: t.textPrimary,
                    }}
                  >
                    {event.label}
                  </span>
                  <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
                    {event.id}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel t={t}>Applies to</SectionLabel>
        <DataClassScopeSelectorList
          scopes={config.scopes}
          onChange={updateClassScope}
          dataClasses={AUTOMATION_DATA_CLASSES}
          t={t}
        />
      </div>

      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        workflow_trigger.event_name = {selectedEvent}
        {Object.keys(config.scopes).length ? ` · ${formatEventTriggerSummary(config)}` : ""}
      </p>

      <button
        type="button"
        onClick={onClose}
        style={{
          alignSelf: "flex-start",
          height: 32,
          padding: "0 12px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          color: t.textPrimary,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}
