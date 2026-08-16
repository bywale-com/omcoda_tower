/**
 * C0 → C6. Global Agents settings. Not a third Settings surface.
 */
import { useEffect, useState } from "react";
import { Button, InputNumber, Modal, Select, Space, Switch, Typography, message } from "antd";
import { wirePorts } from "../../../wire/registry";
import {
  ALL_CHANNELS,
  CHANNEL_LABEL,
  CHANNEL_RULE_TOGGLES,
  DISTANCE_OPTIONS,
  emptyChannelRules,
  type ChannelId,
  type ChannelRulesDraft,
} from "./channelRuleGrain";
import { MODAL_SCROLL } from "./modalScroll";

function rulesFromCriteria(
  token: ChannelId,
  rows: Array<{
    id: string;
    label: string;
    enabled: boolean;
    condition_clause: string | null;
    when_clause: string | null;
    threshold: number | null;
    threshold_unit: string | null;
  }>,
): ChannelRulesDraft {
  const scoped = rows.filter(
    (row) =>
      (row.when_clause ?? "").includes(`channel=${token}`) ||
      row.id.includes(`-${token}-`) ||
      row.label.toLowerCase().startsWith(CHANNEL_LABEL[token].toLowerCase()),
  );
  const draft = emptyChannelRules();
  draft.override = true;
  for (const spec of CHANNEL_RULE_TOGGLES[token]) {
    const hit = scoped.find(
      (row) =>
        (row.condition_clause ?? "").toLowerCase().includes(spec.condition) ||
        row.id.endsWith(spec.key) ||
        row.label.toLowerCase().includes(spec.label),
    );
    draft.toggles[spec.key] = hit ? hit.enabled : false;
    if (spec.key === "within_time" && hit) {
      draft.withinTime = hit.threshold;
      draft.withinUnit = hit.threshold_unit;
    }
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
    text: emptyChannelRules(),
    email: emptyChannelRules(),
    call: emptyChannelRules(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void Promise.all([wirePorts.machineApi.getAttemptCycle(), wirePorts.machineApi.listAttemptCriteria()])
      .then(([cycle, criteria]) => {
        setAttemptCount(cycle.cycle.attempt_count ?? 3);
        setWaitSeconds(cycle.cycle.wait_after_last_failed_seconds ?? 86400);
        setRules({
          text: rulesFromCriteria("text", criteria),
          email: rulesFromCriteria("email", criteria),
          call: rulesFromCriteria("call", criteria),
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
      let ord = 10;
      for (const token of ALL_CHANNELS) {
        const family = rules[token];
        for (const spec of CHANNEL_RULE_TOGGLES[token]) {
          await wirePorts.machineApi.upsertAttemptCriteria(`acr-c6-${token}-${spec.key}`, {
            label: `${CHANNEL_LABEL[token]} · ${spec.label}`,
            enabled: Boolean(family.toggles[spec.key]),
            whenClause: `channel=${token}`,
            conditionClause: spec.condition,
            threshold: spec.key === "within_time" ? family.withinTime : null,
            thresholdUnit: spec.key === "within_time" ? family.withinUnit : null,
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
          {ALL_CHANNELS.map((token) => (
            <div key={token} style={{ marginBottom: 12 }}>
              <Typography.Text strong>{CHANNEL_LABEL[token]}</Typography.Text>
              <Space direction="vertical" size={6} style={{ width: "100%", marginTop: 6 }}>
                {CHANNEL_RULE_TOGGLES[token].map((spec) => (
                  <div key={spec.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography.Text>{spec.label}</Typography.Text>
                    {spec.key === "within_time" ? (
                      <Space size={4}>
                        <Switch
                          size="small"
                          checked={Boolean(rules[token].toggles[spec.key])}
                          onChange={(on) =>
                            setRules((current) => ({
                              ...current,
                              [token]: { ...current[token], toggles: { ...current[token].toggles, [spec.key]: on } },
                            }))
                          }
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          value={rules[token].withinTime ?? undefined}
                          onChange={(value) =>
                            setRules((current) => ({
                              ...current,
                              [token]: { ...current[token], withinTime: typeof value === "number" ? value : null },
                            }))
                          }
                        />
                        <Select
                          size="small"
                          style={{ width: 100 }}
                          value={rules[token].withinUnit ?? "minutes"}
                          options={[
                            { value: "minutes", label: "minutes" },
                            { value: "hours", label: "hours" },
                            { value: "days", label: "days" },
                          ]}
                          onChange={(withinUnit) =>
                            setRules((current) => ({
                              ...current,
                              [token]: { ...current[token], withinUnit },
                            }))
                          }
                        />
                      </Space>
                    ) : (
                      <Switch
                        size="small"
                        checked={Boolean(rules[token].toggles[spec.key])}
                        onChange={(on) =>
                          setRules((current) => ({
                            ...current,
                            [token]: { ...current[token], toggles: { ...current[token].toggles, [spec.key]: on } },
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </Space>
            </div>
          ))}
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
