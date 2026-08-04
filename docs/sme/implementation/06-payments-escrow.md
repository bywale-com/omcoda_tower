# PM implementation — Seat 6 Payments / escrow (firm↔Om Coda)

| Field | Value |
|---|---|
| **Source** | [`pass2/06-payments-escrow.md`](../pass2/06-payments-escrow.md) |
| **Skipped** | `esc-21` (NEEDS VERIFICATION — MT counsel before spend) |
| **Written** | 25 |
| **Surfaces** | **Commercial**, **Escrow terms**, **Escrow status**, **Accept terms**, **Activation state**, **Audit trail** (plus **Release control**, **License acknowledgement**, **Progress**, **Ticket** / **Support context**, **Change event**) |
| **As of** | 2026-07-30 |

---

### esc-01
**implementationProblem:**
KU #1 leaves release undefined. House will invent release on campaign-running or message volume — consumption cosplay consultancy buyers dispute, and Seed contingent-cost posture fails.

**implementation:**
On Escrow terms, select Release outcome dropdown to meeting_booked under the activated campaign.
In Non-release class checklist, view locked exclusion chips abandoned, never-running, and vendor-only.
On Accept terms, view Release summary panel Release outcome row and Non-release class chips before click Accept terms binds.

**implementationAdds:** ["meeting_booked", "abandoned", "never-running", "vendor-only"]

---

### esc-02
**implementationProblem:**
Founder locked “running” and “meeting booked.” Commercial inventing a parallel ROI or leads-generated KPI splits the bet and reopens KU #1.

**implementation:**
On Escrow terms, set Hold condition dropdown to campaign_running and Release condition dropdown to attributable meeting_booked.
On Accept terms, view Conditions panel separate Hold condition and Release condition rows.
On Activation state, view Progress panel Escrow held and Release eligible as separate status chips — running unlocks before Om Coda release.

**implementationAdds:** ["campaign_running", "meeting_booked"]

---

### esc-03
**implementationProblem:**
Immigration desk meetings cancel and no-show. Releasing on first calendar create without a window invites instant dispute and damages Accept-terms trust.

**implementation:**
On Escrow terms, fill Measurement window field and Cancel / reopen rules list before click Publish version on the terms version.
On Accept terms, view Timing panel Measurement window field and Cancel / reopen rules list before click Accept terms.
On Escrow status, view Status chip release_pending_window until Measurement window countdown panel closes.

**implementationAdds:** ["release_pending_window", "Measurement window", "Cancel / reopen"]

---

### esc-04
**implementationProblem:**
Firms book from many channels. Without path-membership attribution, release becomes negotiation about causality, not a commercial door.

**implementation:**
On Escrow terms, set Attribution dropdown to path_membership: enrolled contact plus meeting on Tower meeting path.
On Accept terms, view Attribution row displaying path membership as the causal object, with no ROI causality field.
On Escrow status, view Release evidence package panel Attribution path list when Release eligible chip appears.

**implementationAdds:** ["path_membership"]

---

### esc-05
**implementationProblem:**
ALG presents one escrow door. Without stated held / release / max exposure, buyers fear open-ended liability — or house invents a credits wallet as peer door.

**implementation:**
On Escrow terms, fill Held principal field, Release amount or schedule field, and Hard cap field.
On Accept terms, view Amounts panel Held principal, Release amount, and Hard cap rows before binding.
On Commercial, view Escrow status card amount rows against the escrow instrument; no credits wallet row appears.

**implementationAdds:** ["Held principal", "Release amount", "Hard cap"]

---

### esc-06
**implementationProblem:**
Operator Commercial says “hold and oversee” without immobilizing value against named predicates. A soft promise-to-pay-later fails Accept scrutiny and is not escrow practice.

**implementation:**
On Escrow status, view Custody panel held and disputed_frozen status chips as immobilized funds on the firm-payer rail with no unilateral spend control.
On Release control, click Release and Return only when Release condition row or Return disposition row is resolved; while held or disputed_frozen, the control panel stays frozen.
On Accept terms, view Custody posture row stating immobilized hold against named release and return predicates.

**implementationAdds:** ["held", "disputed_frozen"]

---

### esc-07
**implementationProblem:**
How names pending / accepted / released. Practice needs dispute, return-to-firm, and forfeit paths or house cannot oversee contested money.

**implementation:**
On Escrow status, view Status chip showing only terms_offered, terms_accepted_held, release_pending_window, released_to_om_coda, returned_to_firm, forfeited_per_terms, or disputed_frozen.
On Release control, select Next status dropdown listing only legal transitions from the current Status chip.
On Audit trail, view each status transition as a Change event row opening status, actor, timestamp, and reason fields.

**implementationAdds:** ["terms_offered", "terms_accepted_held", "release_pending_window", "released_to_om_coda", "returned_to_firm", "forfeited_per_terms", "disputed_frozen"]

---

### esc-08
**implementationProblem:**
Confusing Accept terms with outcome acceptance collapses contingent cost into prepaid — forbidden by Seed posture.

**implementation:**
On Accept terms, click Accept terms binds the terms version and moves Escrow status to terms_accepted_held chip, unlocking running without paying Om Coda; Operator would like to immobilize held principal on the firm-payer rail when terms bind.
On Escrow status, view Timeline panel placing release_pending_window and released_to_om_coda after the Accept event row.
On Activation state, view Progress panel treating Escrow accepted as hard-input chip and Release as a later commercial chip.

**implementationAdds:** ["terms_accepted_held", "Outcome release"]

---

### esc-09
**implementationProblem:**
Without a dispute path, release is either automatic (buyer refusal) or manual favor (house cannot audit).

**implementation:**
On Escrow status, click File dispute to open Dispute notice panel with Contested predicate dropdown, Evidence list, and deadline field.
Submitting Dispute notice moves Status chip to disputed_frozen and marks Held amount row frozen in-app; Operator would like to freeze immobilized funds on the firm-payer rail when dispute is filed.
On Release control, disputed_frozen chip disables Release and Return until a Resolution row is recorded.
On Accept terms, view Dispute rules panel notice requirements and freeze semantics before binding.

**implementationAdds:** ["Dispute notice", "disputed_frozen"]

---

### esc-10
**implementationProblem:**
Consultancy operators go dark. Pure human-must-click-release without a silence clock strands held funds and makes contingent cost unoperable for house.

**implementation:**
On Escrow status, when Release eligible chip appears, view Review window countdown starting in Review panel.
If Dispute notice list stays empty through Review window, view deemed_accepted chip on Review panel.
On Accept terms, view Review window row and deemed_accepted rule row before click Accept terms.
On Release control, click Release when deemed_accepted is present; Operator would like to release held principal on the firm-payer rail per bound terms.

**implementationAdds:** ["Review window", "deemed_accepted"]

---

### esc-11
**implementationProblem:**
“Forfeit” is ambiguous. Buyers will not Accept if miss silently means Om Coda keeps money; house will not offer contingent cost if every miss returns 100% with no firm-breach path.

**implementation:**
On Escrow terms, set Return disposition dropdown to return_to_firm for failed or expired predicates without firm breach, and set Forfeit disposition dropdown to forfeit_to_om_coda for enumerated firm breaches only.
On Accept terms, view Dispositions panel both disposition rows with trigger chips before binding.
On Escrow status, view final status landing on returned_to_firm or forfeited_per_terms only with Reason code field.
On Release control, click Execute disposition using the named disposition row; free-text alternatives are blocked.

**implementationAdds:** ["return_to_firm", "forfeit_to_om_coda", "returned_to_firm", "forfeited_per_terms"]

---

### esc-12
**implementationProblem:**
Instant forfeit on soft non-cooperation kills Accept among licensed consultancies; no cure path fails desk-practice fairness.

**implementation:**
On Escrow terms, fill Cure window field on forfeit_to_om_coda trigger rows, with Fraud / illegal-use marked in Immediate exception checklist.
On Accept terms, view Breach panel Cure window and Fraud / illegal-use exception rows before binding.
On Escrow status, view Status chip cure_pending after written breach notice until Cure window countdown ends or Cure landed checkbox is checked.
On Release control, click Forfeit only after Cure window expiry, except when Fraud / illegal-use exception chip is present; Operator would like to forfeit held principal on the firm-payer rail per enumerated breach terms.

**implementationAdds:** ["Cure window", "cure_pending", "Fraud / illegal-use"]

---

### esc-13
**implementationProblem:**
How says terms presentable without specifying content. Vague “contingent cost applies” will not clear a firm operator’s risk filter.

**implementation:**
On Escrow terms, fill disclosure fields Parties, Instrument scope, Currency, Held principal, Fee on release/return, and Custody posture.
On Accept terms, view Disclosure panel those fields as labeled rows, including Instrument scope limited to firm<->Om Coda commercial escrow only, not immigrant or client settlement funds.

**implementationAdds:** ["Parties", "Instrument scope", "Currency", "Held principal", "Custody posture"]

---

### esc-14
**implementationProblem:**
ALG forbids sales-call as peer money door. If Accept terms lack the full predicate story, activation stalls into “talk to sales.”

**implementation:**
On Escrow terms, author Release sentence field, Funds return when list, Dispute notice clock field, Review window field, and deemed_accepted rule field.
On Accept terms, view Plain-language terms panel those rows before click Accept terms; Footer CTA list omits any sales-call peer door.

**implementationAdds:** ["Release sentence", "Funds return when"]

---

### esc-15
**implementationProblem:**
One Accept act is committed. Conflating license risk with money custody invites retainer / escrow cosplay and regulatory confusion.

**implementation:**
On Accept terms, view Accept act panel placing License acknowledgement and Escrow terms as adjacent labeled sections before the single Accept terms button.
In License acknowledgement, check Firm responsibility checkbox covering outreach responsibility only, not money custody.
In Escrow terms section, check Contingent cost checkbox stating firm<->Om Coda commercial hold, not a client trust account or license bond.

**implementationAdds:** ["license-section", "escrow-section", "adjacent-labeled"]

---

### esc-16
**implementationProblem:**
Buyers need to know Accept spends political capital (license + money held) for running — not that Om Coda is paid at Accept.

**implementation:**
On Accept terms, view Consequence panel stating click Accept terms unlocks running under the prepared campaign and places funds in held custody.
View Om Coda claim row remaining conditional on Release condition or forfeit_to_om_coda.
On Activation state, view Progress panel Escrow accepted as hard-input chip and released_to_om_coda as separate later chip.

**implementationAdds:** ["held", "running"]

---

### esc-17
**implementationProblem:**
Product pressure will “also offer credits” to unblock hesitant firms — collapsing the ALG money bet and violating Seed §14 peer-door ban.

**implementation:**
On Accept terms, view Money instrument panel showing exactly one row: firm<->Om Coda escrow / contingent hold.
On Escrow terms and Commercial, view Alternate payment doors list locked exclusion chips credits, prepaid wallet, and sales-assisted close.
On Activation state, view Progress panel Escrow accepted as the only activation money finish-line chip.

**implementationAdds:** ["escrow-only"]

---

### esc-18
**implementationProblem:**
House may want MRR after running. Bolting SaaS onto the same held principal without a new Accept is bait-and-switch.

**implementation:**
On Escrow status, view Instrument timeline closing only on released_to_om_coda, returned_to_firm, or forfeited_per_terms status chips.
On Commercial, view Later SaaS offer row hidden until Running status or escrow disposition, carrying Non-double-charge checkbox against the same outcome units.
On Accept terms for activation, view Commercial rewrite panel SaaS rewrite locked while hold is open.

**implementationAdds:** ["Non-double-charge", "successor SaaS"]

---

### esc-19
**implementationProblem:**
Support and sales will offer “just use credits to start,” recreating the forbidden peer door.

**implementation:**
On Commercial, view Credits policy row locked to post-activation or non-ALG packaging only.
On Escrow status and Release control, Funding source dropdown rejects Credits for the activation hold or release instrument.
On Accept terms at activation, view Money instrument panel escrow-only chip with no Credits alternate row.

**implementationAdds:** ["Credits", "post-activation", "escrow-only"]

---

### esc-20
**implementationProblem:**
Immigration domain invites “escrow” collision with retainers and settlement funds. Product must stay firm↔Om Coda for Tower service consideration only.

**implementation:**
On Escrow terms, set Instrument scope to Om Coda Tower activation / contingent commercial claim and set Release condition to firm<->Om Coda contractual predicates only.
On Accept terms, view Instrument scope row stating never immigrant or client settlement custody or payout.
On Commercial, view Escrow status card with no end-client or immigrant money rows.

**implementationAdds:** ["firm-payer-only", "not-immigrant-funds"]

---

### esc-21
**Skipped:** NEEDS VERIFICATION — Canadian / provincial MT exposure for chosen hold rail; counsel before spend.

---

### esc-22
**implementationProblem:**
Acting on release when terms met without proof becomes discretionary favoritism — fails house oversight and buyer trust.

**implementation:**
On Escrow status, click Commercial receipt row for each transition to open who, what, when, predicate inputs, evidence pointers, and decision fields (release, return, forfeit, or freeze).
On Audit trail, view linked Change event row opening the same Commercial receipt id; append-only per tenancy.
On Release control, Execute disposition stays disabled until a Commercial receipt id is attached.

**implementationAdds:** ["Commercial receipt"]

---

### esc-23
**implementationProblem:**
Without a standard evidence bundle, release is tribal knowledge and disputes cannot be itemized.

**implementation:**
On Escrow status, before marking release_pending_window, view Release evidence package panel requiring firm_id, escrow_instrument_id, contact_id, campaign/enrollment_id, meeting_booked event id and timestamps, Attribution path, Measurement window status, and source meeting link fields.
On Release control, Mark release pending stays disabled until Release evidence package checklist is complete.
On Accept terms, view Evidence package row stating firm and house evaluate the same Release evidence package object.

**implementationAdds:** ["Release evidence package"]

---

### esc-24
**implementationProblem:**
Agency ops will “fix” vague KU #1 terms after first pilots. Silent rewrite under an open hold destroys Accept legitimacy.

**implementation:**
On Escrow terms, click Publish version creates terms version_id and locks predicate fields for that version.
On Accept terms, view Version row showing exact version_id bound by click Accept terms.
On Escrow status, view Bound version_id field read-only; material predicate edits surface New Accept required chip or mutual written amendment row.
On Audit trail, view Change event rows for terms version bind and amendment Accept events.

**implementationAdds:** ["version_id"]

---

### esc-25
**implementationProblem:**
Activation money stalls land in Support. Mixing ad-account billing with escrow oversight confuses rails and owners.

**implementation:**
On Ticket, open Support context; view Commercial facts panel Escrow status, accepted terms version_id, Held principal, last Commercial receipt, and open Dispute notice flag.
In Support context, view Billing objects list excluding Approach and Meta billing rows.
View Jump links list containing Commercial and Activation state buttons only, preserving commercial proof context.

**implementationAdds:** ["version_id", "Commercial receipt", "Commercial-facts-only"]

---

### esc-26
**implementationProblem:**
Room may treat Pass2 as enough while Accept terms, state machine, evidence package, and rail counsel remain unfinished — then burn CAC on an unreleasable door.

**implementation:**
On Commercial, view KU #1 closure pack panel checklist rows for release/return/forfeit predicates, running plus meeting_booked attribution, Accept terms disclosure set, state machine, Dispute notice clock, Review window clock, Release evidence package, Commercial receipt scheme, firm-payer rail with MT counsel note, and escrow-only peer-door ban.
On Activation state, view Progress panel keeping Acquisition spend locked until KU #1 closure pack chip is complete for this activation money door.
On Escrow terms, Accept terms, Escrow status, and Audit trail, each checklist row links back to the operable control or Change event, not just a document note.

**implementationAdds:** ["KU #1 closure pack", "escrow-only"]

---

## Counts

| Metric | Count |
|---|---|
| Source items | 26 |
| Skipped (NEEDS VERIFICATION) | 1 (`esc-21`) |
| Written | 25 |
| With `implementationAdds` | 25 |
