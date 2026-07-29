import { useMemo, useState } from "react";
import {
  AUTOMATION_DATA_CLASSES,
  getManualClassNameFilter,
  setManualClassNameFilter,
  type AutomationDataClassId,
  type ManualNameFilter,
  type ManualTriggerConfig,
} from "../../../data/automationEvents";
import { filterDataClassNameOptions } from "../../../data/automationDataClassNames";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { Checkbox } from "../../ui/checkbox";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

const SCOPE_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

type AutomationManualClassFilterPanelProps = {
  classId: AutomationDataClassId;
  config: ManualTriggerConfig;
  t: Tokens;
  onChange: (next: ManualTriggerConfig) => void;
  onClose: () => void;
};

export function AutomationManualClassFilterPanel({
  classId,
  config,
  t,
  onChange,
  onClose,
}: AutomationManualClassFilterPanelProps) {
  const dataClass = AUTOMATION_DATA_CLASSES.find((item) => item.id === classId);
  const nameFilter = getManualClassNameFilter(config, classId);
  const [query, setQuery] = useState("");

  const allOptions = useMemo(() => filterDataClassNameOptions(classId, ""), [classId]);
  const visibleOptions = useMemo(
    () => filterDataClassNameOptions(classId, query),
    [classId, query],
  );

  const selectedSet = useMemo(() => new Set(nameFilter.values), [nameFilter.values]);
  const allSelected =
    nameFilter.mode === "all" ||
    (allOptions.length > 0 && allOptions.every((option) => selectedSet.has(option.name)));
  const someSelected = nameFilter.mode === "partial" && nameFilter.values.length > 0;

  function commitNameFilter(next: ManualNameFilter) {
    onChange(setManualClassNameFilter(config, classId, next));
  }

  function selectAll(checked: boolean) {
    if (checked) {
      commitNameFilter({ mode: "all", values: [] });
      return;
    }
    commitNameFilter({ mode: "partial", values: [] });
  }

  function toggleName(name: string, checked: boolean) {
    if (nameFilter.mode === "all") {
      const nextValues = allOptions
        .map((option) => option.name)
        .filter((item) => (checked ? true : item !== name));
      if (nextValues.length === allOptions.length) {
        commitNameFilter({ mode: "all", values: [] });
        return;
      }
      commitNameFilter({ mode: "partial", values: nextValues });
      return;
    }

    const next = new Set(nameFilter.values);
    if (checked) next.add(name);
    else next.delete(name);

    if (next.size === 0) {
      commitNameFilter({ mode: "partial", values: [] });
      return;
    }
    if (next.size === allOptions.length) {
      commitNameFilter({ mode: "all", values: [] });
      return;
    }
    commitNameFilter({ mode: "partial", values: [...next] });
  }

  const parentChecked = allSelected ? true : someSelected ? "indeterminate" : false;

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.boardPanel,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Filter configuration
          </div>
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "4px 0 0", color: t.textMuted }}>
            {dataClass?.label ?? classId} — narrow which records enroll from this class.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tower-chrome-menu-item shrink-0 cursor-pointer rounded-sm px-2 py-1 outline-none hover:bg-accent hover:text-accent-foreground"
          style={{ color: t.textMuted, fontSize: 11, fontWeight: 500 }}
        >
          Done
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{
            marginBottom: 8,
            color: t.textMuted,
            textTransform: "uppercase",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Name
        </div>

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a name…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 10px",
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            color: t.textPrimary,
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            outline: "none",
            marginBottom: 10,
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          <Checkbox
            checked={parentChecked}
            onCheckedChange={(value) => selectAll(value === true)}
            className={SCOPE_CHECKBOX_CLASS}
          />
          <span
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 500,
              color: t.textPrimary,
            }}
          >
            Select all
          </span>
          <span className={TOWER_DIALOG_HINT_CLASS} style={{ marginLeft: "auto", color: t.textMuted }}>
            {allOptions.length}
          </span>
        </label>

        <div
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            background: t.bgPrimary,
            overflow: "hidden",
          }}
        >
          {visibleOptions.length === 0 ? (
            <div
              className={TOWER_DIALOG_HINT_CLASS}
              style={{ padding: "12px 10px", color: t.textMuted }}
            >
              No names match “{query.trim()}”
            </div>
          ) : (
            visibleOptions.map((option) => {
              const checked = nameFilter.mode === "all" || selectedSet.has(option.name);
              return (
                <label
                  key={option.id}
                  className={cn("flex cursor-pointer items-center gap-2 px-2.5 py-2")}
                  style={{
                    borderTop: `1px solid ${t.borderLight}`,
                    background: checked ? t.hoverBg : "transparent",
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleName(option.name, value === true)}
                    className={SCOPE_CHECKBOX_CLASS}
                  />
                  <span
                    style={{
                      fontSize: DOCS_TREE_LABEL_SIZE,
                      fontWeight: 500,
                      color: t.textPrimary,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={option.name}
                  >
                    {option.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderTop: `1px solid ${t.border}`,
          background: t.bgPrimary,
        }}
      >
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ marginBottom: 4, color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
        >
          Active filter
        </div>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            color: t.textPrimary,
            lineHeight: 1.4,
          }}
        >
          {nameFilter.mode === "all"
            ? "All names"
            : nameFilter.values.length === 0
              ? "No names selected"
              : nameFilter.values.length <= 2
                ? nameFilter.values.join(", ")
                : `${nameFilter.values.length} names selected`}
        </div>
      </div>
    </aside>
  );
}
