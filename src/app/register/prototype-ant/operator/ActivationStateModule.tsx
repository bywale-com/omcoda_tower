/**
 * Activation state — per-firm activation progress checklist with Jump links.
 * authorize-book / ready-to-send / escrow-held read live wire ports — fail closed
 * until the CRM grant, sending-identity DNS fixtures, and escrow hold are real.
 *
 * Index = session/real firms — never DEMO_FIRMS densification. Live gate reads kept.
 */
import { useEffect, useState } from "react";
import { Button, Progress, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { isSendingIdentityReady, useWireTick, wirePorts } from "../../../wire";
import { useOperatorNav } from "../../prototype/operatorNav";
import { loadForwardDeployStagingForFirm } from "../../prototype/operator/operatorWireHelpers";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";
import {
  firmDisplayName,
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

type Gate = { id: string; title: string; done: boolean; jump?: string };

type ActivationRow = {
  firmId: string;
  pct: number;
  next: string;
};

type LiveGates = {
  authorizeBook: boolean;
  readyToSend: boolean;
  escrowHeld: boolean;
  forwardDeployed: boolean;
  campaignRunning: boolean;
};

const EMPTY_LIVE: LiveGates = {
  authorizeBook: false,
  readyToSend: false,
  escrowHeld: false,
  forwardDeployed: false,
  campaignRunning: false,
};

function rowForFirm(firmId: string, live: LiveGates): ActivationRow {
  const checks = [
    live.forwardDeployed,
    live.authorizeBook,
    live.readyToSend,
    live.escrowHeld,
    live.campaignRunning ||
      (live.forwardDeployed && live.authorizeBook && live.readyToSend && live.escrowHeld),
  ];
  const done = checks.filter(Boolean).length;
  const pct = Math.round((done / checks.length) * 100);
  let next = "Running";
  if (!live.forwardDeployed) next = "Forward-deployed";
  else if (!live.authorizeBook) next = "Authorize book";
  else if (!live.readyToSend) next = "Ready to send";
  else if (!live.escrowHeld) next = "Escrow held";
  else if (!checks[4]) next = "Running";
  else next = "—";
  return { firmId, pct, next };
}

export function ActivationStateModule() {
  const { jumpTo } = useOperatorNav();
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const [rows, setRows] = useState<ActivationRow[]>(() =>
    peekOperatorFirms().map((f) => rowForFirm(f.id, EMPTY_LIVE)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(() => peekOperatorFirms()[0]?.id ?? null);
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const [live, setLive] = useState<LiveGates>(EMPTY_LIVE);
  const wireTick = useWireTick();

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then((nextFirms) => {
      if (cancelled) return;
      setFirms(nextFirms);
      setSelectedId((prev) => {
        if (prev && nextFirms.some((f) => f.id === prev)) return prev;
        return nextFirms[0]?.id ?? null;
      });
      setRows(nextFirms.map((f) => rowForFirm(f.id, EMPTY_LIVE)));
    });
    return () => {
      cancelled = true;
    };
  }, [wireTick]);

  useEffect(() => {
    if (!selectedId) {
      setLive(EMPTY_LIVE);
      return;
    }
    let cancelled = false;
    void Promise.all([
      wirePorts.crmOAuth.get(selectedId),
      wirePorts.escrow.get(selectedId),
      wirePorts.machineApi.getCampaignState().catch(() => null),
      loadForwardDeployStagingForFirm(selectedId),
    ]).then(([grant, escrow, campaign, staging]) => {
      if (cancelled) return;
      const deployStaging = staging ?? "idle";
      const nextLive: LiveGates = {
        authorizeBook: grant.granted && !grant.revoked,
        readyToSend: isSendingIdentityReady(selectedId),
        escrowHeld: escrow.status === "held",
        forwardDeployed: deployStaging === "hydrated" || deployStaging === "enriching",
        campaignRunning: campaign?.state === "running",
      };
      setLive(nextLive);
      setRows((prev) =>
        prev.map((r) => (r.firmId === selectedId ? rowForFirm(selectedId, nextLive) : r)),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, wireTick]);

  const row = rows.find((r) => r.firmId === selectedId) ?? rows[0] ?? null;
  const firm = selectedId ? firms.find((f) => f.id === selectedId) : null;
  const firmName = selectedId ? firmDisplayName(firms, selectedId) : "No firm";

  const gates: Gate[] = [
    {
      id: "forward-deployed",
      title: "Forward-deployed",
      done: live.forwardDeployed,
      jump: live.forwardDeployed ? undefined : "Jump to Activation & forward-deploy",
    },
    {
      id: "authorize-book",
      title: "Authorize book",
      done: live.authorizeBook,
      jump: live.authorizeBook ? undefined : "Jump to Activation & forward-deploy",
    },
    {
      id: "ready-to-send",
      title: "Ready to send",
      done: live.readyToSend,
      jump: live.readyToSend ? undefined : "Jump to Sending infrastructure",
    },
    {
      id: "escrow-held",
      title: "Escrow held",
      done: live.escrowHeld,
      jump: live.escrowHeld ? undefined : "Jump to Commercial",
    },
    {
      id: "running",
      title: "Running",
      done:
        live.campaignRunning ||
        (live.forwardDeployed && live.authorizeBook && live.readyToSend && live.escrowHeld),
    },
  ];
  const stalledCount = gates.filter((g) => !g.done && g.jump).length;

  const firmColumns: ColumnsType<ActivationRow> = [
    {
      title: "Firm",
      key: "firm",
      render: (_, r) => firmDisplayName(firms, r.firmId),
    },
    { title: "Progress", dataIndex: "pct", key: "pct", width: 80, render: (p) => `${p}%` },
    { title: "Next gate", dataIndex: "next", key: "next", width: 140 },
  ];

  const gateColumns: ColumnsType<Gate> = [
    { title: "Gate", dataIndex: "title", key: "title" },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, g) => <StatusTag label={g.done ? "complete" : "pending"} color={g.done ? "success" : "warning"} />,
    },
    {
      title: "",
      key: "jump",
      width: 200,
      render: (_, g) =>
        !g.done && g.jump ? (
          <Button size="small" data-register-surface="Progress Jump" onClick={() => { jumpTo(g.jump!); setJumpNote(g.jump!); }}>
            {g.jump}
          </Button>
        ) : null,
    },
  ];

  return (
    <ModulePage title="Activation state" surface="Activation state">
      <Table
        size="small"
        rowKey="firmId"
        columns={firmColumns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: "No firms — provision or select a session firm." }}
        rowSelection={
          rows.length > 0
            ? {
                type: "radio",
                selectedRowKeys: selectedId ? [selectedId] : [],
                onChange: (keys) => {
                  setSelectedId(keys[0] as string);
                  setJumpNote(null);
                },
              }
            : undefined
        }
      />

      {row ? (
        <Surface label="Progress" style={{ marginTop: 16 }}>
          <Space wrap style={{ marginBottom: 8 }}>
            <Typography.Text type="secondary">
              Selected firm · <strong>{firmName}</strong>
              {firm?.stage ? ` · ${firm.stage}` : ""}
            </Typography.Text>
            {stalledCount > 0
              ? <StatusTag label={`${stalledCount} stalled · Jump available`} color="warning" />
              : <StatusTag label="Gates clear" color="success" />}
          </Space>
          {jumpNote ? <Typography.Text type="success">Opened · {jumpNote}</Typography.Text> : null}
          <Progress percent={row.pct} size="small" style={{ marginBottom: 16 }} />
          <Hint>
            Authorize book, Ready to send, and Escrow held read live from crmOAuth /
            sending-identity DNS fixtures / escrow — never hard-coded green. Operator does not
            fake-complete consultant commits.
          </Hint>
          <Table size="small" rowKey="id" columns={gateColumns} dataSource={gates} pagination={false} />
        </Surface>
      ) : null}
    </ModulePage>
  );
}
