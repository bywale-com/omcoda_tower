/**
 * Founder kill-switch — Confirm writes firm-book halt via wirePorts.haltStore (H1).
 * Not a local-only killed flag — engagement runners / send gates honor halt_records.
 * Kill targets = session/real firms — never DEMO_FIRMS.
 */
import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Modal, Segmented, Space, Typography, message } from "antd";
import { useWireTick, wirePorts } from "../../../wire";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";
import {
  peekOperatorFirms,
  resolveOperatorFirms,
  type OperatorFirm,
} from "./operatorFirmIndex";

type BoundRow = { key: string; value: string };

const DEFAULT_BOUNDS: BoundRow[] = [
  { key: "Approach click budget", value: "≤ 3 clicks to capture" },
  { key: "CASL triad", value: "Consent · identity · unsubscribe always on" },
  { key: "Escrow rail", value: "Firm↔Om Coda only — no client funds" },
  { key: "Authorship seat", value: "Configuration libraries · never firm Hub" },
];

const FOUNDER_ACTOR = "founder";

export function FounderAgencyControlsModule() {
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [lastSaved, setLastSaved] = useState({ at: "Today · 11:05", actor: "founder" });
  const [killed, setKilled] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [killScopeMode, setKillScopeMode] = useState<"fleet" | "selected">("fleet");
  const [killReason, setKillReason] = useState("");
  const [firms, setFirms] = useState<OperatorFirm[]>(() => peekOperatorFirms());
  const wireTick = useWireTick();

  useEffect(() => {
    let cancelled = false;
    void resolveOperatorFirms().then((next) => {
      if (!cancelled) setFirms(next);
    });
    return () => {
      cancelled = true;
    };
  }, [wireTick]);

  const selectedTargets = firms.slice(0, Math.min(3, firms.length));
  const targetFirms = killScopeMode === "fleet" ? [...firms] : selectedTargets;
  const firmCount = targetFirms.length;
  const firmIds = targetFirms.map((f) => f.name).join(" · ") || "—";

  useEffect(() => {
    if (firms.length === 0) {
      setKilled(false);
      return;
    }
    let cancelled = false;
    void Promise.all(firms.map((f) => wirePorts.haltStore.isFirmBookHalted(f.id))).then(
      (flags) => {
        if (!cancelled) setKilled(flags.some(Boolean));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [wireTick, firms]);

  const onConfirmHalt = async () => {
    if (targetFirms.length === 0) {
      message.warning("No session/real firms to halt");
      return;
    }
    setCommitting(true);
    try {
      await Promise.all(
        targetFirms.map((firm) =>
          wirePorts.haltStore.commit({
            consultantId: FOUNDER_ACTOR,
            firmId: firm.id,
            scope: "firm-book",
            reason: killReason.trim() || `Kill-switch · ${killScopeMode}`,
          }),
        ),
      );
      setKilled(true);
      setConfirmOpen(false);
      message.success(
        `Halt committed · firm-book · ${firmCount} firm${firmCount === 1 ? "" : "s"} (H1 suppression)`,
      );
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Halt commit failed");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <ModulePage
      title="Founder & agency controls"
      surface="Founder & agency controls"
      extra={<StatusTag label={killed ? "halted" : "standby"} color={killed ? "error" : "default"} />}
    >
      <Surface label="Agency policy">
        <Card size="small" title="Agency policy">
          <Hint>Cross-firm limits, what may bind, and what may send — never on Consultant nav.</Hint>
          <Surface label="Last-saved glance">
            <Space wrap style={{ marginBottom: 12 }}>
              <StatusTag label={`last-saved · ${lastSaved.at}`} />
              <StatusTag label={lastSaved.actor} color="processing" />
            </Space>
          </Surface>
          <Surface label="Bounds">
            <Form layout="vertical">
              {bounds.map((row, index) => (
                <Form.Item key={row.key} label={row.key}>
                  <Input
                    value={row.value}
                    onChange={(e) =>
                      setBounds((prev) => prev.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))
                    }
                  />
                </Form.Item>
              ))}
            </Form>
          </Surface>
          <Button
            type="primary"
            data-register-surface="Save policy"
            onClick={() => setLastSaved({ at: new Date().toLocaleTimeString(), actor: "founder" })}
          >
            Save policy
          </Button>
        </Card>
      </Surface>

      <Card size="small" title="Kill-switch" style={{ marginTop: 16 }} extra={<StatusTag label={killed ? "halted" : "standby"} color={killed ? "error" : "default"} />}>
        <Typography.Paragraph type="secondary">
          Halts outbound and Approach spend — fleet-wide or selected tenancies. Confirm writes{" "}
          <code>halt_records</code> (firm-book) so new enrollments and new sends are suppressed (H1).
          In-flight attempts are left alone.
        </Typography.Paragraph>
        <Button
          onClick={() => { setKillReason(""); setKillScopeMode("fleet"); setKillOpen(true); }}
          disabled={firms.length === 0}
        >
          Open Kill-switch
        </Button>
        {firms.length === 0 ? (
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            No session/real firms bound — kill targets empty.
          </Typography.Text>
        ) : null}
      </Card>

      <Modal
        title="Kill-switch"
        open={killOpen}
        onCancel={() => setKillOpen(false)}
        okText="Review confirmation"
        okButtonProps={{ disabled: !killReason.trim() || firmCount === 0 }}
        onOk={() => {
          setKillOpen(false);
          setConfirmOpen(true);
        }}
      >
        <Surface label="Kill-switch">
          <Segmented
            block
            value={killScopeMode}
            onChange={(v) => setKillScopeMode(v as "fleet" | "selected")}
            options={[
              { label: "Fleet-wide", value: "fleet" },
              { label: "Selected tenancies", value: "selected" },
            ]}
            style={{ marginBottom: 12 }}
          />
          {killScopeMode === "selected" ? (
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              Targets · {selectedTargets.map((f) => `${f.name} (${f.id})`).join(" · ") || "—"}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              Fleet · {firms.map((f) => f.id).join(" · ") || "—"}
            </Typography.Text>
          )}
          <Input.TextArea
            rows={3}
            placeholder="Policy enforcement or emergency reason…"
            value={killReason}
            onChange={(e) => setKillReason(e.target.value)}
          />
        </Surface>
      </Modal>

      <Modal
        title="Confirm Halt motion"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        okText="Halt motion"
        okType="danger"
        confirmLoading={committing}
        onOk={() => void onConfirmHalt()}
      >
        <Surface label="Kill-switch confirmation">
          <dl style={{ fontSize: 13, display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
            <dt>Scope</dt>
            <dd>{killScopeMode === "fleet" ? "Fleet-wide · firm-book" : "Selected tenancies · firm-book"}</dd>
            <dt>Firm count</dt>
            <dd>{firmCount}</dd>
            <dt>Firms</dt>
            <dd>{firmIds}</dd>
            <dt>Firm ids</dt>
            <dd>{targetFirms.map((f) => f.id).join(" · ") || "—"}</dd>
            <dt>Reason</dt>
            <dd>{killReason.trim()}</dd>
            <dt>Audit preview</dt>
            <dd>Kill-switch · {killScopeMode} · {firmCount} firms · actor founder · haltStore.commit</dd>
          </dl>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
