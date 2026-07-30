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
On Authorize book, you can now pick Connection stack for the firm’s actual system of record (file export, assisted confirm, or live CRM when available) — same hard-input outcome, not separate finish lines.  
On Activation state, you can now read book-auth landed only after that stack completes — never stack-specific partials.

**implementationAdds:** `["file-export", "assisted-confirm", "live-crm"]`

---

### crm-02 — Spreadsheet / CSV as the modal small-practice book

**implementationProblem:**  
“Database authorization” read as live API access excludes the largest realistic V1 cohort when the living book is a spreadsheet. Firm-authorized file export/upload must count as a first-class authorization stack. PM: file-stack = Authorize book equivalent; CTO: import mutation honesty.

**implementation:**  
On Authorize book, you can now choose file-export as a first-class Connection stack (not a fallback label).  
On Imports, you can now land the firm-authorized contact list into Contacts as the mutable book for that tenancy.

**implementationAdds:** `["file-export"]`

---

### crm-03 — Immigration practice platforms optimize case files, not marketing lists

**implementationProblem:**  
Connecting “the CRM” may pull matter-heavy or active-file populations wrong for dormant re-engagement. Authorization must name cohort purpose so connect yields a reactivation book, not an open-matter dump. PM: cohort semantics; CTO: filter/export scope when connectors exist.

**implementation:**  
On Authorize book, you can now set Cohort purpose before release (dormant / past leads / closed files vs open matters).  
On Contacts, you can now read the authorized cohort boundary on the landed book — not an unlabeled full dump.

**implementationAdds:** `["dormant", "past-leads", "closed-files", "open-matters"]`

---

### crm-06 — What “authorization” must mean across stacks (KU #2)

**implementationProblem:**  
Product may equate auth with a technical credential grant; practice needs one intentional firm act that releases a workable book into Tower’s tenancy. OAuth token, export file, and assisted confirm are three mechanisms of one hard input — never three finish lines. PM + CTO share outcome + provenance.

**implementation:**  
On Authorize book, you can now complete one Book authorized outcome regardless of Connection stack — with provenance and channel fields required on land.  
On Activation state, you can now flip book-auth only on that shared outcome (not on token alone, file-received alone, or staff seed alone).

**implementationAdds:** `["book-authorized"]`

---

### crm-07 — Equivalent that makes the campaign real (without acquisition upload)

**implementationProblem:**  
“Equivalent” risks collapsing into CSV inside the Meta click or into demo contacts that never become a runnable book. Equivalent = post-readiness, firm-initiated hand-over that lands mutable, Audit-able contacts. Acquisition stays seed-only.

**implementation:**  
Starting from Prepared Workspace, you can now open Authorize book only after readiness — never from Approach capture.  
On Authorize book, you can now hand over the private book that Contacts will mutate; Acquisition surfaces never create that book.

**implementationAdds:** `["post-readiness-hand-over"]`

---

### crm-08 — Assisted path confirm is authorization, not a second product

**implementationProblem:**  
Assisted import can look already connected without the consultant’s intentional authorization act. Campaign-real must not be inferred from staff-side seeding. Confirm-this-book is Authorize book’s sibling; Activation state flips only after confirm.

**implementation:**  
On Contacts, when Imports already holds an assisted list, you can now Confirm imported book as the authorization act.  
On Activation state, you can now mark book-auth landed only after that confirm — not when staff seeded Imports.

**implementationAdds:** `["confirm-imported-book"]`

---

### crm-09 — Firm identity scrape ≠ book; anti-cosplay of public detection

**implementationProblem:**  
Prepared Workspace under firm branding can be misread as “we already have your clients.” Scrape/templates are readiness theater only; only post-authorization private book makes engagement real. No scrape→Contacts mutation.

**implementation:**  
On Prepared Workspace, you can now read readiness theater as staged campaign under firm identity — not as Contacts populated.  
On Contacts, you can now stay empty of private book until Authorize book (or Confirm imported book) lands — scrape never fills the directory.

**implementationAdds:** `["readiness-theater"]`

---

### crm-10 — Minimum fields connect must land (practice, not eligibility)

**implementationProblem:**  
Connect that lands names without usable channels creates Audit theater and blocks enrollment. Connect must produce stable identity + display name + ≥1 channel candidate per contact so Book readiness has something to validate — without inventing eligibility fields.

**implementation:**  
On Authorize book / Imports, you can now accept a row only when identity, display name, and ≥1 channel candidate (email and/or phone as present in source) land.  
On Book readiness, you can now refuse Audit-eligible enrollment for empty-channel-only rows marked not-landed.

**implementationAdds:** `["channel-candidate", "not-landed"]`

---

### crm-11 — CSV / export risks: snapshot staleness

**implementationProblem:**  
Treating a one-shot export as a living CRM misleads firms about freshness for always-on engagement. File-stack books are authorized snapshots with optional re-export refresh — not silent live truth. PM: snapshot vs live language; CTO: re-import + provenance timestamps.

**implementation:**  
On Authorize book, when Connection stack is file-export, you can now read the book as authorized-snapshot (not live).  
On Contacts / Imports, you can now see provenance timestamp and open re-export refresh — currency expects re-hand-over, not silent sync.

**implementationAdds:** `["authorized-snapshot", "live"]`

---

### crm-12 — CSV / export risks: wrong cohort and export theater

**implementationProblem:**  
Upload of a partial, empty, or demo file can satisfy a checkbox without yielding a runnable book. Hard-input success must tie to landed mutable row count + cohort acknowledgement — not file-received events. Mutation honesty must close Seed §5.1 gap.

**implementation:**  
On Authorize book, you can now succeed only when landed mutable row count and Cohort purpose acknowledgement both hold.  
On Activation state, you can now keep book-auth pending on file-received-only or empty/demo Imports — export theater never flips running.

**implementationAdds:** `["landed-mutable-rows", "cohort-acknowledgement"]`

---

### crm-13 — CSV / export risks: duplicates and match keys

**implementationProblem:**  
Without a declared match key, connect and Audit fight duplicates and split engagement history. V1 match: normalized email when present, else phone E.164-ish candidate, else source-row id. CTO owns upsert; PM surfaces firm-visible duplicate outcomes after Audit — not pathway scores.

**implementation:**  
On Imports, you can now upsert by the shared match-key policy (email → phone → source-row id).  
On Book readiness, after Audit run, you can now read firm-visible duplicate outcomes on Verdict list — same key policy as connect.

**implementationAdds:** `["match-email", "match-phone", "match-source-row-id"]`

---

### crm-14 — CSV / export risks: channel quality vs sequence intent

**implementationProblem:**  
Firms expect “imported = ready to message”; practice says import only supplies candidates for reachability. Connect = candidate book land; sequence-ready only after Audit verdicts. Enrollment never treats raw CSV as sendable.

**implementation:**  
On Authorize book, you can now complete candidate-book land and hop to Book readiness — not to enrollment.  
On Book readiness / Verdict list, you can now treat only reachable as sequence-ready; raw Imports stay candidates until Audit.

**implementationAdds:** `["candidate-book", "sequence-ready", "reachable"]`

---

### crm-15 — OAuth risks: over-scope and wrong objects

**implementationProblem:**  
Broad CRM OAuth can pull matters, billing, or documents the firm did not intend to hand to an engagement product. When OAuth is used, scope to contacts/leads + minimal reachability fields, with firm-visible scope summary. Authorization stays book-connection — not practice-platform takeover.

**implementation:**  
On Authorize book, when Connection stack is live-crm, you can now acknowledge Scope summary (contacts/leads + reachability fields only) before grant.  
On Contacts, you can now land only those scoped objects — matters/billing/documents stay out of the book.

**implementationAdds:** `["scope-contacts-leads", "reachability-fields"]`

---

### crm-16 — OAuth vs CSV: when each is practice-correct for V1

**implementationProblem:**  
Product may push OAuth as “more real” and CSV as temporary, biasing activation away from reachable firms. Mechanism = what the firm can intentionally authorize today, both after readiness — practice fit, not acquisition friction. Parallel landers to the same book schema.

**implementation:**  
On Authorize book, you can now choose Connection stack by what the firm can authorize today (file-export if that is the SoR; live-crm if admin-capable) — neither labeled temporary vs real.  
On Imports / Contacts, you can now land either stack into the same mutable book schema after Prepared Workspace readiness.

**implementationAdds:** `["file-export", "live-crm"]`

---

### crm-17 — Bidirectional sync (KU #7): V1 residual or defer?

**implementationProblem:**  
Leaving KU #7 open invites building sync before a workable one-way book exists — or blocking “running” on sync completeness. Defer bidirectional sync for V1; one-way land (CRM/file → Tower book) is enough for campaign-real. Activation finish line stays auth + escrow, not sync perfection.

**implementation:**  
On Authorize book, you can now read Sync posture as one-way-land (CRM/file → Tower) with bidirectional deferred — not offered as a V1 control.  
On Activation state, you can now reach running on book-auth ∩ escrow without any sync-complete flag.

**implementationAdds:** `["one-way-land", "bidirectional-deferred"]`

---

### crm-18 — What write-back would mean if revisited later

**implementationProblem:**  
Naive two-way sync can corrupt the firm’s practice file with engagement-tool edits. If revisited later: selective write-back of engagement events only; CRM remains source of truth for identity/channels. Board ≠ CRM admin. Explicit V1 posture: write-back not shipped.

**implementation:**  
On Authorize book / Contacts, you can now read Sync posture: write-back not in V1; identity and channels stay firm-SoR owned.  
On Board, you can now treat engagement chronology as desk inhabit — not CRM field admin or silent master of the practice record.

**implementationAdds:** `["write-back-deferred", "engagement-events-only"]`

---

### crm-19 — Connect → Audit handoff: what must be guaranteed

**implementationProblem:**  
Ambiguous “connected” leaves Audit with empty, demo, or non-mutable data and enrollment blocked or unsafe. Connect must guarantee a tenancy-bound mutable contact set with provenance, match keys, channel candidates, and firm-authorized cohort boundary before Audit runs.

**implementation:**  
On Activation state / Authorize book, you can now mark connect-complete only when mutable cohort + provenance + match keys + channel candidates + cohort boundary all hold.  
On Book readiness, you can now start Audit run only from connect-complete — not from file-received or readiness theater.

**implementationAdds:** `["connect-complete"]`

---

### crm-20 — External validators: practice need only (CTO wires)

**implementationProblem:**  
Connect may dump raw strings; Audit cannot reach “reachable” without named validation species. Practice need: email syntax/deliverability-class and phone format/reachability-class checks as Audit consumers of connect output — vendor selection is CTO, not this seat.

**implementation:**  
On Book readiness / Verdict list, you can now map validator classes to reachable / partial / unreachable after Audit run.  
On Authorize book, you can now land channel candidates only — validators consume them on Book readiness, not at connect.

**implementationAdds:** `["reachable", "partial", "unreachable"]`

---

### crm-21 — Consent/silenced columns are not connect’s CASL judgment

**implementationProblem:**  
Importing a “subscribed” CRM flag can be mistaken for Tower having solved consent. Connect must pass through do-not-contact / silenced / marketing-status as opaque flags for Audit — neither inventing consent nor stripping firm suppressions. CASL lawfulness stays seat 3.

**implementation:**  
On Imports, you can now preserve source suppression fields (do-not-contact / silenced / marketing-status) as opaque flags on Contacts.  
On Book readiness, you can now hand those flags to Audit as data-validity inputs — Authorize book never interprets CASL lawfulness.

**implementationAdds:** `["opaque-suppression-flags"]`

---

### crm-23 — Activation ordering with escrow (edge 6↔7)

**implementationProblem:**  
Undefined order creates activation deadlocks or PII-before-terms discomfort. Allow either order but require both before running; book-connect is never satisfied by escrow alone. Campaign-real still depends on an authorized book while commercial door stays peer.

**implementation:**  
On Prepared Workspace, you can now complete Authorize book and Accept terms in either order.  
On Activation state, you can now mark Progress to running only when both hard inputs land — escrow alone never satisfies book-auth.

**implementationAdds:** `["either-order", "both-before-running"]`

---

### crm-24 — Re-authorization / refresh without re-acquisition

**implementationProblem:**  
Snapshot stacks go stale; forcing full reactivation destroys retention. Provide in-desk re-hand-over (re-export / re-OAuth pull) that upserts by match key — currency without new acquisition or new escrow event.

**implementation:**  
On Authorize book (from Prepared Workspace or Contacts after running), you can now Re-hand over book — re-export or re-pull upserts by match key.  
On Activation state, you can now keep ALG/escrow intact across refresh; Book readiness you can now re-batch Audit after upsert.

**implementationAdds:** `["re-hand-over"]`

---

### crm-25 — Failure modes that must not count as “DB auth landed”

**implementationProblem:**  
Checkbox auth, empty import, sample lists, or website scrape cosplay will show “activated” while no sequence-ready book exists. Fail closed unless mutable authorized cohort + Audit-eligible channel candidates + non-acquisition timing all hold. Proof artifacts for auth landed — not UI completion events.

**implementation:**  
On Activation state, you can now refuse book-auth landed for checkbox-only, empty Imports, sample lists, or scrape-as-connect.  
On Authorize book, you can now succeed only when mutable authorized cohort + Audit-eligible channel candidates + post-readiness (non-acquisition) timing all hold.

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
