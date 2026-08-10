/**
 * Provision — New firm mint + same Login desk handoff (How leaves 1.1–1.2).
 * Plant face — wires POST /machine/provision + otpStore.issue like Ant.
 */
import { useState } from "react";
import { wirePorts } from "../../../wire";
import { appendOperatorAudit } from "./operatorWireHelpers";
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
import { useOperatorNav } from "../operatorNav";

export function ProvisionModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const { jumpTo } = useOperatorNav();
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Provision", focusedEntry, hoveredEntry);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("consultant-owner");
  const [busy, setBusy] = useState(false);
  const [provisioned, setProvisioned] = useState<{
    firmId: string;
    firmName: string;
    email: string;
    loginPath: string;
    authUser: boolean;
  } | null>(null);
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

  const canProvision = Boolean(name.trim() && website.trim() && email.trim() && !busy);

  const onProvision = async () => {
    setBusy(true);
    setHandoffNote(null);
    try {
      const result = await wirePorts.machineApi.provisionFirm({
        firmName: name.trim(),
        email: email.trim(),
        website: website.trim(),
        role,
      });
      setProvisioned({
        firmId: result.firmId,
        firmName: result.firmName,
        email: result.email,
        loginPath: result.loginPath,
        authUser: result.authUser,
      });
      const { setActiveFirmId } = await import("../../../wire/sessionFirm");
      setActiveFirmId(result.firmId);
      void appendOperatorAudit({
        actorId: "ops.system",
        kind: "provision",
        subjectType: "firm",
        subjectId: result.firmId,
        action: `Provision · ${result.firmName} minted`,
        kindLabel: "Provision",
        before: "—",
        after: "Tenancy + consultant-owner seed",
        surface: "Provision",
        firmName: result.firmName,
      });
    } catch (err) {
      setHandoffNote(`Provision failed: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const copyLoginPath = async () => {
    if (!provisioned) return;
    const path = `${typeof window !== "undefined" ? window.location.origin : ""}${provisioned.loginPath}`;
    try {
      await navigator.clipboard.writeText(path);
      setHandoffNote(`Copied · ${path}`);
    } catch {
      setHandoffNote(`Login path · ${path}`);
    }
  };

  const sendInvite = async () => {
    if (!provisioned) return;
    try {
      const issued = await wirePorts.otpStore.issue({ email: provisioned.email });
      const path = `${typeof window !== "undefined" ? window.location.origin : ""}${provisioned.loginPath}`;
      setHandoffNote(
        `Invite simulated · OTP for ${provisioned.email}` +
          (issued.debugCode ? ` · code ${issued.debugCode}` : "") +
          ` · ${path}`,
      );
    } catch (err) {
      setHandoffNote(`Invite · ${provisioned.loginPath} · ${String(err)}`);
    }
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
                  onClick={() => void onProvision()}
                >
                  {busy ? "Provisioning…" : "Provision"}
                </button>
                {handoffNote && !provisioned ? (
                  <span style={{ fontSize: 11, color: t.accent }}>{handoffNote}</span>
                ) : null}
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
                    {provisioned.firmName} · {provisioned.email} · {role} ·{" "}
                    <code>{provisioned.firmId}</code>
                    {provisioned.authUser ? " · auth ready" : " · ct_firms"}. Hand the consultant the same
                    Login OTP path — no separate assisted app. Lands on Board after verify.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      data-register-surface="Copy Login path / Send invite"
                      style={secondaryBtnStyle(t)}
                      onClick={() => void copyLoginPath()}
                    >
                      Copy Login path
                    </button>
                    <button type="button" style={secondaryBtnStyle(t)} onClick={() => void sendInvite()}>
                      Send invite
                    </button>
                    {handoffNote ? (
                      <span style={{ fontSize: 11, color: t.accent }}>{handoffNote}</span>
                    ) : null}
                  </div>

                  <div
                    data-register-surface="Activation Progress glance"
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${t.border}`,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                      Activation state Progress
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {statusChip(t, "forward-deployed · pending", "amber")}
                      {statusChip(t, "authorize-book · pending", "muted")}
                      {statusChip(t, "escrow-held · pending", "muted")}
                      {statusChip(t, "0% · staging required", "amber")}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        style={secondaryBtnStyle(t)}
                        onClick={() =>
                          { const n = `Jump to Activation state · ${provisioned.firmName}`; jumpTo(n); setHandoffNote(n); }
                        }
                      >
                        Jump to Activation state
                      </button>
                      <button
                        type="button"
                        style={secondaryBtnStyle(t)}
                        onClick={() => { const n = `Jump to Commercial · ${provisioned.firmName}`; jumpTo(n); setHandoffNote(n); }}
                      >
                        Jump to Commercial
                      </button>
                    </div>
                  </div>
                </>,
              )
            : null}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
