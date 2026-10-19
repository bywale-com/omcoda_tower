# Spec Delta

## Purpose

Performs operations on events: listen (in-app event Global or Local, schedule, manual, webhook), run a definite middle, then take binary exits — including in-app actions and assigning agents — with a handle to every write that run made.

## ADDED Requirements

### Requirement: Definite middle
An automation SHALL follow: on this event (schedule or trigger) → perform this operation → on this kind of result do X / on that kind do Y. Results SHALL be binary or the binaries already defined. Smallest legal workflow SHALL be trigger · rule · action. The canvas SHALL be able to chain.

#### Scenario: Teaching walk
- **WHEN** a firm is created / provisioned
- **THEN** an automation SHALL be able to audit the contacts, then If on that output, then assign an agent

### Requirement: Two listen kinds
The system SHALL hear something that happened in the app as an event, all of that kind (Global) or this specific one (Local). Non-event listens SHALL be schedule, manual, and webhook. Webhook is a way in, not an action.

#### Scenario: Form submitted Global vs Local
- **WHEN** an operator authors a form-submitted trigger
- **THEN** they SHALL be able to choose all forms of that kind (Global) or this form (Local)

### Requirement: Named events only
Named in-app events SHALL include: a form was submitted; a campaign failed; someone opted out / unsubscribed; a firm was created / provisioned; an audit finished; a contact file was imported; an objective was met. The system MUST NOT treat “any row changed” as an event. Specs MUST NOT invent the rest of the catalog.

#### Scenario: Unsupported when
- **WHEN** a proposed trigger is not on the named event list and is not schedule, manual, or webhook
- **THEN** the shape SHALL NOT support it yet

### Requirement: Two action kinds
Actions SHALL be (1) Agents — assign an existing sequence or create from a template; the operator MUST NOT author a new agent inside Automations — and (2) in the application: ascribe a tag, run an audit, who this applies to, make a form, and later provision a firm. The system MUST NOT offer “write whatever into whatever table.” If / condition is not an action.

#### Scenario: Agents action choices
- **WHEN** the operator adds an Agents action
- **THEN** the choices SHALL be assign to an existing sequence or create from a template, with no third choice to author a new agent here

### Requirement: Forms live in Automations
Data-request forms SHALL be created in Automations. Agents MUST NOT be a form builder. Re-engagement is a campaign name, not an objective. UNRESOLVED: form-as-own-graph-node versus embedded in the start-agent node (lean: embedded).

#### Scenario: Data request origin
- **WHEN** an automation originates a data-request objective
- **THEN** the form SHALL be authored in Automations, not on the Agents canvas

### Requirement: Handle after a node
When a node finishes, the next step SHALL have every write that run made from the real module. The next node SHALL pick which of those writes it is about. The handle MUST NOT be “latest audit for this firm.” Hub preview MUST NOT be treated as the live path. Live walk SHALL remain `workflowWalk` (SA 015) and MUST NOT be recut into a second machine.

#### Scenario: Audit then If
- **WHEN** an Audit action completes and the next node is If
- **THEN** If SHALL read fields of that run’s writes (person rows split people; a run-row field evaluates once)

### Requirement: Rules are composites
A rule SHALL be a creatable composite of conditions and constants, modular across industries, with togglable outcome families. Authored logic SHALL be simple enough for a GUI by default, with a Custom (code / JSON) escape hatch. Inside-the-rule conditions MUST NOT be collapsed with the DAG If node that calls from the previous result.

#### Scenario: Two condition grains
- **WHEN** an operator opens a rule and also places an If node after it
- **THEN** field · operator · constant SHALL live inside the rule, and the If SHALL call from the previous result to fork actions

### Requirement: Objectives are events
All objectives SHALL be events. The write-back SHALL be the event; the event happening SHALL be the write-back. There SHALL be no special return wire. Lineage (who created the objective, path, completion, time) SHALL be queryable at minimum. UNRESOLVED: minting a dedicated lineage table from that sentence.

#### Scenario: Completion is a write
- **WHEN** a form that was the objective is submitted
- **THEN** that write SHALL be detectable as the completion event across the app

### Requirement: Campaign failure is an event
Campaign failure SHALL be an event with Global and Local grain. Failure mode (packet 023 / migration 022 on this SHA) SHALL stop spending outbound resources while still listening for the objective. Exhaustion MUST NOT close inbound listening. Nullification (escrow-era door refuse) is not built and MUST NOT be invented here.

#### Scenario: Exhausted still claimable
- **WHEN** a campaign’s attempt is exhausted
- **THEN** the system SHALL stop further outbound attempts for that pursuit and SHALL still count the objective as met if it later clears

### Requirement: Walker v1 shape vs Face chain
As-built v1 walker recognizes a validated pipeline shape. Face law says the canvas can chain. Specs MUST distinguish intended chaining from the shipped walker constraint and MUST NOT silently delete either.

#### Scenario: Named tension
- **WHEN** an automation graph is not the validated v1 shape
- **THEN** as-built runtime MAY reject it, while the intended Face still requires chaining; that gap SHALL stay named rather than pretended closed

### Requirement: If and Switch are two node kinds
The system SHALL provide If (one split, two wires: true / false) and Switch (many paths; each path is a wire; Add path adds a wire). Paths SHALL be wires, not Then/Else radios inside the modal. True SHALL be the If interior mode; anything other than that argument is the false wire. **⋯ Switch** SHALL mean change this node’s kind. Palette **Switch** SHALL mean the many-path node. Those two words MUST NOT be mixed.

#### Scenario: If has two wires
- **WHEN** an If node is placed on the Automations canvas
- **THEN** true and false SHALL leave as wires, and the interior MUST NOT present Then/Else radios to build

#### Scenario: Switch adds a path as a wire
- **WHEN** the operator adds a path on Switch
- **THEN** that path SHALL appear as a wire from the node

### Requirement: Test data lives on the trigger
Providing test data SHALL sit inside the placed Trigger. It SHALL fill that event’s write-shape (fields and values) so mapping and Run have a handle. It MUST NOT execute the canvas, MUST NOT Launch, MUST NOT INSERT live rows, and MUST NOT be a Test tab. Door 1: pick an instance that already exists. Door 2: specimen of the real write-set when the event has not fired. The client MUST NOT hard-code a field catalog.

#### Scenario: Test is not Run
- **WHEN** the operator provides trigger test data
- **THEN** Get / Rule / Action / If SHALL NOT execute from that control

### Requirement: Save, Run, and Launch are three controls
Canvas header SHALL be Save · Run · Launch. Run SHALL execute the chain now with the trigger’s data (canvas until it breaks, and per-node up to the active node). Launch SHALL arm: from now on, when this event happens, do this. Launch MUST NOT be a manual fire. Live Launch that also starts a manual run is the gap to split, not the intended product.

#### Scenario: Launch does not fire
- **WHEN** the operator presses Launch
- **THEN** the workflow SHALL be armed for future events and MUST NOT walk now as if Run were pressed

#### Scenario: Run uses trigger data
- **WHEN** the operator presses Run with trigger test data filled
- **THEN** the walk SHALL use that handle now and break on an unconfigured node

### Requirement: Get is a node kind
Get SHALL be a node kind that reads existing table rows (not Action, not Audit, not Contacts-only). Clicking a node SHALL configure it. The write-set / handle after a node remains the shape for mapping.

#### Scenario: Get is not an Action
- **WHEN** the operator adds Get from the palette or wire
- **THEN** it SHALL be a Get node whose parameters select what to read, not an in-app Action

### Requirement: In-app action is an existing module affordance
Whether X can be automated SHALL mean whether that module already affords X. Automations SHALL consume that affordance and MUST NOT author a second button. Specs MUST NOT turn this into “write any table.” Named examples remain ascribe a tag, run an audit, make a form; provision a firm stays later. Audit field chips on a contact are a consequence of Run audit, not a second Action.

#### Scenario: Run audit is the action
- **WHEN** an automation needs audit verdicts on contacts
- **THEN** the action SHALL be Run audit (the desk’s affordance), and the Audit field SHALL populate as a consequence

### Requirement: Additional named events from living packets
Origin pull/96 living packets add named events the SHA Face list had not yet closed: a new contact; a reference pack / eligibility criteria was updated; a contact uploaded information. Contact import and new contact SHALL be two events. Contact uploaded information SHALL be a different event and different seat from operator import and from form submitted. Specs MUST NOT collapse those three. Global still means every firm plus every permutation of that event.

#### Scenario: Upload is not import
- **WHEN** a contact puts information in from their workspace
- **THEN** that SHALL be hearable as contact-uploaded, not as operator contact-file import and not as form-submitted for the current objective
