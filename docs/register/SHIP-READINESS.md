# SHIP-READINESS

**Branch:** `cursor/ship-production-hardening-6565`  
**Date:** 2026-08-10  
**Deferred (do not touch):** Escrow · Meta go-live  

**Done bar:** #65/#66 + ship hardening **on `origin/main`**; real-wire Postgres proofs; live send + worker escalation + deny-path gates; residue cleared with repeatable smoke; affordance round-trips with no in-loop FAKE-WRITE.

---

## 1. Merge status

| Item | Status |
|------|--------|
| #65 prototype cohesion | Merged into ship branch (`Merge #65…`) |
| #66 modular-control map | Merged into ship branch on top of #65 |
| #62 / #63 Hub-seat | **Not merged** (superseded) |
| `origin/main` | **Updated 2026-08-10** — tip `36e9a3f` includes #65+#66 + ship hardening |

**Main now carries the CT product stack** (merged #65 → #66 → ship hardening).

### Real-wire spine (Postgres, not stand-ins)

`npm run verify:ship` — **PASSED**

| Step | Result |
|------|--------|
| Cohort fail-closed (live + empty) | PASS |
| Cohort allowlist | PASS |
| Reference payload value persist | PASS (`cec.min_hours` chosen value) |
| Campaign state | PASS |
| Book tables (audit/contact/verdict/ready) | PASS |
| Halt / consent rows | PASS |
| Product face `/` → `/prototype-ant` (Hub at `/hub`) | PASS |
| Silence deny → send blocked | PASS (`deny: silenced`) |
| Firm-book halt → enroll/send blocked | PASS (`blocked: halt`) |

Auth/wire on `:3001` with `VITE_WIRE_REAL=true` + Session-pooler `DATABASE_URL`.

---

## 2. Live-plane proof

`VERIFY_LIVE_SEND=1 npm run verify:worker` — **PASSED** (after restoring `seq_channel_ownership_order` text→email→form)

| Proof | Result |
|-------|--------|
| Unattended tick escalation (stale text attempt → email) | PASS — `acr-text` fired, owner=`email` |
| Idempotent re-tick | PASS |
| Inbound nullify | PASS |
| Fail-closed dry_run | PASS |
| Fail-closed empty cohort | PASS |
| **One real Resend send** + `messaging_events` row | PASS — e.g. `messageId=b45d3b86-3b65-47c4-8fca-96c57935b157` |
| Off-cohort stays dry-run under live | PASS |
| `WORKER_ONCE=1 npm run worker` against real DB | PASS — tick scanned attempts |

### Send posture (SHIP → DEPLOY)

- Missing/empty `SEND_MODE` → **`dry_run`** (fail-closed); live is explicit  
- **`SEND_TEST_COHORT` required** under live — empty = nobody live (fail closed)  
- HTTP `/wire/send/*` uses the **same gated** `dispatchEmail` / `dispatchSms` (requires `contactId`, cohort-checked) — no ungated live probe path  

---

## 3. Residue cleared

| Residue | Action |
|---------|--------|
| Hub as default product entry | `/` → `/prototype-ant`; Hub quarantined at `/hub` |
| Empty cohort = all live | Reverted to fail-closed empty cohort |
| Ungated HTTP `/wire/send/*` | Gated via cohort + contactId |
| Demo contacts in live send | Only `SEND_TEST_COHORT` ids live-send; seeds not in cohort |
| Smoke test | `npm run verify:ship` (+ deny gates) |
| Affordance ledger | `npm run verify:affordances` |
| Channel order after modular reorder trials | `scripts/restore-channel-order.ts` (ops hygiene) |

### Still open (not Escrow/Meta)

| Gap | Tag |
|-----|-----|
| Plant vs Ant cosmetic parity | not required for spine |
| Deploy packaging (worker / session firm / CI / env) | see **`DEPLOY-READINESS.md`** (PR #67) |

---

## 4. Affordance round-trip ledger

`npm run verify:affordances` — **no in-loop FAKE-WRITE**

| Class | Count |
|-------|------:|
| PASS | 9 |
| APP-LOCAL | 2 |
| FAKE-WRITE | 0 |
| READ-ONLY-MISLABELED | 0 |

**PASS:** Reference Publish · Eligibility pipeline reorder · Motion enable · Attempt criteria threshold · Fact writebacks · Agents Save template · Bind binding · Campaign posture · Prepared workspace  

**APP-LOCAL (documented):** Config Publish pack catalog · Automations Enrollment summary chrome  

---

## Commands

```bash
npm run db:migrate && npm run db:seed
npm run verify:ship          # spine + deny gates on real Postgres
npm run verify:affordances   # face→table chosen-value round-trips
npx tsx --env-file=.env scripts/restore-channel-order.ts
VERIFY_LIVE_SEND=1 npm run verify:worker
WORKER_ONCE=1 npm run worker
npm run build
```

---

## Remaining gaps (plain)

1. **see DEPLOY-READINESS.md** — continuous worker, session firm, hosted CI, fail-closed env  
2. **deferred** — Escrow  
3. **deferred** — Meta go-live  

**No “done” claimed without the spec-vs-app round-trip behind it.**
