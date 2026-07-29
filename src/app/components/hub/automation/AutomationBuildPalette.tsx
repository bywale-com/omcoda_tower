import { Calendar, ChevronRight, Folder, GripVertical, Zap, Hand } from "lucide-react";
import type { ReactNode } from "react";
import type { PaletteBlock, WorkflowTriggerKind } from "../../../data/automationWorkflows";
import { WORKFLOW_PALETTE_BLOCKS, WORKFLOW_TRIGGER_OPTIONS } from "../../../data/automationWorkflows";
import {
  AUTOMATION_BUILD_MODULES,
  AUTOMATION_BUILD_MODULE_HINTS,
  AUTOMATION_BUILD_MODULE_LABELS,
  paletteBlockIcon,
  paletteBlocksByModule,
} from "../../../data/automationBuildModules";
import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  getConstantsForIndustry,
  type AutomationConstantIndustryId,
} from "../../../data/automationConstants";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

type AutomationBuildPaletteProps = {
  t: Tokens;
  hasTrigger: boolean;
  onAddBlock: (block: PaletteBlock) => void;
  onAddTrigger: (triggerKind: WorkflowTriggerKind) => void;
  onOpenConstantsIndustry?: (industryId: AutomationConstantIndustryId) => void;
};

const blocksByModule = paletteBlocksByModule(WORKFLOW_PALETTE_BLOCKS);

function PaletteRow({
  block,
  t,
  disabled = false,
  onAdd,
}: {
  block: PaletteBlock;
  t: Tokens;
  disabled?: boolean;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onAdd}
      className={cn(
        "tower-chrome-menu-item flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left outline-none",
        disabled
          ? "cursor-not-allowed opacity-45"
          : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <GripVertical size={12} strokeWidth={2} className="shrink-0 text-muted-foreground opacity-50" />
      <NotionIcon name={paletteBlockIcon(block)} size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
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
          {block.label}
        </span>
        <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
          {block.description}
        </span>
      </span>
    </button>
  );
}

function TriggerPaletteRow({
  label,
  description,
  triggerKind,
  t,
  onAdd,
}: {
  label: string;
  description: string;
  triggerKind: WorkflowTriggerKind;
  t: Tokens;
  onAdd: () => void;
}) {
  const Icon =
    triggerKind === "schedule"
      ? Calendar
      : triggerKind === "manual"
        ? Hand
        : Zap;

  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        "tower-chrome-menu-item flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left outline-none",
        "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <GripVertical size={12} strokeWidth={2} className="shrink-0 text-muted-foreground opacity-50" />
      <Icon size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={t.textMuted} />
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
          {label}
        </span>
        <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
          {description}
        </span>
      </span>
    </button>
  );
}

function IndustryFolderRow({
  industryId,
  label,
  description,
  count,
  t,
  onOpen,
}: {
  industryId: AutomationConstantIndustryId;
  label: string;
  description: string;
  count: number;
  t: Tokens;
  onOpen?: (industryId: AutomationConstantIndustryId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(industryId)}
      className={cn(
        "tower-chrome-menu-item flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left outline-none",
        onOpen
          ? "cursor-pointer hover:bg-accent hover:text-accent-foreground"
          : "cursor-default opacity-70",
      )}
    >
      <Folder size={DOCS_TREE_ICON_SIZE} strokeWidth={1.75} color={t.textMuted} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {label}
          <span style={{ color: t.textMuted, fontWeight: 400, fontSize: 11 }}>{count}</span>
        </span>
        <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
          {description}
        </span>
      </span>
      <ChevronRight size={14} strokeWidth={2} color={t.textMuted} />
    </button>
  );
}

function ModuleSection({
  label,
  hint,
  t,
  children,
}: {
  label: string;
  hint: string;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <>
      <div style={{ padding: "12px 8px 4px" }}>
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ color: t.textMuted, textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}
        >
          {label}
        </div>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "2px 0 6px", color: t.textMuted, lineHeight: 1.35 }}>
          {hint}
        </p>
      </div>
      {children}
    </>
  );
}

export function AutomationBuildPalette({
  t,
  hasTrigger,
  onAddBlock,
  onAddTrigger,
  onOpenConstantsIndustry,
}: AutomationBuildPaletteProps) {
  const blocksLocked = !hasTrigger;

  return (
    <div
      style={{
        width: 248,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${t.border}` }}>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Build
        </div>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
          {hasTrigger ? "Click to drop on canvas" : "Add a trigger first"}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        {!hasTrigger && (
          <ModuleSection label="Triggers" hint="When this automation runs" t={t}>
            {WORKFLOW_TRIGGER_OPTIONS.map((option) => (
              <TriggerPaletteRow
                key={option.id}
                label={option.label}
                description={option.description}
                triggerKind={option.triggerKind}
                t={t}
                onAdd={() => onAddTrigger(option.triggerKind)}
              />
            ))}
          </ModuleSection>
        )}

        {AUTOMATION_BUILD_MODULES.map((module) => {
          if (module === "constants") {
            return (
              <ModuleSection
                key={module}
                label={AUTOMATION_BUILD_MODULE_LABELS[module]}
                hint="Industry criteria libraries — open a folder to browse the table"
                t={t}
              >
                {AUTOMATION_CONSTANT_INDUSTRIES.map((industry) => (
                  <IndustryFolderRow
                    key={industry.id}
                    industryId={industry.id}
                    label={industry.label}
                    description={industry.description}
                    count={getConstantsForIndustry(industry.id).length}
                    t={t}
                    onOpen={onOpenConstantsIndustry}
                  />
                ))}
                <div style={{ padding: "10px 8px 4px" }}>
                  <div
                    className={TOWER_DIALOG_HINT_CLASS}
                    style={{
                      color: t.textMuted,
                      textTransform: "uppercase",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    Canvas nodes
                  </div>
                </div>
                {blocksByModule.constants.map((block) => (
                  <PaletteRow
                    key={block.id}
                    block={block}
                    t={t}
                    disabled={blocksLocked}
                    onAdd={() => onAddBlock(block)}
                  />
                ))}
              </ModuleSection>
            );
          }

          return (
            <ModuleSection
              key={module}
              label={AUTOMATION_BUILD_MODULE_LABELS[module]}
              hint={AUTOMATION_BUILD_MODULE_HINTS[module]}
              t={t}
            >
              {blocksByModule[module].map((block) => (
                <PaletteRow
                  key={block.id}
                  block={block}
                  t={t}
                  disabled={blocksLocked}
                  onAdd={() => onAddBlock(block)}
                />
              ))}
            </ModuleSection>
          );
        })}
      </div>
    </div>
  );
}
