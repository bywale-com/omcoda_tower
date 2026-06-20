import { getAgentDefinition } from "../../../data/agentDefinitions";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../../docs/shellHolonOrder";
import type { Tokens } from "../../tokens";
import { AgentEditor } from "./AgentEditor";
import { AgentHeader } from "./AgentHeader";

type AgentDetailViewProps = {
  agentId: string;
  t: Tokens;
  isDark: boolean;
};

export function AgentDetailView({ agentId, t, isDark: _isDark }: AgentDetailViewProps) {
  const agent = getAgentDefinition(agentId);

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
        <AgentHeader agent={agent} t={t} onLaunch={() => {}} />
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
