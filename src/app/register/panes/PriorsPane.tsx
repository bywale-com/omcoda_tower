import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { ALL_PRIOR_ENTRIES, PRIOR_ZONES, getPriorEntry, getPriorsForZone } from "../theory/priors";

function Field({ label, children, t }: { label: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={registerFieldLabelStyle(t)}>{label}</p>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

export function PriorsPane({ t }: { t: Tokens }) {
  const { selectedPriorZoneId, selectedPriorItemId } = useRegisterSelection();
  const item = selectedPriorItemId ? getPriorEntry(selectedPriorItemId) : null;
  const zone = PRIOR_ZONES.find((z) => z.id === selectedPriorZoneId);

  if (item) {
    return (
      <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Zone" t={t}>
            {item.zone}
          </Field>
          <Field label="Where" t={t}>
            {item.where}
          </Field>
          <Field label="Kind" t={t}>
            {item.kind}
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
    const items = getPriorsForZone(zone.id);
    return (
      <RegisterTheoryPanel title={`Priors — ${zone.label}`} t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          {items.length} priors in this zone (no lattice / click-path statement). Select an item in the
          left tree.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {items.map((entry) => (
            <li key={entry.id}>
              <code style={{ fontSize: 12 }}>{entry.id}</code> — {entry.title}
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    );
  }

  return (
    <RegisterTheoryPanel title="Priors — full-app inventory" t={t}>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Interactive CT controls with no How / SME / Enrichment / Furnish click-path statement. Entry =
        control; purposes empty. Own Register class — not a lattice retrofit.
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Total: {ALL_PRIOR_ENTRIES.length} priors across the full CT (plant + Ant).
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
        {PRIOR_ZONES.map((z) => (
          <li key={z.id}>
            {z.label}: {z.count}
          </li>
        ))}
      </ul>
    </RegisterTheoryPanel>
  );
}
