import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  List,
  Space,
  Switch,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
  theme,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MailOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  AGENT_EDITOR_TABS,
  AGENT_STEP_TYPES,
  AGENT_TEMPLATE_BINDING,
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
import type {
  AttemptCriteriaRow,
  ChannelOwnershipOrderRow,
  CohortScoringRow,
  MetricsThresholdRow,
  PhaseOrderRow,
} from "../../../wire/machineTypes";
import { wirePorts } from "../../../wire/registry";

function statusColor(status: AgentDefinition["status"]) {
  if (status === "running") return "processing";
  if (status === "paused") return "warning";
  if (status === "draft") return "default";
  return "success";
}

const emptyCopy: Record<Exclude<AgentEditorTab, "editor" | "settings">, string> = {
  contacts: "Contacts enrolled in or eligible for this agent — enrollment and suppression rules will live here.",
  activity: "Live runs, delivery events, and escalation outcomes for this agent.",
  report: "Reach, reply, and conversion reporting for this agent across channels.",
};

function stepsToTemplateCells(steps: AgentStep[]): unknown[] {
  // Runtime (templateWalk) reads channel + day/offsetMinutes + subject/bodyText.
  // Keep authoring fields honest — no email/task-only collapse that the machine ignores.
  return steps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((step, index) => {
      const isEmail = step.kind === "email";
      const waitMinutes = isEmail
        ? Math.max(0, step.timing.delayMinutes ?? 0)
        : Math.max(0, (step.timing.dueDays ?? 0) * 24 * 60);
      const day = isEmail
        ? Math.max(0, Math.round(waitMinutes / (60 * 24)))
        : Math.max(0, step.timing.dueDays ?? 0);
      const subject = step.email?.subject ?? "";
      const bodyText = isEmail ? (step.email?.body ?? "") : (step.task?.note ?? "");
      return {
        id: step.id,
        token: step.id,
        label: subject || step.task?.note || step.id,
        ord: index,
        kind: step.kind,
        channel: isEmail ? "email" : "form",
        day,
        offsetMinutes: waitMinutes,
        waitMinutes,
        subject,
        body: bodyText,
        bodyText,
        taskNote: step.task?.note ?? "",
        mode: "authored",
      };
    });
}

function cellsToSteps(cells: unknown[]): AgentStep[] {
  return cells.map((cell, index) => {
    const row = cell as Record<string, unknown>;
    const kind =
      row.kind === "consultant_task" || row.channel === "task"
        ? ("consultant_task" as const)
        : ("email" as const);
    if (kind === "email") {
      return {
        id: String(row.id ?? `agent-step-email-${index}`),
        kind,
        order: typeof row.ord === "number" ? row.ord : index,
        timing: { delayMinutes: Number(row.waitMinutes ?? 0) || 0 },
        email: {
          subject: String(row.subject ?? row.label ?? ""),
          body: String(row.body ?? ""),
          threadType: "new" as const,
        },
      };
    }
    return {
      id: String(row.id ?? `agent-step-task-${index}`),
      kind,
      order: typeof row.ord === "number" ? row.ord : index,
      timing: { dueDays: Number(row.day ?? 0) || 0 },
      task: {
        priority: "medium" as const,
        note: String(row.taskNote ?? row.label ?? ""),
        skipAfterDays: 0,
      },
    };
  });
}

function reorderSteps(steps: AgentStep[], fromIndex: number, toIndex: number) {
  const next = [...steps];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return steps;
  next.splice(toIndex, 0, moved);
  return next.map((step, index) => ({ ...step, order: index }));
}

function reorderOrdRows<T extends { ord: number }>(
  rows: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return rows;
  next.splice(toIndex, 0, moved);
  return next.map((row, index) => ({ ...row, ord: index }));
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
          <>
            <Input
              value={step.email?.subject}
              placeholder="Email subject (authored → runtime)"
              onChange={(event) =>
                onUpdate({
                  ...step,
                  email: {
                    subject: event.target.value,
                    body: step.email?.body ?? "",
                    threadType: step.email?.threadType ?? "new",
                  },
                })
              }
            />
            <Input.TextArea
              value={step.email?.body}
              rows={3}
              placeholder="Email body (authored → runtime)"
              onChange={(event) =>
                onUpdate({
                  ...step,
                  email: {
                    subject: step.email?.subject ?? "",
                    body: event.target.value,
                    threadType: step.email?.threadType ?? "new",
                  },
                })
              }
            />
          </>
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

function AgentSettingsPanel() {
  const { token } = theme.useToken();
  const [criteria, setCriteria] = useState<AttemptCriteriaRow[]>([]);
  const [channelRows, setChannelRows] = useState<ChannelOwnershipOrderRow[]>([]);
  const [cohortRows, setCohortRows] = useState<CohortScoringRow[]>([]);
  const [metricsRows, setMetricsRows] = useState<MetricsThresholdRow[]>([]);
  const [phaseRows, setPhaseRows] = useState<PhaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acr, order, cohort, metrics, phases] = await Promise.all([
        wirePorts.machineApi.listAttemptCriteria(),
        wirePorts.machineApi.listChannelOrder(),
        wirePorts.machineApi.listCohortScoring(),
        wirePorts.machineApi.listMetricsThresholds(),
        wirePorts.machineApi.listPhaseOrder(),
      ]);
      setCriteria(acr);
      setChannelRows(order);
      setCohortRows(cohort);
      setMetricsRows(metrics);
      setPhaseRows(phases);
    } catch (err) {
      message.error(`Settings load failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchCriteria = async (
    id: string,
    patch: {
      enabled?: boolean;
      threshold?: number | null;
      thresholdUnit?: string | null;
      label?: string;
    },
  ) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertAttemptCriteria(id, patch);
      setCriteria((current) => current.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Criteria save failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const patchCohort = async (
    id: string,
    patch: { enabled?: boolean; setValue?: string | null },
  ) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertCohortScoring(id, patch);
      setCohortRows((current) => current.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Cohort scoring save failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const patchMetrics = async (
    id: string,
    patch: { enabled?: boolean; threshold?: number | null },
  ) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertMetricsThreshold(id, patch);
      setMetricsRows((current) => current.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Metrics threshold save failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const moveChannel = async (fromIndex: number, toIndex: number) => {
    const next = reorderOrdRows(channelRows, fromIndex, toIndex);
    setChannelRows(next);
    try {
      const saved = await wirePorts.machineApi.upsertChannelOrder(
        next.map((row) => ({ id: row.id, token: row.token, label: row.label, ord: row.ord })),
      );
      setChannelRows(saved);
    } catch (err) {
      message.error(`Channel order save failed: ${String(err)}`);
      void load();
    }
  };

  const movePhase = async (fromIndex: number, toIndex: number) => {
    const next = reorderOrdRows(phaseRows, fromIndex, toIndex);
    setPhaseRows(next);
    try {
      const saved = await wirePorts.machineApi.upsertPhaseOrder(
        next.map((row) => ({ id: row.id, token: row.token, label: row.label, ord: row.ord })),
      );
      setPhaseRows(saved);
    } catch (err) {
      message.error(`Phase order save failed: ${String(err)}`);
      void load();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Typography.Text type="secondary">Loading modular settings…</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 18, overflow: "auto", height: "100%" }}>
      <Space direction="vertical" size={20} style={{ width: "100%", maxWidth: 720 }}>
        <div>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Attempt criteria
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Edits write to <code>rule_attempt_criteria</code> — thresholds the tick worker already reads.
          </Typography.Paragraph>
          <List
            dataSource={criteria}
            locale={{ emptyText: "No attempt criteria rows." }}
            renderItem={(row) => (
              <List.Item
                key={row.id}
                style={{
                  border: `1px solid ${token.colorSplit}`,
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 12,
                  background: token.colorBgContainer,
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
                    <Typography.Text strong>{row.label}</Typography.Text>
                    <Switch
                      checked={row.enabled}
                      loading={savingId === row.id}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                      onChange={(enabled) => void patchCriteria(row.id, { enabled })}
                    />
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {row.when_clause ?? "—"} · {row.condition_clause ?? "—"} → {row.set_value ?? "—"}
                  </Typography.Text>
                  <Space wrap>
                    <InputNumber
                      size="small"
                      value={row.threshold ?? undefined}
                      placeholder="Threshold"
                      disabled={savingId === row.id}
                      onChange={(value) => {
                        const threshold = typeof value === "number" ? value : null;
                        setCriteria((current) =>
                          current.map((item) => (item.id === row.id ? { ...item, threshold } : item)),
                        );
                      }}
                      onBlur={() => {
                        const current = criteria.find((item) => item.id === row.id);
                        void patchCriteria(row.id, {
                          threshold: current?.threshold ?? null,
                          thresholdUnit: current?.threshold_unit ?? null,
                        });
                      }}
                    />
                    <Input
                      size="small"
                      style={{ width: 120 }}
                      value={row.threshold_unit ?? ""}
                      placeholder="unit"
                      disabled={savingId === row.id}
                      onChange={(event) => {
                        const threshold_unit = event.target.value || null;
                        setCriteria((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, threshold_unit } : item,
                          ),
                        );
                      }}
                      onBlur={() => {
                        const current = criteria.find((item) => item.id === row.id);
                        void patchCriteria(row.id, {
                          threshold: current?.threshold ?? null,
                          thresholdUnit: current?.threshold_unit ?? null,
                        });
                      }}
                    />
                    <Tag>{row.id}</Tag>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Typography.Title level={5}>Channel ownership order</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Forward-only ladder in <code>seq_channel_ownership_order</code>.
          </Typography.Paragraph>
          <List
            dataSource={channelRows}
            locale={{ emptyText: "No channel order rows." }}
            renderItem={(row, index) => (
              <List.Item
                key={row.id}
                actions={[
                  <Button
                    key="up"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => void moveChannel(index, index - 1)}
                    aria-label="Move channel up"
                  />,
                  <Button
                    key="down"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === channelRows.length - 1}
                    onClick={() => void moveChannel(index, index + 1)}
                    aria-label="Move channel down"
                  />,
                ]}
              >
                <Space>
                  <Tag>{index + 1}</Tag>
                  <Typography.Text strong>{row.label}</Typography.Text>
                  <Typography.Text type="secondary">{row.token}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Typography.Title level={5}>Cohort scoring</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Tier signals in <code>rule_cohort_scoring</code> — enable rows and edit set_value.
          </Typography.Paragraph>
          <List
            dataSource={cohortRows}
            locale={{ emptyText: "No cohort scoring rows." }}
            renderItem={(row) => (
              <List.Item
                key={row.id}
                style={{
                  border: `1px solid ${token.colorSplit}`,
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 12,
                  background: token.colorBgContainer,
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
                    <Typography.Text strong>{row.label}</Typography.Text>
                    <Switch
                      checked={row.enabled}
                      loading={savingId === row.id}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                      onChange={(enabled) => void patchCohort(row.id, { enabled })}
                    />
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {row.when_clause ?? "—"} · {row.condition_clause ?? "—"}
                  </Typography.Text>
                  <Space wrap>
                    <Input
                      size="small"
                      style={{ width: 240 }}
                      value={row.set_value ?? ""}
                      placeholder="set_value"
                      disabled={savingId === row.id}
                      onChange={(event) => {
                        const set_value = event.target.value || null;
                        setCohortRows((current) =>
                          current.map((item) => (item.id === row.id ? { ...item, set_value } : item)),
                        );
                      }}
                      onBlur={() => {
                        const current = cohortRows.find((item) => item.id === row.id);
                        void patchCohort(row.id, { setValue: current?.set_value ?? null });
                      }}
                    />
                    <Tag>{row.id}</Tag>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Typography.Title level={5}>Metrics thresholds</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Firm-health flags in <code>rule_metrics_threshold</code> — enable rows and set threshold %.
          </Typography.Paragraph>
          <List
            dataSource={metricsRows}
            locale={{ emptyText: "No metrics threshold rows." }}
            renderItem={(row) => (
              <List.Item
                key={row.id}
                style={{
                  border: `1px solid ${token.colorSplit}`,
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 12,
                  background: token.colorBgContainer,
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
                    <Typography.Text strong>{row.label}</Typography.Text>
                    <Switch
                      checked={row.enabled}
                      loading={savingId === row.id}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                      onChange={(enabled) => void patchMetrics(row.id, { enabled })}
                    />
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    → {row.set_value ?? "—"}
                  </Typography.Text>
                  <Space wrap>
                    <InputNumber
                      size="small"
                      value={row.threshold ?? undefined}
                      placeholder="Threshold %"
                      disabled={savingId === row.id}
                      onChange={(value) => {
                        const threshold = typeof value === "number" ? value : null;
                        setMetricsRows((current) =>
                          current.map((item) => (item.id === row.id ? { ...item, threshold } : item)),
                        );
                      }}
                      onBlur={() => {
                        const current = metricsRows.find((item) => item.id === row.id);
                        void patchMetrics(row.id, { threshold: current?.threshold ?? null });
                      }}
                    />
                    <Tag>{row.id}</Tag>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Typography.Title level={5}>Phase order</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Sequence phases in <code>seq_phase_order</code> — opt-in → nudge → reactivation.
          </Typography.Paragraph>
          <List
            dataSource={phaseRows}
            locale={{ emptyText: "No phase order rows." }}
            renderItem={(row, index) => (
              <List.Item
                key={row.id}
                actions={[
                  <Button
                    key="up"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => void movePhase(index, index - 1)}
                    aria-label="Move phase up"
                  />,
                  <Button
                    key="down"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === phaseRows.length - 1}
                    onClick={() => void movePhase(index, index + 1)}
                    aria-label="Move phase down"
                  />,
                ]}
              >
                <Space>
                  <Tag>{index + 1}</Tag>
                  <Typography.Text strong>{row.label}</Typography.Text>
                  <Typography.Text type="secondary">{row.token}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </div>
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
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const linkedAutomations = useMemo(() => getLinkedAutomationSummaries(agent), [agent]);

  useEffect(() => {
    setSteps(getInitialAgentSteps(agentId));
    setActiveTab("editor");
    setStatusNote(null);
    void wirePorts.machineApi
      .listTemplates()
      .then(({ templates }) => {
        const binding = AGENT_TEMPLATE_BINDING[agentId];
        if (!binding) return;
        const tpl = templates.find((row) => row.id === binding.templateId);
        const cells = Array.isArray(tpl?.cells) ? tpl!.cells : [];
        if (!cells.length) return;
        const hydrated = cellsToSteps(cells);
        if (hydrated.length) setSteps(hydrated);
      })
      .catch(() => undefined);
  }, [agentId]);

  const addStep = (kind: "email" | "consultant_task") => {
    setSteps((current) => insertAgentStep(current, kind, current.length - 1));
  };

  const handleSave = async () => {
    const binding = AGENT_TEMPLATE_BINDING[agentId];
    if (!binding) {
      setStatusNote("No sequence_template binding for this agent.");
      message.warning("No AGENT_TEMPLATE_BINDING for this agent.");
      return;
    }
    setSaving(true);
    setStatusNote(null);
    try {
      const cells = stepsToTemplateCells(steps);
      const tpl = await wirePorts.machineApi.upsertTemplate({
        id: binding.templateId,
        sequenceClass: binding.sequenceClass,
        label: agent.name,
        cells,
      });
      const bind = await wirePorts.machineApi.upsertBinding({
        sequenceClass: binding.sequenceClass,
        templateId: binding.templateId,
        variableBindings: { agentId, firm_name: "Cedar Immigration" },
      });
      const note = `Saved ${tpl.cells} cells → ${tpl.id}; binding ${bind.id ?? binding.sequenceClass}`;
      setStatusNote(note);
      message.success(note);
    } catch (err) {
      const note = `Save failed: ${String(err)}`;
      setStatusNote(note);
      message.error(note);
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setStatusNote(null);
    try {
      const mapped = AGENT_TEMPLATE_BINDING[agentId];
      const { templates, bindings } = await wirePorts.machineApi.listTemplates();
      const seqClass = mapped?.sequenceClass ?? "optin_launch";
      const binding = bindings.find((b) => b.sequence_class === seqClass);
      const template =
        templates.find((tpl) => tpl.id === (binding?.template_id ?? mapped?.templateId)) ??
        templates.find((tpl) => tpl.sequence_class === seqClass);
      const agentRef =
        binding?.template_id ??
        template?.id ??
        mapped?.templateId ??
        `tpl.${seqClass}.v1`;
      const enr = await wirePorts.machineApi.createEnrollment({
        contactId: "board-selected-or-book",
        agentRef,
        sequenceId: agentRef,
        payload: { source: "agent_launch", agentId, dryRun: false },
      });
      const note = `Launched live → ${agentRef} (${enr.id})`;
      setStatusNote(note);
      message.success(note);
    } catch (err) {
      const note = `Launch blocked: ${String(err)}`;
      setStatusNote(note);
      message.error(note);
    } finally {
      setLaunching(false);
    }
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
        <Space style={{ justifyContent: "space-between", width: "100%" }} align="center" wrap>
          <Space size={10} style={{ minWidth: 0 }}>
            <Typography.Title level={3} style={{ margin: 0, fontSize: 20 }}>
              {agent.name}
            </Typography.Title>
            <Tag color={statusColor(agent.status)}>{agentStatusLabel(agent.status)}</Tag>
            <Tag>
              {linkedAutomations.length} linked automation
              {linkedAutomations.length === 1 ? "" : "s"}
            </Tag>
          </Space>
          <Space>
            {statusNote ? (
              <Typography.Text type="secondary" style={{ fontSize: 12, maxWidth: 280 }}>
                {statusNote}
              </Typography.Text>
            ) : null}
            <Button icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
              Save
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={launching}
              onClick={() => void handleLaunch()}
            >
              Launch agent
            </Button>
          </Space>
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
            ) : tab.id === "settings" ? (
              <AgentSettingsPanel />
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
