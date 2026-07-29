import { Calendar, Hand, Hash, Plus, Zap } from "lucide-react";
import { useState } from "react";
import type { WorkflowTriggerKind } from "../../../data/automationWorkflows";
import { WORKFLOW_TRIGGER_OPTIONS } from "../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  TOWER_POPOVER_CONTENT_CLASS,
  TOWER_POPOVER_MENU_ITEM_CLASS,
  TOWER_POPOVER_MENU_META_CLASS,
  TOWER_CHROME_SOFT_BUTTON_CLASS,
} from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

const TRIGGER_ICONS: Record<WorkflowTriggerKind, typeof Zap> = {
  event: Zap,
  schedule: Calendar,
  manual: Hand,
  constant: Hash,
};

type AutomationAddTriggerMenuProps = {
  t: Tokens;
  onAddTrigger: (triggerKind: WorkflowTriggerKind) => void;
  label?: string;
  compact?: boolean;
  iconOnly?: boolean;
  align?: "start" | "center" | "end";
};

export function AutomationAddTriggerMenu({
  t,
  onAddTrigger,
  label = "Add trigger",
  compact = false,
  iconOnly = false,
  align = "start",
}: AutomationAddTriggerMenuProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(triggerKind: WorkflowTriggerKind) {
    onAddTrigger(triggerKind);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={iconOnly ? label : undefined}
          aria-label={label}
          className={cn(
            TOWER_CHROME_SOFT_BUTTON_CLASS,
            "inline-flex items-center justify-center",
            iconOnly
              ? "h-11 w-11 rounded-full"
              : compact
                ? "h-8 gap-2 px-3 py-1"
                : "h-9 gap-2 px-4 py-1",
          )}
          style={
            iconOnly
              ? {
                  border: `1px dashed ${t.border}`,
                  background: t.bgPrimary,
                  color: t.textMuted,
                }
              : undefined
          }
        >
          <Plus size={iconOnly ? 18 : 14} strokeWidth={2} />
          {!iconOnly && label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={8}
        className={cn(TOWER_POPOVER_CONTENT_CLASS, "w-56 p-1")}
      >
        {WORKFLOW_TRIGGER_OPTIONS.map((option) => {
          const Icon = TRIGGER_ICONS[option.triggerKind];
          return (
            <button
              key={option.id}
              type="button"
              className={TOWER_POPOVER_MENU_ITEM_CLASS}
              onClick={() => handleSelect(option.triggerKind)}
            >
              <Icon size={14} strokeWidth={2} className="shrink-0 text-muted-foreground" />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: DOCS_TREE_LABEL_SIZE,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: t.textPrimary,
                  }}
                >
                  {option.label}
                </span>
                <span className={TOWER_POPOVER_MENU_META_CLASS} style={{ color: t.textMuted }}>
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
