import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import {
  formatIfConditionSummary,
  isIfConditionConfigured,
  normalizeIfConditionConfig,
} from "../../../../data/automationConditions";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { WorkflowNodeRunChrome } from "../WorkflowNodeRunChrome";
import {
  workflowBodyText,
  workflowHintText,
  workflowNodeShell,
  workflowPill,
} from "../workflowNodeStyles";

export function BranchNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t, onOpenNodeConfig } = useAutomationEditor();
  const { style: patternHighlightStyle, ...patternInspectProps } = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.branch.id,
    t.accent,
  );
  const isDelay = data.branchKind === "delay";
  const isIf = data.branchKind === "if";
  const isCondition = data.buildModule === "conditions" || (!data.buildModule && !isDelay);
  const isOperation = data.buildModule === "operations";
  const pillLabel = isIf
    ? "If"
    : isCondition
      ? "Condition"
      : isOperation
        ? "Operation"
        : "Then do this";

  const ifConfigured = isIf && isIfConditionConfigured(data.conditionConfig);
  const ifSummary =
    isIf && data.conditionConfig
      ? formatIfConditionSummary(normalizeIfConditionConfig(data.conditionConfig))
      : "Add condition";

  const runStatus = data.runStatus ?? "idle";

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="branch" selected={!!selected} showBranchPicker={isIf}>
      <div
        {...patternInspectProps}
        style={{
          ...workflowNodeShell(t, selected, isDelay ? 280 : 320, runStatus),
          ...patternHighlightStyle,
        }}
      >
        <WorkflowNodeRunChrome runStatus={runStatus} t={t} />
        <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
        <div style={{ padding: "10px 12px 0" }}>
          <span style={workflowPill(t, isIf ? "accent" : "muted")}>
            <GitBranch size={12} strokeWidth={2} />
            {pillLabel}
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ ...workflowBodyText(t), fontWeight: 600, marginBottom: 6 }}>{data.label}</div>
          {isDelay ? (
            <span style={workflowHintText(t)}>Wait · {data.delayLabel ?? "1 hour"}</span>
          ) : isIf ? (
            !ifConfigured ? (
              <button
                type="button"
                onClick={() => onOpenNodeConfig(id)}
                style={{
                  ...workflowPill(t, "danger"),
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 10px",
                }}
              >
                Add condition
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenNodeConfig(id)}
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
                {ifSummary}
              </button>
            )
          ) : data.operationKind === "transform" ? (
            !data.configured ? (
              <button
                type="button"
                onClick={() => onOpenNodeConfig(id)}
                style={{
                  ...workflowPill(t, "danger"),
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 10px",
                }}
              >
                Add configuration
              </button>
            ) : (
              <span style={workflowHintText(t)}>{data.filterSummary}</span>
            )
          ) : (
            <>
              <span style={{ ...workflowHintText(t), display: "block", marginBottom: 8 }}>
                Filter split criteria
              </span>
              {!data.configured ? (
                <button
                  type="button"
                  onClick={() => onOpenNodeConfig(id)}
                  style={{
                    ...workflowPill(t, "danger"),
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 10px",
                  }}
                >
                  Add configuration
                </button>
              ) : (
                <span style={workflowHintText(t)}>{data.filterSummary}</span>
              )}
            </>
          )}
        </div>
        {isIf ? (
          <div style={{ position: "relative", height: 18, marginTop: 4 }}>
            <span
              style={{
                position: "absolute",
                left: "22%",
                bottom: 14,
                fontSize: 9,
                fontWeight: 600,
                color: t.success,
              }}
            >
              true
            </span>
            <span
              style={{
                position: "absolute",
                left: "68%",
                bottom: 14,
                fontSize: 9,
                fontWeight: 600,
                color: t.red,
              }}
            >
              false
            </span>
            <Handle
              type="source"
              id="true"
              position={Position.Bottom}
              style={{ background: t.success, width: 8, height: 8, left: "30%" }}
            />
            <Handle
              type="source"
              id="false"
              position={Position.Bottom}
              style={{ background: t.red, width: 8, height: 8, left: "70%" }}
            />
          </div>
        ) : (
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: t.border, width: 8, height: 8 }}
          />
        )}
      </div>
    </WorkflowNodeFrame>
  );
}
