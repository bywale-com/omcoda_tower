import { useState, type CSSProperties } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { PhaseTooltip } from "./PhaseTooltip";
import { ActivityBarHeader } from "./ActivityBarHeader";
import { ContactsBody } from "./contacts/ContactsBody";
import { ContactsSectionHeader } from "./contacts/ContactsSectionHeader";
import { HubBody } from "./hub/HubBody";
import { HolonBoundary } from "./docs/HolonBoundary";
import {
  CLIENT_NAME_HOLON,
  CLIENT_ROW_HOLON,
  PHASE_SIGNAL_HOLON,
  ROW_ACTIONS_HOLON,
} from "./docs/boardBodyHolons";
import { docsTargetHighlight, holonInspectTargetProps, useIsDocsTarget } from "./docs/docsHighlight";
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
import {
  TOWER_POPOVER_CONTENT_CLASS,
  TOWER_POPOVER_MENU_ITEM_CLASS,
} from "./ui/towerChrome";
import { clientList, getClientPhaseSnapshot } from "../data/clients";
import { contactList } from "../data/contacts";
import { useAudits } from "../context/AuditContext";
import { useAutomations } from "../context/AutomationContext";
import { hubAgentList } from "../data/hub";
import type { HubToolRef } from "../data/hub";
import { importList } from "../data/imports";
import type { ClientMeta, ClientPhaseSnapshot } from "../data/clients";
import type { ConsultantTask } from "../data/tasks";
import { useTasks } from "../context/TaskContext";
import { TasksBody } from "./tasks/TasksBody";
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
  const isPhaseHighlighted = useIsDocsTarget(PHASE_SIGNAL_HOLON.id);

  return (
    <PhaseTooltip
      snapshot={snapshot}
      t={t}
      isDark={isDark}
      onViewInActivity={() => onViewInActivity(client.id, snapshot.activityNodeId)}
    >
      <span
        {...holonInspectTargetProps(PHASE_SIGNAL_HOLON.id)}
        style={{
          display: "flex",
          flexShrink: 0,
          cursor: "default",
          borderRadius: 4,
          ...docsTargetHighlight(isPhaseHighlighted, t.accent),
        }}
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
  const isDocsHighlighted = useIsDocsTarget(CLIENT_ROW_HOLON.id);
  const isNameHighlighted = useIsDocsTarget(CLIENT_NAME_HOLON.id);
  const isRowActionsHighlighted = useIsDocsTarget(ROW_ACTIONS_HOLON.id);

  return (
    <div
      {...holonInspectTargetProps(CLIENT_ROW_HOLON.id)}
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
        ...docsTargetHighlight(isDocsHighlighted, t.accent),
      }}
    >
      <ClientRowIcon
        client={client}
        t={t}
        isDark={isDark}
        isRowActive={isActive}
        onViewInActivity={onViewInActivity}
      />

      <span
        {...holonInspectTargetProps(CLIENT_NAME_HOLON.id)}
        style={{
        ...docsChildLabelStyle(CLIENT_LABEL_SIZE, t.textPrimary, t),
        flex: 1,
        borderRadius: 4,
        ...docsTargetHighlight(isNameHighlighted, t.accent),
      }}>
        {client.name}
      </span>

      {client.id === "sarah" && (
        <span
          style={{
            display: "flex",
            flexShrink: 0,
            borderRadius: 4,
            ...docsTargetHighlight(isRowActionsHighlighted, t.accent),
          }}
        >
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
            className={TOWER_POPOVER_CONTENT_CLASS}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={TOWER_POPOVER_MENU_ITEM_CLASS}
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
        </span>
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
  activeContactId: string | null;
  onContactClick: (id: string) => void;
  activeHubTool: HubToolRef | null;
  onHubToolClick: (tool: HubToolRef) => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
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

export function BoardPanel({
  width,
  activeClientId,
  onClientClick,
  activeTouchpointId,
  onTaskClick,
  activeIcon,
  onIconClick,
  activeContactId,
  onContactClick,
  activeHubTool,
  onHubToolClick,
  isConsoleOpen,
  onToggleConsole,
  onViewInActivity,
  onViewAsClient,
  t,
  isDark,
}: BoardPanelProps) {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const { tasks, openTaskCount, toggleTaskStatus } = useTasks();
  const { audits, createAndRunAudit } = useAudits();
  const { automations, createAutomation } = useAutomations();
  const clientsInView = clientsOpen && clientList.length > 0;

  function handleAuditImportsContinue(importIds: string[]) {
    createAndRunAudit(importIds);
  }

  function handleAddAutomation() {
    const workflow = createAutomation();
    onHubToolClick({ kind: "automation", id: workflow.id });
  }

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
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={onToggleConsole}
        t={t}
        isDark={isDark}
      />

      {activeIcon === "contacts" ? (
        <>
          <ContactsSectionHeader count={contactList.length} t={t} />
          <ContactsBody
            contacts={contactList}
            imports={importList}
            activeContactId={activeContactId}
            onContactClick={onContactClick}
            t={t}
          />
        </>
      ) : activeIcon === "hub" ? (
        <HubBody
          audits={audits}
          agents={hubAgentList}
          automations={automations}
          imports={importList}
          activeTool={activeHubTool}
          onToolClick={onHubToolClick}
          onAuditImportsContinue={handleAuditImportsContinue}
          onAddAutomation={handleAddAutomation}
          t={t}
        />
      ) : (
        <>
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
        <HolonBoundary
          id={CLIENT_ROW_HOLON.id}
          label={CLIENT_ROW_HOLON.label}
          icon={CLIENT_ROW_HOLON.icon}
          order={CLIENT_ROW_HOLON.order}
          registerOnly
          inView={clientsInView}
          onFocus={() => setClientsOpen(true)}
          t={t}
        >
          <HolonBoundary
            id={PHASE_SIGNAL_HOLON.id}
            label={PHASE_SIGNAL_HOLON.label}
            icon={PHASE_SIGNAL_HOLON.icon}
            order={PHASE_SIGNAL_HOLON.order}
            registerOnly
            inView={clientsInView}
            onFocus={() => setClientsOpen(true)}
            t={t}
          >
            {null}
          </HolonBoundary>
          <HolonBoundary
            id={CLIENT_NAME_HOLON.id}
            label={CLIENT_NAME_HOLON.label}
            icon={CLIENT_NAME_HOLON.icon}
            order={CLIENT_NAME_HOLON.order}
            registerOnly
            inView={clientsInView}
            onFocus={() => setClientsOpen(true)}
            t={t}
          >
            {null}
          </HolonBoundary>
          <HolonBoundary
            id={ROW_ACTIONS_HOLON.id}
            label={ROW_ACTIONS_HOLON.label}
            lucideIcon={ROW_ACTIONS_HOLON.lucideIcon}
            order={ROW_ACTIONS_HOLON.order}
            registerOnly
            inView={clientsInView}
            onFocus={() => setClientsOpen(true)}
            t={t}
          >
            {null}
          </HolonBoundary>
        </HolonBoundary>
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

      </HolonBoundary>

        <TasksBody
          tasks={tasks}
          open={tasksOpen}
          onToggleOpen={() => setTasksOpen((o) => !o)}
          openTaskCount={openTaskCount}
          activeTouchpointId={activeTouchpointId}
          onTaskClick={onTaskClick}
          onToggleStatus={toggleTaskStatus}
          t={t}
        />
        </>
      )}
    </div>
  );
}
