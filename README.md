# omcoda_tower

Tower is an intelligent client engagement system for immigration consultants. It watches each client’s file, runs scheduled nudges driven by their data, and arms fixed reactivation sequences when eligibility appears.

## Implementation

Newest first. Engineer trail is still git + PRs; this is the face of what landed.

- **2026-08-27** — hotfix [#116](https://github.com/bywale-com/omcoda_tower/pull/116). Contact workspaces open even when `contact_uploads` is missing, because that SELECT was 500ing the whole seat and the desk painted it as a dead link.
- **2026-08-27** — packet 028 [#115](https://github.com/bywale-com/omcoda_tower/pull/115). Wait is its own graph kind (approval or duration) with an Approve-now / Approve-later desk note, because parking cannot live on `action.type` and resume is this run’s outgoing, not a second graph.
- **2026-08-27** — packet 020 [#114](https://github.com/bywale-com/omcoda_tower/pull/114). Operator Activation, Escrow, and Register panes read and write the gate tables, because those modules were chrome over a fixture instead of the rows the operations already write.
- **2026-08-27** — packet 027 [#113](https://github.com/bywale-com/omcoda_tower/pull/113). Rule Outcomes compare uses the same chip box as If into the person write, because the left operand was a text label (Hub `client_data.*`) and Language CLB was not a write.
- **2026-08-27** — packets 022 · 023 [#112](https://github.com/bywale-com/omcoda_tower/pull/112). Objective-met is Local to the stamped ask, and an exhausted attempt stops spending while the campaign keeps listening, because a past form, meeting, or click on the contact was satisfying every campaign.
- **2026-08-23** — packets 024–026 [#111](https://github.com/bywale-com/omcoda_tower/pull/111). Contact workspace is a no-login Now / History / Upload seat until they opt out of the workspace, because Contact was not a desk and the leftover firm chip was still the header.
- **2026-08-21** — packet A40 / 021 [#108](https://github.com/bywale-com/omcoda_tower/pull/108). Form occupancy is one box of this run’s required-data listing, because Submit-this-form was still a catalog of questions instead of the listing write.

**Agent seats** (paste-prompts + identity): [`docs/README.md`](docs/README.md) — Product Manager, Systems Analyst, and Engineer. Always-on for the Engineer: [`AGENTS.md`](AGENTS.md). Trails: [`docs/register/PHASE-TWO-LOG.md`](docs/register/PHASE-TWO-LOG.md) (PM/founder) · [`docs/register/SYSTEMS-ANALYST-LOG.md`](docs/register/SYSTEMS-ANALYST-LOG.md) (SA) · git + PRs (Engineer — do not append those logs). Prepend **Implementation** above on every Engineer completion.

This repository is a **UI prototype** — mock data, no backend — focused on how operators see and navigate a client’s engagement over time.

---

## How the app flows

### 1. Board → Client

Open the app on the **board**: a list of clients with phase indicators (opt-in, active nudge, reactivation, etc.). Click a client to open their workspace in a tab.

### 2. Details vs Activity

Each client has two main views:

| View | Purpose |
|------|---------|
| **Details** | Profile, CRS/permit charts, document-style brief |
| **Activity** | The engagement story — what Tower has done, is doing, and has queued |

The bottom panel on Details holds **Information**, **History**, and **Activity** chips. Activity is where the engagement chart lives.

### 3. The engagement chart

Activity is built around one mental model: **move a client through channels until a goal is met, then arm what’s next.**

Three lifecycle sequences sit on a **single horizontal timeline**:

1. **Opt-in launch** — historical, completed (waitlist, first touch)
2. **Active nudge** — in motion now (Text → Email → Form, with local retries)
3. **Reactivation** — armed, waiting on a trigger (full playbook visible but dormant)

The left column is **structure** (expandable tree: channels, attempts, escalations). The right column is **time** (Gantt bars, event markers, zoom down to 30 minutes).

### 4. Channel pattern

Every sequence uses the same channel tree:

**Text · Email · Form**

- One channel **owns** the flow at a time; attempts and escalations nest under that owner.
- **Text** — SMS primer or fallback; inspector shows the message thread.
- **Email** — outbound template preview plus reply threads (expandable cards).
- **Form** — checklist preview, session replays on visits, capture history on core forms.

Click a channel row on the timeline to open the **engagement node panel**: status, milestone rail, decision/thought chain, preview, and threads.

### 5. Tasks

Some paths escalate to **human tasks** (e.g. final reactivation escalation). Tasks open in their own detail view and can link back into Activity at the relevant touchpoint.

---

## Reference clients

Prototype data is richest for **Sarah Jenkins** (full opt-in → nudge → reactivation arc) and **Marcus Webb** (parallel opt-in + reactivation). Other board clients are lighter placeholders.

Sequence IDs follow production-style patterns, e.g. `00f-nudge-001-sarah-j`, so the UI can swap to real API data later without relabeling.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for dev and build
- **Tailwind CSS 4** (with Radix UI primitives where needed)
- Inline styles via a shared **token** theme (`light` / `dark`) — see `rules.md`

---

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build → dist/
```

---

## Project layout

```
src/app/
  components/     # UI — BoardPanel, JourneyTab, EngagementNodePanel, etc.
  data/           # Mock journey trees, clients, timeline fixtures
  context/        # Panel, task, and touchpoint focus state
docs/product/     # Decision logs and product notes
```

Deeper design rationale for the engagement chart: [`docs/product/engagement-chart-gantt-decisions.md`](docs/product/engagement-chart-gantt-decisions.md).

---

## Status

Prototype only. No authentication, API, or persistence. Styling rules and component conventions are in [`rules.md`](rules.md). Console (visual register) state doc: [`docs/product/console-state.md`](docs/product/console-state.md).
