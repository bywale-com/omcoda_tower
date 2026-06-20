import { CircleCheck, CircleX } from "lucide-react";
import type { Audit } from "../../data/audits";
import { AUDIT_NUDGE_YELLOW, isAuditOpenable } from "../../data/audits";
import { AUDIT_ROW_HOLON } from "../docs/hubBodyHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
} from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "../contacts/directoryRowStyles";
import type { HubToolRef } from "../../data/hub";
import { auditStatusIcon } from "./auditRowIcon";

function gatePadLeft() {
  return docsTreeChildPadLeft(false) + DOCS_TREE_BRANCH_LEADING;
}

function AuditGateRow({ step, t }: { step: AuditGateStep; t: Tokens }) {
  const labelColor =
    step.status === "pending" || step.status === "running" ? t.textDim : t.textPrimary;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: gatePadLeft(),
        boxSizing: "border-box",
        opacity: 0.85,
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {step.status === "pass" && (
          <CircleCheck size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={t.green} />
        )}
        {step.status === "fail" && (
          <CircleX size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={t.red} />
        )}
        {step.status === "running" && (
          <NotionIcon
            name="circle-dashed"
            size={DOCS_TREE_ICON_SIZE}
            color={AUDIT_NUDGE_YELLOW}
            spin
          />
        )}
      </span>

      <span
        style={{
          ...directoryRowPrimaryStyle(labelColor),
          flex: 1,
        }}
        title={step.label}
      >
        {step.label}
      </span>

      {step.durationMs != null && (
        <span style={directoryRowMetaStyle(t)}>{step.durationMs}ms</span>
      )}
    </div>
  );
}

export function AuditTreeBlock({
  audit,
  isActive,
  t,
  onOpen,
}: {
  audit: Audit;
  isActive: boolean;
  t: Tokens;
  onOpen: (tool: HubToolRef) => void;
}) {
  const openable = isAuditOpenable(audit);
  const running = audit.status === "running";
  const isDocsHighlighted = useIsDocsTarget(AUDIT_ROW_HOLON.id);
  const statusIcon = auditStatusIcon(audit, t, isActive && openable);

  const rowOpacity = running ? 0.5 : 1;
  const labelColor = running ? t.textDim : t.textPrimary;
  const metaColor = running ? t.textDim : undefined;

  return (
    <>
      <div
        onClick={openable ? () => onOpen({ kind: "audit", id: audit.id }) : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: DOCS_TREE_ROW_GAP,
          height: DOCS_TREE_ROW_H,
          padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
          paddingLeft: docsTreeChildPadLeft(isActive && openable),
          cursor: openable ? "pointer" : "default",
          opacity: rowOpacity,
          background: isActive && openable ? t.activeRowBg : "transparent",
          borderLeft:
            isActive && openable
              ? `2px solid ${t.accent}`
              : "2px solid transparent",
          borderRadius: 4,
          boxSizing: "border-box",
          ...docsTargetHighlight(isDocsHighlighted, t.accent),
        }}
      >
        <span
          style={{
            width: DOCS_TREE_ICON_SLOT,
            height: DOCS_TREE_ICON_SLOT,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {statusIcon.kind === "lucide" ? (
            <CircleCheck size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={statusIcon.color} />
          ) : (
            <NotionIcon
              name={statusIcon.name}
              size={DOCS_TREE_ICON_SIZE}
              color={statusIcon.color}
              spin={statusIcon.spin}
            />
          )}
        </span>

        <span style={directoryRowPrimaryStyle(labelColor)} title={audit.label}>
          {audit.label}
        </span>

        <span style={{ ...directoryRowMetaStyle(t), color: metaColor ?? t.textMuted }}>
          {audit.meta}
        </span>
      </div>

      {running &&
        audit.gateSteps.map((step) => (
          <AuditGateRow key={step.checkId} step={step} t={t} />
        ))}
    </>
  );
}
