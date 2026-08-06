import { useEffect, useState } from "react";
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
import { DEMO_MEETINGS, type LiveBriefMeeting } from "./meetingsData";
import { FIRM_NAME } from "./shared";

const { Text, Title, Paragraph } = Typography;

type MeetingsModuleProps = {
  initialSelectedId?: string | null;
  onBackToBoard?: () => void;
};

export function MeetingsModule({
  initialSelectedId = null,
  onBackToBoard,
}: MeetingsModuleProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [demoEmpty, setDemoEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setDemoEmpty(false);
    }
  }, [initialSelectedId]);

  const rows = demoEmpty ? [] : DEMO_MEETINGS;
  const selected = rows.find((m) => m.id === selectedId) ?? null;

  // Status is its own column — never jam Tag beside Contact in a narrow cell (SPACING.md).
  const listColumns: ColumnsType<LiveBriefMeeting> = [
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
      render: (status: LiveBriefMeeting["status"]) => (
        <Tag color={status === "Tentative" ? "default" : "processing"}>{status}</Tag>
      ),
    },
    { title: "Time", dataIndex: "time", key: "time", width: 118, ellipsis: true },
    {
      title: "Phase",
      dataIndex: "phase",
      key: "phase",
      width: 118,
      render: (phase) => <Tag color="processing">{phase}</Tag>,
    },
  ];

  function copyBrief(meeting: LiveBriefMeeting) {
    const facts = meeting.facts ?? [];
    const lines = [
      `${meeting.contactName} · ${meeting.purpose}`,
      meeting.startsIn ? `Starts: ${meeting.startsIn}` : `Time: ${meeting.time}`,
      meeting.asOf ?? "",
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

  function calendarDayRows(day: string) {
    return rows.filter(
      (r) => r.time.startsWith(day) || (day === "Next week" && r.time.includes("Next")),
    );
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
            {FIRM_NAME} · {rows.length} booked
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
            <Button
              size="small"
              onClick={() => {
                setDemoEmpty((e) => !e);
                setSelectedId(null);
              }}
            >
              {demoEmpty ? "Show booked" : "Empty state"}
            </Button>
          </Space>

          {rows.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text strong>No meetings booked yet</Text>
                  <Hint>
                    Nothing booked under bound packs. Board still shows book inhabit — receive waits on contact booking.
                  </Hint>
                </Space>
              }
            >
              {onBackToBoard ? (
                <Button onClick={onBackToBoard}>Back to Board</Button>
              ) : null}
            </Empty>
          ) : viewMode === "calendar" ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              {["Thu", "Fri", "Next week"].map((day) => {
                const dayRows = calendarDayRows(day);
                return (
                  <div key={day}>
                    <Text type="secondary" strong style={{ fontSize: 11, textTransform: "uppercase" }}>
                      {day}
                    </Text>
                    {dayRows.length === 0 ? (
                      <Text type="secondary" style={{ display: "block", padding: "6px 0" }}>
                        —
                      </Text>
                    ) : (
                      dayRows.map((row) => (
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
                      ))
                    )}
                  </div>
                );
              })}
            </Space>
          ) : (
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
          )}
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
              {selected.startsIn ? (
                <Surface label="Starts in">
                  <Tag color="processing">Starts {selected.startsIn}</Tag>
                </Surface>
              ) : (
                <Text type="secondary">{selected.time}</Text>
              )}
            </Space>
            <Space>
              {selected.asOf ? (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {selected.asOf}
                </Text>
              ) : null}
              <Surface label="Copy brief">
                <Button size="small" onClick={() => copyBrief(selected)}>
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
            {selected.highlight ? (
              <Tag color="processing" style={{ marginTop: 8 }}>
                {selected.highlight}
              </Tag>
            ) : null}
          </div>

          {(selected.facts ?? []).length > 0 ? (
            <div>
              <Text strong>Current facts</Text>
              <Table
                size="small"
                style={{ marginTop: 8 }}
                pagination={false}
                dataSource={(selected.facts ?? []).map((f) => ({ ...f, key: f.label }))}
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
            </div>
          ) : null}

          <div>
            <Text strong>Overview</Text>
            <Paragraph style={{ marginTop: 8 }}>{selected.overview}</Paragraph>
          </div>
          <div>
            <Text strong>Pathway</Text>
            <Paragraph style={{ marginTop: 8 }}>{selected.pathway}</Paragraph>
          </div>
          <div>
            <Text strong>Tower&apos;s observation</Text>
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
