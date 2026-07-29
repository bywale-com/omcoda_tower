import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { AutomationBuildModule } from "../../../data/automationBuildModules";
import {
  AUTOMATION_BUILD_MODULE_LABELS,
  paletteBlocksByModule,
} from "../../../data/automationBuildModules";
import type { PaletteBlock } from "../../../data/automationWorkflows";
import { WORKFLOW_PALETTE_BLOCKS } from "../../../data/automationWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

/** Modules offered when attaching from canvas (+) — peer pickers, not triggers. */
export const ATTACH_STEP_MODULES: AutomationBuildModule[] = [
  "conditions",
  "operations",
  "rules",
  "constants",
];

const blocksByModule = paletteBlocksByModule(
  WORKFLOW_PALETTE_BLOCKS.filter((block) => block.nodeType !== "trigger"),
);

export type AttachStepMenuProps = {
  t: Tokens;
  onSelect: (block: PaletteBlock) => void;
  onClose: () => void;
  /** When attaching downstream of an If node */
  showBranchPicker?: boolean;
  branchHandle?: "true" | "false";
  onBranchHandleChange?: (handle: "true" | "false") => void;
  title?: string;
};

export function AttachStepMenu({
  t,
  onSelect,
  onClose,
  showBranchPicker = false,
  branchHandle = "true",
  onBranchHandleChange,
  title = "Add step",
}: AttachStepMenuProps) {
  const [expandedModule, setExpandedModule] = useState<AutomationBuildModule | null>(
    "conditions",
  );

  return (
    <div
      className="nodrag nopan nowheel"
      style={{
        width: 248,
        borderRadius: 10,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
        boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${t.border}`,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textMuted,
        }}
      >
        {title}
      </div>

      {showBranchPicker && onBranchHandleChange && (
        <div
          style={{
            padding: "10px 12px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase" }}>
            Attach to branch
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {(["true", "false"] as const).map((handle) => {
              const active = branchHandle === handle;
              const color = handle === "true" ? t.success : t.red;
              return (
                <button
                  key={handle}
                  type="button"
                  onClick={() => onBranchHandleChange(handle)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: `1px solid ${active ? color : t.border}`,
                    background: active ? t.hoverBg : t.bgPrimary,
                    color: active ? color : t.textMuted,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {handle}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ maxHeight: 320, overflowY: "auto", padding: 4 }}>
        {ATTACH_STEP_MODULES.map((module) => {
          const blocks = blocksByModule[module];
          if (blocks.length === 0) return null;
          const expanded = expandedModule === module;
          return (
            <div key={module}>
              <button
                type="button"
                onClick={() => setExpandedModule(expanded ? null : module)}
                className={cn(
                  "tower-chrome-menu-item flex w-full items-center gap-2 rounded-sm px-3 py-2 outline-none",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                )}
                style={{
                  border: "none",
                  background: expanded ? t.hoverBg : "transparent",
                  color: t.textPrimary,
                  textAlign: "left",
                }}
              >
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  style={{
                    color: t.textMuted,
                    transform: expanded ? "rotate(90deg)" : "none",
                    transition: "transform 0.15s ease",
                  }}
                />
                <span style={{ fontSize: DOCS_TREE_LABEL_SIZE, fontWeight: 600 }}>
                  {AUTOMATION_BUILD_MODULE_LABELS[module]}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: t.textMuted }}>
                  {blocks.length}
                </span>
              </button>
              {expanded && (
                <div style={{ padding: "0 4px 6px 22px" }}>
                  {blocks.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      className="nodrag nopan nowheel"
                      onClick={() => onSelect(block)}
                      style={{
                        display: "block",
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 6,
                        color: t.textPrimary,
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = t.hoverBg;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: DOCS_TREE_LABEL_SIZE,
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {block.label}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                        {block.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "8px 10px", borderTop: `1px solid ${t.border}` }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: "transparent",
            color: t.textMuted,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
