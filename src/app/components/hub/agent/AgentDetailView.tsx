import { useCallback, useState } from "react";
import { AGENT_TEMPLATE_BINDING, getAgentDefinition } from "../../../data/agentDefinitions";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../../docs/shellHolonOrder";
import type { Tokens } from "../../tokens";
import { wirePorts } from "../../../wire/registry";
import { AgentEditor } from "./AgentEditor";
import { AgentHeader } from "./AgentHeader";

type AgentDetailViewProps = {
  agentId: string;
  t: Tokens;
  isDark: boolean;
};

export function AgentDetailView({ agentId, t, isDark: _isDark }: AgentDetailViewProps) {
  const agent = getAgentDefinition(agentId);
  const [launchNote, setLaunchNote] = useState<string | null>(null);

  const handleLaunch = useCallback(async () => {
    if (!agent) return;
    try {
      const mapped = AGENT_TEMPLATE_BINDING[agent.id];
      const { templates, bindings } = await wirePorts.machineApi.listTemplates();
      const seqClass = mapped?.sequenceClass ?? "optin";
      const binding = bindings.find((b) => b.sequence_class === seqClass);
      const template =
        templates.find((tpl) => tpl.id === (binding?.template_id ?? mapped?.templateId)) ??
        templates.find((tpl) => tpl.sequence_class === seqClass);
      const agentRef =
        binding?.template_id ??
        template?.id ??
        mapped?.templateId ??
        `tpl.${seqClass}.v1`;
      const enr = await wirePorts.machineApi.createEnrollment({
        contactId: "board-selected-or-book",
        agentRef,
        sequenceId: agentRef,
        payload: { source: "agent_launch", agentId: agent.id, dryRun: false },
      });
      setLaunchNote(`Launched live → ${agentRef} (${enr.id})`);
    } catch (e) {
      setLaunchNote(`Launch blocked: ${String(e)}`);
    }
  }, [agent]);

  if (!agent) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Agent not found.
      </div>
    );
  }

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
        icon="user"
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{
          padding: "8px 16px",
          flexShrink: 0,
          background: t.bgPrimary,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <AgentHeader agent={agent} t={t} onLaunch={() => void handleLaunch()} />
        {launchNote ? (
          <div style={{ marginTop: 6, fontSize: 11, color: t.textDim }}>{launchNote}</div>
        ) : null}
      </HolonBoundary>

      <HolonBoundary
        id="hub-tool-body"
        label="Hub Tool Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["hub-tool-body"]}
        t={t}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AgentEditor agent={agent} t={t} />
      </HolonBoundary>
    </div>
  );
}
