import { Mail, Phone } from "lucide-react";
import {
  AUDIT_CHECKS,
  importLabelsForAudit,
  type Audit,
  type AuditCheckId,
} from "../../data/audits";
import { DOCS_TREE_ICON_SIZE } from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import { Checkbox } from "../ui/checkbox";
import { TOWER_DIALOG_HINT_CLASS } from "../ui/towerChrome";
import type { Tokens } from "../tokens";

const AUDIT_CHECKBOX_CLASS =
  "data-[state=checked]:border-foreground/35 data-[state=checked]:bg-background data-[state=checked]:text-foreground dark:data-[state=checked]:bg-input/30 dark:data-[state=checked]:text-foreground dark:data-[state=checked]:border-foreground/45";

const AUDIT_CHECK_ICONS: Record<
  AuditCheckId,
  { kind: "notion"; name: NotionIconName } | { kind: "lucide"; icon: "mail" | "phone" }
> = {
  email_valid: { kind: "lucide", icon: "mail" },
  phone_valid: { kind: "lucide", icon: "phone" },
  dedupe: { kind: "notion", name: "git" },
  typo_garbage: { kind: "notion", name: "pencil-list" },
  name_present: { kind: "notion", name: "user" },
};

type AuditServicesPanelProps = {
  audit: Audit;
  t: Tokens;
  onChecksChange: (checks: AuditCheckId[]) => void;
};

function AuditCheckIcon({ checkId, t }: { checkId: AuditCheckId; t: Tokens }) {
  const icon = AUDIT_CHECK_ICONS[checkId];
  const color = t.textMuted;

  if (icon.kind === "lucide") {
    const LucideIcon = icon.icon === "mail" ? Mail : Phone;
    return <LucideIcon size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={color} />;
  }

  return <NotionIcon name={icon.name} size={DOCS_TREE_ICON_SIZE} color={color} />;
}

export function AuditServicesPanel({ audit, t, onChecksChange }: AuditServicesPanelProps) {
  const imports = importLabelsForAudit(audit.importIds);
  const allSelected = audit.enabledChecks.length === AUDIT_CHECKS.length;
  const isComplete = audit.status === "complete";

  function toggleCheck(id: AuditCheckId, checked: boolean) {
    const next = checked
      ? [...audit.enabledChecks, id]
      : audit.enabledChecks.filter((item) => item !== id);
    onChecksChange(next);
  }

  function toggleAll(checked: boolean) {
    onChecksChange(checked ? AUDIT_CHECKS.map((item) => item.id) : []);
  }

  return (
    <div
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
            Consolidated from
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {imports.map((item) => (
              <div
                key={item.id}
                style={{
                  fontSize: 11.7,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  color: t.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={item.label}
              >
                {item.label}
              </div>
            ))}
          </div>
          <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
            {audit.records.length} records · {audit.status === "complete" ? "Finished" : "In progress"}
          </span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Checkbox
              id="audit-check-all"
              checked={allSelected}
              onCheckedChange={(value) => toggleAll(value === true)}
              disabled={!isComplete}
              className={AUDIT_CHECKBOX_CLASS}
            />
            <NotionIcon name="checkmark-list" size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
            <label
              htmlFor="audit-check-all"
              className={TOWER_DIALOG_HINT_CLASS}
              style={{ color: t.textPrimary, cursor: isComplete ? "pointer" : "default" }}
            >
              Run checks
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AUDIT_CHECKS.map((check) => {
              const checked = audit.enabledChecks.includes(check.id);
              return (
                <div key={check.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    id={`audit-check-${check.id}`}
                    checked={checked}
                    onCheckedChange={(value) => toggleCheck(check.id, value === true)}
                    disabled={!isComplete}
                    className={AUDIT_CHECKBOX_CLASS}
                  />
                  <AuditCheckIcon checkId={check.id} t={t} />
                  <label
                    htmlFor={`audit-check-${check.id}`}
                    style={{
                      fontSize: 11.7,
                      fontWeight: 500,
                      lineHeight: 1.25,
                      letterSpacing: "-0.01em",
                      color: t.textPrimary,
                      cursor: isComplete ? "pointer" : "default",
                    }}
                  >
                    {check.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isComplete && (
        <span className={TOWER_DIALOG_HINT_CLASS} style={{ color: t.textMuted }}>
          Audit complete · {audit.meta}
        </span>
      )}
    </div>
  );
}
