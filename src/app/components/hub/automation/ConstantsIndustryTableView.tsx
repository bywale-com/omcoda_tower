import {
  AUTOMATION_CONSTANT_INDUSTRIES,
  formatConstantValue,
  getAutomationConstantIndustry,
  getConstantsForIndustry,
  type AutomationConstantIndustryId,
} from "../../../data/automationConstants";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../../docs/shellHolonOrder";
import { NotionIcon } from "../../icons/NotionIcon";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";

type ConstantsIndustryTableViewProps = {
  industryId: AutomationConstantIndustryId;
  t: Tokens;
};

export function ConstantsIndustryTableView({
  industryId,
  t,
}: ConstantsIndustryTableViewProps) {
  const industry =
    getAutomationConstantIndustry(industryId) ??
    AUTOMATION_CONSTANT_INDUSTRIES.find((item) => item.id === industryId);
  const rows = getConstantsForIndustry(industryId);
  const label = industry?.label ?? industryId;

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
        icon="gear"
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{ padding: "24px 28px 10px", flexShrink: 0, background: t.bgPrimary }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NotionIcon name="documents" size={16} color={t.accent} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: t.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {label}
          </h1>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: t.textMuted }}>
          Constants · {industry?.description ?? "Industry criteria library"}
        </p>
      </HolonBoundary>

      <HolonBoundary
        id="hub-tool-body"
        label="Hub Tool Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["hub-tool-body"]}
        t={t}
        style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "8px 28px 28px" }}
      >
        {rows.length === 0 ? (
          <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: "16px 0 0", color: t.textMuted }}>
            No constants authored for this industry yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: DOCS_TREE_LABEL_SIZE,
              }}
            >
              <thead>
                <tr>
                  {["Key", "Label", "Type", "Value", "Source"].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.border}`,
                        color: t.textMuted,
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        color: t.textPrimary,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.key}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        color: t.textPrimary,
                        fontWeight: 500,
                        maxWidth: 280,
                      }}
                      title={row.description}
                    >
                      {row.label}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        color: t.textMuted,
                        textTransform: "capitalize",
                      }}
                    >
                      {row.type}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        color: t.textPrimary,
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={formatConstantValue(row)}
                    >
                      {formatConstantValue(row)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${t.borderLight}`,
                        color: t.textMuted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.sourceRefs?.join(", ") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HolonBoundary>
    </div>
  );
}
