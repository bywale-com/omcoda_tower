/**
 * Agents sequence canvas — Override this reveals wired channel nodes.
 * Visual prototype of the 2026-08-15 face (AGENTS-FACE.md). Local state only;
 * Timeline save path is unchanged.
 */
import { useEffect, useState } from "react";
import { Button, Card, Input, Space, Switch, Tag, Typography, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { AgentDefinition } from "../../../data/agentDefinitions";

type ChannelId = "text" | "email" | "form";
type ObjectiveType = "opt-in" | "re-engagement" | "reactivation";

type CampaignDraft = {
  id: string;
  name: string;
  objectiveType: ObjectiveType;
  objective: string;
  sequencing: ChannelId[];
  overrideThis: boolean;
  openChannelId: ChannelId | null;
};

const CHANNEL_LABEL: Record<ChannelId, string> = {
  text: "Text",
  email: "Email",
  form: "Form",
};

const OBJECTIVE_COLOR: Record<ObjectiveType, string> = {
  "opt-in": "blue",
  "re-engagement": "purple",
  reactivation: "gold",
};

function seedCampaigns(agentId: string): CampaignDraft[] {
  if (agentId === "agent-intake") {
    return [
      {
        id: "c-window",
        name: "Launch window",
        objectiveType: "opt-in",
        objective: "One thing that raises the chance of opt-in — build desire",
        sequencing: ["text", "email", "form"],
        overrideThis: true,
        openChannelId: "text",
      },
      {
        id: "c-day",
        name: "Launch day",
        objectiveType: "opt-in",
        objective: "They opt in",
        sequencing: ["text", "email", "form"],
        overrideThis: false,
        openChannelId: null,
      },
    ];
  }
  if (agentId === "agent-reactivation") {
    return [
      {
        id: "c-reactivation",
        name: "Reactivation",
        objectiveType: "reactivation",
        objective: "Meeting booked",
        sequencing: ["text", "email", "form"],
        overrideThis: false,
        openChannelId: null,
      },
    ];
  }
  return [
    {
      id: "c-nudge",
      name: "Re-engagement",
      objectiveType: "re-engagement",
      objective: "Data request",
      sequencing: ["text", "email", "form"],
      overrideThis: false,
      openChannelId: null,
    },
  ];
}

function ForkWires({ count, color }: { count: number; color: string }) {
  const paths = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * 100;
    return `M 0 50 C 28 50 28 ${y} 56 ${y}`;
  });
  return (
    <svg
      viewBox="0 0 56 100"
      preserveAspectRatio="none"
      aria-hidden
      style={{ width: 56, height: "100%", display: "block" }}
    >
      {paths.map((d) => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth="1.75" vectorEffect="nonScalingStroke" />
      ))}
    </svg>
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
      style={{
        width: "100%",
        maxWidth: 320,
        borderColor: open ? token.colorPrimary : token.colorBorder,
      }}
      title={
        <Space>
          <span>{CHANNEL_LABEL[channel]}</span>
          <Tag>medium</Tag>
        </Space>
      }
      extra={
        <Switch
          size="small"
          checked={open}
          onChange={onOpen}
          checkedChildren="Open"
          unCheckedChildren="Closed"
        />
      }
    >
      {open ? (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <div>
            <Typography.Text strong style={{ fontSize: 12 }}>
              Channel rules
            </Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: "2px 0 0", fontSize: 12 }}>
              Escalation on this node (if not opened, …). Lives here — never moves to the campaign.
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text strong style={{ fontSize: 12 }}>
              Attempt rules
            </Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: "2px 0 0", fontSize: 12 }}>
              Retries for this medium.
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text strong style={{ fontSize: 12 }}>
              Content override
            </Typography.Text>
            <Input.TextArea
              rows={2}
              placeholder="Campaign default until you write here"
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      ) : (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Open this node to author its rules. Campaign toggles stay on the campaign.
        </Typography.Text>
      )}
    </Card>
  );
}

function CampaignNode({
  campaign,
  onChange,
}: {
  campaign: CampaignDraft;
  onChange: (next: CampaignDraft) => void;
}) {
  const { token } = theme.useToken();
  const n = campaign.sequencing.length;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: campaign.overrideThis ? "minmax(280px, 340px) 56px minmax(220px, 1fr)" : "minmax(280px, 340px)",
        alignItems: "stretch",
        columnGap: 0,
      }}
    >
      <div style={{ gridColumn: 1, gridRow: `1 / span ${campaign.overrideThis ? n : 1}` }}>
        <Card
          size="small"
          style={{ height: "100%", borderColor: token.colorPrimaryBorder }}
          title={
            <Space wrap>
              <span>{campaign.name}</span>
              <Tag color={OBJECTIVE_COLOR[campaign.objectiveType]}>{campaign.objectiveType}</Tag>
            </Space>
          }
        >
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                Campaign objective
              </Typography.Text>
              <Typography.Text>{campaign.objective}</Typography.Text>
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
              <Typography.Text style={{ fontSize: 12 }}>Preset for this campaign. Override on a channel node.</Typography.Text>
            </div>
            <div
              style={{
                borderTop: `1px solid ${token.colorSplit}`,
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
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

export function AntAgentCanvas({ agent }: { agent: AgentDefinition }) {
  const { token } = theme.useToken();
  const agentId = agent.id;
  const [campaigns, setCampaigns] = useState<CampaignDraft[]>(() => seedCampaigns(agentId));

  useEffect(() => {
    setCampaigns(seedCampaigns(agentId));
  }, [agentId]);

  const patch = (id: string, next: CampaignDraft) => {
    setCampaigns((current) => current.map((row) => (row.id === id ? next : row)));
  };

  const addCampaign = () => {
    setCampaigns((current) => [
      ...current,
      {
        id: `c-new-${Date.now()}`,
        name: "Untitled campaign",
        objectiveType: current[0]?.objectiveType ?? "opt-in",
        objective: "Name the objective — one goal per campaign",
        sequencing: ["text", "email", "form"],
        overrideThis: false,
        openChannelId: null,
      },
    ]);
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          borderRight: `1px solid ${token.colorSplit}`,
          padding: 12,
          background: token.colorBgLayout,
          overflow: "auto",
        }}
      >
        <Typography.Text strong>Sequence</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
          Blank container. Each campaign is one objective. Two objectives → two campaigns.
        </Typography.Paragraph>
        <Button block icon={<PlusOutlined />} onClick={addCampaign}>
          Add campaign
        </Button>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
          Channels are the medium. They appear when you Override this — wired to that campaign.
        </Typography.Paragraph>
      </aside>
      <div
        data-register-surface="Agent / sequence canvas"
        style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", padding: 18 }}
      >
        <Space direction="vertical" size={0} style={{ width: "100%", maxWidth: 980 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Sequence · {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </Typography.Text>
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
              ) : (
                <div style={{ height: 8 }} />
              )}
              <CampaignNode campaign={campaign} onChange={(next) => patch(campaign.id, next)} />
            </div>
          ))}
        </Space>
      </div>
    </div>
  );
}
