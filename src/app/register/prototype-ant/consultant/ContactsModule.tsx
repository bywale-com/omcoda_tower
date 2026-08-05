import { useMemo, useState } from "react";
import { Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { contactList, getContact, type Contact } from "../../../data/contacts";
import { Hint, ModulePage, Surface } from "../chrome";
import { ClientWorkspace } from "./ClientWorkspace";
import { MEETING_READY_CLIENT_IDS } from "./meetingsData";
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
      render: (name, row) => (
        <Surface label="Client row">
          <Text strong={row.id === activeContactId}>{name}</Text>
        </Surface>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    {
      title: "Indicator",
      dataIndex: "indicator",
      key: "indicator",
      width: 110,
      render: (ind) => (
        <Tag color={ind === "sequenced" ? "processing" : ind === "silenced" ? "default" : "warning"}>
          {ind}
        </Tag>
      ),
    },
    {
      title: "Phase",
      key: "phase",
      width: 120,
      render: (_, row) => {
        if (!row.clientId) return "—";
        const halt = haltForClient(row.clientId);
        const phase = resolveWorkspacePhase(row.clientId, Boolean(halt), MEETING_READY_CLIENT_IDS);
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

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div
        style={{
          width: 420,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          borderRight: "1px solid var(--ant-color-split)",
        }}
      >
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
              <Hint>Imports and unsequenced contacts — Confirm book for Tower from assisted path.</Hint>
            </Surface>
            <Table
              size="small"
              columns={columns}
              dataSource={rows}
              pagination={false}
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

      {activeContactId && !contactListHasClient(activeContactId) ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Hint>Select a contact from the list</Hint>
        </div>
      )}
    </div>
  );
}
