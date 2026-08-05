/**
 * Provision — New firm form, complete handoff, copy login / send invite.
 */
import { useState } from "react";
import { Button, Card, Form, Input, Select, Space, Tag, Typography, message } from "antd";
import { Hint, ModulePage, Surface } from "../chrome";

const LOGIN_PATH = "https://tower.omcoda.com/login?tenancy=assisted";

export function ProvisionModule() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("consultant-owner");
  const [provisioned, setProvisioned] = useState<string | null>(null);
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  const canProvision = name.trim() && website.trim() && email.trim();

  return (
    <ModulePage title="Provision" surface="Provision">
      <Surface label="New firm">
        <Hint>Assisted / OLG door — intentional mint into the same application lattice as ALG.</Hint>
        <Form layout="vertical" style={{ maxWidth: 420 }}>
          <Form.Item label="Firm name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Harbor RCIC Desk" />
          </Form.Item>
          <Form.Item label="Website">
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="harborrcic.ca" />
          </Form.Item>
          <Form.Item label="Primary user email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="consultant@harborrcic.ca" />
          </Form.Item>
          <Form.Item label="Role seed">
            <Select
              value={role}
              onChange={setRole}
              options={[
                { value: "consultant-owner", label: "Consultant owner" },
                { value: "consultant-staff", label: "Consultant staff" },
                { value: "firm-admin", label: "Firm admin" },
              ]}
            />
          </Form.Item>
          <Button
            type="primary"
            data-register-surface="Provision"
            disabled={!canProvision}
            onClick={() => {
              setProvisioned(`${name.trim()} · ${email.trim()} · ${role}`);
              setHandoffNote(null);
              message.success("Provision complete");
            }}
          >
            Provision
          </Button>
        </Form>
      </Surface>

      {provisioned ? (
        <Surface label="Provision complete" style={{ marginTop: 16 }}>
          <Card size="small" title="Provision complete" extra={<Tag color="success">minted</Tag>}>
            <Typography.Paragraph type="secondary">{provisioned}. Hand the consultant the same Login OTP path.</Typography.Paragraph>
            <Space wrap>
              <Button data-register-surface="Copy Login path / Send invite" onClick={() => setHandoffNote(`Copied · ${LOGIN_PATH}`)}>
                Copy Login path
              </Button>
              <Button onClick={() => setHandoffNote(`Invite sent to ${email.trim()} · OTP path attached`)}>
                Send invite
              </Button>
            </Space>
            {handoffNote ? <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>{handoffNote}</Typography.Text> : null}

            <Surface label="Activation Progress glance" style={{ marginTop: 16 }}>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color="warning">forward-deployed · pending</Tag>
                <Tag>authorize-book · pending</Tag>
                <Tag>escrow-held · pending</Tag>
                <Tag color="warning">0% · staging required</Tag>
              </Space>
              <Space wrap>
                <Button onClick={() => setHandoffNote(`Jump to Activation state · ${name.trim()}`)}>Jump to Activation state</Button>
                <Button onClick={() => setHandoffNote(`Jump to Commercial · ${name.trim()}`)}>Jump to Commercial</Button>
              </Space>
            </Surface>
          </Card>
        </Surface>
      ) : null}
    </ModulePage>
  );
}
