# 13. Uncertainty register

These are **not** decided in the snapshot. This specification does **not** invent founder decisions for them.

## 13.1 Named Story silences (still open)

| Silence | System |
|---------|--------|
| Escrow **release** trigger / outcome definition | 3 |
| Concrete shape of database authorization per practice stack | 3 |
| Ongoing SaaS packaging vs escrow as peer door (packaging later must not replace the door) | 3 |
| When/whether email earns Meta entry; Meta targeting / CAC | 1 |
| CASL/SMS consent regimes by geography (firm→client and first agent→consultant text) | 6, 1 |
| What makes a signal **reactivation-worthy** | 11 |
| Exact product-locked attempt criteria windows (30 min / 24 h are operator-revisions, not promoted Story musts) | 7b |
| SMS reply-failure escalation | 7b |
| Import fully mutates the living list | 5 |
| CRM bidirectional sync | 5 |
| D-01: pre-meeting capture as tail of reactivation vs standalone meeting_booked sequence | 12 |
| D-02: in-meeting fallback module | 12 |
| Client desk depth (touchpoint-only vs authenticated portal) vs later `/c/` workspace | 8, 12 |
| Multi-consultant roles / permissions | 4 |
| Production onboarding beyond manifests / Provision | 4 |
| Rule-pack IP / liability | 9 |
| Constants packs beyond Immigration | 9, 10 |
| Operations & Actions initiation law (Seed stubs) — partially filled by primitives, not a complete catalog | 10 |
| Event-trigger set beyond the named primitives list | 10 |

## 13.2 Conflicts between layers (do not pick a silent winner)

1. **Hub seating.** Seed §5 puts Audits/Agents/Automations in the firm Hub. Personas/Outcomes/Phase Two put authorship on Operator Configuration libraries; product face is `/prototype-ant`; Hub is plant. **Intended seating:** Operator. Hub remains reference.

2. **Channel ladder.** Story: Text → Email → Form. Agents face: text → email → call; “do not silently drop form.” SQL `campaign_channel`: text \| email \| call. **Not closed.**

3. **Sequence class count.** Three phases (opt-in, re-engagement, reactivation) vs historical SQL four-class CHECK including `launch_day`. Later housing: launch window / launch day are **campaign names**, not sequence classes. **Intended:** three sequence templates; launch window/day are campaigns inside opt-in.

4. **Automations graph.** Seed §5.6 + V2-BACKLOG v1 validated pipeline vs Phase Two blank DAG with Get/If/Switch/chain. **Intended face:** Phase Two. Constants/Rules still required.

5. **Wait node.** Palette still lists Wait; packet 028 recut Wait kind to occupancy/approval notes. **Not closed** whether Wait remains a palette node.

6. **Root README** (“prototype only, no auth/API”) vs wire/Postgres/OTP on this SHA. README is stale. Intended product has auth, wire, and tables.

7. **PSD v0.4.0 “current”** (2026-07-10) vs Phase Two (2026-08). PSD is historical.

8. **Goal as Story must.** SYSTEMS-GOAL is founder expansion, “not Seed/World law until promoted,” while packets 022/023 implement objective-met as Local event. Mechanism is stood up; Story promotion wording remains unfinished.

9. **action.type extras** (`manage_lists`, `assign_task`, `notify_consultant`) vs primitives’ shorter in-app list.

10. **SEND_MODE default** dry-run (older actuation) vs live (later MODULES-ALIVE / AGENTS.md).

11. **Capability SME** 158 items — paper, not absorbed. Sending infrastructure and some gates exist; do not treat the full roster as specified.

12. **Objectives as billable unit / nullification** — direction, not a build order, not Story 3 promoted.

## 13.3 Automations FACE still-open tinkering list (verbatim silences)

- Full list of operations Automations performs.
- Full list of exit points besides start/select agent.
- Form-as-own-node vs embedded (lean: embedded).
- Remaining rule output classes besides required data.
- Queryable lineage UI.
- Word “event” for untemplated objectives (FACE says settled as objectives-are-events; AGENTS still lists the word as open).

## 13.4 Agents FACE still-open tinkering list

- Additional unnamed objectives in the teaching opt-in sequence.
- Mixed objective types in one sequence: practical or only technical.
- Add-contact filter catalog beyond Every firm / Select from.

## 13.5 What this spec refuses to invent

- Pricing numbers, CAC, Meta targeting.
- A complete in-app action catalog beyond named primitives + SQL extras flagged uncertain.
- A complete collectible-field dictionary.
- Legal opinions on CASL/PIPEDA (compliance SME exists as paper; not folded as product law here).
- Conversations / reply-triage module (capability C2 paper).
- Exact ElevenLabs call runtime.
- Whether Hub leaf parity is ever required (Phase Two: no — Hub is not the app).
