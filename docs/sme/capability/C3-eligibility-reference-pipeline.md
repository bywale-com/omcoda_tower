# Pass2+implementation — C3 Eligibility evaluation + reference-data currency pipeline

| Field | Value |
|---|---|
| **Seat** | C3 — Eligibility evaluation + reference-data currency |
| **Axis** | Capability (how to keep criteria current and re-score) — not compliance ownership |
| **Domain lane** | Ingestion + versioning + re-evaluation pipeline for auditability |
| **Who** | Rules-engine engineer + immigration domain SME (seats 1–2) working together |
| **Residual** | The ingestion + versioning pipeline is a capability the domain SME cannot build and a generalist would not design for auditability |
| **Focus** | Keep versioned immigration criteria current and re-score as law/data moves — pipeline machinery only |
| **Extends** | Seat 2 [`pass2/02-ircc-reference-data.md`](../pass2/02-ircc-reference-data.md) (what tables / sources / cadences) and seat 1 eligibility consumption — **does not redo** pathway interpretation or V1 table inventory |
| **Revealed** | Reference-table ingestion **new**; Rule-version diff + who re-scores **partial**; Re-evaluation trigger on write-back **partial**; Freshness/volatility flags + recheck cadence **new** (serves HANDOFF freshness gates + ref-23 funds URL re-resolve when asserted) |
| **Plugs** | Operator **Reference data**; **Evaluation packs**; Client Data write-back → **Board**; **Book readiness** |
| **Item count** | 22 (`pipe-01`…`pipe-22`) |
| **Boundaries** | Not pathway pass/fail language (seat 1). Not Canada table inventory / authoritative page set (seat 2). Not UI chrome. Not Register absorb — **paper only, not Register-integrated**. |
| **Vocab** | [`implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md) |
| **Handoff default** | both (PM: surfaces/signals; CTO: jobs, stores, audit) |
| **Status** | Paper only — `implementationPlant: not_done` on every item |
| **As of** | 2026-07-31 |

---

### pipe-01
**Question:** What end-to-end stages must the reference-table ingestion pipeline expose so house upkeep can move IRCC/public criteria from detection to published data without a code deploy?
**References:**
- Express Entry: Rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- How `operator-reference-data.md` (edit/import → Publish version)
- Seed §5.7 Directive 3 — versioned tables; no code deploy to update
**Thesis gap:** Seat 2 named Import criteria + Publish version shells; without staged pipeline states, “ingestion” collapses into ad-hoc CSV paste with no audit spine.
**Solution:** `Run a fixed pipeline — detect change → fetch canonical source → parse to schema → validate → hold as draft → dual-check → Publish version → enqueue consumers — so that every published row is traceable to a stage outcome and failed stages never become current.`
**Handoff:** cto
**Revealed:** new (ingestion)
**implementationProblem:**
Reference data module exists as a shell; operators have no staged path from Canada.ca change to published-current, so currency work becomes engineering tickets or unlogged edits.

**implementation:**
On Reference data, open an ingestion-run row; the run detail shows a stage rail Detect → Fetch → Parse → Validate → Draft → Dual-check → Publish version.
On Import criteria, the stage rail has Advance stage / Fail stage controls and an immutable stage-log panel; failed stages stay Draft and never become published-current.

**implementationAdds:** ["ingestion-run", "detect", "fetch", "parse", "validate", "draft", "dual-check", "stage-log"]
**implementationPlant:** not_done

---

### pipe-02
**Question:** How should the pipeline bind canonical sources vs discovery alerts so scrapes never publish from secondary blogs?
**References:**
- Ministerial instructions — Express Entry rounds — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
- Express Entry: Category-based selection — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- Seat 2 ref-03 (canonical Canada.ca / MI; blogs = discovery only)
**Thesis gap:** Domain seat forbade blog truth; pipeline must enforce source class at fetch time or operators will “just import the alert URL.”
**Solution:** `Tag each table family’s source binding as canonical (Canada.ca / MI / ESDC NOC) or discovery-alert-only; allow fetch+parse only from canonical URLs, and route discovery hits into Detect without Publish rights — so that the pipeline cannot promote a secondary page to published-current.`
**Handoff:** both
**Revealed:** new (ingestion)
**implementationProblem:**
Without source-class enforcement in the pipeline, a same-day draw alert from a blog can be imported as if it were ministerial truth.

**implementation:**
On Import criteria, each Reference table row has canonical-source URL fields and Discovery-alert-only feed chips.
On Reference data Detect, a discovery alert row can open an ingestion run, but the Fetch stage still uses the canonical Canada.ca / MI URL before Dual-check / Publish version.

**implementationAdds:** ["canonical-source", "discovery-alert-only", "source-class"]
**implementationPlant:** not_done

---

### pipe-03
**Question:** What change-detection pattern should the pipeline use against Canada.ca pages that do not offer a vendor CDC feed?
**References:**
- Express Entry: Check your score (CRS tool) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html
- CRS criteria — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
- Industry practice: content-hash / ETag polling as a CDC substitute when sources are pull-only (document as ops pattern, not a statute)
**Thesis gap:** “Poll daily” (seat 2 SLA) needs a concrete detect mechanism; without hash/diff detect, house either over-fetches into noise or misses mid-day multi-draws.
**Solution:** `Detect via scheduled fetch of canonical pages plus content-hash (and ETag/Last-Modified when present); open an ingestion run only when the hash diverges or an on-alert path fires — so that Detect is change-driven, not a blind re-import every poll.`
**Handoff:** cto
**Revealed:** new (ingestion)
**implementationProblem:**
Scheduled polls without change-detect either spam Dual-check with identical drafts or miss same-business-day rounds between weekly reviews.

**implementation:**
On Reference data, view the Detect schedule table rows per table family (poll cadence, last-seen content-hash, ETag).
On Reference data, view diverged-hash rows that opened an ingestion run; click Open ingestion run on on-alert Detect rows; identical hashes do not create Draft versions.

**implementationAdds:** ["content-hash-detect", "ETag", "on-alert", "change-driven-run"]
**implementationPlant:** not_done

---

### pipe-04
**Question:** What schema-contract gate must Parse/Validate enforce before a draft may enter Dual-check?
**References:**
- Rounds of invitations table shape (round #, date, type, invitations, CRS floor) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Seat 2 ref-16 (schema validation + dual-human/checksum; failed imports stay draft)
- Rules-engine practice: separate data facts from policy rules (Open Policy Agent / Drools data vs rule packs as pattern refs — not product choice)
**Thesis gap:** Seat 2 required validation; capability residual is a machine-enforceable contract per table family so HTML shifts cannot reach Dual-check.
**Solution:** `Define a versioned schema contract per table family (required columns, types, cardinality bands, CRS-floor sanity, category NOC set non-empty); Validate fails closed into Draft-hold with house alert — so that freshness never outranks structural correctness.`
**Handoff:** cto
**Revealed:** new (ingestion)
**implementationProblem:**
Broken scrapes can ship empty category sets or swapped CRS columns if humans are the only gate after a green “import succeeded” toast.

**implementation:**
On Import criteria, each Reference table family row has a Schema contract version dropdown plus required-column, type, and sanity-band fields.
On Import criteria Validate, view the Validate status row Draft-hold chip and house-upkeep alert on contract failure; Dual-check / Publish version stay blocked until Validate passes.

**implementationAdds:** ["schema-contract", "draft-hold", "sanity-bands", "fail-closed-validate"]
**implementationPlant:** not_done

---

### pipe-05
**Question:** How must published versions stay immutable so audit and mid-flight pins remain meaningful?
**References:**
- Seat 2 ref-10 / ref-11 (provenance; draft → published-current; evaluation pins)
- Audit trail practices: append-only version lineage (content-addressed publish) — industry pattern for regulated scoring systems
**Thesis gap:** Editable “current” rows rewrite history under a consultant’s license; pins become lies.
**Solution:** `Treat Publish version as content-addressed and immutable; corrections ship only as a new version (or explicit rollback publish) that supersedes by id — so that every evaluation pin resolves to bytes that cannot be silently rewritten.`
**Handoff:** cto
**Revealed:** new (ingestion) / partial (versioning named in seat 2)
**implementationProblem:**
If operators can edit published rows in place, Analysis that cited a version no longer matches what the store returns under that id.

**implementation:**
On Publish version, the publish modal shows the content-hash snapshot and freezes it when the primary Publish version button is clicked; in-place edit of published-current is refused.
On Reference tables, click Open correction draft on a published row to create Draft → Dual-check → Publish version with supersedes-version-id; prior versions remain readable for pins and Audit trail.

**implementationAdds:** ["immutable-publish", "content-addressed", "supersedes-version-id", "no-in-place-edit"]
**implementationPlant:** not_done

---

### pipe-06
**Question:** What provenance must each ingestion run and published version write into Audit trail for liability and replay?
**References:**
- Seat 2 ref-10 (source URL, retrieved-at, importer, dual-check, effective-from, supersedes, content hash)
- World §1.1 reference-data upkeep; §2.2 law/public-reference change
- Operator **Audit trail** / **Change event** surfaces
**Thesis gap:** Domain listed provenance fields; pipeline must emit them as first-class Change events or house cannot prove what backed a score.
**Solution:** `On every stage transition and Publish version, append a Change event with source URL(s), retrieved-at, importer, dual-check attestation, effective-from, supersedes-version-id, content-hash, and ingestion-run id — so that any Evaluation pack result can be replayed to a government page and an actor.`
**Handoff:** both
**Revealed:** new (ingestion) / partial (provenance fields named)
**implementationProblem:**
Without pipeline-emitted Audit trail events, disputes collapse into “the system said so” with no retrieveable import lineage.

**implementation:**
On Publish version, the provenance checklist requires source URL, retrieved-at, importer, dual-check attestation, effective-from, supersedes-version-id, content-hash, and ingestion-run id before the Publish version button unlocks.
On Audit trail, filter Change event rows by Reference table, ingestion-run id, and actor; each row links the source URL and content-hash used.

**implementationAdds:** ["ingestion-run-id", "dual-check-attestation", "change-event-provenance"]
**implementationPlant:** not_done

---

### pipe-07
**Question:** Who may Dual-check and Publish, and how does the pipeline enforce separation of duties?
**References:**
- Seat 2 ref-16 / ref-25 (dual-human or human+checksum; house ops dual-check publish rights)
- Audit / maker-checker practice for production reference data (ops pattern)
**Thesis gap:** Single-actor import+publish is the silent wrong-cutoff class failure; capability must encode the gate, not a wiki policy.
**Solution:** `Require Dual-check attestation from an actor distinct from the importer (or importer + independent checksum job) before Publish version unlocks — so that one transcription error cannot become published-current alone.`
**Handoff:** both
**Revealed:** new (ingestion)
**implementationProblem:**
House SLA pressure on draw day encourages the same person to import and publish; policy without a hard gate fails.

**implementation:**
On Import criteria Dual-check, the Attest checkbox stays disabled when your actor id matches the importer unless a checksum job signature is present.
On Publish version, the Publish version button unlocks only after Dual-check passes; same-actor self-approve is refused except under a logged break-glass incident flag.

**implementationAdds:** ["dual-check-actor", "checksum-job", "break-glass-incident"]
**implementationPlant:** not_done

---

### pipe-08
**Question:** How should the pipeline quarantine partial or conflicting imports across table families that must publish together?
**References:**
- Category-based selection (category predicates + NOC tables) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- Seat 2 ref-05 / ref-24 (category membership + predicates versioned together)
**Thesis gap:** Publishing NOC membership without updated predicates (or the reverse) creates a coherent-looking but false “current” category definition.
**Solution:** `Support publish groups: when a table family declares a co-publish set (e.g. category membership + predicates), hold all members in Draft until each Validates; publish atomically under one publish-group id — so that packs never see a half-applied ministerial change.`
**Handoff:** cto
**Revealed:** new (ingestion)
**implementationProblem:**
Independent per-table publishes can interleave mid-flight evaluations across inconsistent category halves.

**implementation:**
On Reference tables, each co-dependent family row can be assigned to a Publish group with a group-id chip.
On Publish version, the group publish modal either publishes all members atomically or keeps every member Draft-hold. On Configuration libraries → Evaluation packs catalog, open Evaluation pack editor; the reference pin dropdown omits partial Draft-hold groups, so packs never pin a partial group.

**implementationAdds:** ["publish-group", "atomic-publish", "co-dependent-families"]
**implementationPlant:** not_done

---

### pipe-09
**Question:** What must a rule/reference-version diff contain so operators see *what changed* between two published versions?
**References:**
- CRS criteria (factor grids change over time; e.g. arranged-employment points removal noted on Canada.ca) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
- Seat 2 ref-11 / ref-12 (pins vs current; cutoff publish → re-score)
- OPA / Drools practice: decision diffs against data version changes (pattern ref)
**Thesis gap:** “New version published” without a structured diff forces humans to eyeball CSV; who-to-rescore stays guesswork (**partial** today).
**Solution:** `On Publish version success, compute a structured diff (added/removed/changed rows and fields, typed by table family: floor, membership, predicate, grid cell) stored beside the version — so that re-score planning reads machine diff, not tribal knowledge.`
**Handoff:** both
**Revealed:** partial → complete (rule-version diff)
**implementationProblem:**
Publish bumps a version id with no field-level change set, so house cannot tell a new round row from a TEER remap that invalidates half the book.

**implementation:**
On Publish version, click Version diff for the supersedes pair; the diff panel shows added / removed / changed rows typed by change class.
On Reference data, attach that Version diff to the Change event row for Oversight and Analysis → Evaluation provenance consumers.

**implementationAdds:** ["version-diff", "change-class", "added", "removed", "changed"]
**implementationPlant:** not_done

---

### pipe-10
**Question:** How does the pipeline map a Version diff to *who must re-score* (cohort selection)?
**References:**
- Seed Core bet: re-evaluate as IRCC-shaped rules move
- Seat 2 ref-12 (book re-eval on cutoff publish; deltas; no auto-outreach)
- How Firm operations bind — packs bound per firm
**Thesis gap:** Book-wide rescore on every publish is wasteful and noisy; under-scoped rescore leaves stale Analysis under a new published-current.
**Solution:** `Classify each diff change-class into impact scopes — round/cutoff → firms with draw/category outcome families bound; membership/predicate → firms asserting those category/NOC checks; grid/CLB/funds → firms whose packs read those table keys — and enqueue only contacts under bound Evaluation packs in those scopes — so that “what changed → who re-scores” is deterministic.`
**Handoff:** both
**Revealed:** partial (who re-scores)
**implementationProblem:**
Without impact scoping, every Publish version either hammers the whole fleet or skips firms that actually consume the changed table.

**implementation:**
On Publish version, open the Impact scope panel; it derives cohort rows from Version diff change-class and bound Evaluation pack versions. On Firm operations bind, click firm row in firm-bind index. On firm detail, click Bind packs. On Bind packs modal, choose Evaluation pack version from the published-only dropdown; choose Automation pack version from the published-only dropdown; choose Engagement template version from the published-only dropdown; click Bind. Those bound version chips become the re-score cohort inputs when they reference the affected table keys / outcome families.

**implementationAdds:** ["impact-scope", "change-class→cohort", "bound-pack-consumers"]
**implementationPlant:** not_done

---

### pipe-11
**Question:** Should armed-only vs Active firms, and pinned vs follow-current packs, enter the re-score cohort the same way?
**References:**
- Seat 2 ref-13 (follow published-current default; pins with expiry + reason)
- How Firm operations bind — Armed / Active
- Engine 2 give-back — signals recorded even when motion waits
**Thesis gap:** Re-scoring Active follow-current books is the product bet; blindly rewriting pinned or armed-only books without policy creates distrust or silent freeze.
**Solution:** `Always compute and store signals for Active firms on follow-current packs; for Armed-only, compute silently for readiness but do not enroll motion; for explicit pack pins inside expiry, compute a shadow adopt-current diff but do not flip the pin until expiry/incident policy says adopt — so that cohort rules respect bind state and pin law.`
**Handoff:** both
**Revealed:** partial (who re-scores)
**implementationProblem:**
One fan-out policy for all tenants either wakes armed-only noise or leaves pinned packs looking “current” when they are not.

**implementation:**
On Configuration libraries → Evaluation packs catalog, open Evaluation pack editor; set re-score cohort mode with the selector (Active-follow-current | Armed-only | Pinned-shadow); click Publish version. On Oversight and the same Evaluation pack editor, view Pin age and shadow-diff pending-adopt rows showing which firms are active, armed-only, or pinned-shadow.

**implementationAdds:** ["active-follow-current", "armed-signal-only", "pinned-shadow", "shadow-diff"]
**implementationPlant:** not_done

---

### pipe-12
**Question:** What job semantics link Publish version → re-evaluation so mid-flight firms get explainable deltas rather than silent rewrite?
**References:**
- Seat 2 ref-11 / ref-12 / ref-19 (pins retained on emitted Analysis; enqueue re-eval; rollback corrective deltas)
- Seed §5.7 / Engine 2 re-evaluation on fact and rule movement
**Thesis gap:** Named in seat 2; not built as a durable job with cause codes (**partial**).
**Solution:** `Enqueue a durable re-evaluation job per impact cohort with cause = reference-publish (or reference-correction on rollback), adopt-current per pack policy, and emit eligibility deltas against the prior pinned result — so that Board/Analysis updates are attributable to a publish id.`
**Handoff:** cto
**Revealed:** partial (rule-version → re-score)
**implementationProblem:**
Publish updates “current” while already-shown Analysis rewrites in place with no cause, destroying consultant trust.

**implementation:**
On Publish version, click Enqueue Re-evaluation; view job table rows keyed by publish id and impact-scope.
On Analysis → Evaluation provenance, view delta rows with was / now and cause reference-publish or reference-correction; prior Analysis snapshots keep their reference-version ids for Audit trail.

**implementationAdds:** ["re-evaluation-job", "cause:reference-publish", "cause:reference-correction", "was/now-delta"]
**implementationPlant:** not_done

---

### pipe-13
**Question:** What must the pipeline forbid after a reference-driven re-score so law-side detection cannot auto-fire outreach?
**References:**
- Engine 2 law — signal/action decoupling — [`immigration-rules-engine2-giveback.md`](../../product/immigration-rules-engine2-giveback.md)
- Seat 2 ref-12 (never auto-fire outreach solely because a number moved)
- Seat 1 elig-25 (stale reference suppresses draw/category reactivation)
**Thesis gap:** Capability jobs that “helpfully” enroll sequences on cutoff move violate engagement law and desk license risk.
**Solution:** `Constrain reference-driven re-score outputs to signals + Board Phase signal updates under Engine 2 precedence; enrollment/send remain owned by Firm operations bind runners and Send gates — so that criteria currency drives detection, not unbidden CEM motion.`
**Handoff:** both
**Revealed:** partial (re-score path)
**implementationProblem:**
A naive “rescore then reactivate” hook on Publish version creates false reactivation storms on every draw.

**implementation:**
On Analysis → Evaluation provenance, view reference-driven Re-evaluation job rows writing signals and Board Phase signal only.
On Firm operations bind firm detail → Send gates panel, view the enrollment readiness row reference-publish auto-enrollment refused deny chip; runners still apply Engine 2 precedence when a separate motion decision runs.

**implementationAdds:** ["signals-only-on-reference-publish", "no-auto-enrollment", "phase-signal-update"]
**implementationPlant:** not_done

---

### pipe-14
**Question:** How should Version diff interact with Evaluation pack editor authoring so pack structural rules and reference facts stay separated?
**References:**
- Seat 2 ref-14 / ref-15 / ref-26 (no evaluator literals; packs cite table keys)
- OPA/Drools pattern: policy compares inputs; data bundled/versioned separately
**Thesis gap:** Diffs that dump new numeric floors into pack editors invite authors to hardcode “temporary” literals again.
**Solution:** `Surface Version diff as reference-input changelog only; Evaluation pack editor may link assertions to table keys/version pins but cannot paste diff constants into rule bodies — review rejects numeric public-criteria literals — so that Directive 3 stays enforceable when data moves.`
**Handoff:** both
**Revealed:** partial (diff tooling)
**implementationProblem:**
Authors treat a cutoff diff as copy-paste fodder for pack conditions, re-breaking currency.

**implementation:**
On Configuration libraries → Evaluation packs catalog, open Evaluation pack editor; open Reference changelog (Version diff) as a read-only table-key impact panel. In publish review, the checklist rejects rule bodies that embed numeric public-criteria literals present in Reference tables; click Publish version only after review passes.

**implementationAdds:** ["reference-changelog", "table-key-link-only", "reject-numeric-literals"]
**implementationPlant:** not_done

---

### pipe-15
**Question:** What trigger must fire when Client Data write-back lands so re-score is immediate and Board-visible?
**References:**
- Engine 2 give-back — any write-back (form submit or consultant entry) → immediate re-evaluation
- How `contact-book.md` / `contact-refresh.md` — write-back re-evaluates (machinery)
- Seat 1 / desk handoff — brief recompute on write-back
**Thesis gap:** Named in outcomes and Engine 2; **partial** — no durable trigger from Client Data → evaluator → Board.
**Solution:** `On Client Data write-back commit, emit a fact-change event that enqueues an immediate per-contact Re-evaluation job against bound Evaluation packs and current (or pinned) reference versions, then refresh Board Phase signal and Live brief — so that new answers change detection before the next human glance.`
**Handoff:** both
**Revealed:** partial (write-back re-eval)
**implementationProblem:**
Forms and consultant edits save facts while Analysis and Board stay stale until a batch job or page reload folklore.

**implementation:**
On Client Data, click Commit write-back; view fact-change event enqueue to Re-evaluation for that contact.
On Board, view the Client row Phase signal chip updated from cause fact-write-back; on Live brief, view the same re-score in meeting-grade views.

**implementationAdds:** ["fact-change-event", "cause:fact-write-back", "immediate-re-eval", "phase-signal-refresh"]
**implementationPlant:** not_done

---

### pipe-16
**Question:** How should the pipeline order and idempotently merge concurrent write-back re-scores with reference-publish re-scores?
**References:**
- Engine 2 — one client, one motion; signals recorded as found
- Seat 2 ref-11 (evaluation records exact reference-version ids)
- CDC / event-sourcing practice: idempotent consumers keyed by event id
**Thesis gap:** Draw-day publish + form submit can race; last-writer-wins without keys duplicates signals or drops one cause.
**Solution:** `Key Re-evaluation jobs by (contact id, trigger event id) with a merge window that runs once against the latest fact snapshot and the pack’s adopt-current/pin policy; persist both cause references on the result — so that concurrent law-side and fact-side triggers do not double-enroll or lose provenance.`
**Handoff:** cto
**Revealed:** partial (write-back + publish paths)
**implementationProblem:**
Two jobs rewriting Analysis for one contact produce duplicate Phase signals or a result that cites neither publish id nor write-back id.

**implementation:**
On Evaluation packs re-score job detail, view the job row coalescing Re-evaluation for the same contact within a short merge window with stored trigger event ids for both fact-write-back and reference-publish when both apply.
On Audit trail, view a single result Change event row listing all trigger causes and the reference-version ids used.

**implementationAdds:** ["job-idempotency-key", "merge-window", "multi-cause-result"]
**implementationPlant:** not_done

---

### pipe-17
**Question:** What Board / Phase signal contract must write-back re-score satisfy so consultants see next motion class without opening every Client Data pane?
**References:**
- Engine 2 precedence (reactivation vs nudge)
- Seat 1 elig-03 / elig-04 (service-eligible; reactivation-worthy vs nudge-only)
- Personas — Board as inhabit surface for phase / eligibility signals
**Thesis gap:** Re-score that only updates hidden evaluator JSON fails the “consultant does nothing” inhabit loop.
**Solution:** `Materialize re-score outcomes onto Board Phase signal with motion class (reactivation-worthy / nudge-only / none), confidence tier, and reference-version / pack-version pins — never IRCC-determination language — so that write-back → re-score → next motion is visible at list grade.`
**Handoff:** pm
**Revealed:** partial (Client Data → Board)
**implementationProblem:**
Signals die in Client Data detail; Board still shows pre-write-back posture and consultants miss meeting-grade changes.

**implementation:**
On Board Client row Phase signal, view the chip with motion class and service-eligible posture refreshed after write-back re-score.
On Board, open the Phase signal detail drawer to view pack + reference version pin ids for the signal without claiming an IRCC determination.

**implementationAdds:** ["motion-class-on-board", "pack-version-pin", "reference-version-pin", "not-IRCC-determination"]
**implementationPlant:** not_done

---

### pipe-18
**Question:** How must Book readiness constrain post-re-score motion so newly eligible-but-unreachable contacts do not enter sequences?
**References:**
- How `operator-book-readiness.md` — reachability verdicts gate sequence-ready
- HANDOFF crm-14 / casl-15 — enrollment inhibitors; Audit reachable
- Engine 2 — detection vs action separation
**Thesis gap:** Capability re-score can mark reactivation-worthy while Book readiness still fails channel/consent — runners must not treat re-score as enrollment authority.
**Solution:** `Keep Re-evaluation outputs as eligibility/detection signals; require Book readiness Audit reachable (and Send gates / silence ledger) before any automatic enrollment — so that law-side or fact-side re-score never bypasses reachability.`
**Handoff:** both
**Revealed:** partial (plugs Book readiness)
**implementationProblem:**
A contact becomes draw-cleared on Publish version or write-back while email is invalid / silenced; naive hooks enroll anyway.

**implementation:**
On Firm operations bind firm detail → Send gates panel, view enrollment readiness rows requiring Book readiness reachable verdict even when Phase signal is reactivation-worthy.
On Book readiness Audit run → Verdict list, click Re-batch after import refresh without clearing eligibility signals — detection and reachability stay separate axes.

**implementationAdds:** ["eligibility≠reachable", "audit-reachable-gate", "signal-retained"]
**implementationPlant:** not_done

---

### pipe-19
**Question:** What freshness / volatility classes should each reference table family carry so recheck cadence is not one global cron?
**References:**
- Seat 2 ref-04 (draws: same business day), ref-05 (categories: on-change + annual), ref-07/ref-08 (grids/language: on-change), ref-22 (ECA: quarterly+on-change), ref-23 (funds: quarterly+on-change when asserted; URL NEEDS VERIFICATION each cycle)
- Rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
**Thesis gap:** Domain named SLAs; **new** capability is machine volatility flags that drive Detect schedules and past-freshness gates (roster: freshness/volatility + recheck; HANDOFF ref-23 is a consumer that must re-resolve funds URL each cycle when that table is asserted).
**Solution:** `Assign each table family a volatility class — high (round/cutoff), medium (category membership/predicates, language charts when IRCC announces tests), low (CRS/FSW grids, ECA maps, funds-by-family-size when asserted) — stored as data on Reference tables — so that Detect cadence and freshness SLA clocks follow class, not a single fleet cron.`
**Handoff:** both
**Revealed:** new (freshness/volatility)
**implementationProblem:**
One daily job either misses multi-draw days or burns Dual-check capacity re-verifying static grids every night.

**implementation:**
On Reference tables, each family row has a Volatility class selector (high / medium / low) with default SLA from the house matrix.
On Reference data Detect, schedule rows and on-alert rows follow Volatility class; funds tables (when asserted) show low + mandatory source-URL re-resolve each verify cycle.

**implementationAdds:** ["volatility-class", "high", "medium", "low", "source-URL-re-resolve"]
**implementationPlant:** not_done

---

### pipe-20
**Question:** How do freshness flags become pack-consumable gates so stale pins cannot silently assert draw/category outcomes?
**References:**
- Seat 1 elig-25 — published & not-past-freshness reference pin; else reference data unavailable
- Seat 2 ref-04 / CROSS-CUTTING freshness edge
- CRS tool + criteria pages as currency witnesses — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html
**Thesis gap:** Freshness SLA exists as prose; packs need a boolean/time flag from the pipeline (**new**).
**Solution:** `Maintain per-table last-verified-at, freshness-SLA deadline, and past-freshness flag updated by Detect/verify jobs; Evaluation packs read “published-current AND not past-freshness” before draw/category assertions — so that wrong-cutoff reactivation cannot fire on stale mirrors.`
**Handoff:** both
**Revealed:** new (freshness flags)
**implementationProblem:**
Packs pin a version id forever; without past-freshness, a week-old cutoff still clears reactivation-worthy.

**implementation:**
On Reference tables, each family row shows last-verified-at, freshness-SLA, and Past-freshness flag columns.
On Configuration libraries → Evaluation packs catalog, open Evaluation pack editor; set draw-cutoff and category-occupation assertions to require Published & not past freshness; click Publish version. On Analysis, view Reference data unavailable and suppressed reactivation paths when freshness fails.

**implementationAdds:** ["last-verified-at", "freshness-SLA", "past-freshness", "reference-data-unavailable"]
**implementationPlant:** not_done

---

### pipe-21
**Question:** What recheck cadence scheduler must the pipeline run so volatility classes and on-change Detect stay honest?
**References:**
- Seat 2 ref-25 (house ops SLA matrix; engineering builds pipeline)
- Ministerial instructions rounds ledger — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
- Category-based selection page (dated updates) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** Cadence without a scheduler object returns to engineering cron folklore; ops cannot see missed SLAs.
**Solution:** `Run a house-visible cadence scheduler: high at least daily + on-alert same-business-day; medium on hash-change + scheduled verify (≥ weekly); low on hash-change + quarterly verify; miss → Oversight / Reference data SLA breach alert — so that recheck is an operable pipeline, not a hope.`
**Handoff:** both
**Revealed:** new (recheck cadence)
**implementationProblem:**
SLAs live in Pass2 prose; nothing pages house when a high-volatility table skips verify through a multi-draw week.

**implementation:**
On Reference data, open Recheck cadence; view the cadence table next-due / last-verified rows per table family by Volatility class.
On Oversight, view SLA breach alert rows when Detect/verify misses the class deadline; click the alert row to jump to Import criteria for draw-day on-call.

**implementationAdds:** ["recheck-cadence", "next-due", "SLA-breach-alert", "same-business-day"]
**implementationPlant:** not_done

---

### pipe-22
**Question:** What continuous reconciliation and pipeline Audit trail prove the mirror still matches Canada.ca after publish?
**References:**
- Seat 2 ref-17 (house reconciliation vs live snapshot; drift alert; sample flipped evaluations)
- Rounds ledger — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
- Audit trail practices for data pipelines (drift detect + sampled replay)
**Thesis gap:** Publish-time Dual-check does not catch silent post-publish page edits or failed Detect; firms must not be unpaid QA.
**Solution:** `Schedule reconciliation jobs that re-fetch canonical snapshots, diff against published-current hashes, alert on drift, sample contacts whose signals flipped on the last publish, and log all pipeline stages to Audit trail — so that wrong data is caught by upkeep ops before client complaint.`
**Handoff:** both
**Revealed:** new (ingestion + freshness) / partial (ref-17 named)
**implementationProblem:**
After a clean publish, IRCC HTML or operator error can drift while packs keep scoring; no house alarm fires.

**implementation:**
On Reference data, view the Reconciliation job row drift-alert status vs live Canada.ca snapshot on the fixed cadence schedule.
On Reference data, open the flip-sample drawer to spot-check evaluations that flipped on the last Publish version.
On Audit trail, filter Change event rows by ingestion, publish, re-evaluation, and reconciliation to trace the pipeline end-to-end.

**implementationAdds:** ["reconciliation-job", "drift-alert", "flip-sample", "pipeline-audit-end-to-end"]
**implementationPlant:** not_done

---

## Coverage map (revealed → items)

| Revealed surface | Status | Items |
|---|---|---|
| Reference-table ingestion (scrape+verify → versioned tables) | **new** | pipe-01…pipe-08, pipe-22 |
| Rule-version diff + who re-scores | **partial** | pipe-09…pipe-14 |
| Re-evaluation trigger on write-back → Board | **partial** | pipe-15…pipe-18 |
| Freshness/volatility flags + recheck cadence | **new** | pipe-19…pipe-21 (+ pipe-20 gate, pipe-22 reconcile) |

## Plugs (do not redesign seats 1–2)

| Plug | Pipeline role |
|---|---|
| **Reference data** / **Reference tables** / **Import criteria** / **Publish version** | Home of ingestion stages, volatility, cadence, reconciliation |
| **Evaluation packs** / **Evaluation pack editor** | Consumers of pins, freshness gates, impact cohort, changelog (no literals) |
| **Client Data** → **Board** / **Live brief** | Fact-write-back trigger → immediate re-score → Phase signal |
| **Book readiness** | Reachability axis orthogonal to eligibility signals |
| **Audit trail** / **Oversight** | Provenance, SLA breach, drift, multi-cause results |
| **Firm operations bind** | Bound-pack cohort; no auto-enrollment on reference-publish |

## Explicit non-goals (this seat)

- CEC/FSW/FST/PNP pathway interpretation, service-eligible copy → seat 1
- V1 Canada table inventory, which Canada.ca page is canonical per family → seat 2 (consume those bindings)
- Proof-of-funds amount values → seat 2 ref-23 (NEEDS VERIFICATION); this seat only supplies URL re-resolve + low-volatility cadence when asserted
- Hub chrome / Register module minting → PM absorb after paper lock
- Choosing Drools vs OPA vs in-house evaluator → CTO wiring; cited only as practice patterns

## Cross-cuts

| Edge | Items |
|---|---|
| Seat 2 publish semantics ↔ pipeline jobs | pipe-01, pipe-05, pipe-06, pipe-12 |
| Seat 1 freshness gate (elig-25) ↔ flags | pipe-19, pipe-20, pipe-21 |
| Engine 2 signal≠action ↔ re-score outputs | pipe-13, pipe-15, pipe-17, pipe-18 |
| Book readiness ↔ enrollment | pipe-18 |
| Incident rollback (ref-19) ↔ corrective cause | pipe-12, pipe-22 |
