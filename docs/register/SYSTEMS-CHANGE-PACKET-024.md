# Systems — change packet 024 (Contact workspace · Upload write · Contact uploaded)

**Seat:** Systems Analyst.
**When:** 2026-08-21 11:12 UTC.
**What this is:** the cut for PM [`CONTACT-WORKSPACE-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/CONTACT-WORKSPACE-PACKET.md) · [`CONTACT-UPLOAD-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/CONTACT-UPLOAD-PACKET.md) · [`CONTACT-UPLOADED-EVENT-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/CONTACT-UPLOADED-EVENT-PACKET.md) on PR [#96](https://github.com/bywale-com/omcoda_tower/pull/96). Implementer **only implements**. No analysis left.
**Why:** The contact has a seat. Touchpoints were specified; they were not housed. Upload is a different door from Now’s form and from operator import. Automations hears the upload INSERT.
**Join:** `008` `access_links` (consultant — **wrong table**) · `consent_records` · `fact_writebacks` · `missing_fact_signals` · `collectible_fields` (021 / `018`) · `meeting_booked` · `enrollment.campaign_id` (010) · A26 `TRIGGER_SELECT_EVENTS` · 017 `event_write_set`. Face: `git fetch origin pull/96/head`.
**Flag:** 15:43 untouched. **Do not recut 015 / 019 / 021 / 022 / A26 as a replacement.** Additive row on A26.
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| Contact **workspace** at `/prototype-ant` Contact: no-login, firm-branded, left **Now · History · Upload** | The 10-item `CONTACT_SURFACES` flipper as the product seat |
| Token family **`/c/<token>`** → this workspace on **Now** | Reuse `access_links` / `/a/<token>` (consultant session) |
| Now states from **existing writes** (consent / listing / meeting) | Extra nav. Painted `COLLECTIBLE_FIELDS`. Harbor four fields as types |
| History = **asks** (consent + this enrollment’s form/meeting campaigns) | `outbound_messages` log. P1b-prior emails |
| Upload INSERT **`contact_uploads`**. That INSERT **is** `contact_uploaded` | Collapse with `fact_writebacks` or `import_batch`. Kind catalog from P6/P7 |
| A26 **add** “Contact uploaded information”. Local = Firm then **Kind** | Recut TRIGGER-SELECT-PACKET. A33 Re-evaluate. Rule on the contact canvas |

---

## Live (quote `origin/main` — do not guess)

| Live | Gap |
|------|-----|
| `access_links` (`008`): `user_id` FK → `users`. Redeem `/a/<token>` → session → consultant desk. | **No contact token.** Opening `/a/` logs a *user* in. Silent for a no-login contact seat. |
| Contact Ant = `CONTACT_SURFACES` (10 names). Demo id `sarah`. Priors: scene flipper. | That list is **not** the nav. Replace it as the contact-facing seat. |
| `consent_records`: `basis` express\|implied\|none, `silenced`, `source`. Agree already `handleConsentSet`. Opt out already `handleConsentSilence` → `consent_records.opt_out`. | Ignore is valid and **has no distinct write** (basis stays `none`, same as never answered). |
| Now form listing: `missing_fact_signals` + `collectible_fields.capture = 'self_reportable'` (021). Submit: `handleFactWriteback` → `fact_writebacks` → dispatch `fact_writebacks` **and** faceless `eligibility.changed`. | Document-dependent never on this form (already). Contact Now must **query those tables**, not paint the old SPA catalog. |
| Meeting: `meeting_booked` (`007`), `source` default `contact_portal`. Confirm already inserts + dispatches `meeting_booked`. | Show as a **state of Now**, not a nav item. |
| Current ask: `enrollment.campaign_id` → `campaign_objective.kind` `click\|form\|meeting`. | Consent is **not** a campaign kind (010 stands). Click has no Now interior. |
| Operator import: `import_batch` `kind='contact'` → `contact_import`. | Wrong door. |
| Files / upload kinds: **no table.** | Files on the glass with nothing to SELECT. `contact_uploaded` with nothing to INSERT. |
| A26 list: Form submitted, Campaign failed, Opt out, Firm created, Audit, **Contact import**, New contact, silent Reference pack. **No** upload row. `triggerLocalRefFromPayload("fact_writebacks")` reads `form_ref`. | Additive row. Kind axis does not exist. |
| Story 10 eligibility already fires on **fact_writeback**. | Must **not** auto-fire on upload (same law as do not hardcode audit on import). |

Three events, already named on P11 — only two have writes today:

| Event | Write today | Seat |
|-------|-------------|------|
| Form submitted | `fact_writebacks` | Now |
| Contact import | `import_batch` | Operator |
| Contact uploaded information | **none** | Upload |

---

## Hard decisions

### 1. Do not reuse `/a/<token>`

`access_links` is a **user** invite. The contact is not a `users` row.

```sql
CREATE TABLE IF NOT EXISTS contact_access_links (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  enrollment_id TEXT,
  campaign_id TEXT,
  expires_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_access_links_lookup_idx
  ON contact_access_links (firm_id, contact_id, created_at DESC);
```

- SPA: **`/c/:token`** opens the workspace **without** a session cookie. Lookup by hash. Invalidated or expired → Link-state refuse (existing purpose copy). Do not send this token through `AccessEntry`.
- **Not single-use.** They come back for History and Upload. `invalidated_at` is the later nullification door (023 escrow — not this packet).
- C16 still sends. On send, **mint** a row (or reuse the current uninvalidated one for that enrollment) and put `https://…/c/<raw>` in the body. Channel is not nav. Landing = **Now**, current ask.
- Do not FK `enrollment_id` / `campaign_id` if those ids are TEXT without a guarantee on every send; columns anyway, nullable.

### 2. Now is a projection. No `now` table.

Load the token → `contact_id` + `firm_id` + optional `campaign_id`. Then **one** of:

| Priority | Condition | State | Writes |
|----------|-----------|-------|--------|
| 1 | `consent_records.silenced` | Not Now. Opt-out already happened. Foot still there. | none |
| 2 | no row, or `basis = 'none'` and `source` IS DISTINCT FROM `'ignored'` | **Consent** (P3) | Agree → `handleConsentSet` `basis='express'`, `source='contact_workspace'`. **Ignore** → `basis='none'`, `source='ignored'` (extend `handleConsentSet` to persist `source`). Neither sets `silenced`. |
| 3 | `enrollment.campaign_id` → `kind = 'form'` | **Data-request form** (P1) | SELECT `missing_fact_signals` ⋈ `collectible_fields` `capture='self_reportable'` for this contact. Submit → existing `handleFactWriteback`. Never show `document_dependent`. |
| 4 | `kind = 'meeting'` | **Book** (P4) | Existing meeting confirm → `meeting_booked`. |
| 5 | `kind = 'click'`, or no enrollment / no current campaign | **Empty Now** | Still Now. No dashboard. Do not invent a click interior. Arrival does **not** fake a `messaging_events` clicked row here — that is 022 if the href is the tracked send. |

Firm wordmark = bound firm (`ct_firms` / live brand), not hardcoded Harbor.

### 3. History is a pane of existing asks. No history table. No email log.

For this `(firm_id, contact_id)`:

1. **Consent request** — one row. Outstanding = never agreed and `source` is not `'ignored'`. Done = express/implied **or** ignored. Opened body = the consent ask (not the send).
2. **Form / meeting campaigns** on this contact’s current `enrollment.sequence_id`, `campaign.ord` order, **skip `kind='click'`**. Outstanding = `campaign.id = enrollment.campaign_id`. Done = `ord` before the cursor (or cursor NULL and a completion exists). Opened body = the ask: form listing, or the book. Outstanding → **Open in Now** (same token, that `campaign_id`).

Do **not** SELECT `outbound_messages`. Do not mint `contact_history`.

### 4. Upload is its own write. Kind is a column, not a catalog.

Do not mint a kinds table. Do not freeze Passport / Language test. Custom **is** a kind string they typed.

```sql
CREATE TABLE IF NOT EXISTS contact_uploads (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  kind TEXT,                    -- NULL = they picked Any / unspecified
  origin TEXT NOT NULL CHECK (origin IN ('kind', 'custom', 'question', 'any')),
  field_key TEXT,               -- origin='question' only; collectible_fields.field_key
  body_text TEXT,               -- context / answer-that-question
  file_name TEXT,
  file_ref TEXT,                -- storage key; blob is a port / stand-in, not a table
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_uploads_contact_idx
  ON contact_uploads (firm_id, contact_id, created_at DESC);
```

| Path | `origin` | `kind` | Other |
|------|----------|--------|-------|
| Named type | `kind` | the string they picked (or a kind they already used) | file and/or `body_text` |
| Add custom | `custom` | **the text box** | then put information in |
| Any | `any` | NULL | still an INSERT |
| Answer that question | `question` | the question’s `field_key` (so Local *this kind* can be that question) | `field_key` set; `body_text` = context. **No** `fact_writebacks` row |

**Files tab** = `SELECT * FROM contact_uploads WHERE firm_id AND contact_id`. Sitting there does **not** dispatch.

**Put in** = INSERT. Same transaction: `dispatchEventToWorkflows(..., eventName: 'contact_uploaded', payload: { id, firm_id, contact_id, kind })`. No stamp → no Local match (fail closed). NULL kind never matches a named Local kind; Global still hears it.

**Search (completes P7, no extra PNG):** literal, not AI. Corpus =

- kinds this contact already used: `DISTINCT kind FROM contact_uploads WHERE kind IS NOT NULL`
- questions already asked: `missing_fact_signals.field_key` ∪ `fact_writebacks.field_key` for this contact, labels from `collectible_fields.label`

Do not seed PNG titles as kinds. An empty kind list is honest until they put something in or add custom.

**Blob:** `file_ref` may be `standin:<id>` until a storage port exists. The **row** is the product (data in tables). Do not paint filenames into React.

### 5. `contact_uploaded` is a different event. Additive on A26.

Dispatch token: **`contact_uploaded`**. Label: **Contact uploaded information**.

| Grain | Axes |
|-------|------|
| Global (A42) | none extra |
| Local (A43) | existing nested shape: **Firm** then **Kind**. Kind list = distinct `contact_uploads.kind` for that firm (custom names included). Sequential. Not a new picker family. |

```
triggerLocalRefFromPayload("contact_uploaded") → payload.kind
```

`workflow_trigger` needs **no** new column (`016` Local fields already hold `local_ref`).

**Handle after the node:** writes of that INSERT — `{ table: "contact_uploads", id, contact_id, kind }`. Not `import_batch`. Not A24.

**Re-evaluate (A44):** Rule already runs. Do **not** add Re-evaluate to A33. Do **not** call `runContactEligibilityCascade` from the upload INSERT. Eligibility stays faceless on **fact_writeback** (Now). Hearing `contact_uploaded` is what Automations is for — the operator places a Rule if they want a re-eval. Same law as do not hardcode audit on import.

Do not recut `TRIGGER-SELECT-PACKET.md`. Add the row to `TRIGGER_SELECT_EVENTS` + `WorkflowTriggerEvent` + `WORKFLOW_EVENTS_WITH_LOCAL`.

### 6. Test contract + seeds

New `event_write_set` / `event_test_data` rows at `version = 1`. Never UPDATE a shipping version.

```sql
INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('contact_uploaded', 1, 'contact_uploads', 0);
```

One specimen: Harbor contact, `origin='custom'`, `kind` a custom string (not a PNG title). Mirror `eventTestContract.ts`.

`supabase/seeds/`: a **reasonable** count of `contact_uploads` on seeded Harbor people so Files is not empty; one `contact_access_links` so `/c/…` lands. Not a thick fake world. Not hardcoded in the SPA.

---

## Face (Ant Contact) — what to kill / ship

Kill as the product seat: `CONTACT_SURFACES` ten names, demo `sarah` as the book, Operator/Consultant sider copy.

Ship: firm wordmark; left **Now · History · Upload**; Opt out at the foot (existing silence); Now interiors above; History list + opened ask + Open in Now; Upload tabs **Put in | Files** + kind modal with search / custom / answer-that-question.

Do not put Automations on this canvas. Do not copy House-global. Design-system recut of Harbor paint is **out of scope** (PM).

A40 operator form occupancy stays 021. Do not recut it here. Contact Now **consumes** the same listing writes.

---

## Migration filename

Next free on `origin/main` at cut time. `018_collectible_fields.sql` is landed. **022** claims `019_objective_local_axis.sql`. **023** claims `020_pursuit_exhausted.sql`. This is **`021_contact_seat.sql`** if those two have already taken 019/020; if this lands first, it takes the next free integer and 022/023 rebase. **Do not renumber a landed file.**

This packet **does not wait on 022.** Now’s cursor is 010. Upload is a new write.

---

## Verify

`npm run build`. Then `/prototype-ant` Contact with the wire up:

1. Open a minted `/c/<token>`. Lands **Now**, firm-branded, no login, three nav items. Ten flipper names are gone.
2. No consent → Agree writes `express`. A second token: Ignore writes `source='ignored'`, still `basis='none'`, not silenced. Opt out at the foot still silences and dispatches `consent_records.opt_out`.
3. Form campaign current → Now shows **this contact’s** self-reportable `missing_fact_signals` (not four Harbor fields). Submit → `fact_writebacks` **only**. `contact_uploads` unchanged.
4. History lists consent + form/meeting asks, **not** emails. Outstanding Open in Now.
5. Upload → custom kind + file or text → one `contact_uploads` row → `contact_uploaded` fires. Files tab lists it; browsing does not re-fire.
6. Search finds a `missing_fact_signals` question → Answer that question → INSERT `origin='question'`, **no** `fact_writebacks`.
7. A26 shows **Contact uploaded information**, distinct from Contact import and Form submitted. Local Firm → Kind matches that custom string. Global hears Any (NULL kind).
8. A44-legal: this trigger → Rule → Action. No Re-evaluate on A33. Eligibility does **not** run from the upload INSERT.

---

## What this packet does not do

- Recut 015, 019, 021, 022, 023, A26’s packet, A40.
- Reuse `access_links` or plant Hub.
- Mint `contact_history`, a kind catalog, `form_questions`, `goal`, or an events copy table.
- Collapse the three doors.
- AI search.
- Freeze P6/P7 titles.
- Hardcode eligibility / audit on upload.
- Operator CSV import from this seat.
- Design-system recut of paint.
- Escrow nullification (023 / parked).
