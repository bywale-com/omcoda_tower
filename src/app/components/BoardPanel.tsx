import { useState, type CSSProperties } from "react";
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { PhaseTooltip } from "./PhaseTooltip";
import { ActivityBarHeader } from "./ActivityBarHeader";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { docsBranchLabelStyle, docsChildLabelStyle } from "./docs/treeTypography";
import {
  DOCS_TREE_ACTIVE_BORDER,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
  s,
} from "./docs/treeLayout";
import { NotionIcon } from "./icons/NotionIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { clientList, getClientPhaseSnapshot } from "../data/clients";
import type { ClientMeta, ClientPhaseSnapshot } from "../data/clients";
import type { ConsultantTask } from "../data/tasks";
import { useTasks } from "../context/TaskContext";
import type { Tokens } from "./tokens";

const CLIENT_ROW_H = DOCS_TREE_ROW_H;
const CLIENT_ICON_SLOT = DOCS_TREE_ICON_SLOT;
const CLIENT_LABEL_SIZE = DOCS_TREE_LABEL_SIZE;
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
          <NotionIcon name="lightning-bolt" size={DOCS_TREE_ICON_SIZE} color={REACTIVATION_ORANGE} />
        </span>
      );
    case "nudge":
      return (
        <span style={slot}>
          <NotionIcon name="circle-dashed" size={DOCS_TREE_ICON_SIZE} color={NUDGE_YELLOW} spin />
        </span>
      );
    case "opt-in":
      return (
        <span style={slot}>
          <NotionIcon name="user" size={DOCS_TREE_ICON_SIZE} color={t.accent} />
        </span>
      );
    case "opted-out":
      return (
        <span style={slot}>
          <NotionIcon name="bell-slash" size={DOCS_TREE_ICON_SIZE} color={textTone} />
        </span>
      );
    case "monitoring":
      return (
        <span style={slot}>
          <NotionIcon name="bell" size={DOCS_TREE_ICON_SIZE} color={textTone} />
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

function ClientRow({
  client,
  isActive,
  t,
  isDark,
  onClientClick,
  onViewInActivity,
  onViewAsClient,
}: {
  client: ClientMeta;
  isActive: boolean;
  t: Tokens;
  isDark: boolean;
  onClientClick: (id: string) => void;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
  onViewAsClient?: (client: ClientMeta) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const showRowMenu = client.id === "sarah" && (hovered || menuOpen);

  return (
    <div
      onClick={() => onClientClick(client.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: CLIENT_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: "pointer",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        borderLeft: isActive ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}` : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
      }}
    >
      <ClientRowIcon
        client={client}
        t={t}
        isDark={isDark}
        isRowActive={isActive}
        onViewInActivity={onViewInActivity}
      />

      <span style={{
        ...docsChildLabelStyle(CLIENT_LABEL_SIZE, t.textPrimary, t),
        flex: 1,
      }}>
        {client.name}
      </span>

      {client.id === "sarah" && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Client actions"
              aria-label="Client actions"
              aria-hidden={!showRowMenu}
              tabIndex={showRowMenu ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
              className={`flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted-foreground outline-none ${showRowMenu ? "" : "pointer-events-none invisible"}`}
            >
              <MoreHorizontal size={14} strokeWidth={2} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={6}
            className="w-48 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onViewAsClient?.(client);
                setMenuOpen(false);
              }}
            >
              <Eye size={14} strokeWidth={2} className="text-muted-foreground" />
              View as Client
            </button>
          </PopoverContent>
        </Popover>
      )}
    </div>
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
  isDocsModeOpen: boolean;
  onToggleDocsMode: () => void;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
  onViewAsClient?: (clientId: string) => void;
  t: Tokens;
  isDark: boolean;
};

function ClientsSectionHeader({
  count,
  open,
  onToggle,
  t,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const labelColor = t.textDim;

  return (
    <HolonBoundary
      id="clients-section"
      label="Clients Section"
      icon="people"
      order={SHELL_HOLON_ORDER["clients-section"]}
      t={t}
      onClick={onToggle}
      onMouseEnter={(e) => {
        setHovered(true);
        (e.currentTarget as HTMLElement).style.background = t.hoverBg;
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NotionIcon name="people" size={DOCS_TREE_ICON_SIZE} color={labelColor} />
      </span>
      <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, labelColor, hovered || open)}>
        Clients
      </span>
      <span style={{ flex: 1, minWidth: 0 }} />
      <span
        style={{
          minWidth: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          padding: "0 5px",
          borderRadius: 999,
          background: t.sidebarBadgeBg,
          color: t.sidebarBadgeFg,
          fontSize: s(10),
          fontWeight: 500,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {count}
      </span>
      <ChevronDown
        size={DOCS_TREE_CHEVRON_SIZE}
        color={t.textMuted}
        strokeWidth={2}
        style={{
          flexShrink: 0,
          transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.12s ease",
        }}
      />
    </HolonBoundary>
  );
}

function AccordionHeader({
  label,
  count,
  open,
  onToggle,
  t,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
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
  isDocsModeOpen,
  onToggleDocsMode,
  onViewInActivity,
  onViewAsClient,
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
        isDocsModeOpen={isDocsModeOpen}
        onToggleDocsMode={onToggleDocsMode}
        t={t}
        isDark={isDark}
      />

      <ClientsSectionHeader
        count={clientList.length}
        open={clientsOpen}
        onToggle={() => setClientsOpen((o) => !o)}
        t={t}
      />

      <HolonBoundary
        id="board-body"
        label="Board Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["board-body"]}
        t={t}
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        {clientsOpen && clientList.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              isActive={activeClientId === client.id}
              t={t}
              isDark={isDark}
              onClientClick={onClientClick}
              onViewInActivity={onViewInActivity}
              onViewAsClient={(client) => onViewAsClient?.(client.id)}
            />
          ))}

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
      </HolonBoundary>
    </div>
  );
}
