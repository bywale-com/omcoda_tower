# External models — Data Storage · Identity/Security · External Systems

**Pass:** A (inventory + model contracts only — do not wire)  
**CTO seat:** Think Stack facets **Data Storage & Management**, **Identity / Security / Compliance**, **External Systems**  
**Scope accomplishments:** book connect/import · audits · escrow/payments · auth/OTP · reference data · audit trail · oversight metrics  
**Companion brief:** [`00-PASS-BRIEF.md`](./00-PASS-BRIEF.md)  
**Auth real-later reference:** [`../../product/auth-service-contract.md`](../../product/auth-service-contract.md) · `server/auth-service/`  
**Stand-in adjacency (downstream Pass B):** `src/app/wire/standins/` (Login OTP + audit append first slice on wire-standins branch)

---

## Method note

Each row is a **non-Tower system** (or durable store treated as an external accomplishment target) required for the densified paths to be true. Tags follow the pass brief:

| Tag | Meaning |
|---|---|
| `modelable` | In-app stand-in with the right I/O before the real external exists |
| `human-only` | Irreducible human / real-world residue — model only the in-app side of the contract |
| `defer` | Not in V1 CT / not named enough yet |

`modelContract` states **inputs → outputs → state readers** the rest of Tower depends on. No stand-in code in this pass.

---

## Canonical inventory

| id | system | facet | why | sources | modelTag | modelContract |
|---|---|---|---|---|---|---|
| `ext-primary-store` | Durable primary store (relational DB) | Data Storage & Management | Per-tenancy truth for firms, contacts, maps, escrow instruments, sessions, packs, scores, and job state must outlive the SPA. Auth Service already assumes Postgres (`DATABASE_URL`). | C4 `import_batch`/`contact_identity`; C6 `escrow_ledger_entry`/`held_balance`; C3 `reference_table_version`/`client_score_snapshot`; C7 `metric_definition`; auth-service contract; HUMAN-PROVISIONING adjacency | `modelable` | **In:** upserts/queries scoped by `firm_id`; migrations for ledger/table nodes. **Out:** durable rows for firm_tenancy, canonical_contact_record, field_mapping, escrow_ledger_entry, evaluation_pack, client_score_snapshot, sessions, otp_challenges. **Readers:** Book readiness, Commercial, Board, Audit trail, Auth session guard. |
| `ext-object-file-store` | Object / file store for book imports | Data Storage & Management | File-export Authorize book lands CSV/exports with digest + provenance before mapping; raw bytes must not live only in browser memory. | impl `07` crm-02/11/12; C4 ingest-01/05/17/18 (`import_batch`, `source_header_inventory`); How `operator-book-readiness` | `modelable` | **In:** upload stream + firm_id + content digest + source label. **Out:** durable object URI, size, mime, landed-at, digest. **Readers:** Imports land batch, Source header inventory, re-export refresh, quarantine repair re-entry. |
| `ext-audit-log-store` | Append-only audit log store | Data Storage & Management | Who/what/when/which-firm accountability across open-box, bind, import, escrow, reference publish, and consent events; Audit trail How + every C3–C7 append path. | How `operator-audit-trail`; C3 pipe-06; C4 ingest-*; C6 escmech-18; C7 obs-01/21; CASL impl `03` consent events; stand-in `auditTrail` adjacency | `modelable` | **In:** append `{actor, kind, subject, firm_id, payload, at}` (append-only; no update/delete). **Out:** event id + immutable receipt. **Readers:** Audit trail Change event list/filters; Escrow Commercial receipt; reference publish provenance; Oversight drill lineage. |
| `ext-event-stream-store` | Messaging / occurrence event stream | Data Storage & Management | Oversight and Firm health must read one append-only occurrence spine (send/delivery/reply/act/booking), not orphan ESP logs. | C7 obs-01…04/09/10; C1 delivery adjacency; C6 `outcome_verification_event` join; How `operator-oversight` | `modelable` | **In:** taxonomy-validated events with firm_id, subject, campaign/attempt, channel, occurred_at, idempotency key. **Out:** stable stream event id (dedupe on key). **Readers:** metrics materialization consumers; Sequence detail correlation; Audit trail cited stream ids. |
| `ext-metrics-warehouse` | Analytics / metrics materialization store | Data Storage & Management | Shell KPIs (Fleet health, Firm health, Activation Progress, Approach) need a rollup store distinct from the raw event log, with drill-through to stream ids. | C7 obs-10…14/16–18/20–22; How `operator-oversight` / `operator-firm-health`; Activation Progress readiness SLIs | `modelable` | **In:** metric_definition version + stream windows → rollup writes. **Out:** firm/fleet series (volume, bounce, complaint, funnel rates, freshness, pipeline SLIs) with definition version + source event ids. **Readers:** Oversight Fleet health; Firm health; Activation Progress; Approach instrumentation. |
| `ext-reference-snapshot-cache` | Reference-source fetch cache / raw snapshot store | Data Storage & Management | Detect/fetch/reconcile need content-addressed raw snapshots (HTML/JSON) and markers (hash/ETag/Last-Modified) separate from published table rows. | C3 pipe-01/03/05/22; impl `02` ref-03/04; `reference_detect_cursor`, `reconciliation_job` | `modelable` | **In:** canonical URL fetch result + retrieved-at + validators. **Out:** content hash, cached body URI, ETag/Last-Modified cursors. **Readers:** ingestion_run stages; reconciliation drift compare; dual-check attestation. |
| `ext-crm-connector-api` | CRM / practice-platform connector APIs (export-mediated + scoped live pull) | External Systems | Authorize book live-crm stack and assisted exports must land the same mutable book schema; V1 is one-way land of contacts/leads + reachability fields — not practice-platform takeover. | impl `07` crm-01/06/15/16; C4 ingest-01…20; How book connect adjacency; KU #7 defer continuous pull | `modelable` | **In:** connection stack choice; scoped grant (contacts/leads + reachability); cohort purpose; export/file or pull request. **Out:** import_batch land with header inventory, channel candidates, provenance timestamps; blocked objects (matters/billing/docs). **Readers:** Imports → Contacts; Book readiness Audit start; Activation book-auth chip. |
| `ext-email-validator` | Email validation-class provider | External Systems | Audits need syntax → domain/MX → mailbox/deliverability classes mapped to reachable/partial/unreachable without hard-coding a vendor. | C4 ingest-06/15/17; impl `07` crm-14/20 adjacency; How `operator-book-readiness` leaf 1.1 | `modelable` | **In:** syntax-surviving email candidates + firm_id + batch/audit run id. **Out:** class ladder outcomes `{syntax, domain_mx, mailbox}` → reachable \| partial \| unreachable + reason codes. **Readers:** reachability_class; Verdict list; book_readiness sequence-ready counts. |
| `ext-phone-validator` | Phone validation-class provider | External Systems | Phone candidates need parse-valid → line-type → reachability classes before SMS/voice sequence use. | C4 ingest-07/16/17; How `operator-book-readiness` | `modelable` | **In:** E.164 or parse-failed raw + default region + channel intent (sms/voice). **Out:** `{parse_valid, line_type, reachability}` → reachable \| partial \| unreachable \| pending. **Readers:** reachability_class; Verdict list; contact_identity phone keys. |
| `ext-dns-mx-lookup` | DNS / MX lookup service | External Systems | Email domain/MX-class step in the validation ladder (and optional reference URL reachability) needs resolver I/O outside Tower process. | C4 ingest-15; C3 fetch adjacency | `modelable` | **In:** domain / hostname. **Out:** MX present/absent, resolver error, optional TTL. **Readers:** email validation-class domain step; optional ingestion fetch preflight. |
| `ext-escrow-payment-rail` | Escrow / payment rail (Connect-style hold–release) | External Systems | Firm-as-payer contingent hold, immobilized principal, release/return/forfeit transfers, disputes, and webhooks — Commercial truth must not be a processor-console scrape. | impl `06` esc-*; C6 escmech-01…19/21–22; How `operator-commercial`; HUMAN-PROVISIONING `provider_payment_identity`/`held_balance` | `modelable` | **In:** create customer/PM tokenized; hold/capture; transfer/refund with idempotency keys; dispute webhooks. **Out:** provider refs (customer, pm, charge, transfer, refund, dispute); signed webhook receipts; immobilized/settled amounts. **Readers:** payment_webhook_receipt → held_balance/escrow_ledger_entry; Release control; escrow_status_read_model; Activation escrow chip. **PCI:** never accept PAN into Tower — token refs only. |
| `ext-payment-webhook-ingress` | Payment provider webhook ingress | External Systems | Accept→held and release/return/forfeit completions are webhook-driven and must be signature-verified + idempotent. | C6 escmech-03/08/09/15/16; C7 obs-04 adjacency for idempotent ingress pattern | `modelable` | **In:** raw signed payload + provider event id. **Out:** verified `payment_webhook_receipt` or reject; dedupe no-op on replay. **Readers:** escrow status machine; dispute_freeze; audit_trail commercial receipts. |
| `ext-ircc-reference-feeds` | IRCC / Canada.ca / ministerial reference-data feeds | External Systems | Reference tables stay current without code deploy: canonical Canada.ca / MI / ESDC pages feed detect→fetch→publish; blogs are discovery-only. | impl `02` ref-01…; C3 pipe-01…04/19–22; How `operator-reference-data` | `modelable` | **In:** scheduled/alert detect against `reference_source_binding` canonical URLs; fetch raw page. **Out:** changed/unchanged markers; parsed draft rows under schema_contract; never publish from discovery-only URLs. **Readers:** ingestion_run; reference_table_version draft/publish; re_score_job enqueue; freshness/recheck cadence. |
| `ext-otp-mailer` | OTP email delivery provider | External Systems | Consultant Login leaf 1.1 Send code must deliver a one-time code; Auth Service real-later uses Resend (`RESEND_API_KEY`). | How `consultant-access` Login OTP; auth-service contract `/auth/otp/send`; stand-in `mailer`/`otpStore` adjacency | `modelable` | **In:** to, from, subject, body with code (or template id), purpose=`otp`. **Out:** accepted \| delivery_failed (maps to Auth 503). **Readers:** Auth send path only; anti-enumeration still returns generic 200 when user missing. |
| `ext-identity-otp-provider` | Identity / OTP + session auth service | Identity / Security / Compliance | Passwordless Login: send/verify/abandon OTP, HTTP-only session cookie, session validate/logout, register gate. Real-later = Auth Service contract. | How `consultant-access` 1.1; `docs/product/auth-service-contract.md`; `server/auth-service/`; Provision mint adjacency | `modelable` | **In:** `POST /auth/otp/send {email}`; `POST /auth/otp/verify {email,code}`; abandon; session GET; logout. **Out:** generic send ok; verify → `Set-Cookie: tower_session` (HttpOnly); session valid/invalid; rate-limit/expired/invalid_code errors. **Readers:** Login verify → Board landing; route guards; Provision complete invite path. |
| `ext-session-credential-store` | Session / challenge credential store | Identity / Security / Compliance | OTP challenges, send logs, and session token hashes must be durable and firm-scoped; Auth Service already stores these in Postgres. | auth-service contract (otp_challenges, sessions, otp_send_log); consultant Login | `modelable` | **In:** insert challenge (hashed code), consume/invalidate, insert session token_hash, rate-limit counters. **Out:** one active challenge per (firm,email); opaque session row. **Readers:** Auth verify/session/logout only — SPA never reads plaintext OTP or raw cookie value. |
| `ext-pci-tokenization` | Hosted payment-method tokenization | Identity / Security / Compliance | Accept-time payment method capture must stay provider-hosted/tokenized; Tower stores only provider identifiers (escmech-19). | C6 escmech-19; impl `06` Accept terms / custody | `modelable` | **In:** firm opens hosted collection / SetupIntent-equivalent. **Out:** customer_id + payment_method_id (no PAN/CVV). **Readers:** provider_payment_identity; escrow hold initiation. |
| `ext-crm-oauth-grant` | Firm CRM OAuth / export authorization | Identity / Security / Compliance | Live-crm stack requires a real firm intentional grant; assisted confirm and file-export are sibling authorization acts — not staff-inferred. | impl `07` crm-06/08/15; HUMAN-PROVISIONING adjacency; C4 land trigger | `human-only` | **In-app side:** Connection stack chooser; Scope summary acknowledgement; Book authorized outcome only after land + provenance; Confirm imported book. **Human residue:** firm admin OAuth grant or firm-authorized export file. **Out (modeled):** grant status, scope chips, revoked flag. **Readers:** Authorize book; Activation book-auth. |
| `ext-payment-kyb-funding` | Processor KYB + firm funding / payment mandate | Identity / Security / Compliance | Held principal is real only after processor account/KYB and firm payment authorization settle. | HUMAN-PROVISIONING `provider_payment_identity`, `held_balance`; C6 escmech-03/04 | `human-only` | **In-app side:** pending_accept / failed_hold / held chips; provider ref slots; Activation escrow hard-input. **Human residue:** KYB approval, bank/PM mandate, real immobilized funds. **Readers:** escrow_status_read_model; Accept terms consequence panel. |
| `ext-counsel-mt-msb` | Counsel gate — MT/MSB rail posture | Identity / Security / Compliance | Production money-transmitter / MSB clearance is counsel-owned; engineering records firm-payer scope and refuses client-fund intake (BLOCKED). | C6 escmech-20; impl `06` esc-21 skipped; HUMAN-PROVISIONING `counsel_gate` | `human-only` | **In-app side:** counsel_gate state (pending/cleared/blocked); refuse client-fund intake into audit_trail; Commercial gate visibility. **Human residue:** counsel opinion on chosen rail. **Readers:** escrow_status_read_model; production rail activation check. |
| `ext-ad-platform-export` | Ad-platform proxy aggregate export access | External Systems | Approach instrumentation joins first-party funnel steps to imported platform proxy aggregates when authorized. | C7 obs-15; HUMAN-PROVISIONING `campaign_proxy_aggregate` | `human-only` | **In-app side:** import proxy rows keyed by campaign/creative; join to stream steps; coverage failure when keys missing. **Human residue:** per-firm ad-platform/export authorization. **Readers:** metrics_materialization Approach tiles; pipeline_health key coverage. |
| `ext-crm-incremental-sync` | CRM incremental sync / CDC | External Systems | Continuous pull after first land is explicitly out of V1; activation must not wait on sync maturity. | C4 ingest-21; impl `07` crm-17/18; KU #7 | `defer` | Not modeled for V1 CT. Future contract would emit change batches into the same import_batch pipeline (header inventory → map → identity → validation). |
| `ext-crm-vertical-oauth-pull` | Vertical CRM OAuth continuous pull | External Systems | Vertical OAuth continuous pull deferred; when revisited must feed the same ingestion pipeline, never bypass it. | C4 ingest-22; impl `07` crm-05 skipped / KU #7 | `defer` | Not modeled for V1 CT. Future: OAuth token refresh + paginated contacts/leads pull → same land contract as `ext-crm-connector-api`. |
| `ext-bidirectional-crm-writeback` | Bidirectional CRM write-back | External Systems | Engagement write-back to firm CRM is deferred; V1 is one-way land (+ engagement events stay in Tower). | impl `07` crm-17/18 | `defer` | Not modeled for V1 CT. |

---

## Facet coverage map

| Facet | System ids |
|---|---|
| Data Storage & Management | `ext-primary-store`, `ext-object-file-store`, `ext-audit-log-store`, `ext-event-stream-store`, `ext-metrics-warehouse`, `ext-reference-snapshot-cache` |
| External Systems | `ext-crm-connector-api`, `ext-email-validator`, `ext-phone-validator`, `ext-dns-mx-lookup`, `ext-escrow-payment-rail`, `ext-payment-webhook-ingress`, `ext-ircc-reference-feeds`, `ext-otp-mailer`, `ext-ad-platform-export`, `ext-crm-incremental-sync`, `ext-crm-vertical-oauth-pull`, `ext-bidirectional-crm-writeback` |
| Identity / Security / Compliance | `ext-identity-otp-provider`, `ext-session-credential-store`, `ext-pci-tokenization`, `ext-crm-oauth-grant`, `ext-payment-kyb-funding`, `ext-counsel-mt-msb` |

---

## Accomplishment → externals (sweep)

| Accomplishment | Primary externals |
|---|---|
| Book connect / import | `ext-object-file-store`, `ext-crm-connector-api`, `ext-crm-oauth-grant`, `ext-primary-store` |
| Audits / reachability | `ext-email-validator`, `ext-phone-validator`, `ext-dns-mx-lookup`, `ext-primary-store`, `ext-audit-log-store` |
| Escrow / payments | `ext-escrow-payment-rail`, `ext-payment-webhook-ingress`, `ext-pci-tokenization`, `ext-payment-kyb-funding`, `ext-counsel-mt-msb`, `ext-primary-store`, `ext-audit-log-store` |
| Auth / OTP | `ext-identity-otp-provider`, `ext-otp-mailer`, `ext-session-credential-store`, `ext-primary-store` |
| Reference data | `ext-ircc-reference-feeds`, `ext-reference-snapshot-cache`, `ext-primary-store`, `ext-audit-log-store` |
| Audit trail | `ext-audit-log-store` (+ appends from all paths) |
| Oversight metrics | `ext-event-stream-store`, `ext-metrics-warehouse`, `ext-ad-platform-export`, `ext-primary-store` |

---

## Proposed stand-in module names (Pass B hint — not built here)

| External id | Suggested `src/app/wire/standins/` module |
|---|---|
| `ext-primary-store` | `primaryStore.ts` (or reuse CT in-memory repos behind a port) |
| `ext-object-file-store` | `importObjectStore.ts` |
| `ext-audit-log-store` | `auditTrail.ts` (exists on wire-standins) |
| `ext-event-stream-store` | `messagingEventStream.ts` |
| `ext-metrics-warehouse` | `metricsMaterialization.ts` |
| `ext-reference-snapshot-cache` | `referenceSnapshotCache.ts` |
| `ext-crm-connector-api` | `crmConnector.ts` |
| `ext-email-validator` | `emailValidator.ts` |
| `ext-phone-validator` | `phoneValidator.ts` |
| `ext-dns-mx-lookup` | `dnsMxLookup.ts` |
| `ext-escrow-payment-rail` | `escrowPaymentRail.ts` |
| `ext-payment-webhook-ingress` | `paymentWebhookIngress.ts` |
| `ext-ircc-reference-feeds` | `irccReferenceFeeds.ts` |
| `ext-otp-mailer` | `mailer.ts` (exists) |
| `ext-identity-otp-provider` | `otpStore.ts` + session port (exists adjacency; align to auth-service contract) |
| `ext-session-credential-store` | fold into otp/session stand-in |
| `ext-pci-tokenization` | `paymentTokenizer.ts` |

Human-only rows get **in-app status chips / gate readers only** — no fake KYB clearance, no fake counsel opinion, no fake firm OAuth grant that flips Activation without the intentional act surface.

---

## Counts by modelTag

| modelTag | Count | Ids |
|---|---|---|
| `modelable` | **17** | `ext-primary-store`, `ext-object-file-store`, `ext-audit-log-store`, `ext-event-stream-store`, `ext-metrics-warehouse`, `ext-reference-snapshot-cache`, `ext-crm-connector-api`, `ext-email-validator`, `ext-phone-validator`, `ext-dns-mx-lookup`, `ext-escrow-payment-rail`, `ext-payment-webhook-ingress`, `ext-ircc-reference-feeds`, `ext-otp-mailer`, `ext-identity-otp-provider`, `ext-session-credential-store`, `ext-pci-tokenization` |
| `human-only` | **4** | `ext-crm-oauth-grant`, `ext-payment-kyb-funding`, `ext-counsel-mt-msb`, `ext-ad-platform-export` |
| `defer` | **3** | `ext-crm-incremental-sync`, `ext-crm-vertical-oauth-pull`, `ext-bidirectional-crm-writeback` |
| **Total** | **24** | |

---

## Notes for INDEX / sibling passes

- Auth Service (`docs/product/auth-service-contract.md`) is the **real-later** cutover target for `ext-identity-otp-provider` + `ext-otp-mailer` + `ext-session-credential-store`; Pass B stand-ins should preserve the same HTTP/cookie semantics (generic send, HttpOnly session, rate limits).
- Escrow rail stand-in models **refs + status transitions + webhook receipts**; immobilized real money and counsel clearance stay `human-only`.
- CRM continuous sync / vertical OAuth pull stay `defer` (KU #7) and must not appear as Activation finish lines.
- This file owns facets Data Storage · Identity/Security · External Systems for the listed accomplishments only; sibling zone files cover other Think Stack facets.
