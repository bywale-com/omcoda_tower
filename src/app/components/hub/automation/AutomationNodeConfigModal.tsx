import type { Edge, Node } from "@xyflow/react";
import { Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../ui/dialog";
import {
  formatIfConditionSummary,
  isIfConditionConfigured,
  normalizeIfConditionConfig,
  splitInputByIfConditions,
  isIfBranchOutput,
} from "../../../data/automationConditions";
import {
  AUTOMATION_DATA_CLASSES,
  formatEventTriggerSummary,
  formatManualTriggerSummary,
  isEventTriggerConfigured,
  isManualTriggerConfigured,
  type AutomationDataClassId,
  type DataClassScopeSelection,
  type EventTriggerConfig,
  type ManualTriggerConfig,
} from "../../../data/automationEvents";
import { DATA_MUTATION_EVENTS } from "../../../data/automationEvents";
import { buildManualPullPayload } from "../../../data/automationNodeRuntime";
import type { NodeDataPayload } from "../../../data/automationNodeRuntime";
import {
  emptyRuleNodeConfig,
  evaluateRulePack,
  formatRuleSummary,
  isRuleConfigured,
  isRuleEvaluationOutput,
} from "../../../data/automationRules";
import {
  listUpstreamDataSources,
  type WorkflowNodeData,
} from "../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { Checkbox } from "../../ui/checkbox";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { DataClassScopeSelectorList } from "./DataClassScopeSelector";
import { IfConditionConfigForm } from "./IfConditionConfigForm";
import { ManualEnrollmentCriteriaSummary } from "./ManualEnrollmentCriteriaSummary";
import { NodeDataPane } from "./NodeDataPane";
import { RuleAnalysisPane } from "./RuleAnalysisPane";
import { RuleOutcomesConfigForm } from "./RuleOutcomesConfigForm";

const SCOPE_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

type AutomationNodeConfigModalProps = {
  open: boolean;
  node: Node<WorkflowNodeData> | null;
  /** Full graph — enables Input-by-node switching. */
  nodes?: Node<WorkflowNodeData>[];
  edges?: Edge[];
  t: Tokens;
  onClose: () => void;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
  onEditClassFilter?: (classId: AutomationDataClassId) => void;
  onRunNode?: () => void;
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

function asPaneData(value: unknown): NodeDataPayload | null {
  if (value == null) return null;
  if (typeof value === "object") return value as NodeDataPayload;
  return { items: [{ value }], itemCount: 1, pulledAt: "" } as NodeDataPayload;
}

export function AutomationNodeConfigModal({
  open,
  node,
  nodes = [],
  edges = [],
  t,
  onClose,
  onUpdate,
  onEditClassFilter,
  onRunNode,
}: AutomationNodeConfigModalProps) {
  const upstreamSources = useMemo(() => {
    if (!node) return [];
    return listUpstreamDataSources(node.id, nodes, edges);
  }, [node, nodes, edges]);

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !node) return;
    const preferred =
      upstreamSources.find((source) => source.data != null)?.nodeId ??
      upstreamSources[0]?.nodeId ??
      null;
    setSelectedSourceId(preferred);
  }, [open, node?.id, upstreamSources]);

  if (!node) return null;

  const data = node.data;
  const isTrigger = node.type === "trigger";
  const isManual = isTrigger && data.triggerKind === "manual";
  const isEvent = isTrigger && data.triggerKind === "event";
  const isIf = node.type === "branch" && data.branchKind === "if";
  const isRule = node.type === "rule";
  const canRun = Boolean(onRunNode) && (isManual || isIf || isRule);

  const selectedSource =
    upstreamSources.find((source) => source.nodeId === selectedSourceId) ??
    upstreamSources[0] ??
    null;
  const inputPaneData = asPaneData(
    selectedSource?.data ?? data.lastInput ?? null,
  );

  const title = data.label;
  const subtitle = isManual
    ? "Manual trigger"
    : isEvent
      ? "Event trigger"
      : isIf
        ? "If condition"
        : isRule
          ? "Rule · service eligibility"
          : node.type ?? "Node";

  const middleLabel = isTrigger
    ? "Configuration"
    : isRule
      ? "Outcomes"
      : "Parameters";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1120px,94vw)] [&>button.absolute]:hidden"
        style={{
          height: "min(820px, 88vh)",
          background: t.bgPrimary,
          border: `1px solid ${t.border}`,
          color: t.textPrimary,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <DialogTitle
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: t.textPrimary,
              }}
            >
              {title}
            </DialogTitle>
            <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
              {subtitle} · Input · {middleLabel} · Output
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {canRun && (
              <button
                type="button"
                onClick={onRunNode}
                className={cn(
                  "tower-chrome-menu-item inline-flex h-8 items-center gap-2 rounded-sm px-3 outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{
                  color: t.textPrimary,
                  border: `1px solid ${t.border}`,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Play size={13} strokeWidth={2} fill="currentColor" />
                Run
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "tower-chrome-menu-item inline-flex h-8 w-8 items-center justify-center rounded-sm outline-none",
                "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              )}
              style={{ color: t.textMuted }}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: 12,
            padding: 12,
          }}
        >
          <NodeDataPane
            title="Input"
            emptyHint={
              isTrigger
                ? "This node starts the workflow — nothing upstream."
                : upstreamSources.length === 0
                  ? "Connect an upstream node and run it to populate input."
                  : "Run the selected upstream node to populate input."
            }
            data={inputPaneData}
            t={t}
            sourceOptions={
              upstreamSources.length > 0
                ? upstreamSources.map((source) => ({
                    id: source.nodeId,
                    label: source.label,
                    role: source.role,
                  }))
                : undefined
            }
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSourceId}
            enableFieldDrag={!isTrigger && Boolean(inputPaneData)}
          />

          <div
            style={{
              minHeight: 0,
              overflow: "auto",
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              background: t.boardPanel,
              padding: 14,
            }}
          >
            <SectionLabel t={t}>{middleLabel}</SectionLabel>
            {isManual ? (
              <ManualParams
                data={data}
                t={t}
                onUpdate={onUpdate}
                onEditClassFilter={onEditClassFilter}
              />
            ) : isEvent ? (
              <EventParams data={data} t={t} onUpdate={onUpdate} />
            ) : isIf ? (
              <IfConditionConfigForm
                config={normalizeIfConditionConfig(data.conditionConfig)}
                t={t}
                onChange={(conditionConfig) =>
                  onUpdate({
                    conditionConfig,
                    configured: isIfConditionConfigured(conditionConfig),
                    filterSummary: formatIfConditionSummary(conditionConfig),
                  })
                }
              />
            ) : isRule ? (
              <RuleOutcomesConfigForm
                config={
                  data.ruleConfig ??
                  emptyRuleNodeConfig(data.ruleId ?? "immigration-service-eligibility")
                }
                t={t}
                onChange={(ruleConfig) =>
                  onUpdate({
                    ruleConfig,
                    ruleId: ruleConfig.packId,
                    configured: isRuleConfigured(ruleConfig),
                    ruleSummary: formatRuleSummary(ruleConfig),
                  })
                }
              />
            ) : (
              <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
                Configuration for this node type is coming next. Drop fields from Input when Actions
                land.
              </p>
            )}
          </div>

          {isRule ? (
            <RuleOutputPane data={data.lastOutput} t={t} />
          ) : (
            <NodeDataPane
              title="Output"
              emptyHint={
                isIf
                  ? "Run to route input across true and false branches."
                  : "Run this node to see output (Schema · Table · JSON)."
              }
              data={asPaneData(data.lastOutput)}
              t={t}
              showRunChrome
              branchOutput={
                isIf && data.lastOutput && isIfBranchOutput(data.lastOutput)
                  ? data.lastOutput
                  : undefined
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RuleOutputPane({
  data,
  t,
}: {
  data: WorkflowNodeData["lastOutput"];
  t: Tokens;
}) {
  const [mode, setMode] = useState<"analysis" | "json">("analysis");
  const hasAnalysis = isRuleEvaluationOutput(data);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        background: t.bgPrimary,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Output
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {(
            [
              { id: "analysis" as const, label: "Analysis" },
              { id: "json" as const, label: "JSON" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                "tower-chrome-menu-item rounded-sm px-2 py-1 outline-none",
                "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              )}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: mode === item.id ? t.textPrimary : t.textMuted,
                background: mode === item.id ? t.hoverBg : "transparent",
                border: mode === item.id ? `1px solid ${t.border}` : "1px solid transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
        {!data ? (
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
            Run to evaluate selected outcomes into enriched analysis.
          </p>
        ) : mode === "analysis" && hasAnalysis ? (
          <RuleAnalysisPane data={data} t={t} />
        ) : (
          <pre
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.45,
              color: t.textPrimary,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function ManualParams({
  data,
  t,
  onUpdate,
  onEditClassFilter,
}: {
  data: WorkflowNodeData;
  t: Tokens;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
  onEditClassFilter?: (classId: AutomationDataClassId) => void;
}) {
  const config: ManualTriggerConfig = data.manualTriggerConfig ?? { scopes: {}, filters: {} };

  function patchConfig(patch: Partial<ManualTriggerConfig>) {
    const next: ManualTriggerConfig = {
      scopes: patch.scopes ?? config.scopes,
      filters: patch.filters !== undefined ? patch.filters : config.filters,
    };
    onUpdate({
      manualTriggerConfig: next,
      configured: isManualTriggerConfigured(next),
      enrollmentHint: isManualTriggerConfigured(next)
        ? `Pull ${formatManualTriggerSummary(next)}`
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <SectionLabel t={t}>Applies to</SectionLabel>
        <DataClassScopeSelectorList
          scopes={config.scopes}
          onChange={updateClassScope}
          dataClasses={AUTOMATION_DATA_CLASSES}
          t={t}
        />
      </div>
      <ManualEnrollmentCriteriaSummary
        config={config}
        t={t}
        onEditClassFilter={onEditClassFilter}
      />
    </div>
  );
}

function EventParams({
  data,
  t,
  onUpdate,
}: {
  data: WorkflowNodeData;
  t: Tokens;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
}) {
  const config: EventTriggerConfig = data.eventTriggerConfig ?? {
    mutationEvents: [],
    scopes: {},
  };

  function patchConfig(patch: Partial<EventTriggerConfig>) {
    const next: EventTriggerConfig = {
      mutationEvents: patch.mutationEvents ?? config.mutationEvents,
      scopes: patch.scopes ?? config.scopes,
    };
    onUpdate({
      eventTriggerConfig: next,
      configured: isEventTriggerConfigured(next),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <SectionLabel t={t}>Event types</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DATA_MUTATION_EVENTS.map((event) => {
            const checked = config.mutationEvents.includes(event.id);
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
                    const next = value === true
                      ? [...config.mutationEvents, event.id]
                      : config.mutationEvents.filter((id) => id !== event.id);
                    patchConfig({ mutationEvents: next });
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
                    {event.description}
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
          onChange={(classId, selection) => {
            const nextScopes = { ...config.scopes };
            if (!selection) delete nextScopes[classId];
            else nextScopes[classId] = selection;
            patchConfig({ scopes: nextScopes });
          }}
          dataClasses={AUTOMATION_DATA_CLASSES}
          t={t}
        />
      </div>
      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        {formatEventTriggerSummary(config)}
      </p>
    </div>
  );
}

/** Helper used by editor run wiring for If nodes. */
export function runIfConditionNode(
  data: WorkflowNodeData,
): Partial<WorkflowNodeData> {
  const config = normalizeIfConditionConfig(data.conditionConfig);
  const input = data.lastInput ?? null;
  if (!input) {
    return {
      runStatus: "failed",
      lastOutput: null,
    };
  }
  const branchOutput = splitInputByIfConditions(input, config);
  return {
    runStatus: "success",
    configured: isIfConditionConfigured(config),
    filterSummary: formatIfConditionSummary(config),
    lastOutput: branchOutput,
  };
}

export function runManualTriggerNode(
  data: WorkflowNodeData,
): Partial<WorkflowNodeData> {
  const config = data.manualTriggerConfig;
  if (!config || !isManualTriggerConfigured(config)) {
    return {
      runStatus: "failed",
      lastOutput: { meta: { error: "Enrollment criteria not configured" } },
    };
  }
  const payload = buildManualPullPayload(config);
  return {
    runStatus: "success",
    lastOutput: payload,
  };
}

export function runRuleNode(data: WorkflowNodeData): Partial<WorkflowNodeData> {
  const config =
    data.ruleConfig ?? emptyRuleNodeConfig(data.ruleId ?? "immigration-service-eligibility");
  const input = data.lastInput ?? null;
  if (!input) {
    return {
      runStatus: "failed",
      lastOutput: null,
    };
  }
  if (!isRuleConfigured(config)) {
    return {
      runStatus: "failed",
      lastOutput: {
        meta: { error: "Enable at least one outcome" },
      } as WorkflowNodeData["lastOutput"],
    };
  }
  const evaluation = evaluateRulePack(config, input);
  return {
    runStatus: "success",
    configured: true,
    ruleSummary: formatRuleSummary(config),
    lastOutput: evaluation as unknown as WorkflowNodeData["lastOutput"],
  };
}
