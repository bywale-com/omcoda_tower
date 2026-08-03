# C4 — Book ingestion, normalization & identity resolution

**Seat:** C4 — Book ingestion, normalization & identity resolution  
**Pass:** Wiring Function trace, paper only  
**Source:** [`../../../sme/capability/C4-book-ingestion-identity.md`](../../../sme/capability/C4-book-ingestion-identity.md)  
**Binding:** [`../../WIRING-METHOD.md`](../../WIRING-METHOD.md) · [`../../NODE-DEFINITION.md`](../../NODE-DEFINITION.md) · [`../../CTO-THINK-STACK.md`](../../CTO-THINK-STACK.md) · [`_SEED-NODES.md`](./_SEED-NODES.md)

## Local node list

Written-as-discovered for C4 traces; seed nodes are reused where the event acts on the same named state.

| Node | Status | State altitude |
|---|---|---|
| `import_batch` | existing | Book upload / parse batch |
| `source_header_inventory` | new | Captured source headers, samples, and provenance for a land |
| `field_mapping` | existing | CSV/CRM-to-canonical and Q-ID map state |
| `canonical_contact_record` | new | Normalized contact-layer row before Q-ID and identity effects |
| `normalized_contact_staging` | new | Cleaned value layer and transform outcomes for a batch |
| `opaque_attribute_store` | new | Non-evaluable imported attributes retained per contact |
| `fact_lineage` | new | Imported Q-ID fact provenance and transform chain |
| `contact_identity` | existing | Deduped person identity |
| `identity_review_cluster` | new | Possible same-person review state |
| `merge_survivorship_policy` | new | Field-level survivor rules for confirmed same-person merges |
| `channel_conflict` | new | Disputed channel change pending accept / reject / keep-both |
| `reachability_class` | existing | Email/phone validation class |
| `quarantine_row` | new | Failed row plus reason-code state |
| `book_readiness` | existing | Authorize-book readiness state |
| `suppression_list` | existing | Hard-bounce / complaint / opt-out entries |
| `firm_tenancy` | existing | Tenant boundary |
| `audit_trail` | existing | Append-only event log adjacency |

## Function traces

### `ingest-01` — Source header inventory before mapping
**Implementation (source):** Imports records the actual arrived headers, sample cells, and provenance before any mapping or contact mutation can proceed.
**Start:** `Starting from import_batch (existing)`
**Path:**
1. When a file or CRM export lands at `import_batch`, `source_header_inventory` records header names, sample values, source label, file digest, and landed-at timestamp. [idempotent by batch plus file digest]
2. When `source_header_inventory` is committed, `field_mapping` initializes candidate columns from the captured inventory rather than from assumed schema names.
3. When `field_mapping` requests contact mutation, `contact_identity` accepts only rows carrying the inventory reference for that `import_batch`.
4. When the inventory gate passes or blocks mutation, `audit_trail` appends the provenance stamp and gate result.
**Nodes touched:**
- `import_batch`
- `source_header_inventory`
- `field_mapping`
- `contact_identity`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-02` — Canonical contact vocabulary vs firm labels
**Implementation (source):** Source columns first map into a canonical contact layer so Q-ID facts do not absorb directory channels or opaque firm labels.
**Start:** `Starting from field_mapping (existing)`
**Path:**
1. When mapped column decisions are saved at `field_mapping`, `canonical_contact_record` receives identity fields, display labels, channel candidates, suppression-shaped fields, and opaque attributes as separate contact-layer slots.
2. When `canonical_contact_record` changes, `opaque_attribute_store` retains fields that are not canonical slots and not evaluable Q-ID candidates.
3. When canonical rows are staged, `contact_identity` resolves people from the canonical layer rather than raw header strings.
4. When `book_readiness` evaluates a batch, it reads canonical contact completeness and channel candidates instead of source column names.
5. When canonicalization completes, `audit_trail` appends the contact vocabulary version used for the batch.
**Nodes touched:**
- `field_mapping`
- `canonical_contact_record`
- `opaque_attribute_store`
- `contact_identity`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-03` — Field to Q-ID mapping, partial to complete
**Implementation (source):** Each land batch carries an explicit source-column to Q-ID map version with transform and confidence before evaluable facts are attached.
**Start:** `Starting from field_mapping (existing)`
**Path:**
1. When a Q-ID mapping decision is saved at `field_mapping`, the map version records source column, Q-ID target, transform choice, confidence, and unmapped state.
2. When `field_mapping` publishes the map version, `import_batch` binds that version to the batch before Q-ID facts can land.
3. When mapped values are produced, `fact_lineage` records batch id, map version, raw value, transform id, and normalized value.
4. When `book_readiness` starts an audit read, it consumes only Q-ID facts with a batch-bound `field_mapping` version and leaves unmapped evaluable candidates outside the fact set.
5. When the map version is used, `audit_trail` appends the version id and publish event.
**Nodes touched:**
- `field_mapping`
- `import_batch`
- `fact_lineage`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-04` — Unmapped columns preserve, do not invent
**Implementation (source):** Unmapped columns persist as opaque contact attributes without minting Q-IDs or discarding firm-supplied data.
**Start:** `Starting from field_mapping (existing)`
**Path:**
1. When a column is left unmapped at `field_mapping`, `opaque_attribute_store` receives the raw header, raw value, batch id, and column provenance.
2. When `opaque_attribute_store` updates, `canonical_contact_record` exposes the attribute as retained non-evaluable firm data for the contact.
3. When a later mapping decision promotes an opaque attribute, `field_mapping` creates a new map version instead of rewriting the old batch decision.
4. When promoted values become Q-ID facts, `fact_lineage` links the new mapped value back to the preserved opaque source.
5. When preserve or promote events occur, `audit_trail` appends the non-evaluable or promoted state transition.
**Nodes touched:**
- `field_mapping`
- `opaque_attribute_store`
- `canonical_contact_record`
- `fact_lineage`
- `audit_trail`
**Facets swept:** Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime.

### `ingest-05` — Value normalization transforms
**Implementation (source):** A fixed staging transform set cleans values before identity matching and validation classes run.
**Start:** `Starting from import_batch (existing)`
**Path:**
1. When source rows are accepted at `import_batch`, `normalized_contact_staging` records trim, Unicode normalization, empty-sentinel-to-null, email case policy, phone parse attempt, and date or scalar casts.
2. When `normalized_contact_staging` finishes a row, `canonical_contact_record` receives cleaned display, channel, suppression, and opaque slots while raw source remains linked to the batch.
3. When canonical rows carry normalized channel candidates, `contact_identity` computes match keys from the staged values only.
4. When validation is requested, `reachability_class` reads staged email and phone outcomes rather than raw free text.
5. When staging completes, `audit_trail` appends the transform set id used by the batch.
**Nodes touched:**
- `import_batch`
- `normalized_contact_staging`
- `canonical_contact_record`
- `contact_identity`
- `reachability_class`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-06` — Email string hygiene
**Implementation (source):** Imports classifies email strings as syntax-invalid or channel candidates before downstream deliverability checks consume them.
**Start:** `Starting from normalized_contact_staging (new)`
**Path:**
1. When an email-like value is normalized at `normalized_contact_staging`, `reachability_class` receives syntax-shape, length, forbidden whitespace, and address-part hygiene outcomes.
2. When syntax hygiene fails, `canonical_contact_record` marks the email slot syntax-invalid and keeps the raw value in provenance without treating it as a usable channel candidate.
3. When syntax hygiene passes, `canonical_contact_record` marks the value as an email channel candidate for identity and later validation-class checks.
4. When `book_readiness` counts reachable rows, it excludes syntax-invalid emails and sends survivors to the validation ladder.
5. When hygiene outcomes are assigned, `audit_trail` appends the class decision for the batch row.
**Nodes touched:**
- `normalized_contact_staging`
- `reachability_class`
- `canonical_contact_record`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-07` — Phone normalization
**Implementation (source):** Phone candidates parse with firm/default region, store E.164 on success, and retain raw values on parse failure.
**Start:** `Starting from normalized_contact_staging (new)`
**Path:**
1. When a phone value is staged at `normalized_contact_staging`, `firm_tenancy` supplies the firm or batch default region for national-number parsing.
2. When parsing succeeds, `canonical_contact_record` stores E.164 and the parse-valid outcome as the phone channel candidate.
3. When parsing fails, `canonical_contact_record` keeps the raw value and records a parse-failed outcome without pretending the value is E.164.
4. When phone match keys are computed, `contact_identity` uses E.164 successes and skips parse-failed raw strings as deterministic phone keys.
5. When phone validation later runs, `reachability_class` starts from the parse outcome instead of re-reading unparsed text.
6. When parse outcomes are assigned, `audit_trail` appends default region and parse result.
**Nodes touched:**
- `normalized_contact_staging`
- `firm_tenancy`
- `canonical_contact_record`
- `contact_identity`
- `reachability_class`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-08` — Display name vs structured name parts
**Implementation (source):** Contacts require a display name while structured given/family parts remain optional unless the source actually supplies them.
**Start:** `Starting from canonical_contact_record (new)`
**Path:**
1. When name columns normalize into `canonical_contact_record`, the record chooses a display name from full name or composed supplied parts.
2. When only a display name exists, `contact_identity` keeps given and family names absent rather than inventing split structure.
3. When supplied structured parts exist, `contact_identity` stores them as optional identity signals beside the display name.
4. When `book_readiness` checks name-present, it reads display name presence and does not require invented structured parts.
5. When name construction completes, `audit_trail` appends whether the display name was supplied directly or composed from source columns.
**Nodes touched:**
- `canonical_contact_record`
- `contact_identity`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-09` — Mapping confidence and human confirm
**Implementation (source):** High-confidence suggestions may prefill maps, while medium or low confidence mappings require confirmation before publish.
**Start:** `Starting from field_mapping (existing)`
**Path:**
1. When source headers and samples reach `field_mapping`, the mapping state records confidence per proposed canonical or Q-ID target.
2. When all proposed targets are high confidence, `field_mapping` may prefill the map version but still records the auto-suggest basis.
3. When any proposed target is medium or low confidence, `field_mapping` holds the map version in confirm-required state.
4. When confirmation is missing, `import_batch` cannot publish an ingestion-complete state for that batch.
5. When confirmation lands, `book_readiness` can read the published map version; `audit_trail` appends the confirming actor and changed columns.
**Nodes touched:**
- `field_mapping`
- `import_batch`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-10` — Deterministic match-key identity
**Implementation (source):** V1 identity resolves by normalized email, then E.164 phone, then source-row id, producing a stable Tower contact id.
**Start:** `Starting from contact_identity (existing)`
**Path:**
1. When normalized canonical rows arrive at `contact_identity`, the identity state searches deterministic keys in order: normalized email, E.164 phone, then source-row id scoped to batch provenance.
2. When a deterministic key matches a living person in `firm_tenancy`, `contact_identity` assigns the existing stable contact id and records an upsert decision.
3. When no deterministic key matches, `contact_identity` creates a stable contact id within the firm tenancy and records an insert decision.
4. When duplicate keys collide inside the same batch, `identity_review_cluster` receives the affected rows for review instead of silently merging them.
5. When `book_readiness` displays duplicate outcomes, it reads the same `contact_identity` spine rather than inventing a second dedupe key.
6. When insert, upsert, or review decisions occur, `audit_trail` appends the match-key class used.
**Nodes touched:**
- `contact_identity`
- `firm_tenancy`
- `identity_review_cluster`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-11` — Probabilistic and secondary identity signals
**Implementation (source):** Scored same-person hints become review clusters only and never auto-merge without deterministic evidence or firm confirmation.
**Start:** `Starting from contact_identity (existing)`
**Path:**
1. When deterministic keys are absent, weak, or oddly colliding at `contact_identity`, `identity_review_cluster` receives scored secondary signals such as display name similarity, partial channel overlap, and provenance proximity.
2. When an `identity_review_cluster` is created, `contact_identity` keeps candidate contacts separate until confirm-merge or keep-separate is recorded.
3. When a firm or operator confirms merge, `merge_survivorship_policy` receives the member contacts for survivor calculation.
4. When keep-separate is recorded, `contact_identity` preserves separate stable contact ids and marks the cluster resolved.
5. When `book_readiness` reads unresolved clusters, it reports data-validity outcomes for those rows without blocking unrelated reachable rows.
6. When cluster state changes, `audit_trail` appends score inputs and the review decision.
**Nodes touched:**
- `contact_identity`
- `identity_review_cluster`
- `merge_survivorship_policy`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Cost / FinOps.

### `ingest-12` — Merge survivor and field-level survivorship
**Implementation (source):** Confirmed same-person merges use explicit field survivor rules so channels and firm suppressions are not erased by last-write-wins.
**Start:** `Starting from merge_survivorship_policy (new)`
**Path:**
1. When confirm-merge lands on `identity_review_cluster`, `merge_survivorship_policy` calculates survivor values by non-empty channels, suppression OR, newest provenance for conflicting scalars, and opaque-attribute union.
2. When survivor calculation completes, `contact_identity` updates the stable contact id with the selected survivor fields and retains merged provenance.
3. When suppression flags are OR-merged, `suppression_list` receives the halt signal without downgrading it because one source was blank.
4. When upsert re-land hits the same identity later, `contact_identity` invokes the same `merge_survivorship_policy` instead of overwriting channels by arrival order.
5. When `book_readiness` evaluates the merged contact, it reads the survivor channel set and suppression state.
6. When survivorship applies, `audit_trail` appends the losing values, survivor values, and rule version.
**Nodes touched:**
- `identity_review_cluster`
- `merge_survivorship_policy`
- `contact_identity`
- `suppression_list`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-13` — Already in Tower across batches
**Implementation (source):** Each new batch matches against the living firm book before commit and classifies rows as insert, upsert, or duplicate-review.
**Start:** `Starting from import_batch (existing)`
**Path:**
1. When a normalized batch reaches commit preparation at `import_batch`, `firm_tenancy` scopes the lookup to the living contacts owned by that firm.
2. When the firm-scoped lookup runs, `contact_identity` compares deterministic keys against existing contact ids before inserting any new identity.
3. When one existing identity matches cleanly, `contact_identity` marks the row upsert; when none matches, it marks insert.
4. When multiple existing identities or conflicting keys match, `identity_review_cluster` receives duplicate-review state before commit.
5. When `book_readiness` later checks already-in-Tower, it reads the import-time insert/upsert/review decision as the primary classification.
6. When row classes are assigned, `audit_trail` appends the classification counts for the batch.
**Nodes touched:**
- `import_batch`
- `firm_tenancy`
- `contact_identity`
- `identity_review_cluster`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-14` — Conflicting channel facts on same identity
**Implementation (source):** Different email or phone values for an existing contact become channel conflicts pending accept, reject, or keep-both.
**Start:** `Starting from contact_identity (existing)`
**Path:**
1. When an upsert at `contact_identity` brings a channel value that differs from the living contact, `channel_conflict` records existing value, incoming value, source provenance, and affected channel type.
2. When `channel_conflict` is open, `contact_identity` keeps the stable contact id but does not replace the armed channel silently.
3. When accept-new is recorded, `merge_survivorship_policy` promotes the incoming channel and preserves the replaced value in provenance.
4. When keep-existing or keep-both is recorded, `contact_identity` keeps the chosen candidate set for later reachability checks.
5. When `book_readiness` sees an open conflict on the channel intended for outreach, it holds sequence-ready for that row until the conflict resolves.
6. When conflict state changes, `audit_trail` appends the selected action and actor.
**Nodes touched:**
- `contact_identity`
- `channel_conflict`
- `merge_survivorship_policy`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-15` — Email validation-class checks
**Implementation (source):** Email candidates run through a named class ladder that maps outcomes to reachable, partial, or unreachable without hard-coding a vendor.
**Start:** `Starting from reachability_class (existing)`
**Path:**
1. When `book_readiness` requests email validation for syntax-surviving candidates, `reachability_class` creates an email class run for syntax, domain/MX-class, and mailbox/deliverability-class when that check is wired.
2. When syntax class fails, `reachability_class` marks the email unreachable and returns the reason to `book_readiness`.
3. When syntax passes but domain/MX or mailbox class is pending or partial, `reachability_class` marks the candidate partial rather than fully reachable.
4. When the highest available class passes, `reachability_class` marks the candidate reachable for the intended email channel.
5. When `book_readiness` builds the verdict list, it maps class outcomes to reachable, partial, and unreachable row states while preserving the candidate on the contact.
6. When validation classes are assigned, `audit_trail` appends class name, outcome, and provider-agnostic evidence.
**Nodes touched:**
- `book_readiness`
- `reachability_class`
- `canonical_contact_record`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `ingest-16` — Phone validation-class checks
**Implementation (source):** Phone candidates run parse-valid, line-type, and reachability classes before SMS or voice use.
**Start:** `Starting from reachability_class (existing)`
**Path:**
1. When `book_readiness` requests phone validation for parsed candidates, `reachability_class` creates a phone class run for parse-valid, line-type-class, and reachability-class when wired.
2. When parse-valid is false, `reachability_class` marks the phone unreachable for sequence use and keeps the raw candidate on the contact.
3. When line-type-class is incompatible with the intended SMS or voice channel, `reachability_class` marks the row partial or unreachable for that channel.
4. When reachability-class is pending, `book_readiness` keeps validation explicitly pending instead of counting the row as sequence-ready.
5. When class outcomes are available, `book_readiness` maps them to the verdict list while `contact_identity` retains the phone candidate for identity history.
6. When phone classes are assigned, `audit_trail` appends class name, outcome, and channel intent.
**Nodes touched:**
- `book_readiness`
- `reachability_class`
- `contact_identity`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `ingest-17` — Land to Audit contract
**Implementation (source):** Audit-eligible batches require normalized canonical rows, match keys, a saved map version, and explicit validation-class status.
**Start:** `Starting from import_batch (existing)`
**Path:**
1. When row processing finishes at `import_batch`, the batch asks `normalized_contact_staging` whether every committed row has a transform outcome.
2. When staging is complete, `field_mapping` confirms a saved map version for canonical and Q-ID decisions.
3. When mapping is saved, `contact_identity` confirms deterministic match keys or review-cluster outcomes for committed rows.
4. When identity is resolved or explicitly under review, `reachability_class` records validation-class status as runnable, pending, partial, or failed.
5. When all required states exist, `book_readiness` marks the batch ingestion-complete and eligible for Audit run.
6. When any required state is missing, `book_readiness` refuses Audit start for that batch and `audit_trail` appends the missing contract state.
**Nodes touched:**
- `import_batch`
- `normalized_contact_staging`
- `field_mapping`
- `contact_identity`
- `reachability_class`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `ingest-18` — Row quarantine vs batch fail-closed
**Implementation (source):** Valid rows can commit while failed rows move to quarantine with reason codes, and only committed rows count for readiness.
**Start:** `Starting from import_batch (existing)`
**Path:**
1. When row checks finish at `import_batch`, rows with blocking failures create `quarantine_row` entries carrying reason codes such as syntax, missing channel, map reject, or identity collision.
2. When at least one row satisfies the ingestion contract, `import_batch` commits valid rows to `canonical_contact_record` and `contact_identity`.
3. When no row satisfies the ingestion contract, `book_readiness` receives a batch-not-eligible state rather than a misleading partial ready count.
4. When `quarantine_row` entries exist, `book_readiness` excludes them from reachable counts and verdict-ready rows.
5. When a quarantined row is repaired, it re-enters `import_batch` through the same mapping, staging, identity, and validation path.
6. When quarantine or repair occurs, `audit_trail` appends reason code, row reference, and transition.
**Nodes touched:**
- `import_batch`
- `quarantine_row`
- `canonical_contact_record`
- `contact_identity`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `ingest-19` — Suppression and do-not-contact pass-through
**Implementation (source):** Suppression-shaped columns pass through as opaque halt flags for readiness without making legal consent judgments.
**Start:** `Starting from field_mapping (existing)`
**Path:**
1. When source columns are mapped at `field_mapping`, suppression-shaped fields are classified as opaque suppression flags rather than Q-ID facts or legal consent outcomes.
2. When suppression flags land in `canonical_contact_record`, `suppression_list` receives pass-through halt entries scoped to the contact and firm provenance.
3. When `merge_survivorship_policy` combines duplicate contacts, suppression flags OR together so one blank source cannot erase a halt signal.
4. When `book_readiness` evaluates outreach eligibility, it treats pass-through suppression as a data-validity halt without asserting CASL lawfulness.
5. When suppression pass-through lands, `audit_trail` appends the source column, batch, and contact affected.
**Nodes touched:**
- `field_mapping`
- `canonical_contact_record`
- `suppression_list`
- `merge_survivorship_policy`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-20` — Provenance and map lineage for evaluable facts
**Implementation (source):** Every imported Q-ID value retains source system, batch id, map version, raw value, transform id, normalized value, and landed-at time.
**Start:** `Starting from fact_lineage (new)`
**Path:**
1. When `field_mapping` produces a mapped Q-ID value, `fact_lineage` records source system, batch id, map version, raw value, transform id, normalized value, and landed-at timestamp.
2. When the Q-ID value attaches to a contact, `contact_identity` links the fact lineage to the stable contact id without upgrading it to client-asserted truth.
3. When `book_readiness` or an audit read consumes the fact, it reads imported-fact provenance class from `fact_lineage`.
4. When a map is changed later, `field_mapping` creates a new version and `fact_lineage` preserves the old lineage rather than overwriting historical facts.
5. When lineage is written or read for readiness, `audit_trail` appends source, batch, map version, and contact id.
**Nodes touched:**
- `field_mapping`
- `fact_lineage`
- `contact_identity`
- `book_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `ingest-21` — DEFERRED KU #7: Incremental sync after first land
**Implementation (source):** Incremental sync is deferred for V1 so activation does not depend on change-data-capture maturity.
**Start:** `Starting from no V1 node (deferred)`
**Path:**
1. Deferred KU #7: not in V1 topology.
**Nodes touched:**
- None in V1 topology.
**Facets swept:** None for V1 Function trace; future design would touch Core Application & Runtime, Data Storage & Management, External Systems, and Infrastructure & Operations.

### `ingest-22` — DEFERRED KU #7: Vertical CRM OAuth continuous pull
**Implementation (source):** Vertical CRM OAuth continuous pull is deferred for V1 and cannot bypass the export-mediated ingestion pipeline when revisited.
**Start:** `Starting from no V1 node (deferred)`
**Path:**
1. Deferred KU #7: not in V1 topology.
**Nodes touched:**
- None in V1 topology.
**Facets swept:** None for V1 Function trace; future design would touch Core Application & Runtime, Data Storage & Management, External Systems, Identity / Security / Compliance, and Infrastructure & Operations.
