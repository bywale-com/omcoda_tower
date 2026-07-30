import { useState } from "react";
import type { Tokens } from "../../components/tokens";
import { ImplementationBlock } from "../components/theory/ImplementationBlock";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { TextWithUiRefs } from "../components/theory/TextWithUiRefs";
import type { SmeItem, SmeSeat } from "../theory/types";
import { getSmeItem, getSmeSeat, SME_SEATS } from "../theory/sme";
import { useRegisterSelection } from "../context/RegisterSelectionContext";

function SmeItemDetail({ item, t }: { item: SmeItem; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={registerFieldLabelStyle(t)}>Consideration</p>
      <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, lineHeight: 1.45 }}>
        <TextWithUiRefs text={item.consideration} t={t} style={{ fontSize: 13, fontWeight: 600 }} />
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
        <span style={{ fontWeight: 600, color: t.textPrimary }}>Thesis gap: </span>
        {item.thesisGap}
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: t.textPrimary }}>Solution: </span>
        <TextWithUiRefs text={item.solution} t={t} style={{ fontSize: 13 }} />
      </div>
      {item.references.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={registerFieldLabelStyle(t)}>References ({item.references.length})</p>
          {item.references.map((reference) =>
            reference.url.startsWith("http") ? (
              <a
                key={reference.url}
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 13, color: t.accent, textDecoration: "none" }}
              >
                {reference.title}
              </a>
            ) : (
              <span key={reference.title} style={{ fontSize: 13, color: t.textMuted }}>
                {reference.title}
              </span>
            ),
          )}
        </div>
      ) : null}
      <ImplementationBlock
        problem={item.implementationProblem}
        implementation={item.implementation}
        additions={item.implementationAdds}
        notDone={item.implementationPlant === "not_done"}
        t={t}
      />
    </div>
  );
}

function SeatOverview({ seat, t }: { seat: SmeSeat; t: Tokens }) {
  return (
    <>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>{seat.whyExists}</p>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: t.textMuted }}>
        <span style={{ fontWeight: 600, color: t.textPrimary }}>Domain: </span>
        {seat.domain}
      </p>
      <p style={registerFieldLabelStyle(t)}>{seat.items.length} consideration(s)</p>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textDim }}>
        Select an item in the left tree. Consideration stays visible; Implementation collapses below.
      </p>
    </>
  );
}

type SmePaneProps = {
  t: Tokens;
};

export function SmePane({ t }: SmePaneProps) {
  const { selectedSmeSeatId, selectedSmeItemId } = useRegisterSelection();
  const seat = selectedSmeSeatId ? getSmeSeat(selectedSmeSeatId) : null;
  const item =
    selectedSmeSeatId && selectedSmeItemId ? getSmeItem(selectedSmeSeatId, selectedSmeItemId) : null;

  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45, fontStyle: "italic" }}>
        SME — twin of docs/sme/pass2 + implementation (7 seats · 177 considerations). Pass2 solutions + PM click-path
        Implementation. Select a seat/item in the left tree.
      </p>

      {!seat ? (
        <RegisterTheoryPanel title="SME roster" t={t}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
            {SME_SEATS.map((s) => (
              <li key={s.id}>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>{s.label}</span>
                {" — "}
                {s.domain}
              </li>
            ))}
          </ul>
        </RegisterTheoryPanel>
      ) : (
        <RegisterTheoryPanel
          title={seat.label}
          t={t}
          right={
            item ? (
              <span style={{ fontSize: 11, color: t.textDim, fontFamily: "ui-monospace, monospace" }}>{item.id}</span>
            ) : null
          }
        >
          {item ? <SmeItemDetail item={item} t={t} /> : <SeatOverview seat={seat} t={t} />}
        </RegisterTheoryPanel>
      )}
    </div>
  );
}
