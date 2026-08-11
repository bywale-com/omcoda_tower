import { useEffect, useMemo, useState } from "react";
import {
  Empty,
  List,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Hint, Surface } from "../../chrome";
import { useWireTick, wirePorts } from "../../../../wire";
import type {
  ActiveAttemptRow,
  EngagementRecordRow,
  FactWritebackRow,
  MissingFactSignalRow,
} from "../../../../wire/machineTypes";
import { ActivityInspectDrawer } from "./ActivityInspectDrawer";
import {
  isHistoryFieldKey,
  projectEngagementRows,
  type ActivityRow,
} from "./engagementProjection";

const { Text, Title } = Typography;

type Props = {
  clientId: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  phaseLabel: string;
  /** When bumped, force Activity tab + reload */
  activityKick?: number;
  focusRecordId?: string | null;
};

function kindColor(kind: ActivityRow["kind"]): string {
  switch (kind) {
    case "send":
      return "blue";
    case "window":
      return "orange";
    case "cell":
      return "geekblue";
    case "form_visit":
      return "purple";
    case "inbound":
      return "green";
    case "nullify":
      return "default";
    case "meeting":
      return "gold";
    default:
      return "default";
  }
}

export function ClientDataPanel({
  clientId,
  contactName,
  contactEmail,
  contactPhone,
  phaseLabel,
  activityKick = 0,
  focusRecordId = null,
}: Props) {
  const wireTick = useWireTick();
  const [dataTab, setDataTab] = useState<"information" | "history" | "activity">("activity");
  const [records, setRecords] = useState<EngagementRecordRow[]>([]);
  const [attempts, setAttempts] = useState<ActiveAttemptRow[]>([]);
  const [writebacks, setWritebacks] = useState<FactWritebackRow[]>([]);
  const [missing, setMissing] = useState<MissingFactSignalRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (activityKick > 0) setDataTab("activity");
  }, [activityKick]);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void Promise.all([
      wirePorts.machineApi.listEngagementRecords(),
      wirePorts.machineApi.listActiveAttempts(),
      wirePorts.machineApi.listFactWritebacks(clientId),
      wirePorts.machineApi.listMissingFactSignals(clientId),
    ])
      .then(([allEng, allAttempts, facts, miss]) => {
        if (cancelled) return;
        setRecords(allEng.filter((r) => r.contact_id === clientId));
        setAttempts(allAttempts.filter((a) => a.contact_id === clientId));
        setWritebacks(facts);
        setMissing(miss);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setRecords([]);
          setAttempts([]);
          setWritebacks([]);
          setMissing([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, wireTick, activityKick]);

  const activityRows = useMemo(
    () => projectEngagementRows(records, attempts),
    [records, attempts],
  );

  useEffect(() => {
    if (focusRecordId && activityRows.some((r) => r.id === focusRecordId)) {
      setSelectedId(focusRecordId);
      setDataTab("activity");
    }
  }, [focusRecordId, activityRows]);

  const selectedIndex = activityRows.findIndex((r) => r.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? activityRows[selectedIndex] : null;

  const historyPoints = useMemo(() => {
    return writebacks
      .filter((w) => isHistoryFieldKey(w.field_key))
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((w) => {
        const n = typeof w.value === "number" ? w.value : Number(w.value);
        return {
          id: w.id,
          at: w.created_at,
          label: new Date(w.created_at).toLocaleDateString(),
          field: w.field_key ?? "score",
          value: Number.isFinite(n) ? n : null,
          raw: w.value,
        };
      });
  }, [writebacks]);

  const chartData = historyPoints.filter((p) => p.value != null);

  const infoRows = useMemo(() => {
    const base = [
      { key: "name", field: "Name", value: contactName },
      { key: "email", field: "Email", value: contactEmail?.trim() || "—" },
      { key: "phone", field: "Phone", value: contactPhone?.trim() || "—" },
      { key: "phase", field: "Phase", value: phaseLabel },
      { key: "id", field: "Contact id", value: clientId },
    ];
    const fromFacts = writebacks.map((w) => ({
      key: w.id,
      field: w.field_key ?? "fact",
      value:
        typeof w.value === "string" || typeof w.value === "number"
          ? String(w.value)
          : JSON.stringify(w.value),
    }));
    return [...base, ...fromFacts];
  }, [clientId, contactName, contactEmail, contactPhone, phaseLabel, writebacks]);

  return (
    <Surface label="Client Data" style={{ height: "100%", minHeight: 0 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Client Data
          </Title>
          <Hint>
            Information / History / Activity from this firm&apos;s machine ledger — empty when
            no rows.
          </Hint>
        </div>

        <Tabs
          activeKey={dataTab}
          onChange={(k) => setDataTab(k as typeof dataTab)}
          items={[
            {
              key: "information",
              label: "Information",
              children: !loaded ? null : (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="key"
                    dataSource={infoRows}
                    columns={[
                      { title: "Field", dataIndex: "field", width: "40%" },
                      { title: "Value", dataIndex: "value" },
                    ]}
                  />
                  {missing.length > 0 ? (
                    <div>
                      <Text type="secondary">Missing facts</Text>
                      <div style={{ marginTop: 6 }}>
                        {missing.map((m) => (
                          <Tag key={m.id} color="warning">
                            {m.field_key}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Text type="secondary">No missing-fact signals.</Text>
                  )}
                </Space>
              ),
            },
            {
              key: "history",
              label: "History",
              children: !loaded ? null : historyPoints.length === 0 ? (
                <Empty description="No CRS / score history writebacks for this contact" />
              ) : (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="id"
                    dataSource={historyPoints}
                    columns={[
                      { title: "When", dataIndex: "label", width: 120 },
                      { title: "Field", dataIndex: "field" },
                      {
                        title: "Value",
                        dataIndex: "raw",
                        render: (v: unknown) =>
                          typeof v === "object" ? JSON.stringify(v) : String(v),
                      },
                    ]}
                  />
                  {chartData.length >= 2 ? (
                    <div style={{ width: "100%", height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#1677ff" dot />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                </Space>
              ),
            },
            {
              key: "activity",
              label: "Activity",
              children: !loaded ? null : activityRows.length === 0 ? (
                <Empty description="No engagement activity for this contact yet" />
              ) : (
                <List
                  size="small"
                  bordered
                  dataSource={activityRows}
                  renderItem={(row) => (
                    <List.Item
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      style={{
                        cursor: "pointer",
                        background:
                          row.id === selectedId ? "var(--ant-color-primary-bg)" : undefined,
                      }}
                    >
                      <Space direction="vertical" size={2} style={{ width: "100%" }}>
                        <Space wrap>
                          <Tag color={kindColor(row.kind)}>{row.kind}</Tag>
                          <Text strong>{row.title}</Text>
                          {row.channel ? <Tag>{row.channel}</Tag> : null}
                          {row.attemptStatus ? (
                            <Tag color={row.attemptStatus === "open" ? "processing" : "default"}>
                              attempt · {row.attemptStatus}
                            </Tag>
                          ) : null}
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(row.at).toLocaleString()}
                        </Text>
                        {row.waitWindow ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Wait · {row.waitWindow}
                            {row.criteriaLabel ? ` · ${row.criteriaLabel}` : ""}
                          </Text>
                        ) : null}
                        {row.thoughtSummary ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {row.thoughtSummary}
                          </Text>
                        ) : null}
                      </Space>
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Space>

      <ActivityInspectDrawer
        row={selectedRow}
        open={Boolean(selectedRow)}
        onClose={() => setSelectedId(null)}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < activityRows.length - 1}
        onPrev={() => {
          if (selectedIndex > 0) setSelectedId(activityRows[selectedIndex - 1].id);
        }}
        onNext={() => {
          if (selectedIndex >= 0 && selectedIndex < activityRows.length - 1) {
            setSelectedId(activityRows[selectedIndex + 1].id);
          }
        }}
      />
    </Surface>
  );
}
