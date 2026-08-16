/**
 * Agents mock — every founder beat from 18:08 + 18:40, labeled MOCK.
 * Local state only. Timeline save path is unchanged.
 */
import { useEffect, useState } from "react";
import {
  Alert,
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
import type { AgentDefinition } from "../../../data/agentDefinitions";

type ChannelId = "text" | "email" | "form";
type Beat = "templates" | "add-objective" | "two-campaigns" | "override" | "open-channel";
type ScratchKind = "click" | "calendar" | "form";

type CampaignDraft = {
  id: string;
  name: string;
  configured: boolean;
  objectiveName: string;
  objectiveScratch: ScratchKind | null;
  sequencing: ChannelId[];
  overrideThis: boolean;
  openChannelId: ChannelId | null;
};

const CHANNEL_LABEL: Record<ChannelId, string> = {
  text: "Text",
  email: "Email",
  form: "Form",
};

const SCRATCH_LABEL: Record<ScratchKind, string> = {
  click: "Click this link",
  calendar: "Book a meeting in this calendar",
  form: "Submit / complete this form",
};

const BEATS: { id: Beat; title: string; why: string }[] = [
  {
    id: "templates",
    title: "1. Sequence templates",
    why: "Opt-in / re-engagement / reactivation are sequence templates — the full canvas. Empty world: none exist.",
  },
  {
    id: "add-objective",
    title: "2. Add objective",
    why: "First thing on a campaign. Hub analog: Add configuration on the trigger node. Modal on this canvas.",
  },
  {
    id: "two-campaigns",
    title: "3. Two campaigns",
    why: "Two objectives → two campaigns. Qualify edge. Launch day is opt-in day.",
  },
  {
    id: "override",
    title: "4. Override this",
    why: "First toggle on the campaign. Reveals channel nodes as wires. Campaign toggles stay.",
  },
  {
    id: "open-channel",
    title: "5. Open a channel",
    why: "Channel toggles live on the node. Open it → deeper nodes, still wired. Full graph.",
  },
];

const OBJECTIVE_TEMPLATES = [
  { id: "launch-window", name: "Launch window", hint: "Probably: click this link" },
  { id: "launch-day", name: "Launch day", hint: "They opt in" },
  { id: "additional", name: "Additional", hint: "Unnamed — there are a couple more", disabled: true },
];

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

function seedForBeat(beat: Beat): CampaignDraft[] {
  const base = (partial: Partial<CampaignDraft> & Pick<CampaignDraft, "id" | "name">): CampaignDraft => ({
    configured: true,
    objectiveName: "",
    objectiveScratch: null,
    sequencing: ["text", "email", "form"],
    overrideThis: false,
    openChannelId: null,
    ...partial,
  });
  if (beat === "add-objective") {
    return [base({ id: "c-new", name: "Untitled campaign", configured: false })];
  }
  const window = base({
    id: "c-window",
    name: "Launch window",
    objectiveName: "Click this link",
    objectiveScratch: "click",
    overrideThis: beat === "override" || beat === "open-channel",
    openChannelId: beat === "open-channel" ? "text" : null,
  });
  const day = base({
    id: "c-day",
    name: "Launch day",
    objectiveName: "They opt in",
  });
  if (beat === "two-campaigns" || beat === "override" || beat === "open-channel") {
    return [window, day];
  }
  return [];
}

function DeeperNodes({ open, color }: { open: boolean; color: string }) {
  if (!open) return null;
  const grains = [
    { id: "rules", title: "Channel rules", body: "Escalation on this node (if not opened, …)" },
    { id: "attempts", title: "Attempt rules", body: "Retries for this medium" },
    { id: "content", title: "Content override", body: "1:1 with this node. Campaign default until you write here." },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr",
        alignItems: "stretch",
        marginTop: 8,
      }}
    >
      <div style={{ gridColumn: 1, gridRow: `1 / span ${grains.length}`, minHeight: 120 }}>
        <ForkWires count={grains.length} color={color} />
      </div>
      {grains.map((grain, i) => (
        <Card key={grain.id} size="small" style={{ gridColumn: 2, gridRow: i + 1, margin: "4px 0" }}>
          <Typography.Text strong style={{ fontSize: 12 }}>
            {grain.title}
          </Typography.Text>
          <Typography.Paragraph type="secondary" style={{ margin: "2px 0 0", fontSize: 12 }}>
            {grain.body}
          </Typography.Paragraph>
        </Card>
      ))}
    </div>
  );
}

function ChannelNode({
  channel,
  open,
  onOpen,
}: {
  channel: ChannelId;
  open: boolean;
  onOpen: (next: boolean) => void;
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
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Toggles for this medium live here. Deeper grain hangs off this node.
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Open this node. Campaign toggles stay on the campaign.
        </Typography.Text>
      )}
      <DeeperNodes open={open} color={token.colorPrimary} />
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
        <Card size="small" style={{ height: "100%", borderColor: token.colorPrimaryBorder }} title={campaign.name}>
          {campaign.configured ? (
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  Objective (campaign)
                </Typography.Text>
                <Typography.Text>{campaign.objectiveName}</Typography.Text>
                {campaign.objectiveScratch ? (
                  <div>
                    <Tag style={{ marginTop: 4 }}>{SCRATCH_LABEL[campaign.objectiveScratch]}</Tag>
                  </div>
                ) : null}
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
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  Content defaults (campaign level)
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12 }}>Preset. Override on a channel node.</Typography.Text>
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
                  onOpen={(next) => onChange({ ...campaign, openChannelId: next ? ch : null })}
                />
              </div>
            )),
          ]
        : null}
    </div>
  );
}

function SequenceTemplatesBeat() {
  const { token } = theme.useToken();
  const [empty, setEmpty] = useState(false);
  return (
    <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Text strong>World has templates?</Typography.Text>
        <Switch checked={!empty} onChange={(on) => setEmpty(!on)} checkedChildren="Yes" unCheckedChildren="Empty" />
      </div>
      {empty ? (
        <Card>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            No templates. If no one has created any, there are none. Keep that in the open.
          </Typography.Paragraph>
        </Card>
      ) : (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {[
            { name: "Opt-in sequence", hint: "Full canvas. Not an objective." },
            { name: "Re-engagement sequence", hint: "Full canvas. Not an objective." },
            { name: "Reactivation sequence", hint: "Full canvas. Not an objective." },
          ].map((row) => (
            <Card key={row.name} size="small">
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <div>
                  <Typography.Text strong>{row.name}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {row.hint}
                    </Typography.Text>
                  </div>
                </div>
                <Tag>sequence template</Tag>
              </Space>
            </Card>
          ))}
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            You would not see these names in an objective picker. Objective templates are a single campaign: launch
            window, launch day, additional.
          </Typography.Paragraph>
        </Space>
      )}
      <div style={{ height: 1, background: token.colorSplit }} />
    </Space>
  );
}

function ObjectiveModal({
  open,
  onCancel,
  onApply,
}: {
  open: boolean;
  onCancel: () => void;
  onApply: (next: { name: string; scratch: ScratchKind | null; fromTemplate: string | null }) => void;
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
            name: picked?.name ?? "Launch window",
            scratch: templateId === "launch-window" ? "click" : templateId === "launch-day" ? null : "click",
            fromTemplate: templateId,
          });
        } else {
          onApply({ name: name.trim() || SCRATCH_LABEL[scratch], scratch, fromTemplate: null });
        }
      }}
    >
      <Typography.Paragraph type="secondary">
        Same seat as Hub Automations: the first thing on the node is configuration. Not Automations triggers on this
        canvas. Opt-in is not in this list — that is a sequence template.
      </Typography.Paragraph>
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
          <Typography.Text type="secondary">One thing. Yes or no. Then you name it.</Typography.Text>
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

export function AntAgentCanvas({ agent }: { agent: AgentDefinition }) {
  const { token } = theme.useToken();
  const [beat, setBeat] = useState<Beat>("templates");
  const [campaigns, setCampaigns] = useState<CampaignDraft[]>(() => seedForBeat("templates"));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCampaignId, setModalCampaignId] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(seedForBeat(beat));
    setModalOpen(beat === "add-objective");
    setModalCampaignId(beat === "add-objective" ? "c-new" : null);
  }, [beat, agent.id]);

  const patch = (id: string, next: CampaignDraft) => {
    setCampaigns((current) => current.map((row) => (row.id === id ? next : row)));
  };

  const openObjective = (id: string) => {
    setModalCampaignId(id);
    setModalOpen(true);
  };

  const applyObjective = (next: { name: string; scratch: ScratchKind | null; fromTemplate: string | null }) => {
    if (!modalCampaignId) return;
    const campaign = campaigns.find((row) => row.id === modalCampaignId);
    if (!campaign) return;
    patch(modalCampaignId, {
      ...campaign,
      configured: true,
      name: next.fromTemplate === "launch-day" ? "Launch day" : next.fromTemplate === "launch-window" ? "Launch window" : next.name,
      objectiveName: next.name,
      objectiveScratch: next.scratch,
    });
    setModalOpen(false);
  };

  const addCampaign = () => {
    const id = `c-new-${Date.now()}`;
    setCampaigns((current) => [
      ...current,
      {
        id,
        name: "Untitled campaign",
        configured: false,
        objectiveName: "",
        objectiveScratch: null,
        sequencing: ["text", "email", "form"],
        overrideThis: false,
        openChannelId: null,
      },
    ]);
    openObjective(id);
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <aside
        style={{
          width: 250,
          flexShrink: 0,
          borderRight: `1px solid ${token.colorSplit}`,
          padding: 12,
          background: token.colorBgLayout,
          overflow: "auto",
        }}
      >
        <Typography.Text strong>Mock beats</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
          Distinct things you said. Same mock; objective is a modal.
        </Typography.Paragraph>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          {BEATS.map((item) => (
            <Button
              key={item.id}
              block
              type={beat === item.id ? "primary" : "default"}
              onClick={() => setBeat(item.id)}
              style={{ height: "auto", whiteSpace: "normal", textAlign: "left", padding: "8px 10px" }}
            >
              {item.title}
            </Button>
          ))}
        </Space>
      </aside>
      <div
        data-register-surface="Agent / sequence mock"
        style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", padding: 18 }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 1100 }}>
          <Alert
            type="info"
            showIcon
            message="Mock — not the save path"
            description={BEATS.find((item) => item.id === beat)?.why}
          />
          {beat === "templates" ? (
            <SequenceTemplatesBeat />
          ) : (
            <>
              {beat !== "add-objective" ? (
                <Button icon={<PlusOutlined />} onClick={addCampaign}>
                  Add campaign
                </Button>
              ) : null}
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
            </>
          )}
        </Space>
      </div>
      <ObjectiveModal open={modalOpen} onCancel={() => setModalOpen(false)} onApply={applyObjective} />
    </div>
  );
}
