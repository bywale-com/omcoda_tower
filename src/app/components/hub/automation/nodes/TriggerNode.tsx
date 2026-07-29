import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Calendar, Hand, Play, Square, Zap } from "lucide-react";
import {
  formatEventTriggerSummary,
  formatManualTriggerSummary,
} from "../../../../data/automationEvents";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { TRIGGER_EVENTS_BY_TARGET, isTriggerNodeConfigured } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { NotionIcon } from "../../../icons/NotionIcon";
import { cn } from "../../../ui/utils";
import { useAutomationEditor } from "../AutomationEditorContext";
import { ManualEnrollmentCriteriaSummary } from "../ManualEnrollmentCriteriaSummary";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { WorkflowNodeRunChrome } from "../WorkflowNodeRunChrome";
import { workflowBodyText, workflowHintText, workflowNodeShell, workflowPill } from "../workflowNodeStyles";

export function TriggerNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const {
    t,
    onOpenNodeConfig,
    onOpenClassFilter,
    onToggleManualRun,
    manualRunActive,
  } = useAutomationEditor();
  const { style: patternHighlightStyle, ...patternInspectProps } = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.trigger.id,
    t.accent,
  );
  const triggerKind = data.triggerKind ?? "event";
  const isSchedule = triggerKind === "schedule";
  const isManual = triggerKind === "manual";
  const isConstant = triggerKind === "constant";
  const isEvent = triggerKind === "event";
  const configured = isTriggerNodeConfigured(data);
  const canConfigure = isEvent || isManual;
  const runStatus = data.runStatus ?? "idle";

  const eventLabel = data.triggerEvent
    ? TRIGGER_EVENTS_BY_TARGET[data.target ?? "audit"]?.find((e) => e.id === data.triggerEvent)?.label
    : undefined;

  const pillLabel = isSchedule
    ? "On a schedule"
    : isManual
      ? "Manual run"
      : isConstant
        ? "When constant changes"
        : "When this happens";

  const nodeIcon = isSchedule ? "calendar" : isConstant || isManual ? "gear" : "lightning-bolt";
  const configLabel = isSchedule
    ? "Add schedule"
    : isManual
      ? "Add enrollment criteria"
      : isConstant
        ? "Select constant"
        : "Add configuration";

  const summary = isEvent
    ? data.eventTriggerConfig
      ? formatEventTriggerSummary(data.eventTriggerConfig)
      : eventLabel
        ? `Target · ${data.target ?? "audit"} · ${eventLabel}`
        : configLabel
    : isManual
      ? data.manualTriggerConfig
        ? formatManualTriggerSummary(data.manualTriggerConfig)
        : configLabel
      : isSchedule
        ? data.scheduleSummary ?? "Schedule configured"
        : isConstant
          ? data.constantSummary ?? "Select constant"
          : configured
            ? "Manual trigger ready"
            : configLabel;

  function handleConfigure() {
    if (canConfigure) {
      onOpenNodeConfig(id);
    }
  }

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="trigger" selected={!!selected}>
      <div
        {...patternInspectProps}
        style={{
          ...workflowNodeShell(t, selected, 320, runStatus),
          ...patternHighlightStyle,
        }}
      >
        <WorkflowNodeRunChrome runStatus={runStatus} t={t} />
        {isManual && configured && (
          <button
            type="button"
            title={manualRunActive || runStatus === "running" ? "Stop manual run" : "Run manually"}
            aria-label={manualRunActive || runStatus === "running" ? "Stop manual run" : "Run manually"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleManualRun(id);
            }}
            className={cn(
              "tower-chrome-menu-item absolute inline-flex h-7 w-7 items-center justify-center rounded-sm outline-none",
              "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              "nodrag nopan",
            )}
            style={{
              top: 8,
              right: 8,
              zIndex: 2,
              color: manualRunActive || runStatus === "running" ? t.red : t.accent,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
            }}
          >
            {manualRunActive || runStatus === "running" ? (
              <Square size={12} strokeWidth={2.25} fill="currentColor" />
            ) : (
              <Play size={12} strokeWidth={2.25} fill="currentColor" />
            )}
          </button>
        )}
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div style={{ padding: "10px 12px 0", paddingRight: isManual && configured ? 40 : 12 }}>
          <span style={workflowPill(t, "accent")}>
            {isSchedule ? (
              <Calendar size={12} strokeWidth={2} />
            ) : isManual ? (
              <Hand size={12} strokeWidth={2} />
            ) : (
              <Zap size={12} strokeWidth={2} />
            )}
            {pillLabel}
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <NotionIcon name={nodeIcon} size={16} color={t.accent} />
            <span style={{ ...workflowBodyText(t), fontWeight: 600 }}>{data.label}</span>
          </div>
          {!configured ? (
            <button
              type="button"
              onClick={handleConfigure}
              style={{
                ...workflowPill(t, "danger"),
                border: "none",
                cursor: canConfigure ? "pointer" : "default",
                width: "100%",
                justifyContent: "center",
                padding: "6px 10px",
              }}
            >
              {configLabel}
            </button>
          ) : isEvent ? (
            <button
              type="button"
              onClick={handleConfigure}
              style={{
                ...workflowHintText(t),
                display: "block",
                width: "100%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              {summary}
            </button>
          ) : isManual ? null : (
            <span style={workflowHintText(t)}>{summary}</span>
          )}
          {!isEvent && !isManual && configured && data.target && eventLabel ? (
            <span style={{ ...workflowHintText(t), display: "block", marginTop: 8 }}>
              Target · {data.target} · {eventLabel}
            </span>
          ) : null}
          {isManual && configured && data.manualTriggerConfig ? (
            <div style={{ marginTop: 4 }} className="nodrag nopan">
              <ManualEnrollmentCriteriaSummary
                config={data.manualTriggerConfig}
                t={t}
                compact
                onOpenConfig={handleConfigure}
                onEditClassFilter={(classId) => onOpenClassFilter(id, classId)}
              />
            </div>
          ) : (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: `1px solid ${t.border}`,
              }}
            >
              <div
                style={{
                  ...workflowHintText(t),
                  textTransform: "uppercase",
                  fontSize: 10,
                  marginBottom: 6,
                }}
              >
                Enrollment criteria
              </div>
              <p style={{ ...workflowHintText(t), margin: 0 }}>{data.enrollmentHint}</p>
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
      </div>
    </WorkflowNodeFrame>
  );
}
