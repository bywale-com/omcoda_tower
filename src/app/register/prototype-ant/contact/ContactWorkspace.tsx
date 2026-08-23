/**
 * Contact workspace seat — Now · History · Upload. No login. Firm-branded.
 * Token family /c/<token>. Do not ship the 10-item flipper.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Radio,
  Result,
  Space,
  Table,
  Tabs,
  Typography,
  Upload,
  message,
  theme,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { wirePorts } from "../../../wire";
import { type ContactSeatPayload, type ContactSeatRefuse } from "../../../wire/contactSeatTypes";

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

type Nav = "now" | "history" | "upload";
type SeatKey = { token: string } | { contactId: string };

const WORKSPACES_CHANGED = "tower-contact-workspaces-changed";

function refuseView(res: ContactSeatRefuse): { title: string; body: string } {
  if (res.refuse === "workspace_opted_out") {
    return {
      title: "This workspace is no longer available.",
      body: "You opted out of this workspace.",
    };
  }
  return { title: "This link cannot be used", body: res.message };
}

function applyRefuse(res: ContactSeatRefuse, setRefuse: (view: { title: string; body: string }) => void) {
  setRefuse(refuseView(res));
  if (res.refuse === "workspace_opted_out") {
    window.dispatchEvent(new Event(WORKSPACES_CHANGED));
  }
}

function seatApi(key: SeatKey) {
  const api = wirePorts.machineApi;
  if ("token" in key) {
    return {
      load: (campaignId?: string) => api.loadContactSeat(key.token, campaignId ? { campaignId } : undefined),
      consent: (action: "agree" | "ignore") => api.consentContactSeat(key.token, action),
      silence: () => api.silenceContactSeat(key.token),
      facts: (answers: Array<{ fieldKey: string; value: unknown }>) =>
        api.submitContactSeatFacts(key.token, answers),
      book: (slot: string) => api.bookContactSeat(key.token, slot),
      upload: (input: Parameters<typeof api.putContactSeatUpload>[1]) =>
        api.putContactSeatUpload(key.token, input),
    };
  }
  return {
    load: (campaignId?: string) =>
      api.loadContactWorkspace(key.contactId, campaignId ? { campaignId } : undefined),
    consent: (action: "agree" | "ignore") => api.consentContactWorkspace(key.contactId, action),
    silence: () => api.silenceContactWorkspace(key.contactId),
    facts: (answers: Array<{ fieldKey: string; value: unknown }>) =>
      api.submitContactWorkspaceFacts(key.contactId, answers),
    book: (slot: string) => api.bookContactWorkspace(key.contactId, slot),
    upload: (input: Parameters<typeof api.putContactWorkspaceUpload>[1]) =>
      api.putContactWorkspaceUpload(key.contactId, input),
  };
}

function MeetingBook({
  slots,
  busy,
  onConfirm,
}: {
  slots: string[];
  busy: boolean;
  onConfirm: (slot: string) => void;
}) {
  const [slot, setSlot] = useState<string | null>(slots[0] ?? null);
  return (
    <div style={{ marginTop: 24 }}>
      <Radio.Group
        value={slot}
        onChange={(event) => setSlot(event.target.value)}
        style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}
      >
        {slots.map((value) => (
          <Radio key={value} value={value}>
            {new Date(value).toLocaleString()}
          </Radio>
        ))}
      </Radio.Group>
      <Button type="primary" disabled={!slot} loading={busy} onClick={() => slot && onConfirm(slot)}>
        Confirm booking
      </Button>
    </div>
  );
}

export function ContactWorkspace({
  token,
  contactId,
  embedded = false,
}: {
  token?: string;
  contactId?: string;
  embedded?: boolean;
}) {
  const key: SeatKey | null = token ? { token } : contactId ? { contactId } : null;
  const calls = key ? seatApi(key) : null;
  const { token: themeToken } = theme.useToken();
  const [nav, setNav] = useState<Nav>("now");
  const [seat, setSeat] = useState<ContactSeatPayload | null>(null);
  const [refuse, setRefuse] = useState<{ title: string; body: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [openAsk, setOpenAsk] = useState<ContactSeatPayload["history"][number] | null>(null);
  const [kindOpen, setKindOpen] = useState(false);
  const [kindQuery, setKindQuery] = useState("");
  const [customKind, setCustomKind] = useState("");
  const [infoText, setInfoText] = useState("");
  const [picked, setPicked] = useState<{
    origin: "kind" | "custom" | "question" | "any";
    kind?: string | null;
    fieldKey?: string | null;
  } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const load = useCallback(
    async (campaignId?: string) => {
      if (!calls) {
        setRefuse({ title: "This link cannot be used", body: "This link could not be opened." });
        setSeat(null);
        return;
      }
      const next = await calls.load(campaignId);
      if (!next.ok) {
        applyRefuse(next, setRefuse);
        setSeat(null);
        return;
      }
      setRefuse(null);
      setSeat(next);
    },
    [token, contactId],
  );

  useEffect(() => {
    void load().catch((err: unknown) => {
      setRefuse({
        title: "This link cannot be used",
        body: err instanceof Error ? err.message : "This link could not be opened.",
      });
    });
  }, [load]);

  const hits = useMemo(() => {
    if (!seat) return [];
    const hay = kindQuery.trim().toLowerCase();
    if (!hay) return seat.search;
    return seat.search.filter(
      (row) => row.label.toLowerCase().includes(hay) || row.value.toLowerCase().includes(hay),
    );
  }, [seat, kindQuery]);

  if (refuse) {
    return (
      <div style={{ minHeight: embedded ? "100%" : "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <Result status="warning" title={refuse.title} subTitle={refuse.body} />
      </div>
    );
  }

  if (!seat) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const run = async (fn: () => Promise<ContactSeatPayload | { ok: false; message: string }>) => {
    setBusy(true);
    try {
      const next = await fn();
      if (!next.ok) {
        if ("refuse" in next) {
          applyRefuse(next as ContactSeatRefuse, setRefuse);
          setSeat(null);
          return;
        }
        message.error(next.message);
        return;
      }
      setSeat(next);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  };

  const putIn = async () => {
    if (!picked) {
      message.info("Choose a kind, any, custom, or a question.");
      return;
    }
    await run(() =>
      calls!.upload({
        origin: picked.origin,
        kind: picked.origin === "custom" ? customKind.trim() : picked.kind,
        fieldKey: picked.fieldKey,
        bodyText: infoText.trim() || null,
        fileName,
      }),
    );
    setKindOpen(false);
    setPicked(null);
    setCustomKind("");
    setInfoText("");
    setFileName(null);
    setNav("upload");
  };

  return (
    <Layout style={{ height: embedded ? "100%" : "100vh", background: themeToken.colorBgContainer }}>
      <Sider
        width={220}
        theme="light"
        style={{ borderRight: `1px solid ${themeToken.colorSplit}` }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 20 }}>
          <div style={{ marginBottom: 28 }}>
            <Title level={3} style={{ margin: 0 }}>
              {seat.firm.name}
            </Title>
          </div>
          <Menu
            selectedKeys={[nav]}
            onClick={({ key }) => setNav(key as Nav)}
            items={[
              { key: "now", label: "Now" },
              { key: "history", label: "History" },
              { key: "upload", label: "Upload" },
            ]}
            style={{ border: "none", flex: 1 }}
          />
          <Button
            type="link"
            style={{ paddingInline: 0, marginTop: "auto", textAlign: "left" }}
            disabled={busy}
            onClick={() => void run(() => calls!.silence())}
          >
            Opt out
          </Button>
        </div>
      </Sider>
      <Content style={{ padding: 48, overflow: "auto" }}>
        {nav === "now" ? (
          <div style={{ maxWidth: 560 }}>
            <Title level={2} style={{ marginTop: 0 }}>
              {seat.now.title}
            </Title>
            <Paragraph type="secondary">{seat.now.instruction}</Paragraph>
            {seat.now.state === "consent" ? (
              <div
                style={{
                  border: `1px solid ${themeToken.colorBorder}`,
                  borderRadius: 8,
                  padding: 24,
                  marginTop: 24,
                }}
              >
                <Paragraph>{seat.now.consentCopy}</Paragraph>
                <Space>
                  <Button
                    type="primary"
                    loading={busy}
                    onClick={() => void run(() => calls!.consent("agree"))}
                  >
                    Agree
                  </Button>
                  <Button
                    loading={busy}
                    onClick={() => void run(() => calls!.consent("ignore"))}
                  >
                    Ignore
                  </Button>
                </Space>
              </div>
            ) : null}
            {seat.now.state === "form" ? (
              <Form
                layout="vertical"
                style={{ marginTop: 24 }}
                onFinish={() => {
                  const answers = (seat.now.formFields ?? [])
                    .map((field) => ({ fieldKey: field.fieldKey, value: formValues[field.fieldKey] }))
                    .filter((row) => String(row.value ?? "").trim());
                  void run(() => calls!.facts(answers));
                }}
              >
                {(seat.now.formFields ?? []).map((field) => (
                  <Form.Item key={field.fieldKey} label={field.label}>
                    <Input
                      value={formValues[field.fieldKey] ?? ""}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, [field.fieldKey]: event.target.value }))
                      }
                    />
                  </Form.Item>
                ))}
                <Button type="primary" htmlType="submit" loading={busy}>
                  Submit
                </Button>
              </Form>
            ) : null}
            {seat.now.state === "meeting" ? (
              <MeetingBook
                slots={seat.now.meetingSlots ?? []}
                busy={busy}
                onConfirm={(slot) => void run(() => calls!.book(slot))}
              />
            ) : null}
          </div>
        ) : null}

        {nav === "history" ? (
          <div style={{ maxWidth: 720 }}>
            <Title level={2} style={{ marginTop: 0 }}>
              History
            </Title>
            <Paragraph type="secondary">The asks that prompted outreach.</Paragraph>
            <Table
              rowKey="id"
              pagination={false}
              dataSource={seat.history}
              onRow={(row) => ({
                onClick: () => setOpenAsk(row),
                style: { cursor: "pointer" },
              })}
              columns={[
                { title: "Ask", dataIndex: "title" },
                {
                  title: "Status",
                  dataIndex: "outstanding",
                  render: (outstanding: boolean) => (outstanding ? "Outstanding" : "Done"),
                },
              ]}
            />
            <Modal
              open={Boolean(openAsk)}
              title={openAsk?.title}
              onCancel={() => setOpenAsk(null)}
              footer={
                openAsk?.outstanding ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      const campaignId = openAsk.campaignId ?? undefined;
                      setOpenAsk(null);
                      setNav("now");
                      void load(campaignId);
                    }}
                  >
                    Open in Now
                  </Button>
                ) : null
              }
            >
              <Paragraph>{openAsk?.body}</Paragraph>
            </Modal>
          </div>
        ) : null}

        {nav === "upload" ? (
          <div style={{ maxWidth: 720 }}>
            <Title level={2} style={{ marginTop: 0 }}>
              Upload
            </Title>
            <Paragraph type="secondary">Put information into {seat.firm.name}. Any type, or a kind.</Paragraph>
            <Tabs
              items={[
                {
                  key: "put",
                  label: "Put in",
                  children: (
                    <Upload.Dragger
                      multiple={false}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setFileName(file.name);
                        setKindOpen(true);
                        return false;
                      }}
                      onDrop={() => setKindOpen(true)}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p>Drop a file, or choose a kind</p>
                      <Button
                        type="link"
                        onClick={(event) => {
                          event.stopPropagation();
                          setKindOpen(true);
                        }}
                      >
                        Choose a kind
                      </Button>
                    </Upload.Dragger>
                  ),
                },
                {
                  key: "files",
                  label: "Files",
                  children:
                    seat.files.length === 0 ? (
                      <Empty description="Nothing put in yet" />
                    ) : (
                      <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={seat.files}
                        columns={[
                          { title: "Kind", dataIndex: "kind", render: (value: string | null) => value || "Any" },
                          { title: "File", dataIndex: "fileName", render: (value: string | null) => value || "—" },
                          { title: "When", dataIndex: "createdAt", render: (value: string) => new Date(value).toLocaleString() },
                        ]}
                      />
                    ),
                },
              ]}
            />
            <Modal
              title="What are you putting in?"
              open={kindOpen}
              onCancel={() => setKindOpen(false)}
              onOk={() => void putIn()}
              confirmLoading={busy}
              okText="Continue"
            >
              <Input.Search
                placeholder="Search kinds or a question we already asked"
                value={kindQuery}
                onChange={(event) => setKindQuery(event.target.value)}
                style={{ marginBottom: 12 }}
              />
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  block
                  type={picked?.origin === "any" ? "primary" : "default"}
                  onClick={() => setPicked({ origin: "any", kind: null })}
                >
                  Any
                </Button>
                {hits.map((hit) => (
                  <Button
                    key={`${hit.kind}-${hit.value}`}
                    block
                    type={
                      picked?.origin === (hit.kind === "question" ? "question" : "kind") &&
                      (hit.kind === "question" ? picked.fieldKey === hit.value : picked.kind === hit.value)
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      setPicked(
                        hit.kind === "question"
                          ? { origin: "question", fieldKey: hit.value, kind: hit.value }
                          : { origin: "kind", kind: hit.value },
                      )
                    }
                  >
                    {hit.kind === "question" ? `Answer that question · ${hit.label}` : hit.label}
                  </Button>
                ))}
                {picked ? (
                  <Input.TextArea
                    rows={3}
                    placeholder={
                      picked.origin === "question"
                        ? "Context for that question"
                        : "Information to put in (optional if you attached a file)"
                    }
                    value={infoText}
                    onChange={(event) => setInfoText(event.target.value)}
                  />
                ) : null}
                <Text type="secondary">Add custom</Text>
                <Input
                  placeholder="A kind you name"
                  value={customKind}
                  onChange={(event) => {
                    setCustomKind(event.target.value);
                    setPicked({ origin: "custom", kind: event.target.value });
                  }}
                />
                {fileName ? <Text type="secondary">File: {fileName}</Text> : null}
              </Space>
            </Modal>
          </div>
        ) : null}
      </Content>
    </Layout>
  );
}

export function ContactAntScene({ contactId }: { contactId?: string }) {
  if (!contactId) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
        <Empty description="No contact workspace selected." />
      </div>
    );
  }
  return <ContactWorkspace contactId={contactId} embedded />;
}
