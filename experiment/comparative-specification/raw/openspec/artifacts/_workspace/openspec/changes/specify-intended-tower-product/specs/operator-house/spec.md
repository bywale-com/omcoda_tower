# Spec Delta

## Purpose

Gives Om Coda operators a house-global console plus per-tenancy admin so agency-authored operations can be configured, bound, and overseen across firms without making Operator a consultant Board persona.

## ADDED Requirements

### Requirement: Two operator surfaces
The operator/house layer SHALL be a house-global console plus per-tenancy admin, not one undifferentiated desk and not a firm Board login.

#### Scenario: Cross-firm vs one firm
- **WHEN** an operator works acquisition, shared reference, or pack authorship
- **THEN** that work SHALL live on the house-global console, while bind / provision / firm health SHALL be per-tenancy

### Requirement: Configuration libraries are house-authored and bound
Evaluation, rules, automation, and sequence/campaign template packs SHALL be authored in house-global configuration libraries and bound per tenancy. Firms MUST NOT be required to author those packs alone at the consultant desk.

#### Scenario: Bind Active
- **WHEN** an operator binds a pack to a firm
- **THEN** that firm SHALL run the bound house-authored operations under that firm identity

### Requirement: Agents and Automations workbenches
Operator Configuration libraries SHALL include Agents (creation place for sequences/campaigns) and Automations (brain / operations). Product face for those workbenches SHALL be Ant. Hub SHALL remain plant, not the app.

#### Scenario: Operator opens Agents
- **WHEN** an operator opens Agents from Configuration libraries on `/prototype-ant`
- **THEN** they SHALL author sequences/campaigns there, not by treating Hub as the running product

### Requirement: Per-tenancy admin modules
Per-tenancy admin SHALL include provision, commercial posture, firm operations bind, book readiness / audit, firm health, and that firm’s activation state.

#### Scenario: Provision a tenancy
- **WHEN** an operator provisions a firm
- **THEN** that action SHALL be a per-tenancy admin job landing the firm in the same application desk

### Requirement: House-global modules
House-global console SHALL include acquisition/ads, activation/forward-deploy pipeline, reference data, configuration libraries, oversight, audit trail, founder/agency controls, and customer support. Register & evolution SHALL be house-side prototype tooling and MUST NOT ship on the firm desk.

#### Scenario: Register not on firm desk
- **WHEN** a consultant uses the shipped firm product
- **THEN** Register & evolution MUST NOT appear as a firm module

### Requirement: Meta and escrow go-live may be deferred
Prototype honesty MAY defer Meta ads go-live and escrow fulfillment. Story still requires Acquisition and Commercial as capabilities. Deferred MUST be labeled deferred, not “the system is complete without them.”

#### Scenario: Deferred is named
- **WHEN** Meta or escrow fulfillment is not live
- **THEN** those capabilities SHALL remain specified and marked deferred rather than deleted from the intended product
