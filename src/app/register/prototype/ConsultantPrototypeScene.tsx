/**
 * Consultant desk scene — Board | Contacts | Meetings | Prepared Workspace | Login.
 * Plants Consultant Furnish (20) + Can't UI closes + SME densify inhabit chips.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoardPanel } from "../../components/BoardPanel";
import type { Tokens } from "../../components/tokens";
import { DEFAULT_SIDEBAR_WIDTH } from "../../constants/layout";
import { AuditProvider } from "../../context/AuditContext";
import { AutomationProvider } from "../../context/AutomationContext";
import { PanelProvider } from "../../context/PanelContext";
import { TaskProvider } from "../../context/TaskContext";
import type { HubToolRef } from "../../data/hub";
import type { ConsultantTask } from "../../data/tasks";
import { getContact } from "../../data/contacts";
import {
  CONSULTANT_NAV_MODULES,
  SURFACE_CATALOG,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import {
  ConsultantClientWorkspace,
  type HaltRetention,
} from "./ConsultantClientWorkspace";
import {
  CONSULTANT_TODAY_MEETINGS,
  MEETING_READY_CLIENT_IDS,
  MeetingsModule,
} from "./MeetingsModule";
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

const FIRM_NAME = "Cedar Pathways";
const DEFAULT_LICENSEE = "Sarah Chen · RCIC R123456";

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

function nowStamp(): string {
  return "Today · just now";
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
  const scopeLabel = scope === "contact" ? "This contact" : "Firm book";
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
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
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
          <div
            style={{
              marginBottom: 14,
              padding: "8px 10px",
              borderRadius: 4,
              border: `1px solid ${t.borderLight}`,
              background: t.bgSecondary,
              fontSize: 11,
              color: t.textMuted,
              lineHeight: 1.45,
            }}
          >
            Confirm scope: <strong style={{ color: t.textPrimary }}>{scopeLabel}</strong>
            {scope === "book"
              ? " — stops automatic firm→client sends across the book."
              : " — stops automatic sends for this contact only."}
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
  const [bookHalt, setBookHalt] = useState<HaltRetention | null>(null);
  const [haltByContact, setHaltByContact] = useState<Record<string, HaltRetention>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activityKick, setActivityKick] = useState(0);
  const [haltModalOpen, setHaltModalOpen] = useState(false);
  const [haltScope, setHaltScope] = useState<HaltScope>("contact");
  const [haltReason, setHaltReason] = useState("");
  const [meetingsSelectId, setMeetingsSelectId] = useState<string | null>(null);
  const [bookAuthorized, setBookAuthorized] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licensee, setLicensee] = useState(DEFAULT_LICENSEE);
  const [forceAcceptOpen, setForceAcceptOpen] = useState(false);

  const onHardInputChange = useCallback(
    (state: { bookAuthorized: boolean; termsAccepted: boolean; licensee: string }) => {
      setBookAuthorized(state.bookAuthorized);
      setTermsAccepted(state.termsAccepted);
      setLicensee(state.licensee);
    },
    [],
  );

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

  const haltedContactIds = useMemo(() => new Set(Object.keys(haltByContact)), [haltByContact]);

  const haltScopeByContactId = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, rec] of Object.entries(haltByContact)) {
      map.set(id, rec.scope === "book" ? "Firm book" : "This contact");
    }
    if (bookHalt) {
      for (const id of ["sarah", "marcus", "mark", "aisha", "priya", "james"]) {
        if (!map.has(id)) map.set(id, "Firm book");
      }
    }
    return map;
  }, [haltByContact, bookHalt]);

  const silenceCauseByContactId = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, rec] of Object.entries(haltByContact)) {
      map.set(id, rec.scope === "book" ? "My Halt · firm book" : "My Halt · this contact");
    }
    if (bookHalt) {
      map.set(activeClientId, "My Halt · firm book");
    }
    map.set("aisha", map.get("aisha") ?? "Contact opt-out");
    return map;
  }, [haltByContact, bookHalt, activeClientId]);

  function confirmHalt() {
    const retention: HaltRetention = {
      scope: haltScope,
      reason: haltReason,
      at: nowStamp(),
    };
    if (haltScope === "book") {
      setBookHalted(true);
      setBookHalt(retention);
    } else {
      setHaltByContact((prev) => ({ ...prev, [activeClientId]: retention }));
    }
    setHaltModalOpen(false);
    setHaltReason("");
  }

  function liftHaltForActive() {
    if (bookHalted || bookHalt) {
      setBookHalted(false);
      setBookHalt(null);
    }
    setHaltByContact((prev) => {
      const next = { ...prev };
      delete next[activeClientId];
      return next;
    });
  }

  function openAcceptedTerms() {
    setForceAcceptOpen(true);
    setModule("Prepared Workspace");
    window.setTimeout(() => setForceAcceptOpen(false), 100);
  }

  function handleContactClick(contactId: string) {
    setActiveContactId(contactId);
    const contact = getContact(contactId);
    const clientId = contact?.clientId ?? (contactListHasClient(contactId) ? contactId : null);
    if (clientId) {
      setActiveClientId(clientId);
    }
  }

  function contactListHasClient(id: string): boolean {
    return Boolean(getContact(id)?.clientId) || ["sarah", "marcus", "mark", "aisha", "priya", "james", "daniel", "fatima", "lin"].includes(id);
  }

  const pendingHardInputs = [
    !bookAuthorized ? "Authorize book" : null,
    !termsAccepted ? "Accept terms" : null,
  ].filter(Boolean) as string[];

  const focusLabel = focusedEntry?.label ?? null;
  const workspaceClientId =
    module === "Contacts" && activeContactId && contactListHasClient(activeContactId)
      ? getContact(activeContactId)?.clientId ?? activeContactId
      : activeClientId;

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
        <div
          style={{
            padding: "4px 12px 8px",
            fontSize: 11,
            fontWeight: 700,
            color: t.textPrimary,
          }}
          title="Firm identity in shell"
        >
          {FIRM_NAME}
        </div>
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
                      onClientClick={(id) => {
                        setActiveClientId(id);
                        setModule("Board");
                      }}
                      activeTouchpointId={null}
                      onTaskClick={(_task: ConsultantTask) => {}}
                      activeIcon={boardIcon}
                      onIconClick={handleIconClick}
                      activeContactId={activeContactId}
                      onContactClick={handleContactClick}
                      activeHubTool={null}
                      onHubToolClick={(_tool: HubToolRef) => {
                        /* Authorship re-homed to Operator */
                      }}
                      isConsoleOpen={false}
                      onToggleConsole={() => {}}
                      onViewInActivity={() => { setActivityKick((n) => n + 1); setIsPanelOpen(true); }}
                      t={t}
                      isDark={isDark}
                      registerMode
                      hideHub
                      showHalt={module === "Board"}
                      bookHalted={bookHalted}
                      haltedContactIds={haltedContactIds}
                      onHaltBook={() => setHaltModalOpen(true)}
                      onResumeBook={() => {
                        setBookHalted(false);
                        setBookHalt(null);
                      }}
                      onHaltContact={() => setHaltModalOpen(true)}
                      onResumeContact={(id) => {
                        setHaltByContact((prev) => {
                          const next = { ...prev };
                          delete next[id];
                          return next;
                        });
                      }}
                      firmName={FIRM_NAME}
                      licenseeLabel={licensee}
                      lastUpdatedStamp="Last updated · session open"
                      todayMeetings={CONSULTANT_TODAY_MEETINGS}
                      onTodayMeetingClick={(id) => {
                        setMeetingsSelectId(id);
                        setModule("Meetings");
                      }}
                      onSeeAllMeetings={() => {
                        setMeetingsSelectId(null);
                        setModule("Meetings");
                      }}
                      meetingReadyClientIds={MEETING_READY_CLIENT_IDS}
                      haltScopeByContactId={haltScopeByContactId}
                      silenceCauseByContactId={silenceCauseByContactId}
                      pendingHardInputs={pendingHardInputs}
                      bookHandedOver={bookAuthorized}
                      onOpenAcceptedTerms={termsAccepted ? openAcceptedTerms : undefined}
                    />
                    <PanelProvider
                      isPanelOpen={isPanelOpen}
                      togglePanel={() => setIsPanelOpen((o) => !o)}
                      openPanel={() => setIsPanelOpen(true)}
                    >
                      {module === "Contacts" && activeContactId && !contactListHasClient(activeContactId) ? (
                        <WorkspacePrompt
                          t={t}
                          text="Contact not yet on Board — select a sequenced contact to open Client workspace"
                        />
                      ) : workspaceClientId ? (
                        <ConsultantClientWorkspace
                          clientId={workspaceClientId}
                          t={t}
                          isDark={isDark}
                          focusLabel={focusLabel}
                          focusSeq={focusSeq}
                          halt={
                            bookHalt ??
                            haltByContact[workspaceClientId] ??
                            null
                          }
                          meetingReady={MEETING_READY_CLIENT_IDS.has(workspaceClientId)}
                          licenseeLabel={licensee}
                          onHaltOutreach={() => {
                            setActiveClientId(workspaceClientId);
                            setHaltModalOpen(true);
                          }}
                          onLiftHalt={liftHaltForActive}
                          onOpenAcceptedTerms={termsAccepted ? openAcceptedTerms : undefined}
                          onOpenPanel={() => setIsPanelOpen(true)}
                          activityKick={activityKick}
                        />
                      ) : (
                        <WorkspacePrompt
                          t={t}
                          text={
                            module === "Contacts"
                              ? "Select a contact from the list"
                              : "Select a client from the board"
                          }
                        />
                      )}
                    </PanelProvider>
                  </div>
                </AutomationProvider>
              </AuditProvider>
            </TaskProvider>
          </RegisterSurfaceMount>
        ) : showMeetings ? (
          <RegisterSurfaceMount label="Meetings" focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <MeetingsModule
                t={t}
                focusLabel={focusLabel}
                focusSeq={focusSeq}
                initialSelectedId={meetingsSelectId}
                onBackToBoard={() => setModule("Board")}
                firmName={FIRM_NAME}
              />
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
              <PreparedWorkspaceModule
                t={t}
                focusLabel={focusLabel}
                focusSeq={focusSeq}
                forceAcceptOpen={forceAcceptOpen}
                onHardInputChange={onHardInputChange}
              />
            </div>
          </RegisterSurfaceMount>
        ) : showLogin ? (
          <RegisterSurfaceMount label="Login" focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <RegisterLoginScene
                t={t}
                focusLabel={focusLabel}
                focusSeq={focusSeq}
                firmName={FIRM_NAME}
                onVerified={() => setModule("Board")}
              />
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
