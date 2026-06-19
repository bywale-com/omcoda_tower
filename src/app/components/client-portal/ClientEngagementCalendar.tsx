import { useMemo, useState } from "react";
import { ChevronDown, FileText, GitBranch, Mail, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  collectCalendarEngagementNodes,
  daysInMonth,
  isSameCalendarDay,
  JOURNEY_TODAY,
  nodesForMonth,
  PLACEHOLDER_TASK_METRICS,
  type CalendarEngagementNode,
} from "../../data/engagementCalendarData";
import { getNodeInspectorPayload } from "../inspector/emailInspectorData";
import { EngagementNodePanel } from "../inspector/EngagementNodePanel";
import { GanttBandChip } from "../NudgeGantt";
import type { Tokens } from "../tokens";
import type { JourneyChannel } from "../../data/journeyTree";

const CHANNEL_ICONS: Record<JourneyChannel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  form: FileText,
  call: GitBranch,
  visit: GitBranch,
  meeting: GitBranch,
  task: GitBranch,
  system: GitBranch,
};

const CALENDAR_NODE_WIDTH = "70%";
const CALENDAR_NODE_HEIGHT = 52;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MetricsPanel({ t }: { t: Tokens }) {
  const total = PLACEHOLDER_TASK_METRICS.reduce((sum, item) => sum + item.value, 0);

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: `1px solid ${t.borderLight}`,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        background: t.bgPrimary,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 10 }}>My tasks</div>
        <div style={{ position: "relative", height: 148 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[...PLACEHOLDER_TASK_METRICS]}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                stroke="none"
              >
                {PLACEHOLDER_TASK_METRICS.map((item) => (
                  <Cell key={item.label} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 600,
              color: t.textPrimary,
              pointerEvents: "none",
            }}
          >
            {total}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {PLACEHOLDER_TASK_METRICS.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.3 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 10 }}>Type of services</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Email outreach", "SMS follow-up", "Secure form"].map((label) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `1px solid ${t.borderLight}`,
                  background: t.hoverBg,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: t.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

const CALENDAR_DAY_MIN_WIDTH = 76;

function CalendarNodePill({
  node,
  selected,
  onClick,
  t,
}: {
  node: CalendarEngagementNode;
  selected: boolean;
  onClick: () => void;
  t: Tokens;
}) {
  return (
    <GanttBandChip
      colorIndex={node.colorIndex}
      label={node.label}
      variant={node.variant}
      selected={selected}
      onClick={onClick}
      t={t}
      icon={CHANNEL_ICONS[node.channel]}
      width={CALENDAR_NODE_WIDTH}
      height={CALENDAR_NODE_HEIGHT}
      fullWidth={false}
    />
  );
}

type ClientEngagementCalendarProps = {
  clientId: string;
  t: Tokens;
};

export function ClientEngagementCalendar({ clientId, t }: ClientEngagementCalendarProps) {
  const allNodes = useMemo(() => collectCalendarEngagementNodes(clientId), [clientId]);
  const [year, setYear] = useState(JOURNEY_TODAY.getFullYear());
  const [month, setMonth] = useState(JOURNEY_TODAY.getMonth());
  const [nodeInspector, setNodeInspector] = useState<{ touchpointId: string; sequenceId: string } | null>(null);

  const monthNodes = useMemo(() => nodesForMonth(allNodes, year, month), [allNodes, year, month]);
  const dayCount = daysInMonth(year, month);

  const nodeInspectorPayload = nodeInspector
    ? getNodeInspectorPayload(nodeInspector.touchpointId, nodeInspector.sequenceId)
    : null;

  const openNodeInspector = (touchpointId: string, sequenceId: string) => {
    if (!getNodeInspectorPayload(touchpointId, sequenceId)) return;
    setNodeInspector({ touchpointId, sequenceId });
  };

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const node of allNodes) {
      months.add(`${node.date.getFullYear()}-${node.date.getMonth()}`);
    }
    months.add(`${JOURNEY_TODAY.getFullYear()}-${JOURNEY_TODAY.getMonth()}`);
    return [...months]
      .map((key) => {
        const [y, m] = key.split("-").map(Number);
        return { year: y, month: m, label: `${MONTH_NAMES[m]} ${y}` };
      })
      .sort((a, b) => a.year - b.year || a.month - b.month);
  }, [allNodes]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background: t.bgPrimary,
      }}
    >
      <MetricsPanel t={t} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px 10px",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: t.textPrimary }}>
            Engagement
          </h2>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.textMuted }}>
            <select
              value={`${year}-${month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setYear(y);
                setMonth(m);
              }}
              style={{
                border: `1px solid ${t.borderLight}`,
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                color: t.textPrimary,
                background: t.bgPrimary,
                cursor: "pointer",
              }}
            >
              {monthOptions.map((opt) => (
                <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} color={t.textDim} />
          </label>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 18px 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dayCount}, minmax(${CALENDAR_DAY_MIN_WIDTH}px, 1fr))`,
              minWidth: dayCount * CALENDAR_DAY_MIN_WIDTH,
            }}
          >
            {Array.from({ length: dayCount }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isToday = isSameCalendarDay(date, JOURNEY_TODAY);
              const dayNodes = monthNodes.get(day) ?? [];

              return (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    borderLeft: `1px solid ${t.borderLight}`,
                    background: isToday
                      ? "repeating-linear-gradient(-45deg, rgba(59,130,246,0.07), rgba(59,130,246,0.07) 5px, transparent 5px, transparent 10px)"
                      : "transparent",
                  }}
                >
                  <div
                    style={{
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: isToday ? 600 : 500,
                      color: isToday ? "#ffffff" : t.textMuted,
                      background: isToday ? "#1e4e8c" : t.bgSecondary,
                      borderBottom: `1px solid ${t.borderLight}`,
                    }}
                  >
                    {day}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5, padding: "6px 2px 10px", minHeight: 120 }}>
                    {dayNodes.map((node) => (
                      <CalendarNodePill
                        key={node.id}
                        node={node}
                        t={t}
                        selected={nodeInspector?.touchpointId === node.id}
                        onClick={() => openNodeInspector(node.id, node.sequenceId)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {nodeInspectorPayload && nodeInspector && (
        <EngagementNodePanel
          data={nodeInspectorPayload}
          t={t}
          onClose={() => setNodeInspector(null)}
          onNavigate={(touchpointId) => openNodeInspector(touchpointId, nodeInspector.sequenceId)}
        />
      )}
    </div>
  );
}
