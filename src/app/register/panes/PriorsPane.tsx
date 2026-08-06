import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  PRIOR_ZONES,
  countPriorsByMark,
  getPriorEntry,
  getPriorsForModule,
  type PriorMark,
} from "../theory/priors";

function Field({ label, children, t }: { label: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={registerFieldLabelStyle(t)}>{label}</p>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function MarkPill({ mark, t }: { mark: PriorMark; t: Tokens }) {
  const tone =
    mark === "prior"
      ? { bg: "rgba(180, 83, 9, 0.12)", fg: "#b45309", border: "rgba(180, 83, 9, 0.35)" }
      : mark === "weak"
        ? { bg: "rgba(37, 99, 235, 0.1)", fg: "#2563eb", border: "rgba(37, 99, 235, 0.3)" }
        : { bg: "rgba(22, 163, 74, 0.1)", fg: "#16a34a", border: "rgba(22, 163, 74, 0.3)" };
  return (
    <code
      style={{
        fontSize: 11,
        color: tone.fg,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 999,
        padding: "2px 8px",
      }}
    >
      {mark}
    </code>
  );
}

export function PriorsPane({ t }: { t: Tokens }) {
  const { selectedPriorModuleId, selectedPriorItemId } = useRegisterSelection();
  const item = selectedPriorItemId ? getPriorEntry(selectedPriorItemId) : null;
  const zone = PRIOR_ZONES.find((z) => z.id === selectedPriorModuleId);

  if (item) {
    return (
      <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Mark" t={t}>
            <MarkPill mark={item.mark} t={t} />
          </Field>
          <Field label="Where" t={t}>
            {item.where}
          </Field>
          <Field label="Kind" t={t}>
            {item.kind}
          </Field>
          <Field label="Lattice hint" t={t}>
            {item.latticeHint || "—"}
          </Field>
          <Field label="Notes" t={t}>
            {item.notes || "—"}
          </Field>
          <Field label="Purposes" t={t}>
            Empty — purpose pass later (entry = control).
          </Field>
        </div>
      </RegisterTheoryPanel>
    );
  }

  if (zone) {
    const items = getPriorsForModule(zone.id);
    const priorCount = items.filter((i) => i.mark === "prior").length;
    const weakCount = items.filter((i) => i.mark === "weak").length;
    const latticedCount = items.filter((i) => i.mark === "latticed").length;
    return (
      <RegisterTheoryPanel title={`Priors — ${zone.label}`} t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          {items.length} controls censused · {priorCount} prior · {weakCount} weak · {latticedCount}{" "}
          latticed. Select an item in the left tree.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {items.map((entry) => (
            <li key={entry.id}>
              <MarkPill mark={entry.mark} t={t} />{" "}
              <code style={{ fontSize: 12 }}>{entry.id}</code> — {entry.title}
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    );
  }

  const priorTotal = countPriorsByMark("prior");
  const weakTotal = countPriorsByMark("weak");
  const latticedTotal = countPriorsByMark("latticed");

  return (
    <RegisterTheoryPanel title="Priors — desk→lattice census" t={t}>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Interactive CT controls classified against the lattice (How / SME / Enrichment / Furnish). Entry =
        control; purposes empty until the purpose pass. Own Register class — not a How/SME/Can't/Furnish
        retrofit.
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Totals: {priorTotal} prior · {weakTotal} weak · {latticedTotal} latticed (deep slices include
        latticed for completeness; desk-zones list prior + weak only).
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
        {PRIOR_ZONES.map((z) => {
          const items = getPriorsForModule(z.id);
          const p = items.filter((i) => i.mark === "prior").length;
          return (
            <li key={z.id}>
              {z.label}: {p} prior / {z.count} listed
            </li>
          );
        })}
      </ul>
    </RegisterTheoryPanel>
  );
}
