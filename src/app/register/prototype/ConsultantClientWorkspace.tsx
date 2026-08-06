/**
 * Client workspace Register chrome — sticky Phase, Engagement record,
 * halt retention, densify inhabit chips (bound pack, silence cause, etc.).
 */
import { useEffect, useState, type CSSProperties } from "react";
import { ClientView } from "../../components/ClientView";
import { ClientDataContent } from "../../components/DataPanel";
import { PanelProvider } from "../../context/PanelContext";
import type { Tokens } from "../../components/tokens";
import { getClientMeta } from "../../data/clients";
import {
  LeafSurface,
  primaryControlStyle,
  secondaryControlStyle,
} from "./registerSurfaceChrome";

export type HaltRetention = {
  scope: "contact" | "book";
  reason: string;
  at: string;
  /** Stand-in haltStore record id — used by Lift/Resume. */
  haltId?: string;
};

export type WorkspacePhase =
  | "silent"
  | "in-motion"
  | "meeting-ready"
  | "halted";

const PHASE_LABEL: Record<WorkspacePhase, string> = {
  silent: "Silent",
  "in-motion": "In motion",
  "meeting-ready": "Meeting-ready",
  halted: "Halted",
};

const CHIP: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.02em",
  padding: "2px 6px",
  borderRadius: 3,
  whiteSpace: "nowrap",
};

function viewChip(t: Tokens, tone: "accent" | "muted" | "warn" | "danger" = "accent"): CSSProperties {
  const map = {
    accent: { background: t.accentBg, color: t.accent },
    muted: { background: t.hoverBg, color: t.textMuted },
    warn: { background: t.amberBg, color: t.amber },
    danger: { background: "rgba(220,38,38,0.1)", color: t.red },
  } as const;
  return { ...CHIP, ...map[tone] };
}

export function resolveWorkspacePhase(
  clientId: string,
  halted: boolean,
  meetingReadyIds: ReadonlySet<string>,
): WorkspacePhase {
  if (halted) return "halted";
  if (meetingReadyIds.has(clientId)) return "meeting-ready";
  const meta = getClientMeta(clientId);
  if (!meta.optedIn) return "silent";
  if (meta.reactivationPhase === "active" || meta.reactivationPhase === "armed" || meta.nudge.active) {
    return "in-motion";
  }
  if (meta.status === "grey") return "silent";
  return "in-motion";
}

export function silenceCauseLabel(clientId: string, halt: HaltRetention | null): string {
  if (halt) return halt.scope === "book" ? "My Halt · firm book" : "My Halt · this contact";
  const meta = getClientMeta(clientId);
  if (!meta.optedIn) return "Contact opt-out";
  if (meta.status === "grey" && !meta.nudge.active) return "Sequence end · monitoring";
  return "—";
}

type ConsultantClientWorkspaceProps = {
  clientId: string;
  t: Tokens;
  isDark: boolean;
  focusLabel?: string | null;
  focusSeq?: number;
  halt: HaltRetention | null;
  meetingReady: boolean;
  boundPackLabel?: string;
  licenseeLabel?: string;
  onHaltOutreach: () => void;
  onLiftHalt: () => void;
  onOpenAcceptedTerms?: () => void;
  onOpenPanel?: () => void;
};

export function ConsultantClientWorkspace({
  clientId,
  t,
  isDark,
  focusLabel = null,
  focusSeq = 0,
  halt,
  meetingReady,
  boundPackLabel = "Re-engagement · CEC refresh v3",
  licenseeLabel = "Sarah Chen · RCIC R123456",
  onHaltOutreach,
  onLiftHalt,
  onOpenAcceptedTerms,
  onOpenPanel,
  activityKick = 0,
}: ConsultantClientWorkspaceProps) {
  const [tab, setTab] = useState<"brief" | "engagement">("brief");
  const phase = resolveWorkspacePhase(
    clientId,
    Boolean(halt),
    meetingReady ? new Set([clientId]) : new Set(),
  );
  const meta = getClientMeta(clientId);
  const runtime =
    meta.reactivationPhase === "active"
      ? "Active"
      : meta.reactivationPhase === "armed"
        ? "Armed"
        : "Idle";
  const reachability =
    !meta.optedIn ? "Blocked" : meta.status === "grey" ? "Unknown" : "Reachable";
  const lastTouch = clientId === "sarah" ? "Yesterday · firm email" : "Mon · firm SMS";
  const lastReply = clientId === "sarah" ? "14 May · SMS" : "No reply yet";

  useEffect(() => {
    if (!focusLabel) return;
    if (focusLabel === "Engagement record" || focusLabel === "Activity") setTab("engagement");
    if (focusLabel === "Client workspace" || focusLabel === "Client Brief") setTab("brief");
  }, [focusLabel, focusSeq]);

  useEffect(() => {
    if (activityKick > 0) setTab("engagement");
  }, [activityKick]);

  return (
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
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <LeafSurface
          label="Phase signal"
          focused={focusLabel === "Phase signal"}
          hovered={false}
          t={t}
        >
          <span
            title="Inhabit phase from bound packs — view only"
            style={viewChip(
              t,
              phase === "halted" ? "danger" : phase === "meeting-ready" ? "accent" : phase === "silent" ? "muted" : "warn",
            )}
          >
            Phase · {PHASE_LABEL[phase]}
          </span>
        </LeafSurface>
        <span style={viewChip(t, runtime === "Active" ? "accent" : "muted")} title="Pack runtime inhabit">
          {runtime}
        </span>
        <span style={viewChip(t, "muted")} title="Bound pack (read-only)">
          Pack · {boundPackLabel}
        </span>
        <span
          style={viewChip(t, silenceCauseLabel(clientId, halt) !== "—" ? "warn" : "muted")}
          title="Why this client is silent"
        >
          Silence · {silenceCauseLabel(clientId, halt)}
        </span>
        <span style={viewChip(t, reachability === "Reachable" ? "accent" : "warn")} title="Reachability posture">
          {reachability}
        </span>
        <span style={viewChip(t, "muted")} title="Last firm→client touch">
          Last touch · {lastTouch}
        </span>
        <span style={viewChip(t, "muted")} title="Last contact reply">
          Last reply · {lastReply}
        </span>
        <span style={{ flex: 1, minWidth: 8 }} />
        <span style={{ ...viewChip(t, "muted"), maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }} title="Licensee identity">
          Under · {licenseeLabel}
        </span>
        {onOpenAcceptedTerms ? (
          <button
            type="button"
            onClick={onOpenAcceptedTerms}
            style={{
              ...secondaryControlStyle(t),
              padding: "4px 8px",
              fontSize: 11,
            }}
            title="Re-open accepted License acknowledgement + Escrow terms"
          >
            Accepted terms
          </button>
        ) : null}
        <LeafSurface
          label="Halt outreach"
          focused={focusLabel === "Halt outreach"}
          hovered={false}
          t={t}
        >
          {halt ? (
            <button type="button" onClick={onLiftHalt} style={{ ...secondaryControlStyle(t), padding: "4px 8px", fontSize: 11 }}>
              Lift halt
            </button>
          ) : (
            <button
              type="button"
              onClick={onHaltOutreach}
              style={{
                ...secondaryControlStyle(t),
                padding: "4px 8px",
                fontSize: 11,
                borderColor: t.red,
                color: t.red,
              }}
            >
              Halt outreach
            </button>
          )}
        </LeafSurface>
      </div>

      {halt ? (
        <div
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderBottom: `1px solid ${t.border}`,
            background: "rgba(220,38,38,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: t.red }}>
            Halted · scope {halt.scope === "book" ? "Firm book" : "This contact"} · {halt.at}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            Halt reason: {halt.reason.trim() ? halt.reason : "— (none recorded)"}
          </div>
        </div>
      ) : null}

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 4,
          padding: "6px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: t.bgPrimary,
        }}
      >
        <button
          type="button"
          onClick={() => setTab("brief")}
          style={{
            padding: "5px 10px",
            borderRadius: 4,
            border: `1px solid ${tab === "brief" ? t.accent : t.border}`,
            background: tab === "brief" ? t.accentBg : t.bgSecondary,
            color: tab === "brief" ? t.accent : t.textPrimary,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Client Brief
        </button>
        <LeafSurface
          label="Engagement record"
          focused={focusLabel === "Engagement record"}
          hovered={false}
          t={t}
        >
          <button
            type="button"
            onClick={() => setTab("engagement")}
            style={{
              padding: "5px 10px",
              borderRadius: 4,
              border: `1px solid ${tab === "engagement" ? t.accent : t.border}`,
              background: tab === "engagement" ? t.accentBg : t.bgSecondary,
              color: tab === "engagement" ? t.accent : t.textPrimary,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Engagement record
          </button>
        </LeafSurface>
      </div>

      {tab === "brief" ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <ClientView
            clientId={clientId}
            t={t}
            isDark={isDark}
            onOpenClientDataFullPage={onOpenPanel}
          />
        </div>
      ) : (
        <div
          data-register-surface="Engagement record"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: t.bgPrimary,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 14px",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                Engagement record
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                Activity — hand-built engagement chart · chronology only, no authorship
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={onHaltOutreach}
                style={{ ...primaryControlStyle(t), padding: "5px 10px", fontSize: 11 }}
              >
                Halt outreach
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
            <PanelProvider isPanelOpen={true} togglePanel={() => {}} openPanel={() => {}}>
              <ClientDataContent
                clientId={clientId}
                t={t}
                isDark={isDark}
                defaultTab="logs"
                fullPage
              />
            </PanelProvider>
          </div>
        </div>

      )}
    </div>
  );
}
