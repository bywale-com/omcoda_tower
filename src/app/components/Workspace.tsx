import { X, Sun, Moon, ChevronRight, Zap } from "lucide-react";
import { ClientView } from "./ClientView";
import { ClientDataPage } from "./ClientDataPage";
import { ClientIcon } from "./ClientIcon";
import { getClientMeta } from "../data/clients";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import type { Tokens } from "./tokens";

export type Tab = {
  id: string;
  label: string;
};

export function parseTabId(tabId: string): { clientId: string; kind: "details" | "activity" } {
  if (tabId.endsWith("-activity")) {
    return { clientId: tabId.slice(0, -"-activity".length), kind: "activity" };
  }
  return { clientId: tabId.split("-")[0], kind: "details" };
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
  const { clientId, kind } = parseTabId(tabId);
  const nameMap: Record<string, string> = {
    sarah: "Sarah Jenkins", mark: "Mark Zhao", aisha: "Aisha Khan",
    priya: "Priya Nair", daniel: "Daniel Osei", fatima: "Fatima Al-Hassan",
    james: "James Okonkwo", lin: "Lin Wei", task: "Task", marcus: "Marcus Webb",
  };
  const leaf = kind === "activity" ? "Activity" : "Details";
  return ["Board", nameMap[clientId] ?? clientId, leaf];
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
  const { clientId: activeClientId, kind: activeTabKind } = parseTabId(activeTabId);
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

      {/* ── Tab bar — height aligned with sidebar activity strip ── */}
      <div style={{
        display: "flex",
        alignItems: "stretch",
        background: t.tabInactiveBg,
        borderBottom: `1px solid ${t.border}`,
        flexShrink: 0,
        height: SIDEBAR_HEADER_HEIGHT,
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflowX: "auto" }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const { clientId, kind } = parseTabId(tab.id);
            const meta = getClientMeta(clientId);
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
                  background: isActive ? t.tabActiveBg : "transparent",
                  borderBottom: isActive ? `1.5px solid ${t.accent}` : "1.5px solid transparent",
                  borderRight: `1px solid ${t.border}`,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {kind === "activity" ? (
                  <Zap size={13} color={isActive ? t.accent : t.textMuted} strokeWidth={1.5} />
                ) : (
                  <ClientIcon initials={meta.initials} status={meta.status} size={13} />
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
              </div>
            );
          })}
        </div>

        {/* Theme toggle */}
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
      </div>

      {/* ── Breadcrumb bar (22px) ── */}
      {tabs.length > 0 && (
        <div style={{
          height: 22,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          background: t.bgPrimary,
          flexShrink: 0,
          gap: 2,
          overflow: "hidden",
        }}>
          {breadcrumb.map((segment, i) => {
            const isClientSegment = i === 1; // "Sarah Jenkins" segment
            const clientMeta = isClientSegment ? getClientMeta(activeClientId) : null;
            return (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {i > 0 && <ChevronRight size={10} color={t.textDim} strokeWidth={1.5} />}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {isClientSegment && clientMeta && (
                    <ClientIcon initials={clientMeta.initials} status={clientMeta.status} size={11} />
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
        </div>
      )}

      {/* ── Editor canvas ── */}
      {tabs.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTabKind === "activity"
            ? <ClientDataPage clientId={activeClientId} t={t} isDark={isDark} />
            : <ClientView
                clientId={activeClientId}
                t={t}
                isDark={isDark}
                onOpenClientDataFullPage={() => onOpenActivityTab(activeClientId)}
              />}
        </div>
      ) : (
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", color: t.textDim, fontSize: 12,
        }}>
          Select a client from the board to open a workspace
        </div>
      )}
    </div>
  );
}
