# Pass2 — Consultancy CRM / book-connection (seat 7)

**Seat:** Consultancy CRM / book-connection  
**Producer:** SME (combined Pass1+Pass2)  
**Focus gap:** “Database authorization” is a hard activation input with undefined stack meanings (Seed KU #2).  
**Pressure:** (1) common immigration-consultancy systems of record + auth/export patterns for V1; (2) “equivalent that makes campaign real” without acquisition upload; (3) CSV vs OAuth risks + sequence-ready expectations; (4) bidirectional sync KU #7 — V1 or defer; (5) handoff to Audit reachability — what connect must guarantee before engagement.  
**Anchors:** Seed §2.4, §5.1, §6.3–6.4, KU #2/#7; How `consultant-core` Leaf 2a.1 Authorize book; `operator-book-readiness`; SME-GRAPH seat 7.  
**Boundaries:** Not Audit pathway scoring. Not eligibility field semantics. Not CASL. External validators = CTO once practice need is named.  
**Item count:** 25 (`crm-01` … `crm-25`)

---

### crm-01 — Fragmented systems of record (no single “RCIC CRM”)

**Question:** What systems of record actually hold Canadian immigration consultancies’ contact books today?  
**References:** VisaFlo “What is RCIC software?” (practice/case record ≠ generic CRM); Officio Immigration CRM Canada; RCIC App practice platform; VisaFlo buyer guides comparing Officio / CaseEasy / Visto / Clio; Seed §5.1 (CRM export, spreadsheet, lead list, manual add).  
**Thesis gap:** Product language assumes a uniform “firm database”; practice is fragmented across spreadsheets, generic CRMs, and immigration practice platforms — so one OAuth meaning fails KU #2.  
**Solution:** Treat V1 book-connection as **multi-stack intentional hand-over** (named cohort from whatever holds contacts) so that activation does not depend on a single vendor connector before the campaign can become real.  
**Handoff:** both (PM: Authorize-book stack taxonomy / outcomes; CTO: connector vs assisted-import paths)

---

### crm-02 — Spreadsheet / CSV as the modal small-practice book

**Question:** For solo and small RCIC practices, is the living “book” often a spreadsheet rather than a CRM?  
**References:** VisaFlo solo-RCIC framing (spreadsheet + questionnaire + e-sign + invoice tracker as the default stitch); Seed §5.1 / prototype CSV honesty; industry CRM import guidance treating CSV as one-time or infrequent loads (SplitForge CSV vs API).  
**Thesis gap:** “Database authorization” read as live API access excludes the largest realistic V1 cohort if spreadsheets are first-class systems of record.  
**Solution:** Count **firm-authorized file export / upload of the working contact list** as a first-class authorization stack (not a consolation prize) so that small practices can complete the activation hard input without an OAuth product.  
**Handoff:** both (PM: file-stack = Authorize book equivalent; CTO: import mutation honesty vs Seed prototype gap)

---

### crm-03 — Immigration practice platforms optimize case files, not marketing lists

**Question:** Do RCIC practice platforms (VisaFlo, Officio, RCIC App class) hold contacts in a form Tower can treat as a sequence book?  
**References:** VisaFlo RCIC software guide (lead → case → IMM/portal; client record serves filing); Officio client/prospect/case modules; RCIC App bookings/intake/agreements (consultation cycle).  
**Thesis gap:** Connecting “the CRM” may pull matter-heavy or active-file populations that are wrong for dormant re-engagement without an explicit cohort choice.  
**Solution:** Require authorization to name a **contact cohort purpose** (dormant/past leads/closed files vs open matters) so that connect yields a reactivation book, not an active-case dump mistaken for outreach inventory.  
**Handoff:** pm (cohort semantics on Authorize book / assisted confirm); cto (filter/export scope when connectors exist)

---

### crm-04 — Generic CRMs appear where firms already run marketing ops

**Question:** Which generic stacks are realistic secondary systems when firms already market?  
**References:** HubSpot export docs (contacts → CSV/XLSX); Zoho/HubSpot as common SMB CRM export sources in professional services; Lawmatics/Clio patterns for lawyer-led immigration shops (export + selective sync). Under-claim: no public market-share study tying RCICs to one generic CRM.  
**Thesis gap:** Building only vertical RCIC connectors ignores firms whose outreach list already lives in HubSpot/Zoho/Clio-class tools.  
**Solution:** For V1, prioritize **export-mediated connect** for generic CRMs (and OAuth only where a documented public API + firm admin consent is available) so that connector ambition tracks practice prevalence, not brand wish-lists.  
**Handoff:** cto (which OAuth targets are justified); pm (stack picker honesty — export vs live)

---

### crm-05 — Live OAuth to vertical RCIC tools is often immature for V1

**Question:** Can Tower treat OAuth into VisaFlo/Officio/RCIC App as the default “database authorization” in V1?  
**References:** Officio public feature set emphasizes Calendly/Drive/Dropbox-style integrations more than third-party contact OAuth; VisaFlo documents Google Drive/OneDrive/Gmail/Stripe integrations; no widely documented, stable third-party “export all contacts via OAuth” standard across RCIC platforms (NEEDS VERIFICATION per vendor).  
**Thesis gap:** Framing OAuth as the only real auth silently makes activation impossible for most stacks KU #2 warned about.  
**Solution:** **Defer vertical OAuth as V1 requirement**; ship assisted export/import + optional generic-CRM OAuth later so that “hard input landed” is practice-reachable without waiting on niche APIs.  
**Handoff:** cto (integration roadmap); pm (do not present OAuth-only as the activation finish line)

---

### crm-06 — What “authorization” must mean across stacks (KU #2)

**Question:** What shared meaning of “database authorization” holds for OAuth CRM, CSV/export, and assisted import?  
**References:** Seed §6.3 hard input; KU #2; World `db_auth_pending`; consultant-core Leaf 2a.1 (“grant database access or the equivalent”); Apollo/engagement-tool import practice (method affects ownership and readiness).  
**Thesis gap:** Product may equate “auth” with technical credential grant; practice needs an intentional firm act that releases a workable book into Tower’s tenancy.  
**Solution:** Define authorization as **firm-intentional release of a named contact cohort into Tower’s mutable book, with provenance and channel fields**, so that OAuth token, export file, and assisted confirm are three mechanisms of one hard input — never three different finish lines.  
**Handoff:** both (PM: single Authorize-book outcome with stack variants; CTO: store provenance + auth artifact)

---

### crm-07 — Equivalent that makes the campaign real (without acquisition upload)

**Question:** What is the “equivalent that makes the campaign real” if the firm has no live CRM API?  
**References:** Seed §6.3–6.4 (hard input after demonstration; never pull DB into click budget); World input-contract pins; consultant-core 2a.1 assisted Contacts confirm.  
**Thesis gap:** “Equivalent” risks collapsing into “upload a CSV in the Meta click” or into demo/sample contacts that never become a runnable book.  
**Solution:** Treat as equivalent only a **post-readiness, firm-initiated hand-over** that lands contacts Tower can mutate and Audit — so that acquisition stays seed-only and activation alone creates the private book.  
**Handoff:** pm (ordering: Prepared Workspace → Authorize book; never Approach upload); cto (gate that book mutation cannot occur from acquisition capture)

---

### crm-08 — Assisted path confirm is authorization, not a second product

**Question:** When OLG/assisted onboarding already holds an import, what still counts as the hard input?  
**References:** Seed §6.5; consultant-core Leaf 2a.1 (“confirm the imported book is the one Tower will work”); World assisted door.  
**Thesis gap:** Assisted import can look “already connected” without the consultant’s intentional authorization act.  
**Solution:** Require an explicit **confirm-this-book** authorization on the assisted path so that campaign-real status cannot be inferred from staff-side seeding alone.  
**Handoff:** pm (Confirm imported book = Authorize book sibling); cto (activation state flips only after confirm)

---

### crm-09 — Firm identity scrape ≠ book; anti-cosplay of public detection

**Question:** Can public firm facts or website scrape substitute for database authorization?  
**References:** Seed §6.3 forward-deploy (public firm facts; firm identity ≠ claim we have clients); §6.4 structural gap; §14 never invent public-before-contact end-client eligibility.  
**Thesis gap:** Prepared workspace under firm branding can be misread as “we already have your clients.”  
**Solution:** Keep scrape/templates strictly **readiness theater**; only post-authorization private book makes engagement real so that forward-deploy never masquerades as connect.  
**Handoff:** pm (copy/outcome separation readiness vs value); cto (no scrape→Contacts mutation)

---

### crm-10 — Minimum fields connect must land (practice, not eligibility)

**Question:** What minimum contact payload must connect deliver before Audit can even run?  
**References:** Seed §5.1 (channels matter); §5.2 Audit checks (email/phone/name/dedupe/consent-silenced flags as data-validity); operator-book-readiness Leaf 1.1; Apollo “never import without readiness audit” (missing channels damage sequences).  
**Thesis gap:** Connect that lands names without usable channels creates Audit theater and blocks enrollment.  
**Solution:** Require connect to produce, per contact, **stable identity + display name + ≥1 channel candidate (email and/or phone as present in source)** so that Book readiness has something to validate — without inventing eligibility fields.  
**Handoff:** both (PM: connect acceptance criteria; CTO: schema + reject empty-channel-only rows as not-landed for enrollment)

---

### crm-11 — CSV / export risks: snapshot staleness

**Question:** What practice risk does CSV/export introduce vs live sync?  
**References:** SplitForge CRM import vs API (CSV = snapshot; lag and format fragility); Mumara/contact-import practice notes (CSV freezes audience at pull time); Seed KU #2.  
**Thesis gap:** Treating a one-shot export as a living CRM misleads firms about freshness for always-on engagement.  
**Solution:** Label file-stack books as **authorized snapshot with optional re-export refresh** so that operators and consultants expect re-hand-over for currency rather than silent live truth.  
**Handoff:** pm (readiness language: snapshot vs live); cto (re-import job + provenance timestamps)

---

### crm-12 — CSV / export risks: wrong cohort and export theater

**Question:** How do firms fail “export” in ways that fake authorization?  
**References:** Apollo import guidance (segmented lists vs all contacts); Seed prototype honesty (CSV UI without full mutation); HubSpot export of views/lists.  
**Thesis gap:** Upload of a partial, empty, or demo file can satisfy a checkbox without yielding a runnable book.  
**Solution:** Tie hard-input success to **landed mutable row count + cohort acknowledgement**, not file-received events, so that export theater cannot flip activation to running.  
**Handoff:** both (PM: success criteria on Authorize book; CTO: mutation honesty — Seed §5.1 gap must close for activation path)

---

### crm-13 — CSV / export risks: duplicates and match keys

**Question:** What match-key practice must connect assume before Audit dedupe?  
**References:** SplitForge deduplication-before-import; HubSpot email-as-unique-on-import behavior; Apollo matching-key guidance.  
**Thesis gap:** Without a declared match key, connect + Audit fight duplicates and split engagement history.  
**Solution:** Standardize V1 match on **normalized email when present, else phone E.164-ish candidate, else source-row id**, so that import/upsert and Audit dedupe share one practice key policy.  
**Handoff:** cto (upsert keys); pm (firm-visible duplicate outcomes after Audit — not pathway)

---

### crm-14 — CSV / export risks: channel quality vs sequence intent

**Question:** What sequence-ready expectation should file connect set before enrollment?  
**References:** Seed §5.2 (channel match to intended sequence; Reachable / Partial / Unreachable); operator-book-readiness 1.2; Apollo “incomplete records damage sequence performance.”  
**Thesis gap:** Firms expect “imported = ready to message”; practice says import only supplies candidates for reachability.  
**Solution:** Teach connect as **candidate book land**; sequence-ready only after Audit verdicts so that enrollment never treats raw CSV as sendable.  
**Handoff:** pm (Authorize book → Book readiness hop); cto (enrollment gate on reachable)

---

### crm-15 — OAuth risks: over-scope and wrong objects

**Question:** What practice risks does OAuth CRM connect introduce even when available?  
**References:** Apollo CRM sync guidance (admin permissions, field ownership, sandbox test); Lawmatics↔Clio sync (matter vs contact mapping); HubSpot object export distinctions.  
**Thesis gap:** Broad CRM OAuth can pull matters, billing, or documents the firm did not intend to hand to an engagement product.  
**Solution:** Scope OAuth (when used) to **contacts/leads objects + minimal fields needed for reachability**, with firm-visible scope summary, so that authorization stays book-connection — not full practice-platform takeover.  
**Handoff:** cto (OAuth scopes/proof); pm (scope acknowledgement as part of Authorize book)

---

### crm-16 — OAuth vs CSV: when each is practice-correct for V1

**Question:** How should Tower choose stack mechanism per firm without smuggling DB into click budget?  
**References:** Seed §14 never invent DB auth inside acquisition; SplitForge (CSV for migration/periodic; API for ongoing); Apollo method table.  
**Thesis gap:** Product may push OAuth as “more real” and CSV as temporary, biasing activation away from reachable firms.  
**Solution:** Choose mechanism by **what the firm can intentionally authorize today** (file if that’s the SoR; OAuth if admin-capable CRM), both after readiness, so that stack choice is practice fit — not acquisition friction.  
**Handoff:** pm (stack chooser copy/outcomes); cto (parallel landers to same book schema)

---

### crm-17 — Bidirectional sync (KU #7): V1 residual or defer?

**Question:** Is bidirectional CRM sync required for V1 activation / running, or deferrable?  
**References:** Seed KU #7; Apollo two-way sync guidance (blanket bidirectional high-risk; field ownership matrix mandatory); SplitForge (API for ongoing sync after CSV migrate).  
**Thesis gap:** Leaving KU #7 open invites building sync before a workable one-way book exists — or blocking “running” on sync completeness.  
**Solution:** **Defer bidirectional sync for V1.** Ship one-way land (CRM/file → Tower book) sufficient for campaign-real; treat write-back as a later residual so that activation finish line stays auth + escrow, not sync perfection.  
**Handoff:** both (PM: mark KU #7 deferred in outcomes; CTO: no V1 sync job requirement for running)

---

### crm-18 — What write-back would mean if revisited later

**Question:** If bidirectional returns post-V1, what practice shape is safe?  
**References:** Apollo selective bidirectional (engagement activity → CRM; CRM owns identity fields); Lawmatics resync patterns; Officio/VisaFlo as system-of-record for case data.  
**Thesis gap:** Naive two-way sync can corrupt the firm’s practice file with engagement-tool edits.  
**Solution:** If/when revisited, allow only **selective one-way write-back of engagement events** (sent/opened/silenced/meeting booked) with CRM remaining source of truth for identity/channels, so that Tower never becomes silent master of the practice record.  
**Handoff:** cto (future field-ownership matrix); pm (desk expectations — Board ≠ CRM admin)

---

### crm-19 — Connect → Audit handoff: what must be guaranteed

**Question:** What must book-connect guarantee before Book readiness / Audit can run?  
**References:** operator-book-readiness (on/after import or connect); Seed §5.2; World Audit batch; SME-GRAPH edge 7 → Audit/Book readiness.  
**Thesis gap:** Ambiguous “connected” leaves Audit with empty, demo, or non-mutable data and engagement enrollment blocked or unsafe.  
**Solution:** Guarantee a **tenancy-bound mutable contact set with provenance, match keys, channel candidates, and firm-authorized cohort boundary** so that Audit can answer reachability without inventing pathway scores.  
**Handoff:** both (PM: connect-complete state before Audit batch; CTO: invariants enforced in store)

---

### crm-20 — External validators: practice need only (CTO wires)

**Question:** Which external validation practices must connect anticipate naming for CTO?  
**References:** Seed §5.2 / OPERATOR-REVISIONS (external validation systems for email/phone); operator-book-readiness requirements; SME-GRAPH boundary (validators = CTO once practice names them).  
**Thesis gap:** Connect may dump raw strings; Audit cannot reach “reachable” without validation species named.  
**Solution:** Name practice need for **email syntax/deliverability-class checks and phone format/reachability-class checks** as Audit consumers of connect output — without selecting vendors here — so that CTO can integrate validators against the landed book.  
**Handoff:** cto (validator integrations); pm (verdict mapping reachable/partial/unreachable)

---

### crm-21 — Consent/silenced columns are not connect’s CASL judgment

**Question:** How should connect treat consent or “do not contact” columns from CRM/CSV?  
**References:** Seed §8.2 (firm DB auth ≠ client consent); Assump. 18; operator-book-readiness (consent/silenced as Audit data-validity inputs); seat 3 boundary.  
**Thesis gap:** Importing a “subscribed” CRM flag can be mistaken for Tower having solved consent.  
**Solution:** Pass through source **do-not-contact / silenced / marketing-status fields as opaque flags for Audit**, without interpreting CASL lawfulness in this seat, so that connect neither invents consent nor strips firm suppressions.  
**Handoff:** pm (flag handoff to Book readiness + seat 3); cto (preserve source suppression fields)

---

### crm-22 — Canadian data-residency sensitivity (under-claim)

**Question:** Does practice posture care where contact books go when authorizing a third party?  
**References:** VisaFlo (client data hosted in Canada as buyer criterion); RCIC App RCIC Drive (Canadian-hosted storage marketing); CICC professional obligations context (licensee remains responsible — product-adjacent, not counsel). NEEDS VERIFICATION: exact residency demands per firm contracts.  
**Thesis gap:** OAuth/CSV to a non-transparent processor may stall high-trust authorization even when technically easy.  
**Solution:** Surface **destination/tenancy and purpose minimization** (contacts for engagement reachability, not wholesale case-file clone) as part of authorization trust so that firms can complete the hard input without feeling they exported the whole practice.  
**Handoff:** both (PM: Authorize-book trust disclosures; CTO: tenancy isolation / retention proof)

---

### crm-23 — Activation ordering with escrow (edge 6↔7)

**Question:** Must database authorization land before escrow, or either order?  
**References:** Seed §6.3 both hard inputs; SME-GRAPH edge 6↔7↔4; World activation pins. Practice: firms rarely escrow money before knowing which book is in play; conversely some want commercial terms clear before sharing PII.  
**Thesis gap:** Undefined order creates activation deadlocks or PII-before-terms discomfort.  
**Solution:** Allow **either order but require both before running**, with book-connect never satisfied by escrow alone, so that campaign-real still depends on an authorized book while commercial door stays peer.  
**Handoff:** pm (activation state machine); cto (running flip requires both flags)

---

### crm-24 — Re-authorization / refresh without re-acquisition

**Question:** After V1 running, how do firms refresh a snapshot book without resetting ALG?  
**References:** SplitForge periodic CSV refresh; Mumara re-sync-on-demand; Seed evolution/KU open on sync.  
**Thesis gap:** Snapshot stacks go stale; forcing full reactivation destroys retention.  
**Solution:** Provide **in-desk re-hand-over (re-export/re-OAuth pull) that upserts by match key** so that currency improves without treating refresh as a new acquisition or new escrow event.  
**Handoff:** both (PM: refresh Authorize book leaf; CTO: upsert + Audit re-batch)

---

### crm-25 — Failure modes that must not count as “DB auth landed”

**Question:** Which false positives must the room refuse as activation success?  
**References:** Seed §14 (no DB in click budget; no claiming live persistence as shipped); §5.1 CSV mutation honesty; World hard input definition.  
**Thesis gap:** Checkbox auth, empty import, sample lists, or website scrape cosplay will show “activated” while no sequence-ready book exists.  
**Solution:** Fail closed unless **mutable authorized cohort + Audit-eligible channel candidates + non-acquisition timing** all hold, so that “database authorization” stays the high-trust firm act Seed named — not a UI completion event.  
**Handoff:** both (PM: never-sees / fail criteria; CTO: proof artifacts for auth landed)

---

## Handoff summary (seat 7)

| Owner | Absorb |
|---|---|
| **PM** | Single Authorize-book outcome with stack variants (file / OAuth / assisted confirm); cohort purpose; snapshot vs live language; connect-complete → Book readiness; KU #7 deferred; fail-closed success criteria; trust/minimization disclosures |
| **CTO** | Shared book schema + provenance; mutation honesty; match keys/upsert; enrollment gate on Audit; optional generic OAuth with minimal scopes; no V1 bidirectional sync; validator integration points; running requires auth∩escrow |
| **Not this seat** | Audit pathway scoring; eligibility semantics (seat 1); CASL counsel (seat 3); vendor selection for validators beyond naming practice need |

**Count:** 25  
**Path:** `/workspace/docs/sme/pass2/07-consultancy-crm-book-connect.md`
