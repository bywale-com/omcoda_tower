# Seat C1 — Email / SMS deliverability & sending infrastructure
**Pass:** Pass2 + implementation (combined)  
**Axis:** CAPABILITY (adds product) — not compliance. Know-how to land messages; CASL/consent is adjacency only (seat 3).  
**Producer:** SME (email-deliverability / messaging-infra engineer) — not PM/CTO  
**Brief:** Capability roster C1 — residual vs “we use Resend/Twilio”  
**Status:** Paper only — NOT integrated into Register twin yet. Awaiting human validation.  
**Boundaries:** Not CEM consent law (seat 3). Not reply-intent runtime (C2). Not event warehouse design (C7) beyond deliverability telemetry contracts. Solutions = `<mechanism> so that <purpose>` domain practice — not UI wireframes.  
**Anchors:** Capability `00-ROSTER.md` C1; Firm operations bind · Send gates; Activation state; Oversight / Firm health; CASL sender-identity adjacency (`casl-09`); Book readiness reachability ≠ permission (`casl-25`)

**Item count:** 24 (`deliv-01` … `deliv-24`)

**Surfaces in scope:** **Sending infrastructure** (new, house-global) · **Warmup** (new) · **Suppression list** (new, global + per-tenancy) · Firm operations bind · Send gates · Activation state · Oversight · Firm health · Opt-in message / Nudge message (From/header adjacency) · Audit trail (deliverability events)

---

## Focus gap 1 — Domain auth + per-firm branded sending identity

### deliv-01 — SPF must authorize every ESP hop on the sending domain
**Question:** What SPF posture must exist before Tower may send firm-branded mail through a third-party ESP?  
**References:**
- https://datatracker.ietf.org/doc/html/rfc7208
- https://support.google.com/mail/answer/81126
- https://senders.yahooinc.com/best-practices/
- https://resend.com/docs/dashboard/domains/introduction
**Thesis gap:** Register commits firm-branded sequences without a sending-domain authorization model; “use Resend” does not publish SPF that includes the actual MAIL FROM / ESP includes.  
**Solution:** Require a published SPF record on each active sending domain that explicitly includes the ESP (and any bounce/return-path subdomain) before arming volume so that mailbox providers can authenticate the hop Tower actually uses.  
**Handoff:** cto

**implementationProblem:**  
Firm-branded Opt-in / Nudge can ship while the sending domain’s SPF omits the ESP (or return-path subdomain). Providers treat the hop as unauthenticated; reputation never forms cleanly.

**implementation:**  
On Sending infrastructure, open a sending-domain row; view the Authentication panel SPF status row with ESP-include and return-path chips. External intent: publish SPF at the firm's DNS zone (ESP + return-path includes) — no in-app DNS editor.  
On Firm operations bind firm detail → Send gates panel, view the Domain authentication readiness deny chip (SPF-not-ready) blocking Armed / Active volume until Sending infrastructure reads SPF pass.

**implementationAdds:** `["spf-authorized", "esp-include", "return-path-spf", "domain-not-ready"]`

---

### deliv-02 — DKIM must sign with aligned keys per firm sending identity
**Question:** How must DKIM be arranged when many firms send through one platform ESP?  
**References:**
- https://datatracker.ietf.org/doc/html/rfc6376
- https://support.google.com/mail/answer/81126
- https://dmarc.org/wiki/FAQ
- https://resend.com/docs/dashboard/domains/introduction
**Thesis gap:** Multi-tenant send path risks one platform DKIM domain for all firms, breaking From-alignment and firm brand authenticity at the protocol layer.  
**Solution:** Provision per-firm (or per-firm-subdomain) DKIM keys that sign outbound mail with d= aligned to the visible From domain so that authentication and brand identity move together.  
**Handoff:** both

**implementationProblem:**  
All firms can share one platform DKIM domain while From shows the firm. Alignment fails DMARC; contacts and Postmasters see Om Coda’s crypto identity, not the firm’s.

**implementation:**  
On Sending infrastructure, open the firm's sending identity row and click Generate DKIM keys; view signing status chips for aligned d= and From domain in the Authentication panel. External intent: publish DKIM TXT at the firm's DNS zone.  
On Firm operations bind firm detail → Send gates panel, view the DKIM-aligned identity readiness row — must pass before Opt-in message or Nudge message CEM can leave.

**implementationAdds:** `["dkim-per-firm", "dkim-aligned", "from-d-align"]`

---

### deliv-03 — DMARC on the From domain is mandatory for bulk survival
**Question:** What DMARC minimum must Tower enforce on domains used in the From: header at firm volume?  
**References:**
- https://dmarc.org/
- https://datatracker.ietf.org/doc/html/rfc7489
- https://support.google.com/mail/answer/81126
- https://senders.yahooinc.com/best-practices/
**Thesis gap:** Bulk-sender requirements (Google/Yahoo) demand DMARC on the From domain (≥ p=none) plus SPF+DKIM with alignment; product never named this as a send readiness bar.  
**Solution:** Publish DMARC (≥ p=none, with rua) on every From domain and require SPF or DKIM alignment to that organizational domain before treating the identity as send-ready so that bulk traffic clears mailbox-provider authentication bars.  
**Handoff:** both

**implementationProblem:**  
Firm From domains can be bound without a DMARC record. At volume, Gmail/Yahoo treat the sender as non-compliant bulk; placement collapses even when consent is clean.

**implementation:**  
On Sending infrastructure, open the From-domain row; view the Authentication panel DMARC status chips (record present, policy ≥ p=none, rua configured, alignment pass). External intent: publish DMARC (≥ p=none, rua) at the firm's DNS zone.  
On Activation state Progress, view the ready-to-send checklist row — stays closed until DMARC readiness is green for the bound sending identity.

**implementationAdds:** `["dmarc-present", "dmarc-p-none-min", "dmarc-alignment", "rua"]`

---

### deliv-04 — Per-firm branded subdomains in a managed sending-domain pool
**Question:** How should Om Coda isolate firm sending identity without requiring every consultancy to bring a production root domain on day one?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-domain-best-practices-2019-11.pdf
- https://support.google.com/mail/answer/81126
- https://resend.com/docs/dashboard/domains/introduction
- M3AAWG Sender Best Communications Practices (https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf)
**Thesis gap:** Firm-branded CEM identity is named for CASL; the operational pattern (dedicated subdomain per firm under a managed pool vs shared apex) is unspecified — shared apex couples reputation across tenants.  
**Solution:** Allocate each firm a dedicated branded sending subdomain from a house-managed pool (with optional later custom-domain attach), authenticated and warmed independently so that one tenant’s abuse or complaints cannot sink the whole fleet’s From domain.  
**Handoff:** both

**implementationProblem:**  
Multiple firms can share one From apex. One bad book or complaint spike poisons placement for every tenancy on that identity.

**implementation:**  
On Sending infrastructure, click Allocate subdomain in the sending-domain pool; view the new per-firm branded subdomain row auth and Warmup status chips.  
On Firm operations bind firm detail, choose Sending identity from the authenticated subdomain dropdown and click Save identity; optional custom-domain attach remains a later upgrade path on the same module.

**implementationAdds:** `["sending-domain-pool", "per-firm-subdomain", "tenant-isolation", "custom-domain-attach"]`

---

### deliv-05 — Domain / IP reputation blast-radius isolation is a first-class design constraint
**Question:** What isolation rules prevent one firm’s list hygiene failure from burning Om Coda’s shared infrastructure?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://support.google.com/mail/answer/81126
- https://postmaster.google.com/
**Thesis gap:** House-global send path without tenant blast-radius rules turns every firm into correlated risk on shared IPs/domains.  
**Solution:** Isolate reputation units (per-firm subdomain; IP pool tiers) and auto-quarantine a unit when bounce/complaint thresholds trip so that fleet health is preserved by fail-closed isolation, not post-mortem apology.  
**Handoff:** both

**implementationProblem:**  
Shared send path has no quarantine unit. A single firm’s hard-bounce storm or complaint spike degrades Oversight fleet metrics and every peer firm’s inbox placement.

**implementation:**  
On Sending infrastructure, view the Reputation units table rows (per-firm subdomain + IP tier) with bounce, complaint, and Quarantine status chips when thresholds trip.  
On Oversight Fleet health and Firm health, view quarantined sending identities as status chips on the affected Firm row / Sequence health row. On Firm operations bind firm detail → Send gates panel, view the quarantined-identity deny chip while peers on other units continue.

**implementationAdds:** `["reputation-unit", "quarantine", "blast-radius-isolation", "threshold-trip"]`

---

## Focus gap 2 — Warmup scheduler → Activation ready-to-send

### deliv-06 — New domains and IPs require a controlled warmup ramp
**Question:** What volume discipline is required before a new firm sending identity may run full book sequences?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://support.google.com/mail/answer/81126
- https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/outbound-spam-policies-external-email-forwarding
- https://resend.com/docs/dashboard/emails/deliverability-insights
**Thesis gap:** Activation “ready to send” can mean commercial/consent-ready while a cold domain/IP blasts the whole book — classic reputation suicide.  
**Solution:** Enforce a warmup scheduler that ramps daily unique recipients and absolute volume on each new domain/IP against acceptance and complaint signals so that placement reputation is earned before sequence volume.  
**Handoff:** both

**implementationProblem:**  
Activation state can read ready while the sending identity is cold. First Armed day dumps the book; providers throttle or junk the domain permanently.

**implementation:**  
On Sending infrastructure → Warmup, view the Warmup plan panel ramp row per new domain/IP (daily unique-recipient cap, absolute-volume cap, current stage status).  
On Activation state Progress, view the ready-to-send checklist — Warmup stage complete or in-band capped required; cold full-book blast stays blocked on Send gates.

**implementationAdds:** `["warmup-ramp", "daily-unique-cap", "cold-domain-block"]`

---

### deliv-07 — Ready-to-send is a deliverability gate, not only a consent/commercial gate
**Question:** What deliverability predicates must join Activation-state “ready to send”?  
**References:**
- https://support.google.com/mail/answer/81126
- https://senders.yahooinc.com/best-practices/
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- Capability roster C1 (Warmup gates Activation-state)
**Thesis gap:** Activation-state Progress tracks firm commercial/activation motion; inbox-placement readiness (auth + warmup + not quarantined) is unnamed.  
**Solution:** Define ready-to-send as the conjunction of CEM/consent readiness and deliverability readiness (SPF/DKIM/DMARC pass, warmup stage allowing the planned volume, reputation unit not quarantined) so that Activation cannot greenlight a send path that will land in spam.  
**Handoff:** both

**implementationProblem:**  
Activation state Progress can show ready from escrow/book/consent alone. Operators arm sequences on unauthenticated or cold identities; failures look like “product bugs,” not placement gates.

**implementation:**  
On Activation state Progress, view the readiness checklist deliverability rows beside commercial/consent rows (auth green, Warmup stage ok for planned volume, reputation unit not quarantined).  
On Firm operations bind firm detail → Send gates panel, view Armed / Active readiness rows requiring those green status chips — consent-ready alone does not open volume.

**implementationAdds:** `["ready-to-send-conjunction", "deliverability-readiness", "auth-green"]`

---

### deliv-08 — Warmup caps must bind the sequencer, not only the ESP dashboard
**Question:** Where must daily warmup limits be enforced so Automations cannot overrun them?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://resend.com/docs/api-reference/emails/send-email
- https://www.twilio.com/docs/sendgrid/ui/sending-email/warming-up-an-ip-address
**Thesis gap:** Hands-free Automations will schedule whatever the calendar says; ESP UI warmup advice without platform-enforced caps is theater.  
**Solution:** Enforce warmup and steady-state throttles inside the send path (queue/scheduler) consulted by Send gates so that sequence enrollment cannot outrun the reputation ramp.  
**Handoff:** cto

**implementationProblem:**  
Warmup advice lives only in ESP docs. Automations enroll the full eligible book; daily caps are overrun before an operator notices Firm health drop.

**implementation:**  
On Firm operations bind firm detail → Send gates panel, view the Warmup / throttle remaining row capacity chips for the bound sending identity; enrollment beyond the cap queues or blocks.  
On Sending infrastructure → Warmup, view the consumed-vs-allowed volume row for today's enforced budget — sequencer and ESP share one counter.

**implementationAdds:** `["warmup-enforced-in-path", "throttle-remaining", "enrollment-cap"]`

---

### deliv-09 — Domain move, ESP change, or long idle requires re-warmup
**Question:** When must an already-activated firm re-enter warmup instead of resuming prior volume?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://www.twilio.com/docs/sendgrid/ui/sending-email/warming-up-an-ip-address
- https://support.google.com/mail/answer/81126
**Thesis gap:** Product treats sending identity as set-and-forget after activation; ESP/IP/domain changes and long idle periods reset reputation in practice.  
**Solution:** Trigger re-warmup (and temporarily tighten Send gates) on new domain, IP pool change, ESP migration, or idle beyond a defined window so that volume resumes on earned reputation, not historical assumption.  
**Handoff:** both

**implementationProblem:**  
A firm changes subdomain or sits idle for months, then reactivation fires at old volume. Providers see a cold or new identity bursting; placement collapses.

**implementation:**  
On Sending infrastructure → Warmup, view re-warmup trigger rows naming domain change, IP tier change, ESP migration, or idle-beyond-policy with active ramp status.  
On Activation state Progress and Firm operations bind firm detail → Send gates panel, view tightened-cap rows active until re-warmup completes — prior volume rights do not auto-restore.

**implementationAdds:** `["re-warmup", "idle-reset", "identity-change-trigger"]`

---

## Focus gap 3 — Reputation, bounce/complaint economics & monitoring

### deliv-10 — Classify bounces; hard bounces suppress, soft bounces retry with limits
**Question:** How must bounce events change future send eligibility?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://datatracker.ietf.org/doc/html/rfc3463
- https://resend.com/docs/dashboard/emails/deliverability-insights
- https://www.twilio.com/docs/sendgrid/ui/analytics-and-reporting/bounce-and-block-classifications
**Thesis gap:** Book readiness talks reachability; continuous hard-bounce traffic to dead addresses is a primary reputation killer and is not modeled as an ongoing send-path duty.  
**Solution:** Ingest provider bounce webhooks, classify hard vs soft, immediately suppress hard-bounce addresses, and bound soft-bounce retries so that the platform stops paying reputation cost for known-bad recipients.  
**Handoff:** cto

**implementationProblem:**  
Bounces may be logged as metrics only. Sequences keep hitting dead addresses; hard-bounce rate climbs; mailbox providers degrade the sending identity.

**implementation:**  
On Suppression list, view address rows with scope chips (global and/or per-tenancy per policy) and reason hard-bounce from provider-webhook ingest.  
On Firm operations bind firm detail → Send gates panel, view suppressed hard-bounce deny chips; on Firm health Sequence detail, view soft-bounce retry rows with bounded attempts.

**implementationAdds:** `["bounce-hard", "bounce-soft", "hard-suppress", "soft-retry-bound"]`

---

### deliv-11 — Complaint rate is an economic kill-switch (≈0.3% bulk bar)
**Question:** What complaint-rate discipline must Tower treat as operational law for bulk firm→client mail?  
**References:**
- https://support.google.com/mail/answer/81126 (spam rate &lt; 0.3%; target &lt; 0.1%)
- https://postmaster.google.com/
- https://senders.yahooinc.com/best-practices/
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
**Thesis gap:** Consent gates stop unlawful CEMs; they do not stop consented-but-unwanted mail that generates spam-button complaints and burns the domain.  
**Solution:** Continuously measure complaint rate per reputation unit against mailbox-provider bars (hard ceiling ~0.3%, operate toward ≤0.1%) and automatically throttle or quarantine when thresholds approach so that complaint economics protect inbox placement.  
**Handoff:** both

**implementationProblem:**  
Spam-button complaints can accumulate under “they Agreed.” No unit-level complaint ceiling means Gmail/Yahoo punish the domain while Send gates still show consent-ok.

**implementation:**  
On Oversight Fleet health and Firm health, view complaint-rate rows with each reputation unit against ceiling (~0.3%) and target (≤0.1%) chips.  
On Sending infrastructure, view Quarantine status chips on the reputation-unit row when thresholds approach/exceed. On Firm operations bind firm detail → Send gates panel, view the complaint-rate block deny chip.

**implementationAdds:** `["complaint-rate", "complaint-ceiling-0-3", "complaint-target-0-1", "auto-throttle"]`

---

### deliv-12 — Feedback loops + Postmaster visibility are required ops surfaces
**Question:** What external reputation telemetry must Om Coda subscribe to for firm-branded mail at scale?  
**References:**
- https://postmaster.google.com/
- https://senders.yahooinc.com/best-practices/
- https://www.m3aawg.org/sites/default/files/m3aawg-code-of-conduct.pdf
- https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/use-snds-data
**Thesis gap:** Oversight / Firm health shells imply deliverability insight; without Postmaster/FBL/SNDS-class feeds, operators fly blind until ISP blocks.  
**Solution:** Register sending domains with Google Postmaster Tools (and equivalent Yahoo/Microsoft sender intel where available), ingest complaint FBLs and provider events, and expose unit health so that reputation degradation is visible before total filtering.  
**Handoff:** both

**implementationProblem:**  
Oversight Fleet health lacks provider-grade spam/reputation signals. Operators learn of filtering from consultants complaining — too late for the domain.

**implementation:**  
On Sending infrastructure, view each sending-domain row Postmaster / FBL registration status chips and last-sync timestamp. External intent: register domains in Google Postmaster Tools and equivalent Yahoo/Microsoft sender programs — no in-app Postmaster UI.  
On Oversight Fleet health and Firm health, view provider spam-rate and reputation signal rows with feed names alongside ESP webhook status chips.

**implementationAdds:** `["postmaster-registered", "fbl-ingest", "provider-spam-rate", "snds-adjacent"]`

---

### deliv-13 — One-click List-Unsubscribe is a mailbox-provider deliverability requirement
**Question:** Beyond CASL’s working unsubscribe, what header-level unsubscribe mechanism do bulk mailbox providers require?  
**References:**
- https://datatracker.ietf.org/doc/html/rfc8058
- https://datatracker.ietf.org/doc/html/rfc2369
- https://support.google.com/mail/answer/81126
- https://senders.yahooinc.com/best-practices/
- Seat 3 `casl-10` (adjacency — honor timing; this seat owns bulk-provider header mechanics)
**Thesis gap:** CASL seat locked readily performed unsubscribe; Google/Yahoo bulk rules additionally require List-Unsubscribe + List-Unsubscribe-Post (one-click) on marketing/subscribed mail — unspecified in sending infra.  
**Solution:** Emit RFC 2369/8058 one-click List-Unsubscribe headers on firm-branded marketing CEMs and process POSTs into the same silence/suppression pipeline so that mailbox-provider bulk requirements and CASL honor share one withdrawal path.  
**Handoff:** both

**implementationProblem:**  
Messages may show a body unsubscribe link (CASL) without List-Unsubscribe / List-Unsubscribe-Post headers. Bulk Gmail/Yahoo still punish the sender; Gmail’s spam button stays the easy path.

**implementation:**  
On Configuration libraries → Engagement templates catalog, open Agent / sequence editor; on Opt-in message and Nudge message step header fields, configure List-Unsubscribe and List-Unsubscribe-Post (one-click) for marketing CEMs; click Publish version.  
On Silence / Opt out and Suppression list, view one-click POST withdrawal rows matching in-body unsubscribe. On Firm operations bind firm detail → Send gates panel, view suppressed deny chips blocking further CEMs.

**implementationAdds:** `["list-unsubscribe", "list-unsubscribe-post", "one-click", "rfc-8058"]`

---

### deliv-14 — ESP/SMS webhook contract is the spine of reputation control
**Question:** What delivery-event contract must exist between Resend/Twilio (or successor) and Tower?  
**References:**
- https://resend.com/docs/dashboard/webhooks/introduction
- https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event
- https://www.twilio.com/docs/messaging/guides/webhook-request
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
**Thesis gap:** C7 will warehouse events; C1 residual is which delivery outcomes must drive suppression, warmup advancement, and quarantine *in the send path* — not only dashboards.  
**Solution:** Normalize provider webhooks into a delivery-event schema (accepted, deferred, hard/soft bounce, complaint, delivered, rejected) that updates Suppression list, Warmup counters, and reputation-unit health synchronously enough to gate the next send so that telemetry is control, not decoration.  
**Handoff:** cto

**implementationProblem:**  
Provider webhooks may feed a future metrics store only. Next-minute sends ignore hard bounces and complaints; Warmup advances on schedule instead of acceptance reality.

**implementation:**  
On Sending infrastructure, view the Delivery event ingest panel rows (accepted, deferred, hard/soft bounce, complaint, delivered, rejected) with linked Warmup, Suppression list, and reputation-unit health updates from webhook ingest.  
On Audit trail, open deliverability Change event rows to view why Firm operations bind firm detail → Send gates panel blocked or capped a firm.

**implementationAdds:** `["delivery-event-schema", "webhook-normalize", "sync-gate-update"]`

---

## Focus gap 4 — Suppression list (global + per-tenancy) at Send gates

### deliv-15 — Hard bounces and spam complaints are global suppressions
**Question:** Which suppression reasons must apply across all firms on the platform?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://support.google.com/mail/answer/81126
- https://www.twilio.com/docs/sendgrid/ui/sending-email/index-suppressions
**Thesis gap:** Per-firm books can re-import the same dead or complaining address; without a global suppression layer, Om Coda re-burns shared or adjacent reputation.  
**Solution:** Maintain a platform-global suppression list for hard bounces and spam complaints (address-level) that every tenancy’s Send gates must consult so that no firm can re-mail a known toxic recipient through Tower.  
**Handoff:** both

**implementationProblem:**  
Firm A hard-bounces an address; Firm B imports the same person and sequences them. Shared IP/domain neighborhood pays twice; providers see persistent bad targeting.

**implementation:**  
On Suppression list (house-global), view hard-bounce and spam-complaint rows with Global scope chip applying to every tenancy.  
On Firm operations bind firm detail → Send gates panel, view global suppression deny chips blocking enqueue even if the firm’s book marks the contact reachable.

**implementationAdds:** `["suppression-global", "toxic-address", "cross-tenant-block"]`

---

### deliv-16 — Per-tenancy suppression includes opt-out / silence without rewriting CASL
**Question:** How do deliverability suppressions relate to CASL silenced state?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- Seat 3 `casl-10`, `casl-15`, `casl-25` (adjacency — legal silence remains seat 3)
- https://support.google.com/mail/answer/81126
**Thesis gap:** Consent ledger and deliverability suppression can diverge: silenced for law vs suppressed for placement; product needs one send-path consult order without dual sources of truth fighting.  
**Solution:** Keep CASL silence as the legal enrollment inhibitor and mirror opt-out/complaint/hard-bounce into per-tenancy (and global where applicable) Suppression list entries that Send gates consult as a technical deny so that legal withdrawal and reputation hygiene both fail closed on the same send attempt.  
**Handoff:** both

**implementationProblem:**  
Silence may live only on the consent ledger while Suppression list is empty (or the reverse). Sends slip through one gate; operators cannot see a single deny reason.

**implementation:**  
On Firm operations bind firm detail → Send gates panel, view ordered deny chips in row order: CASL silence/consent basis, then Suppression list (per-tenancy + global).  
On Suppression list (per-tenancy), view opt-out / silence, complaint, and hard-bounce rows as technical denies alongside Book readiness permission-to-send.

**implementationAdds:** `["suppression-per-tenancy", "silence-mirror", "ordered-deny"]`

---

### deliv-17 — Every send path must consult suppression before ESP accept
**Question:** Which Tower motions are in scope for suppression checks?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://www.twilio.com/docs/sendgrid/ui/sending-email/index-suppressions
- Capability roster C1 (Consumed by Firm operations bind · Send gates)
**Thesis gap:** Hands-free Automations, manual operator retries, and activation first-texts can bypass a suppression model if it is “list hygiene UI” rather than a hard pre-send gate.  
**Solution:** Make Suppression list consultation a mandatory pre-send gate on every automated and manual firm-branded email/SMS path so that no outbound API call reaches the ESP/SMS provider for a suppressed address.  
**Handoff:** cto

**implementationProblem:**  
Suppression exists as a report. Manual resend or a workflow canvas edge skips it; ESP still accepts and reputation still burns.

**implementation:**  
On Firm operations bind firm detail → Send gates panel, view Suppression list clearance row on every automated and manual firm-branded email/SMS path before provider accept — no Force send override for suppressed addresses.  
On Configuration libraries → Automation workflows catalog, open Workflow canvas; trigger → condition/rule → enroll-into-template action nodes show blocked-suppressed on the enrollment action when it would target a denied address; click Publish version. On Configuration libraries → Engagement templates catalog, open Agent / sequence editor; the step rail marks blocked-suppressed on send steps; click Publish version.

**implementationAdds:** `["pre-send-suppression", "no-force-send", "provider-before-block"]`

---

### deliv-18 — List hygiene: idle / role-invalid addresses must age out of active sending
**Question:** Beyond hard bounces, what proactive hygiene keeps complaint and unknown-user rates down on immigration books?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://support.google.com/mail/answer/81126
- https://www.validity.com/resource-center/email-deliverability-best-practices/ (industry hygiene practice; validate against M3AAWG)
**Thesis gap:** Books include stale leads and abandoned inboxes; continuous mail to never-engaging addresses raises spam placement even without hard bounces.  
**Solution:** Apply engagement- and age-based hygiene rules (sunsetting chronically non-engaging addresses; re-permission or suppress before reactivation bursts) so that sequence volume concentrates on addresses that still accept mail.  
**Handoff:** pm

**implementationProblem:**  
Reactivation Armed dumps years-old non-openers. Complaint and spam-folder rates climb; Warmup gains are erased by stale-list volume.

**implementation:**  
On Book readiness Verdict list and Firm health Sequence health, view contact rows with sunsetting / chronic non-engagement flags blocking or requiring re-permission before reactivation volume.  
On Firm operations bind firm detail → Send gates panel, view sunsetting-suppressed deny chips on reactivation bursts — those addresses cannot enroll without a new engagement path.

**implementationAdds:** `["sunsetting", "chronic-non-engage", "repermission-before-burst"]`

---

## Focus gap 5 — From-address strategy & reply-path

### deliv-19 — Visible From must be firm-branded and DMARC-alignable
**Question:** What From: strategy satisfies firm brand, CASL “on whose behalf,” and DMARC alignment together?  
**References:**
- https://support.google.com/mail/answer/81126
- https://dmarc.org/wiki/FAQ
- Seat 3 `casl-09` (firm on whose behalf — adjacency)
- https://resend.com/docs/dashboard/domains/introduction
**Thesis gap:** CASL named firm identification; deliverability needs the From domain to align with SPF/DKIM. Shared `noreply@omcoda…` From breaks both brand and alignment strategy for firm CEMs.  
**Solution:** Prefer From local-part + domain on the firm’s authenticated branded subdomain (display name = firm), not a platform shared From, so that brand, CASL identity, and DMARC alignment share one domain choice.  
**Handoff:** both

**implementationProblem:**  
CEMs can show a platform shared From while body claims the firm. Alignment and brand diverge; mailbox providers and contacts both distrust the message.

**implementation:**  
On Sending infrastructure, select From identity from the dropdown on the sending-identity row (authenticated branded subdomains only; display name = firm).  
On Configuration libraries → Engagement templates catalog, open Agent / sequence editor; on Opt-in message and Nudge message steps, view the From header row bound to that identity — platform shared From is not offered for firm-branded CEMs.

**implementationAdds:** `["from-firm-subdomain", "display-name-firm", "no-shared-from-cem"]`

---

### deliv-20 — Envelope MAIL FROM / Return-Path must be a platform-controlled bounce domain
**Question:** How should bounce handling be separated from the human-visible From?  
**References:**
- https://datatracker.ietf.org/doc/html/rfc5321
- https://datatracker.ietf.org/doc/html/rfc7208
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-domain-best-practices-2019-11.pdf
- https://resend.com/docs/dashboard/domains/introduction
**Thesis gap:** Practitioners separate aligned From (brand) from Return-Path (platform bounce processing); product has not specified custom MAIL FROM / bounce subdomain mechanics.  
**Solution:** Use a platform-controlled Return-Path / custom MAIL FROM subdomain (SPF-authenticated, per-pool) while keeping header From on the firm branded subdomain with DKIM alignment so that bounce webhooks are reliable without forcing firms to operate MX for bounces.  
**Handoff:** cto

**implementationProblem:**  
Bounce traffic either hits firm MX (unmanaged) or breaks SPF alignment because MAIL FROM and From are conflated without a designed split.

**implementation:**  
On Sending infrastructure, view the Envelope panel Return-Path / custom MAIL FROM row (platform bounce-subdomain with SPF-authenticated status separate from firm header From).  
On Audit trail deliverability event rows, view bounce correlation citing that Return-Path so Suppression list updates stay reliable.

**implementationAdds:** `["return-path-platform", "custom-mail-from", "from-vs-envelope-split"]`

---

### deliv-21 — Reply-To must land where the desk (or runtime) will actually read
**Question:** Where should replies go when engagement is firm-branded but runtime/triage is platform-operated?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://datatracker.ietf.org/doc/html/rfc5322
- Capability roster C2 (Conversations adjacency — reply capture)
- Seat 3 `casl-09` (identification adjacency)
**Thesis gap:** From-address strategy is partial in roster; reply-path (Reply-To vs From) determines whether client replies are lost, misrouted to consultants’ personal inbox, or captured for the agent runtime.  
**Solution:** Set Reply-To to a platform-captured address (or firm-monitored address per bind policy) that is monitored by the engagement runtime/Conversations path, while From remains firm-branded, so that deliverability identity and reply operations are both intentional.  
**Handoff:** both

**implementationProblem:**  
Replies go to an unmonitored From or a consultant’s personal inbox. Runtime cannot classify STOP/booked/question; silence and meeting signals leak.

**implementation:**  
On Sending infrastructure, select Reply-To strategy (platform-captured | firm-monitored) from the selector on the sending-identity row.  
On Firm operations bind firm detail, set Reply-To policy with the same selector and click Save; view that replies feed engagement runtime / Conversations on the monitored path — From stays firm-branded.

**implementationAdds:** `["reply-to-platform", "reply-to-firm-monitored", "reply-capture-path"]`

---

## Focus gap 6 — IP strategy, throttle & SMS adjacency

### deliv-22 — Shared vs dedicated IP is a reputation-tier decision, not a logo feature
**Question:** When should a firm (or Om Coda pool) use dedicated IP versus shared ESP IP?  
**References:**
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://www.twilio.com/docs/sendgrid/ui/sending-email/dedicated-ip-addresses
- https://resend.com/docs/dashboard/emails/deliverability-insights
- https://support.google.com/mail/answer/81126 (PTR / reverse DNS expectations for sending IPs)
**Thesis gap:** Multi-tenant volume will start on shared IPs; without promotion/demotion criteria, noisy neighbors and under-warmed dedicated IPs both destroy placement.  
**Solution:** Default new firms to a reputation-tiered shared pool with isolation rules; promote to dedicated IP only when sustained volume and clean complaint/bounce metrics justify warmup cost — and require PTR/rDNS hygiene on dedicated IPs so that IP strategy follows traffic quality, not vanity.  
**Handoff:** both

**implementationProblem:**  
Every firm demands dedicated IP on day one (under-warmed) or all share one pool forever (noisy neighbor). Neither path is governed by volume/quality criteria.

**implementation:**  
On Sending infrastructure, view the IP tier row (shared pool vs dedicated) with promotion-criteria chips for sustained volume and clean complaint/bounce.  
On Warmup, view dedicated IP ramp row; PTR/rDNS hygiene status chip must be green before dedicated volume is allowed. External intent: PTR/rDNS at the IP provider — no in-app DNS editor.

**implementationAdds:** `["ip-shared-pool", "ip-dedicated", "promotion-criteria", "ptr-rdns"]`

---

### deliv-23 — Throttle by provider response, not only by calendar
**Question:** How should Tower respond when Gmail/Yahoo/Microsoft defer or reject for rate or reputation?  
**References:**
- https://support.google.com/mail/answer/81126
- https://senders.yahooinc.com/best-practices/
- https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- https://resend.com/docs/dashboard/emails/deliverability-insights
**Thesis gap:** Sequence calendars assume constant throughput; ISP deferrals (4xx) and rejects require adaptive backoff or the platform amplifies reputation damage.  
**Solution:** Implement adaptive per-provider throttles driven by deferral/reject signals and reputation-unit health so that the send queue backs off when ISPs ask, instead of retry-storming into blocks.  
**Handoff:** cto

**implementationProblem:**  
Provider 4xx deferrals trigger naive immediate retries. Retry storms worsen blocks; Firm health shows failures without Send gates slowing the queue.

**implementation:**  
On Sending infrastructure, view the Provider throttles panel per-provider rows driven by deferral/reject signals.  
On Firm operations bind firm detail → Send gates panel and Firm health Sequence detail, view adaptive-backoff status chips pausing enrollment/send when ISPs defer — calendar due does not override throttle.

**implementationAdds:** `["adaptive-throttle", "per-provider-backoff", "deferral-signal"]`

---

### deliv-24 — SMS has parallel carrier reputation (A2P / throughput), not “email rules over SMS”
**Question:** What deliverability specialty applies when Tower sends firm-branded SMS via Twilio (or peer) at volume?  
**References:**
- https://www.twilio.com/docs/messaging/compliance/a2p-10dlc
- https://www.twilio.com/docs/messaging/guides/privacy-and-security
- https://www.m3aawg.org/ (messaging abuse / sender best practices adjacency)
- Seat 3 `casl-02` / `casl-11` (CEM/STOP adjacency — not re-litigated here)
**Thesis gap:** Capability brief covers email deeply; SMS at volume still burns carrier reputation (10DLC/A2P registration, throughput limits, STOP filtering) if treated as a thinner email channel.  
**Solution:** Treat SMS as a separate reputation domain: register A2P/brand/campaign as required by carriers, enforce carrier throughput and opt-out filtering in Send gates, and monitor provider undelivered/complaint events into Suppression list so that SMS volume cannot silently destroy number/brand trust.  
**Handoff:** both

**implementationProblem:**  
SMS escalations ride email consent and email warmup mental models. Unregistered or over-throughput SMS fails carrier filters; STOP handling may not feed Suppression list.

**implementation:**  
On Sending infrastructure, view the SMS identity row brand/campaign registration status and throughput tier chips. External intent: complete A2P/brand/campaign registration with carriers (TCR) — no in-app TCR filing UI.  
On Firm operations bind firm detail → Send gates panel, view registration-ready row + throughput remaining row + Suppression list / STOP clear row deny chips — email Warmup green does not authorize SMS volume.

**implementationAdds:** `["sms-a2p", "sms-throughput", "sms-reputation-separate", "stop-to-suppression"]`

---

## Handoff summary (for later HANDOFF.md absorb)

| Owner | Items |
|---|---|
| **pm** | deliv-18 |
| **cto** | deliv-01, deliv-08, deliv-10, deliv-14, deliv-17, deliv-20, deliv-23 |
| **both** | deliv-02–07, deliv-09, deliv-11–13, deliv-15–16, deliv-19, deliv-21–22, deliv-24 |

**Cross-cutting watch:** seat 3 CASL (`casl-09` From/ID, `casl-10`/`casl-11` unsubscribe/STOP, `casl-25` reachability ≠ permission); C2 Conversations / reply capture (`deliv-21`); C7 event pipeline (`deliv-14` schema shared).

---

## Counts

| Metric | Count |
|---|---|
| Source items (`deliv-01`…`deliv-24`) | **24** |
| Written (Pass2 + implementationProblem + implementation + implementationAdds) | **24** |
| Skipped NEEDS VERIFICATION | **0** |
| Focus gaps | **6** |
| New surfaces named | **Sending infrastructure**, **Warmup**, **Suppression list** (plus Conversations reply-path adjacency only in `deliv-21`) |
