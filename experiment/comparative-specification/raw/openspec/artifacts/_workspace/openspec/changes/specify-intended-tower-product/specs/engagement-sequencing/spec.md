# Spec Delta

## Purpose

Lets the operator define outreach sequencing — order deployed, firm/default/overrides, attempt rules, and goal criteria as an escalation point — and runs one in-flight sequence under a single owning channel.

## ADDED Requirements

### Requirement: Agents flagship
The system SHALL treat Agents as the place where the operator defines outreach sequencing — not only the sequence, the order in which outreach is deployed — per firm or as a default, plus overrides; escalations between attempts (retry / attempt rules); and a goal / goal criteria that is itself an escalation point: to other agents, to other workflows, or it ends. Once it is met, it is met. That is the endpoint. Everything in the middle is modular.

#### Scenario: Goal met is the endpoint
- **WHEN** an enrolled contact meets the authored goal criteria
- **THEN** that goal SHALL be treated as met (endpoint) and MAY escalate to another agent, to another workflow, or end, as authored

#### Scenario: Triggers are not Agents interior
- **WHEN** specifying what belongs on the Agents canvas
- **THEN** Automations triggers MUST NOT be placed inside the Agents flagship or canvas

### Requirement: Sequence is a blank container of campaigns
A sequence SHALL be a blank container that can hold multiple campaigns. Each campaign SHALL have one objective. Two things to meet SHALL require two campaigns. Opt-in, re-engagement, and reactivation SHALL be sequence templates, not objective names.

#### Scenario: Two objectives
- **WHEN** the operator wants two things met
- **THEN** each SHALL be its own campaign, and meeting the first campaign’s objective MAY qualify the contact for the next campaign without a qualify node

### Requirement: Channels are the medium
Channels SHALL be the medium (text, email, form). Sequencing (how many channels, in what order) SHALL live at campaign level. Channel rules SHALL be escalation on that medium. Attempt rules MUST NOT sit at the channel. An attempt SHALL be a container / cycle of the same sequence.

#### Scenario: Override this reveals channels
- **WHEN** the operator turns on Override this on a campaign
- **THEN** channel nodes SHALL be revealed as wires while campaign-level toggles remain on the campaign

### Requirement: Rules nest like CSS
Rules SHALL fall back: campaign override → sequence Settings → Agents Settings (global). If the operator does not override, the system SHALL fall back up.

#### Scenario: No campaign override
- **WHEN** a campaign does not override a rule
- **THEN** the sequence setting SHALL apply, and if that is also unset the Agents global setting SHALL apply

### Requirement: Agents enroll starts the mission now
Enroll on a sequence SHALL display who is enrolled and allow Add contact. Scope SHALL be Every firm (default) or Select from. Agents enroll SHALL start the mission now and MUST NOT wait on a current event. Automations enroll on an event is the other door.

#### Scenario: Add contact on sequence header
- **WHEN** the operator adds a contact on an agent sequence
- **THEN** that contact SHALL be enrolled into that sequence immediately, not queued on an Automations event

### Requirement: Campaign calendar is not the attempt engine
System 7a SHALL hold day-ordered engagement content for a phase and MUST NOT decide runtime channel ownership, waits, or attempt retries. System 7b SHALL own one in-flight sequence.

#### Scenario: Separate engines
- **WHEN** content order across days is authored
- **THEN** that authorship MUST NOT replace the runtime owning-channel / attempt engine

### Requirement: One owning channel at a time
At runtime the flow SHALL be owned by one channel at a time along Text → Email → Form, forward-only. Waits and attempts SHALL nest under the owning channel that failed. A live inbound MAY override an in-flight attempt. A finishing event SHALL close the sequence and MAY arm the next.

#### Scenario: Forward handoff
- **WHEN** criteria for leaving the owning channel are met
- **THEN** the system SHALL hand off forward along the channel order and MUST NOT move backward

### Requirement: Engagement record authors nothing
The engagement record SHALL be a chronology of events that already fired. It MUST NOT author channel order, attempt logic, or escalation.

#### Scenario: Chart is a tree of outreach
- **WHEN** a consultant views Activity / the engagement chart
- **THEN** it SHALL show the tree of outreach and MUST NOT connect left to the trigger or event that created the agent

### Requirement: Agency authorship tension is named
House-authored packs bound per tenancy (Seed / personas) and operator-authored sequencing with firm/default/overrides (flagship) both exist in the corpus. Specs MUST NOT silently kill either. UNRESOLVED: exact product lock of that tension.

#### Scenario: Do not drop one law
- **WHEN** specifying who authors sequences
- **THEN** the product SHALL keep both the agency bind thesis and the flagship override thesis visible rather than deleting one

### Requirement: Attempt windows remain unresolved unless promoted
UNRESOLVED (Story): exact product-locked attempt criteria windows and SMS reply-failure escalation. OPERATOR-REVISIONS windows (30 min / 24 h examples) MUST NOT be treated as Seed/World law until promoted.

#### Scenario: Prototype windows are not Story musts
- **WHEN** citing 30-minute text or 24-hour email windows
- **THEN** they SHALL be labeled operator-revision / prototype, not Seed/World locked law
