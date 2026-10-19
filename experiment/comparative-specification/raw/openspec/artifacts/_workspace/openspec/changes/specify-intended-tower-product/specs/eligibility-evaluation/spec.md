# Spec Delta

## Purpose

Recomputes private service eligibility when client facts or reference move, and emits every determination — including missing data — as a signal.

## ADDED Requirements

### Requirement: Eligibility is private to the firm book
The system SHALL evaluate from firm-held plus engagement-collected client facts against house-held or firm-configured rules. Eligibility SHALL be private to that firm book.

#### Scenario: No public stranger scoring
- **WHEN** evaluating service eligibility
- **THEN** the system MUST use the firm’s private facts and MUST NOT cold-score strangers from public databases as Core Function

### Requirement: Two detection sides
The system SHALL accept two detection sides: law / public-reference moves, and life-change facts only the person or firm-file knows. A static book dump MUST NOT be treated as sufficient for the life-change side.

#### Scenario: Life change after import
- **WHEN** a contact’s permit or work fact changes after the original book dump
- **THEN** eligibility SHALL be able to move based on that life-change fact, not only the original import

### Requirement: Pathway pass is any pathway assertion
Pathway pass SHALL be any pathway assertion (CEC or FSW or FST or PNP-*), not one favoured pathway.

#### Scenario: Alternate pathway
- **WHEN** a contact does not pass one pathway but does pass another asserted pathway
- **THEN** the system SHALL treat pathway pass as satisfied by that any-pathway assertion

### Requirement: Every determination is a signal
The system SHALL emit every determination, including missing-data, as a signal. Analysis SHALL produce a readout (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath.

#### Scenario: Missing data still emits
- **WHEN** evaluation cannot complete because required data is missing
- **THEN** the system SHALL still emit a missing-data determination as a signal

### Requirement: Evaluation stays open-box
Evaluation SHALL stay inspectable and changeable without a deploy.

#### Scenario: Operator inspects a rule
- **WHEN** an operator opens a service-eligibility rule
- **THEN** they SHALL be able to inspect conditions and constants (and toggle outcome families) without a code release

### Requirement: Required-data listing on rule output
Face law: required data MUST be an output class — a listing of collectible fields, not a flag. Forms SHALL be built from that listing. UNRESOLVED whether that listing is fully stood up; the corpus names it as not stood up at Face write time. Specs MUST NOT invent the rest of the collectible catalog.

#### Scenario: Form binds to required fields
- **WHEN** a rule emits required data
- **THEN** a data-request form SHALL be able to bind its questions to that listing rather than to an invented catalog
