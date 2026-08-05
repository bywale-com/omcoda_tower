/**
 * Provision — New firm mint + same Login desk handoff (How leaves 1.1–1.2).
 */
import { useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const LOGIN_PATH = "https://tower.omcoda.com/login?tenancy=assisted";

export function ProvisionModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Provision", focusedEntry, hoveredEntry);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("consultant-owner");
  const [provisioned, setProvisioned] = useState<string | null>(null);
  const [handoffNote, setHandoffNote] = useState<string | null>(null);

  const fieldStyle = {
    width: "100%",
    fontSize: 12,
    fontFamily: "inherit" as const,
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    background: t.bgPrimary,
    color: t.textPrimary,
    boxSizing: "border-box" as const,
  };

  const canProvision = name.trim() && website.trim() && email.trim();

  const onProvision = () => {
    setProvisioned(`${name.trim()} · ${email.trim()} · ${role}`);
    setHandoffNote(null);
  };

  return (
    <RegisterSurfaceMount
      label="Provision"
      focused={focus.focused && focusedEntry?.label === "Provision"}
      hovered={hoveredEntry?.label === "Provision"}
      t={t}
    >
      {panelShell(
        t,
        "Provision",
        statusChip(t, "per-tenancy"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          {surfaceBlock(
            t,
            "New firm",
            focus.labelFocused("New firm") ||
              focusedEntry?.label === "Provision" ||
              focus.labelFocused("Provision"),
            focus.labelHovered("New firm"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                New firm
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Assisted / OLG door — intentional mint into the same application lattice as ALG.
                Tenancy + user seed state is read by Login OTP.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Firm name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harbor RCIC Desk"
                    style={fieldStyle}
                  />
                </label>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Website</div>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="harborrcic.ca"
                    style={fieldStyle}
                  />
                </label>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                    Primary user email
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="consultant@harborrcic.ca"
                    type="email"
                    style={fieldStyle}
                  />
                </label>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Role seed</div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={fieldStyle}
                  >
                    <option value="consultant-owner">Consultant owner</option>
                    <option value="consultant-staff">Consultant staff</option>
                    <option value="firm-admin">Firm admin</option>
                  </select>
                </label>
                <button
                  type="button"
                  data-register-surface="Provision"
                  style={primaryBtnStyle(t, !canProvision)}
                  disabled={!canProvision}
                  onClick={onProvision}
                >
                  Provision
                </button>
              </div>
            </>,
          )}

          {provisioned
            ? surfaceBlock(
                t,
                "Provision complete",
                focus.labelFocused("Provision complete") ||
                  focus.labelFocused("Copy Login path / Send invite"),
                focus.labelHovered("Provision complete"),
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                      Provision complete
                    </span>
                    {statusChip(t, "minted", "success")}
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                    {provisioned}. Hand the consultant the same Login OTP path — no separate assisted
                    app. Lands on Board after verify.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      data-register-surface="Copy Login path / Send invite"
                      style={secondaryBtnStyle(t)}
                      onClick={() =>
                        setHandoffNote(`Copied · ${LOGIN_PATH}`)
                      }
                    >
                      Copy Login path
                    </button>
                    <button
                      type="button"
                      style={secondaryBtnStyle(t)}
                      onClick={() =>
                        setHandoffNote(`Invite sent to ${email.trim()} · OTP path attached`)
                      }
                    >
                      Send invite
                    </button>
                    {handoffNote ? (
                      <span style={{ fontSize: 11, color: t.accent }}>{handoffNote}</span>
                    ) : null}
                  </div>
                </>,
              )
            : null}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
