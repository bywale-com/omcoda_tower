# Pass1+Pass2 — Immigration pathway / service-eligibility ops

**Seat:** Immigration pathway / service-eligibility ops (SME Graph seat 1)  
**Producer:** Domain SME (eligibility practice) — not PM / CTO  
**Pass shape:** Combined Pass1 questions + Pass2 solutions  
**As of:** 2026-07-30  
**Item count:** 25  

## Focus gap (why called)

Tower ships immigration *service-eligibility* packs and form/Manage splits without a practice owner. Pressure: (1) V1 pathway/program coverage vs liability of house-authored packs; (2) which Client Data fields unlock gaps/ops vs must stay document-dependent / employer-directed; (3) what “service-eligible” and “reactivation-worthy” mean in desk-defensible language; (4) IP/liability Om Coda pack vs firm-configured rules; (5) outcomes-toggle-primary Rules vs condition trees for inspectability.

**Anchors:** Seed §2.6, §5.4–5.7, Assump. 4–5/8–9, KU #9/#13; World service eligibility / Analysis; Outcomes Operator · Configuration libraries; How `operator-configuration-libraries.md` Leaf 1.1, `contact-refresh.md`.

## Boundaries

- Do **not** design Hub UI or Configuration libraries chrome.
- Do **not** invent non-Immigration vertical packs.
- Do **not** rewrite Engine 2 precedence (Founder law).
- Not CASL / consent (seat 3). Not CRM connect (seat 7). Not full desk inhabit (seat 4) — sync only on license-facing eligibility claims.
- Sync mentally with IRCC reference-data currency (seat 2) and desk ops / license (seat 4); stay in eligibility practice.
- Solutions are domain mechanisms (`<mechanism> so that <purpose>`), not wireframes or personas.

---

### elig-01
**Question:** What is the minimum defensible V1 pathway surface for house-authored packs before Om Coda asserts “any-pathway” service eligibility?
**References:**
- Immigrate through Express Entry — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html
- Express Entry: Canadian Experience Class — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html
- Express Entry: Federal Skilled Worker Program — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
- Express Entry: Federal Skilled Trades Program — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html
**Thesis gap:** Seed §2.6 / §5.7 claim CEC **or** FSW **or** FST **or** PNP-* without stating which program-minimum gates must be fully encoded vs merely labeled before a pathway assertion may fire.
**Solution:** `Require a published pack version to encode program-minimum gates separately for CEC, FSW, and FST (and Express Entry–aligned PNP nomination presence only) before any overall pathway-pass may assert, and treat non–Express Entry base PNP streams as out-of-pack signals until stream rules are versioned` so that `“any-pathway” never means “named in the catalog” without evaluable IRCC minima`.
**Handoff:** both

### elig-02
**Question:** How should house packs treat Provincial Nominee Program coverage given that provinces set stream rules IRCC does not centralize?
**References:**
- Immigrate as a provincial nominee — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html
- Provincial Nominee Program Express Entry process: Who can apply — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees/express-entry/eligibility.html
**Thesis gap:** Seed’s `R-PNP-*` / OINP-shaped examples risk shipping province-cosplay as if federal EE rules suffice for nomination likelihood.
**Solution:** `Split PNP into (a) nomination-held / EE-aligned CRS boost facts the pack may score, versus (b) stream-fit hypotheses that may only emit “possible provincial interest / desk review” gaps without asserting pathway pass until a firm-configured stream pack or verified nomination fact exists` so that `Analysis never claims a province would nominate from federal minima alone`.
**Handoff:** both

### elig-03
**Question:** What is desk-defensible language for “service-eligible” versus IRCC program eligibility or CRS competitiveness?
**References:**
- Code of Professional Conduct for College of Immigration and Citizenship Consultants Licensees, SOR/2022-128 (competence / quality of service) — https://laws.justice.gc.ca/eng/regulations/SOR-2022-128/FullText.html
- Express Entry: Comprehensive Ranking System (CRS) criteria — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
**Thesis gap:** Seed equates eligible with “service-eligible under rules/matrix” without separating sellable service candidates from IRCC pool eligibility or draw odds.
**Solution:** `Define service-eligible as: under current Client Data + published pack version, at least one firm-offered service family (pathway file, gap remediation, ops hygiene, category readiness, draw watch) has a positive B-* candidate with explicit confidence tier (program-minimum met / partial / insufficient facts) — never as “will get ITA” or “is CRS-competitive”` so that `Analysis claims map to retainerable work a licensee can stand behind, not immigration outcomes`.
**Handoff:** pm

### elig-04
**Question:** What makes a contact “reactivation-worthy” in immigration-ops language (vs PM “campaign-worthy”)?
**References:**
- Express Entry: Create your profile and enter the pool (keep profile up-to-date; expiry) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/create-profile.html
- Express Entry: Rounds of invitations — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Express Entry: Category-based selection — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** Engine 2 says “reactivation first if reactivation-worthy” but Seed never defines the immigration predicate that distinguishes meeting-grade change from nudge-grade missing self-reportables.
**Solution:** `Treat reactivation-worthy as a material change in service posture: newly met program-minimum on a pathway the firm sells, newly crossed category/draw eligibility against published reference cutoffs, newly held nomination/job-offer/certificate facts that unlock a sellable file, or time-critical ops loss (profile/language/ECA validity windows) where delay risks losing pool standing — and keep pure missing self-reportables as nudge-only unless those windows fire` so that `reactivation equals “consultant should take this meeting now,” not “we need another form field”`.
**Handoff:** both

### elig-05
**Question:** Which Client Data facts are legitimately self-reportable for consolidated nudge forms versus document-dependent Manage items?
**References:**
- Express Entry: Language test results — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html
- Educational credential assessment — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html
- Documents for Express Entry: Proof of funds — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html
**Thesis gap:** Assump. 9 assumes the three-flag split drives forms vs Manage, but Seed’s examples (`eca_status`, work years, EE profile) blur “status the client knows” with “report IRCC will later verify.”
**Solution:** `Allow forms only for facts a contact can answer offhand without producing a document: approximate scores/CLB bands, test/ECA/expiry dates they hold, yes/no statuses (profile exists, ECA obtained, nomination held), province of residence intent, occupation title + rough dates/hours, marital/dependant counts — and route report PDFs, reference letters, bank letters, LMIA/job-offer letters, certificates of qualification, and police/medical proofs exclusively to Manage` so that `nudge forms never become document intake`.
**Handoff:** pm

### elig-06
**Question:** How should `eca_status` unlock gaps when ECA is mandatory for FSW foreign education but optional for CEC program minima?
**References:**
- Educational credential assessment — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html
- Express Entry: Federal Skilled Worker Program — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
- Express Entry: Canadian Experience Class — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html
**Thesis gap:** Seed lists `eca_status` as unlocking gaps/ops without pathway-conditioned semantics; a CEC-ready contact can be falsely gap-flagged.
**Solution:** `Emit ECA-missing as a hard FSW program-minimum gap (and as a CRS-points gap on any pathway) only when foreign education is claimed; never block CEC pathway-pass solely on missing ECA; still surface ECA as a ranked service candidate for CRS improvement` so that `gaps track IRCC necessity, not a single global checklist`.
**Handoff:** both

### elig-07
**Question:** Which EE profile fields unlock ops/gaps, and what must stay document-dependent after a self-report that a profile “exists”?
**References:**
- Express Entry: Create your profile and enter the pool — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/create-profile.html
- If my Express Entry profile expires, will the system keep my information? — IRCC Help Centre — https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1164&top=29
- Ministerial Instructions respecting the Express Entry system (pool duration / language & ECA age rules) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html
**Thesis gap:** Seed wires `ee_profile_exists` / `ee_profile_last_updated` to R-OPS/R-GAP without stating that profile existence is self-reportable while profile accuracy and supporting-document currency are not form-collectible.
**Solution:** `Treat profile existence, approximate last-update / expiry window, and “still in pool” as self-reportable ops signals; treat NOC lead-statement match, employment letters, and uploaded proofs as Manage/desk verification after reactivation` so that `ops hygiene can nudge without pretending a form validates an EE profile`.
**Handoff:** both

### elig-08
**Question:** How should language facts be classified given IRCC’s approved tests and two-year validity checkpoints?
**References:**
- Express Entry: Language test results — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html
- Do I need a language test to immigrate to Canada? — IRCC Help Centre — https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=638
**Thesis gap:** Forms may collect “scores,” but IRCC refuses applications with expired results and only accepts named test products — pack semantics must distinguish claimed CLB from verifiable result currency.
**Solution:** `Self-report CLB-equivalent bands, test product name, and test date for eligibility/re-test ops; keep result verification numbers and certificate files as Manage items; expire language-dependent pathway and CRS claims when test date + 2 years is past profile/application-relevant windows` so that `language unlocks scoring without accepting non-IRCC tests or stale claims as durable truth`.
**Handoff:** both

### elig-09
**Question:** Which work-history facts unlock pathway gates versus which must remain document-dependent because officers match duties to NOC lead statements?
**References:**
- Find your National Occupational Classification (NOC) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/find-national-occupation-code.html
- National Occupational Classification — ESDC — https://noc.esdc.gc.ca/
- Express Entry: Canadian Experience Class (paid work; no full-time student / unpaid) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html
**Thesis gap:** Seed’s `foreign_work_years` and TEER-style gates can over-assert pathway pass from years alone while NOC duty match and authorization-to-work facts are the real refusal points.
**Solution:** `Allow self-report of job title, country, start/end, hours/week, TEER guess, and student/self-employed flags to drive provisional pathway/gap signals; require employer-directed or Manage capture for reference letters, wage proofs, and duty narratives before elevating confidence from provisional to program-minimum met` so that `years unlock screening, not desk-certified NOC eligibility`.
**Handoff:** both

### elig-10
**Question:** What must be employer-directed rather than asked of the contact on firm→client forms?
**References:**
- Express Entry: Job offer — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/job-offer.html
- Hire a provincial nominee — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/hire-permanent-foreign/provincial-nominee.html
- Federal Skilled Trades Program (job offer or certificate of qualification) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html
**Thesis gap:** Seed names employer-directed routing but does not inventory which eligibility-critical facts the client cannot truthfully supply alone.
**Solution:** `Route LMIA/work-permit employer particulars, arranged-employment letter contents, employer willingness for PNP support, payroll/revenue evidence, and trade-assessment employer sponsorship asks to employer-directed or firm-desk tracks; the contact may only self-report whether they believe a job offer/certificate exists and its rough end date` so that `forms never deputize the immigrant to attest employer-side immigration instruments`.
**Handoff:** pm

### elig-11
**Question:** How should packs treat job offers after IRCC removed CRS points for arranged employment while some program minima still require offers or certificates?
**References:**
- Express Entry: Job offer — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/job-offer.html
- Express Entry: Federal Skilled Trades Program — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html
**Thesis gap:** Prototype matrices and consultant mental models may still score job-offer CRS boosts that IRCC discontinued on 2025-03-25, creating Analysis liability.
**Solution:** `Version reference/rules so CRS additional-points for job offers are off unless a future Ministerial Instruction republishes them; continue using valid job offer / certificate-of-qualification only as FST (and applicable FSW selection-factor / proof-of-funds exemption) eligibility inputs` so that `packs reflect current law: offer ≠ CRS boost, offer may still be a program gate`.
**Handoff:** both

### elig-12
**Question:** How should proof-of-funds interact with service eligibility and form collection?
**References:**
- Documents for Express Entry: Proof of funds — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html
- Immigration and Refugee Protection Regulations, SOR/2002-227, s. 76 (settlement funds for FSW class) — https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-76.html
**Thesis gap:** Funds are program-minimum for FSW/FST (with exemptions) yet Seed field examples omit them; bank letters are inherently document-dependent.
**Solution:** `Allow a self-reportable yes/no + approximate CAD availability against the published annual table for FSW/FST screening; never request bank letters or account numbers on nudge forms; emit Manage “obtain proof of funds” and exempt CEC or authorized-worker-with-valid-offer paths` so that `funds gate pathway confidence without turning engagement into financial-document harvest`.
**Handoff:** both

### elig-13
**Question:** How should category-based selection affect V1 pack coverage and reactivation triggers?
**References:**
- Express Entry: Category-based selection — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- Canada prioritizes top talent in 2026 immigration Express Entry categories — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/02/canada-prioritizes-top-talent-in-2026-immigration-express-entry-categories.html
- Express Entry: Rounds of invitations — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
**Thesis gap:** Seed names category/draw outcome families but does not require packs to bind to versioned category occupation lists that change by Ministerial Instruction.
**Solution:** `Assert category readiness only against published, version-pinned category occupation/French rules from reference data; treat a new category match or a draw cutoff the contact newly clears as reactivation-worthy; refuse free-text “STEM/healthcare interest” as a category pass` so that `category claims stay data-driven with seat 2, not narrative marketing`.
**Handoff:** both

### elig-14
**Question:** What confidence tiers must Analysis expose so house packs do not read as guaranteed advice under CICC competence duties?
**References:**
- Code of Professional Conduct for College of Immigration and Citizenship Consultants Licensees, SOR/2022-128, ss. 19–22 — https://laws.justice.gc.ca/eng/regulations/SOR-2022-128/FullText.html
- Express Entry: Check your score — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html
**Thesis gap:** Open-box Analysis headlines risk sounding like licensee advice without marking provisional self-report vs verified-document posture.
**Solution:** `Mandate every pathway/gap/ops/category assertion carry a confidence tier — insufficient facts / provisional (self-report) / document-backed (firm-confirmed) — and require Analysis narrative templates to state that IRCC decides applications and that CRS is an estimate` so that `service eligibility is screening for firm services, not a substitute opinion letter`.
**Handoff:** pm

### elig-15
**Question:** Where does liability sit between Om Coda–shipped packs and firm-configured / firm-bound rules (KU #9)?
**References:**
- Code of Professional Conduct for College of Immigration and Citizenship Consultants Licensees, SOR/2022-128, s. 30 (errors or omissions) — https://laws-lois.justice.gc.ca/eng/regulations/SOR-2022-128/section-30.html
- College of Immigration and Citizenship Consultants — Professional Liability Insurance Regulation (mandatory PLI) — https://college-ic.ca/ICCRC/Assets/Documents/Regulations/Professional%20Liability%20Insurance%20Regulation%202021-001-Final-EN.pdf
**Thesis gap:** Assump. 5 hopes packs can be “liability-safe enough” without a practice boundary stating who authors legal conclusions versus who delivers regulated advice.
**Solution:** `Position Om Coda packs as versioned screening/instrumentation libraries that propose service candidates and fact gaps; position the firm/licensee as the only party that converts candidates into advice, retainers, and filings; require pack Terms + Analysis copy to forbid representing Tower output as IRCC determination or as the firm’s legal opinion until a licensee adopts it` so that `IP can remain Om Coda’s while regulated advice liability stays with the practicing firm`.
**Handoff:** both

### elig-16
**Question:** What authorship model keeps firm-configured rules inspectable without letting firms silently rewrite house IRCC minima?
**References:**
- Code of Professional Conduct for College of Immigration and Citizenship Consultants Licensees, SOR/2022-128, s. 19 (competence; refrain from services beyond competence/licence) — https://laws.justice.gc.ca/eng/regulations/SOR-2022-128/FullText.html
- Seed/World agency shape (operator Configuration libraries) — product commitment; external practice: licensee remains responsible for advice quality.
**Thesis gap:** KU #9 open ownership vs World house-authored packs leaves unclear whether firms may override federal program gates.
**Solution:** `Allow firm overlays only for service catalog mapping, reactivation thresholds, and province-stream add-ons, while locking IRCC program-minimum and CRS arithmetic to house-published versions that firms bind but cannot silently mutate; require overlays to declare divergence in evaluation provenance` so that `firms can specialize offerings without forking federal law into unreviewable local truth`.
**Handoff:** both

### elig-17
**Question:** Are outcomes-toggle-primary Rules practice-safe, or are condition trees required for inspectability (KU #13 / O-12)?
**References:**
- Ministerial Instructions respecting the Express Entry system (factor categories are structured, not outcome slogans) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html
- Express Entry: Federal Skilled Worker Program (selection factors vs CRS) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
**Thesis gap:** Seed prefers outcome-family toggles in primary Rule config; practice requires explaining *why* CEC passed and FSW failed on distinct grids.
**Solution:** `Keep outcome-family toggles as the operator’s enablement layer (which service families may fire), but require every fired R-*/B-* to retain an inspectable condition provenance tree pinned to pack+reference versions — human-readable as “failed FSW 67-grid language / missing ECA / TEER out of range,” not only a toggled headline` so that `operators and desk can audit law-shaped reasons without authoring trees as the primary UX metaphor`.
**Handoff:** both

### elig-18
**Question:** How must packs distinguish FSW’s 67-point selection grid from CRS ranking so Analysis does not conflate them?
**References:**
- Express Entry: Federal Skilled Worker Program (67 points ≠ CRS) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
- Eligibility for Express Entry programs: How we rank your profile — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/.html
- Immigration and Refugee Protection Regulations, SOR/2002-227, s. 76 — https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-76.html
**Thesis gap:** Matrix language often says “points” without separating program entry gate from pool ranking — a classic false-negative/false-positive source.
**Solution:** `Model FSW as two-stage: (1) program-minimum + ≥67 selection-factor eligibility, then (2) CRS estimate for draw/ops; never use CRS cutoff alone to assert or deny FSW pathway pass` so that `service eligibility respects IRCC’s two different point systems`.
**Handoff:** cto

### elig-19
**Question:** Which FST-specific gates must house packs encode before asserting `R-FST-*`?
**References:**
- Express Entry: Federal Skilled Trades Program — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html
**Thesis gap:** Any-pathway law includes FST, but FST’s NOC group list, 2-year/5-year experience window, and job-offer-or-certificate alternative differ sharply from CEC/FSW.
**Solution:** `Require FST assertions to check designated NOC groups, 3,120-hour/2-year-in-5 experience, language minima, and (valid ≥1-year job offer **or** Canadian certificate of qualification), with certificate/offer details document- or employer-dependent` so that `FST is not a thin TEER alias of CEC`.
**Handoff:** both

### elig-20
**Question:** How should CEC-specific exclusions (full-time student work, unpaid, remote-outside-Canada) affect field classification and provisional passes?
**References:**
- Express Entry: Canadian Experience Class — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html
**Thesis gap:** Self-reported “Canadian work years” can falsely pass CEC if student/unauthorized/remote-abroad work is not asked.
**Solution:** `Add self-reportable exclusion flags (work while full-time student, unpaid/volunteer, remote while physically outside Canada, unauthorized work) that veto CEC qualifying hours; keep authorization documents and pay stubs as Manage confirmation before document-backed confidence` so that `CEC pathway-pass tracks IRCC counting rules, not calendar years in Canada`.
**Handoff:** both

### elig-21
**Question:** What may Analysis recommend as B-* “services” without inventing regulated acts the firm does not sell?
**References:**
- Code of Professional Conduct for College of Immigration and Citizenship Consultants Licensees, SOR/2022-128, ss. 19–20, 23 (service agreements / scope) — https://laws.justice.gc.ca/eng/regulations/SOR-2022-128/FullText.html
**Thesis gap:** Seed’s B-* service map can outrun a firm’s actual retainer menu, creating outreach that the desk cannot ethically fulfill.
**Solution:** `Bind B-* emission to the firm’s configured service catalog (pathway application, ECA guidance, language retest plan, EE profile create/refresh, PNP strategy consult, category readiness review) and suppress service candidates the firm has not enabled` so that `reactivation never sells a service the licensee will not deliver`.
**Handoff:** pm

### elig-22
**Question:** How should missing-data signals interact with service eligibility without becoming fake pathway passes?
**References:**
- Express Entry: Create your profile and enter the pool (what can make you ineligible while in the pool) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/create-profile.html
- Seed Engine 2 (detection including missing-data is a signal; outreach separate) — product law; practice requires not equating unknown with eligible.
**Thesis gap:** Always-on detection can tempt packs to treat unknowns as optimistic passes to generate meetings.
**Solution:** `Hard-fail pathway-pass when a program-minimum field is unknown; emit insufficient-facts + self-reportable outstanding needs; allow only low-confidence “possible” gap/ops narratives, never B-* pathway-file candidates, until minima are populated` so that `uncertainty drives collection, not false service eligibility`.
**Handoff:** both

### elig-23
**Question:** What versioning / provenance must travel with every eligibility evaluation for desk defense and house liability?
**References:**
- Ministerial Instructions respecting the Express Entry system (current) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html
- Express Entry: Category-based selection (categories established by the Minister; change over time) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** Seed requires versioned reference tables and open-box packs but does not require evaluations to freeze which law/data version produced a reactivation.
**Solution:** `Persist pack version ID, reference-table version IDs, evaluation timestamp, confidence tier, and condition provenance with every signal/Analysis snapshot used for outreach or brief` so that `when IRCC cutoffs/categories move, the firm can explain what Tower believed at send time`.
**Handoff:** cto

### elig-24
**Question:** How should proposed IRCC structural reforms (e.g., consolidating federal skilled classes) constrain V1 pack design without chasing consultation vapor?
**References:**
- Immigrate through Express Entry (programs currently in force: CEC, FSW, FST) — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html
- Major Express Entry Changes Could Be Coming to Canada in 2026 — Nihang Law (secondary; consultation proposals not Gazette law) — https://www.nihanglaw.ca/major-express-entry-changes-coming-canada-2026/ *(practice watch — not enacted)*
**Thesis gap:** Product pressure to “future-proof” packs can invent program shapes that are not law, conflicting with Assump. 4’s Canada V1 depth.
**Solution:** `Encode only programs and CRS rules published as current IRCC pages / Ministerial Instructions / IRPR; isolate speculative reform as non-firing research notes; require a new pack major version when Gazette/Instructions change program structure` so that `V1 liability stays on today’s three federal EE programs + EE-aligned PNP nomination facts`.
**Handoff:** both

### elig-25
**Question:** What handoff contract must eligibility practice demand from reference-data currency (seat 2) before packs may assert draw/category outcomes?
**References:**
- Express Entry: Rounds of invitations — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Express Entry: Comprehensive Ranking System (CRS) criteria — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
- Express Entry: Category-based selection — Canada.ca — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** Seat 1 can invent cutoffs/lists inside evaluators; Seed Directive-3 intent is data-without-deploy, but eligibility practice must refuse assertions on stale/unpublished tables.
**Solution:** `Gate draw-cutoff and category-occupation assertions on a “published & not past freshness SLA” reference pin; if the pin is stale or missing, emit ops “reference data unavailable” and suppress reactivation from draw/category families` so that `wrong cutoffs cannot silently create reactivation-worthy service eligibility`.
**Handoff:** both

---

## Coverage map (focus pressures → items)

| Pressure | Items |
|---|---|
| (1) V1 pathway coverage vs pack liability | elig-01, elig-02, elig-13, elig-18, elig-19, elig-20, elig-24 |
| (2) Field classification unlocks | elig-05, elig-06, elig-07, elig-08, elig-09, elig-10, elig-12 |
| (3) Service-eligible / reactivation-worthy language | elig-03, elig-04, elig-14, elig-21, elig-22 |
| (4) Om Coda pack vs firm rules IP/liability | elig-15, elig-16, elig-23 |
| (5) Outcomes toggles vs condition trees | elig-17, elig-18, elig-25 |

## Sync notes (not owned here)

- **Seat 2 (reference-data):** owns table freshness/SLA and publish semantics; this seat owns which assertions may fire on those tables (elig-13, elig-25).
- **Seat 4 (desk ops):** owns what consultants must see before authorizing outreach; this seat owns what eligibility claims are defensible to put in Analysis/briefs (elig-03, elig-14, elig-15).
- **CASL / CRM:** out of scope.
