/**
 * One-timer channel-rules grain. Same rows at C6, C14, and C15.
 * Toggles are medium conditions. Within time is one field per channel.
 */
import { InputNumber, Select, Space, Switch, Typography } from "antd";
import {
  ALL_CHANNELS,
  CHANNEL_LABEL,
  CHANNEL_RULE_TOGGLES,
  WITHIN_UNIT_OPTIONS,
  type ChannelId,
  type ChannelRulesDraft,
} from "./channelRuleGrain";

export function ChannelRulesFields({
  token,
  rules,
  disabled,
  onChange,
}: {
  token: ChannelId;
  rules: ChannelRulesDraft;
  disabled?: boolean;
  onChange: (next: ChannelRulesDraft) => void;
}) {
  return (
    <Space
      direction="vertical"
      size={6}
      style={{
        width: "100%",
        marginTop: 6,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {CHANNEL_RULE_TOGGLES[token].map((spec) => (
        <div key={spec.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text>{spec.label}</Typography.Text>
          <Switch
            size="small"
            checked={Boolean(rules.toggles[spec.key])}
            onChange={(on) => onChange({ ...rules, toggles: { ...rules.toggles, [spec.key]: on } })}
          />
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Text>Within time</Typography.Text>
        <Space size={4}>
          <InputNumber
            size="small"
            min={1}
            value={rules.withinTime ?? undefined}
            onChange={(value) => onChange({ ...rules, withinTime: typeof value === "number" ? value : null })}
            style={{ width: 72 }}
          />
          <Select
            size="small"
            value={rules.withinUnit ?? "minutes"}
            style={{ width: 100 }}
            options={WITHIN_UNIT_OPTIONS}
            onChange={(withinUnit) => onChange({ ...rules, withinUnit })}
          />
        </Space>
      </div>
    </Space>
  );
}

export function ChannelRulesFamilies({
  rules,
  disabled,
  onChange,
}: {
  rules: Record<ChannelId, ChannelRulesDraft>;
  disabled?: boolean;
  onChange: (token: ChannelId, next: ChannelRulesDraft) => void;
}) {
  return (
    <>
      {ALL_CHANNELS.map((token) => (
        <div key={token} style={{ marginBottom: 12 }}>
          <Typography.Text strong>{CHANNEL_LABEL[token]}</Typography.Text>
          <ChannelRulesFields
            token={token}
            rules={rules[token]}
            disabled={disabled}
            onChange={(next) => onChange(token, next)}
          />
        </div>
      ))}
    </>
  );
}
