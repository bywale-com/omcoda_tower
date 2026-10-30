# Spec Delta

## Purpose

Lets an engagement contact consent, refresh facts, silence, and book as firm-branded delivery so the consultant’s north-star can close — without making the contact a Tower persona.

## ADDED Requirements

### Requirement: Contact is not a persona workspace
The engagement contact SHALL be a referenced participant, not an acquired Tower persona. Touchpoints SHALL be firm-branded. The contact SHALL NOT pay Om Coda for Tower.

#### Scenario: Access link
- **WHEN** a contact opens a firm access link
- **THEN** they SHALL see firm-branded touchpoints, not a consultant or operator desk switcher

### Requirement: Consent request
The contact SHALL be able to receive a firm-branded consent request and agree or ignore before any deeper collection.

#### Scenario: Ignore
- **WHEN** a contact ignores the consent request
- **THEN** the system SHALL NOT proceed to deep collection and SHALL treat them as not opted in

### Requirement: Refresh facts through touchpoints
The contact SHALL be able to refresh self-reportable facts through forms and similar touchpoints. Document-dependent needs MUST NOT be asked as form fields.

#### Scenario: Submit a form
- **WHEN** an opted-in contact submits a self-reportable form
- **THEN** those facts SHALL write back and trigger re-evaluation

### Requirement: Silence / opt-out
The contact SHALL be able to opt out or otherwise silence automatic outreach. Opt-out SHALL be an event that can ascribe a tag.

#### Scenario: Unsubscribe
- **WHEN** a contact unsubscribes
- **THEN** automatic outreach SHALL stop for that contact and the opt-out SHALL be hearable as an event

### Requirement: Book a meeting
The contact SHALL be able to book a meeting with the consultant as the loop-closer. Meeting booked SHALL write the success event the Application desk pursues.

#### Scenario: Booking completes the motion
- **WHEN** a contact books a meeting the campaign asked for
- **THEN** that write SHALL be the meeting_booked success event for that pursuit

### Requirement: Contact upload is distinct from form-submitted
A contact uploading information SHALL be a different event from answering the current objective’s form and from operator import. Form submitted is answering Now. Upload is putting information in (any type, a specific kind, a custom name, or a searched question).

#### Scenario: Upload while not on the current form objective
- **WHEN** a contact uploads information that is not the current objective form submit
- **THEN** Automations SHALL be able to hear that as contact-uploaded (Global = all uploads, Local = this kind) without treating it as form-submitted
