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
| `full` | Claim body read here | 1–8 |
| `partial` | Heading and the nearby standing paragraph | 9–11 |
| `title` | Title only. Not a code verdict | 12–88 |

| `kind` | Meaning | Count |
| --- | --- | --- |
| `established` | Investigation says the behavior is already true | 1, 5, 9 |
| `implication` | Derived from established behavior | 2 |
| `defect` | Investigation says the current code does not do the locked rule | 3, 4, 6, 7, 8 |
| `contract` | Cross-component contract named in the text that was read | 10, 11 |
| `indexed` | Grouped for coverage only | 12–88 |

A defect is not a released packet. Only claim 3 has a draft packet: `pkt-001-click-attribution`. Claims 4, 6, 7, and 8 stay on the initiative as known gaps. They are not queued for an agent.

## Components

The index groups claims so coverage can be counted without pretending a module is done.

| Component | Claims | Coverage in this factory |
| --- | --- | --- |
| `pursuit-identity` | 1, 2, 3, 4, 64, 68 | Specification in progress on PR 135. One draft packet. No production plant. |
| `walk-handle` | 5, 6, 7, 8, 10, 46, 48 | Specification in progress. Not implemented here. |
| `firing-pointers` | 11–16 | Indexed. Not packeted. |
| `halt-send` | 18–22 | Indexed. |
| `consent-silence` | 23–31, 33, 41, 42, 49 | Indexed. |
| `fact-form` | 32, 34–36, 61, 62, 69, 74, 88 | Indexed. |
| `meeting` | 9, 37–39, 63 | Indexed, except claim 9’s standing paragraph. |
| `operator-activity` | 40 | Indexed. |
| `reactivation` | 43–45, 52, 54 | Indexed. |
| `schedule` | 17, 47 | Indexed. |
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
