# Spec Delta

## Purpose

Obtains the three cheap seed inputs from a stranger consultant inside the click budget, then returns that stranger to their scroll so Activation can begin.

## ADDED Requirements

### Requirement: Seed inputs are the acquisition finish line
Acquisition SHALL finish when firm/consultant name, website, and one channel (phone or email) are captured. V1 Approach SHALL be Meta (Facebook / Instagram). LinkedIn is deferred. Cold email MUST NOT be a V1 Approach.

#### Scenario: One-tap capture
- **WHEN** a stranger consultant taps a Meta Approach
- **THEN** the system SHALL capture name, website, and one channel inside a one-click design constraint and persist the capture with session attribution

#### Scenario: Continue scroll
- **WHEN** those seed inputs have landed
- **THEN** the system SHALL return the stranger to their scroll and MUST NOT present a thank-you dashboard as the acquisition finish

### Requirement: Continue-scroll without tapping is first-class
The system SHALL treat continue-scroll without tapping as a first-class non-action and instrument whether the stranger did not understand versus understood and did not tap.

#### Scenario: Non-tap is recorded
- **WHEN** an Approach impression is shown and the stranger does not tap
- **THEN** the system SHALL record that non-action rather than treating it as absence of data

### Requirement: Approach acquires only the consultant
Approach SHALL acquire one non-house party in V1: the Consultant. Engagement contacts MUST NEVER be acquired via Approach. The Om Coda house MUST NEVER be acquired via Approach.

#### Scenario: Contact is not an Approach stranger
- **WHEN** a person is an end-client on a firm book
- **THEN** they MUST NOT be acquired into Tower through the Meta Approach used for consultants

### Requirement: Acquisition does not collect hard inputs
UNRESOLVED (Story silence): when/whether email earns Meta entry, and Meta targeting / CAC, remain unnamed. The system MUST NOT invent those as founder-locked product rules.

#### Scenario: Silence stays named
- **WHEN** specifying Meta targeting, CAC, or whether email earns Meta entry
- **THEN** the product SHALL leave those items unresolved rather than filling them as decided law
