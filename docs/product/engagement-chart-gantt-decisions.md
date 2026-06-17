# Engagement Chart · Gantt Presentation — Decision Log (Brief)

**Status:** Active prototype direction  
**Surface:** Activity tab · left list + right timeline (`JourneyTab`)

---

## What we built

A single **Engagement chart** — not three separate modules. Opt-in, active nudge, and reactivation are **peer sequences** on one continuous horizontal axis, each using the same **Text · Email · Form** tree with local attempts and escalations nested under the owning channel.

---

## Why this presentation style

### 1. One axis, one mental model
Tower’s job is to move a client through channels until a goal is met, then arm what’s next. A Gantt that stacks **historical → active → armed** left-to-right matches how operators think: *what happened, what’s running, what’s queued*. Separate section headers fought that story.

### 2. Tree in the list, bars on the timeline
The **left column is the source of truth** for structure (expand/collapse, signals, escalations). The **right column is temporal truth** (when things happened or will happen). Splitting structure from time keeps dense data readable without turning the list into a wall of timestamps.

### 3. Owner-based nesting (not global “Attempt 2”)
Attempts **belong to the channel that failed** (e.g. Attempt 1 under Email, not a top-level sibling). Escalations (**Email scheduled**, **Text scheduled**, **Reactivation scheduled**) sit under the node whose criteria fired. This mirrors the backend rule engine: one owner, local retry counter, forward-only channel handoff on the happy path.

### 4. Coded sequence IDs
Rows use identifiers like `00f-optin-001-sarah-j`, `00f-nudge-001-sarah-j`, `00f-reactivation-001-sarah-j` — same pattern as production nudge IDs. UI chrome (section titles, client subtitles) was removed so the chart reads as **system objects**, ready to plug real data without relabeling.

### 5. Visual language by lifecycle phase

| Phase | List | Timeline bars |
|--------|------|----------------|
| **Historical** | Struck-through, muted teal icons | Muted teal solids (Mar 2024 band, left) |
| **Active** | Blue = in motion, green = goal met | Accent blue sequence bar + channel mini-bars |
| **Armed** | Ghost circles, inactive signals | Dashed outlines (right band, on trigger) |

Solid = committed or completed work. Translucent/dashed = waiting, scheduled, or not yet fired. Red was deliberately avoided on engagement signals — grey/green/blue only — so failure isn’t confused with “still in progress.”

### 6. Channel icons vs signal chips
**Leading icon** (Text / Email / Form) = step lifecycle for that channel row. **Trailing chips** (sent, opened, clicked, submitted) = granular telemetry. We consolidated the old checkmark into the leading icon but kept chips — operators need both “where are we in the channel?” and “which events fired?”

### 7. Zoom to 30 minutes
Immigration nudges resolve in hours, not days. Week/day/hour/**30m** grid tiers keep Sarah’s Jun 11–17 story legible without a separate “detail view.”

### 8. Outcome → next sequence
Sarah’s nudge ends with **Form submitted → Reactivation scheduled** (thought chain under Form). The armed reactivation row below isn’t arbitrary — it’s the **documented outcome** of the nudge path. No orphan “N-002 permit reminder” rows; the chart tells one causal chain.

---

## What we explicitly did not do

- Resend-email / form-link rows (links live in the email; form populates on click).
- Top-level Attempt 2/3 spanning all channels (deprecated in favor of local attempts).
- Separate “Engagement plan” header with client pills (removed; chart title lives in column header only).

---

## Data model intent

`JourneyTreeNode` + `JourneyGanttData` per sequence ID. When backend data lands, mapping should be mechanical: same tree shape, same `sectionStyle`, same gantt registry key as the row label.
