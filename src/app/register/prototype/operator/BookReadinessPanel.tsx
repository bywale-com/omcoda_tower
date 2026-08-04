/**
 * Book readiness — Audits → Audit run (batch, checks, Start Audit run) → Verdict list chips.
 */
import { useState } from "react";
import type { Tokens } from "../../../components/tokens";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
} from "./operatorChrome";

type Verdict = "reachable" | "partial" | "unreachable";

type AuditBatch = {
  id: string;
  label: string;
  firmId: string;
  contacts: number;
};

type VerdictRow = {
  id: string;
  name: string;
  verdict: Verdict;
  detail: string;
};

const BATCHES: AuditBatch[] = [
  { id: "batch-cedar-042", label: "Cedar · import 042", firmId: DEMO_FIRMS[1].id, contacts: 128 },
  { id: "batch-harbor-018", label: "Harbor · book connect 018", firmId: DEMO_FIRMS[2].id, contacts: 84 },
  { id: "batch-north-007", label: "Northwind · import 007", firmId: DEMO_FIRMS[0].id, contacts: 312 },
];

const DEMO_VERDICTS: VerdictRow[] = [
  { id: "c1", name: "Amina K.", verdict: "reachable", detail: "email valid · consent clear" },
  { id: "c2", name: "Jonas P.", verdict: "partial", detail: "phone format · channel mismatch" },
  { id: "c3", name: "Mei L.", verdict: "reachable", detail: "dedupe pass · name present" },
  { id: "c4", name: "Carlos R.", verdict: "unreachable", detail: "silenced · consent blocked" },
  { id: "c5", name: "Priya S.", verdict: "partial", detail: "email bounce risk" },
  { id: "c6", name: "Elena V.", verdict: "reachable", detail: "sequence-ready" },
];

const CHECKS = [
  { id: "email", label: "Email validity" },
  { id: "phone", label: "Phone validity" },
  { id: "channel", label: "Channel match" },
  { id: "dedupe", label: "Dedupe" },
  { id: "consent", label: "Consent / silenced" },
  { id: "name", label: "Name present" },
] as const;

function verdictTone(v: Verdict): "success" | "amber" | "danger" {
  if (v === "reachable") return "success";
  if (v === "partial") return "amber";
  return "danger";
}

export function BookReadinessPanel({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Book readiness", focusedEntry, hoveredEntry);
  const [selectedBatch, setSelectedBatch] = useState(BATCHES[0].id);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    email: true,
    phone: true,
    channel: true,
    dedupe: true,
    consent: true,
    name: true,
  });
  const [running, setRunning] = useState(false);
  const [verdicts, setVerdicts] = useState<VerdictRow[] | null>(null);
  const [showVerdicts, setShowVerdicts] = useState(false);

  const batch = BATCHES.find((b) => b.id === selectedBatch) ?? BATCHES[0];
  const firm = DEMO_FIRMS.find((f) => f.id === batch.firmId);

  function onStartAudit() {
    setRunning(true);
    setShowVerdicts(false);
    window.setTimeout(() => {
      setRunning(false);
      setVerdicts(DEMO_VERDICTS);
      setShowVerdicts(true);
    }, 800);
  }

  return (
    <RegisterSurfaceMount
      label="Book readiness"
      focused={focus.focused && focusedEntry?.label === "Book readiness"}
      hovered={hoveredEntry?.label === "Book readiness"}
      t={t}
    >
      {panelShell(
        t,
        "Book readiness",
        statusChip(t, "per-tenancy"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Audits</div>
            <div data-register-surface="Audits">
              {BATCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBatch(b.id);
                    setShowVerdicts(false);
                    setVerdicts(null);
                  }}
                  style={navBtnStyle(t, b.id === selectedBatch)}
                >
                  <div style={{ fontWeight: 600 }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {b.contacts} contacts
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
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
              Firm · <strong style={{ color: t.textPrimary }}>{firm?.name ?? "—"}</strong>
            </div>

            {surfaceBlock(
              t,
              "Audit run",
              focus.labelFocused("Audit run") || focus.labelFocused("Audits"),
              focus.labelHovered("Audit run") || focus.labelHovered("Audits"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Audit run
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Reachability gate — data validity / sequence-ready only (not CRS / sales ROI).
                </p>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: t.textMuted,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Import / book batch
                  </span>
                  <select
                    value={selectedBatch}
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setShowVerdicts(false);
                      setVerdicts(null);
                    }}
                    style={{ ...filterSelectStyle(t), width: "100%", minWidth: 0, boxSizing: "border-box" }}
                  >
                    {BATCHES.map((b) => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  {CHECKS.map((c) => (
                    <label
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: t.textPrimary,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checks[c.id]}
                        onChange={(e) =>
                          setChecks((prev) => ({ ...prev, [c.id]: e.target.checked }))
                        }
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={running}
                  onClick={onStartAudit}
                  style={primaryBtnStyle(t, running)}
                >
                  {running ? "Running audit…" : "Start Audit run"}
                </button>
              </>,
            )}

            {surfaceBlock(
              t,
              "Verdict list",
              focus.labelFocused("Verdict list"),
              focus.labelHovered("Verdict list"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Verdict list
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  View reachable / partial / unreachable per contact — only reachable + sequence-ready
                  enter bound engagement (enrollment is backend).
                </p>
                {!showVerdicts || !verdicts ? (
                  <span style={{ fontSize: 12, color: t.textDim }}>
                    Run an audit batch to populate verdict chips.
                  </span>
                ) : (
                  <div data-register-surface="Verdict list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {verdicts.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "8px 10px",
                          background: t.bgPrimary,
                          border: `1px solid ${t.border}`,
                          borderRadius: 4,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                            {row.name}
                          </div>
                          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                            {row.detail}
                          </div>
                        </div>
                        {statusChip(t, row.verdict, verdictTone(row.verdict))}
                      </div>
                    ))}
                  </div>
                )}
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
