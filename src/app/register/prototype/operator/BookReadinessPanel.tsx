/**
 * Book readiness — Audits → Audit run → Verdict list.
 * Furnish: verdict legend, sequence-ready % glance, Re-audit remainder filter.
 */
import { useMemo, useState } from "react";
import type { Tokens } from "../../../components/tokens";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
} from "./operatorChrome";

type Verdict = "reachable" | "partial" | "unreachable";
type VerdictFilter = "all" | "sequence-ready" | "remainder";

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
  sequenceReady: boolean;
  detail: string;
};

const BATCHES: AuditBatch[] = [
  { id: "batch-cedar-042", label: "Cedar · import 042", firmId: DEMO_FIRMS[1].id, contacts: 128 },
  { id: "batch-harbor-018", label: "Harbor · book connect 018", firmId: DEMO_FIRMS[2].id, contacts: 84 },
  { id: "batch-north-007", label: "Northwind · import 007", firmId: DEMO_FIRMS[0].id, contacts: 312 },
];

const DEMO_VERDICTS: VerdictRow[] = [
  { id: "c1", name: "Amina K.", verdict: "reachable", sequenceReady: true, detail: "email valid · consent clear" },
  { id: "c2", name: "Jonas P.", verdict: "partial", sequenceReady: false, detail: "phone format · channel mismatch" },
  { id: "c3", name: "Mei L.", verdict: "reachable", sequenceReady: true, detail: "dedupe pass · name present" },
  { id: "c4", name: "Carlos R.", verdict: "unreachable", sequenceReady: false, detail: "silenced · consent blocked" },
  { id: "c5", name: "Priya S.", verdict: "partial", sequenceReady: false, detail: "email bounce risk" },
  { id: "c6", name: "Elena V.", verdict: "reachable", sequenceReady: true, detail: "sequence-ready" },
];

const CHECKS = [
  { id: "email", label: "Email validity" },
  { id: "phone", label: "Phone validity" },
  { id: "channel", label: "Channel match" },
  { id: "dedupe", label: "Dedupe" },
  { id: "consent", label: "Consent / silenced" },
  { id: "name", label: "Name present" },
] as const;

const LEGEND: { label: string; tone: "success" | "amber" | "danger" | "accent"; note: string }[] = [
  { label: "reachable", tone: "success", note: "channel valid" },
  { label: "partial", tone: "amber", note: "fix / channel gap" },
  { label: "unreachable", tone: "danger", note: "blocked / silenced" },
  { label: "sequence-ready", tone: "accent", note: "enrollment-eligible only" },
];

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
  const [filter, setFilter] = useState<VerdictFilter>("all");
  const [reauditNote, setReauditNote] = useState<string | null>(null);

  const batch = BATCHES.find((b) => b.id === selectedBatch) ?? BATCHES[0];
  const firm = DEMO_FIRMS.find((f) => f.id === batch.firmId);

  const readyCount = useMemo(
    () => (verdicts ? verdicts.filter((v) => v.sequenceReady).length : 0),
    [verdicts],
  );
  const totalCount = verdicts?.length ?? 0;
  const readyPct = totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100);

  const filtered = useMemo(() => {
    if (!verdicts) return [];
    if (filter === "sequence-ready") return verdicts.filter((v) => v.sequenceReady);
    if (filter === "remainder") return verdicts.filter((v) => !v.sequenceReady);
    return verdicts;
  }, [verdicts, filter]);

  const remainderCount = useMemo(
    () => (verdicts ? verdicts.filter((v) => !v.sequenceReady).length : 0),
    [verdicts],
  );

  function onStartAudit() {
    setRunning(true);
    setShowVerdicts(false);
    setReauditNote(null);
    window.setTimeout(() => {
      setRunning(false);
      setVerdicts(DEMO_VERDICTS);
      setShowVerdicts(true);
      setFilter("all");
    }, 800);
  }

  function onReauditRemainder() {
    if (!verdicts || remainderCount === 0) return;
    setRunning(true);
    setReauditNote(`Re-audit remainder · ${remainderCount} contacts · ${firm?.name ?? "firm"}`);
    setFilter("remainder");
    window.setTimeout(() => {
      // Demo: one partial becomes sequence-ready after re-audit
      setVerdicts((prev) =>
        prev
          ? prev.map((row) =>
              row.id === "c2"
                ? {
                    ...row,
                    verdict: "reachable",
                    sequenceReady: true,
                    detail: "re-audited · channel match fixed",
                  }
                : row,
            )
          : prev,
      );
      setRunning(false);
      setShowVerdicts(true);
    }, 700);
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
                    setFilter("all");
                    setReauditNote(null);
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
            <div
              style={{
                fontSize: 12,
                color: t.textMuted,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span>
                Firm · <strong style={{ color: t.textPrimary }}>{firm?.name ?? "—"}</strong>
              </span>
              {showVerdicts && verdicts ? (
                <span data-register-surface="Sequence-ready glance">
                  {statusChip(
                    t,
                    `Sequence-ready ${readyPct}% · ${readyCount}/${totalCount}`,
                    readyPct >= 50 ? "success" : "amber",
                  )}
                </span>
              ) : null}
            </div>
            {reauditNote ? (
              <div style={{ fontSize: 11, color: t.accent }}>{reauditNote}</div>
            ) : null}

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
                      setFilter("all");
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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={running}
                    onClick={onStartAudit}
                    style={primaryBtnStyle(t, running)}
                  >
                    {running ? "Running audit…" : "Start Audit run"}
                  </button>
                  {showVerdicts && remainderCount > 0 ? (
                    <button
                      type="button"
                      data-register-surface="Re-audit remainder"
                      disabled={running}
                      onClick={onReauditRemainder}
                      style={secondaryBtnStyle(t)}
                    >
                      Re-audit remainder ({remainderCount})
                    </button>
                  ) : null}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Verdict list",
              focus.labelFocused("Verdict list") ||
                focus.labelFocused("Verdict legend") ||
                focus.labelFocused("Sequence-ready glance") ||
                focus.labelFocused("Re-audit remainder"),
              focus.labelHovered("Verdict list") ||
                focus.labelHovered("Verdict legend") ||
                focus.labelHovered("Sequence-ready glance"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Verdict list
                  </span>
                  {showVerdicts && verdicts ? (
                    <span data-register-surface="Sequence-ready glance">
                      {statusChip(t, `${readyPct}% sequence-ready`, readyPct >= 50 ? "success" : "amber")}
                    </span>
                  ) : null}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  View reachable / partial / unreachable per contact — only sequence-ready rows may
                  enter bound engagement (enrollment is backend; no Operator enroll control).
                </p>

                <div
                  data-register-surface="Verdict legend"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                    padding: "8px 10px",
                    background: t.bgPrimary,
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                  }}
                >
                  {LEGEND.map((item) => (
                    <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {statusChip(t, item.label, item.tone)}
                      <span style={{ fontSize: 10, color: t.textDim }}>{item.note}</span>
                    </span>
                  ))}
                </div>

                {!showVerdicts || !verdicts ? (
                  <span style={{ fontSize: 12, color: t.textDim }}>
                    Run an audit batch to populate verdict chips.
                  </span>
                ) : (
                  <>
                    <div
                      data-register-surface="Verdict filter"
                      style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}
                    >
                      {(
                        [
                          { id: "all" as const, label: `All · ${totalCount}` },
                          { id: "sequence-ready" as const, label: `Sequence-ready · ${readyCount}` },
                          { id: "remainder" as const, label: `Remainder · ${remainderCount}` },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFilter(f.id)}
                          style={{
                            ...secondaryBtnStyle(t),
                            padding: "4px 8px",
                            fontSize: 11,
                            background: filter === f.id ? t.accentBg : t.bgPrimary,
                            color: filter === f.id ? t.accent : t.textPrimary,
                            borderColor: filter === f.id ? t.accent : t.border,
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div
                      data-register-surface="Verdict list"
                      style={{ display: "flex", flexDirection: "column", gap: 6 }}
                    >
                      {filtered.map((row) => (
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
                          <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {statusChip(t, row.verdict, verdictTone(row.verdict))}
                            {row.sequenceReady
                              ? statusChip(t, "sequence-ready", "accent")
                              : statusChip(t, "not ready", "muted")}
                          </span>
                        </div>
                      ))}
                      {filtered.length === 0 ? (
                        <span style={{ fontSize: 12, color: t.textDim }}>
                          No rows match this filter.
                        </span>
                      ) : null}
                    </div>
                  </>
                )}
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
