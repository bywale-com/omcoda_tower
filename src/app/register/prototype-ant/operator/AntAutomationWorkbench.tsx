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
  useStore,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Dropdown, Empty, Form, Input, List, Select, Space, Table, Tabs, Tag, Typography, message, theme } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FilterOutlined,
  ForkOutlined,
  LogoutOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SisternodeOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { PlayCircleOutlined as ActionGlyph } from "@ant-design/icons";
import { useAutomations } from "../../../context/AutomationContext";
import {
  WORKFLOW_CONSTANT_PACK_OPTIONS,
  WORKFLOW_PALETTE_BLOCKS,
  appendNodeAfter,
  createNodeFromBlock,
  createNodeId,
  createTriggerNode,
  deleteWorkflowNode,
  insertNodeOnEdge,
  relayoutWorkflowNodes,
  workflowStatusLabel,
  type PaletteBlock,
  type WorkflowDefinition,
  type WorkflowNodeData,
  type WorkflowNodeType,
} from "../../../data/automationWorkflows";
import { newSwitchPath } from "../../../data/automationCompare";
import { formatGetSummary, previewGetWrites } from "../../../data/automationGet";
import { requiredDataKeys, writesFromHandle } from "../../../data/eventTestContract";
import { emptyRuleNodeConfig } from "../../../data/automationRules";
import { wirePorts } from "../../../wire/registry";
import type { EligibilityPipelineRow } from "../../../wire/machineTypes";
import { ActionAgentsModal, ActionInAppModal, ActionKindModal } from "./automationPlates/ActionPlateModals";
import { ContactPickModal } from "./ContactPickModal";
import { GetParametersPane } from "./automationPlates/GetParametersPane";
import { IfPlateModal } from "./automationPlates/IfPlateModal";
import { SwitchPlateModal } from "./automationPlates/SwitchPlateModal";
import { NodeInteriorModal } from "./automationPlates/NodeInteriorModal";
import { PlateInsertEdge } from "./automationPlates/PlateInsertEdge";
import { PLATE_NODE_TAG } from "./automationPlates/plateChrome";
import { RuleOutcomesPane } from "./automationPlates/RuleOutcomesPane";
import { CanvasOpsContext, switchableKind, useCanvasOps } from "./automationPlates/canvasOps";
import { TriggerSelectModal } from "./automationPlates/TriggerSelectModal";
import { TriggerTestDataPane } from "./automationPlates/TriggerTestDataPane";
import { triggerSelectEvent, WIRE_ADD_KINDS } from "../../../data/automationTriggerSelect";
import { WireAddMenu } from "./automationPlates/WireAddMenu";
import { loadPickerDirectory, type PickerFirm } from "./automationPlates/pickerDirectory";

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
    (data.triggerKind === "event" ? triggerSelectEvent(undefined, data.triggerEvent).label : null) ??
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
  const ops = useCanvasOps();
  const canSwitch = switchableKind(workflowType);
  const outgoing = useStore((state) => state.edges.filter((edge) => edge.source === id));
  const handleTaken = (handle: string) =>
    outgoing.some((edge) => edge.sourceHandle === handle || (!edge.sourceHandle && handle === "true"));
  const isIf = workflowType === "branch";
  const isSwitch = workflowType === "switch";
  const switchPaths = data.paths ?? [];
  const fallbackHandle = data.fallbackHandle ?? "fallback";
  return (
    <div
      style={{
        width: isSwitch ? Math.max(248, (switchPaths.length + 1) * 88) : 248,
        background: "#fff",
        borderRadius: 8,
        border: selected ? "2px solid #1677ff" : "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: 12,
        paddingBottom: isIf || isSwitch ? 44 : 12,
        position: "relative",
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
        <Space size={4}>
          <Tag color={data.configured ? "success" : "warning"} style={{ marginInlineEnd: 0 }}>
            {data.configured ? "configured" : "needs setup"}
          </Tag>
          {ops ? (
            <span className="nodrag nopan" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
            <Dropdown
              trigger={["click"]}
              menu={{
                triggerSubMenuAction: "click",
                items: [
                  {
                    key: "dup",
                    label: "Duplicate",
                  },
                  ...(isIf || isSwitch
                    ? []
                    : [
                        {
                          key: "add",
                          label: "Add node",
                          children: WIRE_ADD_KINDS.map((choice) => ({
                            key: `add:${choice.blockId}`,
                            label: choice.title,
                          })),
                        },
                      ]),
                  ...(canSwitch ? [{ key: "switch", label: "Switch" }] : []),
                  { key: "del", label: "Delete", danger: true },
                ],
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === "dup") ops.onDuplicate(id);
                  if (key === "switch") ops.onSwitch(id);
                  if (key === "del") ops.onDelete(id);
                  if (key.startsWith("add:")) ops.onAddAfter(id, key.slice(4));
                },
              }}
            >
              <button
                type="button"
                aria-label="Node options"
                className="nodrag nopan"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 6,
                  color: "#8c8c8c",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                <MoreOutlined />
              </button>
            </Dropdown>
            </span>
          ) : null}
        </Space>
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
      {isIf ? (
        <>
          <Handle type="source" position={Position.Bottom} id="true" style={{ left: "32%" }} />
          <Handle type="source" position={Position.Bottom} id="false" style={{ left: "68%" }} />
          <span style={{ position: "absolute", bottom: 6, left: "32%", transform: "translateX(-50%)", fontSize: 11, color: "#8c8c8c" }}>
            true
          </span>
          <span style={{ position: "absolute", bottom: 6, left: "68%", transform: "translateX(-50%)", fontSize: 11, color: "#8c8c8c" }}>
            false
          </span>
          {ops && !handleTaken("true") ? (
            <div style={{ position: "absolute", left: "32%", bottom: -14, transform: "translateX(-50%)", zIndex: 8 }}>
              <WireAddMenu onPick={(block) => ops.onAddAfter(id, block.id, "true")} />
            </div>
          ) : null}
          {ops && !handleTaken("false") ? (
            <div style={{ position: "absolute", left: "68%", bottom: -14, transform: "translateX(-50%)", zIndex: 8 }}>
              <WireAddMenu onPick={(block) => ops.onAddAfter(id, block.id, "false")} />
            </div>
          ) : null}
        </>
      ) : isSwitch ? (
        <>
          {[
            ...switchPaths.map((path) => ({
              id: path.sourceHandle,
              label: path.label || path.sourceHandle,
            })),
            { id: fallbackHandle, label: "fallback" },
          ].map((handle, index, list) => {
            const left = `${((index + 1) / (list.length + 1)) * 100}%`;
            return (
              <span key={handle.id}>
                <Handle type="source" position={Position.Bottom} id={handle.id} style={{ left }} />
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left,
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    color: "#8c8c8c",
                    maxWidth: 72,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {handle.label}
                </span>
                {ops && !handleTaken(handle.id) ? (
                  <div style={{ position: "absolute", left, bottom: -14, transform: "translateX(-50%)", zIndex: 8 }}>
                    <WireAddMenu onPick={(block) => ops.onAddAfter(id, block.id, handle.id)} />
                  </div>
                ) : null}
              </span>
            );
          })}
          <button
            type="button"
            className="nodrag nopan"
            onClick={(event) => {
              event.stopPropagation();
              const path = newSwitchPath();
              setNodes((current) =>
                current.map((node) =>
                  node.id === id
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          paths: [...(node.data.paths ?? []), path],
                          fallbackHandle: node.data.fallbackHandle ?? "fallback",
                          filterSummary: `${(node.data.paths ?? []).length + 1} paths`,
                        },
                      }
                    : node,
                ),
              );
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            style={{
              marginTop: 10,
              border: "1px dashed #d9d9d9",
              background: "#fff",
              borderRadius: 4,
              fontSize: 12,
              cursor: "pointer",
              width: "100%",
              padding: "4px 0",
              color: "#8c8c8c",
            }}
          >
            + Add path
          </button>
        </>
      ) : (
        <>
          <Handle type="source" position={Position.Bottom} />
          {ops && outgoing.length === 0 ? (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: -14,
                transform: "translateX(-50%)",
                zIndex: 8,
              }}
            >
              <WireAddMenu onPick={(block) => ops.onAddAfter(id, block.id)} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  trigger: AntWorkflowNode,
  constant: AntWorkflowNode,
  branch: AntWorkflowNode,
  switch: AntWorkflowNode,
  rule: AntWorkflowNode,
  action: AntWorkflowNode,
  exit: AntWorkflowNode,
  get: AntWorkflowNode,
};

const edgeTypes: EdgeTypes = {
  default: PlateInsertEdge,
  automationInsert: PlateInsertEdge,
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

const HANDLE_LATTICE_KEYS = [
  "listing",
  "requiredData",
  "headline",
  "pass",
  "nudge",
  "reactivation",
  "ok",
] as const;

function latticeFromStatus(st: object): Record<string, unknown> {
  const rec = st as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of HANDLE_LATTICE_KEYS) {
    if (rec[key] != null) out[key] = rec[key];
  }
  return out;
}

function paintRunOntoNodes(
  prev: WorkflowFlowNode[],
  currentEdges: Edge[],
  nodeStatus: Record<string, unknown>,
): WorkflowFlowNode[] {
  return prev.map((node) => {
    const st = nodeStatus[node.id];
    if (!st || typeof st !== "object") return node;
    const rec = st as { status?: string };
    const writes = writesFromHandle(st);
    const incoming = currentEdges.filter((edge) => edge.target === node.id);
    const inputWrites = incoming.flatMap((edge) => writesFromHandle(nodeStatus[edge.source]));
    const prevOut = (node.data.lastOutput ?? {}) as Record<string, unknown>;
    const lastOutput = {
      ...(node.type === "trigger" ? prevOut : {}),
      writes: writes.length ? writes : prevOut.writes,
      ...latticeFromStatus(st),
    };
    const runStatus =
      rec.status === "failed" ? "failed" : rec.status === "success" ? "success" : node.data.runStatus;
    return {
      ...node,
      data: {
        ...node.data,
        lastInput: incoming.length ? ({ writes: inputWrites } as WorkflowNodeData["lastInput"]) : node.data.lastInput,
        lastOutput: lastOutput as WorkflowNodeData["lastOutput"],
        runStatus,
      },
    };
  });
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
    startManualRun,
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
  const [firms, setFirms] = useState<PickerFirm[]>([]);
  const [triggerSelectId, setTriggerSelectId] = useState<string | null>(null);
  const listingIds = nodes.find((node) => node.type === "rule")?.data.ruleConfig?.listingFieldIds ?? [];
  const listingKeys = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "action") return [];
    const chip = (selectedNode.data.mappedSlots?.form ?? []).find(
      (row) => row.table === "missing_fact_signals" && !row.field,
    );
    if (!chip?.fromNodeId) return [];
    const source = nodes.find((node) => node.id === chip.fromNodeId);
    return requiredDataKeys(source?.data.lastOutput);
  }, [selectedNode, nodes]);
  const triggerSelectNode = triggerSelectId
    ? nodes.find((node) => node.id === triggerSelectId)
    : undefined;

  useEffect(() => {
    skipPersistRef.current = true;
    setNodes(workflow ? cloneNodes(workflow.nodes) : []);
    setEdges(workflow ? cloneEdges(workflow.edges) : []);
    setSelectedNodeId(null);
    setPlate(null);
    setInteriorOpen(false);
    setTriggerSelectId(null);
    setActiveTab("workflow");
  }, [workflow?.id, setEdges, setNodes]);

  useEffect(() => {
    if (!workflow) return;
    void wirePorts.machineApi.listWorkflows().then((rows) => {
      const row = rows.find((item) => item.id === workflow.id);
      setAudienceScope(row?.audience_scope === "select_from" ? "select_from" : "every_firm");
      setAudienceIds(row?.audience_contact_ids ?? []);
    }).catch(() => undefined);
    void loadPickerDirectory()
      .then(({ contacts, firms: nextFirms }) => {
        setBook(contacts);
        setFirms(nextFirms);
      })
      .catch(() => {
        setBook([]);
        setFirms([]);
      });
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

  useEffect(() => {
    const event = triggerSelectNode?.data.triggerEvent;
    if (!event) {
      setLocalOptions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        if (event === "fact_writebacks") {
          if (!cancelled) setLocalOptions(listingIds.map((id) => ({ value: id, label: id })));
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
        if (event === "contact_import") {
          if (!cancelled) setLocalOptions([]);
          return;
        }
        if (event === "contact_uploaded") {
          const kinds = await wirePorts.machineApi.listContactUploadKinds(
            triggerSelectNode?.data.localFirmId,
          );
          if (!cancelled) {
            setLocalOptions(kinds.kinds.map((kind) => ({ value: kind, label: kind })));
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
  }, [triggerSelectNode?.data.triggerEvent, triggerSelectNode?.data.localFirmId, listingIds.join("|")]);

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
      } else if (node.data.inAppAffordance || (node.data.actionType && node.data.actionType !== "call_agent")) {
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

  const insertKindAfter = (sourceId: string, blockId: string, sourceHandle?: string) => {
    const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === blockId);
    if (!block) return;
    const created = createNodeFromBlock(
      block,
      nodes.map((node) => node.id),
      { x: 320, y: 160 },
    );
    if (!created) return;
    const outgoing = sourceHandle
      ? edges.find((edge) => edge.source === sourceId && edge.sourceHandle === sourceHandle)
      : edges.find((edge) => edge.source === sourceId);
    const next = outgoing
      ? insertNodeOnEdge(nodes, edges, outgoing.id, created)
      : appendNodeAfter(nodes, edges, sourceId, created, sourceHandle);
    setNodes(relayoutWorkflowNodes(next.nodes) as WorkflowFlowNode[]);
    setEdges(next.edges);
    openNode(created as WorkflowFlowNode);
  };

  const canvasOps = {
    onDuplicate: (id: string) => {
      const node = nodes.find((item) => item.id === id);
      if (!node) return;
      const nid = createNodeId((node.type ?? "action") as WorkflowNodeType, nodes.map((item) => item.id));
      setNodes((current) => [
        ...current,
        {
          ...node,
          id: nid,
          selected: false,
          position: { x: node.position.x + 48, y: node.position.y + 72 },
        },
      ]);
    },
    onDelete: (id: string) => {
      const next = deleteWorkflowNode(nodes, edges, id);
      setNodes(next.nodes as WorkflowFlowNode[]);
      setEdges(next.edges);
      if (selectedNodeId === id) closeInterior();
      if (triggerSelectId === id) setTriggerSelectId(null);
    },
    onAddAfter: (id: string, blockId: string, sourceHandle?: string) =>
      insertKindAfter(id, blockId, sourceHandle),
    onInsertOnEdge: (edgeId: string, blockId: string) => {
      const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === blockId);
      if (!block) return;
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
    },
    onSwitch: (id: string) => {
      const node = nodes.find((item) => item.id === id);
      if (!node) return;
      if (node.type === "trigger") {
        setTriggerSelectId(id);
        return;
      }
      if (node.type === "action") {
        setSelectedNodeId(id);
        setInteriorOpen(true);
        setPlate("action-kind");
      }
    },
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
        setTriggerSelectId(next.id);
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
      title: "If",
      body: "Two wires — true / false.",
      icon: <ForkOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "condition-if");
        if (block) addBlock(block);
      },
    },
    {
      id: "switch",
      title: "Switch",
      body: "Many paths plus fallback.",
      icon: <SisternodeOutlined />,
      onClick: () => {
        const block = WORKFLOW_PALETTE_BLOCKS.find((row) => row.id === "condition-switch");
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

  const handleSave = async (opts?: { quiet?: boolean }) => {
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
      if (!opts?.quiet) {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1200);
        message.success("Saved workflow + triggers");
      }
      return true;
    } catch (err) {
      message.error(`Save failed: ${String(err)}`);
      return false;
    }
  };

  const handleProvideTriggerTestData = async () => {
    const target = selectedNode?.type === "trigger" ? selectedNode : triggerNode;
    if (!target) return;
    const eventName = String(target.data.triggerEvent ?? "").trim();
    const kind = String(target.data.triggerKind ?? "event");
    if (kind !== "event" || !eventName) {
      message.info("Provide test data on a table-change trigger");
      return;
    }
    try {
      const handle = await wirePorts.machineApi.getEventTestContract(eventName);
      if (!handle || !handle.writes.length) {
        message.info("This trigger has no test contract");
        return;
      }
      patchNodeData(setNodes, target.id, {
        lastOutput: {
          writes: handle.writes,
          door: handle.door,
          version: handle.version,
          eventName: handle.eventName,
          writeSet: handle.writeSet,
        } as WorkflowNodeData["lastOutput"],
      });
      message.success(handle.door === 1 ? "Filled from a live write" : "Filled Output with specimen writes");
    } catch (err) {
      message.error(`Provide test data failed: ${String(err)}`);
    }
  };

  const handleRun = async (untilNodeId?: string) => {
    const writes = writesFromHandle(triggerNode?.data.lastOutput);
    if (!writes.length) {
      message.info("Provide test data on the trigger first.");
      return;
    }
    try {
      const saved = await handleSave({ quiet: true });
      if (!saved) return;
      const started = await startManualRun(workflow.id, {
        payload: { writes },
        untilNodeId,
      });
      if (!started) {
        message.error("Run failed");
        return;
      }
      if (started.nodeStatus) {
        setNodes((prev) => paintRunOntoNodes(prev, edges, started.nodeStatus as Record<string, unknown>));
      }
      if (started.status === "failed") {
        message.error(started.error ?? "Run stopped");
        return;
      }
      message.success(untilNodeId ? "Ran to here" : "Run finished");
    } catch (err) {
      message.error(`Run failed: ${String(err)}`);
    }
  };

  const handleLaunch = async () => {
    try {
      const saved = await handleSave({ quiet: true });
      if (!saved) return;
      await wirePorts.machineApi.activateWorkflow(workflow.id);
      updateWorkflow(workflow.id, { status: "active" });
      message.success("Armed — this event will run the workflow");
    } catch (err) {
      message.error(`Launch failed: ${String(err)}`);
    }
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
            <Button icon={<PlayCircleOutlined />} onClick={() => void handleRun()}>
              Run
            </Button>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => void handleLaunch()}>
              Launch
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
                  <CanvasOpsContext.Provider value={canvasOps}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(event, node) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest(".nodrag")) return;
                      openNode(node);
                    }}
                    deleteKeyCode={["Backspace", "Delete"]}
                    onNodesDelete={(deleted) => {
                      const ids = new Set(deleted.map((node) => node.id));
                      setEdges((current) =>
                        current.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
                      );
                      if (selectedNodeId && ids.has(selectedNodeId)) {
                        closeInterior();
                      }
                      if (triggerSelectId && ids.has(triggerSelectId)) {
                        setTriggerSelectId(null);
                      }
                    }}
                    fitView
                  >
                    <Background />
                    <MiniMap pannable zoomable />
                    <Controls />
                  </ReactFlow>
                  </CanvasOpsContext.Provider>
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
          selectedNode?.type === "trigger" ? (
            <TriggerTestDataPane
              disabled={!String(selectedNode.data.triggerEvent ?? "").trim()}
              filledCount={writesFromHandle(selectedNode.data.lastOutput).length}
              onProvide={() => void handleProvideTriggerTestData()}
            />
          ) : selectedNode?.type === "get" ? (
            <GetParametersPane
              data={selectedNode.data}
              book={book}
              firms={firms}
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
            <RuleOutcomesPane
              config={selectedNode.data.ruleConfig ?? emptyRuleNodeConfig()}
              mappedSlots={selectedNode.data.mappedSlots}
              onChange={({ ruleConfig, mappedSlots }) =>
                patchNodeData(setNodes, selectedNode.id, {
                  ruleConfig,
                  mappedSlots,
                  configured: true,
                  ruleSummary: selectedNode.data.label,
                })
              }
            />
          ) : selectedNode?.type === "constant" ? (
            <Form layout="vertical">
              <NodeConfigFields
                node={selectedNode}
                onPatch={(patch) => patchNodeData(setNodes, selectedNode.id, patch)}
              />
            </Form>
          ) : selectedNode?.type === "branch" ? (
            <IfPlateModal
              embed
              data={selectedNode.data}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
              }}
            />
          ) : selectedNode?.type === "switch" ? (
            <SwitchPlateModal
              embed
              data={selectedNode.data}
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
                const keep = new Set(
                  (patch.paths ?? selectedNode.data.paths ?? []).map((path) => path.sourceHandle),
                );
                keep.add(String(patch.fallbackHandle ?? selectedNode.data.fallbackHandle ?? "fallback"));
                setEdges((current) =>
                  current.filter(
                    (edge) =>
                      edge.source !== selectedNode.id ||
                      !edge.sourceHandle ||
                      keep.has(edge.sourceHandle),
                  ),
                );
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
              listingKeys={listingKeys}
              onCancel={closeInterior}
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
              onRegisterSave={(fn) => {
                saveRef.current = fn;
              }}
              onSave={(patch) => {
                patchNodeData(setNodes, selectedNode.id, patch);
              }}
            />
          ) : null
        }
        onCancel={closeInterior}
        extraFooter={
          selectedNode ? (
            <Button onClick={() => void handleRun(selectedNode.id)}>Run to here</Button>
          ) : null
        }
        onSave={(label) => {
          if (!selectedNode) return;
          if (label !== selectedNode.data.label) {
            patchNodeData(setNodes, selectedNode.id, { label });
          }
          if (selectedNode.type === "action" && plate === "action-kind") {
            saveRef.current?.();
            return;
          }
          if (selectedNode.type === "action" && plate === "action-inapp") {
            saveRef.current?.();
            closeInterior();
            return;
          }
          if (selectedNode.type === "action" || selectedNode.type === "branch" || selectedNode.type === "switch") {
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
      {triggerSelectNode ? (
        <TriggerSelectModal
          open
          data={triggerSelectNode.data}
          book={book}
          firms={firms}
          instanceOptions={localOptions}
          onClose={() => setTriggerSelectId(null)}
          onPatch={(patch) => patchNodeData(setNodes, triggerSelectNode.id, patch)}
        />
      ) : null}
    </div>
  );
}
