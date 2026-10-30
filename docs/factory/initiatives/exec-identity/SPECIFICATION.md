# exec-identity specification

The standing specification is PR #135, file `docs/specification-pass/SPECIFICATION.md`, claims 1–88, at SHA `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`.

This file does not copy those claims. A copy would drift from the open investigation.

What this factory treats as authoritative for the pilot:

- Claim 2: two pursuits may be open for one contact.
- Claim 3: a completion belongs to the pursuit that asked for it. The email-click consequence is PKT-001, still on hold.
- Claim 4: opening an ask does not move `enrollment.campaign_id`. PKT-002.
- Claim 6: a resumed wait rebuilds that run’s stored writes. PKT-003.
- Claim 7: an `objective_met` listener starts from this firing’s engagement row and enrollment row, and an event dispatch does not force `anyPass`. PKT-004. Claim 11’s array for this firing is part of that packet.
- Claim 8: a verdict row and a ready row belong to the audit run that wrote them. PKT-005. The desk and the enroll gate still read the latest row per contact.
- Claim 10: `fact_writebacks`, `meeting_booked`, and `wait_occupancy` load by primary key. The three append tables join the person split. The generic action pointer stores the id `writeEngagement` returns. PKT-006. The `engagement_records` load stays PKT-004.
- Claim 11: a fact firing’s `writes` is that write-back. PKT-007. A meeting firing’s `writes` is that booking. PKT-008. The meeting side engagement stays off the array.
- Claim 12: an `eligibility.changed` firing’s `writes` is the four inserted rows, table-major, and those four tables load by primary key. PKT-009. The person split for those four tables is claim 52.
- Claim 13: a `campaign_failure` firing’s `writes` is the inserted row, and the payload carries that row’s `campaign_id`. The row loads by primary key. PKT-010. The table stays out of `PERSON_WRITE_TABLES`.
- Claim 14: a contact-scope `halt_records` firing’s `writes` is the inserted row. The row loads by primary key. PKT-011. The firm-book branch and the lift do not dispatch. The table stays out of `PERSON_WRITE_TABLES`.
- Claim 15: a `consent_records.opt_out` firing’s `writes` is the current pair. The pointer’s `id` and `contact_id` are both the contact. The row loads by that contact and the walk’s firm. PKT-012. The table has no `id` column. Basis writes, the workspace opt-out, and the hard bounce do not dispatch.
- Claim 16: a `ct_firms` firing’s `writes` is the firm id the upsert stored, with no `contact_id`. The row loads by `id`. PKT-013. `firms`, `campaign_states`, `users`, `access_links`, and the provision audit stay off the array. `handlePoolAllocate` does not dispatch. The audience fill when `contactIds` is omitted is claim 17.
- Claim 17: a firing that passes no contact ids walks that automation’s audience inside the firing firm. `select_from` keeps the stored ids that are `contact_records` of that firm, and does not start when none remain. `every_firm` walks that firm’s book and still starts when the book is empty. A firing that already named people keeps that list. PKT-014. The list is not a write. Claim 18 owns the halt firm predicate.
- Claim 18: a contact halt blocks `enrollAndActuate` only when that halt row’s `firm_id` is the enroll firm. The firm-book arm still requires the enroll firm. PKT-015. Claim 19 owns the send and the contact check.
- Claim 19: a contact halt denies `consentAndHaltGate`, and makes the contact check true, only when that halt row’s `firm_id` is the firm the caller is acting as. The firm-book arm still requires that firm. PKT-016. The enroll predicate stays PKT-015. The consent select in the same function stays unscoped. Claim 20 owns the tick send.
- Claim 20: the tick’s escalation, cell advance, and wait-until send are new sends. The halt gate denies them. The attempt stays `open`. The writes made before the send stay taken. PKT-017. The three calls already pass `attempt.firm_id` and `purpose: "cem"`. The firm predicate stays PKT-016. The enroll predicate stays PKT-015. Claim 21 owns the engagement kind stored when the deny comes back.

Component contracts point at claim numbers. They do not restate the journals.
