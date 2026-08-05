/**
 * Prepared Workspace — activation Module (consultant acts).
 * Leaves 2a.1 Authorize book + 2a.2 Accept terms hard inputs.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import {
  LeafSurface,
  primaryControlStyle,
  secondaryControlStyle,
} from "./registerSurfaceChrome";

type PreparedWorkspaceModuleProps = {
  t: Tokens;
  focusLabel?: string | null;
  focusSeq?: number;
  forceAcceptOpen?: boolean;
  onHardInputChange?: (state: { bookAuthorized: boolean; termsAccepted: boolean; licensee: string }) => void;
};

type ModalKind = "authorize" | "accept" | null;
type ConnectPath = "crm" | "upload" | "file";

const LICENSEES = ["Sarah Chen · RCIC R123456", "Marco Reyes · RCIC R654321"];

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
  forceAcceptOpen = false,
  onHardInputChange,
}: PreparedWorkspaceModuleProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [bookAuthorized, setBookAuthorized] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [connectPath, setConnectPath] = useState<ConnectPath>("file");
  const [licenseExpanded, setLicenseExpanded] = useState(true);
  const [licensee, setLicensee] = useState(LICENSEES[0]);
  const [ackChecked, setAckChecked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    onHardInputChange?.({ bookAuthorized, termsAccepted, licensee });
  }, [bookAuthorized, termsAccepted, licensee, onHardInputChange]);

  useEffect(() => {
    if (forceAcceptOpen) setModal("accept");
  }, [forceAcceptOpen, focusSeq]);

  useEffect(() => {
    if (!focusLabel) return;
    if (focusLabel === "Authorize book" || focusLabel === "Authorize") {
      setModal("authorize");
      return;
    }
    if (
      focusLabel === "Accept terms" ||
      focusLabel === "Accept" ||
      focusLabel === "License acknowledgement" ||
      focusLabel === "Escrow terms"
    ) {
      setModal("accept");
      if (focusLabel === "License acknowledgement") setLicenseExpanded(true);
    }
  }, [focusLabel, focusSeq]);

  const rows = [
    { label: "Firm identity staged", state: "Ready", ready: true, clickable: false as const },
    { label: "Campaign under firm brand", state: "Ready", ready: true, clickable: false as const },
    { label: "Readiness walkthrough", state: "Presented", ready: true, clickable: false as const },
    {
      label: "Authorize book",
      state: bookAuthorized ? "Landed ✓" : "Pending",
      ready: bookAuthorized,
      clickable: "authorize" as const,
    },
    {
      label: "Accept terms",
      state: termsAccepted ? "Landed ✓" : "Pending",
      ready: termsAccepted,
      clickable: "accept" as const,
    },
  ];

  function downloadTerms() {
    const body = [
      `Licensee: ${licensee}`,
      "License acknowledgement — outreach under this licensee.",
      "Escrow terms — meeting-booked contingent release.",
    ].join("\n");
    void navigator.clipboard?.writeText(body).catch(() => undefined);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1600);
  }

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
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
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
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12,
            lineHeight: 1.5,
            color: t.textMuted,
            maxWidth: 480,
          }}
        >
          Staged campaign under your firm identity. Complete Authorize book and Accept terms — hard
          inputs Activation state and Commercial read.
        </p>

        <div
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {rows.map((row, i) => {
            const interactive = Boolean(row.clickable);
            const Tag = interactive ? "button" : "div";
            return (
              <Tag
                key={row.label}
                {...(interactive
                  ? {
                      type: "button" as const,
                      onClick: () => setModal(row.clickable),
                    }
                  : {})}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  borderTop: i === 0 ? "none" : `1px solid ${t.borderLight}`,
                  background: t.bgPrimary,
                  cursor: interactive ? "pointer" : "default",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      border: `1px solid ${row.ready ? t.accent : t.border}`,
                      background: row.ready ? t.accentBg : t.bgSecondary,
                      color: row.ready ? t.accent : t.textDim,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {row.ready ? "✓" : ""}
                  </span>
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: row.ready ? t.accent : t.textDim,
                  }}
                >
                  {row.state}
                </span>
              </Tag>
            );
          })}
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
              Grant CRM, upload, or confirm assisted import — then Authorize.
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
              License acknowledgement + escrow view — Accept commits instrument held.
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
              <button type="button" onClick={() => setModal(null)} style={secondaryControlStyle(t)}>
                Cancel
              </button>
              <LeafSurface
                label="Authorize"
                focused={focusLabel === "Authorize"}
                hovered={false}
                t={t}
              >
                <button
                  type="button"
                  onClick={() => {
                    setBookAuthorized(true);
                    setModal(null);
                  }}
                  style={primaryControlStyle(t)}
                >
                  Authorize
                </button>
              </LeafSurface>
            </>
          }
        >
          <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.55, color: t.textPrimary }}>
            Connect the private book Tower will mutate. Pick a path, then Authorize writes handover
            state for Book readiness and Activation state.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "crm" as ConnectPath, label: "Connect CRM / grant database access" },
              { id: "upload" as ConnectPath, label: "Upload / confirm assisted import" },
              { id: "file" as ConnectPath, label: "File export (authorized snapshot)" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setConnectPath(opt.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  border: `1px solid ${connectPath === opt.id ? t.accent : t.border}`,
                  borderRadius: 5,
                  fontSize: 12,
                  color: t.textPrimary,
                  cursor: "pointer",
                  background: connectPath === opt.id ? t.accentBg : t.bgSecondary,
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.45, color: t.textDim }}>
            Assisted path: Contacts → Imports → Confirm book for Tower sets the same handover without
            sequences.
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
              <button type="button" onClick={downloadTerms} style={secondaryControlStyle(t)}>
                {downloaded ? "Copied" : "Download terms"}
              </button>
              <button type="button" onClick={() => setModal(null)} style={secondaryControlStyle(t)}>
                Cancel
              </button>
              <LeafSurface label="Accept" focused={focusLabel === "Accept"} hovered={false} t={t}>
                <button
                  type="button"
                  disabled={!ackChecked}
                  onClick={() => {
                    setTermsAccepted(true);
                    setModal(null);
                  }}
                  style={primaryControlStyle(t, !ackChecked)}
                >
                  Accept
                </button>
              </LeafSurface>
            </>
          }
        >
          <LeafSurface
            label="License acknowledgement"
            focused={focusLabel === "License acknowledgement"}
            hovered={false}
            t={t}
            style={{ marginBottom: 12 }}
          >
            <button
              type="button"
              onClick={() => setLicenseExpanded((e) => !e)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                background: t.bgSecondary,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 600,
                color: t.textPrimary,
              }}
            >
              License acknowledgement
              <span style={{ fontSize: 10, color: t.textMuted }}>{licenseExpanded ? "▾" : "▸"}</span>
            </button>
            {licenseExpanded ? (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  border: `1px solid ${t.border}`,
                  borderRadius: 6,
                  background: t.bgPrimary,
                }}
              >
                <label
                  htmlFor="licensee-select"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: t.textDim,
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Authorizing licensee
                </label>
                <select
                  id="licensee-select"
                  value={licensee}
                  onChange={(e) => setLicensee(e.target.value)}
                  style={{
                    width: "100%",
                    fontSize: 12,
                    fontFamily: "inherit",
                    padding: "7px 8px",
                    borderRadius: 4,
                    border: `1px solid ${t.border}`,
                    background: t.bgSecondary,
                    color: t.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  {LICENSEES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.55, color: t.textMuted }}>
                  Firm-branded outreach runs under this licensee. Halt outreach stays available without
                  reconfiguring packs.
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
                    checked={ackChecked}
                    onChange={(e) => setAckChecked(e.target.checked)}
                    style={{ marginTop: 2 }}
                  />
                  I acknowledge outreach runs under my license and escrow terms below.
                </label>
              </div>
            ) : null}
          </LeafSurface>

          <LeafSurface
            label="Escrow terms"
            focused={focusLabel === "Escrow terms"}
            hovered={false}
            t={t}
          >
            <div
              style={{
                padding: 12,
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                background: t.bgSecondary,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.textPrimary,
                  marginBottom: 8,
                }}
              >
                Escrow terms
              </div>
              {[
                { k: "Instrument", v: "Meeting-booked contingent release" },
                { k: "Held by", v: "Om Coda Commercial (operator)" },
                { k: "Release predicate", v: "Attributed booking + attendance window" },
                { k: "Dispute path", v: "House-overseen return / forfeit" },
              ].map((row) => (
                <div
                  key={row.k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "6px 0",
                    borderTop: `1px solid ${t.borderLight}`,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: t.textDim }}>{row.k}</span>
                  <span style={{ color: t.textPrimary, fontWeight: 500, textAlign: "right" }}>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </LeafSurface>
        </ModalShell>
      ) : null}
    </div>
  );
}
