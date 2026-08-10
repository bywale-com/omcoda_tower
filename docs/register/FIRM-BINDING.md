# FIRM-BINDING

**Branch:** `cursor/firm-binding-6565`  
**Date:** 2026-08-10  
**Deferred (untouched):** Escrow · Meta  

**Done bar:** Provision a firm in the app → log in as that consultant → land in that firm’s empty book → upload a list → operator designs/binds the sequence → outreach fires for **that** firm — proven on the real wire with a firm I created, not the demo tenant.

---

## What changed (binding, not just isolation)

| Before | After |
|--------|--------|
| Provision wrote TEXT `firm-*` into CT and a **different** UUID into auth | **One UUID** written to `firms` + `ct_firms` + `campaign_states` + `users` |
| Login session firm ≠ machine firm | Session `firm_id` **is** the provisioned firm |
| Consultant Contacts showed demo Cedar list | Contacts load `contact_records` for the **session** firm (empty when fresh) |
| `machineApi` / halt / CRM grant stamped demo firm | Session firm via `getActiveFirmId` / wire cookie |
| OTP verify returned `{ok:true}` only | Returns `user.firmId`; Login calls `setActiveFirmId` + `refresh()` |
| Auth-disabled always overwrote with `VITE_DEV_FIRM_ID` | Real session cookie **wins** over bypass |

---

## Grep — session/machine path

```text
rg 'firm-cedar' server/wire-service/machine.ts src/app/wire/reals/machineApi.ts
# (no matches)

rg 'const FIRM' src/app/wire/standins/machineApi.ts
# (no const FIRM = "firm-cedar")
```

**Remain as seed/demo labels only:** `demoIds.ts` (`CT_DEMO`), operator `DEMO_FIRMS` chrome, seeds, verify scripts targeting the Cedar seed tenant.

---

## Six-step walk (self-provisioned firm) — Postgres proof

`npm run verify:firm-binding` against Session-pooler — **PASSED**

### Firm A (`Acme-Test-48f8ac86`)

| Step | Result | Row |
|------|--------|-----|
| 1. Provision | PASS | `firms` + `ct_firms` id=`65666950-39a9-4d4c-a563-d7d7e84ace8f` (same id) |
| 2. Login | PASS | `sessions.firm_id`=`65666950-…` (not `firm-cedar`) |
| 3. Empty book | PASS | `contact_records` count=0 for that firm |
| 4. Upload list | PASS | `contact_records` id=`c-48f8ac86` firm_id=`65666950-…` |
| 5. Bind Active | PASS | `firm_sequence_binding` + `campaign_states.state=running` for that firm |
| 6. Outreach | PASS | `enrollment` `enr-c3ff3f61-…` for that firm; **dry-run** (send allowlist not opened) |

### Firm B (`Acme-Test-bb4edcbf`)

| Step | Result | Row |
|------|--------|-----|
| 1–6 | PASS | firm id=`885e53a5-52f7-47dd-aa21-e7fc32040d2f`; contact `c-bb4edcbf`; enrollment `enr-a5250c19-…`; dry-run |

---

## Two-firm binding proof

| Check | Result |
|-------|--------|
| Distinct firm ids | PASS — `65666950-…` vs `885e53a5-…` |
| Each session sees only its own book | PASS |
| Neither firm’s contacts under `firm-cedar` | PASS |

---

## Still open / deferred

| Item | Tag |
|------|-----|
| Escrow | **deferred** |
| Meta go-live | **deferred** |
| Plant consultant surfaces still have some demo chrome labels | **open** (non-blocking) — Ant path bound; Plant Provision sets session firm |
| Live send for the new firm’s contacts | **ops** — open allowlist deliberately; walk proven dry-run |

**No step failed on the six-step walk.** Done with the walk behind it.
