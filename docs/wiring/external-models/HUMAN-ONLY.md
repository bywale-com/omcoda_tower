# Human-only externals — fixtures & duality (hand-back §1–§3)

**Status:** Framing on Pass A inventory — does **not** retag or contradict Pass A rows  
**Parent:** [`00-INDEX.md`](./00-INDEX.md) · [`00-PASS-BRIEF.md`](./00-PASS-BRIEF.md)  
**Sources:** [`01-runtime-and-engagement.md`](./01-runtime-and-engagement.md) · [`02-send-enrich-ads.md`](./02-send-enrich-ads.md) · [`03-data-identity-money.md`](./03-data-identity-money.md)

---

## Duality (first-class)

Every Pass A `human-only` external is **irreducible human / real-world residue**. The in-app side still has a contract (readiness chips, deny reasons, gate readers). That duality is first-class:

| Side | What it is |
|---|---|
| **Human act** | The real publish / file / grant / refuse / counsel authorship — never invented by Tower |
| **In-app contract** | Status/fixture readers that Send gates, Activation, Arm ads, Book auth, etc. consume |

Pass B stand-ins may flip chips **only** when a named **fixture** is marked human-provided. No fixture → fail closed.

### `humanKind` split

| humanKind | Meaning | Never automate? |
|---|---|---|
| `by-design` | Governance / intentional human decision — product must not invent the act | **Yes** — halt refusal, counsel silence law, OAuth grant, counsel MT/MSB, intentional ad-export auth |
| `by-provisioning` | One-time logistics backlog — human still required, but it is sequenced onboarding work | Logistics until done (DNS, Postmaster, TCR, Meta Business, payment identity, …) |

### Fixture

A **fixture** is a named marker that a human performed the real act. The in-app contract keys off it (e.g. readiness chip green only when fixture present). Composite fixtures (notably `sending_identity_ready`) are derived from member fixtures — see runbook.

---

## Sending-identity onboarding runbook

Per-firm **sending-identity onboarding** is **one** sequenced runbook (not eight independent chores). CT and Activation readiness treat the cluster as a single onboarding job.

**Dual path (PM wall reconciliation — [`05-SENDING-IDENTITY-WALL.md`](./05-SENDING-IDENTITY-WALL.md)):**

| Path | Who publishes DNS auth | Firm external act | Doctrine |
|---|---|---|---|
| **Pool (default)** | Om Coda / platform ops on house-managed zone (per-firm branded subdomain) | **Zero firm DNS** | C1 `deliv-04` / `deliv-19` |
| **Custom-domain (upgrade)** | Firm (or DNS delegate) on firm zone | Paste / delegate / click-fallback | C1 `custom-domain-attach` |

Fixtures are required on **both** paths — someone must really publish. Pool path does not invent green chips; it changes *who* supplies the fixture (platform vs firm).

### Sequence

1. **DNS auth** — SPF → DKIM → DMARC (pool zone *or* firm zone, depending on path)  
2. **Return-path / PTR** — bounce MAIL FROM + dedicated-IP rDNS (Return-Path is platform-controlled on both paths — C1 `deliv-20`)  
3. **Reputation enrollment** — Postmaster / FBL (and SNDS-class peers)  
4. **Registration / verification** — Canadian SMS number (not US TCR) · Meta Business / Page verification  

**SMS Canada correction:** [`06-SMS-CANADA-GATE.md`](./06-SMS-CANADA-GATE.md) — `tcr_filed` is **N/A** for Canadian firms → Canadian numbers; gate on `ca_sms_number_provisioned` + CASL consent.

### Members (ext ids + fixtures)

| Step | id | fixture | Notes |
|---|---|---|---|
| 1a | `ext-dns-spf` | `dns_spf_published` | SPF TXT on active From domain (pool or firm zone) |
| 1b | `ext-dns-dkim` | `dns_dkim_published` | Aligned DKIM selectors |
| 1c | `ext-dns-dmarc` | `dns_dmarc_published` | `_dmarc` policy + rua |
| 2a | `ext-dns-return-path` | `dns_return_path_published` | Bounce subdomain / MAIL FROM (platform zone) |
| 2b | `ext-dns-ptr-rdns` | `dns_ptr_published` | Dedicated-IP PTR at host |
| 3 | `ext-postmaster-fbl` | `postmaster_enrolled` | Human enrolls; feed samples modelable after fixture |
| 4a | `ext-tcr-a2p` | `tcr_filed` | **N/A for Canadian path** (US 10DLC only). CA SMS uses `ca_sms_number_provisioned` |
| 4a′ | *(CA SMS number)* | `ca_sms_number_provisioned` | Canadian sending number provisioned — fail-closed for CA SMS |
| 4b | `ext-meta-business-verification` | `meta_business_verified` | Business/Page verification in Meta |

**Adjacent rollup (01):** `sending-identity-dns` — in-app readiness flag `sending_identity_ready` consumed by `send-gate-plane`. That flag is a **composite** of the DNS fixtures (`dns_spf_published` ∧ `dns_dkim_published` ∧ `dns_dmarc_published` ∧ `dns_return_path_published`; `dns_ptr_published` when dedicated IP). Warmup calendar-time remains human residue on the modelable warmup plane — not a separate human-only row here.

**Rule:** Tower never invents DNS publishes. On the custom-domain path it never writes firm-zone DNS without a delegated grant. CT may fixture green/red chips only via the named fixtures above (platform-supplied on pool path; firm-supplied on custom-domain path).

---

## Full human-only table

| id | system | humanKind | fixture | inAppContract (short) | runbook | sourceFile |
|---|---|---|---|---|---|---|
| `sending-identity-dns` | Firm sending domain / DKIM / DMARC / warmup posture | `by-provisioning` | `sending_identity_ready` *(composite of DNS fixtures)* | Readiness flags for `send-gate-plane` | `sending-identity` | `01-runtime-and-engagement.md` |
| `consultant-halt-refusal` | Human license refusal (consultant Confirm halt) | `by-design` | `halt_confirmed` | haltStore commit I/O after Confirm | — | `01-runtime-and-engagement.md` |
| `counsel-silence-law` | CASL / stop / silence legal interpretation | `by-design` | `counsel_policy_authored` | Honor consent/silence ledger + suppression; no fake counsel text | — | `01-runtime-and-engagement.md` |
| `ext-dns-spf` | Firm-zone SPF DNS | `by-provisioning` | `dns_spf_published` | Probe/readiness → `spf-authorized` \| `domain-not-ready` | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-dns-dkim` | Firm-zone DKIM DNS | `by-provisioning` | `dns_dkim_published` | Keygen + `dkim-aligned` / `from-d-align` verify | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-dns-dmarc` | Firm-zone DMARC DNS | `by-provisioning` | `dns_dmarc_published` | Discover/verify policy floor + alignment chips | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-dns-return-path` | Platform bounce / custom MAIL FROM DNS | `by-provisioning` | `dns_return_path_published` | Bind Return-Path token; bounce correlate | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-dns-ptr-rdns` | Dedicated-IP PTR / rDNS | `by-provisioning` | `dns_ptr_published` | `ptr-rdns` chip on `ip_pool_tier`; deny dedicated volume until green | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-postmaster-fbl` | Google Postmaster / FBL / SNDS-class feeds | `by-provisioning` | `postmaster_enrolled` | Ingest reputation samples after enroll; throttle/quarantine readers | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-tcr-a2p` | TCR / brand / campaign / carrier registration | `by-provisioning` | `tcr_filed` | **N/A Canadian V1** — US 10DLC only; do not fail-close CA SMS on this fixture | `sending-identity` | `02-send-enrich-ads.md` · [`06-SMS-CANADA-GATE.md`](./06-SMS-CANADA-GATE.md) |
| `ext-meta-business-verification` | Meta Business / Page verification & hygiene | `by-provisioning` | `meta_business_verified` | Sync verification chips; Arm ads fail closed on mismatch | `sending-identity` | `02-send-enrich-ads.md` |
| `ext-crm-oauth-grant` | Firm CRM OAuth / export authorization | `by-design` | `oauth_granted` | Grant status, scope chips, revoked; Book authorized only after intentional act | — | `03-data-identity-money.md` |
| `ext-payment-kyb-funding` | Processor KYB + firm funding / payment mandate | `by-provisioning` | `payment_identity_provisioned` | pending_accept / failed_hold / held chips; Activation escrow hard-input | — | `03-data-identity-money.md` |
| `ext-counsel-mt-msb` | Counsel gate — MT/MSB rail posture | `by-design` | `counsel_mt_msb_cleared` | counsel_gate pending/cleared/blocked; refuse client-fund intake | — | `03-data-identity-money.md` |
| `ext-ad-platform-export` | Ad-platform proxy aggregate export access | `by-design` | `ad_export_authorized` | Import proxy rows when authorized; coverage failure when keys missing | — | `03-data-identity-money.md` |

### Counts

| humanKind | Count |
|---|---|
| `by-design` | **5** |
| `by-provisioning` | **10** |
| **Total human-only** | **15** (matches Pass A INDEX) |

| runbook | Count |
|---|---|
| `sending-identity` | **9** (8 step members + `sending-identity-dns` rollup) |
| — | **6** |

---

## Fixture catalog (canonical names)

| fixture | humanKind | Used by |
|---|---|---|
| `dns_spf_published` | by-provisioning | `ext-dns-spf` |
| `dns_dkim_published` | by-provisioning | `ext-dns-dkim` |
| `dns_dmarc_published` | by-provisioning | `ext-dns-dmarc` |
| `dns_return_path_published` | by-provisioning | `ext-dns-return-path` |
| `dns_ptr_published` | by-provisioning | `ext-dns-ptr-rdns` |
| `sending_identity_ready` | by-provisioning | `sending-identity-dns` — **composite** of DNS fixtures (see runbook) |
| `postmaster_enrolled` | by-provisioning | `ext-postmaster-fbl` |
| `tcr_filed` | by-provisioning | `ext-tcr-a2p` — **N/A Canadian path** |
| `ca_sms_number_provisioned` | by-provisioning | Canadian SMS sending number (replaces TCR gate for CA) |
| `meta_business_verified` | by-provisioning | `ext-meta-business-verification` |
| `oauth_granted` | by-design | `ext-crm-oauth-grant` |
| `halt_confirmed` | by-design | `consultant-halt-refusal` |
| `counsel_policy_authored` | by-design | `counsel-silence-law` |
| `counsel_mt_msb_cleared` | by-design | `ext-counsel-mt-msb` |
| `payment_identity_provisioned` | by-provisioning | `ext-payment-kyb-funding` |
| `ad_export_authorized` | by-design | `ext-ad-platform-export` |
