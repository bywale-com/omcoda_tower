# Systems — Goal (class = objective; goal = completion)

**Seat:** Systems Analyst.  
**Status:** Founder expansion 2026-08-15. Same grade as OPERATOR-REVISIONS: **denser than Seed/World, not Seed/World law until Story is promoted.** Founder: this is an expansion, not a trial balloon — will not be taken back.  
**Does not:** mint a table; overwrite the Agents flagship (PHASE-TWO-LOG 15:43 UTC); rewrite Seed/World.  
**Join:** [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) §7 · [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) §5c · [`guidelines/Reactivation.md`](../../guidelines/Reactivation.md) · SA log 16:40 / 16:50 UTC.

Requirements must **not** extract a `goal` state from this file until Story §7 carries a promoted **must**. Until then this file is the substance so the detail is not background.

---

## Founder excerpts (do not paraphrase away)

Spoken 2026-08-15. Kept specific. Ellipses only where filler; no generated list.

**What a goal is**

> A goal is a completion of an objective.

> A goal is critical to creating any agent. Like you can't, and you can't even create the workflow without the goal.

> We need to define a certain, certain goals. … What are goals like on the system side of things, what could be goals?

**Sequence class = objective (three classes)**

> There are only really three types of like three classes of sequences. They could be called different things, but … the way we even class sequences is by their objective. The opt-in is not just a random sequence.

> To reactivation. Usually it's our re-engagement … the opt-ins last launch campaign is, or the sequence.

> Why does someone get an engagement? Well, because we want to get some data. It's data requests, I think for the most part.

> What is a reactivation? A reactivation is a meeting request.

**Mini-goals inside a class (opt-in named first)**

> It's not just a campaign goal because it has a series of things that we like check, check marks that must be met inside of the opt-in, which are kind of like mini goals. … If it doesn't already, I'm sure it exists. There are like a couple of mini goals. Actually, they are, you have to dig through the repo to find it.

**Correction of “no goal”**

> You said there's a goal. There is a goal, which is meeting books. … When it comes to other like re-engagement or there's no goal.

**Escalation is already many levels; goals-as-events emerge between campaigns**

> Within a sequence … you can create goals as escalations to the next thing.

> Escalations are so many different levels as escalation within nodes, as like attempt slash retries, like, oh, if email, email's criteria isn't met, okay, then text. These are like … attempt sequencing, right? Within attempt sequencing.

> Then you also have … the sequence completion … criteria or not criteria, but it could literally just be like a node or something.

> Agents allows you to not only create within like a nodes within an attempt, but I think it can also help you create a campaign. And within between campaigns, you can also have escalation points … one that definitely emerges is goals as escalation events.

**Durability (this file exists because of this)**

> I'm not gonna sit back and say, I don't want this. … There's no like time I'm gonna say, oh, no, that was a mistake. No, I'm expanding the idea. So it's probably something that should be marked down somehow. … At the minimum, log worthy, and you take very detailed, specific excerpts from it so that you don't miss that detail. You don't leave that detail in the background. It's critical.

---

## Systems reading (alignment, not a substitute flag)

| Founder clause | Systems meaning |
|---|---|
| Goal = **completion of an objective** | Not a vibe, not a metric flag, not the attempt ladder. A **done** on an objective. |
| Sequences are **classed by objective** | `seq_phase_order` / Story 7 phases **are** the three objectives: opt-in, re-engagement, reactivation. The calendar is how you pursue the objective, not the class. |
| Goal **required** to create an agent **and** a workflow | Authoring a package without naming its completion is incomplete. `workflow` and `sequence_template` have **no** goal/completion column today. |
| **Mini-goals** = checkmarks **inside** a class | Distinct from the class completion. Already in `guidelines/Reactivation.md` (quoted below). |
| Reactivation’s goal **is** meeting booked | Seed §4 / Story spine / system 12 / `meeting_booked`. Do not say “no goal.” |
| Re-engagement’s objective = **data request** | Story 8 `fact_ask` / `fact_writeback`; OPERATOR-REVISIONS §5b form submitted closes nudge. |
| Opt-in is not a random sequence | Waitlist then sign-up (guidelines). `consent_records.status` `waitlisted` \| `sequenced`. |
| Escalation **levels** (do not collapse) | (1) attempt sequencing inside a node (2) mini-goals (3) sequence/class completion (4) **between campaigns**, goal as **escalation event**. |
| Level 4 **definitely emerges** | Destinations already named on the 15:43 flagship: other agent · other workflow · or it ends. Once met, met. |

---

## Three class completions vs what is stood up

Story 7 + seeded `seq_phase_order`: **opt-in → re-engagement → reactivation**.

| Objective (class) | Completion (the goal) | Stood up | Not stood up |
|---|---|---|---|
| **Opt-in / launch** | Waitlist (first signal) then **sign-up** (the real opt-in) | `consent_records.status` CHECK includes `waitlisted` \| `sequenced`. Map: Day3 → waitlisted. Activity badge **Complete** = opt-in finished. | Cascade **does not write** those statuses. `cs-waitlist` is in `tables.ts`, **not** in seed `002_machine_tables.sql`. |
| **Re-engagement** | **Data request** done (form submitted / facts in) | `fact_writebacks`. Map `acr-form-submit` → `state.finishing_event` `close_and_arm_next`. `tpl.reengagement.v1` cell labeled “data ask”. | `acr-form-submit` **not** in `rule_attempt_criteria` seed. Reengagement template is a **placeholder** (two mixed cells). |
| **Reactivation** | **Meeting request** done = **meeting booked** | `meeting_booked` (`007`). Guidelines: slot booking rate = “the outcome.” | System **12**, not a field **on** `sequence_template` / the agent. Book does not fire goal-met → escalate. |

**Four vs three (do not wash):** SQL `sequence_template.sequence_class` CHECK is `optin_launch` \| `launch_day` \| `reengagement` \| `reactivation`. Phase order has **three**. Guidelines: waitlist = anticipation; launch day = real opt-in (three jobs: set expectations, establish consequences, plant reactivation seed). Open: `launch_day` is a second template **inside** the opt-in objective, or a fourth class.

---

## Mini-goals already in the repo (the checkmarks)

Founder: dig the repo; they exist. They are **not** a goal table. They are guidelines metrics + some rule rows + events.

### Opt-in — `guidelines/Reactivation.md` Success Metrics

| Metric (checkmark) | What the guideline says |
|---|---|
| SMS delivery | Reachability / hygiene |
| SMS **Y-reply** | Immediate engagement |
| Announcement **open** | Authority of firm email; &lt;30% = deliverability or relationship |
| Announcement **click** | Active interest |
| **Waitlist conversion** | “Primary success metric for opt-in”; “first real opt-in signal” |
| **Social follow** | “Micro-yes completion” |
| Nurture open (days 4–7) | Sustained interest |
| Unsubscribe | Health, **not** completion |

Guideline reading: “Anyone who opens, clicks, follows, and joins the waitlist is in the top tier.”

Launch-day jobs (still opt-in objective): set expectations · establish consequences · plant reactivation seed. Confirmation email on sign-up.

### Reactivation — same file, Metrics

Y-reply; SMS non-reply (channel switch, not the goal); email open; **no-login view click**; time on view; nurture open; **slot booking** (“Conversion — the primary metric. This is the outcome”); booking drop-off.

Guideline reading: “Y-reply + view click + nurture open + booking = top-tier reactivation candidate.” Seeded `rule_cohort_scoring` `cs-top-tier` is that sentence. That row is **cohort**, not “goal met.”

### Re-engagement

Thinner. Story 8: one consolidated form for every outstanding self-reportable need. OPERATOR-REVISIONS §5b: **form submitted closes the nudge and can arm the next**. No denser nudge calendar in guidelines (To Do: “Define nudge content and cadence”).

---

## Escalation stack (keep the levels)

| # | Level | Founder phrasing | Housed today |
|---|---|---|---|
| 1 | **Attempt sequencing** | “if email’s criteria isn’t met, okay, then text” · “within nodes” · “attempt / retries” | **Yes.** `seq_channel_ownership_order` + `rule_attempt_criteria` + worker. Story 7b. **Not** a goal. |
| 2 | **Mini-goals** | “check marks that must be met inside of the opt-in” | **Partial.** Corpus + `rule_cohort_scoring` / `rule_metrics_thresholds`. Not a type. Not destinations. |
| 3 | **Sequence completion** | “sequence completion … criteria or not criteria, but it could literally just be like a node” | **Partial.** Reactivation → `meeting_booked`. Others: enum / map / prose. No `class → completion predicate` on the template. |
| 4 | **Between campaigns** | “within between campaigns, you can also have escalation points” · “**goals as escalation events**” · Agents also “help you create a campaign” | **Not** operator-authored. Story 7b: finishing event **arms next**; Engine 2 (`rule_motion_precedence`) chooses motion. Flagship destinations (agent · workflow · end) have no row. |

---

## What this is **not**

- Not a second Agents flag. Flagship stays PHASE-TWO-LOG **15:43 UTC**.
- Not Seed/World until Story §7 is promoted with a **must**.
- Not a mint. Do not add `goal` that duplicates `meeting_booked` for reactivation.
- Not collapsing level 1 (attempt ladder) into “goal.”
- Not putting **triggers** inside Agents (15:43).

---

## Open (ask; do not fill)

1. Promote Story 7: class **is** the objective; the goal **is** its completion; that completion **is** an escalation event (agent · workflow · end; once met, met)?
2. `launch_day`: class or template **inside** opt-in?
3. Mini-goals (Y-reply, waitlist, form submit): escalation points, or only checkmarks toward the class goal?

After (1) is yes: Requirements extract a state; table-first then wants a **rule** (when completion → destination) bound to the package — not prose in `cascade.ts`.
