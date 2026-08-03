# Human-provisioning set — Function paper traces

This is the per-firm, house-global, and counsel onboarding backlog extracted from canonical nodes whose existence bucket is `human-provisioning` or `mixed` in `CANONICAL-NODES.md`.

## Sending identity

### `sending_domain`
- **Requires to exist:** DNS delegation on the firm's zone, or pool subdomain attach, SPF/DKIM publish, and warmup calendar-time.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the branded-domain setup and warmup dependency.
- **Related Function seats:** C1, C7

### `dkim_keyset`
- **Requires to exist:** DKIM DNS TXT/CNAME publish or domain-control verification on the firm zone.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the domain-authentication setup dependency.
- **Related Function seats:** C1

### `dmarc_policy`
- **Requires to exist:** DMARC DNS policy and reporting address publish on the firm From domain.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the From-domain policy setup dependency.
- **Related Function seats:** C1

### `return_path_domain`
- **Requires to exist:** Custom MAIL FROM / Return-Path DNS and bounce-domain delegation.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the bounce-domain setup dependency.
- **Related Function seats:** C1

### `sending_identity_binding`
- **Requires to exist:** Firm-approved sending domain and From identity, with completed domain authentication.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the selected sending identity and its upstream domain-auth readiness.
- **Related Function seats:** C1

### `from_identity`
- **Requires to exist:** Firm-approved visible From name, local part, and alignable domain choice.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the firm-facing identity approval dependency.
- **Related Function seats:** C1

### `reply_route`
- **Requires to exist:** Firm mailbox forwarding/delegation or monitored Reply-To authorization when replies are not platform-captured.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the reply capture or firm-mailbox routing dependency.
- **Related Function seats:** C1

### `ip_pool_tier`
- **Requires to exist:** Dedicated IP procurement / provider approval when a dedicated tier is required; shared pools remain house-managed.
- **Scope:** per-firm when dedicated; house-global when shared
- **Inherited by:** Every path touching this node inherits the selected pool tier and any provider approval dependency.
- **Related Function seats:** C1

### `warmup_schedule`
- **Requires to exist:** Calendar-time warmup and receiver acceptance signals for the selected domain/IP posture.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the ramp-time dependency before full volume can exist.
- **Related Function seats:** C1, C7

### `provider_reputation_feed`
- **Requires to exist:** Postmaster/FBL enrollment and domain verification where the provider requires it.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the provider reputation-signal enrollment dependency.
- **Related Function seats:** C1

## SMS

### `sms_sender_registration`
- **Requires to exist:** TCR/brand/campaign registration.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the SMS registry approval dependency.
- **Related Function seats:** C1

### `carrier_throughput_tier`
- **Requires to exist:** Carrier/TCR throughput tier approval.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the carrier-approved capacity dependency.
- **Related Function seats:** C1

## Payments

### `escrow_ledger_entry`
- **Requires to exist:** Signed or accepted contingent commercial terms for the firm.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the commercial-terms acceptance dependency.
- **Related Function seats:** C6

### `held_balance`
- **Requires to exist:** Firm payment authorization/funding and provider hold or capture settlement.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the firm-funding and settlement dependency.
- **Related Function seats:** C6

### `provider_payment_identity`
- **Requires to exist:** Payment processor account/KYB setup, firm payment method mandate, and Connect/bank reference provisioning.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the processor identity and firm-payment authorization dependency.
- **Related Function seats:** C6

## Crawl/access

### `enrichment_root`
- **Requires to exist:** Firm-controlled public URL or public listing identity availability/verification when absent or disputed.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the public-root availability and verification dependency.
- **Related Function seats:** C5

### `crawl_permission`
- **Requires to exist:** Firm/site-admin crawl permission change when robots.txt or directives block required public paths.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the public-site permission dependency when crawl is blocked.
- **Related Function seats:** C5

### `campaign_proxy_aggregate`
- **Requires to exist:** Per-firm ad-platform/export access authorization when proxy aggregate import is required.
- **Scope:** per-firm
- **Inherited by:** Every path touching this node inherits the ad-platform access/export dependency.
- **Related Function seats:** C7

## Counsel gates

### `counsel_gate`
- **Requires to exist:** Counsel clearance for MT/MSB/payment rail posture.
- **Scope:** counsel
- **Inherited by:** Every path touching this node inherits the legal clearance dependency; engineering records state but does not create clearance.
- **Related Function seats:** C6

## Paper graph outputs

The Function traces under `docs/wiring/paper-trace/function/` are the described paper graph: they name the event paths and local nodes at state-node altitude. `CANONICAL-NODES.md` is the fused node registry for that graph, and this file is the extracted human-provisioning set that every path inherits when it touches one of these nodes.
