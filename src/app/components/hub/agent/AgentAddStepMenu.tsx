import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import type { AgentStepKind, AgentStepType } from "../../../data/agentDefinitions";
import { AGENT_STEP_TYPES } from "../../../data/agentDefinitions";
import type { NotionIconName } from "../../../icons/notion-icon-urls";
import { AGENT_ADD_STEP_HOLON } from "../../docs/agentHolons";
import { useHolonPatternHighlight } from "../../docs/docsHighlight";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { TOWER_CHROME_SOFT_BUTTON_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

const STEP_MENU_ICONS: Partial<Record<AgentStepKind, NotionIconName>> = {
  email: "document",
  consultant_task: "checkmark-list",
};

type AgentAddStepMenuProps = {
  t: Tokens;
  onAddStep: (step: AgentStepType) => void;
  label?: string;
  compact?: boolean;
  align?: "start" | "center" | "end";
};

export function AgentAddStepMenu({
  t,
  onAddStep,
  label = "Add a step",
  compact = false,
  align = "start",
}: AgentAddStepMenuProps) {
  const [open, setOpen] = useState(false);
  const patternHighlight = useHolonPatternHighlight(AGENT_ADD_STEP_HOLON.id, t.accent);
  const { style: patternHighlightStyle, ...patternInspectProps } = patternHighlight;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            TOWER_CHROME_SOFT_BUTTON_CLASS,
            "inline-flex items-center gap-2",
            compact ? "h-8 px-3 py-1" : "h-9 px-4 py-1",
          )}
          style={patternHighlightStyle}
          {...patternInspectProps}
        >
          <Plus size={15} strokeWidth={2} />
          {label}
          <ChevronDown size={14} strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[230px] p-2">
        {AGENT_STEP_TYPES.map((step) => {
          const icon = STEP_MENU_ICONS[step.id];
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                onAddStep(step);
                setOpen(false);
              }}
              className={cn(
                "tower-chrome-menu-item flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left outline-none",
                "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {icon ? <NotionIcon name={icon} size={14} color={t.textPrimary} /> : null}
              <span style={{ fontSize: DOCS_TREE_LABEL_SIZE, fontWeight: 500 }}>{step.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
