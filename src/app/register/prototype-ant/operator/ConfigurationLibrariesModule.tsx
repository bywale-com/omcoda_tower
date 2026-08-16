/**
 * Configuration libraries — Ant composition of Evaluation packs, Automation workflows, and Agents.
 * Automations / Agents use full workbench regions, not table-only Drawer substitutes.
 * Evaluation editor pins reference_version + ruleset and toggles modular rule enables.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Menu,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
  message,
  theme,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { AutomationProvider, useAutomations } from "../../../context/AutomationContext";
import {
  AGENT_TEMPLATE_BINDING,
  getAllAgentDefinitions,
  type AgentDefinition,
} from "../../../data/agentDefinitions";
import type { WorkflowDefinition } from "../../../data/automationWorkflows";
import type {
  EligibilityPathwayRow,
  FieldClassRoutingRow,
  MotionPrecedenceRow,
  ReachabilityCheckRow,
  ReferenceVersionRow,
} from "../../../wire/machineTypes";
import { wirePorts } from "../../../wire/registry";
import { Hint, ModulePage, Surface } from "../chrome";
import { AntAgentWorkbench } from "./AntAgentWorkbench";
import { AgentsSettingsModal } from "./AgentsSettingsModal";
import { AntAutomationWorkbench } from "./AntAutomationWorkbench";
import {
  CONFIG_LIB_SUBS,
  type ConfigLibSub,
  type ConfigPack,
  type EvalPackPin,
  type PackKind,
  packLabel,
  publishedPacks,
} from "./operatorConfigLibraries";
import { ensurePackInCatalog, publishPackInCatalog, usePackCatalog } from "./packCatalogStore";
import { StatusTag } from "./operatorAntTags";

const EDITOR_SURFACE: Record<ConfigLibSub, string> = {
  "Evaluation packs": "Evaluation pack editor",
  "Automation workflows": "Workflow canvas",
  "Engagement templates": "Agent / sequence editor",
};

const INITIAL_WORKFLOW_ID = "wf-eligibility-reactivation";
const INITIAL_AGENT_ID = getAllAgentDefinitions().find((agent) => agent.stepCount > 0)?.id ?? "agent-nudge";

function publishStatus(pack: ConfigPack | null) {
  if (pack?.status === "Published" && pack.versionId) {
    return <StatusTag label={`Published · ${pack.versionId}`} color="success" />;
  }
  return <StatusTag label="Draft" color="warning" />;
}

function LibraryCatalogItem({
  title,
  description,
  active,
  status,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  status?: ReactNode;
  onClick: () => void;
}) {
  return (
    <List.Item
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: 10,
        borderRadius: 8,
        border: active ? "1px solid #1677ff" : "1px solid transparent",
      }}
    >
      <List.Item.Meta
        title={
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Typography.Text strong>{title}</Typography.Text>
            {status ? <span data-register-surface="Published / Draft status">{status}</span> : null}
          </Space>
        }
        description={<Typography.Text type="secondary">{description}</Typography.Text>}
      />
    </List.Item>
  );
}

function CatalogShell({
  label,
  title,
  actions,
  children,
}: {
  label: ConfigLibSub;
  title: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  const { token } = theme.useToken();
  return (
    <Surface
      label={label}
      style={{
        width: 300,
        flexShrink: 0,
        borderRight: `1px solid ${token.colorSplit}`,
        background: token.colorBgLayout,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ padding: 12, borderBottom: `1px solid ${token.colorSplit}`, flexShrink: 0 }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }} align="start">
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{title}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Catalog
            </Typography.Text>
          </Space>
          {actions}
        </Space>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 8 }}>{children}</div>
    </Surface>
  );
}

function RuleSetValueList<T extends { id: string; label: string; enabled: boolean; set_value: string | null }>({
  title,
  hint,
  rows,
  savingId,
  onToggle,
  onSetValueChange,
  onSetValueSave,
  setValuePlaceholder = "set_value / params",
}: {
  title: string;
  hint: string;
  rows: T[];
  savingId: string | null;
  onToggle: (id: string, enabled: boolean) => void;
  onSetValueChange: (id: string, setValue: string | null) => void;
  onSetValueSave: (id: string, setValue: string | null) => void;
  setValuePlaceholder?: string;
}) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Text strong>{title}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
        {hint}
      </Typography.Paragraph>
      <List
        size="small"
        dataSource={rows}
        locale={{ emptyText: "No rows loaded." }}
        renderItem={(row) => (
          <List.Item
            key={row.id}
            style={{
              border: `1px solid ${token.colorSplit}`,
              borderRadius: 8,
              marginBottom: 6,
              padding: "8px 12px",
            }}
          >
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
                <Typography.Text>{row.label}</Typography.Text>
                <Switch
                  checked={row.enabled}
                  loading={savingId === row.id}
                  onChange={(enabled) => onToggle(row.id, enabled)}
                />
              </Space>
              <Input
                size="small"
                value={row.set_value ?? ""}
                placeholder={setValuePlaceholder}
                disabled={savingId === row.id}
                onChange={(event) => onSetValueChange(row.id, event.target.value || null)}
                onBlur={(event) => onSetValueSave(row.id, event.target.value || null)}
              />
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}

function RuleEnableList<T extends { id: string; label: string; enabled: boolean }>({
  title,
  hint,
  rows,
  savingId,
  onToggle,
  onMove,
}: {
  title: string;
  hint: string;
  rows: T[];
  savingId: string | null;
  onToggle: (id: string, enabled: boolean) => void;
  /** When set, Up/Down modulates modular `ord` for this rule table. */
  onMove?: (fromIndex: number, toIndex: number) => void;
}) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginTop: 16 }} data-register-surface={title}>
      <Typography.Text strong>{title}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
        {hint}
      </Typography.Paragraph>
      <List
        size="small"
        dataSource={rows}
        locale={{ emptyText: "No rows loaded." }}
        renderItem={(row, index) => (
          <List.Item
            key={row.id}
            style={{
              border: `1px solid ${token.colorSplit}`,
              borderRadius: 8,
              marginBottom: 6,
              padding: "8px 12px",
            }}
            actions={[
              ...(onMove
                ? [
                    <Button
                      key="up"
                      size="small"
                      disabled={index === 0 || savingId === row.id}
                      aria-label={`Move ${row.label} up`}
                      onClick={() => onMove(index, index - 1)}
                    >
                      ↑
                    </Button>,
                    <Button
                      key="down"
                      size="small"
                      disabled={index === rows.length - 1 || savingId === row.id}
                      aria-label={`Move ${row.label} down`}
                      onClick={() => onMove(index, index + 1)}
                    >
                      ↓
                    </Button>,
                  ]
                : []),
              <Switch
                key="en"
                checked={row.enabled}
                loading={savingId === row.id}
                onChange={(enabled) => onToggle(row.id, enabled)}
              />,
            ]}
          >
            <Typography.Text>{row.label}</Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );
}

function EvaluationPacksEditor({
  packs,
  selected,
  editorNote,
  pin,
  onSelect,
  onRename,
  onNote,
  onPinChange,
  onNew,
}: {
  packs: ConfigPack[];
  selected: ConfigPack | null;
  editorNote: string;
  pin: EvalPackPin;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onNote: (note: string) => void;
  onPinChange: (pin: EvalPackPin) => void;
  onNew: () => void;
}) {
  const { token } = theme.useToken();
  const [pathways, setPathways] = useState<EligibilityPathwayRow[]>([]);
  const [motion, setMotion] = useState<MotionPrecedenceRow[]>([]);
  const [fieldClass, setFieldClass] = useState<FieldClassRoutingRow[]>([]);
  const [reachability, setReachability] = useState<ReachabilityCheckRow[]>([]);
  const [refs, setRefs] = useState<ReferenceVersionRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [p, m, f, r, rv] = await Promise.all([
          wirePorts.machineApi.listEligibilityPathways(),
          wirePorts.machineApi.listMotionPrecedence(),
          wirePorts.machineApi.listFieldClassRouting(),
          wirePorts.machineApi.listReachabilityChecks(),
          wirePorts.machineApi.listReferenceVersions(),
        ]);
        if (!alive) return;
        setPathways(p);
        setMotion(m);
        setFieldClass(f);
        setReachability(r);
        setRefs(rv);
      } catch (err) {
        message.error(`Evaluation rules load failed: ${String(err)}`);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    void wirePorts.machineApi.getEvaluationPin(selected.id).then((stored) => {
      if (stored.referenceVersionId && stored.rulesetId) {
        onPinChange({
          referenceVersionId: stored.referenceVersionId,
          rulesetId: stored.rulesetId,
        });
      } else if (selected.pin) {
        onPinChange(selected.pin);
      }
    });
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePathway = async (id: string, enabled: boolean) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertEligibilityPathway(id, { enabled });
      setPathways((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Pathway enable failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const toggleMotion = async (id: string, enabled: boolean) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertMotionPrecedence(id, { enabled });
      setMotion((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Motion enable failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const moveMotion = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= motion.length) return;
    const next = [...motion];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    const reordered = next.map((row, index) => ({ ...row, ord: index }));
    setMotion(reordered);
    setSavingId(moved.id);
    try {
      const saved = await Promise.all(
        reordered.map((row) =>
          wirePorts.machineApi.upsertMotionPrecedence(row.id, { ord: row.ord }),
        ),
      );
      setMotion(saved.sort((a, b) => a.ord - b.ord));
      message.success(
        `rule_motion_precedence · ${saved
          .sort((a, b) => a.ord - b.ord)
          .map((r) => r.label)
          .join(" → ")}`,
      );
    } catch (err) {
      message.error(`Motion reorder failed: ${String(err)}`);
      try {
        setMotion(await wirePorts.machineApi.listMotionPrecedence());
      } catch {
        /* keep optimistic */
      }
    } finally {
      setSavingId(null);
    }
  };

  const toggleField = async (id: string, enabled: boolean) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertFieldClassRouting(id, { enabled });
      setFieldClass((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Field-class enable failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const patchFieldSetValue = async (id: string, setValue: string | null) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertFieldClassRouting(id, { setValue });
      setFieldClass((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Field-class set_value save failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const toggleReachability = async (id: string, enabled: boolean) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertReachabilityCheck(id, { enabled });
      setReachability((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Reachability enable failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const patchReachabilitySetValue = async (id: string, setValue: string | null) => {
    setSavingId(id);
    try {
      const updated = await wirePorts.machineApi.upsertReachabilityCheck(id, { setValue });
      setReachability((prev) => prev.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      message.error(`Reachability set_value save failed: ${String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      <CatalogShell
        label="Evaluation packs"
        title="Evaluation packs"
        actions={
          <Button size="small" data-register-surface="Evaluation packs" onClick={onNew}>
            New pack
          </Button>
        }
      >
        <List
          dataSource={packs}
          renderItem={(pack) => (
            <LibraryCatalogItem
              key={pack.id}
              title={pack.name}
              description={pack.summary}
              active={pack.id === selected?.id}
              status={publishStatus(pack)}
              onClick={() => onSelect(pack.id)}
            />
          )}
        />
      </CatalogShell>
      <Surface
        label="Evaluation pack editor"
        style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", padding: 18 }}
      >
        <Card
          title="Evaluation pack editor"
          extra={<span data-register-surface="Published / Draft status">{publishStatus(selected)}</span>}
          style={{ minHeight: "100%", background: token.colorBgContainer }}
        >
          {selected ? (
            <>
              <Form layout="vertical">
                <Form.Item label="Pack name">
                  <Input value={selected.name} onChange={(event) => onRename(selected.id, event.target.value)} />
                </Form.Item>
                <Form.Item label="Open-box rules / analysis">
                  <Input.TextArea
                    rows={3}
                    value={editorNote || selected.summary}
                    onChange={(event) => onNote(event.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Pin · reference_version">
                  <Select
                    style={{ width: "100%" }}
                    value={pin.referenceVersionId || undefined}
                    placeholder={loading ? "Loading…" : "Select reference version"}
                    options={refs.map((row) => ({
                      value: row.id,
                      label: `${row.id} · ${row.key} v${row.version}`,
                    }))}
                    onChange={(value) =>
                      onPinChange({ ...pin, referenceVersionId: value })
                    }
                  />
                </Form.Item>
                <Form.Item label="Pin · ruleset id">
                  <Input
                    value={pin.rulesetId}
                    placeholder={`ruleset.${selected.id}`}
                    onChange={(event) =>
                      onPinChange({ ...pin, rulesetId: event.target.value })
                    }
                  />
                </Form.Item>
              </Form>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Publish stores pin in pack catalog + <code>constants_packs</code> id{" "}
                <code>eval.pin.{"{packId}"}</code>. Enable toggles write modular rule tables the worker already reads.
              </Typography.Text>
              <RuleEnableList
                title="Eligibility pathways"
                hint="rule_eligibility_pathway — enable rows for this pack’s open-box pathway law."
                rows={pathways}
                savingId={savingId}
                onToggle={(id, enabled) => void togglePathway(id, enabled)}
              />
              <RuleEnableList
                title="Motion precedence"
                hint="rule_motion_precedence — enable + reorder which motion wins when signals compete."
                rows={motion}
                savingId={savingId}
                onToggle={(id, enabled) => void toggleMotion(id, enabled)}
                onMove={(from, to) => void moveMotion(from, to)}
              />
              <RuleSetValueList
                title="Field-class routing"
                hint="rule_field_class_routing — where self-reported facts land; edit set_value per row."
                rows={fieldClass}
                savingId={savingId}
                onToggle={(id, enabled) => void toggleField(id, enabled)}
                onSetValueChange={(id, setValue) =>
                  setFieldClass((prev) =>
                    prev.map((row) => (row.id === id ? { ...row, set_value: setValue } : row)),
                  )
                }
                onSetValueSave={(id, setValue) => void patchFieldSetValue(id, setValue)}
              />
              <RuleSetValueList
                title="Reachability checks"
                hint="rule_reachability_check — pre-flight channel/consent gates; optional set_value / params."
                rows={reachability}
                savingId={savingId}
                setValuePlaceholder="set_value / check params"
                onToggle={(id, enabled) => void toggleReachability(id, enabled)}
                onSetValueChange={(id, setValue) =>
                  setReachability((prev) =>
                    prev.map((row) => (row.id === id ? { ...row, set_value: setValue } : row)),
                  )
                }
                onSetValueSave={(id, setValue) => void patchReachabilitySetValue(id, setValue)}
              />
            </>
          ) : (
            <Typography.Text type="secondary">Select a pack or create a new one.</Typography.Text>
          )}
        </Card>
      </Surface>
    </div>
  );
}

function AutomationLibrary({
  packs,
  selectedId,
  onSelect,
  onCreatePack,
}: {
  packs: ConfigPack[];
  selectedId: string;
  onSelect: (workflow: WorkflowDefinition) => void;
  onCreatePack: (id: string, name: string, summary: string) => void;
}) {
  const { workflows, createAutomation } = useAutomations();
  const selectedWorkflow = workflows.find((workflow) => workflow.id === selectedId) ?? workflows[0];

  useEffect(() => {
    if (selectedWorkflow) {
      onCreatePack(
        selectedWorkflow.id,
        selectedWorkflow.name,
        `${selectedWorkflow.nodes.length} nodes · ${selectedWorkflow.target}`,
      );
    }
  }, [onCreatePack, selectedWorkflow]);

  if (!selectedWorkflow) {
    return <Typography.Text type="secondary">No workflows available.</Typography.Text>;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      <CatalogShell
        label="Automation workflows"
        title="Automations"
        actions={
          <Button
            size="small"
            onClick={() => {
              const workflow = createAutomation();
              onCreatePack(workflow.id, workflow.name, "Draft workflow — publish to appear in Bind dropdowns");
              onSelect(workflow);
            }}
          >
            New workflow
          </Button>
        }
      >
        <List
          dataSource={workflows}
          renderItem={(workflow) => {
            const pack = packs.find((item) => item.id === workflow.id) ?? null;
            return (
              <LibraryCatalogItem
                key={workflow.id}
                title={workflow.name}
                description={`${workflow.nodes.length} nodes · target ${workflow.target}`}
                active={workflow.id === selectedWorkflow.id}
                status={publishStatus(pack)}
                onClick={() => onSelect(workflow)}
              />
            );
          }}
        />
      </CatalogShell>
      <Surface
        label="Workflow canvas"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AntAutomationWorkbench workflowId={selectedWorkflow.id} />
      </Surface>
    </div>
  );
}

function AgentLibrary({
  packs,
  selectedId,
  onSelect,
  onCreatePack,
}: {
  packs: ConfigPack[];
  selectedId: string;
  onSelect: (agent: AgentDefinition) => void;
  onCreatePack: (id: string, name: string, summary: string) => void;
}) {
  const [agents, setAgents] = useState<AgentDefinition[]>(() => getAllAgentDefinitions());
  const [agentsSettingsOpen, setAgentsSettingsOpen] = useState(false);
  const selectedAgent = agents.find((agent) => agent.id === selectedId) ?? agents[0];

  useEffect(() => {
    if (selectedAgent) {
      onCreatePack(selectedAgent.id, selectedAgent.name, `${selectedAgent.stepCount} configured steps`);
    }
  }, [onCreatePack, selectedAgent]);

  if (!selectedAgent) {
    return <Typography.Text type="secondary">No agents available.</Typography.Text>;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      <CatalogShell
        label="Engagement templates"
        title="Agents"
        actions={
          <Space direction="vertical" size={8} align="end">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                const id = `agent-new-${Date.now()}`;
                const agent: AgentDefinition = {
                  id,
                  name: "Untitled template",
                  status: "draft",
                  active: false,
                  starred: false,
                  stepCount: 0,
                  linkedAutomationIds: [],
                  updatedAt: new Date().toISOString(),
                };
                setAgents((prev) => [...prev, agent]);
                onCreatePack(id, agent.name, "Draft template — publish to appear in Bind dropdowns");
                onSelect(agent);
              }}
            >
              New template
            </Button>
            <Button size="small" icon={<SettingOutlined />} onClick={() => setAgentsSettingsOpen(true)}>
              Agents settings
            </Button>
          </Space>
        }
      >
        <List
          dataSource={agents}
          renderItem={(agent) => {
            const pack = packs.find((item) => item.id === agent.id) ?? null;
            return (
              <LibraryCatalogItem
                key={agent.id}
                title={agent.name}
                description={`${agent.stepCount} steps · ${agent.status}`}
                active={agent.id === selectedAgent.id}
                status={publishStatus(pack)}
                onClick={() => onSelect(agent)}
              />
            );
          }}
        />
      </CatalogShell>
      <Surface
        label="Agent / sequence editor"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AntAgentWorkbench agent={selectedAgent} />
      </Surface>
      <AgentsSettingsModal open={agentsSettingsOpen} onClose={() => setAgentsSettingsOpen(false)} />
    </div>
  );
}

export function ConfigurationLibrariesModule({
  sub,
  onSubChange,
}: {
  sub: ConfigLibSub;
  onSubChange: (sub: ConfigLibSub) => void;
}) {
  const { token } = theme.useToken();
  const subMeta = CONFIG_LIB_SUBS.find((item) => item.id === sub)!;
  const [packs, setPacks] = usePackCatalog();
  const [selectedEvalId, setSelectedEvalId] = useState("eval-alg-v2");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(INITIAL_WORKFLOW_ID);
  const [selectedAgentId, setSelectedAgentId] = useState(INITIAL_AGENT_ID);
  const [editorNote, setEditorNote] = useState("");
  const [evalPin, setEvalPin] = useState<EvalPackPin>({
    referenceVersionId: "ref.crs.cutoff.v1",
    rulesetId: "ruleset.eval-alg-v2",
  });
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [publishing, setPublishing] = useState(false);

  const catalog = useMemo(() => packs.filter((pack) => pack.kind === subMeta.kind), [packs, subMeta.kind]);
  const publishedCatalog = useMemo(() => publishedPacks(subMeta.kind, packs), [packs, subMeta.kind]);
  const activeAssetId =
    sub === "Evaluation packs" ? selectedEvalId : sub === "Automation workflows" ? selectedWorkflowId : selectedAgentId;
  const selectedPack = packs.find((pack) => pack.id === activeAssetId && pack.kind === subMeta.kind) ?? null;

  useEffect(() => {
    if (sub !== "Evaluation packs") return;
    const first = catalog[0];
    if (!catalog.some((pack) => pack.id === selectedEvalId)) {
      setSelectedEvalId(first?.id ?? "");
    }
  }, [catalog, selectedEvalId, sub]);

  useEffect(() => {
    if (!selectedPack || selectedPack.kind !== "evaluation") return;
    setEvalPin(
      selectedPack.pin ?? {
        referenceVersionId: "ref.crs.cutoff.v1",
        rulesetId: `ruleset.${selectedPack.id}`,
      },
    );
  }, [selectedPack?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ensurePack = useCallback((kind: PackKind, id: string, name: string, summary: string, extra?: Partial<ConfigPack>) => {
    ensurePackInCatalog(kind, id, name, summary, extra);
  }, []);

  const onNewEvaluationPack = () => {
    const id = `${subMeta.kind}-new-${Date.now()}`;
    const pack: ConfigPack = {
      id,
      kind: "evaluation",
      name: "Untitled evaluation",
      versionId: null,
      status: "Draft",
      summary: "Draft — publish to appear in Firm operations bind dropdowns",
      pin: { referenceVersionId: "ref.crs.cutoff.v1", rulesetId: `ruleset.${id}` },
    };
    setPacks((prev) => [...prev, pack]);
    setSelectedEvalId(id);
    setEditorNote("");
    setEvalPin(pack.pin!);
  };

  const onPublish = async () => {
    if (!selectedPack) return;
    setPublishing(true);
    try {
      if (selectedPack.kind === "evaluation") {
        if (!evalPin.referenceVersionId || !evalPin.rulesetId) {
          message.warning("Pin both reference_version and ruleset id before publish.");
          return;
        }
        await wirePorts.machineApi.putEvaluationPin(selectedPack.id, evalPin);
        publishPackInCatalog(selectedPack.id, "evaluation", {
          summary: editorNote || selectedPack.summary,
          pin: evalPin,
        });
        message.success(`Published evaluation pin → eval.pin.${selectedPack.id}`);
      } else {
        publishPackInCatalog(selectedPack.id, selectedPack.kind);
        message.success(`Published ${selectedPack.kind} · Bind dropdowns updated`);
      }
    } catch (err) {
      message.error(`Publish failed: ${String(err)}`);
    } finally {
      setPublishing(false);
    }
  };

  const openCompare = () => {
    const a = publishedCatalog[0]?.id ?? "";
    const b = publishedCatalog[1]?.id ?? publishedCatalog[0]?.id ?? "";
    setCompareA(a);
    setCompareB(b);
    setCompareOpen(true);
  };

  const packA = packs.find((pack) => pack.id === compareA && pack.kind === subMeta.kind);
  const packB = packs.find((pack) => pack.id === compareB && pack.kind === subMeta.kind);

  return (
    <ModulePage title="Configuration libraries" surface="Configuration libraries" overflow="hidden">
      <div
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          border: `1px solid ${token.colorSplit}`,
          borderRadius: 8,
          overflow: "hidden",
          background: token.colorBgContainer,
          flex: 1,
        }}
      >
        <Surface
          label="Libraries nav"
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: `1px solid ${token.colorSplit}`,
            background: token.colorBgLayout,
            padding: 8,
          }}
        >
          <Typography.Text strong style={{ display: "block", padding: "8px 12px" }}>
            Libraries
          </Typography.Text>
          <Menu
            mode="inline"
            selectedKeys={[sub]}
            onClick={({ key }) => onSubChange(key as ConfigLibSub)}
            style={{ borderInlineEnd: 0, background: "transparent" }}
            items={CONFIG_LIB_SUBS.map((item) => ({ key: item.id, label: item.navLabel }))}
          />
        </Surface>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flexShrink: 0,
              padding: "10px 14px",
              borderBottom: `1px solid ${token.colorSplit}`,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Space direction="vertical" size={0}>
              <Typography.Text strong>{sub}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {EDITOR_SURFACE[sub]}
              </Typography.Text>
            </Space>
            <Space wrap>
              <Button data-register-surface="Compare versions" disabled={publishedCatalog.length < 1} onClick={openCompare}>
                Compare versions
              </Button>
              <Button
                data-register-surface="Publish version"
                type="primary"
                disabled={!selectedPack}
                loading={publishing}
                onClick={() => void onPublish()}
              >
                Publish version
              </Button>
              {selectedPack?.versionId ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Current · {packLabel(selectedPack)}
                </Typography.Text>
              ) : (
                <Hint>Primary · draft rows omitted from Bind dropdowns</Hint>
              )}
            </Space>
          </div>

          <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex" }}>
            {sub === "Evaluation packs" ? (
              <EvaluationPacksEditor
                packs={catalog}
                selected={selectedPack}
                editorNote={editorNote}
                pin={evalPin}
                onSelect={(id) => {
                  setSelectedEvalId(id);
                  setEditorNote("");
                }}
                onRename={(id, name) =>
                  setPacks((prev) => prev.map((pack) => (pack.id === id ? { ...pack, name } : pack)))
                }
                onNote={setEditorNote}
                onPinChange={setEvalPin}
                onNew={onNewEvaluationPack}
              />
            ) : sub === "Automation workflows" ? (
              <AutomationProvider>
                <AutomationLibrary
                  packs={catalog}
                  selectedId={selectedWorkflowId}
                  onSelect={(workflow) => {
                    ensurePack("automation", workflow.id, workflow.name, `${workflow.nodes.length} nodes · ${workflow.target}`);
                    setSelectedWorkflowId(workflow.id);
                  }}
                  onCreatePack={(id, name, summary) => ensurePack("automation", id, name, summary)}
                />
              </AutomationProvider>
            ) : (
              <AgentLibrary
                packs={catalog}
                selectedId={selectedAgentId}
                onSelect={(agent) => {
                  const binding = AGENT_TEMPLATE_BINDING[agent.id];
                  ensurePack("engagement", agent.id, agent.name, `${agent.stepCount} configured steps`, {
                    templateId: binding?.templateId,
                    sequenceClass: binding?.sequenceClass,
                  });
                  setSelectedAgentId(agent.id);
                }}
                onCreatePack={(id, name, summary) => {
                  const binding = AGENT_TEMPLATE_BINDING[id];
                  ensurePack("engagement", id, name, summary, {
                    templateId: binding?.templateId,
                    sequenceClass: binding?.sequenceClass,
                  });
                }}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Compare versions"
        open={compareOpen}
        onCancel={() => setCompareOpen(false)}
        footer={<Button onClick={() => setCompareOpen(false)}>Close</Button>}
        width={620}
      >
        <Surface label="Compare versions">
          <Typography.Paragraph type="secondary">
            View-only diff of published {sub.toLowerCase()} — does not Bind.
          </Typography.Paragraph>
          <Space style={{ width: "100%", marginBottom: 12 }} wrap>
            <Select
              value={compareA}
              onChange={setCompareA}
              style={{ width: 250 }}
              options={publishedCatalog.map((pack) => ({ value: pack.id, label: packLabel(pack) }))}
            />
            <Select
              value={compareB}
              onChange={setCompareB}
              style={{ width: 250 }}
              options={publishedCatalog.map((pack) => ({ value: pack.id, label: packLabel(pack) }))}
            />
          </Space>
          <Space wrap>
            {[packA, packB].map((pack, index) => (
              <Card key={pack?.id ?? index} size="small" title={pack ? packLabel(pack) : "-"} style={{ width: 280 }}>
                <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
                  {pack?.summary ?? "Select a published version"}
                </Typography.Paragraph>
              </Card>
            ))}
          </Space>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
