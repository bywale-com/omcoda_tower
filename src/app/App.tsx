import { useState, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { BoardPanel } from "./components/BoardPanel";
import { DocsPanel } from "./components/DocsPanel";
import { HolonDetailPanel } from "./components/HolonDetailPanel";
import { ClientPortalPage } from "./components/client-portal/ClientPortalPage";
import { Workspace } from "./components/Workspace";
import { StatusBar } from "./components/StatusBar";
import { AuditProvider, useAudits } from "./context/AuditContext";
import { PanelProvider } from "./context/PanelContext";
import { DocsHighlightProvider, useDocsHighlight } from "./context/DocsHighlightContext";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import { HolonDetailProvider, useHolonDetail } from "./context/HolonDetailContext";
import { TouchpointFocusProvider, useTouchpointFocus } from "./context/TouchpointFocusContext";
import { TaskProvider } from "./context/TaskContext";
import { light, dark } from "./components/tokens";
import { syncShadcnTheme } from "./components/ui/syncShadcnTheme";
import type { Tab } from "./components/Workspace";
import { parseTabId } from "./components/Workspace";
import { contactTabId, getContact } from "./data/contacts";
import { isAuditOpenable } from "./data/audits";
import {
  getHubToolLabel,
  hubAgentList,
  hubAutomationList,
  hubToolTabId,
  type HubToolRef,
} from "./data/hub";
import type { ConsultantTask } from "./data/tasks";
import {
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_CONSOLE_PANEL_WIDTH,
  DEFAULT_HOLON_DETAIL_PANEL_WIDTH,
  MIN_CONSOLE_PANEL_WIDTH,
  MAX_CONSOLE_PANEL_WIDTH,
  MIN_HOLON_DETAIL_PANEL_WIDTH,
  MAX_HOLON_DETAIL_PANEL_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
} from "./constants/layout";

const clientTabLabel: Record<string, string> = {
  sarah:  "Sarah Jenkins · Details",
  marcus: "Marcus Webb · Details",
  mark:   "Mark Zhao · Details",
  aisha:  "Aisha Khan · Details",
  priya:  "Priya Nair · Details",
  daniel: "Daniel Osei · Details",
  fatima: "Fatima Al-Hassan · Details",
  james:  "James Okonkwo · Details",
  lin:    "Lin Wei · Details",
  task:   "Task · Details",
};

const clientActivityTabLabel: Record<string, string> = {
  sarah:  "Sarah Jenkins · Activity",
  marcus: "Marcus Webb · Activity",
  mark:   "Mark Zhao · Activity",
  aisha:  "Aisha Khan · Activity",
  priya:  "Priya Nair · Activity",
  daniel: "Daniel Osei · Activity",
  fatima: "Fatima Al-Hassan · Activity",
  james:  "James Okonkwo · Activity",
  lin:    "Lin Wei · Activity",
  task:   "Task · Activity",
};

export default function App() {
  return (
    <TouchpointFocusProvider>
      <TaskProvider>
        <DocsHighlightProvider>
          <DocsRegistryProvider>
            <HolonDetailProvider>
              <AuditProvider>
                <AppShell />
              </AuditProvider>
            </HolonDetailProvider>
          </DocsRegistryProvider>
        </DocsHighlightProvider>
      </TaskProvider>
    </TouchpointFocusProvider>
  );
}

function AppShell() {
  /* MARKER-MAKE-KIT-INVOKED */
  const { setHoveredComponentId } = useDocsHighlight();
  const { detailHolonId, closeHolonDetail } = useHolonDetail();
  const { focusTouchpointId, setFocusTouchpointId } = useTouchpointFocus();
  const [isDark, setIsDark] = useState(false);
  const t = isDark ? dark : light;

  const [activeIcon, setActiveIcon] = useState("board");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [activeClientId, setActiveClientId] = useState("sarah");
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "sarah-details", label: "Sarah Jenkins · Details" },
  ]);
  const [activeTabId, setActiveTabId] = useState("sarah-details");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consolePanelWidth, setConsolePanelWidth] = useState(DEFAULT_CONSOLE_PANEL_WIDTH);
  const [isResizingConsolePanel, setIsResizingConsolePanel] = useState(false);
  const [detailPanelWidth, setDetailPanelWidth] = useState(DEFAULT_HOLON_DETAIL_PANEL_WIDTH);
  const [isResizingDetailPanel, setIsResizingDetailPanel] = useState(false);
  const [portalClientId, setPortalClientId] = useState<string | null>(null);

  const activeTab = parseTabId(activeTabId);
  const activeContactId = activeTab.kind === "contact" ? activeTab.contactId : null;
  const activeHubTool = activeTab.kind === "hub" ? activeTab.tool : null;
  const { audits } = useAudits();

  useEffect(() => {
    if (!isConsoleOpen) {
      setHoveredComponentId(null);
      closeHolonDetail();
    }
  }, [isConsoleOpen, setHoveredComponentId, closeHolonDetail]);

  useEffect(() => {
    syncShadcnTheme(t, isDark);
  }, [t, isDark]);

  function handleIconClick(iconId: string) {
    setActiveIcon(iconId);
  }

  function openActivityTab(clientId: string, activityNodeId?: string) {
    const tabId = `${clientId}-activity`;
    if (!tabs.find((tab) => tab.id === tabId)) {
      setTabs((prev) => [
        ...prev,
        { id: tabId, label: clientActivityTabLabel[clientId] ?? `${clientId} · Activity` },
      ]);
    }
    setActiveTabId(tabId);
    setActiveClientId(clientId);
    if (activityNodeId) {
      setFocusTouchpointId(activityNodeId);
    }
  }

  function handleViewInActivity(clientId: string, activityNodeId: string) {
    openActivityTab(clientId, activityNodeId);
  }

  function handleContactClick(contactId: string) {
    const contact = getContact(contactId);
    if (!contact) return;
    const tabId = contactTabId(contactId);
    if (!tabs.find((tab) => tab.id === tabId)) {
      setTabs((prev) => [...prev, { id: tabId, label: contact.name }]);
    }
    setActiveTabId(tabId);
  }

  function handleHubToolClick(tool: HubToolRef) {
    if (tool.kind === "audit") {
      const audit = audits.find((item) => item.id === tool.id);
      if (!audit || !isAuditOpenable(audit)) return;
    }
    const tabId = hubToolTabId(tool);
    const label = getHubToolLabel(tool, audits);
    if (!tabs.find((tab) => tab.id === tabId)) {
      setTabs((prev) => [...prev, { id: tabId, label }]);
    }
    setActiveTabId(tabId);
  }

  function handleClientClick(clientId: string) {
    setActiveClientId(clientId);
    const tabId = `${clientId}-details`;
    if (!tabs.find((t) => t.id === tabId)) {
      setTabs((prev) => [
        ...prev,
        { id: tabId, label: clientTabLabel[clientId] ?? `${clientId} · Details` },
      ]);
    }
    setActiveTabId(tabId);
  }

  function onConsolePanelResizeMouseDown(e: ReactMouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = consolePanelWidth;

    const handleMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setConsolePanelWidth(Math.min(MAX_CONSOLE_PANEL_WIDTH, Math.max(MIN_CONSOLE_PANEL_WIDTH, startW + delta)));
    };

    const handleUp = () => {
      setIsResizingConsolePanel(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    setIsResizingConsolePanel(true);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function onDetailPanelResizeMouseDown(e: ReactMouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = detailPanelWidth;

    const handleMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      setDetailPanelWidth(
        Math.min(MAX_HOLON_DETAIL_PANEL_WIDTH, Math.max(MIN_HOLON_DETAIL_PANEL_WIDTH, startW + delta)),
      );
    };

    const handleUp = () => {
      setIsResizingDetailPanel(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    setIsResizingDetailPanel(true);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function onSidebarResizeMouseDown(e: ReactMouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;

    const handleMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startW + delta)));
    };

    const handleUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    setIsResizingSidebar(true);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function handleTaskClick(task: ConsultantTask) {
    setActiveClientId(task.clientId);
    openActivityTab(task.clientId);
    setFocusTouchpointId(task.touchpointId);
  }

  function handleTabClose(tabId: string) {
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId && remaining.length > 0) {
      const last = remaining[remaining.length - 1];
      setActiveTabId(last.id);
      const parsed = parseTabId(last.id);
      if (parsed.kind === "details" || parsed.kind === "activity") {
        setActiveClientId(parsed.clientId);
      }
    }
  }

  return (
    <PanelProvider
      isPanelOpen={isPanelOpen}
      togglePanel={() => setIsPanelOpen((o) => !o)}
      openPanel={() => setIsPanelOpen(true)}
    >
    {portalClientId && (
      <ClientPortalPage
        clientId={portalClientId}
        onClose={() => setPortalClientId(null)}
        t={t}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />
    )}
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: t.textPrimary,
        background: t.bgPrimary,
        overflow: "hidden",
      }}
    >
      {/* ── Main content row (fills remaining height above status bar) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        minHeight: 0,
        userSelect: isResizingSidebar || isResizingConsolePanel || isResizingDetailPanel ? "none" : "auto",
      }}>
        {isConsoleOpen && (
          <DocsPanel width={consolePanelWidth} t={t} />
        )}

        {isConsoleOpen && (
          <div style={{ width: 0, flexShrink: 0, position: "relative", zIndex: 1 }}>
            <div
              onMouseDown={onConsolePanelResizeMouseDown}
              style={{
                position: "absolute",
                left: -2,
                top: 0,
                bottom: 0,
                width: 4,
                cursor: "ew-resize",
                background: isResizingConsolePanel ? t.accent : "transparent",
                transition: isResizingConsolePanel ? "none" : "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isResizingConsolePanel) (e.currentTarget as HTMLElement).style.background = `${t.accent}55`;
              }}
              onMouseLeave={(e) => {
                if (!isResizingConsolePanel) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            />
          </div>
        )}

        <BoardPanel
          width={sidebarWidth}
          activeClientId={activeClientId}
          onClientClick={handleClientClick}
          activeTouchpointId={focusTouchpointId}
          onTaskClick={handleTaskClick}
          activeIcon={activeIcon}
          onIconClick={handleIconClick}
          activeContactId={activeContactId}
          onContactClick={handleContactClick}
          activeHubTool={activeHubTool}
          onHubToolClick={handleHubToolClick}
          isConsoleOpen={isConsoleOpen}
          onToggleConsole={() => setIsConsoleOpen((open) => !open)}
          onViewInActivity={handleViewInActivity}
          onViewAsClient={setPortalClientId}
          t={t}
          isDark={isDark}
        />

        <div style={{ width: 0, flexShrink: 0, position: "relative", zIndex: 1 }}>
          <div
            onMouseDown={onSidebarResizeMouseDown}
            style={{
              position: "absolute",
              left: -2,
              top: 0,
              bottom: 0,
              width: 4,
              cursor: "ew-resize",
              background: isResizingSidebar ? t.accent : "transparent",
              transition: isResizingSidebar ? "none" : "background 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isResizingSidebar) (e.currentTarget as HTMLElement).style.background = `${t.accent}55`;
            }}
            onMouseLeave={(e) => {
              if (!isResizingSidebar) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          />
        </div>

        <Workspace
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={(id) => {
            setActiveTabId(id);
            const parsed = parseTabId(id);
            if (parsed.kind !== "contact") {
              setActiveClientId(parsed.clientId);
            }
          }}
          onTabClose={handleTabClose}
          t={t}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          onOpenActivityTab={openActivityTab}
        />

        {isConsoleOpen && detailHolonId && (
          <div style={{ width: 0, flexShrink: 0, position: "relative", zIndex: 1 }}>
            <div
              onMouseDown={onDetailPanelResizeMouseDown}
              style={{
                position: "absolute",
                left: -2,
                top: 0,
                bottom: 0,
                width: 4,
                cursor: "ew-resize",
                background: isResizingDetailPanel ? t.accent : "transparent",
                transition: isResizingDetailPanel ? "none" : "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isResizingDetailPanel) (e.currentTarget as HTMLElement).style.background = `${t.accent}55`;
              }}
              onMouseLeave={(e) => {
                if (!isResizingDetailPanel) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            />
          </div>
        )}

        {isConsoleOpen && detailHolonId && (
          <HolonDetailPanel width={detailPanelWidth} t={t} />
        )}
      </div>

      <StatusBar t={t} isDark={isDark} />

      <style>{`
        @keyframes towerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.8); }
        }
        @keyframes towerSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes towerBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(255, 255, 255, 0.18)" : "#d0d0d0"};
          border-radius: 2px;
        }
        button { font-family: inherit; }
      `}</style>
    </div>
    </PanelProvider>
  );
}
