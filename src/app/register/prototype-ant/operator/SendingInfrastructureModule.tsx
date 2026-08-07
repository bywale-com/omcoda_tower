/**
 * Sending infrastructure — pool-send path (deliv-04). Allocates a house-managed branded
 * subdomain per firm, authenticates it on the house zone, warms it up, and previews the
 * CEM envelope (deliv-19). Custom-domain attach is a deferred upgrade — not built here.
 *
 * Fixture honesty: DNS auth chips only flip green from an explicit platform-ops action
 * (markPlatformDnsPublished) — never automatically on allocate. Founder-input fixtures
 * (ESP account, postmaster) are likewise only markable by an explicit founder action.
 */
import { useEffect, useState } from "react";
import { Button, Col, Input, Row, Select, Space, Typography } from "antd";
import {
  FOUNDER_INPUT_FIXTURES,
  bootstrapRealAccountFixtures,
  fixtureMeta,
  isFixturePresent,
  markFixture,
  useWireTick,
  wirePorts,
  type IpPoolTier,
  type PoolSubdomain,
  type WarmupStage,
  type WarmupState,
} from "../../../wire";
import { Hint, ModulePage, Surface } from "../chrome";
import { DEMO_FIRMS } from "./operatorAntData";
import { StatusTag } from "./operatorAntTags";

const WARMUP_STAGES: WarmupStage[] = ["cold", "ramp", "steady", "hold", "re-warmup"];
const FOUNDER_ROW_IDS = FOUNDER_INPUT_FIXTURES.filter(
  (id) =>
    id === "esp_account_provisioned" ||
    id === "postmaster_enrolled" ||
    id === "ca_sms_number_provisioned" ||
    id === "sms_account_provisioned",
);

export function SendingInfrastructureModule() {
  const tick = useWireTick();
  const [firmId, setFirmId] = useState<string>(DEMO_FIRMS[0].id);
  const [slug, setSlug] = useState(DEMO_FIRMS[0].id.replace(/^firm-/, ""));
  const [localPart, setLocalPart] = useState("hello");
  const [pool, setPool] = useState<PoolSubdomain | null>(null);
  const [authChips, setAuthChips] = useState<
    Array<{ id: string; label: string; present: boolean; fixture: string }>
  >([]);
  const [warmup, setWarmup] = useState<WarmupState | null>(null);
  const [ipTier, setIpTier] = useState<{ tier: IpPoolTier; ptrReady: boolean } | null>(null);
  const [allocNote, setAllocNote] = useState<string | null>(null);
  const [dnsMarkedNote, setDnsMarkedNote] = useState<string | null>(null);

  useEffect(() => {
    void bootstrapRealAccountFixtures();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, chips, w, tier] = await Promise.all([
        wirePorts.sendingPool.get(firmId),
        wirePorts.sendingPool.authChips(firmId),
        wirePorts.warmup.get(firmId),
        wirePorts.ipPool.getTier(firmId),
      ]);
      if (!alive) return;
      setPool(p);
      setAuthChips(chips);
      setWarmup(w);
      setIpTier(tier);
    })();
    return () => {
      alive = false;
    };
  }, [firmId, tick]);

  const firm = DEMO_FIRMS.find((f) => f.id === firmId) ?? DEMO_FIRMS[0];
  const authReady = authChips.length > 0 && authChips.every((c) => c.present);

  async function onAllocate() {
    const row = await wirePorts.sendingPool.allocate(firmId, slug);
    setPool(row);
    setAuthChips(await wirePorts.sendingPool.authChips(firmId));
    setAllocNote(`Allocated · ${row.fullDomain}`);
  }

  async function onMarkDns() {
    try {
      await wirePorts.sendingPool.markPlatformDnsPublished(firmId);
      setAuthChips(await wirePorts.sendingPool.authChips(firmId));
      setDnsMarkedNote(`Resend verify polled · ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setDnsMarkedNote(err instanceof Error ? err.message : "Verify failed");
    }
  }

  async function onSetStage(stage: WarmupStage) {
    setWarmup(await wirePorts.warmup.setStage(firmId, stage));
  }

  async function onAssignShared() {
    await wirePorts.ipPool.assignShared(firmId);
    setIpTier(await wirePorts.ipPool.getTier(firmId));
  }

  return (
    <ModulePage
      title="Sending infrastructure"
      surface="Sending infrastructure"
      extra={
        <Select
          size="small"
          value={firmId}
          onChange={(v) => {
            setFirmId(v);
            setSlug(v.replace(/^firm-/, ""));
            setAllocNote(null);
            setDnsMarkedNote(null);
          }}
          style={{ width: 200 }}
          options={DEMO_FIRMS.map((f) => ({ value: f.id, label: f.name }))}
        />
      }
    >
      <Hint>
        Pool path (default) — zero firm DNS. Custom-domain attach is a deferred upgrade, not
        built here.
      </Hint>

      <Surface label="Sending-domain pool">
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Sending-domain pool
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          House-managed zone — allocates a branded subdomain per firm on request. No firm DNS
          act on this path.
        </Typography.Paragraph>
        {pool ? (
          <Row gutter={8} style={{ marginBottom: 12 }}>
            <Col span={8}>
              <Typography.Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                Full domain
              </Typography.Text>
              <Typography.Text strong>{pool.fullDomain}</Typography.Text>
            </Col>
            <Col span={8}>
              <Typography.Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                Identity id
              </Typography.Text>
              <Typography.Text strong>{pool.identityId}</Typography.Text>
            </Col>
            <Col span={8}>
              <Typography.Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                Path
              </Typography.Text>
              <Typography.Text strong>{pool.path}</Typography.Text>
            </Col>
          </Row>
        ) : (
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Not allocated yet.
          </Typography.Text>
        )}
        <Space align="end">
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              Slug
            </Typography.Text>
            <Input
              size="small"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={Boolean(pool)}
              style={{ width: 160 }}
            />
          </div>
          <Button
            type="primary"
            data-register-surface="Allocate subdomain"
            onClick={onAllocate}
            disabled={Boolean(pool)}
          >
            Allocate subdomain
          </Button>
          {allocNote ? <Typography.Text type="success">{allocNote}</Typography.Text> : null}
        </Space>
      </Surface>

      <Surface label="Authentication panel" style={{ marginTop: 16 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Authentication panel
          </Typography.Title>
          <StatusTag label={authReady ? "ready" : "not ready"} color={authReady ? "success" : "warning"} />
        </Space>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          SPF / DKIM / DMARC / Return-Path on the house zone. Fixture-honest — never
          auto-green; platform ops must explicitly publish.
        </Typography.Paragraph>
        <Space wrap style={{ marginBottom: 12 }}>
          {authChips.map((c) => (
            <StatusTag key={c.id} label={c.label} color={c.present ? "success" : "error"} />
          ))}
        </Space>
        <Button data-register-surface="Mark platform DNS published" onClick={onMarkDns} disabled={!pool}>
          Verify domain in Resend
        </Button>
        <Typography.Text type="secondary" style={{ display: "block", marginTop: 6, fontSize: 11 }}>
          Explicit platform-ops fixture action — not automatic on allocate.
        </Typography.Text>
        {dnsMarkedNote ? (
          <Typography.Text type="success" style={{ display: "block", marginTop: 6 }}>
            {dnsMarkedNote}
          </Typography.Text>
        ) : null}
      </Surface>

      <Surface label="Warmup" style={{ marginTop: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Warmup
        </Typography.Title>
        <Space wrap style={{ marginBottom: 10 }}>
          {WARMUP_STAGES.map((s) => (
            <StatusTag key={s} label={s} color={warmup?.stage === s ? "processing" : "default"} />
          ))}
        </Space>
        <Space wrap style={{ marginBottom: 10 }}>
          {WARMUP_STAGES.map((s) => (
            <Button key={s} size="small" onClick={() => onSetStage(s)}>
              Set {s}
            </Button>
          ))}
        </Space>
        <Typography.Text type="secondary">
          Remaining today · <strong>{warmup?.remaining ?? 0}</strong> / {warmup?.dailyCap ?? 0}
        </Typography.Text>
      </Surface>

      <Surface label="Envelope panel" style={{ marginTop: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Envelope panel
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          CEM From preview — firm display name, no shared platform From (deliv-19).
        </Typography.Paragraph>
        {pool ? (
          <Space align="end">
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                Local-part
              </Typography.Text>
              <Input
                size="small"
                value={localPart}
                onChange={(e) => setLocalPart(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
            <Typography.Text code>
              {firm.name} &lt;{localPart || "hello"}@{pool.fullDomain}&gt;
            </Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">
            Allocate a subdomain to preview the envelope.
          </Typography.Text>
        )}
      </Surface>

      <Surface label="Reputation units" style={{ marginTop: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Reputation units
        </Typography.Title>
        <Space wrap style={{ marginBottom: 10 }}>
          <StatusTag label={`tier · ${ipTier?.tier ?? "shared"}`} />
          <StatusTag
            label={ipTier?.ptrReady ? "PTR ready" : "PTR n/a (shared)"}
            color={ipTier?.ptrReady ? "success" : "default"}
          />
        </Space>
        <Button onClick={onAssignShared}>Assign shared IP</Button>
        <Typography.Paragraph type="secondary" style={{ marginTop: 10, fontSize: 11 }}>
          Shared tier is the default — dedicated IP + PTR is a founder-input upgrade, not built
          here. Custom-domain attach is likewise deferred.
        </Typography.Paragraph>
      </Surface>

      <Surface label="Founder inputs" style={{ marginTop: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Founder inputs (not modelable — never auto-green)
        </Typography.Title>
        <Space direction="vertical" style={{ width: "100%" }}>
          {FOUNDER_ROW_IDS.map((id) => {
            const meta = fixtureMeta(id);
            const present = isFixturePresent(id);
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  padding: "8px 10px",
                }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: 12 }}>
                    {meta.label}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ display: "block", fontSize: 10 }}>
                    {id} · founder-input
                  </Typography.Text>
                </div>
                <Space>
                  <StatusTag label={present ? "provisioned" : "missing"} color={present ? "success" : "warning"} />
                  <Button
                    size="small"
                    onClick={() =>
                      markFixture({
                        id,
                        present: !present,
                        markedBy: "founder",
                        note: "CT founder-input demo",
                      })
                    }
                  >
                    {present ? "Unmark" : "Mark provisioned"}
                  </Button>
                </Space>
              </div>
            );
          })}
        </Space>
      </Surface>
    </ModulePage>
  );
}
