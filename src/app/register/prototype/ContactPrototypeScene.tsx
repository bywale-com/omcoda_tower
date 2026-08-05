/**
 * Contact desk scene — firm-branded CEM + portal touchpoints (Step 4).
 * Surfaces match SURFACE-VOCAB engagement-contact labels exactly.
 * Plants contact-furnish-01…20 supporting affordances (non-Core chrome).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Calendar, Check, Mail, Shield, User } from "lucide-react";
import type { Tokens } from "../../components/tokens";
import {
  SURFACE_CATALOG,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import {
  LeafSurface,
  RegisterSurfaceMount,
  navBtnStyle,
  primaryControlStyle,
  secondaryControlStyle,
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
  "Link state",
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

const CONSULTANT = {
  name: "Sarah Chen",
  role: "RCIC · Consultant",
  firm: "Tower Immigration",
};

const CONTACT = {
  name: "Sarah Jenkins",
  email: "sarah.j@example.com",
  first: "Sarah",
};

type ChannelScope = "email" | "sms" | "multi";
type LinkStateKind = "Valid" | "Expired" | "Already used" | "Wrong purpose";
type CemChannel = "email" | "sms";

function isContactSurface(label: string | undefined): label is ContactSurface {
  return Boolean(label && (CONTACT_SURFACES as readonly string[]).includes(label));
}

function surfaceForFocus(entry: RegisterSurfaceEntry | null): ContactSurface {
  if (entry && isContactSurface(entry.label)) return entry.label;
  const map: Record<string, ContactSurface> = {
    "Consent link / Review request": "Opt-in message",
    "Book a time": "Meeting invitation",
    Agree: "Consent request",
    "Ignore / dismiss": "Consent request",
    "Channel scope": "Consent request",
    "After-Agree path": "Consent request",
    "Continue draft": "Nudge form",
    "Not me / Wrong person": "Consent request",
    "Consultant host": "Booking",
    "Confirm booking": "Booking",
    Reschedule: "Booking",
    "Cancel booking": "Booking",
    "Slot picker": "Booking",
    "Facts already on file": "Booking",
    "Silence confirmation": "Silence / Opt out",
    "Link state": "Link state",
    Submit: "Nudge form",
  };
  if (entry?.label && map[entry.label]) return map[entry.label];
  return "Opt-in message";
}

function primaryBtn(t: Tokens, extra?: CSSProperties): CSSProperties {
  return {
    ...primaryControlStyle(t),
    padding: "10px 16px",
    borderRadius: 6,
    background: FIRM.brand,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...extra,
  };
}

function secondaryBtn(t: Tokens, extra?: CSSProperties): CSSProperties {
  return {
    ...secondaryControlStyle(t),
    padding: "10px 16px",
    borderRadius: 6,
    ...extra,
  };
}

/** contact-furnish-17 — Client touchpoint purpose chip (never Authorize book). */
function PurposeChip({
  t,
  kind,
  focusLabel,
}: {
  t: Tokens;
  kind: "client" | "prepared";
  focusLabel: string | null;
}) {
  const label =
    kind === "client" ? "Client touchpoint purpose chip" : "Prepared workspace purpose chip";
  const text = kind === "client" ? "Client touchpoint" : "Prepared workspace";
  return (
    <LeafSurface label={label} focused={focusLabel === label} t={t} style={{ display: "inline-flex" }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: kind === "client" ? FIRM.brand : t.textMuted,
          background: kind === "client" ? FIRM.brandSoft : t.hoverBg,
          border: `1px solid ${kind === "client" ? FIRM.brand : t.border}`,
          padding: "3px 8px",
          borderRadius: 3,
        }}
      >
        {text}
      </span>
    </LeafSurface>
  );
}

/** contact-furnish-01 — Firm-on-whose-behalf + Om Coda send-platform chip. */
function OnWhoseBehalf({ t, focusLabel }: { t: Tokens; focusLabel: string | null }) {
  return (
    <LeafSurface
      label="On whose behalf"
      focused={focusLabel === "On whose behalf"}
      t={t}
      style={{ marginBottom: 12 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 7,
            background: FIRM.brand,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {FIRM.initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand }}>
            On whose behalf
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginTop: 2 }}>{FIRM.name}</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3, lineHeight: 1.45 }}>
            {FIRM.mailAddress}
            <br />
            {FIRM.email} · {FIRM.phone}
          </div>
          <div style={{ marginTop: 6 }}>
            <LeafSurface
              label="Send-platform disclosure"
              focused={focusLabel === "Send-platform disclosure"}
              t={t}
              style={{ display: "inline-flex" }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: t.textDim,
                  background: t.hoverBg,
                  border: `1px solid ${t.borderLight}`,
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                Sent via Om Coda
              </span>
            </LeafSurface>
          </div>
        </div>
      </div>
    </LeafSurface>
  );
}

/** contact-furnish-18 — SMS STOP instruction strip. */
function SmsStopStrip({ t, focusLabel }: { t: Tokens; focusLabel: string | null }) {
  return (
    <LeafSurface
      label="STOP / Unsubscribe instruction"
      focused={focusLabel === "STOP / Unsubscribe instruction"}
      t={t}
      style={{ marginBottom: 12 }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.hoverBg,
          fontSize: 12,
          lineHeight: 1.5,
          color: t.textPrimary,
        }}
      >
        <strong>SMS:</strong> Reply <strong>STOP</strong> or <strong>Unsubscribe</strong> to end
        automatic messages — same Silence ledger as in-page Silence / Opt out.
      </div>
    </LeafSurface>
  );
}

function cemFooter(
  t: Tokens,
  focusLabel: string | null,
  opts?: { channel?: CemChannel; onSilence?: () => void },
) {
  const channel = opts?.channel ?? "email";
  return (
    <div
      data-register-surface="Touchpoint footer"
      style={{
        marginTop: 18,
        paddingTop: 14,
        borderTop: "1px solid #e5e7eb",
        fontSize: 10,
        color: "#6b7280",
        lineHeight: 1.55,
      }}
    >
      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4, fontSize: 11 }}>{FIRM.name}</div>
      <div>{FIRM.mailAddress}</div>
      <div>
        {FIRM.email} · {FIRM.phone}
      </div>
      {channel === "sms" ? (
        <div style={{ marginTop: 8 }}>
          <LeafSurface
            label="STOP / Unsubscribe instruction"
            focused={focusLabel === "STOP / Unsubscribe instruction"}
            t={t}
          >
            <span>
              Reply <strong>STOP</strong> or <strong>Unsubscribe</strong> — same as Silence / Opt out.
            </span>
          </LeafSurface>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          You can unsubscribe at any time — reply STOP or use{" "}
          <LeafSurface label="Silence / Opt out" focused={focusLabel === "Silence / Opt out"} t={t}>
            <button
              type="button"
              onClick={opts?.onSilence}
              style={{
                border: "none",
                background: "transparent",
                color: FIRM.brand,
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 10,
                padding: 0,
              }}
            >
              Silence / Opt out
            </button>
          </LeafSurface>
          . Mechanism remains valid for 60+ days.
        </div>
      )}
      <div style={{ marginTop: 6, color: "#9ca3af" }}>
        On whose behalf: {FIRM.name}.{" "}
        <span style={{ fontSize: 9 }}>Platform: Om Coda</span>
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
  ctaSurface,
  focusLabel,
  channel = "email",
  onSilence,
  children,
}: {
  t: Tokens;
  surface: ContactSurface;
  subject: string;
  headline: string;
  body: string;
  cta: string;
  ctaSurface?: string;
  focusLabel: string | null;
  channel?: CemChannel;
  onSilence?: () => void;
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PurposeChip t={t} kind="client" focusLabel={focusLabel} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand }}>
            Firm CEM · {channel.toUpperCase()}
          </span>
        </div>
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

          <div style={{ background: "#f8f8f8", color: "#1a1a1a", padding: 18 }}>
            <OnWhoseBehalf t={t} focusLabel={focusLabel} />
            {channel === "sms" ? <SmsStopStrip t={t} focusLabel={focusLabel} /> : null}
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>{subject}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>
              To: {CONTACT.name} &lt;{CONTACT.email}&gt;
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{headline}</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, marginBottom: 16 }}>{body}</div>
            {children}
            <LeafSurface
              label={ctaSurface ?? surface}
              focused={focusLabel === ctaSurface || focusLabel === cta}
              t={t}
              style={{ display: "block", marginBottom: 0 }}
            >
              <button type="button" style={primaryBtn(t, { width: "100%", background: FIRM.brand })}>
                {cta}
                <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            </LeafSurface>
            {cemFooter(t, focusLabel, { channel, onSilence })}
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
  focusLabel,
  children,
  showPurpose = true,
}: {
  t: Tokens;
  surface: ContactSurface;
  badge?: string;
  focusLabel: string | null;
  children: ReactNode;
  showPurpose?: boolean;
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showPurpose ? <PurposeChip t={t} kind="client" focusLabel={focusLabel} /> : null}
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
        </div>
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary }}>{FIRM.name}</div>
          <div style={{ fontSize: 10, color: t.textMuted }}>
            Secure client portal · {CONTACT.name} · {FIRM.mailAddress}
          </div>
        </div>
        <LeafSurface
          label="Send-platform disclosure"
          focused={focusLabel === "Send-platform disclosure"}
          t={t}
        >
          <span style={{ fontSize: 9, color: t.textDim }}>via Om Coda</span>
        </LeafSurface>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>{children}</div>
    </div>
  );
}

function fieldBlock(
  t: Tokens,
  label: string,
  value: string,
  opts?: { placeholder?: boolean; hint?: string; readOnly?: boolean },
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
        {opts?.readOnly ? (
          <span style={{ marginLeft: 6, color: FIRM.brand, fontWeight: 700 }}>Already held</span>
        ) : null}
      </div>
      <div
        style={{
          padding: "9px 11px",
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: opts?.readOnly ? t.bgSecondary : opts?.placeholder ? t.hoverBg : t.bgPrimary,
          fontSize: 13,
          color: opts?.placeholder ? t.textDim : t.textPrimary,
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          opacity: opts?.readOnly ? 0.85 : 1,
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

/** contact-furnish-13 — Self-reportable-only legend. */
function SelfReportableLegend({ t, focusLabel }: { t: Tokens; focusLabel: string | null }) {
  return (
    <LeafSurface
      label="Self-reportable only legend"
      focused={focusLabel === "Self-reportable only legend"}
      t={t}
      style={{ marginBottom: 12 }}
    >
      <div
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          border: `1px dashed ${FIRM.brand}`,
          background: FIRM.brandSoft,
          fontSize: 11,
          lineHeight: 1.45,
          color: t.textPrimary,
        }}
      >
        <strong>Self-reportable only</strong> — text, dropdown, checkbox, and date fields. No document
        uploads (letters, bank proofs, certificates).
      </div>
    </LeafSurface>
  );
}

/** contact-furnish-03 + 19 — form footer Silence + outstanding progress. */
function FormChromeFooter({
  t,
  focusLabel,
  remaining,
  total,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  remaining: number;
  total: number;
  onSilence: () => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <LeafSurface
        label="Outstanding remaining"
        focused={focusLabel === "Outstanding remaining"}
        t={t}
        style={{ marginBottom: 10 }}
      >
        <div style={{ fontSize: 11, color: t.textMuted }}>
          Outstanding remaining:{" "}
          <strong style={{ color: t.textPrimary }}>
            {remaining} of {total}
          </strong>
        </div>
      </LeafSurface>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
        <LeafSurface label="Silence / Opt out" focused={focusLabel === "Silence / Opt out"} t={t}>
          <button type="button" onClick={onSilence} style={secondaryBtn(t, { color: t.red, borderColor: t.red })}>
            Silence / Opt out
          </button>
        </LeafSurface>
        <LeafSurface
          label="Not me / Wrong person"
          focused={focusLabel === "Not me / Wrong person"}
          t={t}
        >
          <button type="button" style={secondaryBtn(t)}>
            Not me / Wrong person
          </button>
        </LeafSurface>
      </div>
    </div>
  );
}

/** contact-furnish-04 — Resume draft banner. */
function ResumeDraftBanner({
  t,
  focusLabel,
  restored,
  onContinue,
}: {
  t: Tokens;
  focusLabel: string | null;
  restored: boolean;
  onContinue: () => void;
}) {
  return (
    <LeafSurface
      label="Continue draft"
      focused={focusLabel === "Continue draft"}
      t={t}
      style={{ marginBottom: 12 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${FIRM.brand}`,
          background: FIRM.brandSoft,
        }}
      >
        <div style={{ flex: 1, fontSize: 12, color: t.textPrimary, lineHeight: 1.4 }}>
          {restored
            ? "Draft restored — continue where you left off."
            : "You have an incomplete draft of this form."}
        </div>
        {!restored ? (
          <button type="button" onClick={onContinue} style={primaryBtn(t, { padding: "7px 12px" })}>
            Continue draft
          </button>
        ) : null}
      </div>
    </LeafSurface>
  );
}

/** contact-furnish-12 — Already-held strip. */
function AlreadyHeldStrip({ t, focusLabel, chips }: { t: Tokens; focusLabel: string | null; chips: string[] }) {
  return (
    <LeafSurface
      label="Already held"
      focused={focusLabel === "Already held"}
      t={t}
      style={{ marginBottom: 12 }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.textDim, marginBottom: 6 }}>
        Already held
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {chips.map((c) => (
          <span
            key={c}
            style={{
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 4,
              background: t.bgSecondary,
              border: `1px solid ${t.border}`,
              color: t.textPrimary,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </LeafSurface>
  );
}

function OptInMessage({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const [channel, setChannel] = useState<CemChannel>("email");
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "6px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
        {(["email", "sms"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            style={{
              ...secondaryBtn(t, {
                padding: "4px 10px",
                background: channel === c ? FIRM.brandSoft : t.bgPrimary,
                borderColor: channel === c ? FIRM.brand : t.border,
                color: channel === c ? FIRM.brand : t.textMuted,
              }),
            }}
          >
            Demo · {c.toUpperCase()}
          </button>
        ))}
      </div>
      {cemShell({
        t,
        surface: "Opt-in message",
        subject: `${CONTACT.first}, stay current on your Canadian pathway`,
        headline: "A quick yes before we collect anything deeper",
        body: `Hi ${CONTACT.first} — ${FIRM.name} would like to keep you informed about Express Entry / CEC timing relevant to your file, and invite you to share self-reportable updates when useful. This is not cold outreach: you are already in our private book.`,
        cta: "Review request",
        ctaSurface: "Consent link / Review request",
        focusLabel,
        channel,
        onSilence,
      })}
    </div>
  );
}

function ConsentRequest({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [scope, setScope] = useState<ChannelScope>("email");
  const [outcome, setOutcome] = useState<"idle" | "agreed" | "ignored" | "not-me">("idle");

  return portalShell({
    t,
    surface: "Consent request",
    badge: "CASL + PIPEDA",
    focusLabel,
    children: (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Shield size={16} color={FIRM.brand} strokeWidth={2} />
          <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary }}>Consent request</div>
        </div>
        <OnWhoseBehalf t={t} focusLabel={focusLabel} />

        {/* contact-furnish-09 — Split CEM / collection purpose panels */}
        <section
          data-register-surface="CASL CEM purpose"
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
          data-register-surface="PIPEDA collection purpose"
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

        {/* contact-furnish-02 — After-Agree path preview */}
        <LeafSurface
          label="After-Agree path"
          focused={focusLabel === "After-Agree path"}
          t={t}
          style={{ marginBottom: 12 }}
        >
          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 14,
              background: t.hoverBg,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand, marginBottom: 8 }}>
              After Agree — what happens next
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.55, color: t.textPrimary }}>
              <li>Deeper self-reportable forms (Nudge form / Update facts) may follow</li>
              <li>Later nudges stay under the channel scope you choose</li>
              <li>Silence / Opt out remains available anytime — including mid-form</li>
            </ul>
          </div>
        </LeafSurface>

        {/* contact-furnish-07 — Channel-scope segmented control */}
        <LeafSurface
          label="Channel scope"
          focused={focusLabel === "Channel scope"}
          t={t}
          style={{ marginBottom: 12 }}
        >
          <div
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 14,
              background: t.bgSecondary,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.textDim, marginBottom: 8 }}>
              Channel scope
            </div>
            <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: `1px solid ${t.border}` }}>
              {(
                [
                  { id: "email" as const, label: "Email" },
                  { id: "sms" as const, label: "SMS" },
                  { id: "multi" as const, label: "Email + SMS" },
                ] as const
              ).map((opt) => {
                const active = scope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScope(opt.id)}
                    style={{
                      flex: 1,
                      padding: "9px 8px",
                      border: "none",
                      background: active ? FIRM.brand : t.bgPrimary,
                      color: active ? "#fff" : t.textPrimary,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: t.textDim, marginTop: 8 }}>
              Email-only does not authorize SMS. Multi-channel is disclosed at Agree.
            </div>
          </div>
        </LeafSurface>

        {/* contact-furnish-08 — Ignore vs Silence clarify row */}
        <LeafSurface
          label="Ignore policy row"
          focused={focusLabel === "Ignore policy row"}
          t={t}
          style={{ marginBottom: 14 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <div
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: 12,
                background: t.bgPrimary,
                fontSize: 11,
                lineHeight: 1.45,
                color: t.textPrimary,
              }}
            >
              <strong>Ignore</strong> — not now. No express consent; deeper forms stay closed. Firm
              policy may also silence automatic CEMs.
            </div>
            <div
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: 12,
                background: t.bgPrimary,
                fontSize: 11,
                lineHeight: 1.45,
                color: t.textPrimary,
              }}
            >
              <strong>Silence / Opt out</strong> — stop forever (until a new affirmative Agree).
              Intentional withdrawal of automatic messages.
            </div>
          </div>
        </LeafSurface>

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
            <strong>I Agree</strong> — affirmative, unchecked by default. Includes{" "}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: FIRM.brandSoft,
                color: FIRM.brand,
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              CASL CEM
            </span>{" "}
            and{" "}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: FIRM.brandSoft,
                color: FIRM.brand,
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              PIPEDA collection
            </span>{" "}
            purpose chips, channel scope ({scope}), firm sender identity, and withdrawal right.
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <LeafSurface label="Agree" focused={focusLabel === "Agree"} t={t}>
            <button
              type="button"
              disabled={!agreed}
              onClick={() => setOutcome("agreed")}
              style={primaryBtn(t, {
                opacity: agreed ? 1 : 0.45,
                cursor: agreed ? "pointer" : "not-allowed",
              })}
            >
              <Check size={14} strokeWidth={2.5} />
              Agree
            </button>
          </LeafSurface>
          <LeafSurface label="Ignore / dismiss" focused={focusLabel === "Ignore / dismiss"} t={t}>
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
          </LeafSurface>
          <LeafSurface label="Silence / Opt out" focused={focusLabel === "Silence / Opt out"} t={t}>
            <button type="button" onClick={onSilence} style={secondaryBtn(t, { color: t.red, borderColor: t.red })}>
              Silence / Opt out
            </button>
          </LeafSurface>
          <LeafSurface
            label="Not me / Wrong person"
            focused={focusLabel === "Not me / Wrong person"}
            t={t}
          >
            <button type="button" onClick={() => setOutcome("not-me")} style={secondaryBtn(t)}>
              Not me / Wrong person
            </button>
          </LeafSurface>
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
              ? `Express consent recorded (${scope}). Nudge form / Update facts may open under this Agree.`
              : outcome === "ignored"
                ? "Ignored — no express consent. Deeper collection stays closed."
                : "Not me confirmed — deeper collection stopped for this send; no immigration facts written."}
          </div>
        ) : null}
      </div>
    ),
  });
}

function NudgeMessage({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const [channel, setChannel] = useState<CemChannel>("email");
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "6px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
        {(["email", "sms"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            style={{
              ...secondaryBtn(t, {
                padding: "4px 10px",
                background: channel === c ? FIRM.brandSoft : t.bgPrimary,
                borderColor: channel === c ? FIRM.brand : t.border,
                color: channel === c ? FIRM.brand : t.textMuted,
              }),
            }}
          >
            Demo · {c.toUpperCase()}
          </button>
        ))}
      </div>
      {cemShell({
        t,
        surface: "Nudge message",
        subject: "Two quick answers keep your file current",
        headline: "Nothing reactivation-worthy — one consolidated ask",
        body: `Hi ${CONTACT.first} — ${FIRM.name} needs a few self-reportable updates (language test window and EE pool status) before your next eligibility refresh. One form. No document uploads.`,
        cta: "Open Nudge form",
        focusLabel,
        channel,
        onSilence,
      })}
    </div>
  );
}

function NudgeForm({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const [draftRestored, setDraftRestored] = useState(false);
  const outstandingTotal = 4;
  const [filled, setFilled] = useState(1);
  const remaining = Math.max(0, outstandingTotal - filled);

  return portalShell({
    t,
    surface: "Nudge form",
    badge: "Self-reportable only",
    focusLabel,
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Refresh your facts
        </div>
        <SelfReportableLegend t={t} focusLabel={focusLabel} />
        <ResumeDraftBanner
          t={t}
          focusLabel={focusLabel}
          restored={draftRestored}
          onContinue={() => {
            setDraftRestored(true);
            setFilled(2);
          }}
        />
        <AlreadyHeldStrip
          t={t}
          focusLabel={focusLabel}
          chips={["EE profile: Yes", "Job offer: No", "Funds: Yes · ~$15,000"]}
        />
        <LeafSurface
          label="Outstanding"
          focused={focusLabel === "Outstanding"}
          t={t}
          style={{ marginBottom: 8 }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: FIRM.brand, marginBottom: 8 }}>
            Outstanding
          </div>
          <div data-register-surface="Self-reportable fields">
            {fieldBlock(t, "Still in pool", draftRestored ? "Yes" : "—", {
              placeholder: !draftRestored,
            })}
            {fieldBlock(t, "Approximate last EE update", draftRestored ? "Jan 2026" : "—", {
              placeholder: !draftRestored,
            })}
            {fieldBlock(t, "Language test product", "IELTS General")}
            {/* contact-furnish-06 — Language / dated-fact helper */}
            {fieldBlock(t, "Test date", "Mar 12, 2025", {
              hint: "Enter the day you took the test — not the expiry. Validity is usually test date + 2 years for EE profiles.",
            })}
            {fieldBlock(t, "Validity / still valid through", "Mar 12, 2027", {
              hint: "Optional: if you know the window is still open, enter the end of validity. Do not upload the certificate.",
            })}
            {fieldBlock(t, "CLB-equivalent band (lowest)", "CLB 9")}
          </div>
        </LeafSurface>
        <LeafSurface label="Submit" focused={focusLabel === "Submit"} t={t} style={{ marginTop: 4 }}>
          <button
            type="button"
            onClick={() => setFilled(outstandingTotal)}
            style={primaryBtn(t, { width: "100%" })}
          >
            Submit
            <ArrowRight size={14} strokeWidth={2.25} />
          </button>
        </LeafSurface>
        <FormChromeFooter
          t={t}
          focusLabel={focusLabel}
          remaining={remaining}
          total={outstandingTotal}
          onSilence={onSilence}
        />
      </div>
    ),
  });
}

function SilenceOptOut({
  t,
  focusLabel,
  silenced,
  setSilenced,
}: {
  t: Tokens;
  focusLabel: string | null;
  silenced: boolean;
  setSilenced: (v: boolean) => void;
}) {
  return portalShell({
    t,
    surface: "Silence / Opt out",
    badge: "≤10 bd honor",
    focusLabel,
    children: (
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Silence / Opt out
        </div>
        <OnWhoseBehalf t={t} focusLabel={focusLabel} />
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
        <SmsStopStrip t={t} focusLabel={focusLabel} />
        <LeafSurface label="Silence / Opt out" focused={focusLabel === "Silence / Opt out"} t={t}>
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
        </LeafSurface>

        {/* contact-furnish-14 — Silence confirmation receipt */}
        {silenced ? (
          <LeafSurface
            label="Silence confirmation"
            focused={focusLabel === "Silence confirmation"}
            t={t}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 8,
                border: `1px solid ${t.success}`,
                background: `${t.success}14`,
                fontSize: 13,
                lineHeight: 1.5,
                color: t.textPrimary,
              }}
            >
              <strong>Confirmed.</strong> Automatic messages from {FIRM.name} will stop. No further
              Agree is implied. SMS STOP / Unsubscribe writes this same silenced state.
            </div>
          </LeafSurface>
        ) : (
          <div style={{ fontSize: 11, color: t.textDim, textAlign: "center" }}>
            Or reply STOP to any SMS from {FIRM.name}
          </div>
        )}
      </div>
    ),
  });
}

function MeetingInvitation({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  return cemShell({
    t,
    surface: "Meeting invitation",
    subject: "You're invited — discovery with Tower Immigration",
    headline: "Eligibility warrants a conversation",
    body: `Hi ${CONTACT.first} — based on your current self-reportable facts, ${FIRM.name} would like to meet for a short discovery on Express Entry / CEC timing. Pick a slot that works; we'll already hold your current facts for the consultant.`,
    cta: "Book a time",
    ctaSurface: "Book a time",
    focusLabel,
    onSilence,
    children: (
      <>
        {/* contact-furnish-05 — Consultant host */}
        <LeafSurface
          label="Consultant host"
          focused={focusLabel === "Consultant host"}
          t={t}
          style={{ marginBottom: 10 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 12,
              color: "#374151",
            }}
          >
            <User size={14} color={FIRM.brand} strokeWidth={2} />
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>{CONSULTANT.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                {CONSULTANT.role} · {CONSULTANT.firm}
              </div>
            </div>
          </div>
        </LeafSurface>
        {/* contact-furnish-16 — Meeting purpose line */}
        <LeafSurface
          label="Meeting purpose"
          focused={focusLabel === "Meeting purpose"}
          t={t}
          style={{ marginBottom: 10 }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.45,
            }}
          >
            <strong>Why meet:</strong> Your EE / CEC timing now warrants a short discovery — not a
            sales pitch.
          </div>
        </LeafSurface>
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
      </>
    ),
  });
}

function Booking({ t, focusLabel }: { t: Tokens; focusLabel: string | null }) {
  const [slot, setSlot] = useState<string | null>("Thu 2:00 PM");
  const [confirmed, setConfirmed] = useState(false);
  const [factsOnFile, setFactsOnFile] = useState(true);
  const slots = ["Thu 2:00 PM", "Fri 10:30 AM", "Mon 3:00 PM"];

  return portalShell({
    t,
    surface: "Booking",
    badge: confirmed ? "Confirmed" : "Slot picker",
    focusLabel,
    children: (
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>Booking</div>

        {/* contact-furnish-05 — Consultant host above Slot picker */}
        <LeafSurface
          label="Consultant host"
          focused={focusLabel === "Consultant host"}
          t={t}
          style={{ marginBottom: 12 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: t.bgSecondary,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: FIRM.brand,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              SC
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>{CONSULTANT.name}</div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                {CONSULTANT.role} · {FIRM.name}
              </div>
            </div>
          </div>
        </LeafSurface>

        {/* contact-furnish-16 — Meeting purpose */}
        <LeafSurface
          label="Meeting purpose"
          focused={focusLabel === "Meeting purpose"}
          t={t}
          style={{ marginBottom: 12 }}
        >
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
            <strong style={{ color: t.textPrimary }}>Why meet:</strong> Discovery · Express Entry /
            CEC timing based on your current facts.
          </p>
        </LeafSurface>

        {/* contact-furnish-20 — Facts already on file */}
        {factsOnFile ? (
          <LeafSurface
            label="Facts already on file"
            focused={focusLabel === "Facts already on file"}
            t={t}
            style={{ marginBottom: 12 }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                background: `${t.success}14`,
                border: `1px solid ${t.success}`,
                fontSize: 12,
                color: t.textPrimary,
              }}
            >
              Firm already holds your current facts — no need to re-explain your whole story at the
              meeting.
            </div>
          </LeafSurface>
        ) : (
          <div
            style={{
              marginBottom: 12,
              padding: "8px 10px",
              borderRadius: 6,
              background: t.hoverBg,
              border: `1px solid ${t.border}`,
              fontSize: 12,
              color: t.textMuted,
            }}
          >
            Outstanding self-reportables remain — finish Loop-closer form before the meeting.
            <button
              type="button"
              onClick={() => setFactsOnFile(true)}
              style={{ ...secondaryBtn(t), marginLeft: 8, padding: "4px 8px" }}
            >
              Demo · clear outstanding
            </button>
          </div>
        )}

        {!confirmed ? (
          <>
            <LeafSurface label="Slot picker" focused={focusLabel === "Slot picker"} t={t}>
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
                        width: "100%",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </LeafSurface>
            <LeafSurface label="Confirm booking" focused={focusLabel === "Confirm booking"} t={t}>
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                style={primaryBtn(t, { width: "100%" })}
              >
                Confirm booking
                <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            </LeafSurface>
          </>
        ) : (
          <div
            data-register-surface="Booking confirm"
            style={{
              border: `1px solid ${t.success}`,
              borderRadius: 8,
              padding: 14,
              background: `${t.success}14`,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
              Booked · {slot} with {CONSULTANT.name}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12 }}>
              Meeting state written for consultant Meetings rows.
            </div>
            {/* contact-furnish-15 — Reschedule / Cancel */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <LeafSurface label="Reschedule" focused={focusLabel === "Reschedule"} t={t}>
                <button type="button" onClick={() => setConfirmed(false)} style={secondaryBtn(t)}>
                  Reschedule
                </button>
              </LeafSurface>
              <LeafSurface label="Cancel booking" focused={focusLabel === "Cancel booking"} t={t}>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmed(false);
                    setSlot(null);
                  }}
                  style={secondaryBtn(t, { color: t.red, borderColor: t.red })}
                >
                  Cancel booking
                </button>
              </LeafSurface>
            </div>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: t.textDim, textAlign: "center" }}>
          After confirm, outstanding self-reportables open on Loop-closer form.
        </div>
      </div>
    ),
  });
}

function LoopCloserForm({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const outstandingTotal = 3;
  const [filled, setFilled] = useState(0);
  const remaining = Math.max(0, outstandingTotal - filled);
  const clear = remaining === 0;

  return portalShell({
    t,
    surface: "Loop-closer form",
    badge: "Pre-meeting",
    focusLabel,
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Loop-closer form
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Outstanding self-reportables before you join — write-back so Live brief is current.
        </p>
        <SelfReportableLegend t={t} focusLabel={focusLabel} />
        <AlreadyHeldStrip
          t={t}
          focusLabel={focusLabel}
          chips={["Language: CLB 9", "EE pool: Yes", "Funds: Yes"]}
        />
        {clear ? (
          <LeafSurface
            label="Facts already on file"
            focused={focusLabel === "Facts already on file"}
            t={t}
            style={{ marginBottom: 12 }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${t.success}`,
                background: `${t.success}14`,
                fontSize: 12,
                color: t.textPrimary,
              }}
            >
              Firm already holds your current facts — nothing outstanding for the meeting.
            </div>
          </LeafSurface>
        ) : (
          <div data-register-surface="Booking confirm">
            <LeafSurface label="Outstanding" focused={focusLabel === "Outstanding"} t={t}>
              <div data-register-surface="Self-reportable fields">
                {fieldBlock(t, "Work permit end date (approx)", "Sep 15, 2026")}
                {fieldBlock(t, "Hours/week (current role)", "40")}
                {fieldBlock(t, "TEER guess", "TEER 1")}
                {fieldBlock(t, "Test date", "Mar 12, 2025", {
                  hint: "Test date (day of exam), not document upload. Validity window is separate.",
                })}
              </div>
            </LeafSurface>
            <LeafSurface label="Submit" focused={focusLabel === "Submit"} t={t}>
              <button
                type="button"
                onClick={() => setFilled(outstandingTotal)}
                style={primaryBtn(t, { width: "100%" })}
              >
                Submit
                <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            </LeafSurface>
          </div>
        )}
        <FormChromeFooter
          t={t}
          focusLabel={focusLabel}
          remaining={remaining}
          total={outstandingTotal}
          onSilence={onSilence}
        />
      </div>
    ),
  });
}

function UpdateFacts({
  t,
  focusLabel,
  onSilence,
}: {
  t: Tokens;
  focusLabel: string | null;
  onSilence: () => void;
}) {
  const [draftRestored, setDraftRestored] = useState(false);
  const outstandingTotal = 3;
  const [filled, setFilled] = useState(0);

  return portalShell({
    t,
    surface: "Update facts",
    badge: "Life change",
    focusLabel,
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
          Update facts
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
          Reply when your situation changes. Same self-reportable boundary as Nudge form — firm-branded
          path under {FIRM.name}.
        </p>
        <SelfReportableLegend t={t} focusLabel={focusLabel} />
        <ResumeDraftBanner
          t={t}
          focusLabel={focusLabel}
          restored={draftRestored}
          onContinue={() => {
            setDraftRestored(true);
            setFilled(1);
          }}
        />
        <AlreadyHeldStrip
          t={t}
          focusLabel={focusLabel}
          chips={["Prior CLB: 9", "Meeting invites: Yes"]}
        />
        <LeafSurface
          label="Update facts / Change update link"
          focused={focusLabel === "Update facts / Change update link"}
          t={t}
          style={{ marginBottom: 12 }}
        >
          <span style={{ fontSize: 11, color: FIRM.brand, fontWeight: 600 }}>Update facts link</span>
        </LeafSurface>
        <LeafSurface label="Outstanding" focused={focusLabel === "Outstanding"} t={t}>
          <div data-register-surface="Update fields">
            {fieldBlock(t, "What changed", draftRestored ? "New language test booked" : "—", {
              placeholder: !draftRestored,
            })}
            {fieldBlock(t, "Effective date", "Aug 2026")}
            {fieldBlock(t, "Test date", "—", {
              placeholder: true,
              hint: "Enter the exam day. Validity / still-valid window is separate — no certificate upload.",
            })}
            {fieldBlock(t, "Updated CLB target", "CLB 10")}
          </div>
        </LeafSurface>
        <LeafSurface label="Submit" focused={focusLabel === "Submit"} t={t}>
          <button
            type="button"
            onClick={() => setFilled(outstandingTotal)}
            style={primaryBtn(t, { width: "100%" })}
          >
            Submit
            <ArrowRight size={14} strokeWidth={2.25} />
          </button>
        </LeafSurface>
        <FormChromeFooter
          t={t}
          focusLabel={focusLabel}
          remaining={Math.max(0, outstandingTotal - filled)}
          total={outstandingTotal}
          onSilence={onSilence}
        />
      </div>
    ),
  });
}

/** contact-furnish-10 — Link state page (+ prepared-workspace purpose contrast). */
function LinkStatePage({ t, focusLabel }: { t: Tokens; focusLabel: string | null }) {
  const [state, setState] = useState<LinkStateKind>("Expired");
  const copy: Record<LinkStateKind, { title: string; next: string }> = {
    Valid: {
      title: "This link is valid",
      next: "Continue to the declared purpose — Consent request, Nudge form, or Booking.",
    },
    Expired: {
      title: "This link has expired",
      next: `Ask ${FIRM.name} for a fresh link — or email ${FIRM.email}.`,
    },
    "Already used": {
      title: "This link was already used",
      next: "If you need to continue, request a new firm-branded link from your consultant.",
    },
    "Wrong purpose": {
      title: "Wrong purpose for this link",
      next: "This token is not for client consent / facts / book. It will not open Authorize book.",
    },
  };

  return portalShell({
    t,
    surface: "Link state",
    badge: "Token redeem",
    focusLabel,
    showPurpose: true,
    children: (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 8 }}>
          Link state
        </div>
        <OnWhoseBehalf t={t} focusLabel={focusLabel} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {(["Valid", "Expired", "Already used", "Wrong purpose"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              style={{
                ...secondaryBtn(t, {
                  padding: "5px 10px",
                  background: state === s ? FIRM.brandSoft : t.bgPrimary,
                  borderColor: state === s ? FIRM.brand : t.border,
                  color: state === s ? FIRM.brand : t.textMuted,
                }),
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <LeafSurface label="Link state" focused={focusLabel === "Link state"} t={t}>
          <div
            style={{
              border: `1px solid ${state === "Valid" ? t.success : t.border}`,
              borderRadius: 8,
              padding: 16,
              background: state === "Valid" ? `${t.success}14` : t.bgSecondary,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>
              {copy[state].title}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>{copy[state].next}</div>
            {state === "Valid" ? (
              <button type="button" style={primaryBtn(t, { marginTop: 12 })}>
                Continue
                <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            ) : null}
          </div>
        </LeafSurface>

        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <PurposeChip t={t} kind="client" focusLabel={focusLabel} />
          <span style={{ fontSize: 11, color: t.textDim }}>vs</span>
          <PurposeChip t={t} kind="prepared" focusLabel={focusLabel} />
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11, color: t.textDim, lineHeight: 1.45 }}>
          Prepared-workspace-adjacent firm pages never show Authorize book on contact Consent / Nudge /
          Booking. Purpose chips keep activation preview separate from your client path.
        </p>
      </div>
    ),
  });
}

function ActiveSurface({
  t,
  surface,
  focusLabel,
  silenced,
  setSilenced,
  goSilence,
}: {
  t: Tokens;
  surface: ContactSurface;
  focusLabel: string | null;
  silenced: boolean;
  setSilenced: (v: boolean) => void;
  goSilence: () => void;
}) {
  switch (surface) {
    case "Opt-in message":
      return <OptInMessage t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Consent request":
      return <ConsentRequest t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Nudge message":
      return <NudgeMessage t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Nudge form":
      return <NudgeForm t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Silence / Opt out":
      return (
        <SilenceOptOut t={t} focusLabel={focusLabel} silenced={silenced} setSilenced={setSilenced} />
      );
    case "Meeting invitation":
      return <MeetingInvitation t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Booking":
      return <Booking t={t} focusLabel={focusLabel} />;
    case "Loop-closer form":
      return <LoopCloserForm t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Update facts":
      return <UpdateFacts t={t} focusLabel={focusLabel} onSilence={goSilence} />;
    case "Link state":
      return <LinkStatePage t={t} focusLabel={focusLabel} />;
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
  const [silenced, setSilenced] = useState(false);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "contact") return;
    setSurface(surfaceForFocus(focusedEntry));
  }, [focusedEntry, focusSeq]);

  const goSilence = () => {
    setSilenced(true);
    setSurface("Silence / Opt out");
  };

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
            <ActiveSurface
              t={t}
              surface={surface}
              focusLabel={focusedEntry?.label ?? null}
              silenced={silenced}
              setSilenced={setSilenced}
              goSilence={goSilence}
            />
          </div>
        </RegisterSurfaceMount>
      </div>
    </div>
  );
}
