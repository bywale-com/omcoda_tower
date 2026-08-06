import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  List,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
  theme,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MailOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  AGENT_EDITOR_TABS,
  AGENT_STEP_TYPES,
  agentStatusLabel,
  getLinkedAutomationSummaries,
  type AgentDefinition,
  type AgentEditorTab,
} from "../../../data/agentDefinitions";
import {
  agentStepRailSummary,
  agentStepTimingLabel,
  agentStepTitle,
  getInitialAgentSteps,
  insertAgentStep,
  type AgentStep,
} from "../../../data/agentSteps";

function statusColor(status: AgentDefinition["status"]) {
  if (status === "running") return "processing";
  if (status === "paused") return "warning";
  if (status === "draft") return "default";
  return "success";
}

const emptyCopy: Record<Exclude<AgentEditorTab, "editor">, string> = {
  contacts: "Contacts enrolled in or eligible for this agent — enrollment and suppression rules will live here.",
  activity: "Live runs, delivery events, and escalation outcomes for this agent.",
  report: "Reach, reply, and conversion reporting for this agent across channels.",
  settings: "Channel rulesets, attempt logic, global limits, and schedule windows for this agent.",
};

function reorderSteps(steps: AgentStep[], fromIndex: number, toIndex: number) {
  const next = [...steps];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return steps;
  next.splice(toIndex, 0, moved);
  return next.map((step, index) => ({ ...step, order: index }));
}

function StepCard({
  step,
  index,
  total,
  onMove,
  onUpdate,
}: {
  step: AgentStep;
  index: number;
  total: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onUpdate: (step: AgentStep) => void;
}) {
  const isEmail = step.kind === "email";
  return (
    <Card
      size="small"
      title={
        <Space>
          {isEmail ? <MailOutlined /> : <UserSwitchOutlined />}
          <span>{agentStepTitle(step, index)}</span>
        </Space>
      }
      extra={
        <Space size={4}>
          <Button
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            aria-label="Move step up"
          />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            aria-label="Move step down"
          />
        </Space>
      }
      style={{ width: "100%" }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Tag color={isEmail ? "blue" : "purple"} style={{ width: "fit-content" }}>
          {isEmail ? "Email" : "Consultant task"}
        </Tag>
        <Typography.Text type="secondary">{agentStepTimingLabel(step)}</Typography.Text>
        {isEmail ? (
          <Input
            value={step.email?.subject}
            placeholder="Email subject"
            onChange={(event) =>
              onUpdate({
                ...step,
                email: { subject: event.target.value, body: step.email?.body ?? "", threadType: step.email?.threadType ?? "new" },
              })
            }
          />
        ) : (
          <Input.TextArea
            value={step.task?.note}
            rows={2}
            placeholder="Task note"
            onChange={(event) =>
              onUpdate({
                ...step,
                task: {
                  priority: step.task?.priority ?? "medium",
                  note: event.target.value,
                  skipAfterDays: step.task?.skipAfterDays ?? 0,
                },
              })
            }
          />
        )}
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {agentStepRailSummary(step)}
        </Typography.Text>
      </Space>
    </Card>
  );
}

export function AntAgentWorkbench({
  agent,
}: {
  agent: AgentDefinition;
}) {
  const { token } = theme.useToken();
  const agentId = agent.id;
  const [activeTab, setActiveTab] = useState<AgentEditorTab>("editor");
  const [steps, setSteps] = useState<AgentStep[]>(() => getInitialAgentSteps(agentId));
  const linkedAutomations = useMemo(() => getLinkedAutomationSummaries(agent), [agent]);

  useEffect(() => {
    setSteps(getInitialAgentSteps(agentId));
    setActiveTab("editor");
  }, [agentId]);

  const addStep = (kind: "email" | "consultant_task") => {
    setSteps((current) => insertAgentStep(current, kind, current.length - 1));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
      <div
        style={{
          borderBottom: `1px solid ${token.colorSplit}`,
          padding: "10px 16px",
          background: token.colorBgContainer,
          flexShrink: 0,
        }}
      >
        <Space style={{ justifyContent: "space-between", width: "100%" }} align="center">
          <Space size={10} style={{ minWidth: 0 }}>
            <Typography.Title level={3} style={{ margin: 0, fontSize: 20 }}>
              {agent.name}
            </Typography.Title>
            <Tag color={statusColor(agent.status)}>{agentStatusLabel(agent.status)}</Tag>
            <Tag>{linkedAutomations.length} linked automation{linkedAutomations.length === 1 ? "" : "s"}</Tag>
          </Space>
          <Button type="primary" icon={<PlayCircleOutlined />}>
            Launch agent
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as AgentEditorTab)}
        items={AGENT_EDITOR_TABS.map((tab) => ({
          key: tab.id,
          label: tab.label,
          children:
            tab.id === "editor" ? (
              <div style={{ height: "100%", display: "flex", minHeight: 0 }}>
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
                  <Typography.Text strong>Step toolbar</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    Add outreach and consultant work to the sequence.
                  </Typography.Paragraph>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {AGENT_STEP_TYPES.map((stepType) => (
                      <Button
                        key={stepType.id}
                        block
                        icon={stepType.id === "email" ? <MailOutlined /> : <UserSwitchOutlined />}
                        onClick={() => addStep(stepType.id)}
                      >
                        {stepType.label}
                      </Button>
                    ))}
                  </Space>
                </aside>
                <div
                  data-register-surface="Agent / sequence editor"
                  style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", padding: 18 }}
                >
                  {steps.length === 0 ? (
                    <Empty
                      description="Start this agent by adding an email or consultant task."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Space>
                        <Button icon={<PlusOutlined />} onClick={() => addStep("email")}>
                          Add email
                        </Button>
                        <Button icon={<PlusOutlined />} onClick={() => addStep("consultant_task")}>
                          Add consultant task
                        </Button>
                      </Space>
                    </Empty>
                  ) : (
                    <Timeline
                      items={steps.map((step, index) => ({
                        color: step.kind === "email" ? "blue" : "purple",
                        children: (
                          <StepCard
                            step={step}
                            index={index}
                            total={steps.length}
                            onMove={(from, to) => setSteps((current) => reorderSteps(current, from, to))}
                            onUpdate={(updated) =>
                              setSteps((current) =>
                                current.map((item) => (item.id === updated.id ? updated : item)),
                              )
                            }
                          />
                        ),
                      }))}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Empty style={{ marginTop: 48 }} description={emptyCopy[tab.id]} />
            ),
        }))}
        style={{ flex: 1, minHeight: 0 }}
        tabBarStyle={{ margin: 0, paddingInline: 16, flexShrink: 0 }}
      />
    </div>
  );
}
