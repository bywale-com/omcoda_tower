# Pass2+implementation — C4 Book ingestion, normalization & identity resolution

**Seat:** C4 — Book ingestion, normalization & identity resolution (capability axis)  
**Producer:** Data-integration engineer (capability SME) + PM implementation writing  
**Status:** Paper only — **not** Register-integrated; no CT plant  
**Pass shape:** Pass2 solutions (`<mechanism> so that <purpose>`) + SURFACE-VOCAB implementation bridge  
**Vocab:** [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md)  
**Roster:** [`00-ROSTER.md`](./00-ROSTER.md) §C4  
**Adjacency:** [`../pass2/07-consultancy-crm-book-connect.md`](../pass2/07-consultancy-crm-book-connect.md) — authorization / stack / hard-input semantics stay there; this seat starts **after / with** import land  
**Surfaces in play:** **Imports**, **Book readiness**, **Authorize book** (land trigger only), **Contacts**, **Audits** / **Audit run** / **Verdict list**  
**Item count:** 22 (`ingest-01` … `ingest-22`)

### Focus gap

Turn a firm’s messy book (CSV / CRM export) into **evaluable, reachable, deduped** records mapped to Q-IDs. Residual: field mapping, dedup/identity resolution, validation-class checks, incremental sync. Revealed: Field→Q-ID mapping **partial**; Dedup/identity **new**; Email/phone validation-class **new** (crm-20 adjacency); Incremental sync + vertical OAuth **deferred** (KU #7).

### Boundaries

- Do **not** redo seat-7 authorization semantics (stack chooser, cohort purpose as hard-input law, OAuth-vs-CSV as auth finish line, escrow ordering, scrape≠book).
- Do **not** invent CASL consent judgments or pathway/eligibility scores.
- Do **not** select commercial validator vendors — name practice classes only.
- Deferred sync items are labeled **DEFERRED (KU #7)** and must not block V1 campaign-real.

---

### ingest-01 — Source header inventory before mapping

**Question:** What must ingestion capture from a messy CSV/CRM export before any Q-ID assignment?  
**References:** dbt tests / freshness & schema documentation practice (docs.getdbt.com); SplitForge / HubSpot export column inventories; Apollo import field-mapping guides.  
**Thesis gap:** Shallow CSV import assumes fixed column names; practice books use arbitrary headers and silent renames.  
**Solution:** Capture a **source header inventory + sample values + provenance stamp** on every land so that mapping decisions are reproducible against the actual file, not an assumed schema.  
**Handoff:** cto (schema snapshot store); pm (Imports mapping step visibility)

**implementationProblem:**  
Imports that jump straight to Contacts mutation without recording what columns arrived make Field→Q-ID mapping unverifiable and break re-import honesty.

**implementation:**  
On Imports, after Authorize book hand-over lands a file/export, click the land batch row to open Source header inventory (headers, sample cells, provenance timestamp) before Field→Q-ID map is enabled.  
On Book readiness, open Audits and start Audit run only from a batch with Source header inventory; Verdict list shows inventory-missing instead of mutating Contacts silently.

**implementationAdds:** `["source-header-inventory", "provenance-stamp"]`

---

### ingest-02 — Canonical contact vocabulary vs firm labels

**Question:** What intermediate vocabulary sits between arbitrary firm columns and Tower Q-IDs?  
**References:** CRM merge / field-standardization practice (HubSpot property mapping; Salesforce data-import maps); entity-resolution pipelines that normalize to a canonical record model before match.  
**Thesis gap:** Mapping firm labels directly onto eligibility Q-IDs conflates directory channels with evaluable facts and invents IDs for noise columns.  
**Solution:** Normalize into a **canonical contact vocabulary** (identity, display name, channel candidates, opaque attributes, suppression flags) first so that Q-ID mapping only attaches where evaluable facts exist.  
**Handoff:** both (PM: vocabulary on Imports; CTO: canonical schema)

**implementationProblem:**  
Product language jumps from CSV headers to Q-IDs; practice needs a stable contact layer so Book readiness and Evaluation packs do not share one brittle rename step.

**implementation:**  
On Imports, open Field→Q-ID map and use the Canonical contact fields panel to map source columns into identity, display name, channel candidates, opaque attributes, and suppression flags before any Q-ID attach.  
On Book readiness → Audit run, choose the canonical batch layer; Verdict list labels failures against canonical fields, not raw header strings.

**implementationAdds:** `["canonical-contact", "opaque-attributes", "channel-candidates"]`

---

### ingest-03 — Field → Q-ID mapping (partial → complete)

**Question:** How should firm columns that *do* carry evaluable facts attach to Q-IDs?  
**References:** Rules-engine / form-field catalogs in eligibility packs (Tower Evaluation packs practice); dbt column-level documentation; CRM custom-property → standard-field maps.  
**Thesis gap:** Roster marks Field→Q-ID mapping **partial** — prototype CSV flow exists but does not produce evaluable attachments Audit/packs can trust.  
**Solution:** Require an explicit **Field→Q-ID map version** (source column → Q-ID, transform, confidence) on each land batch so that evaluable facts are attributable and remappable without rewriting Contacts.  
**Handoff:** both (PM: map UI on Imports; CTO: versioned map artifact)

**implementationProblem:**  
Without versioned Field→Q-ID maps, shallow import leaves eligibility packs starved or silently guessing from free-text columns.

**implementation:**  
On Imports, open Field→Q-ID map, edit column → Q-ID rows with transform and confidence dropdowns, then click Save map version for the land batch.  
On Book readiness → Audit run, select that map version; Verdict list shows attached Q-IDs and keeps unmapped evaluable candidates as Unmapped, not invented.

**implementationAdds:** `["field-q-id-map", "map-version", "unmapped", "transform", "confidence"]`

---

### ingest-04 — Unmapped columns: preserve, do not invent

**Question:** What happens to columns that do not match a Q-ID or canonical channel field?  
**References:** HubSpot “unmapped properties” import behavior; data-quality practice of quarantine over silent drop (Great Expectations / dbt test fail semantics).  
**Thesis gap:** Dropping unknown columns loses firm suppressions and future map targets; inventing Q-IDs for every header pollutes Evaluation packs.  
**Solution:** Persist unmapped columns as **opaque attributes on the contact** (and surface Unmapped on the map) so that nothing is invented as evaluable and nothing firm-supplied is silently discarded.  
**Handoff:** pm (Unmapped visibility); cto (opaque attribute store)

**implementationProblem:**  
Silent drop and over-eager Q-ID minting are both wrong; Imports must keep firm data without claiming evaluability.

**implementation:**  
On Imports → Field→Q-ID map, set a column row to Unmapped using the mapping dropdown; commit still lands it as an opaque attribute on Contacts.  
On Imports, reopen the saved map version and click Promote on an opaque attribute row to attach a Q-ID later, then rerun Book readiness → Audit run without re-uploading the whole book.

**implementationAdds:** `["unmapped", "opaque-attributes", "promote-later"]`

---

### ingest-05 — Value normalization transforms

**Question:** Which normalization transforms must run before identity match and validation-class checks?  
**References:** libphonenumber normalization practice; Unicode NFKC / email local-part case conventions (RFC 5321/5322 practice); dbt staging models that cast/clean before marts.  
**Thesis gap:** Raw strings fail match keys and validators inconsistently (whitespace, case, punctuation, locale dates).  
**Solution:** Apply a fixed **staging transform set** (trim, Unicode normalize, email lowercase domain/local policy, phone parse attempt, empty-sentinel → null) before match and validation so that identity and reachability share one cleaned layer.  
**Handoff:** cto (transform pipeline); pm (Imports: Normalized preview)

**implementationProblem:**  
Matching and validators fight dirty strings if normalization is optional or per-surface.

**implementation:**  
On Imports, open Normalized preview before Commit land to inspect trim, Unicode, email case policy, phone parse attempt, and empty-sentinel→null transformations.  
On Book readiness → Audit run, the batch picker exposes only the normalized layer; Verdict list links raw source through provenance without auditing raw strings.

**implementationAdds:** `["normalized-preview", "empty-sentinel-null", "staging-transforms"]`

---

### ingest-06 — Email string hygiene (IETF-aligned)

**Question:** What email hygiene belongs in ingestion vs deliverability infrastructure (C1)?  
**References:** RFC 5321 / 5322 addr-spec practice; IETF email address internationalization notes; mailbox validation tiers used by ESP import tools (syntax → domain → mailbox).  
**Thesis gap:** Ingestion may treat any `@` string as a channel; C1 deliverability must not own basic syntax hygiene at land time.  
**Solution:** Enforce **syntax-class email hygiene at land** (addr-spec shape, length, forbidden whitespace) and pass survivors as email channel candidates so that deliverability-class checks remain Book readiness / C1 consumers — not import blockers for every soft failure.  
**Handoff:** cto (syntax gate); pm (Imports reject vs warn)

**implementationProblem:**  
Garbage email strings create Audit theater; over-blocking at Imports hides salvageable rows behind hard fails.

**implementation:**  
On Imports → Field→Q-ID map, open the Email hygiene chip on mapped email columns to mark Syntax-invalid or Channel-candidate after hygiene.  
On Book readiness → Audit run, run deliverability-class checks only for Channel-candidate emails; Verdict list shows Syntax-invalid as unreachable, never reachable.

**implementationAdds:** `["syntax-invalid", "channel-candidate", "email-hygiene"]`

---

### ingest-07 — Phone normalization (libphonenumber-class)

**Question:** How should phone candidates be normalized for match keys and reachability?  
**References:** Google libphonenumber parsing/formatting (E.164); ITU-T E.164; CRM import guides requiring country context for national numbers.  
**Thesis gap:** National-format phones without region default split identity and fail SMS channel class checks.  
**Solution:** Parse phones with **libphonenumber-class rules + firm/default region**, store E.164 when parse succeeds and keep raw otherwise, so that match keys and phone validation-class share one parse outcome.  
**Handoff:** cto (parser + region default); pm (Imports region control)

**implementationProblem:**  
Phone match and SMS readiness diverge when one path uses raw strings and another assumes E.164.

**implementation:**  
On Imports, use the Default region dropdown in Normalized preview and inspect Phone parse outcome chips showing E.164 on success and raw-retained on fail.  
On Book readiness → Audit run, phone validation-class reads those parse outcome chips; Verdict list refuses unparsed free text as if it were E.164.

**implementationAdds:** `["e164", "default-region", "phone-parse-outcome"]`

---

### ingest-08 — Display name vs structured name parts

**Question:** How should messy name columns become identity-stable display names?  
**References:** CRM merge display-name conventions; entity-resolution name tokenization (Fellegi–Sunter / OpenER practice summaries); Seed Audit “name present” data-validity check.  
**Thesis gap:** Splitting every “Full Name” into given/family invents false structure; omitting display name blocks Audit.  
**Solution:** Prefer a **display-name required** rule with optional structured parts when source provides them so that identity and Audit name-present pass without false name parsing.  
**Handoff:** pm (Imports name policy); cto (schema)

**implementationProblem:**  
Aggressive name parsing creates fake given/family fields that later look like Client Data facts.

**implementation:**  
On Imports → Field→Q-ID map, mark Display name required and map it from Full Name or composed parts; Given and Family rows remain optional unless source columns exist.  
On Book readiness → Audit run, name-present reads the Display name field; Verdict list does not pass rows by invented Given/Family splits.

**implementationAdds:** `["display-name", "optional-name-parts"]`

---

### ingest-09 — Mapping confidence and human confirm

**Question:** When auto-suggest Field→Q-ID / canonical maps are ambiguous, what practice gate applies?  
**References:** CRM import “review mapping” steps (HubSpot, Salesforce Data Import Wizard); human-in-the-loop entity resolution review queues.  
**Thesis gap:** Fully automatic mapping will mis-attach immigration-relevant columns; fully manual mapping blocks assisted land.  
**Solution:** Allow auto-suggest only at **high confidence**; require **human confirm on medium/low** before map version saves so that wrong Q-ID attach cannot silently poison Evaluation packs.  
**Handoff:** both

**implementationProblem:**  
Partial mapping exists as a shallow flow; confidence gating is the missing practice control.

**implementation:**  
On Imports → Field→Q-ID map, each column row shows a confidence chip (high / medium / low); medium/low rows enable the Confirm map checkbox before Save map version.  
On Authorize book completion path into Imports, Save map version stays disabled until required confirms land — high-confidence auto-suggest rows may prefill only.

**implementationAdds:** `["map-confidence", "confirm-map", "high", "medium", "low"]`

---

### ingest-10 — Deterministic match-key identity (V1 spine)

**Question:** What deterministic identity key policy should ingestion own (deepening crm-13 without re-arguing auth)?  
**References:** HubSpot email-as-unique-on-import; Apollo matching-key guidance; entity-resolution practice: deterministic keys before probabilistic scores (Talburt / ER literature summaries).  
**Thesis gap:** Dedup/identity is **new**; seat 7 named keys for connect, but ingestion must implement upsert and cluster behavior.  
**Solution:** Resolve V1 identity by **normalized email → E.164 phone → source-row id**, emitting a stable Tower contact id on first land so that re-import upserts and Audit dedupe share one spine.  
**Handoff:** cto (upsert + contact id); pm (Contacts duplicate surfacing)

**implementationProblem:**  
Without an ingestion-owned key spine, Book readiness dedupe and Imports upsert invent competing identities.

**implementation:**  
On Imports, open Match keys before Commit land and review the ordered policy chips normalized email → E.164 phone → source-row id that upsert into a stable Contact id.  
On Book readiness → Audit run, dedupe reads the same Contact id spine; Verdict list shows Duplicate of {Contact} without inventing a second key.

**implementationAdds:** `["match-email", "match-phone", "match-source-row-id", "contact-id"]`

---

### ingest-11 — Probabilistic / secondary identity signals

**Question:** When deterministic keys are absent or collide oddly, what secondary resolution is in scope for V1?  
**References:** Fellegi–Sunter record linkage; Open Source entity-resolution frameworks (e.g. Zingg, Splink) practice of scored match clusters; CRM fuzzy-match merge suggestions.  
**Thesis gap:** Name+phone-last-four fuzzy merges can false-merge distinct people in immigration books (family sharing phones).  
**Solution:** Treat name/phone/email **scored suggestions as review clusters only** in V1 — never auto-merge without deterministic key or explicit firm confirm — so that false merges cannot collapse distinct engagement histories.  
**Handoff:** both (PM: review cluster UX; CTO: score job optional)

**implementationProblem:**  
Auto fuzzy-merge looks smart and destroys reachability history; identity **new** surface must default fail-closed.

**implementation:**  
On Imports or Contacts, open Possible same-person clusters and review scored cluster rows with Confirm merge and Keep separate buttons; score alone never auto-merges.  
On Book readiness → Audit run, identity checks list unresolved clusters; Verdict list marks those rows partial/unreachable without blocking unrelated reachable rows.

**implementationAdds:** `["possible-same-person", "confirm-merge", "keep-separate", "unresolved-identity"]`

---

### ingest-12 — Merge survivor & field-level survivorship

**Question:** When two rows are the same person, which values survive?  
**References:** Salesforce duplicate / merge survivorship rules; HubSpot merge record practice (master record + property retention); MDM survivorship policies.  
**Thesis gap:** Last-write-wins on re-import can erase good channels or firm suppression flags.  
**Solution:** Apply explicit **survivorship rules** (non-empty channel beats empty; suppression flags OR across sources; newest provenance wins ties on conflicting scalars; opaque attributes union) so that merge improves reachability without wiping firm “do not contact.”  
**Handoff:** cto (survivorship engine); pm (Contacts merge preview)

**implementationProblem:**  
Naive overwrite on dedupe silently drops phones/emails and suppressions that Book readiness needs.

**implementation:**  
On Contacts → Possible same-person clusters, click Confirm merge to open Survivorship preview showing channels kept if non-empty, suppressions OR-merged, conflicting scalars by newest provenance, and opaque attributes unioned.  
On Imports re-land, Match keys applies the same survivorship rules; Verdict list reflects the merged Contact id instead of last-write-wins channel loss.

**implementationAdds:** `["survivorship", "suppression-or-merge", "merge-preview"]`

---

### ingest-13 — Already-in-Tower across batches

**Question:** How should identity resolution treat contacts already living in the tenancy from prior lands?  
**References:** Seed §5.2 “already-in-Tower” Audit check; CRM upsert-vs-insert import modes; dbt unique-key incremental models.  
**Thesis gap:** Each CSV treated as greenfield creates duplicates and splits Engagement record history.  
**Solution:** On every batch, **match against the living tenancy book first** and classify rows Insert / Upsert / Duplicate-review so that “already-in-Tower” is an ingestion outcome, not only an Audit surprise.  
**Handoff:** both

**implementationProblem:**  
Book readiness discovers already-in-Tower too late if Imports never consulted the living directory.

**implementation:**  
On Imports, open Match keys and scan row class chips Insert / Upsert / Duplicate-review against the living Contacts book before Commit land.  
On Book readiness → Audit run, already-in-Tower is a residual check; Verdict list shows the row class from land instead of performing primary resolution late.

**implementationAdds:** `["insert", "upsert", "duplicate-review", "already-in-tower"]`

---

### ingest-14 — Conflicting channel facts on same identity

**Question:** What happens when upsert brings a different email/phone for an existing Contact id?  
**References:** CRM merge conflict UIs; Apollo field-ownership matrices; MDM “trust source” tiers.  
**Thesis gap:** Silent overwrite vs silent ignore both break sequence routing and identity trust.  
**Solution:** Quarantine conflicting channel changes as **Channel conflict** on the contact pending firm/operator accept or reject so that engagement never silently switches destination mid-sequence without an intentional accept.  
**Handoff:** both (PM: conflict on Contacts/Imports; CTO: quarantine state)

**implementationProblem:**  
Identity resolution without conflict handling either forks people or hijacks the reachable channel.

**implementation:**  
On Imports, click a Channel conflict chip when an upserted channel differs from the living Contact and choose Accept new, Keep existing, or Keep both as candidates.  
On Book readiness → Audit run, channel-match checks that chip; Verdict list holds sequence-ready closed when the armed channel is still disputed.

**implementationAdds:** `["channel-conflict", "accept-new", "keep-existing", "keep-both-candidates"]`

---

### ingest-15 — Email validation-class checks (NEW; crm-20 adjacency)

**Question:** What email validation *classes* must Book readiness consume after ingestion lands candidates?  
**References:** IETF addr-spec practice; ESP validation tiers (syntax / domain MX / mailbox); Seed §5.2 external validation systems; crm-20 practice-need naming.  
**Thesis gap:** Roster marks email validation-class **new**; seat 7 named the need — this seat specifies the class ladder for Audit.  
**Solution:** Run email checks as a **class ladder** (syntax → domain/MX-class → mailbox/deliverability-class when wired) mapping to reachable / partial / unreachable so that CTO can attach vendors without changing verdict semantics.  
**Handoff:** cto (validator wiring); pm (Verdict list mapping)

**implementationProblem:**  
Raw channel candidates cannot become sequence-ready; without named classes, Audit invents binary valid/invalid theater.

**implementation:**  
On Book readiness, open Audits and start Audit run with the Email validation-class checklist (syntax → domain/MX-class → mailbox/deliverability-class when wired).  
On Verdict list, class outcome chips map to reachable / partial / unreachable; Imports → Field→Q-ID map supplied only Channel-candidate inputs.

**implementationAdds:** `["email-validation-class", "syntax", "domain-mx-class", "mailbox-deliverability-class", "reachable", "partial", "unreachable"]`

---

### ingest-16 — Phone validation-class checks (NEW; crm-20 adjacency)

**Question:** What phone validation classes belong beside email before SMS/voice channel use?  
**References:** libphonenumber number types (mobile/fixed/voip); Twilio Lookup-class practice (line type / reachability — vendor-agnostic need); Seed §5.2 phone valid.  
**Thesis gap:** E.164 parse success ≠ SMS-reachable; class checks are **new** and must not be collapsed into “has digits.”  
**Solution:** Classify phones as **parse-valid → line-type-class → reachability-class (when wired)** so that channel match to intended sequence can refuse fixed-line-only rows for SMS sequences without claiming eligibility knowledge.  
**Handoff:** cto (lookup wiring); pm (Verdict list + channel match)

**implementationProblem:**  
Book readiness channel-match needs phone classes; ingestion currently stops at string presence.

**implementation:**  
On Book readiness, open Audits and start Audit run with the Phone validation-class checklist (parse-valid → line-type-class → reachability-class when wired).  
On Verdict list, SMS-intended rows show Partial/Unreachable when line-type-class is incompatible; Contacts still retain the number as a channel candidate.

**implementationAdds:** `["phone-validation-class", "parse-valid", "line-type-class", "reachability-class"]`

---

### ingest-17 — Land → Audit contract (ingestion guarantees)

**Question:** What invariants must ingestion guarantee so Book readiness is not theater?  
**References:** Seed §5.2 / operator-book-readiness; dbt “data tests before expose”; crm-19 connect→Audit handoff (adjacency — this seat names the *record* invariants).  
**Thesis gap:** Authorization can succeed while normalized/deduped/mapped records are unfinished — Audit then grades garbage.  
**Solution:** Gate Audit-eligible batches on **normalized canonical rows + match keys applied + map version saved + validation-class pending|runnable** so that Book readiness starts from ingestion-complete, not file-received.  
**Handoff:** both

**implementationProblem:**  
Authorize book land trigger without ingestion-complete lets Audits run on raw CSV.

**implementation:**  
On Imports, view the Ingestion-complete status chip turning on only after Normalized preview, Match keys, and saved Field→Q-ID map version are all complete.  
On Book readiness → Audits, click Start Audit run only for Ingestion-complete batches; on Verdict list, view validation-class pending when checks are not wired.

**implementationAdds:** `["ingestion-complete", "validation-class-pending"]`

---

### ingest-18 — Row quarantine vs batch fail-closed

**Question:** Should one bad row fail the whole land batch?  
**References:** Great Expectations / dbt warn-vs-error test configs; CRM import error-row CSVs; data-quality quarantine tables pattern.  
**Thesis gap:** All-or-nothing import either blocks activation on typos or silently lands unusable rows as Contacts.  
**Solution:** **Quarantine failing rows** with reason codes while committing valid rows (batch succeeds if ≥1 Audit-eligible row lands) so that messy books remain workable without pretending quarantine rows are sequence-ready.  
**Handoff:** both

**implementationProblem:**  
Messy firm CSVs always contain bad rows; product needs quarantine, not false activation failure or silent poison.

**implementation:**  
On Imports, click Commit land to commit Valid rows and send failed rows to Quarantine with reason-code chips (syntax, missing channel, map reject).  
On Book readiness → Audit run, Quarantine is excluded from reachable counts; Verdict list shows quarantined rows separately — view quarantined status; Contacts does not enroll quarantined rows.

**implementationAdds:** `["quarantine", "reason-codes", "valid-rows"]`

---

### ingest-19 — Suppression / do-not-contact pass-through (non-CASL)

**Question:** How does ingestion preserve firm suppressions for Audit without judging CASL?  
**References:** CRM marketing-status / do-not-contact fields; Seed Assump. 18 / crm-21 adjacency; suppression-list practice in messaging stacks.  
**Thesis gap:** Normalization that “cleans away” odd columns can strip the only firm halt signal before Book readiness.  
**Solution:** Map known suppression-shaped columns into **opaque suppression flags** (and keep unknowns opaque) so that Audit data-validity can halt outreach without this seat asserting consent lawfulness.  
**Handoff:** pm (flag handoff to Book readiness + CASL seat); cto (preserve fields through transforms)

**implementationProblem:**  
Staging transforms that drop unknown booleans erase do-not-contact; over-interpreting them invents CASL.

**implementation:**  
On Imports → Field→Q-ID map, set suppression-shaped columns to Opaque suppression flag in the Canonical contact fields panel during normalize.  
On Book readiness → Audit run, data-validity checks consume those flags; Verdict list shows suppression halt without Authorize book or Imports claiming CASL-lawful status.

**implementationAdds:** `["opaque-suppression-flags", "pass-through"]`

---

### ingest-20 — Provenance & map lineage for evaluable facts

**Question:** What lineage must stick to a Q-ID value after land?  
**References:** Data-lineage practice (OpenLineage / dbt exposures); CRM field history; MDM source-system attribution.  
**Thesis gap:** Evaluation packs may treat imported Q-ID values as client-asserted truth without source attribution.  
**Solution:** Attach **source system, batch id, map version, raw value, transform id, landed-at** to every mapped Q-ID fact so that desk and packs can distrust or refresh imported facts deliberately.  
**Handoff:** cto (lineage store); pm (Contacts / Client row fact provenance read)

**implementationProblem:**  
Mapped Q-IDs without lineage look like Client Data answers and poison eligibility confidence.

**implementation:**  
On Imports → Field→Q-ID map, each saved Q-ID attach stores Fact provenance fields source, batch id, map version, raw → transform → value, and landed-at.  
On Contacts / Client row, a provenance chip distinguishes Imported fact from Client-asserted fact; Book readiness → Verdict list reads but never upgrades that provenance class.

**implementationAdds:** `["fact-provenance", "imported-fact", "client-asserted", "batch-id", "map-version"]`

---

### ingest-21 — DEFERRED (KU #7): Incremental sync after first land

**Question:** After V1 one-way land, what would incremental sync require that must stay out of the activation finish line?  
**References:** Seed KU #7; SplitForge API-for-ongoing vs CSV migrate; dbt incremental models / changed-data-capture practice; Apollo sync cadence guidance.  
**Thesis gap:** Building incremental sync before ingestion-complete + identity spine exists repeats seat-7’s “sync perfection blocks running” failure mode.  
**Solution:** **Defer incremental sync for V1.** Document the future need for change-detection (watermark / updated-at / hash of canonical row) that upserts by Contact id — and keep Activation state free of any sync-complete gate — so that campaign-real stays auth ∩ escrow, not CDC maturity.  
**Handoff:** cto (post-V1 CDC design); pm (no V1 Incremental sync control as finish line)  
**Status:** **DEFERRED (KU #7)**

**implementationProblem:**  
If Incremental sync appears as a V1 Imports control, firms and operators will treat sync lag as activation failure.

**implementation:**  
On Authorize book hand-over into Imports, view the Sync posture chip (One-way land only / Incremental sync deferred (KU #7)); no V1 sync-complete button beside Field→Q-ID map.  
On Activation state → Progress, view running can open without sync-complete; currency uses re-hand-over upsert until CDC ships.

**implementationAdds:** `["incremental-sync-deferred", "one-way-land", "sync-complete-not-required"]`

---

### ingest-22 — DEFERRED (KU #7): Vertical CRM OAuth continuous pull

**Question:** How should continuous pull from vertical RCIC/practice platforms be treated relative to ingestion capability?  
**References:** Seed KU #7; crm-05 / crm-17 adjacency (vertical OAuth immature; bidirectional deferred); vendor integration maturity notes (NEEDS VERIFICATION per vendor).  
**Thesis gap:** Capability residual names incremental sync + vertical OAuth together; shipping OAuth pull without mapping/identity/validation classes recreates thin import at higher privilege.  
**Solution:** **Defer vertical CRM OAuth continuous pull** until Field→Q-ID maps, identity spine, and validation-class ladder exist for export-mediated land; when revisited, OAuth pull must reuse the same ingestion pipeline (inventory → normalize → map → match → quarantine → Audit) so that live pull never bypasses identity resolution.  
**Handoff:** cto (integration roadmap); pm (do not present live pull as the only “real” ingestion)  
**Status:** **DEFERRED (KU #7)**

**implementationProblem:**  
A privileged OAuth pull that skips Imports normalization would mint a second, dirtier book path.

**implementation:**  
On Authorize book / Imports, view future live-crm pull labeled as feeding the same pipeline cards: Source header inventory → Normalized preview → Field→Q-ID map → Match keys → Quarantine; V1 shows Vertical continuous pull deferred (KU #7).  
On Book readiness → Audit run, the batch picker uses the same Audit contract for file and future pull; Verdict list has no pull-specific bypass.

**implementationAdds:** `["vertical-oauth-pull-deferred", "same-ingestion-pipeline"]`

---

## Handoff summary (C4)

| Owner | Absorb |
|---|---|
| **PM** | Imports mapping + confidence confirm; quarantine; ingestion-complete → Book readiness; Verdict class language; merge/conflict UX; deferred sync posture copy; provenance-visible imported facts |
| **CTO** | Canonical schema; transform pipeline; versioned Field→Q-ID maps; match spine + survivorship; validation-class ladder hooks; quarantine store; lineage; no V1 CDC/OAuth-pull requirement |
| **Not this seat** | Authorize-book stack law (seat 7); CASL consent (seat 3); pathway scoring (seat 1); deliverability infra beyond class naming (C1); vendor selection |

## Revealed-surface coverage

| Revealed surface | Status | Items |
|---|---|---|
| Field → Q-ID mapping + normalization | partial → specified | `ingest-01`…`ingest-09`, `ingest-19`, `ingest-20` |
| Dedup / identity resolution | new | `ingest-10`…`ingest-14` |
| Email/phone validation-class checks | new | `ingest-06`, `ingest-07`, `ingest-15`, `ingest-16`, `ingest-17`, `ingest-18` |
| Incremental sync + vertical OAuth | **deferred KU #7** | `ingest-21`, `ingest-22` |

## Counts

| Metric | Count |
|---|---|
| Items (`ingest-01`…`ingest-22`) | **22** |
| With Solution (`<mechanism> so that <purpose>`) | **22** |
| With implementation bridge | **22** |
| Explicit **DEFERRED (KU #7)** | **2** (`ingest-21`, `ingest-22`) |
| Surfaces named | **Imports**, **Book readiness**, **Authorize book**, **Contacts**, **Audits** / **Audit run** / **Verdict list**, **Activation state**, **Client row** |

**Path:** `/workspace/docs/sme/capability/C4-book-ingestion-identity.md`
