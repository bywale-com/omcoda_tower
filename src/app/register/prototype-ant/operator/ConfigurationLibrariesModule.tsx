/**
 * Configuration libraries — Ant composition of Evaluation packs, Automation workflows, and Agents.
 * Automations / Agents use full workbench regions, not table-only Drawer substitutes.
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
  Tag,
  Typography,
  theme,
} from "antd";
import { AutomationProvider, useAutomations } from "../../../context/AutomationContext";
import { getAllAgentDefinitions, type AgentDefinition } from "../../../data/agentDefinitions";
import type { WorkflowDefinition } from "../../../data/automationWorkflows";
import { Hint, ModulePage, Surface } from "../chrome";
import { AntAgentWorkbench } from "./AntAgentWorkbench";
import { AntAutomationWorkbench } from "./AntAutomationWorkbench";
import {
  CONFIG_LIB_SUBS,
  type ConfigLibSub,
  type ConfigPack,
  type PackKind,
  nextVersionId,
  packLabel,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";
import { StatusTag } from "./operatorAntTags";

const EDITOR_SURFACE: Record<ConfigLibSub, string> = {
  "Evaluation packs": "Evaluation pack editor",
  "Automation workflows": "Workflow canvas",
  "Engagement templates": "Agent / sequence editor",
};

const INITIAL_WORKFLOW_ID = "auto-welcome";
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

function EvaluationPacksEditor({
  packs,
  selected,
  editorNote,
  onSelect,
  onRename,
  onNote,
  onNew,
}: {
  packs: ConfigPack[];
  selected: ConfigPack | null;
  editorNote: string;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onNote: (note: string) => void;
  onNew: () => void;
}) {
  const { token } = theme.useToken();
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
                    rows={5}
                    value={editorNote || selected.summary}
                    onChange={(event) => onNote(event.target.value)}
                  />
                </Form.Item>
              </Form>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Scores against published Reference data tables — no firm picker on this module.
              </Typography.Text>
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
      <Surface label="Workflow canvas" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
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
          <Button
            size="small"
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
      <Surface label="Agent / sequence editor" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <AntAgentWorkbench agent={selectedAgent} />
      </Surface>
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
  const [packs, setPacks] = useState<ConfigPack[]>(seedConfigPacks);
  const [selectedEvalId, setSelectedEvalId] = useState("eval-alg-v2");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(INITIAL_WORKFLOW_ID);
  const [selectedAgentId, setSelectedAgentId] = useState(INITIAL_AGENT_ID);
  const [editorNote, setEditorNote] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

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

  const ensurePack = useCallback((kind: PackKind, id: string, name: string, summary: string) => {
    setPacks((prev) => {
      if (prev.some((pack) => pack.id === id && pack.kind === kind)) {
        const existing = prev.find((pack) => pack.id === id && pack.kind === kind);
        if (existing?.name === name && existing.summary === summary) return prev;
        return prev.map((pack) =>
          pack.id === id && pack.kind === kind ? { ...pack, name, summary } : pack,
        );
      }
      return [...prev, { id, kind, name, versionId: null, status: "Draft", summary }];
    });
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
    };
    setPacks((prev) => [...prev, pack]);
    setSelectedEvalId(id);
    setEditorNote("");
  };

  const onPublish = () => {
    if (!selectedPack) return;
    const versionId = nextVersionId(selectedPack.kind, packs);
    setPacks((prev) =>
      prev.map((pack) =>
        pack.id === selectedPack.id && pack.kind === selectedPack.kind
          ? { ...pack, status: "Published", versionId }
          : pack,
      ),
    );
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
    <ModulePage title="Configuration libraries" surface="Configuration libraries">
      <div
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          border: `1px solid ${token.colorSplit}`,
          borderRadius: 8,
          overflow: "hidden",
          background: token.colorBgContainer,
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
              <Button data-register-surface="Publish version" type="primary" disabled={!selectedPack} onClick={onPublish}>
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
                onSelect={(id) => {
                  setSelectedEvalId(id);
                  setEditorNote("");
                }}
                onRename={(id, name) =>
                  setPacks((prev) => prev.map((pack) => (pack.id === id ? { ...pack, name } : pack)))
                }
                onNote={setEditorNote}
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
                  ensurePack("engagement", agent.id, agent.name, `${agent.stepCount} configured steps`);
                  setSelectedAgentId(agent.id);
                }}
                onCreatePack={(id, name, summary) => ensurePack("engagement", id, name, summary)}
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
