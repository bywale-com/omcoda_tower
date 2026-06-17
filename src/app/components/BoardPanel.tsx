import { useState, type CSSProperties } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckSquare,
  ChevronRight,
  Loader,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PhaseTooltip } from "./PhaseTooltip";
import { ActivityBarHeader } from "./ActivityBarHeader";
import { clientList, getClientPhaseSnapshot } from "../data/clients";
import type { ClientMeta, ClientPhaseSnapshot } from "../data/clients";
import type { ConsultantTask } from "../data/tasks";
import { useTasks } from "../context/TaskContext";
import type { Tokens } from "./tokens";

const CLIENT_ROW_H = 30;
const CLIENT_ICON_SLOT = 20;
const CLIENT_LABEL_SIZE = 13;
const REACTIVATION_ORANGE = "#f97316";
const NUDGE_YELLOW = "#eab308";

type ClientPhaseIconKind = "reactivation" | "nudge" | "opt-in" | "opted-out" | "monitoring";

function resolveClientPhaseIconKind(client: ClientMeta, snapshot: ClientPhaseSnapshot): ClientPhaseIconKind {
  if (snapshot.phase === "reactivation") return "reactivation";
  if (snapshot.phase === "re-engagement") return "nudge";
  if (!client.optedIn) return "opted-out";
  if (client.status === "teal" || client.status === "amber") return "opt-in";
  return "monitoring";
}

function ClientPhaseIcon({
  kind,
  t,
  isRowActive,
}: {
  kind: ClientPhaseIconKind;
  t: Tokens;
  isRowActive: boolean;
}) {
  const textTone = isRowActive ? t.textPrimary : t.textSidebar;
  const slot: CSSProperties = {
    width: CLIENT_ICON_SLOT,
    height: CLIENT_ICON_SLOT,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  switch (kind) {
    case "reactivation":
      return (
        <span style={slot}>
          <Zap
            size={16}
            color={REACTIVATION_ORANGE}
            fill={REACTIVATION_ORANGE}
            strokeWidth={2.5}
          />
        </span>
      );
    case "nudge":
      return (
        <span style={slot}>
          <Loader
            size={16}
            color={NUDGE_YELLOW}
            strokeWidth={2.25}
            style={{ animation: "towerSpin 1.1s linear infinite" }}
          />
        </span>
      );
    case "opt-in":
      return (
        <span style={slot}>
          <User
            size={16}
            color={t.accent}
            fill={t.accent}
            strokeWidth={2.25}
          />
        </span>
      );
    case "opted-out":
      return (
        <span style={slot}>
          <BellOff size={16} color={textTone} strokeWidth={2} />
        </span>
      );
    case "monitoring":
      return (
        <span style={slot}>
          <Bell size={16} color={textTone} strokeWidth={2} />
        </span>
      );
  }
}

function ClientRowIcon({
  client,
  t,
  isDark,
  isRowActive,
  onViewInActivity,
}: {
  client: ClientMeta;
  t: Tokens;
  isDark: boolean;
  isRowActive: boolean;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
}) {
  const snapshot = getClientPhaseSnapshot(client);
  const iconKind = resolveClientPhaseIconKind(client, snapshot);

  return (
    <PhaseTooltip
      snapshot={snapshot}
      t={t}
      isDark={isDark}
      onViewInActivity={() => onViewInActivity(client.id, snapshot.activityNodeId)}
    >
      <span
        style={{ display: "flex", flexShrink: 0, cursor: "default" }}
        onClick={(e) => e.stopPropagation()}
      >
        <ClientPhaseIcon kind={iconKind} t={t} isRowActive={isRowActive} />
      </span>
    </PhaseTooltip>
  );
}

type BoardPanelProps = {
  width: number;
  activeClientId: string;
  onClientClick: (id: string) => void;
  activeTouchpointId: string | null;
  onTaskClick: (task: ConsultantTask) => void;
  activeIcon: string;
  onIconClick: (id: string) => void;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
  t: Tokens;
  isDark: boolean;
};

function AccordionHeader({
  label,
  count,
  open,
  onToggle,
  icon: Icon,
  t,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
  t: Tokens;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        height: 24,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 6,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = t.hoverBg; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <ChevronRight
        size={12}
        color={t.textMuted}
        strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.12s ease", flexShrink: 0 }}
      />
      {Icon && (
        <Icon size={13} color={t.textDim} strokeWidth={2} style={{ flexShrink: 0 }} />
      )}
      <span style={{
        fontSize: 11,
        color: t.textDim,
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 10,
        color: t.textDim,
        fontWeight: 500,
        marginLeft: 2,
        opacity: 0.85,
      }}>
        {count}
      </span>
    </div>
  );
}

export function BoardPanel({
  width,
  activeClientId,
  onClientClick,
  activeTouchpointId,
  onTaskClick,
  activeIcon,
  onIconClick,
  onViewInActivity,
  t,
  isDark,
}: BoardPanelProps) {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const { tasks, openTaskCount, toggleTaskStatus } = useTasks();

  return (
    <div style={{
      width,
      flexShrink: 0,
      background: t.boardPanel,
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
    }}>

      <ActivityBarHeader
        activeIcon={activeIcon}
        onIconClick={onIconClick}
        t={t}
        isDark={isDark}
      />

      <AccordionHeader
        label="Clients"
        icon={Users}
        count={clientList.length}
        open={clientsOpen}
        onToggle={() => setClientsOpen((o) => !o)}
        t={t}
      />

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {clientsOpen && clientList.map((client) => {
            const isActive = activeClientId === client.id;
            return (
              <div
                key={client.id}
                onClick={() => onClientClick(client.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: CLIENT_ROW_H,
                  padding: "0 10px",
                  paddingLeft: isActive ? 10 : 12,
                  cursor: "pointer",
                  background: isActive ? t.activeRowBg : "transparent",
                  borderLeft: isActive ? `2px solid ${t.accent}` : "2px solid transparent",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = t.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <ClientRowIcon
                  client={client}
                  t={t}
                  isDark={isDark}
                  isRowActive={isActive}
                  onViewInActivity={onViewInActivity}
                />

                <span style={{
                  fontSize: CLIENT_LABEL_SIZE,
                  color: isActive ? t.textPrimary : t.textSidebar,
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}>
                  {client.name}
                </span>
              </div>
            );
          })}

        <AccordionHeader
          label="Tasks"
          count={openTaskCount}
          open={tasksOpen}
          onToggle={() => setTasksOpen((o) => !o)}
          t={t}
        />

        {tasksOpen && tasks.map((task) => {
          const isActive = activeTouchpointId === task.touchpointId;
          const isOpen = task.status === "open";
          const statusColor = isOpen ? t.red : t.success;
          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              title={`${task.label} · ${task.clientName} · opens in Activity`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: CLIENT_ROW_H,
                padding: "4px 10px",
                paddingLeft: isActive ? 10 : 12,
                cursor: "pointer",
                background: isActive ? t.activeRowBg : "transparent",
                borderLeft: `2px solid ${statusColor}`,
                borderRadius: 4,
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = t.hoverBg; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <button
                type="button"
                title={isOpen ? "Mark complete" : "Reopen task"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskStatus(task.id);
                }}
                style={{
                  width: CLIENT_ICON_SLOT,
                  height: CLIENT_ICON_SLOT,
                  borderRadius: 6,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${statusColor}66`,
                  background: isOpen ? "transparent" : `${t.success}22`,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {isOpen
                  ? <CheckSquare size={10} color={statusColor} strokeWidth={1.75} />
                  : <Check size={10} color={statusColor} strokeWidth={3} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: CLIENT_LABEL_SIZE,
                  color: isOpen ? (isActive ? t.textPrimary : t.textSidebar) : t.textMuted,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: isOpen ? "none" : "line-through",
                }}>
                  {task.label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: t.textDim,
                  lineHeight: 1.3,
                  marginTop: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {task.clientName} · {task.createdAt}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
