# Agents — Systems Analyst package (2026-08-15)

**What this is:** a dated prompt. Paste into a Systems Analyst chat. Not Story. Not a second Agents flag.  
**Seat that wrote it:** Product Manager.  
**Law:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Context you already have (do not re-ask the PM to restate it):** [`AGENTS-FACE.md`](./AGENTS-FACE.md) · [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · canon plates `docs/register/agents-blueprint/C1`–`C7`. **Caption audit (read before ascribing pixels):** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). **Later plate (after this package was issued):** **C8** — this sequence’s Contacts + Add contact. Ascribe it the same two questions if you reach it. Do not mint an enroll table from the picture. Do not mint `qualify` from C3.  
**Your identity and walk:** [`../README.md`](../README.md) § Systems Analyst. Answer lands in [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md).

---

## Paste this

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flags are read-only — 15:43 Agents flagship stands.

If you have not already walked the machine (Story → Requirements → migrations 001–009 → cascade/worker → live vs stand-in ports) and inventoried tables/fields/relations, do that first. Then open this package: docs/register/AGENTS-SA-PACKAGE.md.

This is what we are thinking. These plates are the systems traversing. The images are the mock; the UI is going to look like this. Ascribe. Read docs/register/IMAGE-CAPTION-AUDIT.md before ascribing pixels — teaching copy on the plates is not a node, not a field, not qualify_gate.

For each canon plate C1 → C7 (and C2b, C5b with their parents; then later plate C8 if you reach it), answer two questions. Short. Quote SQL / cascade / ports, not screens.

A. Our system. Tables, workers, runtime, Story — what are we looking at on this plate? What already houses it, what partially houses it, what is silent?

B. External systems the picture is clearly calling — especially because this is the mock and the image will look like this. Look at the configurations we are implying or expecting to have, to do what the plate shows. Is that possible as stood up (live vs stand-in)? Does anything have to change in the UI for this picture to be honest? Do we have the affordances we are hoping for?

Then a rollup: possible / gaps / UI would have to change if…

Do not mint tables from pictures. Call vs Form is named silence — name it, do not invent a call table from C5. Do not put Automations triggers on this canvas. Do not restore discarded plates. Do not invent a different Agents module from the old Timeline. Do not mint qualify / first_objective / Launch window as types from C3. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Per plate (same two questions; the picture is different)

Read the plate in [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) (image + spec). Do not treat discarded files as face. Stale pixels (C4/C3/C6 Form vs C5 Call) are named in the blueprint — do not silently “fix” them in systems.

| Plate | What we are thinking (so you know what to ascribe) |
|-------|------------------------------------------------------|
| **C1** | Sequence templates catalog. Empty world possible. Opt-in / re-engagement / reactivation are **sequence** templates, not objectives. |
| **C2** | First thing on a campaign: Add objective, from a template. Example names: Launch window / launch day / additional. Same *seat* as Hub Add-configuration — not Automations triggers. |
| **C2b** | Same modal, from scratch. One binary (click link / book this calendar / submit this form), then name it. |
| **C3** | Two campaigns. There is **no first objective** — there is an objective. String the next campaign when it is met. Distance on the plate is founder caption, not a qualify node. Override this **off**. Do not mint `qualify` / `qualify_gate`. |
| **C4** | Override this **on**. Channel nodes hang as **wires**. Campaign toggles stay on the campaign. Channels closed. |
| **C5 / C5b** | Override content is a **toggle** inside the channel; on → node expands into that medium’s composer. Text, email, **call (ElevenLabs)**. Channel rules still a wire. Attempt rules are **not** here. |
| **C6** | Agents Settings = **global** defaults (attempt, channel/escalation, content, sequencing). Locked on the face. |
| **C7** | Sequence Settings = **this sequence**; inherit unless Override. Per-campaign attempt rules live **on the campaign**, not in this modal. Locked on the face. |
| **C8** (later) | This sequence → **Contacts**. Displays enrolled. **Add contact** in the header. Scope: **Every firm** (default) or **Select from** (all selected; deselect to pick one). Starts the mission now. Not Publish. Ant tab exists; Add contact does not. |

**Under-specified remainder** (blueprint § “specified but not on a canon plate”): attempt rules drawn on the campaign card; attempt-N content variation; additional opt-in objectives; word “event”; campaign Settings modal; Call vs Form on the machine. Name whether the machine already has a place, or Story is silent. Do not invent UI for these.

---

## Answer shape

One short block per plate:

```text
C# —
A. Our system: …
B. Externals / configs / possible?: …
Affordances: stood-up | partial | missing. UI would change if: … | UI can look like this if: …
```

Then **Rollup** (not a new flag):

1. What in **our** machine this lineup is looking at (tables / workers / runtime), in one paragraph.
2. Which **external** systems the pictures clearly call, and whether the implied configuration is possible as stood up.
3. Whether the UI can look like this given current affordances — and the smallest set of cases where the picture would have to change to stay honest.

---

## What this is not

- Not overwriting 15:43.
- Not minting Postgres from pixels.
- Not asking you to redesign Ant chrome. UI law: control or pane on states you already named.
- Not the PM restating the face. FACE + BLUEPRINT already did that.
