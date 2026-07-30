/**
 * Register Prototype Canvas — hi-fi Tower desk host (replaces lo-fi CT stub).
 * Step 1: consultant Board | Contacts | Meetings; Halt outreach; Hub authorship stripped.
 * Step 2: Operator densify + Configuration libraries / Book readiness re-homes.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BoardPanel } from "../../components/BoardPanel";
import type { Tokens } from "../../components/tokens";
import { DEFAULT_SIDEBAR_WIDTH } from "../../constants/layout";
import { AuditProvider } from "../../context/AuditContext";
import { AutomationProvider } from "../../context/AutomationContext";
import { TaskProvider } from "../../context/TaskContext";
import type { HubToolRef } from "../../data/hub";
import type { ConsultantTask } from "../../data/tasks";
import { useRegisterShell } from "../context/RegisterShellContext";
import { useRegisterTrace } from "../trace/RegisterTraceContext";
import {
  CONSULTANT_NAV_MODULES,
  SURFACE_CATALOG,
  getSurfaceByLabel,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import { HiFiEmptyModule } from "./HiFiEmptyModule";
import { MeetingsModule } from "./MeetingsModule";
import { OperatorPrototypeScene } from "./OperatorPrototypeScene";

type RegisterPrototypeCanvasProps = {
  t: Tokens;
  isDark: boolean;
};

function findSurfaceEl(label: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>("[data-register-surface]");
  for (const el of nodes) {
    if (el.getAttribute("data-register-surface") === label) return el;
  }
  return null;
}

function clearSurfaceRings() {
  document.querySelectorAll<HTMLElement>("[data-register-surface-ring]").forEach((el) => {
    el.removeAttribute("data-register-surface-ring");
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

function applySurfaceRing(el: HTMLElement, accent: string) {
  el.setAttribute("data-register-surface-ring", "1");
  el.style.outline = `2px solid ${accent}`;
  el.style.outlineOffset = "-2px";
}

function navBtnStyle(t: Tokens, active: boolean) {
  return {
    display: "block" as const,
    width: "100%",
    textAlign: "left" as const,
    padding: "7px 10px",
    border: "none",
    borderLeft: active ? `3px solid ${t.accent}` : "3px solid transparent",
    background: active ? t.accentBg : "transparent",
    color: active ? t.textPrimary : t.textMuted,
    fontSize: 12,
    fontWeight: active ? (600 as const) : (500 as const),
    fontFamily: "inherit" as const,
    cursor: "pointer" as const,
    borderRadius: "0 4px 4px 0",
  };
}

function sectionLabelStyle(t: Tokens) {
  return {
    fontSize: 10,
    fontWeight: 700 as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: t.textDim,
    padding: "10px 12px 4px",
  };
}

function SurfaceMount({
  label,
  focused,
  hovered,
  t,
  children,
}: {
  label: string;
  focused: boolean;
  hovered: boolean;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <div
      data-register-surface={label}
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        outline: focused ? `2px solid ${t.accent}` : hovered ? `1px solid ${t.accent}` : "none",
        outlineOffset: focused || hovered ? -2 : 0,
        borderRadius: 4,
        transition: "outline-color 0.15s ease",
      }}
    >
      {children}
    </div>
  );
}

function moduleForFocus(entry: RegisterSurfaceEntry): string {
  return entry.module;
}

function boardIconForModule(module: string): string {
  if (module === "Contacts") return "contacts";
  if (module === "Meetings") return "meetings";
  return "board";
}

function ConsultantDeskScene({
  t,
  isDark,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const [module, setModule] = useState<string>("Board");
  const [activeClientId, setActiveClientId] = useState("sarah");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [bookHalted, setBookHalted] = useState(false);
  const [haltedContactIds, setHaltedContactIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "consultant") return;
    setModule(moduleForFocus(focusedEntry));
  }, [focusedEntry]);

  const boardIcon = boardIconForModule(module);
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  const showBoardPanel = module === "Board" || module === "Contacts";
  const showMeetings = module === "Meetings";

  const emptyTitle =
    module === "Login"
      ? "Login"
      : module === "Prepared Workspace"
        ? focusedEntry?.label ?? "Prepared Workspace"
        : focusedEntry?.label ?? module;

  const emptyStatus =
    getSurfaceByLabel(emptyTitle)?.status ?? focusedEntry?.status ?? "new";

  const mountLabel = showBoardPanel
    ? module === "Contacts"
      ? "Contacts"
      : "Board"
    : showMeetings
      ? "Meetings"
      : focusedEntry?.label ?? emptyTitle;

  const focusedOnMount =
    Boolean(focusedEntry) &&
    (focusedEntry!.label === mountLabel ||
      focusedEntry!.module === module ||
      (showBoardPanel &&
        (focusedEntry!.module === "Board" || focusedEntry!.module === "Contacts")) ||
      (showMeetings && focusedEntry!.module === "Meetings"));

  const hoveredOnMount =
    Boolean(hoveredEntry) &&
    (hoveredEntry!.label === mountLabel ||
      hoveredEntry!.module === module ||
      (showBoardPanel &&
        (hoveredEntry!.module === "Board" || hoveredEntry!.module === "Contacts")) ||
      (showMeetings && hoveredEntry!.module === "Meetings"));

  function handleIconClick(id: string) {
    if (id === "contacts") setModule("Contacts");
    else if (id === "meetings") setModule("Meetings");
    else if (id === "board") setModule("Board");
    // hub intentionally ignored — authorship stripped from Register consultant desk
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
          <button key={id} type="button" onClick={() => setModule(id)} style={navBtnStyle(t, module === id)}>
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
          <SurfaceMount label={mountLabel} focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: t.hoverBg,
                        color: t.textMuted,
                        fontSize: 12,
                        padding: 16,
                      }}
                    >
                      Workspace — select a client or contact
                    </div>
                  </div>
                </AutomationProvider>
              </AuditProvider>
            </TaskProvider>
          </SurfaceMount>
        ) : showMeetings ? (
          <SurfaceMount label="Meetings" focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
              <MeetingsModule t={t} />
            </div>
          </SurfaceMount>
        ) : (
          <SurfaceMount label={mountLabel} focused={focusedOnMount} hovered={hoveredOnMount} t={t}>
            <HiFiEmptyModule title={emptyTitle} t={t} status={emptyStatus} />
          </SurfaceMount>
        )}
      </div>
    </div>
  );
}

function ContactDeskScene({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const title = focusedEntry?.label ?? "Client portal";
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  return (
    <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
      <SurfaceMount label={title} focused={Boolean(focusedEntry)} hovered={Boolean(hoveredEntry)} t={t}>
        <HiFiEmptyModule
          title={title}
          t={t}
          status={focusedEntry?.status ?? "new"}
          hint="Contact-facing scene — portal / CEM surfaces land in a later step"
        />
      </SurfaceMount>
    </div>
  );
}

export function RegisterPrototypeCanvas({ t, isDark }: RegisterPrototypeCanvasProps) {
  const { ctDesk } = useRegisterShell();
  const { focusedSurfaceId, focusSeq, hoveredSurfaceId } = useRegisterTrace();

  const focusedEntry = useMemo(() => {
    if (!focusedSurfaceId) return null;
    return SURFACE_CATALOG.find((e) => e.id === focusedSurfaceId) ?? null;
  }, [focusedSurfaceId]);

  useEffect(() => {
    if (!focusedEntry || focusSeq === 0) {
      clearSurfaceRings();
      return;
    }
    const label = focusedEntry.label;
    const module = focusedEntry.module;
    const id = window.setTimeout(() => {
      clearSurfaceRings();
      const el = findSurfaceEl(label) ?? findSurfaceEl(module);
      if (!el) return;
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (el.getAttribute("data-register-surface") === label) {
        applySurfaceRing(el, t.accent);
      }
    }, 60);
    return () => {
      window.clearTimeout(id);
      clearSurfaceRings();
    };
  }, [focusedEntry, focusSeq, t.accent]);

  if (ctDesk === "operator") {
    return (
      <OperatorPrototypeScene
        t={t}
        isDark={isDark}
        focusedEntry={focusedEntry}
        hoveredId={hoveredSurfaceId}
      />
    );
  }
  if (ctDesk === "contact") {
    return <ContactDeskScene t={t} focusedEntry={focusedEntry} hoveredId={hoveredSurfaceId} />;
  }
  return (
    <ConsultantDeskScene
      t={t}
      isDark={isDark}
      focusedEntry={focusedEntry}
      hoveredId={hoveredSurfaceId}
    />
  );
}
