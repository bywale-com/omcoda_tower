import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Collapse,
  Empty,
  Space,
  Splitter,
  Tag,
  Typography,
} from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Hint, Surface } from "../../chrome";
import type { ActiveAttemptRow } from "../../../../wire/machineTypes";
import {
  buildAttemptBands,
  buildChannelBars,
  buildWaitBars,
  type ActivityRow,
  type ChronologyStatus,
} from "./engagementProjection";

const { Text } = Typography;

const ROW_HEIGHT = 88;
const AXIS_HEIGHT = 36;
const PX_PER_HOUR_DEFAULT = 28;
const PX_PER_HOUR_MIN = 10;
const PX_PER_HOUR_MAX = 96;

const CHANNEL_COLOR: Record<string, string> = {
  text: "#2563eb",
  sms: "#2563eb",
  email: "#0d9488",
  form: "#7c3aed",
  call: "#f59e0b",
  meeting: "#16a34a",
};

const ATTEMPT_COLORS = ["#0d9488", "#d97706", "#ea580c", "#2563eb"];

const STATUS_COLOR: Record<ChronologyStatus, string> = {
  historical: "default",
  active: "processing",
  armed: "warning",
  waiting: "orange",
};

type Props = {
  rows: ActivityRow[];
  attempts: ActiveAttemptRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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

function formatTick(ms: number, pxPerHour: number): string {
  const d = new Date(ms);
  if (pxPerHour >= 48) {
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (pxPerHour >= 20) {
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ActivityChronology({ rows, attempts, selectedId, onSelect }: Props) {
  const [pxPerHour, setPxPerHour] = useState(PX_PER_HOUR_DEFAULT);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const syncing = useRef<"list" | "timeline" | null>(null);

  const chronological = useMemo(
    () => rows.slice().sort((a, b) => a.atMs - b.atMs),
    [rows],
  );
  const listOrder = useMemo(
    () => rows.slice().sort((a, b) => b.atMs - a.atMs),
    [rows],
  );

  const nowMs = Date.now();
  const bands = useMemo(
    () => buildAttemptBands(attempts, rows, nowMs),
    [attempts, rows, nowMs],
  );
  const channelBars = useMemo(() => buildChannelBars(rows), [rows]);
  const waitBars = useMemo(() => buildWaitBars(rows), [rows]);

  const { originMs, endMs, widthPx } = useMemo(() => {
    const points = [
      ...chronological.map((r) => r.atMs),
      ...bands.flatMap((b) => [b.startMs, b.endMs]),
      ...waitBars.flatMap((b) => [b.startMs, b.endMs]),
      nowMs,
    ].filter((n) => Number.isFinite(n) && n > 0);
    if (!points.length) {
      return { originMs: nowMs - 86_400_000, endMs: nowMs + 3_600_000, widthPx: 400 };
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const pad = Math.max(3_600_000, (max - min) * 0.08);
    const origin = min - pad;
    const end = max + pad;
    const hours = Math.max(4, (end - origin) / 3_600_000);
    return {
      originMs: origin,
      endMs: end,
      widthPx: Math.max(480, hours * pxPerHour),
    };
  }, [chronological, bands, waitBars, nowMs, pxPerHour]);

  const xFor = (ms: number) => ((ms - originMs) / 3_600_000) * pxPerHour;
  const timelineHeight = AXIS_HEIGHT + Math.max(1, listOrder.length) * ROW_HEIGHT;

  const tickStepMs = useMemo(() => {
    if (pxPerHour >= 60) return 60 * 60_000;
    if (pxPerHour >= 28) return 6 * 60 * 60_000;
    if (pxPerHour >= 16) return 24 * 60 * 60_000;
    return 2 * 24 * 60 * 60_000;
  }, [pxPerHour]);

  const ticks = useMemo(() => {
    const out: number[] = [];
    const start = Math.ceil(originMs / tickStepMs) * tickStepMs;
    for (let t = start; t <= endMs; t += tickStepMs) out.push(t);
    return out;
  }, [originMs, endMs, tickStepMs]);

  const zoom = (factor: number) =>
    setPxPerHour((v) =>
      Math.max(PX_PER_HOUR_MIN, Math.min(PX_PER_HOUR_MAX, Math.round(v * factor))),
    );

  const jumpToday = () => {
    const x = Math.max(0, xFor(nowMs) - 160);
    if (timelineRef.current) timelineRef.current.scrollLeft = x;
  };

  useEffect(() => {
    if (!selectedId) return;
    const idx = listOrder.findIndex((r) => r.id === selectedId);
    if (idx < 0) return;
    const top = idx * ROW_HEIGHT;
    listRef.current?.scrollTo({ top: Math.max(0, top - 40), behavior: "smooth" });
    const row = listOrder[idx];
    if (row && timelineRef.current) {
      timelineRef.current.scrollLeft = Math.max(0, xFor(row.atMs) - 120);
      timelineRef.current.scrollTop = Math.max(0, AXIS_HEIGHT + idx * ROW_HEIGHT - 40);
    }
  }, [selectedId, listOrder, pxPerHour, originMs]);

  const onListScroll = () => {
    if (syncing.current === "timeline") return;
    syncing.current = "list";
    if (listRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = listRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      syncing.current = null;
    });
  };

  const onTimelineScroll = () => {
    if (syncing.current === "list") return;
    syncing.current = "timeline";
    if (listRef.current && timelineRef.current) {
      listRef.current.scrollTop = timelineRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      syncing.current = null;
    });
  };

  if (rows.length === 0) {
    return <Empty description="No engagement activity for this contact yet" />;
  }

  return (
    <Surface label="Activity chronology" style={{ height: 520, minHeight: 420 }}>
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--ant-color-split)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Text strong>Activity</Text>
        <Tag color="default">Historical</Tag>
        <Tag color="processing">Active</Tag>
        <Tag color="warning">Armed</Tag>
        <Tag color="orange">Waiting</Tag>
        <Tag color="cyan">Attempts</Tag>
        <span style={{ flex: 1 }} />
        <Button size="small" onClick={jumpToday}>
          Today
        </Button>
        <Button size="small" icon={<ZoomOutOutlined />} onClick={() => zoom(0.85)} />
        <Button size="small" icon={<ZoomInOutlined />} onClick={() => zoom(1.15)} />
      </div>
      <div style={{ padding: "4px 12px 0" }}>
        <Hint>
          Ledger chronology — list ↔ timeline sync; click a row or marker to inspect.
        </Hint>
      </div>

      <Splitter style={{ height: "calc(100% - 72px)" }}>
        <Splitter.Panel defaultSize={340} min={260} max="55%">
          <div
            ref={listRef}
            onScroll={onListScroll}
            style={{ height: "100%", overflow: "auto", padding: 8 }}
          >
            {listOrder.map((row) => {
              const selected = row.id === selectedId;
              const expandable = Boolean(
                row.criteriaLabel || row.waitWindow || row.thoughtSummary || row.outcomeSummary,
              );
              return (
                <div
                  key={row.id}
                  onClick={() => onSelect(row.id)}
                  style={{
                    minHeight: ROW_HEIGHT - 8,
                    marginBottom: 8,
                    padding: 10,
                    border: "1px solid var(--ant-color-split)",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: selected
                      ? "var(--ant-color-primary-bg)"
                      : "var(--ant-color-bg-container)",
                  }}
                >
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space wrap size={4}>
                      <Tag color={kindColor(row.kind)}>{row.kind}</Tag>
                      <Tag color={STATUS_COLOR[row.chronologyStatus]}>{row.chronologyStatus}</Tag>
                      {row.channel ? <Tag>{row.channel}</Tag> : null}
                      {row.attemptStatus ? (
                        <Tag color={row.attemptStatus === "open" ? "processing" : "default"}>
                          attempt · {row.attemptStatus}
                        </Tag>
                      ) : null}
                    </Space>
                    <Text strong>{row.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(row.at).toLocaleString()}
                    </Text>
                    <Space size={4} wrap>
                      {row.signals
                        .filter((s) => s.on)
                        .map((s) => (
                          <Tag key={s.key} color="blue" style={{ marginInlineEnd: 0 }}>
                            {s.label}
                          </Tag>
                        ))}
                      {row.signals.every((s) => !s.on) ? (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          No delivery signals yet
                        </Text>
                      ) : null}
                    </Space>
                    {expandable ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Collapse
                          size="small"
                          ghost
                          activeKey={expandedIds.includes(row.id) ? [row.id] : []}
                          onChange={(keys) => {
                            const open = (Array.isArray(keys) ? keys : [keys]).map(String);
                            setExpandedIds((prev) => {
                              const without = prev.filter((id) => id !== row.id);
                              return open.includes(row.id) ? [...without, row.id] : without;
                            });
                          }}
                          items={[
                            {
                              key: row.id,
                              label: "Criteria / wait / outcome",
                              children: (
                                <Space direction="vertical" size={2}>
                                  {row.criteriaLabel ? (
                                    <Text style={{ fontSize: 12 }}>
                                      Criteria · {row.criteriaLabel}
                                    </Text>
                                  ) : null}
                                  {row.waitWindow ? (
                                    <Text style={{ fontSize: 12 }}>
                                      Wait window · {row.waitWindow}
                                      {row.fromChannel || row.toChannel
                                        ? ` · ${(row.fromChannel ?? "—") + " → " + (row.toChannel ?? "—")}`
                                        : ""}
                                    </Text>
                                  ) : null}
                                  {row.thoughtSummary ? (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Reasoning · {row.thoughtSummary}
                                    </Text>
                                  ) : null}
                                  {row.outcomeSummary ? (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {row.outcomeSummary}
                                    </Text>
                                  ) : null}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      </div>
                    ) : null}
                  </Space>
                </div>
              );
            })}
          </div>
        </Splitter.Panel>

        <Splitter.Panel min={280}>
          <div
            ref={timelineRef}
            onScroll={onTimelineScroll}
            style={{
              height: "100%",
              overflow: "auto",
              background: "var(--ant-color-bg-layout)",
            }}
          >
            <div style={{ position: "relative", width: widthPx, height: timelineHeight }}>
              {ticks.map((t) => (
                <div
                  key={t}
                  style={{
                    position: "absolute",
                    left: xFor(t),
                    top: 0,
                    bottom: 0,
                    borderLeft: "1px solid var(--ant-color-split)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--ant-color-text-tertiary)",
                      marginLeft: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTick(t, pxPerHour)}
                  </span>
                </div>
              ))}

              {/* Today line */}
              <div
                title="Today"
                style={{
                  position: "absolute",
                  left: xFor(nowMs),
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "#ef4444",
                  opacity: 0.85,
                  zIndex: 3,
                }}
              />

              {bands.map((band) => (
                <div
                  key={band.id}
                  title={`Attempt ${band.id} · ${band.status}`}
                  style={{
                    position: "absolute",
                    left: xFor(band.startMs),
                    top: AXIS_HEIGHT - 10,
                    width: Math.max(8, xFor(band.endMs) - xFor(band.startMs)),
                    height: 6,
                    borderRadius: 999,
                    background: ATTEMPT_COLORS[band.colorIndex % ATTEMPT_COLORS.length],
                    opacity: band.status === "open" ? 0.95 : 0.55,
                    zIndex: 1,
                  }}
                />
              ))}

              {channelBars.map((bar, i) => (
                <div
                  key={bar.id}
                  title={`${bar.channel} channel`}
                  style={{
                    position: "absolute",
                    left: xFor(bar.startMs),
                    top: AXIS_HEIGHT - 18 - i * 5,
                    width: Math.max(8, xFor(bar.endMs) - xFor(bar.startMs)),
                    height: 4,
                    borderRadius: 999,
                    background: CHANNEL_COLOR[bar.channel] ?? "#64748b",
                    zIndex: 1,
                  }}
                />
              ))}

              {waitBars.map((bar) => {
                const idx = listOrder.findIndex((r) => r.id === bar.rowId);
                const top = AXIS_HEIGHT + Math.max(0, idx) * ROW_HEIGHT + 28;
                return (
                  <div
                    key={bar.id}
                    title={bar.label}
                    onClick={() => onSelect(bar.rowId)}
                    style={{
                      position: "absolute",
                      left: xFor(bar.startMs),
                      top,
                      width: Math.max(10, xFor(bar.endMs) - xFor(bar.startMs)),
                      height: 10,
                      borderRadius: 999,
                      background: "repeating-linear-gradient(90deg,#f59e0b 0 6px,transparent 6px 10px)",
                      opacity: 0.85,
                      cursor: "pointer",
                      zIndex: 2,
                    }}
                  />
                );
              })}

              {listOrder.map((row, index) => {
                const top = AXIS_HEIGHT + index * ROW_HEIGHT;
                const selected = row.id === selectedId;
                return (
                  <div key={row.id}>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top,
                        height: 1,
                        background: "var(--ant-color-split)",
                      }}
                    />
                    <div
                      title={row.title}
                      onClick={() => onSelect(row.id)}
                      style={{
                        position: "absolute",
                        left: xFor(row.atMs) - 5,
                        top: top + 40,
                        width: 10,
                        height: 26,
                        borderRadius: 999,
                        background:
                          CHANNEL_COLOR[row.channel ?? ""] ??
                          (row.kind === "window" ? "#f59e0b" : "#64748b"),
                        boxShadow: selected
                          ? "0 0 0 3px var(--ant-color-primary)"
                          : "0 0 0 2px var(--ant-color-bg-container)",
                        cursor: "pointer",
                        zIndex: 4,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Splitter.Panel>
      </Splitter>
    </Surface>
  );
}
