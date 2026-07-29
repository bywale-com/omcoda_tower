import { Link2 } from "lucide-react";
import type { Tokens } from "../../components/tokens";
import type { HowNode } from "../howAnalysis/types";
import {
  howAnalysisSectionBody,
  howAnalysisSectionLabel,
} from "../howAnalysis/howAnalysisNodeStyles";

type HowAnalysisDetailPanelProps = {
  node: HowNode;
  t: Tokens;
  onJumpToMerge?: (nodeId: string) => void;
};

function ComponentGroup({
  label,
  items,
  t,
}: {
  label: string;
  items: string[] | undefined;
  t: Tokens;
}) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={howAnalysisSectionLabel(t)}>{label}</p>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item} style={{ ...howAnalysisSectionBody(t), marginBottom: 4 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowAnalysisDetailPanel({ node, t, onJumpToMerge }: HowAnalysisDetailPanelProps) {
  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.boardPanel,
        overflowY: "auto",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "14px 14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: node.kind === "leaf" ? "#166534" : t.accent,
            }}
          >
            {node.kind}
          </span>
          {node.isLeaf ? (
            <span style={{ fontSize: 11, color: t.textMuted }}>· consultant leaf</span>
          ) : null}
        </div>

        {node.isLeaf ? (
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.45, color: t.textMuted }}>
            True leaf — process and system language is allowed in this Q/A (last pair in this
            chain). Map Auth Service, stores, and wires from Register flows here.
          </p>
        ) : (
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.45, color: t.textMuted }}>
            Before a leaf — question, clarity, and criteria stay consultant-visible only. Child
            questions must trace to a phrase in the parent answer (DNA). No stores, APIs, or
            runtime language until the terminal leaf.
          </p>
        )}

        {node.question ? (
          <div style={{ marginBottom: 18 }}>
            <p style={howAnalysisSectionLabel(t)}>Question</p>
            <p style={{ ...howAnalysisSectionBody(t), fontWeight: 500 }}>{node.question}</p>
          </div>
        ) : null}

        <div style={{ marginBottom: 18 }}>
          <p style={howAnalysisSectionLabel(t)}>Clarity</p>
          <p style={howAnalysisSectionBody(t)}>{node.clarity}</p>
        </div>

        {node.criteria.when || node.criteria.conditions.length > 0 ? (
          <div style={{ marginBottom: 18 }}>
            <p style={howAnalysisSectionLabel(t)}>Criteria</p>
            <div style={{ marginBottom: node.criteria.conditions.length > 0 ? 12 : 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: t.textDim,
                }}
              >
                When
              </p>
              {node.criteria.when ? (
                <p style={howAnalysisSectionBody(t)}>{node.criteria.when}</p>
              ) : (
                <p style={{ ...howAnalysisSectionBody(t), color: t.textMuted, fontStyle: "italic" }}>
                  Not specified yet
                </p>
              )}
            </div>
            {node.criteria.conditions.length > 0 ? (
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: t.textDim,
                  }}
                >
                  Conditions
                </p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {node.criteria.conditions.map((item) => (
                    <li key={item} style={{ ...howAnalysisSectionBody(t), marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <ComponentGroup label="UI" items={node.components.ui} t={t} />
        <ComponentGroup label="Runtime" items={node.components.runtime} t={t} />
        <ComponentGroup label="Stores" items={node.components.stores} t={t} />
        <ComponentGroup label="External" items={node.components.external} t={t} />

        {node.prototypeRef?.length ? (
          <div style={{ marginBottom: 16 }}>
            <p style={howAnalysisSectionLabel(t)}>Prototype refs</p>
            <p style={{ ...howAnalysisSectionBody(t), fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
              {node.prototypeRef.join(", ")}
            </p>
          </div>
        ) : null}

        {node.mergeWithId && onJumpToMerge ? (
          <button
            type="button"
            onClick={() => onJumpToMerge(node.mergeWithId!)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              padding: "6px 10px",
              border: `1px solid ${t.accent}`,
              borderRadius: 4,
              background: t.accentBg,
              color: t.accent,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <Link2 size={14} strokeWidth={1.75} />
            Jump to merge node
          </button>
        ) : null}
      </div>
    </aside>
  );
}
