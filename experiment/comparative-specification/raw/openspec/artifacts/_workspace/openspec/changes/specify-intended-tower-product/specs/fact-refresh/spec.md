# Spec Delta

## Purpose

Uses engagement touchpoints as the data-collection mechanism, routes asks by field class, and writes answers back so eligibility re-evaluates immediately.

## ADDED Requirements

### Requirement: Nudges collect facts
Nudges SHALL ask for or infer facts that affect eligibility. They MUST NOT be treated as spam blasts without a data job.

#### Scenario: Nudge carries a data ask
- **WHEN** a re-engagement nudge fires
- **THEN** that touchpoint SHALL carry a data ask or inference that can refresh the contact’s immigration picture

### Requirement: Field classes route the ask
Self-reportable facts SHALL go to forms / pre-meeting capture. Document-dependent facts MUST NEVER enter a form; they SHALL be tracked work items. Employer-directed asks SHALL be aimed at the firm, not the client.

#### Scenario: Document-dependent stays off forms
- **WHEN** a needed fact requires paperwork
- **THEN** the system MUST NOT put that need on a client form

### Requirement: Write-back triggers immediate re-evaluation
Answers from the client or consultant hand-entry SHALL write back. On any write-back the system SHALL initiate immediate eligibility re-evaluation. A missing fact SHALL be recorded as a signal.

#### Scenario: Form submit re-evaluates
- **WHEN** a contact submits a self-reportable answer
- **THEN** the system SHALL write the fact back and immediately re-evaluate service eligibility for that contact

### Requirement: Client desk depth remains unresolved
UNRESOLVED (Story silence): client desk depth (touchpoint-only vs authenticated portal) and D-02 in-meeting fallback surface. The system MUST NOT invent an authenticated client persona workspace from that silence.

#### Scenario: Do not invent a full client portal
- **WHEN** specifying an authenticated client workspace beyond firm-branded touchpoints
- **THEN** the product SHALL leave that depth unresolved rather than inventing a persona workspace
