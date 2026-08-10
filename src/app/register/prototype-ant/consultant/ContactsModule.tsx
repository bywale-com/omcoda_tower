import { useMemo, useState } from "react";
import { Alert, Button, Input, Space, Splitter, Table, Tag, Typography } from "antd";
import { CT_DEMO, wirePorts } from "../../../wire";
import type { ColumnsType } from "antd/es/table";
import { contactList, getContact, type Contact } from "../../../data/contacts";
import { Hint, ModulePage, Surface } from "../chrome";
import { ClientWorkspace } from "./ClientWorkspace";
import { selectMeetingReadyClientIds, useMeetings } from "./meetingsData";
import {
  PHASE_LABEL,
  phaseTagColor,
  resolveWorkspacePhase,
  type HaltRetention,
} from "./shared";

const { Text } = Typography;

type ContactRow = Contact & { key: string; clientName?: string };

function contactListHasClient(id: string): boolean {
  return Boolean(getContact(id)?.clientId) ||
    ["sarah", "marcus", "mark", "aisha", "priya", "james", "daniel", "fatima", "lin"].includes(id);
}

type ContactsModuleProps = {
  activeContactId: string | null;
  onContactSelect: (id: string) => void;
  haltByContact: Record<string, HaltRetention>;
  bookHalt: HaltRetention | null;
  licenseeLabel: string;
  termsAccepted: boolean;
  activityKick: number;
  workspaceClientId: string | null;
  onHaltOutreach: () => void;
  onLiftHalt: () => void;
  onOpenAcceptedTerms?: () => void;
};

export function ContactsModule({
  activeContactId,
  onContactSelect,
  haltByContact,
  bookHalt,
  licenseeLabel,
  termsAccepted,
  activityKick,
  workspaceClientId,
  onHaltOutreach,
  onLiftHalt,
  onOpenAcceptedTerms,
}: ContactsModuleProps) {
  const [search, setSearch] = useState("");
  const [grantNote, setGrantNote] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [grantPending, setGrantPending] = useState(false);
  const meetings = useMeetings();
  const meetingReadyClientIds = useMemo(
    () => selectMeetingReadyClientIds(meetings),
    [meetings],
  );

  const haltForClient = (clientId: string): HaltRetention | null =>
    bookHalt ?? haltByContact[clientId] ?? null;

  const rows: ContactRow[] = useMemo(() => {
    const list = contactList.map((c) => ({
      ...c,
      key: c.id,
      clientName: c.clientId ? getContact(c.id)?.name : undefined,
    }));
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [search]);

  const columns: ColumnsType<ContactRow> = [
    {
      title: "Contact",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name, row) => (
        <Surface label="Client row">
          <Text strong={row.id === activeContactId} ellipsis style={{ maxWidth: "100%" }}>
            {name}
          </Text>
        </Surface>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 128, ellipsis: true },
    {
      title: "Indicator",
      dataIndex: "indicator",
      key: "indicator",
      width: 104,
      render: (ind) => (
        <Tag color={ind === "sequenced" ? "processing" : ind === "silenced" ? "default" : "warning"}>
          {ind}
        </Tag>
      ),
    },
    {
      title: "Phase",
      key: "phase",
      width: 118,
      render: (_, row) => {
        if (!row.clientId) return "—";
        const halt = haltForClient(row.clientId);
        const phase = resolveWorkspacePhase(row.clientId, Boolean(halt), meetingReadyClientIds);
        return (
          <Surface label="Phase signal">
            <Tag color={phaseTagColor(phase)}>{PHASE_LABEL[phase]}</Tag>
          </Surface>
        );
      },
    },
  ];

  const showWorkspace =
    workspaceClientId &&
    activeContactId &&
    contactListHasClient(activeContactId);

  const indexPane = (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <ModulePage title="Contacts" surface="Contacts">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Surface label="Board search">
            <Input.Search
              placeholder="Search contacts"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Surface>
          <Surface label="Imports">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Hint>Imports and unsequenced contacts — Confirm book for Tower from assisted path.</Hint>
              <Button
                type="primary"
                size="small"
                loading={grantPending}
                onClick={() => {
                  setGrantPending(true);
                  setGrantNote(null);
                  void wirePorts.crmOAuth
                    .grant(CT_DEMO.firmId)
                    .then(() => {
                      setGrantNote({
                        type: "success",
                        text: "Book handover confirmed — same grant as Prepared Authorize book.",
                      });
                    })
                    .catch((err: unknown) => {
                      setGrantNote({
                        type: "error",
                        text: err instanceof Error ? err.message : "Confirm book failed",
                      });
                    })
                    .finally(() => setGrantPending(false));
                }}
              >
                Confirm book for Tower
              </Button>
              {grantNote ? (
                <Alert type={grantNote.type} showIcon message={grantNote.text} />
              ) : null}
            </Space>
          </Surface>
          <Table
            size="small"
            columns={columns}
            dataSource={rows}
            pagination={false}
            tableLayout="fixed"
            onRow={(row) => ({
              onClick: () => onContactSelect(row.id),
              style: {
                cursor: "pointer",
                background: row.id === activeContactId ? "var(--ant-color-primary-bg)" : undefined,
              },
            })}
          />
        </Space>
      </ModulePage>
    </div>
  );

  return (
    <Splitter style={{ height: "100%" }}>
      <Splitter.Panel defaultSize="46%" min={320} max="60%">
        {indexPane}
      </Splitter.Panel>
      <Splitter.Panel min={280}>
        {activeContactId && !contactListHasClient(activeContactId) ? (
          <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hint>Contact not yet on Board — select a sequenced contact to open Client workspace</Hint>
          </div>
        ) : showWorkspace ? (
          <ClientWorkspace
            clientId={workspaceClientId!}
            halt={haltForClient(workspaceClientId!)}
            licenseeLabel={licenseeLabel}
            activityKick={activityKick}
            onHaltOutreach={onHaltOutreach}
            onLiftHalt={onLiftHalt}
            onOpenAcceptedTerms={termsAccepted ? onOpenAcceptedTerms : undefined}
          />
        ) : (
          <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hint>Select a contact from the list</Hint>
          </div>
        )}
      </Splitter.Panel>
    </Splitter>
  );
}
