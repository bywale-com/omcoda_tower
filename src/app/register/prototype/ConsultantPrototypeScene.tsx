/**
 * Consultant desk scene — Board | Contacts | Meetings | Prepared Workspace | Login.
 * Focus drives module + nested modal/block surfaces (Step 3).
 */
import { useEffect, useState } from "react";
import { BoardPanel } from "../../components/BoardPanel";
import { ClientView } from "../../components/ClientView";
import { ContactView } from "../../components/ContactView";
import type { Tokens } from "../../components/tokens";
import { DEFAULT_SIDEBAR_WIDTH } from "../../constants/layout";
import { AuditProvider } from "../../context/AuditContext";
import { AutomationProvider } from "../../context/AutomationContext";
import { PanelProvider } from "../../context/PanelContext";
import { TaskProvider } from "../../context/TaskContext";
import type { HubToolRef } from "../../data/hub";
import type { ConsultantTask } from "../../data/tasks";
import {
  CONSULTANT_NAV_MODULES,
  SURFACE_CATALOG,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import { MeetingsModule } from "./MeetingsModule";
import { PreparedWorkspaceModule } from "./PreparedWorkspaceModule";
import { RegisterLoginScene } from "./RegisterLoginScene";
import {
  RegisterSurfaceMount,
  navBtnStyle,
  sectionLabelStyle,
} from "./registerSurfaceChrome";

export type ConsultantPrototypeSceneProps = {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
  focusSeq?: number;
};

type ConsultantModule =
  | "Board"
  | "Contacts"
  | "Meetings"
  | "Prepared Workspace"
  | "Login";

function moduleForFocus(entry: RegisterSurfaceEntry): ConsultantModule {
  const m = entry.module;
  if (m === "Contacts") return "Contacts";
  if (m === "Meetings") return "Meetings";
  if (m === "Prepared Workspace") return "Prepared Workspace";
  if (m === "Login") return "Login";
  return "Board";
}

function boardIconForModule(module: ConsultantModule): string {
  if (module === "Contacts") return "contacts";
  if (module === "Meetings") return "meetings";
  return "board";
}

function isPreparedFocus(label: string | undefined): boolean {
  return (
    label === "Prepared Workspace" ||
    label === "Authorize book" ||
    label === "Accept terms" ||
    label === "License acknowledgement" ||
    label === "Escrow terms"
  );
}

function isLoginFocus(label: string | undefined, module: string | undefined): boolean {
  if (module === "Login" || label === "Login") return true;
  // Access OTP leaf chips that are not vocab but should land on Login
  if (label === "Email field / Send code" || label === "Verify code") return true;
  return false;
}

export function ConsultantPrototypeScene({
  t,
  isDark,
  focusedEntry,
  hoveredId,
  focusSeq = 0,
}: ConsultantPrototypeSceneProps) {
  const [module, setModule] = useState<ConsultantModule>("Board");
  const [activeClientId, setActiveClientId] = useState("sarah");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [bookHalted, setBookHalted] = useState(false);
  const [haltedContactIds, setHaltedContactIds] = useState<Set<string>>(() => new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "consultant") return;
    if (isLoginFocus(focusedEntry.label, focusedEntry.module)) {
      setModule("Login");
      return;
    }
    if (isPreparedFocus(focusedEntry.label) || focusedEntry.module === "Prepared Workspace") {
      setModule("Prepared Workspace");
      return;
    }
    setModule(moduleForFocus(focusedEntry));
  }, [focusedEntry]);

  const boardIcon = boardIconForModule(module);
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  const showBoardPanel = module === "Board" || module === "Contacts";
  const showMeetings = module === "Meetings";
  const showPrepared = module === "Prepared Workspace";
  const showLogin = module === "Login";

  const mountLabel = showBoardPanel
    ? module === "Contacts"
      ? "Contacts"
      : "Board"
    : showMeetings
      ? "Meetings"
      : showPrepared
        ? "Prepared Workspace"
        : showLogin
          ? "Login"
          : focusedEntry?.label ?? module;

  const focusedOnMount =
    Boolean(focusedEntry) &&
    (focusedEntry!.label === mountLabel ||
      focusedEntry!.module === module ||
      (showBoardPanel &&
        (focusedEntry!.module === "Board" || focusedEntry!.module === "Contacts")) ||
      (showMeetings && focusedEntry!.module === "Meetings") ||
      (showPrepared &&
        (focusedEntry!.module === "Prepared Workspace" || isPreparedFocus(focusedEntry!.label))) ||
      (showLogin && isLoginFocus(focusedEntry!.label, focusedEntry!.module)));

  const hoveredOnMount =
    Boolean(hoveredEntry) &&
    (hoveredEntry!.label === mountLabel ||
      hoveredEntry!.module === module ||
      (showBoardPanel &&
        (hoveredEntry!.module === "Board" || hoveredEntry!.module === "Contacts")) ||
      (showMeetings && hoveredEntry!.module === "Meetings") ||
      (showPrepared &&
        (hoveredEntry!.module === "Prepared Workspace" || isPreparedFocus(hoveredEntry!.label))) ||
      (showLogin && isLoginFocus(hoveredEntry!.label, hoveredEntry!.module)));

  function handleIconClick(id: string) {
    if (id === "contacts") setModule("Contacts");
    else if (id === "meetings") setModule("Meetings");
    else if (id === "board") setModule("Board");
  }

  function haltContact(clientId: string) {
    setHaltedContactIds((prev) => {
      const next = new Set(prev);
      next.add(clientId);
      return next;
    });
  }

  function resumeContact(clientId: string) {
    setHaltedContactIds((prev) => {
      const next = new Set(prev);
      next.delete(clientId);
      return next;
    });
  }

  const focusLabel = focusedEntry?.label ?? null;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      <aside
        style={{
          width: 148,
          flexShrink: 0,
          borderRight: `1px solid ${t.border}`,
          background: t.bgSecondary,
          overflowY: "auto",
        }}
      >
        <div style={sectionLabelStyle(t)}>Firm desk</div>
        {CONSULTANT_NAV_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
        {(module === "Login" || module === "Prepared Workspace") && (
          <button type="button" onClick={() => setModule(module)} style={navBtnStyle(t, true)}>
            {module}
          </button>
        )}
      </aside>

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", overflow: "hidden" }}>
        {showBoardPanel ? (
          <RegisterSurfaceMount label={mountLabel} focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <TaskProvider>
              <AuditProvider>
                <AutomationProvider>
                  <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
                    <BoardPanel
                      width={DEFAULT_SIDEBAR_WIDTH}
                      activeClientId={activeClientId}
                      onClientClick={setActiveClientId}
                      activeTouchpointId={null}
                      onTaskClick={(_task: ConsultantTask) => {}}
                      activeIcon={boardIcon}
                      onIconClick={handleIconClick}
                      activeContactId={activeContactId}
                      onContactClick={setActiveContactId}
                      activeHubTool={null}
                      onHubToolClick={(_tool: HubToolRef) => {
                        /* Authorship re-homed to Operator → Configuration libraries / Book readiness */
                      }}
                      isConsoleOpen={false}
                      onToggleConsole={() => {}}
                      onViewInActivity={() => {}}
                      t={t}
                      isDark={isDark}
                      registerMode
                      hideHub
                      showHalt={module === "Board"}
                      bookHalted={bookHalted}
                      haltedContactIds={haltedContactIds}
                      onHaltBook={() => setBookHalted(true)}
                      onResumeBook={() => setBookHalted(false)}
                      onHaltContact={haltContact}
                      onResumeContact={resumeContact}
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        background: t.bgPrimary,
                      }}
                    >
                      <PanelProvider
                        isPanelOpen={isPanelOpen}
                        togglePanel={() => setIsPanelOpen((o) => !o)}
                        openPanel={() => setIsPanelOpen(true)}
                      >
                        {module === "Contacts" ? (
                          activeContactId ? (
                            <ContactView contactId={activeContactId} t={t} />
                          ) : (
                            <WorkspacePrompt t={t} text="Select a contact from the list" />
                          )
                        ) : activeClientId ? (
                          <ClientView
                            clientId={activeClientId}
                            t={t}
                            isDark={isDark}
                            onOpenClientDataFullPage={() => setIsPanelOpen(true)}
                          />
                        ) : (
                          <WorkspacePrompt t={t} text="Select a client from the board" />
                        )}
                      </PanelProvider>
                    </div>
                  </div>
                </AutomationProvider>
              </AuditProvider>
            </TaskProvider>
          </RegisterSurfaceMount>
        ) : showMeetings ? (
          <RegisterSurfaceMount label="Meetings" focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <MeetingsModule t={t} focusLabel={focusLabel} focusSeq={focusSeq} />
            </div>
          </RegisterSurfaceMount>
        ) : showPrepared ? (
          <RegisterSurfaceMount
            label="Prepared Workspace"
            focused={focusedOnMount}
            hovered={hoveredOnMount}
            t={t}
          >
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <PreparedWorkspaceModule t={t} focusLabel={focusLabel} focusSeq={focusSeq} />
            </div>
          </RegisterSurfaceMount>
        ) : showLogin ? (
          <RegisterSurfaceMount label="Login" focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <RegisterLoginScene t={t} />
            </div>
          </RegisterSurfaceMount>
        ) : null}
      </div>
    </div>
  );
}

function WorkspacePrompt({ t, text }: { t: Tokens; text: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.hoverBg,
        color: t.textMuted,
        fontSize: 12,
        padding: 16,
      }}
    >
      {text}
    </div>
  );
}
