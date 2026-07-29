import {
  isRuleEvaluationOutput,
  type RuleEvaluationOutput,
  type RuleOutcomeStatus,
} from "../../../data/automationRules";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { TOWER_DIALOG_HINT_CLASS } from "../../ui/towerChrome";
import type { Tokens } from "../../tokens";

type RuleAnalysisPaneProps = {
  data: unknown;
  t: Tokens;
};

function statusColor(status: RuleOutcomeStatus, t: Tokens): string {
  switch (status) {
    case "pass":
      return t.success;
    case "fail":
      return t.red;
    case "gap":
      return t.amber ?? t.accent;
    default:
      return t.textMuted;
  }
}

function statusLabel(status: RuleOutcomeStatus): string {
  switch (status) {
    case "pass":
      return "Pass";
    case "fail":
      return "Fail";
    case "gap":
      return "Gap";
    default:
      return "Needs data";
  }
}

export function RuleAnalysisPane({ data, t }: RuleAnalysisPaneProps) {
  if (!isRuleEvaluationOutput(data)) {
    return (
      <p className={TOWER_DIALOG_HINT_CLASS} style={{ margin: 0, color: t.textMuted }}>
        Run this rule to see enriched analysis.
      </p>
    );
  }

  const evaluation = data as RuleEvaluationOutput;
  const { summary, outcomes } = evaluation;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          border: `1px solid ${summary.pass ? t.success : t.border}`,
          background: t.hoverBg,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.textMuted,
            marginBottom: 6,
          }}
        >
          Summary
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, lineHeight: 1.35 }}>
          {summary.headline}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <SignalRow
            label="Nudge"
            value={
              summary.nudge.needed
                ? `${summary.nudge.kind} — ${summary.nudge.reason}`
                : summary.nudge.reason
            }
            t={t}
            accent={summary.nudge.needed}
          />
          <SignalRow
            label="Reactivation"
            value={summary.reactivation.reason}
            t={t}
            accent={summary.reactivation.warranted}
          />
        </div>
      </div>

      {summary.recommendedServices.length > 0 && (
        <div>
          <SectionTitle t={t}>Recommended services</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {summary.recommendedServices.map((service) => (
              <div
                key={service.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.bgPrimary,
                }}
              >
                <div style={{ fontSize: DOCS_TREE_LABEL_SIZE, fontWeight: 600, color: t.textPrimary }}>
                  {service.id} · {service.service}
                </div>
                <div className={TOWER_DIALOG_HINT_CLASS} style={{ marginTop: 2, color: t.textMuted }}>
                  {service.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle t={t}>Outcomes</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {outcomes.map((outcome) => (
            <div
              key={outcome.id}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: t.bgPrimary,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: statusColor(outcome.status, t),
                  }}
                >
                  {statusLabel(outcome.status)}
                </span>
                <span style={{ fontSize: DOCS_TREE_LABEL_SIZE, fontWeight: 600, color: t.textPrimary }}>
                  {outcome.label}
                </span>
              </div>
              <p
                className={TOWER_DIALOG_HINT_CLASS}
                style={{ margin: 0, color: t.textPrimary, lineHeight: 1.45 }}
              >
                {outcome.narrative}
              </p>
              {outcome.assertedResults.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: t.textMuted }}>
                  Results: {outcome.assertedResults.join(", ")}
                </div>
              )}
              {outcome.deltas.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {outcome.deltas.map((delta) => (
                    <span
                      key={delta.key}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: `1px solid ${t.border}`,
                        color: t.textPrimary,
                      }}
                    >
                      {delta.label}: {delta.value}
                      {delta.unit ? ` ${delta.unit}` : ""}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                {outcome.checks.map((check) => (
                  <div key={check.id} style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.35 }}>
                    {check.pass ? "✓" : "✗"} {check.narrative}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, t }: { children: string; t: Tokens }) {
  return (
    <div
      style={{
        marginBottom: 8,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: t.textMuted,
      }}
    >
      {children}
    </div>
  );
}

function SignalRow({
  label,
  value,
  t,
  accent,
}: {
  label: string;
  value: string;
  t: Tokens;
  accent?: boolean;
}) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.4 }}>
      <span style={{ fontWeight: 600, color: accent ? t.accent : t.textMuted }}>{label}: </span>
      <span style={{ color: t.textPrimary }}>{value}</span>
    </div>
  );
}
