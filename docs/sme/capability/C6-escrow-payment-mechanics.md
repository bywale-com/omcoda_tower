# Pass2+implementation — C6 Escrow / contingent-payment mechanics

**Seat:** C6 — Escrow / contingent-payment mechanics (capability axis)  
**Producer:** Payments engineer + escrow-practice SME (capability) — not PM/CTO; not counsel  
**Status:** Paper only — **not** Register-integrated; no CT plant  
**Pass shape:** Pass2 solutions (`<mechanism> so that <purpose>`) + SURFACE-VOCAB implementation bridge  
**Vocab:** [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md)  
**Roster:** [`00-ROSTER.md`](./00-ROSTER.md) §C6  
**Adjacency:** [`../pass2/06-payments-escrow.md`](../pass2/06-payments-escrow.md) — release-outcome definitions, Accept-terms disclosure, peer-door ban, MT counsel flag stay there; this seat starts at **ledger + verified-release wiring**  
**Surfaces in play:** **Commercial**, **Escrow status**, **Release control**, **Engagement runtime** (outcome events); also **Accept terms** / **Escrow terms** (hold land), **Activation state** (held ≠ released), **Customer support** (Commercial facts only)  
**Brief:** Hold money and release on a verified outcome (`meeting_booked` under an activated campaign).  
**Who:** payments engineer + escrow-law SME (partially rostered — mechanics here; counsel stays blocked).  
**Residual:** Stripe Connect / escrow marketplace flows + outcome-verified release triggers beyond generic Stripe Checkout.  
**Revealed:** Escrow ledger **new**; Outcome-verification → release **partial** (unit defined in seat 6; mechanic unbuilt); Money-transmitter boundary **blocked** (counsel).  
**Plugs:** Commercial · Escrow status · Release control · Engagement runtime.  
**Style:** Question · References · Thesis gap · Solution · Handoff · implementationProblem · implementation · implementationAdds.

**Item count:** 22 (`escmech-01` … `escmech-22`)

### Focus gap

Actually hold firm↔Om Coda commercial consideration and release it only when Engagement runtime proves `meeting_booked` under the activated campaign (plus measurement window). Residual: Connect/marketplace hold–release rails, escrow ledger states, idempotent webhooks, evidence-bound release jobs. Do **not** reinvent Accept-terms law or MT opinions — mark MT **BLOCKED counsel**.

### Boundaries

- Do **not** redo seat-6 counsel / Accept-terms / peer-door / immigrant-funds commercial law (`esc-01`…`esc-26`). Cite adjacency; build the **mechanic**.
- Do **not** invent a money-services / trust-account product. MT exposure = **BLOCKED (counsel)** — see `escmech-20`.
- Do **not** treat Meta / ads billing as this rail.
- Do **not** design UI chrome as the solution; use SURFACE-VOCAB click-paths only.
- PCI: stay lightly adjacent — tokenize via provider; never store PAN in Tower.

---

### escmech-01 — Escrow ledger as per-firm instrument store (NEW)

**Question:** What durable store must exist so held / released / refunded money is not a Stripe dashboard folklore?  
**References:**
- Stripe Connect — destination charges & separate charges and transfers — https://docs.stripe.com/connect/charges
- Marketplace escrow patterns (hold immobilized principal against named predicates) — Upwork Fixed-Price Escrow Instructions practice; Paybond outcome-verified escrow receipts
- Roster C6: Escrow ledger **new** → Commercial · Escrow status  
**Thesis gap:** Commercial surface exists; without a per-firm ledger of instruments and balances, Release control and Support invent status from memory.  
**Solution:** Persist an append-oriented **escrow ledger per tenancy** (instrument_id, firm_id, held principal, currency, provider_refs, status, terms_version_id, cap) so that every Commercial view reads Tower truth, not a live scrape of the processor console.  
**Handoff:** cto (ledger store); pm (Escrow status vocabulary)

**implementationProblem:**  
Operators open Stripe to guess whether a firm is held or released. Activation state and Support cannot agree on money posture.

**implementation:**  
Starting from Commercial (collection), open the firm instrument list and click a firm/instrument row to land on the scoped Escrow status record with status chips held / release_pending_window / released / returned / forfeited / disputed plus principal, currency, and terms_version_id.  
On Release control, action buttons are enabled only for the selected ledger instrument, never for an orphan provider charge.

**implementationAdds:** `["escrow-ledger", "instrument-id", "held-principal", "terms-version-id"]`

---

### escmech-02 — Closed ledger status machine

**Question:** Which status transitions may the mechanic emit, and which are illegal?  
**References:**
- How `operator-commercial.md` (pending / accepted / released adjacency from seat 6)
- Upwork escrow: funds remain held while dispute administered
- Stripe payment / transfer object lifecycles — https://docs.stripe.com/payments/payment-intents/status  
**Thesis gap:** Seat 6 named commercial statuses; capability must lock a **closed machine** so jobs cannot skip held → released without evidence.  
**Solution:** Enforce a closed status set — `pending_accept` → `held` → (`release_pending_window` | `disputed` | `return_pending`) → terminal (`released` | `returned` | `forfeited`) — with illegal edges rejected so that Release control cannot jump to paid without the verified path.  
**Handoff:** both (PM: status labels on Escrow status; CTO: transition guard)

**implementationProblem:**  
Ad-hoc status strings let house mark “released” from a support ticket without window or evidence.

**implementation:**  
Starting from Commercial → firm instrument list, click the instrument row; Escrow status shows only the closed status set and legal next-transition chips for that scoped record.  
On Release control, click a transition button; illegal edges fail closed and write a rejected transition receipt.

**implementationAdds:** `["status-machine", "held", "release-pending-window", "disputed", "released", "returned", "forfeited"]`

---

### escmech-03 — Immobilize principal while held

**Question:** How does the mechanic make “held” mean funds cannot be spent by either party?  
**References:**
- Stripe Connect — separate charges and transfers; funds available after capture — https://docs.stripe.com/connect/separate-charges-and-transfers
- FinCEN FIN-2014-R004 adjacency (verify contractual conditions before release) — **law owned by seat 6; mechanic = immobilize**
- Sprintlaw / marketplace escrow: release conditions specific; no unilateral draw while held  
**Thesis gap:** Soft “promise to pay later” is not a hold. Capability must bind provider custody state to ledger `held`.  
**Solution:** On Accept success, create/confirm a **provider hold (authorized/captured into platform or escrow-capable balance)** and mark ledger `held` only when the provider reports immobilized funds so that contingent cost is real custody, not a deferred invoice flag.  
**Handoff:** cto

**implementationProblem:**  
Ledger says held while money is still a PaymentIntent that can be canceled quietly — Accept trust collapses.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Held only when provider_ref confirms immobilized funds, otherwise pending_accept / failed_hold.  
On Activation state → Progress, the escrow hard-input chip turns satisfied only after that scoped ledger record reaches `held`.

**implementationAdds:** `["immobilized-hold", "provider-ref", "failed-hold", "pending-accept"]`

---

### escmech-04 — Stripe Connect / marketplace hold–release rail (mechanics)

**Question:** Which Connect charge pattern should the rail implement for firm-as-payer contingent hold?  
**References:**
- Stripe Connect overview — https://docs.stripe.com/connect
- Stripe Connect — separate charges and transfers — https://docs.stripe.com/connect/separate-charges-and-transfers
- Stripe Connect — destination charges — https://docs.stripe.com/connect/destination-charges
- Marketplace escrow hold-then-release patterns (platform verifies condition → transfer)  
**Thesis gap:** Generic Checkout Session is not an escrow rail. Capability must pick a Connect-style hold/release pattern without inventing an Om Coda bank.  
**Solution:** Implement firm-as-payer hold on a **Connect marketplace pattern** (separate charge + later transfer, or equivalent hold/release product capability) where Tower records predicates and triggers release so that Om Coda verifies contractual conditions rather than retransmitting end-client money.  
**Handoff:** cto (primary rail); pm (Commercial assumes rail statuses)  
**Note:** Jurisdictional MT fit of the chosen rail = **BLOCKED counsel** (`escmech-20`); do not treat this item as legal clearance.

**implementationProblem:**  
Checkout-only wiring marks paid at Accept and never supports outcome-verified release — collapses contingent posture into prepaid.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Rail posture: Connect marketplace hold–release (firm payer) with provider account / charge / transfer refs.  
On Release control, the Initiate provider release/transfer button is enabled only from `release_pending_window` after evidence passes, not from Accept.

**implementationAdds:** `["connect-rail", "separate-charge-transfer", "firm-as-payer", "transfer-ref"]`

---

### escmech-05 — Authorize/capture vs release transfer are distinct operations

**Question:** How must the mechanic separate Accept-time money motion from outcome-time payout?  
**References:**
- Stripe PaymentIntents — authorization and capture — https://docs.stripe.com/payments/payment-intents
- Stripe Transfers — https://docs.stripe.com/connect/transfers
- Seat 6 esc-16 adjacency: Accept unlocks running; Om Coda claim arises on release  
**Thesis gap:** Collapsing Accept charge into Om Coda revenue at t=0 invents prepaid SaaS and breaks contingent ALG.  
**Solution:** Treat Accept as **hold/capture-into-immobilized balance** and treat outcome success as a **separate release/transfer operation** keyed to evidence so that Om Coda’s claim moves only when Release control fires.  
**Handoff:** cto

**implementationProblem:**  
A single “charge Om Coda” call at Accept makes Escrow status unable to show held-unpaid-to-vendor vs released.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status separates Hold operation (Accept) from Release transfer (outcome) in distinct rows.  
On Release control, Execute release creates a new provider transfer/payout ref linked to the same instrument while the Accept charge ref stays immutable.

**implementationAdds:** `["hold-operation", "release-transfer", "distinct-ops"]`

---

### escmech-06 — Cap / collar enforcement on the ledger

**Question:** How does the mechanic enforce fixed principal and hard cap without a credits wallet?  
**References:**
- Seat 6 esc-05 adjacency (fixed held / release / cap on terms)
- Stripe amount fields on PaymentIntent / Transfer (integer minor units)
- The SaaS CFO — spend controls / caps as conversion feature  
**Thesis gap:** Terms can state a cap while jobs still over-release or partial-release past collar if ledger does not enforce.  
**Solution:** Bind `held_principal`, `release_amount` (or schedule), and `hard_cap` on the instrument and reject any release/transfer that would exceed remaining cap so that contingent obligation stays ledger-enforced, not copy-only.  
**Handoff:** cto (enforcement); pm (amounts visible on Escrow status)

**implementationProblem:**  
Release jobs can fire twice or stack outcomes past Accept disclosure; buyer financeability dies.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Held principal, Release amount / schedule, Hard cap, and Remaining releasable.  
On Release control, Execute release fails closed when the amount exceeds Remaining releasable and the receipt shows cap_block.

**implementationAdds:** `["held-principal", "release-amount", "hard-cap", "remaining-releasable", "cap-block"]`

---

### escmech-07 — Terms version bound to the instrument

**Question:** What must the ledger store so mid-hold predicate rewrites cannot silently apply?  
**References:**
- Seat 6 esc-24 adjacency (version terms; bind version_id to hold)
- Stripe metadata on PaymentIntent / Transfer for correlation ids
- Contract practice: amendments need fresh assent  
**Thesis gap:** Capability jobs will read “current Commercial defaults” unless the instrument freezes the accepted version.  
**Solution:** Stamp `terms_version_id` (and hash of release/return/forfeit predicates) onto the instrument at Accept and make Release control evaluate **only that stamp** so that house cannot silently move goalposts under an open hold.  
**Handoff:** both

**implementationProblem:**  
Operators edit Commercial defaults after pilots; open holds suddenly use new predicates without a new Accept.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Accepted terms_version_id and predicate hash frozen on the instrument.  
On Release control, Evaluate release reads only that version’s predicates; material changes require a new Accept / amendment recorded on a new or amended instrument.

**implementationAdds:** `["terms-version-id", "predicate-hash", "frozen-terms"]`

---

### escmech-08 — Accept → hold confirmation via idempotent webhooks

**Question:** How should provider events land so Accept UI and ledger never diverge?  
**References:**
- Stripe webhooks — https://docs.stripe.com/webhooks
- Stripe webhook best practices — handle duplicate events; verify signatures — https://docs.stripe.com/webhooks/best-practices
- Stripe idempotency keys on mutating API calls — https://docs.stripe.com/api/idempotent_requests  
**Thesis gap:** Relying on synchronous Accept response alone drops holds when the browser dies after charge succeeds.  
**Solution:** Drive `pending_accept` → `held` from **verified, signature-checked, idempotently applied** provider webhooks (plus idempotent Accept API writes) so that ledger converges even under retries and double delivery.  
**Handoff:** cto

**implementationProblem:**  
Duplicate `payment_intent.succeeded` events double-book instruments, or missed events leave Activation waiting forever.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Hold confirmation sourced from provider webhook with event id stored once.  
On Commercial, use the Replay webhook action for the scoped instrument; duplicate event ids are no-ops.

**implementationAdds:** `["webhook-hold-confirm", "event-id-dedupe", "signature-verify", "idempotent-accept"]`

---

### escmech-09 — Webhook & job idempotency for release path

**Question:** What idempotency practice stops double-release under retries?  
**References:**
- Stripe idempotency keys — https://docs.stripe.com/api/idempotent_requests
- Stripe webhooks — exactly-once processing via event id storage — https://docs.stripe.com/webhooks/best-practices
- Outcome-billing systems: billable reason + outcome id uniqueness  
**Thesis gap:** Measurement-window jobs and transfer API retries will fire twice without a release intent key.  
**Solution:** Key every release/return/forfeit attempt by `(instrument_id, outcome_evidence_id, action)` with provider idempotency keys so that at-most-once money motion holds under job and webhook retries.  
**Handoff:** cto

**implementationProblem:**  
A retried release job pays Om Coda twice against one meeting_booked — dispute and trust failure.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Release control shows Release attempt rows keyed by instrument + evidence + action, and retries reuse the same idempotency key.  
On Escrow status, one terminal money motion appears per evidence unit or schedule slot; duplicate attempts display idempotent replay.

**implementationAdds:** `["release-idempotency-key", "outcome-evidence-id", "at-most-once-transfer"]`

---

### escmech-10 — Outcome-verification → release trigger (PARTIAL → wired)

**Question:** What event must enter the payment mechanic to move held → release_pending_window?  
**References:**
- Seat 6 esc-01 / esc-02 adjacency: release unit = meeting_booked under activated campaign
- Roster C6: Outcome-verification → release **partial**
- Capability C2 Engagement runtime — intent `booked` / meeting finishing events  
**Thesis gap:** Release unit is defined in counsel/commercial seat; **no mechanic** subscribes to Engagement runtime to start the window.  
**Solution:** Subscribe Release control to a durable **`meeting_booked` verification event** (firm_id, campaign/enrollment_id, contact_id, meeting_id, occurred_at) emitted by Engagement runtime so that held funds enter `release_pending_window` only from verified outcome ingress — never from campaign-started or message-count.  
**Handoff:** both (CTO: event bus; PM: Escrow status shows trigger source)

**implementationProblem:**  
House manually marks release when “things look good,” or automations release on sequence start — consumption cosplay.

**implementation:**  
On Engagement runtime / Engagement record, a meeting_booked under the activated campaign emits a verification event.  
Starting from Commercial → firm instrument list, open the matching instrument row; Release control shows that event opening release_pending_window.  
On Escrow status, Trigger reads meeting_booked evidence id, not campaign running.

**implementationAdds:** `["meeting-booked-verification-event", "release-pending-window", "outcome-ingress"]`

---

### escmech-11 — Attribution gate before window opens

**Question:** What inspectable membership check must pass before outcome ingress is release-eligible?  
**References:**
- Seat 6 esc-04 adjacency: path membership (enrollment ↔ meeting), not ROI causality
- Umbrex — Outcome-Based Pricing (attribution rules)
- Tower enrollment / campaign path as system of record  
**Thesis gap:** Runtime can emit booked intents from non-Tower paths; payment mechanic must refuse unattributable meetings.  
**Solution:** Require **path-membership proof** (contact enrolled in the firm’s activated campaign/sequence; meeting logged against that contact) before opening release_pending_window so that release rests on inspectable membership, not persuasion.  
**Handoff:** cto (proof join); pm (Escrow status attribution line)

**implementationProblem:**  
Any calendar create on the firm releases escrow — buyers dispute immediately.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Release control displays verification event rows and rejects any lacking enrollment↔meeting linkage with reason attribution_failed.  
On Escrow status, Attribution path shows campaign / enrollment / contact / meeting, or Attribution failed.

**implementationAdds:** `["attribution-path", "path-membership", "attribution-failed"]`

---

### escmech-12 — Measurement-window clock job

**Question:** How does the mechanic wait out no-show / cancel before money moves?  
**References:**
- Seat 6 esc-03 adjacency: fixed measurement window + reopen/cancel rules
- The SaaS CFO — measurement window (start/end/wait/reopen)
- Job/runner practice: delayed execution with cancel-on-reopen  
**Thesis gap:** Instant release on calendar create invites false positives; capability must own the clock, not hope operators wait.  
**Solution:** On eligible verification, start a **measurement-window job** bound to terms_version clocks; advance to releasable only if no cancel/reopen event arrives before deadline so that funds move after outcome stability, not first webhook.  
**Handoff:** cto (job); pm (window visible on Escrow status)

**implementationProblem:**  
Release fires the minute Booking succeeds; no-show disputes become the default Support load.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Window opened_at, Window ends_at, and Window status chips open / canceled / elapsed.  
On Release control, Auto-queue release enables only after Window elapsed without cancel; cancel/reopen clears releasable and records window_abort.

**implementationAdds:** `["measurement-window-job", "window-ends-at", "window-abort", "releasable"]`

---

### escmech-13 — Release evidence package assembly

**Question:** What package must exist before Release control may call the provider transfer API?  
**References:**
- Seat 6 esc-23 adjacency: standard release evidence package
- Paybond — signed artifacts / deterministic predicate
- The SaaS CFO — auditable outcome fields  
**Thesis gap:** Partial seat defined the package; capability must **assemble and gate** on it.  
**Solution:** Assemble a **release evidence package** (firm_id, instrument_id, contact_id, campaign/enrollment_id, meeting_booked ids + timestamps, attribution path, window status, source meeting link) and refuse provider release until the package validates so that firm and house evaluate one object.  
**Handoff:** cto (assemble); pm (surface on Escrow status / Release control)

**implementationProblem:**  
Transfers go out with a meeting id in a Slack thread — disputes cannot be itemized.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Release control exposes Open evidence package before transfer with required-field validation chips.  
On Escrow status, when status is release_pending_window or released, the same evidence package is inspectable from the scoped record.

**implementationAdds:** `["release-evidence-package", "evidence-validate", "source-meeting-link"]`

---

### escmech-14 — Release control → provider release/transfer

**Question:** What is the atomic mechanic when window + evidence pass?  
**References:**
- Stripe Transfers / payout to connected account or platform revenue recognition path — https://docs.stripe.com/connect/transfers
- Stripe Connect separate charges and transfers (release step)
- Idempotent transfer creation (escmech-09)  
**Thesis gap:** Escrow status “released” without a provider money motion is theater.  
**Solution:** On releasable + validated evidence + cap check, Release control performs the **provider release/transfer**, stores transfer_ref, and only then transitions ledger to `released` so that Commercial status and bank motion stay coupled.  
**Handoff:** cto

**implementationProblem:**  
Operators flip status to released for reporting while funds remain immobilized — finance and product diverge.

**implementation:**  
Starting from Commercial → firm instrument list, open the releasable instrument row; Release control shows Execute release (provider transfer).  
On success, Escrow status writes transfer_ref and status `released`; manual Mark released without transfer_ref is not offered and fails closed.

**implementationAdds:** `["execute-release", "transfer-ref", "status-coupled-to-money"]`

---

### escmech-15 — Dispute freeze halts release jobs

**Question:** What happens to in-flight windows and transfers when a dispute opens?  
**References:**
- Seat 6 esc-07 / esc-09 adjacency: dispute freezes funds
- Upwork escrow dispute: funds remain in escrow while administered
- Stripe dispute / chargeback webhooks (PCI-adjacent; handle as freeze signals) — https://docs.stripe.com/disputes  
**Thesis gap:** Measurement jobs will complete during a dispute unless freeze is a first-class interrupt.  
**Solution:** On dispute notice (buyer or provider), transition instrument to `disputed`, **cancel pending release jobs**, and block Execute release until dispute resolves so that money cannot move under objection.  
**Handoff:** both

**implementationProblem:**  
Window elapses during Dispute notice and auto-releases — Accept dispute clocks become decorative.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows Open dispute setting `disputed` and Freeze: release jobs canceled.  
On Release control, Execute release is disabled until dispute_clearance; provider chargebacks similarly force freeze.

**implementationAdds:** `["disputed", "freeze", "cancel-release-jobs", "dispute-clearance"]`

---

### escmech-16 — Return / refund rail mechanic

**Question:** How do funds leave `held` back to the firm when return predicates fire?  
**References:**
- Stripe Refunds — https://docs.stripe.com/refunds
- Seat 6 return / forfeit / abandoned-campaign adjacency
- Marketplace escrow: return to payer when conditions fail  
**Thesis gap:** Release path gets engineered; return path is left as “manual Stripe refund,” which breaks audit and Activation honesty.  
**Solution:** Implement a **return/refund operation** on the instrument (provider refund or reverse transfer per rail rules) transitioning to `returned` with the same idempotency and receipt rules as release so that non-release outcomes have a real money path.  
**Handoff:** cto (rail); pm (Escrow status return reasons)

**implementationProblem:**  
Abandoned or never-running campaigns leave money stuck; house refunds off-books.

**implementation:**  
Starting from Commercial → firm instrument list, open an instrument row meeting return predicates; Release control exposes Execute return for abandoned / never-running / window_abort per frozen terms.  
On Escrow status, terminal `returned` shows refund_ref and return_reason, not a silent dashboard refund.

**implementationAdds:** `["execute-return", "refund-ref", "return-reason", "returned"]`

---

### escmech-17 — Forfeit terminal without calling it release

**Question:** How should forfeit end-states move (or not move) money without abusing the release verb?  
**References:**
- Seat 6 forfeit triggers adjacency (terms-defined)
- Ledger clarity: release ≠ forfeit ≠ return
- Stripe application fees / transfer reversal patterns where applicable — https://docs.stripe.com/connect/charges  
**Thesis gap:** Ops will “just release” on forfeit to simplify — pollutes outcome-verified metrics and Accept language.  
**Solution:** Model `forfeited` as its own terminal transition with **explicit forfeit_reason and money disposition per frozen terms** (may share a transfer API but never the meeting_booked evidence path) so that outcome-verified release stays semantically clean.  
**Handoff:** both

**implementationProblem:**  
Forfeit and meeting_booked both show as released — analytics and disputes cannot tell contingent success from penalty.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status shows terminal `forfeited` distinct from `released`, with forfeit_reason.  
On Release control, Execute forfeit is enabled only from forfeit predicates and uses evidence package type forfeit, not meeting_booked.

**implementationAdds:** `["forfeited", "forfeit-reason", "forfeit-disposition"]`

---

### escmech-18 — Append-only commercial receipts

**Question:** What audit artifact must every transition emit for Commercial oversight?  
**References:**
- Seat 6 esc-22 adjacency: replayable commercial receipt
- Paybond — replayable receipts / deterministic predicate
- Stripe Events as source pointers (not the sole store)  
**Thesis gap:** Provider event logs alone are not house-owned proof across tenancy filters and Support.  
**Solution:** Emit an **append-only commercial receipt** per transition (actor/system, when, from→to, predicate inputs, evidence pointers, decision, provider_refs) so that Operator Commercial oversight matches inspectable proof.  
**Handoff:** cto (receipt log); pm (what Escrow status / Support must show)

**implementationProblem:**  
Status flips with no history — house cannot defend release/return/forfeit decisions.

**implementation:**  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status has a Transition receipts panel with append-only receipt rows for the scoped instrument.  
On Customer support → Ticket → Support context, last receipt and open dispute flag appear as Commercial facts only.

**implementationAdds:** `["commercial-receipt", "append-only", "transition-receipt"]`

---

### escmech-19 — PCI adjacency: tokenize; never store PAN

**Question:** What card-data boundary must the mechanic respect while building hold/release?  
**References:**
- PCI DSS — never store sensitive authentication data; minimize cardholder data — https://www.pcisecuritystandards.org/
- Stripe — Elements / Checkout tokenization; raw card data never hits server — https://docs.stripe.com/security
- Stripe webhook payloads — use payment method ids, not PAN  
**Thesis gap:** Building a custom “escrow card form” that posts PAN to Tower recreates PCI scope for no product gain.  
**Solution:** Collect payment methods only via **provider-hosted / tokenized fields**, store only customer_id / payment_method_id / charge ids on the ledger so that Tower’s escrow mechanic stays outside raw card scope.  
**Handoff:** cto

**implementationProblem:**  
Custom card capture for “escrow UX” pulls Tower into PCI SAQ D territory and stalls the rail.

**implementation:**  
On Accept terms / Escrow terms, firm payment method entry uses provider-hosted tokenized fields only.  
Starting from Commercial → firm instrument list, open the instrument row; Escrow status stores provider customer and payment_method refs, never PAN / CVV.

**implementationAdds:** `["tokenized-payment-method", "provider-customer-id", "no-pan-store"]`

---

### escmech-20 — BLOCKED (counsel): money-transmitter boundary

**Question:** What must capability **refuse to decide** about MT / MSB posture while still shipping a firm-payer rail?  
**References:**
- Seat 6 esc-20 / esc-21 — immigrant funds ban; prefer provider hold; **NEEDS VERIFICATION** Canadian/provincial MT — counsel
- FinCEN FIN-2014-R004 / FIN-2014-R011 (adjacency only — not legal advice)
- Roster C6: Money-transmitter boundary handling **blocked (counsel)**  
**Thesis gap:** Payments engineers will be asked to “confirm we’re not an MT.” That is counsel, not Connect config.  
**Solution:** **Block product claims of MT clearance.** Ship only firm-as-payer Connect/marketplace hold–release mechanics; forbid client/immigrant fund intake rails; attach a counsel_gate flag on Commercial until jurisdictional review signs the chosen rail — so that capability does not launder legal exposure as an engineering checkbox.  
**Handoff:** both (room/counsel owns clearance; CTO implements firm-payer-only scope; PM never-sees client-money escrow)  
**Status:** **BLOCKED (counsel)**

**implementationProblem:**  
ALG spend pressure asks engineering to green-light the rail; a false “not an MT” comment ships risk.

**implementation:**  
Starting from Commercial → firm instrument list, the firm row shows Counsel gate: MT / rail clearance pending | cleared (human counsel); engineering cannot flip cleared.  
On Escrow status, Instrument scope reads firm↔Om Coda commercial consideration only and no client-fund intake controls exist.  
On Release control, firm-payer rail actions are available while Counsel gate is pending only in non-production / non-spend environments per room policy; production ALG spend stays blocked on uncleared gate (seat 6 esc-26 adjacency).

**implementationAdds:** `["counsel-gate", "mt-blocked", "firm-payer-only", "no-client-fund-intake"]`

---

### escmech-21 — Engagement runtime ↔ Release control event contract

**Question:** What stable contract lets C2 runtime and C6 payment mechanic integrate without UI glue?  
**References:**
- Capability roster C2 / C6 plug: Release control ← Engagement runtime
- CloudEvents-style durable event practice (type, source, id, time, data)
- Webhook idempotency (escmech-08/09) applied to internal events  
**Thesis gap:** Without a typed contract, PM invents “sync booking to Stripe” cron jobs that skip attribution and window.  
**Solution:** Publish a versioned **OutcomeVerification** event contract (`meeting_booked` | `meeting_canceled` | `meeting_reopened`, ids, tenancy, campaign, attribution stubs) consumed by Release control so that payment state changes only through the verified-release path.  
**Handoff:** cto (schema); both where Engagement record and Escrow status must cross-link

**implementationProblem:**  
Runtime and payments teams invent parallel booking flags; one side releases, the other still shows open sequence.

**implementation:**  
On Engagement runtime, OutcomeVerification events emit with stable ids.  
Starting from Commercial → firm instrument list, open the instrument row; Release control consumes those events idempotently by event id to open/abort windows.  
On Escrow status, Trigger deep-links to the Engagement record meeting event that moved the instrument.

**implementationAdds:** `["outcome-verification-contract", "meeting-canceled", "meeting-reopened", "event-schema-version"]`

---

### escmech-22 — Escrow status read model for Commercial oversight

**Question:** What operator-facing read model makes the new ledger operable without Stripe login?  
**References:**
- Personas: Escrow & contingent-commercial oversight
- Seat 6 esc-25 adjacency: support context = Commercial facts only
- Roster plugs: Commercial · Escrow status · Release control  
**Thesis gap:** Ledger + jobs can exist in infra while Commercial remains a shell — capability payload never lands.  
**Solution:** Project a **per-tenancy Escrow status read model** (instruments, balances, status, window clocks, evidence summary, last receipt, dispute flag, counsel_gate, provider_refs) into Commercial so that house oversight and Support share one money picture.  
**Handoff:** both (PM: Commercial module completeness; CTO: projection from ledger)

**implementationProblem:**  
Commercial shows “escrow accepted” boolean while Release control and Support each invent their own truth.

**implementation:**  
Starting from Commercial (collection), open the firm instrument list and click a firm row to see all scoped instruments with status, principal, remaining releasable, window, evidence summary, last commercial receipt, dispute flag, and counsel_gate.  
On Escrow status, select an instrument row; Release control acts from that same read model.  
On Customer support → Ticket → Support context, the same Commercial facts are available, never Meta billing objects.

**implementationAdds:** `["escrow-status-read-model", "evidence-summary", "counsel-gate-visible", "commercial-facts-only"]`

---

## Handoff summary (C6)

| Owner | Absorb |
|---|---|
| **PM** | Escrow status vocabulary & read model; Release control affordances; Activation held≠released; Support Commercial facts; counsel_gate visibility; never-sees for client-fund rails |
| **CTO** | Ledger store + status machine; Connect hold/release rail; webhook/job idempotency; measurement-window jobs; evidence gate; transfer/refund ops; OutcomeVerification consumer; PCI-safe tokenization |
| **Counsel / room** | MT / MSB clearance for chosen rail (`escmech-20`) — **blocked** until signed |
| **Not this seat** | Accept-terms copy & peer-door law (seat 6); immigrant-funds commercial doctrine (seat 6); Meta billing (seat 5); CASL; book-auth ordering (seat 7) except held as activation hard input |

## Revealed-surface coverage

| Revealed surface | Status | Items |
|---|---|---|
| Escrow ledger (held / released / refunded per firm) | **new** | `escmech-01`…`escmech-09`, `escmech-16`…`escmech-19`, `escmech-22` |
| Outcome-verification → release trigger | **partial → wired** | `escmech-10`…`escmech-15`, `escmech-21` |
| Money-transmitter boundary handling | **blocked (counsel)** | `escmech-20` (+ rail note on `escmech-04`) |

## Counts

| Metric | Count |
|---|---|
| Items (`escmech-01`…`escmech-22`) | **22** |
| With Solution (`<mechanism> so that <purpose>`) | **22** |
| With implementation bridge | **22** |
| Explicit **BLOCKED (counsel)** | **1** (`escmech-20`) |
| Surfaces named | **Commercial**, **Escrow status**, **Release control**, **Engagement runtime**, **Accept terms** / **Escrow terms**, **Activation state**, **Customer support** / **Support context** |

**Path:** `/workspace/docs/sme/capability/C6-escrow-payment-mechanics.md`
