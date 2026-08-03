# C6 Escrow / contingent-payment mechanics — Function paper traces

Paper-only Function wiring for Tower capability seat C6. These traces fuse onto the shared payment and audit nodes from the seed vocabulary and stay at state-node altitude: ledger entries, held balances, evidence packages, webhook receipts, tenancy, and audit trail.

## Local node list

- `firm_tenancy` (existing) — tenant boundary that scopes instruments, provider references, and Commercial oversight.
- `escrow_ledger_entry` (existing) — contingent payment instrument state for a firm.
- `held_balance` (existing) — immobilized funds state keyed to the instrument.
- `payment_webhook_receipt` (existing) — verified provider ingress receipt and idempotency key store.
- `release_evidence_package` (existing) — validated outcome proof package for release, return, or forfeit decisions.
- `audit_trail` (existing) — append-only commercial and system event log.
- `provider_payment_identity` (new) — tokenized customer, payment method, charge, account, transfer, and refund reference state.
- `escrow_status_machine` (new) — legal transition set and rejection state for ledger status changes.
- `release_attempt` (new) — idempotent release, return, or forfeit attempt keyed to instrument, evidence, and action.
- `outcome_verification_event` (new) — durable Engagement runtime event for meeting booked, canceled, or reopened.
- `attribution_path` (new) — inspectable campaign, enrollment, contact, and meeting membership proof.
- `measurement_window` (new) — window clock state for release stability.
- `dispute_freeze` (new) — freeze state that halts release jobs and provider money motion.
- `escrow_status_read_model` (new) — per-tenancy Commercial projection for instruments, balances, evidence, receipts, provider refs, and gate state.
- `counsel_gate` (new) — human counsel clearance state for MT/MSB rail posture.

---

### `escmech-01` — Escrow ledger as per-firm instrument store
**Implementation (source):** Commercial and Release control read durable per-tenancy escrow instruments instead of reconstructing money posture from a processor console.
**Start:** Starting from `firm_tenancy` (existing)
**Path:**
1. When a firm accepts contingent commercial terms at `firm_tenancy`, a scoped instrument is opened at `escrow_ledger_entry`.
2. When the instrument is opened at `escrow_ledger_entry`, principal, currency, provider refs, terms version, cap, and current status are initialized at `held_balance`.
3. When the ledger entry is initialized at `escrow_ledger_entry`, a creation receipt is appended at `audit_trail`.
4. When Commercial requests firm money posture at `firm_tenancy`, current instruments and balances are projected from `escrow_ledger_entry` into `escrow_status_read_model`.
**Nodes touched:**
- `firm_tenancy`
- `escrow_ledger_entry`
- `held_balance`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance.

### `escmech-02` — Closed ledger status machine
**Implementation (source):** Escrow instruments move only through the closed status path and rejected transitions are recorded.
**Start:** Starting from `escrow_ledger_entry` (existing)
**Path:**
1. When a status transition is requested at `escrow_ledger_entry`, the requested edge is checked at `escrow_status_machine`.
2. When the requested edge is legal at `escrow_status_machine`, the status change is applied at `escrow_ledger_entry`.
3. When the requested edge is illegal at `escrow_status_machine`, a rejected transition receipt is appended at `audit_trail`.
4. When status changes at `escrow_ledger_entry`, allowed next actions refresh at `escrow_status_read_model`.
**Nodes touched:**
- `escrow_ledger_entry`
- `escrow_status_machine`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-03` — Immobilize principal while held
**Implementation (source):** A ledger reaches held only after the provider confirms funds are immobilized.
**Start:** Starting from `payment_webhook_receipt` (existing)
**Path:**
1. When a signed hold-confirmation webhook arrives at `payment_webhook_receipt`, provider event identity is deduped before any balance changes occur.
2. When the webhook is accepted at `payment_webhook_receipt`, immobilized provider refs are written to `provider_payment_identity`.
3. When immobilized provider refs are present at `provider_payment_identity`, the corresponding funds become held at `held_balance`.
4. When held funds are recorded at `held_balance`, the instrument moves from pending accept or failed hold to held at `escrow_ledger_entry`.
5. When held status is applied at `escrow_ledger_entry`, Activation reads escrow satisfied from `escrow_status_read_model`.
**Nodes touched:**
- `payment_webhook_receipt`
- `provider_payment_identity`
- `held_balance`
- `escrow_ledger_entry`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-04` — Stripe Connect / marketplace hold-release rail mechanics
**Implementation (source):** Firm-as-payer hold and later transfer are represented as provider rail refs on one ledger instrument, subject to counsel clearance.
**Start:** Starting from `provider_payment_identity` (new)
**Path:**
1. When the selected Connect marketplace rail is configured at `provider_payment_identity`, charge, account, and eventual transfer reference slots are bound to `firm_tenancy`.
2. When a firm hold succeeds at `provider_payment_identity`, the charge ref updates `held_balance`.
3. When held funds settle at `held_balance`, the rail posture is written to `escrow_ledger_entry`.
4. When release later becomes eligible at `release_evidence_package`, the transfer ref is added to the same provider identity rather than creating a detached payout.
5. When provider refs change at `provider_payment_identity`, a rail receipt is appended at `audit_trail`.
**Nodes touched:**
- `provider_payment_identity`
- `firm_tenancy`
- `held_balance`
- `escrow_ledger_entry`
- `release_evidence_package`
- `audit_trail`
- `counsel_gate`
**Facets swept:** External Systems; Data Storage & Management; Identity / Security / Compliance; Cost / FinOps.
**Missing seat flag (optional):** MT/MSB legal posture remains gated by `counsel_gate`; mechanics do not create legal clearance.

### `escmech-05` — Authorize/capture and release transfer are distinct operations
**Implementation (source):** Accept-time custody and outcome-time payout are separate ledger and provider events.
**Start:** Starting from `escrow_ledger_entry` (existing)
**Path:**
1. When Accept-time hold is initiated at `escrow_ledger_entry`, the hold operation creates or updates charge state at `provider_payment_identity`.
2. When provider hold confirmation arrives at `payment_webhook_receipt`, captured or immobilized funds update `held_balance`.
3. When outcome evidence validates at `release_evidence_package`, a separate transfer action is opened at `release_attempt`.
4. When the transfer succeeds at `provider_payment_identity`, the ledger moves to released at `escrow_ledger_entry`.
5. When the ledger moves to released at `escrow_ledger_entry`, both original charge ref and later transfer ref are retained in `audit_trail`.
**Nodes touched:**
- `escrow_ledger_entry`
- `provider_payment_identity`
- `payment_webhook_receipt`
- `held_balance`
- `release_evidence_package`
- `release_attempt`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Cost / FinOps.

### `escmech-06` — Cap / collar enforcement on the ledger
**Implementation (source):** Release amounts are constrained by held principal, release schedule, and remaining cap on the instrument.
**Start:** Starting from `held_balance` (existing)
**Path:**
1. When held principal is established at `held_balance`, hard cap and remaining releasable amount are recorded at `escrow_ledger_entry`.
2. When a release action is requested at `release_attempt`, the requested amount is compared against remaining releasable at `held_balance`.
3. When the requested amount exceeds the cap at `held_balance`, a cap-block decision is written to `release_attempt`.
4. When a cap-block occurs at `release_attempt`, no provider transfer ref is created at `provider_payment_identity`.
5. When cap state changes at `held_balance`, Commercial cap posture refreshes at `escrow_status_read_model`.
**Nodes touched:**
- `held_balance`
- `escrow_ledger_entry`
- `release_attempt`
- `provider_payment_identity`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Cost / FinOps; Identity / Security / Compliance.

### `escmech-07` — Terms version bound to the instrument
**Implementation (source):** The accepted terms version and predicate hash are frozen on the instrument and used for all later decisions.
**Start:** Starting from `escrow_ledger_entry` (existing)
**Path:**
1. When terms are accepted within `firm_tenancy`, the accepted terms version and predicate hash are stamped onto `escrow_ledger_entry`.
2. When the instrument reaches held at `escrow_ledger_entry`, the same terms stamp is bound to `held_balance`.
3. When release, return, or forfeit is evaluated at `release_evidence_package`, predicate checks read the frozen terms stamp from `escrow_ledger_entry`.
4. When a terms amendment is recorded at `firm_tenancy`, open instruments keep their existing stamp and any new accepted instrument receives a new stamp.
5. When any decision uses a terms stamp at `release_evidence_package`, the stamp is appended into `audit_trail`.
**Nodes touched:**
- `firm_tenancy`
- `escrow_ledger_entry`
- `held_balance`
- `release_evidence_package`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `escmech-08` — Accept to hold confirmation via idempotent webhooks
**Implementation (source):** Verified provider webhooks drive pending accept to held, and duplicate event ids are no-ops.
**Start:** Starting from `payment_webhook_receipt` (existing)
**Path:**
1. When a provider payment event arrives at `payment_webhook_receipt`, signature and tenant correlation are verified before applying the event.
2. When the provider event id already exists at `payment_webhook_receipt`, the duplicate delivery is marked replayed and no ledger mutation occurs.
3. When the provider event id is new at `payment_webhook_receipt`, the event links to a pending instrument at `escrow_ledger_entry`.
4. When the linked event confirms successful hold at `payment_webhook_receipt`, `held_balance` records immobilized funds.
5. When held funds are recorded at `held_balance`, the transition receipt is appended at `audit_trail`.
**Nodes touched:**
- `payment_webhook_receipt`
- `escrow_ledger_entry`
- `held_balance`
- `audit_trail`
- `firm_tenancy`
**Facets swept:** External Systems; Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-09` — Webhook and job idempotency for release path
**Implementation (source):** Release, return, and forfeit attempts share stable idempotency keys across job retries and provider retries.
**Start:** Starting from `release_attempt` (new)
**Path:**
1. When a release, return, or forfeit job is scheduled at `release_attempt`, an idempotency key is formed from instrument, evidence, and action.
2. When the same action retries at `release_attempt`, the existing idempotency key and provider request state are reused.
3. When provider completion arrives at `payment_webhook_receipt`, provider event id and action idempotency key are matched before status changes at `escrow_ledger_entry`.
4. When a duplicate provider completion arrives at `payment_webhook_receipt`, the replay receipt updates `audit_trail` without moving funds again.
5. When terminal money motion succeeds at `provider_payment_identity`, the corresponding balance reduction is applied at `held_balance`.
**Nodes touched:**
- `release_attempt`
- `payment_webhook_receipt`
- `escrow_ledger_entry`
- `provider_payment_identity`
- `held_balance`
- `audit_trail`
**Facets swept:** Core Application & Runtime; External Systems; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance; Cost / FinOps.

### `escmech-10` — Outcome verification to release trigger
**Implementation (source):** A verified meeting booked event opens the release pending window for the matching held instrument.
**Start:** Starting from `outcome_verification_event` (new)
**Path:**
1. When Engagement runtime emits meeting booked at `outcome_verification_event`, firm, campaign, enrollment, contact, meeting, and occurrence time are recorded.
2. When the event is recorded at `outcome_verification_event`, the firm and campaign are matched to held instruments at `escrow_ledger_entry`.
3. When a matching held instrument exists at `escrow_ledger_entry`, attribution proof is requested at `attribution_path`.
4. When attribution proof passes at `attribution_path`, the instrument enters release pending window at `escrow_ledger_entry`.
5. When the window opens at `escrow_ledger_entry`, the trigger evidence id appears in `escrow_status_read_model`.
**Nodes touched:**
- `outcome_verification_event`
- `escrow_ledger_entry`
- `attribution_path`
- `measurement_window`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-11` — Attribution gate before window opens
**Implementation (source):** Release eligibility requires inspectable enrollment, campaign, contact, and meeting membership proof.
**Start:** Starting from `attribution_path` (new)
**Path:**
1. When a meeting booked event is received at `outcome_verification_event`, membership data is assembled at `attribution_path`.
2. When campaign, enrollment, contact, and meeting linkage is present at `attribution_path`, release eligibility advances at `escrow_ledger_entry`.
3. When linkage is missing at `attribution_path`, attribution failed is written to `release_evidence_package`.
4. When attribution failed is written at `release_evidence_package`, release pending window remains closed at `measurement_window`.
5. When attribution decision is made at `attribution_path`, the decision and source ids are appended at `audit_trail`.
**Nodes touched:**
- `outcome_verification_event`
- `attribution_path`
- `escrow_ledger_entry`
- `release_evidence_package`
- `measurement_window`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-12` — Measurement-window clock job
**Implementation (source):** Release waits for the frozen terms window to elapse without cancel or reopen events.
**Start:** Starting from `measurement_window` (new)
**Path:**
1. When attribution passes at `attribution_path`, a window is opened at `measurement_window` using the frozen terms stamp from `escrow_ledger_entry`.
2. When the window opens at `measurement_window`, the instrument changes to release pending window at `escrow_ledger_entry`.
3. When meeting canceled or reopened occurs at `outcome_verification_event` before deadline, the window is aborted at `measurement_window`.
4. When the deadline elapses without abort at `measurement_window`, releasable state is written to `release_evidence_package`.
5. When window state changes at `measurement_window`, opened, ends, canceled, elapsed, and abort fields refresh at `escrow_status_read_model`.
**Nodes touched:**
- `measurement_window`
- `attribution_path`
- `escrow_ledger_entry`
- `outcome_verification_event`
- `release_evidence_package`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance.

### `escmech-13` — Release evidence package assembly
**Implementation (source):** Provider release is gated on one validated evidence object containing outcome, attribution, window, and terms proof.
**Start:** Starting from `release_evidence_package` (existing)
**Path:**
1. When window elapsed occurs at `measurement_window`, meeting, tenancy, instrument, attribution, and terms facts are assembled at `release_evidence_package`.
2. When required fields are present at `release_evidence_package`, the package validates and becomes release eligible.
3. When required fields are missing at `release_evidence_package`, release eligibility remains blocked at `release_attempt`.
4. When the package validates at `release_evidence_package`, the package id is written to `escrow_ledger_entry`.
5. When package state changes at `release_evidence_package`, evidence summary refreshes at `escrow_status_read_model`.
**Nodes touched:**
- `release_evidence_package`
- `measurement_window`
- `release_attempt`
- `escrow_ledger_entry`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-14` — Release control to provider release or transfer
**Implementation (source):** A releasable instrument executes provider transfer first, then the ledger becomes released.
**Start:** Starting from `release_attempt` (new)
**Path:**
1. When execute release is requested at `release_attempt`, releasable state and evidence validity are checked at `release_evidence_package`.
2. When evidence is valid at `release_evidence_package`, remaining cap and held principal are checked at `held_balance`.
3. When the amount passes cap at `held_balance`, provider transfer is requested through `provider_payment_identity` with the release idempotency key.
4. When provider transfer succeeds at `provider_payment_identity`, transfer ref is written to `escrow_ledger_entry`.
5. When transfer ref is present at `escrow_ledger_entry`, status moves to released and the receipt is appended at `audit_trail`.
**Nodes touched:**
- `release_attempt`
- `release_evidence_package`
- `held_balance`
- `provider_payment_identity`
- `escrow_ledger_entry`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; External Systems; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; Cost / FinOps.

### `escmech-15` — Dispute freeze halts release jobs
**Implementation (source):** Buyer or provider dispute state freezes the instrument and cancels pending release motion.
**Start:** Starting from `dispute_freeze` (new)
**Path:**
1. When a buyer dispute is opened at `firm_tenancy`, freeze state is created at `dispute_freeze`.
2. When a provider dispute or chargeback webhook arrives at `payment_webhook_receipt`, freeze state is created or updated at `dispute_freeze`.
3. When freeze state becomes active at `dispute_freeze`, pending release jobs are canceled at `release_attempt`.
4. When release jobs are canceled at `release_attempt`, the instrument moves to disputed at `escrow_ledger_entry`.
5. When dispute clearance occurs at `dispute_freeze`, release controls re-evaluate evidence and window state before any money motion resumes.
**Nodes touched:**
- `firm_tenancy`
- `payment_webhook_receipt`
- `dispute_freeze`
- `release_attempt`
- `escrow_ledger_entry`
- `release_evidence_package`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; External Systems; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `escmech-16` — Return / refund rail mechanic
**Implementation (source):** Return predicates move held funds back to the firm through an idempotent provider refund path.
**Start:** Starting from `release_attempt` (new)
**Path:**
1. When a return predicate fires at `release_evidence_package`, a return action is opened at `release_attempt`.
2. When the return action opens at `release_attempt`, the provider refund or reversal target is resolved at `provider_payment_identity`.
3. When provider refund succeeds at `provider_payment_identity`, refund ref and amount reduce `held_balance`.
4. When the refund ref is present at `provider_payment_identity`, the instrument moves to returned at `escrow_ledger_entry`.
5. When returned status is applied at `escrow_ledger_entry`, return reason and provider receipt are appended at `audit_trail`.
**Nodes touched:**
- `release_evidence_package`
- `release_attempt`
- `provider_payment_identity`
- `held_balance`
- `escrow_ledger_entry`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; External Systems; Data Storage & Management; Identity / Security / Compliance; Cost / FinOps; Infrastructure & Operations.

### `escmech-17` — Forfeit terminal without calling it release
**Implementation (source):** Forfeit is a distinct terminal state with its own evidence type and money disposition.
**Start:** Starting from `release_evidence_package` (existing)
**Path:**
1. When a forfeit predicate fires under frozen terms at `release_evidence_package`, a forfeit action is opened at `release_attempt`.
2. When the forfeit action opens at `release_attempt`, forfeit reason and disposition are stored separately from meeting booked release evidence.
3. When disposition requires money movement at `release_attempt`, provider transfer or fee refs are written at `provider_payment_identity` with a forfeit idempotency key.
4. When forfeit disposition settles at `provider_payment_identity`, the instrument moves to forfeited at `escrow_ledger_entry`.
5. When forfeited status is applied at `escrow_ledger_entry`, analytics and Commercial read forfeit rather than released from `escrow_status_read_model`.
**Nodes touched:**
- `release_evidence_package`
- `release_attempt`
- `provider_payment_identity`
- `escrow_ledger_entry`
- `held_balance`
- `audit_trail`
- `escrow_status_read_model`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Cost / FinOps.

### `escmech-18` — Append-only commercial receipts
**Implementation (source):** Every ledger transition emits a tenant-scoped receipt with actor, inputs, decision, evidence, and provider refs.
**Start:** Starting from `audit_trail` (existing)
**Path:**
1. When a ledger transition is attempted at `escrow_ledger_entry`, actor, source system, from status, to status, and predicate inputs are assembled for `audit_trail`.
2. When evidence participates in the transition at `release_evidence_package`, evidence pointers are copied into the receipt at `audit_trail`.
3. When provider refs participate in the transition at `provider_payment_identity`, provider pointers are copied into the receipt at `audit_trail`.
4. When the receipt is appended at `audit_trail`, last receipt and transition history refresh at `escrow_status_read_model`.
5. When Support requests Commercial facts at `firm_tenancy`, the last receipt is read from `escrow_status_read_model`.
**Nodes touched:**
- `audit_trail`
- `escrow_ledger_entry`
- `release_evidence_package`
- `provider_payment_identity`
- `escrow_status_read_model`
- `firm_tenancy`
**Facets swept:** Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime; Infrastructure & Operations.

### `escmech-19` — PCI adjacency: tokenize and never store PAN
**Implementation (source):** Payment method capture stays provider-tokenized and Tower stores only provider identifiers.
**Start:** Starting from `provider_payment_identity` (new)
**Path:**
1. When payment method entry begins at `firm_tenancy`, provider-hosted or tokenized collection state is created at `provider_payment_identity`.
2. When tokenized collection succeeds at `provider_payment_identity`, customer id and payment method id are stored without raw card data.
3. When a hold is initiated at `escrow_ledger_entry`, the ledger references tokenized provider identifiers from `provider_payment_identity`.
4. When provider payment events arrive at `payment_webhook_receipt`, payload handling stores event ids, charge ids, and payment method refs rather than PAN or CVV.
5. When provider identity changes at `provider_payment_identity`, a PCI boundary receipt is appended at `audit_trail`.
**Nodes touched:**
- `firm_tenancy`
- `provider_payment_identity`
- `escrow_ledger_entry`
- `payment_webhook_receipt`
- `audit_trail`
**Facets swept:** External Systems; Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime; Infrastructure & Operations.

### `escmech-20` — BLOCKED counsel: money-transmitter boundary
**Implementation (source):** Production MT/MSB clearance is a counsel gate; engineering only records firm-payer scope and refuses client-fund intake.
**Start:** Starting from `counsel_gate` (new)
**Path:**
1. When MT/MSB clearance is pending at `counsel_gate`, production release rail activation remains blocked at `firm_tenancy`; no production MT/MSB topology is invented.
2. When firm-payer scope is recorded at `firm_tenancy`, the instrument remains limited to firm to Om Coda commercial consideration at `escrow_ledger_entry`.
3. When client-fund intake is requested at `firm_tenancy`, the request is rejected into `audit_trail` because no client-fund intake node or production flow exists.
4. When human counsel later clears a chosen rail at `counsel_gate`, production eligibility may be re-evaluated for the existing firm-payer nodes only.
**Nodes touched:**
- `counsel_gate`
- `firm_tenancy`
- `escrow_ledger_entry`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; External Systems; Core Application & Runtime.
**Missing seat flag (optional):** BLOCKED counsel — no production MT/MSB topology, client-fund intake rail, or legal clearance is represented here.

### `escmech-21` — Engagement runtime to Release control event contract
**Implementation (source):** Engagement runtime publishes a versioned outcome contract that Release control consumes idempotently.
**Start:** Starting from `outcome_verification_event` (new)
**Path:**
1. When meeting booked, canceled, or reopened occurs in Engagement runtime, a versioned event is written at `outcome_verification_event`.
2. When the event is written at `outcome_verification_event`, event id, source, time, tenancy, campaign, contact, meeting, and schema version are recorded.
3. When Release control consumes the event at `outcome_verification_event`, event id dedupe is checked before changes occur at `measurement_window`.
4. When meeting booked passes dedupe at `outcome_verification_event`, attribution and window opening proceed through `attribution_path` and `measurement_window`.
5. When meeting canceled or reopened passes dedupe at `outcome_verification_event`, any open window aborts at `measurement_window`.
6. When event consumption changes payment state, Engagement and Escrow cross-links refresh at `escrow_status_read_model`.
**Nodes touched:**
- `outcome_verification_event`
- `measurement_window`
- `attribution_path`
- `escrow_ledger_entry`
- `release_evidence_package`
- `escrow_status_read_model`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance.

### `escmech-22` — Escrow status read model for Commercial oversight
**Implementation (source):** Commercial, Release control, and Support share one per-tenancy escrow status projection.
**Start:** Starting from `escrow_status_read_model` (new)
**Path:**
1. When instrument, status, or balance changes at `escrow_ledger_entry`, projection rows refresh at `escrow_status_read_model`.
2. When evidence package state changes at `release_evidence_package`, evidence summary and trigger source refresh at `escrow_status_read_model`.
3. When window or dispute state changes at `measurement_window` or `dispute_freeze`, clocks and freeze flags refresh at `escrow_status_read_model`.
4. When provider refs change at `provider_payment_identity`, charge, transfer, refund, and rail refs refresh at `escrow_status_read_model`.
5. When counsel gate state changes at `counsel_gate`, gate visibility refreshes at `escrow_status_read_model`.
6. When Support or Commercial reads firm money posture at `firm_tenancy`, the shared projection supplies facts without processor-console access.
**Nodes touched:**
- `escrow_status_read_model`
- `escrow_ledger_entry`
- `held_balance`
- `release_evidence_package`
- `measurement_window`
- `dispute_freeze`
- `provider_payment_identity`
- `counsel_gate`
- `firm_tenancy`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations; Cost / FinOps.
