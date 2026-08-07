# SMS gate correction — Canadian, not US

**Status:** PM correction filed · wired into stand-in  
**Parent:** [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) · [`../FOUNDER-INPUT-CHECKLIST.md`](../FOUNDER-INPUT-CHECKLIST.md)

## Correction

Tower's SMS is **Canadian firms → Canadian numbers**. A2P 10DLC / TCR is **US-only**, so `tcr_filed` does **not** apply and must not gate the Canadian send path.

| Was (wrong for CA) | Is (Canadian path) |
|---|---|
| Fail closed on `tcr_filed` | Fail closed on **(a)** `ca_sms_number_provisioned` + **(b)** CASL consent basis (opt-in / consent ledger) |
| Wait forever on US registration | `tcr_filed` marked **N/A** for the Canadian path |

Email path unaffected — live on `mail.try-tower.com` (pool root `*.mail.try-tower.com`).

## Code

- Stand-in: `src/app/wire/standins/smsApi.ts` — deny `ca-number` \| `consent` \| `STOP` (no `registration`/TCR)
- Fixture: `ca_sms_number_provisioned` in `src/app/wire/fixtures/catalog.ts`
- `tcr_filed` retained in catalog as N/A documentation only — not in `FOUNDER_INPUT_FIXTURES` for CA

## Pass A note

`ext-tcr-a2p` stays in the Pass A inventory as US-residue / future if a US path is ever added. For V1 Canadian SMS it is **out of the fail-closed gate**. Framing only — does not retag Pass A counts.
