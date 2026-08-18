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
import { Button, Empty, Form, Input, List, Radio, Select, Space, Table, Tabs, Tag, Typography, message, theme } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  ForkOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { FilterOutlined, PlayCircleOutlined as ActionGlyph } from "@ant-design/icons";
import { useAutomations } from "../../../context/AutomationContext";
import {
  WORKFLOW_CONSTANT_PACK_OPTIONS,
  WORKFLOW_EVENT_CATALOG,
  WORKFLOW_EVENTS_WITH_LOCAL,
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
import { formatGetSummary, previewGetWrites } from "../../../data/automationGet";
import { emptyRuleNodeConfig } from "../../../data/automationRules";
import { wirePorts } from "../../../wire/registry";
import type { EligibilityPipelineRow } from "../../../wire/machineTypes";
import { ActionAgentsModal, ActionInAppModal, ActionKindModal } from "./automationPlates/ActionPlateModals";
import { DirectInputPane } from "./automationPlates/DirectInputPane";
import { GetParametersPane } from "./automationPlates/GetParametersPane";
import { IfPlateModal } from "./automationPlates/IfPlateModal";
import { NodeInteriorModal } from "./automationPlates/NodeInteriorModal";
import { PlateInsertEdge } from "./automationPlates/PlateInsertEdge";
import { PLATE_NODE_TAG } from "./automationPlates/plateChrome";
import { RuleOutcomesPane } from "./automationPlates/RuleOutcomesPane";
import { ContactPickModal } from "./ContactPickModal";

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
    (data.getModule ? formatGetSummary(data) : null) ??
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
  get: AntWorkflowNode,
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
  localOptions,
}: {
  node: WorkflowFlowNode;
  onPatch: (patch: Partial<WorkflowNodeData>) => void;
  localOptions?: Array<{ value: string; label: string }>;
}) {
  const kind = node.type ?? "action";
  const data = node.data;

  if (kind === "trigger") {
    if (data.triggerKind === "event") {
      const event = (data.triggerEvent ?? "eligibility.changed") as WorkflowTriggerEvent;
      const allowsLocal = WORKFLOW_EVENTS_WITH_LOCAL.has(event);
      const grain = allowsLocal && data.grain === "local" ? "local" : "global";
      return (
        <>
          <Form.Item label="Machine event (workflow_trigger.event_name)">
            <Select
              value={event}
              options={WORKFLOW_EVENT_CATALOG.map((row) => ({
                value: row.id,
                label: `${row.label} · ${row.id}`,
              }))}
              onChange={(value: WorkflowTriggerEvent) =>
                onPatch({
                  triggerEvent: value,
                  configured: true,
                  enrollmentHint: `Fires on ${value}`,
                  grain: WORKFLOW_EVENTS_WITH_LOCAL.has(value) ? data.grain ?? "global" : "global",
                  localRef: WORKFLOW_EVENTS_WITH_LOCAL.has(value) ? data.localRef : undefined,
                })
              }
            />
          </Form.Item>
          {allowsLocal ? (
            <>
              <Form.Item label="Grain">
                <Radio.Group
                  value={grain}
                  onChange={(eventChange) =>
                    onPatch({
                      grain: eventChange.target.value,
                      localRef: eventChange.target.value === "global" ? undefined : data.localRef,
                    })
                  }
                >
                  <Radio.Button value="global">Global</Radio.Button>
                  <Radio.Button value="local">Local</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label={
                  event === "fact_writebacks"
                    ? "This form"
                    : event === "campaign_failure"
                      ? "This campaign"
                      : event === "ct_firms"
                        ? "This firm"
                        : "This sequence"
                }
              >
                <Select
                  disabled={grain !== "local"}
                  placeholder={grain === "local" ? "Pick this instance" : "Disabled on Global"}
                  value={grain === "local" ? data.localRef : undefined}
                  options={localOptions ?? []}
                  onChange={(localRef) => onPatch({ localRef, grain: "local" })}
                  allowClear
                />
              </Form.Item>
            </>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              This event is Global only.
            </Typography.Text>
          )}
        </>
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
  const [plate, setPlate] = useState<null | "action-kind" | "action-agents" | "action-inapp">(null);
  const [interiorOpen, setInteriorOpen] = useState(false);
  const saveRef = useRef<(() => void) | null>(null);
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
  const [audienceScope, setAudienceScope] = useState<"every_firm" | "select_from">("every_firm");
  const [audienceIds, setAudienceIds] = useState<string[]>([]);
  const [book, setBook] = useState<
    Array<{
      id: string;
      name: string | null;
      email: string | null;
      firmId?: string | null;
      firmName?: string | null;
      createdAt?: string | null;
    }>
  >([]);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [pickScope, setPickScope] = useState<"every_firm" | "select_from">("every_firm");
  const [pickIds, setPickIds] = useState<string[]>([]);
  const [contactQuery, setContactQuery] = useState("");
  const [localOptions, setLocalOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    skipPersistRef.current = true;
    setNodes(workflow ? cloneNodes(workflow.nodes) : []);
    setEdges(workflow ? cloneEdges(workflow.edges) : []);
    setSelectedNodeId(null);
    setPlate(null);
    setInteriorOpen(false);
    setActiveTab("workflow");
  }, [workflow?.id, setEdges, setNodes]);

  useEffect(() => {
    if (!workflow) return;
    void wirePorts.machineApi.listWorkflows().then((rows) => {
      const row = rows.find((item) => item.id === workflow.id);
      setAudienceScope(row?.audience_scope === "select_from" ? "select_from" : "every_firm");
      setAudienceIds(row?.audience_contact_ids ?? []);
    }).catch(() => undefined);
    void wirePorts.machineApi.listContactRecords({ scope: "every_firm" }).then((rows) => {
      setBook(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          firmId: r.firmId,
          firmName: r.firmName,
          createdAt: r.createdAt,
        })),
      );
    }).catch(() => setBook([]));
  }, [workflow?.id]);

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

  useEffect(() => {
    const event = triggerNode?.data.triggerEvent;
    if (!event || !WORKFLOW_EVENTS_WITH_LOCAL.has(event) || triggerNode?.data.grain !== "local") {
      setLocalOptions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        if (event === "fact_writebacks") {
          const opts = listingIds.map((id) => ({ value: id, label: id }));
          if (!cancelled) setLocalOptions(opts);
          return;
        }
        if (event === "campaign_failure") {
          const { templates } = await wirePorts.machineApi.listTemplates();
          const camps: Array<{ value: string; label: string }> = [];
          for (const tpl of templates) {
            const { campaigns } = await wirePorts.machineApi.listSequenceHousing(tpl.id);
            for (const camp of campaigns) camps.push({ value: camp.id, label: camp.name });
          }
          if (!cancelled) setLocalOptions(camps);
          return;
        }
        if (event === "ct_firms") {
          const consultants = await wirePorts.machineApi.listConsultants();
          const seen = new Map<string, string>();
          for (const row of consultants) seen.set(row.firmId, row.firmName);
          if (!cancelled) {
            setLocalOptions([...seen.entries()].map(([value, label]) => ({ value, label })));
          }
          return;
        }
        const { templates } = await wirePorts.machineApi.listTemplates();
        if (!cancelled) {
          setLocalOptions(templates.map((tpl) => ({ value: tpl.id, label: tpl.label })));
        }
      } catch {
        if (!cancelled) setLocalOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [triggerNode?.data.triggerEvent, triggerNode?.data.grain, listingIds.join("|")]);

  const closeInterior = () => {
    setInteriorOpen(false);
    setPlate(null);
    setSelectedNodeId(null);
    saveRef.current = null;
  };

  const openNode = (node: WorkflowFlowNode) => {
    setSelectedNodeId(node.id);
    setInteriorOpen(true);
    if (node.type === "action") {
      if (node.data.actionType === "call_agent" || node.data.actionType === "enroll_sequence") {
        setPlate("action-agents");
      } else if (node.data.actionType) {
        setPlate("action-inapp");
      } else {
        setPlate("action-kind");
      }
    } else {
      setPlate(null);
    }
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
        openNode(next);
      },
    },
    {
      id: "get",
      title: "Get",
      body: "Read records in a module at a grain.",
      icon: <DatabaseOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "get-records");
        if (block) addBlock(block);
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
        audienceScope,
        audienceContactIds: audienceScope === "select_from" ? audienceIds : [],
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
            <Button
              icon={<UserAddOutlined />}
              onClick={() => {
                setPickScope("every_firm");
                setPickIds([]);
                setAddContactOpen(true);
              }}
            >
              Add contact
            </Button>
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
                    deleteKeyCode={["Backspace", "Delete"]}
                    onNodesDelete={(deleted) => {
                      const ids = new Set(deleted.map((node) => node.id));
                      setEdges((current) =>
                        current.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
                      );
                      if (selectedNodeId && ids.has(selectedNodeId)) {
                        closeInterior();
                      }
                    }}
                    fitView
                  >
                    <Background />
                    <MiniMap pannable zoomable />
                    <Controls />
                  </ReactFlow>
                  {selectedNodeId ? (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", right: 16, top: 12, zIndex: 5 }}
                      onClick={() => {
                        setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
                        setEdges((current) =>
                          current.filter(
                            (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
                          ),
                        );
                        closeInterior();
                      }}
                    >
                      Remove node
                    </Button>
                  ) : null}
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
            key: "contacts",
            label: "Contacts",
            children: (
              <div style={{ padding: 16, height: "100%", overflow: "auto" }}>
                <Input.Search
                  placeholder="Search contacts"
                  value={contactQuery}
                  onChange={(event) => setContactQuery(event.target.value)}
                  style={{ marginBottom: 12, maxWidth: 320 }}
                />
                <Table
                  size="small"
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  dataSource={(audienceScope === "select_from"
                    ? book.filter((row) => audienceIds.includes(row.id))
                    : book
                  ).filter((row) => {
                    const hay = `${row.name ?? ""} ${row.email ?? ""} ${row.firmName ?? ""}`.toLowerCase();
                    return hay.includes(contactQuery.trim().toLowerCase());
                  })}
                  columns={[
                    {
                      title: "Name",
                      dataIndex: "name",
                      render: (_: unknown, row: (typeof book)[number]) => row.name || row.email || "—",
                    },
                    {
                      title: "Firm",
                      dataIndex: "firmName",
                      render: (value: string | null | undefined) => value || "—",
                    },
                    {
                      title: "Enrolled date",
                      dataIndex: "createdAt",
                      render: (value: string | null | undefined) =>
                        value ? new Date(value).toLocaleString() : "—",
                    },
                  ]}
                  locale={{ emptyText: "No contacts for this automation yet." }}
                />
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
        className="tower-fill-tabs"
        style={{ flex: 1, minHeight: 0 }}
        tabBarStyle={{ margin: 0, paddingInline: 16, flexShrink: 0 }}
      />

      <NodeInteriorModal
        open={interiorOpen && Boolean(selectedNode)}
        node={selectedNode}
        nodes={nodes}
        edges={edges}
        parameters={
          selectedNode?.type === "get" ? (
            <GetParametersPane
              data={selectedNode.data}
              book={book}
              upstreamIds={nodes.flatMap((node) =>
                node.id === selectedNode.id
                  ? []
                  : [node.data.getClass1, ...(node.data.directContactIds ?? [])].filter(Boolean) as string[],
              )}
              onPatch={(patch) => {
                const next = { ...selectedNode.data, ...patch };
                patchNodeData(setNodes, selectedNode.id, {
                  ...patch,
                  lastOutput: { writes: previewGetWrites(next, book) } as WorkflowNodeData["lastOutput"],
                });
              }}
            />
          ) : selectedNode?.type === "rule" ? (
            <DirectInputPane
              data={selectedNode.data}
              book={book}
              onPatch={(patch) => patchNodeData(setNodes, selectedNode.id, patch)}
            />
          ) : selectedNode?.type === "trigger" || selectedNode?.type === "constant" ? (
            <Form layout="vertical">
              <NodeConfigFields
                node={selectedNode}
                localOptions={localOptions}
                onPatch={(patch) => patchNodeData(setNodes, selectedNode.id, patch)}
              />
            </Form>
          ) : selectedNode?.type === "branch" ? (
            <IfPlateModal
              embed
              open={interiorOpen}
              data={selectedNode.data}
              previousOptions={previousOptions}
              onCancel={closeInterior}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
                closeInterior();
              }}
            />
          ) : selectedNode?.type === "action" && plate === "action-kind" ? (
            <ActionKindModal
              embed
              open
              onCancel={closeInterior}
              onPickAgents={() => setPlate("action-agents")}
              onPickInApp={() => setPlate("action-inapp")}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
            />
          ) : selectedNode?.type === "action" && plate === "action-agents" ? (
            <ActionAgentsModal
              embed
              open
              data={selectedNode.data}
              listingIds={listingIds}
              onCancel={closeInterior}
              onChangeKind={() => setPlate("action-kind")}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
                closeInterior();
              }}
            />
          ) : selectedNode?.type === "action" && plate === "action-inapp" ? (
            <ActionInAppModal
              embed
              open
              data={selectedNode.data}
              onCancel={closeInterior}
              onChangeKind={() => setPlate("action-kind")}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
                closeInterior();
              }}
            />
          ) : null
        }
        outcomes={
          selectedNode?.type === "rule" ? (
            <RuleOutcomesPane
              config={selectedNode.data.ruleConfig ?? emptyRuleNodeConfig()}
              onChange={(ruleConfig) =>
                patchNodeData(setNodes, selectedNode.id, {
                  ruleConfig,
                  configured: true,
                  ruleSummary: selectedNode.data.label,
                })
              }
            />
          ) : undefined
        }
        onCancel={closeInterior}
        onSave={(label) => {
          if (!selectedNode) return;
          if (label !== selectedNode.data.label) {
            patchNodeData(setNodes, selectedNode.id, { label });
          }
          if (selectedNode.type === "action" && plate === "action-kind") {
            saveRef.current?.();
            return;
          }
          if (selectedNode.type === "action" || selectedNode.type === "branch") {
            saveRef.current?.();
            return;
          }
          closeInterior();
        }}
      />
      <ContactPickModal
        open={addContactOpen}
        title="Add contact"
        scope={pickScope}
        contacts={book}
        selectedIds={pickIds}
        footerHint="Who this automation applies to. It does not start a mission now."
        onScope={setPickScope}
        onSelectedIds={setPickIds}
        onCancel={() => setAddContactOpen(false)}
        onOk={() => {
          const nextScope = pickScope;
          const nextIds = pickScope === "select_from" ? pickIds : [];
          setAudienceScope(nextScope);
          setAudienceIds(nextIds);
          setAddContactOpen(false);
          if (!workflow) return;
          void wirePorts.machineApi
            .createWorkflow({
              id: workflow.id,
              name: workflow.name,
              target: workflow.target,
              graph: { nodes, edges },
              audienceScope: nextScope,
              audienceContactIds: nextIds,
            })
            .then(() => message.success("Saved audience"))
            .catch((err) => message.error(`Audience save failed: ${String(err)}`));
        }}
      />
    </div>
  );
}
