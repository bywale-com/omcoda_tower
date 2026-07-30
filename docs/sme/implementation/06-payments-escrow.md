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
On Escrow terms, you can now set Release outcome to meeting_booked under the activated campaign.
On Escrow terms, you can now mark Non-release class for abandoned, never-running, or vendor-only activity.
On Accept terms, you can now see that Release outcome and those Non-release classes before binding.

**implementationAdds:** ["meeting_booked", "abandoned", "never-running", "vendor-only"]

---

### esc-02
**implementationProblem:**
Founder locked “running” and “meeting booked.” Commercial inventing a parallel ROI or leads-generated KPI splits the bet and reopens KU #1.

**implementation:**
On Escrow terms, you can now set Hold condition to campaign_running and Release condition to attributable meeting_booked.
On Accept terms, you can now see Hold condition distinct from Release condition.
On Activation state, on Progress, you can now see escrow held unlock running separately from release-eligible.

**implementationAdds:** ["campaign_running", "meeting_booked"]

---

### esc-03
**implementationProblem:**
Immigration desk meetings cancel and no-show. Releasing on first calendar create without a window invites instant dispute and damages Accept-terms trust.

**implementation:**
On Escrow terms, you can now set Measurement window and Cancel / reopen rules.
On Accept terms, you can now see Measurement window and Cancel / reopen rules before binding.
On Escrow status, you can now see release_pending_window until that window closes.

**implementationAdds:** ["release_pending_window", "Measurement window", "Cancel / reopen"]

---

### esc-04
**implementationProblem:**
Firms book from many channels. Without path-membership attribution, release becomes negotiation about causality, not a commercial door.

**implementation:**
On Escrow terms, you can now set Attribution to path_membership (enrolled contact + meeting on Tower meeting path).
On Accept terms, you can now see Attribution as path membership — not ROI causality.
On Escrow status, when release-eligible, you can now see Attribution path on the evidence package.

**implementationAdds:** ["path_membership"]

---

### esc-05
**implementationProblem:**
ALG presents one escrow door. Without stated held / release / max exposure, buyers fear open-ended liability — or house invents a credits wallet as peer door.

**implementation:**
On Escrow terms, you can now set Held principal, Release amount (or schedule), and Hard cap.
On Accept terms, you can now see Held principal, Release amount, and Hard cap before binding.
On Commercial, Escrow status shows those amounts against the instrument — not a credits wallet.

**implementationAdds:** ["Held principal", "Release amount", "Hard cap"]

---

### esc-06
**implementationProblem:**
Operator Commercial says “hold and oversee” without immobilizing value against named predicates. A soft promise-to-pay-later fails Accept scrutiny and is not escrow practice.

**implementation:**
On Escrow status, you can now see held and disputed_frozen as immobilized — no unilateral spend.
On Release control, you can now act only when Release condition or Return disposition resolves; while held or disputed_frozen, Release control stays frozen.
On Accept terms, you can now see custody as immobilized hold against named release and return predicates.

**implementationAdds:** ["held", "disputed_frozen"]

---

### esc-07
**implementationProblem:**
How names pending / accepted / released. Practice needs dispute, return-to-firm, and forfeit paths or house cannot oversee contested money.

**implementation:**
On Escrow status, you can now see terms_offered, terms_accepted_held, release_pending_window, released_to_om_coda, returned_to_firm, forfeited_per_terms, disputed_frozen.
On Release control, you can now move only along legal transitions into those statuses.
On Audit trail, you can now open Change event for each status transition.

**implementationAdds:** ["terms_offered", "terms_accepted_held", "release_pending_window", "released_to_om_coda", "returned_to_firm", "forfeited_per_terms", "disputed_frozen"]

---

### esc-08
**implementationProblem:**
Confusing Accept terms with outcome acceptance collapses contingent cost into prepaid — forbidden by Seed posture.

**implementation:**
On Accept terms, you can now bind to terms and move Escrow status to terms_accepted_held — unlocking running, not paying Om Coda.
On Escrow status, you can now see Outcome release as a later status (release_pending_window → released_to_om_coda), chronologically distinct from Accept.
On Activation state, on Progress, you can now treat escrow Accept as the hard input — not release.

**implementationAdds:** ["terms_accepted_held", "Outcome release"]

---

### esc-09
**implementationProblem:**
Without a dispute path, release is either automatic (buyer refusal) or manual favor (house cannot audit).

**implementation:**
On Escrow status, you can now open Dispute notice with contested predicate and evidence — time-bounded and itemized.
On Escrow status, filing Dispute notice moves status to disputed_frozen and freezes the held amount.
On Release control, you can now see disputed_frozen block release or return until resolution.
On Accept terms, you can now see Dispute notice rules and freeze semantics before binding.

**implementationAdds:** ["Dispute notice", "disputed_frozen"]

---

### esc-10
**implementationProblem:**
Consultancy operators go dark. Pure human-must-click-release without a silence clock strands held funds and makes contingent cost unoperable for house.

**implementation:**
On Escrow status, when release-eligible, you can now see Review window start after release-eligible evidence surfaces.
On Escrow status, if no itemized Dispute notice lands in Review window, you can now see deemed_accepted authorize release per terms.
On Accept terms, you can now see Review window and deemed_accepted before binding.
On Release control, you can now execute release on deemed_accepted.

**implementationAdds:** ["Review window", "deemed_accepted"]

---

### esc-11
**implementationProblem:**
“Forfeit” is ambiguous. Buyers will not Accept if miss silently means Om Coda keeps money; house will not offer contingent cost if every miss returns 100% with no firm-breach path.

**implementation:**
On Escrow terms, you can now set Return disposition to return_to_firm (predicates fail / expire without firm breach) and Forfeit disposition to forfeit_to_om_coda (enumerated firm breaches only).
On Accept terms, you can now see both dispositions and their triggers before binding.
On Escrow status, you can now land returned_to_firm or forfeited_per_terms with a reason code.
On Release control, you can now execute the named disposition only.

**implementationAdds:** ["return_to_firm", "forfeit_to_om_coda", "returned_to_firm", "forfeited_per_terms"]

---

### esc-12
**implementationProblem:**
Instant forfeit on soft non-cooperation kills Accept among licensed consultancies; no cure path fails desk-practice fairness.

**implementation:**
On Escrow terms, you can now set Cure window on forfeit_to_om_coda triggers, with Fraud / illegal-use as immediate exceptions.
On Accept terms, you can now see Cure window and Fraud / illegal-use exceptions before binding.
On Escrow status, you can now see cure_pending after written breach notice until Cure window ends or cure lands.
On Release control, you can now move to forfeited_per_terms only after Cure window expires (except Fraud / illegal-use).

**implementationAdds:** ["Cure window", "cure_pending", "Fraud / illegal-use"]

---

### esc-13
**implementationProblem:**
How says terms presentable without specifying content. Vague “contingent cost applies” will not clear a firm operator’s risk filter.

**implementation:**
On Accept terms, you can now see Parties (named firm ↔ Om Coda), Instrument scope (firm↔Om Coda commercial escrow only — not immigrant / client settlement funds), Currency, Held principal, Fee on release/return if any, and Custody posture.
On Escrow terms, you can now set those disclosure fields so Accept terms presents them.

**implementationAdds:** ["Parties", "Instrument scope", "Currency", "Held principal", "Custody posture"]

---

### esc-14
**implementationProblem:**
ALG forbids sales-call as peer money door. If Accept terms lack the full predicate story, activation stalls into “talk to sales.”

**implementation:**
On Accept terms, you can now see one plain-language Release sentence (meeting_booked attribution + Measurement window), a Funds return when list, and Dispute notice + Review window / deemed_accepted clocks.
On Escrow terms, you can now author that Release sentence, Funds return when list, and clocks so Accept terms carries them — no sales-call peer door.

**implementationAdds:** ["Release sentence", "Funds return when"]

---

### esc-15
**implementationProblem:**
One Accept act is committed. Conflating license risk with money custody invites retainer / escrow cosplay and regulatory confusion.

**implementation:**
On Accept terms, you can now see License acknowledgement and Escrow terms as adjacent labeled sections of the same Accept act.
On License acknowledgement, you can now affirm firm responsibility for outreach — not money custody.
On Escrow terms (within Accept terms), you can now affirm firm↔Om Coda contingent cost — not a client trust account or license bond.

**implementationAdds:** ["license-section", "escrow-section", "adjacent-labeled"]

---

### esc-16
**implementationProblem:**
Buyers need to know Accept spends political capital (license + money held) for running — not that Om Coda is paid at Accept.

**implementation:**
On Accept terms, you can now see Accept unlocks running under the prepared campaign and places funds in held custody — Om Coda’s claim arises only on Release condition or forfeit_to_om_coda.
On Activation state, on Progress, you can now show escrow Accept as the hard input that unlocks running, separate from released_to_om_coda.

**implementationAdds:** ["held", "running"]

---

### esc-17
**implementationProblem:**
Product pressure will “also offer credits” to unblock hesitant firms — collapsing the ALG money bet and violating Seed §14 peer-door ban.

**implementation:**
On Accept terms, you can now see exactly one money instrument — firm↔Om Coda escrow / contingent hold.
On Escrow terms / Commercial, you can now refuse credits, prepaid wallet, or sales-assisted close as peer activation payment doors.
On Activation state, on Progress, the escrow hard input is the sole money finish line at activation.

**implementationAdds:** ["escrow-only"]

---

### esc-18
**implementationProblem:**
House may want MRR after running. Bolting SaaS onto the same held principal without a new Accept is bait-and-switch.

**implementation:**
On Escrow status, you can now see the activation instrument close only via its own end-states (released_to_om_coda | returned_to_firm | forfeited_per_terms).
On Commercial, you can now offer later SaaS only as a separate commercial accept after running or after escrow disposition — with Non-double-charge against the same outcome units.
On Accept terms for activation, you can now see no mid-hold SaaS rewrite of the open instrument.

**implementationAdds:** ["Non-double-charge", "successor SaaS"]

---

### esc-19
**implementationProblem:**
Support and sales will offer “just use credits to start,” recreating the forbidden peer door.

**implementation:**
On Commercial, you can now policy-lock Credits (if ever shipped) to post-activation or non-ALG packaging only.
On Escrow status / Release control, you can now refuse credit-funding of the activation hold / release instrument.
On Accept terms at activation, you can now see escrow-only — Credits never appear as an alternate activation door.

**implementationAdds:** ["Credits", "post-activation", "escrow-only"]

---

### esc-20
**implementationProblem:**
Immigration domain invites “escrow” collision with retainers and settlement funds. Product must stay firm↔Om Coda for Tower service consideration only.

**implementation:**
On Accept terms, you can now see Instrument scope limited to Om Coda Tower activation / contingent commercial claim — never immigrant or client settlement custody or payout.
On Escrow terms, you can now set Release condition to firm↔Om Coda contractual predicates only — not client-matter disbursement.
On Commercial, Escrow status never shows end-client / immigrant money objects.

**implementationAdds:** ["firm-payer-only", "not-immigrant-funds"]

---

### esc-21
**Skipped:** NEEDS VERIFICATION — Canadian / provincial MT exposure for chosen hold rail; counsel before spend.

---

### esc-22
**implementationProblem:**
Acting on release when terms met without proof becomes discretionary favoritism — fails house oversight and buyer trust.

**implementation:**
On Escrow status, you can now open Commercial receipt for each transition (who / what / when, predicate inputs, evidence pointers, decision: release | return | forfeit | freeze).
On Audit trail, you can now open Change event linked to that Commercial receipt — append-only per tenancy.
On Release control, you can now require Commercial receipt before executing disposition.

**implementationAdds:** ["Commercial receipt"]

---

### esc-23
**implementationProblem:**
Without a standard evidence bundle, release is tribal knowledge and disputes cannot be itemized.

**implementation:**
On Escrow status, when marking release_pending_window, you can now see Release evidence package: firm_id, escrow_instrument_id, contact_id, campaign / enrollment_id, meeting_booked event id + timestamps, Attribution path, Measurement window status, source meeting link.
On Release control, you can now require that Release evidence package before release_pending_window.
On Accept terms, you can now see that firm and house evaluate the same Release evidence package object.

**implementationAdds:** ["Release evidence package"]

---

### esc-24
**implementationProblem:**
Agency ops will “fix” vague KU #1 terms after first pilots. Silent rewrite under an open hold destroys Accept legitimacy.

**implementation:**
On Escrow terms, you can now version terms and bind accepted version_id to the hold.
On Accept terms, you can now bind to a specific version_id.
On Escrow status, you can now see bound version_id; material predicate changes require a new Accept (or mutual written amendment on the instrument).
On Audit trail, you can now open Change event for terms version bind and any amendment Accept.

**implementationAdds:** ["version_id"]

---

### esc-25
**implementationProblem:**
Activation money stalls land in Support. Mixing ad-account billing with escrow oversight confuses rails and owners.

**implementation:**
On Ticket, on Support context, you can now see Escrow status, accepted terms version_id, Held principal, last Commercial receipt, and open Dispute notice flag — Commercial facts only.
On Support context, you can now exclude Approach / Meta billing objects.
From Support context, you can now jump to Commercial or Activation state without leaving commercial proof.

**implementationAdds:** ["version_id", "Commercial receipt", "Commercial-facts-only"]

---

### esc-26
**implementationProblem:**
Room may treat Pass2 as enough while Accept terms, state machine, evidence package, and rail counsel remain unfinished — then burn CAC on an unreleasable door.

**implementation:**
On Commercial, you can now see KU #1 closure pack status before ALG paid spend: written release / return / forfeit predicates (running + meeting_booked attribution), Accept terms disclosure set, state machine + Dispute notice / Review window clocks, Release evidence package + Commercial receipt scheme, firm-payer rail with MT counsel note, and escrow-only peer-door ban.
On Activation state, you can now treat KU #1 closure pack as required before acquisition spend unlocks against this activation money door.
On Escrow terms / Accept terms / Escrow status / Audit trail, the pack checks those surfaces are operable — not merely documented.

**implementationAdds:** ["KU #1 closure pack", "escrow-only"]

---

## Counts

| Metric | Count |
|---|---|
| Source items | 26 |
| Skipped (NEEDS VERIFICATION) | 1 (`esc-21`) |
| Written | 25 |
| With `implementationAdds` | 25 |
