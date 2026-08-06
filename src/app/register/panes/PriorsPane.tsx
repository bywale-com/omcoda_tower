import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  ALL_PRIOR_ENTRIES,
  ALL_WEAK_ENTRIES,
  PRIOR_ZONES,
  WEAK_ZONES,
  getPriorEntry,
  getPriorsForZone,
  getWeakEntry,
  getWeaksForZone,
} from "../theory/priors";

function Field({ label, children, t }: { label: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={registerFieldLabelStyle(t)}>{label}</p>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

export function PriorsPane({ t }: { t: Tokens }) {
  const { selectedDeskLatticeKind, selectedPriorZoneId, selectedPriorItemId } = useRegisterSelection();

  if (selectedDeskLatticeKind === "weak") {
    const item = selectedPriorItemId ? getWeakEntry(selectedPriorItemId) : null;
    const zone = WEAK_ZONES.find((z) => z.id === selectedPriorZoneId);

    if (item) {
      return (
        <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Class" t={t}>
              Weak — lattice foothold present; control itself unnamed
            </Field>
            <Field label="Zone" t={t}>
              {item.zone}
            </Field>
            <Field label="Where" t={t}>
              {item.where}
            </Field>
            <Field label="Kind" t={t}>
              {item.kind}
            </Field>
            <Field label="Lattice foothold" t={t}>
              {item.latticeFoothold}
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
      const items = getWeaksForZone(zone.id);
      return (
        <RegisterTheoryPanel title={`Weak — ${zone.label}`} t={t}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            {items.length} weak controls — nearby lattice foothold, control unnamed. Select an item in the
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
      <RegisterTheoryPanel title="Weak — lattice foothold, control unnamed" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          Interactive CT controls where How / SME / Enrichment / Furnish names a parent surface or nearby
          path, but not this control. Not invisible — incomplete.
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          Total: {ALL_WEAK_ENTRIES.length} weak.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {WEAK_ZONES.map((z) => (
            <li key={z.id}>
              {z.label}: {z.count}
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    );
  }

  const item = selectedPriorItemId ? getPriorEntry(selectedPriorItemId) : null;
  const zone = PRIOR_ZONES.find((z) => z.id === selectedPriorZoneId);

  if (item) {
    return (
      <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Class" t={t}>
            Prior — no lattice / click-path statement
          </Field>
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
          {items.length} priors in this zone (no lattice / click-path statement). Select an item in the left
          tree.
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
    <RegisterTheoryPanel title="Priors & Weak — desk→lattice" t={t}>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Full CT inventory of controls that are not fully latticed. <strong>Prior</strong> = no foothold.{" "}
        <strong>Weak</strong> = foothold nearby, control itself unnamed.
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        {ALL_PRIOR_ENTRIES.length} priors · {ALL_WEAK_ENTRIES.length} weak. Select a branch in the left tree.
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
        <li>
          Priors: {PRIOR_ZONES.map((z) => `${z.label} ${z.count}`).join(" · ")}
        </li>
        <li>
          Weak: {WEAK_ZONES.map((z) => `${z.label} ${z.count}`).join(" · ")}
        </li>
      </ul>
    </RegisterTheoryPanel>
  );
}
