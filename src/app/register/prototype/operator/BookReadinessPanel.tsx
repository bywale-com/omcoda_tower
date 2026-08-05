/**
 * Book readiness — Audits / Audit run / Verdict list (re-homed from Hub).
 */
import { useState } from "react";
import type { Tokens } from "../../../components/tokens";
import { AuditDetailView } from "../../../components/hub/AuditDetailView";
import { AuditProvider, useAudits } from "../../../context/AuditContext";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import { panelShell, statusChip } from "./operatorChrome";

function BookReadinessAuditList({
  t,
  isDark,
  selectedId,
  onSelect,
}: {
  t: Tokens;
  isDark: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { audits } = useAudits();

  return (
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
          {audits.map((audit) => (
            <button
              key={audit.id}
              type="button"
              onClick={() => onSelect(audit.id)}
              style={navBtnStyle(t, audit.id === selectedId)}
            >
              <div style={{ fontWeight: 600 }}>{audit.label}</div>
              <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{audit.meta}</div>
            </button>
          ))}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div data-register-surface="Verdict list" style={{ fontSize: 11, color: t.textMuted }}>
            Verdict list — open an audit run for gate outcomes
          </div>
        </div>
      </aside>
      <div
        data-register-surface="Audit run"
        style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}
      >
        <AuditDetailView auditId={selectedId} t={t} isDark={isDark} />
      </div>
    </div>
  );
}

export function BookReadinessPanel({
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
  const [selectedId, setSelectedId] = useState("audit-crs-drift");
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;
  const focused = Boolean(focusedEntry) && focusedEntry!.module === "Book readiness";
  const hovered = Boolean(hoveredEntry) && hoveredEntry!.module === "Book readiness";

  return (
    <RegisterSurfaceMount label="Book readiness" focused={focused} hovered={hovered} t={t}>
      {panelShell(
        t,
        "Book readiness",
        statusChip(t, "wrong-seat", "amber"),
        <AuditProvider>
          <BookReadinessAuditList
            t={t}
            isDark={isDark}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </AuditProvider>,
      )}
    </RegisterSurfaceMount>
  );
}
