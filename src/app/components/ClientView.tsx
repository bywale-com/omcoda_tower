import { Mail, MessageSquare, Phone, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import type { Tokens } from "./tokens";
import { DataPanel } from "./DataPanel";
import { getClientDetail } from "../data/clients";
import type { ClientDetail } from "../data/clients";

function BriefSection({ title, children, t }: { title: string; children: React.ReactNode; t: Tokens }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary, margin: "0 0 12px 0" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Para({ children, t }: { children: React.ReactNode; t: Tokens }) {
  return (
    <p style={{ fontSize: 14, fontWeight: 400, color: t.textPrimary, lineHeight: 1.75, margin: "0 0 14px 0", maxWidth: 680 }}>
      {children}
    </p>
  );
}

function Callout({ children, t }: { children: React.ReactNode; t: Tokens }) {
  return (
    <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.75, margin: "0 0 14px 0", maxWidth: 680, fontStyle: "italic" }}>
      {children}
    </p>
  );
}

function Hl({ children, t }: { children: React.ReactNode; t: Tokens }) {
  return (
    <span style={{ fontSize: 13, background: t.accentBg, color: t.accent, padding: "1px 6px", borderRadius: 3 }}>
      {children}
    </span>
  );
}

const narratives: Record<string, (t: Tokens) => React.ReactNode> = {
  sarah: (t) => (
    <>
      <BriefSection title="Overview" t={t}>
        <Para t={t}>Sarah Jenkins is a software engineer on a Canadian work permit, pursuing permanent residence through Express Entry's Canadian Experience Class. She was onboarded to Tower in March 2024. As of today she sits at <Hl t={t}>CRS 447</Hl> — above the current projected CEC draw threshold of 443 — and her work permit expires in <Hl t={t}>47 days</Hl>. The activation window is now.</Para>
        <Para t={t}>Sarah's file is clean. Her NOC is confirmed at <Hl t={t}>21222 (Software Engineer, TEER 1)</Hl>, language profile CLB 9, and she has 14 months of Canadian work experience in British Columbia. No document gaps, no outstanding profile questions.</Para>
      </BriefSection>
      <BriefSection title="Pathway assessment" t={t}>
        <Para t={t}>Sarah qualifies under the Canadian Experience Class on the basis of 12+ months of skilled work experience (TEER 1), meeting the language threshold (CLB 7 required; she holds CLB 9), and maintaining valid temporary resident status throughout the qualifying period. She is proceeding on a federal Express Entry profile alone — no provincial nomination in play.</Para>
        <Callout t={t}>Her CRS score of 447 has been stable since October 2024, when an updated work history submission pushed it up from 445. The draw threshold for CEC-specific rounds has been trending between 441 and 491. The most recent CEC draw cut at 443. Sarah is currently positioned above that line.</Callout>
        <Para t={t}>The primary risk is timing, not eligibility. If the work permit lapses before an ITA is issued, Sarah's temporary resident status breaks — disqualifying her from CEC until she re-establishes qualifying work experience under renewed status. Tower's activation today is designed to compress that risk window.</Para>
      </BriefSection>
      <BriefSection title="Engagement history" t={t}>
        <Para t={t}>The first outreach in May 2024 — a routine 60-day onboarding check — went unanswered. By June 2024 a follow-up SMS produced a reply within two hours. Her response rate has held at 68%, skewed by the early miss. Preferred channel: email, with SMS as reliable fallback. Open items: two.</Para>
      </BriefSection>
      <BriefSection title="Tower's observation" t={t}>
        <Para t={t}>The permit expiry trigger fired at 09:14 today after the overnight monitoring cycle confirmed no ITA had been issued in the prior draw. The activation sequence initiated automatically. Sarah is not a file that needs chasing — she needs a consultant to close the loop. Tower recommends treating this as the highest-priority activation in the current queue.</Para>
      </BriefSection>
    </>
  ),
  mark: (t) => (
    <>
      <BriefSection title="Overview" t={t}>
        <Para t={t}>Mark Zhao is a civil engineer from Ontario, onboarded in January 2024 under the Federal Skilled Worker stream. At <Hl t={t}>CRS 421</Hl>, he is currently below the recent FSW draw threshold and is still accumulating Canadian work experience toward the 12-month mark that would open a CEC pathway.</Para>
      </BriefSection>
      <BriefSection title="Pathway assessment" t={t}>
        <Para t={t}>Mark is 8 months into his Canadian work history. A CEC reclassification at the 12-month mark — projected for October 2025 — would strengthen his profile materially. His language score of CLB 8 meets the threshold for both FSW and CEC, and his TEER 2 occupation is eligible under both streams.</Para>
      </BriefSection>
      <BriefSection title="Tower's observation" t={t}>
        <Para t={t}>No activation is warranted at this stage. Tower is monitoring for the 12-month work milestone and will trigger a reassessment at that point. Current recommendation: maintain profile currency and prepare documentation for a potential stream switch.</Para>
      </BriefSection>
    </>
  ),
  aisha: (t) => (
    <>
      <BriefSection title="Overview" t={t}>
        <Para t={t}>Aisha Khan is a medical lab technician pursuing permanent residence via the Alberta Advantage Immigration Act's Health stream. Her PNP nomination has been under review since April 2024. At <Hl t={t}>CRS 398</Hl> and CLB 7, her federal Express Entry profile is not competitive on its own — the nomination is the critical path item.</Para>
      </BriefSection>
      <BriefSection title="Tower's observation" t={t}>
        <Para t={t}>Processing times for the Alberta Health stream have extended significantly. Tower is monitoring for a nomination decision. The recommendation is a language reassessment — moving from CLB 7 to CLB 8 would add approximately 16 CRS points and improve her standalone profile as a hedge against nomination delays.</Para>
      </BriefSection>
    </>
  ),
};

function ClientNarrative({ clientId, t }: { clientId: string; t: Tokens }) {
  const render = narratives[clientId] ?? narratives["sarah"];
  return <div>{render(t)}</div>;
}

function PageHeader({ client, t }: { client: ClientDetail; t: Tokens }) {
  const fields: [string, string][] = [
    ["Created time", client.addedDate],
    ["Pathway", client.pathway],
    ["Status", client.statusLabel],
    ["Expiry", client.workPermitExpiry],
  ];

  return (
    <div style={{ padding: "24px 28px 10px", flexShrink: 0, background: t.bgPrimary }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 600,
        color: t.textPrimary,
        margin: 0,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
      }}>
        {client.name}
      </h1>
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
        {fields.map(([label, value]) => (
          <div key={label} style={{ minWidth: 100 }}>
            <div style={{ fontSize: 11, color: t.textDim, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.4 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ClientViewProps = {
  clientId: string;
  t: Tokens;
  isDark: boolean;
  onOpenClientDataFullPage?: () => void;
};

export function ClientView({ clientId, t, isDark, onOpenClientDataFullPage }: ClientViewProps) {
  const client = getClientDetail(clientId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0, background: t.bgPrimary }}>
      <PageHeader client={client} t={t} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 24px" }}>
          <ClientNarrative clientId={clientId} t={t} />
        </div>

        <DataPanel clientId={clientId} t={t} isDark={isDark} onOpenFullPage={onOpenClientDataFullPage} />
      </div>
    </div>
  );
}
