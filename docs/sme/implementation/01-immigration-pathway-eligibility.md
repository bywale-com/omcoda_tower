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
On Evaluation pack editor, you can now require Program-minimum gates separately for CEC, FSW, and FST, plus Express Entry–aligned PNP nomination presence, before overall pathway-pass may assert. On Evaluation pack editor, non–EE base PNP streams stay Out-of-pack until a versioned stream pack exists. On Analysis, pathway-pass only appears when those gates evaluate.

*Existing: Configuration libraries · Evaluation packs · Evaluation pack editor · Analysis. New: Program-minimum gates (Block).*

**implementationAdds:** `program-minimum-gates` · `out-of-pack` · `ee-aligned-pnp-nomination`

---

### elig-02
**Solution echo:** Split PNP into scoreable nomination-held / EE-aligned facts vs stream-fit hypotheses that only emit desk-review gaps — never pathway-pass from federal minima alone.

**implementationProblem:**  
PNP coverage that scores federal EE minima as if they predict provincial nomination creates Analysis claims a province would nominate. Stream-fit must not assert pathway pass without nomination fact or firm stream pack.

**implementation:**  
On Evaluation pack editor, you can now set PNP fact class to Nomination-held / EE-aligned (scoreable) or Stream-fit hypothesis (gap only). On Analysis, Stream-fit hypothesis emits Possible provincial interest / desk review without pathway-pass until verified nomination or a bound stream pack exists.

*Existing: Evaluation pack editor · Analysis. New: PNP fact class (Block control).*

**implementationAdds:** `nomination-held` · `ee-aligned` · `stream-fit-hypothesis` · `possible-provincial-interest`

---

### elig-03
**Solution echo:** Service-eligible = at least one firm-offered service family with positive B-* + confidence tier — never “will get ITA” or CRS-competitive.

**implementationProblem:**  
Analysis equates eligible with IRCC pool eligibility or draw odds. Desk needs language that maps only to retainerable firm services a licensee can stand behind.

**implementation:**  
On Analysis, you can now see Service-eligible only when a firm-offered service family has a positive B-* candidate with confidence tier (program-minimum met / partial / insufficient facts). Analysis never shows will-get-ITA or CRS-competitive as eligibility claims. On Live brief, the same Service-eligible framing carries into the meeting view.

*Existing: Analysis · Live brief. New: Service-eligible claim language (copy contract on Analysis).*

**implementationAdds:** `service-eligible` · `program-minimum-met` · `partial` · `insufficient-facts`

---

### elig-04
**Solution echo:** Reactivation-worthy = material service-posture change; pure missing self-reportables stay nudge-only unless time-critical ops windows fire.

**implementationProblem:**  
Engine 2 prefers reactivation when “reactivation-worthy,” but immigration practice never defined the predicate — meeting-grade change vs nudge-grade missing fields blur.

**implementation:**  
On Evaluation pack editor, you can now mark signals Reactivation-worthy when program-minimum newly met, category/draw newly cleared, nomination/offer/cert newly held, or time-critical ops windows fire — otherwise outstanding self-reportables stay Nudge-only. On Analysis and Live brief, you can now see the motion class (reactivation vs nudge) that fired.

*Existing: Evaluation pack editor · Analysis · Live brief. New: Reactivation-worthy / Nudge-only motion class tags.*

**implementationAdds:** `reactivation-worthy` · `nudge-only` · `time-critical-ops-window`

---

### elig-05
**Solution echo:** Nudge forms = offhand self-reportables only; PDFs/letters/certs/bank/medical proofs route exclusively to Manage.

**implementationProblem:**  
Field examples blur “status the client knows” with documents IRCC will verify, so consolidated forms risk becoming document intake.

**implementation:**  
On Evaluation pack editor, you can now set Collection class to Self-reportable, Document-dependent, or Employer-directed per fact. On Nudge form, only Self-reportable facts appear. On Client Brief, you can now open Manage for Document-dependent asks (report PDFs, letters, bank proofs, certificates, police/medical).

*Existing: Evaluation pack editor · Nudge form · Client Brief. New: Collection class · Manage (Block).*

**implementationAdds:** `self-reportable` · `document-dependent` · `employer-directed`

---

### elig-06
**Solution echo:** ECA-missing is hard FSW (foreign education claimed) and CRS-points gap anywhere; never block CEC pathway-pass solely on missing ECA; still surface ECA as ranked CRS-improvement B-*.

**implementationProblem:**  
Global `eca_status` checklist falsely gap-flags CEC-ready contacts; IRCC necessity is pathway-conditioned.

**implementation:**  
On Evaluation pack editor, you can now condition ECA-missing as Hard program-minimum on FSW when foreign education is claimed, and as CRS-points gap on any pathway — never as sole CEC pathway blocker. On Analysis, ECA still appears as a ranked B-* CRS-improvement candidate without denying CEC pathway-pass.

*Existing: Evaluation pack editor · Analysis.*

**implementationAdds:** `eca-missing-hard-fsw` · `crs-points-gap` · `cec-eca-nonblocking`

---

### elig-07
**Solution echo:** Profile existence / approx update / pool status self-reportable; NOC match and uploaded proofs stay Manage after reactivation.

**implementationProblem:**  
Packs wire EE profile flags to ops/gaps without separating self-reportable existence from profile accuracy and supporting-document currency.

**implementation:**  
On Nudge form, you can now answer EE profile exists, approximate last-update / expiry window, and still-in-pool. On Client Brief → Manage, NOC lead-statement match, employment letters, and uploaded proofs stay desk verification after reactivation — never on Nudge form.

*Existing: Nudge form · Client Brief. New: Manage (Block) — same as elig-05.*

**implementationAdds:** `ee-profile-exists` · `still-in-pool` · `manage-verification`

---

### elig-08
**Solution echo:** Self-report CLB bands / test product / test date; verify numbers and certificates on Manage; expire language-dependent claims past two-year windows.

**implementationProblem:**  
Forms may collect “scores” while IRCC only accepts named products and refuses expired results — claimed CLB can outlive verifiable currency.

**implementation:**  
On Nudge form, you can now enter CLB-equivalent bands, test product name, and test date. On Client Brief → Manage, result verification numbers and certificate files live. On Analysis, language-dependent pathway and CRS claims expire when test date + 2 years is past the profile/application-relevant window.

*Existing: Nudge form · Client Brief · Analysis. New: Manage (Block).*

**implementationAdds:** `clb-equivalent` · `language-expired` · `ircc-test-product`

---

### elig-09
**Solution echo:** Self-report title/dates/hours/TEER/flags → provisional signals; letters/wage/duty narratives → Manage before program-minimum-met confidence.

**implementationProblem:**  
Years-alone gates over-assert pathway pass while NOC duty match and authorization-to-work are the real refusal points.

**implementation:**  
On Nudge form, you can now self-report job title, country, start/end, hours/week, TEER guess, and student/self-employed flags for provisional pathway/gap signals. On Client Brief → Manage, reference letters, wage proofs, and duty narratives are required before Analysis confidence elevates from Provisional to Program-minimum met.

*Existing: Nudge form · Client Brief · Analysis. New: Manage (Block).*

**implementationAdds:** `provisional` · `program-minimum-met` · `teer-guess`

---

### elig-10
**Solution echo:** LMIA / arranged-employment / PNP employer support / payroll / trade sponsorship = employer-directed; contact may only yes/no rough offer/cert existence.

**implementationProblem:**  
Eligibility-critical employer-side instruments cannot be truthfully attested by the immigrant alone, but forms may still ask them.

**implementation:**  
On Evaluation pack editor, you can now route LMIA/work-permit employer particulars, arranged-employment letter contents, PNP employer support, payroll/revenue evidence, and trade-assessment sponsorship to Employer-directed (firm-desk track). On Nudge form, the contact may only answer whether a job offer/certificate exists and its rough end date.

*Existing: Evaluation pack editor · Nudge form. New: Employer-directed routing (Collection class value).*

**implementationAdds:** `employer-directed` · `offer-exists-self-report` · `certificate-exists-self-report`

---

### elig-11
**Solution echo:** CRS additional-points for job offers off unless MI republishes; offer/cert remain FST (and applicable FSW) eligibility inputs only.

**implementationProblem:**  
Prototype matrices may still score arranged-employment CRS boosts discontinued 2025-03-25, creating Analysis liability while offers remain program gates.

**implementation:**  
On Reference tables (CRS additional points), you can now publish Job-offer CRS points as Off unless a future Ministerial Instruction republishes them. On Evaluation pack editor, valid job offer / certificate-of-qualification remain FST (and applicable FSW selection-factor / funds-exemption) inputs only. On Analysis, arranged-employment CRS boost never appears as a scored claim.

*Existing: Reference data · Reference tables · Evaluation pack editor · Analysis.*

**implementationAdds:** `job-offer-crs-off` · `offer-as-program-gate` · `certificate-of-qualification`

---

### elig-12
**Solution echo:** Funds yes/no + approx CAD vs published table for FSW/FST screen; no bank letters on forms; Manage “obtain PoF”; exempt CEC / authorized-worker-with-valid-offer.

**implementationProblem:**  
Proof of funds is program-minimum for FSW/FST (with exemptions) yet bank letters are document-dependent — forms must not harvest financial documents.

**implementation:**  
On Nudge form, you can now answer funds yes/no and approximate CAD availability against the published settlement-funds table for FSW/FST screening. On Client Brief → Manage, you can now track Obtain proof of funds — never bank letters or account numbers on Nudge form. On Analysis, CEC and authorized-worker-with-valid-offer paths show funds exempt.

*Existing: Nudge form · Client Brief · Analysis · Reference tables. New: Manage (Block).*

**implementationAdds:** `funds-approx-cad` · `obtain-proof-of-funds` · `funds-exempt`

---

### elig-13
**Solution echo:** Category readiness only against version-pinned occupation/French rules; new match or cleared draw cutoff = reactivation-worthy; refuse free-text STEM/healthcare interest as pass.

**implementationProblem:**  
Category/draw outcome families can fire from narrative interest without binding to Ministerial Instruction–versioned occupation lists.

**implementation:**  
On Evaluation pack editor, you can now assert Category readiness only against a version-pinned category occupation/French rule from Reference tables. On Analysis, a new category match or newly cleared draw cutoff marks Reactivation-worthy. Free-text STEM/healthcare interest never produces category-pass.

*Existing: Evaluation pack editor · Reference tables · Analysis.*

**implementationAdds:** `category-readiness` · `version-pinned` · `reactivation-worthy`

---

### elig-14
**Solution echo:** Every assertion carries confidence tier (insufficient / provisional / document-backed); Analysis templates state IRCC decides and CRS is an estimate.

**implementationProblem:**  
Open-box Analysis headlines risk reading as licensee advice without marking self-report vs verified-document posture.

**implementation:**  
On Analysis, you can now see Confidence tier on every pathway/gap/ops/category assertion — Insufficient facts / Provisional (self-report) / Document-backed (firm-confirmed). On Analysis narrative templates, copy states IRCC decides applications and CRS is an estimate. On Live brief, the same tiers and disclaimer carry.

*Existing: Analysis · Live brief. New: Confidence tier (Block field on Analysis).*

**implementationAdds:** `insufficient-facts` · `provisional` · `document-backed`

---

### elig-15
**Solution echo:** Packs = screening libraries; firm/licensee alone converts to advice/retainers/filings; Terms + Analysis forbid Tower-as-IRCC-determination until licensee adopts.

**implementationProblem:**  
House packs can be read as Om Coda legal conclusions. Regulated advice liability must stay with the practicing firm while IP stays with Om Coda.

**implementation:**  
On Evaluation pack editor, you can now open Pack Terms stating packs are versioned screening/instrumentation libraries that propose service candidates and fact gaps only. On Analysis, copy forbids representing Tower output as IRCC determination or as the firm’s legal opinion until a licensee adopts it. On Live brief, screening-not-advice framing matches.

*Existing: Evaluation pack editor · Analysis · Live brief. New: Pack Terms (Block).*

**implementationAdds:** `screening-library` · `licensee-adopts`

---

### elig-16
**Solution echo:** Firm overlays = catalog mapping, reactivation thresholds, province-stream add-ons only; IRCC minima/CRS arithmetic house-locked; overlays declare divergence in provenance.

**implementationProblem:**  
Firms need specialization without silently rewriting federal program gates into unreviewable local truth.

**implementation:**  
On Firm operations bind → Bind packs, you can now attach Firm overlay only for service catalog mapping, reactivation thresholds, and province-stream add-ons. On Evaluation pack editor, IRCC program-minimum and CRS arithmetic stay house-locked (bind-only, not mutable). On Analysis, overlay divergence appears in Evaluation provenance.

*Existing: Firm operations bind · Bind packs · Evaluation pack editor · Analysis. New: Firm overlay · Evaluation provenance (Block fields).*

**implementationAdds:** `firm-overlay` · `house-locked` · `overlay-divergence`

---

### elig-17
**Solution echo:** Outcome-family toggles = enablement layer; every fired R-*/B-* retains inspectable condition provenance tree pinned to pack+reference versions.

**implementationProblem:**  
Outcome toggles alone cannot explain why CEC passed and FSW failed on distinct grids — operators and desk need law-shaped reasons without authoring trees as primary UX.

**implementation:**  
On Evaluation pack editor, you can now keep Outcome-family toggles as the enablement layer (which service families may fire). On Analysis, every fired R-*/B-* opens Condition provenance showing human-readable failures (e.g. failed FSW 67-grid language / missing ECA / TEER out of range) pinned to pack + reference versions — not toggle headline alone.

*Existing: Evaluation pack editor · Analysis. New: Condition provenance (Block / Submodal).*

**implementationAdds:** `outcome-family-toggle` · `condition-provenance`

---

### elig-18
**Solution echo:** FSW is two-stage — program-minimum + ≥67 selection-factor, then CRS estimate; never use CRS cutoff alone to assert or deny FSW pathway-pass.

**implementationProblem:**  
“Points” language conflates FSW entry gate with pool ranking — false pathway pass/fail from CRS alone.

**implementation:**  
Wiring absorb (CTO): model FSW evaluator as two-stage (67-grid eligibility then CRS estimate); forbid CRS-cutoff-alone for FSW pathway-pass.  
On Analysis, you can now inspect FSW as Program-minimum + ≥67 selection-factor separate from CRS estimate; CRS cutoff alone never asserts or denies FSW pathway-pass. On Condition provenance, both stages show distinctly.

*Existing: Analysis. New: Condition provenance (same as elig-17). FSW two-stage labels on Analysis.*

**implementationAdds:** `fsw-67-grid` · `crs-estimate` · `fsw-two-stage`

---

### elig-19
**Solution echo:** FST assertions require designated NOC groups, 3,120h/2-in-5, language minima, and valid ≥1y job offer **or** Canadian certificate of qualification.

**implementationProblem:**  
Any-pathway includes FST, but thin TEER aliases of CEC miss FST-specific gates and document/employer dependence of offer/cert details.

**implementation:**  
On Evaluation pack editor → Program-minimum gates, you can now require FST checks for designated NOC groups, 3,120-hour / 2-year-in-5 experience, language minima, and (valid ≥1-year job offer **or** Canadian certificate of qualification). On Client Brief → Manage, certificate/offer details stay document- or employer-dependent before Document-backed confidence.

*Existing: Evaluation pack editor · Client Brief. New: Program-minimum gates · Manage.*

**implementationAdds:** `fst-noc-groups` · `3120-hours` · `offer-or-certificate`

---

### elig-20
**Solution echo:** CEC exclusion flags (FT student, unpaid, remote-outside-Canada, unauthorized) veto qualifying hours; docs/pay stubs Manage before document-backed.

**implementationProblem:**  
Self-reported Canadian work years can falsely pass CEC when student/unauthorized/remote-abroad work is not asked.

**implementation:**  
On Nudge form, you can now answer CEC exclusion flags — work while full-time student, unpaid/volunteer, remote while physically outside Canada, unauthorized work — that veto CEC qualifying hours. On Client Brief → Manage, authorization documents and pay stubs confirm before Document-backed confidence. On Analysis, CEC pathway-pass respects those vetoes.

*Existing: Nudge form · Client Brief · Analysis. New: Manage · CEC exclusion flags.*

**implementationAdds:** `cec-exclusion` · `ft-student-work` · `remote-outside-canada` · `unauthorized-work`

---

### elig-21
**Solution echo:** Bind B-* emission to firm-configured service catalog; suppress candidates the firm has not enabled.

**implementationProblem:**  
B-* service map can outrun the firm’s retainer menu, producing reactivation that sells services the licensee will not deliver.

**implementation:**  
On Firm operations bind → Bind packs, you can now configure Service catalog (pathway application, ECA guidance, language retest plan, EE profile create/refresh, PNP strategy consult, category readiness review). On Analysis, B-* candidates only emit for enabled catalog entries; disabled services never appear as reactivation sellables. On Live brief, agenda services match the same catalog.

*Existing: Firm operations bind · Bind packs · Analysis · Live brief. New: Service catalog (Block).*

**implementationAdds:** `service-catalog` · `b-star-suppressed`

---

### elig-22
**Solution echo:** Unknown program-minimum → hard-fail pathway-pass; emit insufficient-facts + outstanding needs; no B-* pathway-file until minima populated.

**implementationProblem:**  
Always-on detection can treat unknowns as optimistic pathway passes to generate meetings.

**implementation:**  
On Evaluation pack editor, you can now Hard-fail pathway-pass when a program-minimum field is unknown. On Analysis, you can now see Insufficient facts plus outstanding self-reportable needs — never a B-* pathway-file candidate until minima are populated. On Nudge form, those outstanding needs consolidate for collection.

*Existing: Evaluation pack editor · Analysis · Nudge form.*

**implementationAdds:** `hard-fail-unknown-minimum` · `insufficient-facts` · `no-pathway-file-until-minima`

---

### elig-23
**Solution echo:** Persist pack version, reference-table version IDs, evaluation timestamp, confidence tier, and condition provenance on every signal/Analysis snapshot used for outreach or brief.

**implementationProblem:**  
When IRCC cutoffs/categories move, the firm cannot explain what Tower believed at send time unless evaluations freeze law/data versions.

**implementation:**  
Wiring absorb (CTO): persist pack version ID, reference-table version IDs, evaluation timestamp, confidence tier, and condition provenance on every signal/Analysis snapshot used for outreach or brief.  
On Analysis and Live brief, you can now open Evaluation provenance to inspect pack version, reference pins, timestamp, confidence tier, and Condition provenance for what Tower believed at send time.

*Existing: Analysis · Live brief. New: Evaluation provenance (Block / Submodal).*

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
On Evaluation pack editor, you can now gate draw-cutoff and category-occupation assertions on a Published & not past freshness SLA reference pin from Reference tables. On Analysis, when the pin is stale or missing, you can now see ops Reference data unavailable and draw/category reactivation is suppressed. On Reference data → Publish version, freshness SLA is what packs consume.

*Existing: Evaluation pack editor · Reference data · Reference tables · Publish version · Analysis.*

**implementationAdds:** `freshness-sla` · `reference-data-unavailable` · `draw-category-suppressed`

---

## Tally

| | Count |
|---|---|
| Implemented | **24** |
| Skipped (`elig-24`) | **1** |
| Seat total | 25 |
