# Activity View — Product Spec (Current Build)

> **Status:** Prototype in app · June 2026  
> **Primary component:** `JourneyTab` (Activity chip / tab)  
> **Demo client:** Sarah Jenkins

---

## What this is

The **Activity** view is Tower's client engagement plan — not an event log. It answers one question:

**What is Tower doing for this client, what already happened, what's scheduled, and what will fire if conditions change?**

It replaces the earlier reverse-chronological "campaign cards" model with a **journey + timeline** layout inspired by project/Gantt tools: a checklist on the left, a time axis on the right, one continuous spine per client.

---

## Where users open it

| Entry point | Behavior |
|---|---|
| **Client Data panel** (bottom of client details) | Activity chip alongside Information and History |
| **Full-page tab** | Documents icon in the activity bar opens `{Client} · Activity` as a dedicated workspace tab |
| **Status bar** | Toggle panel shows/hides the bottom Client Data panel |

Full-page mode is the recommended surface for working in Activity — more vertical space, same content.

---

## Client Data shell

Activity lives inside **Client Data**, which has three chips:

| Chip | Purpose |
|---|---|
| **Information** | Profile table (two-column, read-only client facts) |
| **History** | CRS score chart over time with scrubber |
| **Activity** | Engagement plan (this document) |

---

## Layout: Engagement Plan

### Header

- **Title:** Engagement plan  
- **Subtitle:** Client name + eligibility context (e.g. *Sarah Jenkins · CEC eligible · Tower monitoring*)  
- **Metadata pills:** Quick context chips (e.g. permit days remaining, CRS score, reactivation status)

### Two-column body

| Left — Touchpoints | Right — Timeline |
|---|---|
| Hierarchical checklist of milestones and touchpoints | Weekly date axis + Gantt-style bars |
| Collapsible milestone groups | **Today** vertical line |
| Status icons, channel icons, dates | History band (Mar 2024) and dormant reactivation band |
| Success criteria, chain-of-thought, "Added" badges | Bars aligned row-for-row with the list |

**Resizable split:** Drag the handle between columns to widen the list or timeline (200–520px list width).

**Synced scroll:** List and timeline scroll vertically together.

---

## Timeline controls (time-scale zoom)

Users can change how much horizontal space each day occupies and pan across the calendar.

| Control | Action |
|---|---|
| **Pinch** (trackpad / touchscreen) | Zoom in/out on the timeline |
| **Ctrl + scroll** (or trackpad pinch on macOS) | Zoom in/out |
| **− / +** buttons above date axis | Zoom out / in (shows % of default scale) |
| **Today** button | Scroll to center the today line |
| **Horizontal scroll** | Pan through dates |
| **Shift + scroll** | Pan timeline horizontally |

Zoom range: ~31%–275% of default day width. Zoom anchors on cursor/finger position.

---

## The three milestones

Every client journey is organized into three phases on one spine:

### 1. Opt-in Launch · Complete

- **Default:** Collapsed  
- **Content:** Historical touchpoints from onboarding (SMS primer, announcement email, waitlist, consent, etc.)  
- **Timeline:** Bars in a muted **Mar 2024** history band at the left edge of the axis  
- **Purpose:** Acknowledge the past without dominating the view

### 2. Engagement · Nudges · Active

- **Default:** Expanded  
- **Content:** The live engagement program — done nudges, monitoring windows, data-scheduled future nudges, and response-driven next steps  
- **Optional:** "Why this schedule" expandable note (milestone-level reasoning for pre-planned items)  
- **Purpose:** Where Tower is actively working today

### 3. Reactivation · Armed

- **Default:** Expanded  
- **Content:** Full reactivation sequence as a **dormant template** — not yet triggered  
- **Subtitle:** e.g. *7 touchpoints · armed · one nudge away*  
- **Timeline:** Dashed ghost bars in an **on trigger** band; sequence is visible but dates are not committed  
- **Purpose:** Show the full playbook before eligibility fires; honest about uncertainty on *when*, clear on *what*

---

## Touchpoint states (visual language)

| State | List | Timeline bar | Meaning |
|---|---|---|---|
| **Done** | Checkmark, strikethrough optional | Solid teal | Completed touchpoint |
| **Historical** | Checkmark (muted) | Solid teal, faded | Past onboarding / archived |
| **Scheduled** | Open circle | Teal outline fill | Known future date from client data |
| **Conditional** | Dashed amber circle | Amber dashed bar | Next step depends on prior response |
| **Ghost** | Empty circle (muted) | Dashed grey bar | Dormant template step (reactivation) |
| **Reactive / Added live** | Amber `+` icon, **Added {time}** badge | Amber bar with `+` prefix | Tower created this step in real time — not pre-scheduled |

Legend at the bottom of the touchpoint list explains these states.

---

## Intelligence layer (reactive decisions)

The signature pattern for Tower's intelligence is shown on **N-001 · Email** in the demo:

```
N-001 · Email                          Jun 11 · 09:14
  └ 30m engagement window · Open ✗ · Click ✗ · criteria not met

  ✦ Delivered 09:14 — no open or click by 09:44.
    Rule R-02 applies. Adding SMS fallback.

    └ SMS fallback                    [Added 09:44]
```

### Components

1. **Success criteria** (parent touchpoint)  
   Concise pills under the row: what Tower was watching for (e.g. *Open*, *Click* within *30m engagement window*). Pass/fail per check. Delivery and criteria success are separate — email can be sent but criteria not met.

2. **Chain of thought** (light connector row)  
   One line of italic reasoning between outcome and reactive child. Not a wall of text — just enough to explain *why* the next step exists.

3. **Nested reactive child**  
   Indented under the parent with a tree line. **`Added {timestamp}`** badge makes it explicit this was not on the original plan. Distinct amber styling on list and timeline.

### Product principle

> **Planned step → criteria outcome → light reasoning → dynamically added child**

Pre-scheduled nudges (e.g. permit reminder on a fixed date) do not use this pattern. Reactive steps do.

---

## Milestone phase badges

| Badge | Meaning |
|---|---|
| **Complete** | Phase finished (opt-in) |
| **Active** | Tower is executing now (nudges) |
| **Armed** | Template ready, waiting on trigger (reactivation) |

---

## Demo data snapshot (Sarah Jenkins)

As of **Jun 13, 2026** in the prototype:

| Milestone | Highlights |
|---|---|
| Opt-in Launch | Complete · Mar 2024 · collapsed |
| Engagement · Nudges | N-001 email → reactive SMS fallback → 48h monitoring done; N-002 permit reminder scheduled Jun 28; next nudge conditional on N-002 response |
| Reactivation | Armed · full 7-step ghost sequence visible · not yet triggered |

Context pills: Permit · 47d · CRS 447 · Reactivation armed

---

## What Activity is NOT (yet)

- Not connected to live backend data — prototype uses static `MILESTONES` in `JourneyTab.tsx`
- No click-through to message content / email preview on bars (future)
- No editing or manual task injection by consultants (future)
- Information and History tabs are separate; Activity does not duplicate CRS chart or profile table

---

## Design intent (why this model)

| Old model | New model |
|---|---|
| Reverse-chronological campaign cards | Forward-looking engagement plan |
| Equal weight for past and present | Collapsed history, expanded active + armed |
| Intelligence woven into every row | Criteria + chain-of-thought only at decision points |
| No forward visibility | Scheduled, conditional, and ghost future steps on one axis |
| Fixed layout | Resizable columns + zoomable timeline |

**Tower's job in one line:** Watch the client, nudge on a data-driven schedule, reactivate when eligibility appears. Activity is the plan view for that job.

---

## Technical reference

| File | Role |
|---|---|
| `src/app/components/JourneyTab.tsx` | Activity / engagement plan UI |
| `src/app/components/DataPanel.tsx` | Client Data shell + chips |
| `src/app/components/ClientDataPage.tsx` | Full-page Activity wrapper |
| `src/app/constants/layout.ts` | List width + timeline zoom constants |
| `guidelines/Reactivation.md` | Reactivation sequence source spec |

---

## Open questions for PM

1. Should reactive steps always nest under their triggering touchpoint, or can they promote to top-level when significant (e.g. reactivation launch)?
2. When reactivation fires, does the ghost band animate into solid bars anchored to Day 0, or does a new milestone section appear?
3. Should success criteria be visible by default or on expand/hover?
4. Is full-page Activity the default entry, or always via bottom panel first?
5. What is the minimum viable drill-down from a bar (subject line, delivery status, open/click timestamps)?
