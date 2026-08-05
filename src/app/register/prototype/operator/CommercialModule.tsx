/**
 * Commercial — Escrow terms, Escrow status, Release control (How leaves 1.1–1.2).
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

type EscrowStatus =
  | "held"
  | "release_pending_window"
  | "released"
  | "returned"
  | "disputed";

type TermsFields = {
  contingentCost: string;
  cap: string;
  releasePredicate: string;
  measurementWindow: string;
};

type CommercialRow = {
  firmId: string;
  status: EscrowStatus;
  held: string;
  accepted: string;
  termsVersion: string | null;
};

const STATUS_LABELS: Record<EscrowStatus, string> = {
  held: "held",
  release_pending_window: "release_pending_window",
  released: "released",
  returned: "returned",
  disputed: "disputed",
};

const COMMERCIAL_ROWS: CommercialRow[] = [
  {
    firmId: DEMO_FIRMS[0].id,
    status: "held",
    held: "$2,400 CAD",
    accepted: "Mon 11:18",
    termsVersion: "terms-v3",
  },
  {
    firmId: DEMO_FIRMS[1].id,
    status: "release_pending_window",
    held: "$1,800 CAD",
    accepted: "Tue 09:42",
    termsVersion: "terms-v2",
  },
  {
    firmId: DEMO_FIRMS[2].id,
    status: "disputed",
    held: "$3,150 CAD",
    accepted: "Fri 15:04",
    termsVersion: "terms-v1",
  },
];

const DEFAULT_TERMS: TermsFields = {
  contingentCost: "$2,400 CAD",
  cap: "$3,000 CAD",
  releasePredicate: "Meeting booked (attributed)",
  measurementWindow: "14 days post-attendance",
};

const fieldLabel: { fontSize: number; color: string; marginBottom: number } = {
  fontSize: 10,
  color: "",
  marginBottom: 4,
};

export function CommercialModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Commercial", focusedEntry, hoveredEntry);
  const [selectedId, setSelectedId] = useState(COMMERCIAL_ROWS[0].firmId);
  const [statuses, setStatuses] = useState<Record<string, EscrowStatus>>(
    Object.fromEntries(COMMERCIAL_ROWS.map((r) => [r.firmId, r.status])),
  );
  const [termsVersions, setTermsVersions] = useState<Record<string, string | null>>(
    Object.fromEntries(COMMERCIAL_ROWS.map((r) => [r.firmId, r.termsVersion])),
  );
  const [termsDraft, setTermsDraft] = useState<Record<string, TermsFields>>({});
  const [actionNote, setActionNote] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Commercial") return;
    if (
      focusedEntry.label === "Escrow status" ||
      focusedEntry.label === "Release control" ||
      focusedEntry.label === "Escrow terms"
    ) {
      setSelectedId(COMMERCIAL_ROWS[0].firmId);
    }
  }, [focusedEntry]);

  const row = COMMERCIAL_ROWS.find((r) => r.firmId === selectedId) ?? COMMERCIAL_ROWS[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const status = statuses[row.firmId] ?? row.status;
  const termsVersion = termsVersions[row.firmId] ?? row.termsVersion;
  const terms = termsDraft[row.firmId] ?? DEFAULT_TERMS;
  const note = actionNote[row.firmId];

  const patchTerms = (patch: Partial<TermsFields>) => {
    setTermsDraft((prev) => ({
      ...prev,
      [row.firmId]: { ...terms, ...patch },
    }));
  };

  const saveTermsVersion = () => {
    const next = `terms-v${Date.now().toString().slice(-4)}`;
    setTermsVersions((prev) => ({ ...prev, [row.firmId]: next }));
    setActionNote((prev) => ({
      ...prev,
      [row.firmId]: `Published ${next} · visible on Accept terms`,
    }));
  };

  const updateEscrow = (nextStatus: EscrowStatus, nextNote: string) => {
    setStatuses((prev) => ({ ...prev, [row.firmId]: nextStatus }));
    setActionNote((prev) => ({ ...prev, [row.firmId]: nextNote }));
  };

  const statusTone = (s: EscrowStatus) => {
    if (s === "released") return "success" as const;
    if (s === "disputed") return "danger" as const;
    if (s === "returned") return "muted" as const;
    return "amber" as const;
  };

  const evidence = {
    window: terms.measurementWindow,
    frozenTerms: termsVersion ?? "none",
    verification:
      status === "release_pending_window"
        ? "verified"
        : status === "held" && termsVersion
          ? "pending window"
          : "blocked",
  };
  const evidenceGreen =
    Boolean(termsVersion) &&
    (status === "release_pending_window" || status === "held") &&
    evidence.verification === "verified";
  const canRelease = evidenceGreen;
  const canReturn = status === "held" || status === "release_pending_window";
  const canDispute = status !== "disputed" && status !== "returned" && status !== "released";

  const textInput = {
    width: "100%",
    fontSize: 12,
    fontFamily: "inherit" as const,
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    background: t.bgPrimary,
    color: t.textPrimary,
    boxSizing: "border-box" as const,
  };

  return (
    <RegisterSurfaceMount
      label="Commercial"
      focused={focus.focused && focusedEntry?.label === "Commercial"}
      hovered={hoveredEntry?.label === "Commercial"}
      t={t}
    >
      {panelShell(
        t,
        "Commercial",
        statusChip(t, "per-tenancy"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Instrument list</div>
            <div data-register-surface="Instrument list / firm row">
              {COMMERCIAL_ROWS.map((commercialRow) => {
                const listFirm = DEMO_FIRMS.find((f) => f.id === commercialRow.firmId)!;
                const listStatus = statuses[commercialRow.firmId] ?? commercialRow.status;
                const listTerms =
                  termsVersions[commercialRow.firmId] ?? commercialRow.termsVersion;
                return (
                  <button
                    key={commercialRow.firmId}
                    type="button"
                    onClick={() => setSelectedId(commercialRow.firmId)}
                    style={navBtnStyle(t, commercialRow.firmId === selectedId)}
                  >
                    <div style={{ fontWeight: 600 }}>{listFirm.name}</div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                      {commercialRow.held}
                    </div>
                    <div
                      data-register-surface="Terms / escrow glance"
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 6,
                      }}
                    >
                      {statusChip(t, listTerms ?? "no terms", listTerms ? "accent" : "muted")}
                      {statusChip(t, STATUS_LABELS[listStatus], statusTone(listStatus))}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong> ·{" "}
              {firm.stage}
            </div>

            {surfaceBlock(
              t,
              "Escrow terms",
              focus.labelFocused("Escrow terms") || focusedEntry?.label === "Commercial",
              focus.labelHovered("Escrow terms"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Escrow terms
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Firm↔Om Coda contingent cost — not immigrant settlement funds. Published version
                  appears on Prepared Workspace → Accept terms; drafts stay operator-only.
                </p>
                {termsVersion ? (
                  <div style={{ marginBottom: 10, fontSize: 11, color: t.textDim }}>
                    Bound version · <strong style={{ color: t.textPrimary }}>{termsVersion}</strong>
                  </div>
                ) : null}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    maxWidth: 520,
                  }}
                >
                  <label style={{ fontSize: 12, color: t.textPrimary }}>
                    <div style={{ ...fieldLabel, color: t.textDim }}>Contingent cost</div>
                    <input
                      value={terms.contingentCost}
                      onChange={(e) => patchTerms({ contingentCost: e.target.value })}
                      style={textInput}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: t.textPrimary }}>
                    <div style={{ ...fieldLabel, color: t.textDim }}>Cap</div>
                    <input
                      value={terms.cap}
                      onChange={(e) => patchTerms({ cap: e.target.value })}
                      style={textInput}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: t.textPrimary }}>
                    <div style={{ ...fieldLabel, color: t.textDim }}>Release predicate</div>
                    <input
                      value={terms.releasePredicate}
                      onChange={(e) => patchTerms({ releasePredicate: e.target.value })}
                      style={textInput}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: t.textPrimary }}>
                    <div style={{ ...fieldLabel, color: t.textDim }}>Measurement window</div>
                    <input
                      value={terms.measurementWindow}
                      onChange={(e) => patchTerms({ measurementWindow: e.target.value })}
                      style={textInput}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                  <button
                    type="button"
                    data-register-surface="Save terms version"
                    style={primaryBtnStyle(t)}
                    onClick={saveTermsVersion}
                  >
                    Save terms version
                  </button>
                  <span style={{ fontSize: 11, color: t.textDim }}>
                    Primary · read by Accept terms
                  </span>
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Escrow status",
              focus.labelFocused("Escrow status"),
              focus.labelHovered("Escrow status"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Escrow status
                  </span>
                  {statusChip(t, STATUS_LABELS[status], statusTone(status))}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {(Object.keys(STATUS_LABELS) as EscrowStatus[]).map((s) => (
                    <span key={s}>
                      {statusChip(
                        t,
                        STATUS_LABELS[s],
                        s === status ? statusTone(s) : "muted",
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { k: "Held principal", v: row.held },
                    { k: "Accepted", v: row.accepted },
                    { k: "Predicate", v: terms.releasePredicate },
                  ].map((metric) => (
                    <div
                      key={metric.k}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{metric.k}</div>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 3 }}
                      >
                        {metric.v}
                      </div>
                    </div>
                  ))}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Release control",
              focus.labelFocused("Release control"),
              focus.labelHovered("Release control"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Release control
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Execute only when terms and evidence enable the action. Consultant acceptance is
                  the hard gate; operator oversees release, return, or dispute.
                </p>
                <div
                  data-register-surface="Evidence glance"
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  {statusChip(t, `window · ${evidence.window}`, "muted")}
                  {statusChip(
                    t,
                    `frozen · ${evidence.frozenTerms}`,
                    termsVersion ? "accent" : "danger",
                  )}
                  {statusChip(
                    t,
                    evidence.verification,
                    evidence.verification === "verified" ? "success" : "amber",
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    style={primaryBtnStyle(t, !canRelease)}
                    disabled={!canRelease}
                    onClick={() =>
                      updateEscrow("released", "Execute release · transfer queued to Om Coda")
                    }
                  >
                    Execute release
                  </button>
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    disabled={!canReturn}
                    onClick={() =>
                      updateEscrow("returned", "Execute return · principal returned to firm")
                    }
                  >
                    Execute return
                  </button>
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    disabled={!canDispute}
                    onClick={() =>
                      updateEscrow("disputed", "Open dispute · release jobs frozen")
                    }
                  >
                    Open dispute
                  </button>
                  {note ? <span style={{ fontSize: 11, color: t.accent }}>{note}</span> : null}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
