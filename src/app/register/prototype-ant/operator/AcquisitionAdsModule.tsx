/**
 * Acquisition & ads — campaign Table, editor Drawer, instrumentation, kill criteria Modal.
 */
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CT_DEMO,
  useWireTick,
  wirePorts,
  type MetaCampaignState,
  type MetaDeliveryState,
  type MetaReviewState,
} from "../../../wire";
import { Hint, ModulePage, Surface } from "../chrome";
import { StatusTag } from "./operatorAntTags";

const REVIEW_STATES: MetaReviewState[] = ["draft", "in_review", "approved", "rejected"];
const DELIVERY_STATES: MetaDeliveryState[] = ["not_started", "scheduled", "active", "paused", "ended"];

function reviewColor(review: MetaReviewState): "success" | "warning" | "error" | "default" {
  if (review === "approved") return "success";
  if (review === "rejected") return "error";
  if (review === "in_review") return "warning";
  return "default";
}

function deliveryColor(delivery: MetaDeliveryState): "success" | "warning" | "error" | "default" {
  if (delivery === "active") return "success";
  if (delivery === "paused") return "error";
  if (delivery === "scheduled") return "warning";
  return "default";
}

type CampaignStatus = "Live" | "Paused" | "Draft";

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: string;
  captures: number;
  feedCreative: string;
  adCopy: string;
  captureName: string;
  captureWebsite: string;
  captureChannel: string;
};

const INITIAL: Campaign[] = [
  {
    id: "camp-q3",
    name: "Approach · Q3 RCIC pilots",
    status: "Live",
    budget: "≤ 3 clicks / lead",
    captures: 42,
    feedCreative: "RCIC desk · one-tap firm capture",
    adCopy: "Run your immigration desk on Tower — name + site in one tap.",
    captureName: "Priya Desai, RCIC",
    captureWebsite: "cedarpathways.ca",
    captureChannel: "WhatsApp",
  },
  {
    id: "camp-retarget",
    name: "Warm retarget · site visitors",
    status: "Paused",
    budget: "≤ 2 clicks / lead",
    captures: 18,
    feedCreative: "Still evaluating Tower?",
    adCopy: "Return to your captured firm seed — continue in one tap.",
    captureName: "Harbor RCIC Desk",
    captureWebsite: "harborrcic.ca",
    captureChannel: "Email",
  },
  {
    id: "camp-assist",
    name: "Assisted OLG mirror (non-Meta)",
    status: "Draft",
    budget: "Operator-led",
    captures: 0,
    feedCreative: "Operator-assisted onboarding mirror",
    adCopy: "Same desk as ALG — assisted door only.",
    captureName: "",
    captureWebsite: "",
    captureChannel: "Email",
  },
];

const INSTRUMENTATION: Record<string, { dontUnderstand: number; understandDontTap: number; continueScroll: number }> = {
  "camp-q3": { dontUnderstand: 1240, understandDontTap: 380, continueScroll: 2100 },
  "camp-retarget": { dontUnderstand: 420, understandDontTap: 95, continueScroll: 680 },
  "camp-assist": { dontUnderstand: 0, understandDontTap: 0, continueScroll: 0 },
};

export function AcquisitionAdsModule() {
  const [campaigns, setCampaigns] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(INITIAL[0].id);
  const [editorOpen, setEditorOpen] = useState(false);
  const [instrId, setInstrId] = useState(INITIAL[0].id);
  const [killOpen, setKillOpen] = useState(false);
  const [killThreshold, setKillThreshold] = useState("400");
  const [killAction, setKillAction] = useState<"hold" | "kill">("hold");
  const [waitingJump, setWaitingJump] = useState<string | null>(null);
  const [metaState, setMetaState] = useState<MetaCampaignState | null>(null);
  const wireTick = useWireTick();
  const waitingForHydrate = 7;

  useEffect(() => {
    let cancelled = false;
    void wirePorts.metaAds.getCampaign(CT_DEMO.firmId).then((s) => {
      if (!cancelled) setMetaState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [wireTick]);

  async function setReview(review: MetaReviewState) {
    const next = await wirePorts.metaAds.setReview(CT_DEMO.firmId, review);
    setMetaState(next);
  }

  async function setDelivery(delivery: MetaDeliveryState) {
    const next = await wirePorts.metaAds.setDelivery(CT_DEMO.firmId, delivery);
    setMetaState(next);
  }

  const selected = campaigns.find((c) => c.id === selectedId) ?? campaigns[0];
  const instr = INSTRUMENTATION[instrId] ?? INSTRUMENTATION["camp-q3"];

  const patchSelected = (patch: Partial<Campaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: "Campaign",
      dataIndex: "name",
      key: "name",
      render: (name, row) => (
        <Button type="link" size="small" onClick={() => { setSelectedId(row.id); setEditorOpen(true); }}>
          {name}
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (s: CampaignStatus) => (
        <StatusTag
          label={s}
          color={s === "Live" ? "success" : s === "Paused" ? "warning" : "default"}
        />
      ),
    },
    { title: "Captures", dataIndex: "captures", key: "captures", width: 80 },
    { title: "Budget", dataIndex: "budget", key: "budget", width: 140 },
  ];

  return (
    <ModulePage title="Acquisition & ads" surface="Acquisition & ads">
      <Hint>
        Meta ad supply is external intent — Tower configures what to send; no Meta UI in Tower.
      </Hint>

      <Surface label="Approach campaigns">
        <Space style={{ marginBottom: 12 }} wrap>
          <Button
            onClick={() => {
              const id = `camp-${Date.now().toString().slice(-5)}`;
              const camp: Campaign = {
                id,
                name: "New Approach campaign",
                status: "Draft",
                budget: "≤ 3 clicks / lead",
                captures: 0,
                feedCreative: "",
                adCopy: "",
                captureName: "",
                captureWebsite: "",
                captureChannel: "Email",
              };
              setCampaigns((p) => [...p, camp]);
              setSelectedId(id);
              setEditorOpen(true);
              message.success("New campaign draft created");
            }}
          >
            New campaign
          </Button>
        </Space>
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={campaigns}
          pagination={false}
          rowSelection={{
            type: "radio",
            selectedRowKeys: [selectedId],
            onChange: (keys) => setSelectedId(keys[0] as string),
          }}
        />
      </Surface>

      <Surface label="Meta campaign review & delivery" style={{ marginTop: 16 }}>
        <Card
          size="small"
          title="Meta campaign review & delivery"
          extra={<StatusTag label="outbound: deferred" />}
        >
          <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
            Chip contract only — bound to wirePorts.metaAds. Ads go-live stays deferred;
            outbound-ready reads dark/false regardless of review/delivery state below.
          </Typography.Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <div data-register-surface="Campaign review state">
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>Review state</Typography.Text>
                <Space style={{ display: "flex", marginTop: 4 }}>
                  <StatusTag
                    label={metaState?.review ?? "draft"}
                    color={reviewColor(metaState?.review ?? "draft")}
                  />
                  <Select
                    size="small"
                    value={metaState?.review ?? "draft"}
                    onChange={(v) => void setReview(v)}
                    options={REVIEW_STATES.map((r) => ({ value: r, label: r }))}
                    style={{ width: 140 }}
                  />
                </Space>
              </div>
            </Col>
            <Col span={12}>
              <div data-register-surface="Campaign delivery state">
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>Delivery state</Typography.Text>
                <Space style={{ display: "flex", marginTop: 4 }}>
                  <StatusTag
                    label={metaState?.delivery ?? "not_started"}
                    color={deliveryColor(metaState?.delivery ?? "not_started")}
                  />
                  <Select
                    size="small"
                    value={metaState?.delivery ?? "not_started"}
                    onChange={(v) => void setDelivery(v)}
                    options={DELIVERY_STATES.map((d) => ({ value: d, label: d }))}
                    style={{ width: 140 }}
                  />
                </Space>
              </div>
            </Col>
          </Row>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 11 }}>
            Outbound-ready: <strong>{metaState?.outboundReady ? "live" : "dark (deferred)"}</strong> —
            Arm ads stays disabled until near-real-time lead pull → first agent text ships.
          </Typography.Text>
        </Card>
      </Surface>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Surface label="Waiting-for-hydrate">
            <Card size="small" title="Staging queue" extra={<StatusTag label="capture → hydrate" />}>
              <Button
                block
                type="default"
                onClick={() =>
                  setWaitingJump(
                    `Jump to In-flight activations · filter not-yet-hydrated · ${waitingForHydrate} rows`,
                  )
                }
              >
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>Waiting-for-hydrate</Typography.Text>
                <div style={{ fontSize: 24, fontWeight: 650 }}>{waitingForHydrate}</div>
                <Typography.Text type="secondary">Captures not yet hydrated</Typography.Text>
              </Button>
              {waitingJump ? (
                <Typography.Text type="success" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  {waitingJump}
                </Typography.Text>
              ) : null}
            </Card>
          </Surface>
        </Col>
        <Col span={12}>
          <Surface label="Approach instrumentation">
            <Card
              size="small"
              title="Approach instrumentation"
              extra={
                <Select
                  size="small"
                  value={instrId}
                  onChange={setInstrId}
                  options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
                  style={{ width: 180 }}
                />
              }
            >
              <Row gutter={8}>
                {[
                  { label: "don't-understand", value: instr.dontUnderstand, note: "Disbelief · copy unclear" },
                  { label: "understand-don't-tap", value: instr.understandDontTap, note: "Understood · no tap" },
                  { label: "continue-scroll", value: instr.continueScroll, note: "Scroll past capture" },
                ].map((card) => (
                  <Col span={8} key={card.label}>
                    <Card size="small" styles={{ body: { padding: 10 } }}>
                      <Typography.Text type="secondary" style={{ fontSize: 10 }}>{card.label}</Typography.Text>
                      <div style={{ fontSize: 18, fontWeight: 650 }}>{card.value.toLocaleString()}</div>
                      <Typography.Text type="secondary" style={{ fontSize: 10 }}>{card.note}</Typography.Text>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Button style={{ marginTop: 12 }} onClick={() => setKillOpen(true)}>
                Kill / hold criteria…
              </Button>
            </Card>
          </Surface>
        </Col>
      </Row>

      <Drawer
        title="Approach campaign editor"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        width={520}
        extra={
          <Space>
            <Button onClick={() => message.success(`Saved draft · ${selected.name}`)}>Save</Button>
            <Button
              type="primary"
              data-register-surface="Save / Publish campaign"
              onClick={() => {
                patchSelected({ status: "Live" });
                message.success(`Published · ${selected.name} live for capture`);
              }}
            >
              Publish campaign
            </Button>
          </Space>
        }
      >
        <Surface label="Approach campaign editor">
          <StatusTag
            label={selected.status}
            color={selected.status === "Live" ? "success" : selected.status === "Paused" ? "warning" : "default"}
          />
          <Form layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item label="Feed creative">
              <Input value={selected.feedCreative} onChange={(e) => patchSelected({ feedCreative: e.target.value })} />
            </Form.Item>
            <Form.Item label="Ad copy">
              <Input.TextArea
                rows={2}
                value={selected.adCopy}
                onChange={(e) => patchSelected({ adCopy: e.target.value })}
              />
            </Form.Item>
          </Form>
        </Surface>
        <Surface label="Capture strip" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item label="Name">
                <Input
                  value={selected.captureName}
                  onChange={(e) => patchSelected({ captureName: e.target.value })}
                  placeholder="Firm / consultant name"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Website">
                <Input
                  value={selected.captureWebsite}
                  onChange={(e) => patchSelected({ captureWebsite: e.target.value })}
                  placeholder="firm.ca"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Channel">
                <Select
                  value={selected.captureChannel}
                  onChange={(v) => patchSelected({ captureChannel: v })}
                  options={[
                    { value: "Email", label: "Email" },
                    { value: "WhatsApp", label: "WhatsApp" },
                    { value: "Phone", label: "Phone" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Surface>
      </Drawer>

      <Modal
        title="Kill / hold criteria"
        open={killOpen}
        onCancel={() => setKillOpen(false)}
        onOk={() => {
          const camp = campaigns.find((c) => c.id === instrId)?.name ?? "campaign";
          if (killAction === "kill") {
            setCampaigns((p) => p.map((c) => (c.id === instrId ? { ...c, status: "Paused" as CampaignStatus } : c)));
          }
          message.info(`${killAction === "kill" ? "Killed" : "Held"} · ${camp} · threshold ${killThreshold}`);
          setKillOpen(false);
        }}
        okText="Apply"
      >
        <Surface label="Kill / hold criteria">
          <Form layout="vertical">
            <Form.Item label="understand-don't-tap threshold">
              <Input value={killThreshold} onChange={(e) => setKillThreshold(e.target.value)} />
            </Form.Item>
            <Form.Item label="Action">
              <Select
                value={killAction}
                onChange={setKillAction}
                options={[
                  { value: "hold", label: "Hold spend" },
                  { value: "kill", label: "Kill variant" },
                ]}
              />
            </Form.Item>
          </Form>
        </Surface>
      </Modal>
    </ModulePage>
  );
}
