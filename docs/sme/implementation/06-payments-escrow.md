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
On Escrow terms, use the Release outcome dropdown to select meeting_booked under the activated campaign.
In the Non-release class checklist, mark abandoned, never-running, and vendor-only as locked exclusions.
On Accept terms, the Release summary panel shows the Release outcome row and Non-release class chips before the Accept terms button binds.

**implementationAdds:** ["meeting_booked", "abandoned", "never-running", "vendor-only"]

---

### esc-02
**implementationProblem:**
Founder locked “running” and “meeting booked.” Commercial inventing a parallel ROI or leads-generated KPI splits the bet and reopens KU #1.

**implementation:**
On Escrow terms, set the Hold condition dropdown to campaign_running and the Release condition dropdown to attributable meeting_booked.
On Accept terms, the Conditions panel shows separate Hold condition and Release condition rows.
On Activation state, the Progress panel shows Escrow held and Release eligible as separate status chips, so running unlocks before Om Coda release.

**implementationAdds:** ["campaign_running", "meeting_booked"]

---

### esc-03
**implementationProblem:**
Immigration desk meetings cancel and no-show. Releasing on first calendar create without a window invites instant dispute and damages Accept-terms trust.

**implementation:**
On Escrow terms, fill the Measurement window field and the Cancel / reopen rules list before publishing the terms version.
On Accept terms, the Timing panel displays the Measurement window field and Cancel / reopen rules list before the Accept terms button.
On Escrow status, the Status chip reads release_pending_window until the Measurement window countdown panel closes.

**implementationAdds:** ["release_pending_window", "Measurement window", "Cancel / reopen"]

---

### esc-04
**implementationProblem:**
Firms book from many channels. Without path-membership attribution, release becomes negotiation about causality, not a commercial door.

**implementation:**
On Escrow terms, set the Attribution dropdown to path_membership: enrolled contact plus meeting on Tower meeting path.
On Accept terms, the Attribution row displays path membership as the causal object, with no ROI causality field.
On Escrow status, the Release evidence package panel shows an Attribution path list when the Release eligible chip appears.

**implementationAdds:** ["path_membership"]

---

### esc-05
**implementationProblem:**
ALG presents one escrow door. Without stated held / release / max exposure, buyers fear open-ended liability — or house invents a credits wallet as peer door.

**implementation:**
On Escrow terms, fill the Held principal field, Release amount or schedule field, and Hard cap field.
On Accept terms, the Amounts panel shows Held principal, Release amount, and Hard cap rows before binding.
On Commercial, the Escrow status card displays those amount rows against the escrow instrument and does not show a credits wallet row.

**implementationAdds:** ["Held principal", "Release amount", "Hard cap"]

---

### esc-06
**implementationProblem:**
Operator Commercial says “hold and oversee” without immobilizing value against named predicates. A soft promise-to-pay-later fails Accept scrutiny and is not escrow practice.

**implementation:**
On Escrow status, the Custody panel shows held and disputed_frozen status chips as immobilized funds with no unilateral spend control.
On Release control, the Release button and Return button enable only when the Release condition row or Return disposition row is resolved; while held or disputed_frozen, the control panel remains frozen.
On Accept terms, the Custody posture row states immobilized hold against named release and return predicates.

**implementationAdds:** ["held", "disputed_frozen"]

---

### esc-07
**implementationProblem:**
How names pending / accepted / released. Practice needs dispute, return-to-firm, and forfeit paths or house cannot oversee contested money.

**implementation:**
On Escrow status, the Status chip can show only terms_offered, terms_accepted_held, release_pending_window, released_to_om_coda, returned_to_firm, forfeited_per_terms, or disputed_frozen.
On Release control, the Next status dropdown lists only legal transitions from the current Status chip.
On Audit trail, each status transition appears as a Change event row that opens the status, actor, timestamp, and reason fields.

**implementationAdds:** ["terms_offered", "terms_accepted_held", "release_pending_window", "released_to_om_coda", "returned_to_firm", "forfeited_per_terms", "disputed_frozen"]

---

### esc-08
**implementationProblem:**
Confusing Accept terms with outcome acceptance collapses contingent cost into prepaid — forbidden by Seed posture.

**implementation:**
On Accept terms, clicking the Accept terms button binds the terms version and moves Escrow status to the terms_accepted_held chip, unlocking running without paying Om Coda.
On Escrow status, the Timeline panel places release_pending_window and released_to_om_coda after the Accept event row.
On Activation state, the Progress panel treats Escrow accepted as the hard-input chip and Release as a later commercial chip.

**implementationAdds:** ["terms_accepted_held", "Outcome release"]

---

### esc-09
**implementationProblem:**
Without a dispute path, release is either automatic (buyer refusal) or manual favor (house cannot audit).

**implementation:**
On Escrow status, click the File dispute button to open the Dispute notice panel with Contested predicate dropdown, Evidence list, and deadline field.
Submitting the Dispute notice moves the Status chip to disputed_frozen and marks the Held amount row frozen.
On Release control, the disputed_frozen chip disables Release and Return buttons until a Resolution row is recorded.
On Accept terms, the Dispute rules panel shows notice requirements and freeze semantics before binding.

**implementationAdds:** ["Dispute notice", "disputed_frozen"]

---

### esc-10
**implementationProblem:**
Consultancy operators go dark. Pure human-must-click-release without a silence clock strands held funds and makes contingent cost unoperable for house.

**implementation:**
On Escrow status, when the Release eligible chip appears, the Review window countdown starts in the Review panel.
If the Dispute notice list stays empty through the Review window, the Review panel adds a deemed_accepted chip.
On Accept terms, the Review window row and deemed_accepted rule row appear before the Accept terms button.
On Release control, the Release button enables when deemed_accepted is present.

**implementationAdds:** ["Review window", "deemed_accepted"]

---

### esc-11
**implementationProblem:**
“Forfeit” is ambiguous. Buyers will not Accept if miss silently means Om Coda keeps money; house will not offer contingent cost if every miss returns 100% with no firm-breach path.

**implementation:**
On Escrow terms, set the Return disposition dropdown to return_to_firm for failed or expired predicates without firm breach, and set the Forfeit disposition dropdown to forfeit_to_om_coda for enumerated firm breaches only.
On Accept terms, the Dispositions panel lists both disposition rows with trigger chips before binding.
On Escrow status, final status can land on returned_to_firm or forfeited_per_terms only with a Reason code field.
On Release control, the Execute disposition button uses the named disposition row and blocks free-text alternatives.

**implementationAdds:** ["return_to_firm", "forfeit_to_om_coda", "returned_to_firm", "forfeited_per_terms"]

---

### esc-12
**implementationProblem:**
Instant forfeit on soft non-cooperation kills Accept among licensed consultancies; no cure path fails desk-practice fairness.

**implementation:**
On Escrow terms, fill the Cure window field on forfeit_to_om_coda trigger rows, with Fraud / illegal-use marked in the Immediate exception checklist.
On Accept terms, the Breach panel shows Cure window and Fraud / illegal-use exception rows before binding.
On Escrow status, the Status chip reads cure_pending after written breach notice until the Cure window countdown ends or the Cure landed checkbox is checked.
On Release control, the Forfeit button enables only after Cure window expiry, except when a Fraud / illegal-use exception chip is present.

**implementationAdds:** ["Cure window", "cure_pending", "Fraud / illegal-use"]

---

### esc-13
**implementationProblem:**
How says terms presentable without specifying content. Vague “contingent cost applies” will not clear a firm operator’s risk filter.

**implementation:**
On Escrow terms, fill disclosure fields for Parties, Instrument scope, Currency, Held principal, Fee on release/return, and Custody posture.
On Accept terms, the Disclosure panel displays those fields as labeled rows, including Instrument scope limited to firm<->Om Coda commercial escrow only, not immigrant or client settlement funds.

**implementationAdds:** ["Parties", "Instrument scope", "Currency", "Held principal", "Custody posture"]

---

### esc-14
**implementationProblem:**
ALG forbids sales-call as peer money door. If Accept terms lack the full predicate story, activation stalls into “talk to sales.”

**implementation:**
On Escrow terms, author the Release sentence field, Funds return when list, Dispute notice clock field, Review window field, and deemed_accepted rule field.
On Accept terms, the Plain-language terms panel shows those rows before the Accept terms button, and the Footer CTA list omits any sales-call peer door.

**implementationAdds:** ["Release sentence", "Funds return when"]

---

### esc-15
**implementationProblem:**
One Accept act is committed. Conflating license risk with money custody invites retainer / escrow cosplay and regulatory confusion.

**implementation:**
On Accept terms, the Accept act panel places License acknowledgement and Escrow terms as adjacent labeled sections before the single Accept terms button.
In License acknowledgement, the Firm responsibility checkbox covers outreach responsibility only, not money custody.
In the Escrow terms section, the Contingent cost checkbox states firm<->Om Coda commercial hold, not a client trust account or license bond.

**implementationAdds:** ["license-section", "escrow-section", "adjacent-labeled"]

---

### esc-16
**implementationProblem:**
Buyers need to know Accept spends political capital (license + money held) for running — not that Om Coda is paid at Accept.

**implementation:**
On Accept terms, the Consequence panel states that the Accept terms button unlocks running under the prepared campaign and places funds in held custody.
The Om Coda claim row remains conditional on Release condition or forfeit_to_om_coda.
On Activation state, the Progress panel shows Escrow accepted as the hard-input chip and released_to_om_coda as a separate later chip.

**implementationAdds:** ["held", "running"]

---

### esc-17
**implementationProblem:**
Product pressure will “also offer credits” to unblock hesitant firms — collapsing the ALG money bet and violating Seed §14 peer-door ban.

**implementation:**
On Accept terms, the Money instrument panel shows exactly one row: firm<->Om Coda escrow / contingent hold.
On Escrow terms and Commercial, the Alternate payment doors list has locked exclusion chips for credits, prepaid wallet, and sales-assisted close.
On Activation state, the Progress panel shows Escrow accepted as the only activation money finish-line chip.

**implementationAdds:** ["escrow-only"]

---

### esc-18
**implementationProblem:**
House may want MRR after running. Bolting SaaS onto the same held principal without a new Accept is bait-and-switch.

**implementation:**
On Escrow status, the Instrument timeline closes only on released_to_om_coda, returned_to_firm, or forfeited_per_terms status chips.
On Commercial, the Later SaaS offer row is hidden until Running status or escrow disposition, and it carries a Non-double-charge checkbox against the same outcome units.
On Accept terms for activation, the Commercial rewrite panel shows SaaS rewrite locked while the hold is open.

**implementationAdds:** ["Non-double-charge", "successor SaaS"]

---

### esc-19
**implementationProblem:**
Support and sales will offer “just use credits to start,” recreating the forbidden peer door.

**implementation:**
On Commercial, the Credits policy row is locked to post-activation or non-ALG packaging only.
On Escrow status and Release control, the Funding source dropdown rejects Credits for the activation hold or release instrument.
On Accept terms at activation, the Money instrument panel shows an escrow-only chip and no Credits alternate row.

**implementationAdds:** ["Credits", "post-activation", "escrow-only"]

---

### esc-20
**implementationProblem:**
Immigration domain invites “escrow” collision with retainers and settlement funds. Product must stay firm↔Om Coda for Tower service consideration only.

**implementation:**
On Escrow terms, set Instrument scope to Om Coda Tower activation / contingent commercial claim and set Release condition to firm<->Om Coda contractual predicates only.
On Accept terms, the Instrument scope row states never immigrant or client settlement custody or payout.
On Commercial, the Escrow status card has no end-client or immigrant money rows.

**implementationAdds:** ["firm-payer-only", "not-immigrant-funds"]

---

### esc-21
**Skipped:** NEEDS VERIFICATION — Canadian / provincial MT exposure for chosen hold rail; counsel before spend.

---

### esc-22
**implementationProblem:**
Acting on release when terms met without proof becomes discretionary favoritism — fails house oversight and buyer trust.

**implementation:**
On Escrow status, click the Commercial receipt row for each transition to open who, what, when, predicate inputs, evidence pointers, and decision fields (release, return, forfeit, or freeze).
On Audit trail, the linked Change event row opens the same Commercial receipt id and remains append-only per tenancy.
On Release control, the Execute disposition button is disabled until a Commercial receipt id is attached.

**implementationAdds:** ["Commercial receipt"]

---

### esc-23
**implementationProblem:**
Without a standard evidence bundle, release is tribal knowledge and disputes cannot be itemized.

**implementation:**
On Escrow status, before marking release_pending_window, the Release evidence package panel requires firm_id, escrow_instrument_id, contact_id, campaign/enrollment_id, meeting_booked event id and timestamps, Attribution path, Measurement window status, and source meeting link fields.
On Release control, the Mark release pending button is disabled until the Release evidence package checklist is complete.
On Accept terms, the Evidence package row states that firm and house evaluate the same Release evidence package object.

**implementationAdds:** ["Release evidence package"]

---

### esc-24
**implementationProblem:**
Agency ops will “fix” vague KU #1 terms after first pilots. Silent rewrite under an open hold destroys Accept legitimacy.

**implementation:**
On Escrow terms, the Publish version button creates a terms version_id and locks predicate fields for that version.
On Accept terms, the Version row shows the exact version_id bound by the Accept terms button.
On Escrow status, the Bound version_id field is read-only; material predicate edits surface a New Accept required chip or mutual written amendment row.
On Audit trail, Change event rows open for terms version bind and amendment Accept events.

**implementationAdds:** ["version_id"]

---

### esc-25
**implementationProblem:**
Activation money stalls land in Support. Mixing ad-account billing with escrow oversight confuses rails and owners.

**implementation:**
On Ticket, open Support context; the Commercial facts panel shows Escrow status, accepted terms version_id, Held principal, last Commercial receipt, and open Dispute notice flag.
In Support context, the Billing objects list excludes Approach and Meta billing rows.
The Jump links list contains Commercial and Activation state buttons only, preserving commercial proof context.

**implementationAdds:** ["version_id", "Commercial receipt", "Commercial-facts-only"]

---

### esc-26
**implementationProblem:**
Room may treat Pass2 as enough while Accept terms, state machine, evidence package, and rail counsel remain unfinished — then burn CAC on an unreleasable door.

**implementation:**
On Commercial, the KU #1 closure pack panel shows checklist rows for release/return/forfeit predicates, running plus meeting_booked attribution, Accept terms disclosure set, state machine, Dispute notice clock, Review window clock, Release evidence package, Commercial receipt scheme, firm-payer rail with MT counsel note, and escrow-only peer-door ban.
On Activation state, the Progress panel keeps Acquisition spend locked until the KU #1 closure pack chip is complete for this activation money door.
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
