# PM implementation — Immigration pathway / service-eligibility ops

**Pass:** PM implementation writing (paper only — no CT plant, no code)  
**Seat:** 1 — Immigration pathway / service-eligibility ops  
**Source:** `docs/sme/pass2/01-immigration-pathway-eligibility.md`  
**Vocab:** `docs/sme/implementation/00-SURFACE-VOCAB.md` + How trees under `docs/register/how/`  
**Style:** Exemplar `IMPLEMENTATION_STYLE.md` (fields · relative click-path · enum tags)

**Skip list:** `elig-24` (NEEDS VERIFICATION — speculative IRCC reform / Gazette watch; do not absorb as V1 surface law)  
**Count implemented:** 24  
**Count skipped:** 1  

---

### elig-01
**Solution echo:** Published pack must encode CEC/FSW/FST program minima (+ EE-aligned PNP nomination presence) before any-pathway may assert; non–EE base PNP stays out-of-pack until stream rules versioned.

**implementationProblem:**  
House packs can name pathways in the catalog without encoding evaluable IRCC program minima, so “any-pathway” can fire from labels alone. Non–Express Entry base PNP streams risk being treated as in-pack pathway passes.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Program-minimum gates panel, use the CEC, FSW, and FST gate rows plus the PNP nomination dropdown to require Express Entry-aligned nomination before overall pathway-pass may assert; set non-EE base PNP streams with the Stream scope dropdown to Out-of-pack until a versioned stream pack exists; click Publish version. On Analysis, view the pathway-pass chip only when those gate rows evaluate.

**implementationAdds:** `program-minimum-gates` · `out-of-pack` · `ee-aligned-pnp-nomination`

---

### elig-02
**Solution echo:** Split PNP into scoreable nomination-held / EE-aligned facts vs stream-fit hypotheses that only emit desk-review gaps — never pathway-pass from federal minima alone.

**implementationProblem:**  
PNP coverage that scores federal EE minima as if they predict provincial nomination creates Analysis claims a province would nominate. Stream-fit must not assert pathway pass without nomination fact or firm stream pack.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the PNP facts panel, choose Nomination-held / EE-aligned (scoreable) or Stream-fit hypothesis (gap only) from the PNP fact class dropdown; click Publish version. On Analysis, view Stream-fit hypothesis as a Possible provincial interest / desk review row without a pathway-pass chip until verified nomination or a bound stream pack exists.

**implementationAdds:** `nomination-held` · `ee-aligned` · `stream-fit-hypothesis` · `possible-provincial-interest`

---

### elig-03
**Solution echo:** Service-eligible = at least one firm-offered service family with positive B-* + confidence tier — never “will get ITA” or CRS-competitive.

**implementationProblem:**  
Analysis equates eligible with IRCC pool eligibility or draw odds. Desk needs language that maps only to retainerable firm services a licensee can stand behind.

**implementation:**  
On Analysis, view the Service-eligible chip only when a firm-offered service-family row has a positive B-* candidate and a Confidence tier chip of Program-minimum met, Partial, or Insufficient facts. Analysis never shows will-get-ITA or CRS-competitive chips as eligibility claims. On Live brief, view the same Service-eligible panel in the meeting view.

**implementationAdds:** `service-eligible` · `program-minimum-met` · `partial` · `insufficient-facts`

---

### elig-04
**Solution echo:** Reactivation-worthy = material service-posture change; pure missing self-reportables stay nudge-only unless time-critical ops windows fire.

**implementationProblem:**  
Engine 2 prefers reactivation when “reactivation-worthy,” but immigration practice never defined the predicate — meeting-grade change vs nudge-grade missing fields blur.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Motion class panel, use checkboxes for program-minimum newly met, category/draw newly cleared, nomination/offer/cert newly held, and time-critical ops window to tag Reactivation-worthy; leave outstanding self-reportables with the Motion class dropdown set to Nudge-only; click Publish version. On Analysis and Live brief, view the fired motion as a Reactivation-worthy or Nudge-only chip.

**implementationAdds:** `reactivation-worthy` · `nudge-only` · `time-critical-ops-window`

---

### elig-05
**Solution echo:** Nudge forms = offhand self-reportables only; PDFs/letters/certs/bank/medical proofs route exclusively to Manage.

**implementationProblem:**  
Field examples blur “status the client knows” with documents IRCC will verify, so consolidated forms risk becoming document intake.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Fact collection panel, choose Self-reportable, Document-dependent, or Employer-directed from the Collection class dropdown on each fact row; click Publish version. On Nudge form, view only Self-reportable form fields. On Client Brief, click the Manage panel for Document-dependent asks such as report PDFs, letters, bank proofs, certificates, police, and medical documents.

**implementationAdds:** `self-reportable` · `document-dependent` · `employer-directed`

---

### elig-06
**Solution echo:** ECA-missing is hard FSW (foreign education claimed) and CRS-points gap anywhere; never block CEC pathway-pass solely on missing ECA; still surface ECA as ranked CRS-improvement B-*.

**implementationProblem:**  
Global `eca_status` checklist falsely gap-flags CEC-ready contacts; IRCC necessity is pathway-conditioned.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the ECA conditions panel, use the FSW hard-minimum checkbox when foreign education is claimed and the CRS-points gap checkbox for any pathway; keep the CEC blocker checkbox off when ECA-missing is the only issue; click Publish version. On Analysis, view ECA as a ranked B-* CRS-improvement row without removing the CEC pathway-pass chip.

**implementationAdds:** `eca-missing-hard-fsw` · `crs-points-gap` · `cec-eca-nonblocking`

---

### elig-07
**Solution echo:** Profile existence / approx update / pool status self-reportable; NOC match and uploaded proofs stay Manage after reactivation.

**implementationProblem:**  
Packs wire EE profile flags to ops/gaps without separating self-reportable existence from profile accuracy and supporting-document currency.

**implementation:**  
On Nudge form, answer EE profile exists with a checkbox, approximate last-update / expiry window with date form fields, and still-in-pool with a checkbox. On Client Brief, click the Manage panel to view NOC lead-statement match, employment letters, and uploaded proofs as desk-verification rows after reactivation; those rows never appear as Nudge form fields.

**implementationAdds:** `ee-profile-exists` · `still-in-pool` · `manage-verification`

---

### elig-08
**Solution echo:** Self-report CLB bands / test product / test date; verify numbers and certificates on Manage; expire language-dependent claims past two-year windows.

**implementationProblem:**  
Forms may collect “scores” while IRCC only accepts named products and refuses expired results — claimed CLB can outlive verifiable currency.

**implementation:**  
On Nudge form, enter CLB-equivalent bands with score-band dropdowns, test product name with a dropdown, and test date with a date form field. On Client Brief, click the Manage panel to view result-verification number fields and certificate-file rows. On Analysis, view language-expired chips on language-dependent pathway and CRS rows when test date + 2 years is past the profile/application-relevant window.

**implementationAdds:** `clb-equivalent` · `language-expired` · `ircc-test-product`

---

### elig-09
**Solution echo:** Self-report title/dates/hours/TEER/flags → provisional signals; letters/wage/duty narratives → Manage before program-minimum-met confidence.

**implementationProblem:**  
Years-alone gates over-assert pathway pass while NOC duty match and authorization-to-work are the real refusal points.

**implementation:**  
On Nudge form, enter job title, country, start/end dates, hours/week, TEER guess, and student/self-employed flags in form fields and checkboxes for provisional pathway/gap signals. On Client Brief, click the Manage panel to view reference-letter, wage-proof, and duty-narrative rows; Analysis keeps the Confidence tier chip at Provisional until those rows support Program-minimum met.

**implementationAdds:** `provisional` · `program-minimum-met` · `teer-guess`

---

### elig-10
**Solution echo:** LMIA / arranged-employment / PNP employer support / payroll / trade sponsorship = employer-directed; contact may only yes/no rough offer/cert existence.

**implementationProblem:**  
Eligibility-critical employer-side instruments cannot be truthfully attested by the immigrant alone, but forms may still ask them.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Fact collection panel, choose Employer-directed from the Collection class dropdown for LMIA/work-permit employer particulars, arranged-employment letter contents, PNP employer support, payroll/revenue evidence, and trade-assessment sponsorship; click Publish version. On Nudge form, the contact only sees job offer/certificate exists checkboxes and rough end-date fields.

**implementationAdds:** `employer-directed` · `offer-exists-self-report` · `certificate-exists-self-report`

---

### elig-11
**Solution echo:** CRS additional-points for job offers off unless MI republishes; offer/cert remain FST (and applicable FSW) eligibility inputs only.

**implementationProblem:**  
Prototype matrices may still score arranged-employment CRS boosts discontinued 2025-03-25, creating Analysis liability while offers remain program gates.

**implementation:**  
Starting from Reference data, click Reference tables, then click the CRS additional points row. In the table editor, set Job-offer CRS points with the status dropdown to Off unless a future Ministerial Instruction republishes them, then click Publish version. Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; keep valid job offer / certificate-of-qualification as FST and applicable FSW selection-factor / funds-exemption input rows only; click Publish version. On Analysis, view no arranged-employment CRS boost score row.

**implementationAdds:** `job-offer-crs-off` · `offer-as-program-gate` · `certificate-of-qualification`

---

### elig-12
**Solution echo:** Funds yes/no + approx CAD vs published table for FSW/FST screen; no bank letters on forms; Manage “obtain PoF”; exempt CEC / authorized-worker-with-valid-offer.

**implementationProblem:**  
Proof of funds is program-minimum for FSW/FST (with exemptions) yet bank letters are document-dependent — forms must not harvest financial documents.

**implementation:**  
On Nudge form, answer funds available with a yes/no checkbox and approximate CAD availability with a currency form field against the published settlement-funds table for FSW/FST screening. On Client Brief, click the Manage panel to track an Obtain proof of funds row; bank-letter upload fields and account-number fields never appear on Nudge form. On Analysis, view CEC and authorized-worker-with-valid-offer paths with a Funds exempt chip.

**implementationAdds:** `funds-approx-cad` · `obtain-proof-of-funds` · `funds-exempt`

---

### elig-13
**Solution echo:** Category readiness only against version-pinned occupation/French rules; new match or cleared draw cutoff = reactivation-worthy; refuse free-text STEM/healthcare interest as pass.

**implementationProblem:**  
Category/draw outcome families can fire from narrative interest without binding to Ministerial Instruction–versioned occupation lists.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Category readiness panel, choose a version-pinned category occupation/French rule from the Reference tables dropdown before any category assertion can fire; click Publish version. On Analysis, view a new category match or newly cleared draw cutoff as a Reactivation-worthy chip. Free-text STEM/healthcare interest fields never produce a category-pass chip.

**implementationAdds:** `category-readiness` · `version-pinned` · `reactivation-worthy`

---

### elig-14
**Solution echo:** Every assertion carries confidence tier (insufficient / provisional / document-backed); Analysis templates state IRCC decides and CRS is an estimate.

**implementationProblem:**  
Open-box Analysis headlines risk reading as licensee advice without marking self-report vs verified-document posture.

**implementation:**  
On Analysis, view a Confidence tier chip on every pathway, gap, ops, and category assertion row: Insufficient facts, Provisional (self-report), or Document-backed (firm-confirmed). On Analysis narrative templates, view copy stating IRCC decides applications and CRS is an estimate. On Live brief, view the same tier chips and disclaimer in the meeting panel.

**implementationAdds:** `insufficient-facts` · `provisional` · `document-backed`

---

### elig-15
**Solution echo:** Packs = screening libraries; firm/licensee alone converts to advice/retainers/filings; Terms + Analysis forbid Tower-as-IRCC-determination until licensee adopts.

**implementationProblem:**  
House packs can be read as Om Coda legal conclusions. Regulated advice liability must stay with the practicing firm while IP stays with Om Coda.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. Open the Pack Terms panel, fill the terms text field to state packs are versioned screening/instrumentation libraries that propose service candidates and fact gaps only, and click Publish version. On Analysis, view copy that forbids representing Tower output as an IRCC determination or the firm's legal opinion until a licensee adopts it. On Live brief, view the same screening-not-advice panel.

**implementationAdds:** `screening-library` · `licensee-adopts`

---

### elig-16
**Solution echo:** Firm overlays = catalog mapping, reactivation thresholds, province-stream add-ons only; IRCC minima/CRS arithmetic house-locked; overlays declare divergence in provenance.

**implementationProblem:**  
Firms need specialization without silently rewriting federal program gates into unreviewable local truth.

**implementation:**  
On Firm operations bind, click a Firm row in the firm-bind index. On firm detail, click Bind packs. On Bind packs modal, choose Evaluation pack version, Automation pack version, and Engagement template version from the published-only dropdowns; set Firm overlay with the Service catalog mapping dropdown, Reactivation threshold form fields, and Province-stream add-ons checklist; click Bind. Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; keep IRCC program-minimum and CRS arithmetic rows house-locked with bind-only chips, not mutable fields; click Publish version. On Analysis, view overlay divergence in the Evaluation provenance panel.

**implementationAdds:** `firm-overlay` · `house-locked` · `overlay-divergence`

---

### elig-17
**Solution echo:** Outcome-family toggles = enablement layer; every fired R-*/B-* retains inspectable condition provenance tree pinned to pack+reference versions.

**implementationProblem:**  
Outcome toggles alone cannot explain why CEC passed and FSW failed on distinct grids — operators and desk need law-shaped reasons without authoring trees as primary UX.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Outcome-family panel, set service-family enablement with checkboxes for each R-*/B-* family; click Publish version. On Analysis, click any fired R-*/B-* row to open the Condition provenance panel showing human-readable failures such as failed FSW 67-grid language, missing ECA, or TEER out of range pinned to pack + reference versions, not the toggle headline alone.

**implementationAdds:** `outcome-family-toggle` · `condition-provenance`

---

### elig-18
**Solution echo:** FSW is two-stage — program-minimum + ≥67 selection-factor, then CRS estimate; never use CRS cutoff alone to assert or deny FSW pathway-pass.

**implementationProblem:**  
“Points” language conflates FSW entry gate with pool ranking — false pathway pass/fail from CRS alone.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the FSW evaluation panel, set Stage order checkboxes so program-minimum + >=67 selection-factor run before CRS estimate and CRS-cutoff-alone cannot assert FSW pathway-pass; click Publish version. On Analysis, click the FSW assertion row to view Program-minimum + >=67 selection-factor as separate stage chips from CRS estimate; view no FSW pathway-pass chip from CRS cutoff alone. In the Condition provenance panel, view both FSW stages as distinct rows.

**implementationAdds:** `fsw-67-grid` · `crs-estimate` · `fsw-two-stage`

---

### elig-19
**Solution echo:** FST assertions require designated NOC groups, 3,120h/2-in-5, language minima, and valid ≥1y job offer **or** Canadian certificate of qualification.

**implementationProblem:**  
Any-pathway includes FST, but thin TEER aliases of CEC miss FST-specific gates and document/employer dependence of offer/cert details.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Program-minimum gates panel, turn on FST checkboxes for designated NOC groups, 3,120-hour / 2-year-in-5 experience, language minima, and valid >=1-year job offer or Canadian certificate of qualification; click Publish version. On Client Brief, click the Manage panel to view certificate/offer detail rows as document- or employer-dependent before the Analysis Confidence tier chip may become Document-backed.

**implementationAdds:** `fst-noc-groups` · `3120-hours` · `offer-or-certificate`

---

### elig-20
**Solution echo:** CEC exclusion flags (FT student, unpaid, remote-outside-Canada, unauthorized) veto qualifying hours; docs/pay stubs Manage before document-backed.

**implementationProblem:**  
Self-reported Canadian work years can falsely pass CEC when student/unauthorized/remote-abroad work is not asked.

**implementation:**  
On Nudge form, answer CEC exclusion checkboxes for work while full-time student, unpaid/volunteer work, remote work while physically outside Canada, and unauthorized work; checked flags veto CEC qualifying hours. On Client Brief, click the Manage panel to view authorization-document and pay-stub rows before Document-backed confidence. On Analysis, view CEC pathway-pass only when those veto chips are clear.

**implementationAdds:** `cec-exclusion` · `ft-student-work` · `remote-outside-canada` · `unauthorized-work`

---

### elig-21
**Solution echo:** Bind B-* emission to firm-configured service catalog; suppress candidates the firm has not enabled.

**implementationProblem:**  
B-* service map can outrun the firm’s retainer menu, producing reactivation that sells services the licensee will not deliver.

**implementation:**  
On Firm operations bind, click a Firm row in the firm-bind index. On firm detail, click Bind packs. On Bind packs modal, choose Evaluation pack version, Automation pack version, and Engagement template version from the published-only dropdowns; set Service catalog with checkboxes for pathway application, ECA guidance, language retest plan, EE profile create/refresh, PNP strategy consult, and category readiness review; click Bind. On Analysis, view B-* candidate rows only for enabled catalog entries; disabled services never appear as reactivation sellables. On Live brief, view agenda service rows from the same catalog.

**implementationAdds:** `service-catalog` · `b-star-suppressed`

---

### elig-22
**Solution echo:** Unknown program-minimum → hard-fail pathway-pass; emit insufficient-facts + outstanding needs; no B-* pathway-file until minima populated.

**implementationProblem:**  
Always-on detection can treat unknowns as optimistic pathway passes to generate meetings.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Program-minimum gates panel, set Unknown handling with the dropdown to Hard-fail pathway-pass when a required field is unknown; click Publish version. On Analysis, view an Insufficient facts chip plus outstanding self-reportable needs rows, never a B-* pathway-file candidate until minima are populated. On Nudge form, those needs appear as consolidated form fields.

**implementationAdds:** `hard-fail-unknown-minimum` · `insufficient-facts` · `no-pathway-file-until-minima`

---

### elig-23
**Solution echo:** Persist pack version, reference-table version IDs, evaluation timestamp, confidence tier, and condition provenance on every signal/Analysis snapshot used for outreach or brief.

**implementationProblem:**  
When IRCC cutoffs/categories move, the firm cannot explain what Tower believed at send time unless evaluations freeze law/data versions.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Snapshot provenance panel, turn on checkboxes for pack version ID, reference-table version IDs, evaluation timestamp, confidence tier, and condition provenance on outreach and brief snapshots; click Publish version. On Analysis and Live brief, click Evaluation provenance to open a panel showing pack version, reference pins, timestamp, Confidence tier chip, and Condition provenance rows for what Tower believed at send time.

**implementationAdds:** `pack-version-id` · `reference-version-id` · `evaluation-timestamp` · `evaluation-provenance`

---

### elig-24 — SKIPPED
**Reason:** NEEDS VERIFICATION (consultation/secondary reform watch — not Gazette law). Do not encode speculative program shapes as V1 pack surface. Revisit when MI/IRPR structure changes.

---

### elig-25
**Solution echo:** Gate draw/category assertions on published & not-past-freshness reference pin; stale/missing → ops “reference data unavailable”; suppress draw/category reactivation.

**implementationProblem:**  
Seat 1 evaluators can invent cutoffs/lists; wrong or stale reference pins silently create reactivation-worthy service eligibility.

**implementation:**  
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Reference pins panel, set draw-cutoff and category-occupation assertions to require a Published and not-past-freshness-SLA reference pin from the Reference tables dropdown; click Publish version. On Analysis, view a Reference data unavailable ops chip when the pin is stale or missing, and draw/category reactivation rows are suppressed. On Reference data, click Publish version to publish the freshness SLA that packs consume.

**implementationAdds:** `freshness-sla` · `reference-data-unavailable` · `draw-category-suppressed`

---

## Tally

| | Count |
|---|---|
| Implemented | **24** |
| Skipped (`elig-24`) | **1** |
| Seat total | 25 |
