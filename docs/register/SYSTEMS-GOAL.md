# Systems — Goal (class = objective; goal = completion)

**Seat:** Systems Analyst.  
**Status:** Founder expansion 2026-08-15. Same grade as OPERATOR-REVISIONS: **denser than Seed/World, not Seed/World law until Story is promoted.** Founder: this is an expansion, not a trial balloon — will not be taken back.  
**Does not:** mint a table; overwrite the Agents flagship (PHASE-TWO-LOG 15:43 UTC); rewrite Seed/World.  
**Join:** [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) §7 · [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) §5c · [`guidelines/Reactivation.md`](../../guidelines/Reactivation.md) · SA log through **22:41 UTC grain lock** · UI-blueprint ascribe [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md). **Grain names:** more recent is current — **sequence contains campaigns**. 17:05 section below used the opposite words; witnessing only, not law.

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

**Four vs three (do not wash):** SQL `sequence_template.sequence_class` CHECK is `optin_launch` \| `launch_day` \| `reengagement` \| `reactivation`. Phase order has **three**. Guidelines: waitlist = anticipation; launch day = real opt-in. **Campaign grain (17:05):** `launch_day` is a second **sequence inside** the opt-in campaign, not a fourth objective — unless corrected.

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

## Agents module: closed, except one walk-break (2026-08-15 16:55)

Authorship shape is closed: class = objective; sequence + order; attempt sequencing; mini-goals as checkmarks; goal = completion; when met → other agent · workflow · or end. Triggers / Automations are another engine (not this gap).

**The break (answered 16:58):** if you run the **entire** escalation and do not meet the objective, that is a **failure mode**. Failure criteria = not meeting the objective. What failure *does* is not yet law — it cannot be silent.

Do not mix with 7b attempt-level “failure → next channel” (PHASE-TWO-LOG 14:49). Do not restore 14:58 “actions on goals” as the flag. This is the other pole of **once met, met**.

---

## Failure mode — walk the three classes (2026-08-15 16:58)

**Founder (this stamp):** Escalation already implied it. If you run through the entire escalation and don’t meet the goal, it’s a failure mode. Still have to define what failure *does*. Cannot fail silently — it does something. Two axes of data: (1) effectiveness of sequencing/campaign, down to the **node**, up to the **campaign**, across contacts — you know **where** it fails; (2) data about **that contact**. Do not default to “force another campaign.” Engagement still needed the data point.

**Score already in the repo (the contact axis):** `cohort_tiers` (`contact_id`, `firm_id`, `tier`, `score` JSONB) + `rule_cohort_scoring` (open+click; Y-reply+view+nurture+booking = top tier). Guidelines: each step that completes without the next tells you where the friction is. **Campaign/node axis:** `engagement_records` (written) + `rule_metrics_thresholds` / `metrics_flags` (tables exist; worker does **not** write `cohort_tiers`). Do not confuse with eligibility/CRS `client_score_snapshot` (system 10). PCRE in `guidelines/Reactivation.md` is inherited firm-authority at opt-in start, not this score.

**SA walk / suggestions — not founder flag, not Story must, not a mint.**

Failure = authored escalation exhausted (sequence deployed + attempt ladder spent) **and** class goal unmet. Success still escalates (agent · workflow · end). Failure is the other pole. Default is **not** “try another campaign” — that is success-shaped escalation without the completion.

| Class | Goal | If it fails | Suggestion (what it does) |
|---|---|---|---|
| **Opt-in** | Sign-up | Never opted in **after the whole campaign** (window + launch day) | **Cannot** enroll re-engagement or reactivation (Story 6). This **campaign** ends. Interior drop-offs are not this row — see campaign grain below. |
| **Re-engagement** | Data request (form in) | Needed the fact; didn’t get it | Do **not** clone another nudge agent (one motion; one form). Write `missing_fact_signal` (Story 8 already). Engine 2 later decides motion. Contact score: didn’t give facts. Campaign score: this nudge shape failed at form. Attempt-level retry (24h → head) is **not** class-failure; class-failure is after that is exhausted. |
| **Reactivation** | Meeting booked | Slot ran; no book | Do **not** auto-fire another meeting ask. Record where they dropped (never opened vs viewed vs didn’t book). Repeat-compression is already a Story silence. Engine 2 still owns “still reactivation-worthy?” |

Silent fail would hide both axes. Minimum writes: engagement event (already the record) + contact `cohort_tiers` + campaign/node rollup. Worker today writes the first, not the other two.

The 16:58 opt-in row was **too closed**: it treated opt-in as one sequence that ends. Opt-in in the corpus is a **larger campaign**. Grain below.

---

## Two grains in Agents, and opt-in as a large campaign (2026-08-15 17:05)

**Founder:** The 16:58 walk was still a bit closed. Opt-in is actually a **larger campaign**. Agents is sequence rules, content per node, sequence for attempts — **and** a larger-style campaign. Talk about what expansion of opt-in looks like at that scale.

**Reasoning (why the last table flattened it):** Agents authorship has two grains. I walked only the first, then jumped to class-failure.

| Grain | What the operator defines | Already named |
|---|---|---|
| **Sequence** | Order of nodes, **content on each node**, attempt sequencing (email criteria fail → text) | Flagship sequencing + 7b |
| **Campaign** | Compose more than one sequence toward **one** class objective. Mini-goals / sequence-completion escalate **inside** the campaign. The class goal is campaign completion. | “Agents … help you create a campaign”; “between campaigns” is the next grain up; opt-in is the one that is already large in `guidelines/Reactivation.md` |

Re-engagement and reactivation in the corpus are mostly **one sequence** each (data ask; meeting ask). Opt-in is the expansion that shows the campaign grain.

**What the opt-in campaign already is (not invented — `guidelines/Reactivation.md`):**

```
CAMPAIGN  objective = opt-in (get them into the system)
│
├─ Sequence A — Launch window (5–7 days)
│    Day1 text primer     mini: Y-reply     (signal, not a gate — email still comes)
│    Day1 announcement    mini: open, click
│    Day2 social          mini: follow      (micro-yes)
│    Day3 waitlist        mini: join        (“first real opt-in signal”; primary metric)
│    Days4–7 nurture      keep the campaign alive until go-live
│
│    Waitlist met → escalate INSIDE this campaign to Sequence B
│    (not to re-engagement; still the same objective)
│
├─ Sequence B — Launch day
│    sign-up email
│    landing (expectations, consequences, plant reactivation seed)
│    confirmation
│
│    Sign-up met = CAMPAIGN GOAL → consent sequenced
│    Then the flagship success pole: other agent · workflow · or end
│
└─ Class failure = A+B fully deployed, never signed up
     Then the 16:58 opt-in row (this campaign ends; do not enroll nudge/meeting)
```

SQL already split this: `optin_launch` + `launch_day` templates. Phase order has **three** classes. That is not a fourth class — it is two sequences **inside** one opt-in campaign. That was the open 3-vs-4; this grain closes it as a standing-up accident, not a fourth objective.

**Interior vs campaign-failure (do not collapse):**

- Node / attempt fail → 7b (still in the same node’s ladder).
- Mini-goal miss (no Y-reply) → campaign **continues** (guidelines: primer is not a gate).
- Waitlist met → next **sequence** in the same campaign (launch day).
- Sign-up met → **campaign** complete.
- Never signed up after A+B → **class failure**.

So “don’t force another campaign” still holds **between classes**. Inside opt-in you **do** escalate sequence-to-sequence. That is the campaign grain.

**Open inside the campaign (simple, not filled):** if waitlist is anticipation and launch day is the real opt-in, do contacts who never waitlisted still get Sequence B, or is launch day only for waitlisted? Guidelines name scarcity (“slots are limited”) and do not close the branch.

Guidelines also leave packaging open (one-time managed launch vs product feature). That is not the machine shape. The machine can still author this campaign.

---

## Open (ask; do not fill) — as of 17:05

1. Promote Story 7: class **is** the objective; the goal **is** its completion; that completion **is** an escalation event (agent · workflow · end; once met, met); exhausted **campaign** without completion **is** a failure mode (not silent)?
2. Failure *does* at **class** grain — accept the 16:58 rows as **after the whole campaign**, not after one sequence?
3. Launch day only for waitlisted, or the whole book still gets Sequence B?

`launch_day` as a fourth **class** is no longer the ask — it is a sequence inside the opt-in campaign unless corrected.

After (1) is yes: Requirements extract a state; table-first then wants a **rule** (when completion → destination) bound to the package — not prose in `cascade.ts`. Failure destination is likely **end this campaign + record**, not a fourth success destination. Sequence-to-sequence inside a campaign is a different rule (mini-goal / sequence completion).

---

## Canonical grain names (2026-08-15 22:41) — more recent is current

**Founder:** Everything that came after 17:05 is the canonical thing. Agents are sequences. A blank agent sequence is agnostic: **all campaigns within sequences**.

Same two boxes as 17:05. Words swapped:

```
SEQUENCE  (agent / blank canvas)  class = opt-in
│
├─ Campaign A — Launch window     objective = one binary (face: probably click this link)
│    Day1–7 calendar / mini-goals still live *inside* this campaign
│    Objective met → QUALIFY → Campaign B
│
├─ Campaign B — Launch day        objective = they opt in (sign-up)
│    Sign-up met = this campaign’s goal
│
└─ Class failure = the sequence’s campaigns exhausted, class still unmet
     (16:58 opt-in row, after the whole sequence, not after one campaign)
```

Re-engagement / reactivation may be one campaign each. Opt-in is the one that already needs two.

SQL still has `launch_day` as a `sequence_class`. That is the housing lie. Delta (no mint): [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md) § Canonical housing.

**Interior vs failure (canonical words):**

- Node / attempt fail → 7b (inside that campaign’s channel).
- Mini-goal miss inside a campaign → that campaign **continues** (primer is not a gate).
- Campaign A objective met → **qualify** to campaign B (same sequence).
- Launch-day sign-up met → that **campaign** complete; for opt-in this is also the **class** completion.
- Never signed up after A+B → **class failure** (sequence ends; do not enroll nudge/meeting).

“Don’t force another campaign” still holds **between sequence classes**. Inside a sequence you **do** qualify campaign-to-campaign.

Waitlist → who gets launch day: still open. Face qualify is “first objective met,” not yet “waitlisted.”

**Open as of this stamp (does not erase 17:05 Open above):**

1. Promote Story 7: sequence **contains** campaigns; class **is** the sequence kind (three); a campaign **has** an objective; the goal **is** that completion; qualify between campaigns; class completion **is** an escalation event (agent · workflow · end; once met, met); exhausted **sequence** without class completion **is** a failure mode (not silent)?
2. Failure *does* at **class** grain — after the **whole sequence** (all its campaigns), not after one campaign?
3. Launch day only for waitlisted, or the whole book still gets campaign B?
4. Call vs Form, attempt-cycle params, 7a vs 7b — face still moving; finish or park before mint.

`launch_day` as a fourth **class** is not the ask. `launch_day` as an inner **sequence** (17:05 words) is not law. It is a **campaign** inside the opt-in **sequence**.

After (1) is yes: Requirements extract a state; table-first then wants campaign as a child row of sequence, objective on that row pointing at existing completions, qualify as campaign→campaign — not prose in `cascade.ts`, not a `goal` table that duplicates `meeting_booked`. Process: finish moving face before that mint.
