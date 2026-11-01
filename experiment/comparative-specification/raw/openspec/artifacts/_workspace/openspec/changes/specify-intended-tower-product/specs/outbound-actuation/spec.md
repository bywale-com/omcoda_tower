# Spec Delta

## Purpose

Separates composing sequences from sending them, and gates live outbound messages on consent, halt, silence, and send mode so Wiring — not the presenting agent — fires channels.

## ADDED Requirements

### Requirement: Composing is not sending
Composing sequences SHALL be configuration (Agents / house libraries). Sending SHALL be automation / Wiring. The presenting agent MUST NOT fire sequences.

#### Scenario: Save vs send
- **WHEN** an operator saves sequence content
- **THEN** that save MUST NOT itself send messages; sending SHALL wait for enrollment / actuation under Wiring gates

### Requirement: Live send is gated
Live email and SMS MUST fail closed unless send mode allows. Consent missing, silenced, or halt active SHALL deny send and deny new enrollment. Probe sends without a contact MAY skip consent/halt only when explicitly out of the contact path.

#### Scenario: Halt denies send
- **WHEN** halt is active for the firm book or contact
- **THEN** a new send SHALL be denied

#### Scenario: Missing consent denies send
- **WHEN** a contact has no consent record and a contact-path send is attempted
- **THEN** the send SHALL be denied

### Requirement: Channel pattern
Standard outreach channels SHALL include Text, Email, and Form. One channel SHALL own the in-flight flow at a time. Text is SMS primer or fallback. Email is outbound plus replies. Form is checklist / capture.

#### Scenario: Owning channel
- **WHEN** an attempt is in flight on Email
- **THEN** Email SHALL own that flow until criteria hand off forward or inbound overrides

### Requirement: Stand-in ports are not the system
Live when secrets and DB are good: CEM email, SMS, webhooks into messaging events, OTP mailer, sending pool, Postgres halt/consent/CRM grant/audit/primary store, worker tick, access links. Still stand-in unless later promoted: Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress. Deferred MUST NOT be called “the system.”

#### Scenario: Name stand-ins
- **WHEN** describing Meta ads or escrow fulfillment as of this SHA
- **THEN** they SHALL be labeled stand-in or deferred, not live Core Function

### Requirement: Human gates are not automated away
The machine MUST NOT automate away: seed capture (stranger action), firm/user provision and OTP verify, database authorization, escrow accept, client opt-in / not silenced, meeting booking, and the firm’s responsibility to refuse illegal or unethical outreach.

#### Scenario: Meeting is a human commitment
- **WHEN** closing the loop
- **THEN** meeting booking SHALL remain a human commitment, not an automated fake booking
