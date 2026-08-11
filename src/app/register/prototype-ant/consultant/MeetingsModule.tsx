import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Segmented,
  Space,
  Splitter,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Hint, ModulePage, Surface } from "../chrome";
import { hydrateFactsFromMachine, mergeFactsPreferMachine } from "../../prototype/shared/meetingsStore";
import type { LiveBriefFact } from "../../prototype/shared/meetingsStore";
import { useWireTick, wirePorts } from "../../../wire";
import { contactDisplayName } from "./shared";

const { Text, Title, Paragraph } = Typography;

type MeetingRow = {
  id: string;
  clientId: string;
  contactName: string;
  time: string;
  status: "Upcoming" | "Tentative";
  phase: string;
  purpose: string;
  overview: string;
  pathway: string;
  observation: string;
  bookedAt: string;
  slot: string | null;
  source: string;
  facts?: LiveBriefFact[];
  asOf?: string;
};

type MeetingsModuleProps = {
  initialSelectedId?: string | null;
  firmLabel?: string;
  onBackToBoard?: () => void;
};

function formatMeetingTime(bookedAt: string, slot: string | null): string {
  if (slot?.trim()) return slot.trim();
  const d = new Date(bookedAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MeetingsModule({
  initialSelectedId = null,
  firmLabel = "Firm desk",
  onBackToBoard,
}: MeetingsModuleProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [copied, setCopied] = useState(false);
  const [hydratedFacts, setHydratedFacts] = useState<LiveBriefFact[] | null>(null);
  const [cascadeNote, setCascadeNote] = useState<string | null>(null);
  const [hydratedAsOf, setHydratedAsOf] = useState<string | null>(null);
  const [rows, setRows] = useState<MeetingRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wireTick = useWireTick();

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [mtg, contacts] = await Promise.all([
          wirePorts.machineApi.listMeetings(),
          wirePorts.machineApi.listContactRecords().catch(() => []),
        ]);
        if (cancelled) return;
        const names = new Map(
          contacts.map((c) => [c.id, contactDisplayName(c)] as const),
        );
        setRows(
          mtg.meetings.map((m) => ({
            id: m.id,
            clientId: m.contactId,
            contactName: names.get(m.contactId) ?? m.contactId.slice(0, 8),
            time: formatMeetingTime(m.bookedAt, m.slot),
            status: "Upcoming" as const,
            phase: "Meeting-ready",
            purpose: m.source ? `Booked · ${m.source}` : "Booked meeting",
            overview: m.consultantName
              ? `Booked with ${m.consultantName}.`
              : "Meeting booked under this firm.",
            pathway: "From meeting_booked — Live brief facts hydrate from write-backs when present.",
            observation: "Machine meeting row — no seed scenery.",
            bookedAt: m.bookedAt,
            slot: m.slot,
            source: m.source,
          })),
        );
        setLoaded(true);
      } catch {
        if (!cancelled) {
          setRows([]);
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wireTick]);

  const selected = rows.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected?.clientId) {
      setHydratedFacts(null);
      setCascadeNote(null);
      setHydratedAsOf(null);
      return;
    }
    let cancelled = false;
    void hydrateFactsFromMachine(selected.clientId)
      .then(({ facts, cascadeNote: note, asOf }) => {
        if (cancelled) return;
        setHydratedFacts(facts.length > 0 ? facts : null);
        setCascadeNote(note ?? null);
        setHydratedAsOf(asOf ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setHydratedFacts(null);
          setCascadeNote(null);
          setHydratedAsOf(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.clientId, selected?.id]);

  const briefFacts =
    selected && hydratedFacts && hydratedFacts.length > 0
      ? mergeFactsPreferMachine(hydratedFacts, selected.facts ?? [])
      : (selected?.facts ?? []);
  const briefAsOf = hydratedAsOf ?? selected?.asOf;

  const dayBuckets = useMemo(() => {
    const buckets = new Map<string, MeetingRow[]>();
    for (const row of rows) {
      const d = new Date(row.bookedAt);
      const key = Number.isNaN(d.getTime())
        ? "Unscheduled"
        : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      const list = buckets.get(key) ?? [];
      list.push(row);
      buckets.set(key, list);
    }
    return [...buckets.entries()];
  }, [rows]);

  const listColumns: ColumnsType<MeetingRow> = [
    {
      title: "Contact",
      dataIndex: "contactName",
      key: "contactName",
      ellipsis: true,
      render: (name, row) => (
        <Surface label="Meeting row">
          <Text strong={row.id === selectedId} ellipsis style={{ maxWidth: "100%" }}>
            {name}
          </Text>
        </Surface>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 104,
      render: (status: MeetingRow["status"]) => (
        <Tag color={status === "Tentative" ? "default" : "processing"}>{status}</Tag>
      ),
    },
    { title: "Time", dataIndex: "time", key: "time", width: 140, ellipsis: true },
    {
      title: "Phase",
      dataIndex: "phase",
      key: "phase",
      width: 118,
      render: (phase) => <Tag color="processing">{phase}</Tag>,
    },
  ];

  function copyBrief(meeting: MeetingRow, factsOverride?: LiveBriefFact[]) {
    const facts = factsOverride ?? meeting.facts ?? [];
    const lines = [
      `${meeting.contactName} · ${meeting.purpose}`,
      `Time: ${meeting.time}`,
      briefAsOf ?? "",
      "",
      ...facts.map((f) => `${f.label}: ${f.value} (${f.signal})`),
      "",
      meeting.overview,
    ].filter(Boolean);
    void navigator.clipboard?.writeText(lines.join("\n")).catch(() => undefined);
    setCopied(true);
    message.success("Brief copied");
    window.setTimeout(() => setCopied(false), 1600);
  }

  const indexPane = (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--ant-color-bg-container)",
        border: selected ? "1px solid var(--ant-color-split)" : undefined,
        borderRadius: selected ? 8 : 0,
        overflow: "hidden",
      }}
    >
      <ModulePage
        title="Meetings"
        surface="Meetings"
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {firmLabel} · {rows.length} booked
          </Text>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap>
            <Surface label="List / Calendar">
              <Segmented
                value={viewMode}
                onChange={(v) => setViewMode(v as "list" | "calendar")}
                options={[
                  { label: "List", value: "list" },
                  { label: "Calendar", value: "calendar" },
                ]}
              />
            </Surface>
          </Space>

          {loaded && rows.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text strong>No meetings booked yet</Text>
                  <Hint>Nothing in meeting_booked for this firm.</Hint>
                </Space>
              }
            >
              {onBackToBoard ? (
                <Button onClick={onBackToBoard}>Back to Board</Button>
              ) : null}
            </Empty>
          ) : viewMode === "calendar" ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              {dayBuckets.map(([day, dayRows]) => (
                <div key={day}>
                  <Text type="secondary" strong style={{ fontSize: 11, textTransform: "uppercase" }}>
                    {day}
                  </Text>
                  {dayRows.map((row) => (
                    <Button
                      key={row.id}
                      block
                      type={selectedId === row.id ? "primary" : "default"}
                      style={{ marginTop: 4, textAlign: "left", height: "auto" }}
                      onClick={() => setSelectedId(row.id)}
                      data-register-surface="Meeting row"
                    >
                      <div>{row.contactName}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {row.status} · {row.time} · {row.phase}
                      </Text>
                    </Button>
                  ))}
                </div>
              ))}
            </Space>
          ) : rows.length > 0 ? (
            <Table
              size="small"
              columns={listColumns}
              dataSource={rows}
              rowKey="id"
              pagination={false}
              tableLayout="fixed"
              onRow={(row) => ({
                onClick: () => setSelectedId(row.id),
                style: {
                  cursor: "pointer",
                  background: row.id === selectedId ? "var(--ant-color-primary-bg)" : undefined,
                },
              })}
            />
          ) : null}
        </Space>
      </ModulePage>
    </div>
  );

  const detailPane = selected ? (
    <Surface
      label="Meeting"
      style={{
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--ant-color-bg-container)",
        border: "1px solid var(--ant-color-split)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--ant-color-split)" }}>
        <Title level={5} style={{ margin: 0 }}>
          Meeting · {selected.contactName}
        </Title>
        <Text type="secondary">
          {selected.status} · {selected.time} · {selected.phase}
        </Text>
      </div>

      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--ant-color-split)" }}>
        <Surface label="Live brief">
          <Tag color="processing">Live brief open</Tag>
        </Surface>
      </div>

      <Surface label="Live brief" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
            <Space>
              <Text strong>Live brief</Text>
              <Text type="secondary">{selected.time}</Text>
            </Space>
            <Space>
              {briefAsOf ? (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {briefAsOf}
                </Text>
              ) : null}
              <Surface label="Copy brief">
                <Button size="small" onClick={() => copyBrief(selected, briefFacts)}>
                  {copied ? "Copied" : "Copy brief"}
                </Button>
              </Surface>
            </Space>
          </Space>

          <div>
            <Title level={5} style={{ margin: 0 }}>
              {selected.contactName}
            </Title>
            <Text type="secondary">{selected.purpose}</Text>
          </div>

          {briefFacts.length > 0 ? (
            <div>
              <Text strong>Current facts</Text>
              <Table
                size="small"
                style={{ marginTop: 8 }}
                pagination={false}
                dataSource={briefFacts.map((f) => ({ ...f, key: f.label }))}
                columns={[
                  { title: "Fact", dataIndex: "label", key: "label" },
                  { title: "Value", dataIndex: "value", key: "value" },
                  {
                    title: "Signal",
                    dataIndex: "signal",
                    key: "signal",
                    render: (s, row) => <Tag title={row.signalHint ?? s}>{s}</Tag>,
                  },
                ]}
              />
              {cascadeNote ? (
                <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 11 }}>
                  {cascadeNote}
                </Text>
              ) : null}
            </div>
          ) : (
            <Empty description="No fact write-backs for this contact yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          <div>
            <Text strong>Overview</Text>
            <Paragraph style={{ marginTop: 8 }}>{selected.overview}</Paragraph>
          </div>
          <div>
            <Text strong>Pathway</Text>
            <Paragraph style={{ marginTop: 8 }}>{selected.pathway}</Paragraph>
          </div>
          <div>
            <Text strong>Observation</Text>
            <Paragraph style={{ marginTop: 8 }}>{selected.observation}</Paragraph>
          </div>
        </Space>
      </Surface>
    </Surface>
  ) : null;

  return (
    <Surface label="Meetings" style={{ height: "100%", minHeight: 0 }}>
      {selected ? (
        <Splitter style={{ height: "100%" }}>
          <Splitter.Panel defaultSize="48%" min={320} max="65%">
            {indexPane}
          </Splitter.Panel>
          <Splitter.Panel min={280}>{detailPane}</Splitter.Panel>
        </Splitter>
      ) : (
        indexPane
      )}
    </Surface>
  );
}
