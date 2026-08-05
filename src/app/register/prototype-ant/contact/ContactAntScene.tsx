/**
 * Contact desk — Ant Design translate of engagement client portal surfaces.
 * Source parity: ContactPrototypeScene (read-only reference). No plant imports.
 * Brand accent: synthesize #1B4F72 from source FIRM constant for portal identity chips.
 */
import { useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Radio,
  Result,
  Segmented,
  Space,
  Tag,
  Typography,
  theme as antTheme,
} from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Hint, ModulePage, Surface } from "../chrome";

const { Sider, Content } = Layout;
const { Text, Title, Paragraph } = Typography;

/** Exact vocab labels on the contact desk. */
const CONTACT_SURFACES = [
  "Opt-in message",
  "Consent request",
  "Nudge message",
  "Nudge form",
  "Silence / Opt out",
  "Meeting invitation",
  "Booking",
  "Loop-closer form",
  "Update facts",
  "Link state",
] as const;

type ContactSurface = (typeof CONTACT_SURFACES)[number];

const FIRM = {
  name: "Tower Immigration",
  short: "Tower",
  email: "hello@towerimmigration.ca",
  mailAddress: "120 King St W, Suite 800, Toronto ON M5H 1J9",
  phone: "+1 (416) 555-0142",
  initials: "TI",
  brand: "#1B4F72",
  brandSoft: "rgba(27, 79, 114, 0.12)",
};

const CONSULTANT = {
  name: "Sarah Chen",
  role: "RCIC · Consultant",
  firm: "Tower Immigration",
};

const CONTACT = {
  name: "Sarah Jenkins",
  email: "sarah.j@example.com",
  first: "Sarah",
};

type ChannelScope = "email" | "sms" | "multi";
type LinkStateKind = "Valid" | "Expired" | "Already used" | "Wrong purpose";
type CemChannel = "email" | "sms";

const WALK_SURFACES: ContactSurface[] = [
  "Consent request",
  "Meeting invitation",
  "Booking",
  "Silence / Opt out",
];

function PurposeChip({ kind }: { kind: "client" | "prepared" }) {
  const label =
    kind === "client" ? "Client touchpoint purpose chip" : "Prepared workspace purpose chip";
  const text = kind === "client" ? "Client touchpoint" : "Prepared workspace";
  const { token } = antTheme.useToken();
  return (
    <Surface label={label}>
      <Tag
        style={{
          margin: 0,
          borderColor: kind === "client" ? FIRM.brand : token.colorBorder,
          color: kind === "client" ? FIRM.brand : token.colorTextSecondary,
          background: kind === "client" ? FIRM.brandSoft : token.colorFillAlter,
        }}
      >
        {text}
      </Tag>
    </Surface>
  );
}

function OnWhoseBehalf() {
  const { token } = antTheme.useToken();
  return (
    <Surface label="On whose behalf" style={{ marginBottom: 12 }}>
      <Card size="small" styles={{ body: { padding: 12 } }}>
        <Space align="start">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 7,
              background: FIRM.brand,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {FIRM.initials}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>
              ON WHOSE BEHALF
            </Text>
            <div>
              <Text strong>{FIRM.name}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              {FIRM.mailAddress}
              <br />
              {FIRM.email} · {FIRM.phone}
            </Text>
            <div style={{ marginTop: 6 }}>
              <Surface label="Send-platform disclosure">
                <Tag style={{ fontSize: 9, margin: 0 }}>Sent via Om Coda</Tag>
              </Surface>
            </div>
          </div>
        </Space>
      </Card>
    </Surface>
  );
}

function SmsStopStrip() {
  return (
    <Surface label="STOP / Unsubscribe instruction" style={{ marginBottom: 12 }}>
      <Alert
        type="info"
        showIcon={false}
        message={
          <Text style={{ fontSize: 12 }}>
            <strong>SMS:</strong> Reply <strong>STOP</strong> or <strong>Unsubscribe</strong> to end
            automatic messages — same Silence ledger as in-page Silence / Opt out.
          </Text>
        }
      />
    </Surface>
  );
}

function CemFooter({
  channel,
  onSilence,
}: {
  channel?: CemChannel;
  onSilence?: () => void;
}) {
  const ch = channel ?? "email";
  return (
    <Surface label="Touchpoint footer" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #e5e7eb" }}>
      <Text strong style={{ fontSize: 11, display: "block", marginBottom: 4 }}>{FIRM.name}</Text>
      <Text type="secondary" style={{ fontSize: 10, display: "block" }}>{FIRM.mailAddress}</Text>
      <Text type="secondary" style={{ fontSize: 10, display: "block" }}>
        {FIRM.email} · {FIRM.phone}
      </Text>
      {ch === "sms" ? (
        <div style={{ marginTop: 8 }}>
          <Surface label="STOP / Unsubscribe instruction">
            <Text style={{ fontSize: 10 }}>
              Reply <strong>STOP</strong> or <strong>Unsubscribe</strong> — same as Silence / Opt out.
            </Text>
          </Surface>
        </div>
      ) : (
        <Paragraph style={{ marginTop: 8, fontSize: 10 }} type="secondary">
          You can unsubscribe at any time — reply STOP or use{" "}
          <Surface label="Silence / Opt out" style={{ display: "inline" }}>
            <Button type="link" size="small" style={{ padding: 0, height: "auto", fontSize: 10 }} onClick={onSilence}>
              Silence / Opt out
            </Button>
          </Surface>
          . Mechanism remains valid for 60+ days.
        </Paragraph>
      )}
      <Text type="secondary" style={{ fontSize: 9, display: "block", marginTop: 6 }}>
        On whose behalf: {FIRM.name}. Platform: Om Coda
      </Text>
    </Surface>
  );
}

function PortalHeaderBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: `linear-gradient(90deg, ${FIRM.brandSoft}, transparent)`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: FIRM.brand,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {FIRM.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ fontSize: 12 }}>{FIRM.name}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 10 }}>
          Secure client portal · {CONTACT.name} · {FIRM.mailAddress}
        </Text>
      </div>
      <Surface label="Send-platform disclosure">
        <Text type="secondary" style={{ fontSize: 9 }}>via Om Coda</Text>
      </Surface>
    </div>
  );
}

function PortalShell({
  surface,
  badge,
  children,
  showPurpose = true,
}: {
  surface: ContactSurface;
  badge?: string;
  children: ReactNode;
  showPurpose?: boolean;
}) {
  const { token } = antTheme.useToken();
  return (
    <Surface
      label={surface}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 16px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          flexShrink: 0,
        }}
      >
        <Text strong>{surface}</Text>
        <Space size={8}>
          {showPurpose ? <PurposeChip kind="client" /> : null}
          {badge ? (
            <Tag color="blue" style={{ margin: 0, color: FIRM.brand, borderColor: FIRM.brand, background: FIRM.brandSoft }}>
              {badge}
            </Tag>
          ) : null}
        </Space>
      </div>
      <PortalHeaderBar />
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>{children}</div>
    </Surface>
  );
}

function CemShell({
  surface,
  subject,
  headline,
  body,
  cta,
  ctaSurface,
  channel = "email",
  onSilence,
  onCta,
  children,
}: {
  surface: ContactSurface;
  subject: string;
  headline: string;
  body: string;
  cta: string;
  ctaSurface?: string;
  channel?: CemChannel;
  onSilence?: () => void;
  onCta?: () => void;
  children?: ReactNode;
}) {
  const { token } = antTheme.useToken();
  return (
    <Surface
      label={surface}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 16px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          flexShrink: 0,
        }}
      >
        <Text strong>{surface}</Text>
        <Space size={8}>
          <PurposeChip kind="client" />
          <Text style={{ fontSize: 10, fontWeight: 700, color: FIRM.brand }}>
            Firm CEM · {channel.toUpperCase()}
          </Text>
        </Space>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16, background: token.colorFillAlter }}>
        <Card
          style={{ maxWidth: 480, margin: "0 auto" }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
            <MailOutlined style={{ color: FIRM.brand }} />
            <Text type="secondary" style={{ fontSize: 11 }}>{FIRM.email}</Text>
          </div>
          <div style={{ padding: 18, background: "#f8f8f8" }}>
            <OnWhoseBehalf />
            {channel === "sms" ? <SmsStopStrip /> : null}
            <Title level={5} style={{ marginBottom: 6 }}>{subject}</Title>
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 14 }}>
              To: {CONTACT.name} &lt;{CONTACT.email}&gt;
            </Text>
            <Text strong style={{ display: "block", marginBottom: 6 }}>{headline}</Text>
            <Paragraph style={{ fontSize: 13, marginBottom: 16 }}>{body}</Paragraph>
            {children}
            <Surface label={ctaSurface ?? surface}>
              <Button
                type="primary"
                block
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                onClick={onCta}
                style={{ background: FIRM.brand, marginBottom: 0 }}
              >
                {cta}
              </Button>
            </Surface>
            <CemFooter channel={channel} onSilence={onSilence} />
          </div>
        </Card>
      </div>
    </Surface>
  );
}

function SelfReportableLegend() {
  return (
    <Surface label="Self-reportable only legend" style={{ marginBottom: 12 }}>
      <Alert
        type="info"
        showIcon={false}
        style={{ borderStyle: "dashed", borderColor: FIRM.brand, background: FIRM.brandSoft }}
        message={
          <Text style={{ fontSize: 11 }}>
            <strong>Self-reportable only</strong> — text, dropdown, checkbox, and date fields. No document
            uploads (letters, bank proofs, certificates).
          </Text>
        }
      />
    </Surface>
  );
}

function AlreadyHeldStrip({ chips }: { chips: string[] }) {
  return (
    <Surface label="Already held" style={{ marginBottom: 12 }}>
      <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, display: "block", marginBottom: 6 }}>
        ALREADY HELD
      </Text>
      <Space wrap size={6}>
        {chips.map((c) => (
          <Tag key={c}>{c}</Tag>
        ))}
      </Space>
    </Surface>
  );
}

function ResumeDraftBanner({
  restored,
  onContinue,
}: {
  restored: boolean;
  onContinue: () => void;
}) {
  return (
    <Surface label="Continue draft" style={{ marginBottom: 12 }}>
      <Alert
        type="info"
        showIcon={false}
        style={{ borderColor: FIRM.brand, background: FIRM.brandSoft }}
        message={
          <Space wrap>
            <Text style={{ fontSize: 12 }}>
              {restored
                ? "Draft restored — continue where you left off."
                : "You have an incomplete draft of this form."}
            </Text>
            {!restored ? (
              <Button size="small" type="primary" style={{ background: FIRM.brand }} onClick={onContinue}>
                Continue draft
              </Button>
            ) : null}
          </Space>
        }
      />
    </Surface>
  );
}

function FormChromeFooter({
  remaining,
  total,
  onSilence,
}: {
  remaining: number;
  total: number;
  onSilence: () => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <Surface label="Outstanding remaining" style={{ marginBottom: 10 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Outstanding remaining: <Text strong>{remaining} of {total}</Text>
        </Text>
      </Surface>
      <Space wrap style={{ justifyContent: "center", width: "100%" }}>
        <Surface label="Silence / Opt out">
          <Button danger onClick={onSilence}>Silence / Opt out</Button>
        </Surface>
        <Surface label="Not me / Wrong person">
          <Button>Not me / Wrong person</Button>
        </Surface>
      </Space>
    </div>
  );
}

function OptInMessage({
  onSilence,
  onReview,
}: {
  onSilence: () => void;
  onReview: () => void;
}) {
  const [channel, setChannel] = useState<CemChannel>("email");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "6px 12px", flexShrink: 0 }}>
        <Segmented
          size="small"
          value={channel}
          onChange={(v) => setChannel(v as CemChannel)}
          options={[
            { label: "Demo · EMAIL", value: "email" },
            { label: "Demo · SMS", value: "sms" },
          ]}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CemShell
          surface="Opt-in message"
          subject={`${CONTACT.first}, stay current on your Canadian pathway`}
          headline="A quick yes before we collect anything deeper"
          body={`Hi ${CONTACT.first} — ${FIRM.name} would like to keep you informed about Express Entry / CEC timing relevant to your file, and invite you to share self-reportable updates when useful. This is not cold outreach: you are already in our private book.`}
          cta="Review request"
          ctaSurface="Consent link / Review request"
          channel={channel}
          onSilence={onSilence}
          onCta={onReview}
        />
      </div>
    </div>
  );
}

function ConsentRequest({
  onSilence,
  onAgreed,
}: {
  onSilence: () => void;
  onAgreed: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [scope, setScope] = useState<ChannelScope>("email");
  const [outcome, setOutcome] = useState<"idle" | "agreed" | "ignored" | "not-me">("idle");

  return (
    <PortalShell surface="Consent request" badge="CASL + PIPEDA">
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <Space style={{ marginBottom: 10 }}>
          <SafetyCertificateOutlined style={{ color: FIRM.brand, fontSize: 16 }} />
          <Title level={4} style={{ margin: 0 }}>Consent request</Title>
        </Space>
        <OnWhoseBehalf />

        <Surface label="CASL CEM purpose" style={{ marginBottom: 12 }}>
          <Card size="small" title="CASL — commercial electronic messages">
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              I consent to receive email and/or SMS from <strong>{FIRM.name}</strong> about pathway
              freshness, eligibility signals, and meeting invitations. Identification and a working
              unsubscribe appear on every message.
            </Paragraph>
          </Card>
        </Surface>

        <Surface label="PIPEDA collection purpose" style={{ marginBottom: 12 }}>
          <Card size="small" title="PIPEDA — self-reportable collection">
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              I consent to {FIRM.name} collecting self-reportable immigration facts (language bands,
              work history flags, funds yes/no, EE status) to refresh eligibility advice. Document
              uploads and employer-directed asks are not collected here.
            </Paragraph>
          </Card>
        </Surface>

        <Surface label="After-Agree path" style={{ marginBottom: 12 }}>
          <Card size="small" title="After Agree — what happens next">
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.55 }}>
              <li>Deeper self-reportable forms (Nudge form / Update facts) may follow</li>
              <li>Later nudges stay under the channel scope you choose</li>
              <li>Silence / Opt out remains available anytime — including mid-form</li>
            </ul>
          </Card>
        </Surface>

        <Surface label="Channel scope" style={{ marginBottom: 12 }}>
          <Card size="small" title="Channel scope">
            <Radio.Group
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              style={{ width: "100%" }}
            >
              <Radio.Button value="email" style={{ width: "33.33%", textAlign: "center" }}>Email</Radio.Button>
              <Radio.Button value="sms" style={{ width: "33.33%", textAlign: "center" }}>SMS</Radio.Button>
              <Radio.Button value="multi" style={{ width: "33.33%", textAlign: "center" }}>Email + SMS</Radio.Button>
            </Radio.Group>
            <Text type="secondary" style={{ fontSize: 10, display: "block", marginTop: 8 }}>
              Email-only does not authorize SMS. Multi-channel is disclosed at Agree.
            </Text>
          </Card>
        </Surface>

        <Surface label="Ignore policy row" style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card size="small">
              <Text style={{ fontSize: 11 }}>
                <strong>Ignore</strong> — not now. No express consent; deeper forms stay closed. Firm
                policy may also silence automatic CEMs.
              </Text>
            </Card>
            <Card size="small">
              <Text style={{ fontSize: 11 }}>
                <strong>Silence / Opt out</strong> — stop forever (until a new affirmative Agree).
                Intentional withdrawal of automatic messages.
              </Text>
            </Card>
          </div>
        </Surface>

        <Card
          size="small"
          style={{
            marginBottom: 14,
            borderColor: agreed ? FIRM.brand : undefined,
            background: agreed ? FIRM.brandSoft : undefined,
          }}
        >
          <Checkbox
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (!e.target.checked) setOutcome("idle");
            }}
          >
            <Text style={{ fontSize: 13 }}>
              <strong>I Agree</strong> — affirmative, unchecked by default. Includes{" "}
              <Tag style={{ fontSize: 10, margin: 0 }}>CASL CEM</Tag> and{" "}
              <Tag style={{ fontSize: 10, margin: 0 }}>PIPEDA collection</Tag> purpose chips, channel scope
              ({scope}), firm sender identity, and withdrawal right.
            </Text>
          </Checkbox>
        </Card>

        <Space wrap style={{ marginBottom: 10 }}>
          <Surface label="Agree">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled={!agreed}
              style={{ background: FIRM.brand }}
              onClick={() => {
                setOutcome("agreed");
                onAgreed();
              }}
            >
              Agree
            </Button>
          </Surface>
          <Surface label="Ignore / dismiss">
            <Button
              onClick={() => {
                setAgreed(false);
                setOutcome("ignored");
              }}
            >
              Ignore
            </Button>
          </Surface>
          <Surface label="Silence / Opt out">
            <Button danger onClick={onSilence}>Silence / Opt out</Button>
          </Surface>
          <Surface label="Not me / Wrong person">
            <Button onClick={() => setOutcome("not-me")}>Not me / Wrong person</Button>
          </Surface>
        </Space>

        {outcome !== "idle" ? (
          <Alert
            type={outcome === "agreed" ? "success" : "info"}
            showIcon
            message={
              outcome === "agreed"
                ? `Express consent recorded (${scope}). Nudge form / Update facts may open under this Agree.`
                : outcome === "ignored"
                  ? "Ignored — no express consent. Deeper collection stays closed."
                  : "Not me confirmed — deeper collection stopped for this send; no immigration facts written."
            }
          />
        ) : null}
      </div>
    </PortalShell>
  );
}

function NudgeMessage({
  onSilence,
  onOpenForm,
}: {
  onSilence: () => void;
  onOpenForm: () => void;
}) {
  const [channel, setChannel] = useState<CemChannel>("email");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "6px 12px", flexShrink: 0 }}>
        <Segmented
          size="small"
          value={channel}
          onChange={(v) => setChannel(v as CemChannel)}
          options={[
            { label: "Demo · EMAIL", value: "email" },
            { label: "Demo · SMS", value: "sms" },
          ]}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CemShell
          surface="Nudge message"
          subject="Two quick answers keep your file current"
          headline="Nothing reactivation-worthy — one consolidated ask"
          body={`Hi ${CONTACT.first} — ${FIRM.name} needs a few self-reportable updates (language test window and EE pool status) before your next eligibility refresh. One form. No document uploads.`}
          cta="Open Nudge form"
          channel={channel}
          onSilence={onSilence}
          onCta={onOpenForm}
        />
      </div>
    </div>
  );
}

function NudgeForm({ onSilence }: { onSilence: () => void }) {
  const [draftRestored, setDraftRestored] = useState(false);
  const outstandingTotal = 4;
  const [filled, setFilled] = useState(1);
  const remaining = Math.max(0, outstandingTotal - filled);

  return (
    <PortalShell surface="Nudge form" badge="Self-reportable only">
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Title level={4}>Refresh your facts</Title>
        <SelfReportableLegend />
        <ResumeDraftBanner
          restored={draftRestored}
          onContinue={() => {
            setDraftRestored(true);
            setFilled(2);
          }}
        />
        <AlreadyHeldStrip chips={["EE profile: Yes", "Job offer: No", "Funds: Yes · ~$15,000"]} />
        <Surface label="Outstanding" style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, display: "block", marginBottom: 8, color: FIRM.brand }}>
            OUTSTANDING
          </Text>
          <Surface label="Self-reportable fields">
            <Form layout="vertical" size="small">
              <Form.Item label="Still in pool">
                <Input placeholder={draftRestored ? undefined : "—"} value={draftRestored ? "Yes" : undefined} readOnly={draftRestored} />
              </Form.Item>
              <Form.Item label="Approximate last EE update">
                <Input placeholder={draftRestored ? undefined : "—"} value={draftRestored ? "Jan 2026" : undefined} readOnly={draftRestored} />
              </Form.Item>
              <Form.Item label="Language test product">
                <Input value="IELTS General" readOnly />
              </Form.Item>
              <Form.Item label="Test date" extra="Enter the day you took the test — not the expiry. Validity is usually test date + 2 years for EE profiles.">
                <Input value="Mar 12, 2025" readOnly />
              </Form.Item>
              <Form.Item label="Validity / still valid through" extra="Optional: if you know the window is still open, enter the end of validity. Do not upload the certificate.">
                <Input value="Mar 12, 2027" readOnly />
              </Form.Item>
              <Form.Item label="CLB-equivalent band (lowest)">
                <Input value="CLB 9" readOnly />
              </Form.Item>
            </Form>
          </Surface>
        </Surface>
        <Surface label="Submit" style={{ marginTop: 4 }}>
          <Button
            type="primary"
            block
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            style={{ background: FIRM.brand }}
            onClick={() => setFilled(outstandingTotal)}
          >
            Submit
          </Button>
        </Surface>
        <FormChromeFooter remaining={remaining} total={outstandingTotal} onSilence={onSilence} />
      </div>
    </PortalShell>
  );
}

function SilenceOptOut({
  silenced,
  setSilenced,
}: {
  silenced: boolean;
  setSilenced: (v: boolean) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const confirmSilence = () => {
    setSilenced(true);
    setModalOpen(false);
  };

  return (
    <PortalShell surface="Silence / Opt out" badge="≤10 bd honor">
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <Title level={4}>Silence / Opt out</Title>
        <OnWhoseBehalf />
        <Paragraph type="secondary">
          One no-cost step. Further automatic firm-branded CEMs stop immediately (never later than 10
          business days). SMS STOP is honored the same way.
        </Paragraph>
        <Card size="small" style={{ marginBottom: 14 }}>
          <Text strong style={{ display: "block", marginBottom: 6 }}>What stops</Text>
          <Text style={{ fontSize: 12 }}>
            Opt-in, nudge, and reactivation sequences under {FIRM.name}. You can re-consent later with a
            new affirmative Agree on Consent request.
          </Text>
        </Card>
        <SmsStopStrip />
        <Surface label="Silence / Opt out">
          <Button
            type="primary"
            block
            danger={!silenced}
            style={silenced ? { background: "#52c41a", borderColor: "#52c41a" } : undefined}
            onClick={() => setModalOpen(true)}
          >
            {silenced ? "Silenced — outreach stopped" : "Confirm Silence / Opt out"}
          </Button>
        </Surface>

        <Modal
          title="Confirm Silence / Opt out"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={confirmSilence}
          okText="Confirm Silence"
          okButtonProps={{ danger: true }}
        >
          <Paragraph>
            Automatic firm-branded CEMs from {FIRM.name} will stop. SMS STOP writes the same silenced state.
            You can re-consent later with a new affirmative Agree.
          </Paragraph>
        </Modal>

        {silenced ? (
          <Surface label="Silence confirmation" style={{ marginTop: 12 }}>
            <Result
              status="success"
              title="Confirmed"
              subTitle={`Automatic messages from ${FIRM.name} will stop. No further Agree is implied. SMS STOP / Unsubscribe writes this same silenced state.`}
            />
          </Surface>
        ) : (
          <Text type="secondary" style={{ fontSize: 11, display: "block", textAlign: "center", marginTop: 10 }}>
            Or reply STOP to any SMS from {FIRM.name}
          </Text>
        )}
      </div>
    </PortalShell>
  );
}

function MeetingInvitation({
  onSilence,
  onBook,
}: {
  onSilence: () => void;
  onBook: () => void;
}) {
  return (
    <CemShell
      surface="Meeting invitation"
      subject="You're invited — discovery with Tower Immigration"
      headline="Eligibility warrants a conversation"
      body={`Hi ${CONTACT.first} — based on your current self-reportable facts, ${FIRM.name} would like to meet for a short discovery on Express Entry / CEC timing. Pick a slot that works; we'll already hold your current facts for the consultant.`}
      cta="Book a time"
      ctaSurface="Book a time"
      onSilence={onSilence}
      onCta={onBook}
    >
      <Surface label="Consultant host" style={{ marginBottom: 10 }}>
        <Card size="small">
          <Space>
            <UserOutlined style={{ color: FIRM.brand }} />
            <div>
              <Text strong>{CONSULTANT.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {CONSULTANT.role} · {CONSULTANT.firm}
              </Text>
            </div>
          </Space>
        </Card>
      </Surface>
      <Surface label="Meeting purpose" style={{ marginBottom: 10 }}>
        <Card size="small">
          <Text style={{ fontSize: 12 }}>
            <strong>Why meet:</strong> Your EE / CEC timing now warrants a short discovery — not a sales pitch.
          </Text>
        </Card>
      </Surface>
      <Card size="small" style={{ marginBottom: 14 }}>
        <Space>
          <CalendarOutlined style={{ color: FIRM.brand }} />
          <Text style={{ fontSize: 12 }}>30 min · Video · Consultant desk</Text>
        </Space>
      </Card>
    </CemShell>
  );
}

function BookingSurface() {
  const [slot, setSlot] = useState<string | null>("Thu 2:00 PM");
  const [confirmed, setConfirmed] = useState(false);
  const [factsOnFile, setFactsOnFile] = useState(true);
  const slots = ["Thu 2:00 PM", "Fri 10:30 AM", "Mon 3:00 PM"];

  return (
    <PortalShell surface="Booking" badge={confirmed ? "Confirmed" : "Slot picker"}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <Title level={4}>Booking</Title>

        <Surface label="Consultant host" style={{ marginBottom: 12 }}>
          <Card size="small">
            <Space>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: FIRM.brand,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                SC
              </div>
              <div>
                <Text strong>{CONSULTANT.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {CONSULTANT.role} · {FIRM.name}
                </Text>
              </div>
            </Space>
          </Card>
        </Surface>

        <Surface label="Meeting purpose" style={{ marginBottom: 12 }}>
          <Paragraph style={{ fontSize: 12 }} type="secondary">
            <Text strong>Why meet:</Text> Discovery · Express Entry / CEC timing based on your current facts.
          </Paragraph>
        </Surface>

        {factsOnFile ? (
          <Surface label="Facts already on file" style={{ marginBottom: 12 }}>
            <Alert
              type="success"
              showIcon
              message="Firm already holds your current facts — no need to re-explain your whole story at the meeting."
            />
          </Surface>
        ) : (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={
              <Space>
                <Text style={{ fontSize: 12 }}>
                  Outstanding self-reportables remain — finish Loop-closer form before the meeting.
                </Text>
                <Button size="small" onClick={() => setFactsOnFile(true)}>Demo · clear outstanding</Button>
              </Space>
            }
          />
        )}

        {!confirmed ? (
          <>
            <Surface label="Slot picker">
              <Radio.Group
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
              >
                {slots.map((s) => (
                  <Radio key={s} value={s} style={{ padding: "12px 14px", border: "1px solid #d9d9d9", borderRadius: 6, margin: 0 }}>
                    {s}
                  </Radio>
                ))}
              </Radio.Group>
            </Surface>
            <Surface label="Confirm booking">
              <Button
                type="primary"
                block
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{ background: FIRM.brand }}
                onClick={() => setConfirmed(true)}
              >
                Confirm booking
              </Button>
            </Surface>
          </>
        ) : (
          <Surface label="Booking confirm">
            <Result
              status="success"
              title={`Booked · ${slot} with ${CONSULTANT.name}`}
              subTitle="Meeting state written for consultant Meetings rows."
              extra={
                <Space wrap>
                  <Surface label="Reschedule">
                    <Button onClick={() => setConfirmed(false)}>Reschedule</Button>
                  </Surface>
                  <Surface label="Cancel booking">
                    <Button
                      danger
                      onClick={() => {
                        setConfirmed(false);
                        setSlot(null);
                      }}
                    >
                      Cancel booking
                    </Button>
                  </Surface>
                </Space>
              }
            />
          </Surface>
        )}
        <Text type="secondary" style={{ fontSize: 11, display: "block", textAlign: "center", marginTop: 10 }}>
          After confirm, outstanding self-reportables open on Loop-closer form.
        </Text>
      </div>
    </PortalShell>
  );
}

function LoopCloserForm({ onSilence }: { onSilence: () => void }) {
  const outstandingTotal = 3;
  const [filled, setFilled] = useState(0);
  const remaining = Math.max(0, outstandingTotal - filled);
  const clear = remaining === 0;

  return (
    <PortalShell surface="Loop-closer form" badge="Pre-meeting">
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Title level={4}>Loop-closer form</Title>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          Outstanding self-reportables before you join — write-back so Live brief is current.
        </Paragraph>
        <SelfReportableLegend />
        <AlreadyHeldStrip chips={["Language: CLB 9", "EE pool: Yes", "Funds: Yes"]} />
        {clear ? (
          <Surface label="Facts already on file" style={{ marginBottom: 12 }}>
            <Alert
              type="success"
              showIcon
              message="Firm already holds your current facts — nothing outstanding for the meeting."
            />
          </Surface>
        ) : (
          <Surface label="Booking confirm">
            <Surface label="Outstanding">
              <Surface label="Self-reportable fields">
                <Form layout="vertical" size="small">
                  <Form.Item label="Work permit end date (approx)">
                    <Input value="Sep 15, 2026" readOnly />
                  </Form.Item>
                  <Form.Item label="Hours/week (current role)">
                    <Input value="40" readOnly />
                  </Form.Item>
                  <Form.Item label="TEER guess">
                    <Input value="TEER 1" readOnly />
                  </Form.Item>
                  <Form.Item label="Test date" extra="Test date (day of exam), not document upload. Validity window is separate.">
                    <Input value="Mar 12, 2025" readOnly />
                  </Form.Item>
                </Form>
              </Surface>
            </Surface>
            <Surface label="Submit">
              <Button
                type="primary"
                block
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{ background: FIRM.brand, marginTop: 8 }}
                onClick={() => setFilled(outstandingTotal)}
              >
                Submit
              </Button>
            </Surface>
          </Surface>
        )}
        <FormChromeFooter remaining={remaining} total={outstandingTotal} onSilence={onSilence} />
      </div>
    </PortalShell>
  );
}

function UpdateFactsSurface({ onSilence }: { onSilence: () => void }) {
  const [draftRestored, setDraftRestored] = useState(false);
  const outstandingTotal = 3;
  const [filled, setFilled] = useState(0);

  return (
    <PortalShell surface="Update facts" badge="Life change">
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Title level={4}>Update facts</Title>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          Reply when your situation changes. Same self-reportable boundary as Nudge form — firm-branded
          path under {FIRM.name}.
        </Paragraph>
        <SelfReportableLegend />
        <ResumeDraftBanner
          restored={draftRestored}
          onContinue={() => {
            setDraftRestored(true);
            setFilled(1);
          }}
        />
        <AlreadyHeldStrip chips={["Prior CLB: 9", "Meeting invites: Yes"]} />
        <Surface label="Update facts / Change update link" style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, color: FIRM.brand, fontWeight: 600 }}>Update facts link</Text>
        </Surface>
        <Surface label="Outstanding">
          <Surface label="Update fields">
            <Form layout="vertical" size="small">
              <Form.Item label="What changed">
                <Input placeholder={draftRestored ? undefined : "—"} value={draftRestored ? "New language test booked" : undefined} readOnly={draftRestored} />
              </Form.Item>
              <Form.Item label="Effective date">
                <Input value="Aug 2026" readOnly />
              </Form.Item>
              <Form.Item label="Test date" extra="Enter the exam day. Validity / still-valid window is separate — no certificate upload.">
                <Input placeholder="—" readOnly />
              </Form.Item>
              <Form.Item label="Updated CLB target">
                <Input value="CLB 10" readOnly />
              </Form.Item>
            </Form>
          </Surface>
        </Surface>
        <Surface label="Submit">
          <Button
            type="primary"
            block
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            style={{ background: FIRM.brand }}
            onClick={() => setFilled(outstandingTotal)}
          >
            Submit
          </Button>
        </Surface>
        <FormChromeFooter
          remaining={Math.max(0, outstandingTotal - filled)}
          total={outstandingTotal}
          onSilence={onSilence}
        />
      </div>
    </PortalShell>
  );
}

function LinkStatePage() {
  const [state, setState] = useState<LinkStateKind>("Expired");
  const copy: Record<LinkStateKind, { title: string; next: string }> = {
    Valid: {
      title: "This link is valid",
      next: "Continue to the declared purpose — Consent request, Nudge form, or Booking.",
    },
    Expired: {
      title: "This link has expired",
      next: `Ask ${FIRM.name} for a fresh link — or email ${FIRM.email}.`,
    },
    "Already used": {
      title: "This link was already used",
      next: "If you need to continue, request a new firm-branded link from your consultant.",
    },
    "Wrong purpose": {
      title: "Wrong purpose for this link",
      next: "This token is not for client consent / facts / book. It will not open Authorize book.",
    },
  };

  return (
    <PortalShell surface="Link state" badge="Token redeem">
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Title level={4}>Link state</Title>
        <OnWhoseBehalf />

        <Segmented
          value={state}
          onChange={(v) => setState(v as LinkStateKind)}
          options={["Valid", "Expired", "Already used", "Wrong purpose"].map((s) => ({ label: s, value: s }))}
          style={{ marginBottom: 14 }}
        />

        <Surface label="Link state">
          <Card
            style={{
              borderColor: state === "Valid" ? "#52c41a" : undefined,
              background: state === "Valid" ? "rgba(82, 196, 26, 0.08)" : undefined,
            }}
          >
            <Title level={5} style={{ marginBottom: 6 }}>{copy[state].title}</Title>
            <Paragraph type="secondary" style={{ marginBottom: state === "Valid" ? 12 : 0 }}>
              {copy[state].next}
            </Paragraph>
            {state === "Valid" ? (
              <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end" style={{ background: FIRM.brand }}>
                Continue
              </Button>
            ) : null}
          </Card>
        </Surface>

        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <PurposeChip kind="client" />
            <Text type="secondary" style={{ fontSize: 11 }}>vs</Text>
            <PurposeChip kind="prepared" />
          </Space>
          <Paragraph type="secondary" style={{ fontSize: 11, marginTop: 10 }}>
            Prepared-workspace-adjacent firm pages never show Authorize book on contact Consent / Nudge /
            Booking. Purpose chips keep activation preview separate from your client path.
          </Paragraph>
        </div>
      </div>
    </PortalShell>
  );
}

function ActiveSurface({
  surface,
  silenced,
  setSilenced,
  goSilence,
  navigate,
}: {
  surface: ContactSurface;
  silenced: boolean;
  setSilenced: (v: boolean) => void;
  goSilence: () => void;
  navigate: (s: ContactSurface) => void;
}) {
  switch (surface) {
    case "Opt-in message":
      return (
        <OptInMessage
          onSilence={goSilence}
          onReview={() => navigate("Consent request")}
        />
      );
    case "Consent request":
      return (
        <ConsentRequest
          onSilence={goSilence}
          onAgreed={() => navigate("Meeting invitation")}
        />
      );
    case "Nudge message":
      return <NudgeMessage onSilence={goSilence} onOpenForm={() => navigate("Nudge form")} />;
    case "Nudge form":
      return <NudgeForm onSilence={goSilence} />;
    case "Silence / Opt out":
      return <SilenceOptOut silenced={silenced} setSilenced={setSilenced} />;
    case "Meeting invitation":
      return (
        <MeetingInvitation
          onSilence={goSilence}
          onBook={() => navigate("Booking")}
        />
      );
    case "Booking":
      return <BookingSurface />;
    case "Loop-closer form":
      return <LoopCloserForm onSilence={goSilence} />;
    case "Update facts":
      return <UpdateFactsSurface onSilence={goSilence} />;
    case "Link state":
      return <LinkStatePage />;
    default:
      return null;
  }
}

export function ContactAntScene() {
  const { token } = antTheme.useToken();
  const [surface, setSurface] = useState<ContactSurface>("Opt-in message");
  const [silenced, setSilenced] = useState(false);
  const [walkStep, setWalkStep] = useState(0);

  const goSilence = () => {
    setSilenced(true);
    setSurface("Silence / Opt out");
    setWalkStep(WALK_SURFACES.length - 1);
  };

  const startWalk = () => {
    setWalkStep(0);
    setSurface("Consent request");
  };

  const advanceWalk = () => {
    const next = walkStep + 1;
    if (next < WALK_SURFACES.length) {
      setWalkStep(next);
      setSurface(WALK_SURFACES[next]);
    }
  };

  return (
    <Layout style={{ height: "100%", minHeight: 0, background: token.colorBgLayout }}>
      <Sider
        width={200}
        theme="light"
        style={{
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <div style={{ padding: "12px 16px 8px" }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
            CLIENT PORTAL
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[surface]}
          onClick={({ key }) => setSurface(key as ContactSurface)}
          items={CONTACT_SURFACES.map((id) => ({ key: id, label: id }))}
          style={{ border: "none" }}
        />
      </Sider>
      <Content style={{ padding: 12, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Surface label="Client portal" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <ModulePage
            title="Client portal"
            surface="Client portal"
            extra={
              <Button size="small" onClick={startWalk}>
                Walk: consent → booking → silence
              </Button>
            }
          >
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="Interactive walk"
              description={
                <Space direction="vertical" size={4}>
                  <Text style={{ fontSize: 12 }}>
                    1. Consent request → check Agree → Agree → Meeting invitation
                    <br />
                    2. Meeting invitation → Book a time → Booking → Confirm booking
                    <br />
                    3. Silence / Opt out from any surface or finish walk here
                  </Text>
                  {walkStep < WALK_SURFACES.length - 1 ? (
                    <Button size="small" type="link" style={{ padding: 0 }} onClick={advanceWalk}>
                      Next walk step → {WALK_SURFACES[walkStep + 1]}
                    </Button>
                  ) : walkStep === WALK_SURFACES.length - 1 ? (
                    <Text type="success" style={{ fontSize: 12 }}>Walk complete at Silence / Opt out</Text>
                  ) : null}
                </Space>
              }
            />
            <Hint>
              Firm portal identity uses synthesize brand accent {FIRM.brand} (source FIRM constant) on chips and CTAs;
              shell primary remains Ant token colorPrimary.
            </Hint>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ActiveSurface
                surface={surface}
                silenced={silenced}
                setSilenced={setSilenced}
                goSilence={goSilence}
                navigate={setSurface}
              />
            </div>
          </ModulePage>
        </Surface>
      </Content>
    </Layout>
  );
}
