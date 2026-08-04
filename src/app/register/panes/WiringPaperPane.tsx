import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  CANONICAL_NODES,
  CANT_ITEMS,
  FURNISH_ITEMS,
  HUMAN_PROVISIONING_NODES,
  WIRING_FUNCTION_TRACES,
  getCanonicalNode,
  getCantItem,
  getFurnishItem,
  getHumanProvisioningNode,
  getWiringSeatTraces,
  getWiringTraceItem,
} from "../theory/wiring";
import type {
  CanonicalNode,
  CantItem,
  FurnishItem,
  HumanProvisioningNode,
  WiringSeatTraces,
  WiringTraceItem,
} from "../theory/wiring";

function InlineCodeText({ text, t }: { text: string; t: Tokens }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={`${part}-${index}`}
            style={{
              fontSize: 12,
              color: t.textPrimary,
              background: t.boardPanel,
              border: `1px solid ${t.border}`,
              borderRadius: 4,
              padding: "1px 4px",
            }}
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function FieldBlock({ label, children, t }: { label: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={registerFieldLabelStyle(t)}>{label}</p>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function PillList({ values, t }: { values: string[]; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {values.map((value) => (
        <code
          key={value}
          style={{
            fontSize: 11,
            color: t.textPrimary,
            background: t.boardPanel,
            border: `1px solid ${t.border}`,
            borderRadius: 999,
            padding: "2px 7px",
          }}
        >
          {value}
        </code>
      ))}
    </div>
  );
}

function Overview({ t }: { t: Tokens }) {
  return (
    <>
      <RegisterTheoryPanel title="Wiring paper traces" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          Text browser for the paper Function traces in{" "}
          <code style={{ fontSize: 12 }}>docs/wiring/paper-trace</code>. These are Register Wiring notes only: no CT
          plant, no canvas graph, and no wire-step activation.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          <li>{WIRING_FUNCTION_TRACES.reduce((sum, seat) => sum + seat.items.length, 0)} Function trace items</li>
          <li>{CANONICAL_NODES.length} canonical node rows</li>
          <li>{CANT_ITEMS.length} can'ts and {FURNISH_ITEMS.length} furnish items</li>
          <li>{HUMAN_PROVISIONING_NODES.length} human-provisioning dependencies</li>
        </ul>
      </RegisterTheoryPanel>
      <RegisterTheoryPanel title="Function seats" t={t}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {WIRING_FUNCTION_TRACES.map((seat) => (
            <li key={seat.id}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>{seat.label}</span>
              {" - "}
              {seat.items.length} traces
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    </>
  );
}

function SeatOverview({ seat, t }: { seat: WiringSeatTraces; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={seat.label}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim, fontFamily: "ui-monospace, monospace" }}>{seat.id}</span>}
    >
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Select a trace under this seat to inspect its implementation source, starting node, ordered path hops, nodes
        touched, and swept facets.
      </p>
      <p style={registerFieldLabelStyle(t)}>{seat.items.length} trace item(s)</p>
    </RegisterTheoryPanel>
  );
}

function TraceDetail({ seat, trace, t }: { seat: WiringSeatTraces; trace: WiringTraceItem; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={trace.title}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim, fontFamily: "ui-monospace, monospace" }}>{trace.id}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldBlock label="Function seat" t={t}>
          <span style={{ color: t.textPrimary, fontWeight: 600 }}>{seat.label}</span>
        </FieldBlock>
        <FieldBlock label="Implementation source" t={t}>{trace.implementationSource}</FieldBlock>
        <FieldBlock label="Start" t={t}>
          <InlineCodeText text={trace.start} t={t} />
        </FieldBlock>
        <FieldBlock label={`Path (${trace.pathHops.length})`} t={t}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {trace.pathHops.map((hop, index) => (
              <li key={`${trace.id}-hop-${index}`} style={{ marginBottom: 6 }}>
                <InlineCodeText text={hop} t={t} />
              </li>
            ))}
          </ol>
        </FieldBlock>
        <FieldBlock label={`Nodes touched (${trace.nodesTouched.length})`} t={t}>
          <PillList values={trace.nodesTouched} t={t} />
        </FieldBlock>
        <FieldBlock label="Facets swept" t={t}>{trace.facets}</FieldBlock>
        {trace.missingSeatFlag ? <FieldBlock label="Missing seat flag" t={t}>{trace.missingSeatFlag}</FieldBlock> : null}
        {trace.deferredOrBlocked ? (
          <FieldBlock label="Deferred or blocked" t={t}>{trace.deferredOrBlocked}</FieldBlock>
        ) : null}
      </div>
    </RegisterTheoryPanel>
  );
}

function NodeDetail({ node, t }: { node: CanonicalNode; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={node.node}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim }}>{node.altitude}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldBlock label="Definition" t={t}>{node.definition}</FieldBlock>
        <FieldBlock label="Seats" t={t}>
          <PillList values={node.seats} t={t} />
        </FieldBlock>
        <FieldBlock label="Existence bucket" t={t}>{node.existenceBucket}</FieldBlock>
        {node.humanProvisioningDependency ? (
          <FieldBlock label="Human provisioning dependency" t={t}>{node.humanProvisioningDependency}</FieldBlock>
        ) : null}
      </div>
    </RegisterTheoryPanel>
  );
}

function CantDetail({ item, t }: { item: CantItem; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={item.title}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim, fontFamily: "ui-monospace, monospace" }}>{item.id}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldBlock label="Failure mode" t={t}>{item.failureMode}</FieldBlock>
        <FieldBlock label="Where it hangs" t={t}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {item.whereItHangs.map((hang) => (
              <li key={hang}>
                <InlineCodeText text={hang} t={t} />
              </li>
            ))}
          </ul>
        </FieldBlock>
        <FieldBlock label="Guard to add" t={t}>
          <InlineCodeText text={item.guardToAdd} t={t} />
        </FieldBlock>
        <FieldBlock label="Seats implicated" t={t}>
          <PillList values={item.seats} t={t} />
        </FieldBlock>
      </div>
    </RegisterTheoryPanel>
  );
}

function FurnishDetail({ item, t }: { item: FurnishItem; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={item.title}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim, fontFamily: "ui-monospace, monospace" }}>{item.id}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldBlock label="Ops node" t={t}>
          <code style={{ fontSize: 12, color: t.textPrimary }}>{item.opsNode}</code>
        </FieldBlock>
        <FieldBlock label="Purpose" t={t}>{item.purpose}</FieldBlock>
        <FieldBlock label="Attaches to Function nodes" t={t}>
          <PillList values={item.attachesToFunctionNodes} t={t} />
        </FieldBlock>
        <FieldBlock label="Does not change Function" t={t}>{item.doesNotChangeFunction}</FieldBlock>
      </div>
    </RegisterTheoryPanel>
  );
}

function HumanDetail({ node, t }: { node: HumanProvisioningNode; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={node.node}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim }}>{node.scope}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldBlock label="Requires to exist" t={t}>{node.requiresToExist}</FieldBlock>
        <FieldBlock label="Inherited by" t={t}>{node.inheritedBy}</FieldBlock>
        <FieldBlock label="Related Function seats" t={t}>
          <PillList values={node.relatedFunctionSeats} t={t} />
        </FieldBlock>
      </div>
    </RegisterTheoryPanel>
  );
}

function SectionList({ title, count, children, t }: { title: string; count: number; children: ReactNode; t: Tokens }) {
  return (
    <RegisterTheoryPanel
      title={title}
      t={t}
      right={<span style={{ fontSize: 11, color: t.textDim }}>{count} item(s)</span>}
    >
      {children}
    </RegisterTheoryPanel>
  );
}

export function WiringPaperPane({ t }: { t: Tokens }) {
  const {
    selectedWiringPaperSection,
    selectedWiringSeatId,
    selectedWiringTraceId,
    selectedWiringEntityId,
  } = useRegisterSelection();
  const section = selectedWiringPaperSection ?? "overview";
  const seat = selectedWiringSeatId ? getWiringSeatTraces(selectedWiringSeatId) : null;
  const trace = seat && selectedWiringTraceId ? getWiringTraceItem(seat.id, selectedWiringTraceId) : null;
  const node = section === "nodes" && selectedWiringEntityId ? getCanonicalNode(selectedWiringEntityId) : null;
  const cant = section === "cants" && selectedWiringEntityId ? getCantItem(selectedWiringEntityId) : null;
  const furnish = section === "furnish" && selectedWiringEntityId ? getFurnishItem(selectedWiringEntityId) : null;
  const human = section === "human" && selectedWiringEntityId ? getHumanProvisioningNode(selectedWiringEntityId) : null;

  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45, fontStyle: "italic" }}>
        Wiring - paper traces from <code style={{ fontSize: 12 }}>docs/wiring/paper-trace</code>. Text only; paper
        selection does not drive the wire canvas.
      </p>

      {trace && seat ? (
        <TraceDetail seat={seat} trace={trace} t={t} />
      ) : seat ? (
        <SeatOverview seat={seat} t={t} />
      ) : node ? (
        <NodeDetail node={node} t={t} />
      ) : cant ? (
        <CantDetail item={cant} t={t} />
      ) : furnish ? (
        <FurnishDetail item={furnish} t={t} />
      ) : human ? (
        <HumanDetail node={human} t={t} />
      ) : section === "function" ? (
        <SectionList title="Function traces" count={WIRING_FUNCTION_TRACES.length} t={t}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
            {WIRING_FUNCTION_TRACES.map((item) => (
              <li key={item.id}>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>{item.label}</span>
                {" - "}
                {item.items.length} traces
              </li>
            ))}
          </ul>
        </SectionList>
      ) : section === "nodes" ? (
        <SectionList title="Canonical nodes" count={CANONICAL_NODES.length} t={t}>
          <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            Select a node row to inspect its definition, altitude, seat coverage, existence bucket, and human dependency.
          </p>
        </SectionList>
      ) : section === "cants" ? (
        <SectionList title="Can'ts" count={CANT_ITEMS.length} t={t}>
          <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            Select a can't to inspect the failure mode, affected wiring nodes, guard to add, and implicated seats.
          </p>
        </SectionList>
      ) : section === "furnish" ? (
        <SectionList title="Furnish" count={FURNISH_ITEMS.length} t={t}>
          <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            Select a furnish item to inspect the ops node and Function nodes it attaches to without changing Function.
          </p>
        </SectionList>
      ) : section === "human" ? (
        <SectionList title="Human provisioning" count={HUMAN_PROVISIONING_NODES.length} t={t}>
          <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            Select a node to inspect what must be provisioned by humans before code can treat the node as available.
          </p>
        </SectionList>
      ) : (
        <Overview t={t} />
      )}
    </div>
  );
}
