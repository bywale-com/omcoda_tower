/**
 * Agents canvas — C1–C5 / C9 / C11. Pictures are the spec.
 * Qualify pill is chrome only. Channels: text | email | call.
 * Independently open. Variations on every channel. Channel-rules extra node.
 */
import { useState } from "react";
import {
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { CampaignHousingDraft, CampaignObjectiveKind } from "../../../wire/machineTypes";
import {
  ALL_CHANNELS,
  CHANNEL_LABEL,
  CHANNEL_RULE_TOGGLES,
  DISTANCE_OPTIONS,
  emptyChannelRules,
  emptyContent,
  emptyVariation,
  type ChannelId,
  type ChannelRulesDraft,
  type ChannelVariationDraft,
  type VariationApplyMode,
} from "./channelRuleGrain";
import { MODAL_SCROLL } from "./modalScroll";

type ScratchKind = "click" | "meeting" | "form";

export type CampaignDraft = {
  id: string;
  name: string;
  configured: boolean;
  objectiveName: string;
  objectiveKind: CampaignObjectiveKind | null;
  objectiveSource: "template" | "scratch";
  sequencing: ChannelId[];
  overrideThis: boolean;
  attemptCount: number | null;
  waitAfterLastFailedSeconds: number | null;
  openChannelIds: ChannelId[];
  channelOverrideContent: Record<ChannelId, boolean>;
  channelVariations: Record<ChannelId, ChannelVariationDraft[]>;
  channelRules: Record<ChannelId, ChannelRulesDraft>;
};

const SCRATCH_LABEL: Record<ScratchKind, string> = {
  click: "Click this link",
  meeting: "Book a meeting in this calendar",
  form: "Submit / complete this form",
};

const KIND_FROM_SCRATCH: Record<ScratchKind, CampaignObjectiveKind> = {
  click: "click",
  meeting: "meeting",
  form: "form",
};

const COMPLETION_FOR_KIND: Record<
  CampaignObjectiveKind,
  "messaging_events" | "fact_writebacks" | "meeting_booked"
> = {
  click: "messaging_events",
  form: "fact_writebacks",
  meeting: "meeting_booked",
};

const OBJECTIVE_TEMPLATES = [
  { id: "launch-window", name: "Launch window", hint: "Example name — operator can rename", kind: "click" as const },
  { id: "launch-day", name: "Launch day", hint: "Example name — operator can rename", kind: "form" as const },
  { id: "additional", name: "Additional", hint: "Unnamed", disabled: true, kind: "click" as const },
];

function emptyChannelBag() {
  return {
    channelOverrideContent: { text: true, email: true, call: true } as Record<ChannelId, boolean>,
    channelVariations: {
      text: [emptyVariation("text", 0)],
      email: [emptyVariation("email", 0)],
      call: [emptyVariation("call", 0)],
    } as Record<ChannelId, ChannelVariationDraft[]>,
    channelRules: {
      text: emptyChannelRules(),
      email: emptyChannelRules(),
      call: emptyChannelRules(),
    } as Record<ChannelId, ChannelRulesDraft>,
  };
}

export function emptyCampaign(id: string): CampaignDraft {
  return {
    id,
    name: "Untitled campaign",
    configured: false,
    objectiveName: "",
    objectiveKind: null,
    objectiveSource: "scratch",
    sequencing: [...ALL_CHANNELS],
    overrideThis: false,
    attemptCount: 3,
    waitAfterLastFailedSeconds: 86400,
    openChannelIds: [],
    ...emptyChannelBag(),
  };
}

function rulesFromRows(
  token: ChannelId,
  rows: Array<{
    label: string;
    enabled: boolean;
    condition_clause: string | null;
    threshold: number | null;
    threshold_unit: string | null;
  }>,
): ChannelRulesDraft {
  if (!rows.length) return emptyChannelRules();
  const toggles: Record<string, boolean> = {};
  let withinTime: number | null = 30;
  let withinUnit: string | null = "minutes";
  for (const spec of CHANNEL_RULE_TOGGLES[token]) {
    const hit = rows.find(
      (row) =>
        (row.condition_clause ?? "").toLowerCase().includes(spec.condition) ||
        row.label.toLowerCase().includes(spec.label),
    );
    toggles[spec.key] = hit ? hit.enabled : false;
    if (spec.key === "within_time" && hit) {
      withinTime = hit.threshold;
      withinUnit = hit.threshold_unit;
    }
  }
  return { override: true, toggles, withinTime, withinUnit };
}

export function housingToDrafts(
  campaigns: import("../../../wire/machineTypes").CampaignHousingRow[],
): CampaignDraft[] {
  return campaigns.map((row) => {
    const bag = emptyChannelBag();
    for (const ch of row.channels) {
      const vars = (ch.variations?.length
        ? ch.variations
        : [
            {
              id: `var-${ch.id}`,
              ord: 0,
              apply_mode: "every" as const,
              attempt_n: null,
              content: ch.content ?? emptyContent(ch.token),
            },
          ]
      ).map((v, i) => ({
        id: v.id,
        ord: v.ord ?? i,
        applyMode: v.apply_mode,
        attemptN: v.attempt_n,
        content: v.content ?? emptyContent(ch.token),
      }));
      bag.channelVariations[ch.token] = vars;
      bag.channelOverrideContent[ch.token] = ch.override_content;
      bag.channelRules[ch.token] = rulesFromRows(ch.token, ch.rules ?? []);
    }
    const sequencing: ChannelId[] =
      row.channels.length > 0
        ? row.channels
            .slice()
            .sort((a, b) => a.ord - b.ord)
            .map((ch) => ch.token)
        : [...ALL_CHANNELS];
    return {
      id: row.id,
      name: row.name,
      configured: Boolean(row.objective),
      objectiveName: row.objective?.name ?? "",
      objectiveKind: row.objective?.kind ?? null,
      objectiveSource: row.objective?.source ?? "scratch",
      sequencing,
      overrideThis: row.override_this,
      attemptCount: row.attempt_count,
      waitAfterLastFailedSeconds: row.wait_after_last_failed_seconds,
      openChannelIds: [],
      ...bag,
    };
  });
}

export function draftsToHousing(drafts: CampaignDraft[]): CampaignHousingDraft[] {
  return drafts.map((draft, index) => ({
    id: draft.id,
    name: draft.name,
    ord: index,
    overrideThis: draft.overrideThis,
    attemptCount: draft.attemptCount,
    waitAfterLastFailedSeconds: draft.waitAfterLastFailedSeconds,
    objective:
      draft.configured && draft.objectiveKind
        ? {
            kind: draft.objectiveKind,
            name: draft.objectiveName || draft.name,
            completionTable: COMPLETION_FOR_KIND[draft.objectiveKind],
            source: draft.objectiveSource,
          }
        : undefined,
    channels: draft.overrideThis
      ? draft.sequencing.map((token, ord) => {
          const variations = draft.channelVariations[token] ?? [emptyVariation(token, 0)];
          const rules = draft.channelRules[token] ?? emptyChannelRules();
          return {
            token,
            ord,
            overrideContent: draft.channelOverrideContent[token] ?? true,
            content: variations[0]?.content ?? emptyContent(token),
            variations: variations.map((v, i) => ({
              id: v.id,
              ord: v.ord ?? i,
              applyMode: v.applyMode,
              attemptN: v.attemptN,
              content: v.content,
            })),
            rulesOverride: rules.override,
            rules: CHANNEL_RULE_TOGGLES[token].map((spec, i) => ({
              key: spec.key,
              label: `${CHANNEL_LABEL[token]} · ${spec.label}`,
              enabled: Boolean(rules.toggles[spec.key]),
              condition: spec.condition,
              threshold: spec.key === "within_time" ? rules.withinTime : null,
              thresholdUnit: spec.key === "within_time" ? rules.withinUnit : null,
              ord: i,
            })),
          };
        })
      : [],
  }));
}

function ForkWires({ count, color }: { count: number; color: string }) {
  const paths = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * 100;
    return `M 0 50 C 28 50 28 ${y} 56 ${y}`;
  });
  return (
    <svg viewBox="0 0 56 100" preserveAspectRatio="none" aria-hidden style={{ width: 56, height: "100%", display: "block" }}>
      {paths.map((d) => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth="1.75" vectorEffect="nonScalingStroke" />
      ))}
    </svg>
  );
}

function ChannelComposer({
  channel,
  content,
  onChange,
}: {
  channel: ChannelId;
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const patch = (key: string, value: string) => onChange({ ...content, [key]: value });
  if (channel === "text") {
    return (
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Input placeholder="To" value={String(content.to ?? "")} onChange={(event) => patch("to", event.target.value)} />
        <Input.TextArea
          placeholder="Message"
          rows={3}
          value={String(content.body ?? "")}
          onChange={(event) => patch("body", event.target.value)}
        />
      </Space>
    );
  }
  if (channel === "email") {
    return (
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Input placeholder="Subject" value={String(content.subject ?? "")} onChange={(event) => patch("subject", event.target.value)} />
        <Input placeholder="From" value={String(content.from ?? "")} onChange={(event) => patch("from", event.target.value)} />
        <Input placeholder="Reply to" value={String(content.reply_to ?? "")} onChange={(event) => patch("reply_to", event.target.value)} />
        <Input.TextArea
          placeholder="Body"
          rows={4}
          value={String(content.body_text ?? content.body_html ?? "")}
          onChange={(event) => patch("body_text", event.target.value)}
        />
      </Space>
    );
  }
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Input placeholder="Voice" value={String(content.voice ?? "")} onChange={(event) => patch("voice", event.target.value)} />
      <Input.TextArea placeholder="Script" rows={3} value={String(content.script ?? "")} onChange={(event) => patch("script", event.target.value)} />
      <Input
        placeholder="Listening prompt"
        value={String(content.listening_prompt ?? "")}
        onChange={(event) => patch("listening_prompt", event.target.value)}
      />
      <Input placeholder="Goal" value={String(content.goal ?? "")} onChange={(event) => patch("goal", event.target.value)} />
      <Input.TextArea placeholder="Notes" rows={2} value={String(content.notes ?? "")} onChange={(event) => patch("notes", event.target.value)} />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Call saves the composer. It does not dial.
      </Typography.Text>
    </Space>
  );
}

function ChannelRulesNode({
  channel,
  rules,
  onChange,
}: {
  channel: ChannelId;
  rules: ChannelRulesDraft;
  onChange: (next: ChannelRulesDraft) => void;
}) {
  const { token } = theme.useToken();
  const disabled = !rules.override;
  return (
    <Card size="small" title="Channel rules">
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Text>Override this channel</Typography.Text>
          <Switch
            size="small"
            checked={rules.override}
            onChange={(override) => onChange({ ...rules, override })}
          />
        </div>
        {CHANNEL_RULE_TOGGLES[channel].map((spec) => (
          <div
            key={spec.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: disabled ? 0.45 : 1,
              pointerEvents: disabled ? "none" : "auto",
            }}
          >
            <Typography.Text>{spec.label}</Typography.Text>
            {spec.key === "within_time" ? (
              <Space size={4}>
                <Switch
                  size="small"
                  checked={Boolean(rules.toggles[spec.key])}
                  onChange={(on) => onChange({ ...rules, toggles: { ...rules.toggles, [spec.key]: on } })}
                />
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
                  options={[
                    { value: "minutes", label: "minutes" },
                    { value: "hours", label: "hours" },
                    { value: "days", label: "days" },
                  ]}
                  onChange={(withinUnit) => onChange({ ...rules, withinUnit })}
                />
              </Space>
            ) : (
              <Switch
                size="small"
                checked={Boolean(rules.toggles[spec.key])}
                onChange={(on) => onChange({ ...rules, toggles: { ...rules.toggles, [spec.key]: on } })}
              />
            )}
          </div>
        ))}
        <Typography.Text type="secondary" style={{ fontSize: 11, color: token.colorTextSecondary }}>
          This {CHANNEL_LABEL[channel]} in this campaign. Variations share these.
        </Typography.Text>
      </Space>
    </Card>
  );
}

function ChannelNode({
  channel,
  open,
  overrideContent,
  variations,
  onOpen,
  onOverrideContent,
  onVariations,
}: {
  channel: ChannelId;
  open: boolean;
  overrideContent: boolean;
  variations: ChannelVariationDraft[];
  onOpen: (next: boolean) => void;
  onOverrideContent: (next: boolean) => void;
  onVariations: (next: ChannelVariationDraft[]) => void;
}) {
  const { token } = theme.useToken();
  const patchVar = (id: string, next: Partial<ChannelVariationDraft>) => {
    onVariations(variations.map((row) => (row.id === id ? { ...row, ...next } : row)));
  };
  return (
    <Card
      size="small"
      style={{ borderColor: open ? token.colorPrimary : token.colorBorder }}
      title={
        <Space>
          <span>{CHANNEL_LABEL[channel]}</span>
          <Tag>medium</Tag>
        </Space>
      }
      extra={
        <Switch size="small" checked={open} onChange={onOpen} checkedChildren="Open" unCheckedChildren="Closed" />
      }
    >
      {open ? (
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography.Text>Override content</Typography.Text>
            <Switch size="small" checked={overrideContent} onChange={onOverrideContent} />
          </div>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() =>
              onVariations([...variations, emptyVariation(channel, variations.length)])
            }
          >
            Add variation
          </Button>
          {variations.map((variation, index) => (
            <Card key={variation.id} size="small" title={`Variation ${index + 1}`}>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Space wrap>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Runs on
                  </Typography.Text>
                  <Select
                    size="small"
                    value={variation.applyMode}
                    style={{ minWidth: 200 }}
                    options={[
                      { value: "every", label: "Every attempt" },
                      { value: "only_this", label: "Only this attempt" },
                      { value: "every_except", label: "Every attempt except this one" },
                    ]}
                    onChange={(applyMode: VariationApplyMode) =>
                      patchVar(variation.id, {
                        applyMode,
                        attemptN: applyMode === "every" ? null : (variation.attemptN ?? 1),
                      })
                    }
                  />
                  {variation.applyMode !== "every" ? (
                    <InputNumber
                      size="small"
                      min={1}
                      value={variation.attemptN ?? 1}
                      onChange={(value) =>
                        patchVar(variation.id, { attemptN: typeof value === "number" ? value : 1 })
                      }
                    />
                  ) : null}
                </Space>
                <div style={{ opacity: overrideContent ? 1 : 0.45, pointerEvents: overrideContent ? "auto" : "none" }}>
                  <ChannelComposer
                    channel={channel}
                    content={variation.content}
                    onChange={(content) => patchVar(variation.id, { content })}
                  />
                </div>
              </Space>
            </Card>
          ))}
        </Space>
      ) : (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Open this node. Campaign toggles stay on the campaign.
        </Typography.Text>
      )}
    </Card>
  );
}

function CampaignNode({
  campaign,
  onChange,
  onAddObjective,
}: {
  campaign: CampaignDraft;
  onChange: (next: CampaignDraft) => void;
  onAddObjective: () => void;
}) {
  const { token } = theme.useToken();
  const n = Math.max(campaign.sequencing.length, 1);
  const remaining = ALL_CHANNELS.filter((ch) => !campaign.sequencing.includes(ch));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: campaign.overrideThis
          ? "minmax(260px, 320px) 56px minmax(280px, 1fr)"
          : "minmax(260px, 320px)",
        alignItems: "stretch",
      }}
    >
      <div style={{ gridColumn: 1, gridRow: `1 / span ${campaign.overrideThis ? n + 1 : 1}` }}>
        <Card
          size="small"
          style={{ height: "100%", borderColor: token.colorPrimaryBorder }}
          title={
            <Input
              value={campaign.name}
              variant="borderless"
              onChange={(event) => onChange({ ...campaign, name: event.target.value })}
            />
          }
        >
          {campaign.configured ? (
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  Objective (campaign)
                </Typography.Text>
                <Typography.Text>{campaign.objectiveName}</Typography.Text>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  Sequencing (campaign level)
                </Typography.Text>
                <Space size={4} wrap>
                  {campaign.sequencing.map((ch, i) => (
                    <span key={ch}>
                      {i > 0 ? <Typography.Text type="secondary"> → </Typography.Text> : null}
                      <Tag>{CHANNEL_LABEL[ch]}</Tag>
                    </span>
                  ))}
                </Space>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${token.colorSplit}`,
                  paddingTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text strong>Override this</Typography.Text>
                <Switch
                  checked={campaign.overrideThis}
                  onChange={(overrideThis) =>
                    onChange({
                      ...campaign,
                      overrideThis,
                      openChannelIds: overrideThis ? campaign.openChannelIds : [],
                    })
                  }
                />
              </div>
              {campaign.overrideThis ? (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                      Attempt count
                    </Typography.Text>
                    <InputNumber
                      min={1}
                      value={campaign.attemptCount ?? 3}
                      onChange={(value) =>
                        onChange({ ...campaign, attemptCount: typeof value === "number" ? value : 3 })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                      Distance between attempts
                    </Typography.Text>
                    <Select
                      value={campaign.waitAfterLastFailedSeconds ?? 86400}
                      style={{ width: "100%" }}
                      options={DISTANCE_OPTIONS.filter(
                        (row, i, all) => all.findIndex((other) => other.seconds === row.seconds) === i,
                      ).map((row) => ({ value: row.seconds, label: row.label }))}
                      onChange={(waitAfterLastFailedSeconds) =>
                        onChange({ ...campaign, waitAfterLastFailedSeconds })
                      }
                    />
                  </div>
                </Space>
              ) : null}
            </Space>
          ) : (
            <Button danger block onClick={onAddObjective}>
              Add objective
            </Button>
          )}
        </Card>
      </div>
      {campaign.overrideThis
        ? [
            <div key="wires" style={{ gridColumn: 2, gridRow: `1 / span ${n}`, minHeight: 160 }}>
              <ForkWires count={n} color={token.colorPrimary} />
            </div>,
            ...campaign.sequencing.map((ch, i) => {
              const open = campaign.openChannelIds.includes(ch);
              return (
                <div key={ch} style={{ gridColumn: 3, gridRow: i + 1, padding: "6px 0 6px 4px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <ChannelNode
                        channel={ch}
                        open={open}
                        overrideContent={campaign.channelOverrideContent[ch]}
                        variations={campaign.channelVariations[ch] ?? [emptyVariation(ch, 0)]}
                        onOpen={(next) =>
                          onChange({
                            ...campaign,
                            openChannelIds: next
                              ? [...campaign.openChannelIds.filter((id) => id !== ch), ch]
                              : campaign.openChannelIds.filter((id) => id !== ch),
                          })
                        }
                        onOverrideContent={(value) =>
                          onChange({
                            ...campaign,
                            channelOverrideContent: { ...campaign.channelOverrideContent, [ch]: value },
                          })
                        }
                        onVariations={(variations) =>
                          onChange({
                            ...campaign,
                            channelVariations: { ...campaign.channelVariations, [ch]: variations },
                          })
                        }
                      />
                    </div>
                    {open ? (
                      <>
                        <svg width="24" height="24" style={{ alignSelf: "center", flexShrink: 0 }} aria-hidden>
                          <path d="M0 12 H24" fill="none" stroke={token.colorPrimary} strokeWidth="1.75" />
                        </svg>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <ChannelRulesNode
                            channel={ch}
                            rules={campaign.channelRules[ch] ?? emptyChannelRules()}
                            onChange={(rules) =>
                              onChange({
                                ...campaign,
                                channelRules: { ...campaign.channelRules, [ch]: rules },
                              })
                            }
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            }),
            remaining.length ? (
              <div key="add-channel" style={{ gridColumn: 3, gridRow: n + 1, padding: "8px 0 0 4px" }}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const token = remaining[0];
                    if (!token) return;
                    onChange({
                      ...campaign,
                      sequencing: [...campaign.sequencing, token],
                      channelVariations: {
                        ...campaign.channelVariations,
                        [token]: campaign.channelVariations[token]?.length
                          ? campaign.channelVariations[token]
                          : [emptyVariation(token, 0)],
                      },
                    });
                  }}
                >
                  Add channel
                </Button>
              </div>
            ) : null,
          ]
        : null}
    </div>
  );
}

function ObjectiveModal({
  open,
  onCancel,
  onApply,
}: {
  open: boolean;
  onCancel: () => void;
  onApply: (next: {
    name: string;
    kind: CampaignObjectiveKind;
    source: "template" | "scratch";
    campaignName: string;
  }) => void;
}) {
  const [tab, setTab] = useState<"template" | "scratch">("template");
  const [templateId, setTemplateId] = useState("launch-window");
  const [scratch, setScratch] = useState<ScratchKind>("click");
  const [name, setName] = useState("Click this link");

  return (
    <Modal
      title="Add objective"
      open={open}
      onCancel={onCancel}
      okText="Set objective"
      {...MODAL_SCROLL}
      onOk={() => {
        if (tab === "template") {
          const picked = OBJECTIVE_TEMPLATES.find((row) => row.id === templateId);
          onApply({
            name: picked?.hint.includes("Example")
              ? picked?.kind === "click"
                ? "Click this link"
                : "They opt in"
              : (picked?.name ?? "Launch window"),
            kind: picked?.kind ?? "click",
            source: "template",
            campaignName: picked?.name ?? "Launch window",
          });
        } else {
          onApply({
            name: name.trim() || SCRATCH_LABEL[scratch],
            kind: KIND_FROM_SCRATCH[scratch],
            source: "scratch",
            campaignName: name.trim() || SCRATCH_LABEL[scratch],
          });
        }
      }}
    >
      <Radio.Group value={tab} onChange={(event) => setTab(event.target.value)} style={{ marginBottom: 16 }}>
        <Radio.Button value="template">From a template</Radio.Button>
        <Radio.Button value="scratch">From scratch</Radio.Button>
      </Radio.Group>
      {tab === "template" ? (
        <Radio.Group
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {OBJECTIVE_TEMPLATES.map((row) => (
            <Radio key={row.id} value={row.id} disabled={row.disabled}>
              <Space direction="vertical" size={0}>
                <Typography.Text>{row.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {row.hint}
                </Typography.Text>
              </Space>
            </Radio>
          ))}
        </Radio.Group>
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Radio.Group
            value={scratch}
            onChange={(event) => {
              const next = event.target.value as ScratchKind;
              setScratch(next);
              setName(SCRATCH_LABEL[next]);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {(Object.keys(SCRATCH_LABEL) as ScratchKind[]).map((id) => (
              <Radio key={id} value={id}>
                {SCRATCH_LABEL[id]}
              </Radio>
            ))}
          </Radio.Group>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name this objective" />
        </Space>
      )}
    </Modal>
  );
}

export function AntAgentCanvas({
  campaigns,
  onChange,
}: {
  campaigns: CampaignDraft[];
  onChange: (next: CampaignDraft[]) => void;
}) {
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCampaignId, setModalCampaignId] = useState<string | null>(null);

  const patch = (id: string, next: CampaignDraft) => {
    onChange(campaigns.map((row) => (row.id === id ? next : row)));
  };

  const openObjective = (id: string) => {
    setModalCampaignId(id);
    setModalOpen(true);
  };

  const applyObjective = (next: {
    name: string;
    kind: CampaignObjectiveKind;
    source: "template" | "scratch";
    campaignName: string;
  }) => {
    if (!modalCampaignId) return;
    const campaign = campaigns.find((row) => row.id === modalCampaignId);
    if (!campaign) return;
    patch(modalCampaignId, {
      ...campaign,
      configured: true,
      name: next.campaignName,
      objectiveName: next.name,
      objectiveKind: next.kind,
      objectiveSource: next.source,
    });
    setModalOpen(false);
  };

  const addCampaign = () => {
    const id = `c-new-${Date.now()}`;
    onChange([...campaigns, emptyCampaign(id)]);
    openObjective(id);
  };

  return (
    <div
      data-register-surface="Agent / sequence editor"
      style={{ height: "100%", minWidth: 0, minHeight: 0, overflow: "auto", padding: 18 }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 1200 }}>
        <Button icon={<PlusOutlined />} onClick={addCampaign}>
          Add campaign
        </Button>
        {campaigns.map((campaign, index) => (
          <div key={campaign.id}>
            {index > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "8px 0 8px 24px",
                }}
              >
                <div style={{ width: 2, height: 18, background: token.colorPrimary, marginLeft: 7 }} />
                <Tag color="blue">qualify — first objective met</Tag>
                <div style={{ width: 2, height: 18, background: token.colorPrimary, marginLeft: 7 }} />
              </div>
            ) : null}
            <CampaignNode
              campaign={campaign}
              onChange={(next) => patch(campaign.id, next)}
              onAddObjective={() => openObjective(campaign.id)}
            />
          </div>
        ))}
      </Space>
      <ObjectiveModal open={modalOpen} onCancel={() => setModalOpen(false)} onApply={applyObjective} />
    </div>
  );
}
