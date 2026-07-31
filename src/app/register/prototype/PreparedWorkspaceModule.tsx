/**
 * Prepared Workspace — activation Module (consultant acts).
 * Readiness chrome + Authorize book / Accept terms modals (Step 3).
 */
import { useEffect, useState, type ReactNode } from "react";
import type { Tokens } from "../../components/tokens";

type PreparedWorkspaceModuleProps = {
  t: Tokens;
  focusLabel?: string | null;
  focusSeq?: number;
};

type ModalKind = "authorize" | "accept" | null;

function ModalShell({
  t,
  title,
  surfaceLabel,
  onClose,
  children,
  footer,
}: {
  t: Tokens;
  title: string;
  surfaceLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 18, 28, 0.45)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        data-register-surface={surfaceLabel}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          background: t.bgPrimary,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <header
          style={{
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 16px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: t.textMuted,
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              padding: 4,
              fontFamily: "inherit",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>{children}</div>
        <footer
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 16px",
            borderTop: `1px solid ${t.border}`,
            background: t.bgSecondary,
          }}
        >
          {footer}
        </footer>
      </div>
    </div>
  );
}

function primaryBtn(t: Tokens) {
  return {
    padding: "7px 14px",
    border: "none",
    borderRadius: 5,
    background: t.accent,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600 as const,
    fontFamily: "inherit" as const,
    cursor: "pointer" as const,
  };
}

function secondaryBtn(t: Tokens) {
  return {
    padding: "7px 14px",
    border: `1px solid ${t.border}`,
    borderRadius: 5,
    background: t.bgPrimary,
    color: t.textPrimary,
    fontSize: 12,
    fontWeight: 500 as const,
    fontFamily: "inherit" as const,
    cursor: "pointer" as const,
  };
}

function ghostActionBtn(t: Tokens, emphasis?: boolean) {
  return {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "flex-start" as const,
    gap: 4,
    width: "100%",
    textAlign: "left" as const,
    padding: "14px 16px",
    border: `1px solid ${emphasis ? t.accent : t.border}`,
    borderRadius: 6,
    background: emphasis ? t.accentBg : t.bgSecondary,
    cursor: "pointer" as const,
    fontFamily: "inherit" as const,
  };
}

export function PreparedWorkspaceModule({
  t,
  focusLabel = null,
  focusSeq = 0,
}: PreparedWorkspaceModuleProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [bookAuthorized, setBookAuthorized] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [escrowChecked, setEscrowChecked] = useState(false);

  useEffect(() => {
    if (!focusLabel) return;
    if (focusLabel === "Authorize book") {
      setModal("authorize");
      return;
    }
    if (
      focusLabel === "Accept terms" ||
      focusLabel === "License acknowledgement" ||
      focusLabel === "Escrow terms"
    ) {
      setModal("accept");
    }
  }, [focusLabel, focusSeq]);

  const rows = [
    { label: "Firm identity staged", state: "Ready", ready: true },
    { label: "Campaign under firm brand", state: "Ready", ready: true },
    { label: "Readiness walkthrough", state: "Presented", ready: true },
    {
      label: "Authorize book",
      state: bookAuthorized ? "Landed" : "Pending",
      ready: bookAuthorized,
    },
    {
      label: "Accept terms",
      state: termsAccepted ? "Landed" : "Pending",
      ready: termsAccepted,
    },
  ];

  return (
    <div
      data-register-surface="Prepared Workspace"
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.01em" }}>
          Prepared Workspace
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: bookAuthorized && termsAccepted ? t.accent : t.amber,
            background: bookAuthorized && termsAccepted ? t.accentBg : t.amberBg,
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          {bookAuthorized && termsAccepted ? "Hard inputs landed" : "Activation readiness"}
        </span>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: t.textMuted, maxWidth: 480 }}>
          Staged campaign under your firm identity. Readiness theater only — Contacts stay empty of
          private book until Authorize book lands. Constructing secondary copy is fine; chrome is live.
        </p>

        <div
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 14px",
                borderTop: i === 0 ? "none" : `1px solid ${t.borderLight}`,
                background: t.bgPrimary,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>{row.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: row.ready ? t.accent : t.textDim,
                }}
              >
                {row.state}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            data-register-surface="Authorize book"
            onClick={() => setModal("authorize")}
            style={ghostActionBtn(t, !bookAuthorized)}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Authorize book</span>
            <span style={{ fontSize: 11, color: t.textMuted }}>
              Grant the private book Tower will mutate — file export, assisted confirm, or live CRM.
            </span>
          </button>

          <button
            type="button"
            data-register-surface="Accept terms"
            onClick={() => setModal("accept")}
            style={ghostActionBtn(t, !termsAccepted)}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Accept terms</span>
            <span style={{ fontSize: 11, color: t.textMuted }}>
              License acknowledgement and escrow / contingent cost — the money-and-license door.
            </span>
          </button>
        </div>
      </div>

      {modal === "authorize" ? (
        <ModalShell
          t={t}
          title="Authorize book"
          surfaceLabel="Authorize book"
          onClose={() => setModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setModal(null)} style={secondaryBtn(t)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookAuthorized(true);
                  setModal(null);
                }}
                style={primaryBtn(t)}
              >
                Authorize this book
              </button>
            </>
          }
        >
          <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.55, color: t.textPrimary }}>
            Choose the Connection stack your firm can authorize today. File-export and live CRM are
            first-class — neither is labeled temporary.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["File export (authorized snapshot)", "Assisted confirm (imported book)", "Live CRM (scoped pull)"].map(
              (opt) => (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    border: `1px solid ${t.border}`,
                    borderRadius: 5,
                    fontSize: 12,
                    color: t.textPrimary,
                    cursor: "pointer",
                    background: t.bgSecondary,
                  }}
                >
                  <input type="radio" name="connection-stack" defaultChecked={opt.startsWith("File")} />
                  {opt}
                </label>
              ),
            )}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.45, color: t.textDim }}>
            Completing Authorize book grants processing permission only — it does not mint per-contact
            CEM consent.
          </p>
        </ModalShell>
      ) : null}

      {modal === "accept" ? (
        <ModalShell
          t={t}
          title="Accept terms"
          surfaceLabel="Accept terms"
          onClose={() => setModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setModal(null)} style={secondaryBtn(t)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={!licenseChecked || !escrowChecked}
                onClick={() => {
                  setTermsAccepted(true);
                  setModal(null);
                }}
                style={{
                  ...primaryBtn(t),
                  opacity: licenseChecked && escrowChecked ? 1 : 0.45,
                  cursor: licenseChecked && escrowChecked ? "pointer" : "not-allowed",
                }}
              >
                Accept terms
              </button>
            </>
          }
        >
          <div
            data-register-surface="License acknowledgement"
            style={{
              marginBottom: 12,
              padding: 12,
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgSecondary,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
              License acknowledgement
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
              Firm-branded outreach will run continuously while armed/active. The licensee remains
              responsible for refusing illegal or unethical motion. House-authored packs do not
              transfer College duties. Halt outreach stays available without reconfiguring packs.
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 12,
                color: t.textPrimary,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={licenseChecked}
                onChange={(e) => setLicenseChecked(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              I acknowledge outreach runs under my license.
            </label>
          </div>

          <div
            data-register-surface="Escrow terms"
            style={{
              padding: 12,
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgSecondary,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
              Escrow terms
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
              Contingent cost and release terms for this firm↔Om Coda escrow. Acceptance is the
              money door — not a later settings screen.
            </p>
            <div
              style={{
                fontSize: 11,
                color: t.textDim,
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 4,
                background: t.hoverBg,
                border: `1px solid ${t.borderLight}`,
              }}
            >
              Demo terms · release on meeting-booked outcomes · house Commercial mirror
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 12,
                color: t.textPrimary,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={escrowChecked}
                onChange={(e) => setEscrowChecked(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              I accept escrow / contingent cost terms.
            </label>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
