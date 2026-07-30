# Tower — SME Pass1+Pass2: Payments / escrow (firm↔Om Coda)

**Seat:** 6 — Payments / escrow (firm↔Om Coda)  
**Producer:** Domain SME (not PM/CTO)  
**Pass mode:** Combined Pass1 questions + Pass2 mechanisms  
**Focus gap (SME-GRAPH):** Activation money finish line is escrow with undefined release terms (KU #1). Pressure: (1) defensible release-outcome definitions tied to running/meeting world; (2) hold until terms — accept/dispute/release/forfeit; (3) what Accept terms must show a consultancy buyer; (4) boundaries vs later SaaS so escrow stays activation door; (5) proof/audit for house Commercial oversight.  
**Anchors:** Seed §0.3, §7 Money, KU #1, §14 never-invent; World escrow / contingent cost / hard gate escrow acceptance; Outcomes Operator · Commercial; How `operator-commercial.md`, `operator-activation.md` Leaf 1.3, `consultant-core.md` Leaf 2a.2; Personas Commercial / Escrow & contingent-commercial oversight.  
**Boundaries:** Not immigrant settlement funds. Not money transmitter of client funds. Not Meta billing. Credits / sales-call are not peer activation doors. No UI design.  
**Item count:** 26 (`esc-01` … `esc-26`)

---

### esc-01 — Release outcome must be buyer-recognized, not vendor activity

**Question:** What makes a release outcome defensible for contingent B2B cost — product activity (campaign started, messages sent) vs a buyer-recognized result?

**References:** [The SaaS CFO — How to Build an Outcome-Based Pricing Plan](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (outcome vs consumption; “customer only pays when ___ is successfully completed”); [Umbrex — Outcome-Based Pricing](https://umbrex.com/resources/frameworks/pricing-frameworks/outcome-based-pricing/) (auditable, influenceable KPIs).

**Thesis gap:** Seed KU #1 leaves “release outcome” undefined. Without a buyer-recognized definition, house will invent release on “campaign running” or message volume — consumption cosplay that consultancy buyers will dispute and that fails the Seed contingent-cost posture.

**Solution:** `Define the activation escrow release unit as a customer-recognized commercial result drawn from Tower’s locked Core success language (meeting booked under the activated campaign), with explicit non-billable / non-release failure classes for abandoned, never-running, or purely vendor-side activity, so that release cannot be argued from Om Coda effort alone.`

**Handoff:** both (PM: Accept terms / Commercial outcome criteria; CTO: outcome event identity + non-release reasons)

---

### esc-02 — Tie release to Seed “running / meeting” world without inventing new bets

**Question:** How should release terms bind to the already-committed activation finish line (DB auth + escrow → campaign can run) and Core success (meeting booked) without minting a new product bet?

**References:** Seed §0.1 Core outcome / §4 meeting booked; Seed §7 first ALG money moment = escrow; World activation finish line = DB authorization + escrow acceptance; [Deloitte DART — Accounting for Outcome-Based Pricing (ASC 606 success criteria)](https://dart.deloitte.com/USDART/home/publications/deloitte/industry/technology/accounting-outcome-based-pricing-agentic-ai) (contract must define successful outcome with enough specificity that both parties can determine when it occurred).

**Thesis gap:** Founder already locked “running” and “meeting booked.” Practice requires the escrow release predicate to cite those existing outcomes — not a parallel “ROI achieved” or “leads generated” metric invented at Commercial.

**Solution:** `Specify a two-state commercial predicate — (A) hold condition satisfied when activation hard inputs land and campaign is marked running; (B) release condition satisfied when a meeting_booked event attributable to that firm’s activated Tower campaign is recorded under the agreed measurement rules — so that KU #1 closes against World DNA rather than a new KPI.`

**Handoff:** both (PM: terms language mapping running vs release; CTO: attributable meeting_booked proof)

---

### esc-03 — Measurement window before release is final

**Question:** When is a meeting_booked (or analogous success) final enough to release held funds — immediately, or after a reversal / no-show window?

**References:** [The SaaS CFO — measurement window](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (bill too fast → false positives; define start/end/wait/reopen rules); [Ordway — Outcome Based Pricing](https://ordwaylabs.com/blog/outcome-based-pricing/) (attribution, dispute procedures in contract).

**Thesis gap:** Immigration desk meetings cancel and no-show. Releasing on the first calendar create event without a window invites instant dispute and damages Accept-terms trust.

**Solution:** `Bind release to meeting_booked plus a fixed measurement window (and explicit reopen/cancel rules) stated in the accepted terms, so that funds move only after the outcome is stable enough that firm analytics, Tower records, and Om Coda billing would agree ≥ practical dispute-risk threshold.`

**Handoff:** both (PM: window + cancel semantics in Accept terms; CTO: delayed release job / window clock)

---

### esc-04 — Attribution rules for “Tower-caused” meeting

**Question:** What attribution practice keeps “meeting from Tower campaign” from becoming an unprovable causal claim the firm will reject?

**References:** [Umbrex — Outcome-Based Pricing](https://umbrex.com/resources/frameworks/pricing-frameworks/outcome-based-pricing/) (attribution rules, baselines, caps); [The SaaS CFO — dispute-risk test](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (customer, analytics, and billing must support success ~95% of the time).

**Thesis gap:** Firms book meetings from many channels. Without an attribution rule tied to Tower enrollment / campaign path, release becomes a negotiation, not a commercial door.

**Solution:** `Pre-define attribution as path membership (contact was enrolled in the activated firm campaign / sequence and meeting is logged against that contact under Tower’s meeting path), not economic causality or ROI, so that release rests on inspectable system-of-record membership rather than persuasion about “who caused” the consult.`

**Handoff:** both (PM: Accept terms attribution clause; CTO: enrollment↔meeting link as proof artifact)

---

### esc-05 — Cap / collar so contingent door stays financeable for both sides

**Question:** Does pure single-outcome release without caps create budget anxiety that blocks Accept, or vendor volatility that blocks house from offering contingent cost?

**References:** [Umbrex — Outcome-Based Pricing](https://umbrex.com/resources/frameworks/pricing-frameworks/outcome-based-pricing/) (hybrids, caps/collars); [The SaaS CFO — spend controls](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (caps as conversion feature).

**Thesis gap:** ALG presents one escrow door. Practice still requires a stated held amount / release amount / max exposure so the consultancy buyer can accept without open-ended liability fear — without converting the door into prepaid credits.

**Solution:** `State on Accept terms a fixed held principal, a release amount (or schedule of release amounts keyed to defined outcomes), and a hard cap on total contingent obligation for the activation escrow instrument, so that contingent cost remains legible and capped without introducing a credits wallet as a peer door.`

**Handoff:** pm (primary terms packaging); cto (enforcement of cap in hold/release ledger)

---

### esc-06 — Hold semantics: funds immobilized until predicate or dispute path resolves

**Question:** What does “hold until terms met” require operationally beyond “payment intent recorded”?

**References:** [Sprintlaw — Escrow arrangements](https://sprintlaw.com.au/articles/escrow-explained-a-practical-guide-for-australian-startups-and-small-businesses/) (release conditions specific/measurable; dispute freezes funds); [FinCEN FIN-2014-R004](https://fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1) (escrow that monitors/verifies contractual conditions before release — integral to transaction management).

**Thesis gap:** Operator Commercial How says “hold and oversee” but does not specify that hold must immobilize value against named release/return predicates. A soft “promise to pay later” is not escrow practice and will not survive Accept scrutiny.

**Solution:** `Treat activation escrow as immobilized firm↔Om Coda commercial consideration held against named release and return predicates, with no unilateral spend by either party while status is held/disputed, so that contingent cost is real custody of commercial terms — not a deferred invoice label.`

**Handoff:** cto (hold ledger / payment-provider custody state); pm (status vocabulary on Commercial)

---

### esc-07 — State machine: offered → accepted → held → released | returned | forfeited | disputed

**Question:** Which commercial statuses must exist for house oversight to match Personas “pending / accepted / released” without inventing UI chrome?

**References:** How `operator-commercial.md` Leaf 1.2 (pending / accepted / released); [Upwork Fixed-Price Escrow Instructions](https://upwork.pactsafe.io/versions/6920e0b95a2c6fd4b76c22c2.pdf) (release conditions; escrow dispute freezes funds); [Sprintlaw — Escrow](https://sprintlaw.com.au/articles/escrow-explained-a-practical-guide-for-australian-startups-and-small-businesses/) (dispute notice, hold until resolution).

**Thesis gap:** How names three statuses; practice needs dispute, return-to-firm, and forfeit paths or house cannot oversee contested money.

**Solution:** `Adopt a closed commercial state set — terms_offered, terms_accepted_held, release_pending_window, released_to_om_coda, returned_to_firm, forfeited_per_terms, disputed_frozen — with legal transitions only, so that Operator Commercial can oversee the instrument end-to-end without ambiguous “pending.”`

**Handoff:** both (PM: Commercial status criteria; CTO: immutable transition log)

---

### esc-08 — Accept as hard gate distinct from release

**Question:** How must Accept differ from Release so activation can flip to running without prematurely paying Om Coda?

**References:** Seed §9 hard gate Escrow accept; World hard gate inventory; Seed §0.3 contingent until outcome terms met; [ContractKen — Acceptance testing](https://www.contractken.com/glossary/acceptance-testing-clause) (acceptance gate separates regimes: before accept vs after).

**Thesis gap:** Confusing “accept terms” with “accept that outcome occurred” collapses contingent cost into prepaid — forbidden by Seed posture and KU ongoing packaging distinction.

**Solution:** `Split Accept (consultant binds to terms + funds enter held state; unlocks running) from Outcome acceptance / release (predicate + window or deemed acceptance; moves held funds), so that activation money door and value realization stay chronologically and legally distinct.`

**Handoff:** both

---

### esc-09 — Dispute: written, itemized, freezes release

**Question:** What dispute practice prevents silent stalling and also prevents house from releasing under protest?

**References:** [Omnivoo — Payment terms / dispute mechanics](https://omnivoo.com/blog/payment-terms-contractor-contracts-net30-milestones-retainer) (written objection within window, itemized; undisputed amounts); [Upwork Escrow Instructions](https://upwork.pactsafe.io/versions/6920e0b95a2c6fd4b76c22c2.pdf) (funds remain in escrow while dispute administered); [Sprintlaw — Escrow disputes](https://sprintlaw.com.au/articles/escrow-explained-a-practical-guide-for-australian-startups-and-small-businesses/).

**Thesis gap:** Without a dispute path, KU #1 “release” becomes either automatic (buyer refusal) or manual favor (house cannot audit).

**Solution:** `Require a time-bounded written dispute notice that cites which release predicate/evidence is contested, freezes the disputed held amount, and routes resolution (negotiation → named escalation) before any release or return, so that contested contingent cost cannot silently drip to either party.`

**Handoff:** both (PM: dispute criteria on Commercial / Accept terms; CTO: freeze flag + evidence package)

---

### esc-10 — Deemed acceptance / silence clock on release notice

**Question:** If the firm neither confirms nor disputes a release-eligible outcome, what commercial practice prevents indefinite hold?

**References:** [LedgerUp — Milestone billing / deemed acceptance](https://www.ledgerup.ai/resources/what-is-milestone-billing-templates-automation) (5–10 business day window; silence → deemed accepted); [Omnivoo — deemed-accepted clause](https://omnivoo.com/blog/payment-terms-contractor-contracts-net30-milestones-retainer); [ContractKen — deemed acceptance](https://www.contractken.com/glossary/acceptance-testing-clause).

**Thesis gap:** Consultancy operators go dark. Pure “human must click release” without a silence clock makes contingent cost unoperable for Om Coda house.

**Solution:** `After Tower surfaces release-eligible evidence, start a stated review window; if the firm files no itemized dispute within the window, deem the outcome accepted and authorize release per terms, so that inaction cannot permanently strand held funds.`

**Handoff:** both

---

### esc-11 — Return-to-firm (forfeit of Om Coda claim) vs forfeit-to-Om-Coda

**Question:** When terms are not met, which party receives the held funds — and under which named triggers?

**References:** [LegalClarity — Milestone payments](https://legalclarity.org/how-to-structure-and-account-for-milestone-payments/) (termination for cause; remedies); [The SaaS CFO — failure forgiveness](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (customer not charged when workflow fails / abandoned); [Sprintlaw — Escrow](https://sprintlaw.com.au/articles/escrow-explained-a-practical-guide-for-australian-startups-and-small-businesses/) (return vs release conditions must be explicit).

**Thesis gap:** “Forfeit” is ambiguous. Buyers will not Accept if “not meeting” silently means Om Coda keeps the money; house will not offer contingent cost if every miss returns 100% with no firm-side breach path.

**Solution:** `Name two opposite dispositions in terms: (1) return_to_firm when release predicates fail or expire without firm breach (campaign never runs, no qualifying meeting in window, Om Coda non-performance); (2) forfeit_to_om_coda only on enumerated firm breaches (e.g. accepted terms then willfully blocks measurement, fraudulent dispute, or other listed bad-faith acts) — so that contingent cost defaults to buyer protection, not silent vendor keep.`

**Handoff:** pm (terms enumeration); cto (disposition transitions + reasons codes)

---

### esc-12 — Cure period before forfeit or termination of hold

**Question:** Must breach-based forfeit allow cure, or can house take funds immediately on alleged breach?

**References:** [Apptage — Milestone payments / termination for cause with cure](https://www.apptage.com/blogs/milestone-payments-software-contract/) (7–14 day cure common); [LegalClarity — Milestone structure](https://legalclarity.org/how-to-structure-and-account-for-milestone-payments/).

**Thesis gap:** Instant forfeit on soft “non-cooperation” will kill Accept among licensed consultancies; no cure path also fails desk-practice sync with seat 4.

**Solution:** `Pair any forfeit_to_om_coda trigger with a written notice and short cure window before disposition, except for enumerated fraud/illegal-use cases, so that Accept terms remain commercially fair and operable under ordinary firm ops friction.`

**Handoff:** pm (primary); sync desk seat 4 on what firms will accept

---

### esc-13 — Accept terms must show parties, instrument, and what is held

**Question:** What must a consultancy buyer see at Accept before they will bind money — minimum commercial disclosure?

**References:** [Paybond — Outcome-verified escrow](https://paybond.ai/use-cases/outcome-verified-escrow) (intent = signed agreement boundary: parties, budget, criteria); [Sprintlaw — Escrow deed contents](https://sprintlaw.com.au/articles/escrow-explained-a-practical-guide-for-australian-startups-and-small-businesses/); Seed §7 who pays = firm; not immigrant funds.

**Thesis gap:** How says “terms presentable on Accept terms” without specifying content. Vague “contingent cost applies” will not clear a firm operator’s risk filter.

**Solution:** `Require Accept terms to identify parties (named firm ↔ Om Coda), that the instrument is firm↔Om Coda commercial escrow only (explicitly not immigrant/client settlement funds), currency, held principal, fee if any on release/return, and custody posture (who holds), so that the buyer can verify they are not funding a client-money or transmitter product.`

**Handoff:** pm

---

### esc-14 — Accept terms must show release / return predicates in plain language

**Question:** What release and return language must appear so a non-lawyer consultancy operator can decide Accept without a sales call?

**References:** [The SaaS CFO — pricing page / order form template](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (billable vs non-billable examples; outcome definition sentence); Seed §14 forbids sales-call as peer activation door.

**Thesis gap:** ALG forbids sales-call as the money door. Therefore Accept terms must carry the full predicate story — or activation stalls into “talk to sales.”

**Solution:** `Surface on Accept a single plain-language release sentence (“Funds release to Om Coda when [meeting_booked attribution + window]”), a “you are not charged / funds return when…” list, and the dispute + deemed-acceptance clocks, so that the consultant can Accept without a human commercial closer as peer door.`

**Handoff:** pm

---

### esc-15 — License acknowledgement stays paired but not conflated with money

**Question:** How should Accept terms carry “outreach under my license” beside escrow without making escrow look like a license bond or immigrant retainer?

**References:** How `consultant-core.md` Leaf 2a.2 (license + escrow on Accept terms); Seed §3.2 not money transmitter / not immigrant funds; seat 4 desk sync.

**Thesis gap:** One modal is committed. Practice risk is conflating professional-license risk acceptance with money custody — which invites retainer/escrow cosplay and regulatory confusion.

**Solution:** `Keep license acknowledgement and escrow commercial terms as adjacent but labeled sections of the same Accept act — license = firm responsibility for outreach; escrow = firm↔Om Coda contingent cost — so that money mechanics never read as a client trust account or license bond.`

**Handoff:** pm (Accept terms structure); sync seat 4

---

### esc-16 — What Accept must show about running unlock

**Question:** Must Accept terms state what happens immediately on Accept (campaign may run) vs what happens only on release?

**References:** Seed activation: escrow accept → campaign can run; value proves via escrow + run; [ContractKen — acceptance as regime gate](https://www.contractken.com/glossary/acceptance-testing-clause).

**Thesis gap:** Buyers need to know Accept spends political capital (outreach under license + money held) in exchange for running — not that Om Coda is paid at Accept.

**Solution:** `State explicitly that Accept authorizes held custody and unlocks running under the prepared campaign, and that Om Coda’s claim on held funds arises only on release predicates (or forfeit triggers), so that contingent cost posture is visible at the moment of binding.`

**Handoff:** pm

---

### esc-17 — Escrow stays the only peer door at activation payment moment

**Question:** How should Commercial practice refuse credits and sales-call as alternate activation payment doors while KU allows later SaaS?

**References:** Seed §0.3, §7, §14 never invent credits/sales-call as peer doors; Seed §14 “Contingency/escrow as the *only* money forever” is itself never-invent (SaaS later allowed).

**Thesis gap:** Product pressure will try to “also offer credits” to unblock hesitant firms — which collapses the ALG money bet.

**Solution:** `At the activation payment moment, present exactly one money instrument — firm↔Om Coda escrow/contingent hold — and route any credits, prepaid wallet, or sales-assisted close to non-peer paths (later packaging or assisted ops), so that the ALG door remains testable and Seed §14 is not violated by convenience.`

**Handoff:** pm (primary Commercial / activation policy)

---

### esc-18 — Later SaaS must not rewrite the activation escrow instrument mid-hold

**Question:** When ongoing SaaS packaging appears (KU), what boundary keeps it from silently converting an open activation escrow into subscription prepaid?

**References:** Seed §7 Ongoing packaging KU; [Ordway — hybrid / ASC 606 variable consideration](https://ordwaylabs.com/blog/outcome-based-pricing/); [The SaaS CFO — commercial structure table](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (subscription-plus-outcome hybrids must avoid double-charge perception).

**Thesis gap:** House may want MRR after running. If SaaS is bolted onto the same held principal without a new Accept, buyers experience bait-and-switch.

**Solution:** `Keep activation escrow as a closed instrument with its own release/return end-states; introduce later SaaS only via a separate commercial accept after running (or after escrow disposition), with explicit non-double-charge rules against the same outcome units, so that escrow remains the activation door and SaaS remains a successor packaging.`

**Handoff:** both

---

### esc-19 — Credits later ≠ reactivation of credits as activation peer

**Question:** If credits are “available later if asked,” what practice prevents them from re-entering as an activation alternative?

**References:** Seed §7 Credits row; §14 peer-door ban; [The SaaS CFO — dollars vs credits](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (credits obscure buyer cost when conversion unclear).

**Thesis gap:** Support and sales will offer “just use credits to start.” That recreates the forbidden peer door.

**Solution:** `Policy-lock credits (if ever shipped) to post-activation or non-ALG packaging only, with Commercial oversight refusing credit-funding of the activation hold/release instrument, so that contingent escrow remains the sole activation money finish line.`

**Handoff:** pm

---

### esc-20 — Not immigrant funds; not client-money transmitter posture

**Question:** What commercial and custody boundaries keep Tower escrow from becoming immigrant settlement / client trust / money-transmitter-of-client-funds cosplay?

**References:** Seed §3.2, §7 Escrow/immigrant funds row; [FinCEN FIN-2014-R004](https://fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1) (escrow integral to transaction management between buyer/seller of goods/services); [FinCEN FIN-2014-R011](https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/whether-company-provides-online-real-time) (holding funds without verifying contractual conditions ≈ money transmission).

**Thesis gap:** Immigration domain invites “escrow” word collision with retainers and settlement funds. Product must stay firm↔Om Coda for Tower service consideration only.

**Solution:** `Limit held funds to consideration for Om Coda’s Tower activation/contingent commercial claim; forbid intake, custody, or payout of end-client/immigrant money; require release predicates that verify firm↔Om Coda contractual conditions (not client-matter disbursement), so that Tower does not operate as a client-funds transmitter or immigration retainer escrow.`

**Handoff:** both (PM: Accept terms / never-sees; CTO: payment rails scoped to firm payer only)

---

### esc-21 — Prefer payment-provider hold of firm payments over Om Coda inventing a trust business

**Question:** Who should custody the held principal so Om Coda stays a contingent commercial party rather than a de facto client-money bank?

**References:** [FinCEN administrative rulings on escrow vs MT](https://fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1); industry practice via Stripe/platform hold & release and marketplace escrow patterns (Personas: “Marketplace / Connect-style billing-ops”). NEEDS VERIFICATION on exact Canadian provincial MT exposure for Om Coda’s chosen rail — counsel.

**Thesis gap:** Seed forbids immigrant funds and transmitter-of-client-funds; it does not specify rail. Wrong rail choice recreates MSB posture even for firm↔Om Coda money.

**Solution:** `Implement hold/release on a firm-as-payer commercial rail (payment provider / marketplace-style hold) where Om Coda’s role is setting and verifying contractual release predicates — not accepting end-user funds for retransmission — and flag jurisdictional MT counsel as NEEDS VERIFICATION before spend, so that contingent cost stays operable without inventing a money-services product.`

**Handoff:** cto (primary rail); pm (Commercial oversight assumes that rail’s statuses)

---

### esc-22 — House proof: every status change is attributable and replayable

**Question:** What audit artifacts must Commercial oversight produce so house can defend accept / dispute / release / forfeit decisions?

**References:** [Paybond — Outcome-verified escrow](https://paybond.ai/use-cases/outcome-verified-escrow) (signed evidence, deterministic predicate, replayable receipts); [The SaaS CFO — make every outcome auditable](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/) (fields: outcome ID, criteria met, verification, billable reason, source link); Personas Escrow & contingent-commercial oversight.

**Thesis gap:** How “act on release when terms met” without proof becomes discretionary favoritism — fails house oversight and buyer trust.

**Solution:** `Emit a replayable commercial receipt for each transition (who/what/when, predicate inputs, evidence pointers, decision: release|return|forfeit|freeze), append-only per tenancy, so that Operator Commercial oversight matches inspectable proof rather than operator memory.`

**Handoff:** cto (primary); pm (what Commercial must be able to show)

---

### esc-23 — Evidence package for release-eligible meeting

**Question:** What minimum evidence must attach before house may mark release_pending_window?

**References:** [Paybond — attach signed artifacts](https://paybond.ai/use-cases/outcome-verified-escrow); [Ordway — invoice shows which outcomes when](https://ordwaylabs.com/blog/outcome-based-pricing/); Seed Core = meeting booked.

**Thesis gap:** Without a standard evidence bundle, release is tribal knowledge and disputes cannot be itemized (esc-09).

**Solution:** `Standardize a release evidence package: firm_id, escrow_instrument_id, contact_id, campaign/enrollment_id, meeting_booked event id + timestamps, attribution path, measurement-window status, and link to source meeting record — so that firm and house evaluate the same object.`

**Handoff:** cto (assemble package); pm (surface on Commercial status)

---

### esc-24 — Operator set-terms before Accept; no silent mid-flight rewrite

**Question:** Can house change release predicates after the firm Accepted while funds are held?

**References:** How `operator-commercial.md` Leaf 1.1 set terms before/during activation; [Umbrex — locked definitions](https://umbrex.com/resources/frameworks/pricing-frameworks/outcome-based-pricing/); contract practice: amendments need fresh assent.

**Thesis gap:** Agency ops will want to “fix” vague KU #1 terms after first pilots. Silent rewrite under an open hold destroys Accept legitimacy.

**Solution:** `Version escrow terms; bind the accepted version_id to the hold; allow material predicate changes only via a new Accept (or mutual written amendment recorded on the instrument), so that Commercial oversight cannot silently move the goalposts mid-hold.`

**Handoff:** both

---

### esc-25 — Support / ticket context needs commercial proof without becoming Meta billing

**Question:** What commercial facts must appear in house support context for activation money stalls — without pulling Meta ads billing into this seat?

**References:** How `operator-support.md` (Commercial / escrow in support context); SME-GRAPH boundaries (not Meta billing — seat 5); Personas per-tenancy Commercial.

**Thesis gap:** Activation stalls will land in Support. Mixing ad-account billing with escrow oversight confuses rails and owners.

**Solution:** `Expose escrow instrument status, accepted terms version, hold amount, last transition receipt, and open dispute flag in tenancy support context as Commercial facts only — exclude Approach/Meta billing objects — so that house can unblock activation money without crossing into ads billing.`

**Handoff:** both (PM: support context criteria; CTO: bind Commercial ledger into support read model)

---

### esc-26 — Pre-spend closure test for KU #1

**Question:** What minimum closure checklist must pass before Om Coda spends against the ALG escrow door?

**References:** Seed KU #1 “must be specified before spend”; Seed Assump. 14 escrow acceptable; [The SaaS CFO — dispute-risk test](https://www.thesaascfo.com/how-to-build-outcome-based-pricing/); [Deloitte DART — clear contractual success criteria](https://dart.deloitte.com/USDART/home/publications/deloitte/industry/technology/accounting-outcome-based-pricing-agentic-ai).

**Thesis gap:** Room may treat Pass2 as “enough” while Accept terms, state machine, evidence package, and rail counsel remain unfinished — then burn CAC on an unreleasable door.

**Solution:** `Gate ALG paid spend on a KU #1 closure pack: written release/return/forfeit predicates tied to running + meeting_booked attribution, Accept terms disclosure set (esc-13–16), state machine + dispute/deemed-acceptance clocks, evidence/receipt scheme, firm-payer rail chosen with MT counsel note, and explicit peer-door ban on credits/sales-call — so that contingent activation money is operable before acquisition spend.`

**Handoff:** both (room holder adjudicates; PM owns terms pack; CTO owns rail/proof pack)

---

## Handoff summary (seat 6)

| Owner | Absorb |
|---|---|
| **PM** | Accept terms content (parties, instrument scope, release/return/forfeit, windows, attribution, caps); Commercial statuses; peer-door ban; SaaS-as-successor boundary; license section adjacency; support context criteria |
| **CTO** | Hold/release ledger & provider rail; state transitions; measurement window jobs; evidence package; replayable receipts; freeze on dispute; terms version binding; firm-payer-only custody |
| **Both / cross-cut** | Release predicate ↔ meeting_booked wiring (esc-02–04, 23); desk Accept willingness (sync seat 4); DB-auth ordering only if practice requires escrow-after-book (sync seat 7 — not decided here) |
| **NEEDS VERIFICATION** | Exact Canadian/provincial money-transmitter exposure for chosen hold rail (esc-21) — counsel before spend |

**Out of scope (reaffirmed):** immigrant settlement funds; client-fund transmission; Meta billing; credits/sales-call as activation peer doors; UI design.
