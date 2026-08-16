import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Radio,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, PlayCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { useAutomations } from "../../../context/AutomationContext";
import {
  WORKFLOW_AGENT_OPTIONS,
  WORKFLOW_ACTION_TYPE_OPTIONS,
  ACTION_TYPE_DEFAULT_LABELS,
  WORKFLOW_CONSTANT_PACK_OPTIONS,
  WORKFLOW_EVENT_CATALOG,
  WORKFLOW_PALETTE_BLOCKS,
  WORKFLOW_TRIGGER_OPTIONS,
  createNodeFromBlock,
  createTriggerNode,
  getDetachedNodePosition,
  workflowStatusLabel,
  type WorkflowActionType,
  type WorkflowDefinition,
  type WorkflowNodeData,
  type WorkflowNodeType,
  type WorkflowTriggerEvent,
} from "../../../data/automationWorkflows";
import { collectibleFieldsByCapture } from "../../../data/collectibleFields";
import { wirePorts } from "../../../wire/registry";
import type { EligibilityPipelineRow } from "../../../wire/machineTypes";

type WorkflowFlowNode = Node<WorkflowNodeData, WorkflowNodeType>;

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

const NODE_TYPE_LABELS: Record<WorkflowNodeType, string> = {
  trigger: "Trigger",
  constant: "Constant",
  branch: "Branch",
  rule: "Rule",
  action: "Action",
  exit: "Exit",
};

const NODE_TONE: Record<WorkflowNodeType, string> = {
  trigger: "processing",
  constant: "purple",
  branch: "warning",
  rule: "cyan",
  action: "success",
  exit: "default",
};

function statusColor(status: WorkflowDefinition["status"]) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  return "default";
}

function nodeSummary(data: WorkflowNodeData) {
  return (
    data.triggerEvent ??
    data.scheduleSummary ??
    data.scheduleCron ??
    data.webhookId ??
    data.agentRef ??
    data.constantsPackId ??
    data.constantSummary ??
    data.filterSummary ??
    data.ruleSummary ??
    data.actionSummary ??
    data.delayLabel ??
    data.enrollmentHint ??
    "No summary yet"
  );
}

function AntWorkflowNode({ data, type, selected }: NodeProps<WorkflowFlowNode>) {
  const workflowType = (type ?? "action") as WorkflowNodeType;
  return (
    <Card
      size="small"
      bordered
      style={{
        width: 220,
        borderColor: selected ? "#1677ff" : undefined,
        boxShadow: selected ? "0 0 0 2px rgba(22, 119, 255, 0.18)" : undefined,
      }}
      styles={{ body: { padding: 10 } }}
    >
      <Handle type="target" position={Position.Top} />
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Tag color={NODE_TONE[workflowType]} style={{ marginInlineEnd: 0 }}>
            {NODE_TYPE_LABELS[workflowType]}
          </Tag>
          <Tag color={data.configured ? "success" : "warning"} style={{ marginInlineEnd: 0 }}>
            {data.configured ? "configured" : "needs setup"}
          </Tag>
        </Space>
        <Typography.Text strong ellipsis>
          {data.label}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {nodeSummary(data)}
        </Typography.Text>
      </Space>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

const nodeTypes: NodeTypes = {
  trigger: AntWorkflowNode,
  constant: AntWorkflowNode,
  branch: AntWorkflowNode,
  rule: AntWorkflowNode,
  action: AntWorkflowNode,
  exit: AntWorkflowNode,
};

function cloneNodes(nodes: WorkflowDefinition["nodes"]): WorkflowFlowNode[] {
  return structuredClone(nodes) as WorkflowFlowNode[];
}

function cloneEdges(edges: Edge[]): Edge[] {
  return structuredClone(edges);
}

function patchNodeData(
  setNodes: (updater: (current: WorkflowFlowNode[]) => WorkflowFlowNode[]) => void,
  nodeId: string,
  patch: Partial<WorkflowNodeData>,
) {
  setNodes((current) =>
    current.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node,
    ),
  );
}

function NodeConfigFields({
  node,
  onPatch,
}: {
  node: WorkflowFlowNode;
  onPatch: (patch: Partial<WorkflowNodeData>) => void;
}) {
  const kind = node.type ?? "action";
  const data = node.data;

  if (kind === "trigger") {
    if (data.triggerKind === "event") {
      return (
        <Form.Item label="Machine event (workflow_trigger.event_name)">
          <Select
            value={data.triggerEvent ?? "eligibility.changed"}
            options={WORKFLOW_EVENT_CATALOG.map((event) => ({
              value: event.id,
              label: `${event.label} · ${event.id}`,
            }))}
            onChange={(value: WorkflowTriggerEvent) =>
              onPatch({
                triggerEvent: value,
                configured: true,
                enrollmentHint: `Fires on ${value}`,
              })
            }
          />
        </Form.Item>
      );
    }
    if (data.triggerKind === "webhook") {
      return (
        <Form.Item
          label="Webhook id (workflow_trigger.webhook_id)"
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Inbound URL: /wire/hook/{data.webhookId || "…"}
            </Typography.Text>
          }
        >
          <Input
            value={data.webhookId ?? ""}
            placeholder="wh_external"
            onChange={(event) => {
              const webhookId = event.target.value.trim();
              onPatch({
                webhookId,
                configured: Boolean(webhookId),
                enrollmentHint: webhookId ? `POST /wire/hook/${webhookId}` : data.enrollmentHint,
              });
            }}
          />
        </Form.Item>
      );
    }
    if (data.triggerKind === "schedule") {
      return (
        <Form.Item label="Cron (workflow_trigger.schedule)">
          <Input
            value={data.scheduleCron ?? data.scheduleSummary ?? ""}
            placeholder="0 * * * *"
            onChange={(event) => {
              const scheduleCron = event.target.value;
              onPatch({
                scheduleCron,
                scheduleSummary: scheduleCron,
                configured: Boolean(scheduleCron.trim()),
              });
            }}
          />
        </Form.Item>
      );
    }
    return (
      <Typography.Text type="secondary">
        {data.triggerKind === "manual"
          ? "Manual trigger — launch from the header."
          : "Configure this trigger kind on the canvas fields above."}
      </Typography.Text>
    );
  }

  if (kind === "action") {
    const actionType = (data.actionType === "enroll_sequence" ? "call_agent" : data.actionType) ?? "call_agent";
    const listing = collectibleFieldsByCapture("self_reportable");
    return (
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Form.Item label="Node title">
          <Input
            value={data.label}
            onChange={(event) =>
              onPatch({
                label: event.target.value,
                configured: true,
              })
            }
          />
        </Form.Item>
        <Form.Item label="Action type">
          <Select
            value={actionType}
            options={WORKFLOW_ACTION_TYPE_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            onChange={(value: WorkflowActionType) =>
              onPatch({
                actionType: value,
                label: data.label || ACTION_TYPE_DEFAULT_LABELS[value],
                configured: true,
                actionSummary: ACTION_TYPE_DEFAULT_LABELS[value],
              })
            }
          />
        </Form.Item>
        {actionType === "call_agent" || actionType === "enroll_sequence" ? (
          <>
            <Form.Item label="Assign">
              <Radio.Group
                value={data.assignMode ?? "existing"}
                onChange={(event) =>
                  onPatch({
                    assignMode: event.target.value,
                    actionType: "call_agent",
                    configured: true,
                  })
                }
              >
                <Space direction="vertical">
                  <Radio value="existing">Assign an existing sequence</Radio>
                  <Radio value="from_template">Copy from a template</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            {(data.assignMode ?? "existing") === "existing" ? (
              <Form.Item label="Sequence">
                <Select
                  value={data.agentRef ?? "tpl.optin_launch.v1"}
                  options={WORKFLOW_AGENT_OPTIONS.map((opt) => ({
                    value: opt.id,
                    label: `${opt.label} · ${opt.id}`,
                  }))}
                  onChange={(value) =>
                    onPatch({
                      agentRef: value,
                      actionType: "call_agent",
                      assignMode: "existing",
                      actionSummary: `Call agent · ${value}`,
                      configured: true,
                    })
                  }
                />
              </Form.Item>
            ) : (
              <Form.Item label="Template class">
                <Radio.Group
                  value={data.copySequenceClass ?? "optin"}
                  onChange={(event) => {
                    const copySequenceClass = event.target.value as "optin" | "reengagement" | "reactivation";
                    const opt = WORKFLOW_AGENT_OPTIONS.find((row) => row.sequenceClass === copySequenceClass);
                    onPatch({
                      copySequenceClass,
                      assignMode: "from_template",
                      actionType: "call_agent",
                      agentRef: opt?.id,
                      actionSummary: `Copy ${copySequenceClass} template`,
                      configured: true,
                    });
                  }}
                >
                  <Space direction="vertical">
                    <Radio value="optin">Opt-in</Radio>
                    <Radio value="reengagement">Re-engagement</Radio>
                    <Radio value="reactivation">Reactivation</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            )}
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
              You do not create an agent here. Assign existing, or copy from a template.
            </Typography.Paragraph>
          </>
        ) : null}
        {actionType === "ascribe_tag" ? (
          <Form.Item label="Tag">
            <Input
              value={data.tag ?? ""}
              onChange={(event) =>
                onPatch({
                  tag: event.target.value,
                  configured: Boolean(event.target.value.trim()),
                  actionSummary: event.target.value,
                })
              }
            />
          </Form.Item>
        ) : null}
        <Form.Item label="Form questions (listing ids)">
          <Checkbox.Group
            value={data.formQuestionIds ?? []}
            onChange={(ids) => onPatch({ formQuestionIds: ids as string[], configured: true })}
            options={listing.map((field) => ({ label: field.label, value: field.id }))}
          />
        </Form.Item>
      </Space>
    );
  }

  if (kind === "rule") {
    const listing = collectibleFieldsByCapture("self_reportable");
    const selected = data.ruleConfig?.listingFieldIds ?? [];
    return (
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Form.Item label="Required-data listing">
          <Checkbox.Group
            value={selected}
            onChange={(ids) =>
              onPatch({
                ruleConfig: {
                  packId: data.ruleConfig?.packId ?? "custom",
                  enabledOutcomeIds: data.ruleConfig?.enabledOutcomeIds ?? [],
                  listingFieldIds: ids as string[],
                  customJson: data.ruleConfig?.customJson,
                  namedCode: data.ruleConfig?.namedCode,
                  namedCodeOn: data.ruleConfig?.namedCodeOn,
                },
                configured: true,
              })
            }
            options={listing.map((field) => ({ label: field.label, value: field.id }))}
          />
        </Form.Item>
        <Form.Item label="Custom JSON">
          <Input.TextArea
            rows={3}
            value={
              typeof data.ruleConfig?.customJson === "string"
                ? data.ruleConfig.customJson
                : data.ruleConfig?.customJson
                  ? JSON.stringify(data.ruleConfig.customJson)
                  : ""
            }
            onChange={(event) => {
              let customJson: unknown = event.target.value;
              try {
                customJson = event.target.value.trim() ? JSON.parse(event.target.value) : null;
              } catch {
                customJson = event.target.value;
              }
              onPatch({
                ruleConfig: {
                  packId: data.ruleConfig?.packId ?? "custom",
                  enabledOutcomeIds: data.ruleConfig?.enabledOutcomeIds ?? [],
                  listingFieldIds: data.ruleConfig?.listingFieldIds ?? [],
                  namedCode: data.ruleConfig?.namedCode,
                  namedCodeOn: data.ruleConfig?.namedCodeOn,
                  customJson,
                },
                configured: true,
              });
            }}
          />
        </Form.Item>
        <Form.Item label="Named code (saved, run later)">
          <Input.TextArea
            rows={4}
            value={data.ruleConfig?.namedCode ?? ""}
            onChange={(event) =>
              onPatch({
                ruleConfig: {
                  packId: data.ruleConfig?.packId ?? "custom",
                  enabledOutcomeIds: data.ruleConfig?.enabledOutcomeIds ?? [],
                  listingFieldIds: data.ruleConfig?.listingFieldIds ?? [],
                  customJson: data.ruleConfig?.customJson,
                  namedCodeOn: data.ruleConfig?.namedCodeOn,
                  namedCode: event.target.value,
                },
                configured: true,
              })
            }
          />
        </Form.Item>
        <Form.Item>
          <Switch
            checked={Boolean(data.ruleConfig?.namedCodeOn)}
            onChange={(namedCodeOn) =>
              onPatch({
                ruleConfig: {
                  packId: data.ruleConfig?.packId ?? "custom",
                  enabledOutcomeIds: data.ruleConfig?.enabledOutcomeIds ?? [],
                  listingFieldIds: data.ruleConfig?.listingFieldIds ?? [],
                  customJson: data.ruleConfig?.customJson,
                  namedCode: data.ruleConfig?.namedCode,
                  namedCodeOn,
                },
              })
            }
            checkedChildren="named code on"
            unCheckedChildren="named code off"
          />
        </Form.Item>
      </Space>
    );
  }

  if (kind === "constant") {
    return (
      <Form.Item label="Constants pack (constants_packs)">
        <Select
          value={data.constantsPackId ?? undefined}
          placeholder="Select pack"
          options={WORKFLOW_CONSTANT_PACK_OPTIONS.map((opt) => ({
            value: opt.id,
            label: opt.label,
          }))}
          onChange={(value) =>
            onPatch({
              constantsPackId: value,
              constantSummary: value,
              constantKind: data.constantKind ?? "data_reference",
              configured: true,
            })
          }
        />
      </Form.Item>
    );
  }

  return null;
}

export function AntAutomationWorkbench({ workflowId }: { workflowId: string }) {
  const { token } = theme.useToken();
  const {
    getWorkflowById,
    renameAutomation,
    updateWorkflow,
    activateWorkflow,
    startManualRun,
    stopManualRun,
    getActiveManualRunId,
    getRunsForWorkflow,
    refreshRuns,
  } = useAutomations();
  const workflow = getWorkflowById(workflowId);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeTab, setActiveTab] = useState("workflow");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<EligibilityPipelineRow[]>([]);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const skipPersistRef = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(
    workflow ? cloneNodes(workflow.nodes) : [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow ? cloneEdges(workflow.edges) : []);
  const activeManualRunId = workflow ? getActiveManualRunId(workflow.id) : null;
  const runs = workflow ? getRunsForWorkflow(workflow.id) : [];
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : undefined;
  const triggerNode = useMemo(() => nodes.find((node) => node.type === "trigger"), [nodes]);

  useEffect(() => {
    skipPersistRef.current = true;
    setNodes(workflow ? cloneNodes(workflow.nodes) : []);
    setEdges(workflow ? cloneEdges(workflow.edges) : []);
    setSelectedNodeId(null);
    setActiveTab("workflow");
  }, [workflow?.id, setEdges, setNodes]);

  useEffect(() => {
    if (!workflow) return;
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    updateWorkflow(workflow.id, { nodes, edges });
  }, [edges, nodes, updateWorkflow, workflow?.id]);

  useEffect(() => {
    if (activeTab !== "runs" || !workflow) return;
    void refreshRuns(workflow.id);
  }, [activeTab, refreshRuns, workflow?.id]);

  useEffect(() => {
    if (activeTab !== "settings") return;
    let cancelled = false;
    setPipelineError(null);
    void wirePorts.machineApi
      .listEligibilityPipeline()
      .then((stages) => {
        if (!cancelled) setPipeline(stages);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPipeline([]);
          setPipelineError(err instanceof Error ? err.message : "Failed to load pipeline");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const movePipelineStage = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pipeline.length) return;
    const next = reorderOrdRows(pipeline, fromIndex, toIndex);
    setPipeline(next);
    try {
      const saved = await wirePorts.machineApi.upsertEligibilityPipeline(
        next.map((row) => ({ id: row.id, token: row.token, label: row.label, ord: row.ord })),
      );
      setPipeline(saved);
      message.success(
        `seq_eligibility_pipeline · ${saved.map((s) => s.token).join(" → ")}`,
      );
    } catch (err) {
      message.error(`Pipeline reorder failed: ${String(err)}`);
      try {
        setPipeline(await wirePorts.machineApi.listEligibilityPipeline());
      } catch {
        /* keep optimistic next */
      }
    }
  };

  if (!workflow) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Automation not found" />
      </div>
    );
  }

  const hasTrigger = nodes.some((node) => node.type === "trigger");
  const paletteItems = [
    {
      key: "trigger",
      label: "Trigger",
      children: (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {WORKFLOW_TRIGGER_OPTIONS.map((trigger) => (
            <Button
              key={trigger.id}
              block
              disabled={hasTrigger}
              onClick={() => {
                const next = createTriggerNode(
                  trigger.triggerKind,
                  nodes.map((node) => node.id),
                ) as WorkflowFlowNode;
                setNodes([next, ...nodes]);
                setSelectedNodeId(next.id);
              }}
            >
              {trigger.label}
            </Button>
          ))}
        </Space>
      ),
    },
    ...(["constant", "branch", "rule", "action", "exit"] as WorkflowNodeType[]).map((type) => ({
      key: type,
      label: NODE_TYPE_LABELS[type],
      children: (
        <List
          size="small"
          dataSource={WORKFLOW_PALETTE_BLOCKS.filter((block) => block.nodeType === type)}
          locale={{ emptyText: "No blocks" }}
          renderItem={(block) => (
            <List.Item style={{ paddingInline: 0 }}>
              <Button
                block
                style={{ height: "auto", textAlign: "left", whiteSpace: "normal" }}
                onClick={() => {
                  const next = createNodeFromBlock(
                    block,
                    nodes.map((node) => node.id),
                    getDetachedNodePosition(nodes),
                  ) as WorkflowFlowNode | null;
                  if (!next) return;
                  setNodes([...nodes, next]);
                  setSelectedNodeId(next.id);
                }}
              >
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{block.label}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {block.description}
                  </Typography.Text>
                </Space>
              </Button>
            </List.Item>
          )}
        />
      ),
    })),
  ];

  const handleSave = async () => {
    updateWorkflow(workflow.id, { nodes, edges });
    try {
      await wirePorts.machineApi.createWorkflow({
        id: workflow.id,
        name: workflow.name,
        target: workflow.target,
        graph: { nodes, edges },
      });
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1200);
      message.success("Saved workflow + triggers");
    } catch (err) {
      message.error(`Save failed: ${String(err)}`);
    }
  };

  const handleLaunch = () => {
    if (activeManualRunId) {
      stopManualRun(activeManualRunId);
      return;
    }
    // Launch = Activate (draft → active) then start a workflow_run
    void activateWorkflow(workflow.id).then(() => {
      startManualRun(workflow.id);
    });
  };

  const patchTriggerSettings = (patch: Partial<WorkflowNodeData>) => {
    if (!triggerNode) return;
    patchNodeData(setNodes, triggerNode.id, patch);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
      <div
        style={{
          borderBottom: `1px solid ${token.colorSplit}`,
          padding: "10px 16px",
          flexShrink: 0,
          background: token.colorBgContainer,
        }}
      >
        <Space style={{ justifyContent: "space-between", width: "100%" }} align="center">
          <Space size={10} style={{ minWidth: 0 }}>
            <Input
              aria-label="Automation name"
              value={workflow.name}
              onChange={(event) => renameAutomation(workflow.id, event.target.value)}
              variant="borderless"
              style={{ width: 340, fontSize: 20, fontWeight: 600, paddingInline: 0 }}
            />
            <Tag color={statusColor(workflow.status)}>{workflowStatusLabel(workflow.status)}</Tag>
            {savedFlash ? <Tag color="success">Saved</Tag> : null}
          </Space>
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => void handleSave()}>
              Save
            </Button>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleLaunch}>
              {activeManualRunId ? "Stop run" : "Launch workflow"}
            </Button>
          </Space>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "workflow",
            label: "Workflow",
            children: (
              <div style={{ height: "100%", display: "flex", minHeight: 0 }}>
                <aside
                  style={{
                    width: 260,
                    flexShrink: 0,
                    borderRight: `1px solid ${token.colorSplit}`,
                    padding: 12,
                    overflow: "auto",
                    background: token.colorBgLayout,
                  }}
                >
                  <Typography.Text strong>Build</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    Add workflow blocks to the canvas.
                  </Typography.Paragraph>
                  <Collapse size="small" defaultActiveKey={["trigger", "action", "branch"]} items={paletteItems} />
                </aside>
                <div
                  data-register-surface="Workflow canvas"
                  style={{ flex: 1, minWidth: 0, minHeight: 0, background: token.colorBgContainer }}
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    fitView
                  >
                    <Background />
                    <MiniMap pannable zoomable />
                    <Controls />
                  </ReactFlow>
                </div>
              </div>
            ),
          },
          {
            key: "runs",
            label: "Runs",
            children:
              runs.length > 0 ? (
                <List
                  style={{ padding: 16 }}
                  dataSource={runs}
                  renderItem={(run) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{run.triggerLabel}</span>
                            <Tag
                              color={
                                run.status === "success"
                                  ? "success"
                                  : run.status === "running"
                                    ? "processing"
                                    : "error"
                              }
                            >
                              {run.status}
                            </Tag>
                          </Space>
                        }
                        description={`${run.entityLabel} · ${new Date(run.startedAt).toLocaleString()}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty style={{ marginTop: 48 }} description="Run history appears after this workflow launches." />
              ),
          },
          {
            key: "settings",
            label: "Settings",
            children: (
              <div style={{ padding: 16, maxWidth: 640 }}>
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  <div>
                    <Typography.Title level={5} style={{ marginTop: 0 }}>
                      Schedule / enrollment
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                      Edits the trigger node summaries used for workflow_trigger schedule and enrollment copy.
                    </Typography.Paragraph>
                    {triggerNode ? (
                      <Form layout="vertical">
                        <Form.Item label="Schedule summary">
                          <Input
                            value={
                              triggerNode.data.scheduleSummary ??
                              triggerNode.data.scheduleCron ??
                              ""
                            }
                            placeholder="Every hour · 0 * * * *"
                            onChange={(event) => {
                              const scheduleSummary = event.target.value;
                              patchTriggerSettings({
                                scheduleSummary,
                                scheduleCron:
                                  triggerNode.data.triggerKind === "schedule"
                                    ? scheduleSummary
                                    : triggerNode.data.scheduleCron,
                                configured:
                                  triggerNode.data.triggerKind === "schedule"
                                    ? Boolean(scheduleSummary.trim())
                                    : triggerNode.data.configured,
                              });
                            }}
                          />
                        </Form.Item>
                        <Form.Item label="Enrollment summary">
                          <Input.TextArea
                            rows={3}
                            value={triggerNode.data.enrollmentHint ?? ""}
                            placeholder="Who enrolls when this workflow fires…"
                            onChange={(event) =>
                              patchTriggerSettings({ enrollmentHint: event.target.value })
                            }
                          />
                        </Form.Item>
                      </Form>
                    ) : (
                      <Empty description="Add a trigger node to edit schedule and enrollment." />
                    )}
                  </div>

                  <div data-register-surface="Eligibility pipeline order">
                    <Typography.Title level={5}>Eligibility pipeline</Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                      Reorder stages in <code>seq_eligibility_pipeline</code> — evaluation walks this
                      ladder.
                    </Typography.Paragraph>
                    {pipelineError ? (
                      <Typography.Text type="danger">{pipelineError}</Typography.Text>
                    ) : pipeline.length > 0 ? (
                      <List
                        size="small"
                        bordered
                        dataSource={pipeline}
                        renderItem={(stage, index) => (
                          <List.Item
                            actions={[
                              <Button
                                key="up"
                                size="small"
                                icon={<ArrowUpOutlined />}
                                disabled={index === 0}
                                aria-label={`Move ${stage.token} up`}
                                onClick={() => void movePipelineStage(index, index - 1)}
                              />,
                              <Button
                                key="down"
                                size="small"
                                icon={<ArrowDownOutlined />}
                                disabled={index === pipeline.length - 1}
                                aria-label={`Move ${stage.token} down`}
                                onClick={() => void movePipelineStage(index, index + 1)}
                              />,
                            ]}
                          >
                            <Space>
                              <Tag>{index + 1}</Tag>
                              <Typography.Text strong>{stage.label}</Typography.Text>
                              <Typography.Text type="secondary">{stage.token}</Typography.Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="No pipeline stages loaded." />
                    )}
                  </div>
                </Space>
              </div>
            ),
          },
        ]}
        style={{ flex: 1, minHeight: 0 }}
        tabBarStyle={{ margin: 0, paddingInline: 16, flexShrink: 0 }}
      />

      <Drawer
        title="Node details"
        open={Boolean(selectedNode)}
        onClose={() => setSelectedNodeId(null)}
        width={420}
      >
        {selectedNode ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Form layout="vertical">
              <Form.Item label="Label">
                <Input
                  value={selectedNode.data.label}
                  onChange={(event) => {
                    patchNodeData(setNodes, selectedNode.id, { label: event.target.value });
                  }}
                />
              </Form.Item>
              <NodeConfigFields
                node={selectedNode}
                onPatch={(patch) => patchNodeData(setNodes, selectedNode.id, patch)}
              />
            </Form>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Type">
                {NODE_TYPE_LABELS[(selectedNode.type ?? "action") as WorkflowNodeType]}
              </Descriptions.Item>
              <Descriptions.Item label="Configured">
                <Tag color={selectedNode.data.configured ? "success" : "warning"}>
                  {selectedNode.data.configured ? "Configured" : "Needs setup"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Summary">{nodeSummary(selectedNode.data)}</Descriptions.Item>
              {selectedNode.data.target ? (
                <Descriptions.Item label="Target">{selectedNode.data.target}</Descriptions.Item>
              ) : null}
              {selectedNode.data.triggerKind ? (
                <Descriptions.Item label="Trigger kind">{selectedNode.data.triggerKind}</Descriptions.Item>
              ) : null}
              {selectedNode.data.actionType ? (
                <Descriptions.Item label="Action">{selectedNode.data.actionType}</Descriptions.Item>
              ) : null}
            </Descriptions>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
