import { useMemo, useState } from "react";
import { Button, Input, Segmented, Space, Splitter, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { clientList } from "../../../data/clients";
import { Hint, ModulePage, Surface } from "../chrome";
import { ClientWorkspace } from "./ClientWorkspace";
import { CONSULTANT_TODAY_MEETINGS, MEETING_READY_CLIENT_IDS } from "./meetingsData";
import {
  PHASE_LABEL,
  phaseTagColor,
  resolveWorkspacePhase,
  type HaltRetention,
} from "./shared";

const { Text } = Typography;

type BoardRow = {
  key: string;
  id: string;
  name: string;
  phase: string;
  runtime: string;
  reachability: string;
  lastTouch: string;
  halted: boolean;
};

type BoardModuleProps = {
  activeClientId: string;
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

  const haltForClient = (id: string): HaltRetention | null =>
    bookHalt ?? haltByContact[id] ?? null;

  const rows: BoardRow[] = useMemo(() => {
    const list = clientList.map((client) => {
      const halt = haltForClient(client.id);
      const phase = resolveWorkspacePhase(client.id, Boolean(halt), MEETING_READY_CLIENT_IDS);
      const runtime =
        client.reactivationPhase === "active"
          ? "Active"
          : client.reactivationPhase === "armed"
            ? "Armed"
            : "Idle";
      const reachability =
        !client.optedIn ? "Blocked" : client.status === "grey" ? "Unknown" : "Reachable";
      return {
        key: client.id,
        id: client.id,
        name: client.name,
        phase: PHASE_LABEL[phase],
        runtime,
        reachability,
        lastTouch: client.id === "sarah" ? "Yesterday" : "Mon",
        halted: Boolean(halt),
      };
    });
    const filtered = search.trim()
      ? list.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
      : list;
  return sortNewest ? filtered : [...filtered].reverse();
  }, [search, sortNewest, haltByContact, bookHalt]);

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
              resolveWorkspacePhase(row.id, row.halted, MEETING_READY_CLIENT_IDS),
            )}
          >
            {phase}
          </Tag>
        </Surface>
      ),
    },
    {
      title: "Runtime",
      dataIndex: "runtime",
      key: "runtime",
      width: 72,
      ellipsis: true,
    },
    {
      title: "Reachability",
      dataIndex: "reachability",
      key: "reachability",
      width: 100,
      ellipsis: true,
    },
    {
      title: "Last touch",
      dataIndex: "lastTouch",
      key: "lastTouch",
      width: 92,
      ellipsis: true,
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
              <Space wrap>
                {CONSULTANT_TODAY_MEETINGS.map((m) => (
                  <Button key={m.id} size="small" onClick={() => onMeetingClick(m.id)}>
                    {m.contactName} · {m.time}
                  </Button>
                ))}
              </Space>
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
            halt={haltForClient(activeClientId)}
            licenseeLabel={licenseeLabel}
            activityKick={activityKick}
            onHaltOutreach={onHaltOutreach}
            onLiftHalt={onLiftHalt}
            onOpenAcceptedTerms={termsAccepted ? onOpenAcceptedTerms : undefined}
          />
        ) : (
          <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hint>Select a client from the board</Hint>
          </div>
        )}
      </Splitter.Panel>
    </Splitter>
  );
}
