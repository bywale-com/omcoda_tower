# Pass 6a — Practice SME absorb (modifies existing commitments)

**Method:** `docs/sme/METHODOLOGY.md` · `docs/sme/DOCTRINE-sme-cto-implementation.md` §3 (compliance *modifies*)  
**Sources:** `docs/sme/SME-GRAPH.md` · `docs/sme/ROSTER.md` · `docs/sme/HANDOFF.md` · `docs/sme/CROSS-CUTTING.md` · `docs/sme/pass2/`  
**Status in-repo:** `sme-handoff-ready` checked. 7 seats, 177 Pass2 considerations.  
**This experiment does not re-run Pass1.** Roster is residual-selected, not Seed §15 rubber-stamp.

## Seats (practice axis)

1. Immigration pathway / service-eligibility ops  
2. IRCC reference-data currency  
3. Canadian privacy / CASL / SMS & email consent  
4. Immigration consultancy desk operations  
5. Platform ads / Meta policy & feed trust  
6. Payments / escrow (firm↔Om Coda)  
7. Consultancy CRM / book-connection  

Explicit non-seats remain: Engagement-methodology SME, analytics-as-SME, selector-as-domain-SME, Agent-as-persona.

## Intended-product constraints this axis **modifies** (not new World seats)

These are Handoff absorb targets. They are **not** founder-invented Seed closures. They **are** the practice residual Seed already crossed. Where Handoff still says NEEDS VERIFICATION, this spec keeps that marker.

### Service eligibility (seat 1) — language the product must use

- **Service-eligible** = firm-offered service family with positive B-* **and** a confidence tier — never “will get ITA” / CRS-competitive (`elig-03`).
- Pathway pass may assert only after published version encodes program minima; non–EE base PNP is out-of-pack until stream rules are versioned (`elig-01`, `elig-02`).
- Analysis never-sees: province-would-nominate; arranged-employment CRS boost unless MI republishes; Tower-as-IRCC-determination (`elig-02`, `elig-11`, `elig-15`).
- Forms = offhand self-reportables only; PDFs/letters/certs/bank/medical → Manage (`elig-05`) — same DNA as Seed field-class law.
- **Reactivation-worthy (practice proposal for Story silence):** material service-posture change (new minima/category/draw clear, nomination/offer/cert, time-critical ops windows); missing self-reportables = nudge-only unless those windows fire (`elig-04`).  
  **Promotion status:** this fills a Story **silence** with SME mechanism. It is **not** automatically Story must. Named in `08-uncertainty/` as absorb-vs-promotion.
- Every assertion carries confidence tier (insufficient / provisional / document-backed) (`elig-14`).
- Firm overlays = catalog mapping, reactivation thresholds, province-stream add-ons; IRCC minima/CRS arithmetic house-locked (`elig-16`).
- Unknown program-minimum → hard-fail pathway-pass; emit insufficient-facts (`elig-22`).
- Stale/missing reference → suppress draw/category reactivation (`elig-25` ↔ XC-01).

### Reference currency (seat 2)

- V1 table families: NOC+TEER, category membership, round/cutoff ledger, CRS+FSW grids, language equivalency (`ref-01`).
- Canonical sources = Canada.ca (+ MI round ledger); third-party = discovery only.
- New publish = current for subsequent evals; prior signals retain pin; cutoff publish enqueues re-eval deltas — **never auto-fire outreach solely on a number move** (`ref-11`/`ref-12`).
- Wrong public-reference constants = house ops liability; pathway advice = firm (`ref-18`).
- Packs reference table keys/version pins only; reject numeric public-criteria literals (`ref-26`).

### Consent (seat 3) — Seed “do not skip opt-in” densified

- CEM triad (consent + ID + unsubscribe) hard-gates every firm-branded email **and** SMS (`casl-01`).
- Express consent = affirmative, unchecked-by-default Agree (`casl-03`).
- Cold “email the book for consent” forbidden (`casl-04`).
- DB authorization is **orthogonal** to client CEM consent (`casl-20`) — Seed §8.2 restated as ledger law.
- Silenced = hard enrollment inhibitor across phases until new affirmative express (`casl-15`).
- Agent first-text = CEM by default (`casl-16`). Website-harvested addresses are non-sendable without independent basis (`casl-18`).
- Reachable ≠ permission-to-send (`casl-25`).

**Geography regimes (Seed KU #14):** SME gives Canadian CASL/PIPEDA mechanisms. Other geographies remain KU. Expanding geography is a **founder-only** class item (`DECISION-CONSTITUTION.md`).

### Desk ops (seat 4)

Accountability minimum: send-identity, armed/active, per-contact phase/silence, chronology of fired. Board never-sees vanity-as-governance. Live brief is screening-for-discussion, not advice/guarantee (XC-02).

### Ads / Meta (seat 5)

Approach remains product surface. Ad = legibility. Outsized-but-true claims must survive platform review. This axis **modifies** copy/gates on Approach; it does not replace ALG.

### Escrow (seat 6)

Commercial surface exists; **release unit** remains a Seed KU. Counsel-gated money-transmitter boundary (`esc-21`) is `BLOCKED (counsel)` — a named founder/counsel gate, not a catch-all TBD.

### CRM / book-connect (seat 7)

Ingestion earns the reachable book. Bidirectional CRM sync remains Seed KU #7 (deferred). Field mapping / dedup are capability-adjacent (C4).

## Cross-cuts that must stay joined (do not split columns)

| Id | Edge |
|---|---|
| XC-01 | Pack assertions ↔ reference currency |
| XC-02 | License-defensible Analysis / forms / brief |
| XC-03 | Consentful send + templates + halt |
| Others in CROSS-CUTTING.md | ads↔first-text; escrow↔book-connect; eligibility↔desk |

## Absorb vs redesign

Handoff forbids new World seats without room sign-off. This specification **does not mint seats**. Practice findings land as criteria, never-sees, gates, and How-leaf requirements on the existing lattice.
