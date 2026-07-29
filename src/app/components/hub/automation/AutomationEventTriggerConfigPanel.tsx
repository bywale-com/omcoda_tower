import type { Node } from "@xyflow/react";
import {
  AUTOMATION_DATA_CLASSES,
  DATA_MUTATION_EVENTS,
  formatEventTriggerSummary,
  isEventTriggerConfigured,
  type AutomationDataClassId,
  type DataClassScopeSelection,
  type DataMutationEvent,
  type EventTriggerConfig,
} from "../../../data/automationEvents";
import type { WorkflowNodeData } from "../../../data/automationWorkflows";
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

  function patchConfig(patch: Partial<EventTriggerConfig>) {
    const nextConfig: EventTriggerConfig = {
      mutationEvents: patch.mutationEvents ?? config.mutationEvents,
      scopes: patch.scopes ?? config.scopes,
    };
    onUpdate({
      eventTriggerConfig: nextConfig,
      configured: isEventTriggerConfigured(nextConfig),
    });
  }

  function toggleMutationEvent(event: DataMutationEvent, checked: boolean) {
    const next = checked
      ? [...config.mutationEvents, event]
      : config.mutationEvents.filter((item) => item !== event);
    patchConfig({ mutationEvents: next });
  }

  function updateClassScope(
    classId: AutomationDataClassId,
    selection: DataClassScopeSelection | undefined,
  ) {
    const nextScopes = { ...config.scopes };
    if (!selection) {
      delete nextScopes[classId];
    } else {
      nextScopes[classId] = selection;
    }
    patchConfig({ scopes: nextScopes });
  }

  const preview = formatEventTriggerSummary(config);

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.boardPanel,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Event trigger
          </div>
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
            Define when Tower data changes, then choose which data classes it applies to.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tower-chrome-menu-item shrink-0 cursor-pointer rounded-sm px-2 py-1 outline-none hover:bg-accent hover:text-accent-foreground"
          style={{ color: t.textMuted, fontSize: 11, fontWeight: 500 }}
        >
          Done
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
        <SectionLabel t={t}>Event types</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          {DATA_MUTATION_EVENTS.map((event) => {
            const checked = config.mutationEvents.includes(event.id);
            return (
              <label
                key={event.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
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
                  onCheckedChange={(value) => toggleMutationEvent(event.id, value === true)}
                  className={SCOPE_CHECKBOX_CLASS}
                />
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: DOCS_TREE_LABEL_SIZE,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: t.textPrimary,
                    }}
                  >
                    {event.label}
                  </span>
                  <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
                    {event.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <SectionLabel t={t}>Applies to</SectionLabel>
        <p
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ margin: "0 0 10px", color: t.textMuted, lineHeight: 1.45 }}
        >
          Select all data in a class, or expand and choose specific scopes — like repository
          permissions in GitHub.
        </p>
        <DataClassScopeSelectorList
          scopes={config.scopes}
          onChange={updateClassScope}
          dataClasses={AUTOMATION_DATA_CLASSES}
          t={t}
        />
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderTop: `1px solid ${t.border}`,
          background: t.bgPrimary,
        }}
      >
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ marginBottom: 4, color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
        >
          Summary
        </div>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            lineHeight: 1.4,
            color: isEventTriggerConfigured(config) ? t.textPrimary : t.textMuted,
          }}
        >
          {preview}
        </div>
      </div>
    </aside>
  );
}
