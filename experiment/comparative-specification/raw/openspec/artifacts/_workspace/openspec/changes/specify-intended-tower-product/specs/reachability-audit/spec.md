# Spec Delta

## Purpose

Answers only whether Tower can reach a contact and start a sequence on them, emitting reachable / partial / unreachable and sequence-ready verdicts.

## ADDED Requirements

### Requirement: Audit asks only reachability
Audit SHALL run data-validity checks over imports / the book: email valid, phone valid, at least one channel matching the intended sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present. It MAY connect to external validation where a check needs it.

#### Scenario: Sequence-ready is the pass
- **WHEN** an audit batch completes
- **THEN** the system SHALL emit verdicts reachable / partial / unreachable and mark contacts sequence-ready or not

### Requirement: Audit is not scoring or sales ceremony
Audit MUST NOT produce pathway/CRS scoring, ROI or activation-probability forecasts, minimum contact-count gates, or sales PASS/FAIL ceremony. Marketing “Database Opportunity Assessment” HTML MUST NOT be confused with in-app Audit.

#### Scenario: No pathway score on audit
- **WHEN** an operator runs Audit on a book
- **THEN** the result SHALL be reachability / sequence-ready, not a pathway or CRS score

### Requirement: Sequence-ready gates enrollment
Sequence-ready SHALL be a precondition for Engagement enrollment.

#### Scenario: Not ready
- **WHEN** a contact is not sequence-ready
- **THEN** the system MUST NOT enroll that contact into an engagement sequence as if Audit had passed

### Requirement: Import mutating the living list remains unresolved
UNRESOLVED (Story silence): contact-entry via import does not fully mutate the living list; CRM bidirectional sync is unnamed. The system MUST NOT invent a full living-list mutate or CRM-sync law from that silence.

#### Scenario: Silence on living-list mutate
- **WHEN** specifying whether import fully replaces the living book
- **THEN** the product SHALL leave that as a named silence rather than inventing a sync law
