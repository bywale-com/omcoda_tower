import { MACHINE_TABLES, runModularityAudit, TABLE_RELATIONS } from "./tables";
import type { ModularityAuditRow } from "./tableTypes";

export function modularityReport() {
  const audit = runModularityAudit(MACHINE_TABLES);
  const bugs = audit.filter((r) => r.bug);
  const byKind = {
    state: audit.filter((r) => r.kind === "state").length,
    rule: audit.filter((r) => r.kind === "rule").length,
    sequence: audit.filter((r) => r.kind === "sequence").length,
  };
  const nonModular = audit.filter((r) => !r.modular);
  return {
    tableCount: MACHINE_TABLES.length,
    relationCount: TABLE_RELATIONS.length,
    byKind,
    modularCount: audit.filter((r) => r.modular).length,
    nonModular,
    bugs,
    audit,
  };
}

export function auditMarkdown(audit: ModularityAuditRow[] = runModularityAudit()): string {
  const lines = [
    "| table | node | kind | modular? | structural reason | bug |",
    "|---|---|---|---|---|---|",
  ];
  for (const r of audit) {
    const reason = r.modular
      ? "—"
      : `${r.structuralReason ?? "?"}${r.structuralReasonDetail ? `: ${r.structuralReasonDetail}` : ""}`;
    lines.push(
      `| \`${r.tableId}\` | \`${r.nodeId}\` | ${r.kind} | ${r.modular ? "y" : "n"} | ${reason.replace(/\|/g, "/")} | ${r.bug ?? ""} |`,
    );
  }
  return lines.join("\n");
}
