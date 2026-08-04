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
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. View the CEM triad required readiness row with consent, identification, and unsubscribe chips; the Armed / Active segmented control cannot ship firm-branded email or SMS until the row passes.
On Opt-in message and Nudge message, view firm identification text and a working unsubscribe link/button on every CEM; phase never drops the triad.

**implementationAdds:** `["cem-triad", "consent", "identification", "unsubscribe"]`

---

### casl-02 — Email and SMS are the same CEM class, different form constraints

**implementationProblem:**  
Channel pickers treat SMS as a lighter consent regime than email. Operators escalate to SMS as a shortcut; form duties get under-specified on short messages.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. View email and SMS chips under one CEM class readiness row; channel choice does not relax consent.
On Opt-in message and Nudge message, view STOP / Unsubscribe reply text or a linked unsubscribe page when the channel dropdown is SMS; view a clear unsubscribe link when the channel dropdown is Email.

**implementationAdds:** `["cem-class", "channel-email", "channel-sms", "stop-reply", "unsubscribe-link"]`

---

### casl-03 — Express consent must be affirmative opt-in, not pre-checked

**implementationProblem:**  
Consent request can be read as opt-out or pre-checked Agree. Silence-as-yes would mint unlawful express consent that later nudges ride on.

**implementation:**  
On Consent request, click Agree only after selecting an unchecked-by-default affirmative checkbox that discloses purpose, firm sender identity, and withdrawal right. Pre-checked checkboxes and silence-as-yes controls are not offered.

**implementationAdds:** `["express", "affirmative-agree", "unchecked-default"]`

---

### casl-04 — You generally cannot CEM-request express consent without an existing consent basis

**implementationProblem:**  
Opt-in phase risks cold-emailing the whole book to “get consent.” That first CEM itself needs a lawful basis; without one the launch is the violation.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. View the Consent basis required readiness row with allowed chips for Express already on file or Typed implied; view the Opt-in message send button disabled until that row passes.
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list. Contacts without a documented Consent basis show a not-ready-for-opt-in-CEM verdict row, so cold book-wide consent asks stay blocked.

**implementationAdds:** `["consent-basis-required", "express-on-file", "implied-qualified"]`

---

### casl-05 — Implied consent (EBR) is time-bounded and must be typed

**implementationProblem:**  
Immigration books mix retainers, closed files, and cold leads. Implied consent is asserted without type, event date, or expiry — clocks lapse silently and sends continue.

**implementation:**  
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list row for a contact; the contact ledger panel shows implied-consent type, triggering event date, and expiry fields.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; opt-in and nudge rows under implied consent show an implied-expired deny chip when the clock has lapsed.
On Imports, fill the implied type dropdown and event date form field; on Book readiness Audit verdict list, view computed implied-expiry chips from those import fields.

**implementationAdds:** `["implied-ebr-purchase", "implied-ebr-inquiry", "implied-expiry", "event-date"]`

---

### casl-06 — Nudge and reactivation are still CEMs; express consent does not drop form duties

**implementationProblem:**  
Phase model (opt-in → nudge → reactivation) is misread as graduating into form-exempt messaging after Agree. Post-Agree CEMs still need ID + unsubscribe.

**implementation:**  
On Nudge message and reactivation CEM channel surfaces, view firm identification text and a readily performed unsubscribe link/button; Agree does not strip form.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; view form-duty readiness rows required on every post-Agree CEM, not only Opt-in message.

**implementationAdds:** `["form-duties-persist", "post-agree-cem"]`

---

### casl-07 — PIPEDA meaningful consent gates deeper Client Data collection

**implementationProblem:**  
Agree currently reads as one consent that both opens CEM follow-up and deeper immigration-fact forms. Immigration facts are sensitive PI; CEM open-rate alone is not meaningful PIPEDA collection consent.

**implementation:**  
On Consent request, view split disclosure panels for CASL CEM consent and PIPEDA collection purposes for self-reportable immigration facts.  
On Consent request, the Agree checkbox must include those collection-purpose chips before Nudge form or Update facts buttons open; CEM engagement alone does not open deeper forms.

**implementationAdds:** `["casl-cem-consent", "pipeda-collection-consent", "immigration-facts-purpose"]`

---

### casl-08 — Channel-scoped consent: email yes ≠ SMS yes by default

**implementationProblem:**  
Automations escalate email→SMS (or reverse) on a single Agree. Channel-limited consent is ignored; SMS rides on email-only grant.

**implementation:**  
On Consent request, set Channel scope at Agree with a segmented control for Email, SMS, or disclosed multi-channel.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; SMS escalation shows a channel-scope deny chip unless an explicit SMS grant or multi-channel Agree exists. Email-only consent does not authorize SMS CEMs.

**implementationAdds:** `["channel-scope-email", "channel-scope-sms", "channel-scope-multi"]`

---

### casl-09 — Sender identity: firm is “on whose behalf”; Om Coda is infrastructure

**implementationProblem:**  
Firm-branded value-add can under-identify who sends and on whose behalf. Contacts need firm accountability plus mailing/contact coords valid ≥60 days; Om Coda must not displace the firm as brand face.

**implementation:**  
On Opt-in message and Nudge message, view the firm name row as the person on whose behalf the CEM is sent, with mailing/contact coordinate fields.  
Starting from Firm operations bind, click a Firm row to open firm detail; view the Firm ID block and coordinate fields as bound CEM-template fields. Om Coda appears only as a send-platform chip where needed.

**implementationAdds:** `["on-whose-behalf-firm", "mailing-coords", "send-platform-disclosure"]`

---

## Focus gap 2 — Silence / opt-out mechanics + recordkeeping

### casl-10 — Unsubscribe must be readily performed and honored ≤10 business days

**implementationProblem:**  
Silence stops outreach in product language but does not bind CRTC bars: free, one-step, mechanism valid ≥60 days, effect within 10 business days. Delayed honor leaves continuing CEMs after withdrawal.

**implementation:**  
On Silence / Opt out, and in the Opt-in message / Nudge message footer, click a one-step no-cost unsubscribe button; on SMS channel surfaces, view STOP/Unsubscribe reply instructions. The mechanism shows a valid-through date at least 60 days after send.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; silenced contacts show a silenced deny chip that suppresses further CEMs immediately and never later than <=10 business days.

**implementationAdds:** `["unsubscribe-immediate", "unsubscribe-leq-10bd", "mechanism-valid-60d"]`

---

### casl-11 — SMS STOP / Unsubscribe is a first-class silence event

**implementationProblem:**  
Silence How centers in-touchpoint controls. Carrier-style STOP/Unsubscribe replies can be ignored or treated as softer than Silence / Opt out — uneven ledger.

**implementation:**  
On Silence / Opt out state, view inbound STOP/Unsubscribe and equivalent keywords reflected as an authoritative silence chip for that SMS address — same ledger outcome as the in-message Silence / Opt out button.
On Audit trail, click a Consent event row to view SMS stop-keyword silence alongside touchpoint Silence / Opt out.

**implementationAdds:** `["sms-stop", "sms-unsubscribe-keyword", "silence-authoritative"]`

---

### casl-12 — Ignore ≠ Agree; Ignore ≠ Silence unless policy maps it

**implementationProblem:**  
Consent request offers Agree or Ignore. Treating Ignore as consent is unlawful; treating every Ignore as permanent silence may over-block lawful implied-consent follow-ups. Policy is unspoken.

**implementation:**  
On Consent request, clicking Ignore records no express consent chip and no deeper collection grant; Ignore never maps to Agree.  
On Consent request, view the Ignore policy row showing whether firm policy also sets silenced-for-automatic-CEMs on Ignore. Silence / Opt out remains the intentional withdrawal button when policy does not auto-silence Ignore.

**implementationAdds:** `["ignore-no-express", "ignore-policy-silence", "ignore-not-agree"]`

---

### casl-13 — Onus of proof: retain consent and unsubscribe evidence

**implementationProblem:**  
Consent/silenced flags exist without CRTC-grade proof: how consent was obtained, scope, evidence pointer, unsubscribe request and action. Onus sits on the sender; flags alone fail an enforcement ask.

**implementation:**  
Starting from Audit trail, use the Firm filter and Actor filter as needed, then click the Consent events filter chip and open a Change event row showing basis type, capture method/time, scope, evidence pointer, implied expiry, and unsubscribe request/action fields.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; each consent/silence deny row links back to that per-contact ledger so firm and Om Coda can prove lawful send and honor withdrawal.

**implementationAdds:** `["consent-ledger", "evidence-pointer", "unsubscribe-action-log"]`

---

### casl-14 — Compliance program posture for a send platform (due diligence)

**implementationProblem:**  
Om Coda operates send paths at scale without operator-visible CEM policy, consent/unsubscribe procedure, or firm/platform role split. Section 9 aiding risk and due-diligence posture are unnamed on the desk that arms sends.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. View policy summary rows for CEM consent/unsubscribe procedures and firm-vs-platform role split before the Armed / Active segmented control can be armed.
On Audit trail, view Consent event rows and bind/arm Change event rows that demonstrate accountability for firm-branded CEMs Om Coda enables.

**implementationAdds:** `["cem-policy", "role-split-firm-platform", "due-diligence"]`

---

### casl-15 — Silenced state is cross-phase and sticky until affirmative re-consent

**implementationProblem:**  
Reactivation Armed / Active or a new campaign calendar can re-touch silenced contacts if silence is only a Board badge. Withdrawn consent reanimates without new Agree.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. Silenced appears as a hard enrollment-inhibitor deny chip across opt-in, nudge, and reactivation until a new affirmative express Agree checkbox is recorded on Consent request. On firm detail, set Armed / Active with the segmented control only after that deny clears.
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list; silenced contacts stay not sequence-ready for automatic CEMs until that re-consent.

**implementationAdds:** `["silenced-sticky", "reconsent-required", "enrollment-inhibitor"]`

---

## Focus gap 3 — ALG agent → consultant first text after Meta capture

### casl-16 — First agent text is likely a CEM; treat under CASL unless proven exemption

**implementationProblem:**  
Agent follow-up after Approach capture can ship as cold commercial SMS/email under Om Coda’s name without consent basis, ID, or unsubscribe. Activation assist is presumptively a CEM.

**implementation:**  
On Capture strip, view the first outbound row classified with a CEM-by-default chip.  
Starting from Activation & forward-deploy, click Forward-deploy, then click First-text; the send button enables only when the send path shows a Send gates panel with documented consent-basis chip plus Om Coda identification and unsubscribe fields. Cold first-text stays blocked.

**implementationAdds:** `["first-text-cem", "consent-basis-gated"]`

---

### casl-17 — Preferred basis: Approach capture as disclosure / inquiry implied consent

**SKIP — NEEDS VERIFICATION.** Approach capture as disclosure/inquiry implied-consent theory remains unsettled (geography KU #14 open beyond V1 Canada shape). Do not plant click-path until room closes verification.

---

### casl-18 — Do not rely on conspicuous publication from firm website scrape

**implementationProblem:**  
Forward-deploy scrapes public firm facts for workspace credibility. Using harvested emails as First-text address without capture stretches conspicuous-publication beyond a lawful CEM basis.

**implementation:**  
On Capture strip, view First-text channel preselected from the channel the consultant submitted on Approach.  
Starting from Activation & forward-deploy, click Forward-deploy; website-harvested addresses show non-sendable chips for CEMs without an independent Consent basis. Scrape aids Prepared Workspace credibility, not outreach.

**implementationAdds:** `["approach-submitted-channel", "scrape-non-sendable", "independent-basis-required"]`

---

### casl-19 — First-text content must be role-relevant B2B and fully formed

**implementationProblem:**  
Ads seat owns pre-frame trust; CASL still requires Om Coda ID, contact coords valid ≥60 days, unsubscribe, and relevance to the consultant’s business role. Thin pitch templates fail form and role-relevance.

**implementation:**  
Starting from Agent / sequence editor, click the Approach first-text adjacent template row. Fill First-text copy fields to identify Om Coda, include prescribed contact info plus unsubscribe, and speak only to the captured consultant's professional interest in Prepared Workspace.
On Capture strip, click First-text; view the send button disabled when required form fields are incomplete or off-role copy is flagged.

**implementationAdds:** `["om-coda-id", "role-relevant-b2b", "prescribed-contact-info"]`

---

## Focus gap 4 — Coexistence: firm DB auth ≠ client opt-in (Assump. 18)

### casl-20 — Orthogonal gates: DB authorization never mint client CEM consent

**implementationProblem:**  
Connected book after Authorize book is treated as send-ready. Firm→Om Coda processing permission launders missing per-contact CEM consent.

**implementation:**  
On Authorize book, clicking Complete grants a processing/permission chip only; it does not mint client CEM consent.  
Starting from Firm operations bind, click a Firm row to open firm detail and view the Send gates panel; starting from Book readiness, click Audits, open an Audit run, then view the Verdict list. Every client CEM still requires a separate per-contact Consent basis row; activation hard inputs never skip Consent request / opt-in path.

**implementationAdds:** `["db-auth-orthogonal", "client-cem-consent-separate"]`

---

### casl-21 — PIPEDA list custody: firm accountable; Om Coda intermediary with gates

**implementationProblem:**  
Firm holds the list; Om Coda runs send/evaluate. Accountability vs service-provider duty is unnamed — unclear who owns consent claims when a bad send fires.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. View the firm-accountable readiness row for client PI and CEM consent claims; send buttons stay disabled when ledgered consent is missing.
On Audit trail, click Consent event rows to view firm custody plus platform fail-closed enforcement fields so coexistence is visible to operators.

**implementationAdds:** `["firm-accountable", "platform-fail-closed", "processing-intermediary"]`

---

### casl-22 — Import may carry prior consent evidence — assertions need proof artifacts

**implementationProblem:**  
CSV/CRM “consented” flags authorize nudge/reactivation without Tower opt-in. Legacy marketing flags are not CRTC-proofable without basis, date, scope, and evidence.

**implementation:**  
On Imports, map prior consent only after filling basis type dropdown, date field, scope dropdown, and evidence reference field, or mapping to time-valid implied EBR with event date fields.  
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list; imported flags without proof show a force-Tower-Opt-in-message verdict row. Legacy "yes" cannot skip Consent request proof.

**implementationAdds:** `["imported-consent-proof", "force-tower-opt-in", "evidence-reference"]`

---

### casl-23 — Section 9: Om Coda must not aid non-consensual firm CEMs

**implementationProblem:**  
Hands-free Automations could cause or permit CEMs on an unconsented book. CRTC s.9 reaches those who aid s.6 violations; configurable override would put Om Coda in the aiding path.

**implementation:**  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel. Send and enrollment buttons stay fail-closed when consent/silenced ledger rows deny the CEM; no operator override button appears for unconsented books.
On firm detail, set Armed / Active with the segmented control; when the ledger denies, firm detail shows a blocked enrollment chip and Om Coda cannot be configured into aiding non-consensual firm-branded outreach.

**implementationAdds:** `["section-9-fail-closed", "no-unconsented-override"]`

---

## Focus gap 5 — Book readiness “consent/silenced” checks (not pathway)

### casl-24 — Consent/silenced Audit checks are sequence-readiness law, not eligibility cosplay

**implementationProblem:**  
Book readiness correctly excludes pathway scoring, but consent/silenced is an underspecified boolean — ignores basis type, expiry, channel scope, and unsubscribe currency.

**implementation:**  
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list. Consent/silenced verdict rows encode: silenced/unsubscribed -> not sequence-ready for automatic CEMs; missing/expired Consent basis -> not ready for nudge/reactivation, with opt-in CEM only if implied/express basis exists; valid express or in-window implied + channel match -> eligible for the bound phase.  
Verdict rows read CASL state, not immigration score.

**implementationAdds:** `["sequence-ready-casl", "basis-expired", "channel-match", "not-pathway"]`

---

### casl-25 — Partial reachability must not override silence or failed consent basis

**implementationProblem:**  
Reachability (syntax/channel validity) is conflated with legal permission to send. Partial/reachable contacts enroll despite silence or failed Consent basis.

**implementation:**  
Starting from Book readiness, click Audits, open an Audit run, then view the Verdict list. View channel-validity chips separate from permission-to-send chips; a contact may show reachable or partial yet enrollment-blocked when silenced or without a lawful Consent basis.  
Starting from Firm operations bind, click a Firm row to open firm detail, then open the Send gates panel; deliverability readiness and consent readiness appear as separate rows so deliverability never equates consent.

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
