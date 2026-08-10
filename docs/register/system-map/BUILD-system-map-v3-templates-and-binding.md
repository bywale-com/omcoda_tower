# BUILD INSTRUCTION v3 — Templated sequences, per-firm binding, corpus close, controls↔tables reconciliation

**To the PM.** Companion to `SYSTEMS-REQUIREMENTS-FILLED.md` and the `/system-map` v2 build
(`src/app/system-map/*`, `MODULARITY-REPORT.md`). This closes a corpus gap, adds the templated/instance
model, and defines the controls↔tables reconciliation. All decisions below are **resolved** — build them,
don't re-open them.

---

## A. Corpus gap (why this exists)

`guidelines/Reactivation.md`, `guidelines/Activity.md`, `guidelines/Guidelines.md` were **never in the
corpus source set.** They are canonical campaign law. The map is complete against Seed + World +
Operator-Revisions but **blind to `guidelines/`.** Add `guidelines/` to the corpus source set permanently,
then re-run the resolution + modularity audits against it.

---

## B. The three sequence classes are TEMPLATES; each firm holds an INSTANCE

There are three sequence classes: **opt-in (launch)**, **re-engagement (nudge)**, **reactivation.**
The current model fuses *template* and *instance* into single global sequence tables
(`seq.reactivation_calendar`, `seq.channel_ownership_order`, etc.) — one definition, no per-firm variation.
Split into three layers:

1. **`sequence_template`** — the *shape* of a sequence, per class, with **reorderable content** and
   **content cells as template variables** (`{firm_name}`, `{firm_logo}`, `{tower_logo}`, copy slots).
   A class may have **multiple named variants** (e.g. reactivation-v1, reactivation-v2). This is where
   "reorder within a sequence" lives (level-1 variation).
2. **`firm_sequence_binding`** — **the missing table.** Rows of
   `{firm_id, sequence_class, template_id, per_firm_overrides}`. This assigns *which shape of each class*
   a given firm runs, plus optional per-firm overrides. This is where "assign a specific shape/instance
   to a specific firm" lives (level-2 variation).
3. **Resolved instance** — what the runtime actually runs = `sequence_template` resolved through the
   firm's `firm_sequence_binding` (template + overrides + variable bindings). The runtime stays dumb: it
   reads the binding, resolves the template, runs it.

**Result:** both operations you want become table edits, no forking:
- Reorder content within a sequence → edit the `sequence_template` (or a firm's override).
- Give firm A a different reactivation than firm B → edit a row in `firm_sequence_binding`.

**"Templated" is now first-class:** a sequence/rule/state table can be *concrete* (fixed cells) or
*templated* (cells are variables bound at instantiation). One definition, many instances. This is the
same primitive as per-vertical industry packs (Operator-Revisions §1), applied at per-firm scope.

---

## C. Resolved decisions (build exactly these — do not re-open)

**Launch/opt-in sequence → machine, templated, IN THE MAP.** Create `seq.optin_launch_calendar`
(Day1 text-primer → Day1 announcement email → Day2 social-follow → Day3 waitlist → Days4–7 nurture:
2 emails + 1 text) and `seq.launch_day_sequence` (sign-up email → landing page → confirmation email;
three jobs: set expectations / establish consequences / plant reactivation seed). Content cells are
**per-firm template variables** bound at instantiation, not literals. The only human act is producing/
approving the firm's brand assets to bind — a founder input feeding a slot, not a machine step.

**Reactivation sequence → core product, IN THE MAP.** Create `seq.reactivation_calendar`
(Day0 text-primer → Day0 email [+ client eligibility view link] → Days1–3 nurture (2 emails) →
Day3 slot-opens: email+SMS). Mark **named-silent on repeat-compression** (does the 3-day nurture
compress on repeat activations — undecided; carry the question, do not invent an answer).

**No-login client eligibility view → DEFERRED, pending existence check.** Do **not** create
`state.no_login_client_view` yet. First check whether Tower already has this surface (a client-facing
read-only eligibility view). If it exists, note it for later wiring. If it does not, leave it as a
deferred create. Either way, not built in this pass. (In `seq.reactivation_calendar`, reference the view
link as a slot without asserting its backing table yet.)

**SMS non-reply escalation → proceed to email; no follow-up text.** The SMS primer's Y-reply is a
*priming/tier signal*, not a gate — the email is coming regardless. Add a row to `rule.attempt_criteria`:
`SMS-primer non-reply → proceed to email as scheduled, record non-reply as low tier-signal`. No second
text on non-reply (protects pool reputation).

**Cohort scoring/segmentation → core product, NEW tables.** Create `state.cohort_tier` (per-contact tier)
and `rule.cohort_scoring` (rows: engagement event → tier contribution; "open+click > open only > no open";
"Y-reply + view-click + nurture-open + booking = top tier"). Distinct from `engagement_record` (a
chronology); scoring is a *derivation* over it.

**Metric thresholds → core product, NEW rule table.** Create `rule.metrics_thresholds` (rows: metric +
threshold → flag): announcement open <30% = deliverability/relationship flag; email open <35% = cooled;
unsubscribe spike = tone/frequency flag; plus the reactivation-metric thresholds. These *flag* when
crossed (machine observability), not a dashboard to eyeball.

**Waitlist → value in `state.consent_state`, not a new table.** Extend consent to
`{unsequenced | waitlisted | sequenced | silenced}`. The waitlist rung is machine-tracked (part of the
opt-in launch sequence), but it's a state value, not its own table.

---

## D. The controls↔tables reconciliation (run this on the component pass — stated now so it's not lost)

When the component/extrusion pass runs, it must reconcile the **two control kinds** against the table
inventory. This is the check that catches the exact face-vs-machine mismatch that caused the original
bottleneck.

Recall: two control kinds — **system controls** (change a system-state node) and **app controls**
(local/presentational, change no system node). Reconcile in **both directions**:

1. **Table → face:** every table (state/rule/sequence) either has a face (a control changes it, a pane
   displays it) or is **faceless-by-design** (runs headless). A table with no face *and* no
   faceless-origin is a bug. *(This direction already partly covered by the coverage check.)*
2. **Face → table (the new, critical direction):** every **system control** that exists in the UI must
   land on a table (the node/state it changes). **A system control with no backing table means the
   table is MISSING** — the UI modeled a system change with no machine layer to receive it. Flag these
   `control-without-table` — each one is a table that needs to exist. (App controls are exempt — they
   change no system state, so they owe no table.)

So the component pass produces two gap lists:
- `control-without-table` → **missing tables** the UI already implies (create them).
- `table-without-face` → either intentionally faceless, or a missing face (later).

Do **not** build components in this pass. Just state that the reconciliation is a required output of the
component pass, so system controls already drawn in the UI (e.g. per-firm sequence shaping in
Agents/Automations) surface any tables the machine still lacks.

---

## E. Definition of done

1. `guidelines/` added to corpus source set; resolution + modularity audits re-run against it.
2. Template/instance split built: `sequence_template` (with variants + template variables) +
   `firm_sequence_binding` (firm → template per class + overrides) + dumb runtime resolves instance.
3. All Section C tables created (or deferred exactly as stated): opt-in launch, launch day, reactivation
   calendar (named-silent on repeat-compression), cohort_tier, cohort_scoring, metrics_thresholds,
   attempt_criteria SMS-non-reply row, consent `waitlisted` value. No-login view **deferred pending
   existence check**.
4. Every new/changed table classified (state | rule | sequence), templated-or-concrete marked,
   relationships declared (reads/writes/triggers), and run through the modularity law (modular → editable
   table; non-modular → stated structural reason; else `frozen-should-be-table`).
5. Controls↔tables reconciliation (Section D) declared as a required output of the component pass, with
   both gap lists (`control-without-table`, `table-without-face`) specified.
6. Report: updated table counts, the new binding model, the resolution against `guidelines/`, and the
   named-silent + deferred items.
