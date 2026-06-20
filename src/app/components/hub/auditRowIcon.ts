import { AUDIT_NUDGE_YELLOW, type Audit } from "../../data/audits";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { Tokens } from "../tokens";

export type AuditRowIcon =
  | { kind: "notion"; name: NotionIconName; color: string; spin?: boolean }
  | { kind: "lucide"; color: string };

export function auditStatusIcon(audit: Audit, t: Tokens, isActive: boolean): AuditRowIcon {
  if (audit.status === "running") {
    return {
      kind: "notion",
      name: "circle-dashed",
      color: AUDIT_NUDGE_YELLOW,
      spin: true,
    };
  }
  return {
    kind: "lucide",
    color: isActive ? t.accent : t.accent,
  };
}
