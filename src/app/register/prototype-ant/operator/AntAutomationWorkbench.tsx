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
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Space,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import { PlayCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { useAutomations } from "../../../context/AutomationContext";
import {
  WORKFLOW_PALETTE_BLOCKS,
  WORKFLOW_TRIGGER_OPTIONS,
  createNodeFromBlock,
  createTriggerNode,
  getDetachedNodePosition,
  workflowStatusLabel,
  type WorkflowDefinition,
  type WorkflowNodeData,
  type WorkflowNodeType,
} from "../../../data/automationWorkflows";

type WorkflowFlowNode = Node<WorkflowNodeData, WorkflowNodeType>;

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

export function AntAutomationWorkbench({ workflowId }: { workflowId: string }) {
  const { token } = theme.useToken();
  const {
    getWorkflowById,
    renameAutomation,
    updateWorkflow,
    startManualRun,
    stopManualRun,
    getActiveManualRunId,
    getRunsForWorkflow,
  } = useAutomations();
  const workflow = getWorkflowById(workflowId);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeTab, setActiveTab] = useState("workflow");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const skipPersistRef = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(
    workflow ? cloneNodes(workflow.nodes) : [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow ? cloneEdges(workflow.edges) : []);
  const activeManualRunId = workflow ? getActiveManualRunId(workflow.id) : null;
  const runs = workflow ? getRunsForWorkflow(workflow.id) : [];
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : undefined;

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

  const handleSave = () => {
    updateWorkflow(workflow.id, { nodes, edges });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  const handleLaunch = () => {
    if (activeManualRunId) {
      stopManualRun(activeManualRunId);
    } else {
      startManualRun(workflow.id);
    }
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
            <Button icon={<SaveOutlined />} onClick={handleSave}>
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
                            <Tag color={run.status === "success" ? "success" : run.status === "running" ? "processing" : "error"}>
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
              <Empty
                style={{ marginTop: 48 }}
                description="Workflow settings, schedule windows, and enrollment controls will live here."
              />
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
                    const label = event.target.value;
                    setNodes((current) =>
                      current.map((node) =>
                        node.id === selectedNode.id ? { ...node, data: { ...node.data, label } } : node,
                      ),
                    );
                  }}
                />
              </Form.Item>
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
