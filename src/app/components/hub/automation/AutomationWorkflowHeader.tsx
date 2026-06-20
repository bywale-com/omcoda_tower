import { Play, Share2 } from "lucide-react";
import type { WorkflowDefinition } from "../../../data/automationWorkflows";
import { AUTOMATION_WORKFLOW_ACTIONS_HOLON } from "../../docs/automationHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { NotionIcon } from "../../icons/NotionIcon";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

type AutomationWorkflowHeaderProps = {
  workflow: WorkflowDefinition;
  t: Tokens;
  savedFlash: boolean;
  onSave: () => void;
  onLaunch: () => void;
};

export function AutomationWorkflowHeader({
  workflow,
  t,
  savedFlash,
  onSave,
  onLaunch,
}: AutomationWorkflowHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <NotionIcon name="lightning-bolt" size={16} color={t.accent} />
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: t.textPrimary,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {workflow.name}
        </h1>
      </div>

      <HolonBoundary
        id={AUTOMATION_WORKFLOW_ACTIONS_HOLON.id}
        label={AUTOMATION_WORKFLOW_ACTIONS_HOLON.label}
        icon={AUTOMATION_WORKFLOW_ACTIONS_HOLON.icon}
        order={AUTOMATION_WORKFLOW_ACTIONS_HOLON.order}
        t={t}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {savedFlash && (
            <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.green }}>
              Saved
            </span>
          )}
          <button
          type="button"
          title="Share"
          aria-label="Share workflow"
          className={cn(
            "tower-chrome-menu-item inline-flex h-8 items-center gap-2 rounded-sm px-3 py-1 outline-none",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          )}
          style={{ color: t.textMuted }}
        >
          <Share2 size={14} strokeWidth={2} />
          Share
        </button>
        <button
          type="button"
          onClick={onSave}
          className={cn(
            "tower-chrome-menu-item inline-flex h-8 items-center rounded-sm px-3 py-1 outline-none",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          )}
          style={{ color: t.textPrimary, border: `1px solid ${t.border}` }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onLaunch}
          className={cn(
            "tower-chrome-menu-item inline-flex h-8 items-center gap-2 rounded-sm px-3 py-1 outline-none",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          )}
          style={{ color: t.textPrimary }}
        >
          <Play size={14} strokeWidth={2} />
          Launch workflow
        </button>
        </div>
      </HolonBoundary>
    </div>
  );
}
