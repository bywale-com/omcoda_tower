/**
 * Customer support — Ticket queue, Support context tabs, Resolve (How leaves 1.1–1.3).
 */
import { useEffect, useState } from "react";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type TicketStatus = "Open" | "Waiting" | "Resolved";

type Ticket = {
  id: string;
  subject: string;
  firm: string;
  severity: "High" | "Normal" | "Low";
  source: string;
  owner: string;
  status: TicketStatus;
  body: string;
  jumpTarget: string;
};

const CONTEXT_TABS = [
  {
    id: "bind",
    label: "Firm operations bind",
    jump: "Jump to Firm operations bind",
    badgeFor: (firm: string) =>
      firm === DEMO_FIRMS[1].name ? { label: "stalled", tone: "amber" as const } : null,
  },
  {
    id: "health",
    label: "Firm health",
    jump: "Jump to Firm health",
    badgeFor: (firm: string) =>
      firm === DEMO_FIRMS[1].name || firm === DEMO_FIRMS[3].name
        ? { label: "unhealthy", tone: "danger" as const }
        : null,
  },
  {
    id: "commercial",
    label: "Commercial / escrow",
    jump: "Jump to Commercial",
    badgeFor: (firm: string) =>
      firm === DEMO_FIRMS[2].name
        ? { label: "disputed", tone: "danger" as const }
        : firm === DEMO_FIRMS[1].name
          ? { label: "stalled", tone: "amber" as const }
          : null,
  },
  {
    id: "activation",
    label: "Activation state",
    jump: "Jump to Activation state",
    badgeFor: (firm: string) =>
      firm === DEMO_FIRMS[1].name || firm === DEMO_FIRMS[2].name
        ? { label: "stalled", tone: "amber" as const }
        : null,
  },
  {
    id: "audit",
    label: "Audit trail",
    jump: "Jump to Audit trail",
    badgeFor: (_firm: string) => null,
  },
] as const;

const CONTEXT_SNAPSHOTS: Record<string, Record<string, { k: string; v: string }[]>> = {
  bind: {
    [DEMO_FIRMS[1].name]: [
      { k: "Bound pack", v: "Evaluation · v2" },
      { k: "Armed / Active", v: "Armed · outreach paused" },
    ],
    [DEMO_FIRMS[2].name]: [
      { k: "Bound pack", v: "Evaluation · v2" },
      { k: "Armed / Active", v: "Active · escrow gate" },
    ],
    [DEMO_FIRMS[0].name]: [
      { k: "Bound pack", v: "Evaluation · v3" },
      { k: "Armed / Active", v: "Active · running" },
    ],
  },
  health: {
    [DEMO_FIRMS[1].name]: [
      { k: "Sequence health", v: "Watch · 9 send holds" },
      { k: "Reply rate", v: "7%" },
    ],
    [DEMO_FIRMS[2].name]: [
      { k: "Sequence health", v: "Healthy · 1 hold" },
      { k: "Reply rate", v: "15%" },
    ],
    [DEMO_FIRMS[0].name]: [
      { k: "Sequence health", v: "Healthy · 4 holds" },
      { k: "Reply rate", v: "11%" },
    ],
  },
  commercial: {
    [DEMO_FIRMS[1].name]: [
      { k: "Escrow status", v: "release_pending_window" },
      { k: "Terms version", v: "terms-v2" },
    ],
    [DEMO_FIRMS[2].name]: [
      { k: "Escrow status", v: "disputed" },
      { k: "Terms version", v: "terms-v1" },
    ],
    [DEMO_FIRMS[0].name]: [
      { k: "Escrow status", v: "held" },
      { k: "Terms version", v: "terms-v3" },
    ],
  },
  activation: {
    [DEMO_FIRMS[1].name]: [
      { k: "Progress", v: "50% · Authorize book stalled" },
      { k: "Next gate", v: "authorize-book" },
    ],
    [DEMO_FIRMS[2].name]: [
      { k: "Progress", v: "75% · Escrow held" },
      { k: "Next gate", v: "escrow-held" },
    ],
    [DEMO_FIRMS[0].name]: [
      { k: "Progress", v: "Running" },
      { k: "Next gate", v: "—" },
    ],
  },
  audit: {
    [DEMO_FIRMS[1].name]: [
      { k: "Last event", v: "Reachability audit · 2d ago" },
      { k: "Actor", v: "operator@omcoda.com" },
    ],
    [DEMO_FIRMS[2].name]: [
      { k: "Last event", v: "Escrow dispute opened · 1d ago" },
      { k: "Actor", v: "operator@omcoda.com" },
    ],
    [DEMO_FIRMS[0].name]: [
      { k: "Last event", v: "Quiet-hours override · 3d ago" },
      { k: "Actor", v: "agency@omcoda.com" },
    ],
  },
};

const TICKETS: Ticket[] = [
  {
    id: "SUP-184",
    subject: "Authorize book stuck after CSV upload",
    firm: DEMO_FIRMS[1].name,
    severity: "High",
    source: "Consultant",
    owner: "ops-north",
    status: "Open",
    body: "Consultant uploaded a book export but Authorize book remains disabled. Suspect reachability audit gate.",
    jumpTarget: "Jump to Firm operations bind",
  },
  {
    id: "SUP-179",
    subject: "Escrow release evidence question",
    firm: DEMO_FIRMS[2].name,
    severity: "Normal",
    source: "Firm email",
    owner: "ops-west",
    status: "Waiting",
    body: "Firm asks which meeting evidence bundle is required before Release control can fire.",
    jumpTarget: "Jump to Commercial",
  },
  {
    id: "SUP-171",
    subject: "Quiet-hours policy override request",
    firm: DEMO_FIRMS[0].name,
    severity: "Low",
    source: "Agency policy",
    owner: "agency-desk",
    status: "Open",
    body: "Wants outbound after 20:00 local for one reactivation wave — check Agency policy bounds.",
    jumpTarget: "Jump to Founder & agency controls",
  },
];

export function CustomerSupportModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Customer support", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(TICKETS[0].id);
  const [statuses, setStatuses] = useState<Record<string, TicketStatus>>(
    Object.fromEntries(TICKETS.map((tk) => [tk.id, tk.status])),
  );
  const [activeTab, setActiveTab] = useState<typeof CONTEXT_TABS[number]["id"]>("bind");
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Customer support") return;
    if (
      focusedEntry.label === "Ticket" ||
      focusedEntry.label === "Ticket queue" ||
      focusedEntry.label === "Support context" ||
      focusedEntry.label === "Resolve" ||
      focusedEntry.label === "Jump to scoped module"
    ) {
      setSelectedId(TICKETS[0].id);
    }
  }, [focusedEntry]);

  const selected = TICKETS.find((x) => x.id === selectedId) ?? TICKETS[0];
  const ticketStatus = statuses[selected.id] ?? selected.status;
  const tabMeta = CONTEXT_TABS.find((tab) => tab.id === activeTab)!;
  const contextRows =
    CONTEXT_SNAPSHOTS[activeTab]?.[selected.firm] ?? [
      { k: "Scope", v: selected.firm },
    ];

  const severityTone = (s: Ticket["severity"]) => {
    if (s === "High") return "danger" as const;
    if (s === "Normal") return "amber" as const;
    return "muted" as const;
  };

  return (
    <RegisterSurfaceMount
      label="Customer support"
      focused={focus.focused && focusedEntry?.label === "Customer support"}
      hovered={hoveredEntry?.label === "Customer support"}
      t={t}
    >
      {panelShell(
        t,
        "Customer support",
        statusChip(t, "queue"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Ticket queue</div>
            <div data-register-surface="Ticket queue">
              {TICKETS.map((ticket) => {
                const st = statuses[ticket.id] ?? ticket.status;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    data-register-surface="Ticket row"
                    onClick={() => {
                      setSelectedId(ticket.id);
                      setJumpNote(null);
                      setResolveNote(null);
                    }}
                    style={navBtnStyle(t, ticket.id === selectedId)}
                  >
                    <div style={{ fontWeight: 600 }}>{ticket.id}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                      {ticket.subject}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 6,
                      }}
                    >
                      {statusChip(t, ticket.firm.split(" ")[0], "muted")}
                      {statusChip(t, ticket.severity, severityTone(ticket.severity))}
                      {statusChip(t, ticket.source, "muted")}
                      {statusChip(t, ticket.owner, "accent")}
                    </div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 4 }}>{st}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            {surfaceBlock(
              t,
              "Ticket",
              focus.labelFocused("Ticket") || focusedEntry?.label === "Customer support",
              focus.labelHovered("Ticket"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    {selected.id} · {selected.subject}
                  </span>
                  {statusChip(t, ticketStatus, ticketStatus === "Resolved" ? "success" : "amber")}
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
                  {selected.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    data-register-surface="Linked per-tenancy actions"
                    style={secondaryBtnStyle(t)}
                    onClick={() => setJumpNote(`${selected.jumpTarget} · ${selected.firm}`)}
                  >
                    {selected.jumpTarget}
                  </button>
                  <button
                    type="button"
                    data-register-surface="Resolve"
                    style={primaryBtnStyle(t, ticketStatus === "Resolved")}
                    disabled={ticketStatus === "Resolved"}
                    onClick={() => {
                      setStatuses((prev) => ({ ...prev, [selected.id]: "Resolved" }));
                      setResolveNote("Resolved · Audit trail records closure");
                    }}
                  >
                    Resolve
                  </button>
                  {jumpNote ? <span style={{ fontSize: 11, color: t.accent }}>{jumpNote}</span> : null}
                  {resolveNote ? (
                    <span style={{ fontSize: 11, color: t.success }}>{resolveNote}</span>
                  ) : null}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Support context",
              focus.labelFocused("Support context"),
              focus.labelHovered("Support context"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Support context
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Scoped to {selected.firm} — view bind, health, commercial, activation, and audit
                  without leaving the ticket.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {CONTEXT_TABS.map((tab) => {
                    const badge = tab.badgeFor(selected.firm);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          padding: "5px 10px",
                          borderRadius: 4,
                          border: `1px solid ${activeTab === tab.id ? t.accent : t.border}`,
                          background: activeTab === tab.id ? t.accentBg : t.bgPrimary,
                          color: activeTab === tab.id ? t.accent : t.textMuted,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {tab.label}
                        {badge ? (
                          <span data-register-surface="Context tab badge">
                            {statusChip(t, badge.label, badge.tone)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {contextRows.map((row) => (
                    <div
                      key={row.k}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{row.k}</div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.textPrimary,
                          marginTop: 3,
                        }}
                      >
                        {row.v}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    data-register-surface="Jump to scoped module"
                    style={secondaryBtnStyle(t)}
                    onClick={() => setJumpNote(`${tabMeta.jump} · ${selected.firm}`)}
                  >
                    {tabMeta.jump}
                  </button>
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
