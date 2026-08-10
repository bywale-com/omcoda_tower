import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Space, Splitter, Table, Tag, Typography } from "antd";
import { wireFirmId, wirePorts } from "../../../wire";
import type { ColumnsType } from "antd/es/table";
import { getContact } from "../../../data/contacts";
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

type ContactRow = {
  key: string;
  id: string;
  name: string;
  phone: string;
  email?: string;
  clientId?: string;
  clientName?: string;
};

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
  const [bookRows, setBookRows] = useState<ContactRow[]>([]);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookFirmId, setBookFirmId] = useState<string | null>(null);
  const meetings = useMeetings();
  const meetingReadyClientIds = useMemo(
    () => selectMeetingReadyClientIds(meetings),
    [meetings],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const firmId = wireFirmId();
        const contacts = await wirePorts.machineApi.listContactRecords();
        if (cancelled) return;
        setBookFirmId(firmId);
        setBookError(null);
        setBookRows(
          contacts.map((c) => ({
            key: c.id,
            id: c.id,
            name: c.name?.trim() || c.email || c.phone || c.id,
            phone: c.phone ?? "",
            email: c.email ?? undefined,
            clientId: c.id,
          })),
        );
      } catch (err) {
        if (cancelled) return;
        setBookFirmId(null);
        setBookRows([]);
        setBookError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activityKick]);

  const haltForClient = (clientId: string): HaltRetention | null =>
    bookHalt ?? haltByContact[clientId] ?? null;

  const rows: ContactRow[] = useMemo(() => {
    if (!search.trim()) return bookRows;
    const q = search.trim().toLowerCase();
    return bookRows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    );
  }, [search, bookRows]);

  const columns: ColumnsType<ContactRow> = [
    {
      title: "Contact",
      dataIndex: "name",
      render: (name: string, row) => (
        <Space direction="vertical" size={0}>
          <Text>{name}</Text>
          {row.email ? <Text type="secondary" style={{ fontSize: 12 }}>{row.email}</Text> : null}
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 140,
      render: (phone: string) => phone || "—",
    },
    {
      title: "Phase",
      key: "phase",
      width: 120,
      render: (_: unknown, row) => {
        const phase = resolveWorkspacePhase(row.id);
        return <Tag color={phaseTagColor(phase)}>{PHASE_LABEL[phase]}</Tag>;
      },
    },
  ];

  const showWorkspace = Boolean(
    workspaceClientId &&
      (activeContactId === workspaceClientId || contactListHasClient(workspaceClientId)),
  );

  const indexPane = (
    <div style={{ height: "100%", overflow: "auto" }}>
      <ModulePage title="Contacts" surface="Contacts">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Surface label="Firm book">
            {bookError ? (
              <Alert
                type="warning"
                showIcon
                message="Session firm required — log in as the provisioned consultant to see this firm's book."
                description={bookError}
              />
            ) : (
              <Hint>
                {bookFirmId
                  ? `Firm ${bookFirmId.slice(0, 8)}… · ${bookRows.length} contact${bookRows.length === 1 ? "" : "s"} (empty until you upload a list)`
                  : "No session firm bound yet."}
              </Hint>
            )}
          </Surface>
          <Surface label="Search">
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
                  void (async () => {
                    try {
                      const firmId = wireFirmId();
                      await wirePorts.crmOAuth.grant(firmId);
                      setGrantNote({
                        type: "success",
                        text: "Book handover confirmed — same grant as Prepared Authorize book.",
                      });
                    } catch (err: unknown) {
                      setGrantNote({
                        type: "error",
                        text: err instanceof Error ? err.message : "Confirm book failed",
                      });
                    } finally {
                      setGrantPending(false);
                    }
                  })();
                }}
              >
                Confirm book for Tower
              </Button>
              {grantNote ? (
                <Alert type={grantNote.type} showIcon message={grantNote.text} />
              ) : null}
            </Space>
          </Surface>
          {rows.length === 0 && !bookError ? (
            <Alert
              type="info"
              showIcon
              message="This firm's book is empty"
              description="Upload a contact list as operator (Book readiness) for this firm — you will not see Cedar's contacts here."
            />
          ) : (
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
          )}
          {meetingReadyClientIds.length ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Meeting-ready in local meetings store: {meetingReadyClientIds.length}
            </Text>
          ) : null}
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
        {activeContactId && !contactListHasClient(activeContactId) && !bookRows.some((r) => r.id === activeContactId) ? (
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
