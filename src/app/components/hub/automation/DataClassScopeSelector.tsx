import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type {
  AutomationDataClass,
  AutomationDataClassId,
  DataClassScopeSelection,
} from "../../../data/automationEvents";
import {
  getDataClassScopeIds,
  resolveSelectedScopeIds,
} from "../../../data/automationEvents";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import { Checkbox } from "../../ui/checkbox";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

const SCOPE_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

type DataClassScopeSelectorProps = {
  dataClass: AutomationDataClass;
  selection: DataClassScopeSelection | undefined;
  onChange: (next: DataClassScopeSelection | undefined) => void;
  t: Tokens;
};

function DataClassScopeRow({
  dataClass,
  selection,
  onChange,
  t,
}: DataClassScopeSelectorProps) {
  const [expanded, setExpanded] = useState(Boolean(selection));
  const allScopeIds = getDataClassScopeIds(dataClass);
  const selectedScopeIds = resolveSelectedScopeIds(dataClass, selection);
  const allSelected = selection?.mode === "all";
  const someSelected = selectedScopeIds.length > 0;
  const parentChecked = allSelected ? true : someSelected ? "indeterminate" : false;

  function toggleClass(checked: boolean) {
    if (checked) {
      onChange({ mode: "all" });
      setExpanded(true);
      return;
    }
    onChange(undefined);
    setExpanded(false);
  }

  function toggleScope(scopeId: string, checked: boolean) {
    const next = new Set(selectedScopeIds);
    if (checked) {
      next.add(scopeId);
    } else {
      next.delete(scopeId);
    }

    if (next.size === allScopeIds.length) {
      onChange({ mode: "all" });
      return;
    }
    if (next.size === 0) {
      onChange(undefined);
      setExpanded(false);
      return;
    }
    onChange({ mode: "partial", scopeIds: [...next] });
  }

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        background: t.bgPrimary,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          background: someSelected ? t.hoverBg : "transparent",
        }}
      >
        <button
          type="button"
          aria-label={expanded ? "Collapse scopes" : "Expand scopes"}
          onClick={() => setExpanded((open) => !open)}
          className={cn(
            "tower-chrome-menu-item inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm outline-none",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          )}
          style={{ color: t.textMuted }}
        >
          {expanded ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
        </button>
        <Checkbox
          checked={parentChecked}
          onCheckedChange={(value) => toggleClass(value === true)}
          className={SCOPE_CHECKBOX_CLASS}
        />
        <NotionIcon name={dataClass.icon} size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
        >
          <span
            style={{
              display: "block",
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: t.textPrimary,
            }}
          >
            {dataClass.label}
          </span>
          <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
            {allSelected
              ? "All scopes"
              : someSelected
                ? `${selectedScopeIds.length} of ${allScopeIds.length} scopes`
                : dataClass.description}
          </span>
        </button>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${t.border}`,
            padding: "6px 10px 8px 38px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {dataClass.scopes.map((scope) => {
            const checked = selectedScopeIds.includes(scope.id);
            return (
              <label
                key={scope.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 0",
                  cursor: "pointer",
                }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggleScope(scope.id, value === true)}
                  className={SCOPE_CHECKBOX_CLASS}
                />
                <span
                  style={{
                    fontSize: DOCS_TREE_LABEL_SIZE,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: t.textPrimary,
                  }}
                >
                  {scope.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

type DataClassScopeSelectorListProps = {
  scopes: Partial<Record<AutomationDataClassId, DataClassScopeSelection>>;
  onChange: (
    classId: AutomationDataClassId,
    next: DataClassScopeSelection | undefined,
  ) => void;
  t: Tokens;
  dataClasses: AutomationDataClass[];
};

export function DataClassScopeSelectorList({
  scopes,
  onChange,
  t,
  dataClasses,
}: DataClassScopeSelectorListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {dataClasses.map((dataClass) => (
        <DataClassScopeRow
          key={dataClass.id}
          dataClass={dataClass}
          selection={scopes[dataClass.id]}
          onChange={(next) => onChange(dataClass.id, next)}
          t={t}
        />
      ))}
    </div>
  );
}
