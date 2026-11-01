# Spec Delta

## Purpose

Defines why Tower exists, the consultant north-star, facet walls, which surface is the product face, and honesty constraints that every other capability must obey.

## ADDED Requirements

### Requirement: Proactive eligibility wrapped in engagement
Tower SHALL be a proactive eligibility engine wrapped in engagement for immigration consultancies. It MUST NOT be a reactive CRM whose primary job is answering “what do I do when someone emails?”

#### Scenario: Firm hands over a private book
- **WHEN** a firm has contacts and hands-free operation is armed
- **THEN** Tower keeps engaging dormant and active contacts, keeps immigration-relevant facts fresh through firm-to-client touchpoints, re-evaluates service eligibility as IRCC-shaped reference and client facts move, and surfaces campaign-worthy people so consultants book meetings without manually rechecking every file

#### Scenario: Public-before-contact detection is out of core
- **WHEN** a stranger is not already a contact on a firm’s private book
- **THEN** Tower MUST NOT cold-detect that stranger’s immigration eligibility from public databases as Core Function

### Requirement: Consultant north-star is hand over, authorize, receive
The core product outcome SHALL belong to the Consultant: hand the private book to Tower, authorize it to work under the firm license, and receive eligible clients booked — without setting up, configuring, or running engagement.

#### Scenario: Consultant does not author the engine
- **WHEN** a firm is in the Application facet and the consultant uses the firm desk
- **THEN** the consultant MUST be able to inhabit the book, refuse illegal outreach, and take booked meetings without opening configuration libraries to author Automations or Agents

### Requirement: Facet walls are immutable
The system SHALL treat Acquisition, Activation, Application, and Evolution as ordered facets. Acquisition collects cheap seed inputs only. Activation earns hard inputs. Application runs the desk loop. Evolution is product change, not a client lifecycle system.

#### Scenario: Hard inputs stay out of the click budget
- **WHEN** a stranger consultant is in Acquisition
- **THEN** the system MUST NOT pull database authorization or escrow into that click budget

#### Scenario: Same desk either door
- **WHEN** a firm is provisioned via ALG or via assisted / operator-led entry
- **THEN** both doors SHALL land in the same application / session matrix

### Requirement: Product face is prototype-ant
The intended product face SHALL be the CT Ant desks at `/prototype-ant` (Consultant, Operator, Contact). Hub SHALL be reference / plant for those modules, not the app. Register SHALL be house-side methodology tooling and MUST NOT appear in the shipped firm product.

#### Scenario: Default app route
- **WHEN** an operator or consultant opens the product application
- **THEN** they land on the Ant product face rather than Hub-as-the-app

#### Scenario: Register stays house-side
- **WHEN** a firm consultant is in a running firm workspace
- **THEN** that workspace MUST NOT present Register / methodology regeneration as a firm-facing module

### Requirement: Data in modules comes from tables
Records that show inside a module SHALL come from tables. The desk SHALL show what the query returns. The app MUST NOT hard-code demo people, tags, verdicts, runs, firms, or contacts into UI components so a screen looks full.

#### Scenario: Empty book
- **WHEN** the queried tables have no rows for the current firm
- **THEN** the module SHALL appear empty or personalized from real rows, not painted with invented contacts

### Requirement: Presentation is not fulfillment
Agent presentation MAY ask, explain, and route. It MUST NOT scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money. Those jobs belong to Automations and Wiring.

#### Scenario: Approach agent does not fulfill
- **WHEN** an Approach conversation asks a stranger for name, website, and a channel
- **THEN** persisting the capture, forward-deploying the workspace, and holding escrow SHALL be fulfilled by Automations / Wiring, not by the presenting agent
