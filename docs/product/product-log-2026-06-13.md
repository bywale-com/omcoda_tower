# Product Log — 13 June 2026

**Project:** Tower · Activity / Engagement chart  
**Focus:** Sarah Jenkins journey — unified Gantt, tree model, UI polish

---

## Summary

Today we turned the Activity tab from a flat touchpoint list into a **unified Engagement chart**: three lifecycle sequences on one timeline, sharing a **Text · Email · Form** tree pattern, with Sarah’s nudge story as the reference implementation.

---

## Morning — Nudge tree restructure (owner-based model)

### Problem
Top-level Attempt 1 / 2 / 3 flattened the real rule engine. Escalations and retries didn’t nest under the channel that owned the failure. Form showed irrelevant rows (email resend, form-link re-sent) that don’t exist in production logic.

### Decisions & implementation
- **Sequence ownership:** At any moment one channel owns the flow. Children (waits, scheduled actions, attempts) nest under that owner.
- **Sarah tree (corrected):**
  - Round 1 **Text** → Email scheduled  
  - Round 1 **Email** → Text scheduled → **Attempt 1** (Text, Email w/ link click)  
  - **Form** (after link click) → Link clicked → Opened → Submitted  
- Removed form “not started → resend email” escalation from happy path.
- Form submission timestamps aligned (same-day submit after open).
- Added `channelPhase` on touchpoints (`idle` | `active` | `complete`) for explicit backend mapping.

### Files
- `src/app/data/sarahNudgeTimeline.ts` — tree + gantt data  
- `src/app/components/JourneyTab.tsx` — `flattenJourneyTree`, row types

---

## Midday — Channel UI (icons, dropdowns, signals)

### Dropdowns on Text / Email / Form
Chevrons were missing because headers looked for `tp.children`; tree children live in `events` + `nested`. Fixed via `hasChildren` from flatten step.

### Channel header icons
- **Blue** — in motion (partial progress toward channel goal)  
- **Green** — complete (goal met: opened / clicked / submitted)  
- **Dim** — not started  
- Kept **engagement signal chips** on the right (sent, opened, clicked, etc.); only removed the redundant checkmark badge.

### Form data accuracy
- Confirmed submitted form → green icon via `channelPhase: "complete"` + `submitted: "met"`.  
- Removed incorrect 24h “email + text scheduled” under Form on success path.

---

## Afternoon — Unified journey: Opt-in + Nudges + Reactivation

### Problem
Opt-in and Reactivation were flat touchpoint lists; different UI from nudges. Operators couldn’t see one continuous client arc.

### Shared model (`journeyTree.ts`)
- `JourneyTreeNode`: `channel` | `standalone` | `attempt` | `escalation` | `taskEscalation` | `event`
- `JourneySectionStyle`: `historical` | `active` | `armed`
- `JourneyGroup` + `JOURNEY_SEQUENCES` registry

### Opt-in (`00f-optin-001-sarah-j`)
- Collapsed, historical, Mar 2024 band (days 0–4, left).
- **Text** = SMS primer · **Email** = Announcement · **Social follow** (standalone) · **Form** = Waitlist + Consent.
- Struck-through labels, muted teal bars/icons, all signals met.

### Reactivation (`00f-reactivation-001-sarah-j`)
- Expanded, armed, ghost state, days 44–56 (right).
- **Text** = Day 0 SMS · **Email** = Eligibility + nurture 1 & 2 · **Form** = Slot + booking follow-ups · **Human task** = final escalation if all criteria fail.
- Dashed Gantt bars, empty circle icons.

### Nudges
- Unchanged story logic; same tree pattern as opt-in/reactivation.

### Gantt components
- `NudgeGanttBar`, `ChannelMiniGanttBar`, `WaitingDurationBar`, `GhostDurationBar` — variant styling per `sectionStyle` / segment `variant`.

---

## Late afternoon — Flatten section hierarchy

### Problem
Double headers: milestone (“Opt-in Launch”) + group (“Opt-in Launch · Complete”) above the tree.

### Change
- Removed milestone wrappers for opt-in and reactivation.
- Three **peer sequence rows** stacked vertically:
  1. `00f-optin-001-sarah-j`  
  2. `00f-nudge-001-sarah-j`  
  3. `00f-reactivation-001-sarah-j`  
- Trees render directly under each coded row.
- Legacy deep-links (`opt-in`, `nudges`, `reactivation`) alias to sequence IDs.

### Removed
- N-002 permit reminder + “Next nudge” scheduled rows (out of story scope).
- Top thought strip about N-002 / permit monitoring.

### Added
- Under Form (Sarah): **Reactivation scheduled** escalation with thought chain — explains why armed reactivation appears immediately below the nudge sequence.

---

## End of day — Engagement chart chrome

### Header cleanup
- Removed page header: “Engagement plan”, Sarah subtitle, Permit/CRS/Reactivation pills (~90px vertical space recovered).
- Renamed surface to **Engagement chart** in left column header (10px uppercase label, same as former “TOUCHPOINTS”).

### Legend revision
Replaced outdated task/scheduled legend with lifecycle-aware keys:
- Historical · Active sequence · Armed template · Waiting window · Attempt 1 / 2 / 3

---

## Sarah reference timeline (nudge)

| Phase | Key events |
|--------|------------|
| Jun 11 | R1 Text fail → Email scheduled → R1 Email fail → Text scheduled |
| Jun 12 | Attempt 1 under Email: Text ok → Email link clicked |
| Jun 13 | Form opened → submitted |
| Jun 13 | Reactivation scheduled (outcome) |
| Jun 16+ | Armed `00f-reactivation-001` on timeline right (ghost) |

---

## Technical inventory

| Area | Files |
|------|--------|
| Shared types | `src/app/data/journeyTree.ts` |
| Sequences | `src/app/data/journeySequences.ts`, `optInLaunchTree.ts`, `reactivationTree.ts`, `sarahNudgeTimeline.ts` |
| Gantt registry | `src/app/data/journeyGantt.ts` |
| UI | `src/app/components/JourneyTab.tsx`, `NudgeGantt.tsx` |
| Layout constants | `src/app/constants/layout.ts` (30m zoom) |
| Docs | `docs/product/engagement-chart-gantt-decisions.md` |

---

## Open / next

- Form field-level signals (opened vs clicked on form body) — deferred; distinct from email link click.
- Plug live API: map backend events → `JourneyTreeNode` + gantt segments by sequence ID.
- Reactivation trigger UX when sequence moves from armed → active.
- Consultant task row interaction (panel, assignee) on `taskEscalation` nodes.

---

## Build status

Production build passing after all changes.
