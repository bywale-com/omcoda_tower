/**
 * Firm operations bind — firm index, Bind packs Modal, Armed/Active Segmented.
 * Shares published packs with Configuration libraries via packCatalogStore.
 * Active → activateWorkflow + upsertBinding + evaluation pin + campaign_states running.
 */
import { useEffect, useMemo, useState } from "react";
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
import {
  peekActiveFirmId,
  setActiveFirmId,
  setPolicyDenyForced as forceEspPolicyDeny,
  useWireTick,
  wirePorts,
  type SendDenyReason,
} from "../../../wire";
import { useOperatorNav } from "../../prototype/operatorNav";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";
import {
  type ConfigPack,
  packLabel,
  publishedPacks,
  resolveEngagementBinding,
} from "./operatorConfigLibraries";
import { usePackCatalog } from "./packCatalogStore";

type Posture = "Armed" | "Active";

type FirmBindState = {
  firmId: string;
  evalPackId: string | null;
  autoPackId: string | null;
  engPackId: string | null;
  posture: Posture;
};

function seedBindRows(): FirmBindState[] {
  const sessionFirm = peekActiveFirmId();
  const demoRows: FirmBindState[] = [
    {
      firmId: DEMO_FIRMS[0].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "wf-optin-launch",
      engPackId: "agent-intake",
      posture: "Active",
    },
    {
      firmId: DEMO_FIRMS[1].id,
      evalPackId: "eval-soft-v1",
      autoPackId: "wf-eligibility-reactivation",
      engPackId: "agent-nudge",
      posture: "Armed",
    },
    {
      firmId: DEMO_FIRMS[2].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "wf-optin-launch",
      engPackId: "agent-intake",
      posture: "Armed",
    },
    { firmId: DEMO_FIRMS[3].id, evalPackId: null, autoPackId: null, engPackId: null, posture: "Armed" },
  ];
  // Binding: session firm is first — Bind Active writes that firm's campaign_states.
  if (sessionFirm && !demoRows.some((r) => r.firmId === sessionFirm)) {
    return [
      {
        firmId: sessionFirm,
        evalPackId: "eval-alg-v2",
        autoPackId: "wf-optin-launch",
        engPackId: "agent-intake",
        posture: "Armed",
      },
      ...demoRows,
    ];
  }
  return demoRows;
}

function isBound(row: FirmBindState) {
  return Boolean(row.evalPackId && row.autoPackId && row.engPackId);
}

const HELPER = "Published versions only — drafts omitted";

export function FirmOperationsBindModule() {
  const { jumpTo } = useOperatorNav();
  const [packs] = usePackCatalog();
  const [rows, setRows] = useState(seedBindRows);
  const [selectedId, setSelectedId] = useState(rows[0].firmId);
  const [bindOpen, setBindOpen] = useState(false);
  const [pickEval, setPickEval] = useState("");
  const [pickAuto, setPickAuto] = useState("");
  const [pickEng, setPickEng] = useState("");
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const tick = useWireTick();
  const [gateChips, setGateChips] = useState<
    Array<{ reason: SendDenyReason; label: string; blocking: boolean; advisory?: boolean }>
  >([]);
  const [gateNote, setGateNote] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<{ ok: boolean; detail: string } | null>(null);
  const [policyDenyForced, setPolicyDenyForced] = useState(false);
  const [activating, setActivating] = useState(false);

  const row = rows.find((r) => r.firmId === selectedId) ?? rows[0];
  const firm =
    DEMO_FIRMS.find((f) => f.id === row.firmId) ??
    (row.firmId === peekActiveFirmId()
      ? { id: row.firmId, name: `Session firm · ${row.firmId.slice(0, 8)}…`, stage: "Prepared Workspace", health: "Watch" as const }
      : DEMO_FIRMS[0]);
  const bound = isBound(row);

  // Keep session firm on the bind index when Auth/provision binds a new tenancy.
  useEffect(() => {
    const sessionFirm = peekActiveFirmId();
    if (!sessionFirm) return;
    setRows((prev) => {
      if (prev.some((r) => r.firmId === sessionFirm)) return prev;
      return [
        {
          firmId: sessionFirm,
          evalPackId: "eval-alg-v2",
          autoPackId: "wf-optin-launch",
          engPackId: "agent-intake",
          posture: "Armed",
        },
        ...prev,
      ];
    });
    setSelectedId(sessionFirm);
  }, [tick]);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      const chips = await wirePorts.sendGate.chips(row.firmId);
      if (alive) setGateChips(chips);
    })();
    return () => {
      alive = false;
    };
  }, [row.firmId, tick]);

  const activateBoundPacks = async (firmId: string, bind: FirmBindState) => {
    // Machine calls follow session firm — bind Active to the selected tenancy.
    setActiveFirmId(firmId);
    const evalPack = packs.find((p) => p.id === bind.evalPackId) ?? null;
    const engPack = packs.find((p) => p.id === bind.engPackId) ?? null;
    const engBind = resolveEngagementBinding(engPack);
    const notes: string[] = [];

    if (bind.autoPackId) {
      const activated = await wirePorts.machineApi.activateWorkflow(bind.autoPackId);
      notes.push(`workflow ${activated.workflowId}→${activated.status}`);
    }
    if (engBind) {
      const binding = await wirePorts.machineApi.upsertBinding({
        sequenceClass: engBind.sequenceClass,
        templateId: engBind.templateId,
        variableBindings: { firmId, engPackId: bind.engPackId },
      });
      notes.push(`binding ${binding.id ?? engBind.templateId}`);
    }
    if (evalPack?.pin) {
      await wirePorts.machineApi.putEvaluationPin(evalPack.id, evalPack.pin);
      // Firm-scoped pin alias so runtime can read eval.pin.firm.{firmId}
      await wirePorts.machineApi.putEvaluationPin(`firm.${firmId}`, evalPack.pin);
      notes.push(`eval pin ${evalPack.pin.referenceVersionId}`);
    }
    const camp = await wirePorts.machineApi.setCampaignState("running");
    notes.push(`campaign ${camp.state}`);
    return notes.join(" · ");
  };

  const setPosture = async (posture: Posture) => {
    setRows((prev) => prev.map((r) => (r.firmId === row.firmId ? { ...r, posture } : r)));
    if (posture !== "Active") {
      setGateNote(null);
      try {
        await wirePorts.machineApi.setCampaignState("armed-for-activation");
      } catch {
        /* stand-in / offline ok */
      }
      return;
    }
    if (!isBound(row)) {
      message.warning("Bind all three published packs before Active.");
      return;
    }
    setActivating(true);
    try {
      const detail = await activateBoundPacks(row.firmId, { ...row, posture: "Active" });
      const decision = await wirePorts.sendGate.decide({
        firmId: row.firmId,
        channel: "email",
        purpose: "cem",
        posture: "Active",
      });
      setGateNote(
        decision.allow
          ? `Active · ${detail}`
          : `Active wired (${detail}) but Send gate still denies (${decision.reasons.join(", ")}) — sends stay blocked until resolved.`,
      );
      message.success("Bind Active — workflow / binding / eval pin / campaign running");
    } catch (err) {
      setGateNote(`Active wire failed: ${String(err)}`);
      message.error(`Active wire failed: ${String(err)}`);
    } finally {
      setActivating(false);
    }
  };

  const probeCemLeave = async () => {
    setProbeResult(null);
    const decision = await wirePorts.sendGate.decide({
      firmId: row.firmId,
      channel: "email",
      purpose: "cem",
      posture: row.posture,
    });
    if (!decision.allow) {
      setProbeResult({ ok: false, detail: `Send gate denied · ${decision.reasons.join(", ")}` });
      return;
    }
    const pooled = await wirePorts.sendingPool.get(row.firmId);
    if (!pooled) {
      setProbeResult({
        ok: false,
        detail: "No pool allocated — open Sending infrastructure to allocate a subdomain first.",
      });
      return;
    }
    const result = await wirePorts.espMailer.send({
      to: "contact@example.test",
      from: `${firm.name} <hello@${pooled.fullDomain}>`,
      subject: "CEM probe",
      bodyText: "Probe send issued from Firm operations bind · Send gates.",
      firmId: row.firmId,
      sendingIdentityId: pooled.identityId,
      purpose: "cem",
    });
    setProbeResult(
      result.ok
        ? { ok: true, detail: `Sent (sink) · ${result.messageId}` }
        : { ok: false, detail: `ESP denied · ${result.deny}${result.detail ? ` — ${result.detail}` : ""}` },
    );
  };

  const togglePolicyDenyForced = async () => {
    const next = !policyDenyForced;
    forceEspPolicyDeny(next);
    setPolicyDenyForced(next);
    setGateChips(await wirePorts.sendGate.chips(row.firmId));
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
      render: (_, r) => (isBound(r) ? `${r.posture} · 3 packs` : "Unbound"),
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
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {label}
      </Typography.Text>
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
        <Button
          size="small"
          data-register-surface="Jump to Configuration libraries"
          onClick={() => { const n = "Jump to Configuration libraries"; jumpTo(n); setJumpNote(n); }}
          style={{ marginTop: 6 }}
        >
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
          extra={
            <Button size="small" onClick={openBindModal}>
              Bind packs
            </Button>
          }
        >
          <Hint>House-authored published versions only — drafts omitted. Catalog shared with Configuration libraries.</Hint>
          {bound ? (
            <Space wrap data-register-surface="Bound-version chips">
              {boundPacks.eval ? <StatusTag label={`Evaluation · ${packLabel(boundPacks.eval)}`} /> : null}
              {boundPacks.auto ? <StatusTag label={`Automation · ${packLabel(boundPacks.auto)}`} /> : null}
              {boundPacks.eng ? <StatusTag label={`Engagement · ${packLabel(boundPacks.eng)}`} /> : null}
            </Space>
          ) : (
            <Space>
              <Typography.Text type="secondary">No packs bound</Typography.Text>
              <Button
                size="small"
                data-register-surface="Jump to Configuration libraries"
                onClick={() => { const n = "Jump to Configuration libraries"; jumpTo(n); setJumpNote(n); }}
              >
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
            disabled={!bound || activating}
            value={row.posture}
            onChange={(v) => void setPosture(v as Posture)}
            options={[
              { label: "Armed", value: "Armed" },
              { label: activating ? "Activating…" : "Active", value: "Active" },
            ]}
          />
          {gateNote ? (
            <Typography.Text type="secondary" style={{ display: "block", marginTop: 10 }}>
              {gateNote}
            </Typography.Text>
          ) : null}
        </Card>
      </Surface>

      <Surface label="Send gates" style={{ marginTop: 16 }}>
        <Card
          size="small"
          title="Send gates"
          extra={
            <StatusTag
              label={gateChips.some((c) => c.blocking) ? "blocking" : "clear"}
              color={gateChips.some((c) => c.blocking) ? "error" : "success"}
            />
          }
        >
          <Hint>
            Fail-closed snapshot from sendGate.chips — setting Active does not silence a deny; it stays blocking
            until resolved.
          </Hint>

          <Surface label="Domain authentication readiness" style={{ marginBottom: 10 }}>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
              Domain authentication readiness
            </Typography.Text>
            {(() => {
              const authChip = gateChips.find((c) => c.reason === "auth");
              return (
                <StatusTag
                  label={authChip ? (authChip.blocking ? "auth not ready" : "auth ready") : "auth unknown"}
                  color={authChip?.blocking ? "error" : "success"}
                />
              );
            })()}
          </Surface>

          <Space wrap style={{ marginBottom: 12 }}>
            {gateChips.map((c) => (
              <span key={c.reason} data-register-surface={c.reason === "policy" ? "ESP policy reject" : undefined}>
                <StatusTag
                  label={c.label}
                  color={c.advisory ? "warning" : c.blocking ? "error" : "success"}
                />
              </span>
            ))}
          </Space>

          <Space wrap>
            <Button onClick={() => void probeCemLeave()}>Probe CEM leave</Button>
            <Button
              type={policyDenyForced ? "primary" : "default"}
              danger={policyDenyForced}
              onClick={() => void togglePolicyDenyForced()}
            >
              {policyDenyForced ? "Force ESP policy deny · ON" : "Force ESP policy deny"}
            </Button>
          </Space>
          {probeResult ? (
            <Typography.Text
              type={probeResult.ok ? "success" : "danger"}
              style={{ display: "block", marginTop: 8 }}
            >
              {probeResult.detail}
            </Typography.Text>
          ) : null}
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
              r.firmId === row.firmId
                ? { ...r, evalPackId: pickEval, autoPackId: pickAuto, engPackId: pickEng }
                : r,
            ),
          );
          setBindOpen(false);
          message.success("Packs bound");
        }}
        okText="Bind"
        okButtonProps={{ disabled: !pickEval || !pickAuto || !pickEng, "data-register-surface": "Bind" } as object}
      >
        <Surface label="Bind packs">
          <Typography.Paragraph type="secondary">
            {firm.name} — select three published versions.
          </Typography.Paragraph>
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
