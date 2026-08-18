import { useMemo } from "react";
import { Button, Input, Segmented, Select, Space, Switch, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { CONDITION_OPERATORS } from "../../../../data/automationConditions";
import {
  emptyRuleNodeConfig,
  getRulePack,
  type RuleConditionDefinition,
  type RuleNodeConfig,
  type RuleOutcomeDefinition,
} from "../../../../data/automationRules";
import { DEFAULT_NAMED_CODE, formatConstantEnvName } from "./plateChrome";

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

function OutcomeCard({
  outcome,
  config,
  onConfig,
}: {
  outcome: RuleOutcomeDefinition;
  config: RuleNodeConfig;
  onConfig: (next: RuleNodeConfig) => void;
}) {
  const enabled = new Set(config.enabledOutcomeIds ?? []);
  const on = enabled.has(outcome.id);
  const mode = config.outcomeAuthorMode?.[outcome.id] ?? "gui";
  const conditions = config.outcomeConditions?.[outcome.id] ?? outcome.conditions;
  const code = config.outcomeCode?.[outcome.id] ?? config.namedCode ?? DEFAULT_NAMED_CODE;
  const title = config.outcomeCodeTitle?.[outcome.id] ?? outcome.label;

  const setOn = (next: boolean) => {
    const current = config.enabledOutcomeIds ?? [];
    onConfig({
      ...config,
      enabledOutcomeIds: next ? [...new Set([...current, outcome.id])] : current.filter((id) => id !== outcome.id),
    });
  };

  const setMode = (next: "gui" | "js") => {
    onConfig({
      ...config,
      outcomeAuthorMode: { ...config.outcomeAuthorMode, [outcome.id]: next },
    });
  };

  const setConditions = (next: RuleConditionDefinition[]) => {
    onConfig({
      ...config,
      outcomeConditions: { ...config.outcomeConditions, [outcome.id]: next },
    });
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
          {conditions.map((condition, index) => (
            <div
              key={condition.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 96px 1fr",
                gap: 8,
              }}
            >
              <Input
                value={condition.label || condition.leftField}
                onChange={(event) => {
                  const next = conditions.map((row, i) =>
                    i === index ? { ...row, label: event.target.value, leftField: event.target.value } : row,
                  );
                  setConditions(next);
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
              <Input
                value={formatConstantEnvName(condition.constantKey)}
                onChange={(event) => {
                  const next = conditions.map((row, i) =>
                    i === index ? { ...row, constantKey: event.target.value } : row,
                  );
                  setConditions(next);
                }}
              />
            </div>
          ))}
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
            onConfig({
              ...config,
              outcomeCodeTitle: { ...config.outcomeCodeTitle, [outcome.id]: next },
            })
          }
          onCode={(next) =>
            onConfig({
              ...config,
              outcomeCode: { ...config.outcomeCode, [outcome.id]: next },
            })
          }
        />
      ) : null}
    </div>
  );
}

export function RuleOutcomesPane({
  config,
  onChange,
}: {
  config: RuleNodeConfig | undefined;
  onChange: (next: RuleNodeConfig) => void;
}) {
  const draft = config ?? emptyRuleNodeConfig();
  const pack = getRulePack(draft.packId);
  const outcomes = pack?.outcomes ?? [];
  const listingFieldIds = useMemo(() => {
    const enabled = new Set(draft.enabledOutcomeIds ?? []);
    return outcomes
      .filter((row) => enabled.has(row.id))
      .flatMap((row) => (draft.outcomeConditions?.[row.id] ?? row.conditions).map((c) => c.leftField))
      .filter(Boolean);
  }, [draft.enabledOutcomeIds, draft.outcomeConditions, outcomes]);

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {outcomes.map((outcome) => (
        <OutcomeCard
          key={outcome.id}
          outcome={outcome}
          config={draft}
          onConfig={(next) => onChange({ ...next, listingFieldIds })}
        />
      ))}
    </Space>
  );
}
