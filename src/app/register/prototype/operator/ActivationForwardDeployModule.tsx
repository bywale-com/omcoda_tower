/**
 * Activation & forward-deploy — leaves 1.1–1.3 plant:
 * In-flight → Forward-deploy form → Hydrate → Readiness walkthrough;
 * view hard-input chips (Authorize book / Accept terms).
 */
import { useEffect, useState, type CSSProperties } from "react";
import { RegisterSurfaceMount, sectionLabelStyle, navBtnStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

type StagingChip = "idle" | "enriching" | "hydrated" | "stale";

type ActivationRow = {
  id: string;
  firmId: string;
  firm: string;
  owner: string;
  staging: StagingChip;
  authorizeBook: "pending" | "complete";
  acceptTerms: "pending" | "complete";
  publicUrl: string;
  brandPackage: string;
  templateVersion: string;
};

const TEMPLATES = [
  "Engagement · ALG desk v3 (published)",
  "Engagement · Soft-open v2 (published)",
  "Engagement · Re-engage v1 (published)",
] as const;

const INITIAL: ActivationRow[] = [
  {
    id: "act-cedar",
    firmId: DEMO_FIRMS[1].id,
    firm: DEMO_FIRMS[1].name,
    owner: "Lena",
    staging: "hydrated",
    authorizeBook: "pending",
    acceptTerms: "pending",
    publicUrl: "https://cedarpathways.ca",
    brandPackage: "Brand · cedar public v1",
    templateVersion: TEMPLATES[0],
  },
  {
    id: "act-harbor",
    firmId: DEMO_FIRMS[2].id,
    firm: DEMO_FIRMS[2].name,
    owner: "Marco",
    staging: "hydrated",
    authorizeBook: "complete",
    acceptTerms: "pending",
    publicUrl: "https://harborrcic.com",
    brandPackage: "Brand · harbor public v2",
    templateVersion: TEMPLATES[1],
  },
  {
    id: "act-atlas",
    firmId: DEMO_FIRMS[3].id,
    firm: DEMO_FIRMS[3].name,
    owner: "Lena",
    staging: "idle",
    authorizeBook: "pending",
    acceptTerms: "pending",
    publicUrl: "https://atlasmobility.ca",
    brandPackage: "Brand · atlas public v1",
    templateVersion: TEMPLATES[0],
  },
];

const WALKTHROUGH = [
  { id: "w1", title: "Template preview", detail: "Published engagement template under firm identity" },
  { id: "w2", title: "Public facts", detail: "Allowlisted site / listing facts bound into the workspace" },
  { id: "w3", title: "Brand state", detail: "Logo / palette confirmed or neutral placeholder" },
  { id: "w4", title: "Next hard inputs", detail: "Authorize book + Accept terms (consultant commits)" },
] as const;

function stagingTone(s: StagingChip): "muted" | "amber" | "success" {
  if (s === "hydrated") return "success";
  if (s === "enriching" || s === "stale") return "amber";
  return "muted";
}

function stagingLabel(s: StagingChip): string {
  if (s === "hydrated") return "Hydrated";
  if (s === "enriching") return "Enriching";
  if (s === "stale") return "Stale facts";
  return "Not staged";
}

export function ActivationForwardDeployModule({
  t,
  focusedEntry,
  hoveredId,
}: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Activation & forward-deploy", focusedEntry, hoveredEntry);
  const [rows, setRows] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(INITIAL[0].id);
  const [walkStep, setWalkStep] = useState(0);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Activation & forward-deploy") return;
    if (
      focusedEntry.label === "In-flight activations" ||
      focusedEntry.label === "Forward-deploy" ||
      focusedEntry.label === "Hydrate" ||
      focusedEntry.label === "Template version" ||
      focusedEntry.label === "Readiness walkthrough" ||
      focusedEntry.label === "Staging status chips"
    ) {
      setSelectedId(INITIAL[0].id);
    }
  }, [focusedEntry]);

  const selected = rows.find((a) => a.id === selectedId) ?? rows[0];

  function patchSelected(patch: Partial<ActivationRow>) {
    setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)));
  }

  function onHydrate() {
    patchSelected({ staging: "enriching" });
    window.setTimeout(() => {
      setRows((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, staging: "hydrated" } : r)),
      );
      setWalkStep(0);
    }, 700);
  }

  const fieldLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    marginBottom: 4,
    display: "block",
  };
  const textInput: CSSProperties = {
    ...filterSelectStyle(t),
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  };

  return (
    <RegisterSurfaceMount
      label="Activation & forward-deploy"
      focused={focus.focused && focusedEntry?.label === "Activation & forward-deploy"}
      hovered={hoveredEntry?.label === "Activation & forward-deploy"}
      t={t}
    >
      {panelShell(
        t,
        "Activation & forward-deploy",
        statusChip(t, "house-global"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>In-flight activations</div>
            <div data-register-surface="In-flight activations">
              {rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id);
                    setWalkStep(0);
                  }}
                  style={navBtnStyle(t, row.id === selectedId)}
                >
                  <div style={{ fontWeight: 600 }}>{row.firm}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {stagingLabel(row.staging)} · {row.owner}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div style={{ fontSize: 12, color: t.textMuted, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span>
                Selected firm · <strong style={{ color: t.textPrimary }}>{selected.firm}</strong>
              </span>
              <span data-register-surface="Staging status chips">
                {statusChip(t, stagingLabel(selected.staging), stagingTone(selected.staging))}
              </span>
              <span style={{ fontSize: 11, color: t.textDim }}>No client PII · no consultant login yet</span>
            </div>

            {surfaceBlock(
              t,
              "Forward-deploy",
              focus.labelFocused("Forward-deploy") ||
                focus.labelFocused("Hydrate") ||
                focus.labelFocused("Template version"),
              focus.labelHovered("Forward-deploy") ||
                focus.labelHovered("Hydrate") ||
                focus.labelHovered("Template version"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Forward-deploy
                  </span>
                  {statusChip(t, stagingLabel(selected.staging), stagingTone(selected.staging))}
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Operator stages Prepared Workspace from a published Engagement template + public
                  firm facts. Click <strong style={{ color: t.textPrimary }}>Hydrate</strong> to
                  write staged state; backend enrich/scrape runs after Hydrate (view staging chips).
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label data-register-surface="Template version">
                    <span style={fieldLabel}>Template version</span>
                    <select
                      value={selected.templateVersion}
                      onChange={(e) => patchSelected({ templateVersion: e.target.value })}
                      style={{ ...filterSelectStyle(t), width: "100%", minWidth: 0 }}
                    >
                      {TEMPLATES.map((tpl) => (
                        <option key={tpl} value={tpl}>
                          {tpl}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={fieldLabel}>Public firm URL</span>
                    <input
                      value={selected.publicUrl}
                      onChange={(e) => patchSelected({ publicUrl: e.target.value })}
                      style={textInput}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Brand package</span>
                    <input
                      value={selected.brandPackage}
                      onChange={(e) => patchSelected({ brandPackage: e.target.value })}
                      style={textInput}
                    />
                  </label>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      data-register-surface="Hydrate"
                      onClick={onHydrate}
                      disabled={selected.staging === "enriching"}
                      style={primaryBtnStyle(t, selected.staging === "enriching")}
                    >
                      {selected.staging === "enriching" ? "Hydrating…" : "Hydrate"}
                    </button>
                    <span style={{ fontSize: 11, color: t.textDim }}>
                      Primary · stages Prepared Workspace (Activation state Progress reads it)
                    </span>
                  </div>
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Readiness walkthrough",
              focus.labelFocused("Readiness walkthrough"),
              focus.labelHovered("Readiness walkthrough"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Readiness walkthrough
                  </span>
                  {selected.staging !== "hydrated"
                    ? statusChip(t, "Needs hydrate", "amber")
                    : statusChip(t, `Step ${walkStep + 1}/${WALKTHROUGH.length}`, "accent")}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Prepared Workspace readiness proof — Next / Back. Agent presents; fulfillment stays
                  separate. Hard inputs are consultant commits (view chips below).
                </p>
                <ol
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    opacity: selected.staging === "hydrated" ? 1 : 0.55,
                  }}
                >
                  {WALKTHROUGH.map((step, i) => (
                    <li
                      key={step.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        background: t.bgPrimary,
                        border: `1px solid ${i === walkStep && selected.staging === "hydrated" ? t.accent : t.border}`,
                        borderRadius: 4,
                        padding: "9px 11px",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: i <= walkStep && selected.staging === "hydrated" ? t.accentBg : t.hoverBg,
                          color: i <= walkStep && selected.staging === "hydrated" ? t.accent : t.textDim,
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                          {step.detail}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    disabled={selected.staging !== "hydrated" || walkStep === 0}
                    onClick={() => setWalkStep((s) => Math.max(0, s - 1))}
                    style={secondaryBtnStyle(t)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={
                      selected.staging !== "hydrated" || walkStep >= WALKTHROUGH.length - 1
                    }
                    onClick={() => setWalkStep((s) => Math.min(WALKTHROUGH.length - 1, s + 1))}
                    style={primaryBtnStyle(
                      t,
                      selected.staging !== "hydrated" || walkStep >= WALKTHROUGH.length - 1,
                    )}
                  >
                    Next
                  </button>
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Hard-input status",
              focus.labelFocused("Hard-input status"),
              focus.labelHovered("Hard-input status"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Hard-input status
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  View only — Authorize book and Accept terms are consultant primary-button commits on
                  Prepared Workspace. Operator does not fake-complete these chips.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {statusChip(
                    t,
                    selected.authorizeBook === "complete" ? "Authorize book · complete" : "Authorize book · pending",
                    selected.authorizeBook === "complete" ? "success" : "amber",
                  )}
                  {statusChip(
                    t,
                    selected.acceptTerms === "complete" ? "Accept terms · complete" : "Accept terms · pending",
                    selected.acceptTerms === "complete" ? "success" : "amber",
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" style={secondaryBtnStyle(t)}>
                    Jump to Activation state
                  </button>
                  <button type="button" style={secondaryBtnStyle(t)}>
                    Jump to Commercial
                  </button>
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
