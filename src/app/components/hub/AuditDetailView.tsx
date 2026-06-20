import { CircleCheck } from "lucide-react";
import { useAudits } from "../../context/AuditContext";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { auditStatusIcon } from "./auditRowIcon";
import { AuditRecordsTable } from "./AuditRecordsTable";
import { AuditServicesPanel } from "./AuditServicesPanel";

type AuditDetailViewProps = {
  auditId: string;
  t: Tokens;
  isDark: boolean;
};

export function AuditDetailView({ auditId, t, isDark }: AuditDetailViewProps) {
  const { getAuditById, updateAuditChecks } = useAudits();
  const audit = getAuditById(auditId);

  if (!audit) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Audit not found.
      </div>
    );
  }

  const icon = auditStatusIcon(audit, t, true);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: t.bgPrimary,
      }}
    >
      <HolonBoundary
        id="hub-tool-header"
        label="Hub Tool Header"
        icon="document"
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{ padding: "20px 24px 12px", flexShrink: 0, background: t.bgPrimary }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon.kind === "lucide" ? (
            <CircleCheck size={16} strokeWidth={2} color={icon.color} />
          ) : (
            <NotionIcon name={icon.name} size={16} color={icon.color} spin={icon.spin} />
          )}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: t.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {audit.label}
          </h1>
        </div>
      </HolonBoundary>

      <HolonBoundary
        id="hub-tool-body"
        label="Hub Tool Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["hub-tool-body"]}
        t={t}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "0 24px 24px",
          gap: 16,
        }}
      >
        <AuditServicesPanel
          audit={audit}
          t={t}
          onChecksChange={(checks) => updateAuditChecks(audit.id, checks)}
        />

        <AuditRecordsTable
          records={audit.records}
          t={t}
          isDark={isDark}
          showReachability={audit.status === "complete"}
        />
      </HolonBoundary>
    </div>
  );
}
