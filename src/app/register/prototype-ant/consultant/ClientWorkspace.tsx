import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { Hint, Surface } from "../chrome";
import { loadClientMachineNote } from "../../prototype/operator/operatorWireHelpers";
import { wirePorts } from "../../../wire";
import { ClientDataPanel } from "./clientData/ClientDataPanel";
import {
  PHASE_LABEL,
  contactDisplayName,
  phaseTagColor,
  resolveWorkspacePhase,
  silenceCauseLabel,
  type HaltRetention,
} from "./shared";

const { Text, Title } = Typography;

type ClientWorkspaceProps = {
  clientId: string;
  contactName?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  halt: HaltRetention | null;
  licenseeLabel: string;
  meetingReady?: boolean;
  activityKick?: number;
  focusRecordId?: string | null;
  onHaltOutreach: () => void;
  onLiftHalt: () => void;
  onOpenAcceptedTerms?: () => void;
};

export function ClientWorkspace({
  clientId,
  contactName,
  contactEmail,
  contactPhone,
  halt,
  licenseeLabel,
  meetingReady = false,
  activityKick = 0,
  focusRecordId = null,
  onHaltOutreach,
  onLiftHalt,
  onOpenAcceptedTerms,
}: ClientWorkspaceProps) {
  const [tab, setTab] = useState<"brief" | "client-data">("brief");
  const [machineNote, setMachineNote] = useState<string | null>(null);
  const [name, setName] = useState(contactName ?? clientId);
  const [email, setEmail] = useState<string | null>(contactEmail ?? null);
  const [phone, setPhone] = useState<string | null>(contactPhone ?? null);
  const meetingReadyIds = useMemo(
    () => (meetingReady ? new Set([clientId]) : new Set<string>()),
    [meetingReady, clientId],
  );
  const phase = resolveWorkspacePhase(clientId, Boolean(halt), meetingReadyIds);

  useEffect(() => {
    if (activityKick > 0 || focusRecordId) setTab("client-data");
  }, [activityKick, focusRecordId]);

  useEffect(() => {
    setName(contactName ?? clientId);
    setEmail(contactEmail ?? null);
    setPhone(contactPhone ?? null);
  }, [clientId, contactName, contactEmail, contactPhone]);

  useEffect(() => {
    if (contactName) return;
    let cancelled = false;
    void wirePorts.machineApi
      .listContactRecords()
      .then((contacts) => {
        if (cancelled) return;
        const match = contacts.find((c) => c.id === clientId);
        if (match) {
          setName(contactDisplayName(match));
          setEmail(match.email);
          setPhone(match.phone);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [clientId, contactName]);

  useEffect(() => {
    let cancelled = false;
    void loadClientMachineNote(clientId).then((note) => {
      if (!cancelled) setMachineNote(note);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <Surface
      label="Client workspace"
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--ant-color-split)",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--ant-color-split)",
          background: "var(--ant-color-bg-container)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Surface label="Phase signal">
          <Tag color={phaseTagColor(phase)} title="Phase from halt / meeting book">
            Phase · {PHASE_LABEL[phase]}
          </Tag>
        </Surface>
        {machineNote ? (
          <Tag color="processing" title="Machine board detection / enrollment">
            {machineNote}
          </Tag>
        ) : null}
        <Tag
          color={silenceCauseLabel(clientId, halt) !== "—" ? "warning" : "default"}
          title="Why this client is silent"
        >
          Silence · {silenceCauseLabel(clientId, halt)}
        </Tag>
        <span style={{ flex: 1 }} />
        <Text type="secondary" style={{ fontSize: 11 }} title="Licensee identity">
          Under · {licenseeLabel}
        </Text>
        {onOpenAcceptedTerms ? (
          <Surface label="Accepted terms">
            <Button size="small" onClick={onOpenAcceptedTerms}>
              Accepted terms
            </Button>
          </Surface>
        ) : null}
        <Surface label="Halt outreach">
          {halt ? (
            <Surface label="Lift halt">
              <Button size="small" onClick={onLiftHalt}>
                Lift halt
              </Button>
            </Surface>
          ) : (
            <Button size="small" danger onClick={onHaltOutreach}>
              Halt outreach
            </Button>
          )}
        </Surface>
      </div>

      {halt ? (
        <Alert
          type="error"
          showIcon
          style={{ flexShrink: 0 }}
          message={`Halted · scope ${halt.scope === "book" ? "Firm book" : "This contact"} · ${halt.at}`}
          description={`Halt reason: ${halt.reason.trim() ? halt.reason : "— (none recorded)"}`}
        />
      ) : null}

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as "brief" | "client-data")}
        style={{ flexShrink: 0 }}
        tabBarStyle={{ paddingInline: 16, marginBottom: 0 }}
        items={[
          {
            key: "brief",
            label: <Surface label="Client Brief">Client Brief</Surface>,
            children: null,
          },
          {
            key: "client-data",
            label: <Surface label="Client Data">Client Data</Surface>,
            children: null,
          },
        ]}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
        {tab === "brief" ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={5} style={{ margin: 0 }}>
              {name}
            </Title>
            <Hint>Contact record from this firm&apos;s book — no seed brief.</Hint>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Name">{name}</Descriptions.Item>
              <Descriptions.Item label="Email">{email?.trim() || "—"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{phone?.trim() || "—"}</Descriptions.Item>
              <Descriptions.Item label="Contact id">
                <Text code copyable={{ text: clientId }} style={{ fontSize: 12 }}>
                  {clientId}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phase">{PHASE_LABEL[phase]}</Descriptions.Item>
            </Descriptions>
            <Button size="small" onClick={() => setTab("client-data")}>
              Open Client Data
            </Button>
          </Space>
        ) : (
          <ClientDataPanel
            clientId={clientId}
            contactName={name}
            contactEmail={email}
            contactPhone={phone}
            phaseLabel={PHASE_LABEL[phase]}
            activityKick={activityKick}
            focusRecordId={focusRecordId}
          />
        )}
      </div>
    </Surface>
  );
}
