import { Download } from "lucide-react";
import type { AuditRecord } from "../../data/audits";
import {
  channelCellOverlay,
  compositeRowOverlay,
  isRecordEmailValid,
  isRecordPhoneValid,
  recordReachability,
} from "../../data/auditRecordReachability";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_LABEL_SIZE, DOCS_TREE_ROW_PAD_X, s } from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import { TOWER_POPOVER_ICON_BUTTON_CLASS } from "../ui/towerChrome";
import { cn } from "../ui/utils";
import type { Tokens } from "../tokens";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
] as const;

type AuditRecordsTableProps = {
  records: AuditRecord[];
  t: Tokens;
  isDark: boolean;
  /** When true, apply reachability diff overlays (completed audit) */
  showReachability?: boolean;
};

export function AuditRecordsTable({
  records,
  t,
  isDark,
  showReachability = false,
}: AuditRecordsTableProps) {
  const lastColIndex = COLUMNS.length;

  const baseCell = {
    fontSize: DOCS_TREE_LABEL_SIZE,
    fontWeight: 500 as const,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color: t.textPrimary,
    padding: `${s(9)}px ${DOCS_TREE_ROW_PAD_X}px`,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  };

  function innerBorders(colIndex: number, isLastRow: boolean) {
    return {
      borderRight: colIndex < lastColIndex ? `1px solid ${t.border}` : undefined,
      borderBottom: !isLastRow ? `1px solid ${t.border}` : undefined,
    };
  }

  const headerCell = (colIndex: number) => ({
    ...baseCell,
    textAlign: (colIndex === 0 ? "center" : "left") as const,
    width: colIndex === 0 ? 52 : undefined,
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    background: t.bgPrimary,
    borderRight: colIndex < lastColIndex ? `1px solid ${t.border}` : undefined,
    boxShadow: `inset 0 -1px 0 ${t.border}`,
  });

  return (
    <div
      style={{
        minHeight: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
          marginBottom: 6,
        }}
      >
        <button
          type="button"
          title="Sort records"
          aria-label="Sort records"
          className={cn(TOWER_POPOVER_ICON_BUTTON_CLASS, "h-6 w-6")}
        >
          <NotionIcon name="arrows-up-down" size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
        </button>
        <button
          type="button"
          title="Inspect record"
          aria-label="Inspect record"
          className={cn(TOWER_POPOVER_ICON_BUTTON_CLASS, "h-6 w-6")}
        >
          <NotionIcon name="cursor-click" size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
        </button>
        <button
          type="button"
          title="Export records"
          aria-label="Export records"
          className={cn(TOWER_POPOVER_ICON_BUTTON_CLASS, "h-6 w-6")}
        >
          <Download size={DOCS_TREE_ICON_SIZE} strokeWidth={2} color={t.textMuted} />
        </button>
      </div>

      <div
        style={{
          overflow: "auto",
          minHeight: 0,
          flex: 1,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: 52 }} />
            <col />
            <col style={{ width: "28%" }} />
            <col style={{ width: "34%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={headerCell(0)} scope="col">
                Row
              </th>
              {COLUMNS.map((column, i) => (
                <th key={column.key} style={headerCell(i + 1)} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const isLastRow = index === records.length - 1;
              const reachability = recordReachability(record);
              const emailOk = isRecordEmailValid(record);
              const phoneOk = isRecordPhoneValid(record);
              const compositeBg = showReachability
                ? compositeRowOverlay(reachability, isDark)
                : index % 2 === 1
                  ? t.hoverBg
                  : "transparent";

              const identityCellBase = {
                ...baseCell,
                background: compositeBg,
              };

              return (
                <tr key={record.id}>
                  <td
                    style={{
                      ...identityCellBase,
                      textAlign: "center",
                      ...innerBorders(0, isLastRow),
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      ...identityCellBase,
                      textAlign: "left",
                      ...innerBorders(1, isLastRow),
                    }}
                    title={record.name}
                  >
                    {record.name}
                  </td>
                  <td
                    style={{
                      ...baseCell,
                      background: showReachability
                        ? channelCellOverlay(phoneOk, isDark)
                        : index % 2 === 1
                          ? t.hoverBg
                          : "transparent",
                      ...innerBorders(2, isLastRow),
                    }}
                    title={record.phone}
                  >
                    {record.phone}
                  </td>
                  <td
                    style={{
                      ...baseCell,
                      background: showReachability
                        ? channelCellOverlay(emailOk, isDark)
                        : index % 2 === 1
                          ? t.hoverBg
                          : "transparent",
                      ...innerBorders(3, isLastRow),
                    }}
                    title={record.email}
                  >
                    {record.email}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
