import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { WorkflowNodeData } from "../../../../data/automationWorkflows";
import {
  formatRuleSummary,
  getRulePack,
  emptyRuleNodeConfig,
} from "../../../../data/automationRules";
import { AUTOMATION_NODE_PATTERN_HOLONS } from "../../../docs/automationHolons";
import { useHolonPatternHighlight } from "../../../docs/docsHighlight";
import { NotionIcon } from "../../../icons/NotionIcon";
import { useAutomationEditor } from "../AutomationEditorContext";
import { WorkflowNodeFrame } from "../WorkflowNodeFrame";
import { WorkflowNodeRunChrome } from "../WorkflowNodeRunChrome";
import {
  workflowBodyText,
  workflowHintText,
  workflowNodeShell,
  workflowPill,
} from "../workflowNodeStyles";

export function RuleNode({ id, data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const { t, onOpenNodeConfig } = useAutomationEditor();
  const { style: patternHighlightStyle, ...patternInspectProps } = useHolonPatternHighlight(
    AUTOMATION_NODE_PATTERN_HOLONS.rule.id,
    t.accent,
  );
  const config = data.ruleConfig ?? emptyRuleNodeConfig(data.ruleId ?? "immigration-service-eligibility");
  const pack = getRulePack(config.packId);
  const summary = formatRuleSummary(config);
  const enabledCount = config.enabledOutcomeIds.length;
  const runStatus = data.runStatus ?? "idle";

  return (
    <WorkflowNodeFrame nodeId={id} nodeType="rule" selected={!!selected}>
      <div
        {...patternInspectProps}
        style={{ ...workflowNodeShell(t, selected, 300, runStatus), ...patternHighlightStyle }}
      >
        <WorkflowNodeRunChrome runStatus={runStatus} t={t} />
        <Handle type="target" position={Position.Top} style={{ background: t.border, width: 8, height: 8 }} />
        <div style={{ padding: "10px 12px 0" }}>
          <span style={workflowPill(t, "accent")}>
            <NotionIcon name="lightning-bolt" size={12} color={t.accent} />
            Rule
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ ...workflowBodyText(t), fontWeight: 600, marginBottom: 4 }}>
            {pack?.label ?? data.label}
          </div>
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
            {summary}
          </button>
          <span
            style={{
              ...workflowHintText(t),
              display: "block",
              marginTop: 6,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {enabledCount} outcome{enabledCount === 1 ? "" : "s"} · toggle in config
          </span>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ background: t.border, width: 8, height: 8 }} />
      </div>
    </WorkflowNodeFrame>
  );
}
