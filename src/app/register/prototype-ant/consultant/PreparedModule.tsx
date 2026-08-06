import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Descriptions,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { Hint, ModulePage, Surface } from "../chrome";
import { LICENSEES } from "./shared";

const { Text, Paragraph } = Typography;

type ConnectPath = "crm" | "upload" | "file";
type ModalKind = "authorize" | "accept" | null;

type PreparedModuleProps = {
  forceAcceptOpen?: boolean;
  onHardInputChange?: (state: {
    bookAuthorized: boolean;
    termsAccepted: boolean;
    licensee: string;
  }) => void;
};

export function PreparedModule({
  forceAcceptOpen = false,
  onHardInputChange,
}: PreparedModuleProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [bookAuthorized, setBookAuthorized] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [connectPath, setConnectPath] = useState<ConnectPath>("file");
  const [licensee, setLicensee] = useState(LICENSEES[0]);
  const [ackChecked, setAckChecked] = useState(false);

  useEffect(() => {
    onHardInputChange?.({ bookAuthorized, termsAccepted, licensee });
  }, [bookAuthorized, termsAccepted, licensee, onHardInputChange]);

  useEffect(() => {
    if (forceAcceptOpen) setModal("accept");
  }, [forceAcceptOpen]);

  const readinessRows = [
    { key: "1", label: "Firm identity staged", state: "Ready", ready: true },
    { key: "2", label: "Campaign under firm brand", state: "Ready", ready: true },
    { key: "3", label: "Readiness walkthrough", state: "Presented", ready: true },
    {
      key: "4",
      label: "Authorize book",
      state: bookAuthorized ? "Landed ✓" : "Pending",
      ready: bookAuthorized,
      action: "authorize" as const,
    },
    {
      key: "5",
      label: "Accept terms",
      state: termsAccepted ? "Landed ✓" : "Pending",
      ready: termsAccepted,
      action: "accept" as const,
    },
  ];

  function downloadTerms() {
    const body = [
      `Licensee: ${licensee}`,
      "License acknowledgement — outreach under this licensee.",
      "Escrow terms — meeting-booked contingent release.",
    ].join("\n");
    void navigator.clipboard?.writeText(body).catch(() => undefined);
    message.success("Terms copied to clipboard");
  }

  return (
    <Surface label="Prepared Workspace" style={{ height: "100%", padding: 12 }}>
      <div
        style={{
          height: "100%",
          background: "var(--ant-color-bg-container)",
          border: "1px solid var(--ant-color-split)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <ModulePage
          title="Prepared Workspace"
          surface="Prepared Workspace"
          extra={
            <Tag color={bookAuthorized && termsAccepted ? "success" : "warning"}>
              {bookAuthorized && termsAccepted ? "Hard inputs landed" : "Activation readiness"}
            </Tag>
          }
        >
          <Hint>
            Staged campaign under your firm identity. Complete Authorize book and Accept terms — hard
            inputs Activation state and Commercial read.
          </Hint>

          <Table
            size="small"
            pagination={false}
            dataSource={readinessRows}
            columns={[
              {
                title: "Step",
                dataIndex: "label",
                key: "label",
                render: (label, row) => (
                  <Space>
                    <Tag color={row.ready ? "success" : "default"}>{row.ready ? "✓" : "○"}</Tag>
                    {row.action ? (
                      <Button type="link" size="small" onClick={() => setModal(row.action)}>
                        {label}
                      </Button>
                    ) : (
                      label
                    )}
                  </Space>
                ),
              },
              {
                title: "State",
                dataIndex: "state",
                key: "state",
                render: (state, row) => (
                  <Text type={row.ready ? "success" : "secondary"} strong={row.ready}>
                    {state}
                  </Text>
                ),
              },
            ]}
            style={{ marginBottom: 16 }}
          />

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Surface label="Authorize book">
              <button
                type="button"
                onClick={() => setModal("authorize")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  border: `1px solid ${bookAuthorized ? "var(--ant-color-border)" : "var(--ant-color-primary)"}`,
                  borderRadius: 8,
                  background: bookAuthorized
                    ? "var(--ant-color-fill-quaternary)"
                    : "var(--ant-color-primary-bg)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Text strong>Authorize book</Text>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  Grant CRM, upload, or confirm assisted import — then Authorize.
                </Text>
              </button>
            </Surface>
            <Surface label="Accept terms">
              <button
                type="button"
                onClick={() => setModal("accept")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  border: `1px solid ${termsAccepted ? "var(--ant-color-border)" : "var(--ant-color-primary)"}`,
                  borderRadius: 8,
                  background: termsAccepted
                    ? "var(--ant-color-fill-quaternary)"
                    : "var(--ant-color-primary-bg)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Text strong>Accept terms</Text>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  License acknowledgement + escrow view — Accept commits instrument held.
                </Text>
              </button>
            </Surface>
          </Space>
        </ModulePage>
      </div>

      <Modal
        open={modal === "authorize"}
        title="Authorize book"
        onCancel={() => setModal(null)}
        modalRender={(node) => <Surface label="Authorize book">{node}</Surface>}
        footer={
          <Space>
            <Button onClick={() => setModal(null)}>Cancel</Button>
            <Surface label="Authorize">
              <Button
                type="primary"
                onClick={() => {
                  setBookAuthorized(true);
                  setModal(null);
                }}
              >
                Authorize
              </Button>
            </Surface>
          </Space>
        }
      >
        <Paragraph>
          Connect the private book Tower will mutate. Pick a path, then Authorize writes handover
          state for Book readiness and Activation state.
        </Paragraph>
        <Radio.Group
          value={connectPath}
          onChange={(e) => setConnectPath(e.target.value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <Radio value="crm">Connect CRM / grant database access</Radio>
          <Radio value="upload">Upload / confirm assisted import</Radio>
          <Radio value="file">File export (authorized snapshot)</Radio>
        </Radio.Group>
        <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
          Assisted path: Contacts → Imports → Confirm book for Tower sets the same handover without
          sequences.
        </Text>
      </Modal>

      <Modal
        open={modal === "accept"}
        title="Accept terms"
        onCancel={() => setModal(null)}
        width={520}
        modalRender={(node) => <Surface label="Accept terms">{node}</Surface>}
        footer={
          <Space>
            <Surface label="Download terms">
              <Button onClick={downloadTerms}>Download terms</Button>
            </Surface>
            <Button onClick={() => setModal(null)}>Cancel</Button>
            <Surface label="Accept">
              <Button
                type="primary"
                disabled={!ackChecked}
                onClick={() => {
                  setTermsAccepted(true);
                  setModal(null);
                }}
              >
                Accept
              </Button>
            </Surface>
          </Space>
        }
      >
        <Surface label="License acknowledgement">
          <Collapse
            defaultActiveKey={["license"]}
            items={[
              {
                key: "license",
                label: "License acknowledgement",
                children: (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text type="secondary">Authorizing licensee</Text>
                    <Select
                      value={licensee}
                      onChange={setLicensee}
                      options={LICENSEES.map((l) => ({ value: l, label: l }))}
                      style={{ width: "100%" }}
                    />
                    <Paragraph type="secondary">
                      Firm-branded outreach runs under this licensee. Halt outreach stays available without
                      reconfiguring packs.
                    </Paragraph>
                    <Checkbox checked={ackChecked} onChange={(e) => setAckChecked(e.target.checked)}>
                      I acknowledge outreach runs under my license and escrow terms below.
                    </Checkbox>
                  </Space>
                ),
              },
            ]}
          />
        </Surface>

        <Surface label="Escrow terms" style={{ marginTop: 16 }}>
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              { key: "1", label: "Instrument", children: "Meeting-booked contingent release" },
              { key: "2", label: "Held by", children: "Om Coda Commercial (operator)" },
              { key: "3", label: "Release predicate", children: "Attributed booking + attendance window" },
              { key: "4", label: "Dispute path", children: "House-overseen return / forfeit" },
            ]}
          />
        </Surface>
      </Modal>
    </Surface>
  );
}
