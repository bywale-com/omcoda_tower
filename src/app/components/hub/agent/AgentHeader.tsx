import { Ellipsis, Play, UserPlus, Zap } from "lucide-react";
import type { AgentDefinition } from "../../../data/agentDefinitions";
import { getLinkedAutomationSummaries } from "../../../data/agentDefinitions";
import { AGENT_HEADER_ACTIONS_HOLON } from "../../docs/agentHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";
import { TOWER_CHROME_SOFT_BUTTON_CLASS, TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

const iconButtonClass = cn(
  "tower-chrome-menu-item inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm outline-none",
  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
);

const textButtonClass = cn(
  TOWER_CHROME_SOFT_BUTTON_CLASS,
  "inline-flex h-8 items-center gap-2 px-3 py-1",
);

type AgentHeaderProps = {
  agent: AgentDefinition;
  t: Tokens;
  onLaunch: () => void;
};

function AutomationsControl({
  linkedAutomations,
  t,
}: {
  linkedAutomations: ReturnType<typeof getLinkedAutomationSummaries>;
  t: Tokens;
}) {
  const count = linkedAutomations.length;

  const control = (
    <button
      type="button"
      title={
        count > 0
          ? `${count} linked automation${count === 1 ? "" : "s"}`
          : "No linked automations"
      }
      aria-label={count > 0 ? `${count} linked automations` : "Automations"}
      className={cn(
        "tower-chrome-menu-item inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-2 outline-none",
        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
      )}
      style={{ color: count > 0 ? t.textPrimary : t.textMuted }}
    >
      <Zap size={15} strokeWidth={2} />
      <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1 }}>{count}</span>
    </button>
  );

  if (count === 0) {
    return control;
  }

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{control}</HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" sideOffset={8} className="w-72 p-2">
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{
            padding: "4px 8px 8px",
            color: t.textMuted,
            textTransform: "uppercase",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Linked automations
        </div>
        {linkedAutomations.map((automation) => (
          <div
            key={automation.id}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              fontSize: DOCS_TREE_LABEL_SIZE,
              color: t.textPrimary,
            }}
          >
            <div style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>{automation.name}</div>
            <div className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted, marginTop: 2 }}>
              {automation.status}
            </div>
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}

export function AgentHeader({ agent, t, onLaunch }: AgentHeaderProps) {
  const linkedAutomations = getLinkedAutomationSummaries(agent);

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
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <NotionIcon name="user" size={16} color={t.accent} />
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
          {agent.name}
        </h1>
        <AutomationsControl linkedAutomations={linkedAutomations} t={t} />
      </div>

      <HolonBoundary
        id={AGENT_HEADER_ACTIONS_HOLON.id}
        label={AGENT_HEADER_ACTIONS_HOLON.label}
        icon={AGENT_HEADER_ACTIONS_HOLON.icon}
        order={AGENT_HEADER_ACTIONS_HOLON.order}
        t={t}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onLaunch}
            className={textButtonClass}
          >
            <Play size={14} strokeWidth={2} />
            Launch agent
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="More actions"
                aria-label="More actions"
                className={iconButtonClass}
                style={{ color: t.textMuted }}
              >
                <Ellipsis size={16} strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <UserPlus size={15} strokeWidth={2} />
                Add contacts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </HolonBoundary>
    </div>
  );
}
