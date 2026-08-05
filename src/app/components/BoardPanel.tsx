import { useState, type CSSProperties } from "react";
import {
  ChevronDown,
  Eye,
  Hand,
  MoreHorizontal,
} from "lucide-react";
import { PhaseTooltip } from "./PhaseTooltip";
import { ActivityBarHeader } from "./ActivityBarHeader";
import { ContactsBody } from "./contacts/ContactsBody";
import { ContactsSectionHeader } from "./contacts/ContactsSectionHeader";
import { HaltOutreachBar } from "./HaltOutreachBar";
import { HubBody } from "./hub/HubBody";
import { HolonBoundary } from "./docs/HolonBoundary";
import {
  CLIENT_NAME_HOLON,
  CLIENT_ROW_HOLON,
  PHASE_SIGNAL_HOLON,
  ROW_ACTIONS_HOLON,
} from "./docs/boardBodyHolons";
import {
  ALL_NAV,
  PRIMARY_NAV,
  REGISTER_ALL_NAV,
  REGISTER_PRIMARY_NAV,
  type PrimaryNavItem,
} from "./docs/primaryNavigationIcons";
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
  registerMode,
}: {
  client: ClientMeta;
  t: Tokens;
  isDark: boolean;
  isRowActive: boolean;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
  registerMode?: boolean;
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
        {...(registerMode ? { "data-register-surface": "Phase signal" } : {})}
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
  registerMode,
  showHalt,
  contactHalted,
  onHaltContact,
  onResumeContact,
  phaseTag,
  silenceCause,
  runtimeLabel,
  reachability,
  lastTouch,
  haltScopeLabel,
}: {
  client: ClientMeta;
  isActive: boolean;
  t: Tokens;
  isDark: boolean;
  onClientClick: (id: string) => void;
  onViewInActivity: (clientId: string, activityNodeId: string) => void;
  onViewAsClient?: (client: ClientMeta) => void;
  registerMode?: boolean;
  showHalt?: boolean;
  contactHalted?: boolean;
  onHaltContact?: (clientId: string) => void;
  onResumeContact?: (clientId: string) => void;
  phaseTag?: string;
  silenceCause?: string;
  runtimeLabel?: string;
  reachability?: string;
  lastTouch?: string;
  haltScopeLabel?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasRowMenu = client.id === "sarah" || Boolean(showHalt);
  const showRowMenu = hasRowMenu && (hovered || menuOpen || contactHalted);
  const isDocsHighlighted = useIsDocsTarget(CLIENT_ROW_HOLON.id);
  const isNameHighlighted = useIsDocsTarget(CLIENT_NAME_HOLON.id);
  const isRowActionsHighlighted = useIsDocsTarget(ROW_ACTIONS_HOLON.id);
  const rowHeight = registerMode ? CLIENT_ROW_H + 14 : CLIENT_ROW_H;

  return (
    <div
      {...holonInspectTargetProps(CLIENT_ROW_HOLON.id)}
      {...(registerMode ? { "data-register-surface": "Client row" } : {})}
      onClick={() => onClientClick(client.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: rowHeight,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: "pointer",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        borderLeft: isActive
          ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}`
          : contactHalted
            ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.red}`
            : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
        opacity: contactHalted ? 0.85 : 1,
        ...docsTargetHighlight(isDocsHighlighted, t.accent),
      }}
    >
      <ClientRowIcon
        client={client}
        t={t}
        isDark={isDark}
        isRowActive={isActive}
        onViewInActivity={onViewInActivity}
        registerMode={registerMode}
      />

      <span
        {...holonInspectTargetProps(CLIENT_NAME_HOLON.id)}
        style={{
        ...docsChildLabelStyle(CLIENT_LABEL_SIZE, t.textPrimary, t),
        flex: 1,
        borderRadius: 4,
        minWidth: 0,
        ...docsTargetHighlight(isNameHighlighted, t.accent),
      }}>
        <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {client.name}
          {contactHalted ? (
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: t.red }}>
              Halted{haltScopeLabel ? ` · ${haltScopeLabel}` : ""}
            </span>
          ) : null}
        </span>
        {registerMode ? (
          <span
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 2,
              fontSize: 9,
              fontWeight: 600,
              color: t.textDim,
              lineHeight: 1.2,
            }}
          >
            {phaseTag ? <span title="Phase signal">{phaseTag}</span> : null}
            {runtimeLabel ? <span title="Armed vs Active">{runtimeLabel}</span> : null}
            {silenceCause ? <span title="Silence cause">{silenceCause}</span> : null}
            {reachability ? <span title="Reachability">{reachability}</span> : null}
            {lastTouch ? <span title="Last touch">{lastTouch}</span> : null}
          </span>
        ) : null}
      </span>

      {hasRowMenu && (
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
            {client.id === "sarah" && (
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
            )}
            {showHalt && (
              <button
                type="button"
                className={TOWER_POPOVER_MENU_ITEM_CLASS}
                data-register-surface="Halt outreach"
                onClick={() => {
                  if (contactHalted) onResumeContact?.(client.id);
                  else onHaltContact?.(client.id);
                  setMenuOpen(false);
                }}
              >
                <Hand size={14} strokeWidth={2} className="text-muted-foreground" />
                {contactHalted ? "Resume outreach" : "Halt outreach"}
              </button>
            )}
          </PopoverContent>
        </Popover>
        </span>
      )}
    </div>
  );
}

type BoardPhaseFilter = "all" | "silent" | "in-motion" | "meeting-ready" | "halted";

type TodayMeetingStripRow = {
  id: string;
  contactName: string;
  time: string;
  clientId?: string;
};

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
  /** Register canvas: tag surfaces + prefer Register nav. */
  registerMode?: boolean;
  /** Hide Hub strip / HubBody (Register firm desk). */
  hideHub?: boolean;
  /** Show Halt outreach (book + contact scope). Production App omits. */
  showHalt?: boolean;
  bookHalted?: boolean;
  haltedContactIds?: ReadonlySet<string>;
  onHaltBook?: () => void;
  onResumeBook?: () => void;
  onHaltContact?: (clientId: string) => void;
  onResumeContact?: (clientId: string) => void;
  primaryNav?: PrimaryNavItem[];
  allNav?: PrimaryNavItem[];
  /** Register furnish — firm identity in session chrome. */
  firmName?: string;
  licenseeLabel?: string;
  lastUpdatedStamp?: string;
  todayMeetings?: TodayMeetingStripRow[];
  onTodayMeetingClick?: (meetingId: string) => void;
  onSeeAllMeetings?: () => void;
  meetingReadyClientIds?: ReadonlySet<string>;
  haltScopeByContactId?: ReadonlyMap<string, string>;
  silenceCauseByContactId?: ReadonlyMap<string, string>;
  pendingHardInputs?: string[];
  bookHandedOver?: boolean;
  onOpenAcceptedTerms?: () => void;
};

function ClientsSectionHeader({
  count,
  open,
  onToggle,
  t,
  registerMode,
  onLegend,
  legendOpen,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
  registerMode?: boolean;
  onLegend?: () => void;
  legendOpen?: boolean;
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
      {registerMode && onLegend ? (
        <button
          type="button"
          title="Phase signal legend"
          aria-label="Phase signal legend"
          aria-expanded={legendOpen}
          onClick={(e) => {
            e.stopPropagation();
            onLegend();
          }}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            border: `1px solid ${legendOpen ? t.accent : t.border}`,
            background: legendOpen ? t.accentBg : t.bgPrimary,
            color: legendOpen ? t.accent : t.textMuted,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            lineHeight: 1,
            padding: 0,
          }}
        >
          i
        </button>
      ) : null}
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
  registerMode = false,
  hideHub = false,
  showHalt = false,
  bookHalted = false,
  haltedContactIds,
  onHaltBook,
  onResumeBook,
  onHaltContact,
  onResumeContact,
  primaryNav,
  allNav,
  firmName,
  licenseeLabel,
  lastUpdatedStamp = "Last updated · just now",
  todayMeetings = [],
  onTodayMeetingClick,
  onSeeAllMeetings,
  meetingReadyClientIds,
  haltScopeByContactId,
  silenceCauseByContactId,
  pendingHardInputs = [],
  bookHandedOver = false,
  onOpenAcceptedTerms,
}: BoardPanelProps) {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [boardSearch, setBoardSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<BoardPhaseFilter>("all");
  const [legendOpen, setLegendOpen] = useState(false);
  const { tasks, openTaskCount, toggleTaskStatus } = useTasks();
  const { audits, createAndRunAudit } = useAudits();
  const { automations, createAutomation } = useAutomations();
  const hubHidden = hideHub || registerMode;
  const resolvedPrimaryNav =
    primaryNav ?? (hubHidden ? REGISTER_PRIMARY_NAV : PRIMARY_NAV);
  const resolvedAllNav = allNav ?? (hubHidden ? REGISTER_ALL_NAV : ALL_NAV);
  const showHubBody = activeIcon === "hub" && !hubHidden;
  const showContactsBody = activeIcon === "contacts";
  const showBoardBody = !showContactsBody && !showHubBody;

  function boardPhaseFor(client: ClientMeta): BoardPhaseFilter {
    if (bookHalted || haltedContactIds?.has(client.id)) return "halted";
    if (meetingReadyClientIds?.has(client.id) || client.badge?.type === "booked") return "meeting-ready";
    if (!client.optedIn || (client.status === "grey" && !client.nudge.active && !client.reactivationPhase)) {
      return "silent";
    }
    return "in-motion";
  }

  function runtimeFor(client: ClientMeta): string {
    if (client.reactivationPhase === "active") return "Active";
    if (client.reactivationPhase === "armed") return "Armed";
    return "Idle";
  }

  function reachabilityFor(client: ClientMeta): string {
    if (!client.optedIn) return "Blocked";
    if (client.status === "grey") return "Unknown";
    return "Reachable";
  }

  const filteredClients = clientList.filter((client) => {
    if (!registerMode) return true;
    const q = boardSearch.trim().toLowerCase();
    if (q && !client.name.toLowerCase().includes(q)) return false;
    if (phaseFilter !== "all" && boardPhaseFor(client) !== phaseFilter) return false;
    return true;
  });

  const clientsInView = clientsOpen && filteredClients.length > 0;

  function handleAuditImportsContinue(importIds: string[]) {
    createAndRunAudit(importIds);
  }

  function handleAddAutomation() {
    if (hubHidden) return;
    const workflow = createAutomation();
    onHubToolClick({ kind: "automation", id: workflow.id });
  }

  function handleIconClick(id: string) {
    if (hubHidden && id === "hub") return;
    onIconClick(id);
  }

  const phaseFilters: { id: BoardPhaseFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "silent", label: "Silent" },
    { id: "in-motion", label: "In motion" },
    { id: "meeting-ready", label: "Meeting-ready" },
    { id: "halted", label: "Halted" },
  ];

  return (
    <div
      data-register-surface={registerMode && showBoardBody ? "Board" : undefined}
      style={{
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
        onIconClick={handleIconClick}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={onToggleConsole}
        t={t}
        isDark={isDark}
        primaryNav={resolvedPrimaryNav}
        allNav={resolvedAllNav}
      />

      {registerMode && (firmName || licenseeLabel) ? (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "6px 10px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title="Firm identity in shell"
            >
              {firmName ?? "Firm"}
            </div>
            {licenseeLabel ? (
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }} title="Under-my-license cue">
                Under · {licenseeLabel}
              </div>
            ) : null}
          </div>
          {onOpenAcceptedTerms ? (
            <button
              type="button"
              onClick={onOpenAcceptedTerms}
              style={{
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "inherit",
                padding: "4px 7px",
                borderRadius: 4,
                border: `1px solid ${t.border}`,
                background: t.bgPrimary,
                color: t.textPrimary,
                cursor: "pointer",
              }}
            >
              Accepted terms
            </button>
          ) : null}
        </div>
      ) : null}

      {showContactsBody ? (
        <>
          <ContactsSectionHeader count={contactList.length} t={t} />
          <ContactsBody
            contacts={contactList}
            imports={importList}
            activeContactId={activeContactId}
            onContactClick={onContactClick}
            t={t}
            registerMode={registerMode}
            bookHandedOver={bookHandedOver}
          />
        </>
      ) : showHubBody ? (
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
      {showHalt && (
        <HaltOutreachBar
          t={t}
          bookHalted={bookHalted}
          haltedContactCount={haltedContactIds?.size ?? 0}
          onHaltBook={() => onHaltBook?.()}
          onResumeBook={() => onResumeBook?.()}
        />
      )}

      {registerMode ? (
        <div
          style={{
            flexShrink: 0,
            padding: "8px 10px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgPrimary,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 10, color: t.textDim }} title="Book last-updated stamp">
              {lastUpdatedStamp}
            </span>
            {bookHandedOver ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: t.accent,
                  background: t.accentBg,
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                Book handed over
              </span>
            ) : null}
          </div>
          {pendingHardInputs.length > 0 ? (
            <div style={{ fontSize: 10, color: t.amber }}>
              Pending hard inputs · {pendingHardInputs.join(" · ")}
            </div>
          ) : null}
          <label style={{ display: "block" }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Search clients
            </span>
            <input
              type="search"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder="Search client name"
              aria-label="Search client name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 12,
                fontFamily: "inherit",
                padding: "7px 9px",
                borderRadius: 4,
                border: `1px solid ${t.border}`,
                background: t.bgSecondary,
                color: t.textPrimary,
              }}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {phaseFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPhaseFilter(f.id)}
                style={{
                  padding: "3px 7px",
                  borderRadius: 3,
                  border: `1px solid ${phaseFilter === f.id ? t.accent : t.border}`,
                  background: phaseFilter === f.id ? t.accentBg : t.bgSecondary,
                  color: phaseFilter === f.id ? t.accent : t.textMuted,
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {todayMeetings.length > 0 ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.textDim }}>
                  Today&apos;s meetings
                </span>
                <button
                  type="button"
                  onClick={() => onSeeAllMeetings?.()}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: t.accent,
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  See all
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {todayMeetings.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onTodayMeetingClick?.(m.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: `1px solid ${t.borderLight}`,
                      background: t.bgSecondary,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.textPrimary }}>{m.contactName}</span>
                    <span style={{ fontSize: 10, color: t.textMuted }}>{m.time}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {legendOpen ? (
            <div
              style={{
                padding: "8px 9px",
                borderRadius: 4,
                border: `1px solid ${t.border}`,
                background: t.bgSecondary,
                fontSize: 11,
                color: t.textMuted,
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>Phase signal legend</div>
              <div>Silent — no contact-facing motion / opt-out / sequence end</div>
              <div>In motion — Armed or Active under bound packs</div>
              <div>Meeting-ready — booked receive path</div>
              <div>Halted — consultant Halt (contact or firm book)</div>
              <button
                type="button"
                onClick={() => setLegendOpen(false)}
                style={{
                  marginTop: 6,
                  border: "none",
                  background: "transparent",
                  color: t.accent,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Close
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <ClientsSectionHeader
        count={registerMode ? filteredClients.length : clientList.length}
        open={clientsOpen}
        onToggle={() => setClientsOpen((o) => !o)}
        t={t}
        registerMode={registerMode}
        legendOpen={legendOpen}
        onLegend={() => setLegendOpen((o) => !o)}
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
        {clientsOpen && filteredClients.map((client) => {
            const phase = boardPhaseFor(client);
            const phaseTag =
              phase === "silent"
                ? "Silent"
                : phase === "in-motion"
                  ? "In motion"
                  : phase === "meeting-ready"
                    ? "Meeting-ready"
                    : "Halted";
            return (
            <ClientRow
              key={client.id}
              client={client}
              isActive={activeClientId === client.id}
              t={t}
              isDark={isDark}
              onClientClick={onClientClick}
              onViewInActivity={onViewInActivity}
              onViewAsClient={(client) => onViewAsClient?.(client.id)}
              registerMode={registerMode}
              showHalt={showHalt}
              contactHalted={haltedContactIds?.has(client.id) ?? false}
              onHaltContact={onHaltContact}
              onResumeContact={onResumeContact}
              phaseTag={registerMode ? phaseTag : undefined}
              silenceCause={
                registerMode
                  ? silenceCauseByContactId?.get(client.id) ??
                    (!client.optedIn ? "Contact opt-out" : undefined)
                  : undefined
              }
              runtimeLabel={registerMode ? runtimeFor(client) : undefined}
              reachability={registerMode ? reachabilityFor(client) : undefined}
              lastTouch={registerMode ? (client.id === "sarah" ? "Yesterday" : "Mon") : undefined}
              haltScopeLabel={haltScopeByContactId?.get(client.id)}
            />
          );
          })}

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
