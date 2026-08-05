/**
 * Configuration libraries — Evaluation packs editor; Automations + Agents Table + Drawer.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { getAllAgentDefinitions } from "../../../data/agentDefinitions";
import { getAllWorkflowDefinitions } from "../../../data/automationWorkflows";
import { Hint, ModulePage, Surface } from "../chrome";
import {
  CONFIG_LIB_SUBS,
  type ConfigLibSub,
  type ConfigPack,
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

export function ConfigurationLibrariesModule({
  sub,
  onSubChange,
}: {
  sub: ConfigLibSub;
  onSubChange: (sub: ConfigLibSub) => void;
}) {
  const subMeta = CONFIG_LIB_SUBS.find((s) => s.id === sub)!;
  const [packs, setPacks] = useState<ConfigPack[]>(seedConfigPacks);
  const [selectedId, setSelectedId] = useState<string | null>("eval-alg-v2");
  const [editorNote, setEditorNote] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const catalog = useMemo(() => packs.filter((p) => p.kind === subMeta.kind), [packs, subMeta.kind]);
  const publishedCatalog = useMemo(() => publishedPacks(subMeta.kind, packs), [packs, subMeta.kind]);
  const selected = catalog.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    const first = catalog[0];
    if (!selectedId || !catalog.some((p) => p.id === selectedId)) {
      setSelectedId(first?.id ?? null);
    }
  }, [sub, catalog, selectedId]);

  const workflows = getAllWorkflowDefinitions();
  const agents = getAllAgentDefinitions();

  const onNew = () => {
    const id = `${subMeta.kind}-new-${Date.now()}`;
    const pack: ConfigPack = {
      id,
      kind: subMeta.kind,
      name: `Untitled ${subMeta.kind}`,
      versionId: null,
      status: "Draft",
      summary: "Draft — publish to appear in Firm operations bind dropdowns",
    };
    setPacks((prev) => [...prev, pack]);
    setSelectedId(id);
    setEditorNote("");
    setDrawerOpen(true);
  };

  const onPublish = () => {
    if (!selected) return;
    const versionId = nextVersionId(selected.kind, packs);
    setPacks((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, status: "Published", versionId } : p)),
    );
  };

  const openCompare = () => {
    const a = publishedCatalog[0]?.id ?? "";
    const b = publishedCatalog[1]?.id ?? publishedCatalog[0]?.id ?? "";
    setCompareA(a);
    setCompareB(b);
    setCompareOpen(true);
  };

  const packColumns: ColumnsType<ConfigPack> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedId(row.id);
            setDrawerOpen(true);
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, row) => (
        <span data-register-surface="Published / Draft status">
          {row.status === "Published" && row.versionId
            ? <StatusTag label={`Published · ${row.versionId}`} color="success" />
            : <StatusTag label="Draft" color="warning" />}
        </span>
      ),
    },
  ];

  const workflowColumns: ColumnsType<typeof workflows[0]> = [
    { title: "Workflow", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status", width: 90 },
    { title: "Target", dataIndex: "target", key: "target", width: 90 },
    {
      title: "Nodes",
      key: "nodes",
      width: 70,
      render: (_, r) => r.nodes.length,
    },
  ];

  const agentColumns: ColumnsType<typeof agents[0]> = [
    { title: "Agent", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status", width: 90 },
    { title: "Steps", dataIndex: "stepCount", key: "stepCount", width: 70 },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      width: 70,
      render: (v) => (v ? <Tag color="success">yes</Tag> : <Tag>no</Tag>),
    },
  ];

  const editorBody = () => {
    if (!selected) {
      return <Typography.Text type="secondary">Select a row or create new.</Typography.Text>;
    }
    if (sub === "Evaluation packs") {
      return (
        <Surface label="Evaluation pack editor">
          <Form layout="vertical">
            <Form.Item label="Pack name">
              <Input
                value={selected.name}
                onChange={(e) =>
                  setPacks((prev) =>
                    prev.map((p) => (p.id === selected.id ? { ...p, name: e.target.value } : p)),
                  )
                }
              />
            </Form.Item>
            <Form.Item label="Open-box rules / analysis">
              <Input.TextArea
                rows={4}
                value={editorNote || selected.summary}
                onChange={(e) => setEditorNote(e.target.value)}
              />
            </Form.Item>
          </Form>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Scores against published Reference data tables — no firm picker on this module.
          </Typography.Text>
        </Surface>
      );
    }
    if (sub === "Automation workflows") {
      const wf = workflows.find((w) => w.id === selected.id) ?? workflows[0];
      return (
        <Surface label="Workflow canvas">
          <Typography.Paragraph>
            <strong>{wf?.name}</strong> · {wf?.nodes.length} nodes · target {wf?.target}
          </Typography.Paragraph>
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={wf?.nodes.map((n) => ({ id: n.id, type: n.type, label: (n.data as { label?: string }).label ?? n.type }))}
            columns={[
              { title: "Node", dataIndex: "label", key: "label" },
              { title: "Type", dataIndex: "type", key: "type" },
            ]}
          />
        </Surface>
      );
    }
    const agent = agents.find((a) => a.id === selected.id) ?? agents[0];
    return (
      <Surface label="Agent / sequence editor">
        <Typography.Paragraph>
          <strong>{agent?.name}</strong> · {agent?.stepCount} steps · {agent?.status}
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          Linked automations: {agent?.linkedAutomationIds.join(", ") || "none"}
        </Typography.Text>
      </Surface>
    );
  };

  const packA = packs.find((p) => p.id === compareA);
  const packB = packs.find((p) => p.id === compareB);

  return (
    <ModulePage title="Configuration libraries" surface="Configuration libraries">
      <Surface label="Libraries nav">
        <Tabs
          activeKey={sub}
          onChange={(k) => onSubChange(k as ConfigLibSub)}
          items={CONFIG_LIB_SUBS.map((item) => ({
            key: item.id,
            label: item.navLabel,
          }))}
        />
      </Surface>

      <Surface label={sub}>
        <Space style={{ marginBottom: 12 }} wrap>
          <Button data-register-surface="Compare versions" disabled={publishedCatalog.length < 1} onClick={openCompare}>
            Compare versions
          </Button>
          <Button onClick={onNew}>{subMeta.newLabel}</Button>
        </Space>

        {sub === "Evaluation packs" ? (
          <Table size="small" rowKey="id" columns={packColumns} dataSource={catalog} pagination={false} />
        ) : sub === "Automation workflows" ? (
          <Table
            size="small"
            rowKey="id"
            columns={workflowColumns}
            dataSource={workflows}
            pagination={false}
            onRow={(row) => ({
              onClick: () => {
                setSelectedId(row.id);
                setDrawerOpen(true);
              },
            })}
          />
        ) : (
          <Table
            size="small"
            rowKey="id"
            columns={agentColumns}
            dataSource={agents}
            pagination={false}
            onRow={(row) => ({
              onClick: () => {
                setSelectedId(row.id);
                setDrawerOpen(true);
              },
            })}
          />
        )}
      </Surface>

      <Drawer
        title={EDITOR_SURFACE[sub]}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          <Space>
            <Button type="primary" data-register-surface="Publish version" disabled={!selected} onClick={onPublish}>
              Publish version
            </Button>
            {selected?.status === "Published" ? (
              <Button data-register-surface="Compare versions" onClick={openCompare}>Compare versions</Button>
            ) : null}
          </Space>
        }
      >
        {editorBody()}
        {selected?.versionId ? (
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
            Current · {packLabel(selected)}
          </Typography.Text>
        ) : (
          <Hint>Primary · draft rows omitted from Bind dropdowns</Hint>
        )}
      </Drawer>

      <Modal
        title="Compare versions"
        open={compareOpen}
        onCancel={() => setCompareOpen(false)}
        footer={<Button onClick={() => setCompareOpen(false)}>Close</Button>}
        width={560}
      >
        <Surface label="Compare versions">
          <Typography.Paragraph type="secondary">
            View-only diff of published {sub.toLowerCase()} — does not Bind.
          </Typography.Paragraph>
          <Space style={{ width: "100%", marginBottom: 12 }} wrap>
            <Select
              value={compareA}
              onChange={setCompareA}
              style={{ width: 220 }}
              options={publishedCatalog.map((p) => ({ value: p.id, label: packLabel(p) }))}
            />
            <Select
              value={compareB}
              onChange={setCompareB}
              style={{ width: 220 }}
              options={publishedCatalog.map((p) => ({ value: p.id, label: packLabel(p) }))}
            />
          </Space>
          <Space wrap>
            {[packA, packB].map((pack, i) => (
              <Card key={pack?.id ?? i} size="small" title={pack ? packLabel(pack) : "—"} style={{ width: 240 }}>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11 }}>
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
