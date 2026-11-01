# Spec Delta

## Purpose

Keeps IRCC-shaped reference facts current as versioned data in the operator/house layer, so a reference move can re-evaluate eligibility without a code deploy.

## ADDED Requirements

### Requirement: Reference is versioned data
The system SHALL maintain versioned reference tables (categories, trades, cutoffs, provincial identifiers, and similar) as data. Industry criteria packs (Constants) SHALL be versioned packs. V1 truth SHALL be Canada-shaped.

#### Scenario: Operator updates a cutoff
- **WHEN** an operator publishes a new reference version that changes a cutoff
- **THEN** that change SHALL take effect as data without requiring a code deploy

### Requirement: Reference move is a faceless trigger
A reference move (draw threshold/cutoff shift, category added, trade or provincial identifier change) SHALL be a faceless first-class trigger with no screen and no human click required for the trigger itself.

#### Scenario: Cutoff shift re-evaluates
- **WHEN** a published reference version moves a cutoff
- **THEN** eligibility re-evaluation SHALL be initiated for every affected contact as the law / public-reference side of detection

### Requirement: Open-box without deploy
Because Om Coda is agency, evaluation rules, analysis, operational logic, and reference upkeep SHALL stay inspectable and changeable without a code deploy.

#### Scenario: House changes rules as data
- **WHEN** house operators change a criteria pack
- **THEN** they SHALL be able to do so as inspectable configuration, not only as a software release

### Requirement: Rule-pack IP remains unresolved
UNRESOLVED (Story silence): ownership / IP / liability of rule packs, and Constants packs beyond Immigration. The system MUST NOT invent extra-industry Constants packs from that silence.

#### Scenario: Do not invent extra industries
- **WHEN** specifying Constants packs for industries other than immigration
- **THEN** the product SHALL leave that as a named silence unless later corpus promotes it
