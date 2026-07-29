import {
  automationRunEntityKindLabel,
  automationRunStatusLabel,
  formatRunDuration,
  formatRunTimestamp,
  type AutomationRun,
  type AutomationRunStatus,
} from "../../../data/automationRuns";
import { useAutomations } from "../../../context/AutomationContext";
import {
  directoryRowMetaStyle,
  directoryRowPrimaryStyle,
} from "../../contacts/directoryRowStyles";
import { AUTOMATION_RUN_ROW_HOLON, AUTOMATION_RUNS_TAB_HOLON } from "../../docs/automationHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { useIsDocsTarget } from "../../docs/docsHighlight";
import { docsTargetHighlight } from "../../docs/docsHighlight";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_LABEL_SIZE, DOCS_TREE_ROW_H } from "../../docs/treeLayout";
import { NotionIcon } from "../../icons/NotionIcon";
import type { NotionIconName } from "../../../icons/notion-icon-urls";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";

const ENTITY_ICONS: Record<AutomationRun["entityKind"], NotionIconName> = {
  client: "people",
  contact: "user",
  import: "document",
  audit: "magnifying-glass",
};

function runStatusColor(status: AutomationRunStatus, t: Tokens): string {
  switch (status) {
    case "success":
      return t.accent;
    case "running":
      return t.accent;
    case "failed":
      return t.red;
    case "waiting":
      return t.textMuted;
  }
}

function RunRow({ run, t }: { run: AutomationRun; t: Tokens }) {
  const isTarget = useIsDocsTarget(AUTOMATION_RUN_ROW_HOLON.id);

  return (
    <div
      style={{
        ...docsTargetHighlight(isTarget, t.accent),
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        borderBottom: `1px solid ${t.border}`,
        boxSizing: "border-box",
      }}
    >
      <NotionIcon
        name={ENTITY_ICONS[run.entityKind]}
        size={DOCS_TREE_ICON_SIZE}
        color={t.textMuted}
      />
      <span style={directoryRowPrimaryStyle(t.textPrimary)} title={run.entityLabel}>
        {run.entityLabel}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: t.textMuted,
          flexShrink: 0,
        }}
      >
        {automationRunEntityKindLabel(run.entityKind)}
      </span>
      <span style={{ flex: 1, minWidth: 8 }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: runStatusColor(run.status, t),
          flexShrink: 0,
        }}
      >
        {automationRunStatusLabel(run.status)}
      </span>
      <span style={directoryRowMetaStyle(t)}>{formatRunDuration(run.durationMs)}</span>
      <span
        style={{
          ...directoryRowMetaStyle(t),
          width: 112,
        }}
      >
        {formatRunTimestamp(run.startedAt)}
      </span>
    </div>
  );
}

type AutomationRunsTabProps = {
  workflowId: string;
  t: Tokens;
};

export function AutomationRunsTab({ workflowId, t }: AutomationRunsTabProps) {
  const { getRunsForWorkflow } = useAutomations();
  const runs = getRunsForWorkflow(workflowId);

  return (
    <HolonBoundary
      id={AUTOMATION_RUNS_TAB_HOLON.id}
      label={AUTOMATION_RUNS_TAB_HOLON.label}
      icon={AUTOMATION_RUNS_TAB_HOLON.icon}
      order={AUTOMATION_RUNS_TAB_HOLON.order}
      t={t}
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Runs
        </div>
        <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "6px 0 0", color: t.textMuted, lineHeight: 1.45 }}>
          One row per execution instance — per client, contact, import, or other entity when this
          automation fires.
        </p>
      </div>

      {runs.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            color: t.textMuted,
            fontSize: DOCS_TREE_LABEL_SIZE,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          No runs yet. Executions appear here when the trigger fires on an entity instance.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderBottom: `1px solid ${t.border}`,
              flexShrink: 0,
            }}
          >
            <span
              className={TOWER_DIALOG_HINT_CLASS}
              style={{ flex: 1, color: t.textMuted, textTransform: "uppercase", fontSize: 10 }}
            >
              Entity
            </span>
            <span
              className={TOWER_DIALOG_HINT_CLASS}
              style={{ color: t.textMuted, textTransform: "uppercase", fontSize: 10, flexShrink: 0 }}
            >
              Status
            </span>
            <span
              className={TOWER_DIALOG_HINT_CLASS}
              style={{
                ...directoryRowMetaStyle(t),
                textTransform: "uppercase",
                fontSize: 10,
              }}
            >
              Duration
            </span>
            <span
              className={TOWER_DIALOG_HINT_CLASS}
              style={{
                ...directoryRowMetaStyle(t),
                width: 112,
                textTransform: "uppercase",
                fontSize: 10,
              }}
            >
              Started
            </span>
          </div>
          <HolonBoundary
            id={AUTOMATION_RUN_ROW_HOLON.id}
            label={AUTOMATION_RUN_ROW_HOLON.label}
            icon={AUTOMATION_RUN_ROW_HOLON.icon}
            order={AUTOMATION_RUN_ROW_HOLON.order}
            registerOnly
            inView={runs.length > 0}
            t={t}
          >
            {null}
          </HolonBoundary>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {runs.map((run) => (
              <RunRow key={run.id} run={run} t={t} />
            ))}
          </div>
        </>
      )}
    </HolonBoundary>
  );
}
