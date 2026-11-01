# Spec Delta

## Purpose

Provisions firms and users and holds verified sessions so ALG and assisted doors land in one Application desk, with passwordless OTP and access links.

## ADDED Requirements

### Requirement: Provision uses versioned seed manifests
The system SHALL provision firms and users only via versioned seed manifests (assisted / OLG bootstrap). Ad hoc SQL MUST NOT be the provision path.

#### Scenario: Assisted provision
- **WHEN** an operator provisions a firm
- **THEN** that provision SHALL go through versioned seed manifests rather than one-off database edits

### Requirement: Passwordless OTP sessions
The system SHALL run passwordless OTP: send, verify, hold a session, validate the session for guarded actions, and clear the session on logout.

#### Scenario: Unprovisioned email is anti-enumerating
- **WHEN** an unprovisioned email requests a code
- **THEN** the system SHALL return generic success and MUST issue no code

### Requirement: Firm is the tenancy
Firm SHALL be the tenancy owning users and the contact book. Consultant SHALL be the firm operator / acquired persona in V1. Operator MUST NOT be treated as a firm Board login persona. The system MUST NOT mint an Agent seat in admission.

#### Scenario: Operator is not a consultant Board login
- **WHEN** an Om Coda operator signs in
- **THEN** they SHALL use the operator/house layer, not a consultant Board persona

### Requirement: Contact access links
Engagement contacts MAY enter a firm-branded touchpoint via access link. That path SHALL not be a branded Tower persona workspace.

#### Scenario: Token path
- **WHEN** a contact opens `/c/<token>`
- **THEN** they SHALL land in the contact touchpoint workspace for that token, without the consultant/operator desk switcher

### Requirement: Multi-consultant roles remain unresolved
UNRESOLVED (Story silence): multi-consultant roles and permissions, and production onboarding beyond manifests. The system MUST NOT invent a multi-consultant role matrix from that silence.

#### Scenario: Do not invent role catalog
- **WHEN** specifying roles beyond the V1 consultant operator
- **THEN** the product SHALL leave multi-consultant permissions unresolved rather than inventing a role matrix
