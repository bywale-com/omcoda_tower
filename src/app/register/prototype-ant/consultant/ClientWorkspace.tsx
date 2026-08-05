import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { getClientDetail, getClientMeta, getClientPhaseSnapshot } from "../../../data/clients";
import { Hint, Surface } from "../chrome";
import { MEETING_READY_CLIENT_IDS } from "./meetingsData";
import {
  PHASE_LABEL,
  phaseTagColor,
  resolveWorkspacePhase,
  silenceCauseLabel,
  type HaltRetention,
} from "./shared";

const { Text, Title } = Typography;

type ClientWorkspaceProps = {
  clientId: string;
  halt: HaltRetention | null;
  licenseeLabel: string;
  activityKick?: number;
  onHaltOutreach: () => void;
  onLiftHalt: () => void;
  onOpenAcceptedTerms?: () => void;
};

export function ClientWorkspace({
  clientId,
  halt,
  licenseeLabel,
  activityKick = 0,
  onHaltOutreach,
  onLiftHalt,
  onOpenAcceptedTerms,
}: ClientWorkspaceProps) {
  const [tab, setTab] = useState<"brief" | "engagement">("brief");
  const meta = getClientMeta(clientId);
  const detail = getClientDetail(clientId);
  const snapshot = getClientPhaseSnapshot(meta);
  const phase = resolveWorkspacePhase(clientId, Boolean(halt), MEETING_READY_CLIENT_IDS);
  const runtime =
    meta.reactivationPhase === "active"
      ? "Active"
      : meta.reactivationPhase === "armed"
        ? "Armed"
        : "Idle";
  const reachability =
    !meta.optedIn ? "Blocked" : meta.status === "grey" ? "Unknown" : "Reachable";
  const lastTouch = clientId === "sarah" ? "Yesterday · firm email" : "Mon · firm SMS";
  const lastReply = clientId === "sarah" ? "14 May · SMS" : "No reply yet";

  useEffect(() => {
    if (activityKick > 0) setTab("engagement");
  }, [activityKick]);

  const logColumns: ColumnsType<{ key: string; timestamp: string; status: string; outcome: string; actions: string }> = [
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp", width: 160 },
    { title: "Status", dataIndex: "status", key: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
    { title: "Outcome", dataIndex: "outcome", key: "outcome" },
    { title: "Actions", dataIndex: "actions", key: "actions" },
  ];

  const logRows = detail.activationLogs.map((log) => ({
    key: log.id,
    timestamp: log.timestamp,
    status: log.status,
    outcome: log.outcome,
    actions: log.actions.join(" · "),
  }));

  const nudgeRows = detail.nudges.map((nudge) => ({
    key: nudge.id,
    date: nudge.date,
    trigger: nudge.trigger,
    channel: nudge.channel.join(", "),
    nextStep: nudge.nextStep,
  }));

  const nudgeColumns: ColumnsType<{ key: string; date: string; trigger: string; channel: string; nextStep: string }> = [
    { title: "Date", dataIndex: "date", key: "date", width: 120 },
    { title: "Trigger", dataIndex: "trigger", key: "trigger" },
    { title: "Channel", dataIndex: "channel", key: "channel", width: 100 },
    { title: "Next step", dataIndex: "nextStep", key: "nextStep" },
  ];

  return (
    <Surface
      label="Client workspace"
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--ant-color-split)",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--ant-color-split)",
          background: "var(--ant-color-bg-container)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Surface label="Phase signal">
          <Tag color={phaseTagColor(phase)} title="Inhabit phase from bound packs — view only">
            Phase · {PHASE_LABEL[phase]}
          </Tag>
        </Surface>
        <Tag color={runtime === "Active" ? "processing" : "default"} title="Pack runtime inhabit">
          {runtime}
        </Tag>
        <Tag title="Bound pack (read-only)">Pack · Re-engagement · CEC refresh v3</Tag>
        <Tag
          color={silenceCauseLabel(clientId, halt) !== "—" ? "warning" : "default"}
          title="Why this client is silent"
        >
          Silence · {silenceCauseLabel(clientId, halt)}
        </Tag>
        <Tag color={reachability === "Reachable" ? "processing" : "warning"} title="Reachability posture">
          {reachability}
        </Tag>
        <Tag title="Last firm→client touch">Last touch · {lastTouch}</Tag>
        <Tag title="Last contact reply">Last reply · {lastReply}</Tag>
        <span style={{ flex: 1 }} />
        <Text type="secondary" style={{ fontSize: 11 }} title="Licensee identity">
          Under · {licenseeLabel}
        </Text>
        {onOpenAcceptedTerms ? (
          <Surface label="Accepted terms">
            <Button size="small" onClick={onOpenAcceptedTerms}>
              Accepted terms
            </Button>
          </Surface>
        ) : null}
        <Surface label="Halt outreach">
          {halt ? (
            <Surface label="Lift halt">
              <Button size="small" onClick={onLiftHalt}>
                Lift halt
              </Button>
            </Surface>
          ) : (
            <Button size="small" danger onClick={onHaltOutreach}>
              Halt outreach
            </Button>
          )}
        </Surface>
      </div>

      {halt ? (
        <Alert
          type="error"
          showIcon
          style={{ flexShrink: 0 }}
          message={`Halted · scope ${halt.scope === "book" ? "Firm book" : "This contact"} · ${halt.at}`}
          description={`Halt reason: ${halt.reason.trim() ? halt.reason : "— (none recorded)"}`}
        />
      ) : null}

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as "brief" | "engagement")}
        style={{ flexShrink: 0 }}
        items={[
          {
            key: "brief",
            label: <Surface label="Client Brief">Client Brief</Surface>,
            children: null,
          },
          {
            key: "engagement",
            label: <Surface label="Engagement record">Engagement record</Surface>,
            children: null,
          },
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
        {tab === "brief" ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={5} style={{ margin: 0 }}>
              {meta.name}
            </Title>
            <Hint>
              {snapshot.headline} — {snapshot.detail}
            </Hint>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Phase">{snapshot.phaseLabel}</Descriptions.Item>
              <Descriptions.Item label="Status">{snapshot.status}</Descriptions.Item>
              <Descriptions.Item label="Headline">{snapshot.headline}</Descriptions.Item>
              <Descriptions.Item label="Detail">{snapshot.detail}</Descriptions.Item>
              {meta.nudge.active ? (
                <Descriptions.Item label="Nudge">{meta.nudge.label}</Descriptions.Item>
              ) : null}
              {meta.badge ? (
                <Descriptions.Item label="Badge">{meta.badge.label}</Descriptions.Item>
              ) : null}
            </Descriptions>
            {meta.nudge.briefing ? (
              <div>
                <Text strong>Live nudge form</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{meta.nudge.briefing.liveForm.question}</Text>
                  <Tag style={{ marginLeft: 8 }}>{meta.nudge.briefing.liveForm.inputValue}</Tag>
                </div>
              </div>
            ) : null}
          </Space>
        ) : (
          <Surface label="Engagement record">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>Engagement record</Title>
                <Hint>Activity — hand-built engagement chart · chronology only, no authorship</Hint>
              </div>
              <Space>
                <Button type="primary" size="small" onClick={onHaltOutreach}>
                  Halt outreach
                </Button>
              </Space>
              <Text strong>Activation logs</Text>
              <Table
                size="small"
                columns={logColumns}
                dataSource={logRows}
                pagination={false}
                locale={{ emptyText: <Empty description="No activation logs" /> }}
              />
              <Text strong>Nudge chronology</Text>
              <Table
                size="small"
                columns={nudgeColumns}
                dataSource={nudgeRows}
                pagination={false}
                locale={{ emptyText: <Empty description="No nudge history" /> }}
              />
            </Space>
          </Surface>
        )}
      </div>
    </Surface>
  );
}
