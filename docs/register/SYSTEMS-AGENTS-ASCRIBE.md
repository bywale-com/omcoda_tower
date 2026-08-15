# Systems — ascribe: Agents UI blueprint vs stood-up machine

**Seat:** Systems Analyst.  
**When:** 2026-08-15 20:10 UTC.  
**Prompt:** PM package [`AGENTS-SA-PACKAGE.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/phase-two-app-facing-agents-2bec/docs/register/AGENTS-SA-PACKAGE.md) on PR [#85](https://github.com/bywale-com/omcoda_tower/pull/85). Plates [`AGENTS-UI-BLUEPRINT.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/phase-two-app-facing-agents-2bec/docs/register/AGENTS-UI-BLUEPRINT.md). Law [`AGENTS-FACE.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/phase-two-app-facing-agents-2bec/docs/register/AGENTS-FACE.md).  
**Flag:** PHASE-TWO-LOG **15:43 UTC** — not overwritten. This file is **not** a second Agents flag.  
**Does not:** mint tables; put `workflow_trigger` on this canvas; restore discarded plates; invent a call table from C5; restore 14:58 “actions on goals.”

Inventory already walked (SA log **16:28**). Goal expansion: [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md). Campaign vs sequence grains: SA log **17:05** (words inverted; **22:41 lock** below).

---

## Grain names — locked 2026-08-15 22:41 UTC (more recent is current)

Founder: everything that came after 17:05 is canonical. Agents **are** sequences. A **blank agent sequence** is agnostic: **campaigns live inside sequences**. All campaigns within sequences.

| Grain | Canonical name | Not |
|-------|----------------|-----|
| The agent / blank canvas / C1 card | **Sequence** (classed: opt-in · re-engagement · reactivation) | Not a campaign. Not `launch_day` as a class |
| One objective on the canvas | **Campaign** (launch window · launch day · additional · from-scratch) | Not a sequence. Not a fourth `sequence_class` |
| Done on that objective | **Goal** (completion) | Not the attempt ladder |

**17:05** used the opposite words for the same two boxes (opt-in as “larger campaign,” window/day as “inner sequences”). That stamp stays as witnessing. **Do not use it as law.**

SQL still stores both grains as `sequence_class` tokens on one table. Housing delta (no mint): § Canonical housing below.

---

## Per plate

### C1 — Sequence templates catalog

**A. Our system:** `sequence_template` (`004`: `id`, `sequence_class` CHECK `IN ('optin_launch','launch_day','reengagement','reactivation')`, `variant`, `label`, `cells` JSONB, `source`, `silences`, `version`). Empty world is possible (no NOT NULL forcing rows). Face shows **three** sequence templates (opt-in / re-engagement / reactivation). SQL has **four** classes — `launch_day` is stuffed into sequence-class grain. Seed `002` inserts all four (`tpl.optin_launch.v1`, `tpl.launch_day.v1`, `tpl.reengagement.v1`, `tpl.reactivation.v1`). `seq_phase_order` seed is the three phases (`optin` / `reengagement` / `reactivation`) — closer to C1’s three cards, but it is phase **order**, not a catalog. `firm_sequence_binding` UNIQUE `(firm_id, sequence_class)` = one bound template **per class per firm**, not an open catalog of many named sequences. `sequence_definitions` (`name`, `steps` JSONB, `status` default `draft`) is stood up and **unused** — runtime is `templateWalk` → `sequence_template` via binding (`workflowWalk` / `machine.ts` `ON CONFLICT (firm_id, sequence_class)`).

**B. Externals / configs / possible?:** None. No vendor on this plate.

**Affordances:** partial. **UI can look like this if** the catalog is curated to three sequence templates and `launch_day` is kept off C1 (as the face already says). **UI would change if** the catalog were “every `sequence_template` row” — C1 would grow a fourth card and contradict objective-vs-sequence law. Many named sequences of the same class: binding UNIQUE would have to change — **not minted from this picture**.

---

### C2 — Add objective from a template

**A. Our system:** Campaign / objective grain. **No** `campaign` table. **No** `objective` table. Closest housed: `sequence_template` rows `optin_launch` and `launch_day` — machine treats them as **sequence classes**; face treats them as **objective templates** inside the opt-in sequence. “Additional” unnamed — Story silent. First thing on a campaign = objective: Hub analogy is the **seat** (Add-configuration on a node). Automations housing for that seat is `workflow_trigger` (`006`: `type IN ('event','schedule','manual','webhook','constant')`). **Do not put that table on this canvas.** Qualify / goal-as-escalation: map `state.finishing_event` is chain-only (SA 16:28); runtime never writes a finishing_event row. Save path today: `machine.ts` upserts `sequence_template.cells` (day/channel cells) or `firm_sequence_binding.overrides` JSONB (cell/variable, not campaign+objective).

**B. Externals / configs / possible?:** None on the template tab.

**Affordances:** missing for campaign+objective as rows. **UI can look like this** as authorship chrome. **UI would change if** Set objective were claimed to persist — there is nowhere honest except stuffing `cells` / `overrides`, which would lie about grain.

---

### C2b — Add objective from scratch (companion to C2)

**A. Our system:** Binary completion, then a name. Three radios vs stood-up:

| Radio | Housed | Not this grain |
|-------|--------|----------------|
| Click this link | Resend webhooks → `messaging_events`; attempt state `link_clicked`; `rule_attempt_criteria` `acr-email` condition `link not clicked within threshold` | That row is **channel** criteria (`when_clause` `channel=email AND opened`), not a campaign-objective row |
| Book a meeting in this calendar | `meeting_booked` (`007`); `machine.ts` insert + nullify `active_attempts` (`state.meeting_booked`) | Calendar **vendor** is not a port. `source` default `contact_portal` — our outcome table, not Calendly |
| Submit / complete this form | `fact_writebacks`; form channel on the ladder; `active_attempts.state.form_submitted` | Map `acr-form-submit` → `finishing_event` is **map-only** — **not** in `rule_attempt_criteria` seed (`acr-form` is “started, not submitted → return_to_sequence_head”) |

No objective **name** column on any table. Webhook / table-query completion: named later on the face; closest housing is Automations `workflow_trigger.type = 'webhook'` — **later, not here**.

**B. Externals / configs / possible?:** Click: Resend **live** (webhooks → `messaging_events`) when secrets+DB. Book: **no** calendar port in `registry.ts`. Form: in-app writeback, not an external form vendor. Webhook: `workflow_trigger` exists; not an Agents canvas config.

**Affordances:** partial (events exist; objective row does not). **UI can look like this** as a picker. **UI would change if** “Set objective” implied a saved named binary on the campaign — silent. Do not mint webhook-completion from C2b.

---

### C3 — Two campaigns, Override this off

**A. Our system:** The campaign grain the face drew (two objectives → two campaigns; first met → **qualify**). Runtime walks a **flat** cell cursor: `templateWalk` (“cells are the sequence; ladder escalates **within a cell**”) + `advanceTemplateCellIfDue`. Seeded `tpl.optin_launch.v1` cells are a **day calendar** mixing mediums (day1 text, day1 email, day2 form, day3 waitlist, days4–7 nurture) — not two campaign nodes. `campaign_states` is firm-level `armed-for-activation` \| `running` — **name collision**, not this plate. Override this **off** ≈ inherit C6/C7. `firm_sequence_binding.overrides` is JSONB cells/variables, **not** this toggle. Qualify edge = 15:43 goal-as-escalation **drawn**; not operator-authored data. C3 sequencing still says Form (stale vs C5; machine ladder **is** Form).

**B. Externals / configs / possible?:** None.

**Affordances:** missing for two campaigns + qualify as rows. **UI can look like this** as the face. **UI would change if** the canvas were bound to one `sequence_template.cells` array as-is — you would see a calendar strip, not two campaign cards.

---

### C4 — Override this on, channels closed

**A. Our system:** Channel nodes as wires = `seq_channel_ownership_order` (`token`, `label`, `ord`; `firm_id` NULL = platform) + `active_attempts.owner_channel`. Seed: `ch-text` / `ch-email` / `ch-form` (ord 0,1,2). Cascade `loadChannelOrder`: firm row preferred, else NULL-firm; fallback `["text","email","form"]`. `channelFromWhen` matches `text|email|form|sms`. **No** Override-this column. Form on this plate is **honest to the machine**; Call on C5 is the later face (stale pixels named in the blueprint — do not silently fix).

**B. Externals / configs / possible?:** None until a channel is opened for send.

**Affordances:** channel **order** housed; Override-this persist missing. **UI can look like this** (three closed mediums). **UI would change if** the third closed medium were Call — that would be dishonest to `seq_channel_ownership_order` until Story + a port.

---

### C5 / C5b — Override content toggle; text, email, call (companion)

**A. Our system:** Content: `sequence_template.cells` (`templateWalk.NormalizedCell.subject` / `bodyText`; default `Tower — ${label}` if unset) and sent copy on `outbound_messages.subject` / `body_text` / `body_html` / `content` (`009`). No per-channel Override-content table. Channel rules wire: `rule_attempt_criteria` (seed `acr-text` 30 minutes, `acr-email` 24 hours, `acr-form` 24 hours). `{{phone}}` → `contact_records.phone`. **Call / ElevenLabs: no port.** `registry.ts` live send ports are `espMailer` (Resend) and `smsApi` (Twilio). `channelFromToken` / `NormalizedCell.channel` are `"text" | "email" | "form"` only. Do **not** mint a call table from C5. Attempt rules are correctly **not** on this plate (face law). Attempt-N copy variation: silent (cells have no attempt-index).

**B. Externals / configs / possible?:**

| Picture | Stood up | Live vs stand-in |
|---------|----------|------------------|
| SMS To `{{phone}}`, body, 160-count | Twilio `smsApi`; phone on `contact_records` | Live when secrets+DB. 160-count is chrome |
| Email subject, From, reply-to, body | Resend `espMailer`; From/domain via `sendingPool` / `sending_domains` | Live when secrets+DB. Reply-to not a first-class column |
| Call via ElevenLabs, voice, script, goal of this call | **No port, no table** | Not possible as stood up |
| Channel rules (not opened / not clicked) | `rule_attempt_criteria` + Resend webhooks → `messaging_events` | Open/click **live** for email. SMS “opened” is a named stretch |

**Affordances:** text+email partial (content in cells; override toggle not a row). Call **missing**. **UI can look like this** for text/email composers. **UI would have to stay Form** (or mark Call face-only) until Story names a call must **and** a port exists. Do not invent ElevenLabs fields from C5b richness — blueprint already says illustrative.

---

### C6 — Agents Settings (global)

**A. Our system:** NULL-`firm_id` rows on `rule_*` / `seq_*` = platform default. Cascade prefers firm then NULL (`loadAttemptCriteria`, `loadChannelOrder`).

| C6 family | Housed | Partial / silent |
|-----------|--------|------------------|
| **Channel rules (escalation)** | `rule_attempt_criteria` when/condition/threshold (30m / 24h / 24h) | C6 still lists Form — honest to seed `acr-form`. “not delivered” as a distinct row is thin (`acr-text` is delivered ∧ not opened) |
| **Sequencing** | `seq_channel_ownership_order` Text → Email → Form | Housed |
| **Attempt rules** (number of attempts; wait after failed last node; nth-attempt different sequence) | `active_attempts` is **one in-flight row**, not a cycle counter. `set_value` includes `next_attempt_or_forward` but there is no `attempt_n` / `wait_after_last` / `nth_sequence_id` column | **Partial / silent.** Windows on this plate are **channel** windows, already in `rule_attempt_criteria` — do not call those “number of attempts” |
| **Content** (per-medium global defaults) | No global-content table. Content lives on `sequence_template.cells` | Silent as a Settings family |

**B. Externals / configs / possible?:** None (defaults are ours).

**Affordances:** channel order + channel-window criteria stood-up. Attempt-cycle params missing. Global content missing. **UI can look like this** as a Settings modal. **UI would change if** Save were claimed for attempt-count / nth-sequence / global content — those have no row.

---

### C7 — Sequence Settings

**A. Our system:** Closest inherit: NULL-firm vs firm-scoped `rule_*` / `seq_*` row (cascade `ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END`). **No** per-family Override boolean on a sequence instance. Binding is `UNIQUE (firm_id, sequence_class)`, not CSS campaign → sequence → global. Per-campaign attempt rules “on the campaign”: **no campaign table** (said on C7, not drawn on C3–C5). Content Override off / Sequencing Override off: can mean “use platform `seq_channel_ownership_order` + template cells” — not a stored inherit flag.

**B. Externals / configs / possible?:** None.

**Affordances:** partial (firm-vs-platform rows exist; Override-per-family does not). **UI can look like this**. **UI would change if** inherit/override Save were claimed without a row that records which family is overridden at sequence grain.

---

## Under-specified remainder (name; do not invent UI)

| Said, not drawn | Machine already has a place? | Story |
|-----------------|------------------------------|-------|
| Attempt rules **on the campaign** card | No campaign table. No attempt-count column | Silent at campaign grain. Attempt **windows** are channel (`rule_attempt_criteria`) |
| Attempt-N content variation on the same channel node | Cells have `subject`/`bodyText`, no attempt index | Silent |
| Additional opt-in objectives (C2 Additional disabled) | Silent | Silent |
| Word “event” | `engagement_records.event_kind`; `workflow_trigger.type = 'event'`; map `finishing_event` | Word not locked on the face; do not steal Automations `event_name` onto Agents |
| Mix objective types in one sequence | Binding is one class per firm | Face: “technically” — open |
| Campaign Settings modal | Not placed; no campaign row | Silent |
| Call vs Form on the **machine** | Form **housed** (`seq_channel_ownership_order`, `NormalizedCell.channel`, `acr-form`). Call **silent** | Face C5 Call; C4/C6/C7 Form. **Named silence.** Do not mint |

---

## Rollup (not a new flag)

### 1. What in our machine this lineup is looking at

The pictures are traversing **two grains the SQL flattened into one:** `sequence_template` + `firm_sequence_binding` (class CHECK includes `launch_day`) for the catalog and the calendars, and `seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts` + `cascade` for the channel ladder inside an attempt. Content is jsonb on cells and columns on `outbound_messages`. Completions that C2b points at already exist as **other** tables (`meeting_booked`, `fact_writebacks`, `messaging_events`) — not as an objective on a campaign. Runtime is a **cell cursor** (`templateWalk`) with **channel escalation within a cell**, not a graph of campaign nodes with qualify edges. `sequence_definitions` is a second unused housing. `workflow_trigger` is Automations — seat analogy only.

### 2. External systems the pictures clearly call

| External | Implied config | Possible as stood up? |
|----------|----------------|------------------------|
| **Resend** (email send + open/click) | Sending domain on `sending_domains`; CEM send; webhooks → `messaging_events` | **Live** when secrets+DB |
| **Twilio** (SMS) | `smsApi`; `contact_records.phone` | **Live** when secrets+DB |
| **ElevenLabs** (call) | Voice / script / “goal of this call” | **No.** Not in `registry.ts`. Not a table |
| Calendar vendor (book this calendar) | Slot picker | **No port.** `meeting_booked` is **our** outcome |
| Form vendor | Submit/complete | **No.** In-app `fact_writebacks` / form channel |
| Webhook / table lookup | Name-in-a-list completion | Automations `workflow_trigger` **later**. Not on this canvas |

Stand-in (unchanged from 16:28): Meta, escrow, enrich, Postmaster, warmup, list-unsubscribe. Client `sendGate` chip stand-in; server `dispatchSend.ts` holds real consent/halt/silence. **No call port, live or stand-in.**

### 3. Whether the UI can look like this — smallest honesty set

**The UI can look like this** as the operator-facing graph (empty catalog, two campaign cards, Override this revealing wires, content as a toggle inside the node, two Settings surfaces). That is chrome on grains **already named**. It does not require minting from pixels.

**The picture would have to change to stay honest in these cases only:**

1. **C5 Call.** Third medium on the machine is Form (`seq_channel_ownership_order`, cascade fallback, `NormalizedCell.channel`). Until Story names a call must **and** a port exists, either keep Form on Settings/closed-channel plates (C4/C6/C7 already do) and treat C5 Call as **face-only**, or do not ship Call as a saveable channel. Do not mint ElevenLabs.
2. **C1 as “all templates.”** Four SQL classes vs three sequence templates. Catalog must stay curated (launch day is an objective, not a C1 card) or C1 becomes a lie.
3. **Save that claims campaign / objective / Override this / Override content / CSS inherit / attempt-count / nth-sequence / qualify.** Those have no rows. Looking like the mock is fine; persisting those toggles as if they were `firm_sequence_binding.overrides` would be a grain lie.
4. **Binding many named sequences per class.** UNIQUE `(firm_id, sequence_class)` cannot house an open C1 catalog of several opt-in sequences. Change the binding **after** Story, not from this package.

**Locked true (22:41):** a sequence is a blank container that holds multiple campaigns. Binding UNIQUE `(firm_id, sequence_class)` with `launch_day` itself a class is the **lie**. Today those are two sibling bindings, not two campaigns on one template.

**Still open (7a vs 7b):** channel wires = the campaign’s sequencing (face C4/C6 = 7b). Seeded `tpl.optin_launch.v1.cells` is a day calendar of mixed mediums (7a). Do not collapse them in Settings. Finish or park on the face before Story 7a/7b is rewritten.

---

## Canonical housing — what would have to change (22:41, no mint)

Not a migration. Not CREATE TABLE. Story first, then Requirements, then table-first. If it can be overridden, it must be a row — **after** Story bears it.

### Keep (this grain does not touch)

- `seq_phase_order` three tokens (`optin` / `reengagement` / `reactivation`) — these **are** the sequence classes.
- Channel ladder: `seq_channel_ownership_order` + `rule_attempt_criteria` + `active_attempts.owner_channel` — 7b **inside** a campaign.
- Completions as **other** tables the campaign objective **points at**: `meeting_booked`, `fact_writebacks`, `messaging_events`. Do not mint a `goal` that duplicates `meeting_booked`.
- NULL-firm `rule_*` / `seq_*` = Agents Settings (C6).
- `campaign_states` = firm `armed-for-activation` \| `running`. **Name collision.** Leave the table; do not reuse it for canvas campaigns.
- `sequence_definitions` unused. Leave dead. Do not revive as the campaign table.
- `workflow_trigger` — Automations. Seat analogy only.

### Change (when Story §7 is promoted)

| Stood up | Why it is wrong for sequence⊃campaign | What the model needs |
|----------|----------------------------------------|----------------------|
| `sequence_template.sequence_class` CHECK `optin_launch` \| **`launch_day`** \| `reengagement` \| `reactivation` | `launch_day` is a **campaign** (objective template), not a sequence class. `optin_launch` is the window calendar stuffed as the whole opt-in sequence | **Three** sequence classes matching C1 / `seq_phase_order`. `launch_day` and launch-window are campaign/objective templates **inside** opt-in |
| `firm_sequence_binding` UNIQUE `(firm_id, sequence_class)` | One template per class per firm. Face: empty world; many named sequences; two campaigns in **one** sequence | Bind **sequence** (instance or template id), not class. Many sequences per firm. “Default opt-in for this firm” is a different flag, not UNIQUE on class |
| `sequence_template.cells` as the runtime spine (`templateWalk` cell cursor; ladder **within** a cell) | Cells are a 7a day calendar mixing mediums. Face: campaigns on the canvas; channels hang off Override this; content inside the channel | Cells cannot remain “the sequence.” Campaigns are children of the sequence. Channel content / 7a offsets sit **on the campaign** (or its channels), not as the sequence’s only jsonb |
| Enroll / `workflowWalk` `WHERE sequence_class=$2` (incl. sibling `optin_launch` vs `launch_day`) | Two classes = two enrolls = two sequences | Enroll into a **sequence**; cursor is **campaign**, then 7b inside that campaign; qualify → next campaign |
| Objective / qualify | No campaign row. Completions exist as other tables. `finishing_event` map-only (Engine 2 arm-next **between classes**) | Objective **on the campaign**: kind + name + pointer at an existing completion (`messaging_events` click, `meeting_booked`, `fact_writebacks`). Qualify = campaign A met → campaign B **in the same sequence**. Distinct from Engine-2 motion between sequence classes |
| `SequenceClass` in `machineTypes.ts` | Four tokens including `launch_day` | Follows the CHECK. Types change with the CHECK — not before Story |

**Qualify vs class-escalation (do not collapse):** C3 qualify is **between campaigns inside one sequence**. 15:43 other-agent · other-workflow · or end is still **after the sequence / class** (or after the campaign that *is* the class completion — for opt-in, launch day’s sign-up). Engine 2 stays between classes. Do not put `workflow_trigger` on the canvas to implement qualify.

### Do not change for *this* grain (still moving on the face)

Call / ElevenLabs. Attempt-cycle columns (count, wait after last node, nth-sequence). CSS Override-per-family booleans. C2 Additional. Word “event.” Failure-*does*. Waitlist → who gets launch day.

---

## Inflections (ask; do not fill)

1. **Call vs Form.** Keep Form on the machine until Story, or is Call a Story must now? (Face-only is already named.)
2. Waitlist → launch day: only waitlisted, or the whole book? (Open since 17:05; now: qualify from campaign A → campaign B.)
3. **Attempt-cycle params** vs today’s channel windows. C6 draws both families; only windows are rows.
4. 7a day-calendar vs 7b channel wires once campaigns exist — finish or park on the face; do not collapse in Settings.
5. Automations still later. Triggers stay off this canvas.

**Process (founder 22:41):** finish what is still moving on the face **before** SA mints or rewrites cascade. This grain lock is **determined** — housing is named so PM does not re-flatten `launch_day` into `sequence_class`. SA is witness + conflict-namer until Story promotion.
