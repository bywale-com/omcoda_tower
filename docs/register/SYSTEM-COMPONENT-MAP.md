# Tower — System ↔ Component map (systems-analyst, binding + priors triage)

**Seat:** Systems analyst.
**Job:** make the system story **component-referencing** — bind each system to Register components both ways — and triage the 111 Priors as *extensions* of their owning systems. This is the pass that unlocks CTO component wiring (lookup, not reverse-inference).
**Inputs:** [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) · [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md) · [`OUTCOMES.md`](./OUTCOMES.md) · [`how/00-INDEX.md`](./how/00-INDEX.md) · [`../sme/implementation/00-SURFACE-VOCAB.md`](../sme/implementation/00-SURFACE-VOCAB.md) · `src/app/register/trace/surfaceCatalog.ts` · [`priors/`](./priors/00-INDEX.md).
**Grain:** Register **Module** (surfaceCatalog `module`) + load-bearing **surfaces** + Prior **controls**. Holon ids join via `codeRefs` on each Prior; this doc does not re-list every holon leaf.
**Status:** Binding + priors triage. Items 1–3 from the post-map worklist are **parked below** (documented, not resolved).

Systems numbered per `SYSTEMS-STORY.md`: 1 Acquisition · 2 Provision/forward-deploy · 3 Commercial/hard-input · 4 Tenancy & access · 5 Reachability/audit · 6 Consent/suppression · 7 Engagement/sequencing · 8 Fact-refresh · 9 Reference-currency · 10 Eligibility re-eval · 11 Engine 2 · 12 Meeting/loop-closer.

---

## Parked (skipped this pass — do not fake-fill)

### P1 — Gap: Consultant halt vs live motion
**Source:** Outcome↔System map Gap #2 (Consultant · Governance).
**What is parked:** the *behavior* a consultant halt must force on an in-flight motion — interaction with Engine 2's "one client, one motion" and the attempt engine's live-override. The halt *controls* are triaged below as **Parked-Gap** (`board-lift-halt`, `board-resume-outreach`, `board-resume-book`, `board-halt-modal-dismiss`).
**Why skipped:** resolving it is a Seed/World/systems-story write, not a binding write. Binding records the gap; it does not invent the gate.
**Unblock when:** founder/systems-analyst writes the halt rule into `SYSTEMS-STORY` (and flips Gap #2 → Constrained).

### P2 — Watch-item: tenancy "unhealthy" threshold
**Source:** Free outcomes #12 Oversight · #20 Firm health (`Unhealthy firm count`, firm-health selects).
**What is parked:** whether "catch a failing tenancy before the Consultant loses meetings" becomes a must-be-specific trigger (→ Constrained system/rule) or stays Free/builder-sufficient.
**Why skipped:** product decision, not a component map. Surfaces stay bound as **observability / Free**.
**Unblock when:** founder decides constrain vs leave Free; if constrain, mint the threshold into the story and re-tag.

### P3 — Inside-system silences (Known Unknowns)
Parked as KUs — named, not closed:
| KU | Owner system | Note |
|---|---|---|
| Escrow-release trigger | 3 Commercial | `Seed §7, §13.1` — release-terms event unspecified |
| Consent-regime specifics (CASL/SMS, first agent text) | 6 Consent | `Seed §8.2, §13.14` — conditions not closed |
| Contact-entry mutation via import | 5 Reachability | Import does not fully mutate living list (`Seed §5.1, §11`) |
| "Reactivation-worthy" criteria | 11 Engine 2 | Precedence names it; condition unspecified (`Seed §5.8`) |

These do **not** block the binding layer. CTO wires Owned systems; KUs stay fail-closed at their trigger.

---

## Binding principle

- A **component** here = a surfaceCatalog **Module** (and its load-bearing surfaces), joined to the How Module of the owning outcome.
- A system **owns** a component when the component is where that system's initiations are *authored, gated, observed, or recorded*.
- **Faceless systems** still bind — to the surfaces that *receive* their outputs (e.g. Reference-currency → Reference data module; Engine 2 → Engagement record / nudge consolidation), not to a fake click origin.
- **Sending infrastructure** is a capability module (not one of the 12 application systems); it attaches under Engagement(7) send path as substrate, noted where relevant.
- Orphan **controls** (Priors) are not inventing new systems — each Prior is an **extension** of an owning system, or Chrome / Parked.

---

## Forward — system → Register components

| # | system | Primary modules (surfaceCatalog) | Load-bearing surfaces (non-exhaustive) | How / outcome join |
|---|---|---|---|---|
| 1 | Acquisition | Acquisition & ads | Approach campaigns, Capture strip, Approach instrumentation, Kill / hold criteria | Operator · Acquisition |
| 2 | Provision / forward-deploy | Activation & forward-deploy · Prepared Workspace · Activation state | Forward-deploy, Hydrate, Staging status chips, Readiness walkthrough, Hard-input status, Progress | Operator · Activation · Activation state; Consultant prepared |
| 3 | Commercial / hard-input | Commercial · Prepared Workspace · Activation & forward-deploy | Authorize book, Accept terms, Escrow terms, Escrow status, Release control | Operator · Commercial; Consultant authorize/accept |
| 4 | Tenancy & access | Login · Provision | Email field, Send code, Verify, Resend code, New firm, Copy Login path / Send invite | Consultant · Access; Operator · Provision |
| 5 | Reachability / audit | Book readiness · Contacts · (Hub) Audits | Audit run, Verdict list, Sequence-ready glance, Imports, Confirm book for Tower | Operator · Book readiness; Consultant contacts/import |
| 6 | Consent / suppression | Client portal · Board (halt seats parked) | Opt-in message, Consent request, Agree, Silence / Opt out, STOP / Unsubscribe | Contact · Consent · Silence; halt Gap parked |
| 7 | Engagement / sequencing | Board (Engagement record) · Configuration libraries · Firm operations bind · Client portal | Engagement record, Agent / sequence editor, Automation workflows, Armed / Active, Nudge message, Channel thread | Consultant Activity; Operator config/bind; Contact nudge |
| 8 | Fact-refresh | Client portal · Board (Client Brief / Client Data) | Nudge form, Self-reportable fields, Update facts, Loop-closer form, Client Brief | Contact · Refresh; Consultant brief/data |
| 9 | Reference-currency | Reference data | Reference tables, Import criteria, Publish version, Dual-check glance | Operator · Reference data |
| 10 | Eligibility re-eval | Configuration libraries · Firm operations bind · Board (Client Data / reasoning) | Evaluation packs, Evaluation pack editor, Bind packs, Show reasoning / Analysis | Operator config/bind; Consultant analysis read |
| 11 | Engine 2 | Board (Engagement record) · Client portal (consolidated form) | Phase signal, Engagement record, Nudge form (one consolidated), Outstanding | Same ring as 7/8 — motion decision surface |
| 12 | Meeting / loop-closer | Meetings · Client portal · Board (Live brief) | Live brief, Meeting invitation, Booking, Confirm booking, Loop-closer form | Consultant Meetings; Contact · Book |

### Faceless-but-bound (no click origin; still component-referenced)

| system | Bound as | Not bound as |
|---|---|---|
| 9 Reference-currency | Operator Reference data (version publish / ingest) | A consultant click that "moves IRCC" |
| 11 Engine 2 | Engagement record + consolidated nudge form + phase signal | A dedicated "Engine 2" module |
| 7b Attempt engine | Timeline / node inspector / channel thread | A separate attempt-engine page |

### Free / observability modules (no owning system — by design)

| Module | Outcome map tag | Binding note |
|---|---|---|
| Oversight | Free #12 | Fleet health / Unhealthy firm count — watch-item P2 |
| Firm health | Free #20 | Same watch-item P2 |
| Audit trail | Free #13 | Change-accountability; no system constraint |
| Register & evolution | Free #14 | House tooling |
| Founder & agency controls | Free #15 | Orphan controls; reconcile with Gap #2 if kill-switch hits live motion |
| Customer support | Free #22 | Aggregation over owned systems' context |

---

## Reverse — Register module → system(s)

| Desk | Module | system(s) | tag |
|---|---|---|---|
| consultant | Login | 4 | Owned |
| consultant | Board | 5, 6*, 7, 8, 10, 11, 12 | Owned (*halt seats → Parked-Gap) |
| consultant | Contacts | 5 | Owned |
| consultant | Meetings | 12, 10 | Owned |
| consultant | Prepared Workspace | 2, 3 | Owned |
| contact | Client portal | 6, 7, 8, 11, 12 | Owned |
| operator | Acquisition & ads | 1 | Owned |
| operator | Activation & forward-deploy | 2, 3 | Owned |
| operator | Reference data | 9 | Owned |
| operator | Configuration libraries | 7, 10 | Owned (authorship) |
| operator | Sending infrastructure | 7 (substrate) | Capability attach — not a 12th system |
| operator | Oversight | — | Free / P2 |
| operator | Audit trail | — | Free |
| operator | Register & evolution | — | Free |
| operator | Founder & agency controls | — | Free / orphan controls |
| operator | Customer support | — | Free |
| operator | Provision | 4 | Owned |
| operator | Commercial | 3 | Owned |
| operator | Firm operations bind | 7, 10 | Owned |
| operator | Book readiness | 5 | Owned |
| operator | Firm health | — | Free / P2 |
| operator | Activation state | 2, 3 | Owned |

**Lookup rule for CTO:** pick the component → read system(s) → open that system's initiations in `SYSTEMS-STORY` → wire those triggers/inputs/outputs. Do not reverse-infer systems from UI.

---

## Priors triage — 111 controls under owning systems

**Method:** each Prior is an interactive CT control with no lattice statement ([`priors/00-INDEX.md`](./priors/00-INDEX.md)). Correct-bias = read it as an *extension* of a system (or mark Chrome / Parked), not as a new system.
**Tags:**
- **Extension** — runtime/desk control that extends an Owned system
- **Authorship** — operator editor chrome that authors packs/templates for systems 7/10
- **Parked-Gap** — rides Gap #2 (halt); do not wire as if the gate were specified
- **Parked-Free** — rides a Free outcome / watch-item
- **Chrome** — CT/shell/layout/demo; no system constraint

### Totals

| Tag | Count |
|---|---|
| Extension | 34 |
| Authorship | 45 |
| Parked-Gap | 4 |
| Parked-Free | 3 |
| Chrome | 25 |
| **Total** | **111** |

### By owning system (Prior may list multiple; counted per mention)

| System | Prior mentions (Extension+Authorship+Parked-Gap) |
|---|---|
| 7 Engagement | heaviest — timeline, agents, automations |
| 10 Eligibility | evaluation packs + automations co-own |
| 5 Reachability | audits + contacts/import |
| 6 Consent | portal silence + halt cluster (parked) |
| 11 Engine 2 | reasoning / escalation / halt cluster |
| 8 Fact-refresh | tasks, client data, portal |
| 12 Meeting | brief / meetings / portal book |
| 2·3 Provision/Commercial | prepared + activation |
| 4 Tenancy | login / account |
| 1 Acquisition | kill/hold apply |
| 9 Reference | CRS scrub adjacency |

### Full triage table
| id | title | zone | system(s) | tag | note |
|---|---|---|---|---|---|
| `board-halt-modal-dismiss` | Halt outreach dismiss (backdrop / Cancel) | consultant | 6,7,11 | Parked-Gap | Halt modal chrome; rides Gap #2 |
| `board-lift-halt` | Lift halt | consultant | 6,7,11 | Parked-Gap | Primary halt control — Gap #2 behavior unstated |
| `board-resume-book` | Resume book | consultant | 3,6 | Parked-Gap | Firm-book halt/resume; halt interaction with live motion is Gap #2 |
| `board-resume-outreach` | Resume outreach | consultant | 6,7,11 | Parked-Gap | Contact halt lift; same Gap #2 vs Engine 2 / attempt engine |
| `op-firm-health-firm-select` | Firm scope select | operator-house | — | Parked-Free | Firm health Free #20 watch-item |
| `op-gap-edit` | Edit gap / Edit | operator-house | — | Parked-Free | Register & evolution Free #14 |
| `op-review-confirmation` | Review confirmation | operator-house | — | Parked-Free | Founder kill-switch Free #15 |
| `ac-client-data-history` | Client Data → History tab | consultant | 10 | Extension | History / deltas |
| `ac-client-data-information` | Client Data → Information tab | consultant | 8,10 | Extension | Facts / eligibility read |
| `ac-crs-history-scrub` | CRS History scrubber | consultant | 10,9 | Extension | CRS history vs reference |
| `ac-gantt-segment` | Timeline segment / marker click | consultant | 7 | Extension | Attempt/channel timeline segment |
| `ac-inspector-close` | Close node inspector | consultant | 7 | Extension | Engagement node inspector |
| `ac-inspector-prev-next` | Node inspector Prev / Next | consultant | 7 | Extension | Engagement node inspector |
| `ac-inspector-tabs` | Node inspector Overview / Metadata tabs | consultant | 7 | Extension | Engagement node inspector |
| `ac-reveal-thought` | Reveal escalation thought | consultant | 7,11 | Extension | Escalation thought under engagement/Engine 2 |
| `ac-scroll-today` | Scroll to today / Today | consultant | 7 | Extension | Engagement timeline |
| `ac-show-reasoning` | Show / Hide reasoning | consultant | 10,11 | Extension | Evaluation / Engine 2 reasoning reveal |
| `ac-zoom-in` | Zoom in (day axis) | consultant | 7 | Extension | Engagement timeline |
| `ac-zoom-out` | Zoom out (day axis) | consultant | 7 | Extension | Engagement timeline |
| `au-export-download-records` | Export / Download records CSV | operator-libraries | 5 | Extension | Book readiness / audit run records (system 5) |
| `au-inspect-record` | Inspect record | operator-libraries | 5 | Extension | Book readiness / audit run records (system 5) |
| `au-select-record-row` | Select / highlight record row | operator-libraries | 5 | Extension | Book readiness / audit run records (system 5) |
| `au-sort-records` | Sort records | operator-libraries | 5 | Extension | Book readiness / audit run records (system 5) |
| `board-more-account` | More views → Account | consultant | 4 | Extension | Account/session adjacency to tenancy |
| `board-row-actions-menu` | Client actions ⋯ | consultant | 7,11 | Extension | Menu hosting halt/resume/view-in-activity — engagement motion seats |
| `board-task-row` | Task row open | consultant | 8 | Extension | Document-dependent / work-item tasks from fact-refresh |
| `board-task-status` | Task status toggle | consultant | 8 | Extension | Task completion write-back |
| `board-view-as-client` | View as Client | consultant | 7,8,10,12 | Extension | Client workspace read of engagement/facts/meeting context |
| `board-view-in-activity` | View in Activity | consultant | 7 | Extension | Opens engagement record (system 7 output surface) |
| `brief-open-client-data` | Open Client Data in new tab | consultant | 10,8,12 | Extension | Brief → client data |
| `contact-portal-surface-nav` | Client portal surface nav (10 touchpoints) | contact-and-ct-chrome | 6,8,12 | Extension | Portal nav across consent/refresh/book |
| `contact-silence-modal-dismiss` | Silence confirm Cancel / backdrop | contact-and-ct-chrome | 6 | Extension | Silence confirm dismiss |
| `contacts-add-contact` | Add contact | consultant | 5 | Extension | Contact entry into book (partial trigger per story Silence) |
| `contacts-add-import` | Add import | consultant | 5 | Extension | Import into book → reachability |
| `contacts-search` | Search contacts | consultant | 5 | Extension | Book search ahead of reachability work |
| `login-change-email` | Change email | consultant | 4 | Extension | Tenancy OTP flow |
| `meetings-brief-close` | Close / toggle Live brief | consultant | 12,10 | Extension | Live brief surface |
| `meetings-empty-demo` | Empty state / Show booked | consultant | 12 | Extension | Meetings empty/demo around loop-closer |
| `op-activation-firm-row` | Firms in activation row select | operator-house | 2,3 | Extension | Activation state progress |
| `op-kill-apply` | Apply | operator-house | 1 | Extension | Acquisition kill/hold criteria — Approach gate |
| `prepared-modal-close` | Close Authorize / Accept modal | consultant | 2,3 | Extension | Prepared workspace / hard-input modal chrome |
| `ag-add-contacts` | Add contacts | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-collapse-step` | Collapse / expand step | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-compose-tabs` | Email Assisted / Prompt / Template tabs | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-preview-desktop` | Desktop preview | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-preview-mobile` | Mobile preview | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-preview-options` | Preview options | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-preview-refresh` | Refresh preview | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-email-thread-type` | Email thread type (New / Reply) | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-empty-ai-assisted` | AI-assisted agent (empty state) | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-empty-select-template` | Select a template (empty state) | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-launch-agent` | Launch agent | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-linked-automations` | Linked automations peek | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-more-actions` | More actions menu | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-more-step-actions` | More step actions | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-reorder-step` | Move step up / down | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-save-changes` | Save changes | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-tab-activity` | Activity tab (agent-local) | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-tab-contacts` | Contacts tab | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-tab-report` | Report tab | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-task-priority` | Task priority select | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `ag-task-skip-after` | Skip after days checkbox + days | operator-libraries | 7 | Authorship | Engagement template / agent editor — authors sequencing (system 7) |
| `auto-ant-palette-collapse` | Build palette section collapse | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-attach-branch-handle` | Branch handle true / false | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-attach-close` | Close attach / insert menu | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-attach-pick-block` | Attach / insert menu · pick block | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-build-toggle` | Show / hide Build panel | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-canvas-controls` | Canvas zoom / fit controls | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-class-filter-done` | Done (class filter) | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-compare-close` | Close compare | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-config-close` | Close node config | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-config-run` | Run node | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-config-view-code` | View code / Hide code | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-edge-insert` | Insert step on edge | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-enrollment-filter` | Edit class filter | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-launch` | Launch workflow / Stop run | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-node-manual-run` | Run / Stop manual trigger (node) | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-rename` | Rename automation | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-save` | Save | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-share` | Share workflow | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-tab-enrollment` | Enrollment tab | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-tab-runs` | Runs tab | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-tab-settings` | Settings tab | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-toolbar-attach` | Add connected step | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-toolbar-delete` | Delete node | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `auto-toolbar-duplicate` | Duplicate node | operator-libraries | 7,10 | Authorship | Automations editor — authors engagement/eligibility packs (systems 7/10) |
| `ac-pane-resize` | Pane resize (list ↔ timeline) | consultant | — | Chrome | Layout |
| `board-clients-collapse` | Clients section expand / collapse | consultant | — | Chrome | List chrome |
| `board-console-toggle` | Console | consultant | — | Chrome | Register CT console |
| `board-holon-inspect` | Inspect holons (logo) | consultant | — | Chrome | Register CT inspect |
| `board-list-workspace-resize` | Pane resize (Board/Contacts list ↔ workspace) | consultant | — | Chrome | Layout |
| `board-more-clients` | More views → Clients | consultant | — | Chrome | Nav chrome |
| `board-more-settings` | More views → Settings | consultant | — | Chrome | Settings shell |
| `board-more-views` | More views menu | consultant | — | Chrome | Nav chrome |
| `board-tasks-collapse` | Tasks section expand / collapse | consultant | — | Chrome | List chrome |
| `contact-ant-walk` | Walk: consent → booking → silence / Next walk step | contact-and-ct-chrome | — | Chrome | CT walk chrome |
| `contact-demo-cem-channel` | Demo · EMAIL / Demo · SMS | contact-and-ct-chrome | — | Chrome | CT demo flipper |
| `contact-demo-clear-outstanding` | Demo · clear outstanding | contact-and-ct-chrome | — | Chrome | CT demo flipper |
| `contact-link-state-flipper` | Link state · Valid / Expired / Already used / Wrong purpose | contact-and-ct-chrome | — | Chrome | CT demo flipper |
| `contacts-sort-contacts` | Sort contacts | consultant | — | Chrome | List chrome |
| `contacts-sort-imports` | Sort imports | consultant | — | Chrome | List chrome |
| `ct-ant-source-plant-link` | Source plant link | contact-and-ct-chrome | — | Chrome | Register CT |
| `ct-desk-tabs` | Consultant / Operator / Contact desk tabs | contact-and-ct-chrome | — | Chrome | Register CT |
| `ct-ds-toggle` | DS-I \ | contact-and-ct-chrome | — | Chrome | Register CT |
| `ct-journey-prev-next` | Journey Prev / Next / Play | contact-and-ct-chrome | — | Chrome | Register CT flows |
| `ct-show-hide-columns` | Show register / Show theory / Hide CT (+ restore dock) | contact-and-ct-chrome | — | Chrome | Register CT |
| `ct-theme-switch` | Light / Dark theme switch | contact-and-ct-chrome | — | Chrome | Register CT |
| `meetings-list-detail-resize` | Pane resize (Meetings list ↔ detail) | consultant | — | Chrome | Layout |
| `op-hifi-empty-fallback` | HiFi empty module shell | operator-house | — | Chrome | Empty shell |
| `op-modal-close` | Modal/drawer Close · Cancel · Back · mask/X dismiss | operator-house | — | Chrome | Modal chrome |
| `op-section-house-tenancy-support` | House-global / Per-tenancy / Support section headers | operator-house | — | Chrome | Operator nav chrome |

---

## What this unlocks (hand-off to CTO)

1. **Component wiring is lookup.** Module → system(s) → `SYSTEMS-STORY` initiations. No reverse-inference from screenshots.
2. **Engagement runtime first.** System 7 (+ 11, 8, 12 ring) owns the densest Prior/Authorship mass — matches the original under-built complaint.
3. **Do not wire Parked-Gap as if specified.** Halt controls exist in CT; the gate/precedence behavior is still P1.
4. **Free modules stay Free.** Oversight / Firm health / Audit trail / Evolution / Founder / Support — builder-sufficient unless P2 flips.
5. **Next after this doc:** CTO wires Owned-but-unbuilt systems against this map; systems-analyst may later resolve P1–P3 and optionally add `SYSTEMS-ANALYST.md` method doc / post-SME refine pass.

---

## Related

- Story: [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md)
- Module-grain scan: [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md)
- Pass forks: [`PASS-FORK-MAP.md`](./PASS-FORK-MAP.md)
- Priors inventory: [`priors/00-INDEX.md`](./priors/00-INDEX.md)
- Surface vocab: [`../sme/implementation/00-SURFACE-VOCAB.md`](../sme/implementation/00-SURFACE-VOCAB.md)
