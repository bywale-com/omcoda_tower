/**
 * Reference data — tables, import Modal, publish Modal with dual-check, ingestion Steps.
 */
import { useMemo, useState } from "react";
import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  formatConstantValue,
  getConstantsForIndustry,
  type AutomationConstantIndustryId,
} from "../../../data/automationConstants";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";

type TableMeta = {
  id: AutomationConstantIndustryId;
  version: string;
  status: "Published" | "Draft";
  schemaOk: boolean;
  dualCheckOk: boolean;
  publishGroupOk: boolean;
  stage: "detect" | "fetch" | "parse" | "validate" | "draft" | "dual-check" | "ready";
};

const PIPE_STAGES = ["detect", "fetch", "parse", "validate", "draft", "dual-check", "ready"] as const;

const TABLES: TableMeta[] = [
  {
    id: "immigration",
    version: "v2.4",
    status: "Published",
    schemaOk: true,
    dualCheckOk: true,
    publishGroupOk: true,
    stage: "ready",
  },
  {
    id: "legal",
    version: "v0.1",
    status: "Draft",
    schemaOk: true,
    dualCheckOk: false,
    publishGroupOk: true,
    stage: "dual-check",
  },
  {
    id: "financial_services",
    version: "v0.0",
    status: "Draft",
    schemaOk: false,
    dualCheckOk: false,
    publishGroupOk: false,
    stage: "validate",
  },
];

export function ReferenceDataModule() {
  const [tables, setTables] = useState(TABLES);
  const [tableId, setTableId] = useState<AutomationConstantIndustryId>("immigration");
  const [importOpen, setImportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [importFile, setImportFile] = useState("");

  const meta = tables.find((r) => r.id === tableId) ?? tables[0];
  const industry = AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === tableId);
  const rows = useMemo(() => getConstantsForIndustry(tableId).slice(0, 8), [tableId]);
  const publishReady = meta.schemaOk && meta.dualCheckOk && meta.publishGroupOk;
  const stageIdx = PIPE_STAGES.indexOf(meta.stage);

  const onConfirmPublish = () => {
    if (!publishReady) return;
    const next = (parseFloat(meta.version.replace("v", "")) + 0.1).toFixed(1);
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              version: `v${next}`,
              status: "Published",
              schemaOk: true,
              dualCheckOk: true,
              publishGroupOk: true,
              stage: "ready",
            }
          : row,
      ),
    );
    setPublishOpen(false);
    setPublishNotes("");
    message.success(`Published ${industry?.label ?? tableId} · ${`v${next}`}`);
  };

  const onImport = () => {
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              status: "Draft",
              schemaOk: true,
              dualCheckOk: false,
              publishGroupOk: row.id !== "financial_services",
              stage: "dual-check",
            }
          : row,
      ),
    );
    setImportOpen(false);
    setImportFile("");
    message.success("Criteria imported into draft table");
  };

  const advanceStage = () => {
    const idx = PIPE_STAGES.indexOf(meta.stage);
    if (idx < 0 || idx >= PIPE_STAGES.length - 1) return;
    const next = PIPE_STAGES[idx + 1];
    setTables((prev) =>
      prev.map((row) => {
        if (row.id !== tableId) return row;
        return {
          ...row,
          stage: next,
          schemaOk: next === "validate" || next === "draft" || next === "dual-check" || next === "ready",
          dualCheckOk: next === "ready",
          publishGroupOk: next === "ready" || next === "dual-check",
          status: next === "ready" ? row.status : "Draft",
        };
      }),
    );
  };

  const tableNavColumns: ColumnsType<TableMeta> = [
    {
      title: "Table",
      key: "label",
      render: (_, row) =>
        AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === row.id)?.label ?? row.id,
    },
    { title: "Version", dataIndex: "version", key: "version", width: 70 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (s) => <StatusTag label={s} color={s === "Published" ? "success" : "warning"} />,
    },
  ];

  const dataColumns: ColumnsType<{ key: string; label: string; value: unknown; type: string }> = [
    { title: "Key", dataIndex: "key", key: "key" },
    { title: "Label", dataIndex: "label", key: "label" },
    {
      title: "Value",
      key: "value",
      render: (_, r) => formatConstantValue(r as Parameters<typeof formatConstantValue>[0]),
    },
    { title: "Type", dataIndex: "type", key: "type" },
  ];

  return (
    <ModulePage title="Reference data" surface="Reference data">
      <Row gutter={16}>
        <Surface label="Reference tables" style={{ flex: 1 }}>
          <Table
            size="small"
            rowKey="id"
            columns={tableNavColumns}
            dataSource={tables}
            pagination={false}
            rowSelection={{
              type: "radio",
              selectedRowKeys: [tableId],
              onChange: (keys) => setTableId(keys[0] as AutomationConstantIndustryId),
            }}
          />
        </Surface>
      </Row>

      <Card
        size="small"
        title={industry?.label ?? tableId}
        extra={<StatusTag label={`${meta.status} · ${meta.version}`} color={meta.status === "Published" ? "success" : "warning"} />}
        style={{ marginTop: 16 }}
      >
        {industry?.description ? (
          <Hint>{industry.description}</Hint>
        ) : null}

        <Surface label="Ingestion stage rail">
          <Steps
            size="small"
            current={stageIdx}
            items={PIPE_STAGES.map((s) => ({ title: s }))}
            style={{ marginBottom: 12 }}
          />
          <Button disabled={meta.stage === "ready"} onClick={advanceStage}>
            {meta.stage === "ready" ? "Ready for Publish" : "Advance stage"}
          </Button>
        </Surface>

        <Table
          size="small"
          style={{ marginTop: 16 }}
          rowKey="key"
          columns={dataColumns}
          dataSource={rows}
          pagination={false}
        />

        <Space style={{ marginTop: 16 }} wrap>
          <Button data-register-surface="Import criteria" onClick={() => setImportOpen(true)}>
            Import criteria
          </Button>
          <Button data-register-surface="Publish version" onClick={() => setPublishOpen(true)}>
            Publish version…
          </Button>
        </Space>

        <Surface label="Dual-check glance" style={{ marginTop: 12 }}>
          <Space wrap>
            <Tag color={meta.schemaOk ? "success" : "error"}>
              {meta.schemaOk ? "schema-contract · ok" : "schema-contract · red"}
            </Tag>
            <Tag color={meta.dualCheckOk ? "success" : "warning"}>
              {meta.dualCheckOk ? "dual-check · ok" : "dual-check · pending"}
            </Tag>
            <Tag color={meta.publishGroupOk ? "success" : "error"}>
              {meta.publishGroupOk ? "publish-group · ok" : "publish-group · blocked"}
            </Tag>
          </Space>
        </Surface>
      </Card>

      <Modal
        title="Import criteria"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={onImport}
        okButtonProps={{ disabled: !importFile }}
        okText="Import"
      >
        <Surface label="Import criteria">
          <Typography.Paragraph type="secondary">
            Load IRCC-shaped criteria into a draft table version for {industry?.label ?? tableId}.
          </Typography.Paragraph>
          <Input
            type="file"
            onChange={(e) => setImportFile(e.target.files?.[0]?.name ?? "")}
          />
          {importFile ? <Typography.Text type="success">Selected · {importFile}</Typography.Text> : null}
        </Surface>
      </Modal>

      <Modal
        title="Publish version"
        open={publishOpen}
        onCancel={() => setPublishOpen(false)}
        onOk={onConfirmPublish}
        okButtonProps={{ disabled: !publishReady }}
        okText="Confirm"
      >
        <Surface label="Publish version">
          <Typography.Paragraph type="secondary">
            Publish {industry?.label ?? tableId} — Configuration libraries evaluation packs consume this version.
          </Typography.Paragraph>
          <Surface label="Dual-check glance">
            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color={meta.schemaOk ? "success" : "error"}>schema-contract</Tag>
              <Tag color={meta.dualCheckOk ? "success" : "warning"}>dual-check</Tag>
              <Tag color={meta.publishGroupOk ? "success" : "error"}>publish-group</Tag>
            </Space>
          </Surface>
          {!publishReady ? (
            <Typography.Text type="warning">
              Confirm disabled until schema contract, dual-check, and publish-group chips are green.
            </Typography.Text>
          ) : null}
          <Form layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item label="Version notes">
              <Input.TextArea
                rows={3}
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                placeholder="e.g. Updated provincial nominee cutoffs"
              />
            </Form.Item>
          </Form>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
