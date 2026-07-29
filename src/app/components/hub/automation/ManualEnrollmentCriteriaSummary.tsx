import { Info, Pencil } from "lucide-react";
import {
  formatEnrollmentCount,
  getManualEnrollmentBreakdown,
  type AutomationDataClassId,
  type ManualTriggerConfig,
} from "../../../data/automationEvents";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";

type ManualEnrollmentCriteriaSummaryProps = {
  config: ManualTriggerConfig;
  t: Tokens;
  /** Compact card for the trigger node; fuller padding in the config panel. */
  compact?: boolean;
  onOpenConfig?: () => void;
  onEditClassFilter?: (classId: AutomationDataClassId) => void;
};

export function ManualEnrollmentCriteriaSummary({
  config,
  t,
  compact = false,
  onOpenConfig,
  onEditClassFilter,
}: ManualEnrollmentCriteriaSummaryProps) {
  const { rows, total } = getManualEnrollmentBreakdown(config);
  const hasRows = rows.length > 0;

  return (
    <div
      style={{
        borderRadius: 10,
        background: t.hoverBg,
        padding: compact ? 10 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: compact ? 8 : 10,
        }}
      >
        <span
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Enrollment criteria
        </span>
        <span title="Who is pulled into this run based on selected data classes and scopes">
          <Info size={13} strokeWidth={2} color={t.textMuted} />
        </span>
      </div>

      <div
        style={{
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={onOpenConfig}
          disabled={!onOpenConfig}
          className="nodrag nopan"
          style={{
            display: "block",
            width: "100%",
            border: "none",
            background: "transparent",
            padding: compact ? "10px 12px" : "12px 14px",
            textAlign: "left",
            cursor: onOpenConfig ? "pointer" : "default",
          }}
        >
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
              marginBottom: 6,
            }}
          >
            Records matching these attributes…
          </div>
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 500,
              color: hasRows ? t.textPrimary : t.textMuted,
              marginBottom: 4,
            }}
          >
            Pre-qualified: {hasRows ? formatEnrollmentCount(total) : "—"}
          </div>
          <p
            className={TOWER_DIALOG_HINT_CLASS}
            style={{ margin: 0, color: t.textMuted, lineHeight: 1.4 }}
          >
            Actual enrollment depends on eligibility at each run
          </p>
        </button>

        <div
          style={{
            borderTop: `1px solid ${t.border}`,
            padding: compact ? "6px 8px 8px" : "8px 10px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {!hasRows ? (
            <span
              style={{
                fontSize: DOCS_TREE_LABEL_SIZE,
                color: t.textMuted,
                padding: "4px 4px",
              }}
            >
              No data classes selected
            </span>
          ) : (
            rows.map((row) => (
              <div
                key={row.classId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 4px",
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontSize: DOCS_TREE_LABEL_SIZE,
                    fontWeight: 500,
                    color: t.textPrimary,
                    minWidth: 0,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={row.scopeSummary}
                >
                  {row.scopeSummary.startsWith(row.label) ? row.scopeSummary : row.label}
                </span>
                <span
                  style={{
                    fontSize: DOCS_TREE_LABEL_SIZE,
                    fontWeight: 500,
                    color: t.textMuted,
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatEnrollmentCount(row.size)}
                </span>
                <button
                  type="button"
                  title={`Filter ${row.label}`}
                  aria-label={`Filter ${row.label}`}
                  disabled={!onEditClassFilter}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditClassFilter?.(row.classId);
                  }}
                  className={cn(
                    "tower-chrome-menu-item inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm outline-none",
                    "nodrag nopan",
                    onEditClassFilter
                      ? "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      : "cursor-default opacity-50",
                  )}
                  style={{ color: row.hasNameFilter ? t.accent : t.textMuted }}
                >
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
