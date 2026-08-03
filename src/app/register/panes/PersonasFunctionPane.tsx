/**
 * Personas & Function — HQ RegisterPersonas hierarchy in Tower chrome:
 * persona panels → outcome expand → How tree → leaf drawer in Theory strip.
 * Leaf open reveals Click-through (right rail); Theory never leaves this strip.
 */
import { useEffect, useState } from "react";
import type { Tokens } from "../../components/tokens";
import { getHowGraph, getHowNodeChildren } from "../howAnalysis";
import type { HowGraph, HowNode } from "../howAnalysis/types";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { TextWithUiRefs } from "../components/theory/TextWithUiRefs";
import { OUTCOME_PERSONAS, type Outcome } from "../theory/outcomes";
import type { HowUiRef, UiKind } from "../theory/types";
import { UI_KIND_ORDER, uiKindStyle } from "../theory/uiKindStyles";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { useRegisterShell, type CtDeskId } from "../context/RegisterShellContext";
import { useRegisterTrace } from "../trace/RegisterTraceContext";
import { getSurfaceByLabel, resolveSurfaceLabel } from "../trace/surfaceCatalog";

function deskForPersona(personaId: string | undefined): CtDeskId {
  if (personaId === "operator") return "operator";
  if (personaId === "engagement_contact" || personaId === "contact") return "contact";
  return "consultant";
}

function firstCatalogSurfaceLabel(uiLabels: string[] | undefined): string | null {
  for (const label of uiLabels ?? []) {
    if (getSurfaceByLabel(label) || resolveSurfaceLabel(label)) return label;
  }
  return null;
}

function uiRefsFromNode(node: HowNode): HowUiRef[] {
  return (node.components.ui ?? []).map((label, i) => ({
    id: `${node.id}-ui-${i}`,
    kind: "block" as UiKind,
    label,
  }));
}

function isHowLeaf(node: HowNode): boolean {
  return node.isLeaf === true || node.kind === "leaf";
}

function KindLegend({ t }: { t: Tokens }) {
  return (
    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10.5, color: t.textMuted }}>
      {UI_KIND_ORDER.map((k) => {
        const s = uiKindStyle(t, k);
        return (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: s.color,
              }}
            />
            {s.label}
          </span>
        );
      })}
    </div>
  );
}

function LeafDrawer({ node, t }: { node: HowNode; t: Tokens }) {
  const refs = uiRefsFromNode(node);
  return (
    <div
      style={{
        margin: "0 0 8px 20px",
        padding: "10px 12px",
        borderLeft: `2px solid ${t.accent}`,
        background: t.bgSecondary,
        borderRadius: "0 4px 4px 0",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
        {node.question ?? "Leaf"}
      </div>
      <TextWithUiRefs text={node.clarity} refs={refs} t={t} />
      {refs.length > 0 ? (
        <div style={{ marginTop: 10, fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: t.textPrimary }}>UI named: </span>
          <TextWithUiRefs text={refs.map((r) => r.label).join(" · ")} refs={refs} t={t} />
        </div>
      ) : null}
      <KindLegend t={t} />
      <p style={{ margin: "10px 0 0", fontSize: 11, color: t.textDim, fontStyle: "italic", lineHeight: 1.4 }}>
        Click a highlighted surface chip to focus it on the prototype canvas.
      </p>
    </div>
  );
}

function HowTreeNode({
  graph,
  node,
  selectedLeafId,
  onSelectLeaf,
  t,
}: {
  graph: HowGraph;
  node: HowNode;
  selectedLeafId: string | null;
  onSelectLeaf: (node: HowNode) => void;
  t: Tokens;
}) {
  const kids = getHowNodeChildren(graph, node.id);
  const leaf = isHowLeaf(node);
  const selected = selectedLeafId === node.id;
  const pad = 8 + node.depth * 14;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (!leaf) return;
          onSelectLeaf(node);
        }}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: `8px 10px 8px ${pad}px`,
          border: "none",
          borderLeft: selected ? `3px solid ${t.accent}` : `3px solid transparent`,
          background: selected ? t.accentBg : leaf ? t.bgSecondary : "transparent",
          borderRadius: 4,
          cursor: leaf ? "pointer" : "default",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: node.kind === "outcome" ? 700 : 600,
              color: t.textPrimary,
            }}
          >
            {node.kind === "outcome" ? "Outcome" : leaf ? "Leaf" : "How"}
          </span>
          {leaf ? (
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: t.accent }}>LEAF</span>
          ) : node.kind === "answer" ? (
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: t.textDim }}>HOW</span>
          ) : null}
        </div>
        {node.question ? (
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3, lineHeight: 1.4 }}>{node.question}</div>
        ) : null}
        {!leaf && node.clarity ? (
          <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 4, lineHeight: 1.45 }}>{node.clarity}</div>
        ) : null}
      </button>
      {kids.map((child) => (
        <HowTreeNode
          key={child.id}
          graph={graph}
          node={child}
          selectedLeafId={selectedLeafId}
          onSelectLeaf={onSelectLeaf}
          t={t}
        />
      ))}
      {leaf && selected ? <LeafDrawer node={node} t={t} /> : null}
    </div>
  );
}

function OutcomeBlock({
  outcome,
  personaId,
  selected,
  onSelect,
  t,
}: {
  outcome: Outcome;
  personaId: string;
  selected: boolean;
  onSelect: () => void;
  t: Tokens;
}) {
  const graph = outcome.howGraphId ? getHowGraph(outcome.howGraphId) : undefined;
  const { selectedHowNodeId, selectHowGraph, selectHowNode } = useRegisterSelection();
  const { revealCt } = useRegisterShell();
  const { focusSurface } = useRegisterTrace();
  const [leafId, setLeafId] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setLeafId(null);
      return;
    }
    if (!graph || !selectedHowNodeId) return;
    const node = graph.nodes.find((n) => n.id === selectedHowNodeId);
    if (node && isHowLeaf(node)) setLeafId(node.id);
  }, [selected, graph, selectedHowNodeId]);

  return (
    <div
      style={{
        borderBottom: `1px solid ${t.border}`,
        paddingBottom: selected ? 12 : 0,
      }}
    >
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
        <div style={{ marginTop: 4, paddingLeft: 4 }}>
          <p style={{ ...registerFieldLabelStyle(t), marginBottom: 6 }}>How tree</p>
          {graph.nodes
            .filter((n) => n.parentId === null)
            .map((root) => (
              <HowTreeNode
                key={root.id}
                graph={graph}
                node={root}
                selectedLeafId={leafId}
                onSelectLeaf={(n) => {
                  const opening = leafId !== n.id;
                  setLeafId((id) => (id === n.id ? null : n.id));
                  if (!opening) {
                    selectHowNode(null);
                    return;
                  }
                  selectHowGraph(graph.id);
                  selectHowNode(n.id);
                  revealCt(deskForPersona(personaId));
                  const first = firstCatalogSurfaceLabel(n.components.ui);
                  if (first) focusSurface(first);
                }}
                t={t}
              />
            ))}
        </div>
      ) : null}
    </div>
  );
}

type PersonasFunctionPaneProps = {
  t: Tokens;
};

export function PersonasFunctionPane({ t }: PersonasFunctionPaneProps) {
  const { selectedOutcomeId, selectedPersonaId, selectOutcome, selectPersona } = useRegisterSelection();
  const [localOutcomeId, setLocalOutcomeId] = useState<string | null>("consultant-core");
  const expandedId = selectedOutcomeId ?? localOutcomeId;

  useEffect(() => {
    if (!selectedPersonaId) return;
    document
      .querySelector(`[data-register-theory-persona="${selectedPersonaId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedPersonaId]);

  useEffect(() => {
    if (!expandedId) return;
    document
      .querySelector(`[data-register-theory-outcome="${expandedId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [expandedId]);

  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45, fontStyle: "italic" }}>
        Personas & Function — twin of docs/register/OUTCOMES.md + how/*.md. Expand an outcome for its How tree; open a
        leaf for click-path solutioning. Click-through stays on the right (HQ hierarchy).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {OUTCOME_PERSONAS.map((persona) => (
          <div key={persona.id} data-register-theory-persona={persona.id}>
            <RegisterTheoryPanel
              title={persona.kind === "lattice" ? `${persona.label} · lattice` : persona.label}
              t={t}
            >
              <p
                style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, fontStyle: "italic", lineHeight: 1.45 }}
              >
                {persona.purpose}
              </p>
              <div>
                {persona.outcomes.map((outcome) => (
                  <div key={outcome.id} data-register-theory-outcome={outcome.id}>
                    <OutcomeBlock
                      outcome={outcome}
                      personaId={persona.id}
                      selected={expandedId === outcome.id}
                      onSelect={() => {
                        const next = expandedId === outcome.id ? null : outcome.id;
                        setLocalOutcomeId(next);
                        if (next) selectOutcome(next, outcome.howGraphId ?? null);
                        else selectPersona(persona.id);
                      }}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            </RegisterTheoryPanel>
          </div>
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
          machines, auth, automation runtime. Persona happy paths live under <strong>Flows</strong> (above); Wiring
          holds contract / holon wire graphs.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: t.textPrimary, lineHeight: 1.45 }}>
          <strong>Next artifact:</strong> <code style={{ fontSize: 12 }}>docs/wiring/WIRING.md</code> +{" "}
          <code style={{ fontSize: 12 }}>register/trace/wiring.ts</code>
        </p>
      </RegisterTheoryPanel>
      <RegisterTheoryPanel title="Wire maps" t={t}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
          Select a wire flow or step under Wiring in the left panel. Step canvas opens in Click-through when a step is
          selected.
        </p>
      </RegisterTheoryPanel>
    </div>
  );
}
