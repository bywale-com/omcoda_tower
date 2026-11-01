# Spec Delta

## Purpose

Treats meeting booked as the core success event, opens pending capture when self-reportable fields remain, and keeps the pre-meeting brief live.

## ADDED Requirements

### Requirement: Meeting booked is the loop win
The system SHALL treat meeting booked as the core success / loop-closer event the Application desk pursues.

#### Scenario: Success event
- **WHEN** a meeting is booked for a contact with a consultant
- **THEN** that event SHALL count as the loop-closer for that engagement motion

### Requirement: Pending capture on outstanding fields
On meeting booked with outstanding self-reportable fields, the system SHALL open a data-capture form pending the meeting. On any write-back against that capture (or consultant entry), the system SHALL run immediate re-evaluation.

#### Scenario: Capture before the meeting
- **WHEN** a meeting is booked and self-reportable fields are still outstanding
- **THEN** a pending capture form SHALL open and later write-backs SHALL re-evaluate immediately

### Requirement: Live brief not snapshot
The pre-meeting brief SHALL stay live (recomputed), not a snapshot taken at booking time.

#### Scenario: Fact changes after booking
- **WHEN** a fact write-back occurs after meeting booked and before the meeting
- **THEN** the consultant’s pre-meeting brief SHALL recompute from current facts

### Requirement: D-01 and D-02 remain unresolved
UNRESOLVED (Story silence): whether pre-meeting capture is the tail of reactivation versus a standalone meeting_booked sequence (D-01), and the in-meeting fallback module (D-02). The system MUST NOT invent that builder placement.

#### Scenario: Do not invent the builder seat
- **WHEN** specifying where the pre-meeting capture sequence is authored
- **THEN** the product SHALL leave D-01 / D-02 unresolved rather than inventing the builder placement

### Requirement: Objective-met completion is Local
Ascribed on this SHA (packet 022 / migration 021): an objective being met SHALL be detectable as a Local event on the completion write for the campaign that asked, not as “any meeting / any form / any click this person ever did.”

#### Scenario: Wrong-era meeting does not complete today’s campaign
- **WHEN** a contact booked a meeting last quarter and a new campaign asks for a meeting now
- **THEN** that old meeting MUST NOT satisfy this campaign’s objective
