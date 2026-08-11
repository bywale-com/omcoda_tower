/**
 * Activation & forward-deploy — in-flight Table, Hydrate, staging Tags, readiness Steps.
 * Index = session/real firms — never DEMO_FIRMS densification.
 */
import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useWireTick } from "../../../wire";
import { useOperatorNav } from "../../prototype/operatorNav";
import {
  appendOperatorAudit,
  hydrateForwardDeployRows,
  persistForwardDeployRow,
  type ForwardDeployActivationRow,
} from "../../prototype/operator/operatorWireHelpers";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";
import {
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

type StagingChip = ForwardDeployActivationRow["staging"];
type FactsFresh = ForwardDeployActivationRow["factsFresh"];
type BrandPinned = ForwardDeployActivationRow["brandPinned"];

type ActivationRow = ForwardDeployActivationRow;

const TEMPLATES = [
  "Engagement · ALG desk v3 (published)",
  "Engagement · Soft-open v2 (published)",
  "Engagement · Re-engage v1 (published)",
];

function idleRowForFirm(firm: OperatorFirm): ActivationRow {
  return {
    id: `act-${firm.id}`,
    firmId: firm.id,
    firm: firm.name,
    owner: "—",
    staging: "idle",
    factsFresh: "pending",
    brandPinned: "missing",
    authorizeBook: "pending",
    acceptTerms: "pending",
    publicUrl: "",
    brandPackage: "",
    templateVersion: TEMPLATES[0],
  };
}

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
  const { jumpTo } = useOperatorNav();
  const tick = useWireTick();
  const [rows, setRows] = useState<ActivationRow[]>(() =>
    peekOperatorFirms().map(idleRowForFirm),
  );
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const initial = peekOperatorFirms();
    return initial[0] ? `act-${initial[0].id}` : null;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [walkStep, setWalkStep] = useState(0);
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then(async (firms) => {
      if (cancelled) return;
      const seed = firms.map(idleRowForFirm);
      // Hydrate from primary store for these firm ids only — do not merge DEMO seed rows.
      const stored = seed.length === 0 ? [] : await hydrateForwardDeployRows(seed);
      if (cancelled) return;
      setRows(stored);
      setSelectedId((prev) => {
        if (prev && stored.some((r) => r.id === prev)) return prev;
        return stored[0]?.id ?? null;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  const patchSelected = (patch: Partial<ActivationRow>) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== selected.id) return r;
        const next = { ...r, ...patch };
        void persistForwardDeployRow(next);
        return next;
      }),
    );
  };

  const onHydrate = () => {
    if (!selected) return;
    patchSelected({ staging: "enriching", factsFresh: "pending" });
    window.setTimeout(() => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== selected.id) return r;
          const next = {
            ...r,
            staging: "hydrated" as StagingChip,
            factsFresh: "fresh" as FactsFresh,
            brandPinned: r.brandPinned === "missing" ? "placeholder" as BrandPinned : r.brandPinned,
          };
          void persistForwardDeployRow(next);
          void appendOperatorAudit({
            actorId: "ops.marco",
            kind: "activation.hydrate",
            subjectType: "firm",
            subjectId: r.firmId,
            action: `Forward-deploy staged Prepared Workspace · ${r.firm}`,
            kindLabel: "Activation",
            before: "Not staged",
            after: "Prepared Workspace staged",
            surface: "Activation & forward-deploy",
            firmName: r.firm,
          });
          return next;
        }),
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
        {rows.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No firms — provision or select a session firm."
          />
        ) : (
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={false}
            rowSelection={{
              type: "radio",
              selectedRowKeys: selectedId ? [selectedId] : [],
              onChange: (keys) => setSelectedId(keys[0] as string),
            }}
          />
        )}
      </Surface>

      {selected ? (
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
              <Button data-register-surface="Progress Jump" onClick={() => { const n = "Jump to Activation state"; jumpTo(n); setJumpNote(n); }}>
                Jump to Activation state
              </Button>
              <Button data-register-surface="Progress Jump" onClick={() => { const n = "Jump to Commercial"; jumpTo(n); setJumpNote(n); }}>
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
      ) : null}
    </ModulePage>
  );
}
