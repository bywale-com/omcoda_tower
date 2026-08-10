/**
 * Reference data — tables, import Modal, publish Modal with dual-check, ingestion Steps.
 * Grid edits modulate draft row values; Publish version upserts those values into reference_versions.
 */
import { useEffect, useState } from "react";
import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  type AutomationConstantIndustryId,
} from "../../../data/automationConstants";
import { wirePorts } from "../../../wire";
import {
  draftFromPublishedOrSeed,
  formatReferenceCellValue,
  parseReferenceCellValue,
  seedReferenceDraft,
  type ReferenceDraftRow,
} from "../../prototype/shared/referenceDraft";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
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

function emptyDrafts(): Record<AutomationConstantIndustryId, ReferenceDraftRow[]> {
  return {
    immigration: seedReferenceDraft("immigration"),
    legal: seedReferenceDraft("legal"),
    financial_services: seedReferenceDraft("financial_services"),
  };
}

export function ReferenceDataModule() {
  const [tables, setTables] = useState(TABLES);
  const [tableId, setTableId] = useState<AutomationConstantIndustryId>("immigration");
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [importOpen, setImportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [importFile, setImportFile] = useState("");
  const [publishing, setPublishing] = useState(false);

  const meta = tables.find((r) => r.id === tableId) ?? tables[0];
  const industry = AUTOMATION_CONSTANT_INDUSTRIES.find((i) => i.id === tableId);
  const rows = drafts[tableId] ?? [];
  const publishReady = meta.schemaOk && meta.dualCheckOk && meta.publishGroupOk;
  const stageIdx = PIPE_STAGES.indexOf(meta.stage);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const versions = await wirePorts.machineApi.listReferenceVersions();
        if (cancelled || !versions.length) return;
        setDrafts((prev) => {
          const next = { ...prev };
          for (const industryId of Object.keys(next) as AutomationConstantIndustryId[]) {
            const key = `reference.${industryId}`;
            const match = versions.find((v) => v.key === key);
            if (match?.payload) {
              next[industryId] = draftFromPublishedOrSeed(industryId, match.payload);
            }
          }
          return next;
        });
      } catch {
        /* seed drafts remain */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRowValue = (key: string, text: string) => {
    setDrafts((prev) => {
      const list = prev[tableId] ?? [];
      return {
        ...prev,
        [tableId]: list.map((row) =>
          row.key === key
            ? { ...row, value: parseReferenceCellValue(row.type, text) }
            : row,
        ),
      };
    });
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId ? { ...row, status: "Draft" as const } : row,
      ),
    );
  };

  const onConfirmPublish = async () => {
    if (!publishReady) return;
    const nextNum = (parseFloat(meta.version.replace("v", "")) + 0.1).toFixed(1);
    const version = `v${nextNum}`;
    const versionInt = Math.round(parseFloat(nextNum) * 10);
    const draftRows = drafts[tableId] ?? [];
    setPublishing(true);
    try {
      const payload = {
        industry: tableId,
        label: industry?.label ?? tableId,
        version,
        notes: publishNotes.trim() || undefined,
        rows: draftRows.map((r) => ({
          key: r.key,
          label: r.label,
          value: r.value,
          type: r.type,
        })),
      };
      const referenceId = `ref.reference.${tableId}.local`;
      const result = await wirePorts.machineApi.upsertReference({
        id: referenceId,
        key: `reference.${tableId}`,
        payload,
        version: versionInt,
      });
      const stored = (await wirePorts.machineApi.listReferenceVersions()).find(
        (v) => v.id === result.referenceId || v.key === `reference.${tableId}`,
      );
      const storedRows = Array.isArray(stored?.payload?.rows)
        ? (stored!.payload.rows as Array<{ key: string; value: unknown }>)
        : [];
      const sample = draftRows[0];
      const persisted = sample
        ? storedRows.find((r) => r.key === sample.key)?.value
        : undefined;
      if (sample && persisted !== sample.value) {
        throw new Error(
          `Publish did not persist modular value for ${sample.key}: expected ${String(sample.value)}, got ${String(persisted)}`,
        );
      }
      setTables((prev) =>
        prev.map((row) =>
          row.id === tableId
            ? {
                ...row,
                version,
                status: "Published" as const,
                schemaOk: true,
                dualCheckOk: true,
                publishGroupOk: true,
                stage: "ready" as const,
              }
            : row,
        ),
      );
      setPublishOpen(false);
      setPublishNotes("");
      const fired = Array.isArray(result.workflowsFired) ? result.workflowsFired.length : 0;
      message.success(
        `Published ${industry?.label ?? tableId} · ${version}` +
          (sample ? ` · ${sample.key}=${formatReferenceCellValue(sample.value)}` : "") +
          (fired > 0 ? ` · eligibility.changed → ${fired} workflow(s)` : " · reference upserted"),
      );
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const onImport = () => {
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              status: "Draft" as const,
              schemaOk: true,
              dualCheckOk: false,
              publishGroupOk: row.id !== "financial_services",
              stage: "dual-check" as const,
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
          status: next === "ready" ? row.status : ("Draft" as const),
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

  const dataColumns: ColumnsType<ReferenceDraftRow> = [
    { title: "Key", dataIndex: "key", key: "key", width: 160 },
    { title: "Label", dataIndex: "label", key: "label" },
    {
      title: "Value",
      key: "value",
      render: (_, r) => (
        <Input
          size="small"
          data-register-surface="Reference row value"
          value={formatReferenceCellValue(r.value)}
          onChange={(e) => setRowValue(r.key, e.target.value)}
          aria-label={`Edit ${r.key}`}
        />
      ),
    },
    { title: "Type", dataIndex: "type", key: "type", width: 80 },
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
        extra={
          <StatusTag
            label={`${meta.status} · ${meta.version}`}
            color={meta.status === "Published" ? "success" : "warning"}
          />
        }
        style={{ marginTop: 16 }}
      >
        {industry?.description ? <Hint>{industry.description}</Hint> : null}

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
          <Input type="file" onChange={(e) => setImportFile(e.target.files?.[0]?.name ?? "")} />
          {importFile ? <Typography.Text type="success">Selected · {importFile}</Typography.Text> : null}
        </Surface>
      </Modal>

      <Modal
        title="Publish version"
        open={publishOpen}
        onCancel={() => setPublishOpen(false)}
        onOk={() => void onConfirmPublish()}
        okButtonProps={{ disabled: !publishReady, loading: publishing }}
        okText="Confirm"
      >
        <Surface label="Publish version">
          <Typography.Paragraph type="secondary">
            Publish writes the edited grid values into <code>reference_versions</code>, then eligibility
            re-eval can fire for evaluation packs.
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
