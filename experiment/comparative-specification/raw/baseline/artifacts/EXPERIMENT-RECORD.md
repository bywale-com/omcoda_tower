# Experiment record — Contestant 1 (Baseline)

## Initial approach

Assigned methodology: none beyond a general-purpose agent. Created `/home/ubuntu/tower-spec-output/` immediately. Confirmed HEAD SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (no checkout needed). Recorded start in `00-START.md` at 2026-10-19T16:46:38Z.

Did not accept Tower Engineer / PM / SA seating. Did not install Spec Kit, OpenSpec, BMad, or Omcoda as an operating framework. Did not implement product code. Did not `git push`, open PRs, or ask the coordinator for more requirements.

Approach: map the repository’s own product-definition layers, then write a coherent intended-product spec that quotes locked founder wording, uses later seating/face law where it explicitly supersedes Seed Hub-in-firm sketches, and leaves Story silences unnamed-as-filled.

## First substantive artifacts

- `01-APPROACH.md`, `SOURCE-MAP.md` — how reading would work and which layers have authority.
- `SPEC/01-IDENTITY.md` through `SPEC/03-CORE-LOOP-AND-SYSTEMS.md` — product bets, actors, twelve systems from Seed/World/Story/Outcomes.
- `SPEC/07-AGENTS.md`, `SPEC/08-AUTOMATIONS.md` — Phase Two flagship 15:43 plus FACE/PRIMITIVES, after seeing those files contradict Seed §5.6’s Hub module sketch.

## Later revisions and discoveries

1. **Stale README vs later wire.** Root README still says prototype/no backend. Migrations through `024`, OTP auth, Resend/Twilio cutover, and `/prototype-ant` exist on this SHA. Spec treats README as stale; intended product has tenancy, wire, and tables.
2. **Hub vs product face.** Seed parks Audits/Agents/Automations in firm Hub. Personas/Outcomes/Phase Two move authorship to Operator Configuration libraries; Hub is plant. Spec takes the later seating.
3. **Channel ladder conflict.** Story Form vs Agents-face Call vs SQL `text|email|call`. Recorded as UNRESOLVED rather than picking a winner.
4. **Objective-met mechanism.** SYSTEMS-GOAL says not Story-promoted; packets 022/023 on main implement Local matching and exhaustion. Spec states both: mechanism stood up; Story promotion wording unfinished.
5. **Origin pull/96 packets.** Fetched PM packets (GET, TEST, RUN, IF-SWITCH, FORM-CLASS, CONTACT-WORKSPACE, WAIT-NOTE, …) as repository history. Indexed in `SUPPORTING/PM-PACKETS-ON-PR96.md`. They refine Automations/Contact chrome; they do not recut 15:43.
6. **v1 → v2 spec revision.** After first SPEC pass, added production-vs-modeling seat chrome, guidelines-as-template-content (not frozen types), and Oversight-vs-C7-paper note. Copies in `revisions/`.

## How next steps were chosen

No coordinator checklist. After identity/systems, the largest unspecified-feeling modules in the corpus were Agents and Automations (Phase Two flagship + FACE). Then desks (How trees + Ant scene), then SQL/runtime so the spec had a machine, then an uncertainty register so missing founder decisions were not invented. Capability SME paper was read enough to know it is **not absorbed** — cited only as supporting, not law.

Continued until the intended product could be stated end-to-end (who, loop, desks, Agents, Automations, eligibility, data, constraints) and remaining holes were classified as silences/conflicts rather than unread files.

## Why stopped

Assignment complete: a coherent intended-product specification exists, grounded in the snapshot, with explicit uncertainty. Further work would be inventing escrow release, reactivation-worthy criteria, CASL regimes, or a complete action catalog — forbidden. Not a runtime blocker; not budget exhaustion.

Did not verify UI in a browser: this contestant was specified as read-only specification, not implementation.

## Time / resource notes

- Start (UTC): 2026-10-19T16:46:38Z
- Stop (UTC): 2026-10-19T16:51:23Z writing STATUS (reading/writing occupied the interval after start)
- SHA confirmed on first git command; fetch of `origin pull/96/head` used for packet titles
- No dependency install; no `npm run dev`; no git push

## File inventory

```
/home/ubuntu/tower-spec-output/
  00-START.md
  01-APPROACH.md
  SOURCE-MAP.md
  STATUS.json
  EXPERIMENT-RECORD.md
  BUNDLE.md
  SPEC/
    00-HOW-TO-READ.md
    01-IDENTITY.md
    02-ACTORS-AND-DESKS.md
    03-CORE-LOOP-AND-SYSTEMS.md
    04-CONSULTANT-DESK.md
    05-OPERATOR-DESK.md
    06-CONTACT-EXPERIENCE.md
    07-AGENTS.md
    08-AUTOMATIONS.md
    09-ELIGIBILITY-AND-MOTION.md
    10-DATA-AND-RUNTIME.md
    11-CONSTRAINTS.md
    12-GLOSSARY.md
    13-UNCERTAINTY.md
  SUPPORTING/
    AS-BUILT-VS-INTENDED.md
    PM-PACKETS-ON-PR96.md
  revisions/
    v1-2026-10-19T16/SPEC/…
    v2-after-seat-and-guidelines/SPEC/…
```

Primary specification: `SPEC/` and concatenated `BUNDLE.md`.
