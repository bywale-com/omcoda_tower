import { Play, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  onRename: (name: string) => void;
  onSave: () => void;
  onLaunch: () => void;
};

export function AutomationWorkflowHeader({
  workflow,
  t,
  savedFlash,
  onRename,
  onSave,
  onLaunch,
}: AutomationWorkflowHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraftName(workflow.name);
    }
  }, [workflow.name, editing]);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  function commitRename() {
    setEditing(false);
    onRename(draftName);
  }

  function cancelRename() {
    setDraftName(workflow.name);
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRename();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  }

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
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <NotionIcon name="lightning-bolt" size={16} color={t.accent} />
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            aria-label="Automation name"
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 480,
              fontSize: 22,
              fontWeight: 600,
              color: t.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              background: t.bgSecondary,
              border: `1px solid ${t.accent}`,
              borderRadius: 4,
              outline: "none",
              padding: "2px 8px",
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Rename automation"
            aria-label={`Rename ${workflow.name}`}
            className="outline-none"
            style={{
              display: "block",
              minWidth: 0,
              maxWidth: "100%",
              padding: "2px 4px",
              margin: "-2px -4px",
              border: "1px solid transparent",
              borderRadius: 4,
              background: "transparent",
              cursor: "text",
              textAlign: "left",
            }}
          >
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
          </button>
        )}
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
