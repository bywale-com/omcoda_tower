# Systems — Audit field ascribe (law 45). 018 landed. Do not recut 015.

**Seat:** Systems Analyst.  
**When:** 2026-08-20 11:45 UTC.  
**What this is:** answers to PM [`AUDIT-FIELD-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/AUDIT-FIELD-PACKET.md) (A34, law 45). Shape ascribe. **No new table.** **Do not recut [`SYSTEMS-CHANGE-PACKET-018.md`](./SYSTEMS-CHANGE-PACKET-018.md).** Flag **15:43**.  
**Face:** PR [#96](https://github.com/bywale-com/omcoda_tower/pull/96). Paint on main: PR **#102**.

Do not add “set audit field” to A33. Do not mix into Tag.

---

## A. Smallest store for one composite field

Live `executeAuditRun` already INSERT `audit_runs` + `reachability_verdicts` + `sequence_ready` per contact. **Those rows are the field.** Composite on glass = chips of `verdict` + `ready`. No third column. No ascribe action. Hardcoded on that run.

Contacts list on `origin/main` already LEFT JOIN those two tables and paints the chips (018 / #102). Empty until that contact has been audited. Later run updates the same rows. Leave `contact_tag` / live Tag.

**Silent if silent:** none for the desk pane. The cut shipped.

---

## B. Get contact / If can read it because it is a field

Handle law 33 / 015: writes this run. If already picks `reachability_verdicts` / `sequence_ready` (`evalIfPick` + `PERSON_WRITE_TABLES`).

**Gap:** `executeGet` module `contacts` returns only `{ table: "contact_records", id }`. After Get contact, the audit writes are **not** on the handle unless Audit already ran **this** walk.

**Cut (no table):** when Get `contacts` returns people, also emit that contact’s **current** `reachability_verdicts` and `sequence_ready` rows (same join 018 uses). Missing audit → omit. Honest empty. If / chips then see the field without a parallel Automations-only store.

Do not invent `audit_field` jsonb on `contact_records`.

---

## C. Not this pocket

`contact_tag`. A35 Add tag. A33 “set audit field”. Recut 015.
