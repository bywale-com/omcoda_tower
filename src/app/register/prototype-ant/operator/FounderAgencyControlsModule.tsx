/**
 * Founder kill-switch — use stepped Modals for scope + reason (Modal.confirm style).
 */
import { useState } from "react";
import { Button, Card, Form, Input, Modal, Segmented, Space, Typography } from "antd";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

type BoundRow = { key: string; value: string };

const DEFAULT_BOUNDS: BoundRow[] = [
  { key: "Approach click budget", value: "≤ 3 clicks to capture" },
  { key: "CASL triad", value: "Consent · identity · unsubscribe always on" },
  { key: "Escrow rail", value: "Firm↔Om Coda only — no client funds" },
  { key: "Authorship seat", value: "Configuration libraries · never firm Hub" },
];

export function FounderAgencyControlsModule() {
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [lastSaved, setLastSaved] = useState({ at: "Today · 11:05", actor: "founder" });
  const [killed, setKilled] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [killScopeMode, setKillScopeMode] = useState<"fleet" | "selected">("fleet");
  const [killReason, setKillReason] = useState("");

  const selectedTargets = DEMO_FIRMS.slice(0, 3);
  const firmCount = killScopeMode === "fleet" ? DEMO_FIRMS.length : selectedTargets.length;
  const firmIds =
    killScopeMode === "fleet"
      ? DEMO_FIRMS.map((f) => f.name).join(" · ")
      : selectedTargets.map((f) => f.name).join(" · ");

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
          Halts outbound and Approach spend — fleet-wide or selected tenancies.
        </Typography.Paragraph>
        <Button onClick={() => { setKillReason(""); setKillScopeMode("fleet"); setKillOpen(true); }}>
          Open Kill-switch
        </Button>
      </Card>

      <Modal
        title="Kill-switch"
        open={killOpen}
        onCancel={() => setKillOpen(false)}
        okText="Review confirmation"
        okButtonProps={{ disabled: !killReason.trim() }}
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
              Targets · {selectedTargets.map((f) => f.name).join(" · ")}
            </Typography.Text>
          ) : null}
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
        onOk={() => {
          setKilled(true);
          setConfirmOpen(false);
        }}
      >
        <Surface label="Kill-switch confirmation">
          <dl style={{ fontSize: 13, display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
            <dt>Scope</dt>
            <dd>{killScopeMode === "fleet" ? "Fleet-wide" : "Selected tenancies"}</dd>
            <dt>Firm count</dt>
            <dd>{firmCount}</dd>
            <dt>Firms</dt>
            <dd>{firmIds}</dd>
            <dt>Reason</dt>
            <dd>{killReason.trim()}</dd>
            <dt>Audit preview</dt>
            <dd>Kill-switch · {killScopeMode} · {firmCount} firms · actor founder</dd>
          </dl>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
