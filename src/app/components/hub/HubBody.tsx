import type { Audit } from "../../data/audits";
import type { ContactImport } from "../../data/imports";
import type { HubAgent, HubAutomation, HubToolRef } from "../../data/hub";
import {
  AGENT_ROW_HOLON,
  AUDIT_ROW_HOLON,
  AUTOMATION_ROW_HOLON,
  HUB_BODY_HOLON,
} from "../docs/hubBodyHolons";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import type { Tokens } from "../tokens";
import { AgentsSectionHeader } from "./AgentsSectionHeader";
import { AuditsSectionHeader } from "./AuditsSectionHeader";
import { AutomationsSectionHeader } from "./AutomationsSectionHeader";
import { AuditTreeBlock } from "./AuditTreeBlock";
import { HubToolRow } from "./HubToolRow";

function isToolActive(activeTool: HubToolRef | null, kind: HubToolRef["kind"], id: string) {
  return activeTool?.kind === kind && activeTool.id === id;
}

export function HubBody({
  audits,
  agents,
  automations,
  imports,
  activeTool,
  onToolClick,
  onAuditImportsContinue,
  onAddAutomation,
  t,
}: {
  audits: Audit[];
  agents: HubAgent[];
  automations: HubAutomation[];
  imports: ContactImport[];
  activeTool: HubToolRef | null;
  onToolClick: (tool: HubToolRef) => void;
  onAuditImportsContinue?: (importIds: string[]) => void;
  onAddAutomation?: () => void;
  t: Tokens;
}) {
  const auditsInView = audits.length > 0;
  const agentsInView = agents.length > 0;
  const automationsInView = automations.length > 0;

  return (
    <HolonBoundary
      id={HUB_BODY_HOLON.id}
      label={HUB_BODY_HOLON.label}
      icon={HUB_BODY_HOLON.icon}
      order={SHELL_HOLON_ORDER["hub-body"]}
      t={t}
      style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
    >
      <AuditsSectionHeader
        count={audits.length}
        imports={imports}
        t={t}
        onAuditImportsContinue={onAuditImportsContinue}
      />

      <HolonBoundary
        id={AUDIT_ROW_HOLON.id}
        label={AUDIT_ROW_HOLON.label}
        icon={AUDIT_ROW_HOLON.icon}
        order={AUDIT_ROW_HOLON.order}
        registerOnly
        inView={auditsInView}
        t={t}
      >
        {null}
      </HolonBoundary>

      {audits.map((audit) => (
        <AuditTreeBlock
          key={audit.id}
          audit={audit}
          isActive={isToolActive(activeTool, "audit", audit.id)}
          t={t}
          onOpen={onToolClick}
        />
      ))}

      <AgentsSectionHeader count={agents.length} t={t} />

      <HolonBoundary
        id={AGENT_ROW_HOLON.id}
        label={AGENT_ROW_HOLON.label}
        icon={AGENT_ROW_HOLON.icon}
        order={AGENT_ROW_HOLON.order}
        registerOnly
        inView={agentsInView}
        t={t}
      >
        {null}
      </HolonBoundary>

      {agents.map((agent) => (
        <HubToolRow
          key={agent.id}
          label={agent.label}
          meta={agent.meta}
          icon="user"
          holonId={AGENT_ROW_HOLON.id}
          isActive={isToolActive(activeTool, "agent", agent.id)}
          t={t}
          onClick={() => onToolClick({ kind: "agent", id: agent.id })}
        />
      ))}

      <AutomationsSectionHeader
        count={automations.length}
        onAddAutomation={onAddAutomation}
        t={t}
      />

      <HolonBoundary
        id={AUTOMATION_ROW_HOLON.id}
        label={AUTOMATION_ROW_HOLON.label}
        icon={AUTOMATION_ROW_HOLON.icon}
        order={AUTOMATION_ROW_HOLON.order}
        registerOnly
        inView={automationsInView}
        t={t}
      >
        {null}
      </HolonBoundary>

      {automations.map((automation) => (
        <HubToolRow
          key={automation.id}
          label={automation.label}
          meta={automation.meta}
          icon="circle-dashed"
          holonId={AUTOMATION_ROW_HOLON.id}
          isActive={isToolActive(activeTool, "automation", automation.id)}
          t={t}
          onClick={() => onToolClick({ kind: "automation", id: automation.id })}
        />
      ))}
    </HolonBoundary>
  );
}
