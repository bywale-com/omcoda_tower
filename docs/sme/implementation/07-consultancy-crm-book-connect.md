# Implementation — Consultancy CRM / book-connection (seat 7)

**Producer:** Tower PM (implementation writing pass — paper only)  
**Source:** [`../pass2/07-consultancy-crm-book-connect.md`](../pass2/07-consultancy-crm-book-connect.md)  
**Vocab:** [`00-SURFACE-VOCAB.md`](./00-SURFACE-VOCAB.md) · Style: IMPLEMENTATION_STYLE (implementationProblem / implementation / implementationAdds)  
**Surfaces in play:** **Authorize book**, **Prepared Workspace**, **Contacts**, **Imports**, **Book readiness**, **Activation state**  
**Skipped (NEEDS VERIFICATION / under-claim):** `crm-04`, `crm-05`, `crm-22`  
**Deferred-sync posture:** Explicit on UI where relevant (`crm-17`, `crm-18`) — one-way land; bidirectional not a V1 finish line.

---

### crm-01 — Fragmented systems of record (no single “RCIC CRM”)

**implementationProblem:**  
Product language assumes a uniform firm database; practice is fragmented across spreadsheets, generic CRMs, and immigration practice platforms — so one OAuth meaning fails KU #2. Activation must not depend on a single vendor connector. PM owns Authorize-book stack taxonomy; CTO owns connector vs assisted-import paths.

**implementation:**  
On Authorize book, use the Connection stack dropdown to choose file export, assisted confirm, or live CRM for the firm's actual system of record; each option writes to the same Book authorized outcome row.  
On Activation state, the Progress panel shows book-auth landed only when that shared outcome chip is complete, never when a stack-specific partial chip is present.

**implementationAdds:** `["file-export", "assisted-confirm", "live-crm"]`

---

### crm-02 — Spreadsheet / CSV as the modal small-practice book

**implementationProblem:**  
“Database authorization” read as live API access excludes the largest realistic V1 cohort when the living book is a spreadsheet. Firm-authorized file export/upload must count as a first-class authorization stack. PM: file-stack = Authorize book equivalent; CTO: import mutation honesty.

**implementation:**  
On Authorize book, select file-export in the Connection stack dropdown; the option appears as a first-class row, not a fallback label.  
On Imports, click the Land import button to write the firm-authorized contact list into Contacts as the mutable book for that tenancy.

**implementationAdds:** `["file-export"]`

---

### crm-03 — Immigration practice platforms optimize case files, not marketing lists

**implementationProblem:**  
Connecting “the CRM” may pull matter-heavy or active-file populations wrong for dormant re-engagement. Authorization must name cohort purpose so connect yields a reactivation book, not an open-matter dump. PM: cohort semantics; CTO: filter/export scope when connectors exist.

**implementation:**  
On Authorize book, set the Cohort purpose dropdown before release, choosing dormant, past leads, closed files, or open matters.  
On Contacts, the Book header shows an Authorized cohort boundary chip on the landed book, so the list is not an unlabeled full dump.

**implementationAdds:** `["dormant", "past-leads", "closed-files", "open-matters"]`

---

### crm-06 — What “authorization” must mean across stacks (KU #2)

**implementationProblem:**  
Product may equate auth with a technical credential grant; practice needs one intentional firm act that releases a workable book into Tower’s tenancy. OAuth token, export file, and assisted confirm are three mechanisms of one hard input — never three finish lines. PM + CTO share outcome + provenance.

**implementation:**  
On Authorize book, the Book authorized outcome row completes only after the selected Connection stack lands provenance fields and channel candidate fields.  
On Activation state, the Progress panel flips book-auth only from that shared outcome chip, not from token received, file received, or staff seed chips alone.

**implementationAdds:** `["book-authorized"]`

---

### crm-07 — Equivalent that makes the campaign real (without acquisition upload)

**implementationProblem:**  
“Equivalent” risks collapsing into CSV inside the Meta click or into demo contacts that never become a runnable book. Equivalent = post-readiness, firm-initiated hand-over that lands mutable, Audit-able contacts. Acquisition stays seed-only.

**implementation:**  
Starting from Prepared Workspace, click the Authorize book button only after the readiness chip is complete; no Approach capture control links into Authorize book.  
On Authorize book, the Private book hand-over panel lands the book that Contacts will mutate, while Acquisition surfaces remain seed-only.

**implementationAdds:** `["post-readiness-hand-over"]`

---

### crm-08 — Assisted path confirm is authorization, not a second product

**implementationProblem:**  
Assisted import can look already connected without the consultant’s intentional authorization act. Campaign-real must not be inferred from staff-side seeding. Confirm-this-book is Authorize book’s sibling; Activation state flips only after confirm.

**implementation:**  
On Contacts, when Imports holds an assisted list, click the Confirm imported book button in the Book header to perform the authorization act.  
On Activation state, the Progress panel marks book-auth landed only after the Confirm imported book event chip, not when staff seeded Imports.

**implementationAdds:** `["confirm-imported-book"]`

---

### crm-09 — Firm identity scrape ≠ book; anti-cosplay of public detection

**implementationProblem:**  
Prepared Workspace under firm branding can be misread as “we already have your clients.” Scrape/templates are readiness theater only; only post-authorization private book makes engagement real. No scrape→Contacts mutation.

**implementation:**  
On Prepared Workspace, the Firm identity preview panel labels the staged campaign as readiness theater and does not show a Contacts populated chip.  
On Contacts, the Empty book row remains until Authorize book or Confirm imported book lands; website scrape rows never write into the directory.

**implementationAdds:** `["readiness-theater"]`

---

### crm-10 — Minimum fields connect must land (practice, not eligibility)

**implementationProblem:**  
Connect that lands names without usable channels creates Audit theater and blocks enrollment. Connect must produce stable identity + display name + ≥1 channel candidate per contact so Book readiness has something to validate — without inventing eligibility fields.

**implementation:**  
On Authorize book and Imports, the Row acceptance checklist requires identity field, display name field, and at least one channel candidate field (email and/or phone as present in source).  
Starting from Book readiness, click New Audit run in Audits only after rows pass that checklist; Verdict list marks empty-channel-only rows as not-landed, not Audit-eligible.

**implementationAdds:** `["channel-candidate", "not-landed"]`

---

### crm-11 — CSV / export risks: snapshot staleness

**implementationProblem:**  
Treating a one-shot export as a living CRM misleads firms about freshness for always-on engagement. File-stack books are authorized snapshots with optional re-export refresh — not silent live truth. PM: snapshot vs live language; CTO: re-import + provenance timestamps.

**implementation:**  
On Authorize book, when the Connection stack dropdown is file-export, the Book currency panel shows an authorized-snapshot chip, not live.  
On Contacts and Imports, the Provenance timestamp field and Re-export refresh button are visible, making refresh a re-hand-over action rather than silent sync.

**implementationAdds:** `["authorized-snapshot", "live"]`

---

### crm-12 — CSV / export risks: wrong cohort and export theater

**implementationProblem:**  
Upload of a partial, empty, or demo file can satisfy a checkbox without yielding a runnable book. Hard-input success must tie to landed mutable row count + cohort acknowledgement — not file-received events. Mutation honesty must close Seed §5.1 gap.

**implementation:**  
On Authorize book, the Complete authorization button enables only when the Landed mutable row count field is greater than zero and the Cohort purpose acknowledgement checkbox is checked.  
On Activation state, the Progress panel keeps book-auth pending when Imports shows file-received-only, empty import, or demo import chips.

**implementationAdds:** `["landed-mutable-rows", "cohort-acknowledgement"]`

---

### crm-13 — CSV / export risks: duplicates and match keys

**implementationProblem:**  
Without a declared match key, connect and Audit fight duplicates and split engagement history. V1 match: normalized email when present, else phone E.164-ish candidate, else source-row id. CTO owns upsert; PM surfaces firm-visible duplicate outcomes after Audit — not pathway scores.

**implementation:**  
On Imports, the Match key policy panel orders upsert keys as normalized email, then phone, then source-row id.  
Starting from Book readiness, run an Audit run from Audits; the Verdict list shows firm-visible duplicate outcome rows using that same match-key policy.

**implementationAdds:** `["match-email", "match-phone", "match-source-row-id"]`

---

### crm-14 — CSV / export risks: channel quality vs sequence intent

**implementationProblem:**  
Firms expect “imported = ready to message”; practice says import only supplies candidates for reachability. Connect = candidate book land; sequence-ready only after Audit verdicts. Enrollment never treats raw CSV as sendable.

**implementation:**  
On Authorize book, the Complete authorization button lands a candidate-book chip and routes to Book readiness, not enrollment.  
Starting from Book readiness, run an Audit run from Audits; the Verdict list marks only reachable rows as sequence-ready, while raw Imports remain candidate rows until Audit completes.

**implementationAdds:** `["candidate-book", "sequence-ready", "reachable"]`

---

### crm-15 — OAuth risks: over-scope and wrong objects

**implementationProblem:**  
Broad CRM OAuth can pull matters, billing, or documents the firm did not intend to hand to an engagement product. When OAuth is used, scope to contacts/leads + minimal reachability fields, with firm-visible scope summary. Authorization stays book-connection — not practice-platform takeover.

**implementation:**  
On Authorize book, when the Connection stack dropdown is live-crm, the Scope summary panel requires acknowledgement of contacts/leads plus reachability fields only before the Grant button enables.  
On Contacts, the Landed objects list accepts only scoped contacts/leads rows; matters, billing, and documents appear as blocked chips outside the book.

**implementationAdds:** `["scope-contacts-leads", "reachability-fields"]`

---

### crm-16 — OAuth vs CSV: when each is practice-correct for V1

**implementationProblem:**  
Product may push OAuth as “more real” and CSV as temporary, biasing activation away from reachable firms. Mechanism = what the firm can intentionally authorize today, both after readiness — practice fit, not acquisition friction. Parallel landers to the same book schema.

**implementation:**  
On Authorize book, the Connection stack dropdown is labeled "what the firm can authorize today" and offers file-export for export-owned SoR and live-crm for admin-capable SoR, with no temporary vs real badge.  
On Imports and Contacts, either stack lands through the same Mutable book schema panel after the Prepared Workspace readiness chip.

**implementationAdds:** `["file-export", "live-crm"]`

---

### crm-17 — Bidirectional sync (KU #7): V1 residual or defer?

**implementationProblem:**  
Leaving KU #7 open invites building sync before a workable one-way book exists — or blocking “running” on sync completeness. Defer bidirectional sync for V1; one-way land (CRM/file → Tower book) is enough for campaign-real. Activation finish line stays auth + escrow, not sync perfection.

**implementation:**  
On Authorize book, the Sync posture panel displays one-way-land (CRM/file to Tower) and bidirectional deferred as read-only chips, with no V1 bidirectional sync toggle.  
On Activation state, the Progress panel can reach running when book-auth and escrow chips are complete, without a sync-complete row.

**implementationAdds:** `["one-way-land", "bidirectional-deferred"]`

---

### crm-18 — What write-back would mean if revisited later

**implementationProblem:**  
Naive two-way sync can corrupt the firm’s practice file with engagement-tool edits. If revisited later: selective write-back of engagement events only; CRM remains source of truth for identity/channels. Board ≠ CRM admin. Explicit V1 posture: write-back not shipped.

**implementation:**  
On Authorize book and Contacts, the Sync posture panel shows write-back not in V1 and firm-SoR owned identity/channels as read-only chips.  
On Board, the Engagement record timeline shows chronology rows only; there is no CRM field admin button and no silent master toggle for practice-record fields.

**implementationAdds:** `["write-back-deferred", "engagement-events-only"]`

---

### crm-19 — Connect → Audit handoff: what must be guaranteed

**implementationProblem:**  
Ambiguous “connected” leaves Audit with empty, demo, or non-mutable data and enrollment blocked or unsafe. Connect must guarantee a tenancy-bound mutable contact set with provenance, match keys, channel candidates, and firm-authorized cohort boundary before Audit runs.

**implementation:**  
On Authorize book, the Connect-complete checklist requires mutable cohort, provenance, match keys, channel candidates, and cohort boundary rows before the Complete authorization button enables.  
On Activation state, the Progress panel mirrors the connect-complete chip. Starting from Book readiness, the New Audit run button in Audits enables only from connect-complete, not from file-received or readiness-theater chips.

**implementationAdds:** `["connect-complete"]`

---

### crm-20 — External validators: practice need only (CTO wires)

**implementationProblem:**  
Connect may dump raw strings; Audit cannot reach “reachable” without named validation species. Practice need: email syntax/deliverability-class and phone format/reachability-class checks as Audit consumers of connect output — vendor selection is CTO, not this seat.

**implementation:**  
Starting from Book readiness, run an Audit run from Audits; the Verdict list maps check-class columns to reachable, partial, or unreachable chips after the run completes.  
On Authorize book, the Channel candidate fields land raw candidates only; the validator result columns stay absent until Book readiness consumes them in the Audit run.

**implementationAdds:** `["reachable", "partial", "unreachable"]`

---

### crm-21 — Consent/silenced columns are not connect’s CASL judgment

**implementationProblem:**  
Importing a “subscribed” CRM flag can be mistaken for Tower having solved consent. Connect must pass through do-not-contact / silenced / marketing-status as opaque flags for Audit — neither inventing consent nor stripping firm suppressions. CASL lawfulness stays seat 3.

**implementation:**  
On Imports, the Field mapping table preserves do-not-contact, silenced, and marketing-status columns as opaque suppression flags on Contacts.  
Starting from Book readiness, click New Audit run in Audits; the Audit run input panel includes those flags as data-validity inputs, while Authorize book shows no CASL lawfulness verdict control.

**implementationAdds:** `["opaque-suppression-flags"]`

---

### crm-23 — Activation ordering with escrow (edge 6↔7)

**implementationProblem:**  
Undefined order creates activation deadlocks or PII-before-terms discomfort. Allow either order but require both before running; book-connect is never satisfied by escrow alone. Campaign-real still depends on an authorized book while commercial door stays peer.

**implementation:**  
On Prepared Workspace, the Activation checklist shows Authorize book and Accept terms rows as either-order buttons.  
On Activation state, the Progress panel marks running only when both book-auth and escrow chips are complete; escrow alone leaves the book-auth row pending.

**implementationAdds:** `["either-order", "both-before-running"]`

---

### crm-24 — Re-authorization / refresh without re-acquisition

**implementationProblem:**  
Snapshot stacks go stale; forcing full reactivation destroys retention. Provide in-desk re-hand-over (re-export / re-OAuth pull) that upserts by match key — currency without new acquisition or new escrow event.

**implementation:**  
On Authorize book, opened from Prepared Workspace or Contacts after running, click the Re-hand over book button and choose re-export or re-pull; Imports upserts by the Match key policy panel.  
On Activation state, the Progress panel keeps ALG and escrow chips intact across refresh. Starting from Book readiness, click New Audit run in Audits to re-batch the Verdict list after the upsert.

**implementationAdds:** `["re-hand-over"]`

---

### crm-25 — Failure modes that must not count as “DB auth landed”

**implementationProblem:**  
Checkbox auth, empty import, sample lists, or website scrape cosplay will show “activated” while no sequence-ready book exists. Fail closed unless mutable authorized cohort + Audit-eligible channel candidates + non-acquisition timing all hold. Proof artifacts for auth landed — not UI completion events.

**implementation:**  
On Activation state, the Progress panel refuses book-auth landed when the Evidence chips show checkbox-only, empty Imports, sample list, or scrape-as-connect.  
On Authorize book, the Complete authorization button enables only when mutable authorized cohort, Audit-eligible channel candidates, and post-readiness timing checklist rows all hold.

**implementationAdds:** `["fail-closed-auth"]`

---

## Counts

| Metric | Count |
|---|---|
| Source items (crm-01…crm-25) | **25** |
| Skipped (NEEDS VERIFICATION) | **3** (`crm-04`, `crm-05`, `crm-22`) |
| Implemented (this paper) | **22** |
| With `implementationAdds` | **22** |
| Surfaces named | **6** (Authorize book, Prepared Workspace, Contacts, Imports, Book readiness, Activation state) |
| Deferred-sync explicit on UI | **2** (`crm-17`, `crm-18`) |

**Path:** `/workspace/docs/sme/implementation/07-consultancy-crm-book-connect.md`
