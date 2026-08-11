import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Segmented, Space, Splitter, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { ClientWorkspace } from "./ClientWorkspace";
import { useWireTick, wirePorts } from "../../../wire";
import type {
  EligibilityResultRow,
  EnrollmentRow,
  MotionDecisionRow,
  SignalRow,
} from "../../../wire/machineTypes";
import {
  PHASE_LABEL,
  contactDisplayName,
  phaseTagColor,
  resolveWorkspacePhase,
  type BookContact,
  type HaltRetention,
} from "./shared";

const { Text } = Typography;

type MachineMeeting = {
  id: string;
  contactId: string;
  bookedAt: string;
  slot: string | null;
};

type BoardRow = {
  key: string;
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  phase: string;
  halted: boolean;
};

type BoardModuleProps = {
  activeClientId: string | null;
  onClientSelect: (id: string) => void;
  haltByContact: Record<string, HaltRetention>;
  bookHalt: HaltRetention | null;
  bookHalted: boolean;
  licenseeLabel: string;
  bookAuthorized: boolean;
  termsAccepted: boolean;
  activityKick: number;
  onHaltOutreach: () => void;
  onLiftHalt: () => void;
  onHaltBook: () => void;
  onResumeBook: () => void;
  onMeetingClick: (meetingId: string) => void;
  onSeeAllMeetings: () => void;
  onOpenAcceptedTerms?: () => void;
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatMeetingTime(m: MachineMeeting): string {
  if (m.slot?.trim()) return m.slot.trim();
  const d = new Date(m.bookedAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function BoardModule({
  activeClientId,
  onClientSelect,
  haltByContact,
  bookHalt,
  bookHalted,
  licenseeLabel,
  bookAuthorized,
  termsAccepted,
  activityKick,
  onHaltOutreach,
  onLiftHalt,
  onHaltBook,
  onResumeBook,
  onMeetingClick,
  onSeeAllMeetings,
  onOpenAcceptedTerms,
}: BoardModuleProps) {
  const [search, setSearch] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const wireTick = useWireTick();
  const [contacts, setContacts] = useState<BookContact[]>([]);
  const [meetings, setMeetings] = useState<MachineMeeting[]>([]);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResultRow[]>([]);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [motionDecisions, setMotionDecisions] = useState<MotionDecisionRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void wirePorts.machineApi
      .boardDetections()
      .then((data) => {
        if (cancelled) return;
        setEligibilityResults(data.eligibilityResults);
        setSignals(data.signals);
        setMotionDecisions(data.motionDecisions);
        setEnrollments(data.enrollments);
      })
      .catch(() => {
        if (!cancelled) {
          setEligibilityResults([]);
          setSignals([]);
          setMotionDecisions([]);
          setEnrollments([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [wireTick, activityKick]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [book, mtg] = await Promise.all([
          wirePorts.machineApi.listContactRecords(),
          wirePorts.machineApi.listMeetings(),
        ]);
        if (cancelled) return;
        setContacts(
          book.map((c) => ({
            id: c.id,
            name: contactDisplayName(c),
            email: c.email,
            phone: c.phone,
          })),
        );
        setMeetings(
          mtg.meetings.map((m) => ({
            id: m.id,
            contactId: m.contactId,
            bookedAt: m.bookedAt,
            slot: m.slot,
          })),
        );
        setBookLoaded(true);
      } catch {
        if (cancelled) return;
        setContacts([]);
        setMeetings([]);
        setBookLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wireTick, activityKick]);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of contacts) map.set(c.id, c.name);
    return map;
  }, [contacts]);

  const meetingReadyClientIds = useMemo(
    () => new Set(meetings.map((m) => m.contactId)),
    [meetings],
  );

  const todayMeetings = useMemo(
    () => meetings.filter((m) => isToday(m.bookedAt)),
    [meetings],
  );

  const haltForClient = (id: string): HaltRetention | null =>
    bookHalt ?? haltByContact[id] ?? null;

  const rows: BoardRow[] = useMemo(() => {
    const list = contacts.map((client) => {
      const halt = haltForClient(client.id);
      const phase = resolveWorkspacePhase(client.id, Boolean(halt), meetingReadyClientIds);
      return {
        key: client.id,
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        phase: PHASE_LABEL[phase],
        halted: Boolean(halt),
      };
    });
    const filtered = search.trim()
      ? list.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
      : list;
    return sortNewest ? filtered : [...filtered].reverse();
  }, [contacts, search, sortNewest, haltByContact, bookHalt, meetingReadyClientIds]);

  const activeContact = contacts.find((c) => c.id === activeClientId) ?? null;

  const columns: ColumnsType<BoardRow> = [
    {
      title: "Client",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name, row) => (
        <Surface label="Client row">
          <Text strong={row.id === activeClientId} ellipsis style={{ maxWidth: "100%" }}>
            {name}
          </Text>
        </Surface>
      ),
    },
    {
      title: "Phase",
      dataIndex: "phase",
      key: "phase",
      width: 118,
      render: (phase, row) => (
        <Surface label="Phase signal">
          <Tag
            color={phaseTagColor(
              resolveWorkspacePhase(row.id, row.halted, meetingReadyClientIds),
            )}
          >
            {phase}
          </Tag>
        </Surface>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (v: string | null) => v || "—",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      ellipsis: true,
      render: (v: string | null) => v || "—",
    },
  ];

  const pendingHard = [
    !bookAuthorized ? "Authorize book" : null,
    !termsAccepted ? "Accept terms" : null,
  ].filter(Boolean) as string[];

  const indexPane = (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <ModulePage title="Board" surface="Board">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Surface label="Board search">
              <Input.Search
                placeholder="Search clients"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </Surface>
            <Surface label="Newest first">
              <Segmented
                value={sortNewest ? "newest" : "oldest"}
                onChange={(v) => setSortNewest(v === "newest")}
                options={[
                  { label: "Newest first", value: "newest" },
                  { label: "Oldest first", value: "oldest" },
                ]}
              />
            </Surface>
          </Space>

          {bookHalted || bookHalt ? (
            <Space>
              <Tag color="error">Firm book halted</Tag>
              <Button size="small" onClick={onResumeBook}>
                Resume book
              </Button>
            </Space>
          ) : (
            <Surface label="Halt outreach">
              <Button size="small" danger onClick={onHaltBook}>
                Halt firm book
              </Button>
            </Surface>
          )}

          {pendingHard.length > 0 ? (
            <Space wrap>
              {pendingHard.map((label) => (
                <Tag key={label} color="warning">
                  {label} pending
                </Tag>
              ))}
            </Space>
          ) : null}

          <Surface label="Today's meetings">
            <div>
              <Space wrap style={{ marginBottom: 8 }}>
                <Text strong>Today&apos;s meetings</Text>
                <Button type="link" size="small" onClick={onSeeAllMeetings}>
                  See all
                </Button>
              </Space>
              {todayMeetings.length === 0 ? (
                <Text type="secondary">No meetings booked today</Text>
              ) : (
                <Space wrap>
                  {todayMeetings.map((m) => (
                    <Button key={m.id} size="small" onClick={() => onMeetingClick(m.id)}>
                      {nameById.get(m.contactId) ?? m.contactId.slice(0, 8)} · {formatMeetingTime(m)}
                    </Button>
                  ))}
                </Space>
              )}
            </div>
          </Surface>

          <Surface label="Phase signal legend">
            <Space wrap size={4}>
              <Tag color="processing">Meeting-ready</Tag>
              <Tag color="warning">In motion</Tag>
              <Tag>Silent</Tag>
              <Tag color="error">Halted</Tag>
            </Space>
          </Surface>

          <Surface label="Machine detections">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Eligibility passes:{" "}
                {eligibilityResults.filter((r) => r.any_pathway_pass).length} · Signals: {signals.length} ·
                Motions: {motionDecisions.length} · Enrollments: {enrollments.length}
              </Text>
              {eligibilityResults.length > 0 ? (
                <Table
                  size="small"
                  pagination={false}
                  dataSource={eligibilityResults.map((r) => ({ ...r, key: r.id }))}
                  columns={[
                    { title: "Contact", dataIndex: "contact_id", key: "contact_id", width: 100 },
                    {
                      title: "Pass",
                      dataIndex: "any_pathway_pass",
                      key: "any_pathway_pass",
                      width: 56,
                      render: (v: boolean) => <Tag color={v ? "success" : "default"}>{v ? "yes" : "no"}</Tag>,
                    },
                  ]}
                />
              ) : null}
              {motionDecisions.length > 0 ? (
                <Table
                  size="small"
                  pagination={false}
                  dataSource={motionDecisions.map((m) => ({ ...m, key: m.id }))}
                  columns={[
                    { title: "Contact", dataIndex: "contact_id", key: "contact_id", width: 100 },
                    { title: "Motion", dataIndex: "motion", key: "motion" },
                  ]}
                />
              ) : null}
              {signals.length > 0 ? (
                <Table
                  size="small"
                  pagination={false}
                  dataSource={signals.map((s) => ({ ...s, key: s.id }))}
                  columns={[
                    { title: "Contact", dataIndex: "contact_id", key: "contact_id", width: 100 },
                    { title: "Kind", dataIndex: "kind", key: "kind" },
                  ]}
                />
              ) : null}
              {enrollments.length > 0 ? (
                <Table
                  size="small"
                  pagination={false}
                  dataSource={enrollments.map((e) => ({ ...e, key: e.id }))}
                  columns={[
                    { title: "Contact", dataIndex: "contact_id", key: "contact_id", width: 100 },
                    { title: "Agent", dataIndex: "agent_ref", key: "agent_ref", ellipsis: true },
                  ]}
                />
              ) : null}
            </Space>
          </Surface>

          {bookLoaded && rows.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text strong>No contacts on this firm book</Text>
                  <Hint>Upload a contact list — Board stays empty until the book has rows.</Hint>
                </Space>
              }
            />
          ) : (
            <Table
              size="small"
              columns={columns}
              dataSource={rows}
              pagination={false}
              tableLayout="fixed"
              onRow={(row) => ({
                onClick: () => onClientSelect(row.id),
                style: {
                  cursor: "pointer",
                  background: row.id === activeClientId ? "var(--ant-color-primary-bg)" : undefined,
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
        {activeClientId ? (
          <ClientWorkspace
            clientId={activeClientId}
            contactName={activeContact?.name}
            contactEmail={activeContact?.email}
            contactPhone={activeContact?.phone}
            halt={haltForClient(activeClientId)}
            licenseeLabel={licenseeLabel}
            meetingReady={meetingReadyClientIds.has(activeClientId)}
            activityKick={activityKick}
            onHaltOutreach={onHaltOutreach}
            onLiftHalt={onLiftHalt}
            onOpenAcceptedTerms={termsAccepted ? onOpenAcceptedTerms : undefined}
          />
        ) : (
          <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hint>{bookLoaded && contacts.length === 0 ? "Firm book is empty" : "Select a client from the board"}</Hint>
          </div>
        )}
      </Splitter.Panel>
    </Splitter>
  );
}
