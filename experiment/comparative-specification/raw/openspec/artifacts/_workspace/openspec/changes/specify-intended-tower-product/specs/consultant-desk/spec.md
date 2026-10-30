# Spec Delta

## Purpose

Gives the acquired consultant a firm desk to hand over the book, authorize Tower under the firm license, inhabit Board / Client Data / Contacts / Meetings, and halt outreach they will not stand behind.

## ADDED Requirements

### Requirement: Desk verbs are hand over, authorize, receive
The consultant desk SHALL support handing over the private book, authorizing Tower to work under the firm license, and receiving booked meetings with a live brief — without requiring the consultant to author Automations or Agents.

#### Scenario: Prepared workspace hard inputs
- **WHEN** a consultant is activating on the prepared workspace
- **THEN** they SHALL be able to connect the book and accept terms without opening Configuration libraries

### Requirement: Board and client workspace
The consultant SHALL have a board of contacts with phase indicators and a client workspace with Details versus Activity. Activity SHALL hold the engagement chronology. Details SHALL hold profile / brief style information.

#### Scenario: Open a client from the board
- **WHEN** the consultant clicks a contact on the Board
- **THEN** that contact’s workspace SHALL open with Details and Activity available

### Requirement: Contacts and import
The consultant SHALL be able to see the book and import contacts (CSV or equivalent). Import SHALL feed Audit. Painted demo directories MUST NOT substitute for table rows.

#### Scenario: Empty contacts
- **WHEN** the firm book has no contact rows
- **THEN** Contacts SHALL show empty from the query, not invented people

### Requirement: Meetings receive booked rows
Meetings SHALL receive booked rows and the live brief. The consultant SHALL take meetings the engine booked without running the engagement themselves.

#### Scenario: Booked meeting appears
- **WHEN** a meeting is booked for a contact
- **THEN** it SHALL appear on the consultant Meetings desk with a live brief

### Requirement: Governance halt
The consultant SHALL be able to halt outreach they will not stand behind so the book is worked lawfully in their name.

#### Scenario: Halt from the desk
- **WHEN** the consultant activates halt for the book or a contact
- **THEN** new automatic enroll and send SHALL stop for that scope

### Requirement: Access is passwordless
The consultant SHALL sign in via passwordless OTP (or equivalent session) and land in their firm workspace.

#### Scenario: Sign in
- **WHEN** a provisioned consultant verifies OTP
- **THEN** they SHALL land in that firm’s consultant desk
