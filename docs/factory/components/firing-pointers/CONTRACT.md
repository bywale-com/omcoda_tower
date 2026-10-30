# firing-pointers

**Responsibility:** Which primary keys a live firing places on `payload.writes`, so the listening run’s handle is that firing’s rows.  
**Status:** Claim 11’s `objective_met` array is PKT-004. The fact array is PKT-007. The meeting array is PKT-008. Claim 12 is PKT-009. Not planted. Not verified.

## Claims

| Claim | Kind in the factory index | Packet |
| --- | --- | --- |
| 11 | contract | PKT-004 for `objective_met`. PKT-007 for `fact_writebacks`. PKT-008 for `meeting_booked`. |
| 12 | defect | PKT-009, released. The person split for these four tables is claim 52. |
| 13 | indexed from title | none |
| 14 | indexed from title | none |
| 15 | indexed from title | none |
| 16 | indexed from title | none |

The claim text is on PR #135. This contract does not replace it.

## Dependencies

Walk handle (`walk-handle`) loads a pointer by the predicate claim 10 locked. PKT-006 loads `fact_writebacks` and `meeting_booked`. PKT-009 loads the four eligibility tables. PKT-004 loads `engagement_records`.

## Out of this contract

Launch Agent as a product initiative. Claim 52’s person split. Claim 17’s empty-contact audience. Claim 43’s reactivation enroll. Claim 60’s pathway boolean.
