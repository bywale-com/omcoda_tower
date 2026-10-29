# walk-handle

**Responsibility:** Which stored rows a run may read after a node, a park, or a firing.  
**Status:** Claims 6, 7, and 8 are released packets. The plant is not started. Not verified.

## Claims

| Claim | Kind in the factory index | Packet |
| --- | --- | --- |
| 5 | established | none |
| 6 | defect | PKT-003, released |
| 7 | defect | PKT-004, released |
| 8 | defect | PKT-005, released |
| 10 | contract | none. PKT-004 loads `engagement_records` by id. The other three tables stay this claim. |
| 46 | indexed from title | none |
| 48 | indexed from title | none. PKT-005 leaves the contact Get’s missing `firm_id` constraint here. |

The claim text is on PR #135. This contract does not replace it.

## Dependencies

Pursuit identity (`pursuit-identity`) decides which enrollment a completion advances. PKT-004 carries that firing’s enrollment pointer. It does not change PKT-001’s click match.

## Out of this contract

Launch Agent as a product initiative. Fact and meeting `payload.writes` arrays stay claim 11 until a packet names them.
