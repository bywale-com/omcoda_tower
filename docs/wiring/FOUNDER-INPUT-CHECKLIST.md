# Founder input checklist — real-account edge

**Status:** Email live on `mail.try-tower.com` · SMS Canada gate corrected  
**Doctrine:** [`STANDIN-WIRING.md`](./STANDIN-WIRING.md) fixture honesty · pool path [`external-models/05-SENDING-IDENTITY-WALL.md`](./external-models/05-SENDING-IDENTITY-WALL.md) · SMS CA [`external-models/06-SMS-CANADA-GATE.md`](./external-models/06-SMS-CANADA-GATE.md)

Everything below the fake-app edge needs a real account, money, or domain act from you. CT marks fixtures only when you (or platform ops) actually did the thing.

## Done / live (email)

| # | Fixture / fact | Reality |
|---|---|---|
| 1 | `esp_account_provisioned` | ESP secrets in; email leave real |
| 2 | Pool DNS (platform) | House root **`mail.try-tower.com`** — SPF/DKIM/DMARC/return-path published; per-firm `*.mail.try-tower.com` |
| 3 | Managed IP + warmup | Provider config as set in production |

## Before SMS (Canadian path — not TCR)

| # | Fixture | What you do |
|---|---|---|
| 4 | `sms_account_provisioned` | Canadian SMS provider account (Twilio-class or peer) |
| 5 | `ca_sms_number_provisioned` | Provision the **Canadian** sending number used on the firm path |
| — | CASL consent | Already via opt-in / consent ledger — SMS stand-in fail-closes on `basis === none` or silenced |

**N/A:** `tcr_filed` — US A2P 10DLC only. Do not wait on TCR for Canadian SMS.

## Reputation depth (email)

| # | Fixture | What you do |
|---|---|---|
| 6 | `postmaster_enrolled` | Enroll sending domains in Google Postmaster / FBL peers |

## Deferred (do not block live email)

| Item | Fixture / note |
|---|---|
| Custom-domain attach | Firm-zone DNS — upgrade path only |
| Meta ads go-live | `meta_business_verified` · `meta_ad_account_linked` — chips only until then |
| CRM continuous sync | KU #7 defer — Authorize book grant/revoke only |
| Payment / escrow live rail | `payment_identity_provisioned` · `counsel_mt_msb_cleared` (Escrow.com candidate) |
| Ad insights export | `ad_export_authorized` |

## Fixture honesty reminder

- Allocate subdomain ≠ DNS green.  
- Stand-in CEM sink ≠ live inbox leave (email now live when fixtures + secrets match).  
- Never mark a fixture “to make the demo pretty.”  
- Do not gate Canadian SMS on `tcr_filed`.
