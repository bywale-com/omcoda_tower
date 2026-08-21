# Systems — change packet 026 (Workspace until they opt out — evolution of 024 / 025)

**Seat:** Systems Analyst.
**When:** 2026-08-21 12:32 UTC.
**What this is:** evolution of **024** (foot / what a workspace is) and **025** (Contact ▾ filter). Implementer **only implements this delta**. Do not re-read 024/025 for these two slices. Do not mutate those files’ bodies.
**Why:** Founder: “opted in” pollutes. Everyone has a workspace until they opt **out of the workspace**. The opt-in **is** a Now state on that seat. Two opt-out doors are not the same thing. **Do not recut a numbered packet in place** — a later Engineer would not know to re-read it.
**Join:** 024 · 025. `consent_records` · `contact_records` · `dispatchSend` (`silenced`) · `handleConsentSilence`.
**Flag:** 15:43 untouched. Do not recut 015 / A26. Do not recut Now / History / Upload interiors.
**Instructions:** founder only.

---

## What 024 / 025 said that this replaces

| Packet | Retracted | Why |
|--------|-----------|-----|
| **025 §2** | Contact ▾ = `basis IN ('express','implied')` AND uninvalidated `contact_access_links` | Requires they already opted in. The opt-in happens **on** the seat. Token is the no-login door, not existence. |
| **024** Now priority 1 + foot | Foot → `silenced` + `consent_records.opt_out` | That is the **send halt**. Workspace-out must not stop email. |

Everything else in 024 / 025 stands (Consultant ▾ chrome, `/c/` token table, Now form/meeting, Upload write, A26 row).

If you have **not** cut 025 yet: cut 025 **except** §2’s SELECT — use this packet’s query. If you **already** cut 025: only this delta.

---

## Hard decisions

### 1. Seat exists until workspace opt-out

Every `contact_records` row at that firm has a workspace until `workspace_opted_out`. No consent row → they **have** a seat (Agree has not happened yet). Ignore stays in the seat.

`contact_access_links` / `/c/<token>` = how **they** land from C16. Operator view-as does not need a token.

### 2. Two opt-outs. Do not glue them.

```sql
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS workspace_opted_out BOOLEAN NOT NULL DEFAULT false;
```

Same migration as 024 if 024 has not landed; else a follow-on file. Do not renumber a landed file.

| Door | Where | Write | Emails | Seat |
|------|-------|-------|--------|------|
| **Workspace opt-out** | Foot of the workspace | UPSERT `workspace_opted_out = true`. **Do not** set `silenced`. **Do not** dispatch `consent_records.opt_out`. | still go | gone (`/c/` refuses; Contact ▾ drops them) |
| **Email opt-out** | In the email that carries the link | **Not designed. Do not build.** When it exists: `silenced` **and** `workspace_opted_out` (email-out ⇒ seat-out). | stop | gone, by implication |

Workspace-out never implies email-out. Do **not** wire the foot to `handleConsentSilence`.

### 3. Contact ▾ query (replaces 025 §2)

```
SELECT cr.id, cr.name, cr.email
  FROM contact_records cr
  LEFT JOIN consent_records cons
    ON cons.contact_id = cr.id AND cons.firm_id = cr.firm_id
 WHERE cr.firm_id = $1
   AND COALESCE(cons.workspace_opted_out, false) = false
 ORDER BY cr.name
```

Column not landed yet: list the firm’s `contact_records` (nobody has foot-opted-out). Do not fall back to “opted in.” Do not require a token.

---

## Verify

1. Contact ▾ shows people who have **not** Agreed yet. After foot opt-out they disappear; sends still go (`silenced` unchanged).
2. `/c/` after foot opt-out refuses. Ignore still opens the seat.
3. No email unsubscribe button.

---

## What this packet does not do

- Rewrite 024 / 025 bodies (they stay the historical cut; this file is the evolution).
- Recut Consultant ▾ chrome, Upload, A26, 015.
- Build the email unsubscribe button.
