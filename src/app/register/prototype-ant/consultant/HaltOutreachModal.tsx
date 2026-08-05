import { Alert, Button, Form, Input, Modal, Radio, Space, Typography } from "antd";
import { Surface } from "../chrome";
import type { HaltRetention, HaltScope } from "./shared";

const { Text } = Typography;

type HaltOutreachModalProps = {
  open: boolean;
  scope: HaltScope;
  reason: string;
  onScope: (s: HaltScope) => void;
  onReason: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function HaltOutreachModal({
  open,
  scope,
  reason,
  onScope,
  onReason,
  onConfirm,
  onClose,
}: HaltOutreachModalProps) {
  const scopeLabel = scope === "contact" ? "This contact" : "Firm book";

  return (
    <Modal
      open={open}
      title="Halt outreach"
      onCancel={onClose}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Surface label="Confirm halt">
            <Button type="primary" danger onClick={onConfirm}>
              Confirm halt
            </Button>
          </Surface>
        </Space>
      }
      modalRender={(node) => <Surface label="Halt outreach">{node}</Surface>}
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Refusal under your license — runners and Send gates honor halt. Not pack authorship.
      </Text>

      <Surface label="Halt outreach">
        <Radio.Group
          value={scope}
          onChange={(e) => onScope(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          style={{ width: "100%", marginBottom: 12 }}
        >
          <Radio.Button value="contact" style={{ width: "50%", textAlign: "center" }}>
            This contact
          </Radio.Button>
          <Radio.Button value="book" style={{ width: "50%", textAlign: "center" }}>
            Firm book
          </Radio.Button>
        </Radio.Group>
      </Surface>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <>
            Confirm scope: <strong>{scopeLabel}</strong>
            {scope === "book"
              ? " — stops automatic firm→client sends across the book."
              : " — stops automatic sends for this contact only."}
          </>
        }
      />

      <Form layout="vertical">
        <Form.Item label="Reason (optional)">
          <Input
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            placeholder="Illegal / unethical motion · wrong person…"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function buildHaltRetention(scope: HaltScope, reason: string): HaltRetention {
  return { scope, reason, at: "Today · just now" };
}
