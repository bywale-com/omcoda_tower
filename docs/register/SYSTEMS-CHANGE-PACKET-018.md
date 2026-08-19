# Systems — change packet 018 (A34: audit mark on the contact)

**Seat:** Systems Analyst.  
**When:** 2026-08-19 10:55 UTC.  
**What this is:** the A34 cut. Implementer **only implements**. No analysis.  
**Why:** Founder / PM PR #96: the audit-specific mark lives **on the person**. No button. Audit already wrote it. Automations can do it because Audit does. Consultant tags (many, forever) later — not this. Pictures + packet + law 41 tail **are** the spec.  
**Join:** [`SYSTEMS-IN-APP-ACTION-ASCRIBE.md`](./SYSTEMS-IN-APP-ACTION-ASCRIBE.md) · 015 produce (`executeAuditRun`) · plate [`A34-audit-tag-on-contact.png`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/automations-blueprint/A34-audit-tag-on-contact.png).  
**Flag:** 15:43 untouched. **Do not recut 015.**  
**Instructions:** founder only.

---

## The mark

Audit writes, per contact, this run:

| Table | Field the glass shows |
|-------|------------------------|
| `reachability_verdicts` | `verdict` (`reachable` · `partial` · `unreachable`) |
| `sequence_ready` | `ready` (true = sequence-ready) |

Those rows **are** the mark. Keyed by `contact_id`. Already INSERT in `executeAuditRun`. Book readiness already reads them. **Contacts must show the same rows on the person.**

Not `contact_tag`. Not valid/invalid. That is house `ascribe_tag`. Leave that column. Do not reuse it for A34. Do not mint a tag table. Do not INSERT on paint.

No button. No X. No +.

---

## Cut

**`handleContactRecordsList`** (same query that already `json_agg`s `contact_tag`): also return current audit mark for that contact.

- `reachability` = latest `reachability_verdicts.verdict` for `(contact_id, firm_id)` (if several, latest).
- `sequenceReady` = `sequence_ready.ready` for that contact (current row).
- Missing audit → `null` / omit. Honest empty. Do not guess.

**`listContactRecords` wire type** carries those two fields.

**Consultant Contacts** (`ContactsModule`): a column for the audit mark (A34). Chips from those fields. Not closable. Not an add. Tag column stays `tags`.

If no mark yet, that cell is empty.

Same data Book readiness already has. Same person. Do not copy into `contact_tag`.

---

## Files

| File | Why |
|------|-----|
| `server/wire-service/machine.ts` `handleContactRecordsList` | SELECT the two writes onto the contact list |
| `src/app/wire/ports.ts` · reals/stand-ins | type + pass through |
| `src/app/register/prototype-ant/consultant/ContactsModule.tsx` | A34 column |

No SQL migration. Tables exist.

`npm run build`. Manual: Confirm book → Start Audit (or house walk) → Contacts shows reachable / sequence-ready on that person. Tag column still whatever `contact_tag` is. No new button on Contacts.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015.
- Not `ascribe_tag`.
- Not an A33 inventory row.
- Not consultant multi-tag.
- Not a new table.
