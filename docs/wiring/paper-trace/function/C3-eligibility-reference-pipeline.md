# C3 Eligibility evaluation + reference-data currency pipeline — paper Function pass

Seat: C3 — Eligibility evaluation + reference-data currency  
Pass: Wiring Function, paper only  
Item count: 22 (`pipe-01`...`pipe-22`)

## Local node list

Written as the fusion vocabulary discovered while tracing C3. Seed nodes are marked existing; C3-local additions are marked new.

- `reference_table_version` (existing) — immutable published criteria set and its draft/publish lineage.
- `reference_diff` (existing) — structured change set between two reference versions.
- `client_score_snapshot` (existing) — per-contact evaluation result pinned to pack and reference versions.
- `re_score_job` (existing) — durable, impact-scoped evaluation job.
- `audit_trail` (existing) — append-only change-event log.
- `firm_tenancy` (existing) — tenant boundary and firm bind state.
- `book_readiness` (existing) — reachability and sequence-ready verdict state.
- `send_gate_decision` (existing) — allow/deny state for outbound motion.
- `ingestion_run` (new) — stage state for detect, fetch, parse, validate, draft, dual-check, and publish handoff.
- `reference_source_binding` (new) — canonical and discovery-only source bindings per table family.
- `reference_detect_cursor` (new) — last-seen hash, ETag, and retrieved marker for a source binding.
- `schema_contract` (new) — versioned table-family shape and sanity contract.
- `publish_group` (new) — co-publish set that publishes dependent table families atomically.
- `evaluation_pack` (new) — pack policy, table-key references, pins, and follow-current state.
- `client_data_record` (new) — committed client facts from forms or consultant entry.
- `board_phase_signal` (new) — list-grade phase and eligibility signal state.
- `reference_freshness_state` (new) — volatility class, last-verified timestamp, freshness deadline, and past-freshness flag.
- `recheck_cadence` (new) — house-visible next-due and SLA state for verify work.
- `reconciliation_job` (new) — post-publish drift and sampled replay job state.

## Traces

### `pipe-01` — Staged ingestion pipeline
**Implementation (source):** Reference data moves through fixed detect, fetch, parse, validate, draft, dual-check, publish, and consumer enqueue stages without a code deploy.
**Start:** Starting from `ingestion_run` (new)
**Path:**
1. When a change candidate occurs at `ingestion_run`, staged run state occurs at `ingestion_run`. [stage order is fixed; failed stages remain draft-side]
2. When fetch and parse completion occurs at `ingestion_run`, draft criteria snapshot creation occurs at `reference_table_version`. [draft is not published-current]
3. When dual-check and publish handoff completion occurs at `ingestion_run`, immutable publish-state advancement occurs at `reference_table_version`. [only validated drafts can publish]
4. When publish success occurs at `reference_table_version`, consumer work enqueue occurs at `re_score_job`. [enqueue is scoped by the later diff/impact path]
5. When stage-state change occurs at `ingestion_run`, stage outcome append occurs at `audit_trail`. [append-only stage chronology]
**Nodes touched:**
- `ingestion_run`
- `reference_table_version`
- `re_score_job`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance

### `pipe-02` — Canonical source binding
**Implementation (source):** Each table family separates canonical source URLs from discovery alerts so only authoritative bindings can feed publishable data.
**Start:** Starting from `reference_source_binding` (new)
**Path:**
1. When source binding registration occurs at `reference_source_binding`, canonical and discovery-only class storage occurs at `reference_source_binding`. [Canada.ca, ministerial instruction, or named domain source only for canonical]
2. When discovery-only alert arrival occurs at `reference_source_binding`, detect-state opening occurs at `ingestion_run`. [alert cannot become publish input]
3. When fetch start occurs at `ingestion_run`, source-class check occurs at `reference_source_binding`. [fetch-and-parse proceeds only from canonical bindings]
4. When blocked source attempt occurs at `ingestion_run`, refusal provenance append occurs at `audit_trail`. [secondary source cannot promote to published-current]
**Nodes touched:**
- `reference_source_binding`
- `ingestion_run`
- `audit_trail`
**Facets swept:** External Systems; Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime

### `pipe-03` — Change-driven detect
**Implementation (source):** Scheduled canonical fetches compare content hashes and available HTTP validators so identical polls do not create drafts.
**Start:** Starting from `reference_detect_cursor` (new)
**Path:**
1. When scheduled or alert-driven check occurs at `reference_detect_cursor`, canonical page-marker refresh occurs at `reference_detect_cursor`. [hash, ETag, and Last-Modified are stored when available]
2. When marker divergence occurs at `reference_detect_cursor`, change-driven run opening occurs at `ingestion_run`. [run opens only for divergence or explicit alert path]
3. When unchanged-marker verification occurs at `reference_detect_cursor`, verification-time update occurs at `reference_freshness_state`. [no duplicate draft version is created]
4. When divergence-run opening occurs at `ingestion_run`, detect provenance append occurs at `audit_trail`. [source marker and retrieved time are recorded]
**Nodes touched:**
- `reference_detect_cursor`
- `ingestion_run`
- `reference_freshness_state`
- `audit_trail`
**Facets swept:** External Systems; Data Storage & Management; Infrastructure & Operations; Cost / FinOps

### `pipe-04` — Schema-contract validation
**Implementation (source):** Table-family contracts enforce required columns, types, cardinality, and sanity bands before a draft can reach dual-check.
**Start:** Starting from `schema_contract` (new)
**Path:**
1. When contract-version attachment occurs at `schema_contract`, validation-state update occurs at `schema_contract`. [contract is versioned]
2. When parsed-data landing occurs at `ingestion_run`, current-contract read occurs at `schema_contract`. [HTML shifts fail closed]
3. When validation pass occurs at `ingestion_run`, draft snapshot advancement occurs at `reference_table_version`. [draft can enter dual-check]
4. When validation failure occurs at `ingestion_run`, draft-hold state occurs at `reference_table_version` and failure-detail append occurs at `audit_trail`. [publish path stays blocked]
**Nodes touched:**
- `schema_contract`
- `ingestion_run`
- `reference_table_version`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations

### `pipe-05` — Immutable publish
**Implementation (source):** Published criteria are content-addressed and immutable; corrections produce a new version or explicit rollback publish.
**Start:** Starting from `reference_table_version` (existing)
**Path:**
1. When publish request occurs at `reference_table_version`, draft content-hash binding occurs at `reference_table_version`. [published rows cannot be edited in place]
2. When correction need occurs at `reference_table_version`, new draft lineage creation occurs at `reference_table_version`. [prior version remains readable]
3. When correction publish occurs at `reference_table_version`, supersedes linkage record occurs at `reference_table_version`. [rollback is explicit publish, not mutation]
4. When publish or correction completion occurs at `reference_table_version`, version-lineage append occurs at `audit_trail`. [pins resolve to the original bytes]
**Nodes touched:**
- `reference_table_version`
- `audit_trail`
**Facets swept:** Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime

### `pipe-06` — Provenance audit events
**Implementation (source):** Stage transitions and publish events write source, actor, attestation, effective date, supersedes id, content hash, and run id into audit state.
**Start:** Starting from `audit_trail` (existing)
**Path:**
1. When ingestion-stage transition occurs at `ingestion_run`, provenance append occurs at `audit_trail`. [source URL, retrieved-at, actor, and run id are recorded]
2. When publish request occurs at `reference_table_version`, required-provenance check occurs at `audit_trail`. [missing provenance blocks publish]
3. When publish success occurs at `reference_table_version`, publish-provenance append occurs at `audit_trail`. [content hash, effective-from, supersedes id, and dual-check attestation are recorded]
4. When version citation occurs at `client_score_snapshot`, cited-version resolution occurs at `audit_trail`. [score replay reaches source and actor]
**Nodes touched:**
- `ingestion_run`
- `reference_table_version`
- `client_score_snapshot`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime

### `pipe-07` — Separation of duties
**Implementation (source):** Dual-check requires a distinct checker or independent checksum signature before publish can unlock.
**Start:** Starting from `ingestion_run` (new)
**Path:**
1. When importer draft advancement occurs at `ingestion_run`, importer actor-state write occurs at `ingestion_run`. [actor identity is preserved]
2. When dual-check attempt occurs at `ingestion_run`, checker-to-importer comparison occurs at `ingestion_run`. [same-actor approval is refused unless an incident flag is present]
3. When independent checksum attestation occurs at `ingestion_run`, dual-check state advancement occurs at `ingestion_run`. [checksum signature substitutes for second human only where allowed]
4. When dual-check pass occurs at `ingestion_run`, publish eligibility unlock occurs at `reference_table_version` and attestation append occurs at `audit_trail`. [publish remains gated by attestation]
**Nodes touched:**
- `ingestion_run`
- `reference_table_version`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Core Application & Runtime; Data Storage & Management

### `pipe-08` — Atomic publish groups
**Implementation (source):** Co-dependent table families publish together under a group id so packs never see half of a ministerial change.
**Start:** Starting from `publish_group` (new)
**Path:**
1. When co-dependent family declaration occurs at `publish_group`, member table-family binding occurs at `publish_group`. [category predicates and membership can share a group]
2. When member draft validation occurs at `reference_table_version`, readiness reflection occurs at `publish_group`. [all members must be ready]
3. When member validation failure occurs at `reference_table_version`, group draft-hold state occurs at `publish_group`. [no partial current state]
4. When all-member pass occurs at `publish_group`, atomic member-version advancement occurs at `reference_table_version`. [one publish-group id covers the set]
5. When group publish completion occurs at `reference_table_version`, group-lineage append occurs at `audit_trail`. [evaluation pins never point at a partial group]
**Nodes touched:**
- `publish_group`
- `reference_table_version`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Infrastructure & Operations

### `pipe-09` — Structured version diff
**Implementation (source):** Publish success computes added, removed, and changed rows or fields by table-family change class.
**Start:** Starting from `reference_diff` (existing)
**Path:**
1. When superseding-version publish occurs at `reference_table_version`, version-pair diff creation occurs at `reference_diff`. [diff is tied to both version ids]
2. When row or field difference occurs at `reference_diff`, change-class typing occurs at `reference_diff`. [floor, membership, predicate, grid cell, or equivalent class]
3. When diff computation completion occurs at `reference_diff`, diff-id attachment occurs at `reference_table_version`. [diff sits beside the immutable version]
4. When publish-event logging occurs at `audit_trail`, diff-id append occurs at `audit_trail`. [operators read machine diff, not raw eyeballing]
**Nodes touched:**
- `reference_table_version`
- `reference_diff`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Identity / Security / Compliance

### `pipe-10` — Diff-to-cohort scope
**Implementation (source):** Each diff change class maps deterministically to the bound firms and packs that consume affected table keys.
**Start:** Starting from `reference_diff` (existing)
**Path:**
1. When typed diff availability occurs at `reference_diff`, affected-key resolution occurs at `reference_diff`. [scope comes from structured change class]
2. When affected-key resolution occurs at `reference_diff`, consuming pack-reference read occurs at `evaluation_pack`. [packs declare table-key usage]
3. When consuming-pack match occurs at `evaluation_pack`, tenant membership resolution occurs at `firm_tenancy`. [only bound firms enter scope]
4. When tenant-scoped consumer resolution occurs at `firm_tenancy`, impact-scoped job enqueue occurs at `re_score_job`. [book-wide work is avoided unless the diff truly requires it]
**Nodes touched:**
- `reference_diff`
- `evaluation_pack`
- `firm_tenancy`
- `re_score_job`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Cost / FinOps; Infrastructure & Operations

### `pipe-11` — Bind and pin cohort modes
**Implementation (source):** Active follow-current, armed-only, and pinned packs all compute signals with different adoption behavior.
**Start:** Starting from `firm_tenancy` (existing)
**Path:**
1. When impact-scope arrival occurs at `firm_tenancy`, firm bind-state read occurs at `firm_tenancy`. [Active and armed-only are separate modes]
2. When pack-policy read occurs at `evaluation_pack`, follow-current or pin-with-expiry state application occurs at `evaluation_pack`. [pins are not silently flipped]
3. When Active follow-current application occurs at `evaluation_pack`, apply-mode work enqueue occurs at `re_score_job`. [current version can be adopted]
4. When armed-only or pinned-shadow application occurs at `evaluation_pack`, signal-store or shadow-diff work enqueue occurs at `re_score_job`. [motion remains separate from detection]
5. When mode choice occurs at `re_score_job`, mode-provenance append occurs at `audit_trail`. [operators can explain why a result did or did not adopt current]
**Nodes touched:**
- `firm_tenancy`
- `evaluation_pack`
- `re_score_job`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance

### `pipe-12` — Publish-triggered re-score jobs
**Implementation (source):** Publish creates durable re-evaluation jobs with cause codes and emits was/now deltas against prior pinned results.
**Start:** Starting from `re_score_job` (existing)
**Path:**
1. When publish completion occurs at `reference_table_version`, impact cohort work creation occurs at `re_score_job`. [cause is reference-publish or reference-correction]
2. When job run occurs at `re_score_job`, pack-policy and adoption read occurs at `evaluation_pack`. [pin and follow-current policy govern the version used]
3. When evaluation completion occurs at `re_score_job`, prior/current result write occurs at `client_score_snapshot`. [was/now delta preserves previous pins]
4. When score snapshot change occurs at `client_score_snapshot`, cause and version append occurs at `audit_trail`. [Board and Analysis updates are publish-attributable]
**Nodes touched:**
- `reference_table_version`
- `re_score_job`
- `evaluation_pack`
- `client_score_snapshot`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations

### `pipe-13` — Signals only on reference publish
**Implementation (source):** Reference-driven re-scores update detection signals and Board phase state but cannot auto-enroll outreach.
**Start:** Starting from `client_score_snapshot` (existing)
**Path:**
1. When reference-publish result write occurs at `client_score_snapshot`, eligibility and delta signal storage occurs at `client_score_snapshot`. [cause remains reference-publish]
2. When signal materialization occurs at `client_score_snapshot`, phase signal-state update occurs at `board_phase_signal`. [detection becomes visible]
3. When reference-publish cause arrival occurs at `firm_tenancy`, auto-enrollment refusal occurs at `firm_tenancy`. [motion requires a separate runner decision]
4. When outbound motion consideration occurs at `send_gate_decision`, send-authority denial occurs at `send_gate_decision`. [signal does not become send authority]
5. When refusal or signal write occurs at `client_score_snapshot`, provenance append occurs at `audit_trail`. [decoupling is reviewable]
**Nodes touched:**
- `client_score_snapshot`
- `board_phase_signal`
- `firm_tenancy`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Identity / Security / Compliance; Data Storage & Management

### `pipe-14` — Diff stays outside rule bodies
**Implementation (source):** Version diffs appear as read-only reference changelogs while pack rules link to table keys and reject embedded public-criteria literals.
**Start:** Starting from `evaluation_pack` (new)
**Path:**
1. When reference-impact opening occurs at `evaluation_pack`, changelog read occurs at `reference_diff`. [diff is read-only input context]
2. When pack assertion edit occurs at `evaluation_pack`, table-key and version-pin reference storage occurs at `evaluation_pack`. [public criteria values live in reference data]
3. When pack review run occurs at `evaluation_pack`, public-criteria literal comparison occurs at `reference_table_version`. [matching literals are rejected from rule bodies]
4. When review outcome occurs at `evaluation_pack`, review-outcome append occurs at `audit_trail`. [Directive 3 enforcement is traceable]
**Nodes touched:**
- `evaluation_pack`
- `reference_diff`
- `reference_table_version`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance

### `pipe-15` — Fact write-back re-score trigger
**Implementation (source):** Client Data commits emit fact-change events that immediately re-score the contact against bound packs and current or pinned reference versions.
**Start:** Starting from `client_data_record` (new)
**Path:**
1. When form or consultant write-back commit occurs at `client_data_record`, fact-change event record occurs at `client_data_record`. [commit is the trigger, not page view]
2. When fact-change event occurs at `client_data_record`, bound pack and tenant-context read occurs at `firm_tenancy`. [only the contact's firm scope is touched]
3. When bound pack resolution occurs at `firm_tenancy`, immediate per-contact work enqueue occurs at `re_score_job`. [cause is fact-write-back]
4. When job completion occurs at `re_score_job`, refreshed result write occurs at `client_score_snapshot`. [current or pinned reference policy is preserved]
5. When score snapshot update occurs at `client_score_snapshot`, phase signal-state update occurs at `board_phase_signal` and cause append occurs at `audit_trail`. [Board-visible without batch folklore]
**Nodes touched:**
- `client_data_record`
- `firm_tenancy`
- `re_score_job`
- `client_score_snapshot`
- `board_phase_signal`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations

### `pipe-16` — Concurrent re-score coalescing
**Implementation (source):** Concurrent fact and reference triggers merge by contact and event id so one result can carry both causes and exact reference versions.
**Start:** Starting from `re_score_job` (existing)
**Path:**
1. When same-contact trigger collision occurs at `re_score_job`, idempotency-key comparison occurs at `re_score_job`. [key includes contact id and trigger event id]
2. When merge-window match occurs at `re_score_job`, latest fact and version-policy read occurs at `client_data_record` and `evaluation_pack`. [latest fact snapshot, declared reference policy]
3. When merged run completion occurs at `re_score_job`, multi-cause result write occurs at `client_score_snapshot`. [both trigger ids and reference versions are preserved]
4. When result write occurs at `client_score_snapshot`, all-cause append occurs at `audit_trail`. [no duplicate signals and no lost provenance]
**Nodes touched:**
- `re_score_job`
- `client_data_record`
- `evaluation_pack`
- `client_score_snapshot`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations

### `pipe-17` — Board phase signal contract
**Implementation (source):** Re-score outcomes materialize motion class, confidence tier, and version pins onto Board-grade phase signal state without determination language.
**Start:** Starting from `board_phase_signal` (new)
**Path:**
1. When score result write occurs at `client_score_snapshot`, motion class and confidence-tier derivation occurs at `board_phase_signal`. [reactivation-worthy, nudge-only, or none]
2. When phase signal update occurs at `board_phase_signal`, pack and reference version-pin copy occurs at `board_phase_signal`. [signal is explainable at list grade]
3. When signal wording storage occurs at `board_phase_signal`, determination-language exclusion occurs at `board_phase_signal`. [service posture only]
4. When signal change occurs at `board_phase_signal`, change-provenance append occurs at `audit_trail`. [consultants can open the version trail]
**Nodes touched:**
- `client_score_snapshot`
- `board_phase_signal`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance
**Missing seat flag (optional):** PM owns Board presentation; this trace wires the signal state and pins.

### `pipe-18` — Reachability before motion
**Implementation (source):** Eligibility re-score signals stay separate from Book readiness reachability so unreachable contacts do not enter sequences.
**Start:** Starting from `book_readiness` (existing)
**Path:**
1. When reactivation-worthy score occurs at `client_score_snapshot`, detection signal-state update occurs at `board_phase_signal`. [eligibility is detection]
2. When enrollment consideration occurs at `firm_tenancy`, reachable-verdict read occurs at `book_readiness`. [reachability is a separate axis]
3. When unreachable verdict occurs at `book_readiness`, enrollment-authority denial occurs at `send_gate_decision`. [invalid, silenced, or unconsented contact cannot enter motion]
4. When reachability change occurs at `book_readiness`, eligibility signal retention occurs at `board_phase_signal`. [readiness can recover without recomputing eligibility]
5. When gate decision occurs at `send_gate_decision`, decision-provenance append occurs at `audit_trail`. [signal and reachability are both reviewable]
**Nodes touched:**
- `client_score_snapshot`
- `board_phase_signal`
- `firm_tenancy`
- `book_readiness`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Identity / Security / Compliance; Data Storage & Management

### `pipe-19` — Volatility classes
**Implementation (source):** Reference table families carry high, medium, or low volatility classes that drive detect cadence and source re-resolve behavior.
**Start:** Starting from `reference_freshness_state` (new)
**Path:**
1. When table-family configuration occurs at `reference_freshness_state`, volatility-class storage occurs at `reference_freshness_state`. [high, medium, or low from house matrix]
2. When volatility-class change occurs at `reference_freshness_state`, cadence input update occurs at `recheck_cadence`. [cadence follows class, not one fleet cron]
3. When low-volatility funds assertion occurs at `reference_freshness_state`, source URL re-resolve requirement update occurs at `reference_source_binding`. [URL is verified each cycle when asserted]
4. When class or re-resolve state change occurs at `reference_freshness_state`, configuration-change append occurs at `audit_trail`. [freshness policy is reviewable]
**Nodes touched:**
- `reference_freshness_state`
- `recheck_cadence`
- `reference_source_binding`
- `audit_trail`
**Facets swept:** Data Storage & Management; External Systems; Infrastructure & Operations; Cost / FinOps

### `pipe-20` — Freshness gates for packs
**Implementation (source):** Packs can require published-current and not-past-freshness before draw or category assertions evaluate.
**Start:** Starting from `reference_freshness_state` (new)
**Path:**
1. When detect or verify success occurs at `reference_detect_cursor`, last-verified and freshness deadline update occurs at `reference_freshness_state`. [deadline follows volatility SLA]
2. When deadline miss occurs at `reference_freshness_state`, past-freshness flag update occurs at `reference_freshness_state`. [staleness is data, not prose]
3. When public-criteria evaluation read occurs at `evaluation_pack`, published-current read occurs at `reference_table_version` and freshness read occurs at `reference_freshness_state`. [both must pass for freshness-gated assertions]
4. When freshness failure occurs at `evaluation_pack`, unavailable-reference result write occurs at `client_score_snapshot`. [draw/category reactivation path suppresses]
5. When freshness-gated evaluation write occurs at `client_score_snapshot`, gate-outcome append occurs at `audit_trail`. [stale mirror decisions are explainable]
**Nodes touched:**
- `reference_detect_cursor`
- `reference_freshness_state`
- `evaluation_pack`
- `reference_table_version`
- `client_score_snapshot`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance

### `pipe-21` — Recheck cadence scheduler
**Implementation (source):** House-visible cadence state tracks next-due, last-verified, and SLA breach alerts by volatility class.
**Start:** Starting from `recheck_cadence` (new)
**Path:**
1. When volatility-class set occurs at `reference_freshness_state`, next-due schedule computation occurs at `recheck_cadence`. [high at least daily plus alert path; medium scheduled verify plus hash-change; low quarterly plus hash-change]
2. When next-due arrival occurs at `recheck_cadence`, detect or verify work update occurs at `reference_detect_cursor`. [cadence drives source checks]
3. When verify success occurs at `reference_detect_cursor`, last-verified update occurs at `reference_freshness_state` and next-due advancement occurs at `recheck_cadence`. [class deadline is refreshed]
4. When due-window miss occurs at `recheck_cadence`, breach-state append occurs at `audit_trail`. [house can see missed SLA]
**Nodes touched:**
- `reference_freshness_state`
- `recheck_cadence`
- `reference_detect_cursor`
- `audit_trail`
**Facets swept:** Infrastructure & Operations; External Systems; Data Storage & Management; Core Application & Runtime

### `pipe-22` — Continuous reconciliation
**Implementation (source):** Reconciliation refetches canonical snapshots, compares them with published hashes, samples flipped evaluations, and logs the pipeline end to end.
**Start:** Starting from `reconciliation_job` (new)
**Path:**
1. When reconciliation due event occurs at `reconciliation_job`, canonical source-binding read occurs at `reference_source_binding`. [only canonical snapshots are reconciled]
2. When canonical snapshot fetch occurs at `reconciliation_job`, live-to-published hash comparison occurs at `reference_table_version`. [drift is measured against immutable current]
3. When drift detection occurs at `reconciliation_job`, alert-state opening occurs at `reconciliation_job` and provenance append occurs at `audit_trail`. [post-publish drift becomes house-visible]
4. When last-publish impact sample occurs at `reconciliation_job`, flipped-result read occurs at `client_score_snapshot`. [sample focuses on contacts whose signals changed]
5. When sampled replay completion occurs at `reconciliation_job`, reconciliation-outcome append occurs at `audit_trail`. [ingestion, publish, re-score, and reconciliation share one traceable spine]
**Nodes touched:**
- `reconciliation_job`
- `reference_source_binding`
- `reference_table_version`
- `client_score_snapshot`
- `audit_trail`
**Facets swept:** External Systems; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance
