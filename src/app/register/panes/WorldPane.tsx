import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel } from "../components/theory/RegisterTheoryPanel";
import {
  PERSONAS_CRAFT_SUMMARY,
  SEED_MAP_SECTIONS,
  WORLD_ARCHIVE_NOTE,
  WORLD_ENTITIES,
  WORLD_FACET_DOCTRINE,
  WORLD_HARD_GATES,
  WORLD_INPUT_CONTRACT_PINS,
  WORLD_JOB,
  WORLD_NOT_GATES,
  WORLD_OBJECTS,
  WORLD_OPERATIONAL_LAWS,
  WORLD_SENTENCE,
  WORLD_SHAPE_LAYERS,
  WORLD_SHAPE_NECESSITIES,
  WORLD_VALUE_CHAIN,
} from "../theory/world";

type WorldPaneProps = {
  t: Tokens;
};

function CompactTable({
  t,
  headers,
  rows,
}: {
  t: Tokens;
  headers: string[];
  rows: { key: string; cells: string[] }[];
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              style={{
                textAlign: "left",
                padding: "6px 8px",
                borderBottom: `1px solid ${t.border}`,
                color: t.textDim,
                fontSize: 10,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, i) => (
              <td
                key={`${row.key}-${i}`}
                style={{
                  padding: "6px 8px",
                  borderBottom: `1px solid ${t.border}`,
                  color: i === 0 ? t.textPrimary : t.textMuted,
                  fontFamily: i === 0 ? ("ui-monospace, monospace" as const) : undefined,
                  fontSize: i === 0 ? 12 : 13,
                  lineHeight: 1.45,
                  verticalAlign: "top",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WorldPane({ t }: WorldPaneProps) {
  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45, fontStyle: "italic" }}>
        Ecosystem assembly twin of <code style={{ fontSize: 12 }}>docs/register/WORLD.md</code> (2026-07-29). Entities,
        value-chain, shape necessities — not craft seats or admission grids. Under-claim; Seed holes stay holes.
      </p>

      <RegisterTheoryPanel title="Shape layers" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{WORLD_JOB}</p>
        <CompactTable
          t={t}
          headers={["Layer", "Ecosystem shape"]}
          rows={WORLD_SHAPE_LAYERS.map((row) => ({
            key: row.layer,
            cells: [row.layer, row.meaning],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="World sentence" t={t}>
        <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.55 }}>{WORLD_SENTENCE}</div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Facet doctrine pins" t={t}>
        <ol style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          {WORLD_FACET_DOCTRINE.map((pin) => (
            <li key={pin} style={{ marginBottom: 4 }}>
              {pin}
            </li>
          ))}
        </ol>
        <p style={{ margin: 0, fontSize: 12, color: t.textDim, lineHeight: 1.45 }}>
          <span style={{ fontWeight: 600, color: t.textPrimary }}>Input-contract pins: </span>
          {WORLD_INPUT_CONTRACT_PINS}
        </p>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Entity inventory" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4, fontStyle: "italic" }}>
          Inventory and stated interest only — no treatment rulings (who logs in, what is built).
        </p>
        <CompactTable
          t={t}
          headers={["Entity", "Stated interest"]}
          rows={WORLD_ENTITIES.map((row) => ({
            key: row.entity,
            cells: [row.entity, row.interest],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Value-chain hops" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4, fontStyle: "italic" }}>
          Compact map — full justifying assumptions in WORLD.md §1.2.
        </p>
        <CompactTable
          t={t}
          headers={["From → To", "Relationship", "Assumption"]}
          rows={WORLD_VALUE_CHAIN.map((row) => ({
            key: row.fromTo,
            cells: [row.fromTo, row.relationship, row.assumption],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Ecosystem objects" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4, fontStyle: "italic" }}>
          Role only — no states, no visibility grids.
        </p>
        <CompactTable
          t={t}
          headers={["Object", "Role"]}
          rows={WORLD_OBJECTS.map((row) => ({
            key: row.object,
            cells: [row.object, row.role],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Shape necessities (§2)" t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {WORLD_SHAPE_NECESSITIES.map((item) => (
            <div key={item.title} style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>{item.title}: </span>
              {item.body}
            </div>
          ))}
        </div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Operational laws (§3)" t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {WORLD_OPERATIONAL_LAWS.map((item) => (
            <div key={item.title} style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>{item.title}: </span>
              {item.body}
            </div>
          ))}
        </div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Hard human gates (§4)" t={t}>
        <CompactTable
          t={t}
          headers={["Gate", "Layer", "Who", "Why human"]}
          rows={WORLD_HARD_GATES.map((row) => ({
            key: row.gate,
            cells: [row.gate, row.layer, row.who, row.why],
          }))}
        />
        <p style={{ margin: "10px 0 0", fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>{WORLD_NOT_GATES}</p>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Personas craft note" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4, fontStyle: "italic" }}>
          Compact from <code style={{ fontSize: 11 }}>docs/register/personas.md</code> — World named the operator/house
          class; craft names the members.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>Sole persona: </span>
            {PERSONAS_CRAFT_SUMMARY.solePersona}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>Engagement contact: </span>
            {PERSONAS_CRAFT_SUMMARY.engagementContact}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>Operator surfaces: </span>
            {PERSONAS_CRAFT_SUMMARY.operatorShape}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>House-global: </span>
            {PERSONAS_CRAFT_SUMMARY.houseGlobal.join(" · ")}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>Per-tenancy admin: </span>
            {PERSONAS_CRAFT_SUMMARY.perTenancy.join(" · ")}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: t.textPrimary }}>Ratified: </span>
            {PERSONAS_CRAFT_SUMMARY.ratified.join(" ")}
          </div>
        </div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Craft archive (not current)" t={t}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{WORLD_ARCHIVE_NOTE}</p>
      </RegisterTheoryPanel>
    </div>
  );
}

export function SeedPane({ t }: { t: Tokens }) {
  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45, fontStyle: "italic" }}>
        Navigable map of <code style={{ fontSize: 12 }}>docs/register/SEED.md</code> (~17 sections). Validated
        2026-07-27 — World derived. File = source of truth; pane = key § only.
      </p>

      {SEED_MAP_SECTIONS.map((section) => (
        <RegisterTheoryPanel key={section.id} title={section.title} t={t}>
          <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.55 }}>{section.body}</div>
        </RegisterTheoryPanel>
      ))}

      <RegisterTheoryPanel title="Also in Seed file" t={t}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          <li>§1 What Seed is / is not · §2 Market & buyer · §3 Is / is not</li>
          <li>§4 Molecular outcomes · §5.1–5.10 Hub modules, auth, visibility</li>
          <li>§6 ALG lattice (input contracts, forward-deploy, OLG, pass order)</li>
          <li>§10 Primary objects · §11 Prototype honesty · §12 Assumptions</li>
          <li>§15 SME chairs · §16 Doctrine pins</li>
        </ul>
      </RegisterTheoryPanel>
    </div>
  );
}

export function RegisterPlaceholderPane({
  t,
  title,
  body,
}: {
  t: Tokens;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}

export function CtPlantPlaceholderPane({ t }: { t: Tokens }) {
  return (
    <RegisterPlaceholderPane
      t={t}
      title="CT Plant — lo-fi click-through"
      body="DS-I gray functional prototype will live here. Complete left-panel theory first; plant ALL written affordances after Furnish. Product hi-fi stays at / until Translation."
    />
  );
}

export function ComponentsPaneHint({ t }: { t: Tokens }) {
  return (
    <RegisterPlaceholderPane
      t={t}
      title="Components inventory"
      body="Select a holon in the Components tree. Console highlights the matching surface in the live app. CT click-through will join via surfaceId when planted."
    />
  );
}
