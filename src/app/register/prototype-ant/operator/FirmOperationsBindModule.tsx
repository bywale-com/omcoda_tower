/**
 * Firm operations bind — firm index, Bind packs Modal, Armed/Active Segmented.
 */
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Modal,
  Segmented,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";
import {
  type ConfigPack,
  packLabel,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";

type Posture = "Armed" | "Active";

type FirmBindState = {
  firmId: string;
  evalPackId: string | null;
  autoPackId: string | null;
  engPackId: string | null;
  posture: Posture;
};

function seedBindRows(): FirmBindState[] {
  return [
    { firmId: DEMO_FIRMS[0].id, evalPackId: "eval-alg-v2", autoPackId: "auto-welcome", engPackId: "eng-optin", posture: "Active" },
    { firmId: DEMO_FIRMS[1].id, evalPackId: "eval-soft-v1", autoPackId: "auto-book", engPackId: "eng-nudge", posture: "Armed" },
    { firmId: DEMO_FIRMS[2].id, evalPackId: "eval-alg-v2", autoPackId: "auto-welcome", engPackId: "eng-optin", posture: "Armed" },
    { firmId: DEMO_FIRMS[3].id, evalPackId: null, autoPackId: null, engPackId: null, posture: "Armed" },
  ];
}

function isBound(row: FirmBindState) {
  return Boolean(row.evalPackId && row.autoPackId && row.engPackId);
}

const HELPER = "Published versions only — drafts omitted";

export function FirmOperationsBindModule() {
  const [packs] = useState<ConfigPack[]>(seedConfigPacks);
  const [rows, setRows] = useState(seedBindRows);
  const [selectedId, setSelectedId] = useState(rows[0].firmId);
  const [bindOpen, setBindOpen] = useState(false);
  const [pickEval, setPickEval] = useState("");
  const [pickAuto, setPickAuto] = useState("");
  const [pickEng, setPickEng] = useState("");
  const [jumpNote, setJumpNote] = useState<string | null>(null);

  const row = rows.find((r) => r.firmId === selectedId) ?? rows[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const bound = isBound(row);

  const evalOptions = useMemo(() => publishedPacks("evaluation", packs), [packs]);
  const autoOptions = useMemo(() => publishedPacks("automation", packs), [packs]);
  const engOptions = useMemo(() => publishedPacks("engagement", packs), [packs]);

  const boundPacks = useMemo(() => {
    const find = (id: string | null) => packs.find((p) => p.id === id);
    return { eval: find(row.evalPackId), auto: find(row.autoPackId), eng: find(row.engPackId) };
  }, [packs, row]);

  const completeness = [
    { slot: "Evaluation", missing: !row.evalPackId },
    { slot: "Automation", missing: !row.autoPackId },
    { slot: "Engagement", missing: !row.engPackId },
  ];

  const openBindModal = () => {
    setPickEval(row.evalPackId ?? evalOptions[0]?.id ?? "");
    setPickAuto(row.autoPackId ?? autoOptions[0]?.id ?? "");
    setPickEng(row.engPackId ?? engOptions[0]?.id ?? "");
    setBindOpen(true);
    setJumpNote(null);
  };

  const columns: ColumnsType<FirmBindState> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => DEMO_FIRMS.find((f) => f.id === r.firmId)?.name,
    },
    {
      title: "Bind state",
      key: "state",
      render: (_, r) => isBound(r) ? `${r.posture} · 3 packs` : "Unbound",
    },
  ];

  const packSelect = (
    surface: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: ConfigPack[],
  ) => (
    <div data-register-surface={surface}>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>{label}</Typography.Text>
      <Select
        style={{ width: "100%", marginTop: 4 }}
        value={value || undefined}
        onChange={onChange}
        disabled={options.length === 0}
        placeholder={options.length === 0 ? "No published versions" : "Select published version…"}
        options={options.map((p) => ({ value: p.id, label: packLabel(p) }))}
      />
      <Typography.Text type="secondary" data-register-surface="Published-only helper" style={{ fontSize: 10 }}>
        {HELPER}
      </Typography.Text>
      {options.length === 0 ? (
        <Button size="small" data-register-surface="Jump to Configuration libraries" onClick={() => setJumpNote("Jump to Configuration libraries")} style={{ marginTop: 6 }}>
          Jump to Configuration libraries
        </Button>
      ) : null}
    </div>
  );

  return (
    <ModulePage title="Firm operations bind" surface="Firm operations bind">
      <Surface label="Firm-bind index">
        <Table
          size="small"
          rowKey="firmId"
          columns={columns}
          dataSource={rows}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: [selectedId],
            onChange: (keys) => {
              setSelectedId(keys[0] as string);
              setJumpNote(null);
            },
          }}
        />
      </Surface>

      <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
        Selected firm · <strong>{firm.name}</strong>
      </Typography.Text>
      {jumpNote ? <Typography.Text type="success">{jumpNote}</Typography.Text> : null}

      <Surface label="Bind packs" style={{ marginTop: 16 }}>
        <Card
          size="small"
          title="Bind packs"
          extra={<Button size="small" onClick={openBindModal}>Bind packs</Button>}
        >
          <Hint>House-authored published versions only — drafts omitted.</Hint>
          {bound ? (
            <Space wrap data-register-surface="Bound-version chips">
              {boundPacks.eval ? <StatusTag label={`Evaluation · ${packLabel(boundPacks.eval)}`} /> : null}
              {boundPacks.auto ? <StatusTag label={`Automation · ${packLabel(boundPacks.auto)}`} /> : null}
              {boundPacks.eng ? <StatusTag label={`Engagement · ${packLabel(boundPacks.eng)}`} /> : null}
            </Space>
          ) : (
            <Space>
              <Typography.Text type="secondary">No packs bound</Typography.Text>
              <Button size="small" data-register-surface="Jump to Configuration libraries" onClick={() => setJumpNote("Jump to Configuration libraries")}>
                Jump to Configuration libraries
              </Button>
            </Space>
          )}
        </Card>
      </Surface>

      <Surface label="Armed / Active" style={{ marginTop: 16 }}>
        <Card size="small" title="Armed / Active">
          <Surface label="Bind-completeness">
            <Space wrap style={{ marginBottom: 12 }}>
              {completeness.map((c) => (
                <StatusTag
                  key={c.slot}
                  label={c.missing ? `${c.slot} · missing` : `${c.slot} · bound`}
                  color={c.missing ? "warning" : "success"}
                />
              ))}
            </Space>
          </Surface>
          <Segmented
            block
            disabled={!bound}
            value={row.posture}
            onChange={(v) =>
              setRows((prev) => prev.map((r) => (r.firmId === row.firmId ? { ...r, posture: v as Posture } : r)))
            }
            options={[
              { label: "Armed", value: "Armed" },
              { label: "Active", value: "Active" },
            ]}
          />
        </Card>
      </Surface>

      <Modal
        title="Bind packs"
        open={bindOpen}
        onCancel={() => setBindOpen(false)}
        onOk={() => {
          if (!pickEval || !pickAuto || !pickEng) return;
          setRows((prev) =>
            prev.map((r) =>
              r.firmId === row.firmId ? { ...r, evalPackId: pickEval, autoPackId: pickAuto, engPackId: pickEng } : r,
            ),
          );
          setBindOpen(false);
          message.success("Packs bound");
        }}
        okText="Bind"
        okButtonProps={{ disabled: !pickEval || !pickAuto || !pickEng, "data-register-surface": "Bind" } as object}
      >
        <Surface label="Bind packs">
          <Typography.Paragraph type="secondary">{firm.name} — select three published versions.</Typography.Paragraph>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {packSelect("Evaluation pack version", "Evaluation pack", pickEval, setPickEval, evalOptions)}
            {packSelect("Automation pack version", "Automation pack", pickAuto, setPickAuto, autoOptions)}
            {packSelect("Engagement template version", "Engagement template", pickEng, setPickEng, engOptions)}
          </Space>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
