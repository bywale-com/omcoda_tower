# Seat 3 — Canadian privacy / CASL — implementation (PM paper)

**Source:** [`../pass2/03-canadian-privacy-casl.md`](../pass2/03-canadian-privacy-casl.md)  
**Vocab:** [`00-SURFACE-VOCAB.md`](./00-SURFACE-VOCAB.md)  
**Style lock:** implementationProblem / implementation / implementationAdds · relative click-path · `you can now`  
**Skip (NEEDS VERIFICATION):** `casl-17`

**Surfaces in scope:** Consent request · Silence / Opt out · Book readiness · Opt-in message / Nudge message · Approach first-text adjacent · Audit trail (consent events) · Firm operations bind (Send gates, operator-visible)

---

## Focus gap 1 — Lawful consent: opt-in → nudge → reactivation

### casl-01 — CEM triad applies to every firm-branded send

**implementationProblem:**  
Firm-branded Opt-in / Nudge / reactivation can fire email or SMS without a visible hard gate that consent, identification, and unsubscribe are all present. Contacts absorb unlawful CEMs; Om Coda absorbs CRTC exposure on the send path.

**implementation:**  
On Firm operations bind, you can now open Send gates and see CEM triad required (consent + identification + unsubscribe) before Armed / Active may ship any firm-branded email or SMS.  
On Opt-in message and Nudge message, you can now see firm identification and a working unsubscribe path on every CEM — phase never drops the triad.

**implementationAdds:** `["cem-triad", "consent", "identification", "unsubscribe"]`

---

### casl-02 — Email and SMS are the same CEM class, different form constraints

**implementationProblem:**  
Channel pickers treat SMS as a lighter consent regime than email. Operators escalate to SMS as a shortcut; form duties get under-specified on short messages.

**implementation:**  
On Firm operations bind Send gates, you can now see email and SMS as one CEM class — channel choice does not relax consent.  
On Opt-in message and Nudge message, when the channel is SMS, you can now see STOP / Unsubscribe reply (or linked unsubscribe page); when email, you can now see a clear unsubscribe link.

**implementationAdds:** `["cem-class", "channel-email", "channel-sms", "stop-reply", "unsubscribe-link"]`

---

### casl-03 — Express consent must be affirmative opt-in, not pre-checked

**implementationProblem:**  
Consent request can be read as opt-out or pre-checked Agree. Silence-as-yes would mint unlawful express consent that later nudges ride on.

**implementation:**  
On Consent request, you can now Agree only via affirmative unchecked-by-default control that discloses purpose, firm sender identity, and withdrawal right. Pre-checked or silence-as-yes is not offered.

**implementationAdds:** `["express", "affirmative-agree", "unchecked-default"]`

---

### casl-04 — You generally cannot CEM-request express consent without an existing consent basis

**implementationProblem:**  
Opt-in phase risks cold-emailing the whole book to “get consent.” That first CEM itself needs a lawful basis; without one the launch is the violation.

**implementation:**  
On Firm operations bind Send gates, you can now require Consent basis (express already on file, or typed implied) before Opt-in message may fire.  
On Book readiness Verdict list, contacts without a documented Consent basis show not ready for opt-in CEM — cold book-wide consent asks stay blocked.

**implementationAdds:** `["consent-basis-required", "express-on-file", "implied-qualified"]`

---

### casl-05 — Implied consent (EBR) is time-bounded and must be typed

**implementationProblem:**  
Immigration books mix retainers, closed files, and cold leads. Implied consent is asserted without type, event date, or expiry — clocks lapse silently and sends continue.

**implementation:**  
On Book readiness Audit run, you can now see implied-consent type, triggering event date, and expiry on the contact ledger.  
On Firm operations bind Send gates, opt-in / nudge under implied consent fail closed when the clock has lapsed.  
On Imports, you can now supply implied type + event date so Book readiness can compute the window.

**implementationAdds:** `["implied-ebr-purchase", "implied-ebr-inquiry", "implied-expiry", "event-date"]`

---

### casl-06 — Nudge and reactivation are still CEMs; express consent does not drop form duties

**implementationProblem:**  
Phase model (opt-in → nudge → reactivation) is misread as graduating into form-exempt messaging after Agree. Post-Agree CEMs still need ID + unsubscribe.

**implementation:**  
On Nudge message (and reactivation CEM on the same channel surfaces), you can now always see firm identification and readily performed unsubscribe — Agree does not strip form.  
On Firm operations bind Send gates, you can now see form duties required on every post-Agree CEM, not only Opt-in message.

**implementationAdds:** `["form-duties-persist", "post-agree-cem"]`

---

### casl-07 — PIPEDA meaningful consent gates deeper Client Data collection

**implementationProblem:**  
Agree currently reads as one consent that both opens CEM follow-up and deeper immigration-fact forms. Immigration facts are sensitive PI; CEM open-rate alone is not meaningful PIPEDA collection consent.

**implementation:**  
On Consent request, you can now see split disclosures: CASL CEM consent and PIPEDA collection purposes for self-reportable immigration facts.  
On Consent request, deeper forms (Nudge form / Update facts) stay closed until Agree includes those collection purposes — CEM engagement alone does not open them.

**implementationAdds:** `["casl-cem-consent", "pipeda-collection-consent", "immigration-facts-purpose"]`

---

### casl-08 — Channel-scoped consent: email yes ≠ SMS yes by default

**implementationProblem:**  
Automations escalate email→SMS (or reverse) on a single Agree. Channel-limited consent is ignored; SMS rides on email-only grant.

**implementation:**  
On Consent request, you can now set Channel scope (email, SMS, or clearly disclosed multi-channel) at Agree.  
On Firm operations bind Send gates, SMS escalation requires an explicit SMS grant (or multi-channel Agree) — email-only consent does not authorize SMS CEMs.

**implementationAdds:** `["channel-scope-email", "channel-scope-sms", "channel-scope-multi"]`

---

### casl-09 — Sender identity: firm is “on whose behalf”; Om Coda is infrastructure

**implementationProblem:**  
Firm-branded value-add can under-identify who sends and on whose behalf. Contacts need firm accountability plus mailing/contact coords valid ≥60 days; Om Coda must not displace the firm as brand face.

**implementation:**  
On Opt-in message and Nudge message, you can now see the firm named as the person on whose behalf the CEM is sent, with required mailing/contact coordinates.  
On Firm operations bind, you can now confirm firm ID block + coords are bound into every CEM template; Om Coda appears only as send-platform where needed.

**implementationAdds:** `["on-whose-behalf-firm", "mailing-coords", "send-platform-disclosure"]`

---

## Focus gap 2 — Silence / opt-out mechanics + recordkeeping

### casl-10 — Unsubscribe must be readily performed and honored ≤10 business days

**implementationProblem:**  
Silence stops outreach in product language but does not bind CRTC bars: free, one-step, mechanism valid ≥60 days, effect within 10 business days. Delayed honor leaves continuing CEMs after withdrawal.

**implementation:**  
On Silence / Opt out (and Opt-in message / Nudge message footer), you can now unsubscribe in one no-cost step (or SMS STOP). Mechanism stays valid ≥60 days after send.  
On Firm operations bind Send gates, silenced contacts suppress further CEMs immediately (and never later than ≤10 business days).

**implementationAdds:** `["unsubscribe-immediate", "unsubscribe-leq-10bd", "mechanism-valid-60d"]`

---

### casl-11 — SMS STOP / Unsubscribe is a first-class silence event

**implementationProblem:**  
Silence How centers in-touchpoint controls. Carrier-style STOP/Unsubscribe replies can be ignored or treated as softer than Silence / Opt out — uneven ledger.

**implementation:**  
On Silence / Opt out state, inbound STOP / Unsubscribe (and equivalent keywords) now set authoritative silence for that SMS address the same as in-message Silence / Opt out.  
On Audit trail, you can now open a Consent event for SMS stop-keyword silence alongside touchpoint Silence / Opt out.

**implementationAdds:** `["sms-stop", "sms-unsubscribe-keyword", "silence-authoritative"]`

---

### casl-12 — Ignore ≠ Agree; Ignore ≠ Silence unless policy maps it

**implementationProblem:**  
Consent request offers Agree or Ignore. Treating Ignore as consent is unlawful; treating every Ignore as permanent silence may over-block lawful implied-consent follow-ups. Policy is unspoken.

**implementation:**  
On Consent request, Ignore maps to no express consent and no deeper collection — never Agree.  
On Consent request, you can now see whether firm policy also sets silenced-for-automatic-CEMs on Ignore; Silence / Opt out remains the intentional withdrawal path when policy does not auto-silence Ignore.

**implementationAdds:** `["ignore-no-express", "ignore-policy-silence", "ignore-not-agree"]`

---

### casl-13 — Onus of proof: retain consent and unsubscribe evidence

**implementationProblem:**  
Consent/silenced flags exist without CRTC-grade proof: how consent was obtained, scope, evidence pointer, unsubscribe request and action. Onus sits on the sender; flags alone fail an enforcement ask.

**implementation:**  
On Audit trail, you can now filter Consent events and open a Change event showing basis type, capture method/time, scope, evidence pointer, implied expiry, and unsubscribe request/action.  
Per-contact ledger backs Firm operations bind Send gates so firm and Om Coda can prove lawful send and honor withdrawal.

**implementationAdds:** `["consent-ledger", "evidence-pointer", "unsubscribe-action-log"]`

---

### casl-14 — Compliance program posture for a send platform (due diligence)

**implementationProblem:**  
Om Coda operates send paths at scale without operator-visible CEM policy, consent/unsubscribe procedure, or firm/platform role split. Section 9 aiding risk and due-diligence posture are unnamed on the desk that arms sends.

**implementation:**  
On Firm operations bind, you can now see Send gates policy summary: CEM consent/unsubscribe procedures and firm-vs-platform role split before arming.  
On Audit trail, you can now see Consent events and bind/arm actions that demonstrate accountability for firm-branded CEMs Om Coda enables.

**implementationAdds:** `["cem-policy", "role-split-firm-platform", "due-diligence"]`

---

### casl-15 — Silenced state is cross-phase and sticky until affirmative re-consent

**implementationProblem:**  
Reactivation Armed / Active or a new campaign calendar can re-touch silenced contacts if silence is only a Board badge. Withdrawn consent reanimates without new Agree.

**implementation:**  
On Firm operations bind Send gates and Armed / Active, silenced is a hard enrollment inhibitor across opt-in, nudge, and reactivation until a new affirmative express Agree is recorded on Consent request.  
On Book readiness Verdict list, silenced contacts stay not sequence-ready for automatic CEMs until that re-consent.

**implementationAdds:** `["silenced-sticky", "reconsent-required", "enrollment-inhibitor"]`

---

## Focus gap 3 — ALG agent → consultant first text after Meta capture

### casl-16 — First agent text is likely a CEM; treat under CASL unless proven exemption

**implementationProblem:**  
Agent follow-up after Approach capture can ship as cold commercial SMS/email under Om Coda’s name without consent basis, ID, or unsubscribe. Activation assist is presumptively a CEM.

**implementation:**  
On Capture strip (Approach first-text adjacent), first outbound is classified CEM by default.  
Starting from Activation & forward-deploy, you can now send First-text only when Send gates show a documented consent basis plus Om Coda identification and unsubscribe — cold first-text stays blocked.

**implementationAdds:** `["first-text-cem", "consent-basis-gated"]`

---

### casl-17 — Preferred basis: Approach capture as disclosure / inquiry implied consent

**SKIP — NEEDS VERIFICATION.** Approach capture as disclosure/inquiry implied-consent theory remains unsettled (geography KU #14 open beyond V1 Canada shape). Do not plant click-path until room closes verification.

---

### casl-18 — Do not rely on conspicuous publication from firm website scrape

**implementationProblem:**  
Forward-deploy scrapes public firm facts for workspace credibility. Using harvested emails as First-text address without capture stretches conspicuous-publication beyond a lawful CEM basis.

**implementation:**  
On Capture strip, First-text prefers the channel the consultant submitted on Approach.  
On Activation & forward-deploy / Forward-deploy, website-harvested addresses stay non-sendable for CEMs without an independent Consent basis — scrape aids Prepared Workspace credibility, not outreach.

**implementationAdds:** `["approach-submitted-channel", "scrape-non-sendable", "independent-basis-required"]`

---

### casl-19 — First-text content must be role-relevant B2B and fully formed

**implementationProblem:**  
Ads seat owns pre-frame trust; CASL still requires Om Coda ID, contact coords valid ≥60 days, unsubscribe, and relevance to the consultant’s business role. Thin pitch templates fail form and role-relevance.

**implementation:**  
On Agent / sequence editor (Approach first-text adjacent templates), you can now require First-text to identify Om Coda, include prescribed contact info + unsubscribe, and speak only to the captured consultant’s professional interest in Prepared Workspace.  
On Capture strip → First-text send path, incomplete form or off-role copy cannot ship.

**implementationAdds:** `["om-coda-id", "role-relevant-b2b", "prescribed-contact-info"]`

---

## Focus gap 4 — Coexistence: firm DB auth ≠ client opt-in (Assump. 18)

### casl-20 — Orthogonal gates: DB authorization never mint client CEM consent

**implementationProblem:**  
Connected book after Authorize book is treated as send-ready. Firm→Om Coda processing permission launders missing per-contact CEM consent.

**implementation:**  
On Authorize book, completion grants processing/permission only — it does not mint client CEM consent.  
On Firm operations bind Send gates and Book readiness, every client CEM still requires a separate per-contact Consent basis; activation hard inputs never skip Consent request / opt-in path.

**implementationAdds:** `["db-auth-orthogonal", "client-cem-consent-separate"]`

---

### casl-21 — PIPEDA list custody: firm accountable; Om Coda intermediary with gates

**implementationProblem:**  
Firm holds the list; Om Coda runs send/evaluate. Accountability vs service-provider duty is unnamed — unclear who owns consent claims when a bad send fires.

**implementation:**  
On Firm operations bind Send gates, you can now see firm as accountable for client PI and CEM consent claims; Om Coda refuses sends lacking ledgered consent.  
On Audit trail Consent events, firm custody + platform fail-closed enforcement both appear so coexistence is visible to operators.

**implementationAdds:** `["firm-accountable", "platform-fail-closed", "processing-intermediary"]`

---

### casl-22 — Import may carry prior consent evidence — assertions need proof artifacts

**implementationProblem:**  
CSV/CRM “consented” flags authorize nudge/reactivation without Tower opt-in. Legacy marketing flags are not CRTC-proofable without basis, date, scope, and evidence.

**implementation:**  
On Imports, you can now accept prior consent only when basis type, date, scope, and evidence reference are supplied (or map to time-valid implied EBR with event dates).  
On Book readiness, imported flags without proof force Tower Opt-in message path — legacy “yes” cannot skip Consent request proof.

**implementationAdds:** `["imported-consent-proof", "force-tower-opt-in", "evidence-reference"]`

---

### casl-23 — Section 9: Om Coda must not aid non-consensual firm CEMs

**implementationProblem:**  
Hands-free Automations could cause or permit CEMs on an unconsented book. CRTC s.9 reaches those who aid s.6 violations; configurable override would put Om Coda in the aiding path.

**implementation:**  
On Firm operations bind Send gates, send and enrollment stay fail-closed when consent/silenced ledger denies the CEM — no operator override to run sequences on an unconsented book.  
On Armed / Active, you can now see blocked enrollment when ledger denies; Om Coda cannot be configured into aiding non-consensual firm-branded outreach.

**implementationAdds:** `["section-9-fail-closed", "no-unconsented-override"]`

---

## Focus gap 5 — Book readiness “consent/silenced” checks (not pathway)

### casl-24 — Consent/silenced Audit checks are sequence-readiness law, not eligibility cosplay

**implementationProblem:**  
Book readiness correctly excludes pathway scoring, but consent/silenced is an underspecified boolean — ignores basis type, expiry, channel scope, and unsubscribe currency.

**implementation:**  
On Book readiness Audit run / Verdict list, consent/silenced checks now encode: (a) silenced/unsubscribed → not sequence-ready for automatic CEMs; (b) missing/expired Consent basis → not ready for nudge/reactivation (opt-in CEM only if implied/express basis exists); (c) valid express or in-window implied + channel match → eligible for the bound phase.  
Verdicts read CASL state, not immigration score.

**implementationAdds:** `["sequence-ready-casl", "basis-expired", "channel-match", "not-pathway"]`

---

### casl-25 — Partial reachability must not override silence or failed consent basis

**implementationProblem:**  
Reachability (syntax/channel validity) is conflated with legal permission to send. Partial/reachable contacts enroll despite silence or failed Consent basis.

**implementation:**  
On Book readiness Verdict list, you can now see channel-validity separate from permission-to-send. A contact may show reachable / partial yet enrollment-blocked when silenced or without a lawful Consent basis.  
On Firm operations bind Send gates, deliverability never equates consent.

**implementationAdds:** `["channel-validity", "permission-to-send", "enrollment-blocked"]`

---

## Counts

| Metric | Count |
|---|---|
| Source items (`casl-01`…`casl-25`) | **25** |
| Written (implementationProblem + implementation + implementationAdds) | **24** |
| Skipped NEEDS VERIFICATION | **1** (`casl-17`) |
| Surfaces covered (non-skipped) | **7** — Consent request; Silence / Opt out; Book readiness; Opt-in message / Nudge message; Approach first-text adjacent (Capture strip / Activation & forward-deploy / First-text / Agent · sequence editor); Audit trail (Consent events); Firm operations bind (Send gates, operator-visible) |
| Focus gaps touched | **5** (all; gap 3 minus skipped `casl-17`) |
