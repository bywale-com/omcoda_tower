import type { Node } from "@xyflow/react";
import {
  AUTOMATION_DATA_CLASSES,
  formatManualTriggerSummary,
  isManualTriggerConfigured,
  type AutomationDataClassId,
  type DataClassScopeSelection,
  type ManualTriggerConfig,
} from "../../../data/automationEvents";
import type { WorkflowNodeData } from "../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";
import { DataClassScopeSelectorList } from "./DataClassScopeSelector";
import { ManualEnrollmentCriteriaSummary } from "./ManualEnrollmentCriteriaSummary";

type AutomationManualTriggerConfigPanelProps = {
  node: Node<WorkflowNodeData>;
  t: Tokens;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
  onEditClassFilter: (classId: AutomationDataClassId) => void;
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

export function AutomationManualTriggerConfigPanel({
  node,
  t,
  onUpdate,
  onClose,
  onEditClassFilter,
}: AutomationManualTriggerConfigPanelProps) {
  const config: ManualTriggerConfig = node.data.manualTriggerConfig ?? {
    scopes: {},
    filters: {},
  };

  function patchConfig(patch: Partial<ManualTriggerConfig>) {
    const nextConfig: ManualTriggerConfig = {
      scopes: patch.scopes ?? config.scopes,
      filters: patch.filters !== undefined ? patch.filters : config.filters,
    };
    const summary = formatManualTriggerSummary(nextConfig);
    onUpdate({
      manualTriggerConfig: nextConfig,
      configured: isManualTriggerConfigured(nextConfig),
      enrollmentHint: isManualTriggerConfigured(nextConfig)
        ? `Pull ${summary}`
        : "Records included when this automation is run manually.",
    });
  }

  function updateClassScope(
    classId: AutomationDataClassId,
    selection: DataClassScopeSelection | undefined,
  ) {
    const nextScopes = { ...config.scopes };
    const nextFilters = { ...config.filters };
    if (!selection) {
      delete nextScopes[classId];
      delete nextFilters[classId];
    } else {
      nextScopes[classId] = selection;
    }
    patchConfig({ scopes: nextScopes, filters: nextFilters });
  }

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
            Manual trigger
          </div>
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
            Choose where data is pulled from when you run this automation.
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
        <ManualEnrollmentCriteriaSummary
          config={config}
          t={t}
          onEditClassFilter={onEditClassFilter}
        />
      </div>
    </aside>
  );
}
