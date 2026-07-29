import { useState } from "react";
import { ChevronDown, ChevronRight, Code2 } from "lucide-react";
import { Switch } from "../../ui/switch";
import {
  formatRuleSummary,
  getRulePack,
  isRuleConfigured,
  type RuleConditionDefinition,
  type RuleNodeConfig,
  type RuleOutcomeDefinition,
  type RulePackDefinition,
} from "../../../data/automationRules";
import { CONDITION_OPERATORS } from "../../../data/automationConditions";
import { getAutomationConstant } from "../../../data/automationConstants";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";

type RuleOutcomesConfigFormProps = {
  config: RuleNodeConfig;
  t: Tokens;
  onChange: (next: RuleNodeConfig) => void;
};

const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

/** Constant keys display like env vars: cec.min_hours → CEC_MIN_HOURS */
export function formatConstantEnvName(key: string): string {
  return key.replace(/\./g, "_").toUpperCase();
}

function operatorSymbol(op: RuleConditionDefinition["operator"]): string {
  return CONDITION_OPERATORS.find((item) => item.id === op)?.label ?? op;
}

function OutcomeUnderhoodCode({
  outcome,
  t,
}: {
  outcome: RuleOutcomeDefinition;
  t: Tokens;
}) {
  const comment = t.textDim;
  const field = t.textMuted;
  const envColor = t.amber;

  return (
    <pre
      style={{
        margin: "8px 0 0",
        padding: "10px 12px",
        borderRadius: 6,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
        fontFamily: MONO,
        fontSize: 11,
        lineHeight: 1.55,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <code style={{ color: t.textPrimary }}>
        <span style={{ color: comment }}>
          {`// ${outcome.label}`}
          {"\n"}
          {`// Asserts: ${outcome.resultIds.join(", ")}`}
          {"\n"}
          {`// Pass when the evaluator clears the gates below (constants = firm criteria).`}
          {"\n"}
        </span>
        {outcome.conditions.map((condition, index) => {
          const env = formatConstantEnvName(condition.constantKey);
          const constant = getAutomationConstant(condition.constantKey);
          const valueHint =
            constant?.value != null ? `  // = ${String(constant.value)}` : "";
          const isExists =
            condition.operator === "exists" || condition.operator === "not_exists";

          return (
            <span key={condition.id}>
              {index > 0 ? "\n" : null}
              <span style={{ color: comment }}>
                {`// ${condition.label}`}
                {"\n"}
              </span>
              {isExists ? (
                <>
                  <span style={{ color: field }}>{condition.leftField}</span>
                  {` ${operatorSymbol(condition.operator)}`}
                  {"\n"}
                  <span style={{ color: comment }}>
                    {`// criteria ref `}
                  </span>
                  <span
                    style={{
                      color: envColor,
                      fontWeight: 600,
                      borderBottom: `1px dashed ${envColor}`,
                    }}
                  >
                    {env}
                  </span>
                  <span style={{ color: comment }}>{valueHint}</span>
                </>
              ) : (
                <>
                  <span style={{ color: field }}>{condition.leftField}</span>
                  {` ${operatorSymbol(condition.operator)} `}
                  <span
                    style={{
                      color: envColor,
                      fontWeight: 600,
                      borderBottom: `1px dashed ${envColor}`,
                    }}
                  >
                    {env}
                  </span>
                  <span style={{ color: comment }}>{valueHint}</span>
                </>
              )}
            </span>
          );
        })}
        {outcome.conditions.length === 0 ? (
          <span style={{ color: comment }}>{"// (no declared conditions)"}</span>
        ) : null}
      </code>
    </pre>
  );
}

export function RuleOutcomesConfigForm({ config, t, onChange }: RuleOutcomesConfigFormProps) {
  const pack: RulePackDefinition | undefined = getRulePack(config.packId);
  const enabled = new Set(config.enabledOutcomeIds);
  const [openCodeId, setOpenCodeId] = useState<string | null>(null);

  if (!pack) {
    return (
      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        Rule pack not found.
      </p>
    );
  }

  function toggleOutcome(outcomeId: string, next: boolean) {
    const set = new Set(config.enabledOutcomeIds);
    if (next) set.add(outcomeId);
    else set.delete(outcomeId);
    onChange({
      ...config,
      enabledOutcomeIds: pack!.outcomes
        .map((outcome) => outcome.id)
        .filter((id) => set.has(id)),
    });
  }

  const summary = formatRuleSummary(config);
  const ready = isRuleConfigured(config);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div
          className={TOWER_DIALOG_HINT_CLASS}
          style={{
            marginBottom: 6,
            color: t.textMuted,
            textTransform: "uppercase",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Outcomes
        </div>
        <p
          className={TOWER_DIALOG_HINT_CLASS}
          style={{ margin: "0 0 12px", color: t.textMuted, lineHeight: 1.45 }}
        >
          Toggle what you want evaluated. Open View code to see the under-the-hood gates and
          criteria.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pack.outcomes.map((outcome) => {
            const on = enabled.has(outcome.id);
            const codeOpen = openCodeId === outcome.id;
            return (
              <div
                key={outcome.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${on ? t.accent : t.border}`,
                  background: on ? t.accentBg : t.bgPrimary,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: DOCS_TREE_LABEL_SIZE,
                        fontWeight: 600,
                        color: t.textPrimary,
                      }}
                    >
                      {outcome.label}
                    </div>
                    <div
                      className={TOWER_DIALOG_HINT_CLASS}
                      style={{ marginTop: 2, color: t.textMuted, lineHeight: 1.4 }}
                    >
                      {outcome.description}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCodeId((prev) => (prev === outcome.id ? null : outcome.id))
                      }
                      style={{
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        color: t.accent,
                      }}
                    >
                      <Code2 size={12} strokeWidth={1.75} />
                      {codeOpen ? "Hide code" : "View code"}
                      {codeOpen ? (
                        <ChevronDown size={12} strokeWidth={1.75} />
                      ) : (
                        <ChevronRight size={12} strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  <Switch
                    checked={on}
                    onCheckedChange={(checked) => toggleOutcome(outcome.id, checked === true)}
                  />
                </div>
                {codeOpen ? <OutcomeUnderhoodCode outcome={outcome} t={t} /> : null}
              </div>
            );
          })}
        </div>
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
          Will evaluate
        </div>
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 500,
            color: ready ? t.textPrimary : t.textMuted,
          }}
        >
          {summary}
        </div>
      </div>
    </div>
  );
}
