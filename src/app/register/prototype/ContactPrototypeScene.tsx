/**
 * Contact desk scene — firm-branded CEM + portal touchpoints (Step 4).
 * Surfaces match SURFACE-VOCAB engagement-contact labels exactly.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Calendar, Check, Mail, Shield } from "lucide-react";
import type { Tokens } from "../../components/tokens";
import {
  SURFACE_CATALOG,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import {
  RegisterSurfaceMount,
  navBtnStyle,
  sectionLabelStyle,
} from "./registerSurfaceChrome";

export type ContactPrototypeSceneProps = {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
  focusSeq?: number;
};

/** Exact vocab labels on the contact desk. */
const CONTACT_SURFACES = [
  "Opt-in message",
  "Consent request",
  "Nudge message",
  "Nudge form",
  "Silence / Opt out",
  "Meeting invitation",
  "Booking",
  "Loop-closer form",
  "Update facts",
] as const;

type ContactSurface = (typeof CONTACT_SURFACES)[number];

const FIRM = {
  name: "Tower Immigration",
  short: "Tower",
  email: "hello@towerimmigration.ca",
  mailAddress: "120 King St W, Suite 800, Toronto ON M5H 1J9",
  phone: "+1 (416) 555-0142",
  initials: "TI",
  brand: "#1B4F72",
  brandSoft: "rgba(27, 79, 114, 0.12)",
};

const CONTACT = {
  name: "Sarah Jenkins",
  email: "sarah.j@example.com",
  first: "Sarah",
};

function isContactSurface(label: string | undefined): label is ContactSurface {
  return Boolean(label && (CONTACT_SURFACES as readonly string[]).includes(label));
}

function surfaceForFocus(entry: RegisterSurfaceEntry | null): ContactSurface {
  if (entry && isContactSurface(entry.label)) return entry.label;
  return "Opt-in message";
}

function primaryBtn(t: Tokens, extra?: CSSProperties): CSSProperties {
  return {
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    background: FIRM.brand,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...extra,
  };
}

function secondaryBtn(t: Tokens, extra?: CSSProperties): CSSProperties {
  return {
    padding: "10px 16px",
    border: `1px solid ${t.border}`,
    borderRadius: 6,
    background: t.bgPrimary,
    color: t.textPrimary,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    ...extra,
  };
}

function cemFooter(t: Tokens) {
  return (
    <div
      style={{
        marginTop: 18,
        paddingTop: 14,
        borderTop: "1px solid #e5e7eb",
        fontSize: 10,
        color: "#6b7280",
        lineHeight: 1.55,
      }}
    >
      <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
        {FIRM.name}
      </div>
      <div>{FIRM.mailAddress}</div>
      <div>
        {FIRM.email} · {FIRM.phone}
      </div>
      <div style={{ marginTop: 8 }}>
        You can unsubscribe at any time — reply STOP or use{" "}
        <span style={{ color: FIRM.brand, fontWeight: 600, textDecoration: "underline" }}>
          Silence / Opt out
        </span>
        . Mechanism remains valid for 60+ days.
      </div>
      <div style={{ marginTop: 6, color: "#9ca3af" }}>
        Sent on behalf of {FIRM.name}. Platform: Om Coda Tower.
      </div>
    </div>
  );
}

/** Firm-branded email / CEM chrome (Opt-in, Nudge, Meeting invitation). */
function cemShell({
  t,
  surface,
  subject,
  headline,
  body,
  cta,
  children,
}: {
  t: Tokens;
  surface: ContactSurface;
  subject: string;
  headline: string;
  body: string;
  cta: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-register-surface={surface}
      style={{
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
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{surface}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand }}>
          Firm CEM
        </span>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, background: t.hoverBg }}>
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            overflow: "hidden",
            background: t.bgPrimary,
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderBottom: `1px solid ${t.borderLight}`,
              background: t.bgSecondary,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: FIRM.brandSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={12} color={FIRM.brand} strokeWidth={2} />
            </div>
            <span style={{ flex: 1, fontSize: 11, color: t.textMuted }}>{FIRM.email}</span>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${t.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: t.bgPrimary,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: FIRM.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {FIRM.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{FIRM.name}</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{FIRM.email}</div>
            </div>
          </div>

          <div style={{ background: "#f8f8f8", color: "#1a1a1a", padding: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>{subject}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>
              To: {CONTACT.name} &lt;{CONTACT.email}&gt;
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{headline}</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, marginBottom: 16 }}>{body}</div>
            {children}
            <button type="button" style={primaryBtn(t, { width: "100%", background: FIRM.brand })}>
              {cta}
              <ArrowRight size={14} strokeWidth={2.25} />
            </button>
            {cemFooter(t)}
          </div>
        </div>
      </div>
    </div>
  );
}

function portalShell({
  t,
  surface,
  badge,
  children,
}: {
  t: Tokens;
  surface: ContactSurface;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-register-surface={surface}
      style={{
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
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{surface}</span>
        {badge ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: FIRM.brand,
              background: FIRM.brandSoft,
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            {badge}
          </span>
        ) : null}
      </header>

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: `linear-gradient(90deg, ${FIRM.brandSoft}, transparent)`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: FIRM.brand,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {FIRM.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{FIRM.name}</div>
          <div style={{ fontSize: 10, color: t.textMuted }}>Secure client portal · {CONTACT.name}</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>{children}</div>
    </div>
  );
}

function fieldBlock(
  t: Tokens,
  label: string,
  value: string,
  opts?: { placeholder?: boolean; hint?: string },
) {
  return (
    <div key={label} style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: t.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "9px 11px",
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: opts?.placeholder ? t.hoverBg : t.bgSecondary,
          fontSize: 13,
          color: opts?.placeholder ? t.textDim : t.textPrimary,
          minHeight: 36,
          display: "flex",
          alignItems: "center",
        }}
      >
        {value}
      </div>
      {opts?.hint ? (
        <div style={{ fontSize: 10, color: t.textDim, marginTop: 4 }}>{opts.hint}</div>
      ) : null}
    </div>
  );
}

function OptInMessage({ t }: { t: Tokens }) {
  return cemShell({
    t,
    surface: "Opt-in message",
    subject: `${CONTACT.first}, stay current on your Canadian pathway`,
    headline: "A quick yes before we collect anything deeper",
    body: `Hi ${CONTACT.first} — ${FIRM.name} would like to keep you informed about Express Entry / CEC timing relevant to your file, and invite you to share self-reportable updates when useful. This is not cold outreach: you are already in our private book.`,
    cta: "Open Consent request",
  });
}

function ConsentRequest({ t }: { t: Tokens }) {
  const [agreed, setAgreed] = useState(false);
  const [channels, setChannels] = useState({ email: true, sms: false });
  const [outcome, setOutcome] = useState<"idle" | "agreed" | "ignored">("idle");

  return portalShell({
    t,
    surface: "Consent request",
    badge: "CASL + PIPEDA",
    children: (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Shield size={16} color={FIRM.brand} strokeWidth={2} />
          <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary }}>Consent request</div>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: t.textMuted }}>
          Affirmative Agree only — unchecked by default. Silence is never treated as yes. Deeper forms
          (Nudge form / Update facts) stay closed until you Agree.
        </p>

        <section
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 12,
            background: t.bgSecondary,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand, marginBottom: 8 }}>
            CASL — commercial electronic messages
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: t.textPrimary }}>
            I consent to receive email and/or SMS from <strong>{FIRM.name}</strong> about pathway
            freshness, eligibility signals, and meeting invitations. Identification and a working
            unsubscribe appear on every message.
          </p>
        </section>

        <section
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 12,
            background: t.bgSecondary,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand, marginBottom: 8 }}>
            PIPEDA — self-reportable collection
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: t.textPrimary }}>
            I consent to {FIRM.name} collecting self-reportable immigration facts (language bands,
            work history flags, funds yes/no, EE status) to refresh eligibility advice. Document
            uploads and employer-directed asks are not collected here.
          </p>
        </section>

        <section
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
            background: t.bgSecondary,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.textDim, marginBottom: 8 }}>
            Channel scope
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: t.textPrimary, marginBottom: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={channels.email}
              onChange={(e) => setChannels((c) => ({ ...c, email: e.target.checked }))}
            />
            Email ({CONTACT.email})
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: t.textPrimary, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={(e) => setChannels((c) => ({ ...c, sms: e.target.checked }))}
            />
            SMS — explicit grant required before SMS CEMs
          </label>
        </section>

        <div
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
            background: t.hoverBg,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textDim, marginBottom: 6 }}>Sender identity</div>
          <div style={{ fontSize: 12, color: t.textPrimary, lineHeight: 1.5 }}>
            {FIRM.name}
            <br />
            {FIRM.mailAddress}
            <br />
            {FIRM.email} · {FIRM.phone}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
            Withdraw anytime via Silence / Opt out (honored immediately, ≤10 business days).
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${agreed ? FIRM.brand : t.border}`,
            background: agreed ? FIRM.brandSoft : t.bgPrimary,
            cursor: "pointer",
            marginBottom: 14,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (!e.target.checked) setOutcome("idle");
            }}
            style={{ marginTop: 2 }}
          />
          <span style={{ fontSize: 13, lineHeight: 1.45, color: t.textPrimary }}>
            <strong>I Agree</strong> — affirmative, unchecked by default. I understand purpose, firm
            sender identity, channel scope, and my right to withdraw.
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <button
            type="button"
            disabled={!agreed || (!channels.email && !channels.sms)}
            onClick={() => setOutcome("agreed")}
            style={primaryBtn(t, {
              opacity: agreed && (channels.email || channels.sms) ? 1 : 0.45,
              cursor: agreed && (channels.email || channels.sms) ? "pointer" : "not-allowed",
            })}
          >
            <Check size={14} strokeWidth={2.5} />
            Agree
          </button>
          <button
            type="button"
            onClick={() => {
              setAgreed(false);
              setOutcome("ignored");
            }}
            style={secondaryBtn(t)}
          >
            Ignore
          </button>
        </div>

        <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
          Ignore = no express consent and no deeper collection — never Agree. Firm policy may also
          silence automatic CEMs on Ignore; intentional withdrawal remains{" "}
          <span style={{ color: FIRM.brand, fontWeight: 600 }}>Silence / Opt out</span>.
        </div>

        {outcome !== "idle" ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 6,
              border: `1px solid ${outcome === "agreed" ? t.success : t.border}`,
              background: outcome === "agreed" ? `${t.success}14` : t.hoverBg,
              fontSize: 12,
              color: t.textPrimary,
            }}
          >
            {outcome === "agreed"
              ? "Express consent recorded. Nudge form / Update facts may open under this Agree."
              : "Ignored — no express consent. Deeper collection stays closed."}
          </div>
        ) : null}
      </div>
    ),
  });
}

function NudgeMessage({ t }: { t: Tokens }) {
  return cemShell({
    t,
    surface: "Nudge message",
    subject: "Two quick answers keep your file current",
    headline: "Nothing reactivation-worthy — one consolidated ask",
    body: `Hi ${CONTACT.first} — ${FIRM.name} needs a few self-reportable updates (language test window and EE pool status) before your next eligibility refresh. One form. No document uploads.`,
    cta: "Open Nudge form",
  });
}

function NudgeForm({ t }: { t: Tokens }) {
  return portalShell({
    t,
    surface: "Nudge form",
    badge: "Self-reportable only",
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Refresh your facts
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Consolidated outstanding self-reportable needs. Document-dependent asks never appear here.
        </p>
        {fieldBlock(t, "EE profile exists", "Yes", { hint: "Self-reportable" })}
        {fieldBlock(t, "Still in pool", "Yes")}
        {fieldBlock(t, "Approximate last EE update", "Jan 2026")}
        {fieldBlock(t, "Language test product", "IELTS General")}
        {fieldBlock(t, "CLB-equivalent band (lowest)", "CLB 9")}
        {fieldBlock(t, "Test date", "Mar 12, 2025")}
        {fieldBlock(t, "Settlement funds available (approx CAD)", "Yes · ~$15,000")}
        {fieldBlock(t, "Job offer / certificate exists", "No", {
          hint: "Employer particulars stay on the firm desk — not here",
        })}
        <button type="button" style={primaryBtn(t, { width: "100%", marginTop: 4 })}>
          Submit answers
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
        <div style={{ marginTop: 12, fontSize: 11, color: t.textDim, textAlign: "center" }}>
          Prefer to stop hearing from us?{" "}
          <span style={{ color: FIRM.brand, fontWeight: 600 }}>Silence / Opt out</span>
        </div>
      </div>
    ),
  });
}

function SilenceOptOut({ t }: { t: Tokens }) {
  const [silenced, setSilenced] = useState(false);
  return portalShell({
    t,
    surface: "Silence / Opt out",
    badge: "≤10 bd honor",
    children: (
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Silence / Opt out
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: t.textMuted }}>
          One no-cost step. Further automatic firm-branded CEMs stop immediately (never later than 10
          business days). SMS STOP is honored the same way.
        </p>
        <div
          style={{
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 14,
            background: t.bgSecondary,
            fontSize: 12,
            lineHeight: 1.55,
            color: t.textPrimary,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>What stops</div>
          Opt-in, nudge, and reactivation sequences under {FIRM.name}. You can re-consent later with a
          new affirmative Agree on Consent request.
        </div>
        <button
          type="button"
          onClick={() => setSilenced(true)}
          style={primaryBtn(t, {
            width: "100%",
            background: silenced ? t.success : t.red,
            marginBottom: 10,
          })}
        >
          {silenced ? "Silenced — outreach stopped" : "Confirm Silence / Opt out"}
        </button>
        <div style={{ fontSize: 11, color: t.textDim, textAlign: "center" }}>
          Or reply STOP to any SMS from {FIRM.name}
        </div>
      </div>
    ),
  });
}

function MeetingInvitation({ t }: { t: Tokens }) {
  return cemShell({
    t,
    surface: "Meeting invitation",
    subject: "You're invited — discovery with Tower Immigration",
    headline: "Eligibility warrants a conversation",
    body: `Hi ${CONTACT.first} — based on your current self-reportable facts, ${FIRM.name} would like to meet for a short discovery on Express Entry / CEC timing. Pick a slot that works; we'll already hold your current facts for the consultant.`,
    cta: "Open Booking",
    children: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
          marginBottom: 14,
          fontSize: 12,
          color: "#374151",
        }}
      >
        <Calendar size={14} color={FIRM.brand} strokeWidth={2} />
        30 min · Video · Consultant desk
      </div>
    ),
  });
}

function Booking({ t }: { t: Tokens }) {
  const [slot, setSlot] = useState<string | null>("Thu 2:00 PM");
  const slots = ["Thu 2:00 PM", "Fri 10:30 AM", "Mon 3:00 PM"];
  return portalShell({
    t,
    surface: "Booking",
    badge: "Slot picker",
    children: (
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>Booking</div>
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Choose a slot with {FIRM.name}. Confirm writes the meeting to the consultant Meetings module.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {slots.map((s) => {
            const active = slot === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 6,
                  border: `1px solid ${active ? FIRM.brand : t.border}`,
                  background: active ? FIRM.brandSoft : t.bgSecondary,
                  color: t.textPrimary,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
        {fieldBlock(t, "Consultant", "Sarah Chen · Tower Immigration")}
        {fieldBlock(t, "Purpose", "Discovery · Express Entry / CEC")}
        <button type="button" style={primaryBtn(t, { width: "100%" })}>
          Confirm booking
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: t.textDim, textAlign: "center" }}>
          After confirm, outstanding self-reportables open on Loop-closer form.
        </div>
      </div>
    ),
  });
}

function LoopCloserForm({ t }: { t: Tokens }) {
  return portalShell({
    t,
    surface: "Loop-closer form",
    badge: "Pre-meeting",
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Loop-closer form
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Outstanding self-reportables before you join — write-back so Live brief is current. No
          document-dependent fields.
        </p>
        {fieldBlock(t, "Work permit end date (approx)", "Sep 15, 2026")}
        {fieldBlock(t, "Hours/week (current role)", "40")}
        {fieldBlock(t, "TEER guess", "TEER 1")}
        {fieldBlock(t, "Student / self-employed flags", "Neither")}
        {fieldBlock(t, "Anything changed since last nudge?", "Permit renewal in progress", {
          placeholder: false,
        })}
        <button type="button" style={primaryBtn(t, { width: "100%" })}>
          Save for Live brief
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
      </div>
    ),
  });
}

function UpdateFacts({ t }: { t: Tokens }) {
  return portalShell({
    t,
    surface: "Update facts",
    badge: "Life change",
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Update facts
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Reply when your situation changes. Same self-reportable boundary as Nudge form — firm-branded
          path under {FIRM.name}.
        </p>
        {fieldBlock(t, "What changed", "New language test booked", { placeholder: false })}
        {fieldBlock(t, "Effective date", "Aug 2026")}
        {fieldBlock(t, "Updated CLB target", "CLB 10")}
        {fieldBlock(t, "Still want meeting invitations", "Yes")}
        <button type="button" style={primaryBtn(t, { width: "100%" })}>
          Submit update
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
      </div>
    ),
  });
}

function ActiveSurface({ t, surface }: { t: Tokens; surface: ContactSurface }) {
  switch (surface) {
    case "Opt-in message":
      return <OptInMessage t={t} />;
    case "Consent request":
      return <ConsentRequest t={t} />;
    case "Nudge message":
      return <NudgeMessage t={t} />;
    case "Nudge form":
      return <NudgeForm t={t} />;
    case "Silence / Opt out":
      return <SilenceOptOut t={t} />;
    case "Meeting invitation":
      return <MeetingInvitation t={t} />;
    case "Booking":
      return <Booking t={t} />;
    case "Loop-closer form":
      return <LoopCloserForm t={t} />;
    case "Update facts":
      return <UpdateFacts t={t} />;
    default:
      return null;
  }
}

export function ContactPrototypeScene({
  t,
  isDark: _isDark,
  focusedEntry,
  hoveredId,
  focusSeq = 0,
}: ContactPrototypeSceneProps) {
  const [surface, setSurface] = useState<ContactSurface>("Opt-in message");

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "contact") return;
    setSurface(surfaceForFocus(focusedEntry));
  }, [focusedEntry, focusSeq]);

  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  const focusedOnPortal =
    Boolean(focusedEntry) &&
    (focusedEntry!.module === "Client portal" || focusedEntry!.desk === "contact");
  const hoveredOnPortal =
    Boolean(hoveredEntry) &&
    (hoveredEntry!.module === "Client portal" || hoveredEntry!.desk === "contact");

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      <aside
        style={{
          width: 168,
          flexShrink: 0,
          borderRight: `1px solid ${t.border}`,
          background: t.bgSecondary,
          overflowY: "auto",
        }}
      >
        <div style={sectionLabelStyle(t)}>Client portal</div>
        {CONTACT_SURFACES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSurface(id)}
            style={navBtnStyle(t, surface === id)}
          >
            {id}
          </button>
        ))}
      </aside>

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <RegisterSurfaceMount
          label="Client portal"
          focused={focusedOnPortal && focusedEntry?.label === "Client portal"}
          hovered={hoveredOnPortal && hoveredEntry?.label === "Client portal"}
          t={t}
        >
          <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
            <ActiveSurface t={t} surface={surface} />
          </div>
        </RegisterSurfaceMount>
      </div>
    </div>
  );
}
