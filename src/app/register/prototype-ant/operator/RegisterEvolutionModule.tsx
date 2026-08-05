/**
 * Register & evolution — gaps list, Gap Modal, save, regenerate handoff.
 */
import { useState } from "react";
import { Button, Checkbox, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

type GapRow = {
  id: string;
  summary: string;
  ticket?: string;
  firm?: string;
  source?: string;
  written: boolean;
};

const SEED_GAPS: GapRow[] = [
  { id: "gap-seq-silence", summary: "Sequence silence clock not visible on Fleet health — Atlas stuck 9 contacts unnoticed.", ticket: "SUP-184", firm: "Atlas Mobility", source: "Firm health", written: false },
  { id: "gap-bind-gate", summary: "Bind pack commit lacks before/after on Audit trail for Send gate reviewers.", firm: "Cedar Pathways", source: "Firm operations bind", written: true },
  { id: "gap-approach-cap", summary: "Approach click budget bound not enforced when firm re-binds mid-campaign.", source: "Acquisition & ads", written: false },
];

const SOURCE_SURFACES = ["Oversight", "Firm health", "Customer support", "Firm operations bind", "Acquisition & ads", "Commercial", "Activation & forward-deploy"];

export function RegisterEvolutionModule() {
  const [gaps, setGaps] = useState(SEED_GAPS);
  const [selectedId, setSelectedId] = useState(SEED_GAPS[0].id);
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [editingNew, setEditingNew] = useState(false);
  const [formSummary, setFormSummary] = useState("");
  const [formTicket, setFormTicket] = useState("");
  const [formFirm, setFormFirm] = useState("");
  const [formSource, setFormSource] = useState("");
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  const selected = gaps.find((g) => g.id === selectedId) ?? gaps[0];

  const openNewGap = () => {
    setEditingNew(true);
    setFormSummary("");
    setFormTicket("");
    setFormFirm("");
    setFormSource("");
    setGapModalOpen(true);
  };

  const openEditGap = (gap: GapRow) => {
    setEditingNew(false);
    setFormSummary(gap.summary);
    setFormTicket(gap.ticket ?? "");
    setFormFirm(gap.firm ?? "");
    setFormSource(gap.source ?? "");
    setSelectedId(gap.id);
    setGapModalOpen(true);
  };

  const saveGap = () => {
    if (!formSummary.trim()) return;
    if (editingNew) {
      const id = `gap-${Date.now()}`;
      const row: GapRow = {
        id,
        summary: formSummary.trim(),
        ticket: formTicket.trim() || undefined,
        firm: formFirm.trim() || undefined,
        source: formSource.trim() || undefined,
        written: false,
      };
      setGaps((prev) => [row, ...prev]);
      setSelectedId(id);
    } else if (selected) {
      setGaps((prev) =>
        prev.map((g) =>
          g.id === selected.id
            ? { ...g, summary: formSummary.trim(), ticket: formTicket.trim() || undefined, firm: formFirm.trim() || undefined, source: formSource.trim() || undefined }
            : g,
        ),
      );
    }
    setGapModalOpen(false);
    message.success("Gap saved");
  };

  const columns: ColumnsType<GapRow> = [
    { title: "Id", dataIndex: "id", key: "id", width: 140 },
    { title: "Summary", dataIndex: "summary", key: "summary", ellipsis: true },
    {
      title: "Written",
      key: "written",
      width: 80,
      render: (_, row) => row.written ? <StatusTag label="Written" color="success" /> : null,
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, row) => (
        <Button type="link" size="small" data-register-surface="Gap" onClick={() => openEditGap(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <ModulePage title="Register & evolution" surface="Register & evolution">
      <Surface label="Gaps">
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={openNewGap}>+ New gap</Button>
        </Space>
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={gaps}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: [selectedId],
            onChange: (keys) => setSelectedId(keys[0] as string),
          }}
        />
      </Surface>

      {selected ? (
        <Surface label="Gap" style={{ marginTop: 16 }}>
          <Space align="start">
            <Typography.Paragraph style={{ flex: 1 }}>{selected.summary}</Typography.Paragraph>
            <Checkbox
              checked={selected.written}
              onChange={() =>
                setGaps((prev) => prev.map((g) => (g.id === selected.id ? { ...g, written: !g.written } : g)))
              }
            >
              Written
            </Checkbox>
          </Space>
          <Space wrap>
            {selected.firm ? <StatusTag label={selected.firm} /> : null}
            {selected.source ? <StatusTag label={selected.source} color="processing" /> : null}
          </Space>
        </Surface>
      ) : null}

      <Surface label="Regenerate handoff" style={{ marginTop: 16 }}>
        <Hint>Writes handoff state for Configuration libraries authoring — never on the firm desk.</Hint>
        <Button
          type="primary"
          onClick={() =>
            setHandoffNote(`Handoff regenerated · ${gaps.filter((g) => g.written).length} Written gaps`)
          }
        >
          Regenerate handoff
        </Button>
        {handoffNote ? <Typography.Text type="success" style={{ marginLeft: 12 }}>{handoffNote}</Typography.Text> : null}
      </Surface>

      <Modal
        title={editingNew ? "New gap" : "Gap"}
        open={gapModalOpen}
        onCancel={() => setGapModalOpen(false)}
        onOk={saveGap}
        okText="Save gap"
        okButtonProps={{ disabled: !formSummary.trim(), "data-register-surface": "Save gap" } as object}
      >
        <Surface label="Gap">
          <Form layout="vertical">
            <Form.Item label="Friction summary">
              <Input.TextArea rows={4} value={formSummary} onChange={(e) => setFormSummary(e.target.value)} />
            </Form.Item>
            <Form.Item label="Support ticket id (optional)">
              <Input value={formTicket} onChange={(e) => setFormTicket(e.target.value)} placeholder="SUP-184" />
            </Form.Item>
            <Surface label="Gap firm / source">
              <Space wrap>
                <Select
                  placeholder="Firm tenancy"
                  value={formFirm || undefined}
                  onChange={setFormFirm}
                  allowClear
                  style={{ width: 200 }}
                  options={DEMO_FIRMS.map((f) => ({ value: f.name, label: f.name }))}
                />
                <Select
                  placeholder="Source surface"
                  value={formSource || undefined}
                  onChange={setFormSource}
                  allowClear
                  style={{ width: 200 }}
                  options={SOURCE_SURFACES.map((s) => ({ value: s, label: s }))}
                />
              </Space>
            </Surface>
          </Form>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
