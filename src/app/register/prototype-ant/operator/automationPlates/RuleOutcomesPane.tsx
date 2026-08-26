import { useMemo } from "react";
import { Button, Input, Segmented, Select, Space, Switch, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { operandSlot } from "../../../../data/automationCompare";
import { CONDITION_OPERATORS } from "../../../../data/automationConditions";
import {
  emptyRuleNodeConfig,
  getRulePack,
  hydrateRuleLeft,
  hydrateRuleRight,
  listingKeyFromLeft,
  type RuleConditionDefinition,
  type RuleNodeConfig,
  type RuleOutcomeDefinition,
} from "../../../../data/automationRules";
import type { MappedChip } from "../../../../data/automationWorkflows";
import { CompareOperandBox } from "./CompareOperand";
import { DEFAULT_NAMED_CODE } from "./plateChrome";

function CodeLook({
  title,
  code,
  onTitle,
  onCode,
}: {
  title: string;
  code: string;
  onTitle: (next: string) => void;
  onCode: (next: string) => void;
}) {
  const lines = code.split("\n");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, paddingTop: 6 }}>
          JavaScript
        </Typography.Text>
        <Input value={title} onChange={(event) => onTitle(event.target.value)} style={{ flex: 1 }} />
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={() => void navigator.clipboard.writeText(code)}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 1fr",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
        }}
      >
        <div style={{ background: "#f5f5f5", color: "#8c8c8c", padding: "8px 0", textAlign: "right" }}>
          {lines.map((_, index) => (
            <div key={index} style={{ paddingRight: 8, lineHeight: "20px" }}>
              {index + 1}
            </div>
          ))}
        </div>
        <Input.TextArea
          value={code}
          onChange={(event) => onCode(event.target.value)}
          autoSize={{ minRows: 8, maxRows: 16 }}
          style={{
            border: "none",
            boxShadow: "none",
            fontFamily: "inherit",
            fontSize: 12,
            lineHeight: "20px",
            background: "#1f1f1f",
            color: "#d9f7be",
            borderRadius: 0,
          }}
        />
      </div>
    </div>
  );
}

function conditionPrefix(outcomeId: string, conditionId: string) {
  return `rule-${outcomeId}-${conditionId}`;
}

function OutcomeCard({
  outcome,
  config,
  mappedSlots,
  onConfig,
}: {
  outcome: RuleOutcomeDefinition;
  config: RuleNodeConfig;
  mappedSlots: Record<string, MappedChip[]>;
  onConfig: (next: RuleNodeConfig, slots: Record<string, MappedChip[]>) => void;
}) {
  const enabled = new Set(config.enabledOutcomeIds ?? []);
  const on = enabled.has(outcome.id);
  const mode = config.outcomeAuthorMode?.[outcome.id] ?? "gui";
  const conditions = config.outcomeConditions?.[outcome.id] ?? outcome.conditions;
  const code = config.outcomeCode?.[outcome.id] ?? config.namedCode ?? DEFAULT_NAMED_CODE;
  const title = config.outcomeCodeTitle?.[outcome.id] ?? outcome.label;

  const setOn = (next: boolean) => {
    const current = config.enabledOutcomeIds ?? [];
    onConfig(
      {
        ...config,
        enabledOutcomeIds: next ? [...new Set([...current, outcome.id])] : current.filter((id) => id !== outcome.id),
      },
      mappedSlots,
    );
  };

  const setMode = (next: "gui" | "js") => {
    onConfig(
      {
        ...config,
        outcomeAuthorMode: { ...config.outcomeAuthorMode, [outcome.id]: next },
      },
      mappedSlots,
    );
  };

  const setConditions = (next: RuleConditionDefinition[], slots = mappedSlots) => {
    onConfig(
      {
        ...config,
        outcomeConditions: { ...config.outcomeConditions, [outcome.id]: next },
      },
      slots,
    );
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: on ? 10 : 0 }}>
        <Typography.Text strong>{outcome.label}</Typography.Text>
        <Space>
          <Segmented
            size="small"
            value={mode}
            onChange={(value) => setMode(value as "gui" | "js")}
            options={[
              { label: "GUI", value: "gui" },
              { label: "JS", value: "js" },
            ]}
          />
          <Switch checked={on} onChange={setOn} />
        </Space>
      </div>
      {on && mode === "gui" ? (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {conditions.map((condition, index) => {
            const prefix = conditionPrefix(outcome.id, condition.id);
            const leftSlot = operandSlot(prefix, "left");
            const rightSlot = operandSlot(prefix, "right");
            const left = hydrateRuleLeft(condition);
            const right = hydrateRuleRight(condition);
            return (
              <div
                key={condition.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: condition.operator === "exists" || condition.operator === "not_exists" ? "1fr 96px" : "1fr 96px 1fr",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <CompareOperandBox
                  slot={leftSlot}
                  operand={left.mode === "chip" ? { mode: "chip", slot: leftSlot } : left}
                  chips={mappedSlots[leftSlot] ?? []}
                  placeholder="Type or drop"
                  onOperand={(nextLeft) => {
                    const authored = nextLeft.mode === "chip" ? { mode: "chip" as const, slot: leftSlot } : nextLeft;
                    const listing = listingKeyFromLeft(authored, mappedSlots[leftSlot]?.[0]?.field);
                    const next = conditions.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            left: authored,
                            leftField: listing ?? "",
                          }
                        : row,
                    );
                    setConditions(next);
                  }}
                  onChips={(chips) => {
                    const authored = chips.length
                      ? ({ mode: "chip", slot: leftSlot } as const)
                      : ({ mode: "text", value: "" } as const);
                    const listing = listingKeyFromLeft(authored, chips[0]?.field);
                    const nextConds = conditions.map((row, i) =>
                      i === index ? { ...row, left: authored, leftField: listing ?? "" } : row,
                    );
                    const nextSlots = { ...mappedSlots };
                    if (chips.length) nextSlots[leftSlot] = chips;
                    else delete nextSlots[leftSlot];
                    setConditions(nextConds, nextSlots);
                  }}
                />
                <Select
                  value={condition.operator}
                  options={CONDITION_OPERATORS.map((op) => ({ value: op.id, label: op.label }))}
                  onChange={(operator) => {
                    const next = conditions.map((row, i) => (i === index ? { ...row, operator } : row));
                    setConditions(next);
                  }}
                />
                {condition.operator === "exists" || condition.operator === "not_exists" ? null : (
                  <CompareOperandBox
                    slot={rightSlot}
                    operand={right.mode === "chip" ? { mode: "chip", slot: rightSlot } : right}
                    chips={mappedSlots[rightSlot] ?? []}
                    placeholder="Constant or drop"
                    onOperand={(nextRight) => {
                      const authored = nextRight.mode === "chip" ? { mode: "chip" as const, slot: rightSlot } : nextRight;
                      const next = conditions.map((row, i) =>
                        i === index
                          ? {
                              ...row,
                              right: authored,
                              constantKey: authored.mode === "text" ? authored.value : row.constantKey,
                            }
                          : row,
                      );
                      setConditions(next);
                    }}
                    onChips={(chips) => {
                      const authored = chips.length
                        ? ({ mode: "chip", slot: rightSlot } as const)
                        : ({ mode: "text", value: "" } as const);
                      const nextConds = conditions.map((row, i) =>
                        i === index
                          ? {
                              ...row,
                              right: authored,
                              constantKey: authored.mode === "text" ? authored.value : row.constantKey,
                            }
                          : row,
                      );
                      const nextSlots = { ...mappedSlots };
                      if (chips.length) nextSlots[rightSlot] = chips;
                      else delete nextSlots[rightSlot];
                      setConditions(nextConds, nextSlots);
                    }}
                  />
                )}
              </div>
            );
          })}
          <Button
            size="small"
            onClick={() =>
              setConditions([
                ...conditions,
                {
                  id: `c-${outcome.id}-${conditions.length + 1}`,
                  label: "",
                  version: 1,
                  leftField: "",
                  operator: "eq",
                  constantKey: "",
                  left: { mode: "text", value: "" },
                  right: { mode: "text", value: "" },
                },
              ])
            }
          >
            + Add condition
          </Button>
        </Space>
      ) : null}
      {on && mode === "js" ? (
        <CodeLook
          title={title}
          code={code}
          onTitle={(next) =>
            onConfig(
              {
                ...config,
                outcomeCodeTitle: { ...config.outcomeCodeTitle, [outcome.id]: next },
              },
              mappedSlots,
            )
          }
          onCode={(next) =>
            onConfig(
              {
                ...config,
                outcomeCode: { ...config.outcomeCode, [outcome.id]: next },
              },
              mappedSlots,
            )
          }
        />
      ) : null}
    </div>
  );
}

export function RuleOutcomesPane({
  config,
  mappedSlots,
  onChange,
}: {
  config: RuleNodeConfig | undefined;
  mappedSlots?: Record<string, MappedChip[]>;
  onChange: (next: { ruleConfig: RuleNodeConfig; mappedSlots: Record<string, MappedChip[]> }) => void;
}) {
  const draft = config ?? emptyRuleNodeConfig();
  const slots = mappedSlots ?? {};
  const pack = getRulePack(draft.packId);
  const outcomes = pack?.outcomes ?? [];
  const listingFieldIds = useMemo(() => {
    const enabled = new Set(draft.enabledOutcomeIds ?? []);
    const keys: string[] = [];
    for (const outcome of outcomes) {
      if (!enabled.has(outcome.id)) continue;
      const conditions = draft.outcomeConditions?.[outcome.id] ?? outcome.conditions;
      for (const condition of conditions) {
        const prefix = conditionPrefix(outcome.id, condition.id);
        const leftSlot = operandSlot(prefix, "left");
        const key = listingKeyFromLeft(hydrateRuleLeft(condition), slots[leftSlot]?.[0]?.field);
        if (key) keys.push(key);
      }
    }
    return [...new Set(keys)];
  }, [draft.enabledOutcomeIds, draft.outcomeConditions, outcomes, slots]);

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {outcomes.map((outcome) => (
        <OutcomeCard
          key={outcome.id}
          outcome={outcome}
          config={draft}
          mappedSlots={slots}
          onConfig={(next, nextSlots) => onChange({ ruleConfig: { ...next, listingFieldIds }, mappedSlots: nextSlots })}
        />
      ))}
    </Space>
  );
}
