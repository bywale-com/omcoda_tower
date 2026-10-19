# Spec Delta

## Purpose

Governs who may be touched automatically, keeping firm database authorization from substituting for end-client consent, and supporting halt as a firm governance control.

## ADDED Requirements

### Requirement: Opt-in before deep collection
The system SHALL run an opt-in phase: firm-to-client consent and first channel open. Deep data collection SHALL be gated on opt-in. Contacts SHALL be sequenced, silenced, or unsequenced, with silenced when not opted in and when opted out.

#### Scenario: Not opted in
- **WHEN** a contact has not opted in
- **THEN** the system SHALL treat them as silenced for automatic outreach and MUST NOT run deep collection on them

### Requirement: Firm DB auth is not end-client consent
The system MUST NOT skip opt-in because ALG succeeded or because the firm authorized database access.

#### Scenario: Authorized book still needs opt-in
- **WHEN** a firm has authorized the book and a contact has not opted in
- **THEN** automatic deep outreach SHALL remain gated on that contact’s consent state

### Requirement: Halt suppresses new enroll and send
A firm-book or contact halt SHALL suppress new enrollments and new sends. Halt is a consultant governance control so outreach runs under the firm license only when the consultant will stand behind it.

#### Scenario: Halt active
- **WHEN** a halt record is active for the firm book or the contact
- **THEN** the system MUST NOT enroll that contact into new automatic outreach or send new messages to them

### Requirement: Consent feeds Audit
Consent and silenced state SHALL feed Audit reachability.

#### Scenario: Silenced contact in audit
- **WHEN** Audit evaluates a silenced contact
- **THEN** that silenced state SHALL affect the reachability / sequence-ready verdict

### Requirement: CASL and SMS regimes remain unresolved
UNRESOLVED (Story silence): CASL/SMS consent regimes by geography for firm-to-client and for the first agent-to-consultant text. The system MUST NOT invent those regimes as locked product law.

#### Scenario: Do not invent geography rules
- **WHEN** specifying exact CASL or SMS legal regimes by geography
- **THEN** the product SHALL leave those regimes unresolved rather than inventing them
