import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Space, Splitter, Table, Tag, Typography } from "antd";
import { wireFirmId, wirePorts } from "../../../wire";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { ClientWorkspace } from "./ClientWorkspace";
import { parseCsvFileToContacts } from "../../prototype/operator/operatorWireHelpers";

const { Text } = Typography;

type ContactRow = {
  key: string;
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags?: string[];
};

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
  const [meetingReadyIds, setMeetingReadyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const firmId = wireFirmId();
        const [contacts, mtg] = await Promise.all([
          wirePorts.machineApi.listContactRecords(),
          wirePorts.machineApi.listMeetings().catch(() => ({ meetings: [] as Array<{ contactId: string }> })),
        ]);
        if (cancelled) return;
        setBookFirmId(firmId);
        setBookError(null);
        setBookRows(
          contacts.map((c) => ({
            key: c.id,
            id: c.id,
            name: contactDisplayName(c),
            phone: c.phone ?? "",
            email: c.email ?? undefined,
            notes: c.notes ?? undefined,
            tags: c.tags ?? [],
          })),
        );
        setMeetingReadyIds(new Set(mtg.meetings.map((m) => m.contactId)));
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

  const activeRow = bookRows.find((r) => r.id === activeContactId) ?? null;
  const showWorkspace = Boolean(
    workspaceClientId && bookRows.some((r) => r.id === workspaceClientId),
  );

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
      title: "Tag",
      key: "tags",
      width: 140,
      render: (_: unknown, row: ContactRow) =>
        row.tags?.length ? (
          <Space size={4} wrap>
            {row.tags.map((tag) => (
              <Tag key={tag} color={tag === "invalid" ? "error" : tag === "valid" ? "success" : "default"}>
                {tag}
              </Tag>
            ))}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      ellipsis: true,
      render: (notes: string | undefined) => notes || "—",
    },
    {
      title: "Phase",
      key: "phase",
      width: 120,
      render: (_: unknown, row) => {
        const halt = haltForClient(row.id);
        const phase = resolveWorkspacePhase(row.id, Boolean(halt), meetingReadyIds);
        return <Tag color={phaseTagColor(phase)}>{PHASE_LABEL[phase]}</Tag>;
      },
    },
  ];

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
              <Hint>Confirm book for Tower uploads this firm’s contact file.</Hint>
              <Button
                type="primary"
                size="small"
                loading={grantPending}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv,.tsv,text/csv,text/tab-separated-values";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    setGrantPending(true);
                    setGrantNote(null);
                    void (async () => {
                      try {
                        const parsed = await parseCsvFileToContacts(file);
                        const result = await wirePorts.machineApi.importContactBook({
                          filename: file.name,
                          source: "file",
                          contacts: parsed.map((c) => ({
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            phone: c.phone,
                          })),
                        });
                        const contacts = await wirePorts.machineApi.listContactRecords();
                        setBookRows(
                          contacts.map((c) => ({
                            key: c.id,
                            id: c.id,
                            name: contactDisplayName(c),
                            phone: c.phone ?? "",
                            email: c.email ?? undefined,
                            notes: c.notes ?? undefined,
                            tags: c.tags ?? [],
                          })),
                        );
                        setGrantNote({
                          type: "success",
                          text: `Imported ${result.imported} contacts${
                            result.workflowsFired && Array.isArray(result.workflowsFired) && result.workflowsFired.length
                              ? " · house automation ran"
                              : ""
                          }.`,
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
                  };
                  input.click();
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
              message="This firm's book is empty — Confirm book for Tower to upload."
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
        {showWorkspace && workspaceClientId ? (
          <ClientWorkspace
            clientId={workspaceClientId}
            contactName={activeRow?.name}
            contactEmail={activeRow?.email ?? null}
            contactPhone={activeRow?.phone || null}
            halt={haltForClient(workspaceClientId)}
            licenseeLabel={licenseeLabel}
            meetingReady={meetingReadyIds.has(workspaceClientId)}
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
