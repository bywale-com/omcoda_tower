/**
 * C0 → C6. Global Agents settings. Not a third Settings surface.
 * Channel rules: medium toggles + one Within time per Text / Email / Call.
 */
import { useEffect, useState } from "react";
import { Button, InputNumber, Modal, Select, Space, Typography, message } from "antd";
import { wirePorts } from "../../../wire/registry";
import {
  ALL_CHANNELS,
  CHANNEL_RULE_TOGGLES,
  DEFAULT_WITHIN_SECONDS,
  DISTANCE_OPTIONS,
  emptyChannelRules,
  globalCriteriaId,
  LEFTOVER_CRITERIA_IDS,
  partsToSeconds,
  secondsToParts,
  type ChannelId,
  type ChannelRulesDraft,
} from "./channelRuleGrain";
import { ChannelRulesFamilies } from "./ChannelRulesFields";
import { MODAL_SCROLL } from "./modalScroll";

function rulesFromCriteria(
  token: ChannelId,
  rows: Array<{
    id: string;
    label: string;
    enabled: boolean;
    condition_clause: string | null;
    when_clause: string | null;
    channel_token?: string | null;
    sequence_id?: string | null;
    campaign_channel_id?: string | null;
  }>,
  withinSeconds: number,
): ChannelRulesDraft {
  const scoped = rows.filter((row) => {
    if (LEFTOVER_CRITERIA_IDS.has(row.id)) return false;
    if (row.campaign_channel_id) return false;
    if (row.sequence_id) return false;
    if (row.channel_token) return row.channel_token === token;
    return (
      (row.when_clause ?? "").includes(`channel=${token}`) ||
      row.id.includes(`-${token}-`) ||
      row.id.startsWith(`acr-${token}-`)
    );
  });
  const draft = emptyChannelRules(token);
  const parts = secondsToParts(withinSeconds);
  draft.withinTime = parts.value;
  draft.withinUnit = parts.unit;
  for (const spec of CHANNEL_RULE_TOGGLES[token]) {
    const hit = scoped.find(
      (row) =>
        row.id === globalCriteriaId(token, spec.key) ||
        (row.condition_clause ?? "").toLowerCase().includes(spec.condition) ||
        row.id.endsWith(spec.key),
    );
    draft.toggles[spec.key] = hit ? hit.enabled : false;
  }
  return draft;
}

export function AgentsSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [attemptCount, setAttemptCount] = useState(3);
  const [waitSeconds, setWaitSeconds] = useState(86400);
  const [rules, setRules] = useState<Record<ChannelId, ChannelRulesDraft>>({
    text: emptyChannelRules("text"),
    email: emptyChannelRules("email"),
    call: emptyChannelRules("call"),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void Promise.all([
      wirePorts.machineApi.getAttemptCycle(),
      wirePorts.machineApi.listAttemptCriteria(),
      wirePorts.machineApi.listSeqChannelRules(),
    ])
      .then(([cycle, criteria, timers]) => {
        setAttemptCount(cycle.cycle.attempt_count ?? 3);
        setWaitSeconds(cycle.cycle.wait_after_last_failed_seconds ?? 86400);
        const byToken = Object.fromEntries(timers.map((row) => [row.token, row.within_seconds])) as Record<
          string,
          number
        >;
        setRules({
          text: rulesFromCriteria("text", criteria, byToken.text ?? DEFAULT_WITHIN_SECONDS.text),
          email: rulesFromCriteria("email", criteria, byToken.email ?? DEFAULT_WITHIN_SECONDS.email),
          call: rulesFromCriteria("call", criteria, byToken.call ?? DEFAULT_WITHIN_SECONDS.call),
        });
      })
      .catch((err) => message.error(`Agents settings load failed: ${String(err)}`));
  }, [open]);

  const save = async () => {
    setSaving(true);
    try {
      await wirePorts.machineApi.saveAttemptCycle({
        attemptCount,
        waitAfterLastFailedSeconds: waitSeconds,
      });
      await wirePorts.machineApi.saveSeqChannelRules({
        rules: ALL_CHANNELS.map((token) => ({
          token,
          withinSeconds: partsToSeconds(rules[token].withinTime, rules[token].withinUnit),
        })),
      });
      let ord = 10;
      for (const token of ALL_CHANNELS) {
        const family = rules[token];
        for (const spec of CHANNEL_RULE_TOGGLES[token]) {
          await wirePorts.machineApi.upsertAttemptCriteria(globalCriteriaId(token, spec.key), {
            label: spec.label,
            enabled: Boolean(family.toggles[spec.key]),
            whenClause: `channel=${token}`,
            conditionClause: spec.condition,
            sequenceId: null,
            channelToken: token,
            ord,
          });
          ord += 1;
        }
      }
      message.success("Saved Agents settings");
      onClose();
    } catch (err) {
      message.error(`Save failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Agents · Settings"
      open={open}
      onCancel={onClose}
      width={640}
      {...MODAL_SCROLL}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            If a sequence or campaign does not override, it uses these.
          </Typography.Text>
          <Button type="primary" loading={saving} onClick={() => void save()}>
            Save
          </Button>
        </div>
      }
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Global — defaults for every sequence unless overridden.
      </Typography.Paragraph>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            1. Attempt rules
          </Typography.Title>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Number of attempts
              </Typography.Text>
              <InputNumber min={1} value={attemptCount} onChange={(value) => setAttemptCount(typeof value === "number" ? value : 3)} />
            </div>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Wait / distance after the failed last node of an attempt
              </Typography.Text>
              <Select
                value={waitSeconds}
                style={{ width: 200 }}
                options={DISTANCE_OPTIONS.filter(
                  (row, i, all) => all.findIndex((other) => other.seconds === row.seconds) === i,
                ).map((row) => ({ value: row.seconds, label: row.label }))}
                onChange={setWaitSeconds}
              />
            </div>
          </Space>
        </div>
        <div>
          <Typography.Title level={5}>2. Channel rules (escalation)</Typography.Title>
          <ChannelRulesFamilies
            rules={rules}
            onChange={(token, next) => setRules((current) => ({ ...current, [token]: next }))}
          />
        </div>
        <div>
          <Typography.Title level={5}>3. Content</Typography.Title>
          <Typography.Paragraph type="secondary">
            Per medium (text / email / call) global content defaults — possible at global.
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Title level={5}>4. Sequencing</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Default channel order: Text → Email → Call.
          </Typography.Paragraph>
        </div>
      </Space>
    </Modal>
  );
}
