/**
 * Consultant desk scene — Board | Contacts | Meetings | Prepared Workspace | Login.
 * Focus drives module + nested modal/block surfaces.
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
  LeafSurface,
  RegisterSurfaceMount,
  navBtnStyle,
  primaryControlStyle,
  secondaryControlStyle,
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

type HaltScope = "contact" | "book";

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
    label === "Authorize" ||
    label === "Accept terms" ||
    label === "Accept" ||
    label === "License acknowledgement" ||
    label === "Escrow terms"
  );
}

function isLoginFocus(label: string | undefined, module: string | undefined): boolean {
  if (module === "Login" || label === "Login") return true;
  if (
    label === "Email field" ||
    label === "Send code" ||
    label === "Code field" ||
    label === "Verify" ||
    label === "Email field / Send code" ||
    label === "Verify code" ||
    label === "Access OTP"
  ) {
    return true;
  }
  return false;
}

function isBoardInhabitFocus(label: string | undefined): boolean {
  return (
    label === "Board" ||
    label === "Client row" ||
    label === "Phase signal" ||
    label === "Client workspace" ||
    label === "Engagement record" ||
    label === "Halt outreach" ||
    label === "Confirm halt" ||
    label === "Primary navigation"
  );
}

function HaltOutreachModal({
  t,
  focusLabel,
  scope,
  onScope,
  reason,
  onReason,
  onConfirm,
  onClose,
}: {
  t: Tokens;
  focusLabel: string | null;
  scope: HaltScope;
  onScope: (s: HaltScope) => void;
  reason: string;
  onReason: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Halt outreach"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 18, 28, 0.45)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        data-register-surface="Halt outreach"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: t.bgPrimary,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <header
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
            fontSize: 14,
            fontWeight: 600,
            color: t.textPrimary,
          }}
        >
          Halt outreach
        </header>
        <div style={{ padding: 16 }}>
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
            Refusal under your license — runners and Send gates honor halt. Not pack authorship.
          </p>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {[
              { id: "contact" as HaltScope, label: "This contact" },
              { id: "book" as HaltScope, label: "Firm book" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onScope(opt.id)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: `1px solid ${scope === opt.id ? t.accent : t.border}`,
                  background: scope === opt.id ? t.accentBg : t.bgSecondary,
                  color: scope === opt.id ? t.accent : t.textPrimary,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <label
            htmlFor="halt-reason"
            style={{
              display: "block",
              fontSize: 10,
              fontWeight: 600,
              color: t.textDim,
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Reason (optional)
          </label>
          <input
            id="halt-reason"
            type="text"
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            placeholder="Illegal / unethical motion · wrong person…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 12,
              fontFamily: "inherit",
              padding: "8px 10px",
              borderRadius: 4,
              border: `1px solid ${t.border}`,
              background: t.bgPrimary,
              color: t.textPrimary,
              marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={secondaryControlStyle(t)}>
              Cancel
            </button>
            <LeafSurface
              label="Confirm halt"
              focused={focusLabel === "Confirm halt"}
              hovered={false}
              t={t}
            >
              <button type="button" onClick={onConfirm} style={primaryControlStyle(t)}>
                Confirm halt
              </button>
            </LeafSurface>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [activityKick, setActivityKick] = useState(0);
  const [haltModalOpen, setHaltModalOpen] = useState(false);
  const [haltScope, setHaltScope] = useState<HaltScope>("contact");
  const [haltReason, setHaltReason] = useState("");

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
    if (isBoardInhabitFocus(focusedEntry.label)) {
      setModule(
        focusedEntry.module === "Contacts" || focusedEntry.label === "Imports"
          ? "Contacts"
          : "Board",
      );
      if (
        focusedEntry.label === "Client row" ||
        focusedEntry.label === "Phase signal" ||
        focusedEntry.label === "Client workspace" ||
        focusedEntry.label === "Engagement record"
      ) {
        setActiveClientId("sarah");
      }
      if (
        focusedEntry.label === "Halt outreach" ||
        focusedEntry.label === "Confirm halt"
      ) {
        setHaltModalOpen(true);
      }
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
        (focusedEntry!.module === "Board" ||
          focusedEntry!.module === "Contacts" ||
          isBoardInhabitFocus(focusedEntry!.label))) ||
      (showMeetings && focusedEntry!.module === "Meetings") ||
      (showPrepared &&
        (focusedEntry!.module === "Prepared Workspace" || isPreparedFocus(focusedEntry!.label))) ||
      (showLogin && isLoginFocus(focusedEntry!.label, focusedEntry!.module)));

  const hoveredOnMount =
    Boolean(hoveredEntry) &&
    (hoveredEntry!.label === mountLabel ||
      hoveredEntry!.module === module ||
      (showBoardPanel &&
        (hoveredEntry!.module === "Board" ||
          hoveredEntry!.module === "Contacts" ||
          isBoardInhabitFocus(hoveredEntry!.label))) ||
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

  function confirmHalt() {
    if (haltScope === "book") {
      setBookHalted(true);
    } else {
      haltContact(activeClientId);
    }
    setHaltModalOpen(false);
    setHaltReason("");
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
                        /* Authorship re-homed to Operator */
                      }}
                      isConsoleOpen={false}
                      onToggleConsole={() => {}}
                      onViewInActivity={() => {
                        setIsPanelOpen(true);
                        setActivityKick((n) => n + 1);
                      }}
                      t={t}
                      isDark={isDark}
                      registerMode
                      hideHub
                      showHalt={module === "Board"}
                      bookHalted={bookHalted}
                      haltedContactIds={haltedContactIds}
                      onHaltBook={() => setHaltModalOpen(true)}
                      onResumeBook={() => setBookHalted(false)}
                      onHaltContact={() => setHaltModalOpen(true)}
                      onResumeContact={resumeContact}
                    />
                    <div
                      data-register-surface="Client workspace"
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
                            dataDefaultTab={
                              activityKick > 0 ||
                              focusLabel === "Engagement record" ||
                              focusLabel === "Activity"
                                ? "logs"
                                : "read"
                            }
                            dataFocusKey={
                              activityKick > 0
                                ? `activity-${activityKick}`
                                : focusLabel === "Engagement record" || focusLabel === "Activity"
                                  ? focusSeq
                                  : undefined
                            }
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
              <RegisterLoginScene t={t} focusLabel={focusLabel} focusSeq={focusSeq} />
            </div>
          </RegisterSurfaceMount>
        ) : null}
      </div>

      {haltModalOpen ? (
        <HaltOutreachModal
          t={t}
          focusLabel={focusLabel}
          scope={haltScope}
          onScope={setHaltScope}
          reason={haltReason}
          onReason={setHaltReason}
          onConfirm={confirmHalt}
          onClose={() => setHaltModalOpen(false)}
        />
      ) : null}
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
