# Seat 3 — Canadian privacy / CASL / SMS & email consent
**Pass:** Pass1 + Pass2 combined  
**Producer:** SME (Canadian privacy / CASL / SMS & email consent) — not PM/CTO  
**Brief:** SME-GRAPH seat 3 Focus gap  
**Geography (V1):** Canada-shaped firm→client CEM/SMS + ALG agent→consultant first text (Seed KU #14)  
**Boundaries:** Not engagement copy methodology. Not Meta ads policy (except first-text adjacency). Not desk halt UX.  
**Anchors:** Seed §8.2–8.3, Assump. 18, KU #14, never-invent “skip opt-in”; World hard gate Client consent / not silenced; How `contact-consent.md`, `contact-silence.md`; Book readiness consent/silenced (not pathway)

**Item count:** 25 (`casl-01` … `casl-25`)

---

## Focus gap 1 — Lawful consent: opt-in → nudge → reactivation (email vs SMS)

### casl-01 — CEM triad applies to every firm-branded send
**Question:** What must be true before Tower fires any firm→client email or SMS in the opt-in / nudge / reactivation phases?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://crtc.gc.ca/eng/internet/anti/reg.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
- https://fightspam.gc.ca/
**Thesis gap:** Seed commits firm-branded sequences under the firm’s identity without locking that every commercial electronic message (CEM) needs prior consent (express or implied), prescribed identification, and a working unsubscribe — including SMS.  
**Solution:** Enforce the CASL CEM triad (consent + identification + unsubscribe) as a hard send gate on every firm-branded email and SMS so that no phase can ship a CEM that would fail a CRTC compliance check.  
**Handoff:** both

### casl-02 — Email and SMS are the same CEM class, different form constraints
**Question:** Does SMS get a lighter consent regime than email for the same commercial immigration outreach?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm (SMS/text messaging to an electronic address)
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
- https://laws.justice.gc.ca/eng/regulations/SOR-2012-36/FullText.html
**Thesis gap:** Product channel language treats email/SMS as interchangeable sequence owners without stating that SMS is still a CEM to an electronic address with the same consent law, only shorter-form identification/unsubscribe presentation.  
**Solution:** Treat email and SMS as one CASL CEM class with channel-specific form (SMS: STOP/Unsubscribe reply or linked page; email: clear unsubscribe link) so that channel choice never becomes a consent shortcut.  
**Handoff:** both

### casl-03 — Express consent must be affirmative opt-in, not pre-checked
**Question:** What form of action constitutes lawful express consent for ongoing firm→client CEMs?  
**References:**
- https://crtc.gc.ca/eng/archive/2012/2012-549.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
- https://crtc.gc.ca/eng/com500/faq500.htm
**Thesis gap:** How leaf “Agree” is named, but CASL requires a positive/explicit indication; opt-out / pre-checked / silence-as-yes is not express consent.  
**Solution:** Record express consent only from an affirmative Agree (unchecked-by-default / explicit yes) that discloses purpose, sender identity, and withdrawal right so that later nudges and reactivation ride on durable express consent rather than inferred engagement.  
**Handoff:** both

### casl-04 — You generally cannot CEM-request express consent without an existing consent basis
**Question:** Can the opt-in launch CEM itself be sent cold to every imported address to “get consent”?  
**References:**
- https://crtc.gc.ca/eng/com500/guide.htm
- https://crtc.gc.ca/eng/archive/2012/2012-549.htm (§7 — CEM cannot be used to elicit express consent absent existing implied consent)
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
**Thesis gap:** Product “opt-in phase” risks being read as “email everyone on the book to ask for consent,” which CASL forbids when there is neither express nor implied consent to send that first CEM.  
**Solution:** Require a documented consent basis (express already on file, or CASL-qualified implied consent such as existing business relationship / inquiry window / lawful disclosure) before the opt-in CEM fires so that the consent-request message itself is lawful.  
**Handoff:** both

### casl-05 — Implied consent (EBR) is time-bounded and must be typed
**Question:** When may a firm rely on implied consent for past clients / leads instead of waiting for Agree?  
**References:**
- https://crtc.gc.ca/eng/com500/guide.htm
- https://crtc.gc.ca/pubs/CASL_Infograph3_Eng.pdf
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email (≈2 years purchase/relationship; ≈6 months inquiry/application)
**Thesis gap:** Immigration books mix retainers, closed files, and cold leads; Assump. 18 coexistence is open; without EBR typing and clocks, implied consent is asserted without proof.  
**Solution:** Model implied-consent type + triggering event date + expiry (e.g. purchase/contract ≈2 years; inquiry/application ≈6 months) as first-class ledger fields so that opt-in/nudge sends under implied consent fail closed when the clock has lapsed.  
**Handoff:** both

### casl-06 — Nudge and reactivation are still CEMs; express consent does not drop form duties
**Question:** After Agree, may re-engagement nudges and reactivation omit unsubscribe/identification because “they opted in”?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
**Thesis gap:** Phase model (opt-in → nudge → reactivation) can be misread as consent graduating into form-exempt messaging.  
**Solution:** Keep identification + readily performed unsubscribe on every post-Agree CEM (email and SMS) so that phase progression never relaxes CASL form requirements.  
**Handoff:** pm

### casl-07 — PIPEDA meaningful consent gates deeper Client Data collection
**Question:** What privacy consent is required beyond CASL before deeper immigration-fact collection on touchpoints?  
**References:**
- https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/canadas-anti-spam-legislation/casl-compliance-help-for-businesses/casl_guide/
**Thesis gap:** How `contact-consent` correctly blocks deeper forms until Agree, but does not state that immigration facts are sensitive personal information needing meaningful purpose disclosure under PIPEDA (separate from CEM consent).  
**Solution:** Split CASL CEM consent from PIPEDA collection consent: Agree must state purposes for collecting self-reportable immigration facts (eligibility freshness / advice) so that deeper forms open only under meaningful privacy consent, not CEM open-rate alone.  
**Handoff:** both

### casl-08 — Channel-scoped consent: email yes ≠ SMS yes by default
**Question:** If a contact Agrees on email, may Automations escalate to SMS (or the reverse) without a separate indication?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email (consent may be limited to types of messages)
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/canadas-anti-spam-legislation/casl-compliance-help-for-businesses/casl_guide/
**Thesis gap:** Seed KU #15 channel-order escalations and dual-channel sequences assume cross-channel motion; CASL/PIPEDA practice expects clarity when consent is channel-limited.  
**Solution:** Store consent scope per electronic address/channel (and message class) and require an explicit channel grant or clearly disclosed multi-channel request at Agree time so that SMS escalation cannot ride on email-only consent.  
**Handoff:** both

### casl-09 — Sender identity: firm is “on whose behalf”; Om Coda is infrastructure, not the brand face
**Question:** Who must be identified in firm→client CEMs when Tower/Om Coda operates the send path?  
**References:**
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
- https://laws.justice.gc.ca/eng/regulations/SOR-2012-36/FullText.html
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
**Thesis gap:** Seed requires firm-branded value-add; CASL still needs clear naming of the person sending and anyone on whose behalf the message is sent, plus a mailing address valid ≥60 days.  
**Solution:** Identify the firm as the person on whose behalf the CEM is sent (with required mailing/contact coords) and disclose Om Coda only as send-platform where needed so that contacts see firm accountability and prescribed ID remains valid.  
**Handoff:** both

---

## Focus gap 2 — Silence / opt-out mechanics + recordkeeping

### casl-10 — Unsubscribe must be readily performed and honored ≤10 business days
**Question:** What operational bar must silence/opt-out meet to satisfy CASL?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
- https://www.canada.ca/en/radio-television-telecommunications/news/2015/11/rogers-media-inc-agrees-to-pay-200-000-for-allegedly-violating-canada-s-anti-spam-law.html
**Thesis gap:** How Silence says outreach stops, but does not bind the CRTC bars: readily performed, free, mechanism valid ≥60 days after send, effect without delay and within 10 business days.  
**Solution:** Implement unsubscribe/silence as a no-cost, one-step (or SMS STOP) path that remains valid ≥60 days and suppresses further CEMs within ≤10 business days (prefer immediate) so that product Silence equals CASL-honored withdrawal.  
**Handoff:** both

### casl-11 — SMS STOP / Unsubscribe is a first-class silence event
**Question:** How must SMS opt-out be accepted relative to in-touchpoint Silence controls?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
**Thesis gap:** Silence How centers touchpoint controls; CRTC explicitly accepts reply STOP/Unsubscribe for SMS CEMs.  
**Solution:** Treat inbound STOP/Unsubscribe (and equivalent keywords) as authoritative silence for that SMS address (and policy-linked CEM classes) so that carrier-style opt-outs are ledgered the same as in-message Silence.  
**Handoff:** cto

### casl-12 — Ignore ≠ Agree; Ignore ≠ Silence unless policy maps it
**Question:** How should “Ignore / dismiss” on the Consent request interact with CASL consent and silenced state?  
**References:**
- https://crtc.gc.ca/eng/archive/2012/2012-549.htm (inaction ≠ express consent)
- How `contact-consent.md` Leaf 1.2; How `contact-silence.md`
**Thesis gap:** Product allows Agree or Ignore; treating Ignore as consent is unlawful; treating every Ignore as permanent silence may over-block lawful implied-consent follow-ups — policy must be explicit.  
**Solution:** Map Ignore to “no express consent / no deeper collection” without inventing affirmative consent, and separately define whether Ignore also sets silenced-for-automatic-CEMs so that inaction never equals Agree and silence remains an intentional withdrawal path.  
**Handoff:** pm

### casl-13 — Onus of proof: retain consent and unsubscribe evidence
**Question:** What records must exist for every contact Tower messages under a firm’s name?  
**References:**
- https://www.canada.ca/en/radio-television-telecommunications/news/2016/07/enforcement-advisory-notice-for-businesses-and-individuals-on-how-to-keep-records-of-consent.html
- https://crtc.gc.ca/eng/com500/guide.htm
- https://crtc.gc.ca/eng/archive/2014/2014-326.htm
- https://crtc.gc.ca/eng/com500/faq500.htm
**Thesis gap:** Seed/Audit mention consent/silenced flags; CRTC puts onus on the sender to prove consent and expects logs of how consent was obtained, unsubscribes, and resulting actions.  
**Solution:** Maintain a per-contact consent ledger (basis type, capture method/time, scope, evidence pointer, implied expiry) plus unsubscribe request/action log so that firm and Om Coda can prove lawful send and honor withdrawal.  
**Handoff:** cto

### casl-14 — Compliance program posture for a send platform (due diligence)
**Question:** Beyond per-message gates, what organizational practice does CRTC expect when Om Coda causes/permits CEMs at scale?  
**References:**
- https://crtc.gc.ca/eng/archive/2014/2014-326.htm
- https://crtc.gc.ca/eng/archive/2018/2018-415.htm
- https://crtc.gc.ca/eng/com500/faq500.htm
**Thesis gap:** Tower is house-operated engagement infrastructure; section 9 aiding risk and compliance-program guidance are not named in Seed despite Om Coda operating send paths.  
**Solution:** Adopt documented CEM policies, consent/unsubscribe procedures, training/accountability, and third-party (firm) role split so that Om Coda can show due diligence when infrastructure enables firm-branded CEMs.  
**Handoff:** both

### casl-15 — Silenced state is cross-phase and sticky until affirmative re-consent
**Question:** After silence/opt-out, may reactivation or a new campaign calendar re-enroll the contact automatically?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://crtc.gc.ca/eng/com500/guide.htm
- How `contact-silence.md` (further automatic outreach stops)
**Thesis gap:** Reactivation “armed vs active” could re-touch silenced contacts if silence is only a Board badge.  
**Solution:** Make silenced a hard enrollment inhibitor across opt-in, nudge, and reactivation until a new affirmative express consent is recorded so that calendar/automation never reanimates withdrawn consent.  
**Handoff:** both

---

## Focus gap 3 — ALG agent → consultant first text after Meta capture

### casl-16 — First agent text is likely a CEM; treat it under CASL unless a proven exemption applies
**Question:** What is the CASL posture of Om Coda’s first SMS/email to the stranger consultant after Meta Approach capture?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://fightspam.gc.ca/
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
- Seed §6.2 / §8.2 (first agent text SME-critical)
**Thesis gap:** ALG assumes agent follows capture; KU #14 open. A commercial pitch/activation assist to an electronic address is presumptively a CEM needing consent + ID + unsubscribe.  
**Solution:** Classify the agent first-text as a CEM by default and ship it only with a documented consent basis plus prescribed identification and unsubscribe so that activation follow-up is not cold spam under Om Coda’s name.  
**Handoff:** both

### casl-17 — Preferred basis: recipient disclosure / inquiry implied consent from Approach capture
**Question:** What lawful implied-consent theory best fits “consultant just submitted phone/email in-feed”?  
**References:**
- https://crtc.gc.ca/eng/com500/guide.htm (disclosure / existing business relationship inquiry windows)
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://lois-laws.justice.gc.ca/eng/AnnualStatutes/2010_23/FullText.html (CASL s.10(9)–(10))
**Thesis gap:** Meta capture yields an address the consultant provided to Om Coda in a business capacity; product has not locked whether that is disclosure-to-sender and/or inquiry EBR (≈6 months).  
**Solution:** Record Approach capture as the consent event (address disclosed to Om Coda / inquiry about Tower) with timestamp and role relevance, and bound first-text + near-term activation CEMs to that window so that follow-up is implied-consent-backed, not conspicuous-publication scraping.  
**Handoff:** both

### casl-18 — Do not rely on conspicuous publication of the consultant’s address from the firm website scrape
**Question:** May forward-deploy or agent outreach use emails scraped from the public firm site as the first-text address without capture?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm (conspicuous publication is narrow)
- https://crtc.gc.ca/eng/com500/guide.htm
- Seed §6.3 (public firm facts for workspace — not a license to CEM)
**Thesis gap:** Activation scrapes public firm facts; conspicuous publication is not a broad license and fails if relevance/no-CEM statements/proof are weak.  
**Solution:** Prefer the channel the consultant submitted on Approach for first-text; treat website-harvested addresses as non-sendable for CEMs without an independent CASL basis so that scrape aids workspace credibility, not outreach.  
**Handoff:** both

### casl-19 — First-text content must be role-relevant B2B and fully formed
**Question:** What must the first agent message contain and concern?  
**References:**
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
**Thesis gap:** Ads seat owns pre-frame trust; CASL still requires Om Coda identification, contact coords valid ≥60 days, unsubscribe, and relevance to the consultant’s business role/duties.  
**Solution:** Require first-text templates to identify Om Coda, include prescribed contact info + unsubscribe, and speak only to the captured consultant’s professional interest in the prepared workspace so that CASL form and role-relevance are satisfied beside feed-trust craft.  
**Handoff:** pm

---

## Focus gap 4 — Coexistence: firm DB auth ≠ client opt-in (Assump. 18)

### casl-20 — Orthogonal gates: DB authorization never mint client CEM consent
**Question:** Does firm database authorization satisfy end-client CASL/PIPEDA consent for outreach?  
**References:**
- Seed §8.2, Assump. 18, never-invent “skip all client opt-in because ALG”
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/canadas-anti-spam-legislation/casl-compliance-help-for-businesses/casl_guide/
- https://crtc.gc.ca/eng/com500/faq500.htm
**Thesis gap:** Assump. 18 is explicitly SME-open; product pressure is to treat connected book as send-ready.  
**Solution:** Keep DB authorization as a firm→Om Coda processing/permission gate only, and require a separate per-contact consent basis before any client CEM so that activation hard inputs never launder missing client consent.  
**Handoff:** both

### casl-21 — PIPEDA list custody: firm remains accountable; Om Coda is a processing intermediary with gates
**Question:** Who is accountable for personal information when the firm authorizes Tower to engage its book?  
**References:**
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/canadas-anti-spam-legislation/casl-compliance-help-for-businesses/casl_guide/
- https://crtc.gc.ca/eng/archive/2018/2018-415.htm
**Thesis gap:** Firm holds the list (Seed §2.4); Om Coda runs send/evaluate; neither seat has named accountability vs service-provider due diligence.  
**Solution:** Treat the firm as the accountable organization for client personal information and CEM consent claims, with Om Coda contractually/technically obligated to refuse sends lacking ledgered consent so that coexistence is firm custody + platform fail-closed enforcement.  
**Handoff:** both

### casl-22 — Import may carry prior consent evidence — but assertions need proof artifacts
**Question:** Can CSV/CRM import fields marking “consented” authorize immediate nudge/reactivation without Tower opt-in?  
**References:**
- https://www.canada.ca/en/radio-television-telecommunications/news/2016/07/enforcement-advisory-notice-for-businesses-and-individuals-on-how-to-keep-records-of-consent.html
- https://crtc.gc.ca/eng/com500/guide.htm
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/canadas-anti-spam-legislation/casl-compliance-help-for-businesses/casl_guide/
**Thesis gap:** Book-connection can deliver historical marketing flags; without evidence, imported “yes” is not CRTC-proofable.  
**Solution:** Accept imported consent only when basis type, date, scope, and evidence reference are supplied (or map to time-valid implied EBR with event dates); otherwise force Tower opt-in path so that legacy flags cannot skip proof.  
**Handoff:** both

### casl-23 — Section 9: Om Coda must not aid non-consensual firm CEMs
**Question:** What platform duty follows if a firm wants sequences run on an unconsented book?  
**References:**
- https://crtc.gc.ca/eng/archive/2018/2018-415.htm
- https://crtc.gc.ca/eng/com500/faq500.htm
- Seed hard gate Client opt-in / not silenced; World hard gate inventory
**Thesis gap:** Hands-free Automations could “cause or permit” CEMs; CRTC s.9 reaches those who aid s.6 violations.  
**Solution:** Fail-closed send and enrollment APIs when consent/silenced ledger denies the CEM so that Om Coda cannot be configured into aiding non-consensual outreach under a firm’s brand.  
**Handoff:** cto

---

## Focus gap 5 — Book readiness “consent/silenced” checks (not pathway)

### casl-24 — Consent/silenced Audit checks are sequence-readiness law, not eligibility cosplay
**Question:** What must Book readiness / Audit mean by consent and silenced verdicts?  
**References:**
- Seed §5.2 Audit table; How `operator-book-readiness.md`; How `contact-silence.md`
- https://crtc.gc.ca/eng/com500/faq500.htm
- https://www.canada.ca/en/radio-television-telecommunications/news/2016/07/enforcement-advisory-notice-for-businesses-and-individuals-on-how-to-keep-records-of-consent.html
**Thesis gap:** Audit correctly excludes pathway scoring, but “consent/silenced” is underspecified — risk of a boolean that ignores basis type, expiry, channel scope, and unsubscribe currency.  
**Solution:** Define Book readiness consent/silenced checks as: (a) silenced/unsubscribed → not sequence-ready for automatic CEMs; (b) missing/expired consent basis → not ready for nudge/reactivation (opt-in CEM only if implied/express basis exists); (c) valid express or in-window implied + channel match → eligible for the bound phase so that readiness encodes CASL state, not immigration score.  
**Handoff:** both

### casl-25 — Partial reachability must not override a silence or failed consent basis
**Question:** If email is valid but the contact is silenced (or consent basis failed), what is the Audit verdict for engagement enrollment?  
**References:**
- Seed §5.2 (Reachable / Partial / Unreachable)
- How `contact-silence.md` (silenced ⇒ not sequence-ready for new automatic motion)
- https://www.ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
**Thesis gap:** Reachability (syntax/channel validity) can be conflated with legal permission to send.  
**Solution:** Separate channel-validity from permission-to-send: a contact may be technically reachable yet enrollment-blocked when silenced or without a lawful consent basis so that Book readiness never equates deliverability with consent.  
**Handoff:** both

---

## Handoff summary (for later HANDOFF.md absorb)

| Owner | Items |
|---|---|
| **pm** | casl-06, casl-12, casl-19 |
| **cto** | casl-11, casl-13, casl-23 |
| **both** | casl-01–05, casl-07–10, casl-14–18, casl-20–22, casl-24–25 |

**Cross-cutting watch:** seat 5 (first-text pre-frame ↔ casl-16–19); seat 4 (firm license/halt ↔ silence honor, not UX); seat 7 (import consent evidence ↔ casl-22).
