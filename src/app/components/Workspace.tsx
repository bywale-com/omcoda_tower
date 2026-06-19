import { X, Sun, Moon, ChevronRight, Zap } from "lucide-react";
import { ClientView } from "./ClientView";
import { ContactView } from "./ContactView";
import { ClientDataPage } from "./ClientDataPage";
import { ClientIcon } from "./ClientIcon";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { getClientMeta } from "../data/clients";
import { getContact, type ContactIndicator } from "../data/contacts";
import { NotionIcon } from "./icons/NotionIcon";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import type { Tokens } from "./tokens";

export type Tab = {
  id: string;
  label: string;
};

export type ParsedTabId =
  | { kind: "details"; clientId: string }
  | { kind: "activity"; clientId: string }
  | { kind: "contact"; contactId: string };

export function parseTabId(tabId: string): ParsedTabId {
  if (tabId.startsWith("contact-")) {
    return { kind: "contact", contactId: tabId.slice("contact-".length) };
  }
  if (tabId.endsWith("-activity")) {
    return { kind: "activity", clientId: tabId.slice(0, -"-activity".length) };
  }
  const clientId = tabId.endsWith("-details")
    ? tabId.slice(0, -"-details".length)
    : tabId.split("-")[0];
  return { kind: "details", clientId };
}

type WorkspaceProps = {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  t: Tokens;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenActivityTab: (clientId: string) => void;
};

function getBreadcrumb(tabId: string): string[] {
  const parsed = parseTabId(tabId);
  if (parsed.kind === "contact") {
    const contact = getContact(parsed.contactId);
    return ["Contacts", contact?.name ?? parsed.contactId];
  }

  const { clientId, kind } = parsed;
  const nameMap: Record<string, string> = {
    sarah: "Sarah Jenkins", mark: "Mark Zhao", aisha: "Aisha Khan",
    priya: "Priya Nair", daniel: "Daniel Osei", fatima: "Fatima Al-Hassan",
    james: "James Okonkwo", lin: "Lin Wei", task: "Task", marcus: "Marcus Webb",
  };
  const leaf = kind === "activity" ? "Activity" : "Details";
  return ["Board", nameMap[clientId] ?? clientId, leaf];
}

function contactTabIconColor(indicator: ContactIndicator, t: Tokens) {
  if (indicator === "sequenced") return t.accent;
  if (indicator === "silenced") return t.red;
  return t.textMuted;
}

export function Workspace({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  t,
  isDark,
  onToggleTheme,
  onOpenActivityTab,
}: WorkspaceProps) {
  const parsedActiveTab = parseTabId(activeTabId);
  const breadcrumb = getBreadcrumb(activeTabId);

  return (
    <div style={{
      flex: 1,
      background: t.bgPrimary,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      height: "100%",
      fontFamily: "inherit",
    }}>

      <HolonBoundary
        id="tab-bar"
        label="Tab Bar"
        icon="computer-window"
        order={SHELL_HOLON_ORDER["tab-bar"]}
        t={t}
        style={{
          display: "flex",
          alignItems: "stretch",
          background: t.tabInactiveBg,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          height: SIDEBAR_HEADER_HEIGHT,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflowX: "auto" }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const parsed = parseTabId(tab.id);
            const tabInner = (
              <>
                {parsed.kind === "activity" ? (
                  <Zap size={13} color={isActive ? t.accent : t.textMuted} strokeWidth={1.5} />
                ) : parsed.kind === "contact" ? (
                  (() => {
                    const contact = getContact(parsed.contactId);
                    return (
                      <NotionIcon
                        name="user"
                        size={13}
                        color={contact ? contactTabIconColor(contact.indicator, t) : t.textMuted}
                      />
                    );
                  })()
                ) : (
                  <ClientIcon initials={getClientMeta(parsed.clientId).initials} status={getClientMeta(parsed.clientId).status} size={13} />
                )}
                <span style={{
                  fontSize: 12,
                  color: isActive ? t.textPrimary : t.textMuted,
                  whiteSpace: "nowrap",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.01em",
                }}>
                  {tab.label}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                  style={{
                    background: "none", border: "none", padding: 0,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    color: t.textMuted, opacity: 0.55, flexShrink: 0, marginLeft: 2,
                  }}
                >
                  <X size={11} />
                </button>
              </>
            );

            if (!isActive) {
              return (
                <div
                  key={tab.id}
                  onClick={() => onTabClick(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 10px",
                    height: "100%",
                    background: "transparent",
                    borderBottom: "1.5px solid transparent",
                    borderRight: `1px solid ${t.border}`,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {tabInner}
                </div>
              );
            }

            return (
              <HolonBoundary
                key={tab.id}
                id="workspace-tab"
                label="Workspace Tab"
                icon="tag"
                order={SHELL_HOLON_ORDER["workspace-tab"]}
                highlightWhen={isActive}
                t={t}
                onClick={() => onTabClick(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 10px",
                  height: "100%",
                  background: t.tabActiveBg,
                  borderBottom: `1.5px solid ${t.accent}`,
                  borderRight: `1px solid ${t.border}`,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {tabInner}
              </HolonBoundary>
            );
          })}
        </div>

        <button
          onClick={onToggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
          style={{
            flexShrink: 0, padding: "0 12px", background: "transparent",
            border: "none", borderLeft: `1px solid ${t.border}`,
            cursor: "pointer", display: "flex", alignItems: "center",
          }}
        >
          {isDark
            ? <Sun size={13} color={t.textMuted} strokeWidth={1.5} />
            : <Moon size={13} color={t.textMuted} strokeWidth={1.5} />}
        </button>
      </HolonBoundary>

      {tabs.length > 0 && (
        <HolonBoundary
          id="breadcrumb"
          label="Breadcrumb"
          icon="directional-sign"
          order={SHELL_HOLON_ORDER["breadcrumb"]}
          t={t}
          style={{
            height: 22,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            background: t.bgPrimary,
            flexShrink: 0,
            gap: 2,
            overflow: "hidden",
          }}
        >
          {breadcrumb.map((segment, i) => {
            const isContactSegment = parsedActiveTab.kind === "contact" && i === 1;
            const isClientSegment = parsedActiveTab.kind !== "contact" && i === 1;
            const clientMeta = isClientSegment ? getClientMeta(parsedActiveTab.clientId) : null;
            const contact = isContactSegment ? getContact(parsedActiveTab.contactId) : null;
            return (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {i > 0 && <ChevronRight size={10} color={t.textDim} strokeWidth={1.5} />}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {isClientSegment && clientMeta && (
                    <ClientIcon initials={clientMeta.initials} status={clientMeta.status} size={11} />
                  )}
                  {isContactSegment && contact && (
                    <NotionIcon
                      name="user"
                      size={11}
                      color={contactTabIconColor(contact.indicator, t)}
                    />
                  )}
                  <span style={{
                    fontSize: 11,
                    color: i === breadcrumb.length - 1 ? t.textPrimary : t.textMuted,
                    fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
                    whiteSpace: "nowrap",
                    cursor: i < breadcrumb.length - 1 ? "pointer" : "default",
                  }}>
                    {segment}
                  </span>
                </span>
              </span>
            );
          })}
        </HolonBoundary>
      )}

      {tabs.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden" }}>
          {parsedActiveTab.kind === "activity" ? (
            <ClientDataPage clientId={parsedActiveTab.clientId} t={t} isDark={isDark} />
          ) : parsedActiveTab.kind === "contact" ? (
            <ContactView contactId={parsedActiveTab.contactId} t={t} />
          ) : (
            <ClientView
              clientId={parsedActiveTab.clientId}
              t={t}
              isDark={isDark}
              onOpenClientDataFullPage={() => onOpenActivityTab(parsedActiveTab.clientId)}
            />
          )}
        </div>
      ) : (
        <HolonBoundary
          id="workspace-empty"
          label="Workspace Empty"
          icon="square-dashed"
          order={SHELL_HOLON_ORDER["workspace-empty"]}
          t={t}
          style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", color: t.textDim, fontSize: 12,
          }}
        >
          Select a client from the board to open a workspace
        </HolonBoundary>
      )}
    </div>
  );
}
