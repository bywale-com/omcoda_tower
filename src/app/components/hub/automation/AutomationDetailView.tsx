import { useCallback, useState } from "react";
import { getWorkflowDefinition } from "../../../data/automationWorkflows";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../../docs/shellHolonOrder";
import type { Tokens } from "../../tokens";
import { AutomationWorkflowEditor } from "./AutomationWorkflowEditor";
import { AutomationWorkflowHeader } from "./AutomationWorkflowHeader";

type AutomationDetailViewProps = {
  automationId: string;
  t: Tokens;
  isDark: boolean;
};

export function AutomationDetailView({ automationId, t, isDark }: AutomationDetailViewProps) {
  const workflow = getWorkflowDefinition(automationId);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  const handleLaunch = useCallback(() => {
    // Launch wiring will connect to workflow runtime later.
  }, []);

  if (!workflow) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Automation not found.
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
        icon="lightning-bolt"
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{
          padding: "8px 16px",
          flexShrink: 0,
          background: t.bgPrimary,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <AutomationWorkflowHeader
          workflow={workflow}
          t={t}
          savedFlash={savedFlash}
          onSave={handleSave}
          onLaunch={handleLaunch}
        />
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
        <AutomationWorkflowEditor workflow={workflow} t={t} isDark={isDark} />
      </HolonBoundary>
    </div>
  );
}
