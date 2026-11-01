# Spec Delta

## Purpose

Lands the two hard inputs that flip a campaign to running: database authorization (or equivalent that makes the campaign real) and escrow acceptance between the firm and Om Coda.

## ADDED Requirements

### Requirement: Two hard inputs are the activation finish line
The system SHALL accept database authorization and escrow acceptance as the activation finish line, then flip the campaign to running so it performs without further required activation inputs.

#### Scenario: Running after both commits
- **WHEN** a consultant on a prepared workspace authorizes the book and accepts escrow terms
- **THEN** the campaign SHALL be able to run without asking for more required activation inputs

### Requirement: Escrow is the peer door at activation payment
At the activation payment moment the presented door SHALL be escrow, not prepaid credits. Credits or a sales-call MUST NOT be presented as a peer door equal to escrow at that moment.

#### Scenario: No credits peer door
- **WHEN** the consultant is asked to accept commercial terms to go running
- **THEN** the system SHALL present escrow and MUST NOT present credits or a sales-call as an equal peer door

### Requirement: Money is firm to Om Coda only
Commercial terms SHALL be firm↔Om Coda. Tower MUST NOT hold immigrant settlement funds. End-clients MUST pay Tower nothing. Detection cost to the contact SHALL be free; the firm is charged.

#### Scenario: Contact is never billed by Tower
- **WHEN** an engagement contact receives outreach or books a meeting through Tower
- **THEN** Tower MUST NOT charge that contact

### Requirement: Escrow release remains unresolved
UNRESOLVED (Story silence): escrow release trigger / outcome definition, the concrete shape of “database authorization” per practice stack, and whether later SaaS packaging exists. Later SaaS MUST NOT replace escrow as the peer door at activation.

#### Scenario: Silence on release
- **WHEN** specifying when escrow releases
- **THEN** the product SHALL name that silence rather than inventing a founder-locked release rule
