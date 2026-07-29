import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import {
  CONDITION_OPERATORS,
  emptyIfConditionRow,
  formatIfConditionRowSummary,
  formatIfConditionSummary,
  isIfConditionConfigured,
  normalizeIfConditionConfig,
  type ConditionRightValue,
  type IfConditionConfig,
  type IfConditionRow,
} from "../../../data/automationConditions";
import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  formatConstantValue,
  getConstantsForIndustry,
} from "../../../data/automationConstants";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { Switch } from "../../ui/switch";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { FieldPathDropInput } from "./FieldPathDropInput";

type IfConditionConfigFormProps = {
  config: IfConditionConfig;
  t: Tokens;
  onChange: (next: IfConditionConfig) => void;
};

const SCOPE_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

const inputStyle = (t: Tokens): CSSProperties => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: `1px solid ${t.border}`,
  background: t.bgPrimary,
  color: t.textPrimary,
  fontSize: DOCS_TREE_LABEL_SIZE,
  outline: "none",
});

function RightValueEditor({
  right,
  t,
  onChange,
}: {
  right: ConditionRightValue;
  t: Tokens;
  onChange: (next: ConditionRightValue) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {(
          [
            { id: "constant", label: "Constant" },
            { id: "literal", label: "Value" },
            { id: "field", label: "Field" },
          ] as const
        ).map((mode) => {
          const active = right.kind === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (mode.id === "constant") {
                  onChange({ kind: "constant", constantKey: "cec.min_hours" });
                } else if (mode.id === "literal") {
                  onChange({ kind: "literal", value: "" });
                } else {
                  onChange({ kind: "field", path: "" });
                }
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accentBg : t.bgPrimary,
                color: active ? t.accent : t.textMuted,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
      {right.kind === "constant" ? (
        <select
          value={right.constantKey}
          onChange={(event) => onChange({ kind: "constant", constantKey: event.target.value })}
          style={inputStyle(t)}
        >
          {AUTOMATION_CONSTANT_INDUSTRIES.map((industry) => {
            const constants = getConstantsForIndustry(industry.id);
            if (constants.length === 0) return null;
            return (
              <optgroup key={industry.id} label={industry.label}>
                {constants.map((constant) => (
                  <option key={constant.key} value={constant.key}>
                    {constant.key} = {formatConstantValue(constant)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      ) : right.kind === "literal" ? (
        <input
          value={right.value}
          onChange={(event) => onChange({ kind: "literal", value: event.target.value })}
          placeholder="value2"
          style={inputStyle(t)}
        />
      ) : (
        <FieldPathDropInput
          value={right.path}
          onChange={(path) => onChange({ kind: "field", path })}
          placeholder="Drop field or type path · client_data.crs.score"
          t={t}
          aria-label="Right field path"
        />
      )}
    </div>
  );
}

function ConditionRowEditor({
  row,
  t,
  onChange,
  onRemove,
  canRemove,
}: {
  row: IfConditionRow;
  t: Tokens;
  onChange: (next: IfConditionRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const op = CONDITION_OPERATORS.find((item) => item.id === row.operator);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "start" }}>
        <FieldPathDropInput
          value={row.leftField}
          onChange={(leftField) => onChange({ ...row, leftField })}
          placeholder="Drop field or type path · client_data.information.canadian_skilled_hours"
          t={t}
          aria-label="Left field path"
        />
        <select
          value={row.operator}
          onChange={(event) =>
            onChange({ ...row, operator: event.target.value as IfConditionRow["operator"] })
          }
          style={{
            ...inputStyle(t),
            width: "auto",
            minWidth: 168,
            paddingRight: 28,
          }}
          title={op?.phrase}
        >
          {CONDITION_OPERATORS.map((item) => (
            <option key={item.id} value={item.id}>
              T · {item.phrase}
            </option>
          ))}
        </select>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "tower-chrome-menu-item inline-flex h-9 w-9 items-center justify-center rounded-sm outline-none",
              "cursor-pointer hover:bg-accent hover:text-accent-foreground",
            )}
            style={{ color: t.textMuted, border: `1px solid ${t.border}` }}
            aria-label="Remove condition"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}
      </div>
      <RightValueEditor
        right={row.right}
        t={t}
        onChange={(right) => onChange({ ...row, right })}
      />
      {row.leftField.trim() && (
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted, fontSize: 11 }}>
          {formatIfConditionRowSummary(row)}
        </p>
      )}
    </div>
  );
}

export function IfConditionConfigForm({ config, t, onChange }: IfConditionConfigFormProps) {
  const normalized = normalizeIfConditionConfig(config);

  function patch(partial: Partial<IfConditionConfig>) {
    onChange({ ...normalized, ...partial });
  }

  function updateRow(index: number, next: IfConditionRow) {
    const conditions = [...normalized.conditions];
    conditions[index] = next;
    patch({ conditions });
  }

  function removeRow(index: number) {
    if (normalized.conditions.length <= 1) return;
    patch({ conditions: normalized.conditions.filter((_, i) => i !== index) });
  }

  const preview = formatIfConditionSummary(normalized);
  const ready = isIfConditionConfigured(normalized);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <SectionHeading t={t}>Conditions</SectionHeading>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "0 0 10px", color: t.textMuted, lineHeight: 1.45 }}>
          Branch gate — items that pass route to <strong style={{ color: t.success }}>true</strong>, others to{" "}
          <strong style={{ color: t.red }}>false</strong>. Drag fields from Input into path boxes, or type paths.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {normalized.conditions.map((row, index) => (
            <div key={row.id}>
              {index > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: "0 0 8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      patch({ combinator: normalized.combinator === "and" ? "or" : "and" })
                    }
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: `1px solid ${t.border}`,
                      background: t.boardPanel,
                      color: t.textMuted,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
                  >
                    {normalized.combinator.toUpperCase()}
                  </button>
                </div>
              )}
              <ConditionRowEditor
                row={row}
                t={t}
                onChange={(next) => updateRow(index, next)}
                onRemove={() => removeRow(index)}
                canRemove={normalized.conditions.length > 1}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => patch({ conditions: [...normalized.conditions, emptyIfConditionRow()] })}
          className={cn(
            "tower-chrome-menu-item mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm py-2 outline-none",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          )}
          style={{
            border: `1px dashed ${t.border}`,
            color: t.textPrimary,
            fontSize: 12,
            fontWeight: 500,
            background: "transparent",
          }}
        >
          <Plus size={14} strokeWidth={2} />
          Add condition
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.hoverBg,
        }}
      >
        <span style={{ fontSize: DOCS_TREE_LABEL_SIZE, color: t.textPrimary, fontWeight: 500 }}>
          Convert types where required
        </span>
        <Switch
          checked={normalized.convertTypes ?? false}
          onCheckedChange={(checked) => patch({ convertTypes: checked === true })}
        />
      </div>

      <div>
        <SectionHeading t={t}>Options</SectionHeading>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
          No properties
        </p>
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.hoverBg,
        }}
      >
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ marginBottom: 4, color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
        >
          Branch summary
        </div>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            color: ready ? t.textPrimary : t.textMuted,
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children, t }: { children: string; t: Tokens }) {
  return (
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
      {children}
    </div>
  );
}
