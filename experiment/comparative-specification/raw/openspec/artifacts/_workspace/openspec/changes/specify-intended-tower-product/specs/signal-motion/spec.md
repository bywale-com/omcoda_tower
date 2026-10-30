# Spec Delta

## Purpose

Records every detection as a signal and chooses a single outbound motion under fixed precedence, without replacing the attempt engine inside a sequence.

## ADDED Requirements

### Requirement: Record every detection
The system SHALL record every detection — including missing data — as a signal when found. Whether anything is sent SHALL be a separate motion decision.

#### Scenario: Signal without send
- **WHEN** a determination is emitted and Engine 2 chooses not to send
- **THEN** the signal SHALL still be recorded

### Requirement: Engine 2 precedence
Motion SHALL obey: (1) reactivation first whenever anything is reactivation-worthy; (2) nudge only when nothing is reactivation-worthy; (3) when a nudge fires, consolidate every outstanding self-reportable need into one form — never one nudge per field; (4) when reactivation fires, attach secondary signals as agenda on the consultant’s pre-meeting brief — never parallel outreach; (5) one client, one motion, ever.

#### Scenario: Reactivation wins
- **WHEN** a contact is both reactivation-worthy and has outstanding self-reportable needs
- **THEN** the system SHALL choose reactivation as the motion and attach other signals as agenda, not as a parallel nudge

#### Scenario: One form per nudge
- **WHEN** a nudge motion fires and several self-reportable facts are outstanding
- **THEN** those needs SHALL be consolidated into one form

### Requirement: Engine 2 does not replace 7b
Engine 2 MUST NOT replace the attempt / channel-ownership engine inside a sequence. It MUST NOT fire parallel motions for one client.

#### Scenario: In-flight attempt continues
- **WHEN** a sequence is already in flight under an owning channel
- **THEN** Engine 2 MUST NOT swap that attempt engine for a second parallel sequence on the same client

### Requirement: Reactivation-worthy criteria remain unresolved
UNRESOLVED (Story silence): what makes a signal reactivation-worthy, and D-01 / D-02 builder placement. The system MUST NOT invent that worthiness predicate.

#### Scenario: Do not invent the worthiness rule
- **WHEN** specifying the exact predicate that makes a signal reactivation-worthy
- **THEN** the product SHALL leave that predicate unresolved rather than inventing it
