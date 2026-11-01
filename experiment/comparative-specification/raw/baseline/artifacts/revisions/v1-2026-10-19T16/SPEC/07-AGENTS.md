# 7. Agents (engagement authorship)

**Author seat:** Operator (Configuration libraries → Engagement templates). Firm / default / overrides are **scope of application**, not the nature of the module.

## 7.1 Flagship (founder wording, 2026-08-15 15:43 UTC)

Agents is the place where the **operator** defines:

- **Outreach sequencing** — not only the sequence itself, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, and other kinds of **overrides**.
- **Escalations** between nodes — or better: escalation between **attempts**; **retry rules**; **attempt rules**.
- A **goal / goal criteria**. The goal is itself an **escalation point**: to **other agents**, to **other workflows**, or **it ends there**. Once it is met, it is met. That is the **endpoint**.
- Everything in the middle of that is **modular**.

Do **not** put **triggers** inside this flagship. Triggers stay on Automations (and the dual-entry perimeter). The 14:58 numbered list is superseded.

## 7.2 Package shape

An **agent is a sequence**, not a campaign. A sequence is a **blank container** that can hold **multiple campaigns (goals)**.

```
SEQUENCE TEMPLATE  (blank canvas)
  sequence templates (empty world until authored): opt-in · re-engagement · reactivation
│
├─ Campaign  = one OBJECTIVE
│    first thing: the objective
│      template → populates the campaign
│      from scratch → binary event (yes/no), then name it
│    sequencing (how many channels, order)     ← campaign level
│    rules fall back: campaign override → sequence Settings → Agents Settings
│    per-campaign attempt rules live ON this campaign
│    [ Override this ]  → reveals wired CHANNEL nodes
│         └─ Channel node  (medium)
│              [ Override content ] inside the node → composer
│              attempt-N copy = variation on the same node
│              channel rules = escalation on that medium (hang off when opened)
│              attempt rules do NOT live here
│
├─ Contacts  = who is enrolled on THIS sequence
│    Add contact in the sequence HEADER (same row as Save / Launch)
│    scope: Every firm (default) · Select from
│    starts the mission now (not an event, not Publish)
│
└─ next Campaign  when previous objective is met
     distance may show a tick; it is NOT a qualify node
```

**Two objectives → two campaigns.** There is no “first objective” object. The distance between campaigns is not a qualify node. Teaching copy on plates is not spec.

## 7.3 Objective ≠ sequence

| Layer | What it is | Examples |
|-------|------------|----------|
| Sequence template | Full canvas class | Opt-in, re-engagement, reactivation |
| Objective / campaign | One yes/no the enrolled are campaigned to do | From scratch: click this link · book this calendar · submit this form. Then name it. |
| Objective template | Populates one campaign | Teaching names: Launch window, Launch day (operator may rename). Those names are **not** frozen system types. |

You do not put “opt-in” in the objective picker. Opt-in is a sequence.

Untemplated objective kinds stood up in SQL: **`click` | `form` | `meeting`** with completion tables `messaging_events` | `fact_writebacks` | `meeting_booked`. Webhook / table-lookup completion is named as later, not minted.

**Class completions (founder expansion, Story not fully promoted):**

| Sequence class | Objective of the class | Completion |
|----------------|------------------------|------------|
| Opt-in | Consent / first channel open | Sign-up (waitlist is a mini-goal / first signal) |
| Re-engagement | Data request | Form / facts in |
| Reactivation | Meeting request | Meeting booked |

A goal is **completion of an objective**. Escalation levels (do not collapse): (1) attempt sequencing inside a node (2) mini-goals (3) sequence/class completion (4) **between campaigns**, goal as escalation event → other agent · other workflow · or end.

Mechanism (packet 022): **objective met is a Local event**. The completion write **is** the event. Outbound stamps the objective; inbound matches that axis. Escalation is a **subscription** to `objective_met` — no destination column required. Do not mint a separate `goal` table for the 15:43 hole.

## 7.4 Defaults and overrides (CSS nesting)

There is a **default on every rule**. Failure rules are **part of escalation**, not a separate “actions on goals” family.

| Rule family | Meaning | Where it lives |
|-------------|---------|----------------|
| Channel rules | Escalation on that medium (not opened, not clicked, …) | Open channel node. Fallback: campaign → sequence Settings → Agents Settings |
| Attempt rules | Number of attempts; cycle of the same sequence; distance after failed last node; optional nth-attempt exception | Per campaign: on the campaign. Per sequence: Sequence Settings. Global: Agents Settings. Never middle of canvas. Never on the channel. |
| Content | What goes out | Override content **inside** the channel node. Sequence/global via Settings. Attempt = variation. |
| Sequencing | How many channels, order | Campaign |
| Campaign objective | The one yes/no | The campaign. When met, may string the next |

`firm_sequence_binding` + `rule_*.firm_id` NULL = firm vs platform default.

**Override this** is the first toggle on a campaign. It materializes child channel nodes as wires. Campaign-level toggles stay on the campaign.

## 7.5 Settings surfaces

| Surface | Grain |
|---------|--------|
| Agents Settings | Global defaults |
| Sequence Settings | This sequence; inherit unless overridden |

Both may hold attempt rules, channel rules, content defaults, default channel order.

## 7.6 Enroll vs Launch vs Automations

- **Add contact / Contacts** on the sequence: start the mission **now**. Scope: Every firm (default) or Select from (list opens all selected; deselect to pick). Same look as Automations A19.
- Automations enroll is the **other door** (on an event). Automations does **not** author a new agent; it **assigns** an existing sequence or **creates from a template**.
- Canvas chrome: **Save · Run · Launch** (later packets). Test data lives **on the trigger** (Automations). Launch arms; it does not also start a manual run as a second machine. **UNRESOLVED vs older map:** v2 backlog still records “Activate vs Launch” cosmetic mapping.

## 7.7 What Agents is not

- Not a form builder. Data-request forms are created in Automations.
- Not Automations triggers on this canvas.
- Not the engagement chart as lineage query.
- Not flattening a campaign into “four emails in a Timeline.”
- Not treating teaching captions as nodes.

## 7.8 Open (do not fill)

- Additional unnamed objectives inside the teaching opt-in sequence besides launch window / launch day.
- Word for untemplated objective (“event” vs another word).
- Whether mixed objective types in one sequence are practical or only technical.
- Call vs form on the machine ladder (see §3.2 / 7b).
- Filter catalog on Add contact beyond Every firm / Select from.
