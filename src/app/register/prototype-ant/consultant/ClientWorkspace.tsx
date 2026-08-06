import { useEffect, useMemo, useState, type Key, type ReactNode } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Space,
  Splitter,
  Tabs,
  Tag,
  Tree,
  Typography,
} from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { getClientMeta, getClientPhaseSnapshot } from "../../../data/clients";
import { getClientJourney } from "../../../data/journeyByClient";
import type {
  JourneyChannel,
  JourneyGanttData,
  JourneyGroup,
  JourneyMarker,
  JourneyTreeNode,
} from "../../../data/journeyTree";
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

const ACTIVITY_ROW_HEIGHT = 96;
const ACTIVITY_AXIS_HEIGHT = 34;
const DEFAULT_DAY_WIDTH = 30;
const MIN_DAY_WIDTH = 18;
const MAX_DAY_WIDTH = 58;

const CHANNEL_LABEL: Record<JourneyChannel, string> = {
  email: "Email",
  sms: "SMS",
  call: "Call",
  visit: "Visit",
  meeting: "Meeting",
  task: "Task",
  system: "System",
  form: "Form",
};

const CHANNEL_COLOR: Record<string, string> = {
  text: "#2563eb",
  email: "#0d9488",
  form: "#7c3aed",
  sms: "#2563eb",
  call: "#f59e0b",
  visit: "#0891b2",
  meeting: "#16a34a",
  task: "#64748b",
  system: "#64748b",
};

const ATTEMPT_COLORS = ["#0d9488", "#d97706", "#ea580c"];

function statusColor(status?: JourneyGroup["status"]) {
  if (status === "active") return "processing";
  if (status === "complete") return "success";
  if (status === "armed") return "warning";
  return "default";
}

function treeTitle(label: string, meta: ReactNode) {
  return (
    <Space size={6} wrap>
      <Typography.Text>{label}</Typography.Text>
      {meta}
    </Space>
  );
}

function collectDefaultExpanded(nodes: JourneyTreeNode[], keys: Key[]) {
  for (const node of nodes) {
    if (node.kind === "channel" || node.kind === "standalone") {
      if (node.touchpoint.defaultOpen) keys.push(node.touchpoint.id);
      collectDefaultExpanded(node.nested, keys);
    } else if (node.kind === "attempt") {
      if (node.attempt.defaultOpen) keys.push(node.attempt.id);
      collectDefaultExpanded(node.nested, keys);
    } else if (node.kind === "formVisit") {
      if (node.visit.defaultOpen) keys.push(node.visit.id);
      collectDefaultExpanded(node.nested, keys);
    }
  }
}

function defaultExpandedKeys(sequences: JourneyGroup[]): Key[] {
  const keys: Key[] = [];
  for (const sequence of sequences) {
    if (sequence.defaultOpen) keys.push(sequence.id);
    if (sequence.tree?.length) collectDefaultExpanded(sequence.tree, keys);
  }
  return keys;
}

function treeDataFromNodes(nodes: JourneyTreeNode[]): DataNode[] {
  return nodes.map((node) => {
    if (node.kind === "attempt") {
      return {
        key: node.attempt.id,
        title: treeTitle(node.attempt.label, <Tag color="processing">attempt {node.attempt.attemptNum}</Tag>),
        children: treeDataFromNodes(node.nested),
      };
    }

    if (node.kind === "formVisit") {
      return {
        key: node.visit.id,
        title: treeTitle(node.visit.label, <Tag color="purple">form visit {node.visit.visitNum}</Tag>),
        children: treeDataFromNodes(node.nested),
      };
    }

    if (node.kind === "escalation") {
      return {
        key: node.id,
        title: treeTitle("Escalation wait", <Tag color="warning">{node.escalation.scheduledLabel}</Tag>),
      };
    }

    if (node.kind === "taskEscalation") {
      return {
        key: node.id,
        title: treeTitle(node.touchpoint.label, <Tag>{CHANNEL_LABEL[node.touchpoint.channel]}</Tag>),
      };
    }

    if (node.kind === "event") {
      return {
        key: node.touchpoint.id,
        title: treeTitle(node.touchpoint.label, <Tag>{node.touchpoint.dateLabel ?? "event"}</Tag>),
      };
    }

    const touchpoint = node.touchpoint;
    return {
      key: touchpoint.id,
      title: treeTitle(
        touchpoint.label,
        <Space size={4}>
          <Tag color={CHANNEL_COLOR[touchpoint.channel]}>{CHANNEL_LABEL[touchpoint.channel]}</Tag>
          <Tag>{touchpoint.status}</Tag>
        </Space>,
      ),
      children: [
        ...node.events.map((event) => ({
          key: event.id,
          title: treeTitle(event.label, <Tag>{event.dateLabel ?? "event"}</Tag>),
        })),
        ...treeDataFromNodes(node.nested),
      ],
    };
  });
}

function engagementTreeData(sequences: JourneyGroup[]): DataNode[] {
  return sequences.map((sequence) => ({
    key: sequence.id,
    title: treeTitle(
      sequence.label,
      <Space size={4}>
        {sequence.badgeLetter ? <Tag>{sequence.badgeLetter}</Tag> : null}
        <Tag color={statusColor(sequence.status)}>{sequence.status ?? "sequence"}</Tag>
      </Space>,
    ),
    children: sequence.tree?.length
      ? treeDataFromNodes(sequence.tree)
      : sequence.touchpoints.map((touchpoint) => ({
          key: touchpoint.id,
          title: treeTitle(touchpoint.label, <Tag>{CHANNEL_LABEL[touchpoint.channel]}</Tag>),
        })),
  }));
}

type TimelineRow = {
  id: string;
  label: string;
  status?: JourneyGroup["status"];
  gantt: JourneyGanttData | null;
  startDay: number;
  endDay: number;
};

function timelineRows(sequences: JourneyGroup[], ganttByGroup: Record<string, JourneyGanttData>): TimelineRow[] {
  return sequences.map((sequence) => {
    const gantt = ganttByGroup[sequence.id] ?? null;
    const touchEnd = sequence.touchpoints.reduce(
      (max, touchpoint) => Math.max(max, touchpoint.startDay + touchpoint.spanDays),
      1,
    );
    return {
      id: sequence.id,
      label: sequence.label,
      status: sequence.status,
      gantt,
      startDay: gantt?.startDay ?? 0,
      endDay: gantt?.endDay ?? touchEnd,
    };
  });
}

function markerColor(marker: JourneyMarker) {
  if (marker.kind.includes("email")) return CHANNEL_COLOR.email;
  if (marker.kind.includes("text")) return CHANNEL_COLOR.text;
  if (marker.kind.includes("form")) return CHANNEL_COLOR.form;
  return "#f59e0b";
}

function dayLabel(day: number) {
  return day === 0 ? "Day 0" : `+${day}d`;
}

function ActivityTimeline({
  sequences,
  ganttByGroup,
}: {
  sequences: JourneyGroup[];
  ganttByGroup: Record<string, JourneyGanttData>;
}) {
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const rows = useMemo(() => timelineRows(sequences, ganttByGroup), [sequences, ganttByGroup]);
  const maxDay = Math.max(
    8,
    ...rows.map((row) => row.endDay),
    ...rows.flatMap((row) => row.gantt?.markers.map((marker) => marker.atDay) ?? []),
  ) + 2;
  const timelineWidth = maxDay * dayWidth;
  const timelineHeight = ACTIVITY_AXIS_HEIGHT + rows.length * ACTIVITY_ROW_HEIGHT;
  const zoom = (factor: number) =>
    setDayWidth((value) => Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, Math.round(value * factor))));

  return (
    <Surface label="Activity timeline" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--ant-color-split)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Typography.Text strong>Timeline</Typography.Text>
        <Tag>day axis</Tag>
        <Tag color="processing">sequence bars</Tag>
        <Tag color="warning">attempt bands</Tag>
        <Tag color="purple">channel markers</Tag>
        <span style={{ flex: 1 }} />
        <Button size="small" icon={<ZoomOutOutlined />} onClick={() => zoom(0.85)} />
        <Button size="small" icon={<ZoomInOutlined />} onClick={() => zoom(1.15)} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--ant-color-bg-layout)" }}>
        <div style={{ position: "relative", width: timelineWidth, height: timelineHeight }}>
          {Array.from({ length: maxDay + 1 }).map((_, day) => (
            <div
              key={`day-${day}`}
              style={{
                position: "absolute",
                left: day * dayWidth,
                top: 0,
                bottom: 0,
                borderLeft: "1px solid var(--ant-color-split)",
              }}
            >
              {day % (dayWidth < 26 ? 2 : 1) === 0 ? (
                <span style={{ fontSize: 11, color: "var(--ant-color-text-tertiary)", marginLeft: 4 }}>
                  {dayLabel(day)}
                </span>
              ) : null}
            </div>
          ))}

          {rows.map((row, index) => {
            const top = ACTIVITY_AXIS_HEIGHT + index * ACTIVITY_ROW_HEIGHT;
            const barLeft = row.startDay * dayWidth;
            const barWidth = Math.max(14, (row.endDay - row.startDay) * dayWidth);
            return (
              <div key={row.id}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top,
                    height: 1,
                    background: "var(--ant-color-split)",
                  }}
                />
                <Typography.Text
                  type="secondary"
                  style={{ position: "absolute", left: 8, top: top + 8, fontSize: 11 }}
                >
                  {row.label}
                </Typography.Text>
                <div
                  title={`${row.label} · ${row.status ?? "sequence"}`}
                  style={{
                    position: "absolute",
                    left: barLeft,
                    top: top + 28,
                    width: barWidth,
                    height: 16,
                    borderRadius: 999,
                    background: row.status === "armed" ? "#f59e0b" : "#0d9488",
                    opacity: row.status === "complete" ? 0.62 : 0.9,
                  }}
                />

                {row.gantt?.attemptBands.map((attempt, attemptIndex) => (
                  <div
                    key={attempt.id}
                    title={attempt.id}
                    style={{
                      position: "absolute",
                      left: attempt.startDay * dayWidth,
                      top: top + 50 + attemptIndex * 9,
                      width: Math.max(10, (attempt.endDay - attempt.startDay) * dayWidth),
                      height: 6,
                      borderRadius: 999,
                      background: ATTEMPT_COLORS[attempt.colorIndex % ATTEMPT_COLORS.length],
                    }}
                  />
                ))}

                {row.gantt
                  ? Object.entries(row.gantt.channelBars).flatMap(([channel, bars], channelIndex) =>
                      bars.map((bar, barIndex) => (
                        <div
                          key={`${channel}-${barIndex}`}
                          title={`${channel} · ${dayLabel(bar.startDay)} to ${dayLabel(bar.endDay)}`}
                          style={{
                            position: "absolute",
                            left: bar.startDay * dayWidth,
                            top: top + 70 + channelIndex * 6,
                            width: Math.max(8, (bar.endDay - bar.startDay) * dayWidth),
                            height: 4,
                            borderRadius: 999,
                            background: CHANNEL_COLOR[channel] ?? "#64748b",
                          }}
                        />
                      )),
                    )
                  : null}

                {row.gantt?.markers.map((marker) => (
                  <div
                    key={marker.id}
                    title={marker.label}
                    style={{
                      position: "absolute",
                      left: marker.atDay * dayWidth - 4,
                      top: top + 64,
                      width: 8,
                      height: 22,
                      borderRadius: 999,
                      background: markerColor(marker),
                      boxShadow: "0 0 0 2px var(--ant-color-bg-container)",
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Surface>
  );
}

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
  const snapshot = getClientPhaseSnapshot(meta);
  const journey = useMemo(() => getClientJourney(clientId), [clientId]);
  const treeData = useMemo(() => engagementTreeData(journey.sequences), [journey.sequences]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => defaultExpandedKeys(journey.sequences));
  const [selectedJourneyKey, setSelectedJourneyKey] = useState<Key[]>([journey.reactivationSequenceId]);
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

  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys(journey.sequences));
    setSelectedJourneyKey([journey.reactivationSequenceId]);
  }, [journey]);

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
          padding: "10px 16px",
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
        tabBarStyle={{ paddingInline: 16, marginBottom: 0 }}
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

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
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
          <Surface label="Engagement record" style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%", flexShrink: 0 }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>Engagement record</Title>
                <Hint>Ant-translated Activity — dual-pane chronology only, no authorship.</Hint>
              </div>
              <Space wrap>
                <Button type="primary" size="small" onClick={onHaltOutreach}>
                  Halt outreach
                </Button>
                <Surface label="Export chronology">
                  <Button size="small">Export chronology</Button>
                </Surface>
              </Space>
            </Space>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                border: "1px solid var(--ant-color-split)",
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--ant-color-bg-container)",
              }}
            >
              <Splitter style={{ height: "100%", width: "100%" }}>
                <Splitter.Panel defaultSize={320} min={240} max="50%">
                  <div style={{ height: "100%", overflow: "auto" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--ant-color-split)" }}>
                      <Text strong>Engagement tree</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Sequences, attempts, channels
                        </Text>
                      </div>
                    </div>
                    <Tree
                      blockNode
                      treeData={treeData}
                      expandedKeys={expandedKeys}
                      selectedKeys={selectedJourneyKey}
                      onExpand={(keys) => setExpandedKeys([...keys])}
                      onSelect={(keys) => setSelectedJourneyKey([...keys])}
                      style={{ padding: 12 }}
                    />
                  </div>
                </Splitter.Panel>
                <Splitter.Panel min={280}>
                  <ActivityTimeline sequences={journey.sequences} ganttByGroup={journey.ganttByGroup} />
                </Splitter.Panel>
              </Splitter>
            </div>
          </Surface>
        )}
      </div>
    </Surface>
  );
}
