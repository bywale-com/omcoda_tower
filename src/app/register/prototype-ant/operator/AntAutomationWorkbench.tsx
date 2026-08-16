import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ForkOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { FilterOutlined, PlayCircleOutlined as ActionGlyph } from "@ant-design/icons";
import { useAutomations } from "../../../context/AutomationContext";
import {
  WORKFLOW_CONSTANT_PACK_OPTIONS,
  WORKFLOW_EVENT_CATALOG,
  WORKFLOW_PALETTE_BLOCKS,
  appendNodeAfter,
  createNodeFromBlock,
  createTriggerNode,
  insertNodeOnEdge,
  relayoutWorkflowNodes,
  workflowStatusLabel,
  type PaletteBlock,
  type WorkflowDefinition,
  type WorkflowNodeData,
  type WorkflowNodeType,
  type WorkflowTriggerEvent,
} from "../../../data/automationWorkflows";
import { wirePorts } from "../../../wire/registry";
import type { EligibilityPipelineRow } from "../../../wire/machineTypes";
import { ActionAgentsModal, ActionInAppModal, ActionKindModal } from "./automationPlates/ActionPlateModals";
import { IfPlateModal } from "./automationPlates/IfPlateModal";
import { PlateInsertEdge } from "./automationPlates/PlateInsertEdge";
import { PLATE_NODE_TAG } from "./automationPlates/plateChrome";
import { RulePlateModal } from "./automationPlates/RulePlateModal";

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

function AntWorkflowNode({ id, data, type, selected }: NodeProps<WorkflowFlowNode>) {
  const workflowType = (type ?? "action") as WorkflowNodeType;
  const chip = PLATE_NODE_TAG[workflowType];
  const { setNodes } = useReactFlow();
  return (
    <div
      style={{
        width: 248,
        background: "#fff",
        borderRadius: 8,
        border: selected ? "2px solid #1677ff" : "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: 12,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span
          style={{
            background: chip.bg,
            color: chip.color,
            fontSize: 11,
            fontWeight: 600,
            padding: "1px 8px",
            borderRadius: 4,
          }}
        >
          {chip.label}
        </span>
        <Tag color={data.configured ? "success" : "warning"} style={{ marginInlineEnd: 0 }}>
          {data.configured ? "configured" : "needs setup"}
        </Tag>
      </div>
      <Input
        value={data.label}
        variant="borderless"
        onChange={(event) => {
          const label = event.target.value;
          setNodes((current) =>
            current.map((node) =>
              node.id === id ? { ...node, data: { ...node.data, label } } : node,
            ),
          );
        }}
        onMouseDown={(event) => event.stopPropagation()}
        style={{ display: "block", fontSize: 14, fontWeight: 600, paddingInline: 0 }}
      />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {nodeSummary(data)}
      </Typography.Text>
      <Handle type="source" position={Position.Bottom} />
    </div>
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
  const [plate, setPlate] = useState<null | "rule" | "action-kind" | "action-agents" | "action-inapp" | "if">(null);
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
    setPlate(null);
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
  const ruleNode = nodes.find((node) => node.type === "rule");
  const listingIds = ruleNode?.data.ruleConfig?.listingFieldIds ?? [];
  const previousOptions = nodes
    .filter((node) => node.type !== "branch" && node.type !== "exit")
    .map((node) => ({ id: node.id, label: node.data.label }));

  const openNode = (node: WorkflowFlowNode) => {
    setSelectedNodeId(node.id);
    if (node.type === "rule") setPlate("rule");
    else if (node.type === "action") setPlate("action-kind");
    else if (node.type === "branch") setPlate("if");
    else setPlate(null);
  };

  const addBlock = (block: PaletteBlock) => {
    const last = [...nodes].sort((a, b) => a.position.y - b.position.y).at(-1);
    const created = createNodeFromBlock(
      block,
      nodes.map((node) => node.id),
      { x: last?.position.x ?? 320, y: (last?.position.y ?? 40) + 160 },
    ) as WorkflowFlowNode | null;
    if (!created) return;
    if (last) {
      const next = appendNodeAfter(nodes, edges, last.id, created);
      setNodes(relayoutWorkflowNodes(next.nodes) as WorkflowFlowNode[]);
      setEdges(next.edges);
    } else {
      setNodes([...nodes, created]);
    }
    openNode(created);
  };

  const plateKinds: { id: string; title: string; body: string; icon: ReactNode; disabled?: boolean; onClick: () => void }[] = [
    {
      id: "trigger",
      title: "Trigger",
      body: "Starts the workflow.",
      icon: <ThunderboltOutlined />,
      disabled: hasTrigger,
      onClick: () => {
        const next = createTriggerNode("event", nodes.map((node) => node.id)) as WorkflowFlowNode;
        setNodes(relayoutWorkflowNodes([next, ...nodes]) as WorkflowFlowNode[]);
        setSelectedNodeId(next.id);
        setPlate(null);
      },
    },
    {
      id: "rule",
      title: "Rule",
      body: "Gate or branch logic.",
      icon: <FilterOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "rule-immigration-service-eligibility");
        if (block) addBlock(block);
      },
    },
    {
      id: "action",
      title: "Action",
      body: "In the app, or an agent.",
      icon: <ActionGlyph />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "action-sequence");
        if (block) addBlock(block);
      },
    },
    {
      id: "if",
      title: "Condition (If)",
      body: "Calls from the previous result.",
      icon: <ForkOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "condition-if");
        if (block) addBlock(block);
      },
    },
    {
      id: "exit",
      title: "Exit",
      body: "End the workflow.",
      icon: <LogoutOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "operation-exit");
        if (block) addBlock(block);
      },
    },
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
                    width: 176,
                    flexShrink: 0,
                    borderRight: `1px solid ${token.colorSplit}`,
                    padding: 12,
                    overflow: "auto",
                    background: token.colorBgLayout,
                  }}
                >
                  <Typography.Text strong>Build</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4, marginBottom: 12 }}>
                    Add nodes to the canvas.
                  </Typography.Paragraph>
                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    {plateKinds.map((row) => (
                      <Button
                        key={row.id}
                        block
                        disabled={row.disabled}
                        icon={row.icon}
                        onClick={row.onClick}
                        style={{ height: "auto", textAlign: "left", whiteSpace: "normal", padding: "8px 10px" }}
                      >
                        <span style={{ display: "block", fontWeight: 600 }}>{row.title}</span>
                        <span style={{ display: "block", fontSize: 11, color: "#8c8c8c", fontWeight: 400 }}>
                          {row.body}
                        </span>
                      </Button>
                    ))}
                  </Space>
                </aside>
                <div
                  data-register-surface="Workflow canvas"
                  style={{ flex: 1, minWidth: 0, minHeight: 0, background: token.colorBgContainer, position: "relative" }}
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={
                      {
                        default: (props) => (
                          <PlateInsertEdge
                            {...props}
                            hasTrigger={hasTrigger}
                            blocks={WORKFLOW_PALETTE_BLOCKS}
                            onInsert={(edgeId, block) => {
                              const created = createNodeFromBlock(
                                block,
                                nodes.map((node) => node.id),
                                { x: 320, y: 160 },
                              );
                              if (!created) return;
                              const next = insertNodeOnEdge(nodes, edges, edgeId, created);
                              setNodes(relayoutWorkflowNodes(next.nodes) as WorkflowFlowNode[]);
                              setEdges(next.edges);
                              openNode(created as WorkflowFlowNode);
                            }}
                          />
                        ),
                        automationInsert: (props) => (
                          <PlateInsertEdge
                            {...props}
                            hasTrigger={hasTrigger}
                            blocks={WORKFLOW_PALETTE_BLOCKS}
                            onInsert={(edgeId, block) => {
                              const created = createNodeFromBlock(
                                block,
                                nodes.map((node) => node.id),
                                { x: 320, y: 160 },
                              );
                              if (!created) return;
                              const next = insertNodeOnEdge(nodes, edges, edgeId, created);
                              setNodes(relayoutWorkflowNodes(next.nodes) as WorkflowFlowNode[]);
                              setEdges(next.edges);
                              openNode(created as WorkflowFlowNode);
                            }}
                          />
                        ),
                      } satisfies EdgeTypes
                    }
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) => openNode(node)}
                    fitView
                  >
                    <Background />
                    <MiniMap pannable zoomable />
                    <Controls />
                  </ReactFlow>
                  <Typography.Text
                    type="secondary"
                    style={{
                      position: "absolute",
                      left: 16,
                      bottom: 12,
                      fontSize: 12,
                      pointerEvents: "none",
                    }}
                  >
                    Select a node. Then configure it. Smallest workflow: trigger · rule · action.
                  </Typography.Text>
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
        open={Boolean(selectedNode) && (selectedNode?.type === "trigger" || selectedNode?.type === "constant" || selectedNode?.type === "exit")}
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
            </Descriptions>
          </Space>
        ) : null}
      </Drawer>
      <RulePlateModal
        open={plate === "rule" && selectedNode?.type === "rule"}
        title={selectedNode?.data.label ?? "Rule"}
        config={selectedNode?.data.ruleConfig}
        onCancel={() => {
          setPlate(null);
          setSelectedNodeId(null);
        }}
        onSave={(ruleConfig) => {
          if (!selectedNode) return;
          patchNodeData(setNodes, selectedNode.id, {
            ruleConfig,
            configured: true,
            ruleSummary: selectedNode.data.label,
          });
          setPlate(null);
          setSelectedNodeId(null);
        }}
      />
      <ActionKindModal
        open={plate === "action-kind" && selectedNode?.type === "action"}
        onCancel={() => {
          setPlate(null);
          setSelectedNodeId(null);
        }}
        onPickAgents={() => setPlate("action-agents")}
        onPickInApp={() => setPlate("action-inapp")}
      />
      <ActionAgentsModal
        open={plate === "action-agents" && selectedNode?.type === "action"}
        data={selectedNode?.data ?? { label: "Call agent", configured: false }}
        listingIds={listingIds}
        onCancel={() => {
          setPlate(null);
          setSelectedNodeId(null);
        }}
        onChangeKind={() => setPlate("action-kind")}
        onSave={(patch) => {
          if (!selectedNode) return;
          patchNodeData(setNodes, selectedNode.id, patch);
          setPlate(null);
          setSelectedNodeId(null);
        }}
      />
      <ActionInAppModal
        open={plate === "action-inapp" && selectedNode?.type === "action"}
        data={selectedNode?.data ?? { label: "Action", configured: false }}
        onCancel={() => {
          setPlate(null);
          setSelectedNodeId(null);
        }}
        onChangeKind={() => setPlate("action-kind")}
        onSave={(patch) => {
          if (!selectedNode) return;
          patchNodeData(setNodes, selectedNode.id, patch);
          setPlate(null);
          setSelectedNodeId(null);
        }}
      />
      <IfPlateModal
        open={plate === "if" && selectedNode?.type === "branch"}
        data={selectedNode?.data ?? { label: "If X — previous result", configured: false }}
        previousOptions={previousOptions}
        onCancel={() => {
          setPlate(null);
          setSelectedNodeId(null);
        }}
        onSave={(patch) => {
          if (!selectedNode) return;
          patchNodeData(setNodes, selectedNode.id, patch);
          setPlate(null);
          setSelectedNodeId(null);
        }}
      />
    </div>
  );
}
