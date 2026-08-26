/**
 * Register & evolution — register_gaps is the operation. Save / New UPSERT;
 * list = SELECT. No SEED_GAPS paint (020).
 */
import { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { wirePorts } from "../../../wire";
import type { RegisterGapRow } from "../../../wire/machineTypes";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";
import {
  firmDisplayName,
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

const SOURCE_SURFACES = [
  "Oversight",
  "Firm health",
  "Customer support",
  "Firm operations bind",
  "Acquisition & ads",
  "Commercial",
  "Activation & forward-deploy",
  "Sending infrastructure",
];

export function RegisterEvolutionModule() {
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const [gaps, setGaps] = useState<RegisterGapRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [editingNew, setEditingNew] = useState(false);
  const [formSummary, setFormSummary] = useState("");
  const [formTicket, setFormTicket] = useState("");
  const [formFirm, setFormFirm] = useState("");
  const [formSource, setFormSource] = useState("");
  const [handoffNote, setHandoffNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    const [nextFirms, nextGaps] = await Promise.all([
      resolveOperatorFirms(),
      wirePorts.machineApi.listRegisterGaps(),
    ]);
    setFirms(nextFirms);
    setGaps(nextGaps);
    setSelectedId((prev) => {
      if (prev && nextGaps.some((g) => g.id === prev)) return prev;
      return nextGaps[0]?.id ?? null;
    });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void reload()
      .catch(() => {
        if (!cancelled) {
          setGaps([]);
          setSelectedId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = gaps.find((g) => g.id === selectedId) ?? gaps[0] ?? null;

  const openNewGap = () => {
    setEditingNew(true);
    setFormSummary("");
    setFormTicket("");
    setFormFirm(peekOperatorFirms()[0]?.id ?? "");
    setFormSource("");
    setGapModalOpen(true);
  };

  const openEditGap = (gap: RegisterGapRow) => {
    setEditingNew(false);
    setFormSummary(gap.summary);
    setFormTicket(gap.ticket ?? "");
    setFormFirm(gap.firmId ?? "");
    setFormSource(gap.source ?? "");
    setSelectedId(gap.id);
    setGapModalOpen(true);
  };

  const saveGap = () => {
    if (!formSummary.trim()) return;
    void (async () => {
      try {
        const row = await wirePorts.machineApi.upsertRegisterGap({
          id: editingNew ? undefined : selected?.id,
          summary: formSummary.trim(),
          ticket: formTicket.trim() || null,
          firmId: formFirm.trim() || null,
          source: formSource.trim() || null,
          written: editingNew ? false : selected?.written,
        });
        setGapModalOpen(false);
        message.success("Gap saved");
        await reload();
        setSelectedId(row.id);
      } catch (err) {
        message.error(err instanceof Error ? err.message : "Gap write failed");
      }
    })();
  };

  const toggleWritten = (gap: RegisterGapRow, written: boolean) => {
    void (async () => {
      try {
        await wirePorts.machineApi.upsertRegisterGap({
          id: gap.id,
          summary: gap.summary,
          ticket: gap.ticket,
          firmId: gap.firmId,
          source: gap.source,
          written,
        });
        await reload();
        setSelectedId(gap.id);
      } catch (err) {
        message.error(err instanceof Error ? err.message : "Gap write failed");
      }
    })();
  };

  const columns: ColumnsType<RegisterGapRow> = [
    { title: "Id", dataIndex: "id", key: "id", width: 140 },
    { title: "Summary", dataIndex: "summary", key: "summary", ellipsis: true },
    {
      title: "Written",
      key: "written",
      width: 80,
      render: (_, row) => (row.written ? <StatusTag label="Written" color="success" /> : null),
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
          loading={loading}
          pagination={false}
          locale={{ emptyText: "No gaps — New gap writes register_gaps." }}
          rowSelection={
            gaps.length > 0
              ? {
                  type: "radio",
                  selectedRowKeys: selectedId ? [selectedId] : [],
                  onChange: (keys) => setSelectedId(keys[0] as string),
                }
              : undefined
          }
        />
      </Surface>

      {selected ? (
        <Surface label="Gap" style={{ marginTop: 16 }}>
          <Space align="start">
            <Typography.Paragraph style={{ flex: 1 }}>{selected.summary}</Typography.Paragraph>
            <Checkbox
              checked={selected.written}
              onChange={(e) => toggleWritten(selected, e.target.checked)}
            >
              Written
            </Checkbox>
          </Space>
          <Space wrap>
            {selected.firmId ? <StatusTag label={firmDisplayName(firms, selected.firmId)} /> : null}
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
                  options={firms.map((f) => ({ value: f.id, label: f.name }))}
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
