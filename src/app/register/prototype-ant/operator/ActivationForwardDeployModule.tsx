/**
 * Activation & forward-deploy — in-flight Table, Hydrate, staging Tags, readiness Steps.
 */
import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

type StagingChip = "idle" | "enriching" | "hydrated" | "stale";
type FactsFresh = "fresh" | "stale" | "pending";
type BrandPinned = "pinned" | "placeholder" | "missing";

type ActivationRow = {
  id: string;
  firmId: string;
  firm: string;
  owner: string;
  staging: StagingChip;
  factsFresh: FactsFresh;
  brandPinned: BrandPinned;
  authorizeBook: "pending" | "complete";
  acceptTerms: "pending" | "complete";
  publicUrl: string;
  brandPackage: string;
  templateVersion: string;
};

const TEMPLATES = [
  "Engagement · ALG desk v3 (published)",
  "Engagement · Soft-open v2 (published)",
  "Engagement · Re-engage v1 (published)",
];

const INITIAL: ActivationRow[] = [
  {
    id: "act-cedar",
    firmId: DEMO_FIRMS[1].id,
    firm: DEMO_FIRMS[1].name,
    owner: "Lena",
    staging: "hydrated",
    factsFresh: "fresh",
    brandPinned: "pinned",
    authorizeBook: "pending",
    acceptTerms: "pending",
    publicUrl: "https://cedarpathways.ca",
    brandPackage: "Brand · cedar public v1",
    templateVersion: TEMPLATES[0],
  },
  {
    id: "act-harbor",
    firmId: DEMO_FIRMS[2].id,
    firm: DEMO_FIRMS[2].name,
    owner: "Marco",
    staging: "hydrated",
    factsFresh: "stale",
    brandPinned: "pinned",
    authorizeBook: "complete",
    acceptTerms: "pending",
    publicUrl: "https://harborrcic.com",
    brandPackage: "Brand · harbor public v2",
    templateVersion: TEMPLATES[1],
  },
  {
    id: "act-atlas",
    firmId: DEMO_FIRMS[3].id,
    firm: DEMO_FIRMS[3].name,
    owner: "Lena",
    staging: "idle",
    factsFresh: "pending",
    brandPinned: "missing",
    authorizeBook: "pending",
    acceptTerms: "pending",
    publicUrl: "https://atlasmobility.ca",
    brandPackage: "Brand · atlas public v1",
    templateVersion: TEMPLATES[0],
  },
];

const WALKTHROUGH = [
  { title: "Template preview", description: "Published engagement template under firm identity" },
  { title: "Public facts", description: "Allowlisted site / listing facts bound into the workspace" },
  { title: "Brand state", description: "Logo / palette confirmed or neutral placeholder" },
  { title: "Next hard inputs", description: "Authorize book + Accept terms (consultant commits)" },
];

function stagingTags(row: ActivationRow) {
  const hydrate =
    row.staging === "hydrated"
      ? "Hydrate · done"
      : row.staging === "enriching"
        ? "Hydrate · running"
        : row.staging === "stale"
          ? "Hydrate · stale"
          : "Hydrate · pending";
  const facts =
    row.factsFresh === "fresh" ? "facts-fresh" : row.factsFresh === "stale" ? "facts-stale" : "facts-pending";
  const brand =
    row.brandPinned === "pinned"
      ? "brand-pinned"
      : row.brandPinned === "placeholder"
        ? "brand-placeholder"
        : "brand-missing";
  return (
    <Space size={4} wrap data-register-surface="Staging status chips">
      <Tag color={row.staging === "hydrated" ? "success" : "warning"}>{hydrate}</Tag>
      <Tag color={row.factsFresh === "fresh" ? "success" : "warning"}>{facts}</Tag>
      <Tag color={row.brandPinned === "pinned" ? "success" : row.brandPinned === "missing" ? "error" : "warning"}>
        {brand}
      </Tag>
    </Space>
  );
}

export function ActivationForwardDeployModule() {
  const [rows, setRows] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(INITIAL[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [walkStep, setWalkStep] = useState(0);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  const patchSelected = (patch: Partial<ActivationRow>) => {
    setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)));
  };

  const onHydrate = () => {
    patchSelected({ staging: "enriching", factsFresh: "pending" });
    window.setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? {
                ...r,
                staging: "hydrated",
                factsFresh: "fresh",
                brandPinned: r.brandPinned === "missing" ? "placeholder" : r.brandPinned,
              }
            : r,
        ),
      );
      setWalkStep(0);
    }, 700);
  };

  const columns: ColumnsType<ActivationRow> = [
    {
      title: "Firm",
      dataIndex: "firm",
      key: "firm",
      render: (firm, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedId(row.id);
            setDrawerOpen(true);
          }}
        >
          {firm}
        </Button>
      ),
    },
    { title: "Owner", dataIndex: "owner", key: "owner", width: 80 },
    {
      title: "Staging",
      key: "staging",
      render: (_, row) => stagingTags(row),
    },
  ];

  return (
    <ModulePage title="Activation & forward-deploy" surface="Activation & forward-deploy">
      <Hint>No client PII · no consultant login yet</Hint>

      <Surface label="In-flight activations">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: [selectedId],
            onChange: (keys) => setSelectedId(keys[0] as string),
          }}
        />
      </Surface>

      <Drawer
        title={`Forward-deploy · ${selected.firm}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
      >
        <Surface label="Forward-deploy">
          <Space wrap style={{ marginBottom: 12 }}>{stagingTags(selected)}</Space>
          <Form layout="vertical">
            <Form.Item label="Template version" data-register-surface="Template version">
              <Select
                value={selected.templateVersion}
                onChange={(v) => patchSelected({ templateVersion: v })}
                options={TEMPLATES.map((t) => ({ value: t, label: t }))}
              />
            </Form.Item>
            <Form.Item label="Public firm URL">
              <Input value={selected.publicUrl} onChange={(e) => patchSelected({ publicUrl: e.target.value })} />
            </Form.Item>
            <Form.Item label="Brand package">
              <Input
                value={selected.brandPackage}
                onChange={(e) => patchSelected({ brandPackage: e.target.value })}
              />
            </Form.Item>
            <Button
              type="primary"
              data-register-surface="Hydrate"
              disabled={selected.staging === "enriching"}
              onClick={onHydrate}
            >
              {selected.staging === "enriching" ? "Hydrating…" : "Hydrate"}
            </Button>
          </Form>
        </Surface>

        <Surface label="Readiness walkthrough" style={{ marginTop: 24 }}>
          <Steps
            current={selected.staging === "hydrated" ? walkStep : -1}
            direction="vertical"
            size="small"
            items={WALKTHROUGH.map((s) => ({ title: s.title, description: s.description }))}
          />
          <Space style={{ marginTop: 12 }}>
            <Button
              disabled={selected.staging !== "hydrated" || walkStep === 0}
              onClick={() => setWalkStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              type="primary"
              disabled={selected.staging !== "hydrated" || walkStep >= WALKTHROUGH.length - 1}
              onClick={() => setWalkStep((s) => Math.min(WALKTHROUGH.length - 1, s + 1))}
            >
              Next
            </Button>
          </Space>
        </Surface>

        <Surface label="Hard-input status" style={{ marginTop: 24 }}>
          <Space wrap>
            <StatusTag
              label={
                selected.authorizeBook === "complete"
                  ? "Authorize book · complete"
                  : "Authorize book · pending"
              }
              color={selected.authorizeBook === "complete" ? "success" : "warning"}
            />
            <StatusTag
              label={
                selected.acceptTerms === "complete" ? "Accept terms · complete" : "Accept terms · pending"
              }
              color={selected.acceptTerms === "complete" ? "success" : "warning"}
            />
          </Space>
          <Space style={{ marginTop: 12 }} wrap>
            <Button data-register-surface="Progress Jump" onClick={() => setJumpNote("Jump to Activation state")}>
              Jump to Activation state
            </Button>
            <Button data-register-surface="Progress Jump" onClick={() => setJumpNote("Jump to Commercial")}>
              Jump to Commercial
            </Button>
          </Space>
          {jumpNote ? (
            <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>
              Opened · {jumpNote}
            </Typography.Text>
          ) : null}
        </Surface>
      </Drawer>
    </ModulePage>
  );
}
