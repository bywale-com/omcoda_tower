import type { Tokens } from "../../components/tokens";
import { RegisterTheoryPanel } from "../components/theory/RegisterTheoryPanel";
import {
  APPROACH_ADMISSION,
  ENGAGEMENT_CONTACT_ADMISSION,
  FIRM_SESSION_ADMISSION,
  PREPARED_WORKSPACE_ADMISSION,
  WORLD_SEATS,
  WORLD_SENTENCE,
  WORLD_SHAPE,
} from "../theory/world";

type WorldPaneProps = {
  t: Tokens;
};

function cellStyle(t: Tokens, cell: string) {
  const muted = cell === "—";
  return {
    padding: "6px 8px",
    borderBottom: `1px solid ${t.border}`,
    color: muted ? t.textDim : t.textPrimary,
    fontFamily: cell.includes("V") || cell === "—" ? ("ui-monospace, monospace" as const) : undefined,
    fontSize: 12,
  };
}

function AdmissionTable({
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
                style={
                  i === 0
                    ? {
                        padding: "6px 8px",
                        borderBottom: `1px solid ${t.border}`,
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 12,
                        color: t.textPrimary,
                      }
                    : i === 1
                      ? { padding: "6px 8px", borderBottom: `1px solid ${t.border}`, color: t.textMuted }
                      : cellStyle(t, cell)
                }
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
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
        Dense World from validated Seed. Twin: <code style={{ fontSize: 12 }}>docs/register/WORLD.md</code> +{" "}
        <code style={{ fontSize: 12 }}>admits()</code>. Facet order: activation sets target → acquisition fulfills seed
        quota → application retains.
      </p>

      <RegisterTheoryPanel title="Shape" t={t}>
        <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{WORLD_SHAPE}</div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="World sentence" t={t}>
        <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.55 }}>{WORLD_SENTENCE}</div>
      </RegisterTheoryPanel>

      {WORLD_SEATS.map((seat) => (
        <RegisterTheoryPanel
          key={seat.id}
          title={seat.kind === "lattice" ? `${seat.name} · lattice` : seat.name}
          t={t}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Why exist: </span>
              {seat.whyExist}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Served how: </span>
              {seat.servedHow}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Purpose they serve: </span>
              {seat.purposeTheyServe}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Primary object: </span>
              {seat.primaryObject}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Admit iff: </span>
              {seat.admitIff}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Never see: </span>
              {seat.neverSee.join("; ")}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Natural needs: </span>
              {seat.naturalNeeds.join("; ")}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: t.textPrimary }}>Not a persona: </span>
              {seat.notAPersona}
            </div>
            {seat.deskDepth ? (
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>Desk depth: </span>
                {seat.deskDepth}
              </div>
            ) : null}
            {seat.facets ? (
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>Facets: </span>
                {seat.facets}
              </div>
            ) : null}
            {seat.interestFriction ? (
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>Interest / friction: </span>
                {seat.interestFriction}
              </div>
            ) : null}
          </div>
        </RegisterTheoryPanel>
      ))}

      <RegisterTheoryPanel title="Approach admission (acquisition)" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>
          Finish line: seed_captured (name + website + channel). Click budget ends here. Engagement contact never
          admits.
        </p>
        <AdmissionTable
          t={t}
          headers={["State", "Meaning", "Consultant", "Operator"]}
          rows={APPROACH_ADMISSION.map((row) => ({
            key: row.state,
            cells: [row.state, row.meaning, row.consultant, row.operator],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Prepared workspace admission (activation)" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>
          Forward-deploy ∈ activation. Finish line: running (DB auth + escrow). Escrow-only money door.
        </p>
        <AdmissionTable
          t={t}
          headers={["State", "Meaning", "Consultant", "Operator"]}
          rows={PREPARED_WORKSPACE_ADMISSION.map((row) => ({
            key: row.state,
            cells: [row.state, row.meaning, row.consultant, row.operator],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Engagement contact admission (application)" t={t}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textDim, lineHeight: 1.4 }}>
          Cells: V = in view · — = not in view · T = owns transition. Firm must be running before live outreach.
        </p>
        <AdmissionTable
          t={t}
          headers={["State", "Meaning", "Consultant", "Engagement contact"]}
          rows={ENGAGEMENT_CONTACT_ADMISSION.map((row) => ({
            key: row.state,
            cells: [row.state, row.meaning, row.consultant, row.engagementContact],
          }))}
        />
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Firm / session admission (desk)" t={t}>
        <AdmissionTable
          t={t}
          headers={["State", "Meaning", "Consultant"]}
          rows={FIRM_SESSION_ADMISSION.map((row) => ({
            key: row.state,
            cells: [row.state, row.meaning, row.consultant],
          }))}
        />
      </RegisterTheoryPanel>
    </div>
  );
}

export function SeedPane({ t }: { t: Tokens }) {
  return (
    <div style={{ padding: 16, overflow: "auto", height: "100%", boxSizing: "border-box" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
        Dense dump: <code style={{ fontSize: 12 }}>docs/register/SEED.md</code> (~17 sections). Validated 2026-07-27 —
        World derived. Pane = map; file = source of truth.
      </p>

      <RegisterTheoryPanel title="§0 Product bet" t={t}>
        <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.55 }}>
          Always-on eligibility + engagement → surface campaign-worthy contacts → book meetings without manually
          rechecking every file. Not a reactive CRM.
        </div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="§0 Growth bet (ALG)" t={t}>
        <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.55 }}>
          One Meta tap → legible prepared workspace → seed inputs provision → agent earns DB auth + escrow → campaign
          runs. Application desk not reshaped for the experiment.
        </div>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="§5 Application loop" t={t}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          Contacts → Audit (reachability only) → Agents (opt-in / nudge / reactivation) → Client Data via touchpoints →
          Automations (R-*/B-*/Analysis) → Engine 2 motions → meeting booked. Nudges = data collection. Audit ≠ sales
          ceremony.
        </p>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="§5.8 Engine 2 pins" t={t}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          Reactivation &gt; nudge; one form consolidates needs; one client one motion; live brief on meeting_booked.
          D-01/D-02 open.
        </p>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="§6 Input contracts" t={t}>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: t.textPrimary }}>Acquisition ends:</span> name + website + phone/email
          (click budget).
        </p>
        <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: t.textPrimary }}>Activation ends:</span> DB auth + escrow → running.
          Forward-deploy ∈ activation.
        </p>
      </RegisterTheoryPanel>

      <RegisterTheoryPanel title="Also in Seed file" t={t}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
          <li>§2 Market & buyer · §3 Is / is not · §4 Molecular outcomes</li>
          <li>§7 Money · §8 Trust/consent · §9 Hard gates · §10 Objects</li>
          <li>§11 Prototype honesty · §12 Assumptions · §13 KUs · §14 Never invent</li>
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
