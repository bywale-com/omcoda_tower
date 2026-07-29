import { useState } from "react";
import type { Tokens } from "../../components/tokens";
import { getHowGraph, getHowNodeChildren } from "../howAnalysis";
import type { HowGraph, HowNode } from "../howAnalysis/types";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { OUTCOME_PERSONAS, type Outcome } from "../theory/outcomes";
import { useRegisterSelection } from "../context/RegisterSelectionContext";

function HowInlineNode({
  graph,
  node,
  t,
}: {
  graph: HowGraph;
  node: HowNode;
  t: Tokens;
}) {
  const kids = getHowNodeChildren(graph, node.id);
  const isLeaf = node.isLeaf || node.kind === "leaf";
  const pad = 8 + node.depth * 12;

  return (
    <div>
      <div
        style={{
          padding: `6px 8px 6px ${pad}px`,
          borderLeft: isLeaf ? `2px solid ${t.accent}` : `2px solid transparent`,
          marginBottom: 2,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: node.kind === "outcome" ? 600 : 500, color: t.textPrimary }}>
          {node.kind === "outcome" ? "Outcome" : isLeaf ? "Leaf" : "How"}
          {node.question ? (
            <span style={{ fontWeight: 400, color: t.textMuted }}> · {node.question}</span>
          ) : null}
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.45, marginTop: 2 }}>{node.clarity}</div>
      </div>
      {kids.map((child) => (
        <HowInlineNode key={child.id} graph={graph} node={child} t={t} />
      ))}
    </div>
  );
}

function OutcomeBlock({
  outcome,
  selected,
  onSelect,
  t,
}: {
  outcome: Outcome;
  selected: boolean;
  onSelect: () => void;
  t: Tokens;
}) {
  const graph = outcome.howGraphId ? getHowGraph(outcome.howGraphId) : undefined;

  return (
    <div style={{ borderBottom: `1px solid ${t.border}` }}>
      <button
        type="button"
        onClick={onSelect}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "10px 0",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: selected ? t.accent : t.textPrimary }}>
            {outcome.label}
          </span>
          {outcome.core ? (
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: t.accent }}>CORE</span>
          ) : null}
          {graph ? (
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: t.textDim }}>HOW</span>
          ) : null}
        </div>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4, lineHeight: 1.45 }}>{outcome.statement}</div>
      </button>

      {selected && graph ? (
        <div style={{ marginBottom: 12, paddingLeft: 4 }}>
          <p style={{ ...registerFieldLabelStyle(t), marginBottom: 6 }}>How tree</p>
          {graph.nodes
            .filter((n) => n.parentId === null)
            .map((root) => (
              <HowInlineNode key={root.id} graph={graph} node={root} t={t} />
            ))}
          <p style={{ margin: "8px 0 0", fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>
            Select this outcome (or a How node) in the left tree to open the full How canvas.
          </p>
        </div>
      ) : null}
    </div>
  );
}

type PersonasFunctionPaneProps = {
  t: Tokens;
};

export function PersonasFunctionPane({ t }: PersonasFunctionPaneProps) {
  const { selectedOutcomeId, selectOutcome } = useRegisterSelection();
  const [localOutcomeId, setLocalOutcomeId] = useState<string | null>("consultant-core");
  const expandedId = selectedOutcomeId ?? localOutcomeId;

  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
        Personas & Function — delineated by World seat. Expand an outcome to read its statement; outcomes with How open
        an inline tree (and the left tree / canvas for deep work).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {OUTCOME_PERSONAS.map((persona) => (
          <RegisterTheoryPanel
            key={persona.id}
            title={persona.kind === "lattice" ? `${persona.label} · lattice` : persona.label}
            t={t}
          >
            <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, fontStyle: "italic", lineHeight: 1.45 }}>
              {persona.purpose}
            </p>
            <div>
              {persona.outcomes.map((outcome) => (
                <OutcomeBlock
                  key={outcome.id}
                  outcome={outcome}
                  selected={expandedId === outcome.id}
                  onSelect={() => {
                    const next = expandedId === outcome.id ? null : outcome.id;
                    setLocalOutcomeId(next);
                    if (next) {
                      // Theory expand only — don't open How canvas (left tree does that).
                      selectOutcome(next, null);
                    }
                  }}
                  t={t}
                />
              ))}
            </div>
          </RegisterTheoryPanel>
        ))}
      </div>
    </div>
  );
}

export function WiringOverviewPane({ t }: { t: Tokens }) {
  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <RegisterTheoryPanel title="Wiring (CTO)" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
          Register captures what has a face. Wiring captures what must run whether or not anyone looks — jobs, state
          machines, auth, automation runtime. Flow discovery (below in left panel) proves cross-system hops.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: t.textPrimary, lineHeight: 1.45 }}>
          <strong>Next artifact:</strong> <code style={{ fontSize: 12 }}>docs/wiring/WIRING.md</code> +{" "}
          <code style={{ fontSize: 12 }}>register/trace/wiring.ts</code>
        </p>
      </RegisterTheoryPanel>
      <RegisterTheoryPanel title="Flow maps" t={t}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
          Select a flow or step under Wiring in the left panel. Step canvas opens when a step is selected.
        </p>
      </RegisterTheoryPanel>
    </div>
  );
}
