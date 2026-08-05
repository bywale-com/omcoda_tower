import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel, registerFieldLabelStyle } from "../components/theory/RegisterTheoryPanel";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  PERSONA_ENRICHMENT_SUBJECTS,
  getPersonaCantItem,
  getPersonaCantsForSubject,
  getPersonaFurnishForSubject,
  getPersonaFurnishItem,
} from "../theory/enrichment";

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

function Field({ label, children, t }: { label: string; children: ReactNode; t: Tokens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={registerFieldLabelStyle(t)}>{label}</p>
      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

export function EnrichmentPane({ t }: { t: Tokens }) {
  const { selectedEnrichmentSubjectId, selectedEnrichmentItemId } = useRegisterSelection();
  const item = selectedEnrichmentItemId ? getPersonaCantItem(selectedEnrichmentItemId) : null;
  const subject = PERSONA_ENRICHMENT_SUBJECTS.find((s) => s.id === selectedEnrichmentSubjectId);

  if (item) {
    return (
      <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Right now I can't" t={t}>
            {item.rightNowICant}
          </Field>
          <Field label="SurfaceIds" t={t}>
            <PillList values={item.surfaceIds} t={t} />
          </Field>
          <Field label="Gap" t={t}>
            {item.gap}
          </Field>
          <Field label="Need" t={t}>
            {item.need}
          </Field>
        </div>
      </RegisterTheoryPanel>
    );
  }

  if (subject) {
    const cants = getPersonaCantsForSubject(subject.id);
    return (
      <RegisterTheoryPanel title={`${subject.label} — Can'ts`} t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          {cants.length} Enrichment Can'ts for this subject. Select an item in the left tree.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {cants.map((cant) => (
            <li key={cant.id}>
              <code style={{ fontSize: 12 }}>{cant.id}</code> — {cant.title}
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    );
  }

  return (
    <RegisterTheoryPanel title="Enrichment — Can'ts" t={t}>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Persona/subject design gaps (“Right now I can’t…”). 20 Can'ts × 3 subjects. Not Wiring Can'ts; not SME.
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
        {PERSONA_ENRICHMENT_SUBJECTS.map((s) => (
          <li key={s.id}>
            {s.label}: {s.cantCount} Can'ts
          </li>
        ))}
      </ul>
    </RegisterTheoryPanel>
  );
}

export function FurnishPane({ t }: { t: Tokens }) {
  const { selectedEnrichmentSubjectId, selectedEnrichmentItemId } = useRegisterSelection();
  const item = selectedEnrichmentItemId ? getPersonaFurnishItem(selectedEnrichmentItemId) : null;
  const subject = PERSONA_ENRICHMENT_SUBJECTS.find((s) => s.id === selectedEnrichmentSubjectId);

  if (item) {
    return (
      <RegisterTheoryPanel title={`${item.id} — ${item.title}`} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Supporting affordance" t={t}>
            {item.supportingAffordance}
          </Field>
          <Field label="SurfaceIds" t={t}>
            <PillList values={item.surfaceIds} t={t} />
          </Field>
          <Field label="implementationProblem" t={t}>
            {item.implementationProblem}
          </Field>
          <Field label="implementation" t={t}>
            <span style={{ whiteSpace: "pre-wrap" }}>{item.implementation}</span>
          </Field>
          <Field label="Does not change Core Function" t={t}>
            {item.doesNotChangeCoreFunction}
          </Field>
        </div>
      </RegisterTheoryPanel>
    );
  }

  if (subject) {
    const items = getPersonaFurnishForSubject(subject.id);
    return (
      <RegisterTheoryPanel title={`${subject.label} — Furnish`} t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          {items.length} Furnish items for this subject. Select an item in the left tree.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {items.map((row) => (
            <li key={row.id}>
              <code style={{ fontSize: 12 }}>{row.id}</code> — {row.title}
            </li>
          ))}
        </ul>
      </RegisterTheoryPanel>
    );
  }

  return (
    <RegisterTheoryPanel title="Furnish" t={t}>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Supporting affordances that do not change Core Function. 20 × 3 subjects. Written with
        implementationProblem + relative click-path before CT plant.
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
        {PERSONA_ENRICHMENT_SUBJECTS.map((s) => (
          <li key={s.id}>
            {s.label}: {s.furnishCount} Furnish
          </li>
        ))}
      </ul>
    </RegisterTheoryPanel>
  );
}
