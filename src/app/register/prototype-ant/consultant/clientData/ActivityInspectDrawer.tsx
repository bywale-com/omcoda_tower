import { Descriptions, Drawer, Empty, Space, Tabs, Tag, Typography } from "antd";
import type { ActivityRow } from "./engagementProjection";

const { Text, Paragraph, Title } = Typography;

type Props = {
  row: ActivityRow | null;
  open: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

function milestoneTags(row: ActivityRow) {
  const state = row.attemptState ?? {};
  const flags: Array<{ key: string; label: string; on: boolean }> = [
    { key: "sent", label: "Sent", on: row.kind === "send" || Boolean(state.delivered || state.delivered_at) },
    { key: "delivered", label: "Delivered", on: Boolean(state.delivered || state.delivered_at) },
    { key: "opened", label: "Opened", on: Boolean(state.opened || state.opened_at) },
    { key: "clicked", label: "Clicked", on: Boolean(state.link_clicked) },
    { key: "form", label: "Form started", on: Boolean(state.form_started || state.form_started_at) },
    { key: "submitted", label: "Form submitted", on: Boolean(state.form_submitted) },
  ];
  return flags.map((f) => (
    <Tag key={f.key} color={f.on ? "processing" : "default"}>
      {f.label}
    </Tag>
  ));
}

export function ActivityInspectDrawer({
  row,
  open,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: Props) {
  const hasReplay = Boolean(row?.subject || row?.bodyText || row?.bodyHtml);

  return (
    <Drawer
      title={row?.title ?? "Activity node"}
      open={open}
      onClose={onClose}
      width={440}
      destroyOnClose
      extra={
        <Space>
          <a
            onClick={hasPrev ? onPrev : undefined}
            style={{ opacity: hasPrev ? 1 : 0.35, cursor: hasPrev ? "pointer" : "default" }}
          >
            Prev
          </a>
          <a
            onClick={hasNext ? onNext : undefined}
            style={{ opacity: hasNext ? 1 : 0.35, cursor: hasNext ? "pointer" : "default" }}
          >
            Next
          </a>
        </Space>
      }
    >
      {!row ? (
        <Empty description="No node selected" />
      ) : (
        <Tabs
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Milestones</Text>
                    <div style={{ marginTop: 6 }}>{milestoneTags(row)}</div>
                  </div>
                  {(row.criteriaId || row.waitWindow || row.thoughtSummary) && (
                    <div>
                      <Title level={5} style={{ marginTop: 0 }}>
                        Decision
                      </Title>
                      {row.criteriaLabel ? (
                        <Paragraph style={{ marginBottom: 4 }}>
                          Criteria · {row.criteriaLabel}
                        </Paragraph>
                      ) : null}
                      {row.waitWindow ? (
                        <Paragraph style={{ marginBottom: 4 }}>
                          Wait window · {row.waitWindow}
                        </Paragraph>
                      ) : null}
                      {row.fromChannel || row.toChannel ? (
                        <Paragraph style={{ marginBottom: 4 }}>
                          Channel · {(row.fromChannel ?? "—") + " → " + (row.toChannel ?? "—")}
                        </Paragraph>
                      ) : null}
                      {row.thoughtSummary ? (
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          {row.thoughtSummary}
                        </Paragraph>
                      ) : null}
                    </div>
                  )}
                  <div>
                    <Title level={5} style={{ marginTop: 0 }}>
                      Replay
                    </Title>
                    {hasReplay ? (
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        {row.channel ? <Tag>{row.channel}</Tag> : null}
                        {row.subject ? (
                          <Text strong>Subject · {row.subject}</Text>
                        ) : null}
                        {row.bodyHtml ? (
                          <div
                            style={{
                              border: "1px solid var(--ant-color-split)",
                              padding: 12,
                              borderRadius: 6,
                              background: "var(--ant-color-bg-container)",
                            }}
                            dangerouslySetInnerHTML={{ __html: row.bodyHtml }}
                          />
                        ) : row.bodyText ? (
                          <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                            {row.bodyText}
                          </Paragraph>
                        ) : null}
                      </Space>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No persisted send content for this node yet"
                      />
                    )}
                  </div>
                </Space>
              ),
            },
            {
              key: "metadata",
              label: "Metadata",
              children: (
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Event">{row.eventKind}</Descriptions.Item>
                  <Descriptions.Item label="When">
                    {new Date(row.at).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Record id">
                    <Text code copyable style={{ fontSize: 11 }}>
                      {row.id}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Attempt">
                    {row.attemptId ? (
                      <Text code copyable style={{ fontSize: 11 }}>
                        {row.attemptId}
                      </Text>
                    ) : (
                      "—"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Attempt status">
                    {row.attemptStatus ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Criteria">{row.criteriaId ?? "—"}</Descriptions.Item>
                  <Descriptions.Item label="Message">
                    {row.messageId ? (
                      <Text code copyable style={{ fontSize: 11 }}>
                        {row.messageId}
                      </Text>
                    ) : (
                      "—"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Channel">{row.channel ?? "—"}</Descriptions.Item>
                  <Descriptions.Item label="Payload">
                    <Text code style={{ fontSize: 10, whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(row.payload, null, 2)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}
