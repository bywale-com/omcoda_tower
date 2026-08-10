/**
 * Provision — New firm form, complete handoff, copy login / send invite.
 * Writes ct_firms (+ auth users when available) via POST /machine/provision.
 */
import { useState } from "react";
import { Button, Card, Form, Input, Select, Space, Tag, Typography, message } from "antd";
import { wirePorts } from "../../../wire";
import { appendOperatorAudit } from "../../prototype/operator/operatorWireHelpers";
import { useOperatorNav } from "../../prototype/operatorNav";
import { Hint, ModulePage, Surface } from "../chrome";

export function ProvisionModule() {
  const { jumpTo } = useOperatorNav();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("consultant-owner");
  const [busy, setBusy] = useState(false);
  const [provisioned, setProvisioned] = useState<{
    firmId: string;
    firmName: string;
    email: string;
    loginPath: string;
    authUser: boolean;
  } | null>(null);
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  const canProvision = name.trim() && website.trim() && email.trim() && !busy;

  const onProvision = async () => {
    setBusy(true);
    setHandoffNote(null);
    try {
      const result = await wirePorts.machineApi.provisionFirm({
        firmName: name.trim(),
        email: email.trim(),
        website: website.trim(),
        role,
      });
      setProvisioned({
        firmId: result.firmId,
        firmName: result.firmName,
        email: result.email,
        loginPath: result.loginPath,
        authUser: result.authUser,
      });
      void appendOperatorAudit({
        actorId: "ops.system",
        kind: "provision",
        subjectType: "firm",
        subjectId: result.firmId,
        action: `Provision · ${result.firmName} minted`,
        kindLabel: "Provision",
        before: "—",
        after: "Tenancy + consultant-owner seed",
        surface: "Provision",
        firmName: result.firmName,
      });
      message.success(
        result.authUser
          ? `Provisioned ${result.firmName} · auth user ready for OTP`
          : `Provisioned ${result.firmName} · ct_firms written (auth user pending)`,
      );
    } catch (err) {
      message.error(`Provision failed: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const copyLoginPath = async () => {
    if (!provisioned) return;
    const path = `${window.location.origin}${provisioned.loginPath}`;
    try {
      await navigator.clipboard.writeText(path);
      setHandoffNote(`Copied · ${path}`);
    } catch {
      setHandoffNote(`Login path · ${path}`);
    }
  };

  const sendInvite = async () => {
    if (!provisioned) return;
    try {
      const issued = await wirePorts.otpStore.issue({ email: provisioned.email });
      const path = `${window.location.origin}${provisioned.loginPath}`;
      setHandoffNote(
        `Invite simulated · OTP issued for ${provisioned.email}` +
          (issued.debugCode ? ` · debug code ${issued.debugCode}` : "") +
          ` · open ${path}`,
      );
      message.success("Invite OTP issued (simulation note)");
    } catch (err) {
      setHandoffNote(`Invite note · open ${provisioned.loginPath} with ${provisioned.email} — OTP issue: ${String(err)}`);
    }
  };

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
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="consultant@harborrcic.ca"
            />
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
            loading={busy}
            onClick={() => void onProvision()}
          >
            Provision
          </Button>
        </Form>
      </Surface>

      {provisioned ? (
        <Surface label="Provision complete" style={{ marginTop: 16 }}>
          <Card
            size="small"
            title="Provision complete"
            extra={<Tag color="success">minted</Tag>}
          >
            <Typography.Paragraph type="secondary">
              {provisioned.firmName} · {provisioned.email} · {role} · firm id{" "}
              <code>{provisioned.firmId}</code>
              {provisioned.authUser ? " · auth user ready" : " · ct_firms only"}. Hand the consultant the same
              Login OTP path.
            </Typography.Paragraph>
            <Space wrap>
              <Button data-register-surface="Copy Login path / Send invite" onClick={() => void copyLoginPath()}>
                Copy Login path
              </Button>
              <Button onClick={() => void sendInvite()}>Send invite</Button>
            </Space>
            {handoffNote ? (
              <Typography.Text type="success" style={{ display: "block", marginTop: 8 }}>
                {handoffNote}
              </Typography.Text>
            ) : null}

            <Surface label="Activation Progress glance" style={{ marginTop: 16 }}>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color="warning">forward-deployed · pending</Tag>
                <Tag>authorize-book · pending</Tag>
                <Tag>escrow-held · pending</Tag>
                <Tag color="warning">0% · staging required</Tag>
              </Space>
              <Space wrap>
                <Button onClick={() => { const n = `Jump to Activation state · ${provisioned.firmName}`; jumpTo(n); setHandoffNote(n); }}>
                  Jump to Activation state
                </Button>
                <Button onClick={() => { const n = `Jump to Commercial · ${provisioned.firmName}`; jumpTo(n); setHandoffNote(n); }}>
                  Jump to Commercial
                </Button>
              </Space>
            </Surface>
          </Card>
        </Surface>
      ) : null}
    </ModulePage>
  );
}
