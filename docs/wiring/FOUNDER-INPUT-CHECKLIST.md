# Founder input checklist — real-account edge

**Status:** Pass B stubs in place; these are **not** auto-greened  
**Doctrine:** [`STANDIN-WIRING.md`](./STANDIN-WIRING.md) fixture honesty · pool path [`external-models/05-SENDING-IDENTITY-WALL.md`](./external-models/05-SENDING-IDENTITY-WALL.md)

Everything below the fake-app edge needs a real account, money, or domain act from you. CT marks fixtures only when you (or platform ops) actually did the thing.

## Do now (unlock live email leave)

| # | Fixture | What you do | CT / ops |
|---|---|---|---|
| 1 | `esp_account_provisioned` | Create Resend-class account; API key in secrets | Founder-input row on **Sending infrastructure** → mark fixture after keys land |
| 2 | Pool DNS (platform) | Own `mail.omcoda…` (or chosen house root); publish SPF/DKIM/DMARC/return-path the ESP returns | **Mark platform DNS published** per firm after records are live — never skip |
| 3 | Managed IP + warmup | Enable provider managed dedicated IP **or** stay on shared; confirm auto-warmup | Shared is default in stand-in; dedicated needs `dns_ptr_published` |

## Before SMS

| # | Fixture | What you do |
|---|---|---|
| 4 | `sms_account_provisioned` | Twilio-class (or peer) account + messaging service |
| 5 | `tcr_filed` | File brand/campaign with TCR / carriers; wait approval |

## Reputation depth (email)

| # | Fixture | What you do |
|---|---|---|
| 6 | `postmaster_enrolled` | Enroll sending domains in Google Postmaster / FBL peers |

## Deferred (do not block V1 pool-send)

| Item | Fixture / note |
|---|---|
| Custom-domain attach | Firm-zone DNS — upgrade path only |
| Meta ads go-live | `meta_business_verified` · `meta_ad_account_linked` — chips only until then |
| CRM continuous sync | KU #7 defer — Authorize book grant/revoke only |
| Payment / escrow live rail | `payment_identity_provisioned` · `counsel_mt_msb_cleared` |
| Ad insights export | `ad_export_authorized` |

## Fixture honesty reminder

- Allocate subdomain ≠ DNS green.  
- Stand-in CEM sink ≠ live inbox leave.  
- Never mark a fixture “to make the demo pretty.”
