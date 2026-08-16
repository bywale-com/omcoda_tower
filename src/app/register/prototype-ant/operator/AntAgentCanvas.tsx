/**
 * Agents canvas — C1–C5 / C5b. Pictures are the spec.
 * Qualify pill is chrome only. Channels: text | email | call.
 * C8 Add contact lives in the sequence header (workbench).
 */
import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Radio,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { CampaignHousingDraft, CampaignObjectiveKind } from "../../../wire/machineTypes";

export type ChannelId = "text" | "email" | "call";
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
  openChannelId: ChannelId | null;
  channelContent: Record<ChannelId, Record<string, unknown>>;
};

const CHANNEL_LABEL: Record<ChannelId, string> = {
  text: "Text",
  email: "Email",
  call: "Call",
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

function emptyContent(token: ChannelId): Record<string, unknown> {
  if (token === "text") return { to: "", body: "" };
  if (token === "email") return { subject: "", from: "", reply_to: "", body_html: "", body_text: "" };
  return { voice: "", script: "", listening_prompt: "", goal: "", notes: "" };
}

export function emptyCampaign(id: string): CampaignDraft {
  return {
    id,
    name: "Untitled campaign",
    configured: false,
    objectiveName: "",
    objectiveKind: null,
    objectiveSource: "scratch",
    sequencing: ["text", "email", "call"],
    overrideThis: false,
    openChannelId: null,
    channelContent: {
      text: emptyContent("text"),
      email: emptyContent("email"),
      call: emptyContent("call"),
    },
  };
}

export function housingToDrafts(campaigns: import("../../../wire/machineTypes").CampaignHousingRow[]): CampaignDraft[] {
  return campaigns.map((row) => {
    const content: CampaignDraft["channelContent"] = {
      text: emptyContent("text"),
      email: emptyContent("email"),
      call: emptyContent("call"),
    };
    for (const ch of row.channels) {
      content[ch.token] = ch.content ?? emptyContent(ch.token);
    }
    const sequencing: ChannelId[] =
      row.channels.length > 0
        ? row.channels
            .slice()
            .sort((a, b) => a.ord - b.ord)
            .map((ch) => ch.token)
        : ["text", "email", "call"];
    return {
      id: row.id,
      name: row.name,
      configured: Boolean(row.objective),
      objectiveName: row.objective?.name ?? "",
      objectiveKind: row.objective?.kind ?? null,
      objectiveSource: row.objective?.source ?? "scratch",
      sequencing,
      overrideThis: row.override_this,
      openChannelId: null,
      channelContent: content,
    };
  });
}

export function draftsToHousing(drafts: CampaignDraft[]): CampaignHousingDraft[] {
  return drafts.map((draft, index) => ({
    id: draft.id,
    name: draft.name,
    ord: index,
    overrideThis: draft.overrideThis,
    objective: draft.configured && draft.objectiveKind
      ? {
          kind: draft.objectiveKind,
          name: draft.objectiveName || draft.name,
          completionTable: COMPLETION_FOR_KIND[draft.objectiveKind],
          source: draft.objectiveSource,
        }
      : undefined,
    channels: draft.overrideThis
      ? draft.sequencing.map((token, ord) => ({
          token,
          ord,
          overrideContent: true,
          content: draft.channelContent[token] ?? emptyContent(token),
        }))
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
        <Input
          placeholder="To"
          value={String(content.to ?? "")}
          onChange={(event) => patch("to", event.target.value)}
        />
        <Input.TextArea
          placeholder="Body"
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
        <Input
          placeholder="Subject"
          value={String(content.subject ?? "")}
          onChange={(event) => patch("subject", event.target.value)}
        />
        <Input
          placeholder="From"
          value={String(content.from ?? "")}
          onChange={(event) => patch("from", event.target.value)}
        />
        <Input
          placeholder="Reply to"
          value={String(content.reply_to ?? "")}
          onChange={(event) => patch("reply_to", event.target.value)}
        />
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
      <Input
        placeholder="Voice"
        value={String(content.voice ?? "")}
        onChange={(event) => patch("voice", event.target.value)}
      />
      <Input.TextArea
        placeholder="Script"
        rows={3}
        value={String(content.script ?? "")}
        onChange={(event) => patch("script", event.target.value)}
      />
      <Input
        placeholder="Listening prompt"
        value={String(content.listening_prompt ?? "")}
        onChange={(event) => patch("listening_prompt", event.target.value)}
      />
      <Input
        placeholder="Goal"
        value={String(content.goal ?? "")}
        onChange={(event) => patch("goal", event.target.value)}
      />
      <Input.TextArea
        placeholder="Notes"
        rows={2}
        value={String(content.notes ?? "")}
        onChange={(event) => patch("notes", event.target.value)}
      />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Call saves the composer. It does not dial.
      </Typography.Text>
    </Space>
  );
}

function ChannelNode({
  channel,
  open,
  content,
  onOpen,
  onContent,
}: {
  channel: ChannelId;
  open: boolean;
  content: Record<string, unknown>;
  onOpen: (next: boolean) => void;
  onContent: (next: Record<string, unknown>) => void;
}) {
  const { token } = theme.useToken();
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
        <ChannelComposer channel={channel} content={content} onChange={onContent} />
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
  const n = campaign.sequencing.length;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: campaign.overrideThis
          ? "minmax(260px, 320px) 56px minmax(220px, 1fr)"
          : "minmax(260px, 320px)",
        alignItems: "stretch",
      }}
    >
      <div style={{ gridColumn: 1, gridRow: `1 / span ${campaign.overrideThis ? n : 1}` }}>
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
                      openChannelId: overrideThis ? campaign.openChannelId : null,
                    })
                  }
                />
              </div>
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
            ...campaign.sequencing.map((ch, i) => (
              <div key={ch} style={{ gridColumn: 3, gridRow: i + 1, padding: "6px 0 6px 4px" }}>
                <ChannelNode
                  channel={ch}
                  open={campaign.openChannelId === ch}
                  content={campaign.channelContent[ch]}
                  onOpen={(next) => onChange({ ...campaign, openChannelId: next ? ch : null })}
                  onContent={(content) =>
                    onChange({
                      ...campaign,
                      channelContent: { ...campaign.channelContent, [ch]: content },
                    })
                  }
                />
              </div>
            )),
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
      onOk={() => {
        if (tab === "template") {
          const picked = OBJECTIVE_TEMPLATES.find((row) => row.id === templateId);
          onApply({
            name: picked?.hint.includes("Example") ? (picked?.kind === "click" ? "Click this link" : "They opt in") : (picked?.name ?? "Launch window"),
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
      <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 1100 }}>
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
