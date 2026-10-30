# PR 135 mapped into the factory

**Source:** https://github.com/bywale-com/omcoda_tower/pull/135  
**Branch:** `cursor/specification-mapping-4aea`  
**SHA:** `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`  
**Files:** `docs/specification-pass/SPECIFICATION.md`, `journal/001.md`–`060.md`, `NEXT.md`  
**Policy:** read-only. This branch does not merge, close, or edit those files.

The machine-readable index is `.factory/manifests/pr135-claims.json`. Eighty-eight claims. They are not eighty-eight implementation tasks.

## How far this session read

| `read` | Meaning | Count |
| --- | --- | --- |
| `full` | Claim body read here | 1–8, 10–22 |
| `partial` | Heading and the nearby standing paragraph | 9 |
| `title` | Title only. Not a code verdict | 23–88 |

| `kind` | Meaning | Count |
| --- | --- | --- |
| `established` | Investigation says the behavior is already true | 1, 5, 9, 20 |
| `implication` | Derived from established behavior | 2 |
| `defect` | Investigation says the current code does not do the locked rule | 3, 4, 6, 7, 8, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22 |
| `contract` | Cross-component contract named in the text that was read | 10, 11 |
| `indexed` | Grouped for coverage only | 23–88 |

A defect is not a released packet until the gates pass. Claim 3 has a held packet: `pkt-001-click-attribution`. Claims 4, 6, 7, and 8 are released: PKT-002, PKT-003, PKT-004, and PKT-005. Claim 10 is PKT-006, except the `engagement_records` load, which stays PKT-004. Claim 11’s `objective_met` array is PKT-004, its fact array is PKT-007, and its meeting array is PKT-008. Claim 12 is PKT-009. Claim 13 is PKT-010. Claim 14 is PKT-011. Claim 15 is PKT-012. Claim 16 is PKT-013. Claim 17 is PKT-014. Claim 18 is PKT-015. Claim 19 is PKT-016. Claim 20 is established and released as PKT-017: the tick’s escalation, cell advance, and wait-until send already deny through the halt gate, and the attempt stays open. Claim 21 is a defect and released as PKT-018: a denied tick send appends `send_denied`, and the three writers do not do that yet. Claim 22 is a defect and released as PKT-019: a denied first step inside `enrollAndActuate` appends the same `send_denied` row, and that writer still labels from `shouldLiveSend`.

## Components

The index groups claims so coverage can be counted without pretending a module is done.

| Component | Claims | Coverage in this factory |
| --- | --- | --- |
| `pursuit-identity` | 1, 2, 3, 4, 64, 68 | Specification in progress on PR 135. PKT-001 held. PKT-002 released. |
| `walk-handle` | 5, 6, 7, 8, 10, 46, 48 | PKT-003, PKT-004, PKT-005, and PKT-006 released. |
| `firing-pointers` | 11–16 | PKT-004 and PKT-007 through PKT-013 released. |
| `halt-send` | 18–22 | Claim 18 is PKT-015. Claim 19 is PKT-016. Claim 20 is PKT-017. Claim 21 is PKT-018. Claim 22 is PKT-019. No component contract. |
| `consent-silence` | 23–31, 33, 41, 42, 49 | Indexed. |
| `fact-form` | 32, 34–36, 61, 62, 69, 74, 88 | Indexed. |
| `meeting` | 9, 37–39, 63 | Indexed, except claim 9’s standing paragraph. |
| `operator-activity` | 40 | Indexed. |
| `reactivation` | 43–45, 52, 54 | Indexed. |
| `schedule` | 17, 47 | Claim 17 is PKT-014. Claim 47 indexed. |
| `opt-in-ladder` | 51, 65–67, 70–73, 75, 76 | Indexed. |
| `readiness` | 58–60 | Indexed. |
| `mail` | 50, 53, 55–57, 83–87 | Indexed. |
| `tier` | 77–82 | Indexed. |

Coverage vocabulary for a later inventory: `uninvestigated`, `partial`, `specification_complete`, `implementation_pending`, `verified`.

PR 135’s investigated surface is `partial` as an initiative: the specification exists and is still being extended (the handoff names the seat’s History after the book). It is not `specification_complete`. It is not `implementation_pending` except where a packet is released. Nothing in this map is `verified` against production code.

`launch-agent` is a separate initiative in `.factory/manifests/initiatives/launch-agent.json`. State: `discovered`. It is not implied by claim 1.

## Founder decisions left open by PR 135

The pull request body names four questions the existing documents do not settle:

1. Who is placed on launch day.
2. Whether a later reactivation sends the first nurture again.
3. Whether a delayed delivery holds the next email.
4. What makes one pathway family’s pass true.

They are not gates for PKT-001.

## Next session of the investigation

PR 135’s `NEXT.md` still owns the next investigative move: the seat’s History after the book, which drops the meeting once the cursor is null. The factory does not take that session. A future Architect reads the handoff on that pull request and continues there, or copies a finding forward by reference when a packet is justified.
