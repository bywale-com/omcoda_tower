import {
  getHubToolLabel,
  hubToolIcon,
  hubToolSectionLabel,
  parseHubToolTabId,
  type HubToolRef,
} from "../../data/hub";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { AuditDetailView } from "./AuditDetailView";
import { AgentDetailView } from "./agent/AgentDetailView";
import { AutomationDetailView } from "./automation/AutomationDetailView";
import { ConstantsIndustryTableView } from "./automation/ConstantsIndustryTableView";
import { HubToolView } from "./HubToolView";
import type { AutomationConstantIndustryId } from "../../data/automationConstants";
import { getAutomationConstantIndustry } from "../../data/automationConstants";

type HubToolDetailViewProps = {
  tool: HubToolRef;
  t: Tokens;
  isDark: boolean;
  onOpenConstantsIndustry?: (industryId: AutomationConstantIndustryId) => void;
};

export function HubToolDetailView({
  tool,
  t,
  isDark,
  onOpenConstantsIndustry,
}: HubToolDetailViewProps) {
  if (tool.kind === "audit") {
    return <AuditDetailView auditId={tool.id} t={t} isDark={isDark} />;
  }

  if (tool.kind === "automation") {
    return (
      <AutomationDetailView
        automationId={tool.id}
        t={t}
        isDark={isDark}
        onOpenConstantsIndustry={onOpenConstantsIndustry}
      />
    );
  }

  if (tool.kind === "agent") {
    return <AgentDetailView agentId={tool.id} t={t} isDark={isDark} />;
  }

  if (tool.kind === "constants") {
    if (getAutomationConstantIndustry(tool.id)) {
      return (
        <ConstantsIndustryTableView
          industryId={tool.id as AutomationConstantIndustryId}
          t={t}
        />
      );
    }
  }

  const label = getHubToolLabel(tool);
  const section = hubToolSectionLabel(tool.kind);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: t.bgPrimary,
      }}
    >
      <HolonBoundary
        id="hub-tool-header"
        label="Hub Tool Header"
        icon={hubToolIcon(tool.kind)}
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{ padding: "24px 28px 10px", flexShrink: 0, background: t.bgPrimary }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NotionIcon name={hubToolIcon(tool.kind)} size={16} color={t.accent} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: t.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {label}
          </h1>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: t.textMuted }}>
          {section}
        </p>
      </HolonBoundary>

      <HolonBoundary
        id="hub-tool-body"
        label="Hub Tool Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["hub-tool-body"]}
        t={t}
        style={{ flex: 1, minHeight: 0 }}
      >
        <HubToolView
          title={label}
          subtitle={`${section} tool — detail surface coming soon.`}
          t={t}
        />
      </HolonBoundary>
    </div>
  );
}

export function HubToolDetailViewFromTab({
  tabId,
  t,
  isDark,
}: {
  tabId: string;
  t: Tokens;
  isDark: boolean;
}) {
  const tool = parseHubToolTabId(tabId);
  if (!tool) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Hub tool not found.
      </div>
    );
  }
  return <HubToolDetailView tool={tool} t={t} isDark={isDark} />;
}
