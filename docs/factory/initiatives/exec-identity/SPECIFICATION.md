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

Component contracts point at claim numbers. They do not restate the journals.
